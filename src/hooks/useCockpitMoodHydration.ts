/**
 * Server-backed Cockpit reopen: mood_checkins + momentum_state are source of truth.
 * AsyncStorage must not win on mount when the user is authenticated.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../lib/supabase';
import { useCockpitStore, type GaugeKey, type GaugeState } from '../stores/cockpitStore';
import { useCircleStore, TEMPERATURE_LABELS, type Temperature } from '../stores/circleStore';
import {
  clearCockpitSessionState,
  COCKPIT_GAUGE_KEYS,
} from '../services/sessionReset';

export const moodCheckinsQueryKey = (userId: string | undefined) =>
  ['mood_checkins', userId ?? 'anon'] as const;

export const cockpitMomentumQueryKey = (userId: string | undefined) =>
  ['momentum_state', 'cockpit_gauges', userId ?? 'anon'] as const;

function moodToEmotionValue(mood: string): number {
  switch (mood) {
    case 'green':
      return 80;
    case 'yellow':
      return 55;
    case 'orange':
      return 35;
    case 'red':
      return 20;
    default:
      return 50;
  }
}

function gaugeFromScore(score: number, updatedAt: string | null): GaugeState {
  return {
    value: Math.max(0, Math.min(100, Math.round(score))),
    lastUpdated: updatedAt,
    trend: null,
  };
}

type CockpitServerPayload = {
  moodRows: CockpitMoodRow[];
  gauges: Partial<Record<GaugeKey, { score: number; updatedAt: string | null }>>;
};

type CockpitMoodRow = {
  id: string;
  mood: string;
  mood_label: string;
  note: string | null;
  created_at: string;
  checkin_context: Record<string, unknown> | null;
  system_impact: string[] | null;
  drivers: string[] | null;
  checkin_gauge_values: Array<{ gauge_key: string; score: number }> | null;
};

function isGaugeKey(value: string): value is GaugeKey {
  return COCKPIT_GAUGE_KEYS.includes(value as GaugeKey);
}

function historicalGauges(row: CockpitMoodRow): Partial<Record<GaugeKey, number>> {
  const gauges: Partial<Record<GaugeKey, number>> = {};
  for (const gauge of row.checkin_gauge_values ?? []) {
    if (!isGaugeKey(gauge.gauge_key)) continue;
    const score = Number(gauge.score);
    if (!Number.isFinite(score)) continue;
    gauges[gauge.gauge_key] = Math.max(0, Math.min(100, Math.round(score)));
  }
  return gauges;
}

function checkinContext(row: CockpitMoodRow): { sleep?: string; social?: string; stressSource?: string } | null {
  const raw = row.checkin_context;
  if (!raw || typeof raw !== 'object') return null;
  const context = {
    ...(typeof raw.sleep === 'string' ? { sleep: raw.sleep } : {}),
    ...(typeof raw.social === 'string' ? { social: raw.social } : {}),
    ...(typeof raw.stressSource === 'string' ? { stressSource: raw.stressSource } : {}),
  };
  return Object.keys(context).length > 0 ? context : null;
}

async function fetchCockpitServerState(userId: string): Promise<CockpitServerPayload> {
  const since = new Date();
  since.setDate(since.getDate() - 365);

  const [checkinsRes, momentumRes] = await Promise.all([
    supabase
      .from('mood_checkins')
      .select(
        'id, mood, mood_label, note, created_at, checkin_context, system_impact, drivers, checkin_gauge_values(gauge_key, score)'
      )
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false }),
    supabase
      .from('momentum_state')
      .select('gauge_key, score, updated_at')
      .eq('user_id', userId)
      .in('gauge_key', COCKPIT_GAUGE_KEYS),
  ]);

  if (checkinsRes.error) throw new Error(checkinsRes.error.message);
  if (momentumRes.error) throw new Error(momentumRes.error.message);

  const gauges: CockpitServerPayload['gauges'] = {};
  for (const row of momentumRes.data ?? []) {
    const key = row.gauge_key as GaugeKey;
    if (!COCKPIT_GAUGE_KEYS.includes(key)) continue;
    gauges[key] = {
      score: Number(row.score),
      updatedAt: row.updated_at ?? null,
    };
  }

  return { moodRows: (checkinsRes.data ?? []) as CockpitMoodRow[], gauges };
}

/**
 * Fetches mood_checkins + gauge momentum for the signed-in user and hydrates Cockpit.
 * Clears session cockpit state when logged out.
 */
