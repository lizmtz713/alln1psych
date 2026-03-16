/**
 * Fleet Synergy — Mechanic's Thanks feed (Family Edition)
 * Route: /(tabs)/people/fleet-synergy
 *
 * Positive-reinforcement feed of gratitude logs from Post-Flight debriefs.
 * RLS restricts to the user's fleet.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const EMERALD = '#10b981';
const CYAN = '#06b6d4';

export interface PostFlightLogRow {
  id: string;
  pilot_id: string;
  mechanics_thanks: string;
  created_at: string;
}

function formatSynergyDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function SynergyCard({ item }: { item: PostFlightLogRow }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardDate}>{formatSynergyDate(item.created_at)}</Text>
        <View style={styles.checkWrap}>
          <Ionicons name="checkmark-circle" size={20} color={EMERALD} />
        </View>
      </View>
      <Text style={styles.cardBody}>"{item.mechanics_thanks}"</Text>
      <Text style={styles.cardFooter}>— Logged by Pilot {item.pilot_id.slice(0, 8)}…</Text>
    </View>
  );
}

export default function FleetSynergyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['post_flight_logs_synergy'],
    queryFn: async (): Promise<PostFlightLogRow[]> => {
      const { data, error: e } = await supabase
        .from('post_flight_logs')
        .select('id, pilot_id, mechanics_thanks, created_at')
        .not('mechanics_thanks', 'is', null)
        .neq('mechanics_thanks', '')
        .order('created_at', { ascending: false });
      if (e) throw e;
      return (data ?? []) as PostFlightLogRow[];
    },
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderItem: ListRenderItem<PostFlightLogRow> = ({ item }) => (
    <SynergyCard item={item} />
  );

  const empty = (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>🔧</Text>
      <Text style={styles.emptyTitle}>No synergy logs yet.</Text>
      <Text style={styles.emptySub}>
        Complete a Post-Flight Debrief to thank a crew member.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Fleet Synergy Log</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={CYAN} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load synergy logs.</Text>
        </View>
      ) : !logs?.length ? (
        <View style={styles.centered}>{empty}</View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={empty}
        />
      )}
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
  listContent: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  card: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: EMERALD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardDate: { fontSize: 13, fontWeight: '600', color: TEXT_MUTED },
  checkWrap: {},
  cardBody: {
    fontSize: 18,
    lineHeight: 26,
    color: TEXT,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  cardFooter: { fontSize: 12, color: TEXT_MUTED },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyWrap: { alignItems: 'center', maxWidth: 280 },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center' },
  errorText: { fontSize: 15, color: TEXT_MUTED },
});
