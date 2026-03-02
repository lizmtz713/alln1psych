/**
 * PHOSM Hero Onboarding — Apple-level simplicity
 * 
 * One concept per screen. Big visuals. Little text.
 * The cockpit IS the hero.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Path, G } from 'react-native-svg';
import { useUserStore, type AgeGroup } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Colors
const BG = '#09090F';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8888A0';
const ACCENT = '#7C4DFF';

// Gauge colors
const GAUGE_COLORS = {
  body: '#10B981',
  state: '#F59E0B', 
  emotion: '#EC4899',
  connection: '#3B82F6',
  direction: '#8B5CF6',
  alignment: '#06B6D4',
};

const GAUGE_LABELS = [
  { key: 'body', label: 'Body', emoji: '🧠', desc: 'Sleep, food, movement' },
  { key: 'state', label: 'State', emoji: '💓', desc: 'Your nervous system' },
  { key: 'emotion', label: 'Emotion', emoji: '🎭', desc: 'What you actually feel' },
  { key: 'connection', label: 'Connection', emoji: '🤝', desc: 'Relationships' },
  { key: 'direction', label: 'Direction', emoji: '🎯', desc: 'Purpose & motivation' },
  { key: 'alignment', label: 'Alignment', emoji: '⚖️', desc: 'Values in action' },
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: '13-17', label: '13–17' },
  { value: '18-25', label: '18–25' },
  { value: '26-40', label: '26–40' },
  { value: '41-60', label: '41–60' },
  { value: '60+', label: '60+' },
];

// Animated PHOSM Hexagon Component
function PHOSMHexagon({ 
  size = 280, 
  activeGauges = 0,
  pulseCenter = false,
  showLabels = false,
  highlightGauge = null,
}: {
  size?: number;
  activeGauges?: number;
  pulseCenter?: boolean;
  showLabels?: boolean;
  highlightGauge?: string | null;
}) {
  const centerPulse = useRef(new Animated.Value(1)).current;
  const gaugeAnims = useRef(GAUGE_LABELS.map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    if (pulseCenter) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(centerPulse, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
          Animated.timing(centerPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [pulseCenter]);

  useEffect(() => {
    // Animate gauges appearing one by one
    const animations = gaugeAnims.slice(0, activeGauges).map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 150,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, [activeGauges]);

  const centerSize = size * 0.32;
  const gaugeSize = size * 0.22;
  const gaugeRadius = (size - gaugeSize) / 2 - 10;

  // Hexagon positions (top, top-right, bottom-right, bottom, bottom-left, top-left)
  const angles = [-90, -30, 30, 90, 150, 210];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Center glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: centerSize + 40,
          height: centerSize + 40,
          borderRadius: (centerSize + 40) / 2,
          backgroundColor: ACCENT + '20',
          transform: [{ scale: centerPulse }],
        }}
      />
      
      {/* Center ring */}
      <View
        style={{
          width: centerSize,
          height: centerSize,
          borderRadius: centerSize / 2,
          borderWidth: 4,
          borderColor: ACCENT,
          backgroundColor: BG,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: ACCENT,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Text style={{ fontSize: 12, color: TEXT_SECONDARY, letterSpacing: 1 }}>PHOSM</Text>
      </View>

      {/* 6 Gauge bubbles */}
      {GAUGE_LABELS.map((gauge, i) => {
        const angle = angles[i];
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * gaugeRadius;
        const y = Math.sin(radians) * gaugeRadius;
        const color = GAUGE_COLORS[gauge.key as keyof typeof GAUGE_COLORS];
        const isHighlighted = highlightGauge === gauge.key;
        const isActive = i < activeGauges;

        return (
          <Animated.View
            key={gauge.key}
            style={{
              position: 'absolute',
              left: size / 2 + x - gaugeSize / 2,
              top: size / 2 + y - gaugeSize / 2,
              opacity: gaugeAnims[i],
              transform: [{ scale: gaugeAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
            }}
          >
            {/* Glow */}
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  width: gaugeSize + 20,
                  height: gaugeSize + 20,
                  borderRadius: (gaugeSize + 20) / 2,
                  backgroundColor: color + '30',
                  left: -10,
                  top: -10,
                }}
              />
            )}
            
            {/* Gauge bubble */}
            <View
              style={{
                width: gaugeSize,
                height: gaugeSize,
                borderRadius: gaugeSize / 2,
                borderWidth: 2,
                borderColor: isActive ? color : TEXT_SECONDARY + '40',
                backgroundColor: BG,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isActive ? color : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontSize: gaugeSize * 0.35 }}>{gauge.emoji}</Text>
              {showLabels && (
                <Text style={{ fontSize: 8, color: TEXT_SECONDARY, marginTop: 2 }}>
                  {gauge.label.toUpperCase()}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

// Progress dots
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// Main Onboarding Screen
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { user } = useAuth();

  const {
    name, setName,
    ageGroup, setAgeGroup,
    completeOnboarding,
  } = useUserStore();

  const [nameInput, setNameInput] = useState(name || '');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(ageGroup);

  const TOTAL_STEPS = 6;

  const fadeToNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(s => s + 1);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleContinue = () => {
    if (step === 3 && nameInput.trim()) {
      setName(nameInput.trim());
    }
    if (step === 4 && selectedAge) {
      setAgeGroup(selectedAge);
    }
    if (step === TOTAL_STEPS - 1) {
      finishOnboarding();
      return;
    }
    fadeToNext();
  };

  const finishOnboarding = async () => {
    if (user?.id) {
      await completeOnboardingDb(user.id, {
        name: nameInput.trim(),
        age_group: selectedAge ?? undefined,
      });
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const canContinue = () => {
    if (step === 3) return nameInput.trim().length > 0;
    if (step === 4) return selectedAge !== null;
    return true;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Progress */}
      <View style={styles.header}>
        <ProgressDots current={step + 1} total={TOTAL_STEPS} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Step 0: Meet PHOSM */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <PHOSMHexagon size={280} activeGauges={0} pulseCenter />
            <View style={styles.textContainer}>
              <Text style={styles.title}>This is PHOSM</Text>
              <Text style={styles.subtitle}>
                Personal Health Operating System for the Mind
              </Text>
            </View>
          </View>
        )}

        {/* Step 1: 6 Systems */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <PHOSMHexagon size={280} activeGauges={6} pulseCenter showLabels />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Your mind runs on 6 systems</Text>
              <Text style={styles.subtitle}>
                Body. State. Emotion.{'\n'}Connection. Direction. Alignment.
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Balance */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <PHOSMHexagon size={280} activeGauges={6} pulseCenter />
            <View style={styles.textContainer}>
              <Text style={styles.title}>When they're balanced, you feel it</Text>
              <Text style={styles.subtitle}>
                When they're not, you feel that too.{'\n'}PHOSM helps you see what's happening.
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Name */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.inputSection}>
              <Text style={styles.title}>Let's calibrate your system</Text>
              <Text style={styles.subtitle}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={TEXT_SECONDARY + '80'}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={() => canContinue() && handleContinue()}
              />
            </View>
          </View>
        )}

        {/* Step 4: Age */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.inputSection}>
              <Text style={styles.title}>Hi, {nameInput} 👋</Text>
              <Text style={styles.subtitle}>This helps us speak your language</Text>
              <View style={styles.ageGrid}>
                {AGE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.ageOption,
                      selectedAge === opt.value && styles.ageOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedAge(opt.value);
                    }}
                  >
                    <Text
                      style={[
                        styles.ageOptionText,
                        selectedAge === opt.value && styles.ageOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 5: Ready */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <PHOSMHexagon size={300} activeGauges={6} pulseCenter showLabels />
            <View style={styles.textContainer}>
              <Text style={styles.title}>Your PHOSM is ready</Text>
              <Text style={styles.subtitle}>
                Let's see what your system is telling you.
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue()}
        >
          <Text style={styles.continueButtonText}>
            {step === TOTAL_STEPS - 1 ? 'Enter Your Cockpit' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: ACCENT,
  },
  dotInactive: {
    backgroundColor: TEXT_SECONDARY + '40',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  inputSection: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    backgroundColor: '#111118',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    fontSize: 18,
    color: TEXT_PRIMARY,
    marginTop: 32,
    textAlign: 'center',
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
    maxWidth: 320,
  },
  ageOption: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ageOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT + '20',
  },
  ageOptionText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  ageOptionTextSelected: {
    color: ACCENT,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
