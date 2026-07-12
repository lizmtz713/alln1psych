/**
 * Account isolation — wipe session-scoped local state on sign-out so User B
 * never inherits User A's Cockpit / body-maintenance AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../lib/queryClient';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import { useBodyMaintenanceStore } from '../stores/bodyMaintenanceStore';
import { useAuthStore } from '../stores/authStore';

const unsetGauge = { value: -1, lastUpdated: null, trend: null };

const SESSION_STORAGE_KEYS = [
  'cockpit-storage',
  'body-maintenance',
] as const;

export function clearCockpitSessionState(): void {
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
  useCircleStore.setState({ moodHistory: [] });
}

export function clearBodyMaintenanceSessionState(): void {
  useBodyMaintenanceStore.setState({
    lastDoneByItemId: {},
    customIntervalByItemId: {},
    routines: [],
    providers: [],
  });
}

/** Call on sign-out (and before switching accounts). */
export async function clearSessionLocalState(): Promise<void> {
  clearCockpitSessionState();
  clearBodyMaintenanceSessionState();
  useAuthStore.getState().setUserId(null);
  queryClient.clear();
  await AsyncStorage.multiRemove([...SESSION_STORAGE_KEYS]);
}

export const COCKPIT_GAUGE_KEYS: GaugeKey[] = [
  'body',
  'state',
  'emotion',
  'connection',
  'direction',
  'alignment',
];
