import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';
import { shareText } from '../game/share';

type Milestones = { top10: boolean; top3: boolean; first: boolean } | null;

type Props = {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  coinsEarned?: number;
  rank?: number | null;
  milestones?: Milestones;
  onPlayAgain: () => void;
  onDone: () => void;
};

const SPARKLES = ['✨', '⭐', '✨', '🎉', '✨', '⭐'];

export default function BlitzResultModal({
  visible,
  score,
  bestScore,
  isNewBest,
  coinsEarned = 0,
  rank = null,
  milestones = null,
  onPlayAgain,
  onDone,
}: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const hasMilestone = !!(milestones && (milestones.top10 || milestones.top3 || milestones.first));
  const grand = isNewBest || hasMilestone;
  const trophyBounce = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle');

  const handleShare = async () => {
    const outcome = await shareText(
      `I just scored ${score} pts in Cascade Quest's Blitz mode! Can you beat me? https://cascade-quest.expo.app`
    );
    if (outcome === 'shared' || outcome === 'copied') setShareStatus(outcome);
  };

  useEffect(() => {
    if (visible) setShareStatus('idle');
  }, [visible]);

  useEffect(() => {
    if (!visible || !grand) return;
    trophyBounce.setValue(0);
    Animated.sequence([
      Animated.spring(trophyBounce, { toValue: 1, useNativeDriver: true, friction: 4, tension: 80 }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyBounce, { toValue: 1.15, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(trophyBounce, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, grand, trophyBounce, glow]);

  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: [COLORS.accent, '#FFE066'] });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDone}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, grand && [styles.cardBest, { borderColor }]]}>
          {grand && (
            <View style={styles.sparkleRow} pointerEvents="none">
              {SPARKLES.map((s, i) => (
                <Text key={i} style={styles.sparkle}>
                  {s}
                </Text>
              ))}
            </View>
          )}
          <Animated.Text style={[styles.badge, grand && { transform: [{ scale: trophyBounce }] }]}>
            {grand ? '🏆' : '⏱️'}
          </Animated.Text>
          <Text style={styles.title}>{"Time's Up!"}</Text>
          {isNewBest && <Text style={styles.newBest}>{'🎉 NEW BEST SCORE! 🎉'}</Text>}
          <Text style={[styles.scoreText, grand && styles.scoreTextBest]}>{score} pts</Text>
          <Text style={styles.bestText}>Best: {bestScore} pts</Text>
          {rank !== null && <Text style={styles.rankText}>Leaderboard rank: #{rank}</Text>}

          {coinsEarned > 0 && (
            <View style={styles.rewardBox}>
              <Text style={styles.rewardLine}>{'🪙'} +{coinsEarned} coins</Text>
              <Text style={styles.rewardBreakdown}>+10 for playing{isNewBest ? ' · +20 new best' : ''}</Text>
              {milestones?.top10 && <Text style={styles.milestoneLine}>{'🏅'} First time Top 10! +100</Text>}
              {milestones?.top3 && <Text style={styles.milestoneLine}>{'🥉'} First time Top 3! +500</Text>}
              {milestones?.first && <Text style={styles.milestoneLine}>{'👑'} First time #1! +1000</Text>}
            </View>
          )}

          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>
              {shareStatus === 'shared' ? 'Shared!' : shareStatus === 'copied' ? 'Copied to clipboard!' : '🔗 Share score'}
            </Text>
          </Pressable>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onDone}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primaryButton]} onPress={onPlayAgain}>
              <Text style={styles.buttonText}>Play Again</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardBest: { borderWidth: 3 },
  sparkleRow: {
    position: 'absolute',
    top: -14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sparkle: { fontSize: 20 },
  badge: { fontSize: 52 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 4 },
  newBest: { color: '#FFE066', fontWeight: '800', fontSize: 16, marginTop: 4 },
  scoreText: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 10 },
  scoreTextBest: { color: '#FFE066', fontSize: 34 },
  bestText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  rankText: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  rewardBox: {
    backgroundColor: 'rgba(124,92,255,0.14)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    gap: 2,
  },
  rewardLine: { color: COLORS.accent, fontWeight: '800', fontSize: 16 },
  rewardBreakdown: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  milestoneLine: { color: '#FFE066', fontWeight: '700', fontSize: 12, marginTop: 4 },
  shareButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  shareButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  button: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.primary },
  secondaryButton: { backgroundColor: COLORS.surfaceLight },
  buttonText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  });
}
