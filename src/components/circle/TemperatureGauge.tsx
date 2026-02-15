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
}

export function TemperatureGauge({ temperature, size = 'md', label }: TemperatureGaugeProps) {
  const color = TEMP_COLORS[temperature];
  const dim = SIZES[size];
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 6 : 4;
  const radius = (dim - strokeWidth) / 2;
  const colorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [temperature]);

  return (
    <View style={[styles.wrap, { width: dim, height: dim }]}>
      <View
        style={[
          styles.ring,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            shadowColor: color,
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
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
