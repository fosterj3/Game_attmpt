import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
};

const FLAME_COUNT = 20;

// Deterministic pseudo-random jitter so the flame wall looks organic
// (varied size/speed/position) without needing real randomness each render.
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const FLAMES = Array.from({ length: FLAME_COUNT }, (_, i) => {
  const leftPct = (i / (FLAME_COUNT - 1)) * 100 + (jitter(i) - 0.5) * 6;
  const size = 32 + jitter(i + 50) * 34;
  const duration = 1100 + jitter(i + 100) * 700;
  const delay = jitter(i + 200) * 260;
  return { leftPct, size, duration, delay };
});

export default function FireIgniteOverlay({ visible }: Props) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const flames = useRef(FLAMES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }
    scale.setValue(0.4);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 60 }),
    ]).start();

    flames.forEach((v, i) => {
      v.setValue(0);
      Animated.timing(v, {
        toValue: 1,
        duration: FLAMES[i].duration,
        delay: FLAMES[i].delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, [visible, scale, opacity, flames]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {flames.map((v, i) => {
        const { leftPct, size } = FLAMES[i];
        return (
          <Animated.Text
            key={i}
            style={[
              styles.flame,
              {
                left: `${leftPct}%`,
                fontSize: size,
                opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [80, -1100] }) },
                  { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) },
                ],
              },
            ]}
          >
            {'🔥'}
          </Animated.Text>
        );
      })}
      <Animated.View style={[styles.captionWrap, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.title}>{"YOU'RE ON FIRE!"}</Text>
        <Text style={styles.subtitle}>Every match now worth 2x</Text>
      </Animated.View>
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
    overflow: 'hidden',
    zIndex: 100,
  },
  flame: {
    position: 'absolute',
    bottom: 0,
  },
  captionWrap: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    color: '#FFD84C',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255,94,0,0.95)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: '#FFF3D0',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
});
