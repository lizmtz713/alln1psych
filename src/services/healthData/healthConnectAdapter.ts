/**
 * Health Connect (Android) → Canonical health adapter.
 * Placeholder for future Google Health Connect integration.
 * When implemented, fetch data from Health Connect and map to CanonicalPhysiology
 * like healthKitAdapter and ouraAdapter. See docs/WEARABLE-DATA-AUDIT.md.
 */

import type { CanonicalPhysiology } from '../../types/canonicalHealth';

export interface HealthConnectSnapshot {
  connected: boolean;
  lastSynced: string | null; // ISO
  sleepHours: number | null;
  steps: number | null;
  heartRate: number | null;
  hrvMs: number | null;
  // Extend as Health Connect API is implemented
}

/**
 * Map Health Connect snapshot to canonical physiology.
 * Stub: returns empty until Android integration is implemented.
 */
export function healthConnectToCanonical(_snapshot: HealthConnectSnapshot): Partial<CanonicalPhysiology> {
  // TODO: when Health Connect is available:
  // - Request READ permissions for Sleep, Steps, HeartRate, etc.
  // - Fetch daily aggregates
  // - Map to CanonicalPhysiology with source: 'health_connect'
  return {};
}
