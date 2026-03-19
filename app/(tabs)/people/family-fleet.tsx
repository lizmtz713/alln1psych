/**
 * Family Fleet — Ground Control Dashboard
 * Route: /(tabs)/people/family-fleet
 *
 * Parent (Ground Control) monitors Pilots (kids). Privacy Curtain: no raw
 * numbers, only Green/Amber/Red status. Probabilistic language only.
 * Live data from shared_telemetry + maintenance_tickets.
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

// Telemetry palette: deep slate, neon status (no therapy/parental-control look)
const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const STATUS_GREEN = '#22c55e';
const STATUS_AMBER = '#f59e0b';
const STATUS_RED = '#ef4444';
const NEON_LABEL = '#38bdf8';
const ACCENT = '#0ea5e9';

type GaugeId = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';
type Status = 'green' | 'amber' | 'red';

const GAUGE_LABELS: Record<GaugeId, string> = {
  body: 'Body',
  state: 'State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

interface PilotTelemetry {
  id: string;
  name: string;
  gauges: Record<GaugeId, Status>;
  /** Probabilistic system insight (Rule 9). No universal claims. */
  systemInsight: string;
  hasOpenTicket?: boolean;
}

const DEFAULT_GAUGES: Record<GaugeId, Status> = {
  body: 'green',
  state: 'green',
  emotion: 'green',
  connection: 'green',
  direction: 'green',
  alignment: 'green',
};

