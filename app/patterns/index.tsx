import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/lib/constants';
import { getPendingInterventions, getToolOutcomeSummaries, recordInterventionOutcome, type PendingIntervention, type ToolOutcomeSummary, type OutcomeValue } from '../../src/services/learningLoop';

const titleFor = (id: string) => {
  if (id.startsWith('show-up-inviter-')) return 'How to Show Up';
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [summaries, setSummaries] = useState<ToolOutcomeSummary[]>([]);
  const [pending, setPending] = useState<PendingIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextSummaries, nextPending] = await Promise.all([getToolOutcomeSummaries(), getPendingInterventions()]);
      setSummaries(nextSummaries); setPending(nextPending);
    } catch { setError('Your learning history could not be loaded. Please try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const answer = async (item: PendingIntervention, outcome: OutcomeValue) => {
    setPending((current) => current.filter((entry) => entry.id !== item.id));
    try { await recordInterventionOutcome({ interventionId: item.id, toolId: item.toolId, outcome }); await load(); }
    catch { setError('That answer did not save. Please try again.'); await load(); }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What works for me</Text>
        <Text style={styles.subtitle}>Built only from what you report—not from completion, guesses, or other people.</Text>
        {loading ? <ActivityIndicator color={COLORS.accent} /> : null}
        {error ? <Pressable style={styles.errorCard} onPress={() => void load()}><Text style={styles.error}>{error}</Text><Text style={styles.retry}>Tap to retry</Text></Pressable> : null}
        {!loading && pending.length > 0 ? <View style={styles.section}><Text style={styles.sectionTitle}>How did it work out?</Text>{pending.slice(0, 3).map((item) => <View key={item.id} style={styles.card}><Text style={styles.cardTitle}>{titleFor(item.toolId)}</Text><Text style={styles.cardMeta}>You tried this earlier. How do you feel now?</Text><View style={styles.row}>{(['better','same','worse','unsure'] as OutcomeValue[]).map((value) => <Pressable key={value} style={styles.chip} onPress={() => void answer(item, value)}><Text style={styles.chipText}>{value === 'unsure' ? 'Not sure' : titleFor(value)}</Text></Pressable>)}</View></View>)}</View> : null}
        <View style={styles.section}><Text style={styles.sectionTitle}>Your results</Text>{!loading && summaries.length === 0 ? <Text style={styles.empty}>After you try tools and tell InGauge what happened, your personal patterns will appear here.</Text> : summaries.map((item) => <View key={item.toolId} style={styles.card}><View style={styles.between}><Text style={styles.cardTitle}>{titleFor(item.toolId)}</Text><Text style={styles.rate}>{Math.round(item.betterRate * 100)}% better</Text></View><Text style={styles.cardMeta}>{item.total} report{item.total === 1 ? '' : 's'} · {item.evidence} evidence</Text><Text style={styles.caution}>{item.evidence === 'early' ? 'Too early to conclude—keep checking in.' : item.worse > 0 ? `${item.worse} time${item.worse === 1 ? '' : 's'} felt worse. Context matters.` : 'This is becoming a repeatable personal pattern.'}</Text></View>)}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  backButton: { padding: 8, marginBottom: 16, alignSelf: 'flex-start' },
  content: { paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, marginBottom: 24 },
  section: { marginTop: 12, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  cardMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 5 },
  caution: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginTop: 10 },
  between: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rate: { fontSize: 14, fontWeight: '700', color: COLORS.accentLight },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: COLORS.inputSurface, borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 13, color: COLORS.text },
  empty: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, paddingVertical: 20 },
  errorCard: { backgroundColor: COLORS.surface, padding: 14, borderRadius: 12, marginBottom: 12 },
  error: { color: COLORS.error, fontSize: 14 },
  retry: { color: COLORS.accentLight, fontSize: 13, marginTop: 5 },
});
