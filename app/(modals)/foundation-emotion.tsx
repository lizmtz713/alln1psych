/**
 * PHOSM: Emotional Profile
 * 
 * Personalization layer for the Emotion gauge.
 * User explores their emotional vocabulary, patterns, and needs.
 * The science (emotional granularity, Lisa Feldman Barrett) is defined.
 * This captures what emotions look like FOR THIS USER.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
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

type Step = 'intro' | 'vocabulary' | 'frequent' | 'patterns' | 'needs' | 'done';

// Emotion gauge color (Sunset Coral)
const EMOTION_CORAL = '#E07A5F';

interface EmotionalProfile {
  granularity: 'low' | 'medium' | 'high';
  frequentPositive: string[];
  frequentNegative: string[];
  difficultEmotions: string[];
  patterns: string[];
  needsWhenUpset: string[];
  expressionStyle: 'internal' | 'external' | 'selective';
}

const defaultProfile: EmotionalProfile = {
  granularity: 'medium',
  frequentPositive: [],
  frequentNegative: [],
  difficultEmotions: [],
  patterns: [],
  needsWhenUpset: [],
  expressionStyle: 'selective',
};

const GRANULARITY_OPTIONS = [
  {
    id: 'low',
    label: 'Simple & Direct',
    desc: 'Happy, sad, angry, anxious — the basics work for me',
    emoji: '🎯',
  },
  {
    id: 'medium',
    label: 'Moderately Nuanced',
    desc: 'I can usually pinpoint beyond the basics',
    emoji: '🎨',
  },
  {
    id: 'high',
    label: 'Highly Granular',
    desc: 'I have lots of words for subtle differences in feelings',
    emoji: '🔬',
  },
];

const POSITIVE_EMOTIONS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'proud', label: 'Proud', emoji: '😤' },
  { id: 'content', label: 'Content', emoji: '☺️' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { id: 'loved', label: 'Loved', emoji: '🥰' },
  { id: 'curious', label: 'Curious', emoji: '🤔' },
  { id: 'playful', label: 'Playful', emoji: '😜' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { id: 'inspired', label: 'Inspired', emoji: '✨' },
];

const NEGATIVE_EMOTIONS = [
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'lonely', label: 'Lonely', emoji: '🥺' },
  { id: 'hurt', label: 'Hurt', emoji: '💔' },
  { id: 'ashamed', label: 'Ashamed', emoji: '😞' },
  { id: 'numb', label: 'Numb', emoji: '😶' },
  { id: 'scared', label: 'Scared', emoji: '😨' },
  { id: 'jealous', label: 'Jealous', emoji: '😒' },
  { id: 'guilty', label: 'Guilty', emoji: '😔' },
  { id: 'disappointed', label: 'Disappointed', emoji: '😕' },
  { id: 'irritated', label: 'Irritated', emoji: '😑' },
];

const DIFFICULT_EMOTIONS = [
  { id: 'joy', label: 'Joy / happiness' },
  { id: 'anger', label: 'Anger' },
  { id: 'sadness', label: 'Sadness' },
  { id: 'fear', label: 'Fear' },
  { id: 'vulnerability', label: 'Vulnerability' },
  { id: 'pride', label: 'Pride / celebrating self' },
  { id: 'asking-help', label: 'Asking for help' },
  { id: 'none', label: 'None — I feel them all' },
];

const EMOTION_PATTERNS = [
  { id: 'anger-hurt', label: 'Anger when I\'m actually hurt' },
  { id: 'numb-overwhelm', label: 'Numbness when I\'m overwhelmed' },
  { id: 'anxiety-excitement', label: 'Anxiety when I\'m actually excited' },
  { id: 'irritation-sad', label: 'Irritation when I\'m actually sad' },
  { id: 'busy-avoid', label: 'Keeping busy to avoid feelings' },
  { id: 'fine-not', label: 'Saying "I\'m fine" when I\'m not' },
  { id: 'care-others', label: 'Focus on others\' feelings to avoid mine' },
  { id: 'unsure', label: 'Not sure — help me notice patterns' },
];

const NEEDS_WHEN_UPSET = [
  { id: 'space', label: 'Space to process alone', emoji: '🚪' },
  { id: 'listen', label: 'Someone to listen (not fix)', emoji: '👂' },
  { id: 'comfort', label: 'Comfort / physical presence', emoji: '🤗' },
  { id: 'distraction', label: 'Distraction', emoji: '📺' },
  { id: 'solutions', label: 'Help solving the problem', emoji: '🔧' },
  { id: 'vent', label: 'To vent / get it out', emoji: '💨' },
  { id: 'validation', label: 'Validation that my feelings make sense', emoji: '✅' },
  { id: 'time', label: 'Just time — I come around', emoji: '⏳' },
];

const EXPRESSION_STYLES = [
  {
    id: 'internal',
    label: 'Internal',
    desc: 'I process alone, rarely show it',
    emoji: '🧘',
  },
  {
    id: 'external',
    label: 'External',
    desc: 'I express openly, people know how I feel',
    emoji: '📢',
  },
  {
    id: 'selective',
    label: 'Selective',
    desc: 'Depends on the emotion and who I\'m with',
    emoji: '🎭',
  },
];

export default function PHOSMEmotionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const existingProfile = useFoundationStore((s) => s.emotionalProfile);
  const setEmotionalProfile = useFoundationStore((s) => s.setEmotionalProfile);
  
  const [step, setStep] = useState<Step>('intro');
  const [profile, setProfile] = useState<EmotionalProfile>(existingProfile || defaultProfile);

  const handleClose = () => router.back();

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'vocabulary', 'frequent', 'patterns', 'needs', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      if (step === 'needs') {
        setEmotionalProfile(profile);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const steps: Step[] = ['intro', 'vocabulary', 'frequent', 'patterns', 'needs', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const toggleItem = (key: keyof EmotionalProfile, id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfile((prev) => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(id)
          ? current.filter((i) => i !== id)
          : [...current, id],
      };
    });
  };

  const stepNumber = ['intro', 'vocabulary', 'frequent', 'patterns', 'needs', 'done'].indexOf(step);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name={step === 'intro' ? 'close' : 'arrow-back'} size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Emotional Profile</Text>
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
          >
            {/* INTRO */}
            {step === 'intro' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>💛</Text>
                <Text style={styles.title}>Your Emotional Profile</Text>
                <Text style={styles.subtitle}>
                  Emotions are data about what matters to you.{'\n\n'}
                  Let's explore <Text style={styles.emphasis}>your</Text> emotional world —{'\n'}
                  what you feel, how you express it, what you need.
                </Text>
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    Some people have 50 words for feelings. Others have 5.{'\n\n'}
                    Both are valid. Let's see where you are and what patterns you notice.
                  </Text>
                </View>
                <View style={styles.aiHint}>
                  <Ionicons name="sparkles" size={16} color={EMOTION_CORAL} />
                  <Text style={styles.aiHintText}>AI will adapt to YOUR emotional language</Text>
                </View>
              </View>
            )}

            {/* VOCABULARY */}
            {step === 'vocabulary' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Emotional Vocabulary</Text>
                <Text style={styles.subtitle}>
                  How nuanced is your emotional language?
                </Text>

                <View style={styles.granularityOptions}>
                  {GRANULARITY_OPTIONS.map((g) => (
                    <Pressable
                      key={g.id}
                      style={[
                        styles.granularityOption,
                        profile.granularity === g.id && styles.granularityOptionSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setProfile((prev) => ({ ...prev, granularity: g.id as any }));
                      }}
                    >
                      <Text style={styles.granularityEmoji}>{g.emoji}</Text>
                      <View style={styles.granularityTextContainer}>
                        <Text style={[
                          styles.granularityLabel,
                          profile.granularity === g.id && styles.granularityLabelSelected,
                        ]}>
                          {g.label}
                        </Text>
                        <Text style={styles.granularityDesc}>{g.desc}</Text>
                      </View>
                      {profile.granularity === g.id && (
                        <Ionicons name="checkmark-circle" size={24} color={EMOTION_CORAL} />
                      )}
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.sectionLabel}>
                  Any emotions you struggle to feel or express?
                </Text>
                <View style={styles.checkList}>
                  {DIFFICULT_EMOTIONS.map((e) => {
                    const selected = profile.difficultEmotions.includes(e.id);
                    return (
                      <Pressable
                        key={e.id}
                        style={[styles.checkItem, selected && styles.checkItemSelected]}
                        onPress={() => toggleItem('difficultEmotions', e.id)}
                      >
                        <Ionicons
                          name={selected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={selected ? EMOTION_CORAL : COLORS.textMuted}
                        />
                        <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                          {e.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* FREQUENT EMOTIONS */}
            {step === 'frequent' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Frequent Emotions</Text>
                <Text style={styles.subtitle}>
                  What do you feel most often?{'\n'}
                  Tap all that regularly show up.
                </Text>

                <Text style={styles.sectionLabel}>When things are good...</Text>
                <View style={styles.emotionGrid}>
                  {POSITIVE_EMOTIONS.map((e) => {
                    const selected = profile.frequentPositive.includes(e.id);
                    return (
                      <Pressable
                        key={e.id}
                        style={[styles.emotionChip, selected && styles.emotionChipSelected]}
                        onPress={() => toggleItem('frequentPositive', e.id)}
                      >
                        <Text style={styles.emotionEmoji}>{e.emoji}</Text>
                        <Text style={[styles.emotionLabel, selected && styles.emotionLabelSelected]}>
                          {e.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
                  When things are hard...
                </Text>
                <View style={styles.emotionGrid}>
                  {NEGATIVE_EMOTIONS.map((e) => {
                    const selected = profile.frequentNegative.includes(e.id);
                    return (
                      <Pressable
                        key={e.id}
                        style={[styles.emotionChip, selected && styles.emotionChipSelected]}
                        onPress={() => toggleItem('frequentNegative', e.id)}
                      >
                        <Text style={styles.emotionEmoji}>{e.emoji}</Text>
                        <Text style={[styles.emotionLabel, selected && styles.emotionLabelSelected]}>
                          {e.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PATTERNS */}
            {step === 'patterns' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Your Patterns</Text>
                <Text style={styles.subtitle}>
                  Sometimes one emotion hides another.{'\n'}
                  Any patterns you've noticed?
                </Text>

                <View style={styles.checkList}>
                  {EMOTION_PATTERNS.map((p) => {
                    const selected = profile.patterns.includes(p.id);
                    return (
                      <Pressable
                        key={p.id}
                        style={[styles.checkItem, selected && styles.checkItemSelected]}
                        onPress={() => toggleItem('patterns', p.id)}
                      >
                        <Ionicons
                          name={selected ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={selected ? EMOTION_CORAL : COLORS.textMuted}
                        />
                        <Text style={[styles.checkLabel, selected && styles.checkLabelSelected]}>
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
                  How do you typically express emotions?
                </Text>
                <View style={styles.expressionOptions}>
                  {EXPRESSION_STYLES.map((s) => (
                    <Pressable
                      key={s.id}
                      style={[
                        styles.expressionOption,
                        profile.expressionStyle === s.id && styles.expressionOptionSelected,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setProfile((prev) => ({ ...prev, expressionStyle: s.id as any }));
                      }}
                    >
                      <Text style={styles.expressionEmoji}>{s.emoji}</Text>
                      <Text style={[
                        styles.expressionLabel,
                        profile.expressionStyle === s.id && styles.expressionLabelSelected,
                      ]}>
                        {s.label}
                      </Text>
                      <Text style={styles.expressionDesc}>{s.desc}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* NEEDS */}
            {step === 'needs' && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>What You Need</Text>
                <Text style={styles.subtitle}>
                  When you're upset, what helps?{'\n'}
                  Tap all that apply.
                </Text>

                <View style={styles.needsGrid}>
                  {NEEDS_WHEN_UPSET.map((n) => {
                    const selected = profile.needsWhenUpset.includes(n.id);
                    return (
                      <Pressable
                        key={n.id}
                        style={[styles.needChip, selected && styles.needChipSelected]}
                        onPress={() => toggleItem('needsWhenUpset', n.id)}
                      >
                        <Text style={styles.needEmoji}>{n.emoji}</Text>
                        <Text style={[styles.needLabel, selected && styles.needLabelSelected]}>
                          {n.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    This helps AI (and you) know what you need when emotions are high.
                    {'\n\n'}
                    "You've said you need space first, then want to talk. Taking a few minutes?"
                  </Text>
                </View>
              </View>
            )}

            {/* DONE */}
            {step === 'done' && (
              <View style={styles.stepContainer}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={styles.title}>Emotional Profile Complete</Text>
                
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Vocabulary</Text>
                    <Text style={styles.summaryValue}>
                      {GRANULARITY_OPTIONS.find((g) => g.id === profile.granularity)?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Frequent Feelings</Text>
                    <Text style={styles.summaryValue}>
                      {profile.frequentNegative.slice(0, 3).map((id) =>
                        NEGATIVE_EMOTIONS.find((e) => e.id === id)?.label
                      ).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>When Upset, Need</Text>
                    <Text style={styles.summaryValue}>
                      {profile.needsWhenUpset.slice(0, 2).map((id) =>
                        NEEDS_WHEN_UPSET.find((n) => n.id === id)?.label.split(' ')[0]
                      ).join(', ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    Your Emotion check-in will adapt to your vocabulary.
                    {'\n\n'}
                    AI will understand your patterns and what you need.
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
                {step === 'intro' ? "Explore My Emotions" : step === 'done' ? 'Done' : 'Continue'}
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
  progressDotFilled: { backgroundColor: EMOTION_CORAL },
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
  emphasis: { color: EMOTION_CORAL, fontWeight: '600' },
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
  aiHintText: { fontSize: 13, color: EMOTION_CORAL },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  granularityOptions: { width: '100%', gap: 10, marginBottom: SPACING.lg },
  granularityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  granularityOptionSelected: {
    backgroundColor: EMOTION_CORAL + '15',
    borderColor: EMOTION_CORAL,
  },
  granularityEmoji: { fontSize: 28 },
  granularityTextContainer: { flex: 1 },
  granularityLabel: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  granularityLabelSelected: { color: EMOTION_CORAL },
  granularityDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  checkList: { width: '100%', gap: 8 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  checkItemSelected: { backgroundColor: EMOTION_CORAL + '15' },
  checkLabel: { fontSize: 15, color: COLORS.textSecondary, flex: 1 },
  checkLabelSelected: { color: COLORS.text },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  emotionChip: {
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
  emotionChipSelected: {
    backgroundColor: EMOTION_CORAL + '22',
    borderColor: EMOTION_CORAL,
  },
  emotionEmoji: { fontSize: 16 },
  emotionLabel: { fontSize: 14, color: COLORS.textSecondary },
  emotionLabelSelected: { color: EMOTION_CORAL, fontWeight: '500' },
  expressionOptions: {
    width: '100%',
    gap: 10,
  },
  expressionOption: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  expressionOptionSelected: {
    backgroundColor: EMOTION_CORAL + '15',
    borderColor: EMOTION_CORAL,
  },
  expressionEmoji: { fontSize: 28, marginBottom: 8 },
  expressionLabel: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  expressionLabelSelected: { color: EMOTION_CORAL },
  expressionDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  needsGrid: {
    width: '100%',
    gap: 10,
  },
  needChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  needChipSelected: {
    backgroundColor: EMOTION_CORAL + '15',
    borderColor: EMOTION_CORAL,
  },
  needEmoji: { fontSize: 24 },
  needLabel: { fontSize: 15, color: COLORS.textSecondary, flex: 1 },
  needLabelSelected: { color: COLORS.text },
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
    backgroundColor: EMOTION_CORAL,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.button,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#000' },
});
