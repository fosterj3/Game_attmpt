import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';

type Reason = 'moves' | 'time';

type Props = {
  visible: boolean;
  reason: Reason;
  coins: number;
  ownedCount: number;
  price: number;
  onUseOwned: () => void;
  onBuyAndUse: () => void;
  onDecline: () => void;
};

export default function ContinueOfferModal({
  visible,
  reason,
  coins,
  ownedCount,
  price,
  onUseOwned,
  onBuyAndUse,
  onDecline,
}: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const canAfford = coins >= price;
  const bonus = reason === 'moves' ? '+3 moves' : '+10 seconds';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>{reason === 'moves' ? '🔄' : '⏱️'}</Text>
          <Text style={styles.title}>{reason === 'moves' ? 'Out of Moves!' : "Time's Up!"}</Text>
          <Text style={styles.body}>
            Keep this attempt going with {bonus}? You can still walk away and try again instead.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onDecline}>
              <Text style={styles.buttonText}>No Thanks</Text>
            </Pressable>
            {ownedCount > 0 ? (
              <Pressable style={[styles.button, styles.primaryButton]} onPress={onUseOwned}>
                <Text style={styles.buttonText}>Use Boost ({ownedCount} owned)</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, styles.primaryButton, !canAfford && styles.buttonDisabled]}
                disabled={!canAfford}
                onPress={onBuyAndUse}
              >
                <Text style={styles.buttonText}>Buy for {'🪙'} {price}</Text>
              </Pressable>
            )}
          </View>
          {ownedCount === 0 && !canAfford && (
            <Text style={styles.insufficientText}>Not enough coins ({coins}/{price})</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: 22,
      padding: 26,
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    badge: { fontSize: 40 },
    title: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
    body: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6 },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
    button: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    buttonDisabled: { opacity: 0.4 },
    primaryButton: { backgroundColor: COLORS.primary },
    secondaryButton: { backgroundColor: COLORS.surfaceLight },
    buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 13, textAlign: 'center' },
    insufficientText: { color: COLORS.danger, fontSize: 12, marginTop: 10 },
  });
}
