import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  playedDates: Record<string, true>;
  currentStreak: number;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function StreakCalendarModal({ visible, onClose, playedDates, currentStreak }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  }, [visible]);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const playedCountThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => playedDates[dateKey(viewYear, viewMonth, d)]
  ).length;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable onPress={goPrevMonth} style={styles.navButton} hitSlop={10}>
              <Text style={styles.navButtonText}>{'‹'}</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={goNextMonth}
              disabled={isCurrentMonth}
              style={[styles.navButton, isCurrentMonth && styles.navButtonDisabled]}
              hitSlop={10}
            >
              <Text style={styles.navButtonText}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={i} style={styles.cell} />;
              const played = !!playedDates[dateKey(viewYear, viewMonth, day)];
              const isToday = isCurrentMonth && day === today.getDate();
              return (
                <View key={i} style={styles.cell}>
                  <View style={[styles.dayCircle, played && styles.dayCirclePlayed, isToday && styles.dayCircleToday]}>
                    <Text style={[styles.dayText, played && styles.dayTextPlayed]}>{day}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.footnote}>
            {'🔥'} {playedCountThisMonth} day{playedCountThisMonth === 1 ? '' : 's'} played this month · {currentStreak}-day current streak
          </Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: 20,
      padding: 20,
      gap: 6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonDisabled: { opacity: 0.3 },
    navButtonText: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
    monthTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
    weekdayRow: { flexDirection: 'row' },
    weekdayLabel: {
      flex: 1,
      textAlign: 'center',
      color: COLORS.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    dayCircle: {
      width: '78%',
      height: '78%',
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCirclePlayed: { backgroundColor: COLORS.accent },
    dayCircleToday: { borderWidth: 2, borderColor: COLORS.primary },
    dayText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
    dayTextPlayed: { color: COLORS.background, fontWeight: '800' },
    footnote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10 },
    closeButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    closeButtonText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  });
}
