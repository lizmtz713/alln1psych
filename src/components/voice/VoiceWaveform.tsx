/**
 * VoiceWaveform — Animated bars shown during recording.
 * expo-av doesn't expose meter levels simply, so we use a subtle "activity" animation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const BAR_COUNT = 5;
const BAR_WIDTH = 4;
const BAR_MIN_H = 8;
const BAR_MAX_H = 24;

export function VoiceWaveform({ active }: { active: boolean }) {
  const anims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.3))
  ).current;
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!active) {
      anims.forEach((a) => a.stopAnimation(() => a.setValue(0.2)));
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 120);

    return () => clearInterval(interval);
  }, [active, anims]);

  useEffect(() => {
    if (!active) return;

    const loops = anims.map((anim, i) => {
      const height = BAR_MIN_H + Math.random() * (BAR_MAX_H - BAR_MIN_H);
      const normalized = (height - BAR_MIN_H) / (BAR_MAX_H - BAR_MIN_H);
      return Animated.timing(anim, {
        toValue: 0.2 + normalized * 0.8,
        duration: 80 + i * 20,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      });
    });
    Animated.parallel(loops).start();
  }, [active, timer, anims]);

  return (
    <View style={styles.wrap}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [BAR_MIN_H, BAR_MAX_H],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: BAR_MAX_H,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
    backgroundColor: 'rgba(13, 148, 136, 0.8)',
  },
});