function groupTelemetryByPilot(rows: { pilot_id: string; gauge_type: string; status: Status; probabilistic_insight: string | null }[]): PilotTelemetry[] {
  const byPilot = new Map<string, Partial<PilotTelemetry> & { gauges: Record<GaugeId, Status> }>();
  const gaugeTypes: GaugeId[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

  for (const row of rows) {
    if (!byPilot.has(row.pilot_id)) {
      byPilot.set(row.pilot_id, {
        id: row.pilot_id,
        name: `Pilot ${row.pilot_id.slice(0, 8)}`,
        gauges: { ...DEFAULT_GAUGES },
        systemInsight: '',
      });
    }
    const pilot = byPilot.get(row.pilot_id)!;
    if (gaugeTypes.includes(row.gauge_type as GaugeId)) {
      pilot.gauges[row.gauge_type as GaugeId] = row.status;
    }
    if (row.probabilistic_insight?.trim() && !pilot.systemInsight) {
      pilot.systemInsight = row.probabilistic_insight.trim();
    }
  }

  return Array.from(byPilot.values())
    .filter((p) => p.id != null && p.name != null)
    .map((p): PilotTelemetry => ({
      id: p.id as string,
      name: p.name as string,
      gauges: p.gauges,
      systemInsight: p.systemInsight || 'No telemetry insight yet.',
    }));
}

function StatusRing({ status }: { status: Status }) {
  const color = status === 'green' ? STATUS_GREEN : status === 'amber' ? STATUS_AMBER : STATUS_RED;
  return (
    <View style={[styles.ring, { borderColor: color, backgroundColor: color + '18' }]} />
  );
}

function PilotCard({ pilot }: { pilot: PilotTelemetry }) {
  const router = useRouter();
  const gaugesList = (Object.keys(pilot.gauges) as GaugeId[]).map((key) => ({
    id: key,
    label: GAUGE_LABELS[key],
    status: pilot.gauges[key],
  }));

  const hasAmberOrRed = (Object.values(pilot.gauges) as Status[]).some(
    (s) => s === 'amber' || s === 'red'
  );

  const quickActions = [
    { id: 'standby', icon: '🛰️', label: 'Standby', action: "Send 'I'm in your orbit' ping" },
    { id: 'refuel', icon: '⛽', label: 'Refuel', action: 'Offer low-demand Garage Reset' },
    { id: 'maintenance', icon: '🛠️', label: 'Maintenance', action: 'Suggest future Road Map check' },
  ];

  const onQuickAction = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: wire to real actions (nudge, message, etc.)
  };

  return (
    <View style={styles.pilotCard}>
      <View style={styles.pilotNameRow}>
        <Text style={styles.pilotName}>{pilot.name}</Text>
      </View>

      {pilot.hasOpenTicket && (
        <View style={styles.activeTicketBadge}>
          <Text style={styles.activeTicketBadgeText}>⚠️ ACTIVE MAINTENANCE TICKET</Text>
        </View>
      )}

      {/* Minimized 6 gauges — status only (Privacy Curtain: no raw scores) */}
      <View style={styles.gaugesRow}>
        {gaugesList.map((g) => (
          <View key={g.id} style={styles.gaugeCell}>
            <Text style={styles.gaugeLabel}>{g.label}</Text>
            <StatusRing status={g.status} />
          </View>
        ))}
      </View>

      {/* Probabilistic insight (from probabilistic_insight in shared_telemetry) */}
      <View style={styles.insightBox}>
        <Ionicons name="analytics-outline" size={14} color={NEON_LABEL} />
        <Text style={styles.insightText}>{pilot.systemInsight}</Text>
      </View>

      {/* Quick Deploy — only when Pilot has Amber or Red */}
      {hasAmberOrRed && (
        <View style={styles.actionPanel}>
          <Text style={styles.actionPanelLabel}>Quick Deploy</Text>
          <View style={styles.actionRow}>
            {quickActions.map((a) => (
              <Pressable
                key={a.id}
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                onPress={() => onQuickAction(a.id)}
              >
                <Text style={styles.actionBtnIcon}>{a.icon}</Text>
                <Text style={styles.actionBtnLabel}>{a.label}</Text>
                <Text style={styles.actionBtnHint} numberOfLines={2}>{a.action}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function GlobalStatusIndicator({ pilots }: { pilots: PilotTelemetry[] }) {
  const statuses = pilots.flatMap((p) => Object.values(p.gauges) as Status[]);
  const anyRed = statuses.some((s) => s === 'red');
  const anyAmber = statuses.some((s) => s === 'amber');
  const allGreen = statuses.every((s) => s === 'green');

  let label: string;
  let color: string;
  if (anyRed) {
    label = 'Stabilization required';
    color = STATUS_RED;
  } else if (anyAmber) {
    label = 'Partial load — monitor';
    color = STATUS_AMBER;
  } else if (allGreen) {
    label = 'All systems nominal';
    color = STATUS_GREEN;
  } else {
    label = 'Fleet operational';
    color = NEON_LABEL;
  }

  return (
    <View style={[styles.globalBadge, { borderColor: color + '55', backgroundColor: color + '14' }]}>
      <View style={[styles.globalDot, { backgroundColor: color }]} />
      <Text style={[styles.globalLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function FamilyFleetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const telemetryQuery = useQuery({
    queryKey: ['shared_telemetry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_telemetry')
        .select('pilot_id, gauge_type, status, probabilistic_insight')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as { pilot_id: string; gauge_type: string; status: Status; probabilistic_insight: string | null }[];
    },
    refetchInterval: 10000,
  });

  const ticketsQuery = useQuery({
    queryKey: ['maintenance_tickets_open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select('sender_id')
        .eq('is_resolved', false);
      if (error) throw error;
      return (data ?? []) as { sender_id: string }[];
    },
  });

  const pilots = useMemo(() => {
    const list = groupTelemetryByPilot(telemetryQuery.data ?? []);
    const senderIdsWithTickets = new Set((ticketsQuery.data ?? []).map((t) => t.sender_id));
    return list.map((p) => ({ ...p, hasOpenTicket: senderIdsWithTickets.has(p.id) }));
  }, [telemetryQuery.data, ticketsQuery.data]);

  const isLoading = telemetryQuery.isLoading || ticketsQuery.isLoading;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Fleet Telemetry</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={NEON_LABEL} />
          <Text style={styles.loadingText}>Calibrating Fleet Radar...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlobalStatusIndicator pilots={pilots} />

          <Text style={styles.sectionLabel}>PILOTS</Text>
          {pilots.length === 0 ? (
            <Text style={styles.emptyText}>No telemetry yet. Pilots will appear when they share status.</Text>
          ) : (
            pilots.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  globalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  globalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  globalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    marginBottom: SPACING.md,
  },
  pilotCard: {
    backgroundColor: SURFACE,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  pilotNameRow: {
    marginBottom: SPACING.sm,
  },
  pilotName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  activeTicketBadge: {
    borderWidth: 1,
    borderColor: STATUS_AMBER,
    backgroundColor: STATUS_AMBER + '18',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  activeTicketBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: STATUS_AMBER,
    letterSpacing: 0.5,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    fontSize: 15,
    color: NEON_LABEL,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  gaugesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gaugeCell: {
    alignItems: 'center',
    minWidth: 52,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ring: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionPanel: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  actionPanelLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: NEON_LABEL,
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: BORDER,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  actionBtnPressed: {
    opacity: 0.9,
  },
  actionBtnIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  actionBtnHint: {
    fontSize: 10,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
