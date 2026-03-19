/**
 * Conversation Builder v2 — AI-powered + Guided modes
 * AI Mode: Describe what happened → AI generates OFNR message with multiple tones
 * Guided Mode: Step-by-step Observe → Feel → Need → Request
 * Route: /tools/conversation-builder
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
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
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT_COLOR = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

type Mode = 'ai' | 'guided';
type Step = 1 | 2 | 3 | 4;

interface AIResult {
  observe: string;
  feel: string;
  need: string;
  request: string;
  soft: string;
  direct: string;
  firm: string;
  tip: string;
}

export default function ConversationBuilderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [mode, setMode] = useState<Mode>('ai');
  
  // AI mode state
  const [situation, setSituation] = useState('');
  const [recipient, setRecipient] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [selectedTone, setSelectedTone] = useState<'soft' | 'direct' | 'firm'>('direct');
  const [copied, setCopied] = useState(false);
  
  // Guided mode state
  const [step, setStep] = useState<Step>(1);
  const [observe, setObserve] = useState<string>('');
  const [observeCustom, setObserveCustom] = useState('');
  const [feel, setFeel] = useState<string>('');
  const [need, setNeed] = useState<string>('');
  const [request, setRequest] = useState<string>('');
  const [guidedMessage, setGuidedMessage] = useState('');

  const observeText = observe === 'other' ? observeCustom.trim() : (WHAT_HAPPENED_OPTIONS.find((o) => o.id === observe)?.label ?? observe);
  const feelLabel = FEEL_OPTIONS.find((o) => o.id === feel)?.label ?? feel;
  const needLabel = NEED_OPTIONS.find((o) => o.id === need)?.label ?? need;
  const wantOption = WANT_NOW_OPTIONS.find((o) => o.id === request);
  const requestPhrase = (wantOption as { requestPhrase?: string } | undefined)?.requestPhrase ?? wantOption?.label ?? request;

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (guidedMessage) {
      setGuidedMessage('');
    } else if (aiResult) {
      setAiResult(null);
    } else if (mode === 'guided' && step > 1) {
      setStep((step - 1) as Step);
    } else {
      router.back();
    }
  }, [step, guidedMessage, aiResult, mode, router]);

  // AI Mode functions
  const generateAIMessage = useCallback(async () => {
    if (!situation.trim()) {
      Alert.alert('Missing info', 'Describe what happened.');
      return;
    }

    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API key needed', 'Add your OpenAI API key in Settings for AI generation.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAiLoading(true);
    setAiResult(null);

    try {
      const recipientContext = recipient.trim() ? `Speaking to: ${recipient.trim()}` : '';
      
      const systemPrompt = `You are a communication coach using Nonviolent Communication (NVC) / OFNR framework. Help the user express themselves clearly and respectfully.

${recipientContext}
Situation: ${situation.trim()}

Extract the OFNR components and generate 3 message versions.

Respond in this exact JSON format:
{
  "observe": "What happened (factual, no judgment)",
  "feel": "The core emotion (one word or phrase)",
  "need": "The underlying need or value",
  "request": "A clear, actionable request",
  "soft": "Gentle version - prioritizes connection, opens dialogue",
  "direct": "Clear version - states OFNR plainly without over-explaining",
  "firm": "Assertive version - clear boundary with consequence if needed",
  "tip": "One communication tip for this specific situation"
}

Make messages sound natural, not clinical. Use contractions. Sound human.`;

      const response = await sendMessageWithSystemPromptOnly(
        [{ role: 'user', content: 'Build my message.' }],
        systemPrompt,
        500
      );

      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as AIResult;
          setAiResult(parsed);
        }
      }
    } catch (e) {
      Alert.alert('Generation failed', 'Check your connection and try again.');
    } finally {
      setAiLoading(false);
    }
  }, [situation, recipient]);

  const getCurrentMessage = () => {
    if (!aiResult) return '';
    if (selectedTone === 'soft') return aiResult.soft;
    if (selectedTone === 'firm') return aiResult.firm;
    return aiResult.direct;
  };

  const getToneColor = () => {
    if (selectedTone === 'soft') return '#60A5FA';
    if (selectedTone === 'firm') return '#FB923C';
    return ACCENT;
  };

  const handleCopy = useCallback(async () => {
    const text = mode === 'ai' ? getCurrentMessage() : guidedMessage;
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mode, aiResult, selectedTone, guidedMessage]);

  const handleToneCheck = useCallback(() => {
    const text = mode === 'ai' ? getCurrentMessage() : guidedMessage;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/tools/tone-check', params: { message: text } });
  }, [router, mode, aiResult, selectedTone, guidedMessage]);

  const handleRolePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/role-play');
  }, [router]);

  // Guided mode functions
  const handleGuidedNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1 && (observe || observeCustom.trim())) {
      setStep(2);
    } else if (step === 2 && feel) {
      setStep(3);
    } else if (step === 3 && need) {
      setStep(4);
    } else if (step === 4 && request) {
      const built = buildConversationMessage(observeText, feelLabel, needLabel, requestPhrase);
      setGuidedMessage(built);
    }
  }, [step, observe, observeCustom, feel, need, request, observeText, feelLabel, needLabel, requestPhrase]);

  const canGuidedNext =
    (step === 1 && (observe || observeCustom.trim())) ||
    (step === 2 && feel) ||
    (step === 3 && need) ||
    (step === 4 && request);

  // Result view (shared for both modes)
  const resultMessage = mode === 'ai' ? getCurrentMessage() : guidedMessage;
  if (resultMessage && (aiResult || guidedMessage)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
          </Pressable>
          <Text style={styles.headerTitle}>Your message</Text>
          <View style={styles.backBtn} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* OFNR breakdown (AI mode only) */}
          {mode === 'ai' && aiResult && (
            <View style={styles.ofnrCard}>
              <Text style={styles.ofnrTitle}>OFNR Breakdown</Text>
              <View style={styles.ofnrRow}>
                <Text style={styles.ofnrLabel}>O</Text>
                <Text style={styles.ofnrText}>{aiResult.observe}</Text>
              </View>
              <View style={styles.ofnrRow}>
                <Text style={styles.ofnrLabel}>F</Text>
                <Text style={styles.ofnrText}>{aiResult.feel}</Text>
              </View>
              <View style={styles.ofnrRow}>
                <Text style={styles.ofnrLabel}>N</Text>
                <Text style={styles.ofnrText}>{aiResult.need}</Text>
              </View>
              <View style={styles.ofnrRow}>
                <Text style={styles.ofnrLabel}>R</Text>
                <Text style={styles.ofnrText}>{aiResult.request}</Text>
              </View>
            </View>
          )}

          {/* Tone selector (AI mode only) */}
          {mode === 'ai' && aiResult && (
            <View style={styles.toneSelector}>
              <Text style={styles.toneSelectorLabel}>Choose your tone:</Text>
              <View style={styles.toneButtonRow}>
                <Pressable
                  style={[styles.toneButton, selectedTone === 'soft' && styles.toneButtonActive, selectedTone === 'soft' && { borderColor: '#60A5FA' }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTone('soft'); }}
                >
                  <Text style={[styles.toneButtonText, selectedTone === 'soft' && { color: '#60A5FA' }]}>Soft</Text>
                </Pressable>
                <Pressable
                  style={[styles.toneButton, selectedTone === 'direct' && styles.toneButtonActive, selectedTone === 'direct' && { borderColor: ACCENT }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTone('direct'); }}
                >
                  <Text style={[styles.toneButtonText, selectedTone === 'direct' && { color: ACCENT }]}>Direct</Text>
                </Pressable>
                <Pressable
                  style={[styles.toneButton, selectedTone === 'firm' && styles.toneButtonActive, selectedTone === 'firm' && { borderColor: '#FB923C' }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTone('firm'); }}
                >
                  <Text style={[styles.toneButtonText, selectedTone === 'firm' && { color: '#FB923C' }]}>Firm</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Message card */}
          <View style={[styles.messageCard, mode === 'ai' && { borderLeftColor: getToneColor() }]}>
            <Text style={styles.messageLabel}>{mode === 'ai' ? `${selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)} message` : 'Observe → Feel → Need → Request'}</Text>
            <Text style={styles.messageText}>{resultMessage}</Text>
          </View>

          {/* Tip (AI mode only) */}
          {mode === 'ai' && aiResult && (
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={16} color={ACCENT} />
              <Text style={styles.tipText}>{aiResult.tip}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnPrimaryText}>{copied ? 'Copied!' : 'Copy message'}</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleToneCheck}>
              <Ionicons name="chatbubble-outline" size={18} color={ACCENT} />
              <Text style={styles.actionBtnText}>Tone Check</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleRolePlay}>
              <Ionicons name="people-outline" size={18} color={ACCENT} />
              <Text style={styles.actionBtnText}>Practice saying it</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleBack}>
              <Ionicons name="refresh-outline" size={18} color={MUTED} />
              <Text style={[styles.actionBtnText, { color: MUTED }]}>Start over</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main view
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
        </Pressable>
        <Text style={styles.headerTitle}>Conversation Builder</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Mode switcher */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeTab, mode === 'ai' && styles.modeTabActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('ai'); }}
        >
          <Ionicons name="sparkles" size={18} color={mode === 'ai' ? ACCENT : MUTED} />
          <Text style={[styles.modeTabLabel, mode === 'ai' && styles.modeTabLabelActive]}>AI Mode</Text>
        </Pressable>
        <Pressable
          style={[styles.modeTab, mode === 'guided' && styles.modeTabActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode('guided'); }}
        >
          <Ionicons name="list-outline" size={18} color={mode === 'guided' ? ACCENT : MUTED} />
          <Text style={[styles.modeTabLabel, mode === 'guided' && styles.modeTabLabelActive]}>Guided</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── AI Mode ─── */}
        {mode === 'ai' && (
          <>
            <Text style={styles.intro}>
              Describe what happened and AI will build a clear, respectful message using the OFNR framework.
            </Text>

            <Text style={styles.label}>Who are you talking to?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. My partner, My boss, My friend"
              placeholderTextColor={MUTED}
              value={recipient}
              onChangeText={setRecipient}
            />

            <Text style={styles.label}>What happened? How do you feel? What do you need?</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Just describe the situation naturally. AI will extract the OFNR components."
              placeholderTextColor={MUTED}
              value={situation}
              onChangeText={setSituation}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.generateBtn, (aiLoading || !situation.trim()) && styles.generateBtnDisabled]}
              onPress={generateAIMessage}
              disabled={aiLoading || !situation.trim()}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.generateBtnText}>Build my message</Text>
                </>
              )}
            </Pressable>

            <View style={styles.ofnrExplainer}>
              <Text style={styles.ofnrExplainerTitle}>What is OFNR?</Text>
              <Text style={styles.ofnrExplainerText}>
                <Text style={styles.ofnrBold}>O</Text>bserve (what happened) →{' '}
                <Text style={styles.ofnrBold}>F</Text>eel (your emotion) →{' '}
                <Text style={styles.ofnrBold}>N</Text>eed (underlying need) →{' '}
                <Text style={styles.ofnrBold}>R</Text>equest (clear ask)
              </Text>
            </View>
          </>
        )}

        {/* ─── Guided Mode ─── */}
        {mode === 'guided' && (
          <>
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
                    placeholder="Describe what happened"
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
              style={[styles.generateBtn, !canGuidedNext && styles.generateBtnDisabled]}
              onPress={handleGuidedNext}
              disabled={!canGuidedNext}
            >
              <Text style={styles.generateBtnText}>{step === 4 ? 'Build message' : 'Next'}</Text>
            </Pressable>
          </>
        )}
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_COLOR },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeTabActive: { backgroundColor: COLORS.accentBg || 'rgba(13,148,136,0.12)' },
  modeTabLabel: { fontSize: 14, color: MUTED, fontWeight: '500' },
  modeTabLabelActive: { color: ACCENT, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: MUTED, lineHeight: 22, marginBottom: SPACING.lg },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  inputLarge: { minHeight: 120, textAlignVertical: 'top' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    marginTop: 8,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  ofnrExplainer: {
    marginTop: 24,
    padding: 14,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
  },
  ofnrExplainerTitle: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR, marginBottom: 6 },
  ofnrExplainerText: { fontSize: 13, color: MUTED, lineHeight: 20 },
  ofnrBold: { fontWeight: '700', color: ACCENT },
  ofnrCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  ofnrTitle: { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: 10 },
  ofnrRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  ofnrLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  ofnrText: { flex: 1, fontSize: 14, color: TEXT_COLOR, lineHeight: 20 },
  toneSelector: { marginBottom: 16 },
  toneSelectorLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR, marginBottom: 8 },
  toneButtonRow: { flexDirection: 'row', gap: 8 },
  toneButton: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
  },
  toneButtonActive: { backgroundColor: 'rgba(52, 211, 153, 0.08)' },
  toneButtonText: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  messageCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
  },
  messageLabel: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: SPACING.sm },
  messageText: { fontSize: 16, color: TEXT_COLOR, lineHeight: 24 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.accentBg || 'rgba(13,148,136,0.08)',
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderAccent || 'rgba(13,148,136,0.2)',
  },
  tipText: { flex: 1, fontSize: 14, color: TEXT_COLOR, lineHeight: 20 },
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
  actionBtnPrimary: { backgroundColor: ACCENT, borderColor: ACCENT },
  actionBtnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR },
  stepIndicator: { flexDirection: 'row', gap: 6, marginBottom: SPACING.xl },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: BORDER },
  stepDotActive: { backgroundColor: ACCENT },
  stepTitle: { fontSize: 18, fontWeight: '700', color: TEXT_COLOR, marginBottom: SPACING.sm },
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
  optionLabel: { fontSize: 16, color: TEXT_COLOR },
  customInput: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT_COLOR,
    minHeight: 80,
    marginTop: SPACING.sm,
  },
});
