/**
 * Server-backed Body Maintenance reopen via momentum_state (gauge_key = body_maintenance).
 * Local Zustand remains the UI mutator; React Query is the reopen source of truth.
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../lib/supabase';
import { useBodyMaintenanceStore } from '../stores/bodyMaintenanceStore';
import type { RoutineItem, ServiceProvider } from '../types/bodyMaintenance';
import type { MaintenanceInterval } from '../data/bodyMaintenance';

export const BODY_MAINTENANCE_GAUGE_KEY = 'body_maintenance';

export const bodyMaintenanceQueryKey = (userId: string | undefined) =>
  ['momentum_state', BODY_MAINTENANCE_GAUGE_KEY, userId ?? 'anon'] as const;

export type BodyMaintenanceServerPayload = {
  lastDoneByItemId: Record<string, string>;
  customIntervalByItemId: Record<string, MaintenanceInterval>;
  routines: RoutineItem[];
  providers: ServiceProvider[];
};

function emptyPayload(): BodyMaintenanceServerPayload {
  return {
    lastDoneByItemId: {},
    customIntervalByItemId: {},
    routines: [],
    providers: [],
  };
}

async function fetchBodyMaintenanceState(userId: string): Promise<BodyMaintenanceServerPayload> {
  const { data, error } = await supabase
    .from('momentum_state')
    .select('metadata')
    .eq('user_id', userId)
    .eq('gauge_key', BODY_MAINTENANCE_GAUGE_KEY)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.metadata || typeof data.metadata !== 'object') return emptyPayload();

  const meta = data.metadata as Partial<BodyMaintenanceServerPayload>;
  return {
    lastDoneByItemId: meta.lastDoneByItemId ?? {},
    customIntervalByItemId: meta.customIntervalByItemId ?? {},
    routines: Array.isArray(meta.routines) ? meta.routines : [],
    providers: Array.isArray(meta.providers) ? meta.providers : [],
  };
}

/** Persist current local body-maintenance state to Supabase (call after mutations). */
export async function persistBodyMaintenanceToServer(userId: string): Promise<void> {
  const state = useBodyMaintenanceStore.getState();
  const payload: BodyMaintenanceServerPayload = {
    lastDoneByItemId: state.lastDoneByItemId,
    customIntervalByItemId: state.customIntervalByItemId,
    routines: state.routines,
    providers: state.providers,
  };

  const { error } = await supabase.from('momentum_state').upsert(
    {
      user_id: userId,
      gauge_key: BODY_MAINTENANCE_GAUGE_KEY,
      score: 50,
      metadata: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,gauge_key' }
  );

  if (error) throw new Error(error.message);
}

function clearBodyMaintenanceLocal(): void {
  useBodyMaintenanceStore.setState({
    lastDoneByItemId: {},
    customIntervalByItemId: {},
    routines: [],
    providers: [],
  });
}

/**
 * On mount/reopen: load body maintenance from momentum_state when authenticated.
 * Clears local state when logged out.
 */
export function useBodyMaintenanceHydration() {
  const { user, isPasswordRecovery } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const enabled = Boolean(userId) && !isPasswordRecovery;

  const query = useQuery({
    queryKey: bodyMaintenanceQueryKey(userId),
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return emptyPayload();
      return fetchBodyMaintenanceState(userId);
    },
  });

  useEffect(() => {
    if (isPasswordRecovery) return;
    if (!userId) {
      clearBodyMaintenanceLocal();
      queryClient.removeQueries({ queryKey: ['momentum_state', BODY_MAINTENANCE_GAUGE_KEY] });
      return;
    }
    if (!query.isSuccess || !query.data) return;

    useBodyMaintenanceStore.setState({
      lastDoneByItemId: query.data.lastDoneByItemId,
      customIntervalByItemId: query.data.customIntervalByItemId,
      routines: query.data.routines,
      providers: query.data.providers,
    });
  }, [userId, query.data, query.isSuccess, queryClient, isPasswordRecovery]);

  return query;
}
