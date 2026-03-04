/**
 * Flight Log Service — Aggregates check-ins, rituals, conversations, milestones for the journey view.
 */

import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';
import { useRitualsStore } from '../stores/ritualsStore';
import { useConversationSummaryStore } from '../stores/conversationSummaryStore';
import { useInsightsStore } from '../stores/insightsStore';
import type { GaugeKey } from '../stores/cockpitStore';

export interface FlightLogTimelineItem {
  date: string; // YYYY-MM-DD
  type: 'pre_flight' | 'post_flight' | 'check_in' | 'copilot' | 'milestone';
  title: string;
  subtitle?: string;
  milestoneLabel?: string;
}

export interface GaugeJourney {
  key: GaugeKey;
  name: string;
  emoji: string;
  startAvg: number;
  currentAvg: number;
  delta: number;
  isHighlight?: boolean;
}

export interface FlightLogData {
  startedDate: string | null;
  daysSinceStart: number;
  checkInCount: number;
  currentStreak: number;
  systemScoreTrend: number | null; // delta from start to now
  gaugeJourneys: GaugeJourney[];
  timeline: FlightLogTimelineItem[];
}

const GAUGE_META: Record<GaugeKey, { name: string; emoji: string }> = {
  body: { name: 'Body', emoji: '🏃' },
  state: { name: 'State', emoji: '🧘' },
  emotion: { name: 'Emotion', emoji: '❤️' },
  connection: { name: 'Connection', emoji: '👥' },
  direction: { name: 'Direction', emoji: '🧭' },
  alignment: { name: 'Alignment', emoji: '⚖️' },
};

function avgGauge(snapshots: GaugeSnapshot[], key: GaugeKey): number {
  const values = snapshots.map((s) => (s as any)[key]).filter((v: number) => v >= 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function systemScore(snapshots: GaugeSnapshot[]): number | null {
  if (snapshots.length === 0) return null;
  const keys: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  let sum = 0;
  let count = 0;
  snapshots.forEach((s) => {
    keys.forEach((k) => {
      const v = (s as any)[k];
      if (v >= 0) {
        sum += v;
        count++;
      }
    });
  });
  return count === 0 ? null : Math.round(sum / count);
}

/** Build Flight Log data from stores and gauge history */
export async function getFlightLogData(): Promise<FlightLogData> {
  const [gaugeHistory, preFlights, postFlights, summaries, streak] = await Promise.all([
    getGaugeHistory(),
    Promise.resolve(useRitualsStore.getState().preFlightEntries),
    Promise.resolve(useRitualsStore.getState().postFlightEntries),
    Promise.resolve(useConversationSummaryStore.getState().getSummaries()),
    Promise.resolve(useInsightsStore.getState().getEngagementStreak?.() ?? 0),
  ]);

  const allDates = new Set<string>();
  preFlights.forEach((e) => allDates.add(e.date));
  postFlights.forEach((e) => allDates.add(e.date));
  summaries.forEach((s) => allDates.add(s.createdAt.slice(0, 10)));
  const sortedDates = Array.from(allDates).sort().reverse();
  const startedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
  const daysSinceStart = startedDate
    ? Math.floor((Date.now() - new Date(startedDate).getTime()) / 86400000)
    : 0;

  const checkInCount = preFlights.length + postFlights.length + Math.max(0, gaugeHistory.length);
  const currentStreak = streak;

  const timeline: FlightLogTimelineItem[] = [];
  for (const date of sortedDates.slice(0, 60)) {
    const pre = preFlights.find((e) => e.date === date);
    const post = postFlights.find((e) => e.date === date);
    const daySummaries = summaries.filter((s) => s.createdAt.startsWith(date));
    const lines: string[] = [];
    if (pre) lines.push(`☀️ Pre-Flight: Feeling ${pre.morningFeeling}, intention "${(pre.intention || '').slice(0, 30)}${(pre.intention?.length ?? 0) > 30 ? '…' : ''}"`);
    if (post) lines.push(`🌙 Post-Flight: ${post.dayRating}/5. ${post.lettingGo ? post.lettingGo.slice(0, 35) + '…' : '—'}`);
    if (daySummaries.length > 0) {
      const first = daySummaries[0];
      lines.push(`💬 CoPilot: ${(first.title ?? 'Conversation').slice(0, 40)} (${first.messageCount ?? 0} msgs)`);
    }
    if (lines.length > 0) {
      timeline.push({
        date,
        type: pre ? 'pre_flight' : post ? 'post_flight' : 'copilot',
        title: lines[0],
        subtitle: lines.slice(1).join('\n'),
      });
    }
  }

  const n = gaugeHistory.length;
  const startSlice = n >= 4 ? gaugeHistory.slice(0, Math.floor(n / 4)) : gaugeHistory.slice(0, 1);
  const recentSlice = n >= 4 ? gaugeHistory.slice(-Math.floor(n / 4)) : gaugeHistory.slice(-1);
  const gaugeJourneys: GaugeJourney[] = (['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as GaugeKey[]).map(
    (key) => {
      const startAvg = startSlice.length > 0 ? avgGauge(startSlice, key) : 0;
      const currentAvg = recentSlice.length > 0 ? avgGauge(recentSlice, key) : startAvg;
      const delta = currentAvg - startAvg;
      const meta = GAUGE_META[key];
      return {
        key,
        name: meta.name,
        emoji: meta.emoji,
        startAvg,
        currentAvg,
        delta,
        isHighlight: delta >= 20,
      };
    }
  );

  const firstSnap = gaugeHistory[0];
  const lastSnap = gaugeHistory[gaugeHistory.length - 1];
  const systemScoreStart = firstSnap ? systemScore([firstSnap]) : null;
  const systemScoreNow = lastSnap ? systemScore([lastSnap]) : null;
  const systemScoreTrend =
    systemScoreStart != null && systemScoreNow != null ? systemScoreNow - systemScoreStart : null;

  return {
    startedDate,
    daysSinceStart,
    checkInCount,
    currentStreak,
    systemScoreTrend,
    gaugeJourneys,
    timeline: timeline.slice(0, 50),
  };
}
