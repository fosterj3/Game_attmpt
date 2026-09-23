import type { Difficulty } from '../state/playerStore';
import { LevelGoal } from '../game/types';

export type LevelDef = LevelGoal & {
  id: number;
  name: string;
  /**
   * Career/title stars awarded the first time this level is completed
   * (any win, regardless of in-level 1-3 star performance). Scaled by
   * difficulty (proportional to targetScore) so that completing all 10
   * levels sums to exactly 100 - enough for the Grandmaster title.
   */
  titleStars: number;
};

export const LEVELS: LevelDef[] = [
  { id: 1, name: 'First Sparks', targetScore: 600, moveLimit: 18, titleStars: 2 },
  { id: 2, name: 'Sugar Rush', targetScore: 900, moveLimit: 18, titleStars: 4 },
  { id: 3, name: 'Chain Reaction', targetScore: 1200, moveLimit: 17, titleStars: 5 },
  { id: 4, name: 'Cascade Falls', targetScore: 1600, moveLimit: 17, titleStars: 7 },
  { id: 5, name: 'Combo Cliffs', targetScore: 2000, moveLimit: 16, titleStars: 8 },
  { id: 6, name: 'Tile Storm', targetScore: 2500, moveLimit: 16, titleStars: 10 },
  { id: 7, name: 'Grand Cascade', targetScore: 3000, moveLimit: 15, timeLimitSeconds: 90, titleStars: 12 },
  { id: 8, name: 'Match Master', targetScore: 3600, moveLimit: 15, timeLimitSeconds: 80, titleStars: 15 },
  { id: 9, name: 'Rising Stakes', targetScore: 4200, moveLimit: 14, timeLimitSeconds: 75, titleStars: 17 },
  { id: 10, name: 'Legend\'s Trial', targetScore: 5000, moveLimit: 14, timeLimitSeconds: 70, titleStars: 20 },
  { id: 11, name: 'Embers Stir', targetScore: 5600, moveLimit: 14, timeLimitSeconds: 65, titleStars: 22 },
  { id: 12, name: 'The Ember Scout', targetScore: 6200, moveLimit: 13, timeLimitSeconds: 60, titleStars: 25 },
  { id: 13, name: 'Two Shardweavers', targetScore: 6800, moveLimit: 13, timeLimitSeconds: 55, titleStars: 28 },
  { id: 14, name: 'The Remnant Heart', targetScore: 7400, moveLimit: 12, timeLimitSeconds: 50, titleStars: 32 },
  { id: 15, name: 'What Remains', targetScore: 8000, moveLimit: 12, timeLimitSeconds: 45, titleStars: 36 },
];

export function starsForScore(score: number, goal: LevelGoal): 0 | 1 | 2 | 3 {
  if (score < goal.targetScore) return 0;
  if (score >= goal.targetScore * 1.6) return 3;
  if (score >= goal.targetScore * 1.25) return 2;
  return 1;
}

export function getLevel(id: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

// LEVELS above is the "Medium" baseline. Easy/Hard scale moves, time, and
// the score target from that same baseline rather than needing 3 separate
// full level tables. Coin payout also scales with difficulty (see
// DIFFICULTY_COIN_MULTIPLIER in playerStore.ts) so Hard is worth chasing
// despite being harder to 3-star. titleStars/career-star totals and the
// Stars leaderboard are intentionally difficulty-INDEPENDENT: any win
// (1+ stars) awards the same titleStars regardless of difficulty, so
// switching difficulty never inflates or deflates a player's career total
// or their rank on the Stars leaderboard - only the in-run score/coin
// numbers flex.
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, { moves: number; time: number; target: number }> = {
  easy: { moves: 1.3, time: 1.3, target: 0.8 },
  medium: { moves: 1, time: 1, target: 1 },
  hard: { moves: 0.8, time: 0.8, target: 1.25 },
};

export function getEffectiveLevel(id: number, difficulty: Difficulty): LevelDef | undefined {
  const base = getLevel(id);
  if (!base) return undefined;
  if (difficulty === 'medium') return base;
  const m = DIFFICULTY_MULTIPLIERS[difficulty];
  return {
    ...base,
    targetScore: Math.round((base.targetScore * m.target) / 50) * 50,
    moveLimit: Math.max(5, Math.round(base.moveLimit * m.moves)),
    timeLimitSeconds:
      base.timeLimitSeconds != null ? Math.max(20, Math.round(base.timeLimitSeconds * m.time)) : undefined,
  };
}
