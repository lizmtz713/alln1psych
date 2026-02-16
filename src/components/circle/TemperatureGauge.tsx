import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../lib/constants';
import type { Temperature } from '../../stores/circleStore';

const TEMP_COLORS: Record<Temperature, string> = {
  green: COLORS.temperature.green,
  yellow: COLORS.temperature.yellow,
  orange: COLORS.temperature.orange,
  red: COLORS.temperature.red,
};

const SIZES = { sm: 32, md: 60, lg: 120 } as const;

type Size = keyof typeof SIZES;

interface TemperatureGaugeProps {
  temperature: Temperature;
  size?: Size;
  label?: string;
  /** When true, show a subtle pulse (e.g. for member dots on Circle) */
  pulse?: boolean;
}

export function TemperatureGauge({ temperature, size = 'md', label, pulse = false }: TemperatureGaugeProps) {
  const color = TEMP_COLORS[temperature];
  const dim = SIZES[size];
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 6 : 4;
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.55,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  useEffect(() => {
    if (!pulse) {
      pulseScale.setValue(1);
      return;
    }
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    p.start();
    return () => p.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: dim, height: dim },
        pulse && { transform: [{ scale: pulseScale }] },
      ]}
    >
      <Animated.View
        style={[
          styles.ring,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnim,
            shadowRadius: size === 'lg' ? 12 : 8,
            elevation: 4,
          },
        ]}
      />
      {label !== undefined && (
        <Text
          style={[
            styles.label,
            size === 'lg' && styles.labelLg,
            size === 'sm' && styles.labelSm,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  labelLg: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  labelSm: {
    marginTop: 2,
    fontSize: 10,
  },
});
