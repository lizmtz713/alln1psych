/**
 * Perspective Translator v2 — AI-powered message translation
 * Type what you want to say → Get it translated for your audience
 * Multiple tones, "how they'll hear it", practice mode
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
// Using button-based tone selector instead of slider (no extra dependency)
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  PERSPECTIVE_ROLES,
  PERSPECTIVE_STAGES,
  getRoleById,
} from '../../../src/data/perspectiveTranslator';
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

interface TranslationResult {
  soft: string;
  direct: string;
  firm: string;
  howTheyHear: string;
  avoid: string;
  tip: string;
}

export default function PerspectiveTranslatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Step 1: Who
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  // Step 2: Stage
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  // Step 3: Your message
  const [userMessage, setUserMessage] = useState('');
  // Step 4: Results
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  // Tone slider (0 = soft, 1 = direct, 2 = firm)
  const [toneIndex, setToneIndex] = useState(1);
  
  const role = selectedRole ? getRoleById(selectedRole) : null;
  const stage = PERSPECTIVE_STAGES.find(s => s.id === selectedStage);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const translateMessage = useCallback(async () => {
    if (!selectedRole || !userMessage.trim()) {
      Alert.alert('Missing info', 'Select who you\'re talking to and enter your message.');
      return;
    }
    
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('AI unavailable', 'Your secure AI session is unavailable. Sign in again or try later.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTranslation(null);

    try {
      const roleInfo = role ? `${role.label} (responds to: ${role.respondsTo.join(', ')})` : selectedRole;
      const stageInfo = stage ? `${stage.label} - ${stage.hint}` : 'adult';
      
      const systemPrompt = `You are a communication coach helping people say difficult things in ways that land better.

The user wants to say something to: ${roleInfo}
Their developmental stage: ${stageInfo}

The user's raw message (what they feel like saying): "${userMessage.trim()}"

Translate this into THREE versions at different intensities, plus analysis.

Respond in this exact JSON format:
{
  "soft": "Gentlest version - validates first, very indirect, opens dialogue",
  "direct": "Clear and respectful - states the need plainly without blame",
  "firm": "Assertive but not aggressive - clear boundary, consequences if needed",
  "howTheyHear": "What they'll likely hear/feel when you say the direct version",
  "avoid": "One thing to avoid saying (common mistake)",
  "tip": "One tactical tip for this specific conversation"
}

Make translations natural, not clinical. Use contractions. Sound human.`;

      const response = await sendMessageWithSystemPromptOnly(
        [{ role: 'user', content: 'Translate my message.' }],
        systemPrompt,
        500
      );

      if (response) {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as TranslationResult;
          setTranslation(parsed);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (e) {
      console.error('Translation error:', e);
      Alert.alert('Translation failed', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedStage, userMessage, role, stage]);

  const getCurrentTranslation = () => {
    if (!translation) return null;
    if (toneIndex === 0) return translation.soft;
    if (toneIndex === 1) return translation.direct;
    return translation.firm;
  };

  const getToneColor = () => {
    if (toneIndex === 0) return '#60A5FA'; // blue
    if (toneIndex === 1) return ACCENT; // green
    return '#FB923C'; // orange
  };

  const openPractice = () => {
    if (!translation || !role) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to role play with context
    router.push({
      pathname: '/(modals)/role-play',
      params: {
        prefillScenario: `Practice saying to ${role.label}: "${getCurrentTranslation()}"`,
        prefillRole: role.label,
      },
    });
  };

  const copyToClipboard = async () => {
    const text = getCurrentTranslation();
    if (!text) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied', 'Translation copied to clipboard');
    } catch {
      Alert.alert('Copy failed', 'Could not copy to clipboard');
    }
  };

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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Type what you want to say. AI translates it so the other person actually hears it.
        </Text>

        {/* Step 1: Who */}
        <Text style={styles.stepLabel}>1. Who are you talking to?</Text>
        <View style={styles.chipRow}>
          {PERSPECTIVE_ROLES.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.chip, selectedRole === r.id && styles.chipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedRole(selectedRole === r.id ? null : r.id);
                setTranslation(null);
              }}
            >
              <Text style={styles.chipEmoji}>{r.emoji}</Text>
              <Text style={[styles.chipText, selectedRole === r.id && styles.chipTextActive]}>{r.shortLabel}</Text>
            </Pressable>
          ))}
        </View>

        {/* Step 2: Stage (optional) */}
        {selectedRole && (
          <>
            <Text style={styles.stepLabel}>2. Their stage <Text style={styles.optional}>(optional)</Text></Text>
            <View style={styles.chipRow}>
              {PERSPECTIVE_STAGES.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.chipSmall, selectedStage === s.id && styles.chipActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedStage(selectedStage === s.id ? null : s.id);
                    setTranslation(null);
                  }}
                >
                  <Text style={[styles.chipSmallText, selectedStage === s.id && styles.chipTextActive]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Step 3: Your message */}
        {selectedRole && (
          <>
            <Text style={styles.stepLabel}>3. What do you want to say?</Text>
            <Text style={styles.stepHint}>Type what you're actually feeling — AI will translate it.</Text>
            
            {/* Quick start ideas */}
            {!userMessage && (
              <View style={styles.quickStartSection}>
                <Text style={styles.quickStartLabel}>Quick starts:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickStartScroll}>
                  {[
                    'I need you to stop...',
                    'I feel hurt when...',
                    "I need more help with...",
                    "Can we talk about...",
                    "I'm frustrated that...",
                    "I need space to...",
                  ].map((idea, i) => (
                    <Pressable
                      key={i}
                      style={styles.quickStartChip}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setUserMessage(idea);
                      }}
                    >
                      <Text style={styles.quickStartText}>{idea}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <TextInput
              style={styles.messageInput}
              placeholder="e.g. I need you to stop borrowing my stuff without asking"
              placeholderTextColor={TEXT_MUTED}
              value={userMessage}
              onChangeText={(t) => { setUserMessage(t); setTranslation(null); }}
              multiline
              textAlignVertical="top"
            />
            
            <Pressable
              style={[styles.translateBtn, (loading || !userMessage.trim()) && styles.translateBtnDisabled]}
              onPress={translateMessage}
              disabled={loading || !userMessage.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.translateBtnText}>Translate for {role?.shortLabel || 'them'}</Text>
                </>
              )}
            </Pressable>
          </>
        )}

        {/* Step 4: Results */}
        {translation && (
          <View style={styles.resultsBlock}>
            <Text style={styles.stepLabel}>4. Translated message</Text>
            
            {/* Tone selector */}
            <Text style={styles.toneLabel}>Choose your tone:</Text>
            <View style={styles.toneButtonRow}>
              <Pressable
                style={[styles.toneButton, toneIndex === 0 && styles.toneButtonActive, toneIndex === 0 && { borderColor: '#60A5FA' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToneIndex(0); }}
              >
                <Text style={[styles.toneButtonText, toneIndex === 0 && { color: '#60A5FA' }]}>Soft</Text>
                <Text style={styles.toneButtonHint}>Gentle, validating</Text>
              </Pressable>
              <Pressable
                style={[styles.toneButton, toneIndex === 1 && styles.toneButtonActive, toneIndex === 1 && { borderColor: ACCENT }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToneIndex(1); }}
              >
                <Text style={[styles.toneButtonText, toneIndex === 1 && { color: ACCENT }]}>Direct</Text>
                <Text style={styles.toneButtonHint}>Clear, respectful</Text>
              </Pressable>
              <Pressable
                style={[styles.toneButton, toneIndex === 2 && styles.toneButtonActive, toneIndex === 2 && { borderColor: '#FB923C' }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToneIndex(2); }}
              >
                <Text style={[styles.toneButtonText, toneIndex === 2 && { color: '#FB923C' }]}>Firm</Text>
                <Text style={styles.toneButtonHint}>Assertive, boundaried</Text>
              </Pressable>
            </View>

            {/* Main translation */}
            <View style={[styles.translationCard, { borderLeftColor: getToneColor() }]}>
              <Text style={styles.translationText}>"{getCurrentTranslation()}"</Text>
            </View>

            {/* How they'll hear it */}
            <View style={styles.hearCard}>
              <View style={styles.hearHeader}>
                <Ionicons name="ear-outline" size={18} color={TEXT_MUTED} />
                <Text style={styles.hearLabel}>How they'll hear it</Text>
              </View>
              <Text style={styles.hearText}>{translation.howTheyHear}</Text>
            </View>

            {/* Avoid */}
            <View style={styles.avoidCard}>
              <View style={styles.avoidHeader}>
                <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                <Text style={styles.avoidLabel}>Avoid</Text>
              </View>
              <Text style={styles.avoidText}>{translation.avoid}</Text>
            </View>

            {/* Tip */}
            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb-outline" size={18} color={ACCENT} />
                <Text style={styles.tipLabel}>Tip</Text>
              </View>
              <Text style={styles.tipText}>{translation.tip}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable style={styles.actionBtn} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color={ACCENT} />
                <Text style={styles.actionBtnText}>Copy</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={openPractice}>
                <Ionicons name="chatbubbles-outline" size={20} color={ACCENT} />
                <Text style={styles.actionBtnText}>Practice</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => { setTranslation(null); setUserMessage(''); }}>
                <Ionicons name="refresh-outline" size={20} color={TEXT_MUTED} />
                <Text style={[styles.actionBtnText, { color: TEXT_MUTED }]}>New</Text>
              </Pressable>
            </View>

            {/* All three versions expandable */}
            <View style={styles.allVersionsCard}>
              <Text style={styles.allVersionsTitle}>All versions</Text>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Soft:</Text>
                <Text style={styles.versionText}>{translation.soft}</Text>
              </View>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Direct:</Text>
                <Text style={styles.versionText}>{translation.direct}</Text>
              </View>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Firm:</Text>
                <Text style={styles.versionText}>{translation.firm}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Based on developmental psychology and communication research. Adapts your message without changing your need.
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
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: SPACING.lg },
  stepLabel: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8, marginTop: 16 },
  stepHint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 8 },
  optional: { fontWeight: '400', color: TEXT_MUTED },
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
  quickStartSection: { marginBottom: 12 },
  quickStartLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 8 },
  quickStartScroll: { marginHorizontal: -SPACING.lg },
  quickStartChip: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  quickStartText: { fontSize: 14, color: TEXT },
  messageInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT,
    minHeight: 100,
    lineHeight: 22,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    marginTop: 12,
    gap: 8,
  },
  translateBtnDisabled: { opacity: 0.6 },
  translateBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultsBlock: { marginTop: 8 },
  toneLabel: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 8 },
  toneButtonRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toneButton: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
  },
  toneButtonActive: { backgroundColor: 'rgba(52, 211, 153, 0.08)' },
  toneButtonText: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 2 },
  toneButtonHint: { fontSize: 10, color: TEXT_MUTED },
  translationCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  translationText: { fontSize: 17, color: TEXT, lineHeight: 26, fontStyle: 'italic' },
  hearCard: {
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  hearHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  hearLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED },
  hearText: { fontSize: 14, color: TEXT, lineHeight: 20 },
  avoidCard: {
    backgroundColor: 'rgba(239, 83, 80, 0.06)',
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.15)',
  },
  avoidHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  avoidLabel: { fontSize: 12, fontWeight: '600', color: COLORS.error },
  avoidText: { fontSize: 14, color: TEXT, lineHeight: 20 },
  tipCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tipLabel: { fontSize: 12, fontWeight: '600', color: ACCENT },
  tipText: { fontSize: 14, color: TEXT, lineHeight: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  allVersionsCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  allVersionsTitle: { fontSize: 13, fontWeight: '700', color: TEXT_MUTED, marginBottom: 10 },
  versionRow: { marginBottom: 10 },
  versionLabel: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED, marginBottom: 2 },
  versionText: { fontSize: 14, color: TEXT, lineHeight: 20 },
  footer: { marginTop: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
