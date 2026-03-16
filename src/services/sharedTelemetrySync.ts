/**
 * Shared Telemetry Sync — Family Edition
 * Pushes current cockpit gauge status (green/amber/red) to shared_telemetry
 * so Ground Control can see Pilot status. Privacy Curtain: only status, no raw values.
 */

import { supabase } from '../lib/supabase';
import type { GaugeKey } from '../stores/cockpitStore';

const GAUGE_KEYS: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

/** Map 0–100 cockpit value to fleet status. */
export function valueToStatus(value: number): 'green' | 'amber' | 'red' {
  if (value >= 60) return 'green';
  if (value >= 30) return 'amber';
  return 'red';
}

export interface CockpitGaugeSnapshot {
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

/**
 * Upsert current gauge status into shared_telemetry for the current user (pilot_id).
 * Only rows for gauges with value >= 0 are written. Silently no-ops if not signed in.
 */
export async function syncCockpitToSharedTelemetry(snapshot: CockpitGaugeSnapshot): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows: { pilot_id: string; gauge_type: GaugeKey; status: 'green' | 'amber' | 'red'; probabilistic_insight: string | null }[] = [];

  for (const key of GAUGE_KEYS) {
    const value = snapshot[key];
    if (value < 0) continue;
    rows.push({
      pilot_id: user.id,
      gauge_type: key,
      status: valueToStatus(value),
      probabilistic_insight: null,
    });
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('shared_telemetry')
    .upsert(rows, { onConflict: 'pilot_id,gauge_type' });

  if (error && __DEV__) {
    console.warn('[sharedTelemetrySync]', error.message);
  }
}
