import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DialogueLine } from '../data/story';
import { useColors, ColorScheme } from '../game/theme';

type Props = {
  visible: boolean;
  chapterTitle?: string;
  lines: DialogueLine[];
  onDone: () => void;
};

export default function DialogueModal({ visible, chapterTitle, lines, onDone }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const [index, setIndex] = useState(0);
  const line = lines[index];

  const advance = () => {
    if (index + 1 < lines.length) {
      setIndex(index + 1);
    } else {
      setIndex(0);
      onDone();
    }
  };

  if (!line) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={advance}>
      <Pressable style={styles.overlay} onPress={advance}>
        {chapterTitle && index === 0 && <Text style={styles.chapterTitle}>{chapterTitle}</Text>}
        <View style={[styles.card, { borderColor: line.tint }]}>
          <View style={styles.speakerRow}>
            <Text style={styles.portrait}>{line.portrait}</Text>
            <Text style={[styles.speakerName, { color: line.tint }]}>{line.speaker}</Text>
          </View>
          <Text style={styles.text}>{line.text}</Text>
          <Text style={styles.tapHint}>
            {index + 1 < lines.length ? 'Tap to continue' : 'Tap to start'} · {index + 1}/{lines.length}
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  chapterTitle: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    gap: 8,
  },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portrait: { fontSize: 24 },
  speakerName: { fontWeight: '800', fontSize: 15 },
  text: { color: COLORS.text, fontSize: 15, lineHeight: 21 },
  tapHint: { color: COLORS.textMuted, fontSize: 11, alignSelf: 'flex-end', marginTop: 4 },
  });
}
