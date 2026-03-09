/**
 * Smart Notifications — pattern learning, quiet hours, frequency limits, priority.
 * Schedules local notifications with deep-link data; respects user preferences.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PATTERN_KEY = '@ingauge/notification_patterns';
const SENT_TODAY_KEY = '@ingauge/notifications_sent_today';
const LAST_SENT_KEY = '@ingauge/notifications_last_sent';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SmartNotificationType =
  | 'checkin_reminder'
  | 'gauge_alert'
  | 'circle_alert'
  | 'drift_warning'
  | 'streak_celebration'
  | 'trend_positive'
  | 'pattern_insight'
  | 'gentle_reconnect';

export type NotificationFrequency = 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly';

export interface QuietHours {
  startHour: number; // 0-23, e.g. 22 = 10pm
  startMinute: number;
  endHour: number;   // e.g. 8 = 8am
  endMinute: number;
}

export interface NotificationTypeConfig {
  enabled: boolean;
  priority: NotificationPriority;
}

export interface SmartNotificationSettings {
  quietHours: QuietHours;
  frequency: NotificationFrequency;
  smartTiming: boolean;
  maxPerDay: number;
  minHoursBetween: number;
  types: Record<SmartNotificationType, NotificationTypeConfig>;
}

const DEFAULT_QUIET_HOURS: QuietHours = {
  startHour: 22,
  startMinute: 0,
  endHour: 8,
  endMinute: 0,
};

export const DEFAULT_SMART_SETTINGS: SmartNotificationSettings = {
  quietHours: DEFAULT_QUIET_HOURS,
  frequency: 'daily',
  smartTiming: true,
  maxPerDay: 4,
  minHoursBetween: 2,
  types: {
    checkin_reminder: { enabled: true, priority: 'high' },
    gauge_alert: { enabled: true, priority: 'high' },
    circle_alert: { enabled: true, priority: 'urgent' },
    drift_warning: { enabled: true, priority: 'high' },
    streak_celebration: { enabled: true, priority: 'medium' },
    trend_positive: { enabled: true, priority: 'low' },
    pattern_insight: { enabled: true, priority: 'low' },
    gentle_reconnect: { enabled: true, priority: 'medium' },
  },
};

// —— Pattern learning (app opens, check-ins) ——
export interface PatternEntry {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  timestamp: number;
}

async function getStoredPatterns(): Promise<{ appOpens: PatternEntry[]; checkIns: PatternEntry[] }> {
  try {
    const raw = await AsyncStorage.getItem(PATTERN_KEY);
    if (!raw) return { appOpens: [], checkIns: [] };
    const parsed = JSON.parse(raw);
    return {
      appOpens: Array.isArray(parsed.appOpens) ? parsed.appOpens : [],
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
    };
  } catch {
    return { appOpens: [], checkIns: [] };
  }
}

async function savePatterns(patterns: { appOpens: PatternEntry[]; checkIns: PatternEntry[] }): Promise<void> {
  const trimmed = {
    appOpens: patterns.appOpens.slice(-200),
    checkIns: patterns.checkIns.slice(-200),
  };
  await AsyncStorage.setItem(PATTERN_KEY, JSON.stringify(trimmed));
}

/** Call when app is opened (e.g. from AppState 'active'). */
export async function recordAppOpen(): Promise<void> {
  const now = new Date();
  const entry: PatternEntry = {
    date: now.toISOString().slice(0, 10),
    hour: now.getHours(),
    minute: now.getMinutes(),
    timestamp: now.getTime(),
  };
  const { appOpens, checkIns } = await getStoredPatterns();
  appOpens.push(entry);
  await savePatterns({ appOpens, checkIns });
}

/** Call when user completes a check-in. */
export async function recordCheckIn(): Promise<void> {
  const now = new Date();
  const entry: PatternEntry = {
    date: now.toISOString().slice(0, 10),
    hour: now.getHours(),
    minute: now.getMinutes(),
    timestamp: now.getTime(),
  };
  const { appOpens, checkIns } = await getStoredPatterns();
  checkIns.push(entry);
  await savePatterns({ appOpens, checkIns });
}

/** Get preferred hour for notifications from learned pattern (median of check-in or app-open hours). */
export async function getLearnedBestHour(): Promise<number> {
  const { appOpens, checkIns } = await getStoredPatterns();
  const source = checkIns.length >= 5 ? checkIns : appOpens;
  if (source.length === 0) return 9;
  const hours = source.map((e) => e.hour + e.minute / 60).sort((a, b) => a - b);
  const mid = Math.floor(hours.length / 2);
  const median = hours.length % 2 ? hours[mid] : (hours[mid - 1] + hours[mid]) / 2;
  return Math.max(8, Math.min(21, Math.round(median)));
}

// —— Quiet hours & frequency ——
function isWithinQuietHours(now: Date, quiet: QuietHours): boolean {
  const min = now.getHours() * 60 + now.getMinutes();
  const startMin = quiet.startHour * 60 + quiet.startMinute;
  const endMin = quiet.endHour * 60 + quiet.endMinute;
  if (startMin > endMin) {
    return min >= startMin || min < endMin;
  }
  return min >= startMin && min < endMin;
}

