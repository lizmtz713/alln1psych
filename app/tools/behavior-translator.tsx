/**
 * Behavior Translator — Family Edition
 * Route: /tools/behavior-translator
 *
 * Look up surface behavior and get a systems-based translation (Tier 1 vs Tier 3)
 * and optimization protocol. Flight-manual aesthetic.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SPACING, BORDER_RADIUS } from '../../src/lib/constants';

import behaviorDictionary from '../../src/data/behaviorDictionary.json';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const AMBER = '#f59e0b';
const SKY_BLUE = '#38bdf8';
const GREEN = '#22c55e';

type Entry = (typeof behaviorDictionary)[number];

const SYSTEMIC_TERMS = [
  'Tier 1',
  'Tier 3',
  'Nervous System',
  'cortisol',
  'adrenaline',
  'Cognitive Bottleneck',
  'Connection',
  'Alignment',
  'Direction Gauge',
  'State gauge',
  'Logical',
  'RPMs',
  'Garage Reset',
  'Probabilistic Language',
  'High-Octane Fuel',
  'Odometer',
  'low-power mode',
];

function highlightSystemicTerms(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = str;
  let key = 0;

  while (remaining.length > 0) {
    let best: { term: string; index: number } | null = null;
    for (const term of SYSTEMIC_TERMS) {
      const i = remaining.toLowerCase().indexOf(term.toLowerCase());
      if (i >= 0 && (best === null || i < best.index)) best = { term, index: i };
    }
    if (best === null) {
      parts.push(<Text key={key++}>{remaining}</Text>);
      break;
    }
    if (best.index > 0) {
      parts.push(<Text key={key++}>{remaining.slice(0, best.index)}</Text>);
    }
    const termLen = best.term.length;
    parts.push(
      <Text key={key++} style={{ color: SKY_BLUE, fontWeight: '600' }}>
        {remaining.slice(best.index, best.index + termLen)}
      </Text>
    );
    remaining = remaining.slice(best.index + termLen);
  }
  return parts;
}

function BehaviorCard({ entry }: { entry: Entry }) {
  return (
    <View style={styles.card}>
      <View style={styles.symptomSection}>
        <Text style={styles.symptomIcon}>⚠️</Text>
        <Text style={styles.symptomLabel}>Symptom</Text>
        <Text style={styles.symptomText}>{entry.surfaceBehavior}</Text>
      </View>
      <View style={styles.scienceSection}>
        <Text style={styles.scienceLabel}>The Science</Text>
        <Text style={styles.scienceText} selectable>
          {highlightSystemicTerms(entry.systemicTranslation)}
        </Text>
      </View>
      <View style={styles.protocolSection}>
        <Text style={styles.protocolIcon}>✅</Text>
        <Text style={styles.protocolLabel}>Protocol</Text>
        <Text style={styles.protocolText}>{entry.optimization}</Text>
      </View>
    </View>
  );
}

export default function BehaviorTranslatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return behaviorDictionary as Entry[];
    return (behaviorDictionary as Entry[]).filter((e) =>
      e.surfaceBehavior.toLowerCase().includes(q)
    );
  }, [search]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Behavior Translator</Text>
        <View style={styles.backBtn} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search surface behavior..."
        placeholderTextColor={TEXT_MUTED}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No matches. Try a different search.</Text>
        ) : (
          filtered.map((entry) => <BehaviorCard key={entry.id} entry={entry} />)
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: TEXT },
  headerTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  searchInput: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: TEXT,
    fontVariant: ['tabular-nums'],
  },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  emptyText: { fontSize: 15, color: TEXT_MUTED, fontStyle: 'italic', marginTop: SPACING.lg },
  card: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  symptomSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  symptomIcon: { fontSize: 20, marginBottom: 4 },
  symptomLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  symptomText: { fontSize: 17, fontWeight: '600', color: AMBER },
  scienceSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  scienceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  scienceText: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  protocolSection: {
    borderWidth: 1,
    borderColor: GREEN + '44',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: GREEN + '0c',
    padding: SPACING.md,
  },
  protocolIcon: { fontSize: 18, marginBottom: 4 },
  protocolLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: GREEN,
    marginBottom: 4,
  },
  protocolText: { fontSize: 14, color: TEXT, lineHeight: 22 },
});
