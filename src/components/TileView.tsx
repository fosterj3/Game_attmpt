import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { TILE_COLORS } from '../game/theme';

type SwapAnim = {
  progress: Animated.Value;
  dx: number;
  dy: number;
};

type Props = {
  kind: number;
  size: number;
  selected: boolean;
  onPress: () => void;
  popping?: boolean;
  fallSeed?: number;
  swapAnim?: SwapAnim | null;
};

export default function TileView({
  kind,
  size,
  selected,
  onPress,
  popping = false,
  fallSeed = 0,
  swapAnim = null,
}: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const fallY = useRef(new Animated.Value(-size * 1.2)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [scale]);

  useEffect(() => {
    fallY.setValue(-size * 1.2);
    Animated.spring(fallY, { toValue: 0, useNativeDriver: true, friction: 7, tension: 40 }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallSeed]);

  useEffect(() => {
    if (popping) {
      Animated.parallel([
        Animated.timing(popScale, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(popOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [popping, popScale, popOpacity]);

  const transform: any[] = [{ scale: Animated.multiply(scale, popScale) }, { translateY: fallY }];
  if (swapAnim) {
    transform.push({
      translateX: swapAnim.progress.interpolate({ inputRange: [0, 1], outputRange: [0, swapAnim.dx * size] }),
    });
    transform.push({
      translateY: swapAnim.progress.interpolate({ inputRange: [0, 1], outputRange: [0, swapAnim.dy * size] }),
    });
  }

  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, padding: 3 }}>
      <Animated.View
        style={[
          styles.tile,
          {
            backgroundColor: TILE_COLORS[kind % TILE_COLORS.length],
            transform,
            opacity: popOpacity,
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
