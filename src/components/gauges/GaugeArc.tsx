/**
 * GaugeArc — Oura-inspired arc ring visualization
 * 
 * Design: Clean circular arc that fills based on score
 * - Background arc (subtle gray)
 * - Foreground arc (gauge color with gradient)
 * - Big centered score number
 * - Small label below
 * 
 * Based on ingauge-DESIGN-SYSTEM-SPEC.md
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, ANIMATION, SPACING } from '../../lib/constants';

type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface GaugeArcProps {
  value: number;                    // 0-100 score
  gauge: GaugeName;                 // Which gauge (for color)
  size?: number;                    // Overall size
  strokeWidth?: number;             // Arc thickness
  label?: string;                   // Label below score (e.g., "STATE")
  showValue?: boolean;              // Show the number
  animated?: boolean;               // Animate on mount
  alertText?: string;               // "PAY ATTENTION" style text
}

// Arc path generator
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Get alert status based on score
function getAlertStatus(value: number): { text: string; color: string } | null {
  if (value < 0) return null;
  if (value < 30) return { text: 'PAY ATTENTION', color: COLORS.warning };
  if (value < 50) return { text: 'NEEDS CARE', color: COLORS.amber };
  return null;
}

export function GaugeArc({
  value,
  gauge,
  size = 180,
  strokeWidth = 10,
  label,
  showValue = true,
  animated = true,
  alertText,
}: GaugeArcProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const isSet = value >= 0;
  const displayValue = isSet ? Math.round(value) : '--';
  const gaugeColor = COLORS.gauges[gauge];
  const gradientColors = COLORS.gradients[gauge] || [gaugeColor, gaugeColor];
  
  // Arc geometry
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 8; // Padding
  const startAngle = 135;  // Bottom-left
  const endAngle = 405;    // Bottom-right (270° arc)
  const totalArc = endAngle - startAngle;
  
  // Calculate fill angle based on value
  const fillPercent = isSet ? value / 100 : 0;
  const fillAngle = startAngle + (totalArc * fillPercent);
  
  // Background arc (full)
  const bgPath = describeArc(center, center, radius, startAngle, endAngle);
  
  // Foreground arc (filled portion)
  const fgPath = fillPercent > 0 
    ? describeArc(center, center, radius, startAngle, fillAngle)
    : '';
  
  // Animation
  useEffect(() => {
    if (animated && isSet) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: ANIMATION.gaugeFill,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [value]);
  
  // Get alert status
  const alert = alertText 
    ? { text: alertText, color: COLORS.warning }
    : getAlertStatus(value);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={`gradient-${gauge}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        
        {/* Background arc */}
        <Path
          d={bgPath}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Foreground arc (filled) */}
        {fgPath && (
          <Path
            d={fgPath}
            stroke={`url(#gradient-${gauge})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Alert text above score */}
        {alert && (
          <Text style={[styles.alertText, { color: alert.color }]}>
            {alert.text}
          </Text>
        )}
        
        {/* Big score number */}
        {showValue && (
          <Text style={[
            styles.scoreText,
            { color: isSet ? COLORS.text : COLORS.textMuted }
          ]}>
            {displayValue}
          </Text>
        )}
        
        {/* Label below */}
        {label && (
          <Text style={[styles.labelText, { color: gaugeColor }]}>
            {label.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
}

// Compact version for cockpit grid
export function GaugeArcCompact({
  value,
  gauge,
  label,
}: {
  value: number;
  gauge: GaugeName;
  label?: string;
}) {
  return (
    <GaugeArc
      value={value}
      gauge={gauge}
      size={100}
      strokeWidth={6}
      label={label}
      showValue={true}
      animated={false}
    />
  );
}

// Horizontal row of mini gauges (like Oura's top bar)
export function GaugeRow({
  values,
}: {
  values: {
    body?: number;
    state?: number;
    emotion?: number;
    connection?: number;
    direction?: number;
    alignment?: number;
  };
}) {
  const gauges: { key: GaugeName; label: string }[] = [
    { key: 'body', label: 'Body' },
    { key: 'state', label: 'State' },
    { key: 'emotion', label: 'Emotion' },
    { key: 'connection', label: 'Connection' },
    { key: 'direction', label: 'Direction' },
    { key: 'alignment', label: 'Alignment' },
  ];
  
  return (
    <View style={styles.gaugeRow}>
      {gauges.map(({ key, label }) => {
        const value = values[key] ?? -1;
        return (
          <View key={key} style={styles.gaugeRowItem}>
            <Text style={[styles.rowScore, { color: COLORS.gauges[key] }]}>
              {value >= 0 ? Math.round(value) : '--'}
            </Text>
            <Text style={styles.rowLabel}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20, // Offset for arc opening at bottom
  },
  scoreText: {
    ...TYPOGRAPHY.scoreLg,
  },
  labelText: {
    ...TYPOGRAPHY.labelMd,
    marginTop: SPACING.xs,
  },
  alertText: {
    ...TYPOGRAPHY.alert,
    marginBottom: SPACING.xs,
  },
  
  // Gauge row styles (Oura-style top bar)
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  gaugeRowItem: {
    alignItems: 'center',
    flex: 1,
  },
  rowScore: {
    ...TYPOGRAPHY.scoreSm,
    marginBottom: 2,
  },
  rowLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
  },
});

export default GaugeArc;
