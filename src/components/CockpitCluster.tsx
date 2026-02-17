/**
 * CockpitCluster — The visual centerpiece of AllN1 Psych
 * 
 * A hexagonal arrangement of 6 gauge circles surrounding a central status ring.
 * Looks like a cockpit instrument cluster or a logo.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
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
  
  const overallLabel = getOverallStatusLabel(overall);
  const ringColor = overall < 0 ? TEXT_MUTED : getGaugeColor(overall);
  const activeCount = Object.values(gaugeValues).filter(v => v >= 0).length;

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
      {/* Connection lines from center to each gauge */}
      <View style={styles.linesContainer}>
        {GAUGE_POSITIONS.map(({ key, angle }) => {
          const gaugeValue = gaugeValues[key as keyof typeof gaugeValues];
          const lineColor = gaugeValue >= 0 ? getGaugeColor(gaugeValue) + '40' : TEXT_MUTED + '20';
          const radians = (angle * Math.PI) / 180;
          const lineLength = GAUGE_RADIUS - CENTER_SIZE / 2 - GAUGE_SIZE / 2 + 10;
          
          return (
            <View
              key={`line-${key}`}
              style={[
                styles.connectionLine,
                {
                  width: lineLength,
                  backgroundColor: lineColor,
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

      {/* Center Status Ring */}
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
          <Pressable
            key={key}
            style={({ pressed }) => [
              styles.gaugeBubble,
              {
                left: CLUSTER_SIZE / 2 + x - GAUGE_SIZE / 2,
                top: CLUSTER_SIZE / 2 + y - GAUGE_SIZE / 2,
                borderColor: gaugeValue >= 0 ? gaugeColor + '60' : TEXT_MUTED + '30',
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
        );
      })}

      {/* Status hint below */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {overall >= 0 
            ? `${activeCount} of 6 systems checked`
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
    height: 2,
    borderRadius: 1,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  gaugeBubble: {
    position: 'absolute',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    backgroundColor: CARD_BG,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
