import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../../context/ThemeContext';
import type { ThemeColors } from '../../../theme/colors';
import { formatMonthYear, weekdayHeadings, isSameDay } from '../../../utils/date';
import { WorkoutSchedule } from '../../../types';

interface CalendarGridProps {
  month: Date;
  schedules: WorkoutSchedule[];
  selectedDate: Date | null;
  onChangeMonth: (next: Date) => void;
  onSelectDate: (date: Date) => void;
}

/** Month grid of design 06 with a dot + label on days that have sessions. */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  schedules,
  selectedDate,
  onChangeMonth,
  onSelectDate,
}) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const cells = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const result: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let d = 1; d <= daysInMonth; d += 1) result.push(new Date(year, monthIndex, d));
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [month]);

  const schedulesOn = (date: Date) =>
    schedules.filter((s) => isSameDay(s.scheduledDate, date));

  const shiftMonth = (delta: number) =>
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{formatMonthYear(month)}</Text>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => shiftMonth(-1)}>
            <Icon name="chevron-left" size={18} color={colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => shiftMonth(1)}>
            <Icon name="chevron-right" size={18} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekRow}>
        {weekdayHeadings().map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, idx) => {
          if (!date) return <View key={`empty-${idx}`} style={styles.cell} />;

          const daySchedules = schedulesOn(date);
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[styles.cell, isSelected && styles.cellSelected, isToday && styles.cellToday]}
              onPress={() => onSelectDate(date)}
            >
              <Text style={[styles.dayText, isToday && styles.dayTextToday]}>
                {date.getDate()}
              </Text>
              {daySchedules.length > 0 && (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: daySchedules.every((s) => s.isCompleted)
                        ? colors.success
                        : colors.electric,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 22,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    monthLabel: { fontSize: 16, fontWeight: '900', color: colors.onSurface },
    navRow: { flexDirection: 'row', gap: 8 },
    navBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekRow: { flexDirection: 'row', marginBottom: 6 },
    weekday: {
      flex: 1,
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '800',
      color: colors.mutedGray,
      textTransform: 'uppercase',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderRadius: 10,
    },
    cellToday: { borderWidth: 1, borderColor: colors.electric },
    cellSelected: { backgroundColor: colors.electricBg },
    dayText: { fontSize: 13, fontWeight: '700', color: colors.onSurface },
    dayTextToday: { color: colors.electric, fontWeight: '900' },
    dot: { width: 5, height: 5, borderRadius: 3 },
  });
