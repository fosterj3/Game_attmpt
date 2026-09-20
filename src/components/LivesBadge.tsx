import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';
import { LIFE_REGEN_MINUTES, MAX_LIVES, usePlayerStore } from '../state/playerStore';

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function LivesBadge() {
  const lives = usePlayerStore((s) => s.lives);
  const lastLifeLostAt = usePlayerStore((s) => s.lastLifeLostAt);
  const regenLivesIfDue = usePlayerStore((s) => s.regenLivesIfDue);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      regenLivesIfDue();
      forceTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [regenLivesIfDue]);

  const nextLifeInMs =
    lives < MAX_LIVES && lastLifeLostAt
      ? lastLifeLostAt + LIFE_REGEN_MINUTES * 60 * 1000 - Date.now()
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.heart}>{'❤'}</Text>
      <Text style={styles.count}>{lives}/{MAX_LIVES}</Text>
      {nextLifeInMs !== null && (
        <Text style={styles.timer}>+1 in {formatCountdown(nextLifeInMs)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  heart: {
    color: COLORS.danger,
    fontSize: 16,
  },
  count: {
    color: COLORS.text,
    fontWeight: '700',
  },
  timer: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
