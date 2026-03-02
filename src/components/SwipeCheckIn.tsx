/**
 * SwipeCheckIn — <10 second full cockpit check-in
 * 
 * PRINCIPLES APPLIED:
 * - Swipe > Tap (no buttons needed)
 * - <10 seconds (full 6-gauge check-in)
 * - Cognitive light (one choice at a time)
 * - State-aware (bigger targets when dysregulated)
 * 
 * Swipe left = lower score
 * Swipe right = higher score
 * Swipe up = skip this gauge
 * Auto-advances after each selection
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface SwipeCheckInProps {
  onComplete: (values: Record<GaugeName, number>) => void;
  onCancel?: () => void;
}

const GAUGE_ORDER: GaugeName[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

const GAUGE_CONFIG: Record<GaugeName, {
  label: string;
  emoji: string;
  color: string;
  lowLabel: string;
  highLabel: string;
  question: string;
}> = {
  body: {
    label: 'Body',
    emoji: '🫀',
    color: COLORS.gauges.body,
    lowLabel: 'Depleted',
    highLabel: 'Energized',
    question: 'How does your body feel right now?',
  },
  state: {
    label: 'State',
    emoji: '🌊',
    color: COLORS.gauges.state,
    lowLabel: 'Dysregulated',
    highLabel: 'Calm',
    question: 'How regulated is your nervous system?',
  },
  emotion: {
    label: 'Emotion',
    emoji: '💫',
    color: COLORS.gauges.emotion,
    lowLabel: 'Struggling',
    highLabel: 'Balanced',
    question: 'How are you feeling emotionally?',
  },
  connection: {
    label: 'Connection',
    emoji: '🤝',
    color: COLORS.gauges.connection,
    lowLabel: 'Isolated',
    highLabel: 'Connected',
    question: 'How connected do you feel to others?',
  },
  direction: {
    label: 'Direction',
    emoji: '🧭',
    color: COLORS.gauges.direction,
    lowLabel: 'Lost',
    highLabel: 'Purposeful',
    question: 'Do you have a sense of direction?',
  },
  alignment: {
    label: 'Alignment',
    emoji: '⭐',
    color: COLORS.gauges.alignment,
    lowLabel: 'Off-track',
    highLabel: 'Aligned',
    question: 'Are you living your values?',
  },
};

export function SwipeCheckIn({ onComplete, onCancel }: SwipeCheckInProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState<Partial<Record<GaugeName, number>>>({});
  const [currentValue, setCurrentValue] = useState(50);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const currentGauge = GAUGE_ORDER[currentIndex];
  const config = GAUGE_CONFIG[currentGauge];
  const isComplete = currentIndex >= GAUGE_ORDER.length;
  
  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentIndex / GAUGE_ORDER.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);
  
  // Convert drag distance to value (0-100)
  const dragToValue = useCallback((dx: number): number => {
    // Map -150 to +150 drag → 0 to 100 value
    const normalized = (dx + 150) / 300;
    const clamped = Math.max(0, Math.min(1, normalized));
    return Math.round(clamped * 100);
  }, []);
  
  const submitValue = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newValues = { ...values, [currentGauge]: value };
    setValues(newValues);
    
    if (currentIndex < GAUGE_ORDER.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(50);
      translateX.setValue(0);
    } else {
      // All done
      onComplete(newValues as Record<GaugeName, number>);
    }
  }, [currentIndex, values, currentGauge, onComplete, translateX]);
  
  const skipGauge = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentIndex < GAUGE_ORDER.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(50);
      translateX.setValue(0);
    } else {
      // Submit with skipped values as -1
      const finalValues = { ...values };
      GAUGE_ORDER.forEach(g => {
        if (finalValues[g] === undefined) finalValues[g] = -1;
      });
      onComplete(finalValues as Record<GaugeName, number>);
    }
  }, [currentIndex, values, onComplete, translateX]);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        setCurrentValue(dragToValue(gestureState.dx));
      },
      
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Swipe up = skip
        if (dy < -100 && Math.abs(dy) > Math.abs(dx)) {
          skipGauge();
          return;
        }
        
        // Horizontal swipe beyond threshold = submit
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          const finalValue = dragToValue(dx);
          submitValue(finalValue);
          return;
        }
        
        // Return to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setCurrentValue(50);
      },
    })
  ).current;
  
  if (isComplete) {
    return null;
  }
  
  // Calculate color based on current value
  const valueColor = currentValue < 30 
    ? COLORS.warning 
    : currentValue < 50 
      ? COLORS.amber 
      : currentValue < 70 
        ? COLORS.textSecondary 
        : COLORS.success;
  
  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: config.color,
            },
          ]}
        />
      </View>
      
      {/* Gauge counter */}
      <Text style={styles.counter}>
        {currentIndex + 1} of {GAUGE_ORDER.length}
      </Text>
      
      {/* Main swipe area */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.swipeArea,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[`${config.color}20`, `${config.color}05`]}
          style={styles.swipeGradient}
        />
        
        {/* Emoji */}
        <Text style={styles.emoji}>{config.emoji}</Text>
        
        {/* Question */}
        <Text style={styles.question}>{config.question}</Text>
        
        {/* Current value */}
        <Text style={[styles.value, { color: valueColor }]}>
          {currentValue}
        </Text>
        
        {/* Label */}
        <Text style={[styles.label, { color: config.color }]}>
          {config.label.toUpperCase()}
        </Text>
      </Animated.View>
      
      {/* Low/High labels */}
      <View style={styles.labelsRow}>
        <View style={styles.labelSide}>
          <Text style={styles.sideLabel}>{config.lowLabel}</Text>
          <Text style={styles.sideHint}>← swipe left</Text>
        </View>
        <View style={styles.labelSide}>
          <Text style={styles.sideLabel}>{config.highLabel}</Text>
          <Text style={styles.sideHint}>swipe right →</Text>
        </View>
      </View>
      
      {/* Skip hint */}
      <Text style={styles.skipHint}>swipe up to skip</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  
  // Progress
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.xl,
    right: SPACING.xl,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Counter
  counter: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    position: 'absolute',
    top: 80,
  },
  
  // Swipe area
  swipeArea: {
    width: SCREEN_WIDTH - SPACING.xl * 4,
    aspectRatio: 1,
    maxWidth: 300,
    maxHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
  },
  swipeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Content
  emoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  question: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  value: {
    ...TYPOGRAPHY.scoreXL,
  },
  label: {
    ...TYPOGRAPHY.labelLg,
    marginTop: SPACING.xs,
  },
  
  // Side labels
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  labelSide: {
    alignItems: 'center',
  },
  sideLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textSecondary,
  },
  sideHint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  
  // Skip
  skipHint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
    marginTop: SPACING.xxl,
  },
});

export default SwipeCheckIn;
