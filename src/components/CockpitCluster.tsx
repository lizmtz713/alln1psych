/**
 * CockpitCluster — The visual centerpiece of InGauge
 * 
 * A hexagonal arrangement of 6 gauge circles surrounding a central status ring.
 * Tesla/Rivian inspired cockpit aesthetic with glows, gradients, and premium feel.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BodyGauge, StateGauge, EmotionGauge, ConnectionGauge, DirectionGauge, AlignmentGauge } from './gauges';
import { getGaugeColor, getSystemScoreLabel, GAUGE_CONFIG } from '../utils/gaugeHelpers';
import { BiometricIndicator, type BiometricSource } from './BiometricIndicator';
import { COLORS, TYPOGRAPHY } from '../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout constants — hexagonal cockpit with breathing room (gauges not compressed)
const CLUSTER_SIZE = Math.min(SCREEN_WIDTH - 32, 360);
const CENTER_SIZE = 120;
const GAUGE_SIZE = 72;
const GAUGE_RADIUS = (CLUSTER_SIZE - GAUGE_SIZE) / 2 - 4; // More space between center and gauge circles

const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const CARD_BG = COLORS.surface;
const ACCENT = COLORS.accent;

const GAUGE_COMPONENTS: Record<string, React.FC<{ value: number; size?: number }>> = {
  body: BodyGauge,
  state: StateGauge,
  emotion: EmotionGauge,
  connection: ConnectionGauge,
  direction: DirectionGauge,
  alignment: AlignmentGauge,
};

// Hex positions: top, top-right, bottom-right, bottom, bottom-left, top-left
// Angles: -90°, -30°, 30°, 90°, 150°, 210° (starting from top, going clockwise)
const GAUGE_POSITIONS = [
  { key: 'body', angle: -90 },      // Top
  { key: 'state', angle: -30 },     // Top-right
  { key: 'emotion', angle: 30 },    // Bottom-right
  { key: 'connection', angle: 90 }, // Bottom
  { key: 'direction', angle: 150 }, // Bottom-left
  { key: 'alignment', angle: 210 }, // Top-left
];

// Animated gauge ring — pulses/blinks for low values
function AnimatedGaugeRing({ 
  value, 
  color, 
  size, 
  children 
}: { 
  value: number; 
  color: string; 
  size: number; 
  children: React.ReactNode;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  
  const isSet = value >= 0;
  const needsAttention = isSet && value < 50;
  const isUrgent = isSet && value < 25;
  
  useEffect(() => {
    if (!needsAttention) {
      pulseAnim.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { 
          toValue: isUrgent ? 1.1 : 1.06, 
          duration: isUrgent ? 600 : 1000, 
          useNativeDriver: true 
        }),
        Animated.timing(pulseAnim, { 
          toValue: 1, 
          duration: isUrgent ? 600 : 1000, 
          useNativeDriver: true 
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [needsAttention, isUrgent]);
  
  useEffect(() => {
    if (!isUrgent) {
      blinkAnim.setValue(1);
      return;
    }
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.5, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [isUrgent]);
  
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 4,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        transform: [{ scale: pulseAnim }],
        opacity: blinkAnim,
        shadowColor: needsAttention ? color : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: needsAttention ? 0.6 : 0,
        shadowRadius: 10,
      }}
    >
      {children}
    </Animated.View>
  );
}

interface CockpitClusterProps {
  gaugeValues: {
    body: number;
    state: number;
    emotion: number;
    connection: number;
    direction: number;
    alignment: number;
  };
  overall: number;
  onCenterPress?: () => void;
  onGaugePress?: (gauge: string) => void;
  /** When set, show Oura/Apple Health badge on Body gauge */
  bodyBiometricSource?: BiometricSource | null;
  /** When set, show Oura/Apple Health badge on State gauge */
  stateBiometricSource?: BiometricSource | null;
  /** Pulse badge when Body data is fresh (e.g. synced in last 15 min) */
  bodyBiometricFresh?: boolean;
  /** Pulse badge when State data is fresh */
  stateBiometricFresh?: boolean;
}

