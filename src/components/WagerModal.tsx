import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';
import { WAGER_HEARTS } from '../state/playerStore';

type Props = {
  visible: boolean;
  hearts: number;
  onAccept: () => void;
  onDecline: () => void;
};

export default function WagerModal({ visible, hearts, onAccept, onDecline }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>{'🌑'}</Text>
          <Text style={styles.title}>Kaelen's Wager</Text>
          <Text style={styles.body}>
            His voice slides through your thoughts: "Wager {WAGER_HEARTS} hearts, Shardweaver. Fail, and I take them.
            Succeed, and I'll return twice what you risked."
          </Text>
          <Text style={styles.stakes}>
            Win: +{WAGER_HEARTS} {'❤️'}   ·   Lose: -{WAGER_HEARTS} {'❤️'}
          </Text>
          <Text style={styles.heartsNote}>
            You have {hearts} {'❤️'} right now.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onDecline}>
              <Text style={styles.buttonText}>Play it Safe</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primaryButton]} onPress={onAccept}>
              <Text style={styles.buttonText}>Accept the Wager</Text>
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
    borderColor: COLORS.danger,
  },
  badge: { fontSize: 40 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  body: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  stakes: { color: COLORS.accent, fontWeight: '800', fontSize: 15, marginTop: 12 },
  heartsNote: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  button: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.danger },
  secondaryButton: { backgroundColor: COLORS.surfaceLight },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
});
