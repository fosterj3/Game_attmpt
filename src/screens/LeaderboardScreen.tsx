import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { buildLeaderboard } from '../data/leaderboard';
import { COLORS } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

export default function LeaderboardScreen() {
  const totalStars = usePlayerStore((s) => s.totalStars());
  const entries = buildLeaderboard(totalStars);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Friends Leaderboard</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item, index }) => (
          <View style={[styles.row, item.isPlayer && styles.rowPlayer]}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={[styles.name, item.isPlayer && styles.namePlayer]}>{item.name}</Text>
            <Text style={styles.stars}>{'⭐'} {item.stars}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  rowPlayer: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  rank: { color: COLORS.textMuted, width: 32, fontWeight: '700' },
  name: { color: COLORS.text, flex: 1, fontWeight: '600' },
  namePlayer: { color: COLORS.primary },
  stars: { color: COLORS.accent, fontWeight: '700' },
});
