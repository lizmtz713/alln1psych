/**
 * CockpitCluster — The visual centerpiece of InGauge
 * 
 * A hexagonal arrangement of 6 gauge circles surrounding a central status ring.
 * Tesla/Rivian inspired cockpit aesthetic with glows, gradients, and premium feel.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BodyGauge, StateGauge, EmotionGauge, ConnectionGauge, DirectionGauge, AlignmentGauge } from './gauges';
import { getGaugeColor, getOverallStatusLabel, GAUGE_CONFIG } from '../utils/gaugeHelpers';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { COLORS } from '../lib/constants';

const AMBER = COLORS.amber;
const AMBER_GLOW = COLORS.amberGlow;

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
  
  // State for pre-conversation check modal
  const [showPreConvoModal, setShowPreConvoModal] = useState(false);
  
  // Get system mode for highlighting triggered gauges
  const systemMode = useCockpitStore((s) => s.systemMode);
  const stabilizationTriggers = useCockpitStore((s) => s.stabilizationTriggers);
  const centerScore = useCockpitStore((s) => s.centerScore);
  
  // Use weighted center score when available, fall back to simple average
  const displayScore = centerScore >= 0 ? centerScore : overall;
  const overallLabel = getOverallStatusLabel(displayScore);
  const isStabilization = systemMode === 'stabilization';
  const ringColor = isStabilization 
    ? AMBER 
    : (displayScore < 0 ? (TEXT_MUTED + '90') : getGaugeColor(displayScore));
  const activeCount = Object.values(gaugeValues).filter(v => v >= 0).length;
  
  // Check if State is low (for pre-conversation check offer)
  const isStateLow = gaugeValues.state >= 0 && gaugeValues.state < 50;
  
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
    
    // If tapping State gauge when low, show pre-conversation check option
    if (gauge === 'state' && isStateLow) {
      setShowPreConvoModal(true);
      return;
    }
    
    if (onGaugePress) {
      onGaugePress(gauge);
    } else {
      router.push({ pathname: '/(modals)/gauge-detail', params: { gauge } });
    }
  };
  
  const handlePreConvoCheck = () => {
    setShowPreConvoModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/pre-conversation-check');
  };
  
  const handleGaugeDetail = () => {
    setShowPreConvoModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(modals)/gauge-detail', params: { gauge: 'state' } });
  };
  
  const handleQuickReset = () => {
    setShowPreConvoModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/quick-reset');
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
        const gaugeColor = gaugeValue >= 0 ? getGaugeColor(gaugeValue) : '#E0E0E0';
        
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
                  borderColor: gaugeValue >= 0 ? gaugeColor : 'rgba(255,255,255,0.5)',
                  shadowColor: gaugeColor,
                  shadowOpacity: gaugeValue >= 0 ? 0.4 : 0,
                  shadowRadius: 8,
                },
                pressed && styles.gaugeBubblePressed,
              ]}
              onPress={() => handleGaugePress(key)}
            >
              {(key === 'body' && bodyBiometricSource) || (key === 'state' && stateBiometricSource) ? (
                <View style={styles.biometricBadgeWrap}>
                  <BiometricIndicator
                    source={key === 'body' ? bodyBiometricSource! : stateBiometricSource!}
                    fresh={key === 'body' ? bodyBiometricFresh : stateBiometricFresh}
                    size={14}
                  />
                </View>
              ) : null}
              <GaugeComponent value={gaugeValue} size={36} />
              <Text style={[styles.gaugeLabel, { color: gaugeColor }]}>
                {config.label.toUpperCase()}
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
            ? `${activeCount}/6 online • ${overallLabel}`
            : 'Tap center to check in'
          }
        </Text>
      </View>
      
      {/* Pre-Conversation Check Modal — shows when tapping low State gauge */}
      <Modal
        visible={showPreConvoModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowPreConvoModal(false)}
      >
        <Pressable 
          style={styles.preConvoOverlay} 
          onPress={() => setShowPreConvoModal(false)}
        >
          <View style={styles.preConvoCard}>
            <View style={styles.preConvoIcon}>
              <Ionicons name="pulse-outline" size={24} color={AMBER} />
            </View>
            
            <Text style={styles.preConvoTitle}>Your State is {gaugeValues.state}</Text>
            <Text style={styles.preConvoSubtitle}>
              Preparing for a difficult conversation?
            </Text>
            
            <View style={styles.preConvoActions}>
              <Pressable style={styles.preConvoBtn} onPress={handlePreConvoCheck}>
                <Ionicons name="chatbubbles-outline" size={18} color={AMBER} />
                <Text style={styles.preConvoBtnText}>Pre-Conversation Check</Text>
              </Pressable>
              
              <Pressable style={styles.preConvoBtn} onPress={handleQuickReset}>
                <Ionicons name="refresh" size={18} color={ACCENT} />
                <Text style={[styles.preConvoBtnText, { color: ACCENT }]}>Quick Reset (2 min)</Text>
              </Pressable>
              
              <Pressable style={styles.preConvoSecondaryBtn} onPress={handleGaugeDetail}>
                <Text style={styles.preConvoSecondaryText}>View State Details</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  
  // Pre-Conversation Check Modal
  preConvoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  preConvoCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  preConvoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AMBER + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  preConvoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 6,
    textAlign: 'center',
  },
  preConvoSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  preConvoActions: {
    width: '100%',
    gap: 10,
  },
  preConvoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  preConvoBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: AMBER,
  },
  preConvoSecondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  preConvoSecondaryText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});

export default CockpitCluster;
