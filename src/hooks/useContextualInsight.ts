/**
 * Contextual Insights — React hooks for daily and gauge-scoped insights.
 */

import { useEffect, useState } from 'react';
import { useCockpitStore } from '../stores/cockpitStore';
import type { GaugeKey } from '../stores/cockpitStore';
import type { InsightSelection } from '../types/insights';
import { selectForHome, selectForGauge } from '../services/insightService';

/** Gauge values map for selection (value only, -1 = unset) */
function useGaugeValues(): Partial<Record<GaugeKey, number>> {
  const body = useCockpitStore((s) => s.body.value);
  const state = useCockpitStore((s) => s.state.value);
  const emotion = useCockpitStore((s) => s.emotion.value);
  const connection = useCockpitStore((s) => s.connection.value);
  const direction = useCockpitStore((s) => s.direction.value);
  const alignment = useCockpitStore((s) => s.alignment.value);
  return { body, state, emotion, connection, direction, alignment };
}

/** Home: 1–2 insights based on current gauges, 7-day no-repeat */
export function useDailyInsight(limit = 2): {
  selections: InsightSelection[];
  loading: boolean;
} {
  const gaugeValues = useGaugeValues();
  const [selections, setSelections] = useState<InsightSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    selectForHome(gaugeValues, limit)
      .then((list) => {
        if (!cancelled) setSelections(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    gaugeValues.body,
    gaugeValues.state,
    gaugeValues.emotion,
    gaugeValues.connection,
    gaugeValues.direction,
    gaugeValues.alignment,
    limit,
  ]);

  return { selections, loading };
}

/** Gauge detail: 2–3 insights for the given gauge, 7-day no-repeat */
export function useGaugeInsight(
  gauge: GaugeKey,
  limit = 3
): { selections: InsightSelection[]; loading: boolean } {
  const [selections, setSelections] = useState<InsightSelection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    selectForGauge(gauge, limit)
      .then((list) => {
        if (!cancelled) setSelections(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gauge, limit]);

  return { selections, loading };
}
