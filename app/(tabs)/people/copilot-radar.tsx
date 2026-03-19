/**
 * Co-Pilot Radar — Sibling / lateral view (Family Edition)
 * Route: /(tabs)/people/copilot-radar
 *
 * Pilots (teens) see other fleet members' overall status only. Privacy Curtain:
 * no per-gauge breakdown. Traffic signals: Green = safe to engage, Amber = Yield,
 * Red = Do Not Engage. Teaches systemic empathy.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
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
const STATUS_GREEN = '#22c55e';
const STATUS_AMBER = '#f59e0b';
const STATUS_RED = '#ef4444';
const NEON_LABEL = '#38bdf8';

type Status = 'green' | 'amber' | 'red';

/** Worst gauge wins: red > amber > green */
function overallStatus(statuses: Status[]): Status {
  if (statuses.some((s) => s === 'red')) return 'red';
  if (statuses.some((s) => s === 'amber')) return 'amber';
  return 'green';
}

interface CoPilotCard {
  id: string;
  name: string;
  status: Status;
}

export default function CoPilotRadarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: currentUser } = useQuery({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const telemetryQuery = useQuery({
    queryKey: ['shared_telemetry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_telemetry')
        .select('pilot_id, gauge_type, status')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as { pilot_id: string; gauge_type: string; status: Status }[];
    },
    refetchInterval: 10000,
    enabled: !!currentUser,
  });

  const coPilots = useMemo((): CoPilotCard[] => {
    const myId = currentUser ?? '';
    const rows = telemetryQuery.data ?? [];
    const byPilot = new Map<string, Status[]>();
    const gaugeTypes = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

    for (const row of rows) {
      if (row.pilot_id === myId) continue;
      if (!gaugeTypes.includes(row.gauge_type)) continue;
      if (!byPilot.has(row.pilot_id)) byPilot.set(row.pilot_id, []);
      byPilot.get(row.pilot_id)!.push(row.status);
    }

    return Array.from(byPilot.entries()).map(([id, statuses]) => ({
      id,
      name: `Co-Pilot ${id.slice(0, 8)}`,
      status: overallStatus(statuses),
    }));
  }, [telemetryQuery.data, currentUser]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const isLoading = telemetryQuery.isLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Co-Pilot Radar</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={NEON_LABEL} />
          <Text style={styles.loadingText}>Scanning for fleet members...</Text>
        </View>
      ) : coPilots.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Scanning for fleet members...</Text>
          <Text style={styles.emptySub}>Join a fleet in Fleet Management. Other members will appear here.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>LATERAL TRAFFIC</Text>
          {coPilots.map((copilot) => (
            <CoPilotCard key={copilot.id} copilot={copilot} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function CoPilotCard({ copilot }: { copilot: CoPilotCard }) {
  const isGreen = copilot.status === 'green';
  const isAmber = copilot.status === 'amber';
  const isRed = copilot.status === 'red';

  let icon: string;
  let label: string;
  let color: string;

  if (isRed) {
    icon = '🛑';
    label = 'Do Not Engage. Fleet Lockdown in effect.';
    color = STATUS_RED;
  } else if (isAmber) {
    icon = '⚠️';
    label = 'Yield. System is processing.';
    color = STATUS_AMBER;
  } else {
    icon = '✓';
    label = 'Route Clear. Safe to engage.';
    color = STATUS_GREEN;
  }

  return (
    <View style={[styles.card, { borderColor: color + '55', backgroundColor: color + '12' }]}>
      <Text style={styles.copilotName}>{copilot.name}</Text>
      <View style={styles.signalRow}>
        {isGreen ? (
          <View style={[styles.signalIcon, styles.signalGreen]}>
            <Ionicons name="checkmark" size={40} color={STATUS_GREEN} />
          </View>
        ) : (
          <View style={[styles.signalIconLarge, { backgroundColor: color + '22' }]}>
            <Text style={isRed ? styles.signalEmojiStop : styles.signalEmojiYield}>{icon}</Text>
          </View>
        )}
        <Text style={[styles.signalLabel, { color }]}>{label}</Text>
      </View>
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: { fontSize: 15, color: NEON_LABEL, marginTop: SPACING.lg },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  copilotName: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: SPACING.md },
  signalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalGreen: { backgroundColor: STATUS_GREEN + '22' },
  signalEmojiYield: { fontSize: 36 },
  signalEmojiStop: { fontSize: 40 },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  signalLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
