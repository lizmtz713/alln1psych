/**
 * Gauge-Triggered Tools — React hook for suggestions from cockpit state.
 */

import { useMemo } from 'react';
import { useCockpitStore } from '../stores/cockpitStore';
import type { GaugeKey } from '../stores/cockpitStore';
import {
  getToolSuggestions,
  hasAnyGaugeData,
  type GaugeSnapshot,
  type ToolSuggestion,
} from '../services/toolSuggestionService';

export interface UseToolSuggestionsOptions {
  limit?: number;
  /** When set, only show when this gauge (or any) has data */
  requireGaugeData?: boolean;
}

export function useToolSuggestions(options: UseToolSuggestionsOptions = {}): {
  suggestions: ToolSuggestion[];
  hasGaugeData: boolean;
  shouldShow: boolean;
} {
  const { limit = 5, requireGaugeData = true } = options;

  const body = useCockpitStore((s) => s.body);
  const state = useCockpitStore((s) => s.state);
  const emotion = useCockpitStore((s) => s.emotion);
  const connection = useCockpitStore((s) => s.connection);
  const direction = useCockpitStore((s) => s.direction);
  const alignment = useCockpitStore((s) => s.alignment);

  const gauges = useMemo(
    (): Partial<Record<GaugeKey, GaugeSnapshot>> => ({
      body: body.value >= 0 ? { value: body.value, trend: body.trend } : undefined,
      state: state.value >= 0 ? { value: state.value, trend: state.trend } : undefined,
      emotion: emotion.value >= 0 ? { value: emotion.value, trend: emotion.trend } : undefined,
      connection: connection.value >= 0 ? { value: connection.value, trend: connection.trend } : undefined,
      direction: direction.value >= 0 ? { value: direction.value, trend: direction.trend } : undefined,
      alignment: alignment.value >= 0 ? { value: alignment.value, trend: alignment.trend } : undefined,
    }),
    [body, state, emotion, connection, direction, alignment]
  );

  const hasGaugeData = useMemo(() => hasAnyGaugeData(gauges), [gauges]);
  const suggestions = useMemo(() => getToolSuggestions(gauges, { limit }), [gauges, limit]);
  const shouldShow = requireGaugeData ? hasGaugeData && suggestions.length > 0 : suggestions.length > 0;

  return { suggestions, hasGaugeData, shouldShow };
}

/** For a single-gauge context (e.g. gauge detail page) */
export function useToolSuggestionsForGauge(
  gauge: GaugeKey,
  value: number,
  trend: 'improving' | 'stable' | 'declining' | null,
  limit = 3
): ToolSuggestion[] {
  return useMemo(() => {
    const snap: GaugeSnapshot = { value, trend };
    const gauges: Partial<Record<GaugeKey, GaugeSnapshot>> = { [gauge]: snap };
    return getToolSuggestions(gauges, { limit, focusGauge: gauge });
  }, [gauge, value, trend, limit]);
}
