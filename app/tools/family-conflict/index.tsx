/**
 * Family Conflict Support — Interactive guided flow
 * Helps users work through family conflicts step by step
 * Route: /tools/family-conflict
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { callAI, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const SURFACE = COLORS.surface;
const BORDER = COLORS.border;
const TEXT_COLOR = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = '#14b8a6'; // teal

// Data
const GAUGES = [
  { id: 'emotion', emoji: '🧠', label: 'Emotion', desc: 'Anger, hurt, guilt, sadness' },
  { id: 'connection', emoji: '💕', label: 'Connection', desc: 'Relationship strain' },
  { id: 'alignment', emoji: '✨', label: 'Alignment', desc: 'Values conflict (loyalty, respect)' },
  { id: 'state', emoji: '🫠', label: 'State', desc: 'Stress, nervous system' },
];

const PATTERNS = [
  { id: 'communication', label: 'Communication breakdown', desc: 'Misunderstandings, not feeling heard' },
  { id: 'boundaries', label: 'Boundary violations', desc: 'Limits not respected' },
  { id: 'roles', label: 'Old family roles', desc: 'Falling back into childhood dynamics' },
  { id: 'unresolved', label: 'Unresolved past', desc: 'History repeating' },
  { id: 'expectations', label: 'Mismatched expectations', desc: 'Different views of family' },
];

const PATHS = [
  { id: 'repair', emoji: '🤝', label: 'Have a repair conversation', desc: 'Address it directly with care' },
  { id: 'boundary', emoji: '🛡️', label: 'Set a boundary', desc: 'Clearly state your limits' },
  { id: 'space', emoji: '↔️', label: 'Take space first', desc: 'Step back before engaging' },
  { id: 'support', emoji: '👥', label: 'Seek support', desc: 'Talk to someone neutral' },
];

const CRISIS_RESOURCES = [
  { label: 'National Domestic Violence Hotline', phone: '1-800-799-7233', url: 'tel:1-800-799-7233' },
  { label: '988 Suicide & Crisis Lifeline', phone: '988', url: 'tel:988' },
  { label: 'Crisis Text Line', phone: 'Text HOME to 741741', url: 'sms:741741' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface UserSelections {
  affectedGauges: string[];
  patterns: string[];
  whatHappened: string;
  whatYouNeed: string;
  boundaryToSet: string;
  chosenPath: string | null;
  conversationScript: {
    whatHappened: string;
    howYouFelt: string;
    whatYouNeed: string;
  };
}

export default function FamilyConflictScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  
  const [step, setStep] = useState<Step>(1);
  const [selections, setSelections] = useState<UserSelections>({
    affectedGauges: [],
    patterns: [],
    whatHappened: '',
    whatYouNeed: '',
    boundaryToSet: '',
    chosenPath: null,
    conversationScript: { whatHappened: '', howYouFelt: '', whatYouNeed: '' },
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const progress = step / 6;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep((s) => (s - 1) as Step);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 6) {
      setStep((s) => (s + 1) as Step);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const toggleGauge = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelections((s) => ({
      ...s,
      affectedGauges: s.affectedGauges.includes(id)
        ? s.affectedGauges.filter((g) => g !== id)
        : [...s.affectedGauges, id],
    }));
  };

  const togglePattern = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelections((s) => ({
      ...s,
      patterns: s.patterns.includes(id)
        ? s.patterns.filter((p) => p !== id)
        : [...s.patterns, id],
    }));
  };

  const selectPath = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelections((s) => ({ ...s, chosenPath: id }));
  };

  const getAIHelp = useCallback(async (type: 'boundary' | 'script') => {
    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API Key Needed', 'Add your OpenAI key in Settings to use AI assistance.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const context = `
Situation: ${selections.whatHappened || 'Family conflict'}
Affected areas: ${selections.affectedGauges.join(', ') || 'Not specified'}
Patterns: ${selections.patterns.join(', ') || 'Not specified'}
What they need: ${selections.whatYouNeed || 'Not specified'}
`;

      let prompt = '';
      if (type === 'boundary') {
        prompt = `${context}

Help me phrase a healthy boundary for this family situation. Be specific and actionable. Use "I" statements. Keep it to 2-3 sentences. Just give me the boundary text, nothing else.`;
      } else {
        prompt = `${context}

Help me prepare what to say in a repair conversation. Give me:
1. How to describe what happened (factual, not accusatory) - 1 sentence
2. How to share my feelings (using "I felt...") - 1 sentence  
3. What I need going forward - 1 sentence

Format as three short lines. Be warm but direct.`;
      }

      const response = await callAI([{ role: 'user', content: prompt }], {
        temperature: 0.7,
        max_tokens: 300,
      });

      setAiSuggestion(response || null);
    } catch (e) {
      Alert.alert('Error', 'Could not get AI suggestion. Try again.');
    } finally {
      setAiLoading(false);
    }
  }, [selections]);

  const applyAISuggestion = (type: 'boundary' | 'script') => {
    if (!aiSuggestion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (type === 'boundary') {
      setSelections((s) => ({ ...s, boundaryToSet: aiSuggestion }));
    }
    setAiSuggestion(null);
  };

  const openLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selections.affectedGauges.length > 0;
      case 2: return selections.patterns.length > 0;
      case 3: return selections.whatHappened.trim().length > 0;
      case 4: return selections.chosenPath !== null;
      case 5: return true;
      default: return true;
    }
  };

  const handlePractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(modals)/role-play');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerBtn}>
          <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={24} color={TEXT_COLOR} />
        </Pressable>
        <Text style={styles.headerTitle}>Family Conflict Support</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Safety notice - always visible */}
        {step === 1 && (
          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={20} color="#f97316" />
            <Text style={styles.safetyText}>
              If you're in danger, your safety comes first. Skip to Step 6 for crisis resources.
            </Text>
            <Pressable onPress={() => setStep(6)}>
              <Text style={styles.safetyLink}>Go to resources →</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 1: What's affected */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 1 of 6</Text>
            <Text style={styles.stepTitle}>What parts of you are affected?</Text>
            <Text style={styles.stepDesc}>Tap all that apply. This helps identify what needs attention.</Text>

            <View style={styles.optionsGrid}>
              {GAUGES.map((g) => {
                const selected = selections.affectedGauges.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    style={[styles.optionCard, selected && styles.optionCardSelected]}
                    onPress={() => toggleGauge(g.id)}
                  >
                    <Text style={styles.optionEmoji}>{g.emoji}</Text>
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{g.label}</Text>
                    <Text style={styles.optionDesc}>{g.desc}</Text>
                    {selected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 2: Identify patterns */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 2 of 6</Text>
            <Text style={styles.stepTitle}>What patterns do you notice?</Text>
            <Text style={styles.stepDesc}>Family conflicts often follow patterns. Which feel familiar?</Text>

            <View style={styles.optionsList}>
              {PATTERNS.map((p) => {
                const selected = selections.patterns.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    style={[styles.listOption, selected && styles.listOptionSelected]}
                    onPress={() => togglePattern(p.id)}
                  >
                    <View style={styles.listOptionContent}>
                      <Text style={[styles.listOptionLabel, selected && styles.listOptionLabelSelected]}>
                        {p.label}
                      </Text>
                      <Text style={styles.listOptionDesc}>{p.desc}</Text>
                    </View>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 3: Describe & needs */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 3 of 6</Text>
            <Text style={styles.stepTitle}>What happened & what do you need?</Text>
            <Text style={styles.stepDesc}>Writing it out helps process. This is just for you.</Text>

            <Text style={styles.inputLabel}>What happened?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the situation briefly..."
              placeholderTextColor={TEXT_MUTED}
              value={selections.whatHappened}
              onChangeText={(t) => setSelections((s) => ({ ...s, whatHappened: t }))}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>What do you need from this relationship?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., To be heard, respect for my choices, space..."
              placeholderTextColor={TEXT_MUTED}
              value={selections.whatYouNeed}
              onChangeText={(t) => setSelections((s) => ({ ...s, whatYouNeed: t }))}
            />

            <Text style={styles.inputLabel}>Boundary to set (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g., I won't discuss politics at dinner..."
              placeholderTextColor={TEXT_MUTED}
              value={selections.boundaryToSet}
              onChangeText={(t) => setSelections((s) => ({ ...s, boundaryToSet: t }))}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={styles.aiHelpBtn}
              onPress={() => getAIHelp('boundary')}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color={ACCENT} />
                  <Text style={styles.aiHelpText}>Help me phrase a boundary</Text>
                </>
              )}
            </Pressable>

            {aiSuggestion && (
              <View style={styles.aiSuggestionCard}>
                <Text style={styles.aiSuggestionLabel}>Suggestion:</Text>
                <Text style={styles.aiSuggestionText}>{aiSuggestion}</Text>
                <Pressable style={styles.useSuggestionBtn} onPress={() => applyAISuggestion('boundary')}>
                  <Text style={styles.useSuggestionText}>Use this</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* STEP 4: Choose path */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 4 of 6</Text>
            <Text style={styles.stepTitle}>Choose your path forward</Text>
            <Text style={styles.stepDesc}>There's no "correct" answer. Pick what fits your situation.</Text>

            <View style={styles.optionsList}>
              {PATHS.map((p) => {
                const selected = selections.chosenPath === p.id;
                return (
                  <Pressable
                    key={p.id}
                    style={[styles.pathOption, selected && styles.pathOptionSelected]}
                    onPress={() => selectPath(p.id)}
                  >
                    <Text style={styles.pathEmoji}>{p.emoji}</Text>
                    <View style={styles.pathContent}>
                      <Text style={[styles.pathLabel, selected && styles.pathLabelSelected]}>{p.label}</Text>
                      <Text style={styles.pathDesc}>{p.desc}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 5: Prepare conversation */}
        {step === 5 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 5 of 6</Text>
            <Text style={styles.stepTitle}>Prepare for a conversation</Text>
            <Text style={styles.stepDesc}>Use this structure to keep it productive. Skip if you're not ready.</Text>

            <View style={styles.scriptCard}>
              <View style={styles.scriptStep}>
                <View style={styles.scriptNum}><Text style={styles.scriptNumText}>1</Text></View>
                <View style={styles.scriptContent}>
                  <Text style={styles.scriptLabel}>Describe what happened</Text>
                  <Text style={styles.scriptHint}>Stick to facts, not accusations</Text>
                  <TextInput
                    style={styles.scriptInput}
                    placeholder="When [specific event]..."
                    placeholderTextColor={TEXT_MUTED}
                    value={selections.conversationScript.whatHappened}
                    onChangeText={(t) => setSelections((s) => ({
                      ...s,
                      conversationScript: { ...s.conversationScript, whatHappened: t },
                    }))}
                  />
                </View>
              </View>

              <View style={styles.scriptStep}>
                <View style={styles.scriptNum}><Text style={styles.scriptNumText}>2</Text></View>
                <View style={styles.scriptContent}>
                  <Text style={styles.scriptLabel}>Share how you felt</Text>
                  <Text style={styles.scriptHint}>"I felt..." keeps it about your experience</Text>
                  <TextInput
                    style={styles.scriptInput}
                    placeholder="I felt..."
                    placeholderTextColor={TEXT_MUTED}
                    value={selections.conversationScript.howYouFelt}
                    onChangeText={(t) => setSelections((s) => ({
                      ...s,
                      conversationScript: { ...s.conversationScript, howYouFelt: t },
                    }))}
                  />
                </View>
              </View>

              <View style={styles.scriptStep}>
                <View style={styles.scriptNum}><Text style={styles.scriptNumText}>3</Text></View>
                <View style={styles.scriptContent}>
                  <Text style={styles.scriptLabel}>State what you need</Text>
                  <Text style={styles.scriptHint}>One clear request</Text>
                  <TextInput
                    style={styles.scriptInput}
                    placeholder="What I need is..."
                    placeholderTextColor={TEXT_MUTED}
                    value={selections.conversationScript.whatYouNeed}
                    onChangeText={(t) => setSelections((s) => ({
                      ...s,
                      conversationScript: { ...s.conversationScript, whatYouNeed: t },
                    }))}
                  />
                </View>
              </View>

              <View style={styles.scriptStep}>
                <View style={[styles.scriptNum, { backgroundColor: '#8b5cf6' }]}>
                  <Text style={styles.scriptNumText}>4</Text>
                </View>
                <View style={styles.scriptContent}>
                  <Text style={styles.scriptLabel}>Invite their perspective</Text>
                  <Text style={styles.scriptHint}>"I'd like to hear how you see it."</Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.practiceBtn} onPress={handlePractice}>
              <Ionicons name="chatbubbles-outline" size={20} color={ACCENT} />
              <Text style={styles.practiceBtnText}>Practice this conversation with AI</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 6: Summary & Resources */}
        {step === 6 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>Step 6 of 6</Text>
            <Text style={styles.stepTitle}>Your Plan & Resources</Text>

            {/* Summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📋 Your Reflection</Text>
              
              {selections.affectedGauges.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Affected:</Text>
                  <Text style={styles.summaryValue}>
                    {selections.affectedGauges.map((id) => GAUGES.find((g) => g.id === id)?.label).join(', ')}
                  </Text>
                </View>
              )}

              {selections.patterns.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Patterns:</Text>
                  <Text style={styles.summaryValue}>
                    {selections.patterns.map((id) => PATTERNS.find((p) => p.id === id)?.label).join(', ')}
                  </Text>
                </View>
              )}

              {selections.whatYouNeed && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>You need:</Text>
                  <Text style={styles.summaryValue}>{selections.whatYouNeed}</Text>
                </View>
              )}

              {selections.boundaryToSet && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Boundary:</Text>
                  <Text style={styles.summaryValue}>{selections.boundaryToSet}</Text>
                </View>
              )}

              {selections.chosenPath && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Path:</Text>
                  <Text style={styles.summaryValue}>
                    {PATHS.find((p) => p.id === selections.chosenPath)?.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Professional support */}
            <View style={styles.resourceSection}>
              <Text style={styles.resourceTitle}>Professional Support</Text>
              
              <View style={styles.resourceCard}>
                <Ionicons name="people" size={20} color={ACCENT} />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceLabel}>Family or individual therapy</Text>
                  <Text style={styles.resourceDesc}>
                    A therapist can help with communication, boundaries, and processing hurt.
                  </Text>
                </View>
              </View>

              <View style={styles.resourceCard}>
                <Ionicons name="git-compare" size={20} color={ACCENT} />
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceLabel}>Conflict mediation</Text>
                  <Text style={styles.resourceDesc}>
                    A neutral mediator can help family members have structured conversations.
                  </Text>
                </View>
              </View>
            </View>

            {/* Crisis resources */}
            <View style={styles.crisisSection}>
              <Text style={styles.crisisTitle}>🚨 Safety & Crisis Support</Text>
              <Text style={styles.crisisDesc}>
                If you're in emotional or physical danger, your safety comes first.
              </Text>
              
              {CRISIS_RESOURCES.map((r, i) => (
                <Pressable key={i} style={styles.crisisLink} onPress={() => openLink(r.url)}>
                  <Text style={styles.crisisLinkLabel}>{r.label}</Text>
                  <Text style={styles.crisisLinkPhone}>{r.phone}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                This tool is for reflection and support, not a substitute for professional help.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom navigation */}
      {step < 6 && (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextBtnText}>
              {step === 5 ? 'See Summary' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
          
          {step > 1 && step < 6 && (
            <Pressable style={styles.skipBtn} onPress={() => setStep(6)}>
              <Text style={styles.skipBtnText}>Skip to resources</Text>
            </Pressable>
          )}
        </View>
      )}
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
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: TEXT_COLOR },
  
  // Progress
  progressContainer: {
    height: 3,
    backgroundColor: BORDER,
    marginHorizontal: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: ACCENT,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },

  // Safety
  safetyCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  safetyText: { flex: 1, fontSize: 14, color: TEXT_COLOR, lineHeight: 20 },
  safetyLink: { fontSize: 14, color: '#f97316', fontWeight: '600' },

  // Step content
  stepContent: {},
  stepLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 6, letterSpacing: 0.5 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: TEXT_COLOR, marginBottom: 8 },
  stepDesc: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },

  // Options grid (Step 1)
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '47%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  optionEmoji: { fontSize: 28, marginBottom: 8 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR, marginBottom: 4 },
  optionLabelSelected: { color: ACCENT },
  optionDesc: { fontSize: 12, color: TEXT_MUTED, lineHeight: 16 },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Options list (Step 2)
  optionsList: { gap: 10 },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  listOptionContent: { flex: 1 },
  listOptionLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR },
  listOptionLabelSelected: { color: ACCENT },
  listOptionDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },

  // Text inputs (Step 3)
  inputLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR, marginBottom: 8, marginTop: 16 },
  textInput: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT_COLOR,
  },
  textArea: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT_COLOR,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aiHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  aiHelpText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  aiSuggestionCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  aiSuggestionLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 8 },
  aiSuggestionText: { fontSize: 15, color: TEXT_COLOR, lineHeight: 22 },
  useSuggestionBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: ACCENT,
    borderRadius: 8,
  },
  useSuggestionText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Path options (Step 4)
  pathOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pathOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  pathEmoji: { fontSize: 24, marginRight: 14 },
  pathContent: { flex: 1 },
  pathLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR },
  pathLabelSelected: { color: ACCENT },
  pathDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: ACCENT },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: ACCENT },

  // Script builder (Step 5)
  scriptCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  scriptStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  scriptNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scriptNumText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  scriptContent: { flex: 1 },
  scriptLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR, marginBottom: 2 },
  scriptHint: { fontSize: 13, color: TEXT_MUTED, marginBottom: 8 },
  scriptInput: {
    backgroundColor: BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    fontSize: 14,
    color: TEXT_COLOR,
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  practiceBtnText: { fontSize: 15, fontWeight: '600', color: ACCENT },

  // Summary (Step 6)
  summaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: TEXT_COLOR, marginBottom: 16 },
  summaryRow: { marginBottom: 12 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: ACCENT, marginBottom: 4 },
  summaryValue: { fontSize: 15, color: TEXT_COLOR, lineHeight: 22 },

  // Resources
  resourceSection: { marginBottom: 24 },
  resourceTitle: { fontSize: 16, fontWeight: '700', color: TEXT_COLOR, marginBottom: 12 },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  resourceContent: { flex: 1 },
  resourceLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR },
  resourceDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, lineHeight: 19 },

  // Crisis
  crisisSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 20,
  },
  crisisTitle: { fontSize: 16, fontWeight: '700', color: '#ef4444', marginBottom: 8 },
  crisisDesc: { fontSize: 14, color: TEXT_COLOR, lineHeight: 20, marginBottom: 16 },
  crisisLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.15)',
  },
  crisisLinkLabel: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  crisisLinkPhone: { fontSize: 14, color: TEXT_COLOR },

  footer: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  footerText: { fontSize: 12, color: TEXT_MUTED, lineHeight: 18, fontStyle: 'italic', textAlign: 'center' },

  // Bottom nav
  bottomNav: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: BG,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipBtnText: { fontSize: 14, color: TEXT_MUTED },
});
