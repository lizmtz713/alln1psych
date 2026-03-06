/**
 * Contextual Insights — Selection engine + 7-day no-repeat history.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GaugeKey } from '../stores/cockpitStore';
import type { InsightCard, InsightSelection } from '../types/insights';
import { INSIGHT_CARDS } from '../data/insightCards';

const HISTORY_KEY = 'ingauge_insight_last_shown';
const DAYS_NO_REPEAT = 7;

interface LastShownMap {
  [cardId: string]: string; // ISO date
}

async function getLastShown(): Promise<LastShownMap> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as LastShownMap) : {};
  } catch {
    return {};
  }
}

async function recordShown(cardId: string): Promise<void> {
  const map = await getLastShown();
  map[cardId] = new Date().toISOString().slice(0, 10);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(map));
}

function isWithinNoRepeatWindow(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const days = (now.getTime() - d.getTime()) / 86400000;
  return days < DAYS_NO_REPEAT;
}

/** Filter out cards shown in the last 7 days */
async function filterByNoRepeat(cards: InsightCard[]): Promise<InsightCard[]> {
  const lastShown = await getLastShown();
  return cards.filter((c) => {
    const shown = lastShown[c.id];
    return !shown || !isWithinNoRepeatWindow(shown);
  });
}

/** Score card relevance for current gauge state (lower gauge = higher relevance for that gauge) */
function scoreCard(card: InsightCard, gaugeValues: Partial<Record<GaugeKey, number>>): number {
  let score = 0;
  card.gauges.forEach((g) => {
    const v = gaugeValues[g];
    if (v == null || v < 0) return;
    if (v < 35) score += 30;
    else if (v < 50) score += 20;
    else if (v < 65) score += 10;
  });
  return score;
}

/** Select 1–2 insights for home based on current gauges */
export async function selectForHome(
  gaugeValues: Partial<Record<GaugeKey, number>>,
  limit = 2
): Promise<InsightSelection[]> {
  const eligible = await filterByNoRepeat(INSIGHT_CARDS);
  const withScores = eligible.map((card) => ({ card, score: scoreCard(card, gaugeValues) }));
  withScores.sort((a, b) => b.score - a.score);
  const top = withScores.filter((x) => x.score > 0).slice(0, limit);
  if (top.length === 0) {
    const fallback = eligible.slice(0, limit);
    return fallback.map((card) => ({ card }));
  }
  return top.map(({ card }) => ({ card, reason: 'Relevant to your gauges' }));
}

/** Select 2–3 insights for a single gauge (gauge detail page) */
export async function selectForGauge(
  gauge: GaugeKey,
  limit = 3
): Promise<InsightSelection[]> {
  const eligible = await filterByNoRepeat(
    INSIGHT_CARDS.filter((c) => c.gauges.includes(gauge))
  );
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((card) => ({ card }));
}

/** Mark a card as shown (call when user sees it, to enforce 7-day no-repeat) */
export async function markInsightShown(cardId: string): Promise<void> {
  await recordShown(cardId);
}
