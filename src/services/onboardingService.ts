/**
 * Adaptive Onboarding — Level detection, invitations, focus mode.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExperienceLevel, InvitationId, HomeSections } from '../types/onboarding';

const FIRST_LAUNCH_KEY = 'onboarding_first_launch_at';
const INVITATION_SHOWN_KEY = 'onboarding_invitations_shown';
const FOCUS_MODE_KEY = 'onboarding_focus_mode';
const LOW_STATE_EVER_KEY = 'onboarding_low_state_seen';
const LOW_CONNECTION_EVER_KEY = 'onboarding_low_connection_seen';

/** New: <7 check-ins or <3 days; Learning: 7-30; Engaged: 30-100; Power: 100+ */
export function getExperienceLevel(
  checkInCount: number,
  daysSinceInstall: number
): ExperienceLevel {
  if (checkInCount >= 100) return 'power';
  if (checkInCount >= 30) return 'engaged';
  if (checkInCount >= 7) return 'learning';
  if (daysSinceInstall < 3 && checkInCount < 7) return 'new';
  if (checkInCount < 7) return 'new';
  return 'learning';
}

/** Persist first launch date (call once on app open if not set). */
export async function ensureFirstLaunchDate(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    if (existing) return existing;
    const now = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, now);
    return now;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function getDaysSinceInstall(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    if (!raw) return 0;
    const launch = new Date(raw).getTime();
    const days = Math.floor((Date.now() - launch) / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  } catch {
    return 0;
  }
}

/** Invitation trigger config. */
const INVITATION_TRIGGERS: Array<{
  id: InvitationId;
  check: (ctx: {
    checkInCount: number;
    daysSinceInstall: number;
    stateValue: number;
    connectionValue: number;
    hasSeenLowState: boolean;
    hasSeenLowConnection: boolean;
  }) => boolean;
  title: string;
  body: string;
  route: string;
  ctaLabel: string;
}> = [
  {
    id: 'lights-intro',
    check: (ctx) => ctx.checkInCount >= 3,
    title: "You're building a habit",
    body: "Here's your cockpit. Check in when you can — your Lights map grows with you.",
    route: '/(tabs)',
    ctaLabel: 'See my cockpit',
  },
  {
    id: 'quick-reset-intro',
    check: (ctx) => ctx.stateValue >= 0 && ctx.stateValue < 40 && !ctx.hasSeenLowState,
    title: 'State running low?',
    body: 'Quick Reset can help calm your nervous system in a few minutes.',
    route: '/(modals)/quick-reset',
    ctaLabel: 'Try Quick Reset',
  },
  {
    id: 'reach-out-intro',
    check: (ctx) => ctx.connectionValue >= 0 && ctx.connectionValue < 40 && !ctx.hasSeenLowConnection,
    title: 'Connection could use a boost',
    body: 'Reach Out helps you send a quick message or plan a call with someone who matters.',
    route: '/(modals)/reach-out-scaffold',
    ctaLabel: 'Reach out',
  },
  {
    id: 'manual-intro',
    check: (ctx) => ctx.daysSinceInstall >= 7,
    title: 'The Human Manual',
    body: 'Short lessons on emotions, nervous system, and relationships. One a day adds up.',
    route: '/(tabs)/learn',
    ctaLabel: 'Open Manual',
  },
  {
    id: 'rituals-intro',
    check: (ctx) => ctx.daysSinceInstall >= 14,
    title: 'Rituals',
    body: 'Small daily habits that support your gauges. Build your own.',
    route: '/(tabs)/me',
    ctaLabel: 'Explore',
  },
];

