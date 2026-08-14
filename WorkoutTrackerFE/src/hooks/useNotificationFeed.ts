import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSchedules } from './useSchedules';
import { usePersonalRecords } from './useAnalytics';
import { useSettings } from '../context/SettingsContext';
import { STORAGE_KEYS } from '../constants/storage';
import { formatTime, isSameDay, daysBetween } from '../utils/date';
import { formatWeight } from '../utils/format';
import { useReports } from './useReports';

export type NotificationKind = 'reminder' | 'streak' | 'pr' | 'completed';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Rendered on the right of the row: "17:30", "Hôm qua", "2 ngày trước". */
  timeLabel: string;
  /** Sorting key. */
  timestamp: number;
  isToday: boolean;
  read: boolean;
  /** Present on reminders — lets the row start the session directly. */
  workoutId?: string;
}

const iconFor: Record<NotificationKind, string> = {
  reminder: 'clock',
  streak: 'zap',
  pr: 'award',
  completed: 'check-circle',
};

export const notificationIcon = (kind: NotificationKind) => iconFor[kind];

/**
 * Design 06c is a feed, not a list of raw schedules: upcoming-session
 * reminders, streak nudges, new personal records and completed sessions,
 * grouped into "Hôm nay" / "Trước đó". The app has no push backend, so the
 * feed is composed from local data and read-state is persisted on device.
 */
/**
 * The feed only ever shows the next five sessions and the last four completed
 * ones, so it asks for a recent window instead of the whole history. No upper
 * bound: an upcoming session must not fall outside the query that is meant to
 * remind the user about it.
 */
const FEED_HISTORY_DAYS = 60;

export const useNotificationFeed = () => {
  const { t } = useTranslation();
  const feedFrom = useMemo(
    () => new Date(Date.now() - FEED_HISTORY_DAYS * 86400_000).toISOString(),
    []
  );
  const { schedules, isLoading } = useSchedules({ from: feedFrom });
  const { records } = usePersonalRecords();
  const { stats } = useReports();
  const { settings } = useSettings();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.notificationsRead)
      .then((raw) => raw && setReadIds(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const persistRead = useCallback(async (ids: string[]) => {
    setReadIds(ids);
    await AsyncStorage.setItem(STORAGE_KEYS.notificationsRead, JSON.stringify(ids)).catch(
      () => {}
    );
  }, []);

  const notifications = useMemo<AppNotification[]>(() => {
    const now = new Date();
    const items: AppNotification[] = [];

    // Upcoming sessions → reminders. Two switches gate this: the account-wide
    // one in 08a, and the per-session toggle chosen when the schedule was
    // created (06b). Rows created before that column exists report `undefined`,
    // which keeps the old behaviour of reminding.
    if (settings.reminderEnabled) {
      schedules
        .filter(
          (s) =>
            !s.isCompleted && s.remindEnabled !== false && new Date(s.scheduledDate) >= now
        )
        .sort(
          (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        )
        .slice(0, 5)
        .forEach((s) => {
          const date = new Date(s.scheduledDate);
          const minutes = Math.max(0, Math.round((date.getTime() - now.getTime()) / 60000));
          items.push({
            id: `reminder-${s.id}`,
            kind: 'reminder',
            title: t('notifications.reminder_title'),
            body: t('notifications.reminder_body', {
              name: s.workoutName || t('notifications.workout'),
              time: formatTime(date),
              minutes: Math.min(minutes, 60 * 24),
            }),
            timeLabel: formatTime(date),
            timestamp: date.getTime(),
            isToday: isSameDay(date, now),
            read: false,
            workoutId: s.workoutId,
          });
        });
    }

    // Streak nudge while a streak is running.
    if ((stats?.streakDays || 0) > 0) {
      items.push({
        id: `streak-${stats?.streakDays}`,
        kind: 'streak',
        title: t('notifications.streak_title', { count: stats?.streakDays }),
        body: t('notifications.streak_body'),
        timeLabel: formatTime(new Date(new Date().setHours(8, 0, 0, 0))),
        timestamp: new Date().setHours(8, 0, 0, 0),
        isToday: true,
        read: false,
      });
    }

    // Top personal records.
    records.slice(0, 2).forEach((r) => {
      items.push({
        id: `pr-${r.exerciseId}`,
        kind: 'pr',
        title: t('notifications.pr_title', {
          name: r.exerciseName,
          weight: formatWeight(r.weight, settings.weightUnit),
        }),
        body: t('notifications.pr_body'),
        // A PR is derived from the heaviest logged set, not from an event with
        // a timestamp — so it carries no time label.
        timeLabel: '',
        timestamp: now.getTime() - 3600_000,
        isToday: false,
        read: false,
      });
    });

    // Recently completed sessions.
    schedules
      .filter((s) => s.isCompleted)
      .sort(
        (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      )
      .slice(0, 4)
      .forEach((s) => {
        const date = new Date(s.scheduledDate);
        const diff = daysBetween(date, now);
        items.push({
          id: `done-${s.id}`,
          kind: 'completed',
          title: t('notifications.completed_title', {
            name: s.workoutName || t('notifications.workout'),
          }),
          body: t('notifications.completed_body'),
          timeLabel:
            diff === 0
              ? formatTime(date)
              : diff === 1
                ? t('relative.yesterday')
                : t('relative.days_ago', { count: diff }),
          timestamp: date.getTime(),
          isToday: diff === 0,
          read: false,
        });
      });

    return items
      .map((n) => ({ ...n, read: readIds.includes(n.id) }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [schedules, records, stats, settings, readIds, t]);

  const markAllRead = useCallback(
    () => persistRead(notifications.map((n) => n.id)),
    [notifications, persistRead]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const today = notifications.filter((n) => n.isToday);
  const earlier = notifications.filter((n) => !n.isToday);

  return { notifications, today, earlier, unreadCount, markAllRead, isLoading };
};
