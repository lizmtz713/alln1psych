/**
 * InGauge Onboarding — Simple version (~1 min)
 *
 * 1. Hook — Life is complicated... Get Started
 * 2. Why you're here — Fix message / Feeling / Relationships / Practice / Just explore
 * 3. Immediate value — Inline taste (tone check, check-in, repair, or explore)
 * 4. Show the system — Signals, Tools, Learning
 * 5. Permissions (optional) — Health/Oura, skip
 * 6. Legal & Consent
 * 7. Quick Setup (name, optional age)
 * 8. Cockpit — Your Cockpit is ready + highlight (first check-in or Tone Check)
 *
 * See docs/ONBOARDING-SIMPLE.md
 */

import React, { useState, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/stores/userStore';
import { APP_CONFIG } from '../../src/lib/constants';
import { useAuth } from '../../src/providers/AuthProvider';
import { completeOnboarding as completeOnboardingDb } from '../../src/services/database';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGE_REQUIREMENT } from '../../src/data/legalDisclaimers';
import { analyzeToneForMessage } from '../../src/services/ai';

const BG = '#0F0B1E';
const SURFACE = '#1A1528';
const ACCENT = '#7C4DFF';
const ACCENT_LIGHT = '#B388FF';
const TEXT = '#F5F5F7';
const TEXT_MUTED = '#9E9E9E';

const TERMS_URL = 'https://alln1network.com/terms';
const PRIVACY_URL = 'https://alln1network.com/privacy';
const CONSENT_STORAGE_KEY = 'onboarding_legal_consent_at';

const TOTAL_STEPS = 8;

type WhyChoice = 'fix_message' | 'feeling' | 'relationships' | 'practice' | 'explore' | null;
const WHY_OPTIONS: { id: WhyChoice; label: string }[] = [
  { id: 'fix_message', label: 'Fix a message or conversation' },
  { id: 'feeling', label: 'Understand how I\'m feeling' },
  { id: 'relationships', label: 'Improve my relationships' },
  { id: 'practice', label: 'Practice difficult conversations' },
  { id: 'explore', label: 'Just explore' },
];

const SYSTEM_CARDS: { icon: string; title: string; subtitle: string }[] = [
  { icon: '📡', title: 'Signals', subtitle: 'See what\'s happening' },
  { icon: '🔧', title: 'Tools', subtitle: 'Handle real situations' },
  { icon: '📚', title: 'Learning', subtitle: 'Build real-life skills' },
];

