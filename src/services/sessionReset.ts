/**
 * Account isolation — fail-safe session purge for sign-out.
 * Never throws. Never blocks the UI on network or AsyncStorage failures.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { queryClient } from '../lib/queryClient';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import { useBodyMaintenanceStore } from '../stores/bodyMaintenanceStore';
import { resetAllUserScopedStoresInMemory } from '../stores/storeRegistry';

const unsetGauge = { value: -1, lastUpdated: null, trend: null };

const LEGACY_SECRET_KEYS = ['openai_api_key', 'oura_access_token'] as const;

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
      suggestedActionsTaken: [],
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
  resetAllUserScopedStoresInMemory();
  try {
    queryClient.clear();
  } catch {
    /* ignore */
  }
}

/**
 * Persist wipe — isolated so a missing/empty key never crashes the logout chain.
 */
export async function wipeSessionDeviceStorage(): Promise<void> {
  await Promise.allSettled([
    AsyncStorage.clear(),
    ...LEGACY_SECRET_KEYS.map((key) => SecureStore.deleteItemAsync(key)),
  ]);
}

/**
 * Full local destruction for the sign-out `finally` block.
 * Synchronous store resets + fire-and-forget AsyncStorage (never awaited).
 */
export function destroyLocalSessionState(): void {
  resetUserScopedStoresInMemory();
  void wipeSessionDeviceStorage().finally(resetUserScopedStoresInMemory);
}

/** Awaitable variant for an explicit sign-out or permanent account deletion. */
export async function destroyLocalSessionStateAsync(): Promise<void> {
  resetUserScopedStoresInMemory();
  await wipeSessionDeviceStorage();
  // Persist middleware may finish an in-flight hydration while storage is being
  // cleared, so reset once more after the wipe closes that race.
  resetUserScopedStoresInMemory();
}

/** @deprecated Prefer destroyLocalSessionState — kept for call-site compatibility. */
export async function clearSessionLocalState(): Promise<void> {
  await destroyLocalSessionStateAsync();
}

export const COCKPIT_GAUGE_KEYS: GaugeKey[] = [
  'body',
  'state',
  'emotion',
  'connection',
  'direction',
  'alignment',
];
