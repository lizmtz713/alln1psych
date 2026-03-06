/**
 * Life Wrapped — Easy integration: call these after each action.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  recordCheckIn,
  recordJournalEntry,
  recordConnectionLog,
  recordPreFlight,
  recordPostFlight,
  getWrappedProgress,
  progressPercent,
} from '../services/wrappedDataCollector';
import type { WrappedGaugeSnapshot } from '../types/wrapped';
import type { WrappedCollectionState } from '../types/wrapped';

export function trackCheckIn(gauges?: WrappedGaugeSnapshot): void {
  recordCheckIn(gauges).catch(() => {});
}

export function trackJournalEntry(): void {
  recordJournalEntry().catch(() => {});
}

export function trackConnectionLog(): void {
  recordConnectionLog().catch(() => {});
}

export function trackPreFlight(): void {
  recordPreFlight().catch(() => {});
}

export function trackPostFlight(): void {
  recordPostFlight().catch(() => {});
}

export function useWrappedTracking(): {
  progress: number;
  state: WrappedCollectionState | null;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<WrappedCollectionState | null>(null);

  const refresh = useCallback(async () => {
    const s = await getWrappedProgress();
    setState(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const progress = state ? progressPercent(state) : 0;
  return { progress, state, refresh };
}
