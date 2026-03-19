/**
 * Repair Builder — MVP relationship repair tool.
 * Route: /tools/repair
 * Flow: What happened → Who with → How intense → AI guidance + suggested script + practice CTAs.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getRepairBuilderAdvice, type RepairBuilderResult } from '../../../src/services/ai';
import { hasOpenAIKey } from '../../../src/services/ai';
import {
  WHAT_HAPPENED_OPTIONS,
  WHO_WITH_OPTIONS,
  INTENSITY_OPTIONS,
} from '../../../src/data/repairBuilder';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

type Step = 1 | 2 | 3;

export default function RepairBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [what, setWhat] = useState<string | null>(null);
  const [who, setWho] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RepairBuilderResult | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (result) setResult(null);
    else if (step === 1) router.back();
    else if (step === 2) setStep(1);
    else setStep(2);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1 && what) setStep(2);
    else if (step === 2 && who) setStep(3);
    else if (step === 3 && intensity) runAdvice();
  };

  const whatLabel = WHAT_HAPPENED_OPTIONS.find((o) => o.id === what)?.label ?? what;
  const whoLabel = WHO_WITH_OPTIONS.find((o) => o.id === who)?.label ?? who;
  const intensityLabel = INTENSITY_OPTIONS.find((o) => o.id === intensity)?.label ?? intensity;

  const runAdvice = async () => {
    if (!what || !who || !intensity) return;
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API key needed', 'Add your OpenAI API key in Me → Bring Your Own Key to get personalized repair guidance.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      if (!whatLabel || !whoLabel || !intensityLabel) {
        setLoading(false);
        return;
      }
      const res = await getRepairBuilderAdvice(whatLabel, whoLabel, intensityLabel);
      setResult(res || null);
    } catch {
      Alert.alert('Something went wrong', 'Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const canNext =
    (step === 1 && what) || (step === 2 && who) || (step === 3 && intensity);

  if (result) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Repair guidance</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <Text style={[styles.resultLabel, styles.resultLabelFirst]}>What might be happening</Text>
            <Text style={styles.resultBody}>{result.whatMightBeHappening}</Text>
            <Text style={styles.resultLabel}>Best next move</Text>
            <Text style={styles.resultBody}>{result.bestNextMove}</Text>
            <Text style={styles.resultLabel}>Suggested script</Text>
            <Text style={[styles.resultBody, styles.script]}>{result.suggestedScript}</Text>
          </View>
          <Text style={styles.practiceLabel}>Practice</Text>
          <Pressable style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/tone-check'); }}>
            <Ionicons name="chatbubble-outline" size={20} color={ACCENT} />
            <Text style={styles.ctaBtnText}>Tone Check</Text>
          </Pressable>
          <Pressable style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(modals)/role-play'); }}>
            <Ionicons name="people-outline" size={20} color={ACCENT} />
            <Text style={styles.ctaBtnText}>Role Play</Text>
          </Pressable>
          <Pressable style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/tone-check'); }}>
            <Ionicons name="create-outline" size={20} color={ACCENT} />
            <Text style={styles.ctaBtnText}>Rewrite message</Text>
          </Pressable>
          <Pressable style={styles.ctaBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/conversation-builder'); }}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={ACCENT} />
            <Text style={styles.ctaBtnText}>Build a clear message (Observe → Feel → Need → Request)</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Repair Builder</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
        </View>
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>What happened?</Text>
            {WHAT_HAPPENED_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, what === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWhat(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {what === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Who is this with?</Text>
            {WHO_WITH_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, who === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWho(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {who === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>How intense is it?</Text>
            {INTENSITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, intensity === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIntensity(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {intensity === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}
        <Pressable
          style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextBtnText}>{step === 3 ? 'Get guidance' : 'Next'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', gap: 8, marginBottom: SPACING.xl },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: BORDER },
  stepDotActive: { backgroundColor: ACCENT },
  stepTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: SPACING.lg },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  optionCardSelected: { borderColor: ACCENT, backgroundColor: COLORS.accentBg || ACCENT + '15' },
  optionLabel: { fontSize: 16, color: TEXT },
  nextBtn: {
    marginTop: SPACING.xl,
    backgroundColor: ACCENT,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  resultLabel: { fontSize: 12, fontWeight: '700', color: MUTED, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  resultLabelFirst: { marginTop: 0 },
  resultBody: { fontSize: 15, color: TEXT, lineHeight: 22 },
  script: { fontStyle: 'italic', color: ACCENT },
  practiceLabel: { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: SPACING.sm },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
});
