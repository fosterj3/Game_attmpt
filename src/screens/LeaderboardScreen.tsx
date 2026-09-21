import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { buildBlitzLeaderboard, buildLeaderboard } from '../data/leaderboard';
import { COLORS } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

type Tab = 'stars' | 'blitz';

export default function LeaderboardScreen() {
  const totalStars = usePlayerStore((s) => s.totalStars());
  const blitzBestScore = usePlayerStore((s) => s.blitzBestScore);
  const [tab, setTab] = useState<Tab>('stars');

  const entries = tab === 'stars' ? buildLeaderboard(totalStars) : buildBlitzLeaderboard(blitzBestScore);
  const unit = tab === 'stars' ? '⭐' : 'pts';

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Friends Leaderboard</Text>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, tab === 'stars' && styles.tabActive]} onPress={() => setTab('stars')}>
          <Text style={[styles.tabText, tab === 'stars' && styles.tabTextActive]}>⭐ Stars</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'blitz' && styles.tabActive]} onPress={() => setTab('blitz')}>
          <Text style={[styles.tabText, tab === 'blitz' && styles.tabTextActive]}>⏱ Blitz</Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item, index }) => (
          <View style={[styles.row, item.isPlayer && styles.rowPlayer]}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={[styles.name, item.isPlayer && styles.namePlayer]}>{item.name}</Text>
            <Text style={styles.value}>{tab === 'stars' ? `${unit} ${item.value}` : `${item.value} ${unit}`}</Text>
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
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: COLORS.text },
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
  value: { color: COLORS.accent, fontWeight: '700' },
});
