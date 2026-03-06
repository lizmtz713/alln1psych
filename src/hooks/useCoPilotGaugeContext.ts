/**
 * CoPilot Gauge Context — React hook and non-React getter for Talk system prompt.
 *
 * In prompt builder (non-React):
 *   import { getCoPilotGaugeContext } from '../services/copilotGaugeContext';
 *   const gaugeContext = getCoPilotGaugeContext();
 *
 * In a React component:
 *   import { useCoPilotGaugeContext } from '../hooks/useCoPilotGaugeContext';
 *   const gaugeContext = useCoPilotGaugeContext();
 */

import { useMemo } from 'react';
import { useCockpitStore } from '../stores/cockpitStore';
import { getCoPilotGaugeContext } from '../services/copilotGaugeContext';

/** Call from non-React code (e.g. prompt builder) to get current gauge context string */
export { getCoPilotGaugeContext };

/**
 * React hook: returns the CoPilot gauge context string. Updates when cockpit state changes.
 */
export function useCoPilotGaugeContext(): string {
  const body = useCockpitStore((s) => s.body);
  const state = useCockpitStore((s) => s.state);
  const emotion = useCockpitStore((s) => s.emotion);
  const connection = useCockpitStore((s) => s.connection);
  const direction = useCockpitStore((s) => s.direction);
  const alignment = useCockpitStore((s) => s.alignment);

  return useMemo(
    () => getCoPilotGaugeContext(),
    [body, state, emotion, connection, direction, alignment]
  );
}
