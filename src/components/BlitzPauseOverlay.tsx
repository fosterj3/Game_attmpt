import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';

type Props = {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
};

export default function BlitzPauseOverlay({ visible, onResume, onQuit }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onResume}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.badge}>{'⏸️'}</Text>
          <Text style={styles.title}>Paused</Text>
          <Text style={styles.body}>The clock and board are frozen - resume whenever you're ready.</Text>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onQuit}>
              <Text style={styles.buttonText}>Quit</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primaryButton]} onPress={onResume}>
              <Text style={styles.buttonText}>Resume</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  badge: { fontSize: 52 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
  body: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  button: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.primary },
  secondaryButton: { backgroundColor: COLORS.surfaceLight },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
});