async function getSentTodayCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SENT_TODAY_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return date === today ? count : 0;
  } catch {
    return 0;
  }
}

async function getLastSentTime(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SENT_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

async function incrementSentToday(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const count = await getSentTodayCount();
  await AsyncStorage.setItem(SENT_TODAY_KEY, JSON.stringify({ date: today, count: count + 1 }));
  await AsyncStorage.setItem(LAST_SENT_KEY, String(Date.now()));
}

/** Check if we're allowed to send (quiet hours, max per day, min interval). Uses in-memory settings. */
export async function canSendNow(settings: SmartNotificationSettings): Promise<boolean> {
  const now = new Date();
  if (isWithinQuietHours(now, settings.quietHours)) return false;
  const sent = await getSentTodayCount();
  if (sent >= settings.maxPerDay) return false;
  const last = await getLastSentTime();
  if (last && (now.getTime() - last) / (60 * 60 * 1000) < settings.minHoursBetween) return false;
  return true;
}

// —— Scheduling (uses Expo Notifications) ——
export interface NotificationPayload {
  type: SmartNotificationType;
  screen?: string;
  title: string;
  body: string;
  data?: Record<string, string | number | undefined>;
}

/** Schedule a one-time local notification at a specific date. Returns identifier or null. */
export async function scheduleSmartNotification(
  payload: NotificationPayload,
  triggerDate: Date,
  settings: SmartNotificationSettings
): Promise<string | null> {
  if (!(await canSendNow(settings))) return null;
  const typeConfig = settings.types[payload.type];
  if (!typeConfig?.enabled) return null;
  if (isWithinQuietHours(triggerDate, settings.quietHours)) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: {
        type: payload.type,
        screen: payload.screen ?? getDefaultScreenForType(payload.type),
        ...payload.data,
      },
      badge: 1,
    },
    trigger: { date: triggerDate, type: 'date' } as Notifications.NotificationTriggerInput,
  });
  await incrementSentToday();
  return id;
}

function getDefaultScreenForType(type: SmartNotificationType): string {
  switch (type) {
    case 'checkin_reminder':
    case 'gauge_alert':
    case 'trend_positive':
    case 'gentle_reconnect':
      return '/(modals)/cockpit-checkin';
    case 'circle_alert':
      return '/(tabs)/circle';
    case 'drift_warning':
      return '/(tabs)/people';
    case 'streak_celebration':
    case 'pattern_insight':
      return '/(tabs)/index';
    default:
      return '/(tabs)/index';
  }
}

