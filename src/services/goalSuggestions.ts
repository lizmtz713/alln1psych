/**
 * Goal suggestions — Rule-based options by life area for AI Goal Builder.
 * Can be replaced or augmented with LLM later.
 */

import type { DirectionArea } from '../types/goals';
import type { GaugeKey } from '../types/goals';

const SUGGESTIONS_BY_AREA: Record<DirectionArea | string, { title: string; intent: string; gauges: GaugeKey[] }[]> = {
  Health: [
    { title: 'Walk 5,000 steps daily', intent: 'Improve physical energy', gauges: ['body', 'state'] },
    { title: 'Exercise 3 times per week', intent: 'Build strength and mood', gauges: ['body', 'state', 'emotion'] },
    { title: 'Sleep before 11pm', intent: 'Support recovery and focus', gauges: ['body', 'state'] },
    { title: 'Stretch 5 minutes each morning', intent: 'Ease tension and wake up', gauges: ['body', 'state'] },
  ],
  Career: [
    { title: 'Block 1 hour for deep work daily', intent: 'Protect focus time', gauges: ['direction', 'state'] },
    { title: 'Review priorities each Monday', intent: 'Stay aligned with direction', gauges: ['direction', 'alignment'] },
    { title: 'One learning session per week', intent: 'Grow skills', gauges: ['direction', 'emotion'] },
  ],
  Relationships: [
    { title: 'Reach out to one person weekly', intent: 'Nurture connection', gauges: ['connection', 'emotion'] },
    { title: 'One quality conversation per day', intent: 'Deepen relationships', gauges: ['connection'] },
    { title: 'Check in with inner circle weekly', intent: 'Keep bonds strong', gauges: ['connection', 'direction'] },
  ],
  Learning: [
    { title: 'Read 20 minutes daily', intent: 'Build knowledge', gauges: ['direction', 'state'] },
    { title: 'One new skill practice per week', intent: 'Grow capability', gauges: ['direction'] },
    { title: 'Reflect on one lesson weekly', intent: 'Integrate learning', gauges: ['alignment', 'direction'] },
  ],
  Money: [
    { title: 'Review spending weekly', intent: 'Stay aware', gauges: ['direction'] },
    { title: 'One step toward financial goal monthly', intent: 'Steady progress', gauges: ['direction', 'state'] },
  ],
  'Personal growth': [
    { title: 'Daily intention setting', intent: 'Align with values', gauges: ['alignment', 'direction'] },
    { title: '5 minutes reflection before bed', intent: 'Process the day', gauges: ['emotion', 'alignment'] },
    { title: 'One boundary practice per week', intent: 'Protect energy', gauges: ['state', 'alignment'] },
  ],
  Other: [
    { title: 'One small step toward your focus', intent: 'Make progress', gauges: ['direction'] },
    { title: 'Check in with yourself daily', intent: 'Stay aware', gauges: ['state', 'emotion'] },
  ],
};

export function getSuggestionsForArea(
  lifeArea: DirectionArea | string,
  _progressLookLike?: string,
  _barrier?: string
): { title: string; intent: string; gauges: GaugeKey[] }[] {
  const list = SUGGESTIONS_BY_AREA[lifeArea] ?? SUGGESTIONS_BY_AREA.Other;
  return list.slice(0, 4);
}
