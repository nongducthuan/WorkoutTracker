import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { useNotificationFeed, notificationIcon, AppNotification } from '../hooks';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { SectionLabel } from '../../components/ui';

type NotificationsNav = NativeStackNavigationProp<RootStackParamList>;

/** Design 06c · Thông báo. */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NotificationsNav>();
  const { today, earlier, notifications, unreadCount, markAllRead } = useNotificationFeed();

  const styles = makeStyles(colors);

  const renderItem = (item: AppNotification) => (
    <View key={item.id} style={[styles.row, !item.read && styles.rowUnread]}>
      <View style={styles.iconWrap}>
        <Icon name={notificationIcon(item.kind) as any} size={16} color={colors.electric} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>

        {item.kind === 'reminder' && !!item.workoutId && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('ActiveWorkout', { workoutId: item.workoutId as string })
            }
          >
            <Text style={styles.actionText}>{t('notifications.start_now')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.time}>{item.timeLabel}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={t('notifications.title')}
          right={
            unreadCount > 0 ? (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={styles.markAll}>{t('notifications.mark_all_read')}</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <EmptyState
            iconName="bell"
            title={t('notifications.empty_title')}
            description={t('notifications.empty_desc')}
          />
        ) : (
          <>
            {today.length > 0 && (
              <>
                <SectionLabel>{t('notifications.today')}</SectionLabel>
                {today.map(renderItem)}
              </>
            )}
            {earlier.length > 0 && (
              <>
                <SectionLabel style={styles.earlierLabel}>
                  {t('notifications.earlier')}
                </SectionLabel>
                {earlier.map(renderItem)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    markAll: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
    },
    earlierLabel: { marginTop: 18 },
    row: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    rowUnread: { borderColor: colors.electricBgStrong },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: { flex: 1 },
    title: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
    body: { fontSize: 12, color: colors.mutedGray, marginTop: 5, lineHeight: 18 },
    actionBtn: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.electric,
    },
    actionText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.electric,
      textTransform: 'uppercase',
    },
    time: { fontSize: 10, color: colors.mutedGray },
  });
