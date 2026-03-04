import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../lib/constants';
import { TEMPERATURE_COLORS } from '../../utils/gaugeHelpers';
import type { Temperature } from '../../stores/circleStore';

// Use unified temperature colors from gaugeHelpers
const TEMP_COLORS: Record<Temperature, string> = TEMPERATURE_COLORS;

const SIZES = { sm: 32, md: 60, lg: 120 } as const;

type Size = keyof typeof SIZES;

interface TemperatureGaugeProps {
  temperature: Temperature;
  size?: Size;
  label?: string;
  /** When true, show a subtle pulse. Auto-enabled for orange/red. */
  pulse?: boolean;
  /** When true, disable auto-pulse for orange/red */
  noPulse?: boolean;
}

export function TemperatureGauge({ temperature, size = 'md', label, pulse, noPulse = false }: TemperatureGaugeProps) {
  const color = TEMP_COLORS[temperature];
  const dim = SIZES[size];
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 6 : 4;
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const blinkOpacity = useRef(new Animated.Value(1)).current;
  
  // Auto-pulse for orange/red (needs attention) unless disabled
  const needsAttention = temperature === 'orange' || temperature === 'red';
  const shouldPulse = pulse ?? (!noPulse && needsAttention);
  const isUrgent = temperature === 'red';

  // Glow animation (always on)
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: needsAttention ? 0.7 : 0.55,
          duration: isUrgent ? 1000 : 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: isUrgent ? 1000 : 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, [needsAttention, isUrgent]);

  // Scale pulse animation
  useEffect(() => {
    if (!shouldPulse) {
      pulseScale.setValue(1);
      return;
    }
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { 
          toValue: isUrgent ? 1.12 : 1.08, 
          duration: isUrgent ? 800 : 1200, 
          useNativeDriver: true 
        }),
        Animated.timing(pulseScale, { 
          toValue: 1, 
          duration: isUrgent ? 800 : 1200, 
          useNativeDriver: true 
        }),
      ])
    );
    p.start();
    return () => p.stop();
  }, [shouldPulse, isUrgent]);

  // Blink animation for red (urgent)
  useEffect(() => {
    if (!isUrgent) {
      blinkOpacity.setValue(1);
      return;
    }
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkOpacity, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [isUrgent]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: dim, height: dim },
        shouldPulse && { transform: [{ scale: pulseScale }] },
        isUrgent && { opacity: blinkOpacity },
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
            shadowRadius: needsAttention ? (size === 'lg' ? 16 : 12) : (size === 'lg' ? 12 : 8),
            elevation: needsAttention ? 8 : 4,
          },
        ]}
      />
      {label !== undefined && (
        <Text
          style={[
            styles.label,
            size === 'lg' && styles.labelLg,
            size === 'sm' && styles.labelSm,
            needsAttention && { color: color },
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
