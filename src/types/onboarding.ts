/**
 * Adaptive Onboarding - Experience levels, invitations, focus mode.
 */

export type ExperienceLevel = 'new' | 'learning' | 'engaged' | 'power';

export type InvitationId =
  | 'lights-intro'
  | 'quick-reset-intro'
  | 'reach-out-intro'
  | 'manual-intro'
  | 'rituals-intro';

export interface FeatureInvitation {
  id: InvitationId;
  title: string;
  body: string;
  route: string;
  ctaLabel: string;
}

export interface HomeSections {
  showCockpit: boolean;
  showForecast: boolean;
  showLightsInvite: boolean;
  showToolsGrid: boolean;
  showWeeklyInsight: boolean;
  showWrapped: boolean;
  showDailyInsight: boolean;
  showGaugeSuggestions: boolean;
  toolLimit: number;
  showDiscovery: boolean;
  showPsychSays: boolean;
  /** Daily Anchors: "Your Life Today" (System Check + Connection Prompt) */
  showYourLifeToday: boolean;
}
