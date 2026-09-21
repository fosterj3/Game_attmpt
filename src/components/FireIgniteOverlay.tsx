import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
};

const FLAME_COUNT = 6;

export default function FireIgniteOverlay({ visible }: Props) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const flames = useRef(Array.from({ length: FLAME_COUNT }, () => new Animated.Value(0))).current;

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
        duration: 900 + i * 70,
        delay: i * 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, [visible, scale, opacity, flames]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {flames.map((v, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.flame,
            {
              left: `${8 + i * 15}%`,
              opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [40, -260] }) },
                { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] }) },
              ],
            },
          ]}
        >
          {'🔥'}
        </Animated.Text>
      ))}
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  flame: {
    position: 'absolute',
    bottom: 0,
    fontSize: 40,
  },
  title: {
    color: '#FFD84C',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255,94,0,0.9)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: '#FFF3D0',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
});
