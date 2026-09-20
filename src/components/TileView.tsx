import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { TILE_COLORS } from '../game/theme';

type Props = {
  kind: number;
  size: number;
  selected: boolean;
  onPress: () => void;
};

export default function TileView({ kind, size, selected, onPress }: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [scale]);

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, padding: 3 }}>
      <Animated.View
        style={[
          styles.tile,
          {
            backgroundColor: TILE_COLORS[kind % TILE_COLORS.length],
            transform: [{ scale }],
            borderWidth: selected ? 3 : 0,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 12,
    borderColor: '#FFFFFF',
  },
});
