/**
 * Check-in write path — persists to mood_checkins (+ optional gauge momentum_state),
 * then invalidates the Cockpit reopen queries so Save → Reopen stays consistent.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryClient as sharedQueryClient } from '../lib/queryClient';
import { moodCheckinsQueryKey } from './useCockpitMoodHydration';
import { BODY_MAINTENANCE_GAUGE_KEY } from './useBodyMaintenanceHydration';
import type { GaugeKey } from '../stores/cockpitStore';
import { TEMPERATURE_LABELS, type Temperature } from '../stores/circleStore';

export type CreateCheckinInput = {
  mood: Temperature;
  moodLabel?: string;
  note?: string | null;
  /** Optional 0–100 gauge snapshots persisted to momentum_state for reopen. */
  gauges?: Partial<Record<GaugeKey, number>>;
};

export type MoodCheckinRow = {
  id: string;
  user_id: string;
  mood: string;
  mood_label: string;
  note: string | null;
  created_at: string;
};

/** Invalidate every query the Cockpit reopen hooks depend on. */
export function invalidateCheckinCaches(userId: string): void {
  void sharedQueryClient.invalidateQueries({ queryKey: moodCheckinsQueryKey(userId) });
  void sharedQueryClient.invalidateQueries({ queryKey: ['mood_checkins'] });
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

async function upsertGaugeMomentum(
  userId: string,
  gauges: Partial<Record<GaugeKey, number>>
): Promise<void> {
  const entries = Object.entries(gauges).filter(
    (entry): entry is [GaugeKey, number] => typeof entry[1] === 'number' && entry[1] >= 0
  );
  if (entries.length === 0) return;

  const now = new Date().toISOString();
  const rows = entries.map(([gauge_key, score]) => ({
    user_id: userId,
    gauge_key,
    score,
    metadata: { source: 'checkin' },
    updated_at: now,
  }));

  const { error } = await supabase
    .from('momentum_state')
    .upsert(rows, { onConflict: 'user_id,gauge_key' });
  if (error) throw new Error(error.message);
}

export async function createCheckinOnServer(
  userId: string,
  input: CreateCheckinInput
): Promise<MoodCheckinRow> {
  const moodLabel = input.moodLabel ?? TEMPERATURE_LABELS[input.mood];
  const { data, error } = await supabase
    .from('mood_checkins')
    .insert({
      user_id: userId,
      mood: input.mood,
      mood_label: moodLabel,
      note: input.note ?? null,
      created_at: new Date().toISOString(),
    })
    .select('id, user_id, mood, mood_label, note, created_at')
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('mood_checkins insert returned no row');

  if (input.gauges && Object.keys(input.gauges).length > 0) {
    await upsertGaugeMomentum(userId, input.gauges);
  }

  // Keep temperature row in sync when present (legacy companion table).
  await supabase
    .from('temperature')
    .update({
      current_temp: input.mood,
      temp_label: moodLabel,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return data as MoodCheckinRow;
}

/**
 * Mutation used by Cockpit check-in / mood check-in.
 * onSuccess invalidates useCockpitMoodHydration + momentum_state caches.
 */
export function useCreateCheckin(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCheckinInput) => {
      if (!userId) throw new Error('Not signed in — cannot persist check-in');
      return createCheckinOnServer(userId, input);
    },
    onSuccess: () => {
      if (!userId) return;
      // CRUCIAL: destroy stale cache so useCockpitMoodHydration refetches server truth
      void queryClient.invalidateQueries({ queryKey: moodCheckinsQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: ['momentum_state'] });
      invalidateCheckinCaches(userId);
    },
  });
}
