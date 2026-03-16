/**
 * Drivers by gauge — Life factors that map to the 6 gauges.
 * Tap-to-select in quick log; no typing. Used for pattern detection and action suggestions.
 */

import type { DriversByGauge, DriverOption } from '../types/drivers';

export const DRIVERS_BY_GAUGE: DriversByGauge = {
  body: [
    { id: 'body-sleep', label: 'Sleep', gauge: 'body' },
    { id: 'body-health', label: 'Health', gauge: 'body' },
    { id: 'body-nutrition', label: 'Nutrition', gauge: 'body' },
    { id: 'body-movement', label: 'Movement', gauge: 'body' },
    { id: 'body-medication', label: 'Medication', gauge: 'body' },
  ],
  connection: [
    { id: 'conn-family', label: 'Family', gauge: 'connection' },
    { id: 'conn-friends', label: 'Friends', gauge: 'connection' },
    { id: 'conn-partner', label: 'Partner', gauge: 'connection' },
    { id: 'conn-community', label: 'Community', gauge: 'connection' },
    { id: 'conn-work-people', label: 'Work relationships', gauge: 'connection' },
  ],
  direction: [
    { id: 'dir-work', label: 'Work', gauge: 'direction' },
    { id: 'dir-tasks', label: 'Tasks', gauge: 'direction' },
    { id: 'dir-overload', label: 'Task switching / overload', gauge: 'direction' },
    { id: 'dir-education', label: 'Education', gauge: 'direction' },
    { id: 'dir-money', label: 'Money', gauge: 'direction' },
    { id: 'dir-goals', label: 'Goals', gauge: 'direction' },
  ],
  alignment: [
    { id: 'align-values', label: 'Values', gauge: 'alignment' },
    { id: 'align-identity', label: 'Identity', gauge: 'alignment' },
    { id: 'align-purpose', label: 'Purpose', gauge: 'alignment' },
    { id: 'align-spirituality', label: 'Spirituality', gauge: 'alignment' },
  ],
  state: [
    { id: 'state-sleep', label: 'Sleep', gauge: 'state' },
    { id: 'state-caffeine', label: 'Caffeine', gauge: 'state' },
    { id: 'state-stress', label: 'Stress', gauge: 'state' },
    { id: 'state-distraction', label: 'Distraction / focus', gauge: 'state' },
  ],
  emotion: [
    { id: 'emotion-relationships', label: 'Relationships', gauge: 'emotion' },
    { id: 'emotion-work', label: 'Work', gauge: 'emotion' },
    { id: 'emotion-uncertainty', label: 'Uncertainty', gauge: 'emotion' },
  ],
};

/** Flat list of all drivers for "What's influencing this?" picker. */
export const ALL_DRIVERS: DriverOption[] = Object.values(DRIVERS_BY_GAUGE).flat();