// ─── Shared step wrapper ───────────────────────────────────────────────────
function StepLayout({
  children,
  onNext,
  ctaLabel,
  ctaDisabled,
  showBack,
  onBack,
  hideCta,
}: {
  children: React.ReactNode;
  onNext: () => void;
  ctaLabel: string;
  ctaDisabled?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  /** When true, no Next button — e.g. step advances on option tap */
  hideCta?: boolean;
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
      {!hideCta && (
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
      )}
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

  const [whyChoice, setWhyChoice] = useState<WhyChoice>(null);
  const [toneMessage, setToneMessage] = useState('');
  const [toneResult, setToneResult] = useState<{ tone: string; possibleImpact: string; alternativePhrasing: string } | null>(null);
  const [toneAnalyzing, setToneAnalyzing] = useState(false);
  const [feelingQuick, setFeelingQuick] = useState<'good' | 'okay' | 'low' | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeHealth, setAgreeHealth] = useState(false);
  const [agreeAI, setAgreeAI] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [quickName, setQuickName] = useState(() => useUserStore.getState().name ?? '');
  const [quickBirthYear, setQuickBirthYear] = useState('');

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
    if (agreeTerms && agreePrivacy && agreeHealth && agreeAI && agreeAge) {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, new Date().toISOString());
    }
    if (feelingQuick == null) {
      updateBody(50);
      updateState(50);
      updateEmotion(50);
      updateConnection(50);
      updateDirection(50);
      updateAlignment(50);
    }
    completeOnboarding();
    requestAnimationFrame(() => router.replace('/(tabs)'));
  };

  const runToneCheck = useCallback(async () => {
    const text = toneMessage.trim();
    if (!text) return;
    setToneAnalyzing(true);
    setToneResult(null);
    try {
      const res = await analyzeToneForMessage(text);
      if (res) setToneResult(res);
      else Alert.alert('Need API key', 'Add your OpenAI key in Me → Bring Your Own Key to use Tone Check.');
    } catch (e) {
      Alert.alert('Something went wrong', 'Try again or skip for now.');
    } finally {
      setToneAnalyzing(false);
    }
  }, [toneMessage]);

  const applyFeelingToGauges = useCallback(() => {
    if (feelingQuick == null) return;
    const s = feelingQuick === 'good' ? 70 : feelingQuick === 'okay' ? 50 : 30;
    updateState(s);
    updateEmotion(s);
    updateBody(50);
    updateConnection(50);
    updateDirection(50);
    updateAlignment(50);
    setLastCheckInDate(new Date().toISOString().slice(0, 10));
  }, [feelingQuick, updateState, updateEmotion, updateBody, updateConnection, updateDirection, updateAlignment, setLastCheckInDate]);

  const canProceedLegal = agreeTerms && agreePrivacy && agreeHealth && agreeAI && agreeAge;
  const canProceedSetup = true;

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
          {/* 1. Hook */}
          {step === 0 && (
            <StepLayout onNext={goNext} ctaLabel="Get Started">
              <View style={s.visualWrap}>
                <Text style={s.title}>Life is complicated.</Text>
                <Text style={s.subtitle}>Most people were never taught how to navigate it.</Text>
                <Text style={s.muted}>InGauge helps you understand yourself, handle difficult conversations, and improve relationships.</Text>
              </View>
            </StepLayout>
          )}

          {/* 2. Why you're here — tap option → go to step 2 immediately (one fewer tap) */}
          {step === 1 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack} hideCta>
              <Text style={s.title}>What would help you most right now?</Text>
              <View style={s.whyList}>
                {WHY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id ?? 'explore'}
                    style={[s.whyCard, whyChoice === opt.id && s.whyCardActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setWhyChoice(opt.id);
                      goNext();
                    }}
                  >
                    <Text style={[s.whyCardText, whyChoice === opt.id && s.whyCardTextActive]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </StepLayout>
          )}

          {/* 3. Immediate value */}
          {step === 2 && (
            <StepLayout
              onNext={() => { if (whyChoice === 'feeling' && feelingQuick != null) applyFeelingToGauges(); goNext(); }}
              ctaLabel="Next"
              ctaDisabled={toneAnalyzing}
              showBack
              onBack={goBack}
            >
              {whyChoice === 'fix_message' && (
                <>
                  <Text style={s.title}>Paste the message you're about to send.</Text>
                  <TextInput
                    style={s.toneInput}
                    placeholder="e.g. Why didn't you respond earlier?"
                    placeholderTextColor={TEXT_MUTED}
                    value={toneMessage}
                    onChangeText={setToneMessage}
                    multiline
                  />
                  <Pressable style={[s.toneBtn, (!toneMessage.trim() || toneAnalyzing) && s.ctaDisabled]} onPress={runToneCheck} disabled={!toneMessage.trim() || toneAnalyzing}>
                    {toneAnalyzing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.ctaText}>See tone feedback</Text>}
                  </Pressable>
                  {toneResult && (
                    <View style={s.toneResult}>
                      <Text style={s.toneResultLabel}>How it may sound</Text>
                      <Text style={s.toneResultText}>{toneResult.tone}</Text>
                      <Text style={s.toneResultLabel}>Try this instead</Text>
                      <Text style={s.toneResultAlt}>{toneResult.alternativePhrasing}</Text>
                    </View>
                  )}
                </>
              )}
              {whyChoice === 'feeling' && (
                <>
                  <Text style={s.title}>How are you doing right now?</Text>
                  <View style={s.chipRow}>
                    {(['good', 'okay', 'low'] as const).map((v) => (
                      <Pressable key={v} style={[s.chip, feelingQuick === v && s.chipActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFeelingQuick(v); }}>
                        <Text style={[s.chipText, feelingQuick === v && s.chipTextActive]}>{v === 'good' ? 'Good' : v === 'okay' ? 'Okay' : 'Low'}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.muted}>We'll use this to set your gauges. You can check in anytime from the Cockpit.</Text>
                </>
              )}
              {whyChoice === 'relationships' && (
                <>
                  <Text style={s.title}>Improve my relationships</Text>
                  <Text style={s.subtitle}>In Tools you'll find Repair Builder and Conversation Builder — they help you turn conflict into clear, respectful messages.</Text>
                  <Text style={s.muted}>You'll try them right after this.</Text>
                </>
              )}
              {whyChoice === 'practice' && (
                <>
                  <Text style={s.title}>Practice difficult conversations</Text>
                  <Text style={s.subtitle}>Role Play lets you rehearse: start a hard conversation, apologize, ask for help, or set a boundary. Find it in Tools.</Text>
                </>
              )}
              {whyChoice === 'explore' && (
                <Text style={s.subtitle}>You can explore the Cockpit, Tools, and Learn at your own pace.</Text>
              )}
            </StepLayout>
          )}

          {/* 4. Show the system — visual mini cards so people remember */}
          {step === 3 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <Text style={s.title}>InGauge helps you navigate life using three things:</Text>
              <View style={s.systemCardList}>
                {SYSTEM_CARDS.map((card) => (
                  <View key={card.title} style={s.systemCard}>
                    <Text style={s.systemCardIcon}>{card.icon}</Text>
                    <View style={s.systemCardBody}>
                      <Text style={s.systemCardTitle}>{card.title}</Text>
                      <Text style={s.systemCardSubtitle}>{card.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={s.muted}>Your Cockpit and tabs connect all three.</Text>
            </StepLayout>
          )}

          {/* 5. Permissions (optional) */}
          {step === 4 && (
            <StepLayout onNext={goNext} ctaLabel="Skip for now" showBack onBack={goBack}>
              <Text style={s.title}>Connect Apple Health or Oura?</Text>
              <Text style={s.subtitle}>Your signals help us suggest the right tools. You can connect later in Me → Preferences.</Text>
            </StepLayout>
          )}

          {/* 6. Legal & Consent */}
          {step === 5 && (
            <StepLayout onNext={goNext} ctaLabel="Agree and Continue" ctaDisabled={!canProceedLegal} showBack onBack={goBack}>
              <Text style={s.legalTitle}>Before we begin</Text>
              <View style={s.legalScroll}>
                <Text style={s.legalSection}>Privacy</Text>
                <Text style={s.legalBody}>{APP_CONFIG.name} stores your personal data privately and securely. Your information is never sold.</Text>
                <Text style={s.legalSection}>Health Disclaimer</Text>
                <Text style={s.legalBody}>{APP_CONFIG.name} provides insights and educational tools but is not medical or psychological advice. This app does not replace professional medical or mental health care.</Text>
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
                <View style={s.checkboxRow}>
                  <Pressable style={s.checkbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgreeAI((v: boolean) => !v); }}>
                    <Text style={s.checkboxText}>{agreeAI ? '✓' : ' '}</Text>
                  </Pressable>
                  <Text style={s.checkboxLabel}>I understand AI responses may not always be accurate and are not professional advice.</Text>
                </View>
                <View style={s.checkboxRow}>
                  <Pressable style={s.checkbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgreeAge((v: boolean) => !v); }}>
                    <Text style={s.checkboxText}>{agreeAge ? '✓' : ' '}</Text>
                  </Pressable>
                  <Text style={s.checkboxLabel}>{AGE_REQUIREMENT.checkboxLabel}</Text>
                </View>
              </View>
            </StepLayout>
          )}

          {/* 7. Quick Setup */}
          {step === 6 && (
            <StepLayout onNext={goNext} ctaLabel="Next" showBack onBack={goBack}>
              <Text style={s.title}>Quick setup</Text>
              <Text style={s.subtitle}>Only what we need to get started.</Text>
              <TextInput
                style={s.input}
                placeholder="Your name (optional)"
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

          {/* 8. Cockpit */}
          {step === 7 && (
            <StepLayout onNext={finishOnboarding} ctaLabel="Open Cockpit" showBack onBack={goBack}>
              <View style={s.visualWrap}>
                <Text style={s.welcomeEmoji}>🌡️</Text>
                <Text style={s.title}>Your Cockpit is ready.</Text>
                <Text style={s.subtitle}>Try your first check-in, or need help with a message? You'll find both from the dashboard.</Text>
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
  reframe: { fontSize: 12, color: TEXT_MUTED, fontStyle: 'italic', marginTop: 12, textAlign: 'center', paddingHorizontal: 8 },
  cta: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 24, backgroundColor: ACCENT, minWidth: 200, alignItems: 'center' },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  ctaTextDisabled: { color: '#AAA' },
  welcomeEmoji: { fontSize: 48, marginBottom: 16 },
  whyList: { width: '100%', marginTop: 16, gap: 10 },
  whyCard: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: SURFACE, borderWidth: 1, borderColor: TEXT_MUTED + '40', marginBottom: 8 },
  whyCardActive: { borderColor: ACCENT, backgroundColor: ACCENT + '18' },
  whyCardText: { fontSize: 15, color: TEXT },
  whyCardTextActive: { color: ACCENT_LIGHT, fontWeight: '600' },
  toneInput: { width: '100%', backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: ACCENT + '50', padding: 14, fontSize: 15, color: TEXT, minHeight: 80, marginTop: 12 },
  toneBtn: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, backgroundColor: ACCENT, alignItems: 'center' },
  toneResult: { marginTop: 16, padding: 14, backgroundColor: SURFACE, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: ACCENT },
  toneResultLabel: { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, marginBottom: 4 },
  toneResultText: { fontSize: 15, color: TEXT, marginBottom: 8 },
  toneResultAlt: { fontSize: 14, fontStyle: 'italic', color: ACCENT_LIGHT },
  systemList: { width: '100%', marginTop: 16 },
  systemItem: { fontSize: 15, color: TEXT, marginBottom: 12, lineHeight: 22 },
  systemBold: { fontWeight: '700', color: TEXT },
  systemCardList: { width: '100%', marginTop: 16, gap: 10 },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: TEXT_MUTED + '40',
  },
  systemCardIcon: { fontSize: 28, marginRight: 14 },
  systemCardBody: { flex: 1 },
  systemCardTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 2 },
  systemCardSubtitle: { fontSize: 14, color: TEXT_MUTED },
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
