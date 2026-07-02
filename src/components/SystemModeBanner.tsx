/**
 * SystemModeBanner — Visual indicator of system-wide state
 * 
 * Capacity Mode: Purple/green tint, "Your system is stable"
 * Stabilization Mode: Amber tint, "Your system needs attention. Focus on [triggers]."
 * 
 * Smooth animation between states. Calm, protective tone.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type GaugeKey, type SystemMode } from '../stores/cockpitStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';

// Color palette - using design system constants
const AMBER = COLORS.amber;
const AMBER_BG = COLORS.amberBg;
const AMBER_BORDER = COLORS.amberBorder;
const AMBER_DOT = COLORS.amber;

const STABLE_BG = 'rgba(124, 77, 255, 0.06)';
const STABLE_BORDER = 'rgba(124, 77, 255, 0.15)';
const STABLE_DOT = '#4ADE80';
const STABLE_TEXT = '#A78BFA";

interface SystemModeBannerProps {
  mode: SystemMode;
  triggers: GaugeKey[];
  onQuickReset?: () => void;
  /** Hide the banner completely (e.g., user hasn't checked in yet) */
  hidden?: boolean;
}

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: "Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

export function SystemModeBanner({ 
  mode, 
  triggers, 
  onQuickReset,
  hidden = false,
}: SystemModeBannerProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const colorAnim = useRef(new Animated.Value(mode === 'stabilization' ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    if (hidden) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 15, stiffness: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [hidden]);

  // Mode transition animation
  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: mode === 'stabilization' ? 1 : 0,
      duration: 400,
      useNativeDriver: false, // Can't use native driver for color interpolation
    }).start();
  }, [mode]);

  // Pulse animation for stabilization mode
  useEffect(() => {
    if (mode === "stabilization') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [mode]);

  if (hidden) return null;

  // Interpolated colors
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [STABLE_BG, AMBER_BG],
  });

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [STABLE_BORDER, AMBER_BORDER],
  });

  const dotColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [STABLE_DOT, AMBER_DOT],
  });

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [STABLE_TEXT, AMBER],
  });

  const triggerText = triggers.length > 0
    ? triggers.map(t => GAUGE_LABELS[t]).join(' and ')
    : '';

  const handleQuickReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onQuickReset?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: mode === 'stabilization' ? pulseAnim : 1 },
          ],
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {/* Mode Indicator */}
      <View style={styles.header}>
        <View style={styles.modeIndicator}>
          <Animated.View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Animated.Text style={[styles.modeText, { color: textColor }]}>
            {mode === 'capacity' ? 'Capacity Mode' : 'Stabilization Mode'}
          </Animated.Text>
        </View>
        
        {mode === 'capacity' && (
          <Ionicons name="checkmark-circle" size={16} color={STABLE_DOT} />
        )}
      </View>

      {/* Message */}
      <Text style={styles.message}>
        {mode === 'capacity' 
          ? 'Your system is stable. All tools available.'
          : `${triggerText} ${triggers.length === 1 ? 'needs' : 'need'} attention.`
        }
      </Text>

      {/* Sub-message for stabilization */}
      {mode === 'stabilization' && (
        <Text style={styles.subMessage}>
          Simpler actions tend to land better when the foundation is strained.
        </Text>
      )}

      {/* Actions for stabilization mode */}
      {mode === 'stabilization' && onQuickReset && (
        <View style={styles.actions}>
          <Pressable style={styles.resetButton} onPress={handleQuickReset}>
            <Ionicons name="refresh" size={14} color={AMBER} />
            <Text style={styles.resetText}>Quick Reset (2 min)</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

/**
 * Compact System Mode Indicator — For use in headers/toolbars
 */
interface CompactModeIndicatorProps {
  mode: SystemMode;
  triggers: GaugeKey[];
  onPress?: () => void;
}

export function CompactModeIndicator({ mode, triggers, onPress }: CompactModeIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode === 'stabilization') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [mode]);

  const isStabilization = mode === 'stabilization';
  const dotColor = isStabilization ? AMBER : STABLE_DOT;
  const bgColor = isStabilization ? AMBER_BG : STABLE_BG;
  const textColor = isStabilization ? AMBER : STABLE_TEXT;

  return (
    <Pressable
      style={[styles.compactContainer, { backgroundColor: bgColor }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
    >
      <Animated.View
        style={[
          styles.compactDot,
          { backgroundColor: dotColor, transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Text style={[styles.compactText, { color: textColor }]}>
        {isStabilization ? 'Stabilizing' : 'Stable'}
      </Text>
      {isStabilization && triggers.length > 0 && (
        <Text style={styles.compactTriggerCount}>({triggers.length})</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  message: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  subMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: SPACING.xs,
  },
  actions: {
    marginTop: SPACING.md,
    flexDirection: 'row',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: BORDER_RADIUS.md,
  },
  resetText: {
    color: AMBER,
    fontSize: 13,
    fontWeight: '600',
  },

  // Compact indicator styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  compactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactTriggerCount: {
    fontSize: 11,
    color: AMBER,
    fontWeight: '500',
  },
});

export default SystemModeBanner;