/** Cancel all scheduled notifications with the given type. */
export async function cancelByType(type: SmartNotificationType): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as { type?: string })?.type === type) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/** Cancel all smart notifications (any type from our types). */
export async function cancelAllSmartNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ourTypes: SmartNotificationType[] = [
    'checkin_reminder',
    'gauge_alert',
    'circle_alert',
    'drift_warning',
    'streak_celebration',
    'trend_positive',
    'pattern_insight',
    'gentle_reconnect',
  ];
  for (const n of scheduled) {
    const type = (n.content.data as { type?: string })?.type;
    if (type && ourTypes.includes(type as SmartNotificationType)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

// —— Content builders for each type (call from app when evaluating what to schedule) ——
export function buildCheckinReminderPayload(daysSince: number): NotificationPayload {
  return {
    type: 'checkin_reminder',
    screen: '/(modals)/cockpit-checkin',
    title: "It's been a while 💛",
    body: daysSince >= 2 ? `It's been ${daysSince} days since you checked in. How are you doing?` : 'Quick check-in?',
    data: { daysSince },
  };
}

export function buildGaugeAlertPayload(gaugeLabel: string, daysLow: number): NotificationPayload {
  return {
    type: 'gauge_alert',
    screen: '/(modals)/gauge-detail',
    title: `${gaugeLabel} could use attention`,
    body: `Your ${gaugeLabel} has been below 40 for ${daysLow} days. Tap to see what might help.`,
    data: { gauge: gaugeLabel.toLowerCase(), daysLow },
  };
}

export function buildCircleAlertPayload(memberName: string): NotificationPayload {
  return {
    type: 'circle_alert',
    screen: '/(tabs)/circle',
    title: `${memberName} could use a check-in 💛`,
    body: "Their gauges have been low. A quick message could mean a lot.",
    data: { memberName },
  };
}

export function buildStreakCelebrationPayload(streakDays: number): NotificationPayload {
  return {
    type: 'streak_celebration',
    screen: '/(tabs)/index',
    title: `${streakDays}-day streak! 🔥`,
    body: "You're showing up for yourself. Keep it going!",
    data: { streakDays },
  };
}

export function buildTrendPositivePayload(): NotificationPayload {
  return {
    type: 'trend_positive',
    screen: '/(tabs)/index',
    title: "You're trending up this week! 📈",
    body: "Your gauges are looking better. Psych has noticed.",
    data: {},
  };
}

export function buildPatternInsightPayload(insight: string): NotificationPayload {
  return {
    type: 'pattern_insight',
    screen: '/(tabs)/index',
    title: 'A little insight 💡',
    body: insight,
    data: {},
  };
}

export function buildDriftWarningPayload(
  personName: string,
  normalRhythmDays: number,
  daysSinceContact: number,
  personId?: string
): NotificationPayload {
  return {
    type: 'drift_warning',
    screen: personId ? `/(tabs)/people?hero=${encodeURIComponent(personId)}` : '/(tabs)/people',
    title: `${personName} is drifting`,
    body: `You usually talk every ${normalRhythmDays} days. It's been ${daysSinceContact} days. Want to reconnect?`,
    data: { personName, personId: personId ?? '', normalRhythmDays, daysSinceContact },
  };
}

export function buildGentleReconnectPayload(daysAway: number): NotificationPayload {
  return {
    type: 'gentle_reconnect',
    screen: '/(tabs)/index',
    title: "Hey, we miss you 💜",
    body: daysAway >= 5 ? `It's been ${daysAway} days. No pressure — we're here when you're ready.` : "We're here when you need us.",
    data: { daysAway },
  };
}

/** Get next trigger time: today or tomorrow at preferred hour, outside quiet hours. */
async function getNextTriggerTime(settings: SmartNotificationSettings): Promise<Date> {
  const hour = settings.smartTiming ? await getLearnedBestHour() : 9;
  const now = new Date();
  let trigger = new Date(now);
  trigger.setHours(hour, 0, 0, 0);
  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }
  while (isWithinQuietHours(trigger, settings.quietHours)) {
    trigger.setHours(trigger.getHours() + 1, 0, 0, 0);
  }
  return trigger;
}

/**
 * Evaluate app state and schedule smart notifications when conditions are met.
 * Call from app on open/foreground (throttled). Uses stores via dynamic require.
 */
export async function evaluateAndScheduleSmartNotifications(): Promise<void> {
  let settings: SmartNotificationSettings;
  try {
    const { useNotificationSettingsStore } = require('../stores/notificationSettingsStore');
    settings = useNotificationSettingsStore.getState();
  } catch {
    return;
  }
  if (!(await canSendNow(settings))) return;

  const trigger = await getNextTriggerTime(settings);
  const today = new Date().toISOString().slice(0, 10);

  try {
    const cockpit = require('../stores/cockpitStore').useCockpitStore.getState();
    const lastCheckIn = cockpit.lastCheckInDate;
    const daysSinceCheckIn = lastCheckIn
      ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / (24 * 60 * 60 * 1000))
      : 999;
    if (settings.types.checkin_reminder?.enabled && daysSinceCheckIn >= 2) {
      const payload = buildCheckinReminderPayload(daysSinceCheckIn);
      await scheduleSmartNotification(payload, trigger, settings);
      return;
    }
  } catch {
    // ignore
  }

  try {
    const circle = require('../stores/circleStore').useCircleStore.getState();
    const members = circle.members ?? [];
    const lowMember = members.find(
      (m: { temperature?: string }) => m?.temperature === 'orange' || m?.temperature === 'red'
    );
    const memberName = lowMember?.name;
    if (settings.types.circle_alert?.enabled && memberName) {
      const payload = buildCircleAlertPayload(memberName);
      await scheduleSmartNotification(payload, trigger, settings);
      return;
    }
  } catch {
    // ignore
  }

  try {
    if (settings.types.drift_warning?.enabled) {
      const { useLightsStore } = require('../stores/lightsStore');
      const { getDriftWarning } = require('./friendshipMaintenance');
      const members = require('../stores/circleStore').useCircleStore.getState().members ?? [];
      const getLights = useLightsStore.getState().getLights;
      const lights = getLights(Array.isArray(members) ? members : []);
      const drift = getDriftWarning(lights);
      if (drift) {
        const payload = buildDriftWarningPayload(
          drift.light.name,
          drift.normalRhythmDays,
          drift.daysSinceContact,
          drift.light.id
        );
        await scheduleSmartNotification(payload, trigger, settings);
        return;
      }
    }
  } catch {
    // ignore
  }

  try {
    const education = require('../stores/educationStore').useEducationStore.getState();
    const streak = education?.streakDays ?? 0;
    if (settings.types.streak_celebration?.enabled && streak > 0 && streak % 7 === 0) {
      const payload = buildStreakCelebrationPayload(streak);
      await scheduleSmartNotification(payload, trigger, settings);
      return;
    }
  } catch {
    // ignore
  }

  try {
    const cockpit = require('../stores/cockpitStore').useCockpitStore.getState();
    const lastCheckIn = cockpit.lastCheckInDate;
    const daysAway = lastCheckIn
      ? Math.floor((Date.now() - new Date(lastCheckIn).getTime()) / (24 * 60 * 60 * 1000))
      : 0;
    if (settings.types.gentle_reconnect?.enabled && daysAway >= 5) {
      const payload = buildGentleReconnectPayload(daysAway);
      await scheduleSmartNotification(payload, trigger, settings);
    }
  } catch {
    // ignore
  }
}
