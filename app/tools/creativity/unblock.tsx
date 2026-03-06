/**
 * Creativity Tool — Creative block exploration.
 * Route: /tools/creativity/unblock
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const UNBLOCK_PROMPTS = [
  'What’s the smallest step you could take right now?',
  'What would you do if no one would ever see it?',
  'What are you afraid might happen if you start?',
  'If you had 2 minutes, what’s one line you’d write?',
  'What’s one thing that’s not wrong with this project?',
  'Who’s one person who doesn’t need it to be perfect?',
  'What would you try if you knew you could delete it later?',
  'What’s one word that belongs in this?',
  'What’s the opposite of what you think you should do?',
  'What did you last create that felt good? What was different?',
];

export default function CreativityUnblockScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIndex((i) => (i + 1) % UNBLOCK_PROMPTS.length);
  };

  const prompt = UNBLOCK_PROMPTS[index];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Unblock</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Gentle questions when you feel stuck. Sit with one, or tap for another.</Text>

        <View style={styles.card}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Another prompt</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.accent} />
        </Pressable>

        <Text style={styles.footnote}>There’s no wrong answer. Sometimes just reading the question is enough.</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: SPACING.xl },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  promptText: { fontSize: 18, color: TEXT, lineHeight: 28 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.accent },
  footnote: { fontSize: 13, color: TEXT_MUTED, textAlign: 'center', marginTop: 24 },
});
