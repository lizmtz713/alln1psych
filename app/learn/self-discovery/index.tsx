/**
 * Self-Discovery — Hub for 8 short, research-backed insight quizzes.
 * 2–5 min each. Not labels; reveal how someone operates.
 * Route: /learn/self-discovery
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { getSelfDiscoveryQuizzesInOrder } from '../../../src/data/selfDiscoveryQuizzes';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;
const ACCENT = COLORS.accent;

export default function SelfDiscoveryHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const quizzes = getSelfDiscoveryQuizzesInOrder();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openQuiz = (id: string, route?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route) router.push(route as any);
    else router.push(`/learn/self-discovery/${id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Self-Discovery</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Short quizzes grounded in research. They don’t label you — they reveal how you operate. Each takes 2–3 minutes and connects to your gauges and what helps.
        </Text>
        {quizzes.map((q) => (
          <Pressable
            key={q.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => q.type === 'external' ? openQuiz(q.id, q.route) : openQuiz(q.id)}
          >
            <Text style={styles.cardEmoji}>{q.emoji}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{q.shortTitle}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{q.description}</Text>
              <Text style={styles.cardMeta}>{q.timeEstimate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
          </Pressable>
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Use these as insight tools. When you see “that’s me,” you’re building self-awareness — the foundation of your system.
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT, flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40 },
  intro: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.md,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 28, marginRight: 14 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 4 },
  cardSub: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
  cardMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 6 },
  footer: { marginTop: 24 },
  footerText: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20, fontStyle: 'italic' },
});
