/**
 * Quick Reset — Main screen with 5 exercise options.
 * Route: /tools/quick-reset
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/lib/constants';
import { useResetStore } from '../../../src/stores/resetStore';

const BG = COLORS.background;
const CARD_BG = COLORS.surface;
const BORDER = COLORS.border;
const TEXT = COLORS.text;
const TEXT_MUTED = COLORS.textSecondary;

const EXERCISES = [
  {
    id: 'box-breathing' as const,
    emoji: '📦',
    title: 'Box Breathing',
    subtitle: '4-4-4-4. Calms the nervous system.',
    duration: '~2 min',
  },
  {
    id: 'physiological-sigh' as const,
    emoji: '🌬️',
    title: 'Physiological Sigh',
    subtitle: 'Double inhale, long exhale. Fast relief.',
    duration: '~1.5 min',
  },
  {
    id: '5-4-3-2-1-grounding' as const,
    emoji: '🎯',
    title: '5-4-3-2-1 Grounding',
    subtitle: 'See, touch, hear, smell, taste. Anchor here.',
    duration: 'Your pace',
  },
  {
    id: 'cold-reset' as const,
    emoji: '🧊',
    title: 'Cold Reset',
    subtitle: 'Face or wrists. Brief activation.',
    duration: '~1 min',
  },
  {
    id: 'shake-it-out' as const,
    emoji: '🙌',
    title: 'Shake It Out',
    subtitle: 'Release tension through movement.',
    duration: '~1 min',
  },
  {
    id: 'short-walk' as const,
    emoji: '🚶',
    title: 'Short Walk',
    subtitle: '2–5 min. Focus on your steps and surroundings.',
    duration: '2–5 min',
  },
];

export default function QuickResetIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const getLastSession = useResetStore((s) => s.getLastSession);
  const getTotalSessions = useResetStore((s) => s.getTotalSessions);

  const totalSessions = getTotalSessions();

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/tools/quick-reset/${id}`);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Quick Reset</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose a short exercise to regulate your nervous system. No thinking required.
        </Text>

        {totalSessions > 0 && (
          <Text style={styles.stats}>{totalSessions} session{totalSessions !== 1 ? 's' : ''} completed</Text>
        )}

        {EXERCISES.map((ex) => {
          const last = getLastSession(ex.id);
          return (
            <Pressable
              key={ex.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => handleSelect(ex.id)}
            >
              <Text style={styles.cardEmoji}>{ex.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{ex.title}</Text>
                <Text style={styles.cardSub}>{ex.subtitle}</Text>
                <Text style={styles.cardDuration}>{ex.duration}</Text>
                {last && (
                  <Text style={styles.cardLast}>
                    Last: {new Date(last.completedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
            </Pressable>
          );
        })}
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
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  stats: { fontSize: 13, color: TEXT_MUTED, marginBottom: SPACING.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardPressed: { opacity: 0.9 },
  cardEmoji: { fontSize: 32, marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  cardSub: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  cardDuration: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  cardLast: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
});
