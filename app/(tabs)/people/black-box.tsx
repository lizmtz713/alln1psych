/**
 * Black Box (Trend Radar) — Family Edition
 * Route: /(tabs)/people/black-box
 *
 * 30-day view of Post-Flight fuel (and patterns). Ground Control or self-view.
 * Data from post_flight_logs.fuel_remaining. Privacy: own data or fleet by RLS.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Rect } from 'react-native-svg';

import { supabase } from '../../../src/lib/supabase';
import { SPACING, BORDER_RADIUS } from '../../../src/lib/constants';

const BG = '#0f172a';
const SURFACE = '#1e293b';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#f8fafc';
const TEXT_MUTED = 'rgba(248,250,252,0.6)';
const CYAN = '#06b6d4';
const GREEN = '#34D399';
const YELLOW = '#FBBF24';
const RED = '#F87171';

const CHART_HEIGHT = 120;
const BAR_GAP = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PAD = 24;
const AVAIL_WIDTH = SCREEN_WIDTH - CHART_PAD * 2;
const NUM_DAYS = 30;
const BAR_WIDTH = Math.max(4, (AVAIL_WIDTH - (NUM_DAYS - 1) * BAR_GAP) / NUM_DAYS);

function getBarColor(avg: number): string {
  if (avg >= 60) return GREEN;
  if (avg >= 40) return YELLOW;
  return RED;
}

export default function BlackBoxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: currentUser } = useQuery({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['post_flight_logs_blackbox', currentUser],
    queryFn: async (): Promise<{ fuel_remaining: number; created_at: string }[]> => {
      const since = new Date(Date.now() - NUM_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data, error: e } = await supabase
        .from('post_flight_logs')
        .select('fuel_remaining, created_at')
        .eq('pilot_id', currentUser!)
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      if (e) throw e;
      return (data ?? []) as { fuel_remaining: number; created_at: string }[];
    },
    enabled: !!currentUser,
  });

  const dayBuckets = useMemo(() => {
    const buckets: Record<string, number[]> = {};
    const today = new Date().toDateString();
    for (let i = 0; i < NUM_DAYS; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (NUM_DAYS - 1 - i));
      buckets[d.toDateString()] = [];
    }
    logs.forEach((log) => {
      const day = new Date(log.created_at).toDateString();
      if (buckets[day]) buckets[day].push(log.fuel_remaining);
    });
    const ordered: { date: string; avg: number; count: number }[] = [];
    for (let i = 0; i < NUM_DAYS; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (NUM_DAYS - 1 - i));
      const key = d.toDateString();
      const arr = buckets[key] ?? [];
      const avg = arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : -1;
      ordered.push({ date: key, avg: Math.round(avg), count: arr.length });
    }
    return ordered;
  }, [logs]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const hasAnyData = dayBuckets.some((d) => d.avg >= 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Black Box</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Fuel (Post-Flight) — Last 30 days</Text>
        <Text style={styles.hint}>Evening debrief fuel level. Spot patterns (e.g. low on Sundays).</Text>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={CYAN} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Could not load trend data.</Text>
          </View>
        ) : !hasAnyData ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Post-Flight data yet.</Text>
            <Text style={styles.emptySub}>Complete evening debriefs to see your trend.</Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/tools/post-flight-logger'); }}
            >
              <Text style={styles.emptyBtnText}>Post-Flight Debrief</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.chartWrap}>
            <View style={styles.chartRow}>
              <Text style={styles.yLabel}>100</Text>
              <Svg width={AVAIL_WIDTH} height={CHART_HEIGHT} style={styles.svg}>
                {dayBuckets.map((d, i) => {
                  const h = d.avg >= 0 ? (d.avg / 100) * (CHART_HEIGHT - 8) : 0;
                  const y = CHART_HEIGHT - h - 4;
                  return (
                    <Rect
                      key={d.date}
                      x={i * (BAR_WIDTH + BAR_GAP)}
                      y={y}
                      width={BAR_WIDTH}
                      height={Math.max(2, h)}
                      fill={d.avg >= 0 ? getBarColor(d.avg) : BORDER}
                      rx={2}
                    />
                  );
                })}
              </Svg>
            </View>
            <View style={styles.xLabels}>
              <Text style={styles.xLabel}>30d ago</Text>
              <Text style={styles.xLabel}>now</Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
                <Text style={styles.legendText}>Strong</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: YELLOW }]} />
                <Text style={styles.legendText}>Watch</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: RED }]} />
                <Text style={styles.legendText}>Needs attention</Text>
              </View>
            </View>
          </View>
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
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  subtitle: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: 4 },
  hint: { fontSize: 13, color: TEXT_MUTED, marginBottom: SPACING.xl },
  centered: { paddingVertical: SPACING.xxl, alignItems: 'center' },
  errorText: { fontSize: 15, color: TEXT_MUTED },
  emptyWrap: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', marginBottom: SPACING.lg },
  emptyBtn: { backgroundColor: CYAN, paddingVertical: 12, paddingHorizontal: 24, borderRadius: BORDER_RADIUS.lg },
  emptyBtnText: { fontSize: 15, fontWeight: '600', color: BG },
  chartWrap: { marginTop: SPACING.md },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end' },
  yLabel: { fontSize: 10, color: TEXT_MUTED, width: 28, marginRight: 4 },
  svg: { marginLeft: 0 },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 0,
  },
  xLabel: { fontSize: 10, color: TEXT_MUTED },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: SPACING.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: TEXT_MUTED },
});
