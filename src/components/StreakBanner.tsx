import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

const MILESTONES = [3, 7, 14, 30];

export default function StreakBanner() {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? currentStreak + 7;

  return (
    <View style={styles.container}>
      <Text style={styles.fire}>{'🔥'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Day {currentStreak} streak</Text>
        <Text style={styles.subtitle}>
          Play tomorrow to keep it alive - {nextMilestone - currentStreak} days to your next bonus
        </Text>
      </View>
    </View>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  fire: {
    fontSize: 28,
  },
  title: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  });
}
