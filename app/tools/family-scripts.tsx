/**
 * Family Playbook — Crash vs. Optimization Examples
 * Route: /tools/family-scripts
 *
 * 30+ pre-written scenarios organized by category, plus AI generation
 * for custom situations.
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import playbookData from '../../src/data/familyPlaybookScenarios.json';
import { callAI } from '../../src/services/ai';

type Category = (typeof playbookData.categories)[number];
type Scenario = (typeof playbookData.scenarios)[number];

// Flight-manual palette
const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.65)';
const NEON_CRASH = '#f97316';
const CRASH_BG = 'rgba(249,115,22,0.12)';
const CRASH_BORDER = 'rgba(249,115,22,0.35)';
const NEON_OPT = '#22d3ee';
const OPT_BG = 'rgba(34,211,238,0.12)';
const OPT_BORDER = 'rgba(34,211,238,0.35)';
const ACCENT = '#8b5cf6';

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [revealed, setRevealed] = useState(false);

  const onFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed((r) => !r);
  };

  return (
    <View style={styles.scenarioBlock}>
      <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      <Text style={styles.scenarioFocus}>{scenario.focus}</Text>

      <View style={styles.setupCard}>
        <Text style={styles.setupLabel}>SITUATION</Text>
        <Text style={styles.setupContext}>{scenario.context}</Text>
        <View style={styles.rolesRow}>
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>TEEN</Text>
            <Text style={styles.roleText}>{scenario.pilot}</Text>
          </View>
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>PARENT</Text>
            <Text style={styles.roleText}>{scenario.groundControl}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onFlip}
        style={({ pressed }) => [
          styles.flipCard,
          revealed ? styles.flipCardOpt : styles.flipCardCrash,
          pressed && styles.flipCardPressed,
        ]}
      >
        {!revealed ? (
          <>
            <View style={styles.flipHeader}>
              <Ionicons name="warning" size={18} color={NEON_CRASH} />
              <Text style={[styles.flipTitle, { color: NEON_CRASH }]}>The Crash</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Parent:</Text>
              <Text style={styles.dialogueLine}>{scenario.crash.parent}</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Teen:</Text>
              <Text style={styles.dialogueLine}>{scenario.crash.teen}</Text>
            </View>
            <View style={styles.outcomeBadgeCrash}>
              <Text style={styles.outcomeText}>{scenario.crash.outcome}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to see The Optimization →</Text>
          </>
        ) : (
          <>
            <View style={styles.flipHeader}>
              <Ionicons name="checkmark-circle" size={18} color={NEON_OPT} />
              <Text style={[styles.flipTitle, { color: NEON_OPT }]}>The Optimization</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Parent:</Text>
              <Text style={styles.dialogueLine}>{scenario.optimization.parent}</Text>
            </View>
            <View style={styles.dialogueRow}>
              <Text style={styles.dialogueWho}>Teen:</Text>
              <Text style={styles.dialogueLine}>{scenario.optimization.teen}</Text>
            </View>
            <View style={styles.outcomeBadgeOpt}>
              <Text style={styles.outcomeText}>{scenario.optimization.outcome}</Text>
            </View>
            <Text style={styles.tapHint}>← Tap to see The Crash</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: Category;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text style={[styles.categoryName, selected && styles.categoryNameSelected]}>
        {category.name}
      </Text>
    </Pressable>
  );
}

export default function FamilyPlaybookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Scenario | null>(null);

  const filteredScenarios = selectedCategory
    ? playbookData.scenarios.filter((s) => s.category === selectedCategory)
    : playbookData.scenarios;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const generateCustomScenario = useCallback(async () => {
    if (!aiInput.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAiLoading(true);

    try {
      const prompt = `You are an expert in family communication and parent-teen relationships. Generate a scenario in the Family Playbook format.

The user describes this situation: "${aiInput}"

Generate a JSON response with this exact structure:
{
  "title": "Short catchy title",
  "focus": "What communication dynamic this addresses",
  "context": "Brief setup of the situation",
  "pilot": "Teen's internal state/perspective",
  "groundControl": "Parent's internal state/perspective",
  "crash": {
    "parent": "What the parent says in the unhealthy version",
    "teen": "How the teen responds defensively",
    "outcome": "The negative result"
  },
  "optimization": {
    "parent": "What the parent says using healthy communication",
    "teen": "How the teen responds when met with understanding",
    "outcome": "The positive result"
  }
}

Make it realistic, relatable, and genuinely helpful. The "crash" should feel painfully familiar to parents. The "optimization" should be specific and actionable, not generic advice.

Return ONLY the JSON, no other text.`;

      const response = await callAI([{ role: 'user', content: prompt }], {
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parse the JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiResult({
          id: 'ai-generated',
          category: 'custom',
          ...parsed,
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput]);

  const closeAIModal = () => {
    setShowAIModal(false);
    setAiInput('');
    setAiResult(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Family Playbook</Text>
        <Pressable
          onPress={() => setShowAIModal(true)}
          style={styles.aiBtn}
          hitSlop={12}
        >
          <Ionicons name="sparkles" size={22} color={ACCENT} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Real family scenarios showing "The Crash" vs "The Optimization." Tap each to flip.
        </Text>

        {/* AI Generate Button */}
        <Pressable
          onPress={() => setShowAIModal(true)}
          style={styles.aiGenerateCard}
        >
          <Ionicons name="sparkles" size={24} color={ACCENT} />
          <View style={styles.aiGenerateText}>
            <Text style={styles.aiGenerateTitle}>Generate Custom Scenario</Text>
            <Text style={styles.aiGenerateSubtitle}>
              Describe your situation and AI will create a personalized example
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </Pressable>

        {/* Category Filter */}
        <Text style={styles.sectionLabel}>FILTER BY TOPIC</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(null);
            }}
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
          >
            <Text style={styles.categoryEmoji}>📋</Text>
            <Text style={[styles.categoryName, !selectedCategory && styles.categoryNameSelected]}>
              All ({playbookData.scenarios.length})
            </Text>
          </Pressable>
          {playbookData.categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Scenarios */}
        <Text style={styles.sectionLabel}>
          {selectedCategory
            ? `${playbookData.categories.find((c) => c.id === selectedCategory)?.name.toUpperCase()} (${filteredScenarios.length})`
            : `ALL SCENARIOS (${filteredScenarios.length})`}
        </Text>

        {filteredScenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </ScrollView>

      {/* AI Generation Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Custom Scenario</Text>
              <Pressable onPress={closeAIModal} hitSlop={12}>
                <Ionicons name="close" size={24} color={TEXT_MUTED} />
              </Pressable>
            </View>

            {!aiResult ? (
              <>
                <Text style={styles.modalSubtitle}>
                  Describe a situation you're dealing with, and I'll generate a Crash vs. Optimization example.
                </Text>

                <TextInput
                  style={styles.aiInput}
                  placeholder="e.g., My teen spends all their time in their room and barely talks to us anymore..."
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  value={aiInput}
                  onChangeText={setAiInput}
                  editable={!aiLoading}
                />

                <Pressable
                  onPress={generateCustomScenario}
                  style={[styles.generateBtn, (!aiInput.trim() || aiLoading) && styles.generateBtnDisabled]}
                  disabled={!aiInput.trim() || aiLoading}
                >
                  {aiLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="#fff" />
                      <Text style={styles.generateBtnText}>Generate Scenario</Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : (
              <ScrollView style={styles.aiResultScroll} showsVerticalScrollIndicator={false}>
                <ScenarioCard scenario={aiResult} />
                <Pressable
                  onPress={() => {
                    setAiResult(null);
                    setAiInput('');
                  }}
                  style={styles.tryAnotherBtn}
                >
                  <Text style={styles.tryAnotherText}>Generate Another</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  aiBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  intro: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  
  // AI Generate Card
  aiGenerateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: ACCENT + '40',
    gap: SPACING.md,
  },
  aiGenerateText: {
    flex: 1,
  },
  aiGenerateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  aiGenerateSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  
  // Categories
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  categoriesScroll: {
    marginHorizontal: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: ACCENT + '20',
    borderColor: ACCENT,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: TEXT,
  },

  // Scenarios
  scenarioBlock: {
    marginBottom: SPACING.xxl,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  scenarioFocus: {
    fontSize: 13,
    color: NEON_OPT,
    marginBottom: SPACING.md,
  },
  setupCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  setupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    marginBottom: SPACING.sm,
  },
  setupContext: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  rolesRow: {
    gap: SPACING.md,
  },
  roleBox: {
    paddingVertical: SPACING.sm,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: NEON_OPT,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  flipCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  flipCardCrash: {
    backgroundColor: CRASH_BG,
    borderColor: CRASH_BORDER,
  },
  flipCardOpt: {
    backgroundColor: OPT_BG,
    borderColor: OPT_BORDER,
  },
  flipCardPressed: {
    opacity: 0.92,
  },
  flipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  flipTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dialogueRow: {
    marginBottom: SPACING.sm,
  },
  dialogueWho: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  dialogueLine: {
    fontSize: 15,
    color: TEXT,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  outcomeBadgeCrash: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: BORDER_RADIUS.sm,
  },
  outcomeBadgeOpt: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderRadius: BORDER_RADIUS.sm,
  },
  outcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
  },
  tapHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  modalSubtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  aiInput: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    color: TEXT,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  aiResultScroll: {
    flex: 1,
  },
  tryAnotherBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  tryAnotherText: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: '600',
  },
});
