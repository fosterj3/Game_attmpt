import React from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Board, Position } from '../game/types';
import TileView from './TileView';

export type SwapState = {
  a: Position;
  b: Position;
  progress: Animated.Value;
};

type Props = {
  board: Board;
  selected: Position | null;
  onTilePress: (pos: Position) => void;
  poppingIds?: Set<number>;
  fallSeed?: number;
  swap?: SwapState | null;
  hint?: { a: Position; b: Position } | null;
};

export default function BoardView({
  board,
  selected,
  onTilePress,
  poppingIds,
  fallSeed = 0,
  swap = null,
  hint = null,
}: Props) {
  const { width } = useWindowDimensions();
  const size = board.length;
  const boardSize = Math.min(width - 32, 420);
  const tileSize = boardSize / size;

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => {
            if (!tile) return <View key={colIndex} style={{ width: tileSize, height: tileSize }} />;
            const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
            const isHinted =
              !!hint &&
              ((hint.a.row === rowIndex && hint.a.col === colIndex) ||
                (hint.b.row === rowIndex && hint.b.col === colIndex));

            let swapAnim = null;
            if (swap) {
              if (swap.a.row === rowIndex && swap.a.col === colIndex) {
                swapAnim = { progress: swap.progress, dx: swap.b.col - swap.a.col, dy: swap.b.row - swap.a.row };
              } else if (swap.b.row === rowIndex && swap.b.col === colIndex) {
                swapAnim = { progress: swap.progress, dx: swap.a.col - swap.b.col, dy: swap.a.row - swap.b.row };
              }
            }

            return (
              <TileView
                key={tile.id}
                kind={tile.kind}
                size={tileSize}
                selected={isSelected}
                onPress={() => onTilePress({ row: rowIndex, col: colIndex })}
                popping={poppingIds?.has(tile.id)}
                fallSeed={fallSeed}
                swapAnim={swapAnim}
                hinted={isHinted}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
