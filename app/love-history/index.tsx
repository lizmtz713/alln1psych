/**
 * Love History — Timeline view. Entries sorted by start date; lessons highlighted.
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLoveHistoryStore } from '../../src/stores/loveHistoryStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useUserStore } from '../../src/stores/userStore';
import type { RelationshipType } from '../../src/types/loveHistory';

const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  crush: 'Crush',
  kiss: 'Kiss',
  fling: 'Fling',
  situationship: 'Situationship',
  dating: 'Dating',
  relationship: 'Relationship',
  engaged: 'Engaged',
  married: 'Married',
  divorced: 'Divorced',
};

const ACCENT = '#EC4899';

export default function LoveHistoryTimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ageGroup = useUserStore((s) => s.ageGroup);
  const storeEntries = useLoveHistoryStore((s) => s.entries);
  const getEntriesSorted = useLoveHistoryStore((s) => s.getEntriesSorted);
  const getStats = useLoveHistoryStore((s) => s.getStats);
  const entries = useMemo(() => getEntriesSorted(), [storeEntries, getEntriesSorted]);
  const stats = useMemo(() => getStats(), [storeEntries, getStats]);
  const isTeen = ageGroup === '13-17';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.tagline}>Your love life isn't random. There are patterns.</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>entries</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.longestMonths}</Text>
          <Text style={styles.statLabel}>longest (mo)</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.marriages}</Text>
          <Text style={styles.statLabel}>marriages</Text>
        </View>
      </View>

      <Pressable
        style={styles.addBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/love-history/add');
        }}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.addBtnText}>Add entry</Text>
      </Pressable>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💕</Text>
          <Text style={styles.emptyTitle}>
            {isTeen ? 'Relationship Reflections' : 'No entries yet'}
          </Text>
          <Text style={styles.emptySub}>
            {isTeen
              ? 'Add crushes, dating, and relationships to spot patterns over time.'
              : 'Add a relationship or moment to start your timeline.'}
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {entries.map((e) => (
            <Pressable
              key={e.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/love-history/${e.id}`);
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {e.isAnonymous ? 'Anonymous' : e.name || 'Unnamed'}
                </Text>
                <Text style={styles.cardType}>{RELATIONSHIP_TYPE_LABELS[e.type]}</Text>
              </View>
              <Text style={styles.cardDates}>
                {e.startDate}
                {e.endDate ? ` – ${e.endDate}` : ' – present'}
                {e.durationMonths != null ? ` · ${e.durationMonths} mo` : ''}
              </Text>
              {e.lessons.length > 0 && (
                <View style={styles.lessonsWrap}>
                  <Text style={styles.lessonsLabel}>Lessons:</Text>
                  <Text style={styles.lessonsText} numberOfLines={2}>
                    {e.lessons.join(' · ')}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.footerLinks}>
        <Pressable
          style={styles.link}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/love-history/patterns');
          }}
        >
          <Ionicons name="bulb-outline" size={20} color={ACCENT} />
          <Text style={styles.linkText}>My Patterns</Text>
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/love-history/insights');
          }}
        >
          <Ionicons name="sparkles-outline" size={20} color={ACCENT} />
          <Text style={styles.linkText}>AI Insights</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.button,
    marginBottom: SPACING.xl,
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 24 },
  timeline: { gap: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { opacity: 0.9 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 17, fontWeight: '600', color: COLORS.text, flex: 1 },
  cardType: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  cardDates: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  lessonsWrap: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  lessonsLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  lessonsText: { fontSize: 14, color: COLORS.textSecondary },
  footerLinks: { flexDirection: 'row', gap: 16, marginTop: 24 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkText: { fontSize: 15, color: ACCENT, fontWeight: '500' },
});
