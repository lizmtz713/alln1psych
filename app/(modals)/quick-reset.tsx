/**
 * Quick Regulation Reset — 2-minute nervous system reset
 * 
 * Accessed from StabilizationBanner when system is under strain.
 * Simple, guided, body-based regulation. No thinking required.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useCockpitStore } from '../../src/stores/cockpitStore';

const BG = COLORS.background;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = '#7C4DFF';
const CALM_BLUE = '#38BDF8';
const AMBER = '#F59E0B';

type ResetPhase = 'intro' | 'ground' | 'breathe' | 'shake' | 'complete';

const PHASES: { id: ResetPhase; title: string; duration: number; instruction: string }[] = [
  {
    id: 'intro',
    title: 'Quick Reset',
    duration: 5,
    instruction: "Your system needs a moment. Let's take 2 minutes to reset.",
  },
  {
    id: 'ground',
    title: 'Ground',
    duration: 20,
    instruction: "Feel your feet on the floor. Press down. Notice the weight of your body. You're here, right now, and you're safe.",
  },
  {
    id: 'breathe',
    title: 'Breathe',
    duration: 60,
    instruction: "Breathe with me. In through your nose... hold... long exhale through your mouth. The exhale is longer than the inhale.",
  },
  {
    id: 'shake',
    title: 'Shake',
    duration: 20,
    instruction: "Shake out your hands. Let your shoulders drop. Roll your neck gently. Release whatever your body is holding.",
  },
  {
    id: 'complete',
    title: 'Reset Complete',
    duration: 0,
    instruction: "Your nervous system just got a small reset. It's not magic — but it's real. You shifted your state.",
  },
];

function BreathingCircle({ phase }: { phase: ResetPhase }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (phase !== 'breathe') {
      scale.setValue(1);
      opacity.setValue(0.3);
      return;
    }

    // Breathing animation: 4s in, 2s hold, 6s out = 12s cycle
    const breatheCycle = () => {
      Animated.sequence([
        // Inhale (4s)
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.4, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 4000, useNativeDriver: true }),
        ]),
        // Hold (2s)
        Animated.delay(2000),
        // Exhale (6s)
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 6000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 6000, useNativeDriver: true }),
        ]),
      ]).start(() => {
        if (phase === 'breathe') breatheCycle();
      });
    };

    breatheCycle();
  }, [phase]);

  const breatheText = phase === 'breathe' ? 'Breathe with me' : '';

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
      {breatheText ? <Text style={styles.breatheText}>{breatheText}</Text> : null}
    </View>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export default function QuickResetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  
  const systemMode = useCockpitStore((s) => s.systemMode);
  const stabilizationTriggers = useCockpitStore((s) => s.stabilizationTriggers);

  const currentPhase = PHASES[phaseIndex];
  const totalDuration = PHASES.reduce((sum, p) => sum + p.duration, 0);

  useEffect(() => {
    if (currentPhase.id === 'complete') return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Move to next phase
          if (phaseIndex < PHASES.length - 1) {
            const nextPhase = PHASES[phaseIndex + 1];
            setPhaseIndex(phaseIndex + 1);
            
            // Haptic feedback on phase change
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            return nextPhase.duration;
          }
          return 0;
        }
        setTotalElapsed((e) => e + 1);
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phaseIndex, currentPhase.id]);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phaseIndex < PHASES.length - 1) {
      setTotalElapsed((e) => e + timeLeft);
      setPhaseIndex(phaseIndex + 1);
      setTimeLeft(PHASES[phaseIndex + 1].duration);
    }
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const phaseColors: Record<ResetPhase, string> = {
    intro: AMBER,
    ground: '#4ADE80',
    breathe: CALM_BLUE,
    shake: '#F472B6',
    complete: ACCENT,
  };

  const phaseColor = phaseColors[currentPhase.id];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={TEXT_MUTED} />
        </Pressable>
        {currentPhase.id !== 'complete' && (
          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Progress */}
      <ProgressBar current={totalElapsed} total={totalDuration} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Phase indicator */}
        <View style={[styles.phaseIndicator, { backgroundColor: phaseColor + '20' }]}>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>
            {currentPhase.title}
          </Text>
        </View>

        {/* Breathing circle (visible during breathe phase) */}
        {(currentPhase.id === 'breathe' || currentPhase.id === 'intro') && (
          <BreathingCircle phase={currentPhase.id} />
        )}

        {/* Shake animation hint */}
        {currentPhase.id === 'shake' && (
          <View style={styles.shakeContainer}>
            <Text style={styles.shakeEmoji}>🙌</Text>
            <Text style={styles.shakeHint}>Shake it out</Text>
          </View>
        )}

        {/* Complete checkmark */}
        {currentPhase.id === 'complete' && (
          <View style={styles.completeContainer}>
            <View style={[styles.completeCircle, { backgroundColor: phaseColor + '20' }]}>
              <Ionicons name="checkmark" size={48} color={phaseColor} />
            </View>
          </View>
        )}

        {/* Ground visual */}
        {currentPhase.id === 'ground' && (
          <View style={styles.groundContainer}>
            <Text style={styles.groundEmoji}>🦶</Text>
            <Text style={styles.groundHint}>Feel your feet</Text>
          </View>
        )}

        {/* Instruction */}
        <Text style={styles.instruction}>{currentPhase.instruction}</Text>

        {/* Timer (not shown on complete) */}
        {currentPhase.id !== 'complete' && timeLeft > 0 && (
          <Text style={styles.timer}>{timeLeft}s</Text>
        )}
      </View>

      {/* Done button (complete phase only) */}
      {currentPhase.id === 'complete' && (
        <View style={styles.footer}>
          <Pressable style={[styles.doneButton, { backgroundColor: phaseColor }]} onPress={handleDone}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
          
          {systemMode === 'stabilization' && (
            <Text style={styles.footerHint}>
              Your {stabilizationTriggers.join(' and ')} gauge{stabilizationTriggers.length > 1 ? 's' : ''} may still need attention. 
              This reset helps — keep checking in.
            </Text>
          )}
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 8,
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    color: TEXT_MUTED,
    fontSize: 15,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instruction: {
    fontSize: 20,
    color: TEXT,
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: TEXT_MUTED,
    marginTop: 30,
  },
  
  // Breathing circle
  breatheContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
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
  breatheText: {
    position: 'absolute',
    color: TEXT,
    fontSize: 14,
    fontWeight: '500',
  },

  // Ground
  groundContainer: {
    alignItems: 'center',
  },
  groundEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  groundHint: {
    fontSize: 16,
    color: TEXT_MUTED,
  },

  // Shake
  shakeContainer: {
    alignItems: 'center',
  },
  shakeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  shakeHint: {
    fontSize: 16,
    color: TEXT_MUTED,
  },

  // Complete
  completeContainer: {
    alignItems: 'center',
  },
  completeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footerHint: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
