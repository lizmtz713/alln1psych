/**
 * Pre-Conversation System Check — Quick regulation check before high-stakes interactions
 * 
 * Empowering, not blocking. "Would you like to..." Insert pause without control.
 * Accessed before difficult conversations, from AI tools, or from Cockpit tap.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';

const BG = COLORS.background;
const TEXT = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;
const CALM_BLUE = '#38BDF8';
const AMBER = COLORS.amber;
const GREEN = COLORS.green;

type SystemState = 'activated' | 'calm' | 'shutdown';

function getSystemState(stateValue: number): SystemState {
  if (stateValue < 0) return 'calm'; // No data, assume calm
  if (stateValue < 40) return 'activated';
  if (stateValue < 70) return 'calm';
  return 'calm';
}

function getStateLabel(stateValue: number): string {
  if (stateValue < 0) return 'Unknown';
  if (stateValue < 25) return 'Very Activated';
  if (stateValue < 40) return 'Activated';
  if (stateValue < 60) return 'Settling';
  if (stateValue < 75) return 'Calm';
  return 'Grounded';
}

function getStateColor(stateValue: number): string {
  if (stateValue < 0) return TEXT_MUTED;
  if (stateValue < 40) return AMBER;
  if (stateValue < 70) return COLORS.yellow;
  return GREEN;
}

// Simple breathing animation for 30 seconds
function BreathingCircle({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (!active) {
      scale.setValue(1);
      opacity.setValue(0.3);
      setSecondsLeft(30);
      return;
    }

    // 30-second timer
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Breathing cycle: 4s in, 2s hold, 4s out = 10s cycle
    const breatheCycle = () => {
      // Inhale (4s)
      setPhase('inhale');
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.4, duration: 4000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 4000, useNativeDriver: true }),
      ]).start(() => {
        // Hold (2s)
        setPhase('hold');
        setTimeout(() => {
          // Exhale (4s)
          setPhase('exhale');
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 4000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.3, duration: 4000, useNativeDriver: true }),
          ]).start(() => {
            if (active) breatheCycle();
          });
        }, 2000);
      });
    };

    breatheCycle();

    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  const phaseText = phase === 'inhale' ? 'Breathe in...' : phase === 'hold' ? 'Hold...' : 'Breathe out...';

  return (
    <View style={styles.breatheContainer}>
      <Animated.View
        style={[
          styles.breatheCircle,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.breatheCircleInner,
          {
            transform: [{ scale }],
          },
        ]}
      />
      <View style={styles.breatheTextContainer}>
        <Text style={styles.breathePhase}>{phaseText}</Text>
        <Text style={styles.breatheTimer}>{secondsLeft}s</Text>
      </View>
    </View>
  );
}

export default function PreConversationCheckScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  
  const stateValue = useCockpitStore((s) => s.state.value);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingComplete, setBreathingComplete] = useState(false);
  
  const systemState = getSystemState(stateValue);
  const stateLabel = getStateLabel(stateValue);
  const stateColor = getStateColor(stateValue);
  const isActivated = systemState === 'activated' || (stateValue >= 0 && stateValue < 50);
  const isRegulated = stateValue >= 50;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleQuickReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(modals)/quick-reset');
  };

  const handleBreathing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsBreathing(true);
  };

  const handleBreathingComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsBreathing(false);
    setBreathingComplete(true);
  };

  const handleProceed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (params.returnTo) {
      router.replace(params.returnTo as any);
    } else {
      router.back();
    }
  };

  if (isBreathing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setIsBreathing(false)} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={TEXT_MUTED} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <BreathingCircle active={true} onComplete={handleBreathingComplete} />
          
          <Text style={styles.breathingInstruction}>
            Follow the circle. In through your nose, out through your mouth.
          </Text>
          
          <Pressable style={styles.skipBreathingBtn} onPress={() => setIsBreathing(false)}>
            <Text style={styles.skipBreathingText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
      </View>

      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Title */}
        <Text style={styles.title}>Preparing for a conversation?</Text>
        
        <Text style={styles.subtitle}>
          Let's check your system before you dive in.
        </Text>

        {/* State Display */}
        <View style={styles.stateCard}>
          <View style={styles.stateHeader}>
            <Text style={styles.stateTitle}>Your State</Text>
            <View style={[styles.stateBadge, { backgroundColor: stateColor + '20' }]}>
              <View style={[styles.stateDot, { backgroundColor: stateColor }]} />
              <Text style={[styles.stateBadgeText, { color: stateColor }]}>
                {stateValue >= 0 ? stateValue : '—'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.stateLabel, { color: stateColor }]}>
            {stateLabel}
          </Text>

          {/* State description */}
          {isActivated && !breathingComplete && (
            <View style={styles.stateMessage}>
              <Ionicons name="information-circle-outline" size={18} color={AMBER} />
              <Text style={styles.stateMessageText}>
                Your nervous system is a bit activated. Difficult conversations hit harder when we're already wound up.
              </Text>
            </View>
          )}

          {(isRegulated || breathingComplete) && (
            <View style={[styles.stateMessage, { backgroundColor: GREEN + '10' }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={GREEN} />
              <Text style={[styles.stateMessageText, { color: GREEN }]}>
                {breathingComplete 
                  ? "Nice. You just gave your system a moment to settle."
                  : "You're regulated. You've got capacity for this."
                }
              </Text>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.options}>
          {isActivated && !breathingComplete && (
            <>
              <Text style={styles.optionsLabel}>Would you like to regulate first?</Text>
              
              <Pressable style={styles.quickResetBtn} onPress={handleQuickReset}>
                <LinearGradient
                  colors={[AMBER + 'DD', AMBER + 'AA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quickResetGradient}
                >
                  <Ionicons name="refresh" size={20} color="#000" />
                  <Text style={styles.quickResetText}>Quick Reset (2 min)</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.breatheBtn} onPress={handleBreathing}>
                <Ionicons name="ellipse-outline" size={20} color={CALM_BLUE} />
                <Text style={styles.breatheText}>30-Second Breathing</Text>
              </Pressable>
            </>
          )}

          {/* Proceed button */}
          <Pressable style={styles.proceedBtn} onPress={handleProceed}>
            <Text style={styles.proceedText}>
              {isActivated && !breathingComplete ? 'Continue anyway' : 'Ready to proceed'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={TEXT} />
          </Pressable>
        </View>

        {/* Philosophy note */}
        <Text style={styles.philosophyNote}>
          This is a pause, not a gate. You're always in control.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },

  // State Card
  stateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    marginBottom: 32,
  },
  stateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stateLabel: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  stateMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: AMBER + '10',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  stateMessageText: {
    flex: 1,
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },

  // Options
  options: {
    gap: 12,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  quickResetBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  quickResetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  quickResetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  breatheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: CALM_BLUE + '15',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: CALM_BLUE + '30',
  },
  breatheText: {
    fontSize: 16,
    fontWeight: '500',
    color: CALM_BLUE,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  proceedText: {
    fontSize: 16,
    color: TEXT_MUTED,
  },

  // Philosophy note
  philosophyNote: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },

  // Breathing mode
  breatheContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 40,
  },
  breatheCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: CALM_BLUE,
  },
  breatheCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: CALM_BLUE,
  },
  breatheTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  breathePhase: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  breatheTimer: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  breathingInstruction: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  skipBreathingBtn: {
    paddingVertical: 12,
  },
  skipBreathingText: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
});
