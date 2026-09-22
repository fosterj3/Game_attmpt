import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../game/theme';

type Props = {
  value: number | 'GO' | null;
};

export default function CountdownOverlay({ value }: Props) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value === null) return;
    scale.setValue(0.5);
    opacity.setValue(1);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 80 }),
      Animated.timing(opacity, { toValue: 0.15, duration: 850, useNativeDriver: true }),
    ]).start();
  }, [value, scale, opacity]);

  if (value === null) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.dim} />
      <Animated.Text style={[styles.number, { transform: [{ scale }], opacity }]}>{value}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18,20,43,0.35)',
  },
  number: {
    color: COLORS.text,
    fontSize: 96,
    fontWeight: '800',
    textShadowColor: 'rgba(124,92,255,0.9)',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
});
