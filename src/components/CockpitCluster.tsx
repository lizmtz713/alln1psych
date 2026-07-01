/**
 * CockpitCluster — Human System Dashboard (PHOSM)
 *
 * Scientific model: Alignment → YOU → (Connection | Direction) → Emotion → State → Body.
 * Animated center-to-center connection lines. Vertical tool columns. Bottom signal/actions.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import { BodyGauge, StateGauge, EmotionGauge, ConnectionGauge, DirectionGauge, AlignmentGauge } from './gauges';
import { getGaugeColor, getSystemScoreLabel, GAUGE_CONFIG } from '../utils/gaugeHelpers';
import { BiometricIndicator, type BiometricSource } from './BiometricIndicator';
import { COLORS, TYPOGRAPHY } from '../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cluster is the anchor — fixed width, always centered
const CLUSTER_WIDTH = Math.min(SCREEN_WIDTH - 48, 320);
const GAUGE_SIZE = 60;
const CENTER_SIZE = 100; // Slightly larger for better YOU/score readability
const YOU_RADIUS = CENTER_SIZE / 2;
// Connection/Direction never overlap YOU — +20px outward from previous (no intersection)
const CONNECTION_DIRECTION_OFFSET = Math.round(1.75 * YOU_RADIUS) + 20; // 100

// Vertical rhythm: more Alignment→YOU; even Emotion→State→Body cascade
const ALIGNMENT_CENTER_Y = 38;
const ROW_1_CENTER_Y = 154;   // YOU row (+10px below Alignment)
const CASCADE_GAP = 100;      // ~24px between Emotion/State/Body for readability
const EMOTION_CENTER_Y = ROW_1_CENTER_Y + 88;
const STATE_CENTER_Y = EMOTION_CENTER_Y + CASCADE_GAP;
const BODY_CENTER_Y = STATE_CENTER_Y + CASCADE_GAP;
const WHEEL_HEIGHT = BODY_CENTER_Y + 48;

// Tool columns attach under gauges: gaugeCenterY + gaugeRadius + labelHeight + gap
const GAUGE_LABEL_HEIGHT = 16;
const TOOLS_GAP_BELOW_GAUGE = 8;
const TOOLS_TOP = ROW_1_CENTER_Y + GAUGE_SIZE / 2 + GAUGE_LABEL_HEIGHT + TOOLS_GAP_BELOW_GAUGE;

type ToolItem = { icon: string; route: string; label: string; params?: string };

/** Rituals slot: one context-aware action by time of day (upper-left). */
function getRitualsSlot(): ToolItem {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { icon: '☀️', route: '/rituals/pre-flight', label: 'Pre-Flight' };
  if (hour >= 12 && hour < 17) return { icon: '↻', route: '/tools/quick-reset', label: 'Reset' };
  if (hour >= 17 && hour < 21) return { icon: '🌙', route: '/rituals/post-flight', label: 'Post-Flight' };
  return { icon: '✨', route: '/(modals)/activity', label: 'Wind Down', params: '?id=breathing' };
}

/** Support slot: single entry to emergency/support flow (upper-right). Subtle but always present. */
const SUPPORT_SLOT: ToolItem = { icon: '🛟', route: '/emergency', label: 'Support' };

const SIDE_STACK_WIDTH = 44;
const STACK_ICON_SIZE = 32;
const STACK_ITEM_GAP = 6;
const BOTTOM_ROW_HEIGHT = 52;
const LINE_STROKE = 1;
const LINE_COLOR = '#39e7c6';
const LINE_OPACITY_STRONG = 0.18;  // Alignment→YOU, Emotion→State, State→Body
const LINE_OPACITY_MEDIUM = 0.14; // YOU→Connection, YOU→Direction
const LINE_OPACITY_SOFT = 0.08;   // Connection→Emotion, Direction→Emotion
const FIELD_GLOW_OPACITY = 0.05;
const FIELD_GLOW_RADIUS = 95;   // Slightly larger to match bigger center ring
const TOOL_ICON_LIGHT = '#E0E0E5';

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

