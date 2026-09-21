import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';

type Props = {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onDone: () => void;
};

export default function BlitzResultModal({ visible, score, bestScore, isNewBest, onPlayAgain, onDone }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDone}>
      <View style={styles.overlay}>
        <View style={[styles.card, isNewBest && styles.cardBest]}>
          <Text style={styles.badge}>{isNewBest ? '🏆' : '⏱️'}</Text>
          <Text style={styles.title}>{"Time's Up!"}</Text>
          {isNewBest && <Text style={styles.newBest}>New Best Score!</Text>}
          <Text style={styles.scoreText}>{score} pts</Text>
          <Text style={styles.bestText}>Best: {bestScore} pts</Text>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onDone}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primaryButton]} onPress={onPlayAgain}>
              <Text style={styles.buttonText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardBest: { borderColor: COLORS.accent },
  badge: { fontSize: 48 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
  newBest: { color: COLORS.accent, fontWeight: '800', fontSize: 15, marginTop: 4 },
  scoreText: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 10 },
  bestText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  button: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.primary },
  secondaryButton: { backgroundColor: COLORS.surfaceLight },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
});
