/**
 * GlanceWidget — See your state in <1 second
 * 
 * PRINCIPLES APPLIED:
 * - Glance first (information without interaction)
 * - Temperature gradient (instant emotional read)
 * - Minimal cognitive load (one number, one color)
 * 
 * For: Lock screen widgets, home screen widgets, watch complications
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, APP_CONFIG } from '../lib/constants';

type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface GlanceWidgetProps {
  // Full 6-gauge data
  gauges?: {
    body: number;
    state: number;
    emotion: number;
    connection: number;
    direction: number;
    alignment: number;
  };
  // Or single system score
  systemScore?: number;
  // Widget size
  size?: 'small' | 'medium' | 'large';
  // On press handler
  onPress?: () => void;
}

// Get gradient colors based on score
function getGradient(score: number): [string, string] {
  if (score < 0) return [COLORS.textMuted, COLORS.textDim];
  if (score < 30) return [COLORS.warning, '#F4A98C'];
  if (score < 50) return [COLORS.amber, '#E0C090'];
  if (score < 70) return [COLORS.gauges.state, '#5BB8B0'];
  return [COLORS.success, '#7BE8A8'];
}

// Get status text
function getStatusText(score: number): string {
  if (score < 0) return 'Check in';
  if (score < 30) return 'Pay attention';
  if (score < 50) return 'Needs care';
  if (score < 70) return 'Stable';
  return 'Thriving';
}

// Calculate system score from gauges
function calculateSystemScore(gauges: GlanceWidgetProps['gauges']): number {
  if (!gauges) return -1;
  const values = Object.values(gauges).filter(v => v >= 0);
  if (values.length === 0) return -1;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Small widget (2x2) — Just the score
 */
