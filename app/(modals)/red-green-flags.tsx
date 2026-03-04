/**
 * Red Flag / Green Flag Tool — Science-based relationship assessment.
 * Learn flags, assess someone, quick AI check, results + CoPilot integration.
 */
import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import {
  RED_FLAG_CATEGORIES,
  GREEN_FLAG_CATEGORIES,
  getRedFlagsFlat,
  getGreenFlagsFlat,
} from '../../src/data/redGreenFlags';
import { sendMessageWithSystemPrompt, type Message } from '../../src/services/ai';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const RED = COLORS.temperature?.red ?? '#F87171';
const GREEN = COLORS.temperature?.green ?? '#4ADE80';
const ACCENT = COLORS.accent;

type Mode = 'learn' | 'assess' | 'quickcheck' | 'results';

const QUICK_CHECK_SYSTEM = `You are CoPilot in "Red/Green Flags" mode. The user is asking whether a behavior or situation they describe is a red flag in a relationship.

Your job:
1. Acknowledge what they shared.
2. Say clearly whether it sounds like a red flag, a green flag, or mixed/context-dependent — and why, in 2-4 sentences.
3. Reference relationship science where relevant (e.g. Gottman's Four Horsemen, attachment, boundaries, respect) without being preachy.
4. If it could be serious (control, threats, isolation, intimidation), name it gently and suggest they consider talking to someone they trust or a resource (e.g. National Domestic Violence Hotline).
5. Be warm and non-shaming. Don't diagnose the other person. Focus on "what this pattern can mean" and "what you deserve."

Keep the response concise (under 150 words unless it's a serious warning).`;

const RESULTS_SYSTEM = `You are CoPilot. The user just completed a Red/Green Flags assessment of someone in their life. They've shared:
- Who they assessed (if provided)
- Which RED flags they checked
- Which GREEN flags they checked

Your job: Write a brief, warm summary (3-5 sentences) that:
1. Reflects back what they noticed (e.g. "You're seeing a lot of respect and accountability markers, and a few conflict patterns that worry you.").
2. Normalizes: "Everyone has some of both. What matters is the overall pattern and how it feels to you."
3. Offers one or two gentle next steps (e.g. "You might want to talk this through with someone you trust" or "Noticing these patterns is the first step — you get to decide what you do with that.").
4. If they checked any Serious Warning Signs (isolates you, controls finances, physical intimidation, threats), add: "Some of what you marked can be signs of abuse. Your safety matters. Consider reaching out to a trusted person or the National Domestic Violence Hotline (thehotline.org or 1-800-799-7233) to talk through options."

Do NOT give a "verdict" (e.g. "this person is toxic"). Do NOT tell them to leave or stay. Be supportive and informative. Keep under 120 words.`;

