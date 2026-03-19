/**
 * Perspective Translator — Say it in a way they're most likely to hear.
 * Developmental language based on role and stage. No shaming or labeling.
 * Route: /tools/perspective-translator
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  PERSPECTIVE_ROLES,
  PERSPECTIVE_STAGES,
  PERSPECTIVE_INTENTS,
  getTranslationExample,
  getRoleById,
  getIntentById,
} from '../../../src/data/perspectiveTranslator';
import { useCockpitStore } from '../../../src/stores/cockpitStore';
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function PerspectiveTranslatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step1Role, setStep1Role] = useState<string | null>(null);
  const [step2Stage, setStep2Stage] = useState<string | null>(null);
  const [step3Intent, setStep3Intent] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState('');
  const [customPhrase, setCustomPhrase] = useState<string | null>(null);
  const [customPhraseLoading, setCustomPhraseLoading] = useState(false);

  const connection = useCockpitStore((s) => s.connection.value);
  const emotion = useCockpitStore((s) => s.emotion.value);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const showGaugeTip = connection >= 0 && connection < 50 && emotion >= 0 && emotion > 50;
  const role = step1Role ? getRoleById(step1Role) : null;
  const intent = step3Intent ? getIntentById(step3Intent) : null;
  const translation = step1Role && step3Intent ? getTranslationExample(step1Role, step3Intent) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Perspective Translator</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Frame your message so the other person is more likely to understand and accept it. This doesn't change what you need—it helps you say it in a way that lands.
        </Text>

        {showGaugeTip && (
          <View style={styles.gaugeTip}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.accent} />
            <Text style={styles.gaugeTipText}>
              When connection and emotion are strained, people often respond better if you start with validation before your main point.
            </Text>
          </View>
        )}

        {/* Step 1: Who are you talking to? */}
        <Text style={styles.stepLabel}>Step 1 — Who are you talking to?</Text>
        <View style={styles.chipRow}>
          {PERSPECTIVE_ROLES.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.chip, step1Role === r.id && styles.chipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStep1Role(step1Role === r.id ? null : r.id);
                setStep2Stage(null);
                setStep3Intent(null);
              }}
            >
              <Text style={styles.chipEmoji}>{r.emoji}</Text>
              <Text style={[styles.chipText, step1Role === r.id && styles.chipTextActive]}>{r.shortLabel}</Text>
            </Pressable>
          ))}
        </View>

        {/* Step 2: Their developmental stage */}
        {step1Role && (
          <>
            <Text style={styles.stepLabel}>Step 2 — Their developmental stage</Text>
            <Text style={styles.stepHint}>This adjusts how we phrase things. It doesn't judge the person.</Text>
            <View style={styles.chipRow}>
              {PERSPECTIVE_STAGES.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.chipSmall, step2Stage === s.id && styles.chipActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStep2Stage(step2Stage === s.id ? null : s.id);
                    setStep3Intent(null);
                  }}
                >
                  <Text style={[styles.chipSmallText, step2Stage === s.id && styles.chipTextActive]} numberOfLines={1}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Step 3: What do you want to say? */}
        {step1Role && (
          <>
            <Text style={styles.stepLabel}>Step 3 — What do you want to say?</Text>
            <View style={styles.intentList}>
              {PERSPECTIVE_INTENTS.map((i) => (
                <Pressable
                  key={i.id}
                  style={[styles.intentCard, step3Intent === i.id && styles.intentCardActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStep3Intent(step3Intent === i.id ? null : i.id);
                  }}
                >
                  <Text style={[styles.intentLabel, step3Intent === i.id && styles.chipTextActive]}>{i.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Step 4: Translate */}
        {step1Role && step3Intent && role && intent && (
          <View style={styles.translateBlock}>
            <Text style={styles.stepLabel}>Step 4 — Translated message</Text>
            <View style={styles.directCard}>
              <Text style={styles.directLabel}>What you might feel like saying</Text>
              <Text style={styles.directText}>"{intent.exampleDirect}"</Text>
            </View>
            {translation ? (
              <>
                <Text style={styles.translatedLabel}>People often respond better to messages framed like this:</Text>
                <View style={[styles.translatedCard, { borderLeftColor: ACCENT, borderLeftWidth: 4 }]}>
                  <Text style={styles.translatedText}>"{translation.translated}"</Text>
                </View>
                <Text style={styles.whyLabel}>Why it works</Text>
                <Text style={styles.whyText}>{translation.whyItWorks}</Text>
                {role.respondsTo.length > 0 && (
                  <Text style={styles.respondsToLabel}>What they tend to respond to: {role.respondsTo.join(', ').toLowerCase()}.</Text>
                )}
                <Text style={[styles.stepLabel, { marginTop: 16 }]}>Custom phrasing (optional)</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g. We've argued about this before and they get defensive"
                  placeholderTextColor={TEXT_MUTED}
                  value={customContext}
                  onChangeText={(t) => { setCustomContext(t); setCustomPhrase(null); }}
                  multiline
                />
                <Pressable
                  style={[styles.customPhraseBtn, customPhraseLoading && styles.customPhraseBtnDisabled]}
                  onPress={async () => {
                    const hasKey = await hasOpenAIKey();
                    if (!hasKey) { Alert.alert('API key needed', 'Add your OpenAI API key in Settings for custom phrasing.'); return; }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCustomPhraseLoading(true);
                    setCustomPhrase(null);
                    try {
                      const sys = `You help people phrase messages for difficult conversations. Given: who they're talking to (${role?.shortLabel ?? step1Role}), what they want to say (${intent?.label ?? step3Intent}). ${customContext.trim() ? `Their context: ${customContext.trim()}.` : ''} Suggest ONE short sentence they could say (natural, not clinical). Reply with only that sentence.`;
                      const res = await sendMessageWithSystemPromptOnly([{ role: 'user', content: 'Give me one phrase.' }], sys, 120);
                      if (res?.trim() && !res.startsWith('[')) setCustomPhrase(res.trim().replace(/^["']|["']$/g, ''));
                    } catch { Alert.alert('Could not get phrase', 'Check your connection and try again.'); }
                    finally { setCustomPhraseLoading(false); }
                  }}
                  disabled={customPhraseLoading}
                >
                  {customPhraseLoading ? <ActivityIndicator size="small" color={ACCENT} /> : <Ionicons name="sparkles" size={18} color={ACCENT} />}
                  <Text style={styles.customPhraseBtnText}>{customPhraseLoading ? '…' : 'Phrase it for my situation'}</Text>
                </Pressable>
                {customPhrase && (
                  <View style={styles.customPhraseCard}>
                    <Text style={styles.customPhraseLabel}>Suggested phrase</Text>
                    <Text style={styles.customPhraseText}>"{customPhrase}"</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.translatedCard}>
                <Text style={styles.translatedText}>
                  Focus on: {role.respondsTo.slice(0, 3).join(', ').toLowerCase()}. Name your need without blame. Invite them into the conversation ("Can we...?" or "I'd like to...").
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This tool is based on developmental psychology and communication research. It helps you adapt your message—it doesn't label or judge the other person.
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: SPACING.md },
  gaugeTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  gaugeTipText: { flex: 1, fontSize: 13, color: TEXT, lineHeight: 19, marginLeft: 8 },
  stepLabel: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8, marginTop: 16 },
  stepHint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  chipEmoji: { fontSize: 16, marginRight: 6 },
  chipText: { fontSize: 14, color: TEXT },
  chipTextActive: { color: ACCENT, fontWeight: '600' },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipSmallText: { fontSize: 13, color: TEXT_MUTED },
  intentList: { gap: 8 },
  intentCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  intentCardActive: { borderColor: ACCENT, backgroundColor: COLORS.accentBg },
  intentLabel: { fontSize: 14, color: TEXT },
  translateBlock: { marginTop: 8 },
  directCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  directLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 4 },
  directText: { fontSize: 15, color: TEXT, fontStyle: 'italic', lineHeight: 22 },
  translatedLabel: { fontSize: 13, color: TEXT_MUTED, marginBottom: 6 },
  translatedCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  translatedText: { fontSize: 15, color: TEXT, lineHeight: 22 },
  whyLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 4 },
  whyText: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
  respondsToLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },
  customInput: { backgroundColor: CARD_BG, borderRadius: BORDER_RADIUS.card, borderWidth: 1, borderColor: BORDER, padding: 12, fontSize: 14, color: TEXT, minHeight: 56, textAlignVertical: 'top', marginBottom: 10 },
  customPhraseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: ACCENT, borderRadius: BORDER_RADIUS.card },
  customPhraseBtnDisabled: { opacity: 0.6 },
  customPhraseBtnText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  customPhraseCard: { backgroundColor: COLORS.accentBg, borderRadius: BORDER_RADIUS.card, padding: 14, borderWidth: 1, borderColor: COLORS.borderAccent },
  customPhraseLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 4 },
  customPhraseText: { fontSize: 15, color: TEXT, lineHeight: 22, fontStyle: 'italic' },
  footer: { marginTop: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