export function CockpitCluster({ 
  gaugeValues, 
  overall, 
  onCenterPress,
  onGaugePress,
  bodyBiometricSource,
  stateBiometricSource,
  bodyBiometricFresh = false,
  stateBiometricFresh = false,
}: CockpitClusterProps) {
  const router = useRouter();
  const centerPulse = useRef(new Animated.Value(1)).current;
  
  const overallLabel = getSystemScoreLabel(overall);
  const ringColor = overall < 0 ? (TEXT_MUTED + '90') : getGaugeColor(overall);
  const activeCount = Object.values(gaugeValues).filter(v => v >= 0).length;

  // Subtle breathing animation for center ring
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
        Animated.timing(centerPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCenterPress) {
      onCenterPress();
    } else {
      router.push('/(modals)/cockpit-checkin');
    }
  };

  const handleGaugePress = (gauge: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onGaugePress) {
      onGaugePress(gauge);
    } else {
      router.push({ pathname: '/(modals)/gauge-detail', params: { gauge } });
    }
  };

  return (
    <View style={styles.container}>
      {/* Center Status Ring with Glow */}
      <Animated.View
        style={[
          styles.centerGlow,
          {
            backgroundColor: overall >= 0 ? ringColor : 'transparent',
            opacity: overall >= 0 ? 0.15 : 0,
            transform: [{ scale: centerPulse }],
          },
        ]}
      />
      <Pressable
        style={({ pressed }) => [
          styles.centerRing,
          { borderColor: ringColor },
          pressed && styles.centerRingPressed,
        ]}
        onPress={handleCenterPress}
      >
        {overall >= 0 ? (
          <>
            <Text style={styles.centerTitle}>System</Text>
            <Text style={[styles.centerValue, { color: ringColor }]}>{Math.round(overall)}</Text>
            <Text style={styles.centerLabel}>{overallLabel}</Text>
          </>
        ) : (
          <>
            <Text style={styles.centerTitle}>System</Text>
            <Ionicons name="add-circle-outline" size={28} color={TEXT_MUTED} />
            <Text style={styles.centerLabel}>Check In</Text>
          </>
        )}
      </Pressable>

      {/* 6 Gauge Circles — Simplified: single ring + value + label */}
      {GAUGE_POSITIONS.map(({ key, angle }) => {
        const gaugeValue = gaugeValues[key as keyof typeof gaugeValues];
        const config = GAUGE_CONFIG[key as keyof typeof GAUGE_CONFIG];
        const isSet = gaugeValue >= 0;
        const gaugeColor = isSet ? getGaugeColor(gaugeValue) : '#3A3A4A';
        
        // Calculate position
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * GAUGE_RADIUS;
        const y = Math.sin(radians) * GAUGE_RADIUS;

        return (
          <Pressable
            key={key}
            style={({ pressed }) => ({
              position: 'absolute',
              left: CLUSTER_SIZE / 2 + x - GAUGE_SIZE / 2,
              top: CLUSTER_SIZE / 2 + y - GAUGE_SIZE / 2,
              width: GAUGE_SIZE,
              height: GAUGE_SIZE + 18,
              alignItems: 'center',
              justifyContent: 'flex-start',
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => handleGaugePress(key)}
          >
            {/* Animated ring — pulses/blinks for low values */}
            <AnimatedGaugeRing value={gaugeValue} color={gaugeColor} size={GAUGE_SIZE}>
              <Text style={{
                fontSize: 22,
                fontWeight: '700',
                color: isSet ? gaugeColor : '#666',
              }}>
                {isSet ? gaugeValue : '—'}
              </Text>
            </AnimatedGaugeRing>
            {/* Label below */}
            <Text style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: '600',
              color: isSet ? gaugeColor : '#666',
              textTransform: 'capitalize',
            }}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}

      {/* Alert is rendered above the gauge by the parent (Home) so the gauge is never covered. */}

      {/* Status hint below */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {overall >= 0 
            ? `${activeCount}/6 online • ${overallLabel}`
            : 'Tap center to check in'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CLUSTER_SIZE,
    minHeight: CLUSTER_SIZE + 40,
    alignSelf: 'center',
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    width: CENTER_SIZE + 48,
    height: CENTER_SIZE + 48,
    borderRadius: (CENTER_SIZE + 48) / 2,
    left: CLUSTER_SIZE / 2 - (CENTER_SIZE + 48) / 2,
    top: CLUSTER_SIZE / 2 - (CENTER_SIZE + 48) / 2,
  },
  centerRing: {
    position: 'absolute',
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 4,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    left: CLUSTER_SIZE / 2 - CENTER_SIZE / 2,
    top: CLUSTER_SIZE / 2 - CENTER_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  centerRingPressed: {
    backgroundColor: '#1a1a24',
    transform: [{ scale: 0.96 }],
  },
  centerValue: {
    ...TYPOGRAPHY.scoreLg,
    fontVariant: ['tabular-nums'],
  },
  centerTitle: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  centerLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 80,
  },
  gaugeBubble: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    backgroundColor: CARD_BG,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    overflow: 'hidden',
  },
  biometricBadgeWrap: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 1,
  },
  gaugeBubblePressed: {
    backgroundColor: '#1a1a24',
    transform: [{ scale: 0.94 }],
  },
  gaugeLabel: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: 'center',
    position: 'absolute',
    bottom: 4,
  },
  gaugeValueOverlay: {
    position: 'absolute',
    top: 4,
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  gaugeValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  hintContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
});

export default CockpitCluster;
