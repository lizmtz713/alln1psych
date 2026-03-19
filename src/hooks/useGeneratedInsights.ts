/**
 * useGeneratedInsights — Hook for the Unified Insight Engine.
 * Gathers cockpit, circle, rituals, and optional gauge history, then returns
 * generated insights for the given context (home, gauge detail, post check-in).
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import type { GaugeKey } from '../stores/cockpitStore';
import { useCockpitStore } from '../stores/cockpitStore';
import { useCircleStore } from '../stores/circleStore';
import { useRitualsStore } from '../stores/ritualsStore';
import { useLightsStore } from '../stores/lightsStore';
import { useWinStore } from '../stores/winStore';
import { useSleepStore } from '../stores/sleepStore';
import { useGoalsStore } from '../stores/goalsStore';
import { useHealthStore } from '../stores/healthStore';
import { useUserStore } from '../stores/userStore';
import { useConversationStore } from '../stores/conversationStore';
import { getGaugeHistory } from '../services/crisisPipeline';
import type { GaugeSnapshot } from '../services/crisisPipeline';
import { generateInsights } from '../services/insightEngine';
import type { GeneratedInsight, InsightContext, RecentGoalReflections, InsightHealthContext } from '../types/insights-engine';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Days since most recent connection log */
function getDaysSinceConnection(): number | undefined {
  const state = useLightsStore.getState();
  const lastByMember = state.lastContactByMemberId ?? {};
  const dates = Object.values(lastByMember).filter(Boolean) as string[];
  if (dates.length === 0) return undefined;
  const latest = dates.sort().reverse()[0];
  const d = new Date(latest);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

/** Last 2 weeks of goal reflection themes for Direction/Alignment cause and growth */
function getRecentGoalReflections(): RecentGoalReflections | undefined {
  const { reflections } = useGoalsStore.getState();
  const cutoff = addDays(todayStr(), -14);
  const recent = reflections.filter((r) => r.reflectedAt && r.reflectedAt.slice(0, 10) >= cutoff);
  if (recent.length === 0) return undefined;
  const whatHelped = recent.map((r) => r.whatHelped?.trim()).filter((s): s is string => !!s);
  const whatGotInTheWay = recent.map((r) => r.whatGotInTheWay?.trim()).filter((s): s is string => !!s);
  if (whatHelped.length === 0 && whatGotInTheWay.length === 0) return undefined;
  return { whatHelped, whatGotInTheWay };
}

/** Health/wearable context for Body/State cause (sleep, readiness, HRV) */
async function getInsightHealthContext(): Promise<InsightHealthContext | undefined> {
  const snapshot = useHealthStore.getState().snapshot;
  let lastNightSleepHours: number | undefined = snapshot?.sleep?.lastNight?.duration ?? undefined;
  let readinessScore: number | undefined;
  let hrvMs: number | undefined = snapshot?.heart?.hrv ?? undefined;
  try {
    const { getCachedOuraData } = await import('../services/ouraIntegration');
    const oura = await getCachedOuraData();
    if (oura?.connected) {
      if (lastNightSleepHours == null && oura.sleep?.duration != null) {
        lastNightSleepHours = oura.sleep.duration / 3600;
      }
      const raw = oura.readiness?.score;
      readinessScore = raw !== undefined && raw !== null ? raw : undefined;
      if (hrvMs == null && oura.heart?.hrv != null) hrvMs = oura.heart.hrv;
    }
  } catch {
    // Oura not available
  }
  if (lastNightSleepHours == null && readinessScore == null && hrvMs == null) return undefined;
  return { lastNightSleepHours, readinessScore, hrvMs };
}

/** Aggregate gauge history by day for pattern/timing */
function historyToRecentByDay(history: GaugeSnapshot[]): Array<{ date: string; values: Partial<Record<GaugeKey, number>> }> {
  const byDay = new Map<string, Partial<Record<GaugeKey, number>>>();
  history.forEach((s) => {
    const date = new Date(s.timestamp).toISOString().slice(0, 10);
    const existing = byDay.get(date) ?? {};
    byDay.set(date, {
      ...existing,
      body: s.body >= 0 ? s.body : existing.body,
      state: s.state >= 0 ? s.state : existing.state,
      emotion: s.emotion >= 0 ? s.emotion : existing.emotion,
      connection: s.connection >= 0 ? s.connection : existing.connection,
      direction: s.direction >= 0 ? s.direction : existing.direction,
      alignment: s.alignment >= 0 ? s.alignment : existing.alignment,
    });
  });
  const sorted = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, values]) => ({ date, values }));
  return sorted;
}

export interface UseGeneratedInsightsOptions {
  context: InsightContext;
  /** When context is 'gauge', which gauge to focus on */
  gauge?: GaugeKey;
  /** If true, run engine async with gauge history (slightly slower, richer patterns) */
  withHistory?: boolean;
}

export interface UseGeneratedInsightsResult {
  insights: GeneratedInsight[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGeneratedInsights(
  options: UseGeneratedInsightsOptions
): UseGeneratedInsightsResult {
  const { context, gauge, withHistory = false } = options;
  const [insights, setInsights] = useState<GeneratedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cockpit = useCockpitStore();
  const circleStore = useCircleStore();
  const circleMoodHistory = circleStore.moodHistory;
  const rituals = useRitualsStore();
  const reflections = useGoalsStore((s) => s.reflections);
  // Subscribe to stable state; derive in useMemo to avoid selector-induced re-renders
  const wins = useWinStore((s) => s.wins);
  const sleepByDate = useSleepStore((s) => s.byDate);
  const sleepHealthKitCache = useSleepStore((s) => s.healthKitCache);

  const winsThisWeek = useMemo(() => {
    const weekStart = (() => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1);
      const monday = new Date(d);
      monday.setDate(diff);
      return monday.toISOString().slice(0, 10);
    })();
    return wins.filter((w) => w.createdAt.slice(0, 10) >= weekStart);
  }, [wins]);

