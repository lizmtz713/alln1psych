import { useMemo } from 'react';
import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { allHumanManualLessons, type HumanManualLesson } from '../data/humanManual';

export interface SuggestedLesson extends HumanManualLesson {
  /** Why this lesson was suggested (which gauge triggered it) */
  suggestedBecause: GaugeKey[];
}

/**
 * Hook that returns contextually relevant lessons based on current gauge state.
 * 
 * Lessons can specify:
 * - triggerGauges: which gauges trigger this lesson
 * - triggerThreshold: below which value to trigger (default 40)
 * - triggerMode: 'any' (anytime gauges match) or 'stabilization' (only when in stabilization mode)
 */
export function useContextualLessons(): SuggestedLesson[] {
  const body = useCockpitStore(s => s.body);
  const state = useCockpitStore(s => s.state);
  const emotion = useCockpitStore(s => s.emotion);
  const connection = useCockpitStore(s => s.connection);
  const direction = useCockpitStore(s => s.direction);
  const alignment = useCockpitStore(s => s.alignment);
  const systemMode = useCockpitStore(s => s.systemMode);

  const suggestedLessons = useMemo(() => {
    const gauges: Record<GaugeKey, number> = {
      body: body.value,
      state: state.value,
      emotion: emotion.value,
      connection: connection.value,
      direction: direction.value,
      alignment: alignment.value,
    };

    // Check if we have at least one active gauge
    const hasActiveGauge = Object.values(gauges).some(v => v >= 0);
    if (!hasActiveGauge) return [];

    const isStabilization = systemMode === 'stabilization';

    const matches: SuggestedLesson[] = [];

    for (const lesson of allHumanManualLessons) {
      if (!lesson.triggerGauges || lesson.triggerGauges.length === 0) continue;

      // Check mode requirement
      if (lesson.triggerMode === 'stabilization' && !isStabilization) continue;

      const threshold = lesson.triggerThreshold ?? 40;
      
      // Find which trigger gauges are below threshold
      const triggeredBy: GaugeKey[] = [];
      for (const gauge of lesson.triggerGauges) {
        const value = gauges[gauge];
        // Only check if gauge is active (>= 0) and below threshold
        if (value >= 0 && value < threshold) {
          triggeredBy.push(gauge);
        }
      }

      if (triggeredBy.length > 0) {
        matches.push({
          ...lesson,
          suggestedBecause: triggeredBy,
        });
      }
    }

    // Sort by relevance: more trigger matches first, then lower thresholds
    matches.sort((a, b) => {
      // More triggered gauges = more relevant
      if (b.suggestedBecause.length !== a.suggestedBecause.length) {
        return b.suggestedBecause.length - a.suggestedBecause.length;
      }
      // Lower threshold = more urgent
      return (a.triggerThreshold ?? 40) - (b.triggerThreshold ?? 40);
    });

    // Return top 3
    return matches.slice(0, 3);
  }, [body.value, state.value, emotion.value, connection.value, direction.value, alignment.value, systemMode]);

  return suggestedLessons;
}

/**
 * Get a human-readable explanation of why a lesson was suggested.
 */
export function getWhyThisLesson(lesson: SuggestedLesson): string {
  const gaugeNames: Record<GaugeKey, string> = {
    body: 'Body',
    state: 'State',
    emotion: 'Emotion',
    connection: 'Connection',
    direction: 'Direction',
    alignment: 'Alignment',
  };

  if (lesson.suggestedBecause.length === 1) {
    return `Your ${gaugeNames[lesson.suggestedBecause[0]]} gauge is low`;
  }
  
  if (lesson.suggestedBecause.length === 2) {
    return `Your ${gaugeNames[lesson.suggestedBecause[0]]} and ${gaugeNames[lesson.suggestedBecause[1]]} gauges are low`;
  }

  const lastGauge = lesson.suggestedBecause[lesson.suggestedBecause.length - 1];
  const otherGauges = lesson.suggestedBecause.slice(0, -1).map(g => gaugeNames[g]).join(', ');
  return `Your ${otherGauges}, and ${gaugeNames[lastGauge]} gauges are low`;
}
