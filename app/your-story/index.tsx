/**
 * Your Story — background profile view and edit entry
 */

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore, type LoveLanguage, type LearningStyle } from '../../src/stores/userStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../src/lib/constants';

const LOVE_LANGUAGE_LABELS: Record<LoveLanguage, string> = {
  words: 'Words of Affirmation',
  'quality-time': 'Quality Time',
  'acts-of-service': 'Acts of Service',
  'physical-touch': 'Physical Touch',
  gifts: 'Gifts',
  unknown: 'Not set',
};

const LEARNING_STYLE_LABELS: Record<LearningStyle, string> = {
  reading: 'Reading',
  listening: 'Listening',
  doing: 'Doing',
  talking: 'Talking',
  unknown: 'Not set',
};

const THERAPY_LABELS: Record<string, string> = {
  never: 'Never been',
  'tried-it': 'Tried it, didn\'t stick',
  currently: 'Currently in therapy',
  positive: 'Had a good experience',
  negative: 'Had a bad experience',
};

const SECTIONS = [
  { key: 'cultural-background', emoji: '🌍', title: 'Cultural Background', storeKey: 'culturalBackgroundText' as const },
  { key: 'family-structure', emoji: '👨‍👩‍👧', title: 'Who Raised You', storeKey: 'familyStructure' as const },
  { key: 'language-of-emotion', emoji: '🗣️', title: 'Language of Emotion', storeKey: 'languageOfEmotion' as const },
  { key: 'strength-meaning', emoji: '💪', title: 'What "Being Strong" Meant', storeKey: 'strengthMeaning' as const },
  { key: 'environment-upbringing', emoji: '🏠', title: 'Environment You Grew Up In', storeKey: 'environmentUpbringing' as const },
  { key: 'therapy-experience', emoji: '🛋️', title: 'Therapy Experience', storeKey: 'therapyExperience' as const },
  { key: 'love-language', emoji: '💕', title: 'Love Language', storeKey: 'loveLanguage' as const },
  { key: 'learning-style', emoji: '📚', title: 'How You Learn Best', storeKey: 'learningStyle' as const },
];

function getDisplayValue(storeKey: string, value: unknown): string {
  if (value == null || value === '') return 'Not set';
  if (storeKey === 'environmentUpbringing' && Array.isArray(value)) return value.length ? value.join(', ') : 'Not set';
  if (storeKey === 'loveLanguage') return LOVE_LANGUAGE_LABELS[value as LoveLanguage] ?? String(value);
  if (storeKey === 'learningStyle') return LEARNING_STYLE_LABELS[value as LearningStyle] ?? String(value);
  if (storeKey === 'therapyExperience') return THERAPY_LABELS[value as string] ?? String(value);
  return String(value);
}

export default function YourStoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUserStore();

  const filled = SECTIONS.filter((s) => {
    const v = user[s.storeKey];
    if (s.storeKey === 'environmentUpbringing') return Array.isArray(v) && v.length > 0;
    return v != null && v !== '';
  }).length;
  const total = SECTIONS.length;
  const pct = total ? Math.round((filled / total) * 100) : 0;

  const openEdit = (field: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/your-story/edit/${field}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Story</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>Your Story</Text>
        <Text style={styles.heroSub}>
          This is who you are. InGauge uses this to personalize everything — from how we talk to you, to what we suggest, to how we understand your patterns.
        </Text>

        {pct < 100 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        )}

        {SECTIONS.map((s) => {
          const raw = user[s.storeKey];
          const display = getDisplayValue(s.storeKey, raw);
          return (
            <Pressable
              key={s.key}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => openEdit(s.key)}
            >
              <Text style={styles.cardEmoji}>{s.emoji}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardValue} numberOfLines={2}>{display}</Text>
              </View>
              <Text style={styles.editLabel}>Edit</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </Pressable>
          );
        })}

        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Why This Matters</Text>
          <Text style={styles.whyBody}>
            Your background shapes how you experience emotions, relationships, and growth.
          </Text>
          <Text style={styles.whyBullet}>• Someone raised by immigrant parents might carry different pressures.</Text>
          <Text style={styles.whyBullet}>• Someone who thinks in Spanish but lives in English processes feelings differently.</Text>
          <Text style={styles.whyBullet}>• Someone told "don't cry" as a kid might struggle with emotional expression now.</Text>
          <Text style={styles.whyClosing}>
            InGauge doesn't ignore your context. We use it to understand you better.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  heroSub: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: COLORS.surface, borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { opacity: 0.95 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  cardValue: { fontSize: 14, color: COLORS.textSecondary },
  editLabel: { fontSize: 14, color: COLORS.accent, marginRight: 4 },
  whySection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  whyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  whyBody: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  whyBullet: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 6 },
  whyClosing: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginTop: 8, fontStyle: 'italic' },
});
