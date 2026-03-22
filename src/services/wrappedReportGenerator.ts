/**
 * Life Wrapped — Full report generation (runs Dec 21+ or when unlocked).
 * Builds complete data package, calls edge function for AI insights, builds story cards with dynamic copy.
 * Valley/Peak cards use findBestDay / findHardestDay from real post-flight check-in data.
 */

import { getWrappedProgress } from './wrappedDataCollector';
import { useRitualsStore } from '../stores/ritualsStore';
import { WRAPPED_YEAR, WRAPPED_UNLOCK_DATE } from '../types/wrapped';
import type { WrappedReport, WrappedStoryCard, WrappedInsightsPayload } from '../types/wrapped';
import type { PostFlightEntry } from '../types/rituals';
import { supabase } from '../lib/supabase';

/** Format YYYY-MM-DD as "Jan 15" */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/** Best day = highest dayRating; tie-break by endingScore if present */
export function findBestDay(postFlights: PostFlightEntry[]): { date: string; label: string } | null {
  if (!postFlights.length) return null;
  const withRating = postFlights.filter((e) => e.dayRating != null);
  if (!withRating.length) return null;
  const best = withRating.reduce((a, b) => {
    const aScore = a.dayRating * 100 + (a.endingScore ?? 0);
    const bScore = b.dayRating * 100 + (b.endingScore ?? 0);
    return bScore > aScore ? b : a;
  });
  return { date: best.date, label: formatDateLabel(best.date) };
}

/** Hardest day = lowest dayRating; tie-break by higher weighingScore = worse */
export function findHardestDay(postFlights: PostFlightEntry[]): { date: string; label: string } | null {
  if (!postFlights.length) return null;
  const withRating = postFlights.filter((e) => e.dayRating != null);
  if (!withRating.length) return null;
  const worst = withRating.reduce((a, b) => {
    if (b.dayRating !== a.dayRating) return b.dayRating < a.dayRating ? b : a;
    const aWeight = a.weighingScore ?? 0;
    const bWeight = b.weighingScore ?? 0;
    return bWeight > aWeight ? b : a;
  });
  return { date: worst.date, label: formatDateLabel(worst.date) };
}
const MONTH_EMOJI: Record<number, string> = {
  1: '❄️', 2: '💕', 3: '🌸', 4: '🌷', 5: '🌼', 6: '☀️',
  7: '🏖️', 8: '🌻', 9: '🍂', 10: '🎃', 11: '🦃', 12: '🎄',
};

export async function isWrappedReady(): Promise<boolean> {
  const now = new Date();
  const unlock = new Date(WRAPPED_UNLOCK_DATE);
  return now >= unlock;
}

/** Build a 10-char score bar from value and max (e.g. value=80 max=100 => "████████░░") */
function scoreBar(value: number, max: number): string {
  const pct = max <= 0 ? 0 : Math.min(1, value / max);
  const filled = Math.round(pct * 10);
  return '█'.repeat(filled) + '░".repeat(10 - filled);
}

/** Commitment-level message from total check-ins */
function commitmentMessage(checkIns: number): string {
  if (checkIns >= 300) return \"That's devotion.\";
  if (checkIns >= 100) return \"You"re building something real.";
  if (checkIns >= 50) return "You're building a habit.";
  return 'Every moment counts.";
}

/** Subtitle for check-ins card based on count */
function checkInsSubtitle(checkIns: number): string {
  if (checkIns >= 365) return \"That's a full year of showing up.\";
  if (checkIns >= 100) return "times you showed up';
  if (checkIns >= 1) return 'times you showed up';
  return 'Show up when you can.';
}

