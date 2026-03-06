/**
 * Home screen entry point for Weekly Insight — compact card + "See Full Insight".
 * Renders the shareable weekly insight preview; tap opens full screen (formats, share, save).
 */

import React from 'react';
import { WeeklyInsightCard } from '../WeeklyInsightCard';

export function WeeklyInsightPrompt() {
  return <WeeklyInsightCard />;
}