  const sleepRecent = useMemo(() => {
    return useSleepStore.getState().getRecent(30);
  }, [sleepByDate, sleepHealthKitCache]);

  const gaugeValues = useMemo(() => {
    return {
      body: cockpit.body.value >= 0 ? cockpit.body.value : undefined,
      state: cockpit.state.value >= 0 ? cockpit.state.value : undefined,
      emotion: cockpit.emotion.value >= 0 ? cockpit.emotion.value : undefined,
      connection: cockpit.connection.value >= 0 ? cockpit.connection.value : undefined,
      direction: cockpit.direction.value >= 0 ? cockpit.direction.value : undefined,
      alignment: cockpit.alignment.value >= 0 ? cockpit.alignment.value : undefined,
    };
  }, [
    cockpit.body.value,
    cockpit.state.value,
    cockpit.emotion.value,
    cockpit.connection.value,
    cockpit.direction.value,
    cockpit.alignment.value,
  ]);

  const gaugeTrends = useMemo(() => ({
    body: cockpit.body.trend ?? undefined,
    state: cockpit.state.trend ?? undefined,
    emotion: cockpit.emotion.trend ?? undefined,
    connection: cockpit.connection.trend ?? undefined,
    direction: cockpit.direction.trend ?? undefined,
    alignment: cockpit.alignment.trend ?? undefined,
  }), [
    cockpit.body.trend,
    cockpit.state.trend,
    cockpit.emotion.trend,
    cockpit.connection.trend,
    cockpit.direction.trend,
    cockpit.alignment.trend,
  ]);

  const runEngine = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const checkInDates = (circleMoodHistory ?? []).map((m) =>
        new Date(m.timestamp).toISOString().slice(0, 10)
      );
      const cutoff = addDays(todayStr(), -90);
      const preFlights = rituals.getPreFlightsSince(cutoff);
      const postFlights = rituals.getPostFlightsSince(cutoff);

      let recentGaugeByDay: Array<{ date: string; values: Partial<Record<GaugeKey, number>> }> | undefined;
      if (withHistory) {
        const history = await getGaugeHistory();
        recentGaugeByDay = historyToRecentByDay(history);
      } else {
        if (postFlights.length >= 2) {
          recentGaugeByDay = postFlights.slice(-7).map((p) => ({
            date: p.date,
            values: {
              state: p.dayRating != null ? p.dayRating * 20 : undefined,
              emotion: p.dayRating != null ? p.dayRating * 20 : undefined,
            },
          })).reverse();
        }
      }

      const recentGoalReflections = getRecentGoalReflections();
      const healthContext = await getInsightHealthContext();

      const user = useUserStore.getState();
      const lifeChapter = user.currentLifeStage?.trim() || undefined;
      const userValues = (user.values?.length ?? 0) > 0 ? user.values : undefined;
      const checkInsToday = checkInDates.filter((d) => d === todayStr()).length;
      const hour = new Date().getHours();
      const energyContext =
        checkInsToday >= 2 || hour >= 21
          ? { checkInsToday, hour }
          : undefined;

      const conv = useConversationStore.getState();
      const lastUserMessage = conv.messages?.filter((m) => m.role === 'user').pop();
      const conversationText =
        lastUserMessage?.content && typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : undefined;

      const circleState = useCircleStore.getState();
      const lastCheckInNote = circleState.moodHistory?.find((e) => e.note?.trim())?.note?.trim();
      const cockpit = useCockpitStore.getState();
      const checkInContextText =
        cockpit.checkInContext &&
        [cockpit.checkInContext.sleep, cockpit.checkInContext.social, cockpit.checkInContext.stressSource]
          .filter(Boolean)
          .join(' ');
      const recentText =
        conversationText ?? lastCheckInNote ?? (checkInContextText?.trim() || undefined);

      const cockpitState = useCockpitStore.getState();
      const recentCheckInHistory = (cockpitState.checkInHistory ?? []).slice(-8).map((h) => ({
        timestamp: h.timestamp,
        systemImpact: h.systemImpact,
        drivers: h.drivers,
        gauges: h.gauges,
      }));

      const input = {
        context,
        gaugeValues,
        gaugeTrends,
        gauge,
        recentGaugeByDay,
        checkInDates,
        daysSinceConnection: getDaysSinceConnection(),
        preFlights: preFlights.map((e) => ({
          date: e.date,
          sleepQuality: e.sleepQuality,
          morningFeeling: e.morningFeeling,
        })),
        postFlights: postFlights.map((e) => ({ date: e.date, dayRating: e.dayRating })),
        winsThisWeek: winsThisWeek.length,
        sleepByDay: sleepRecent.map((s) => ({
          date: s.date,
          hours: s.hours,
          quality: s.quality,
        })),
        recentGoalReflections,
        healthContext,
        lifeChapter,
        userValues,
        energyContext,
        recentText,
        recentCheckInHistory,
        currentDrivers: cockpitState.checkInDrivers ?? null,
        currentSystemImpact: cockpitState.checkInSystemImpact ?? null,
      };

      const result = generateInsights(input);
      setInsights(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    context,
    gauge,
    withHistory,
    gaugeValues,
    gaugeTrends,
    circleMoodHistory,
    rituals.getPreFlightsSince,
    rituals.getPostFlightsSince,
    winsThisWeek,
    sleepRecent,
    reflections.length,
  ]);

  useEffect(() => {
    runEngine();
  }, [runEngine]);

  return { insights, isLoading, error, refetch: runEngine };
}
