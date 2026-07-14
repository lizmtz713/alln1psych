/**
 * Check-in write path — one authenticated RPC atomically persists the mood header,
 * append-only gauge history, and current momentum snapshot.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryClient as sharedQueryClient } from '../lib/queryClient';
import { moodCheckinsQueryKey } from './useCockpitMoodHydration';
import { BODY_MAINTENANCE_GAUGE_KEY } from './useBodyMaintenanceHydration';
import type { GaugeKey } from '../stores/cockpitStore';
import { TEMPERATURE_LABELS, type Temperature } from '../stores/circleStore';

export type CreateCheckinInput = {
  /** Stable across retries so a lost response cannot create a duplicate check-in. */
  clientEventId: string;
  mood: Temperature;
  moodLabel?: string;
  note?: string | null;
  context?: {
    sleep?: string;
    social?: string;
    stressSource?: string;
    checkInMode?: 'quick_pulse' | 'voice_debrief' | 'weekly_calibration';
    inputSource?: 'explicit' | 'confirmed_unchanged' | 'voice_inferred' | 'wearable_prompted';
    promptVersion?: string;
    inferenceConfidence?: 'low' | 'medium' | 'high' | 'mixed';
    wearableSignalKinds?: string[];
  } | null;
  systemImpact?: GaugeKey[];
  drivers?: string[];
  /** 0–100 snapshots persisted both historically and as the latest state. */
  gauges?: Partial<Record<GaugeKey, number>>;
};

export type MoodCheckinRow = {
  id: string;
  user_id: string;
  mood: string;
  mood_label: string;
  note: string | null;
  created_at: string;
  client_event_id: string;
};

/** Invalidate every query the Cockpit reopen hooks depend on. */
export function invalidateCheckinCaches(userId: string): void {
  void sharedQueryClient.invalidateQueries({ queryKey: moodCheckinsQueryKey(userId) });
  void sharedQueryClient.invalidateQueries({ queryKey: ['mood_checkins'] });
  void sharedQueryClient.invalidateQueries({ queryKey: ['checkin_gauge_values'] });
  void sharedQueryClient.invalidateQueries({ queryKey: ['momentum_state'] });
  void sharedQueryClient.invalidateQueries({
    queryKey: ['momentum_state', BODY_MAINTENANCE_GAUGE_KEY, userId],
  });
}

export function emotionScoreToMood(score: number): Temperature {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export async function createCheckinOnServer(
  userId: string | undefined,
  input: CreateCheckinInput
): Promise<MoodCheckinRow> {
  // Prefer live session over React closure — avoids silent "Not signed in" from stale hooks.
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data } = await supabase.auth.getUser();
    resolvedUserId = data.user?.id;
  }
  if (!resolvedUserId) {
    throw new Error('Not signed in — cannot persist check-in');
  }

  const moodLabel = input.moodLabel ?? TEMPERATURE_LABELS[input.mood];
  const gauges = Object.fromEntries(
    Object.entries(input.gauges ?? {}).filter(
      (entry): entry is [GaugeKey, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0 && entry[1] <= 100
    )
  );

  const { data, error } = await supabase.rpc('create_cockpit_checkin', {
    p_client_event_id: input.clientEventId,
    p_mood: input.mood,
    p_mood_label: moodLabel,
    p_note: input.note ?? null,
    p_gauges: gauges,
    p_context: input.context ?? {},
    p_system_impact: input.systemImpact ?? [],
    p_drivers: input.drivers ?? [],
    p_created_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as MoodCheckinRow | undefined;
  if (!row) throw new Error('Check-in transaction returned no row');
  if (row.user_id !== resolvedUserId) throw new Error('Check-in ownership verification failed');

  // Best-effort legacy temperature sync — never fail the check-in.
  try {
    await supabase
      .from('temperature')
      .update({
        current_temp: input.mood,
        temp_label: moodLabel,
        note: input.note ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', resolvedUserId);
  } catch {
    /* ignore */
  }

  return row;
}

/**
 * Mutation used by Cockpit check-in / mood check-in.
 * onSuccess invalidates useCockpitMoodHydration + momentum_state caches.
 */
export function useCreateCheckin(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCheckinInput) => createCheckinOnServer(userId, input),
    onSuccess: (row) => {
      const id = row.user_id || userId;
      if (!id) return;
      void queryClient.invalidateQueries({ queryKey: moodCheckinsQueryKey(id) });
      void queryClient.invalidateQueries({ queryKey: ['momentum_state'] });
      invalidateCheckinCaches(id);
    },
    onError: (err) => {
      console.error('[useCreateCheckin] failed', err);
    },
  });
}