export async function getShownInvitationIds(): Promise<Set<InvitationId>> {
  try {
    const raw = await AsyncStorage.getItem(INVITATION_SHOWN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as InvitationId[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export async function markInvitationShown(id: InvitationId): Promise<void> {
  const set = await getShownInvitationIds();
  set.add(id);
  await AsyncStorage.setItem(INVITATION_SHOWN_KEY, JSON.stringify([...set]));
}

export type PendingInvitationPayload = {
  id: InvitationId;
  title: string;
  body: string;
  route: string;
  ctaLabel: string;
};

export async function getPendingInvitation(ctx: {
  checkInCount: number;
  daysSinceInstall: number;
  stateValue: number;
  connectionValue: number;
}): Promise<PendingInvitationPayload | null> {
  try {
    const [shown, hasSeenLowState, hasSeenLowConnection] = await Promise.all([
      getShownInvitationIds(),
      AsyncStorage.getItem(LOW_STATE_EVER_KEY).then((v) => v === '1'),
      AsyncStorage.getItem(LOW_CONNECTION_EVER_KEY).then((v) => v === '1'),
    ]);
    const fullCtx = { ...ctx, hasSeenLowState: !!hasSeenLowState, hasSeenLowConnection: !!hasSeenLowConnection };
    for (const inv of INVITATION_TRIGGERS) {
      if (shown.has(inv.id)) continue;
      if (inv.check(fullCtx)) {
        return { id: inv.id, title: inv.title, body: inv.body, route: inv.route, ctaLabel: inv.ctaLabel };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Call when user has low State (so we don't re-invite quick-reset every time). */
export async function markLowStateSeen(): Promise<void> {
  await AsyncStorage.setItem(LOW_STATE_EVER_KEY, '1');
}

/** Call when user has low Connection (so we don't re-invite reach-out every time). */
export async function markLowConnectionSeen(): Promise<void> {
  await AsyncStorage.setItem(LOW_CONNECTION_EVER_KEY, '1');
}

/** Focus Mode: simplified home (Cockpit + CoPilot + Emergency only when on). */
export async function getFocusMode(): Promise<boolean> {
  const v = await AsyncStorage.getItem(FOCUS_MODE_KEY);
  return v === '1';
}

export async function setFocusMode(on: boolean): Promise<void> {
  await AsyncStorage.setItem(FOCUS_MODE_KEY, on ? '1' : '0');
}

/** Sections to show on home by level, focus mode, and check-in count. */
export function getSectionsForLevel(
  level: ExperienceLevel,
  focusMode: boolean,
  checkInCount: number
): HomeSections {
  if (focusMode) {
    return {
      showCockpit: true,
      showForecast: false,
      showLightsInvite: false,
      showToolsGrid: false,
      showWeeklyInsight: false,
      showWrapped: false,
      showDailyInsight: false,
      showGaugeSuggestions: true,
      toolLimit: 0,
      showDiscovery: false,
      showPsychSays: true,
      showYourLifeToday: true,
    };
  }
  switch (level) {
    case 'new':
      return {
        showCockpit: true,
        showForecast: false,
        showLightsInvite: false,
        showToolsGrid: false,
        showWeeklyInsight: false,
        showWrapped: false,
        showDailyInsight: false,
        showGaugeSuggestions: false,
        toolLimit: 0,
        showDiscovery: false,
        showPsychSays: true,
        showYourLifeToday: false,
      };
    case 'learning':
      return {
        showCockpit: true,
        showForecast: true,
        showLightsInvite: true,
        showToolsGrid: true,
        showWeeklyInsight: false,
        showWrapped: false,
        showDailyInsight: true,
        showGaugeSuggestions: true,
        toolLimit: 2,
        showDiscovery: false,
        showPsychSays: true,
        showYourLifeToday: true,
      };
    case 'engaged':
    case 'power':
      return {
        showCockpit: true,
        showForecast: true,
        showLightsInvite: true,
        showToolsGrid: true,
        showWeeklyInsight: true,
        showWrapped: true,
        showDailyInsight: true,
        showGaugeSuggestions: true,
        toolLimit: 999,
        showDiscovery: true,
        showPsychSays: true,
        showYourLifeToday: true,
      };
    default:
      return getSectionsForLevel('new', false, 0);
  }
}
