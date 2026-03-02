/**
 * PHOSM: State Regulation Map
 * 
 * Personalization layer for the State gauge.
 * User defines THEIR triggers, regulation tools, and early warning signs.
 * The Polyvagal Theory science is already defined.
 * This captures what regulation looks like FOR THIS USER.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useFoundationStore } from '../../src/stores/foundationStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

type Step = 'intro' | 'default' | 'triggers' | 'tools' | 'warnings' | 'done';

// State gauge color (Ocean Teal)
const STATE_TEAL = '#0D9488';

interface RegulationMap {
  defaultState: 'calm' | 'alert' | 'anxious' | 'variable';
  triggers: string[];
  topTriggers: string[]; // Top 3 most impactful
  tools: string[];
  topTools: string[]; // Top 3 most effective
  earlyWarnings: string[];
  customTrigger: string;
  customTool: string;
}

const defaultMap: RegulationMap = {
  defaultState: 'alert',
  triggers: [],
  topTriggers: [],
  tools: [],
  topTools: [],
  earlyWarnings: [],
  customTrigger: '',
  customTool: '',
};

const DEFAULT_STATES = [
  { id: 'calm', label: 'Naturally calm', emoji: '😌', desc: 'Relaxed is your baseline' },
  { id: 'alert', label: 'Naturally alert', emoji: '⚡', desc: 'Energized, ready, but not stressed' },
  { id: 'anxious', label: 'Naturally anxious', emoji: '😰', desc: 'Tend toward worry/activation' },
  { id: 'variable', label: 'Highly variable', emoji: '🔄', desc: 'Changes a lot depending on context' },
];

const TRIGGER_CATEGORIES = [
  {
    category: 'Situations',
    triggers: [
      { id: 'conflict', label: 'Conflict or confrontation' },
      { id: 'deadlines', label: 'Deadlines / time pressure' },
      { id: 'uncertainty', label: 'Uncertainty / waiting' },
      { id: 'decisions', label: 'Big decisions' },
      { id: 'social', label: 'Social situations' },
      { id: 'crowds', label: 'Crowds / overstimulation' },
      { id: 'performance', label: 'Being watched / evaluated' },
    ],
  },
  {
    category: 'Internal',
    triggers: [
      { id: 'sleep-lack', label: 'Lack of sleep' },
      { id: 'hunger', label: 'Hunger' },
      { id: 'pain', label: 'Physical pain' },
      { id: 'hormones', label: 'Hormonal changes' },
      { id: 'caffeine', label: 'Too much caffeine' },
    ],
  },
  {
    category: 'Relationships',
    triggers: [
      { id: 'dismissed', label: 'Feeling dismissed' },
      { id: 'disappoint', label: 'Disappointing others' },
      { id: 'criticized', label: 'Being criticized' },
      { id: 'rejection', label: 'Rejection or exclusion' },
      { id: 'misunderstood', label: 'Being misunderstood' },
    ],
  },
];

const TOOL_CATEGORIES = [
  {
    category: 'Body-Based',
    tools: [
      { id: 'breathing', label: 'Deep breathing', emoji: '🌬️' },
      { id: 'cold-water', label: 'Cold water / splash face', emoji: '💧' },
      { id: 'exercise', label: 'Exercise / movement', emoji: '🏃' },
      { id: 'pmr', label: 'Muscle relaxation', emoji: '💆' },
      { id: 'shaking', label: 'Shaking it out', emoji: '🤸' },
    ],
  },
  {
    category: 'Environment',
    tools: [
      { id: 'outside', label: 'Going outside', emoji: '🌳' },
      { id: 'quiet', label: 'Quiet space alone', emoji: '🤫' },
      { id: 'scenery', label: 'Change of scenery', emoji: '🚶' },
      { id: 'nature', label: 'Nature', emoji: '🌿' },
    ],
  },
  {
    category: 'Sensory',
    tools: [
      { id: 'music', label: 'Music', emoji: '🎵' },
      { id: 'sounds', label: 'Calming sounds', emoji: '🔊' },
      { id: 'comfort-item', label: 'Comfort item / texture', emoji: '🧸' },
      { id: 'scent', label: 'Aromatherapy / scents', emoji: '🕯️' },
    ],
  },
  {
    category: 'Connection',
    tools: [
      { id: 'talk', label: 'Talking to someone', emoji: '💬' },
      { id: 'physical-comfort', label: 'Physical comfort (hug)', emoji: '🤗' },
      { id: 'near-people', label: 'Being near people (quietly)', emoji: '👥' },
      { id: 'alone-time', label: 'Alone time', emoji: '🧘' },
    ],
  },
  {
    category: 'Cognitive',
    tools: [
      { id: 'journaling', label: 'Journaling', emoji: '📝' },
      { id: 'naming', label: 'Naming the feeling', emoji: '🏷️' },
      { id: 'reminding', label: 'Reminding myself it passes', emoji: '⏳' },
      { id: 'distraction', label: 'Distraction (TV, games)', emoji: '📺' },
    ],
  },
];

const EARLY_WARNINGS = [
  { category: 'Body Signals', warnings: [
    { id: 'shoulders', label: 'Shoulders/neck tense' },
    { id: 'stomach', label: 'Stomach tight' },
    { id: 'heart', label: 'Heart racing' },
    { id: 'breathing-shallow', label: 'Shallow breathing' },
    { id: 'jaw', label: 'Jaw clenching' },
    { id: 'sweating', label: 'Sweating' },
  ]},
  { category: 'Mental Signals', warnings: [
    { id: 'racing', label: 'Racing thoughts' },
    { id: 'focus', label: "Can't focus" },
    { id: 'catastrophizing', label: 'Worst-case thinking' },
    { id: 'foggy', label: 'Feeling foggy' },
    { id: 'ruminating', label: 'Stuck on one thought' },
  ]},
  { category: 'Behavioral Signals', warnings: [
    { id: 'snappy', label: 'Getting snappy / irritable' },
    { id: 'withdrawing', label: 'Withdrawing' },
    { id: 'scrolling', label: 'Scrolling / numbing' },
    { id: 'restless', label: "Can't sit still" },
    { id: 'avoiding', label: 'Avoiding tasks' },
  ]},
];

export default function PHOSMStateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const existingMap = useFoundationStore((s) => s.regulationMap);
  const setRegulationMap = useFoundationStore((s) => s.setRegulationMap);
  
  const [step, setStep] = useState<Step>('intro');
  const [regMap, setRegMap] = useState<RegulationMap>(existingMap || defaultMap);

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'default', 'triggers', 'tools', 'warnings', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      if (step === 'warnings') {
        setRegulationMap(regMap);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'default', 'triggers', 'tools', 'warnings', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const toggleTrigger = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRegMap((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(id)
        ? prev.triggers.filter((t) => t !== id)
        : [...prev.triggers, id],
    }));
  };

  const toggleTool = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRegMap((prev) => ({
      ...prev,
      tools: prev.tools.includes(id)
        ? prev.tools.filter((t) => t !== id)
        : [...prev.tools, id],
    }));
  };

  const toggleTopTrigger = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRegMap((prev) => {
      if (prev.topTriggers.includes(id)) {
        return { ...prev, topTriggers: prev.topTriggers.filter((t) => t !== id) };
      }
      if (prev.topTriggers.length >= 3) return prev;
      return { ...prev, topTriggers: [...prev.topTriggers, id] };
    });
  };

  const toggleTopTool = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRegMap((prev) => {
      if (prev.topTools.includes(id)) {
        return { ...prev, topTools: prev.topTools.filter((t) => t !== id) };
      }
      if (prev.topTools.length >= 3) return prev;
      return { ...prev, topTools: [...prev.topTools, id] };
    });
  };

  const toggleWarning = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRegMap((prev) => ({
      ...prev,
      earlyWarnings: prev.earlyWarnings.includes(id)
        ? prev.earlyWarnings.filter((w) => w !== id)
        : [...prev.earlyWarnings, id],
    }));
  };

  const stepNumber = ['intro', 'default', 'triggers', 'tools', 'warnings', 'done'].indexOf(step);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name={step === 'intro' ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Regulation Map</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        {step !== 'intro' && step !== 'done' && (
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((n) => (
              <View
                key={n}
                style={[styles.progressDot, stepNumber >= n && styles.progressDotFilled]}
              />
            ))}
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* INTRO */}
            {step === 'intro' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>⚡</Text>
                <Text style={styles.title}>Your Regulation Map</Text>
                <Text style={styles.subtitle}>
                  Polyvagal Theory explains how your nervous system works.{'\n\n'}
                  But what activates <Text style={styles.emphasis}>your</Text> system?{'\n'}
                  What helps <Text style={styles.emphasis}>you</Text> regulate?
                </Text>
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    Let's map your triggers, your tools, and your early warning signs.
                    {'\n\n'}
                    This turns your check-in into a personalized regulation guide.
                  </Text>
                </View>
                <View style={styles.aiHint}>
                  <Ionicons name="sparkles" size={16} color={STATE_TEAL} />
                  <Text style={styles.aiHintText}>AI will remind you of YOUR tools when you're activated</Text>
                </View>
              </View>
            )}

            {/* DEFAULT STATE */}
            {step === 'default' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Default State</Text>
                <Text style={styles.subtitle}>
                  When nothing's happening, what's your natural baseline?
                </Text>

                <View style={styles.defaultOptions}>
                  {DEFAULT_STATES.map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.defaultOption,
                        regMap.defaultState === s.id && styles.defaultOptionSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRegMap((prev) => ({ ...prev, defaultState: s.id as any }));
                      }}
                    >
                      <Text style={styles.defaultEmoji}>{s.emoji}</Text>
                      <View style={styles.defaultTextContainer}>
                        <Text style={[
                          styles.defaultLabel,
                          regMap.defaultState === s.id && styles.defaultLabelSelected,
                        ]}>
                          {s.label}
                        </Text>
                        <Text style={styles.defaultDesc}>{s.desc}</Text>
                      </View>
                      {regMap.defaultState === s.id && (
                        <Ionicons name="checkmark-circle" size={24} color={STATE_TEAL} />
                      )}
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.hint}>
                  No right answer — this helps AI understand YOUR normal.
                </Text>
              </View>
            )}

            {/* TRIGGERS */}
            {step === 'triggers' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Triggers</Text>
                <Text style={styles.subtitle}>
                  What pushes you into activation or stress?
                </Text>

                {TRIGGER_CATEGORIES.map((cat) => (
                  <View key={cat.category} style={styles.categorySection}>
                    <Text style={styles.categoryLabel}>{cat.category}</Text>
                    <View style={styles.checkList}>
                      {cat.triggers.map((t) => {
                        const selected = regMap.triggers.includes(t.id);
                        return (
                          <Pressable
                            key={t.id}
                            style={[styles.checkItem, selected && styles.checkItemSelected]}
                            onPress={() => toggleTrigger(t.id)}
                          >
                            <Ionicons
                              name={selected ? 'checkbox' : 'square-outline'}
                              size={22}
                              color={selected ? STATE_TEAL : COLORS.textMuted}
                            />
                            <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                              {t.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {regMap.triggers.length >= 3 && (
                  <View style={styles.topSection}>
                    <Text style={styles.topLabel}>Which hit HARDEST? (pick up to 3)</Text>
                    <View style={styles.topChips}>
                      {regMap.triggers.map((id) => {
                        const trigger = TRIGGER_CATEGORIES.flatMap((c) => c.triggers).find((t) => t.id === id);
                        const isTop = regMap.topTriggers.includes(id);
                        return (
                          <Pressable
                            key={id}
                            style={[styles.topChip, isTop && styles.topChipSelected]}
                            onPress={() => toggleTopTrigger(id)}
                          >
                            <Text style={[styles.topChipText, isTop && styles.topChipTextSelected]}>
                              {trigger?.label}
                            </Text>
                            {isTop && <Text style={styles.topBadge}>#{regMap.topTriggers.indexOf(id) + 1}</Text>}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* TOOLS */}
            {step === 'tools' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Regulation Tools</Text>
                <Text style={styles.subtitle}>
                  What actually helps you calm down?
                </Text>

                {TOOL_CATEGORIES.map((cat) => (
                  <View key={cat.category} style={styles.categorySection}>
                    <Text style={styles.categoryLabel}>{cat.category}</Text>
                    <View style={styles.toolGrid}>
                      {cat.tools.map((t) => {
                        const selected = regMap.tools.includes(t.id);
                        return (
                          <Pressable
                            key={t.id}
                            style={[styles.toolChip, selected && styles.toolChipSelected]}
                            onPress={() => toggleTool(t.id)}
                          >
                            <Text style={styles.toolEmoji}>{t.emoji}</Text>
                            <Text style={[styles.toolLabel, selected && styles.toolLabelSelected]}>
                              {t.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {regMap.tools.length >= 3 && (
                  <View style={styles.topSection}>
                    <Text style={styles.topLabel}>Your GO-TO tools (pick up to 3)</Text>
                    <View style={styles.topChips}>
                      {regMap.tools.map((id) => {
                        const tool = TOOL_CATEGORIES.flatMap((c) => c.tools).find((t) => t.id === id);
                        const isTop = regMap.topTools.includes(id);
                        return (
                          <Pressable
                            key={id}
                            style={[styles.topChip, isTop && styles.topChipSelected]}
                            onPress={() => toggleTopTool(id)}
                          >
                            <Text style={styles.topChipEmoji}>{tool?.emoji}</Text>
                            <Text style={[styles.topChipText, isTop && styles.topChipTextSelected]}>
                              {tool?.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* EARLY WARNINGS */}
            {step === 'warnings' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Early Warning Signs</Text>
                <Text style={styles.subtitle}>
                  How do you KNOW you're getting activated?{'\n'}
                  The earlier you catch it, the easier to regulate.
                </Text>

                {EARLY_WARNINGS.map((cat) => (
                  <View key={cat.category} style={styles.categorySection}>
                    <Text style={styles.categoryLabel}>{cat.category}</Text>
                    <View style={styles.checkList}>
                      {cat.warnings.map((w) => {
                        const selected = regMap.earlyWarnings.includes(w.id);
                        return (
                          <Pressable
                            key={w.id}
                            style={[styles.checkItem, selected && styles.checkItemSelected]}
                            onPress={() => toggleWarning(w.id)}
                          >
                            <Ionicons
                              name={selected ? 'checkbox' : 'square-outline'}
                              size={22}
                              color={selected ? STATE_TEAL : COLORS.textMuted}
                            />
                            <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                              {w.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* DONE */}
            {step === 'done' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={styles.title}>Regulation Map Complete</Text>
                
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Default State</Text>
                    <Text style={styles.summaryValue}>
                      {DEFAULT_STATES.find((s) => s.id === regMap.defaultState)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Top Triggers</Text>
                    <Text style={styles.summaryValue}>
                      {regMap.topTriggers.length > 0
                        ? regMap.topTriggers.map((id) => 
                            TRIGGER_CATEGORIES.flatMap((c) => c.triggers).find((t) => t.id === id)?.label
                          ).join(', ')
                        : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Go-To Tools</Text>
                    <Text style={styles.summaryValue}>
                      {regMap.topTools.length > 0
                        ? regMap.topTools.map((id) =>
                            TOOL_CATEGORIES.flatMap((c) => c.tools).find((t) => t.id === id)?.label
                          ).join(', ')
                        : 'Not set'}
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    When you check in as "Activated", AI will remind you:{'\n\n'}
                    "Your go-to tools are {regMap.topTools.slice(0, 2).map((id) =>
                      TOOL_CATEGORIES.flatMap((c) => c.tools).find((t) => t.id === id)?.label.toLowerCase()
                    ).join(' and ')}. Want to try one?"
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Button */}
          <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + SPACING.md }]}>
            <Pressable
              style={styles.primaryBtn}
              onPress={step === 'done' ? handleClose : handleNext}
            >
              <Text style={styles.primaryBtnText}>
                {step === 'intro' ? "Map My System" : step === 'done' ? 'Done' : 'Continue'}
              </Text>
              {step !== 'done' && <Ionicons name="arrow-forward" size={20} color="#000" />}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotFilled: { backgroundColor: STATE_TEAL },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  stepContainer: { alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: SPACING.md },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  emphasis: { color: STATE_TEAL, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.md,
  },
  cardText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  aiHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  aiHintText: { fontSize: 13, color: STATE_TEAL },
  hint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  defaultOptions: { width: '100%', gap: 10 },
  defaultOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  defaultOptionSelected: {
    backgroundColor: STATE_TEAL + '15',
    borderColor: STATE_TEAL,
  },
  defaultEmoji: { fontSize: 28 },
  defaultTextContainer: { flex: 1 },
  defaultLabel: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  defaultLabelSelected: { color: STATE_TEAL },
  defaultDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  categorySection: { width: '100%', marginBottom: SPACING.lg },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  checkList: { gap: 8 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  checkItemSelected: { backgroundColor: STATE_TEAL + '15' },
  checkLabel: { fontSize: 15, color: COLORS.textSecondary },
  checkLabelSelected: { color: COLORS.text },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toolChipSelected: {
    backgroundColor: STATE_TEAL + '22',
    borderColor: STATE_TEAL,
  },
  toolEmoji: { fontSize: 16 },
  toolLabel: { fontSize: 14, color: COLORS.textSecondary },
  toolLabelSelected: { color: STATE_TEAL, fontWeight: '500' },
  topSection: {
    width: '100%',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  topLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: STATE_TEAL,
    marginBottom: SPACING.sm,
  },
  topChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.inputSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topChipSelected: {
    backgroundColor: STATE_TEAL + '33',
    borderColor: STATE_TEAL,
  },
  topChipEmoji: { fontSize: 14 },
  topChipText: { fontSize: 13, color: COLORS.textSecondary },
  topChipTextSelected: { color: COLORS.text, fontWeight: '500' },
  topBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: STATE_TEAL,
    marginLeft: 4,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    gap: 12,
  },
  summaryRow: { gap: 4 },
  summaryLabel: { fontSize: 14, color: COLORS.textMuted },
  summaryValue: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  bottomContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: STATE_TEAL,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.button,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#000' },
});
