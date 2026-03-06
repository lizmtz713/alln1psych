/**
 * Gauge types — Build guide Phase 1.3 / spec alignment.
 * Canonical types for the 6 gauges; cockpitStore uses GaugeKey/GaugeState.
 */

export type GaugeType = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export interface GaugeValue {
  type: GaugeType;
  value: number; // 0-100
  updatedAt: string;
  notes?: string;
}

export interface GaugeGoal {
  type: GaugeType;
  targetValue: number;
  deadline?: string;
  accountability?: string;
}
