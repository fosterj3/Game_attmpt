import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { playSound } from '../game/sound';
import { useColors, ColorScheme } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

export default function DailyChestCard() {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const canOpenDailyChest = usePlayerStore((s) => s.canOpenDailyChest());
  const openDailyChest = usePlayerStore((s) => s.openDailyChest);
  const [reward, setReward] = useState<number | null>(null);
  const bounce = useRef(new Animated.Value(1)).current;

  const handleOpen = () => {
    if (!canOpenDailyChest) return;
    const amount = openDailyChest();
    setReward(amount);
    playSound('newbest');
    bounce.setValue(0.6);
    Animated.spring(bounce, { toValue: 1, useNativeDriver: true, friction: 4, tension: 80 }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.chestEmoji, { transform: [{ scale: bounce }] }]}>
        {canOpenDailyChest ? '🎁' : '📭'}
      </Animated.Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Daily Mystery Chest</Text>
        <Text style={styles.body}>
          {reward !== null
            ? `You got ${reward} 🪙! Come back tomorrow for another.`
            : canOpenDailyChest
            ? 'Open for a random coin reward - could be big!'
            : 'Already opened today - check back tomorrow.'}
        </Text>
      </View>
      {canOpenDailyChest && (
        <Pressable style={styles.openButton} onPress={handleOpen}>
          <Text style={styles.openButtonText}>Open</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chestEmoji: { fontSize: 30 },
  title: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
  body: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  openButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  openButtonText: { color: COLORS.background, fontWeight: '800', fontSize: 13 },
  });
}