export default function RedGreenFlagsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [mode, setMode] = useState<Mode>('learn');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Assess state
  const [assessName, setAssessName] = useState('');
  const [checkedRed, setCheckedRed] = useState<Set<string>>(new Set());
  const [checkedGreen, setCheckedGreen] = useState<Set<string>>(new Set());
  const [assessNotes, setAssessNotes] = useState('');

  // Quick Check state
  const [quickCheckInput, setQuickCheckInput] = useState('');
  const [quickCheckResponse, setQuickCheckResponse] = useState('');
  const [quickCheckLoading, setQuickCheckLoading] = useState(false);

  // Results state (from assess)
  const [resultsSummary, setResultsSummary] = useState('');
  const [resultsLoading, setResultsLoading] = useState(false);

  const redFlat = getRedFlagsFlat();
  const greenFlat = getGreenFlagsFlat();

  const toggleRed = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedRed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGreen = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedGreen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runQuickCheck = async () => {
    const text = quickCheckInput.trim();
    if (!text) return;
    setQuickCheckLoading(true);
    setQuickCheckResponse('');
    try {
      const messages: Message[] = [
        { role: 'user', content: `Is this a red flag? Here's what I'm wondering about:\n\n${text}` },
      ];
      const reply = await sendMessageWithSystemPrompt(messages, QUICK_CHECK_SYSTEM);
      setQuickCheckResponse(reply);
      setMode('results');
    } catch (e) {
      setQuickCheckResponse('Something went wrong. Try again or use "Assess" to go through the checklist.');
    } finally {
      setQuickCheckLoading(false);
    }
  };

  const runAssessmentResults = async () => {
    setResultsLoading(true);
    setResultsSummary('');
    const redList = redFlat.filter((f) => checkedRed.has(f.id)).map((f) => f.label);
    const greenList = greenFlat.filter((f) => checkedGreen.has(f.id)).map((f) => f.label);
    const who = assessName.trim() || 'Someone';
    const messages: Message[] = [
      {
        role: 'user',
        content: `I assessed ${who}.\n\nRED flags I noticed: ${redList.length ? redList.join('; ') : 'None'}\n\nGREEN flags I noticed: ${greenList.length ? greenList.join('; ') : 'None'}${assessNotes ? `\n\nMy notes: ${assessNotes}` : ''}`,
      },
    ];
    try {
      const summary = await sendMessageWithSystemPrompt(messages, RESULTS_SYSTEM);
      setResultsSummary(summary);
      setMode('results');
    } catch (e) {
      setResultsSummary("We couldn't generate a summary right now. You can still discuss what you noticed with CoPilot.");
      setMode('results');
    } finally {
      setResultsLoading(false);
    }
  };

  const discussWithCoPilot = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
    setTimeout(() => router.push('/(tabs)/talk'), 100);
  };

  const tabs: { key: Mode; label: string; icon: string }[] = [
    { key: 'learn', label: 'Learn', icon: 'book-outline' },
    { key: 'assess', label: 'Assess', icon: 'list-outline' },
    { key: 'quickcheck', label: 'Quick Check', icon: 'flash-outline' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Red & Green Flags</Text>
        <View style={styles.closeBtn} />
      </View>

      {mode === 'results' ? (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.resultsTitle}>Summary</Text>
          {resultsLoading ? (
            <ActivityIndicator color={ACCENT} size="small" style={{ marginVertical: 24 }} />
          ) : resultsSummary ? (
            <Text style={styles.resultsBody}>{resultsSummary}</Text>
          ) : quickCheckResponse ? (
            <Text style={styles.resultsBody}>{quickCheckResponse}</Text>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.copilotBtn, pressed && { opacity: 0.9 }]}
            onPress={discussWithCoPilot}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.copilotBtnText}>Discuss with CoPilot</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.backToTool, pressed && { opacity: 0.9 }]}
            onPress={() => setMode('learn')}
          >
            <Text style={styles.backToToolText}>Back to tool</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <>
          <View style={styles.tabRow}>
            {tabs.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.tab, mode === t.key && styles.tabActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(t.key); }}
              >
                <Ionicons name={t.icon as any} size={18} color={mode === t.key ? ACCENT : TEXT_MUTED} />
                <Text style={[styles.tabLabel, mode === t.key && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {mode === 'learn' && (
              <>
                <Text style={styles.learnIntro}>Science-based markers of concern (red) and health (green). Expand to read the research.</Text>
                <Text style={styles.sectionLabel}>🚩 Red flags</Text>
                {RED_FLAG_CATEGORIES.map((cat) => (
                  <View key={cat.id} style={styles.categoryCard}>
                    <Pressable
                      style={styles.categoryHeader}
                      onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    >
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Ionicons name={expandedCategory === cat.id ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
                    </Pressable>
                    {expandedCategory === cat.id && (
                      <View style={styles.categoryBody}>
                        <Text style={styles.researchText}>{cat.researchBacking}</Text>
                        {cat.items.map((item) => (
                          <View key={item.id} style={styles.flagRow}>
                            <Text style={styles.flagLabel}>• {item.label}</Text>
                            {item.research && <Text style={styles.flagResearch}>{item.research}</Text>}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>🟢 Green flags</Text>
                {GREEN_FLAG_CATEGORIES.map((cat) => (
                  <View key={cat.id} style={styles.categoryCard}>
                    <Pressable
                      style={styles.categoryHeader}
                      onPress={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    >
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Ionicons name={expandedCategory === cat.id ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
                    </Pressable>
                    {expandedCategory === cat.id && (
                      <View style={styles.categoryBody}>
                        <Text style={styles.researchText}>{cat.researchBacking}</Text>
                        {cat.items.map((item) => (
                          <View key={item.id} style={styles.flagRow}>
                            <Text style={styles.flagLabel}>• {item.label}</Text>
                            {item.research && <Text style={styles.flagResearch}>{item.research}</Text>}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {mode === 'assess' && (
              <>
                <Text style={styles.learnIntro}>Who are you assessing? (optional)</Text>
                <TextInput
                  style={styles.nameInput}
                  value={assessName}
                  onChangeText={setAssessName}
                  placeholder="e.g. Partner, friend, date"
                  placeholderTextColor={TEXT_MUTED}
                />
                <Text style={styles.checklistLabel}>🚩 Red flags you've noticed</Text>
                {redFlat.map((f) => (
                  <Pressable
                    key={`red-${f.id}`}
                    style={styles.checkRow}
                    onPress={() => toggleRed(f.id)}
                  >
                    <View style={[styles.checkbox, checkedRed.has(f.id) && styles.checkboxChecked]}>
                      {checkedRed.has(f.id) && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkLabel}>{f.label}</Text>
                  </Pressable>
                ))}
                <Text style={[styles.checklistLabel, { marginTop: 20 }]}>🟢 Green flags you've noticed</Text>
                {greenFlat.map((f) => (
                  <Pressable
                    key={`green-${f.id}`}
                    style={styles.checkRow}
                    onPress={() => toggleGreen(f.id)}
                  >
                    <View style={[styles.checkbox, styles.checkboxGreen, checkedGreen.has(f.id) && styles.checkboxGreenChecked]}>
                      {checkedGreen.has(f.id) && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkLabel}>{f.label}</Text>
                  </Pressable>
                ))}
                <Text style={styles.notesLabel}>Notes (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={assessNotes}
                  onChangeText={setAssessNotes}
                  placeholder="Anything else you want to remember..."
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  numberOfLines={3}
                />
                <Pressable
                  style={[styles.primaryBtn, resultsLoading && styles.primaryBtnDisabled]}
                  onPress={runAssessmentResults}
                  disabled={resultsLoading}
                >
                  {resultsLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>See results</Text>
                  )}
                </Pressable>
              </>
            )}

            {mode === 'quickcheck' && (
              <>
                <Text style={styles.learnIntro}>Describe the behavior or situation. CoPilot will give you a grounded take on whether it's a red flag.</Text>
                <TextInput
                  style={styles.quickInput}
                  value={quickCheckInput}
                  onChangeText={setQuickCheckInput}
                  placeholder="e.g. They get really intense for two weeks, then go quiet for a month..."
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  numberOfLines={4}
                />
                <Pressable
                  style={[styles.primaryBtn, (quickCheckLoading || !quickCheckInput.trim()) && styles.primaryBtnDisabled]}
                  onPress={runQuickCheck}
                  disabled={quickCheckLoading || !quickCheckInput.trim()}
                >
                  {quickCheckLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Is this a red flag?</Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </>
      )}
    </KeyboardAvoidingView>
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
    borderBottomColor: CARD_BORDER,
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: CARD_BORDER,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.input,
  },
  tabActive: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.12)' },
  tabLabel: { fontSize: 14, color: TEXT_MUTED, fontWeight: '500' },
  tabLabelActive: { color: ACCENT, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  learnIntro: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 16, lineHeight: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 10 },
  categoryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, flex: 1 },
  categoryBody: { paddingHorizontal: 14, paddingBottom: 14 },
  researchText: { fontSize: 13, color: TEXT_SECONDARY, marginBottom: 10, lineHeight: 18 },
  flagRow: { marginBottom: 8 },
  flagLabel: { fontSize: 14, color: TEXT_PRIMARY, fontWeight: '500' },
  flagResearch: { fontSize: 12, color: TEXT_MUTED, marginTop: 2, marginLeft: 8, lineHeight: 16 },
  nameInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 20,
  },
  checklistLabel: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: RED,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: RED },
  checkboxGreen: { borderColor: GREEN },
  checkboxGreenChecked: { backgroundColor: GREEN },
  checkLabel: { fontSize: 14, color: TEXT_PRIMARY, flex: 1 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginTop: 16, marginBottom: 6 },
  notesInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    fontSize: 14,
    color: TEXT_PRIMARY,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  quickInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultsTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  resultsBody: { fontSize: 15, color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 24 },
  copilotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  copilotBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  backToTool: { alignItems: 'center', paddingVertical: 12 },
  backToToolText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
});
