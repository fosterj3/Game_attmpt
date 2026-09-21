import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';

type WagerResult = {
  heartsDelta: number;
  coinsBonus: number;
};

type Props = {
  visible: boolean;
  won: boolean;
  score: number;
  target: number;
  stars: 0 | 1 | 2 | 3;
  coinsEarned: number;
  moveBonusCoins?: number;
  wagerResult?: WagerResult | null;
  onContinue: () => void;
  onRetry: () => void;
};

export default function LevelResultModal({
  visible,
  won,
  score,
  target,
  stars,
  coinsEarned,
  moveBonusCoins = 0,
  wagerResult,
  onContinue,
  onRetry,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <View style={[styles.card, won ? styles.cardWon : styles.cardLost]}>
          <Text style={styles.badge}>{won ? '🎉' : '😵'}</Text>
          <Text style={styles.title}>{won ? 'Level Complete!' : 'Out of Moves'}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3].map((n) => (
              <Text key={n} style={[styles.star, n > stars && styles.starEmpty]}>
                {'⭐'}
              </Text>
            ))}
          </View>

          <Text style={styles.scoreText}>
            {score} / {target} pts
          </Text>

          {won && coinsEarned > 0 && (
            <Text style={styles.coinsText}>
              {'🪙'} +{coinsEarned}
              {moveBonusCoins > 0 ? ` (incl. +${moveBonusCoins} leftover-move bonus)` : ''}
            </Text>
          )}
          {!won && (
            <Text style={styles.hintText}>You reached {Math.round((score / target) * 100)}% of the target — so close!</Text>
          )}

          {wagerResult && (
            <View style={styles.wagerBox}>
              <Text style={styles.wagerTitle}>{won ? "Kaelen's Wager: Won!" : "Kaelen's Wager: Lost"}</Text>
              <Text style={[styles.wagerText, wagerResult.heartsDelta < 0 && styles.wagerTextLoss]}>
                {wagerResult.heartsDelta >= 0 ? '+' : ''}
                {wagerResult.heartsDelta} {'❤️'}
                {wagerResult.coinsBonus > 0 ? `  ·  +${wagerResult.coinsBonus} 🪙 (hearts capped)` : ''}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            {!won && (
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={onRetry}>
                <Text style={styles.buttonText}>Retry</Text>
              </Pressable>
            )}
            <Pressable style={[styles.button, styles.primaryButton]} onPress={onContinue}>
              <Text style={styles.buttonText}>Continue</Text>
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
    gap: 8,
    borderWidth: 2,
  },
  cardWon: { borderColor: COLORS.success },
  cardLost: { borderColor: COLORS.danger },
  badge: { fontSize: 48 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 6, marginVertical: 8 },
  star: { fontSize: 36 },
  starEmpty: { opacity: 0.2 },
  scoreText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  coinsText: { color: COLORS.accent, fontSize: 15, fontWeight: '700', marginTop: 2 },
  hintText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 2 },
  wagerBox: {
    backgroundColor: 'rgba(255,94,91,0.12)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  wagerTitle: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  wagerText: { color: COLORS.success, fontWeight: '800', fontSize: 14, marginTop: 2 },
  wagerTextLoss: { color: COLORS.danger },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: COLORS.primary },
  secondaryButton: { backgroundColor: COLORS.surfaceLight },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
});
