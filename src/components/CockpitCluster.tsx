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
import { getGaugeColor, getOverallStatusLabel, GAUGE_CONFIG } from '../utils/gaugeHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout constants
const CLUSTER_SIZE = Math.min(SCREEN_WIDTH - 48, 340);
const CENTER_SIZE = 100;
const GAUGE_SIZE = 72;
const GAUGE_RADIUS = (CLUSTER_SIZE - GAUGE_SIZE) / 2 - 8; // Distance from center to gauge centers

const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const TEXT_MUTED = '#55556A';
const CARD_BG = '#111118';
const ACCENT = '#7C4DFF';

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

// Animated glow component for gauges
function GaugeGlow({ color, intensity, size }: { color: string; intensity: number; size: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Pulse animation for attention (low values)
    if (intensity < 40 && intensity >= 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [intensity]);
  
  if (intensity < 0) return null;
  
  const opacity = Math.min(0.6, (intensity / 100) * 0.4 + 0.2);
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 20,
        height: size + 20,
        borderRadius: (size + 20) / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale: pulseAnim }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
      }}
    />
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
}

export function CockpitCluster({ 
  gaugeValues, 
  overall, 
  onCenterPress,
  onGaugePress 
}: CockpitClusterProps) {
  const router = useRouter();
  const centerPulse = useRef(new Animated.Value(1)).current;
  
  const overallLabel = getOverallStatusLabel(overall);
  const ringColor = overall < 0 ? TEXT_MUTED : getGaugeColor(overall);
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
      {/* Energy flow lines from center to each gauge */}
      <View style={styles.linesContainer}>
        {GAUGE_POSITIONS.map(({ key, angle }) => {
          const gaugeValue = gaugeValues[key as keyof typeof gaugeValues];
          const lineColor = gaugeValue >= 0 ? getGaugeColor(gaugeValue) : TEXT_MUTED;
          const opacity = gaugeValue >= 0 ? 0.5 : 0.15;
          const lineWidth = gaugeValue >= 50 ? 3 : 2;
          const radians = (angle * Math.PI) / 180;
          const lineLength = GAUGE_RADIUS - CENTER_SIZE / 2 - GAUGE_SIZE / 2 + 10;
          
          return (
            <View
              key={`line-${key}`}
              style={[
                styles.connectionLine,
                {
                  width: lineLength,
                  height: lineWidth,
                  backgroundColor: lineColor,
                  opacity,
                  shadowColor: lineColor,
                  shadowOpacity: gaugeValue >= 0 ? 0.5 : 0,
                  shadowRadius: 4,
                  transform: [
                    { translateX: -lineLength / 2 },
                    { rotate: `${angle + 90}deg` },
                    { translateX: lineLength / 2 + CENTER_SIZE / 2 - 5 },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

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
            <Text style={[styles.centerValue, { color: ringColor }]}>{overall}</Text>
            <Text style={styles.centerLabel}>{overallLabel}</Text>
          </>
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={28} color={TEXT_MUTED} />
            <Text style={styles.centerLabel}>Check In</Text>
          </>
        )}
      </Pressable>

      {/* 6 Gauge Circles */}
      {GAUGE_POSITIONS.map(({ key, angle }) => {
        const gaugeValue = gaugeValues[key as keyof typeof gaugeValues];
        const GaugeComponent = GAUGE_COMPONENTS[key];
        const config = GAUGE_CONFIG[key as keyof typeof GAUGE_CONFIG];
        const gaugeColor = gaugeValue >= 0 ? getGaugeColor(gaugeValue) : TEXT_MUTED;
        
        // Calculate position
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * GAUGE_RADIUS;
        const y = Math.sin(radians) * GAUGE_RADIUS;

        return (
          <View
            key={key}
            style={{
              position: 'absolute',
              left: CLUSTER_SIZE / 2 + x - GAUGE_SIZE / 2 - 10,
              top: CLUSTER_SIZE / 2 + y - GAUGE_SIZE / 2 - 10,
              width: GAUGE_SIZE + 20,
              height: GAUGE_SIZE + 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glow layer */}
            <GaugeGlow color={gaugeColor} intensity={gaugeValue} size={GAUGE_SIZE} />
            
            {/* Gauge bubble */}
            <Pressable
              style={({ pressed }) => [
                styles.gaugeBubble,
                {
                  borderColor: gaugeValue >= 0 ? gaugeColor + '80' : TEXT_MUTED + '30',
                  shadowColor: gaugeColor,
                  shadowOpacity: gaugeValue >= 0 ? 0.4 : 0,
                  shadowRadius: 8,
                },
                pressed && styles.gaugeBubblePressed,
              ]}
              onPress={() => handleGaugePress(key)}
            >
              <GaugeComponent value={gaugeValue} size={36} />
              <Text style={[styles.gaugeLabel, { color: gaugeColor }]}>
                {config.label.slice(0, 4).toUpperCase()}
              </Text>
              {gaugeValue >= 0 && (
                <Text style={[styles.gaugeValue, { color: gaugeColor }]}>{gaugeValue}</Text>
              )}
            </Pressable>
          </View>
        );
      })}

      {/* Status hint below */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {overall >= 0 
            ? `${activeCount}/6 systems online • ${overallLabel}`
            : '⬤ Tap center to run diagnostics'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CLUSTER_SIZE,
    height: CLUSTER_SIZE + 40, // Extra space for hint
    alignSelf: 'center',
    position: 'relative',
  },
  linesContainer: {
    position: 'absolute',
    width: CLUSTER_SIZE,
    height: CLUSTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionLine: {
    position: 'absolute',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  centerGlow: {
    position: 'absolute',
    width: CENTER_SIZE + 40,
    height: CENTER_SIZE + 40,
    borderRadius: (CENTER_SIZE + 40) / 2,
    left: CLUSTER_SIZE / 2 - (CENTER_SIZE + 40) / 2,
    top: CLUSTER_SIZE / 2 - (CENTER_SIZE + 40) / 2,
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
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
  },
  gaugeBubblePressed: {
    backgroundColor: '#1a1a24',
    transform: [{ scale: 0.94 }],
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  gaugeValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  hintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
});

export default CockpitCluster;
