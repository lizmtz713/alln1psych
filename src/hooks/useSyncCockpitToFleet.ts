/**
 * Syncs cockpit gauge values to shared_telemetry (Family Edition) so Ground Control
 * sees Pilot status. Debounced so we don't hammer Supabase on every slider move.
 */

import { useEffect, useRef } from 'react';
import { useCockpitStore } from '../stores/cockpitStore';
import { syncCockpitToSharedTelemetry } from '../services/sharedTelemetrySync';

const DEBOUNCE_MS = 2000;

function getGaugeSnapshot(s: ReturnType<typeof useCockpitStore.getState>) {
  return {
    body: s.body.value,
    state: s.state.value,
    emotion: s.emotion.value,
    connection: s.connection.value,
    direction: s.direction.value,
    alignment: s.alignment.value,
  };
}

export function useSyncCockpitToFleet(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef(getGaugeSnapshot(useCockpitStore.getState()));

  useEffect(() => {
    const scheduleSync = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const state = useCockpitStore.getState();
        prevRef.current = getGaugeSnapshot(state);
        syncCockpitToSharedTelemetry(prevRef.current);
      }, DEBOUNCE_MS);
    };

    const unsub = useCockpitStore.subscribe((state) => {
      const prev = prevRef.current;
      const changed =
        state.body.value !== prev.body ||
        state.state.value !== prev.state ||
        state.emotion.value !== prev.emotion ||
        state.connection.value !== prev.connection ||
        state.direction.value !== prev.direction ||
        state.alignment.value !== prev.alignment;
      if (changed) scheduleSync();
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsub();
    };
  }, []);
}
