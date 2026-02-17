/**
 * Cockpit check-in — 6-screen flow, one per gauge. Under 60 seconds.
 * Progress dots, Back, Skip on each screen. Writes to cockpitStore.
 * Step navigation is 0-based; gauge answers live in refs to avoid re-render cascades during animation.
 */

import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { getGaugeColor } from '../../src/utils/gaugeHelpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COCKPIT_BG = '#09090F';
const CARD_BG = '#111118';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#F0F0F5';
const TEXT_SECONDARY = '#8888A0';
const TEXT_MUTED = '#55556A';
const GREEN = '#34D399';
const YELLOW = '#FBBF24';
const ORANGE = '#FB923C';
const RED = '#F87171';
const GRAY = '#6B7280';
const ACCENT = '#7C4DFF';

const BODY_LABELS = ['Slept well?', 'Eaten today?', 'Had water?', 'Moved your body?'] as const;
const BODY_KEYS = ['sleep', 'food', 'water', 'movement'] as const;
type BodyKey = (typeof BODY_KEYS)[number];

const BODY_RESPONSES: Record<number, string> = {
  4: 'All systems fueled.',
  3: 'Almost there — %s could help.',
  2: 'Half fueled. Emotions will be affected.',
  1: 'Running on very little. Be gentle today.',
  0: 'Your body is in deficit. Water, food, rest first.',
};

const STATE_OPTIONS = [
  { label: 'Calm', value: 100, color: GREEN, desc: 'Regulated. Clear thinking. Good decisions.' },
  { label: 'Alert', value: 75, color: YELLOW, desc: 'Focused and responsive. Normal for busy days.' },
  { label: 'Activated', value: 50, color: ORANGE, desc: 'Fight-or-flight starting. Heart rate up.' },
  { label: 'Threatened', value: 25, color: RED, desc: 'Reactions amplified. Logic harder to access.' },
  { label: 'Shutdown', value: 10, color: GRAY, desc: 'Protection mode. Numb or frozen.' },
] as const;

const EMOTION_OPTIONS = ['Calm', 'Happy', 'Sad', 'Anxious', 'Angry', 'Overwhelmed', 'Numb', 'Confused'] as const;

const TOTAL_STEPS = 6;

function emotionToScore(selected: string[]): number {
  if (selected.length === 0) return 50;
  if (selected.includes('Numb')) return 30;
  if (selected.includes('Confused')) return 40;
  if (selected.length >= 3) return 50;
  if (selected.length <= 2) return 80;
  return 50;
}

type AnswersRef = {
  body: Record<BodyKey, boolean>;
  stateValue: number | null;
  emotionSelected: string[];
  listenedToMe: boolean | null;
  iListened: boolean | null;
  directionValue: number | null;
  alignmentValue: number | null;
};

const initialAnswers: AnswersRef = {
  body: { sleep: false, food: false, water: false, movement: false },
  stateValue: null,
  emotionSelected: [],
  listenedToMe: null,
  iListened: null,
  directionValue: null,
  alignmentValue: null,
};

