/**
 * RelationshipRing — Continuous temperature-colored progress ring for Signals.
 * One smooth circle: dim background track + bright colored arc (relationship strength).
 * Color = person temperature; fill = relationship strength; pulse when attention needed.
 * Reusable for cards, detail sheet, and future widget/watch views.
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TEMPERATURE_COLORS } from '../../utils/gaugeHelpers';

export type TemperatureRingColor = 'green' | 'yellow' | 'orange' | 'red' | 'neutral';

const RING_COLORS: Record<TemperatureRingColor, string> = {
  green: TEMPERATURE_COLORS.green,
  yellow: TEMPERATURE_COLORS.yellow,
  orange: TEMPERATURE_COLORS.orange,
  red: TEMPERATURE_COLORS.red,
  /** No shared temperature — relationship completion only */
  neutral: 'rgba(255,255,255,0.5)',
};

/** xs = watch/small widget; sm = cards; md = detail sheet */
const SIZES = { xs: 26, sm: 36, md: 60 } as const;
/** Slightly thicker stroke for xs so arc stays readable on small screens */
const STROKE: Record<keyof typeof SIZES, number> = { xs: 4, sm: 4.5, md: 6 };
type SizeKey = keyof typeof SIZES;

export interface RelationshipRingProps {
  /** Relationship strength 1–5 → fill 20%, 40%, 60%, 80%, 100% */
  relationshipScore: number;
  /** Ring color = person temperature (green / yellow / orange / red) */
  temperatureColor: TemperatureRingColor;
  /** When true, gentle breathing pulse; no harsh flash */
  attentionNeeded?: boolean;
  size?: SizeKey;
  strokeWidth?: number;
}

/** Map relationship score 1–5 to fill ratio 0.2–1.0 */
export function relationshipScoreToFill(score: number): number {
  const s = Math.max(1, Math.min(5, Math.round(score)));
  return s === 5 ? 1 : s === 4 ? 0.8 : s === 3 ? 0.6 : s === 2 ? 0.4 : 0.2;
}

export function RelationshipRing({
  relationshipScore,
  temperatureColor,
  attentionNeeded = false,
  size = 'sm',
  strokeWidth: strokeWidthProp,
}: RelationshipRingProps) {
  const dim = SIZES[size];
  const strokeWidth = strokeWidthProp ?? (STROKE[size] ?? 4);
  const r = (dim - strokeWidth) / 2;
  const cx = dim / 2;
  const circumference = 2 * Math.PI * r;
  const fill = relationshipScoreToFill(relationshipScore);
  const strokeDasharray = `${circumference * fill} ${circumference}`;
  const color = RING_COLORS[temperatureColor] ?? TEMPERATURE_COLORS.yellow;
  const trackColor = 'rgba(255,255,255,0.14)';

  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!attentionNeeded) {
      pulseScale.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [attentionNeeded]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        size !== 'xs' && styles.glow,
        { width: dim, height: dim },
        attentionNeeded && { transform: [{ scale: pulseScale }] },
      ]}
    >
      <Svg width={dim} height={dim} style={styles.svg}>
        {/* Background track — full dim circle */}
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground arc — colored progress; start at 12 o'clock, clockwise */}
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={0}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  svg: {},
});
