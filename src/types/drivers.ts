/**
 * Drivers — Life factors that influence state (Apple-style "Associations" mapped to InGauge system).
 * STATE → SYSTEM IMPACT → DRIVERS → ACTIONS → INSIGHTS
 * Used for quick log, check-in context, and pattern detection.
 */

import type { GaugeKey } from '../stores/cockpitStore';

/** One driver (influence) — belongs to a gauge category. */
export interface DriverOption {
  id: string;
  label: string;
  gauge: GaugeKey;
}

/** Drivers grouped by gauge for tap-to-select UI. */
export type DriversByGauge = Record<GaugeKey, DriverOption[]>;

/** Result of a quick log: state + which gauges impacted + which drivers. */
export interface QuickLogEntry {
  stateLabel: string;
  stateValue: number;       // 0-100
  emotionValue: number;     // 0-100, derived from state
  systemImpact: GaugeKey[]; // which parts of system feel affected
  driverIds: string[];
  loggedAt: string;        // ISO
}
