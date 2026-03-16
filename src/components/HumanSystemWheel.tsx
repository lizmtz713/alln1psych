/**
 * Human System Wheel — The InGauge mental model in one visual.
 * Explains the Life OS in under 5 seconds: six gauges around YOU, interconnected.
 * Layout (scientifically grounded flow): Alignment (top) → Direction → State → Body → Emotion → Connection.
 * @see docs/MENTAL-MODEL-DIAGRAM.md
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import type { GaugeKey } from '../stores/cockpitStore';
import { COLORS } from '../lib/constants';

/** Order and position (angle in degrees: 0 = right, 90 = down; -90 = top). */
const WHEEL_GAUGES: { key: GaugeKey; label: string; angle: number }[] = [
  { key: 'alignment', label: 'Alignment', angle: -90 },
  { key: 'direction', label: 'Direction', angle: -30 },
  { key: 'state', label: 'State', angle: 30 },
  { key: 'body', label: 'Body', angle: 90 },
  { key: 'emotion', label: 'Emotion', angle: 150 },
  { key: 'connection', label: 'Connection', angle: 210 },
];

const GAUGE_COLORS: Record<GaugeKey, string> = COLORS.gauges;

export interface HumanSystemWheelProps {
  /** Radius of the wheel (distance from center to each gauge). Default 80. */
  radius?: number;
  /** Size of each gauge pill. Default 44. */
  nodeSize?: number;
  /** Center label. Default "YOU". */
  centerLabel?: string;
  /** Show a light ring connecting the gauges. Default true. */
  showRing?: boolean;
  /** Compact mode: smaller nodes and text. */
  compact?: boolean;
  style?: ViewStyle;
}

export function HumanSystemWheel({
  radius = 80,
  nodeSize = 44,
  centerLabel = 'YOU',
  showRing = true,
  compact = false,
  style,
}: HumanSystemWheelProps) {
  const size = radius * 2 + nodeSize * 2;
  const cx = size / 2;
  const cy = size / 2;
  const nodeW = compact ? nodeSize * 0.9 : nodeSize;
  const nodeH = compact ? nodeSize * 0.45 : nodeSize * 0.5;
  const fontSize = compact ? 10 : 12;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      {showRing && (
        <View
          style={[
            styles.ring,
            {
              width: radius * 2 + nodeH,
              height: radius * 2 + nodeH,
              borderRadius: radius + nodeH / 2,
              left: cx - radius - nodeH / 2,
              top: cy - radius - nodeH / 2,
            },
          ]}
        />
      )}
      {WHEEL_GAUGES.map(({ key, label, angle }) => {
        const rad = (angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * radius - nodeW / 2;
        const y = cy + Math.sin(rad) * radius - nodeH / 2;
        const color = GAUGE_COLORS[key] ?? COLORS.text;
        return (
          <View
            key={key}
            style={[
              styles.node,
              {
                left: x,
                top: y,
                width: nodeW,
                height: nodeH,
                borderRadius: nodeH / 2,
                borderColor: color,
                backgroundColor: color + '18',
              },
            ]}
          >
            <Text style={[styles.nodeLabel, { fontSize, color }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
      <View
        style={[
          styles.center,
          {
            width: nodeSize * 1.1,
            height: nodeSize * 1.1,
            borderRadius: (nodeSize * 1.1) / 2,
            left: cx - (nodeSize * 1.1) / 2,
            top: cy - (nodeSize * 1.1) / 2,
          },
        ]}
      >
        <Text style={[styles.centerLabel, compact && styles.centerLabelCompact]}>{centerLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.textMuted + '40',
  },
  node: {
    position: 'absolute',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  nodeLabel: {
    fontWeight: '700',
  },
  center: {
    position: 'absolute',
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  centerLabelCompact: {
    fontSize: 11,
  },
});
