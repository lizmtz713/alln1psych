/**
 * Critical Thinking Tool — Learn fallacies/biases/tactics, analyze text/image, practice.
 * @see docs/ingauge-CRITICAL-THINKING-TOOL.md
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
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS } from '../../src/lib/constants';
import {
  FALLACY_CATEGORIES,
  BIAS_CATEGORIES,
  TACTICS_CATEGORIES,
  EVIDENCE_HIERARCHY,
  EVIDENCE_VS_OPINION_CHECKLIST,
  SOURCE_CREDIBILITY_SIGNALS,
  getRandomChallenge,
  getLearnItemById,
  type LearnCategory,
  type PracticeChallenge,
} from '../../src/data/criticalThinking';
import { useCriticalThinkingStore, CRITICAL_THINKING_BADGES } from '../../src/stores/criticalThinkingStore';
import { sendMessageWithSystemPrompt, analyzeImageWithVision, type Message } from '../../src/services/ai';

let ImagePickerModule: typeof import('expo-image-picker') | null = null;
const getImagePicker = async () => {
  if (!ImagePickerModule) {
    try {
      ImagePickerModule = await import('expo-image-picker');
    } catch {
      return null;
    }
  }
  return ImagePickerModule;
};

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const CARD_BORDER = COLORS.border;
const TEXT_PRIMARY = COLORS.text;
const TEXT_SECONDARY = COLORS.textSecondary;
const TEXT_MUTED = COLORS.textMuted;
const ACCENT = COLORS.accent;

type Mode = 'learn' | 'analyze' | 'practice';

const ANALYZE_SYSTEM = `You are CoPilot in "Critical Thinking" mode. The user pasted text (argument, claim, article excerpt, or URL) for analysis.

Respond with these sections (ALL CAPS headers). Be concise.

FALLACIES — List any logical fallacies you spot (e.g. ad hominem, straw man, false dilemma, appeal to emotion). If none obvious, say "None obvious."

BIAS INDICATORS — Note any cognitive biases at play (e.g. confirmation bias, anchoring, us-vs-them). If none obvious, say "None obvious."

MANIPULATION TACTICS — Any misinformation tactics? (emotional language, missing context, false equivalence, cherry-picking, etc.) If none, say "None obvious."

EVIDENCE QUALITY — Is evidence cited? Anecdote vs studies? Source credibility? One short paragraph.

QUESTIONS TO ASK — Give 2–4 specific questions the user could ask to probe or verify the claim (e.g. "What's the source?" "What would disprove this?").

Be neutral and educational. Don't preach.`;

const ANALYZE_IMAGE_SYSTEM = `You are CoPilot in "Critical Thinking" mode. The user shared an image (screenshot, meme, or headline). First briefly describe what you see (headline, text, or key message). Then analyze with these sections:

FALLACIES — Any logical fallacies? (ad hominem, straw man, false dilemma, appeal to emotion, etc.)
BIAS INDICATORS — Any cognitive biases at play?
MANIPULATION TACTICS — Emotional headlines, missing context, false equivalence, etc.?
EVIDENCE QUALITY — Is there any evidence, or only claims?
QUESTIONS TO ASK — 2–4 questions to probe or verify.

Be concise and educational.`;

const BADGE_LABELS: Record<string, string> = {
  [CRITICAL_THINKING_BADGES.FIRST_CORRECT]: 'First correct',
  [CRITICAL_THINKING_BADGES.STREAK_5]: '5 in a row',
  [CRITICAL_THINKING_BADGES.STREAK_10]: '10 in a row',
  [CRITICAL_THINKING_BADGES.TOTAL_10]: '10 fallacies spotted',
  [CRITICAL_THINKING_BADGES.TOTAL_25]: '25 spotted',
};

export default function CriticalThinkingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [mode, setMode] = useState<Mode>('learn');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [analyzeInput, setAnalyzeInput] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);

  const [challenge, setChallenge] = useState<PracticeChallenge | null>(() => getRandomChallenge());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { totalCorrect, streak, bestStreak, badges, recordCorrect, recordWrong } = useCriticalThinkingStore();

  const runAnalyze = async () => {
    const hasText = analyzeInput.trim().length > 0;
    if (!hasText && !imageBase64) return;
    setAnalyzeLoading(true);
    setAnalyzeResult('');
    try {
      if (imageBase64) {
        const prompt = hasText ? `Context: ${analyzeInput.trim()}\n\nAnalyze the image.` : 'Analyze this image.';
        const result = await analyzeImageWithVision(imageBase64, prompt, ANALYZE_IMAGE_SYSTEM);
        setAnalyzeResult(result?.trim() ?? 'Could not analyze image.');
      } else {
        const messages: Message[] = [{ role: 'user', content: analyzeInput.trim() }];
        const result = await sendMessageWithSystemPrompt(messages, ANALYZE_SYSTEM);
        setAnalyzeResult(result?.trim() ?? 'Could not analyze.');
      }
    } catch (e) {
      setAnalyzeResult('Something went wrong. Try again.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const pickImage = async () => {
    const picker = await getImagePicker();
    if (!picker) {
      Alert.alert('Not available', 'Image picker is not available.');
      return;
    }
    const { status } = await picker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to analyze images.');
      return;
    }
    const result = await picker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  const submitPracticeAnswer = (optionLabel: string) => {
    if (!challenge || practiceFeedback) return;
    const correctLabel = getLearnItemById(challenge.correctId)?.label ?? challenge.correctId;
    const isCorrect = optionLabel === correctLabel;
    Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionLabel);
    setPracticeFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) recordCorrect();
    else recordWrong();
  };

  const nextChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChallenge(getRandomChallenge());
    setSelectedOption(null);
    setPracticeFeedback(null);
  };

  const renderLearnSection = (category: LearnCategory) => (
    <View key={category.id} style={styles.categoryCard}>
      <Pressable
        style={styles.categoryHeader}
        onPress={() => setExpandedId(expandedId === category.id ? null : category.id)}
      >
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Ionicons name={expandedId === category.id ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
      </Pressable>
      {expandedId === category.id && (
        <View style={styles.categoryBody}>
          <Text style={styles.introText}>{category.intro}</Text>
          {category.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              {item.example && <Text style={styles.itemExample}>e.g. {item.example}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const tabs: { key: Mode; label: string; icon: string }[] = [
    { key: 'learn', label: 'Learn', icon: 'book-outline' },
    { key: 'analyze', label: 'Analyze', icon: 'search-outline' },
    { key: 'practice', label: 'Practice', icon: 'flash-outline' },
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
        <Text style={styles.headerTitle}>Critical Thinking</Text>
        <View style={styles.closeBtn} />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, mode === t.key && styles.tabActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMode(t.key); setPracticeFeedback(null); }}
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
            <Text style={styles.learnIntro}>Spot fallacies, biases, and misinformation tactics. Expand a section to read.</Text>
            {FALLACY_CATEGORIES.map(renderLearnSection)}
            {BIAS_CATEGORIES.map(renderLearnSection)}
            {TACTICS_CATEGORIES.map(renderLearnSection)}
            <View style={styles.categoryCard}>
              <Pressable
                style={styles.categoryHeader}
                onPress={() => setExpandedId(expandedId === 'evidence' ? null : 'evidence')}
              >
                <Text style={styles.categoryTitle}>Evidence evaluation</Text>
                <Ionicons name={expandedId === 'evidence' ? 'chevron-up' : 'chevron-down'} size={20} color={TEXT_MUTED} />
              </Pressable>
              {expandedId === 'evidence' && (
                <View style={styles.categoryBody}>
                  <Text style={styles.introText}>Evidence hierarchy (stronger → weaker):</Text>
                  {EVIDENCE_HIERARCHY.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    </View>
                  ))}
                  <Text style={[styles.itemLabel, { marginTop: 12 }]}>Evidence vs opinion checklist</Text>
                  {EVIDENCE_VS_OPINION_CHECKLIST.map((q, i) => (
                    <Text key={i} style={styles.itemDesc}>• {q}</Text>
                  ))}
                  <Text style={[styles.itemLabel, { marginTop: 12 }]}>Source credibility signals</Text>
                  {SOURCE_CREDIBILITY_SIGNALS.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {mode === 'analyze' && (
          <>
            <Text style={styles.learnIntro}>Paste an argument, claim, article excerpt, or URL. Add an image (screenshot/meme) if you have one.</Text>
            <TextInput
              style={styles.analyzeInput}
              value={analyzeInput}
              onChangeText={setAnalyzeInput}
              placeholder="Paste text or a URL..."
              placeholderTextColor={TEXT_MUTED}
              multiline
              numberOfLines={4}
            />
            {imageUri ? (
              <View style={styles.imageWrap}>
                <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
                <Pressable onPress={clearImage} style={styles.removeImage}>
                  <Ionicons name="close-circle" size={28} color={TEXT_PRIMARY} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={ACCENT} />
                <Text style={styles.addImageText}>Add image (screenshot, meme)</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.primaryBtn, (analyzeLoading || (!analyzeInput.trim() && !imageBase64)) && styles.primaryBtnDisabled]}
              onPress={runAnalyze}
              disabled={analyzeLoading || (!analyzeInput.trim() && !imageBase64)}
            >
              {analyzeLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>Analyze</Text>}
            </Pressable>
            {analyzeResult ? <Text style={styles.analyzeResult}>{analyzeResult}</Text> : null}
          </>
        )}

        {mode === 'practice' && (
          <>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>Correct: {totalCorrect}</Text>
              <Text style={styles.statsText}>Streak: {streak}</Text>
              <Text style={styles.statsText}>Best: {bestStreak}</Text>
            </View>
            {badges.length > 0 && (
              <View style={styles.badgesRow}>
                {badges.map((id) => (
                  <View key={id} style={styles.badge}>
                    <Text style={styles.badgeText}>{BADGE_LABELS[id] ?? id}</Text>
                  </View>
                ))}
              </View>
            )}
            {challenge && (
              <>
                <Text style={styles.practicePrompt}>What’s going on here?</Text>
                <View style={styles.claimCard}>
                  <Text style={styles.claimText}>"{challenge.claim}"</Text>
                </View>
                <View style={styles.optionsWrap}>
                  {challenge.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const correctLabel = getLearnItemById(challenge.correctId)?.label ?? '';
                    const showCorrect = practiceFeedback && opt === correctLabel;
                    const showWrong = practiceFeedback === 'wrong' && isSelected && opt !== correctLabel;
                    return (
                      <Pressable
                        key={opt}
                        style={[
                          styles.optionBtn,
                          showCorrect && styles.optionCorrect,
                          showWrong && styles.optionWrong,
                        ]}
                        onPress={() => submitPracticeAnswer(opt)}
                        disabled={!!practiceFeedback}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {practiceFeedback && (
                  <View style={styles.feedbackWrap}>
                    <Text style={practiceFeedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong}>
                      {practiceFeedback === 'correct' ? '✓ Correct!' : 'Not quite — the answer is: ' + (getLearnItemById(challenge.correctId)?.label ?? challenge.correctId)}
                    </Text>
                    <Pressable style={styles.nextBtn} onPress={nextChallenge}>
                      <Text style={styles.nextBtnText}>Next challenge</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
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
  categoryCard: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card ?? 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  categoryTitle: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, flex: 1 },
  categoryBody: { paddingHorizontal: 14, paddingBottom: 14 },
  introText: { fontSize: 13, color: TEXT_SECONDARY, marginBottom: 10, lineHeight: 18 },
  itemRow: { marginBottom: 10 },
  itemLabel: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  itemDesc: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2, lineHeight: 18 },
  itemExample: { fontSize: 12, color: TEXT_MUTED, marginTop: 2, fontStyle: 'italic' },
  analyzeInput: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  imageWrap: { position: 'relative', marginBottom: 12 },
  thumb: { width: '100%', height: 160, borderRadius: 12, backgroundColor: CARD_BG },
  removeImage: { position: 'absolute', top: 8, right: 8 },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: CARD_BORDER,
    borderRadius: BORDER_RADIUS.input,
  },
  addImageText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: BORDER_RADIUS.button ?? 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  analyzeResult: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  statsText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '500' },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  badge: { backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  practicePrompt: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  claimCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: CARD_BORDER },
  claimText: { fontSize: 15, color: TEXT_SECONDARY, fontStyle: 'italic', lineHeight: 22 },
  optionsWrap: { gap: 10 },
  optionBtn: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  optionCorrect: { borderColor: COLORS.temperature?.green ?? '#4ADE80', backgroundColor: 'rgba(74,222,128,0.1)' },
  optionWrong: { borderColor: COLORS.temperature?.red ?? '#F87171', backgroundColor: 'rgba(248,113,113,0.1)' },
  optionText: { fontSize: 15, color: TEXT_PRIMARY, fontWeight: '500' },
  feedbackWrap: { marginTop: 20 },
  feedbackCorrect: { fontSize: 16, color: COLORS.temperature?.green ?? '#4ADE80', fontWeight: '600', marginBottom: 12 },
  feedbackWrong: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 12 },
  nextBtn: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16 },
  nextBtnText: { fontSize: 16, color: ACCENT, fontWeight: '600' },
});
