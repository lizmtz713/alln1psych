/**
 * InGauge 3-Minute Onboarding
 *
 * Three screens. One mental model per screen. No tutorials.
 * Goal: Understand the relationship system in ~3 minutes.
 *
 * Screen 1 — Your Relationship Universe (Constellation)
 * Screen 2 — Relationships Change (no guilt)
 * Screen 3 — Small Moments Matter → Open Signals
 *
 * Never use in copy: Momentum, Season, Decay, Algorithm.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BG = '#0F0B1E';
const SURFACE = '#1A1528';
const ACCENT = '#7C4DFF';
const ACCENT_LIGHT = '#B388FF';
const TEXT = '#F5F5F7';
const TEXT_MUTED = '#9E9E9E';

const CENTER_R = 24;
const NODE_R = 20;
const ORBIT = 100;

// ─── Screen 1: Simplified Constellation ───────────────────────────────────
function ConstellationVisual() {
  const labels = [
    { label: 'friend', angle: -140 },
    { label: 'friend', angle: -60 },
    { label: 'family', angle: -170 },
    { label: 'partner', angle: 0 },
    { label: 'mentor', angle: 160 },
    { label: 'friend', angle: 60 },
  ];
  return (
    <View style={onboardStyles.visualContainer}>
      {/* Lines from center to nodes */}
      {labels.map(({ angle }, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * ORBIT;
        const y = Math.sin(rad) * ORBIT;
        return (
          <View
            key={i}
            style={[
              onboardStyles.constellationLine,
              {
                width: Math.hypot(x, y),
                left: ORBIT + CENTER_R,
                top: ORBIT + CENTER_R,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
      {/* Center (YOU) */}
      <View
        style={[
          onboardStyles.centerNode,
          {
            left: ORBIT + CENTER_R - CENTER_R,
            top: ORBIT + CENTER_R - CENTER_R,
            width: CENTER_R * 2,
            height: CENTER_R * 2,
            borderRadius: CENTER_R,
          },
        ]}
      >
        <Text style={onboardStyles.centerLabel}>YOU</Text>
      </View>
      {/* Orbiting nodes */}
      {labels.map(({ label, angle }, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = ORBIT + Math.cos(rad) * ORBIT - NODE_R;
        const y = ORBIT + Math.sin(rad) * ORBIT - NODE_R;
        return (
          <View
            key={i}
            style={[
              onboardStyles.orbitNode,
              { left: x, top: y, width: NODE_R * 2, height: NODE_R * 2, borderRadius: NODE_R },
            ]}
          >
            <Text style={onboardStyles.orbitLabel} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen 2: Node brightening and dimming ──────────────────────────────────
function RelationshipPulseVisual() {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: 0.92,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) loop();
      });
    };
    loop();
  }, [opacity, scale]);

  return (
    <View style={onboardStyles.visualContainer}>
      <Animated.View
        style={[
          onboardStyles.pulseNode,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={onboardStyles.pulseLabel}>Friend</Text>
      </Animated.View>
    </View>
  );
}

// ─── Screen 3: Send → node glows ────────────────────────────────────────────
function SmallMomentsVisual() {
  const glow = useRef(new Animated.Value(0)).current;
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (!showGlow) return;
    Animated.timing(glow, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [showGlow, glow]);

  useEffect(() => {
    const t = setTimeout(() => setShowGlow(true), 400);
    return () => clearTimeout(t);
  }, []);

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <View style={onboardStyles.visualContainer}>
      <View style={onboardStyles.sendRow}>
        <View style={onboardStyles.sendPill}>
          <Text style={onboardStyles.sendPillText}>Send encouragement</Text>
        </View>
        <Text style={onboardStyles.sendArrow}>↓</Text>
      </View>
      <View style={onboardStyles.glowNodeWrap}>
        <Animated.View
          style={[
            onboardStyles.glowHalo,
            {
              opacity: glowOpacity,
            },
          ]}
        />
        <View style={onboardStyles.glowNode}>
          <Text style={onboardStyles.glowNodeLabel}>Node glows</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Shared screen layout ───────────────────────────────────────────────────
function OnboardStep({
  visual,
  title,
  subtitle,
  extraLines,
  ctaLabel,
  onNext,
  isLast,
}: {
  visual: React.ReactNode;
  title: string;
  subtitle: string;
  extraLines?: string[];
  ctaLabel: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <View style={onboardStyles.step}>
      <View style={onboardStyles.visualWrap}>{visual}</View>
      <Text style={onboardStyles.title}>{title}</Text>
      <Text style={onboardStyles.subtitle}>{subtitle}</Text>
      {extraLines && extraLines.length > 0 && (
        <View style={onboardStyles.extraLines}>
          {extraLines.map((line, i) => (
            <Text key={i} style={onboardStyles.extraLineText}>
              {line}
            </Text>
          ))}
        </View>
      )}
      <Pressable
        style={({ pressed }) => [onboardStyles.cta, pressed && onboardStyles.ctaPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNext();
        }}
      >
        <Text style={onboardStyles.ctaText}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const { user } = useAuth();
  const { completeOnboarding } = useUserStore();

  const TOTAL_STEPS = 3;

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      finishOnboarding();
      return;
    }
    Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setStep((s) => s + 1);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  const finishOnboarding = async () => {
    if (user?.id) {
      await completeOnboardingDb(user.id, {
        name: useUserStore.getState().name ?? null,
        age_group: useUserStore.getState().ageGroup ?? null,
        communication_preference: null,
        love_language: null,
      });
    }
    completeOnboarding();
    router.replace('/(tabs)/signals');
  };

  return (
    <View style={[onboardStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={onboardStyles.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[onboardStyles.dot, i === step && onboardStyles.dotActive]}
          />
        ))}
      </View>

      <Animated.View style={[onboardStyles.content, { opacity: fade }]}>
        {step === 0 && (
          <OnboardStep
            visual={<ConstellationVisual />}
            title="Your life is shaped by the people around you."
            subtitle="InGauge helps you see and care for the relationships that matter."
            ctaLabel="Next"
            onNext={goNext}
            isLast={false}
          />
        )}
        {step === 1 && (
          <OnboardStep
            visual={<RelationshipPulseVisual />}
            title="Relationships naturally strengthen, drift, and reconnect."
            subtitle="InGauge understands these rhythms."
            extraLines={[
              'Some relationships grow.',
              'Some stay steady.',
              'Some go quiet for a while.',
            ]}
            ctaLabel="Next"
            onNext={goNext}
            isLast={false}
          />
        )}
        {step === 2 && (
          <OnboardStep
            visual={<SmallMomentsVisual />}
            title="Small moments keep relationships strong."
            subtitle="A quick message can make a real difference."
            ctaLabel="Open Signals"
            onNext={goNext}
            isLast={true}
          />
        )}
      </Animated.View>
    </View>
  );
}

const onboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEXT_MUTED + '50',
  },
  dotActive: {
    backgroundColor: ACCENT,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  step: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  visualContainer: {
    width: ORBIT * 2 + NODE_R * 4,
    height: ORBIT * 2 + NODE_R * 4,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  extraLines: {
    marginBottom: 24,
  },
  extraLineText: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 2,
  },
  cta: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: ACCENT,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  // Screen 1 constellation
  constellationLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: SURFACE,
  },
  centerNode: {
    position: 'absolute',
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  orbitNode: {
    position: 'absolute',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: TEXT_MUTED + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: 'capitalize',
  },
  // Screen 2 pulse
  pulseNode: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ACCENT_LIGHT + '60',
  },
  pulseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  // Screen 3 send → glow
  sendRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sendPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: ACCENT + '60',
  },
  sendPillText: {
    fontSize: 14,
    color: ACCENT_LIGHT,
    fontWeight: '600',
  },
  sendArrow: {
    fontSize: 20,
    color: TEXT_MUTED,
    marginTop: 8,
  },
  glowNodeWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ACCENT,
  },
  glowNode: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowNodeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});
