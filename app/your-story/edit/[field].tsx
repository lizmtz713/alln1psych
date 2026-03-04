/**
 * Edit a single Your Story field (modal)
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore, type LoveLanguage, type LearningStyle, type TherapyExperience } from '../../../src/stores/userStore';
import { useAuth } from '../../../src/providers/AuthProvider';
import { updateUserStory } from '../../../src/services/userStoryService';
import { CULTURAL_BACKGROUND_OPTIONS, ENVIRONMENT_UPBRINGING_OPTIONS } from '../../../src/lib/culturalOptions';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../src/lib/constants';

const FAMILY_OPTIONS = ['Two parents', 'Single mom', 'Single dad', 'Grandparents', 'Foster/adopted', 'Other family', "It's complicated"];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Both', 'Other'];
const STRENGTH_OPTIONS = ['Stay quiet and push through', 'Express everything — let it out', 'Protect others before yourself', "Handle it alone — don't burden anyone", "I'm still figuring that out"];
const THERAPY_OPTIONS: { value: TherapyExperience; label: string }[] = [
  { value: 'never', label: 'Never been' },
  { value: 'tried-it', label: "Tried it, didn't stick" },
  { value: 'currently', label: 'Currently in therapy' },
  { value: 'positive', label: 'Had a good experience' },
  { value: 'negative', label: 'Had a bad experience' },
];
const LOVE_LANGUAGE_OPTIONS: { value: LoveLanguage; label: string }[] = [
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'quality-time', label: 'Quality Time' },
  { value: 'acts-of-service', label: 'Acts of Service' },
  { value: 'physical-touch', label: 'Physical Touch' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'unknown', label: 'Not set' },
];
const LEARNING_OPTIONS: { value: LearningStyle; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
  { value: 'doing', label: 'Doing' },
  { value: 'talking', label: 'Talking' },
  { value: 'unknown', label: 'Not set' },
];

export default function EditFieldScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { field } = useLocalSearchParams<{ field: string }>();
  const { user: authUser } = useAuth();
  const user = useUserStore();

  const [text, setText] = useState('');
  const [otherLanguageText, setOtherLanguageText] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const setters = {
    setCulturalBackgroundText: useUserStore((s) => s.setCulturalBackgroundText),
    setFamilyStructure: useUserStore((s) => s.setFamilyStructure),
    setLanguageOfEmotion: useUserStore((s) => s.setLanguageOfEmotion),
    setStrengthMeaning: useUserStore((s) => s.setStrengthMeaning),
    setEnvironmentUpbringing: useUserStore((s) => s.setEnvironmentUpbringing),
    setTherapyExperience: useUserStore((s) => s.setTherapyExperience),
    setLoveLanguage: useUserStore((s) => s.setLoveLanguage),
    setLearningStyle: useUserStore((s) => s.setLearningStyle),
  };

  useEffect(() => {
    if (field === 'cultural-background') {
      setText(user.culturalBackgroundText || '');
    } else if (field === 'family-structure') {
      setText(user.familyStructure || '');
    } else if (field === 'language-of-emotion') {
      const v = user.languageOfEmotion || '';
      setText(v === 'Other' || !LANGUAGE_OPTIONS.includes(v) ? 'Other' : v);
      if (v && v !== 'Other' && !LANGUAGE_OPTIONS.includes(v)) setOtherLanguageText(v);
    } else if (field === 'strength-meaning') {
      setText(user.strengthMeaning || '');
    } else if (field === 'environment-upbringing') {
      setChips(user.environmentUpbringing || []);
    } else if (field === 'therapy-experience') {
      setText(user.therapyExperience || '');
    } else if (field === 'love-language') {
      setText(user.loveLanguage || '');
    } else if (field === 'learning-style') {
      setText(user.learningStyle || '');
    }
  }, [field]);

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    const key = field?.replace(/-/g, '') as keyof typeof setters;
    const setter = field && setters[key as keyof typeof setters];
    if (field === 'cultural-background' && setter) {
      (setters.setCulturalBackgroundText as (v: string) => void)(text);
      if (authUser?.id) await updateUserStory(authUser.id, { cultural_background_text: text || null });
    } else if (field === 'family-structure' && setter) {
      (setters.setFamilyStructure as (v: string) => void)(text);
      if (authUser?.id) await updateUserStory(authUser.id, { family_structure: text || null });
    } else if (field === 'language-of-emotion' && setter) {
      const val = text === 'Other' ? (otherLanguageText.trim() || 'Other') : text;
      (setters.setLanguageOfEmotion as (v: string) => void)(val);
      if (authUser?.id) await updateUserStory(authUser.id, { language_of_emotion: val || null });
    } else if (field === 'strength-meaning' && setter) {
      (setters.setStrengthMeaning as (v: string) => void)(text);
      if (authUser?.id) await updateUserStory(authUser.id, { strength_meaning: text || null });
    } else if (field === 'environment-upbringing') {
      setters.setEnvironmentUpbringing(chips);
      if (authUser?.id) await updateUserStory(authUser.id, { environment_upbringing: chips.length ? chips.join(', ') : null });
    } else if (field === 'therapy-experience' && setter) {
      (setters.setTherapyExperience as (v: TherapyExperience | null) => void)(text as TherapyExperience || null);
      if (authUser?.id) await updateUserStory(authUser.id, { therapy_experience: text || null });
    } else if (field === 'love-language' && setter) {
      (setters.setLoveLanguage as (v: LoveLanguage | null) => void)((text as LoveLanguage) || null);
    } else if (field === 'learning-style' && setter) {
      (setters.setLearningStyle as (v: LearningStyle | null) => void)((text as LearningStyle) || null);
    }
    setSaving(false);
    router.back();
  };

  const titles: Record<string, string> = {
    'cultural-background': 'Cultural Background',
    'family-structure': 'Who Raised You',
    'language-of-emotion': 'Language of Emotion',
    'strength-meaning': 'What "Being Strong" Meant',
    'environment-upbringing': 'Environment You Grew Up In',
    'therapy-experience': 'Therapy Experience',
    'love-language': 'Love Language',
    'learning-style': 'How You Learn Best',
  };
  const title = field ? titles[field] : 'Edit';

  const toggleChip = (opt: string) => {
    setChips((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  if (!field) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={save} disabled={saving} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {(field === 'cultural-background' || field === 'strength-meaning') && (
          <>
            <Text style={styles.hint}>
              {field === 'cultural-background'
                ? 'Tell us about your cultural identity. This helps us understand your context.'
                : 'What did your family teach you about being strong?'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={field === 'cultural-background' ? 'e.g. Mexican-American, first-gen, grew up in Houston...' : 'e.g. Don\'t cry. Handle it yourself.'}
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={setText}
              multiline
            />
          </>
        )}

        {field === 'cultural-background' && (
          <View style={styles.chipSection}>
            <Text style={styles.chipLabel}>Or select:</Text>
            <View style={styles.chipRow}>
              {CULTURAL_BACKGROUND_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, text === opt && styles.chipSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt); }}
                >
                  <Text style={[styles.chipText, text === opt && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {field === 'family-structure' && (
          <View style={styles.chipRow}>
            {FAMILY_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, text === opt && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt); }}
              >
                <Text style={[styles.chipText, text === opt && styles.chipTextSelected]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {field === 'language-of-emotion' && (
          <>
            <Text style={styles.hint}>What language do you think and feel in?</Text>
            <View style={styles.chipRow}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, text === opt && styles.chipSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt); }}
                >
                  <Text style={[styles.chipText, text === opt && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            {text === 'Other' && (
              <TextInput
                style={styles.input}
                placeholder="e.g. Korean, Tagalog..."
                placeholderTextColor={COLORS.textMuted}
                value={otherLanguageText}
                onChangeText={setOtherLanguageText}
              />
            )}
          </>
        )}

        {field === 'strength-meaning' && (
          <View style={styles.chipRow}>
            {STRENGTH_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.chip, text === opt && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt); }}
              >
                <Text style={[styles.chipText, text === opt && styles.chipTextSelected]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {field === 'environment-upbringing' && (
          <>
            <Text style={styles.hint}>Select all that apply.</Text>
            <View style={styles.chipRow}>
              {ENVIRONMENT_UPBRINGING_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, chips.includes(opt) && styles.chipSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleChip(opt); }}
                >
                  <Text style={[styles.chipText, chips.includes(opt) && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {field === 'therapy-experience' && (
          <View style={styles.chipRow}>
            {THERAPY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.chip, text === opt.value && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt.value); }}
              >
                <Text style={[styles.chipText, text === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {field === 'love-language' && (
          <View style={styles.chipRow}>
            {LOVE_LANGUAGE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.chip, text === opt.value && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt.value); }}
              >
                <Text style={[styles.chipText, text === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {field === 'learning-style' && (
          <View style={styles.chipRow}>
            {LEARNING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.chip, text === opt.value && styles.chipSelected]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setText(opt.value); }}
              >
                <Text style={[styles.chipText, text === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
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
  saveBtn: { padding: 8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  hint: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  chipSection: { marginTop: 16 },
  chipLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg ?? 'rgba(13,148,136,0.15)' },
  chipText: { fontSize: 14, color: COLORS.textSecondary },
  chipTextSelected: { color: COLORS.accent, fontWeight: '600' },
});