export function GlanceWidgetSmall({ gauges, systemScore, onPress }: GlanceWidgetProps) {
  const score = systemScore ?? calculateSystemScore(gauges);
  const gradient = getGradient(score);
  
  return (
    <Pressable onPress={onPress} style={styles.smallContainer}>
      <LinearGradient
        colors={gradient}
        style={styles.smallGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.smallScore}>
          {score >= 0 ? score : '—'}
        </Text>
        <Text style={styles.smallLabel}>{APP_CONFIG.name}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/**
 * Medium widget (4x2) — Score + status
 */
export function GlanceWidgetMedium({ gauges, systemScore, onPress }: GlanceWidgetProps) {
  const score = systemScore ?? calculateSystemScore(gauges);
  const gradient = getGradient(score);
  const status = getStatusText(score);
  
  return (
    <Pressable onPress={onPress} style={styles.mediumContainer}>
      <LinearGradient
        colors={[`${gradient[0]}20`, `${gradient[1]}10`]}
        style={styles.mediumGradient}
      >
        <View style={styles.mediumLeft}>
          <Text style={[styles.mediumScore, { color: gradient[0] }]}>
            {score >= 0 ? score : '—'}
          </Text>
          <Text style={styles.mediumLabel}>System</Text>
        </View>
        <View style={styles.mediumRight}>
          <Text style={[styles.mediumStatus, { color: gradient[0] }]}>
            {status}
          </Text>
          <Text style={styles.mediumHint}>
            {score >= 0 ? 'Tap to see details' : 'Tap to check in'}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/**
 * Large widget (4x4) — All 6 gauges at a glance
 */
export function GlanceWidgetLarge({ gauges, onPress }: GlanceWidgetProps) {
  const score = calculateSystemScore(gauges);
  const gradient = getGradient(score);
  
  const gaugeList: { key: GaugeName; label: string; emoji: string }[] = [
    { key: 'body', label: 'Body', emoji: '🫀' },
    { key: 'state', label: 'State', emoji: '🌊' },
    { key: 'emotion', label: 'Emotion', emoji: '💫' },
    { key: 'connection', label: 'Connection', emoji: '🤝' },
    { key: 'direction', label: 'Direction', emoji: '🧭' },
    { key: 'alignment', label: 'Alignment', emoji: '⭐' },
  ];
  
  return (
    <Pressable onPress={onPress} style={styles.largeContainer}>
      <LinearGradient
        colors={[`${gradient[0]}15`, `${gradient[1]}05`]}
        style={styles.largeGradient}
      >
        {/* Header */}
        <View style={styles.largeHeader}>
          <Text style={[styles.largeScore, { color: gradient[0] }]}>
            {score >= 0 ? score : '—'}
          </Text>
          <View>
            <Text style={styles.largeTitle}>{APP_CONFIG.name}</Text>
            <Text style={[styles.largeStatus, { color: gradient[0] }]}>
              {getStatusText(score)}
            </Text>
          </View>
        </View>
        
        {/* Gauge grid */}
        <View style={styles.largeGrid}>
          {gaugeList.map(({ key, label, emoji }) => {
            const value = gauges?.[key] ?? -1;
            const gaugeGradient = getGradient(value);
            return (
              <View key={key} style={styles.largeGaugeItem}>
                <Text style={styles.largeGaugeEmoji}>{emoji}</Text>
                <Text style={[styles.largeGaugeValue, { color: gaugeGradient[0] }]}>
                  {value >= 0 ? value : '—'}
                </Text>
                <Text style={styles.largeGaugeLabel}>{label}</Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/**
 * Inline mini gauge — For use in lists, cards, etc.
 */
export function MiniGauge({
  value,
  label,
  color,
}: {
  value: number;
  label?: string;
  color?: string;
}) {
  const gradient = getGradient(value);
  const displayColor = color || gradient[0];
  
  return (
    <View style={styles.miniContainer}>
      <View style={[styles.miniDot, { backgroundColor: displayColor }]} />
      <Text style={[styles.miniValue, { color: displayColor }]}>
        {value >= 0 ? value : '—'}
      </Text>
      {label && <Text style={styles.miniLabel}>{label}</Text>}
    </View>
  );
}

/**
 * Temperature bar — Horizontal gradient showing system state
 */
export function TemperatureBar({
  score,
  height = 8,
}: {
  score: number;
  height?: number;
}) {
  const gradient = getGradient(score);
  const fillPercent = score >= 0 ? score : 0;
  
  return (
    <View style={[styles.tempBarContainer, { height }]}>
      <View style={styles.tempBarBg} />
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.tempBarFill,
          { width: `${fillPercent}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Small widget (2x2)
  smallContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  smallGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallScore: {
    ...TYPOGRAPHY.scoreMd,
    color: COLORS.text,
  },
  smallLabel: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  // Medium widget (4x2)
  mediumContainer: {
    width: 170,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  mediumGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  mediumLeft: {
    marginRight: SPACING.md,
  },
  mediumScore: {
    ...TYPOGRAPHY.scoreSm,
  },
  mediumLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  mediumRight: {
    flex: 1,
  },
  mediumStatus: {
    ...TYPOGRAPHY.labelMd,
    marginBottom: 2,
  },
  mediumHint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  
  // Large widget (4x4)
  largeContainer: {
    width: 170,
    height: 170,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  largeGradient: {
    flex: 1,
    padding: SPACING.md,
  },
  largeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  largeScore: {
    ...TYPOGRAPHY.scoreSm,
    marginRight: SPACING.sm,
  },
  largeTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text,
  },
  largeStatus: {
    ...TYPOGRAPHY.labelSm,
  },
  largeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  largeGaugeItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  largeGaugeEmoji: {
    fontSize: 16,
  },
  largeGaugeValue: {
    ...TYPOGRAPHY.labelLg,
  },
  largeGaugeLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  
  // Mini gauge
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniValue: {
    ...TYPOGRAPHY.labelMd,
  },
  miniLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  
  // Temperature bar
  tempBarContainer: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tempBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
  },
  tempBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default {
  Small: GlanceWidgetSmall,
  Medium: GlanceWidgetMedium,
  Large: GlanceWidgetLarge,
  Mini: MiniGauge,
  TemperatureBar,
};