// Human System Wheel positions (row 0 = top). Center row (1): Connection (left), YOU (center), Direction (right).
// Row 0: Alignment | Row 1: Connection, YOU, Direction | Row 2: Emotion | Row 3: State | Row 4: Body
type WheelSlot = { key: string; row: number; col: number }; // col 0=left, 1=center, 2=right
const WHEEL_SLOTS: WheelSlot[] = [
  { key: 'alignment', row: 0, col: 1 },
  { key: 'connection', row: 1, col: 0 },
  { key: 'direction', row: 1, col: 2 },
  { key: 'emotion', row: 2, col: 1 },
  { key: 'state', row: 3, col: 1 },
  { key: 'body', row: 4, col: 1 },
];

const cx = () => CLUSTER_WIDTH / 2;

function slotToPosition(slot: WheelSlot): { x: number; y: number } {
  const centerX = cx();
  const connX = centerX - CONNECTION_DIRECTION_OFFSET - GAUGE_SIZE / 2;
  const dirX = centerX + CONNECTION_DIRECTION_OFFSET - GAUGE_SIZE / 2;
  const topFor = (centerY: number) => centerY - GAUGE_SIZE / 2;
  switch (slot.key) {
    case 'alignment': return { x: centerX - GAUGE_SIZE / 2, y: topFor(ALIGNMENT_CENTER_Y) };
    case 'connection': return { x: connX, y: topFor(ROW_1_CENTER_Y) };
    case 'direction': return { x: dirX, y: topFor(ROW_1_CENTER_Y) };
    case 'emotion': return { x: centerX - GAUGE_SIZE / 2, y: topFor(EMOTION_CENTER_Y) };
    case 'state': return { x: centerX - GAUGE_SIZE / 2, y: topFor(STATE_CENTER_Y) };
    case 'body': return { x: centerX - GAUGE_SIZE / 2, y: topFor(BODY_CENTER_Y) };
    default: return { x: centerX - GAUGE_SIZE / 2, y: topFor(ROW_1_CENTER_Y) };
  }
}

/** Gauge center positions for connection lines — center-to-center only. */
function getGaugeCenters() {
  const c = cx();
  return {
    alignment: { x: c, y: ALIGNMENT_CENTER_Y },
    connection: { x: c - CONNECTION_DIRECTION_OFFSET, y: ROW_1_CENTER_Y },
    you: { x: c, y: ROW_1_CENTER_Y },
    direction: { x: c + CONNECTION_DIRECTION_OFFSET, y: ROW_1_CENTER_Y },
    emotion: { x: c, y: EMOTION_CENTER_Y },
    state: { x: c, y: STATE_CENTER_Y },
    body: { x: c, y: BODY_CENTER_Y },
  };
}

const PARTICLE_SIZE = 3;
const PARTICLE_OPACITY = 0.7;
const FLOW_DURATION = 2800;

type Point = { x: number; y: number };

/** Subtle moving particles along connection lines to show influence direction. */
function LineFlowParticles({ centers }: { centers: ReturnType<typeof getGaugeCenters> }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: FLOW_DURATION, useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  // Scientific flow: Alignment → YOU → Connection/Direction → Emotion → State → Body
  const segments: [Point, Point][] = [
    [centers.alignment, centers.you],
    [centers.you, centers.connection],
    [centers.you, centers.direction],
    [centers.connection, centers.emotion],
    [centers.direction, centers.emotion],
    [centers.emotion, centers.state],
    [centers.state, centers.body],
  ];

  return (
    <>
      {segments.map(([from, to], i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
            style={[
            {
              position: 'absolute',
              width: PARTICLE_SIZE,
              height: PARTICLE_SIZE,
              borderRadius: PARTICLE_SIZE / 2,
              backgroundColor: LINE_COLOR,
              opacity: PARTICLE_OPACITY,
              left: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [from.x - PARTICLE_SIZE / 2, to.x - PARTICLE_SIZE / 2],
              }),
              top: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [from.y - PARTICLE_SIZE / 2, to.y - PARTICLE_SIZE / 2],
              }),
            },
          ]}
        />
      ))}
    </>
  );
}

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
  bodyBiometricFresh?: boolean;
  stateBiometricFresh?: boolean;
  /** Left micro-signal panel lines (e.g. Sleep, Recovery, HRV) */
  leftSignalLines?: string[];
  /** Right micro-signal panel lines (e.g. Focus load, Connection days) */
  rightSignalLines?: string[];
  /** When true, status hint (e.g. "6/6 online") is not shown inside cluster — parent can show it above */
  hideStatusHint?: boolean;
}

