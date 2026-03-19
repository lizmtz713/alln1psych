/**
 * Family Conflict Navigator v2 — AI-powered family conflict support
 * Two modes: Guide (static steps) + AI Mediator (personalized analysis)
 * Route: /tools/family-conflict
 */

import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  FAMILY_CONFLICT_GAUGES,
  FAMILY_CONFLICT_PATTERNS,
  BOUNDARY_EXAMPLES,
  PATHS,
  CONVERSATION_STRUCTURE,
  RESOURCES,
} from '../../../src/data/familyConflictNavigator';
import { sendMessageWithSystemPromptOnly, hasOpenAIKey } from '../../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT_COLOR = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

type Tab = 'mediator' | 'guide';

interface MediatorResult {
  yourPerspective: string;
  theirPerspective: string;
  pattern: string;
  whatYouNeed: string;
  whatTheySay: string;
  whatYouSay: string;
  boundary: string;
  path: string;
  warning: string | null;
}

export default function FamilyConflictNavigatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [tab, setTab] = useState<Tab>('mediator');
  
  // AI Mediator state
  const [situation, setSituation] = useState('');
  const [familyMember, setFamilyMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MediatorResult | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch(() => {});
  };

  const analyzeConflict = useCallback(async () => {
    if (!situation.trim()) {
      Alert.alert('Missing info', 'Describe what happened.');
      return;
    }

    const hasKey = await hasOpenAIKey();
    if (!hasKey) {
      Alert.alert('API key needed', 'Add your OpenAI API key in Settings for AI analysis.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);

    try {
      const memberContext = familyMember.trim() ? `Family member: ${familyMember.trim()}` : 'Family member not specified';
      
      const systemPrompt = `You are a family therapist helping someone navigate a difficult family conflict. Be warm but direct. Never take sides, but validate the user's experience while helping them see the full picture.

${memberContext}
Situation: ${situation.trim()}

Analyze this conflict and provide guidance. Check for any safety concerns.

Respond in this exact JSON format:
{
  "yourPerspective": "What you're experiencing and feeling (validate this, 2-3 sentences)",
  "theirPerspective": "What might be going on for the family member - not to excuse, but to understand (2-3 sentences)",
  "pattern": "The underlying family dynamic or pattern at play (1-2 sentences)",
  "whatYouNeed": "What you seem to need from this relationship right now (1 sentence)",
  "whatTheySay": "What they might say that triggers you (example phrase)",
  "whatYouSay": "What you could say in response - boundaried but not aggressive",
  "boundary": "A specific boundary you could set (concrete, actionable)",
  "path": "Recommended path: 'conversation', 'space', 'support', or 'distance' with brief explanation",
  "warning": "If there are safety concerns (abuse, danger), put a warning here. Otherwise null"
}

Be specific to their situation. No generic advice.`;

      const response = await sendMessageWithSystemPromptOnly(
        [{ role: 'user', content: 'Analyze my family conflict.' }],
        systemPrompt,
        600
      );

      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as MediatorResult;
          setResult(parsed);
        }
      }
    } catch (e) {
      Alert.alert('Analysis failed', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [situation, familyMember]);

  const handlePractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/role-play');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
        </Pressable>
        <Text style={styles.headerTitle}>Family Conflict</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, tab === 'mediator' && styles.tabActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab('mediator'); }}
        >
          <Ionicons name="sparkles" size={18} color={tab === 'mediator' ? ACCENT : TEXT_MUTED} />
          <Text style={[styles.tabLabel, tab === 'mediator' && styles.tabLabelActive]}>AI Mediator</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'guide' && styles.tabActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab('guide'); }}
        >
          <Ionicons name="book-outline" size={18} color={tab === 'guide' ? ACCENT : TEXT_MUTED} />
          <Text style={[styles.tabLabel, tab === 'guide' && styles.tabLabelActive]}>Guide</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── AI Mediator ─── */}
        {tab === 'mediator' && (
          <>
            <Text style={styles.intro}>
              Describe your family conflict. AI will help you understand both sides and find a path forward.
            </Text>

            {/* Safety notice */}
            <View style={styles.safetyNotice}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.warning} />
              <Text style={styles.safetyText}>
                If you're in danger, your safety comes first. Crisis resources are in the Guide tab.
              </Text>
            </View>

            <Text style={styles.label}>Who is this about?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. My mother, My brother, My in-laws"
              placeholderTextColor={TEXT_MUTED}
              value={familyMember}
              onChangeText={setFamilyMember}
            />

            <Text style={styles.label}>What's happening?</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Describe the conflict, what was said, how you're feeling..."
              placeholderTextColor={TEXT_MUTED}
              value={situation}
              onChangeText={(t) => { setSituation(t); setResult(null); }}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.analyzeBtn, (loading || !situation.trim()) && styles.analyzeBtnDisabled]}
              onPress={analyzeConflict}
              disabled={loading || !situation.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Analyze conflict</Text>
                </>
              )}
            </Pressable>

            {/* Results */}
            {result && (
              <View style={styles.resultSection}>
                {/* Warning if present */}
                {result.warning && (
                  <View style={styles.warningCard}>
                    <Ionicons name="warning" size={20} color={COLORS.error} />
                    <Text style={styles.warningText}>{result.warning}</Text>
                  </View>
                )}

                {/* Your perspective */}
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="person" size={18} color={ACCENT} />
                    <Text style={styles.resultLabel}>Your experience</Text>
                  </View>
                  <Text style={styles.resultText}>{result.yourPerspective}</Text>
                </View>

                {/* Their perspective */}
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="people" size={18} color="#8B5CF6" />
                    <Text style={styles.resultLabel}>Their side (not excusing, understanding)</Text>
                  </View>
                  <Text style={styles.resultText}>{result.theirPerspective}</Text>
                </View>

                {/* Pattern */}
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="git-branch" size={18} color="#F59E0B" />
                    <Text style={styles.resultLabel}>The pattern</Text>
                  </View>
                  <Text style={styles.resultText}>{result.pattern}</Text>
                </View>

                {/* What you need */}
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="heart" size={18} color="#EC4899" />
                    <Text style={styles.resultLabel}>What you need</Text>
                  </View>
                  <Text style={styles.resultText}>{result.whatYouNeed}</Text>
                </View>

                {/* Script */}
                <View style={[styles.resultCard, styles.scriptCard]}>
                  <Text style={styles.scriptLabel}>If they say:</Text>
                  <Text style={styles.scriptTheySay}>"{result.whatTheySay}"</Text>
                  <Text style={styles.scriptLabel}>You could say:</Text>
                  <Text style={styles.scriptYouSay}>"{result.whatYouSay}"</Text>
                </View>

                {/* Boundary */}
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="shield" size={18} color={ACCENT} />
                    <Text style={styles.resultLabel}>Boundary to set</Text>
                  </View>
                  <Text style={styles.resultText}>{result.boundary}</Text>
                </View>

                {/* Recommended path */}
                <View style={[styles.resultCard, styles.pathCard]}>
                  <View style={styles.resultHeader}>
                    <Ionicons name="compass" size={18} color={ACCENT} />
                    <Text style={styles.resultLabel}>Recommended path</Text>
                  </View>
                  <Text style={styles.resultText}>{result.path}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <Pressable style={styles.actionBtn} onPress={handlePractice}>
                    <Ionicons name="chatbubbles-outline" size={18} color={ACCENT} />
                    <Text style={styles.actionBtnText}>Practice conversation</Text>
                  </Pressable>
                  <Pressable style={styles.actionBtn} onPress={() => { setSituation(''); setFamilyMember(''); setResult(null); }}>
                    <Ionicons name="refresh-outline" size={18} color={TEXT_MUTED} />
                    <Text style={[styles.actionBtnText, { color: TEXT_MUTED }]}>New situation</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}

        {/* ─── Guide Tab (original content) ─── */}
        {tab === 'guide' && (
          <>
            <Text style={styles.intro}>
              A calm, step-by-step way to reflect on difficult family relationships and choose a path that respects your safety and autonomy.
            </Text>

            {/* Safety first */}
            <View style={styles.safetyNotice}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.warning} />
              <Text style={styles.safetyText}>
                If you are in emotional or physical danger, your safety comes first. You do not have to stay in harmful situations.
              </Text>
            </View>

            {/* Step 1 */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 1</Text>
              <Text style={styles.stepTitle}>What's happening?</Text>
              <Text style={styles.stepDesc}>A quick self-check. No right answers—just notice.</Text>
              <View style={styles.gaugesRow}>
                {FAMILY_CONFLICT_GAUGES.map((g) => (
                  <View key={g.id} style={styles.gaugeChip}>
                    <Text style={styles.gaugeChipEmoji}>{g.emoji}</Text>
                    <Text style={styles.gaugeChipLabel}>{g.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 2</Text>
              <Text style={styles.stepTitle}>Identify the pattern</Text>
              {FAMILY_CONFLICT_PATTERNS.map((p) => (
                <View key={p.id} style={styles.patternCard}>
                  <Text style={styles.patternLabel}>{p.label}</Text>
                  <Text style={styles.patternShort}>{p.short}</Text>
                </View>
              ))}
            </View>

            {/* Step 3 */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 3</Text>
              <Text style={styles.stepTitle}>Healthy boundaries</Text>
              {BOUNDARY_EXAMPLES.map((ex, i) => (
                <Text key={i} style={styles.bullet}>• {ex}</Text>
              ))}
            </View>

            {/* Step 4 */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 4</Text>
              <Text style={styles.stepTitle}>Choose a path</Text>
              {PATHS.map((p) => (
                <View key={p.id} style={styles.pathOptionCard}>
                  <Text style={styles.pathEmoji}>{p.emoji}</Text>
                  <View style={styles.pathBody}>
                    <Text style={styles.pathLabel}>{p.label}</Text>
                    <Text style={styles.pathDesc}>{p.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Step 5 */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 5</Text>
              <Text style={styles.stepTitle}>Conversation structure</Text>
              {CONVERSATION_STRUCTURE.map((c) => (
                <View key={c.step} style={styles.convRow}>
                  <Text style={styles.convStepNum}>{c.step}</Text>
                  <View style={styles.convBody}>
                    <Text style={styles.convLabel}>{c.label}</Text>
                    <Text style={styles.convPrompt}>{c.prompt}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Step 6 - Resources */}
            <View style={styles.stepBlock}>
              <Text style={styles.stepBadge}>Step 6</Text>
              <Text style={styles.stepTitle}>Resources</Text>
              {RESOURCES.map((r) => (
                <View key={r.id} style={[styles.resourceCard, r.emphasis && styles.resourceCardEmphasis]}>
                  <Text style={[styles.resourceLabel, r.emphasis && styles.resourceLabelEmphasis]}>{r.label}</Text>
                  <Text style={styles.resourceDesc}>{r.description}</Text>
                  {r.links?.map((link, i) => (
                    <Pressable key={i} style={styles.resourceLink} onPress={() => openLink(link.url)}>
                      <Text style={styles.resourceLinkText}>{link.label}</Text>
                      {link.phone && <Text style={styles.resourcePhone}> {link.phone}</Text>}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This tool is for reflection and support, not a substitute for professional help.
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
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR, flex: 1, textAlign: 'center' },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: COLORS.accentBg || 'rgba(13,148,136,0.12)' },
  tabLabel: { fontSize: 14, color: TEXT_MUTED, fontWeight: '500' },
  tabLabelActive: { color: ACCENT, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: SPACING.md },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(224, 122, 95, 0.12)',
    borderRadius: BORDER_RADIUS.card,
    padding: 12,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.25)',
  },
  safetyText: { flex: 1, fontSize: 13, color: TEXT_COLOR, lineHeight: 19, marginLeft: 8 },
  label: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    fontSize: 15,
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  inputLarge: { minHeight: 120, textAlignVertical: 'top' },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    marginTop: 8,
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultSection: { marginTop: 24 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(239, 83, 80, 0.12)',
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  warningText: { flex: 1, fontSize: 14, color: TEXT_COLOR, lineHeight: 20, fontWeight: '500' },
  resultCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultLabel: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED },
  resultText: { fontSize: 15, color: TEXT_COLOR, lineHeight: 22 },
  scriptCard: { borderLeftWidth: 4, borderLeftColor: ACCENT },
  scriptLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 4, marginTop: 8 },
  scriptTheySay: { fontSize: 14, color: TEXT_MUTED, fontStyle: 'italic' },
  scriptYouSay: { fontSize: 15, color: TEXT_COLOR, fontWeight: '500' },
  pathCard: { backgroundColor: COLORS.accentBg || 'rgba(13,148,136,0.08)' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: ACCENT },
  stepBlock: { marginBottom: SPACING.xl },
  stepBadge: { fontSize: 11, fontWeight: '700', color: ACCENT, letterSpacing: 0.5, marginBottom: 4 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: TEXT_COLOR, marginBottom: 8 },
  stepDesc: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, marginBottom: 12 },
  gaugesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gaugeChip: {
    minWidth: '30%',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gaugeChipEmoji: { fontSize: 16, marginBottom: 2 },
  gaugeChipLabel: { fontSize: 12, fontWeight: '600', color: TEXT_COLOR },
  patternCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  patternLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  patternShort: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  bullet: { fontSize: 14, color: TEXT_MUTED, lineHeight: 21, marginBottom: 4, paddingLeft: 4 },
  pathOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pathEmoji: { fontSize: 22, marginRight: 12 },
  pathBody: { flex: 1 },
  pathLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  pathDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2, lineHeight: 19 },
  convRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  convStepNum: {
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
  convBody: { flex: 1 },
  convLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  convPrompt: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  resourceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  resourceCardEmphasis: {
    borderColor: 'rgba(224, 122, 95, 0.4)',
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
  },
  resourceLabel: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  resourceLabelEmphasis: { color: COLORS.warning },
  resourceDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 4, lineHeight: 19 },
  resourceLink: { marginTop: 6 },
  resourceLinkText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  resourcePhone: { fontSize: 13, color: TEXT_COLOR },
  footer: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER },
  footerText: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, fontStyle: 'italic' },
});
