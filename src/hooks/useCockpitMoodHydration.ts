/**
 * Server-backed Cockpit reopen: mood_checkins is the source of truth for check-in history.
 * AsyncStorage must not win on mount when the user is authenticated.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { getMoodHistory } from '../services/database';
import { useCockpitStore } from '../stores/cockpitStore';
import { useCircleStore, TEMPERATURE_LABELS, type Temperature } from '../stores/circleStore';

export const moodCheckinsQueryKey = (userId: string | undefined) =>
  ['mood_checkins', userId ?? 'anon'] as const;

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

function clearCockpitCheckInState(): void {
  useCockpitStore.setState({
    lastCheckInDate: null,
    checkInDates: [],
    checkInContext: null,
    checkInSystemImpact: null,
    checkInDrivers: null,
    lastCheckInSnapshot: null,
    checkInHistory: [],
  });
  useCircleStore.setState({ moodHistory: [] });
}

/**
 * Fetches mood_checkins for the signed-in user and hydrates Cockpit + Circle mood history.
 * Disabled / cleared when logged out.
 */
export function useCockpitMoodHydration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: moodCheckinsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return [];
      return getMoodHistory(userId, 365);
    },
  });

  useEffect(() => {
    if (!userId) {
      clearCockpitCheckInState();
      queryClient.removeQueries({ queryKey: ['mood_checkins'] });
      return;
    }

    const rows = query.data;
    if (!rows || rows.length === 0) {
      if (query.isSuccess) {
        // Authenticated with empty server history — do not keep stale AsyncStorage check-ins.
        clearCockpitCheckInState();
      }
      return;
    }

    const checkInDates = Array.from(
      new Set(rows.map((r) => r.created_at.slice(0, 10)))
    ).sort();

    const latest = rows[0];
    const lastCheckInDate = latest.created_at.slice(0, 10);
    const emotionValue = moodToEmotionValue(latest.mood);

    useCockpitStore.setState((s) => ({
      lastCheckInDate,
      checkInDates: checkInDates.slice(-400),
      emotion: {
        value: emotionValue,
        lastUpdated: latest.created_at,
        trend: s.emotion.trend,
      },
      checkInHistory: rows.slice(0, 30).map((r) => ({
        timestamp: r.created_at,
        systemImpact: ['emotion' as const],
        drivers: r.mood_label ? [r.mood_label] : [],
        gauges: { emotion: moodToEmotionValue(r.mood) },
      })),
      lastCheckInSnapshot: {
        state: s.state.value >= 0 ? s.state.value : emotionValue,
        emotion: emotionValue,
        systemImpact: ['emotion'],
        drivers: latest.mood_label ? [latest.mood_label] : [],
        timestamp: latest.created_at,
        gauges: { emotion: emotionValue },
      },
    }));

    useCircleStore.setState({
      moodHistory: rows.map((m) => ({
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
