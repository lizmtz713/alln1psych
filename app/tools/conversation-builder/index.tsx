/**
 * Conversation Builder — Observe → Feel → Need → Request.
 * Route: /tools/conversation-builder
 * Turns messy emotions into a clear, respectful message. Signature MVP tool.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { buildConversationMessage } from '../../../src/data/conversationBuilder';
import {
  WHAT_HAPPENED_OPTIONS,
  FEEL_OPTIONS,
  NEED_OPTIONS,
  WANT_NOW_OPTIONS,
} from '../../../src/data/conversationBuilder';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

type Step = 1 | 2 | 3 | 4;

export default function ConversationBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [observe, setObserve] = useState<string>('');
  const [observeCustom, setObserveCustom] = useState('');
  const [feel, setFeel] = useState<string>('');
  const [need, setNeed] = useState<string>('');
  const [request, setRequest] = useState<string>('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const observeText = observe === 'other' ? observeCustom.trim() : (WHAT_HAPPENED_OPTIONS.find((o) => o.id === observe)?.label ?? observe);
  const feelLabel = FEEL_OPTIONS.find((o) => o.id === feel)?.label ?? feel;
  const needLabel = NEED_OPTIONS.find((o) => o.id === need)?.label ?? need;
  const wantOption = WANT_NOW_OPTIONS.find((o) => o.id === request);
  const requestPhrase = (wantOption as { requestPhrase?: string } | undefined)?.requestPhrase ?? wantOption?.label ?? request;

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (message) {
      setMessage('');
    } else if (step === 1) {
      router.back();
    } else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else setStep(3);
  }, [step, message, router]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1 && (observe || observeCustom.trim())) {
      setStep(2);
    } else if (step === 2 && feel) {
      setStep(3);
    } else if (step === 3 && need) {
      setStep(4);
    } else if (step === 4 && request) {
      const built = buildConversationMessage(
        observeText,
        feelLabel,
        needLabel,
        requestPhrase
      );
      setMessage(built);
    }
  }, [step, observe, observeCustom, feel, need, request, observeText, feelLabel, needLabel, requestPhrase]);

  const canNext =
    (step === 1 && (observe || observeCustom.trim())) ||
    (step === 2 && feel) ||
    (step === 3 && need) ||
    (step === 4 && request);

  const handleCopy = useCallback(async () => {
    if (!message) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message]);

  const handleToneCheck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/tools/tone-check', params: { message } });
  }, [router, message]);

  const handleRolePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/role-play');
  }, [router]);

  const handleAfterFight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tools/after-fight');
  }, [router]);

  // Result view
  if (message) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text style={styles.headerTitle}>Your message</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>Observe → Feel → Need → Request</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPressed]} onPress={handleToneCheck}>
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnPrimaryText}>Tone Check</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={handleRolePlay}>
              <Ionicons name="people-outline" size={18} color={ACCENT} />
              <Text style={styles.actionBtnText}>Practice saying it</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={18} color={ACCENT} />
              <Text style={styles.actionBtnText}>{copied ? 'Copied!' : 'Copy to send'}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} onPress={handleAfterFight}>
              <Ionicons name="heart-outline" size={18} color={MUTED} />
              <Text style={styles.actionBtnTextMuted}>After the Fight</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Step view
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Conversation Builder</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]} />
          ))}
        </View>

        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>What happened?</Text>
            <Text style={styles.stepHint}>Start with what occurred, not accusations.</Text>
            {WHAT_HAPPENED_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, observe === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setObserve(opt.id); setObserveCustom(''); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {observe === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
            {observe === 'other' && (
              <TextInput
                style={styles.customInput}
                placeholder="Describe what happened (e.g. When you checked your phone while I was talking)"
                placeholderTextColor={MUTED}
                value={observeCustom}
                onChangeText={setObserveCustom}
                multiline
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>What did you feel?</Text>
            <Text style={styles.stepHint}>Name the emotion.</Text>
            {FEEL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, feel === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFeel(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {feel === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>What did you need?</Text>
            <Text style={styles.stepHint}>The value or need behind the feeling.</Text>
            {NEED_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, need === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNeed(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {need === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.stepTitle}>What do you want now?</Text>
            <Text style={styles.stepHint}>A clear, respectful request.</Text>
            {WANT_NOW_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, request === opt.id && styles.optionCardSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRequest(opt.id); }}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                {request === opt.id && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
              </Pressable>
            ))}
          </>
        )}

        <Pressable
          style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext}
        >
          <Text style={styles.nextBtnText}>{step === 4 ? 'Build message' : 'Next'}</Text>
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
  stepIndicator: { flexDirection: 'row', gap: 6, marginBottom: SPACING.xl },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: BORDER },
  stepDotActive: { backgroundColor: ACCENT },
  stepTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: SPACING.sm },
  stepHint: { fontSize: 14, color: MUTED, marginBottom: SPACING.lg },
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
  customInput: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT,
    minHeight: 80,
    marginTop: SPACING.sm,
  },
  nextBtn: {
    marginTop: SPACING.xl,
    backgroundColor: ACCENT,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  messageCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
  },
  messageLabel: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: SPACING.sm },
  messageText: { fontSize: 16, color: TEXT, lineHeight: 24 },
  actionButtons: { gap: SPACING.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
  },
  actionBtnPressed: { opacity: 0.9 },
  actionBtnPrimary: { backgroundColor: ACCENT, borderColor: ACCENT },
  actionBtnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
  actionBtnTextMuted: { fontSize: 16, fontWeight: '600', color: MUTED },
});
