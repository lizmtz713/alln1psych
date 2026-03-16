/**
 * Human Weather Forecast — Full week: how you'll likely feel, from current system signals.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getFullWeekForecast } from '../../src/services/forecastService';
import { useCockpitStore } from '../../src/stores/cockpitStore';
import { COLORS, SPACING } from '../../src/lib/constants';

export default function ForecastScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [body, state, emotion, connection, direction, alignment] = useCockpitStore((s) => [
    s.body.value,
    s.state.value,
    s.emotion.value,
    s.connection.value,
    s.direction.value,
    s.alignment.value,
  ]) as [number, number, number, number, number, number];
  const checkInContext = useCockpitStore((s) => s.checkInContext);
  const gaugeValues = useMemo(
    () => ({
      ...(body >= 0 && { body }),
      ...(state >= 0 && { state }),
      ...(emotion >= 0 && { emotion }),
      ...(connection >= 0 && { connection }),
      ...(direction >= 0 && { direction }),
      ...(alignment >= 0 && { alignment }),
    }),
    [body, state, emotion, connection, direction, alignment]
  );
  const { days, patterns } = useMemo(
    () =>
      getFullWeekForecast({
        gauges: gaugeValues,
        checkInContext,
      }),
    [gaugeValues, checkInContext]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.title}>Human Weather</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {patterns.length > 0 && (
          <View style={styles.patternsSection}>
            <Text style={styles.sectionTitle}>Patterns we're seeing</Text>
            {patterns.map((p, i) => (
              <View key={i} style={styles.patternCard}>
                <Text style={styles.patternLabel}>{p.label}</Text>
                <Text style={styles.patternDesc}>{p.description}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.sectionTitle}>Next 7 days</Text>
        {days.map((day) => (
          <View key={day.date} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <View style={[styles.riskBadge, day.riskLevel === 'high' && styles.riskHigh, day.riskLevel === 'medium' && styles.riskMedium]}>
                <Text style={styles.riskBadgeText}>{day.riskLevel}</Text>
              </View>
            </View>
            {day.riskFactors.length > 0 && (
              <View style={styles.factors}>
                {day.riskFactors.slice(0, 2).map((f, i) => (
                  <Text key={i} style={styles.factorText}>• {f.reason}</Text>
                ))}
              </View>
            )}
            {day.brightSpots.length > 0 && (
              <Text style={styles.brightText}>✨ {day.brightSpots[0]}</Text>
            )}
            {day.suggestions.length > 0 && (
              <Text style={styles.suggestionText}>💡 {day.suggestions[0].text}</Text>
            )}
          </View>
        ))}
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
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  placeholder: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  patternsSection: { marginBottom: SPACING.xl },
  patternCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  patternLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  patternDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  dayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.gaugeBg.state },
  riskMedium: { backgroundColor: COLORS.amberBg },
  riskHigh: { backgroundColor: COLORS.amberBorder },
  riskBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  factors: { marginBottom: 6 },
  factorText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  brightText: { fontSize: 13, color: COLORS.accent, marginBottom: 4 },
  suggestionText: { fontSize: 13, color: COLORS.textMuted },
});
