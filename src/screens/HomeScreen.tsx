import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DailyChestCard from '../components/DailyChestCard';
import DailyQuestsCard from '../components/DailyQuestsCard';
import HowToPlayModal from '../components/HowToPlayModal';
import LivesBadge from '../components/LivesBadge';
import StreakBanner from '../components/StreakBanner';
import { LEVELS, getEffectiveLevel } from '../data/levels';
import { getChapter } from '../data/story';
import { titleForStars } from '../data/titles';
import { useColors, ColorScheme } from '../game/theme';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const unlockedLevelId = usePlayerStore((s) => s.unlockedLevelId);
  const levelProgress = usePlayerStore((s) => s.levelProgress);
  const coins = usePlayerStore((s) => s.coins);
  const lives = usePlayerStore((s) => s.lives);
  const totalStars = usePlayerStore((s) => s.totalStars());
  const difficulty = usePlayerStore((s) => s.difficulty);
  const activeMode = usePlayerStore((s) => s.activeMode);
  const title = titleForStars(totalStars);
  const [howToPlayVisible, setHowToPlayVisible] = useState(false);
  const isStory = activeMode === 'story';

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profileChip}>
          <Text style={styles.profileEmoji}>{title.emoji}</Text>
          <Text style={styles.profileText}>{title.name}</Text>
        </Pressable>
        <Pressable style={styles.coinsChip} onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.coinsText}>{'🪙'} {coins}</Text>
          <Text style={styles.shopHint}>Shop</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('ModeSelect')} style={styles.modeChip}>
          <Text style={styles.modeChipText}>{isStory ? '📖 Story' : '⚡ Arcade'}</Text>
        </Pressable>
        <Pressable onPress={() => setHowToPlayVisible(true)} style={styles.iconChip} hitSlop={8}>
          <Text style={styles.iconChipText}>{'?'}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Settings')} style={styles.iconChip} hitSlop={8}>
          <Text style={styles.iconChipText}>{'⚙️'}</Text>
        </Pressable>
        <LivesBadge />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StreakBanner />
        <DailyChestCard />
        <DailyQuestsCard />

        <Pressable style={styles.leaderboardLink} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.leaderboardLinkText}>{'🏅'} See how you rank among friends</Text>
        </Pressable>

        {!isStory && (
          <Pressable style={styles.blitzCard} onPress={() => navigation.navigate('Blitz')}>
            <Text style={styles.blitzEmoji}>{'⏱️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.blitzTitle}>Blitz Mode</Text>
              <Text style={styles.blitzBody}>60-second score attack - no moves limit, just chase a high score.</Text>
            </View>
          </Pressable>
        )}

        <Text style={styles.mapTitle}>{isStory ? 'The Fading Prism' : 'Level Map'}</Text>
        {isStory && (
          <Text style={styles.storyIntro}>
            Follow Lyra Quinn's journey to stop Kaelen the Unmaker before the kingdom's magic fades for good. Every
            chapter, he'll offer a wager: risk 2 hearts for a chance to win 2 more.
          </Text>
        )}
        {LEVELS.map((baseLevel) => {
          const level = getEffectiveLevel(baseLevel.id, difficulty)!;
          const locked = level.id > unlockedLevelId;
          const progress = levelProgress[level.id];
          const chapter = getChapter(level.id);
          const displayName = isStory && chapter ? chapter.title : `${level.id}. ${level.name}`;
          return (
            <Pressable
              key={level.id}
              disabled={locked || lives <= 0}
              onPress={() => navigation.navigate('Game', { levelId: level.id })}
              style={[styles.levelCard, locked && styles.levelCardLocked]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.levelName}>{locked ? '🔒 ' : ''}{displayName}</Text>
                <Text style={styles.levelGoal}>
                  Target {level.targetScore} pts in {level.moveLimit} moves
                  {level.timeLimitSeconds != null ? ` · ⏱ ${level.timeLimitSeconds}s` : ''}
                </Text>
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

      <HowToPlayModal visible={howToPlayVisible} onClose={() => setHowToPlayVisible(false)} />
    </View>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinsText: { color: COLORS.accent, fontWeight: '700' },
  shopHint: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  modeChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modeChipText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  iconChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
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
  blitzCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  blitzEmoji: { fontSize: 26 },
  blitzTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  blitzBody: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  mapTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  storyIntro: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
    marginBottom: 4,
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
}
