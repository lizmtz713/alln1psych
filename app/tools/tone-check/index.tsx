/**
 * Tone Check — "Before You Send" moment. Communication awareness, not tone policing.
 * Route: /tools/tone-check
 * Paste/type → 3 swipe cards (tone, impact, alternative) → Use rewrite | Rewrite again | Practice | Send anyway.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import {
  analyzeToneForMessage,
  type ToneCheckResult,
  type ToneRewriteStyle,
} from '../../../src/services/ai';
import { VoiceRecorder } from '../../../src/components/voice/VoiceRecorder';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = SPACING.lg * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING;

const BG = COLORS.background;
const CARD = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

const REWRITE_STYLES: { value: ToneRewriteStyle; label: string }[] = [
  { value: 'softer', label: 'Softer' },
  { value: 'clearer', label: 'Clearer' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'firmer', label: 'Firmer' },
];

export default function ToneCheckScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ message?: string; showUpContext?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const cardScrollRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState(params.message ?? '');
  const [showVoice, setShowVoice] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ToneCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [showRewriteStyles, setShowRewriteStyles] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleVoiceDone = useCallback(({ transcript }: { transcript?: string }) => {
    if (transcript?.trim()) {
      setMessage((prev) => (prev ? `${prev}\n${transcript}` : transcript));
    }
    setShowVoice(false);
  }, []);

  const runAnalysis = useCallback(
    async (rewriteStyle?: ToneRewriteStyle) => {
      const text = message.trim();
      if (!text) return;
      setError(null);
      if (!rewriteStyle) setResult(null);
      setAnalyzing(true);
      setShowRewriteStyles(false);
      try {
        const recipientPreferenceContext =
          typeof params.showUpContext === 'string' && params.showUpContext.trim()
            ? decodeURIComponent(params.showUpContext.trim())
            : undefined;
        const analysis = await analyzeToneForMessage(text, {
          ...(rewriteStyle ? { rewriteStyle } : {}),
          ...(recipientPreferenceContext ? { recipientPreferenceContext } : {}),
        });
        if (analysis) {
          setResult(analysis);
        } else {
          setError('Could not analyze tone. Check your connection and try again.');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        setError(msg);
        if (msg.includes('API key')) {
          Alert.alert(
            'API key needed',
            'Add your OpenAI API key in Me → Preferences → Bring Your Own Key to use Tone Check.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        setAnalyzing(false);
      }
    },
    [message, params.showUpContext]
  );

  const handleAnalyze = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runAnalysis();
  }, [runAnalysis]);

  const handleUseRewrite = useCallback(async () => {
    if (!result?.alternativePhrasing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(result.alternativePhrasing);
    setMessage(result.alternativePhrasing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [result]);

  const handleRewriteAgain = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRewriteStyles((prev) => !prev);
  }, []);

  const handleRewriteStyle = useCallback(
    (style: ToneRewriteStyle) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      runAnalysis(style);
    },
    [runAnalysis]
  );

  const handlePractice = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(modals)/role-play');
  }, [router]);

  const handleSendAnyway = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const onCardScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / CARD_WIDTH);
    setCardIndex(index);
  }, []);

  useEffect(() => {
    if (result) {
      setCardIndex(0);
      cardScrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [result]);

  const canAnalyze = message.trim().length > 0 && !analyzing;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Tone Check</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            See how your message might sound. We describe perception, not judgment.
          </Text>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your message</Text>
            <TextInput
              style={styles.input}
              placeholder="Paste or type what you want to say..."
              placeholderTextColor={MUTED}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!showVoice}
            />
            {!showVoice ? (
              <Pressable
                style={({ pressed }) => [styles.voiceBtn, pressed && styles.voiceBtnPressed]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowVoice(true);
                }}
              >
                <Ionicons name="mic" size={20} color={ACCENT} />
                <Text style={styles.voiceBtnText}>Record with voice</Text>
              </Pressable>
            ) : (
              <View style={styles.voiceRecorderWrap}>
                <VoiceRecorder
                  requestTranscribe
                  maxDurationSec={120}
                  compact
                  onDone={handleVoiceDone}
                  onCancel={() => setShowVoice(false)}
                />
              </View>
            )}
          </View>

          <Pressable
            style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!canAnalyze}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>Check tone</Text>
              </>
            )}
          </Pressable>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="warning-outline" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {result ? (
            <>
              {/* 3 swipe cards */}
              <View style={styles.cardsContainer}>
                <ScrollView
                  ref={cardScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onCardScroll}
                  contentContainerStyle={styles.cardsScrollContent}
                  decelerationRate="fast"
                >
                  <View style={[styles.swipeCard, { width: CARD_WIDTH }]}>
                    <Text style={styles.swipeCardLabel}>How it may sound</Text>
                    <Text style={styles.swipeCardText}>{result.tone}</Text>
                  </View>
                  <View style={[styles.swipeCard, { width: CARD_WIDTH }]}>
                    <Text style={styles.swipeCardLabel}>They might feel</Text>
                    <Text style={styles.swipeCardText}>{result.possibleImpact}</Text>
                  </View>
                  <View style={[styles.swipeCard, { width: CARD_WIDTH }]}>
                    <Text style={styles.swipeCardLabel}>Try this instead</Text>
                    <Text style={[styles.swipeCardText, styles.swipeCardAlternative]}>
                      {result.alternativePhrasing}
                    </Text>
                  </View>
                </ScrollView>
                <View style={styles.dots}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === cardIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              </View>

              {/* Rewrite again: style picker */}
              {showRewriteStyles ? (
                <View style={styles.stylePicker}>
                  <Text style={styles.stylePickerLabel}>Rewrite again</Text>
                  <View style={styles.styleChips}>
                    {REWRITE_STYLES.map(({ value, label }) => (
                      <Pressable
                        key={value}
                        style={({ pressed }) => [
                          styles.styleChip,
                          pressed && styles.styleChipPressed,
                        ]}
                        onPress={() => handleRewriteStyle(value)}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <ActivityIndicator size="small" color={ACCENT} />
                        ) : (
                          <Text style={styles.styleChipText}>{label}</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Action buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && styles.actionBtnPressed]}
                  onPress={handleUseRewrite}
                >
                  <Ionicons name="copy-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnPrimaryText}>
                    {copied ? 'Copied! Edit below' : 'Use rewrite'}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={handleRewriteAgain}
                >
                  <Ionicons name="refresh-outline" size={18} color={ACCENT} />
                  <Text style={styles.actionBtnText}>Rewrite again</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={handlePractice}
                >
                  <Ionicons name="people-outline" size={18} color={ACCENT} />
                  <Text style={styles.actionBtnText}>Practice saying it</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                  onPress={handleSendAnyway}
                >
                  <Ionicons name="send-outline" size={18} color={MUTED} />
                  <Text style={styles.actionBtnTextMuted}>Send anyway</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
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
  subtitle: {
    fontSize: 15,
    color: MUTED,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.inputSurface || 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    fontSize: 16,
    color: TEXT,
    minHeight: 100,
    maxHeight: 180,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.accentMuted || ACCENT + '40',
  },
  voiceBtnPressed: { opacity: 0.9 },
  voiceBtnText: { fontSize: 15, fontWeight: '600', color: ACCENT },
  voiceRecorderWrap: { marginTop: SPACING.lg },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.button,
    marginBottom: SPACING.xl,
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: (COLORS.error || '#EF5350') + '18',
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: (COLORS.error || '#EF5350') + '40',
  },
  errorText: { flex: 1, fontSize: 14, color: COLORS.error || '#EF5350' },
  cardsContainer: { marginBottom: SPACING.lg },
  cardsScrollContent: { paddingHorizontal: SPACING.lg / 2 },
  swipeCard: {
    backgroundColor: CARD,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginHorizontal: SPACING.sm,
    minHeight: 140,
    justifyContent: 'center',
  },
  swipeCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  swipeCardText: { fontSize: 17, color: TEXT, lineHeight: 24 },
  swipeCardAlternative: { fontStyle: 'italic', color: COLORS.accentLight || ACCENT },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: SPACING.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
  dotActive: { backgroundColor: ACCENT, width: 20 },
  stylePicker: { marginBottom: SPACING.lg },
  stylePickerLabel: { fontSize: 13, fontWeight: '600', color: MUTED, marginBottom: SPACING.sm },
  styleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accentMuted || ACCENT + '40',
  },
  styleChipPressed: { opacity: 0.8 },
  styleChipText: { fontSize: 14, fontWeight: '600', color: ACCENT },
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
  actionBtnPrimary: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  actionBtnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: TEXT },
  actionBtnTextMuted: { fontSize: 16, fontWeight: '600', color: MUTED },
});
