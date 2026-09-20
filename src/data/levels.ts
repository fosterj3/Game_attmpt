import { LevelGoal } from '../game/types';

export type LevelDef = LevelGoal & {
  id: number;
  name: string;
};

export const LEVELS: LevelDef[] = [
  { id: 1, name: 'First Sparks', targetScore: 600, moveLimit: 18 },
  { id: 2, name: 'Sugar Rush', targetScore: 900, moveLimit: 18 },
  { id: 3, name: 'Chain Reaction', targetScore: 1200, moveLimit: 17 },
  { id: 4, name: 'Cascade Falls', targetScore: 1600, moveLimit: 17 },
  { id: 5, name: 'Combo Cliffs', targetScore: 2000, moveLimit: 16 },
  { id: 6, name: 'Tile Storm', targetScore: 2500, moveLimit: 16 },
  { id: 7, name: 'Grand Cascade', targetScore: 3000, moveLimit: 15 },
  { id: 8, name: 'Match Master', targetScore: 3600, moveLimit: 15 },
  { id: 9, name: 'Rising Stakes', targetScore: 4200, moveLimit: 14 },
  { id: 10, name: 'Legend\'s Trial', targetScore: 5000, moveLimit: 14 },
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
