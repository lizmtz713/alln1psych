/**
 * Contextual Insights (Human Manual) — Types for insight cards.
 */

import type { GaugeKey } from '../stores/cockpitStore';

export type InsightCardStyle = 'fact' | 'quote' | 'question';

export interface InsightCard {
  id: string;
  title: string;
  body: string;
  /** 1–2 gauges this insight supports */
  gauges: GaugeKey[];
  /** Full lesson route (e.g. /lesson/nervous-system-basics) for "Learn more" */
  lessonId?: string;
  /** Optional tool route for "Try tool" CTA */
  toolRoute?: string;
  toolLabel?: string;
  style: InsightCardStyle;
  /** Optional citation */
  source?: string;
}

export interface InsightSelection {
  card: InsightCard;
  /** Why this was selected (e.g. "State is low") */
  reason?: string;
}
