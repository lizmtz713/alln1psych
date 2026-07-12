/**
 * Account isolation — fail-safe session purge for sign-out.
 * Never throws. Never blocks the UI on network or AsyncStorage failures.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../lib/queryClient';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import { useBodyMaintenanceStore } from '../stores/bodyMaintenanceStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

const unsetGauge = { value: -1, lastUpdated: null, trend: null };

const SESSION_STORAGE_KEYS = ['cockpit-storage', 'body-maintenance'] as const;

/** Synchronous in-memory resets only — safe to call from finally / AuthSync. */
export function clearCockpitSessionState(): void {
  try {
    useCockpitStore.setState({
      body: { ...unsetGauge },
      state: { ...unsetGauge },
      emotion: { ...unsetGauge },
      connection: { ...unsetGauge },
      direction: { ...unsetGauge },
      alignment: { ...unsetGauge },
      lastCheckInDate: null,
      checkInDates: [],
      checkInContext: null,
      checkInSystemImpact: null,
      checkInDrivers: null,
      lastCheckInSnapshot: null,
      checkInHistory: [],
      crossSystemInsight: null,
      systemMode: 'capacity',
      stabilizationTriggers: [],
      centerScore: 0,
      bodyDataSource: null,
      stateDataSource: null,
    });
  } catch {
    /* never block logout */
  }
  try {
    useCircleStore.setState({ moodHistory: [] });
  } catch {
    /* never block logout */
  }
}

export function clearBodyMaintenanceSessionState(): void {
  try {
    useBodyMaintenanceStore.setState({
      lastDoneByItemId: {},
      customIntervalByItemId: {},
      routines: [],
      providers: [],
    });
  } catch {
    /* never block logout */
  }
}

/** Memory-only wipe used by AuthSync when session becomes null (no AsyncStorage I/O). */
export function resetUserScopedStoresInMemory(): void {
  try {
    useAuthStore.getState().setUserId(null);
  } catch {
    /* ignore */
  }
  try {
    useUserStore.setState({ profileHydrated: false });
  } catch {
    /* ignore */
  }
  clearCockpitSessionState();
  clearBodyMaintenanceSessionState();
  try {
    queryClient.clear();
  } catch {
    /* ignore */
  }
}

/**
 * Persist wipe — isolated so a missing/empty key never crashes the logout chain.
 */
export function wipeSessionAsyncStorage(): void {
  try {
    void AsyncStorage.multiRemove([...SESSION_STORAGE_KEYS]).catch(() => {
      /* key already empty / storage unavailable — ignore */
    });
  } catch {
    /* ignore */
  }
}

/**
 * Full local destruction for the sign-out `finally` block.
 * Synchronous store resets + fire-and-forget AsyncStorage (never awaited).
 */
export function destroyLocalSessionState(): void {
  resetUserScopedStoresInMemory();
  wipeSessionAsyncStorage();
}

/** @deprecated Prefer destroyLocalSessionState — kept for call-site compatibility. */
export async function clearSessionLocalState(): Promise<void> {
  destroyLocalSessionState();
}

export const COCKPIT_GAUGE_KEYS: GaugeKey[] = [
  'body',
  'state',
  'emotion',
  'connection',
  'direction',
  'alignment',
];
