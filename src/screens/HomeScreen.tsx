import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LivesBadge from '../components/LivesBadge';
import StreakBanner from '../components/StreakBanner';
import { LEVELS } from '../data/levels';
import { titleForStars } from '../data/titles';
import { COLORS } from '../game/theme';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const unlockedLevelId = usePlayerStore((s) => s.unlockedLevelId);
  const levelProgress = usePlayerStore((s) => s.levelProgress);
  const coins = usePlayerStore((s) => s.coins);
  const lives = usePlayerStore((s) => s.lives);
  const totalStars = usePlayerStore((s) => s.totalStars());
  const title = titleForStars(totalStars);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profileChip}>
          <Text style={styles.profileEmoji}>{title.emoji}</Text>
          <Text style={styles.profileText}>{title.name}</Text>
        </Pressable>
        <View style={styles.coinsChip}>
          <Text style={styles.coinsText}>{'🪙'} {coins}</Text>
        </View>
        <LivesBadge />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StreakBanner />

        <Pressable style={styles.leaderboardLink} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.leaderboardLinkText}>{'🏅'} See how you rank among friends</Text>
        </Pressable>

        <Text style={styles.mapTitle}>Level Map</Text>
        {LEVELS.map((level) => {
          const locked = level.id > unlockedLevelId;
          const progress = levelProgress[level.id];
          return (
            <Pressable
              key={level.id}
              disabled={locked || lives <= 0}
              onPress={() => navigation.navigate('Game', { levelId: level.id })}
              style={[styles.levelCard, locked && styles.levelCardLocked]}
            >
              <View>
                <Text style={styles.levelName}>{locked ? '🔒' : level.id}. {level.name}</Text>
                <Text style={styles.levelGoal}>Target {level.targetScore} pts in {level.moveLimit} moves</Text>
              </View>
              <Text style={styles.levelStars}>
                {progress ? '⭐'.repeat(progress.bestStars) || '—' : locked ? '' : 'New'}
              </Text>
            </Pressable>
          );
        })}
        {lives <= 0 && (
          <Text style={styles.outOfLives}>Out of lives! Wait for one to regenerate to keep playing.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 56,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  profileEmoji: { fontSize: 16 },
  profileText: { color: COLORS.text, fontWeight: '600', fontSize: 12 },
  coinsChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coinsText: { color: COLORS.accent, fontWeight: '700' },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 48,
  },
  leaderboardLink: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  leaderboardLinkText: { color: COLORS.text, fontWeight: '600' },
  mapTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelCardLocked: {
    opacity: 0.4,
  },
  levelName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  levelGoal: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  levelStars: { color: COLORS.accent, fontSize: 16 },
  outOfLives: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 8,
  },
});
