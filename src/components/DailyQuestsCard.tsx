import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getQuestDef } from '../data/quests';
import { playSound } from '../game/sound';
import { COLORS } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';

export default function DailyQuestsCard() {
  const dailyQuestIds = usePlayerStore((s) => s.dailyQuestIds);
  const dailyQuests = usePlayerStore((s) => s.dailyQuests);
  const claimQuest = usePlayerStore((s) => s.claimQuest);

  if (dailyQuestIds.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'📋'} Daily Quests</Text>
      {dailyQuestIds.map((id) => {
        const def = getQuestDef(id);
        const progress = dailyQuests[id] ?? { progress: 0, claimed: false };
        const done = progress.progress >= def.target;
        const pct = Math.min(100, Math.round((progress.progress / def.target) * 100));
        return (
          <View key={id} style={styles.questRow}>
            <Text style={styles.emoji}>{def.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.questLabel}>{def.description}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` }, done && styles.fillDone]} />
              </View>
              <Text style={styles.progressText}>
                {Math.min(progress.progress, def.target)} / {def.target}
              </Text>
            </View>
            {progress.claimed ? (
              <Text style={styles.claimedText}>Claimed</Text>
            ) : done ? (
              <Pressable
                style={styles.claimButton}
                onPress={() => {
                  claimQuest(id);
                  playSound('newbest');
                }}
              >
                <Text style={styles.claimButtonText}>+{def.reward} {'🪙'}</Text>
              </Pressable>
            ) : (
              <Text style={styles.rewardText}>+{def.reward} {'🪙'}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  title: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 20 },
  questLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  track: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.primary },
  fillDone: { backgroundColor: COLORS.success },
  progressText: { color: COLORS.textMuted, fontSize: 10, marginTop: 3 },
  claimButton: {
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  claimButtonText: { color: COLORS.background, fontWeight: '800', fontSize: 12 },
  claimedText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  rewardText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
});
