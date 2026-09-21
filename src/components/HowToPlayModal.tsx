import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const STEPS: { emoji: string; title: string; body: string }[] = [
  {
    emoji: '👆',
    title: 'Swap to match',
    body: 'Tap a tile, then tap a neighbor to swap them. Line up 3+ of the same color in a row or column to clear them.',
  },
  {
    emoji: '💥',
    title: 'Chain cascades',
    body: 'Cleared tiles let new ones fall in — if that creates another match, it clears automatically for bonus points.',
  },
  {
    emoji: '🎯',
    title: 'Beat the target',
    body: 'Hit the point target shown at the top before you run out of moves to clear the level and earn stars.',
  },
  {
    emoji: '❤️',
    title: 'Watch your lives',
    body: "Each level costs one life. You've got 5 — they refill over time, so come back later if you run out.",
  },
  {
    emoji: '🔥',
    title: 'Keep your streak',
    body: 'Play at least one level every day to build your streak and unlock bonus milestones.',
  },
];

export default function HowToPlayModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>How to Play</Text>
          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 14 }}>
            {STEPS.map((step) => (
              <View key={step.title} style={styles.step}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepEmoji: { fontSize: 24 },
  stepTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  stepBody: { color: COLORS.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
});
