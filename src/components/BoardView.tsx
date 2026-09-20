import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Board, Position } from '../game/types';
import TileView from './TileView';

type Props = {
  board: Board;
  selected: Position | null;
  onTilePress: (pos: Position) => void;
};

export default function BoardView({ board, selected, onTilePress }: Props) {
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
            return (
              <TileView
                key={tile.id}
                kind={tile.kind}
                size={tileSize}
                selected={isSelected}
                onPress={() => onTilePress({ row: rowIndex, col: colIndex })}
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
