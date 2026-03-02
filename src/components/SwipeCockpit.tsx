/**
 * SwipeCockpit — Future-forward gauge navigation
 * 
 * PRINCIPLES APPLIED:
 * - Swipe > Tap (gestural hierarchy)
 * - Glance first (see state in <1 second)
 * - One-thumb zone (actions at bottom)
 * - State-aware (simplifies when dysregulated)
 * - <10 seconds (full check-in via swipe)
 * 
 * Swipe left/right between 6 gauges
 * Swipe up for detail
 * Swipe down to dismiss
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, ANIMATION } from '../lib/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY = 0.5;

type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface GaugeData {
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

interface SwipeCockpitProps {
  gauges: GaugeData;
  initialGauge?: GaugeName;
  onGaugeChange?: (gauge: GaugeName) => void;
  onGaugePress?: (gauge: GaugeName) => void;
  onSwipeUp?: (gauge: GaugeName) => void;
}

const GAUGE_ORDER: GaugeName[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

const GAUGE_INFO: Record<GaugeName, {
  label: string;
  emoji: string;
  color: string;
  gradient: string[];
  question: string;
}> = {
  body: {
    label: 'Body',
    emoji: '🫀',
    color: COLORS.gauges.body,
    gradient: ['#C9956B', '#D4A574'],
    question: 'How does your body feel?',
  },
  state: {
    label: 'State',
    emoji: '🌊',
    color: COLORS.gauges.state,
    gradient: ['#0D9488', '#2DD4BF'],
    question: 'How regulated is your nervous system?',
  },
  emotion: {
    label: 'Emotion',
    emoji: '💫',
    color: COLORS.gauges.emotion,
    gradient: ['#E07A5F', '#F4A98C'],
    question: 'What are you feeling?',
  },
  connection: {
    label: 'Connection',
    emoji: '🤝',
    color: COLORS.gauges.connection,
    gradient: ['#9B8AA6', '#B8A6C4'],
    question: 'How connected do you feel?',
  },
  direction: {
    label: 'Direction',
    emoji: '🧭',
    color: COLORS.gauges.direction,
    gradient: ['#7D9B8C', '#9BB8A8'],
    question: 'Do you have a sense of purpose?',
  },
  alignment: {
    label: 'Alignment',
    emoji: '⭐',
    color: COLORS.gauges.alignment,
    gradient: ['#B8963E', '#D4B062'],
    question: 'Are you living your values?',
  },
};

// Get status text based on score
function getStatus(value: number): { text: string; color: string } {
  if (value < 0) return { text: 'NOT SET', color: COLORS.textMuted };
  if (value < 30) return { text: 'PAY ATTENTION', color: COLORS.warning };
  if (value < 50) return { text: 'NEEDS CARE', color: COLORS.amber };
  if (value < 70) return { text: 'STABLE', color: COLORS.textSecondary };
  return { text: 'THRIVING', color: COLORS.success };
}

export function SwipeCockpit({
  gauges,
  initialGauge = 'state',
  onGaugeChange,
  onGaugePress,
  onSwipeUp,
}: SwipeCockpitProps) {
  const [currentIndex, setCurrentIndex] = useState(
    GAUGE_ORDER.indexOf(initialGauge)
  );
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const currentGauge = GAUGE_ORDER[currentIndex];
  const currentValue = gauges[currentGauge];
  const currentInfo = GAUGE_INFO[currentGauge];
  const status = getStatus(currentValue);
  
  // Check if user is in low state (simplified UI mode)
  const isLowState = gauges.state >= 0 && gauges.state < 40;
  
  const goToGauge = useCallback((index: number) => {
    if (index < 0 || index >= GAUGE_ORDER.length) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(index);
    onGaugeChange?.(GAUGE_ORDER[index]);
  }, [onGaugeChange]);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      },
      
      onPanResponderGrant: () => {
        // Scale down slightly on touch
        Animated.spring(scale, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      },
      
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      
      onPanResponderRelease: (_, gestureState) => {
        // Reset scale
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        
        const { dx, vx, dy, vy } = gestureState;
        
        // Check for swipe up (detail view)
        if (dy < -100 && Math.abs(vy) > Math.abs(vx)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeUp?.(currentGauge);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          return;
        }
        
        // Horizontal swipe
        if (dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY) {
          // Swipe right → previous gauge
          if (currentIndex > 0) {
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              goToGauge(currentIndex - 1);
            });
          } else {
            // Rubber band
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else if (dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY) {
          // Swipe left → next gauge
          if (currentIndex < GAUGE_ORDER.length - 1) {
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              goToGauge(currentIndex + 1);
            });
          } else {
            // Rubber band
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Return to center
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  // Calculate overall system score
  const allValues = Object.values(gauges).filter(v => v >= 0);
  const systemScore = allValues.length > 0
    ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
    : -1;
  
  return (
    <View style={styles.container}>
      {/* Gauge indicator dots */}
      <View style={styles.dots}>
        {GAUGE_ORDER.map((gauge, index) => (
          <Pressable
            key={gauge}
            onPress={() => goToGauge(index)}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
              { backgroundColor: index === currentIndex ? GAUGE_INFO[gauge].color : COLORS.border },
            ]}
          />
        ))}
      </View>
      
      {/* Main gauge display */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.gaugeContainer,
          {
            transform: [
              { translateX },
              { scale },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => onGaugePress?.(currentGauge)}
          style={styles.gaugePressable}
        >
          {/* Background gradient */}
          <LinearGradient
            colors={[`${currentInfo.color}15`, `${currentInfo.color}05`]}
            style={styles.gaugeBackground}
          />
          
          {/* Emoji */}
          <Text style={styles.gaugeEmoji}>{currentInfo.emoji}</Text>
          
          {/* Score */}
          <Text style={[styles.gaugeScore, { color: currentInfo.color }]}>
            {currentValue >= 0 ? Math.round(currentValue) : '—'}
          </Text>
          
          {/* Label */}
          <Text style={[styles.gaugeLabel, { color: currentInfo.color }]}>
            {currentInfo.label.toUpperCase()}
          </Text>
          
          {/* Status */}
          <Text style={[styles.gaugeStatus, { color: status.color }]}>
            {status.text}
          </Text>
          
          {/* Question (hidden in low-state mode for simplicity) */}
          {!isLowState && (
            <Text style={styles.gaugeQuestion}>{currentInfo.question}</Text>
          )}
          
          {/* Swipe hint */}
          <Text style={styles.swipeHint}>
            {currentIndex > 0 && '← '}
            swipe
            {currentIndex < GAUGE_ORDER.length - 1 && ' →'}
          </Text>
        </Pressable>
      </Animated.View>
      
      {/* Peek indicators for adjacent gauges */}
      {currentIndex > 0 && (
        <View style={[styles.peekLeft, { backgroundColor: GAUGE_INFO[GAUGE_ORDER[currentIndex - 1]].color }]} />
      )}
      {currentIndex < GAUGE_ORDER.length - 1 && (
        <View style={[styles.peekRight, { backgroundColor: GAUGE_INFO[GAUGE_ORDER[currentIndex + 1]].color }]} />
      )}
      
      {/* System score footer */}
      <View style={styles.footer}>
        <Text style={styles.systemLabel}>SYSTEM</Text>
        <Text style={styles.systemScore}>
          {systemScore >= 0 ? systemScore : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  
  // Dots
  dots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  
  // Main gauge
  gaugeContainer: {
    width: SCREEN_WIDTH - SPACING.xl * 2,
    aspectRatio: 1,
    maxHeight: 400,
  },
  gaugePressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
  },
  gaugeBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS.xxl,
  },
  gaugeEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  gaugeScore: {
    ...TYPOGRAPHY.scoreXL,
  },
  gaugeLabel: {
    ...TYPOGRAPHY.labelLg,
    marginTop: SPACING.xs,
  },
  gaugeStatus: {
    ...TYPOGRAPHY.alert,
    marginTop: SPACING.md,
  },
  gaugeQuestion: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  swipeHint: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textDim,
    marginTop: SPACING.xl,
  },
  
  // Peek indicators
  peekLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 4,
    height: 60,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.5,
  },
  peekRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 4,
    height: 60,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    opacity: 0.5,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  systemLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
  },
  systemScore: {
    ...TYPOGRAPHY.scoreSm,
    color: COLORS.text,
  },
});

export default SwipeCockpit;
