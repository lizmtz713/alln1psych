/**
 * InGauge Onboarding — Simple version (~1 min)
 *
 * 1. Hook — Clear daily value proposition
 * 2. Why you're here — Fix message / Feeling / Relationships / Practice / Just explore
 * 3. Immediate value — Inline taste (tone check, check-in, repair, or explore)
 * 4. Show the system — Signals, Tools, Learning
 * 5. Permissions (optional) — Apple Health, skip
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
import {
  completeOnboarding as completeOnboardingDb,
  recordLegalConsents,
} from '../../src/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGE_REQUIREMENT } from '../../src/data/legalDisclaimers';
import { analyzeToneForMessage } from '../../src/services/ai';

const BG = '#0F0B1E';
const SURFACE = '#1A1528';
const ACCENT = '#7C4DFF';
const ACCENT_LIGHT = '#B388FF';
const TEXT = '#F5F5F7';
const TEXT_MUTED = '#9E9E9E';

const TERMS_URL = 'https://getingauge.com/terms';
const PRIVACY_URL = 'https://getingauge.com/privacy';
const CONSENT_STORAGE_KEY = 'onboarding_legal_consent_at';
const LEGAL_VERSION = '2026-07-13';

const TOTAL_STEPS = 8;

function formatBirthdayInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseBirthday(value: string): { iso: string; age: number } | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const today = new Date();
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1900 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  ) return null;
  let age = today.getUTCFullYear() - year;
  const birthdayPassed =
    today.getUTCMonth() + 1 > month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() >= day);
  if (!birthdayPassed) age -= 1;
  if (age < AGE_REQUIREMENT.minimumAge || age > 125) return null;
  return {
    iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    age,
  };
}

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
  const { completeOnboarding, setName, setAgeGroup, setBirthday } = useUserStore();

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
  const [quickBirthday, setQuickBirthday] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      void finishOnboarding();
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
    if (isFinishing) return;
    const nameVal = (quickName ?? '').trim();
    const nameToSave = nameVal || useUserStore.getState().name || 'Friend';
    const birthday = parseBirthday(quickBirthday.trim());
    if (!birthday) {
      Alert.alert('Age confirmation required', AGE_REQUIREMENT.statement);
      return;
    }
    if (!user?.id) {
      Alert.alert('Sign-in required', 'Your session expired. Sign in again to finish setup.');
      return;
    }

    const ageGroup = birthday.age >= 60 ? '60+' : birthday.age >= 41 ? '41-60' : birthday.age >= 26 ? '26-40' : '18-25';
    const acceptedAt = new Date().toISOString();
    setIsFinishing(true);
    try {
      const [profileResult, consentResult] = await Promise.all([
        completeOnboardingDb(user.id, {
          name: nameToSave,
          age_group: ageGroup,
          communication_preference: null,
          love_language: null,
          birthday: birthday.iso,
        }),
        recordLegalConsents(user.id, acceptedAt, {
          terms: LEGAL_VERSION,
          privacy: LEGAL_VERSION,
        }),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (consentResult.error) throw consentResult.error;

      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, acceptedAt);
      setName(nameToSave);
      setAgeGroup(ageGroup);
      setBirthday(birthday.iso);
      completeOnboarding();
      router.replace('/(tabs)');
      requestAnimationFrame(() => router.push('/(modals)/cockpit-checkin'));
    } catch (error) {
      if (__DEV__) console.warn('Onboarding persistence failed:', error);
      Alert.alert(
        'Setup not saved',
        'Your account setup could not be saved. Check your connection and try again.'
      );
    } finally {
      setIsFinishing(false);
    }
  };

  const runToneCheck = useCallback(async () => {
    const text = toneMessage.trim();
    if (!text) return;
    setToneAnalyzing(true);
    setToneResult(null);
    try {
      const res = await analyzeToneForMessage(text);
      if (res) setToneResult(res);
      else Alert.alert('Could not connect', 'Tone feedback is temporarily unavailable. Try again or skip.');
    } catch (e) {
      Alert.alert('Something went wrong', 'Try again or skip for now.');
    } finally {
      setToneAnalyzing(false);
    }
  }, [toneMessage]);

  const canProceedLegal = agreeTerms && agreePrivacy && agreeHealth && agreeAI && agreeAge;
  const canProceedSetup = parseBirthday(quickBirthday) !== null;

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
                <Text style={s.title}>Know what’s draining you.</Text>
                <Text style={s.subtitle}>A 60-second calibration shows whether today calls for growth or stabilization.</Text>
                <Text style={s.muted}>Track how Body, State, Emotion, Connection, Direction, and Alignment respond over time.</Text>
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
              onNext={goNext}
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
                  <Text style={s.muted}>This helps tailor your first calibration. Your gauges are not set until you complete and save it.</Text>
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
              <Text style={s.title}>Connect Apple Health?</Text>
              <Text style={s.subtitle}>Sleep, activity, and heart signals can support your Body and State gauges. This is optional and can be connected later.</Text>
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
                  <Text style={s.checkboxLabel}>I agree that my check-ins and messages may be securely sent to OpenAI to generate responses. AI output may be inaccurate and is not professional advice.</Text>
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
            <StepLayout onNext={goNext} ctaLabel="Next" ctaDisabled={!canProceedSetup} showBack onBack={goBack}>
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
                style={s.input}
                placeholder="Birthday (MM/DD/YYYY)"
                placeholderTextColor={TEXT_MUTED}
                value={quickBirthday}
                onChangeText={(value) => setQuickBirthday(formatBirthdayInput(value))}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={s.muted}>Used for age-appropriate guidance and an optional Personology reflection profile—not a clinical assessment.</Text>
              {quickBirthday.length > 0 && !canProceedSetup ? (
                <Text style={s.muted}>{AGE_REQUIREMENT.statement}</Text>
              ) : null}
            </StepLayout>
          )}

          {/* 8. Cockpit */}
          {step === 7 && (
            <StepLayout
              onNext={() => void finishOnboarding()}
              ctaLabel={isFinishing ? 'Saving…' : 'Start my calibration'}
              ctaDisabled={isFinishing}
              showBack
              onBack={goBack}
            >
              <View style={s.visualWrap}>
                <Text style={s.welcomeEmoji}>🌡️</Text>
                <Text style={s.title}>Your Cockpit is one minute away.</Text>
                <Text style={s.subtitle}>Calibrate the six gauges next. Then InGauge can show your current capacity and the clearest place to start.</Text>
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
