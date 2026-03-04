/**
 * Widget data aggregation and sync.
 * Builds WidgetData from stores and pushes to native widget via WidgetBridge.
 * When native iOS widget extension is added, it can read from the same shape (e.g. App Group).
 */

import { updateWidget, refreshWidget, type WidgetGaugeData } from '../native/WidgetBridge';
import { useCockpitStore } from '../stores/cockpitStore';
import { useRitualsStore } from '../stores/ritualsStore';
import { useInsightsStore } from '../stores/insightsStore';
import { useLightsStore } from '../stores/lightsStore';
import { useCircleStore } from '../stores/circleStore';

export interface WidgetData {
  systemScore: number;
  gauges: {
    body: number;
    state: number;
    emotion: number;
    connection: number;
    direction: number;
    alignment: number;
  };
  lastCheckIn: string;
  todayIntention?: string;
  preFlightCompleted: boolean;
  postFlightCompleted: boolean;
  lightsNeedingAttention: number;
  currentStreak: number;
}

function getSystemScore(gauges: WidgetData['gauges']): number {
  const vals = Object.values(gauges).filter((v) => v >= 0);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/**
 * Build current widget data from stores.
 */
export function getWidgetData(): WidgetData {
  const cockpit = useCockpitStore.getState();
  const today = new Date().toISOString().slice(0, 10);
  const preFlight = useRitualsStore.getState().getPreFlightForDate(today);
  const postFlight = useRitualsStore.getState().getPostFlightForDate(today);
  const getEngagementStreak = useInsightsStore.getState().getEngagementStreak;
  const members = useCircleStore.getState().members ?? [];
  const lights = useLightsStore.getState().getLights(members);

  const gauges = {
    body: cockpit.body.value >= 0 ? cockpit.body.value : 0,
    state: cockpit.state.value >= 0 ? cockpit.state.value : 0,
    emotion: cockpit.emotion.value >= 0 ? cockpit.emotion.value : 0,
    connection: cockpit.connection.value >= 0 ? cockpit.connection.value : 0,
    direction: cockpit.direction.value >= 0 ? cockpit.direction.value : 0,
    alignment: cockpit.alignment.value >= 0 ? cockpit.alignment.value : 0,
  };

  const systemScore = getSystemScore(gauges);
  const lastCheckIn = cockpit.lastCheckInDate ?? new Date().toISOString();
  const lightsNeedingAttention = lights.filter((l) => l.status === 'flickering' || l.status === 'dark').length;
  const currentStreak = typeof getEngagementStreak === 'function' ? getEngagementStreak() : 0;

  return {
    systemScore,
    gauges,
    lastCheckIn,
    todayIntention: preFlight?.intention,
    preFlightCompleted: !!preFlight,
    postFlightCompleted: !!postFlight,
    lightsNeedingAttention,
    currentStreak,
  };
}

/**
 * Push current data to the native widget. Call after check-in, pre/post flight, or app background.
 */
export async function updateWidgetData(): Promise<void> {
  const cockpit = useCockpitStore.getState();
  const gaugeData: WidgetGaugeData = {
    body: cockpit.body.value >= 0 ? cockpit.body.value : null,
    state: cockpit.state.value >= 0 ? cockpit.state.value : null,
    emotion: cockpit.emotion.value >= 0 ? cockpit.emotion.value : null,
    connection: cockpit.connection.value >= 0 ? cockpit.connection.value : null,
    direction: cockpit.direction.value >= 0 ? cockpit.direction.value : null,
    alignment: cockpit.alignment.value >= 0 ? cockpit.alignment.value : null,
    lastCheckIn: cockpit.lastCheckInDate ?? new Date().toISOString(),
    insight: cockpit.crossSystemInsight ?? null,
  };
  await updateWidget(gaugeData);
  await refreshWidget();
}
