import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useColors, ColorScheme } from '../game/theme';

export type ComboEvent = {
  id: number;
  label: string;
  points: number;
};

type Props = {
  event: ComboEvent | null;
};

export default function ComboPopup({ event }: Props) {
  const COLORS = useColors();
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!event) return;
    opacity.setValue(0);
    translateY.setValue(0);
    scale.setValue(0.7);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      ]),
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -40, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  if (!event) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
        {!!event.label && <Text style={styles.label}>{event.label}</Text>}
        <Text style={styles.points}>+{event.points}</Text>
      </Animated.View>
    </View>
  );
}

function createStyles(COLORS: ColorScheme) {
  return StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  label: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  points: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  });
}
