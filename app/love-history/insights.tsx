/**
 * Love History — AI Insights. Gentle pattern analysis (placeholder for now).
 */

import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoveHistoryStore } from '../../src/stores/loveHistoryStore';
import { COLORS, SPACING } from '../../src/lib/constants';

const ACCENT = '#EC4899';

export default function LoveHistoryInsightsScreen() {
  const insets = useSafeAreaInsets();
  const storeEntries = useLoveHistoryStore((s) => s.entries);
  const patterns = useLoveHistoryStore((s) => s.patterns);
  const getEntriesSorted = useLoveHistoryStore((s) => s.getEntriesSorted);
  const getStats = useLoveHistoryStore((s) => s.getStats);
  const entries = useMemo(() => getEntriesSorted(), [storeEntries, getEntriesSorted]);
  const stats = useMemo(() => getStats(), [storeEntries, getStats]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.tagline}>
        Gentle pattern analysis — never judgmental. Your data stays on this device.
      </Text>

      {entries.length < 2 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>Not enough data yet</Text>
          <Text style={styles.emptySub}>
            Add at least 2 entries to your Love History to see gentle insights about patterns you might notice.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we see so far</Text>
          <Text style={styles.cardLine}>• {stats.total} entries in your timeline</Text>
          <Text style={styles.cardLine}>• Longest: {stats.longestMonths} months</Text>
          {stats.marriages > 0 && (
            <Text style={styles.cardLine}>• Marriages: {stats.marriages}</Text>
          )}
          <Text style={styles.cardLine}>• Current status: {stats.currentStatus}</Text>
          {patterns.length > 0 && (
            <Text style={[styles.cardLine, { marginTop: 12 }]}>
              You've named {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} — that self-awareness is valuable.
            </Text>
          )}
          <Text style={styles.comingSoon}>
            Deeper AI insights (gentle pattern narrative) coming soon. Your love life isn't random — and we'll help you see the patterns without judgment.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  cardLine: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 },
  comingSoon: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 20,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
