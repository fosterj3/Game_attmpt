import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';
import { Difficulty, ThemeMode, usePlayerStore } from '../state/playerStore';

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; description: string }[] = [
  { id: 'easy', label: 'Easy', description: 'More moves & time, lower targets. Coin payouts reduced.' },
  { id: 'medium', label: 'Medium', description: 'The standard challenge - unchanged targets and payouts.' },
  { id: 'hard', label: 'Hard', description: 'Fewer moves & time, higher targets. Coin payouts boosted.' },
];

const THEME_OPTIONS: { id: ThemeMode; label: string; emoji: string }[] = [
  { id: 'dark', label: 'Dark', emoji: '🌙' },
  { id: 'light', label: 'Light', emoji: '☀️' },
];

export default function SettingsScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const soundEnabled = usePlayerStore((s) => s.soundEnabled);
  const setSoundEnabled = usePlayerStore((s) => s.setSoundEnabled);
  const musicEnabled = usePlayerStore((s) => s.musicEnabled);
  const setMusicEnabled = usePlayerStore((s) => s.setMusicEnabled);
  const themeMode = usePlayerStore((s) => s.themeMode);
  const setThemeMode = usePlayerStore((s) => s.setThemeMode);
  const difficulty = usePlayerStore((s) => s.difficulty);
  const setDifficulty = usePlayerStore((s) => s.setDifficulty);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Audio</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Sound Effects</Text>
            <Text style={styles.rowSubtitle}>Taps, matches, combos, and result chimes.</Text>
          </View>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Music</Text>
            <Text style={styles.rowSubtitle}>Background music during Blitz runs.</Text>
          </View>
          <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Difficulty</Text>
      <View style={styles.card}>
        <View style={styles.chipRow}>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.chip, difficulty === opt.id && styles.chipActive]}
              onPress={() => setDifficulty(opt.id)}
            >
              <Text style={[styles.chipText, difficulty === opt.id && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.rowSubtitle}>
          {DIFFICULTY_OPTIONS.find((o) => o.id === difficulty)?.description}
        </Text>
        <Text style={styles.footnote}>
          Applies to Level Map / Story levels only. Career stars, titles, and the Stars leaderboard are the same
          regardless of difficulty - only in-run targets and coin payouts change.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.chipRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[styles.chip, themeMode === opt.id && styles.chipActive]}
              onPress={() => setThemeMode(opt.id)}
            >
              <Text style={[styles.chipText, themeMode === opt.id && styles.chipTextActive]}>
                {opt.emoji} {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 16, paddingBottom: 48, gap: 8 },
    sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginTop: 14, marginBottom: 6 },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: 14,
      gap: 10,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowLabel: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
    rowSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
    divider: { height: 1, backgroundColor: COLORS.surfaceLight },
    chipRow: { flexDirection: 'row', gap: 8 },
    chip: {
      flex: 1,
      backgroundColor: COLORS.surfaceLight,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    chipActive: { backgroundColor: COLORS.primary },
    chipText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
    chipTextActive: { color: COLORS.text },
    footnote: { color: COLORS.textMuted, fontSize: 11, marginTop: 6, lineHeight: 15 },
  });
}
