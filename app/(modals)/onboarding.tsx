/**
 * InGauge Onboarding — Human OS flow (~60 sec)
 *
 * 1. Welcome
 * 2. Human System (6 gauges)
 * 3. Your Cockpit
 * 4. Relationships (Signals)
 * 5. Tools + Manual
 * 6. Legal & Consent
 * 7. Quick Setup (name, optional age)
 * 8. First Check-In (3 questions → initialize gauges)
 * 9. Enter Cockpit
 *
 * No jargon: momentum, seasons, algorithm, constellation logic.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#0F0B1E';
const SURFACE = '#1A1528';
const ACCENT = '#7C4DFF';
const ACCENT_LIGHT = '#B388FF';
const TEXT = '#F5F5F7';
const TEXT_MUTED = '#9E9E9E';

const CENTER_R = 28;
const GAUGE_R = 14;
const ORBIT = 72;

const TERMS_URL = 'https://alln1network.com/terms';
const PRIVACY_URL = 'https://alln1network.com/privacy';
const CONSENT_STORAGE_KEY = 'onboarding_legal_consent_at';

const GAUGE_ANGLES: { label: string; angle: number }[] = [
  { label: 'Body', angle: -90 },
  { label: 'State', angle: -30 },
  { label: 'Emotion', angle: 30 },
  { label: 'Connection', angle: 90 },
  { label: 'Direction', angle: 150 },
  { label: 'Alignment', angle: 210 },
];

const TOTAL_STEPS = 9;

// ─── Shared step wrapper ───────────────────────────────────────────────────
function StepLayout({
  children,
  onNext,
  ctaLabel,
  ctaDisabled,
  showBack,
  onBack,
}: {
  children: React.ReactNode;
  onNext: () => void;
  ctaLabel: string;
  ctaDisabled?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}) {
  return (
    <View style={s.step}>
      {showBack && onBack && (
        <Pressable
          style={s.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
        >
          <Text style={s.backBtnText}>Back</Text>
        </Pressable>
      )}
      {children}
      <Pressable
        style={({ pressed }) => [s.cta, (ctaDisabled || pressed) && s.ctaDisabled]}
        onPress={() => {
          if (ctaDisabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNext();
        }}
        disabled={ctaDisabled}
      >
        <Text style={[s.ctaText, ctaDisabled && s.ctaTextDisabled]}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const { user } = useAuth();
  const { completeOnboarding, setName, setAgeGroup } = useUserStore();
  const updateBody = useCockpitStore((s) => s.updateBody);
  const updateState = useCockpitStore((s) => s.updateState);
  const updateEmotion = useCockpitStore((s) => s.updateEmotion);
  const updateConnection = useCockpitStore((s) => s.updateConnection);
  const updateDirection = useCockpitStore((s) => s.updateDirection);
  const updateAlignment = useCockpitStore((s) => s.updateAlignment);
  const setLastCheckInDate = useCockpitStore((s) => s.setLastCheckInDate);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeHealth, setAgreeHealth] = useState(false);
  const [quickName, setQuickName] = useState(() => useUserStore.getState().name ?? '');
  const [quickBirthYear, setQuickBirthYear] = useState('');
  const [sleepAnswer, setSleepAnswer] = useState<'good' | 'okay' | 'poor' | null>(null);
  const [feelingAnswer, setFeelingAnswer] = useState<'good' | 'okay' | 'low' | null>(null);
  const [onMindAnswer, setOnMindAnswer] = useState<'yes' | 'abit' | 'no' | null>(null);

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      finishOnboarding();
      return;
    }
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep((prev) => prev + 1);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goBack = () => {
    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep((prev) => Math.max(0, prev - 1));
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const finishOnboarding = async () => {
    const nameVal = (quickName ?? '').trim();
    const nameToSave = nameVal || (useUserStore.getState().name ?? null);
    if (nameVal) setName(nameVal);
    const birthVal = (quickBirthYear ?? '').trim();
    const birthYear = birthVal ? parseInt(birthVal, 10) : null;
    if (birthYear != null && !Number.isNaN(birthYear)) {
      const age = new Date().getFullYear() - birthYear;
      if (age >= 60) setAgeGroup('60+');
      else if (age >= 41) setAgeGroup('41-60');
      else if (age >= 26) setAgeGroup('26-40');
      else if (age >= 18) setAgeGroup('18-25');
      else if (age >= 13) setAgeGroup('13-17');
      else setAgeGroup('under13');
    }
    if (user?.id) {
      try {
        await completeOnboardingDb(user.id, {
          name: nameToSave,
          age_group: useUserStore.getState().ageGroup ?? null,
          communication_preference: null,
          love_language: null,
        });
      } catch (e) {
        if (__DEV__) console.warn('Onboarding DB complete failed:', e);
      }
    }
    if (agreeTerms && agreePrivacy && agreeHealth) {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, new Date().toISOString());
    }
    completeOnboarding();
    requestAnimationFrame(() => router.replace('/(tabs)'));
  };

  const applyFirstCheckIn = () => {
    const bodyScore = sleepAnswer === 'good' ? 75 : sleepAnswer === 'okay' ? 50 : 25;
    const stateScore = feelingAnswer === 'good' ? 70 : feelingAnswer === 'okay' ? 50 : 30;
    const directionScore = onMindAnswer === 'yes' ? 45 : onMindAnswer === 'abit' ? 60 : 75;
    updateBody(sleepAnswer != null ? bodyScore : 50);
    updateState(feelingAnswer != null ? stateScore : 50);
    updateEmotion(feelingAnswer != null ? stateScore : 50);
    updateConnection(50);
    updateDirection(onMindAnswer != null ? directionScore : 50);
    updateAlignment(50);
    setLastCheckInDate(new Date().toISOString().slice(0, 10));
  };

  const canProceedLegal = agreeTerms && agreePrivacy && agreeHealth;
  const canProceedSetup = (quickName ?? '').trim().length > 0;
  const canProceedCheckIn = sleepAnswer != null && feelingAnswer != null && onMindAnswer != null;

  return (
    <KeyboardAvoidingView
      style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={s.dots}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={[s.dot, i === step && s.dotActive]} />
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[s.content, { opacity: fade }]}>
          {/* 1. Welcome */}
          {step === 0 && (
            <StepLayout onNext={goNext} ctaLabel="Begin">
              <View style={s.visualWrap}>
                <Text style={s.welcomeEmoji}>✈️</Text>
                <Text style={s.title}>Welcome to your Human Operating System.</Text>
                <Text style={s.subtitle}>
                  Understand yourself, strengthen relationships, and navigate life with clarity.
                </Text>
                <Text style={s.muted}>Built using psychology, behavioral science, and systems thinking.</Text>
              </View>
            </StepLayout>
          )}

          {/* 2. Human System */}
          {step === 1 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <View style={s.hexWrap}>
                  {GAUGE_ANGLES.map(({ label, angle }, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = ORBIT + Math.cos(rad) * ORBIT - GAUGE_R;
                    const y = ORBIT + Math.sin(rad) * ORBIT - GAUGE_R;
                    return (
                      <View
                        key={i}
                        style={[s.gaugeNode, { left: x, top: y, width: GAUGE_R * 2, height: GAUGE_R * 2, borderRadius: GAUGE_R }]}
                      >
                        <Text style={s.gaugeNodeLabel}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={s.title}>Every human system runs on six core signals.</Text>
                <Text style={s.subtitle}>InGauge helps you understand and balance them.</Text>
              </View>
            </StepLayout>
          )}

          {/* 3. Your Cockpit */}
          {step === 2 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <View style={s.hexWrap}>
                  <View style={[s.centerNode, { left: ORBIT + CENTER_R - CENTER_R, top: ORBIT + CENTER_R - CENTER_R, width: CENTER_R * 2, height: CENTER_R * 2, borderRadius: CENTER_R }]}>
                    <Text style={s.centerLabel}>SYSTEM</Text>
                  </View>
                  {GAUGE_ANGLES.map(({ label, angle }, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = ORBIT + Math.cos(rad) * ORBIT - GAUGE_R;
                    const y = ORBIT + Math.sin(rad) * ORBIT - GAUGE_R;
                    return (
                      <View key={i} style={[s.gaugeNode, { left: x, top: y, width: GAUGE_R * 2, height: GAUGE_R * 2, borderRadius: GAUGE_R }]}>
                        <Text style={s.gaugeNodeLabel}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={s.title}>The Cockpit shows how your system is doing in one glance.</Text>
                <Text style={s.subtitle}>Check in, understand patterns, and see what matters today.</Text>
              </View>
            </StepLayout>
          )}

          {/* 4. Relationships */}
          {step === 3 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <View style={s.constellationWrap}>
                  <View style={s.constellationCenter}><Text style={s.centerLabel}>YOU</Text></View>
                  {[0, 1, 2].map((i) => {
                    const angle = i * 120 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const x = 80 + Math.cos(rad) * 70 - 18;
                    const y = 80 + Math.sin(rad) * 70 - 18;
                    return (
                      <View key={i} style={[s.orbitNode, { left: x, top: y }]}>
                        <Text style={s.orbitLabel}>•</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={s.title}>Relationships shape your human system.</Text>
                <Text style={s.subtitle}>InGauge helps you notice who matters and stay connected.</Text>
              </View>
            </StepLayout>
          )}

          {/* 5. Tools + Manual */}
          {step === 4 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <Text style={s.title}>When life gets complicated, InGauge helps.</Text>
                <View style={s.bulletList}>
                  <Text style={s.bullet}>• Decode conversations</Text>
                  <Text style={s.bullet}>• Resolve conflict</Text>
                  <Text style={s.bullet}>• Understand emotions</Text>
                  <Text style={s.bullet}>• Learn the science of being human</Text>
                </View>
                <Text style={s.subtitle}>Tools and the Manual are there when you need them.</Text>
              </View>
            </StepLayout>
          )}

          {/* 6. Legal & Consent */}
          {step === 5 && (
            <StepLayout onNext={goNext} ctaLabel="Agree and Continue" ctaDisabled={!canProceedLegal} showBack onBack={goBack}>
              <Text style={s.legalTitle}>Before we begin</Text>
              <View style={s.legalScroll}>
                <Text style={s.legalSection}>Privacy</Text>
                <Text style={s.legalBody}>InGauge stores your personal data privately and securely. Your information is never sold.</Text>
                <Text style={s.legalSection}>Health Disclaimer</Text>
                <Text style={s.legalBody}>InGauge provides insights and educational tools but is not medical or psychological advice. This app does not replace professional medical or mental health care.</Text>
                <Text style={s.legalSection}>Data Use</Text>
                <Text style={s.legalBody}>Your data may be used to generate insights and improve the system. You can export your data from settings.</Text>
                <View style={s.checkboxRow}>
                  <Pressable style={s.checkbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgreeTerms((v) => !v); }}>
                    <Text style={s.checkboxText}>{agreeTerms ? '✓' : ' '}</Text>
                  </Pressable>
                  <Text style={s.checkboxLabel}>I agree to the </Text>
                  <Pressable onPress={() => Linking.openURL(TERMS_URL)}>
                    <Text style={s.link}>Terms of Service</Text>
                  </Pressable>
                </View>
                <View style={s.checkboxRow}>
                  <Pressable style={s.checkbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgreePrivacy((v) => !v); }}>
                    <Text style={s.checkboxText}>{agreePrivacy ? '✓' : ' '}</Text>
                  </Pressable>
                  <Text style={s.checkboxLabel}>I agree to the </Text>
                  <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
                    <Text style={s.link}>Privacy Policy</Text>
                  </Pressable>
                </View>
                <View style={s.checkboxRow}>
                  <Pressable style={s.checkbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgreeHealth((v) => !v); }}>
                    <Text style={s.checkboxText}>{agreeHealth ? '✓' : ' '}</Text>
                  </Pressable>
                  <Text style={s.checkboxLabel}>I understand this app does not replace professional medical or mental health care.</Text>
                </View>
              </View>
            </StepLayout>
          )}

          {/* 7. Quick Setup */}
          {step === 6 && (
            <StepLayout onNext={goNext} ctaLabel="Next" ctaDisabled={!canProceedSetup} showBack onBack={goBack}>
              <Text style={s.title}>Quick setup</Text>
              <Text style={s.subtitle}>Only what we need to get started.</Text>
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={TEXT_MUTED}
                value={quickName}
                onChangeText={setQuickName}
                autoCapitalize="words"
                maxLength={80}
              />
              <TextInput
                style={[s.input, s.inputOptional]}
                placeholder="Birth year (optional)"
                placeholderTextColor={TEXT_MUTED}
                value={quickBirthYear}
                onChangeText={setQuickBirthYear}
                keyboardType="number-pad"
                maxLength={4}
              />
            </StepLayout>
          )}

          {/* 8. First Check-In */}
          {step === 7 && (
            <StepLayout
              onNext={() => {
                applyFirstCheckIn();
                goNext();
              }}
              ctaLabel="Next"
              ctaDisabled={!canProceedCheckIn}
              showBack
              onBack={goBack}
            >
              <Text style={s.title}>First check-in</Text>
              <Text style={s.subtitle}>Three quick questions to initialize your Cockpit.</Text>
              <Text style={s.question}>How did you sleep?</Text>
              <View style={s.chipRow}>
                {(['good', 'okay', 'poor'] as const).map((v) => (
                  <Pressable key={v} style={[s.chip, sleepAnswer === v && s.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSleepAnswer(v); }}>
                    <Text style={[s.chipText, sleepAnswer === v && s.chipTextActive]}>{v === 'good' ? 'Good' : v === 'okay' ? 'Okay' : 'Poor'}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.question}>How are you feeling?</Text>
              <View style={s.chipRow}>
                {(['good', 'okay', 'low'] as const).map((v) => (
                  <Pressable key={v} style={[s.chip, feelingAnswer === v && s.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFeelingAnswer(v); }}>
                    <Text style={[s.chipText, feelingAnswer === v && s.chipTextActive]}>{v === 'good' ? 'Good' : v === 'okay' ? 'Okay' : 'Low'}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.question}>Anything on your mind today?</Text>
              <View style={s.chipRow}>
                {(['yes', 'abit', 'no'] as const).map((v) => (
                  <Pressable key={v} style={[s.chip, onMindAnswer === v && s.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOnMindAnswer(v); }}>
                    <Text style={[s.chipText, onMindAnswer === v && s.chipTextActive]}>{v === 'yes' ? 'Yes' : v === 'abit' ? 'A bit' : 'No'}</Text>
                  </Pressable>
                ))}
              </View>
            </StepLayout>
          )}

          {/* 9. Enter Cockpit */}
          {step === 8 && (
            <StepLayout onNext={finishOnboarding} ctaLabel="Open Cockpit" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <Text style={s.welcomeEmoji}>🌡️</Text>
                <Text style={s.title}>Your Cockpit is ready.</Text>
                <Text style={s.subtitle}>You'll see your six gauges and what matters today.</Text>
              </View>
            </StepLayout>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 12, paddingBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEXT_MUTED + '50' },
  dotActive: { backgroundColor: ACCENT },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  content: { flex: 1, minHeight: 400 },
  step: { alignItems: 'center', width: '100%', maxWidth: 360, alignSelf: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16, paddingVertical: 8, paddingHorizontal: 4 },
  backBtnText: { fontSize: 16, color: ACCENT_LIGHT, fontWeight: '600' },
  visualWrap: { alignItems: 'center', marginBottom: 24, width: '100%' },
  title: { fontSize: 22, fontWeight: '700', color: TEXT, textAlign: 'center', marginBottom: 10, lineHeight: 28 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  muted: { fontSize: 13, color: TEXT_MUTED, fontStyle: 'italic', marginTop: 4 },
  cta: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 24, backgroundColor: ACCENT, minWidth: 200, alignItems: 'center' },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  ctaTextDisabled: { color: '#AAA' },
  welcomeEmoji: { fontSize: 48, marginBottom: 16 },
  hexWrap: { width: ORBIT * 2 + GAUGE_R * 4, height: ORBIT * 2 + GAUGE_R * 4, position: 'relative', marginBottom: 20 },
  centerNode: { position: 'absolute', backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  gaugeNode: { position: 'absolute', backgroundColor: SURFACE, borderWidth: 1.5, borderColor: ACCENT + '80', alignItems: 'center', justifyContent: 'center' },
  gaugeNodeLabel: { fontSize: 9, color: TEXT, fontWeight: '600' },
  constellationWrap: { width: 160, height: 160, position: 'relative', marginBottom: 20 },
  constellationCenter: { position: 'absolute', left: 64, top: 64, width: 32, height: 32, borderRadius: 16, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  orbitNode: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: SURFACE, borderWidth: 1, borderColor: ACCENT + '60', alignItems: 'center', justifyContent: 'center' },
  orbitLabel: { fontSize: 18, color: TEXT },
  bulletList: { alignSelf: 'stretch', marginVertical: 12 },
  bullet: { fontSize: 15, color: TEXT_MUTED, marginBottom: 6 },
  legalTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 16, textAlign: 'center' },
  legalScroll: { marginBottom: 16 },
  legalSection: { fontSize: 14, fontWeight: '700', color: ACCENT_LIGHT, marginTop: 12, marginBottom: 4 },
  legalBody: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, flexWrap: 'wrap' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxText: { fontSize: 14, color: ACCENT, fontWeight: '700' },
  checkboxLabel: { fontSize: 14, color: TEXT_MUTED },
  link: { fontSize: 14, color: ACCENT_LIGHT, fontWeight: '600', textDecorationLine: 'underline' },
  input: { width: '100%', backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: ACCENT + '50', paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, color: TEXT, marginTop: 12 },
  inputOptional: { marginTop: 8 },
  question: { fontSize: 16, fontWeight: '600', color: TEXT, marginTop: 16, marginBottom: 8, alignSelf: 'stretch' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'stretch', marginBottom: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: TEXT_MUTED + '40' },
  chipActive: { borderColor: ACCENT, backgroundColor: ACCENT + '20' },
  chipText: { fontSize: 15, color: TEXT_MUTED },
  chipTextActive: { color: ACCENT_LIGHT, fontWeight: '600' },
});