export default function CockpitCheckinScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formVersion, setFormVersion] = useState(0);
  const answersRef = useRef<AnswersRef>({ ...initialAnswers, body: { ...initialAnswers.body } });

  const setBodyCheckIn = useCockpitStore((s) => s.setBodyCheckIn);
  const updateState = useCockpitStore((s) => s.updateState);
  const updateEmotion = useCockpitStore((s) => s.updateEmotion);
  const updateConnection = useCockpitStore((s) => s.updateConnection);
  const updateDirection = useCockpitStore((s) => s.updateDirection);
  const updateAlignment = useCockpitStore((s) => s.updateAlignment);
  const setLastCheckInDate = useCockpitStore((s) => s.setLastCheckInDate);

  const a = answersRef.current;
  void formVersion;

  const bodyYesCount = BODY_KEYS.filter((k) => a.body[k]).length;
  const bodyScore = bodyYesCount * 25;
  const connectionScore =
    a.listenedToMe === true && a.iListened === true ? 100 : a.listenedToMe === true || a.iListened === true ? 60 : 20;

  const flushAndNext = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((prev) => {
      if (prev >= TOTAL_STEPS - 1) {
        setLastCheckInDate(new Date().toISOString().slice(0, 10));
        setTimeout(() => router.back(), 0);
        return prev;
      }
      return prev + 1;
    });
  }, [setLastCheckInDate, router]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flushAndNext();
  }, [flushAndNext]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flushAndNext();
  }, [flushAndNext]);

  const applyStepAndNext = useCallback(() => {
    const cur = answersRef.current;
    if (step === 0) {
      setBodyCheckIn(cur.body.sleep, cur.body.food, cur.body.water, cur.body.movement);
    } else if (step === 1 && cur.stateValue !== null) {
      updateState(cur.stateValue);
    } else if (step === 2) {
      updateEmotion(emotionToScore(cur.emotionSelected ?? []));
    } else if (step === 3) {
      updateConnection(connectionScore);
    } else if (step === 4 && cur.directionValue !== null) {
      updateDirection(cur.directionValue);
    } else if (step === 5 && cur.alignmentValue !== null) {
      updateAlignment(cur.alignmentValue);
    }
    handleNext();
  }, [step, connectionScore, setBodyCheckIn, updateState, updateEmotion, updateConnection, updateDirection, updateAlignment, handleNext]);

  const canProceed = useCallback(() => {
    if (step === 0) return true;
    if (step === 1) return a.stateValue !== null;
    if (step === 2) return true;
    if (step === 3) return a.listenedToMe !== null && a.iListened !== null;
    if (step === 4) return a.directionValue !== null;
    if (step === 5) return a.alignmentValue !== null;
    return false;
  }, [step, a.stateValue, a.listenedToMe, a.iListened, a.directionValue, a.alignmentValue]);

  const bodyResponseText = (() => {
    const n = bodyYesCount;
    const template = BODY_RESPONSES[n] ?? BODY_RESPONSES[0];
    if (n === 3) {
      const missing = BODY_KEYS.find((k) => !a.body[k]);
      const word = missing === 'sleep' ? 'rest' : missing === 'food' ? 'food' : missing === 'water' ? 'water' : 'movement';
      return template.replace('%s', word);
    }
    return template;
  })();

  const tick = useCallback(() => setFormVersion((v) => v + 1), []);

  const toggleBody = useCallback((key: BodyKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.body[key] = !answersRef.current.body[key];
    tick();
  }, [tick]);

  const setStateValue = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.stateValue = value;
    tick();
  }, [tick]);

  const toggleEmotion = useCallback((e: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = answersRef.current.emotionSelected;
    answersRef.current.emotionSelected = prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e];
    tick();
  }, [tick]);

  const setListenedToMe = useCallback((v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.listenedToMe = v;
    tick();
  }, [tick]);

  const setIListened = useCallback((v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.iListened = v;
    tick();
  }, [tick]);

  const setDirectionValue = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.directionValue = value;
    tick();
  }, [tick]);

  const setAlignmentValue = useCallback((value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    answersRef.current.alignmentValue = value;
    tick();
  }, [tick]);

  return (
    <ErrorBoundary>
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header: Back, progress dots, Skip */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (step > 0) {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setStep((prev) => prev - 1);
            } else router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[styles.dot, i <= step ? styles.dotFilled : styles.dotEmpty]}
            />
          ))}
        </View>
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>{step === 5 ? 'Done' : 'Skip'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ——— SCREEN 0: BODY ——— */}
        {step === 0 && (
          <>
            <Text style={styles.title}>How's your body today?</Text>
            <View style={styles.gaugeWrap}>
              <View style={[styles.gaugeTrack, { borderColor: CARD_BORDER }]}>
                <View style={[styles.gaugeFill, { width: `${bodyScore}%`, backgroundColor: getGaugeColor(bodyScore) }]} />
              </View>
              <Text style={styles.gaugeValue}>{bodyScore}%</Text>
            </View>
            {BODY_KEYS.map((key, i) => (
              <Pressable
                key={key}
                style={[styles.bodyRow, a.body[key] && styles.bodyRowYes]}
                onPress={() => toggleBody(key)}
              >
                <Text style={styles.bodyLabel}>{BODY_LABELS[i]}</Text>
                <View style={[styles.toggle, a.body[key] && { backgroundColor: GREEN }]}>
                  <Text style={styles.toggleText}>{a.body[key] ? 'Yes' : 'No'}</Text>
                </View>
              </Pressable>
            ))}
            <Text style={styles.smartResponse}>{bodyResponseText}</Text>
          </>
        )}

        {/* ——— SCREEN 1: STATE ——— */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Where is your nervous system?</Text>
            <View style={styles.chipRow}>
              {STATE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.label}
                  style={[
                    styles.stateChip,
                    { borderColor: opt.color },
                    a.stateValue === opt.value && { backgroundColor: opt.color + '22' },
                  ]}
                  onPress={() => setStateValue(opt.value)}
                >
                  <Text style={[styles.stateChipText, { color: opt.color }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            {a.stateValue !== null && (
              <Text style={styles.stateDesc}>
                {STATE_OPTIONS.find((o) => o.value === a.stateValue)?.desc ?? ''}
              </Text>
            )}
          </>
        )}

        {/* ——— SCREEN 2: EMOTION ——— */}
        {step === 2 && (
          <>
            <Text style={styles.title}>What are you actually feeling?</Text>
            <Text style={styles.sub}>Tap any that fit (you can pick more than one).</Text>
            <View style={styles.emotionGrid}>
              {EMOTION_OPTIONS.map((e) => {
                const selected = (a.emotionSelected ?? []).includes(e);
                return (
                  <Pressable
                    key={e}
                    style={[styles.emotionChip, selected && styles.emotionChipSelected]}
                    onPress={() => toggleEmotion(e)}
                  >
                    <Text style={[styles.emotionChipText, selected && styles.emotionChipTextSelected]}>{e}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={styles.linkRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(modals)/activity?id=emotion-wheel');
              }}
            >
              <Text style={styles.linkText}>Not sure?</Text>
              <Text style={styles.linkTextAccent}> Try the Emotion Wheel</Text>
            </Pressable>
          </>
        )}

        {/* ——— SCREEN 3: CONNECTION ——— */}
        {step === 3 && (
          <>
            <Text style={styles.title}>How's your connection?</Text>
            <Text style={styles.sub}>In the last 24 hours...</Text>
            <View style={styles.connectionRow}>
              <Text style={styles.connectionLabel}>Did someone really listen to you?</Text>
              <View style={styles.yesNoRow}>
                <Pressable
                  style={[styles.yesNoBtn, a.listenedToMe === true && styles.yesNoBtnYes]}
                  onPress={() => setListenedToMe(true)}
                >
                  <Text style={[styles.yesNoText, a.listenedToMe === true && styles.yesNoTextSelected]}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.yesNoBtn, a.listenedToMe === false && styles.yesNoBtnNo]}
                  onPress={() => setListenedToMe(false)}
                >
                  <Text style={[styles.yesNoText, a.listenedToMe === false && styles.yesNoTextSelected]}>No</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.connectionRow}>
              <Text style={styles.connectionLabel}>Did you really listen to someone?</Text>
              <View style={styles.yesNoRow}>
                <Pressable
                  style={[styles.yesNoBtn, a.iListened === true && styles.yesNoBtnYes]}
                  onPress={() => setIListened(true)}
                >
                  <Text style={[styles.yesNoText, a.iListened === true && styles.yesNoTextSelected]}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.yesNoBtn, a.iListened === false && styles.yesNoBtnNo]}
                  onPress={() => setIListened(false)}
                >
                  <Text style={[styles.yesNoText, a.iListened === false && styles.yesNoTextSelected]}>No</Text>
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.linkRow} onPress={() => router.push('/(tabs)/circle')}>
              <Text style={styles.linkTextAccent}>Open Circle</Text>
            </Pressable>
          </>
        )}

        {/* ——— SCREEN 4: DIRECTION ——— */}
        {step === 4 && (
          <>
            <Text style={styles.title}>Did you move toward something that matters to you today?</Text>
            <View style={styles.optionRow}>
              {[
                { label: 'Yes', value: 90 },
                { label: 'Somewhat', value: 55 },
                { label: 'No', value: 20 },
              ].map((opt) => (
                <Pressable
                  key={opt.label}
                  style={[styles.optionChip, a.directionValue === opt.value && styles.optionChipSelected]}
                  onPress={() => setDirectionValue(opt.value)}
                >
                  <Text style={[styles.optionChipText, a.directionValue === opt.value && styles.optionChipTextSelected]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.linkRow} onPress={() => router.push('/(tabs)/learn')}>
              <Text style={styles.linkText}>What matters to you?</Text>
            </Pressable>
          </>
        )}

        {/* ——— SCREEN 5: ALIGNMENT ——— */}
        {step === 5 && (
          <>
            <Text style={styles.title}>Are your actions matching your values right now?</Text>
            <View style={styles.optionRow}>
              {[
                { label: 'Yes, mostly', value: 85 },
                { label: 'Somewhat', value: 50 },
                { label: 'Not really', value: 20 },
              ].map((opt) => (
                <Pressable
                  key={opt.label}
                  style={[styles.optionChip, a.alignmentValue === opt.value && styles.optionChipSelected]}
                  onPress={() => setAlignmentValue(opt.value)}
                >
                  <Text style={[styles.optionChipText, a.alignmentValue === opt.value && styles.optionChipTextSelected]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.linkRow} onPress={() => router.push('/(tabs)/talk')}>
              <Text style={styles.linkTextAccent}>Where am I off?</Text>
              <Text style={styles.linkText}> — talk it through</Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={[styles.primaryBtn, (step !== 0 && !canProceed()) && styles.primaryBtnDisabled]}
          onPress={applyStepAndNext}
          disabled={step !== 0 && !canProceed()}
        >
          <Text style={styles.primaryBtnText}>{step === 5 ? 'Done' : 'Next'}</Text>
        </Pressable>
      </ScrollView>
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COCKPIT_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  backBtn: { padding: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotFilled: { backgroundColor: ACCENT },
  dotEmpty: { backgroundColor: TEXT_MUTED },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 15, color: TEXT_SECONDARY },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 16 },
  gaugeWrap: { marginBottom: 20 },
  gaugeTrack: { height: 8, borderRadius: 4, borderWidth: 1, overflow: 'hidden', marginBottom: 6 },
  gaugeFill: { height: '100%', borderRadius: 3 },
  gaugeValue: { fontSize: 14, color: TEXT_SECONDARY, fontVariant: ['tabular-nums'] },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  bodyRowYes: { borderColor: GREEN + '66' },
  bodyLabel: { fontSize: 16, color: TEXT_PRIMARY },
  toggle: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: TEXT_MUTED },
  toggleText: { fontSize: 14, fontWeight: '600', color: COCKPIT_BG },
  smartResponse: { fontSize: 15, color: TEXT_SECONDARY, marginTop: 16, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  stateChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 2 },
  stateChipText: { fontSize: 15, fontWeight: '500' },
  stateDesc: { fontSize: 15, color: TEXT_SECONDARY, marginTop: 8, lineHeight: 22 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  emotionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  emotionChipSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '22' },
  emotionChipText: { fontSize: 15, color: TEXT_PRIMARY },
  emotionChipTextSelected: { color: ACCENT, fontWeight: '600' },
  linkRow: { marginTop: 12, marginBottom: 8 },
  linkText: { fontSize: 15, color: TEXT_SECONDARY },
  linkTextAccent: { fontSize: 15, color: ACCENT, fontWeight: '500' },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  connectionLabel: { fontSize: 16, color: TEXT_PRIMARY, flex: 1 },
  yesNoRow: { flexDirection: 'row', gap: 8 },
  yesNoBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: CARD_BORDER },
  yesNoBtnYes: { borderColor: GREEN, backgroundColor: GREEN + '22' },
  yesNoBtnNo: { borderColor: CARD_BORDER },
  yesNoText: { fontSize: 15, color: TEXT_SECONDARY },
  yesNoTextSelected: { color: TEXT_PRIMARY, fontWeight: '600' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  optionChip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  optionChipSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '22' },
  optionChipText: { fontSize: 16, color: TEXT_PRIMARY },
  optionChipTextSelected: { color: ACCENT, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