const DEFAULT_LEFT_SIGNALS = ['Sleep: —', 'Recovery: —', 'HRV: —'];
const DEFAULT_RIGHT_SIGNALS = ['Focus load: —', 'Connection days: —', 'Task pressure: —'];

export function CockpitCluster({ 
  gaugeValues, 
  overall, 
  onCenterPress,
  onGaugePress,
  bodyBiometricSource,
  stateBiometricSource,
  bodyBiometricFresh = false,
  stateBiometricFresh = false,
  leftSignalLines = DEFAULT_LEFT_SIGNALS,
  rightSignalLines = DEFAULT_RIGHT_SIGNALS,
  hideStatusHint = false,
}: CockpitClusterProps) {
  const router = useRouter();
  const centerPulse = useRef(new Animated.Value(1)).current;
  const centers = getGaugeCenters();
  
  const overallLabel = getSystemScoreLabel(overall);
  const ringColor = overall < 0 ? (TEXT_MUTED + '90') : getGaugeColor(overall);
  const activeCount = Object.values(gaugeValues).filter(v => v >= 0).length;
  const cascadeActive = gaugeValues.emotion >= 0 && gaugeValues.emotion < 50 && gaugeValues.state >= 0 && gaugeValues.state < 50;

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

  const centerRingLeft = cx() - CENTER_SIZE / 2;
  const centerRingTop = ROW_1_CENTER_Y - CENTER_SIZE / 2;

  const pushTool = (item: ToolItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const path = item.params ? `${item.route}${item.params}` : item.route;
    router.push(path as any);
  };

  const connectionCenterX = cx() - CONNECTION_DIRECTION_OFFSET;
  const directionCenterX = cx() + CONNECTION_DIRECTION_OFFSET;
  const TOOLS_NUDGE = 4; // slight outward nudge so columns don't feel crowded by glow
  const toolsLeftX = connectionCenterX - SIDE_STACK_WIDTH / 2 - TOOLS_NUDGE;
  const toolsRightX = directionCenterX - SIDE_STACK_WIDTH / 2 + TOOLS_NUDGE;

  // Two contextual side actions only: Rituals (time-of-day) and Support (same spacing as before)
  const toolsLeft = [getRitualsSlot()];
  const toolsRight = [SUPPORT_SLOT];

  return (
    <View style={styles.container}>
      <View style={styles.clusterWrap}>
          {/* System field: soft radial glow behind YOU */}
          <View
            style={[
              styles.systemFieldGlow,
              {
                left: CLUSTER_WIDTH / 2 - FIELD_GLOW_RADIUS,
                top: ROW_1_CENTER_Y - FIELD_GLOW_RADIUS,
                width: FIELD_GLOW_RADIUS * 2,
                height: FIELD_GLOW_RADIUS * 2,
                borderRadius: FIELD_GLOW_RADIUS,
                backgroundColor: overall >= 0 ? ringColor : COLORS.surface,
                opacity: FIELD_GLOW_OPACITY,
              },
            ]}
            pointerEvents="none"
          />
          {/* Scientific connection lines: Alignment→YOU→Connection/Direction→Emotion→State→Body (animated, center-to-center) */}
          <View style={styles.svgWrap} pointerEvents="none">
            <Svg width={CLUSTER_WIDTH} height={WHEEL_HEIGHT} style={styles.svg}>
              <Line x1={centers.alignment.x} y1={centers.alignment.y} x2={centers.you.x} y2={centers.you.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_STRONG} />
              <Line x1={centers.you.x} y1={centers.you.y} x2={centers.connection.x} y2={centers.connection.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_MEDIUM} />
              <Line x1={centers.you.x} y1={centers.you.y} x2={centers.direction.x} y2={centers.direction.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_MEDIUM} />
              <Line x1={centers.connection.x} y1={centers.connection.y} x2={centers.emotion.x} y2={centers.emotion.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_SOFT} />
              <Line x1={centers.direction.x} y1={centers.direction.y} x2={centers.emotion.x} y2={centers.emotion.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_SOFT} />
              <Line x1={centers.emotion.x} y1={centers.emotion.y} x2={centers.state.x} y2={centers.state.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_STRONG} />
              <Line x1={centers.state.x} y1={centers.state.y} x2={centers.body.x} y2={centers.body.y} stroke={LINE_COLOR} strokeWidth={LINE_STROKE} opacity={LINE_OPACITY_STRONG} />
            </Svg>
            <LineFlowParticles centers={centers} />
          </View>

          {/* Center \"YOU\" glow — anchors cockpit */}
      <Animated.View
          style={[
          styles.centerGlow,
          {
            left: centerRingLeft - 16,
            top: centerRingTop - 16,
            width: CENTER_SIZE + 32,
            height: CENTER_SIZE + 32,
            borderRadius: (CENTER_SIZE + 32) / 2,
            backgroundColor: overall >= 0 ? ringColor : 'transparent',
            opacity: overall >= 75 ? 0.12 : overall >= 50 ? 0.08 : overall >= 0 ? 0.06 : 0,
            transform: [{ scale: centerPulse }],
          },
        ]}
      />
      <Pressable
        style={({ pressed }) => [
          styles.centerRing,
          {
            left: centerRingLeft,
            top: centerRingTop,
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            borderRadius: CENTER_SIZE / 2,
            borderColor: ringColor,
            borderWidth: overall >= 0 && overall < 60 ? 6 : 5,
            backgroundColor: overall >= 0 && overall < 60 ? `${ringColor}0A` : CARD_BG,
          },
          pressed && styles.centerRingPressed,
        ]}
        onPress={handleCenterPress}
      >
        {overall >= 0 ? (
          <>
            <Text style={styles.centerTitle}>YOU</Text>
            <Text style={[styles.centerValue, { color: ringColor }]}>{Math.round(overall)}</Text>
            <Text style={styles.centerLabel}>{overallLabel}</Text>
          </>
        ) : (
          <>
            <Text style={styles.centerTitle}>YOU</Text>
            <Text style={styles.centerCta}>Check in</Text>
          </>
        )}
      </Pressable>

      {/* 6 Gauges — Alignment label 10px above circle; cascade: circle → value → label below */}
      {WHEEL_SLOTS.map((slot) => {
        const key = slot.key;
        const gaugeValue = gaugeValues[key as keyof typeof gaugeValues];
        const config = GAUGE_CONFIG[key as keyof typeof GAUGE_CONFIG];
        const isSet = gaugeValue >= 0;
        const gaugeColor = isSet ? getGaugeColor(gaugeValue) : '#3A3A4A';
        const { x, y } = slotToPosition(slot);
        const isAlignment = key === 'alignment';
        const isCascade = key === 'emotion' || key === 'state' || key === 'body';

        return (
          <Pressable
            key={key}
            style={({ pressed }) => ({
              position: 'absolute',
              left: x,
              top: y,
              width: GAUGE_SIZE,
              height: GAUGE_SIZE + (isCascade ? 34 : 28),
              alignItems: 'center',
              justifyContent: isAlignment ? 'flex-end' : 'flex-start',
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => handleGaugePress(key)}
          >
            {isAlignment && (
              <>
                <Text style={[styles.gaugeLabelAbove, styles.alignmentLabelSpacing, { color: isSet ? gaugeColor : '#666' }]}>{config.label}</Text>
                <Text style={styles.gaugeMicroLabel}>{config.microLabel}</Text>
              </>
            )}
            <AnimatedGaugeRing value={gaugeValue} color={gaugeColor} size={GAUGE_SIZE}>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: isSet ? gaugeColor : '#666',
                textAlign: 'center',
              }}>
                {isSet ? gaugeValue : '—'}
              </Text>
            </AnimatedGaugeRing>
            {!isAlignment && (
              <>
                <Text style={[styles.gaugeLabelBelow, { color: isSet ? gaugeColor : '#666' }]}>{config.label}</Text>
                <Text style={styles.gaugeMicroLabel}>{config.microLabel}</Text>
              </>
            )}
          </Pressable>
        );
      })}

          {/* Status hint removed — green gauges already signal health */}

          {/* Left tool column — Rituals (context-aware by time of day) */}
          <View style={[styles.toolsUnderGauge, { left: toolsLeftX, top: TOOLS_TOP }]}>
            {toolsLeft.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.stackItem, pressed && styles.stackItemPressed]}
                onPress={() => pushTool(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={styles.stackIconWrap}>
                  <Text style={styles.stackIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.stackLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Right tool column — Support (emergency / breathe / reach out) */}
          <View style={[styles.toolsUnderGauge, { left: toolsRightX, top: TOOLS_TOP }]}>
            {toolsRight.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.stackItem, pressed && styles.stackItemPressed]}
                onPress={() => pushTool(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={styles.stackIconWrap}>
                  <Text style={styles.stackIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.stackLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

      {/* Bottom: left readouts | neutral actions (Message, Reflect, History) | right readouts */}
      <View style={styles.bottomRow}>
        <View style={styles.readoutBlock}>
          {leftSignalLines.map((line, i) => (
            <Text key={i} style={styles.readoutLine}>{line}</Text>
          ))}
        </View>
        <View style={styles.utilityRail}>
          <Pressable style={({ pressed }) => [styles.quickActionBtn, pressed && styles.quickActionPressed]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/talk'); }} accessibilityLabel="Talk">
            <Ionicons name="chatbubble-outline" size={18} color={TEXT_PRIMARY} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.quickActionBtn, pressed && styles.quickActionPressed]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/me'); }} accessibilityLabel="Reflect">
            <Ionicons name="journal-outline" size={18} color={TEXT_PRIMARY} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.quickActionBtn, pressed && styles.quickActionPressed]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/me'); }} accessibilityLabel="History">
            <Ionicons name="time-outline" size={18} color={TEXT_PRIMARY} />
          </Pressable>
        </View>
        <View style={styles.readoutBlock}>
          {rightSignalLines.map((line, i) => (
            <Text key={i} style={styles.readoutLine}>{line}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: WHEEL_HEIGHT + 32 + BOTTOM_ROW_HEIGHT + 16,
  },
  toolsUnderGauge: {
    position: 'absolute',
    width: SIDE_STACK_WIDTH,
    alignItems: 'center',
  },
  sideStack: {
    width: SIDE_STACK_WIDTH,
    alignItems: 'center',
  },
  stackItem: {
    alignItems: 'center',
    marginBottom: STACK_ITEM_GAP,
  },
  stackItemPressed: { opacity: 0.8 },
  stackIconWrap: {
    width: STACK_ICON_SIZE,
    height: STACK_ICON_SIZE,
    borderRadius: STACK_ICON_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackIcon: { fontSize: 16, color: TOOL_ICON_LIGHT },
  stackLabel: { fontSize: 9, color: TEXT_MUTED, marginTop: 2 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    minHeight: BOTTOM_ROW_HEIGHT,
  },
  readoutBlock: {
    flex: 1,
    maxWidth: 90,
  },
  readoutLine: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginBottom: 1,
  },
  utilityRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  clusterWrap: {
    width: CLUSTER_WIDTH,
    position: 'relative',
    minHeight: WHEEL_HEIGHT + 40,
  },
  systemFieldGlow: {
    position: 'absolute',
  },
  svgWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CLUSTER_WIDTH,
    height: WHEEL_HEIGHT,
  },
  svg: { position: 'absolute', left: 0, top: 0 },
  gaugeLabelAbove: { fontSize: 9, fontWeight: '600', textTransform: 'capitalize', marginBottom: 2 },
  alignmentLabelSpacing: { marginBottom: 6 },
  gaugeLabelBelow: { fontSize: 9, fontWeight: '600', textTransform: 'capitalize', marginTop: 10 },
  gaugeMicroLabel: { fontSize: 8, color: TEXT_MUTED, marginTop: 2, marginBottom: 2 },
  centerCta: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 4,
    textTransform: 'none',
    textAlign: 'center',
  },
  quickActionBtn: {
    width: 44,
    height: 44,
    marginHorizontal: 6,
    borderRadius: 22,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionPressed: { opacity: 0.85 },
  sosBtn: { backgroundColor: '#B91C1C', borderColor: 'rgba(255,255,255,0.2)' },
  sosBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  centerGlow: {
    position: 'absolute',
  },
  centerRing: {
    position: 'absolute',
    borderWidth: 5,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: TEXT_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  centerLabel: {
    fontSize: 7,
    color: TEXT_MUTED,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 80,
    opacity: 0.6,
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
