import { Board, BOARD_SIZE, Position, Tile, TILE_KINDS } from './types';

let nextTileId = 1;

function randomKind(): number {
  return Math.floor(Math.random() * TILE_KINDS);
}

function makeTile(kind: number): Tile {
  return { id: nextTileId++, kind };
}

function wouldMatchAt(board: Board, row: number, col: number, kind: number): boolean {
  if (
    col >= 2 &&
    board[row][col - 1]?.kind === kind &&
    board[row][col - 2]?.kind === kind
  ) {
    return true;
  }
  if (
    row >= 2 &&
    board[row - 1][col]?.kind === kind &&
    board[row - 2][col]?.kind === kind
  ) {
    return true;
  }
  return false;
}

export function generateBoard(size: number = BOARD_SIZE): Board {
  const board: Board = Array.from({ length: size }, () => Array<Tile>(size).fill(null));
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let kind = randomKind();
      let attempts = 0;
      while (wouldMatchAt(board, row, col, kind) && attempts < 20) {
        kind = randomKind();
        attempts++;
      }
      board[row][col] = makeTile(kind);
    }
  }
  return board;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dRow = Math.abs(a.row - b.row);
  const dCol = Math.abs(a.col - b.col);
  return dRow + dCol === 1;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

function swapCells(board: Board, a: Position, b: Position): Board {
  const next = cloneBoard(board);
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

export function findMatchedPositions(board: Board): Position[] {
  const size = board.length;
  const matched = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (let row = 0; row < size; row++) {
    let runStart = 0;
    for (let col = 1; col <= size; col++) {
      const prevKind = board[row][col - 1]?.kind;
      const curKind = col < size ? board[row][col]?.kind : undefined;
      if (curKind !== prevKind || curKind === undefined) {
        const runLength = col - runStart;
        if (runLength >= 3 && prevKind !== undefined) {
          for (let k = runStart; k < col; k++) matched.add(key(row, k));
        }
        runStart = col;
      }
    }
  }

  for (let col = 0; col < size; col++) {
    let runStart = 0;
    for (let row = 1; row <= size; row++) {
      const prevKind = board[row - 1][col]?.kind;
      const curKind = row < size ? board[row][col]?.kind : undefined;
      if (curKind !== prevKind || curKind === undefined) {
        const runLength = row - runStart;
        if (runLength >= 3 && prevKind !== undefined) {
          for (let k = runStart; k < row; k++) matched.add(key(k, col));
        }
        runStart = row;
      }
    }
  }

  return Array.from(matched).map((k) => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });
}

export function clearMatches(board: Board, positions: Position[]): Board {
  const next = cloneBoard(board);
  for (const { row, col } of positions) {
    next[row][col] = null;
  }
  return next;
}

export function collapseColumns(board: Board): Board {
  const size = board.length;
  const next = cloneBoard(board);
  for (let col = 0; col < size; col++) {
    const column: Tile[] = [];
    for (let row = 0; row < size; row++) {
      if (next[row][col] !== null) column.push(next[row][col]);
    }
    const missing = size - column.length;
    const refilled: Tile[] = Array.from({ length: missing }, () => makeTile(randomKind()));
    const fullColumn = refilled.concat(column);
    for (let row = 0; row < size; row++) {
      next[row][col] = fullColumn[row];
    }
  }
  return next;
}

export function trySwap(board: Board, a: Position, b: Position): { board: Board; valid: boolean } {
  if (!isAdjacent(a, b)) return { board, valid: false };
  const swapped = swapCells(board, a, b);
  const matches = findMatchedPositions(swapped);
  if (matches.length === 0) {
    return { board, valid: false };
  }
  return { board: swapped, valid: true };
}

export type CascadeStep = {
  board: Board;
  clearedCount: number;
};

export function resolveCascades(board: Board): CascadeStep[] {
  const steps: CascadeStep[] = [];
  let current = board;
  while (true) {
    const matches = findMatchedPositions(current);
    if (matches.length === 0) break;
    current = clearMatches(current, matches);
    current = collapseColumns(current);
    steps.push({ board: current, clearedCount: matches.length });
  }
  return steps;
}

export function scoreForClear(clearedCount: number): number {
  return clearedCount * 10 + Math.max(0, clearedCount - 3) * 20;
}

export function findAnyValidMove(board: Board): { a: Position; b: Position } | null {
  const size = board.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (col + 1 < size) {
        const a = { row, col };
        const b = { row, col: col + 1 };
        if (trySwap(board, a, b).valid) return { a, b };
      }
      if (row + 1 < size) {
        const a = { row, col };
        const b = { row: row + 1, col };
        if (trySwap(board, a, b).valid) return { a, b };
      }
    }
  }
  return null;
}

export function hasAnyValidMove(board: Board): boolean {
  return findAnyValidMove(board) !== null;
}
