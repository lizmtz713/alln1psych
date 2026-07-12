/**
 * Server-backed Cockpit reopen: mood_checkins + momentum_state are source of truth.
 * AsyncStorage must not win on mount when the user is authenticated.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { getMoodHistory } from '../services/database';
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
  moodRows: Awaited<ReturnType<typeof getMoodHistory>>;
  gauges: Partial<Record<GaugeKey, { score: number; updatedAt: string | null }>>;
};

async function fetchCockpitServerState(userId: string): Promise<CockpitServerPayload> {
  const [moodRows, momentumRes] = await Promise.all([
    getMoodHistory(userId, 365),
    supabase
      .from('momentum_state')
      .select('gauge_key, score, updated_at')
      .eq('user_id', userId)
      .in('gauge_key', COCKPIT_GAUGE_KEYS),
  ]);

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

  return { moodRows, gauges };
}

/**
 * Fetches mood_checkins + gauge momentum for the signed-in user and hydrates Cockpit.
 * Clears session cockpit state when logged out.
 */
export function useCockpitMoodHydration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: moodCheckinsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      if (!userId) {
        return { moodRows: [], gauges: {} } satisfies CockpitServerPayload;
      }
      return fetchCockpitServerState(userId);
    },
  });

  useEffect(() => {
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

    // Prefer momentum_state emotion when present; else derive from latest mood.
    if (!patch.emotion) {
      patch.emotion = gaugeFromScore(emotionFromMood, latest.created_at);
    }

    useCockpitStore.setState((s) => ({
      ...patch,
      lastCheckInDate: latest.created_at.slice(0, 10),
      checkInDates: checkInDates.slice(-400),
      checkInHistory: moodRows.slice(0, 30).map((r) => ({
        timestamp: r.created_at,
        systemImpact: ['emotion' as const],
        drivers: r.mood_label ? [r.mood_label] : [],
        gauges: { emotion: moodToEmotionValue(r.mood) },
      })),
      lastCheckInSnapshot: {
        state: (patch.state?.value ?? s.state.value) >= 0 ? (patch.state?.value ?? s.state.value) : emotionFromMood,
        emotion: patch.emotion?.value ?? emotionFromMood,
        systemImpact: ['emotion'],
        drivers: latest.mood_label ? [latest.mood_label] : [],
        timestamp: latest.created_at,
        gauges: {
          emotion: patch.emotion?.value ?? emotionFromMood,
          ...(patch.body ? { body: patch.body.value } : {}),
          ...(patch.state ? { state: patch.state.value } : {}),
          ...(patch.connection ? { connection: patch.connection.value } : {}),
          ...(patch.direction ? { direction: patch.direction.value } : {}),
          ...(patch.alignment ? { alignment: patch.alignment.value } : {}),
        },
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
  }, [userId, query.data, query.isSuccess, queryClient]);

  return query;
}
