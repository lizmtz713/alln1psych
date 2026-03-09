/**
 * SocialHealthCard — "Apple Health for relationships"
 * Score 0–100%, tier status (strong / stable / fading), actionable suggestions.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS, SPACING } from '../../lib/constants';
import type { SocialHealthResult, TierSummary } from '../../services/friendshipMaintenance';

export interface SocialHealthCardProps {
  result: SocialHealthResult;
  onSuggestionPress?: (suggestion: string) => void;
}

function TierLine({ t }: { t: TierSummary }) {
  const statusColor =
    t.status === 'strong' ? COLORS.primary ?? COLORS.accent : t.status === 'fading' ? '#F59E0B' : COLORS.textSecondary;
  return (
    <View style={styles.tierRow}>
      <Text style={styles.tierLabel}>{t.label}</Text>
      <View style={styles.tierRight}>
        <Text style={[styles.tierCount, { color: statusColor }]}>
          {t.count}/{t.max}
        </Text>
        <Text style={[styles.tierStatus, { color: statusColor }]}>{t.statusLabel.toLowerCase()}</Text>
      </View>
    </View>
  );
}

export function SocialHealthCard({ result, onSuggestionPress }: SocialHealthCardProps) {
  const router = useRouter();
  const scoreColor =
    result.score >= 70 ? (COLORS.primary ?? COLORS.accent) : result.score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <View style={styles.card}>
      <View style={styles.scoreRow}>
        <Text style={styles.title}>Your Social Health</Text>
        <Text style={[styles.score, { color: scoreColor }]}>{result.score}%</Text>
      </View>
      <View style={styles.tierBlock}>
        {result.tierSummaries.map((t) => (
          <TierLine key={t.tier} t={t} />
        ))}
      </View>
      {result.suggestions.length > 0 ? (
        <View style={styles.suggestionsBlock}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          {result.suggestions.map((s, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSuggestionPress?.(s);
                router.push('/(tabs)/people');
              }}
            >
              <Text style={styles.suggestionBullet}>•</Text>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  score: { fontSize: 28, fontWeight: '800' },
  tierBlock: { marginBottom: 12 },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  tierLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  tierRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierCount: { fontSize: 13, fontWeight: '600' },
  tierStatus: { fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  suggestionsBlock: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  suggestionsTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  suggestionRowPressed: { opacity: 0.8 },
  suggestionBullet: { fontSize: 14, color: COLORS.accent },
  suggestionText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
});
