/**
 * Weekly Insight — personalized weekly guidance (theme, gauge focus, circle, archetype, proven strategy).
 */

import type { GaugeKey } from './relationalMemory';

export interface WeeklyInsight {
  id: string;
  /** Display range e.g. "Feb 24 – Mar 2" */
  weekOf: string;
  /** ISO date string when insight was generated */
  generatedAt: string;
  /** Short personalized one-liner for card and header e.g. "As a Catalyst, focus on Connection (dipped to 42). Sarah might need a check-in." */
  personalSummary?: string;

  theme: {
    title: string;
    description: string;
  };

  gaugeFocus: {
    gauge: GaugeKey;
    reason: string;
    target: number;
    practices: string[];
  };

  circleFocus?: {
    memberId: string;
    memberName: string;
    insight: string;
    suggestedAction: string;
  };

  archetypeGuidance: {
    archetype: string;
    strength: string;
    watchOut: string;
    practice: string;
  };

  provenStrategy?: {
    description: string;
    effectiveness: number;
  };
}
