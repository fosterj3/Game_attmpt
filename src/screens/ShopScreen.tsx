import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BOOSTS } from '../data/shop';
import { useColors, ColorScheme } from '../game/theme';
import { HEART_PRICE_COINS, MAX_LIVES, usePlayerStore } from '../state/playerStore';

export default function ShopScreen() {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const coins = usePlayerStore((s) => s.coins);
  const lives = usePlayerStore((s) => s.lives);
  const inventory = usePlayerStore((s) => s.inventory);
  const purchaseBoost = usePlayerStore((s) => s.purchaseBoost);
  const purchaseHeart = usePlayerStore((s) => s.purchaseHeart);

  const heartsFull = lives >= MAX_LIVES;
  const canAffordHeart = coins >= HEART_PRICE_COINS;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingTop: 56, paddingBottom: 48, gap: 12 }}>
      <Text style={styles.title}>Shop</Text>
      <View style={styles.coinsChip}>
        <Text style={styles.coinsText}>{'🪙'} {coins}</Text>
      </View>
      <Text style={styles.subtitle}>Stock up on boosts here, then use them from any level.</Text>

      {BOOSTS.map((boost) => {
        const owned = inventory[boost.id] ?? 0;
        const canAfford = coins >= boost.price;
        return (
          <View key={boost.id} style={styles.card}>
            <Text style={styles.emoji}>{boost.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{boost.name}</Text>
              <Text style={styles.description}>{boost.description}</Text>
              <Text style={styles.owned}>Owned: {owned}</Text>
            </View>
            <Pressable
              disabled={!canAfford}
              onPress={() => purchaseBoost(boost.id)}
              style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
            >
              <Text style={styles.buyButtonText}>{'🪙'} {boost.price}</Text>
            </Pressable>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Premium</Text>
      <View style={[styles.card, styles.heartCard]}>
        <Text style={styles.emoji}>{'❤️'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Refill a Heart</Text>
          <Text style={styles.description}>
            A rare splurge for when you've got coins to spare and don't want to wait for a heart to regenerate.
          </Text>
          <Text style={styles.owned}>{lives}/{MAX_LIVES} hearts</Text>
        </View>
        <Pressable
          disabled={!canAffordHeart || heartsFull}
          onPress={() => purchaseHeart()}
          style={[styles.buyButton, styles.heartButton, (!canAffordHeart || heartsFull) && styles.buyButtonDisabled]}
        >
          <Text style={styles.buyButtonText}>{heartsFull ? 'Full' : `🪙 ${HEART_PRICE_COINS.toLocaleString()}`}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  coinsChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  coinsText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: -4 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginTop: 8 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartCard: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  emoji: { fontSize: 32 },
  name: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  description: { color: COLORS.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  owned: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginTop: 4 },
  buyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  heartButton: { backgroundColor: COLORS.danger },
  buyButtonDisabled: { backgroundColor: COLORS.surfaceLight, opacity: 0.5 },
  buyButtonText: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
  });
}
