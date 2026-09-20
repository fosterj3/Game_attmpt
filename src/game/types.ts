export const BOARD_SIZE = 7;
export const TILE_KINDS = 6;

export type Tile = {
  id: number;
  kind: number;
} | null;

export type Board = Tile[][];

export type Position = { row: number; col: number };

export type LevelGoal = {
  targetScore: number;
  moveLimit: number;
};

export type LevelResult = {
  won: boolean;
  score: number;
  movesUsed: number;
  stars: 0 | 1 | 2 | 3;
};