export function useCockpitMoodHydration() {
  const { user, isPasswordRecovery } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  // Never fire Cockpit queries on a half-baked recovery session.
  const enabled = Boolean(userId) && !isPasswordRecovery;

  const query = useQuery({
    queryKey: moodCheckinsQueryKey(userId),
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      if (!userId) {
        return { moodRows: [], gauges: {} } satisfies CockpitServerPayload;
      }
      return fetchCockpitServerState(userId);
    },
  });

  useEffect(() => {
    // Recovery sessions must not touch Cockpit state or fire query teardown loops.
    if (isPasswordRecovery) return;

    if (!userId) {
      clearCockpitSessionState();
      queryClient.removeQueries({ queryKey: ['mood_checkins'] });
      queryClient.removeQueries({ queryKey: ['momentum_state'] });
      return;
    }

    if (!query.isSuccess || !query.data) return;

    const { moodRows, gauges } = query.data;
    const patch: Partial<Record<GaugeKey, GaugeState>> & Record<string, unknown> = {};

    for (const key of COCKPIT_GAUGE_KEYS) {
      const g = gauges[key];
      if (g) patch[key] = gaugeFromScore(g.score, g.updatedAt);
    }

    if (moodRows.length === 0) {
      useCockpitStore.setState({
        ...patch,
        lastCheckInDate: null,
        checkInDates: [],
        checkInContext: null,
        checkInSystemImpact: null,
        checkInDrivers: null,
        lastCheckInSnapshot: null,
        checkInHistory: [],
      });
      useCircleStore.setState({ moodHistory: [] });
      return;
    }

    const checkInDates = Array.from(
      new Set(moodRows.map((r) => r.created_at.slice(0, 10)))
    ).sort();

    const latest = moodRows[0];
    const emotionFromMood = moodToEmotionValue(latest.mood);
    const latestGauges = historicalGauges(latest);
    if (Object.keys(latestGauges).length === 0) latestGauges.emotion = emotionFromMood;
    const latestImpact = (latest.system_impact ?? []).filter(isGaugeKey);
    const latestDrivers = (latest.drivers ?? []).filter((driver) => typeof driver === 'string');

    // Prefer momentum_state emotion when present; else derive from latest mood.
    if (!patch.emotion) {
      patch.emotion = gaugeFromScore(emotionFromMood, latest.created_at);
    }

    useCockpitStore.setState((s) => ({
      ...patch,
      lastCheckInDate: latest.created_at.slice(0, 10),
      checkInDates: checkInDates.slice(-400),
      checkInContext: checkinContext(latest),
      checkInSystemImpact: latestImpact.length > 0 ? latestImpact : null,
      checkInDrivers: latestDrivers.length > 0 ? latestDrivers : null,
      checkInHistory: moodRows.slice(0, 30).map((row) => {
        const gaugesAtCheckin = historicalGauges(row);
        if (Object.keys(gaugesAtCheckin).length === 0) {
          gaugesAtCheckin.emotion = moodToEmotionValue(row.mood);
        }
        const impact = (row.system_impact ?? []).filter(isGaugeKey);
        const drivers = (row.drivers ?? []).filter((driver) => typeof driver === 'string');
        return {
          timestamp: row.created_at,
          systemImpact: impact.length > 0 ? impact : (Object.keys(gaugesAtCheckin) as GaugeKey[]),
          drivers: drivers.length > 0 ? drivers : row.mood_label ? [row.mood_label] : [],
          gauges: gaugesAtCheckin,
        };
      }),
      lastCheckInSnapshot: {
        state: latestGauges.state ?? patch.state?.value ?? (s.state.value >= 0 ? s.state.value : emotionFromMood),
        emotion: latestGauges.emotion ?? patch.emotion?.value ?? emotionFromMood,
        systemImpact: latestImpact.length > 0 ? latestImpact : (Object.keys(latestGauges) as GaugeKey[]),
        drivers: latestDrivers.length > 0 ? latestDrivers : latest.mood_label ? [latest.mood_label] : [],
        timestamp: latest.created_at,
        gauges: latestGauges,
      },
    }));

    useCircleStore.setState({
      moodHistory: moodRows.map((m) => ({
        id: m.id,
        mood: m.mood as Temperature,
        label: m.mood_label || TEMPERATURE_LABELS[(m.mood as Temperature) ?? 'green'],
        note: m.note ?? undefined,
        timestamp: new Date(m.created_at),
      })),
    });
  }, [userId, query.data, query.isSuccess, queryClient, isPasswordRecovery]);

  return query;
}