export async function generateWrappedReport(): Promise<WrappedReport | null> {
  const ready = await isWrappedReady();
  if (!ready) return null;

  const state = await getWrappedProgress();
  const total =
    state.checkIns + state.journalEntries + state.connectionLogs + state.preFlights + state.postFlights;

  const yearStart = `${WRAPPED_YEAR}-01-01`;
  const postFlights = useRitualsStore.getState().getPostFlightsSince(yearStart);
  const bestDay = findBestDay(postFlights);
  const hardestDay = findHardestDay(postFlights);

  const payload: WrappedInsightsPayload = {
    stats: {
      checkIns: state.checkIns,
      journalEntries: state.journalEntries,
      connectionLogs: state.connectionLogs,
      preFlights: state.preFlights,
      postFlights: state.postFlights,
    },
    scoreBars: {
      checkIns: scoreBar(state.checkIns, 365),
      journalEntries: scoreBar(state.journalEntries, 200),
      connectionLogs: scoreBar(state.connectionLogs, 150),
      preFlights: scoreBar(state.preFlights, 365),
      postFlights: scoreBar(state.postFlights, 365),
    },
    totalMoments: total,
    bestDay: bestDay ?? undefined,
    hardestDay: hardestDay ?? undefined,
  };

  let insights: string[] = [];
  try {
    const { data, error } = await supabase.functions.invoke('generate-wrapped-insights", {
      body: payload,
    });
    if (!error && data?.insights?.length) insights = data.insights as string[];
  } catch (_) {}

  const cards = buildStoryCards(state, total, insights, bestDay, hardestDay);
  return {
    year: WRAPPED_YEAR,
    generatedAt: new Date().toISOString(),
    cards,
    stats: payload.stats,
    insights: insights.length > 0 ? insights : undefined,
    payload,
  };
}

function buildStoryCards(
  state: { checkIns: number; journalEntries: number; connectionLogs: number; preFlights: number; postFlights: number },
  total: number,
  insights: string[],
  bestDay: { date: string; label: string } | null,
  hardestDay: { date: string; label: string } | null
): WrappedStoryCard[] {
  const defaultInsights = [
    { title: \"Growth isn't linear\", subtitle: "You kept going anyway', emoji: '🌱' as const },
    { title: 'Small steps', subtitle: 'Still move you forward', emoji: '👣' as const },
    { title: 'You Are Not Alone.', subtitle: 'We see you', emoji: '🤝' as const },
  ];

  return [
    { id: 'intro', title: 'Your ' + WRAPPED_YEAR, subtitle: 'Life Wrapped', emoji: '✨' },
    {
      id: 'checkins',
      title: 'Check-ins',
      stat: state.checkIns,
      subtitle: checkInsSubtitle(state.checkIns),
      emoji: '🌡️',
      insight: commitmentMessage(state.checkIns),
    },
    {
      id: 'journal',
      title: 'Journal entries',
      stat: state.journalEntries,
      subtitle: 'moments you captured',
      emoji: '📔',
    },
    {
      id: 'connections',
      title: 'Connections logged',
      stat: state.connectionLogs,
      subtitle: 'people you reached',
      emoji: '💬',
    },
    {
      id: 'preflight',
      title: 'Pre-Flights',
      stat: state.preFlights,
      subtitle: 'mornings you started with intention',
      emoji: '☀️',
    },
    {
      id: 'postflight',
      title: 'Post-Flights',
      stat: state.postFlights,
      subtitle: 'nights you reflected',
      emoji: '🌙',
    },
    { id: 'streak', title: 'You showed up', subtitle: 'Every moment counted', emoji: '🔥' },
    {
      id: 'valley',
      title: 'The Valley',
      subtitle: hardestDay
        ? `${hardestDay.label} — your hardest day, and you got through it`
        : 'Your hardest day — and you got through it',
      emoji: '🏔️',
      emotionalLabel: 'The Valley',
    },
    {
      id: 'peak',
      title: 'The Peak',
      subtitle: bestDay ? `${bestDay.label} — your best day this year` : 'Your best day this year',
      emoji: '🌟',
      emotionalLabel: 'The Peak',
    },
    {
      id: 'total',
      title: 'Total moments",
      stat: total,
      subtitle: \"that's your year\",
      emoji: "❤️',
    },
    ...defaultInsights.map((d, i) => ({
      id: `insight${i + 1}`,
      title: d.title,
      subtitle: d.subtitle,
      insight: insights[i] ?? undefined,
      emoji: d.emoji,
    })) as WrappedStoryCard[],
    { id: 'outro', title: 'Thank you', subtitle: 'InGauge · ' + WRAPPED_YEAR, emoji: '🌟' },
    { id: 'end', title: 'See you next year', subtitle: 'Keep wrapping', emoji: '✨' },
  ];
}

export { MONTH_EMOJI };
