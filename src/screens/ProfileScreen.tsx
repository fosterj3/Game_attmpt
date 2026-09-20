import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TITLES, titleForStars } from '../data/titles';
import { COLORS } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

export default function ProfileScreen() {
  const totalStars = usePlayerStore((s) => s.totalStars());
  const coins = usePlayerStore((s) => s.coins);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const title = titleForStars(totalStars);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingTop: 56, paddingBottom: 48 }}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{title.emoji}</Text>
        <Text style={styles.heroTitle}>{title.name}</Text>
        <Text style={styles.heroSubtitle}>{totalStars} total stars</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalStars}</Text>
          <Text style={styles.statLabel}>Stars</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Titles</Text>
      {TITLES.map((t) => {
        const unlocked = totalStars >= t.minStars;
        return (
          <View key={t.name} style={[styles.titleRow, !unlocked && styles.titleRowLocked]}>
            <Text style={styles.titleEmoji}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleName}>{t.name}</Text>
              <Text style={styles.titleReq}>{t.minStars} stars required</Text>
            </View>
            {unlocked && <Text style={styles.unlockedBadge}>Unlocked</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroEmoji: { fontSize: 48 },
  heroTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 8 },
  heroSubtitle: { color: COLORS.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { color: COLORS.accent, fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  titleRowLocked: { opacity: 0.4 },
  titleEmoji: { fontSize: 22 },
  titleName: { color: COLORS.text, fontWeight: '700' },
  titleReq: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  unlockedBadge: { color: COLORS.success, fontWeight: '700', fontSize: 12 },
});
