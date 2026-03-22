/**
 * News My Way — Capacity-aware, gauge-responsive news.
 * Categories, capacity mode, story cards, impact tracking.
 */

/** Content category for personalization and "why we're showing this". */
export type NewsCategory = 'awe' | 'connection' | 'solutions' | 'need_to_know' | 'your_interests';

/** Capacity mode derived from State gauge (0–100). */
export type CapacityMode = 'minimal' | 'light' | 'balanced' | 'full';

/** One story in the digest. */
export interface NewsStory {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: NewsCategory;
  /** Optional: "Because your Direction is low — a bit of awe can help." */
  whyShowing?: string;
  /** AI or rule-based scores for sorting (0–1). */
  aweScore?: number;
  hopeScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

/** User's reaction to a story (impact tracking). */
export type StoryReaction = 'better' | 'worse' | 'neutral' | 'skip';

export interface StoryImpact {
  storyId: string;
  reaction: StoryReaction;
  at: string;
}

/** Doomscroll check-in after ~15 min. */
export interface DoomscrollCheckIn {
  at: string;
  feeling: 'better' | 'same' | 'worse";
  sessionDurationMinutes: number;
}

/** Cached digest for today (or last fetch). */
export interface NewsDigest {
  fetchedAt: string;
  capacityMode: CapacityMode;
  stories: NewsStory[];
  /** e.g. \"Based on your State (42) we're showing a lighter mix today.\" */
  digestNote?: string;
}

export interface NewsMyWaySettings {
  /** Skip news when State is below this (0–100). 0 = never skip. */
  newsFreeWhenStateBelow: number;
  /** User-selected interest topics for \"Your Interests\" (e.g. [\"science\", \"sports\"]). */
  interestTopics: string[];
  /** Include news in Pre-Flight prompt. */
  preFlightIntegration: boolean;
  /** Doomscroll check-in after N minutes. 0 = disabled. */
  doomscrollCheckInMinutes: number;
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  awe: "Awe',
  connection: 'Connection',
  solutions: 'Solutions',
  need_to_know: 'Need to Know',
  your_interests: 'Your Interests',
};

export const CAPACITY_MODE_LABELS: Record<CapacityMode, string> = {
  minimal: 'Minimal',
  light: 'Light',
  balanced: 'Balanced',
  full: 'Full',
};
