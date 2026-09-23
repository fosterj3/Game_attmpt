import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

type Props = {
  active: boolean;
};

export default function FireBanner({ active }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      enter.setValue(0);
      return;
    }
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, enter, pulse]);

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: enter,
          transform: [{ scale: Animated.add(0.95, Animated.multiply(pulse, 0.08)) }],
        },
      ]}
    >
      <Text style={styles.text}>{'🔥 ON FIRE! 2x 🔥'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  text: {
    color: '#FFD84C',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(255,94,0,0.9)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
});
