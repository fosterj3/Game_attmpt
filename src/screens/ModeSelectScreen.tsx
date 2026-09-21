import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';
import { RootStackParamList } from '../navigation/types';
import { GameMode, usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeSelect'>;

export default function ModeSelectScreen({ navigation }: Props) {
  const setMode = usePlayerStore((s) => s.setMode);
  const activeMode = usePlayerStore((s) => s.activeMode);

  const choose = (mode: GameMode) => {
    setMode(mode);
    navigation.replace('Home');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cascade Quest</Text>
      <Text style={styles.subtitle}>Choose how you want to play</Text>

      <Pressable style={[styles.card, styles.arcadeCard]} onPress={() => choose('arcade')}>
        <Text style={styles.cardEmoji}>{'⚡'}</Text>
        <Text style={styles.cardTitle}>Arcade Mode</Text>
        <Text style={styles.cardBody}>
          Jump straight into the puzzle. Clear levels, chase stars and streaks, climb the leaderboard — no story, just the game.
        </Text>
      </Pressable>

      <Pressable style={[styles.card, styles.storyCard]} onPress={() => choose('story')}>
        <Text style={styles.cardEmoji}>{'📖'}</Text>
        <Text style={styles.cardTitle}>Story Mode</Text>
        <Text style={styles.cardBody}>
          Play through "The Fading Prism" — the same levels, framed as chapters in Lyra Quinn's journey to stop Kaelen the
          Unmaker and save the kingdom's magic. Kaelen will tempt you to wager your hearts on every chapter — win big or
          lose big, your call.
        </Text>
      </Pressable>

      {activeMode && (
        <Text style={styles.currentMode}>Currently playing: {activeMode === 'arcade' ? 'Arcade' : 'Story'} Mode</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 80,
    paddingHorizontal: 20,
    gap: 16,
  },
  title: { color: COLORS.text, fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  arcadeCard: { borderColor: COLORS.accent },
  storyCard: { borderColor: COLORS.primary },
  cardEmoji: { fontSize: 32 },
  cardTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  cardBody: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
  currentMode: { color: COLORS.textMuted, textAlign: 'center', marginTop: 8, fontSize: 12 },
});
