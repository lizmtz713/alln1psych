/**
 * Lights — Relationship dashboard types
 * Lights = relationships; brightness = closeness (Dunbar tiers); temperature = how they're doing
 */

import type { TimelineEventEntry } from './timeline';

export type LightTier = 'five' | 'fifteen' | 'fifty' | 'network' | 'archived';

/** Temperature for Lights metaphor: warm = doing well, neutral = could use support, cool = hard time */
export type LightTemperature = 'warm' | 'neutral' | 'cool' | 'unknown';

/** Person temperature state (human system load): stable, broad — not granular emotion. */
export type PersonTemperatureState = 'thriving' | 'good' | 'busy' | 'stressed' | 'needs_support';

export type LightStatus = 'healthy' | 'flickering' | 'dark';

/** Mood when logging how a connection felt */
export type ConnectionMood = 'great' | 'good' | 'okay' | 'hard' | 'other';

export interface ConnectionEntry {
  id: string;
  date: Date;
  type: 'text' | 'call' | 'video' | 'in-person' | 'social' | 'mind-mail' | 'other';
  note?: string;
  duration?: number; // minutes
  quality?: 'brief' | 'meaningful' | 'deep';
  /** How it felt (CRM) */
  mood?: ConnectionMood | string;
  /** What you talked about */
  summary?: string;
  /** Follow-ups to remember (e.g. "Ask about her interview") */
  followUps?: string[];
}

export interface SharedTemperature {
  value: number; // 0-100
  label: LightTemperature;
  note?: string;
  sharedAt: Date;
}

export interface Light {
  id: string;
  userId: string;

  // Core
  name: string;
  photo?: string;
  tier: LightTier;

  // Contact info (from Apple Contacts)
  contactId?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUri?: string; // Local URI from contacts
  photoUrl?: string; // Uploaded to storage (for sync)

  // Relationship
  relationshipType: string;
  howWeMet?: string;
  metDate?: Date;

  // Know them better (CRM)
  birthday?: string;
  loveLanguage?: string;
  loveLanguageNotes?: string;
  whatTheyNeed?: string;
  bestWayToConnect?: string;
  howTheyOperate?: string;
  howTheyShowLove?: string;
  /** Conflict / communication style (e.g. "Direct but calm") */
  conflictStyle?: string;
  notes?: string;
  /** Insights saved from Relate tool */
  relateInsights?: string[];
  /** Key dates: anniversary (ISO date string) */
  anniversary?: string;
  giftIdeas?: string[];
  pastGifts?: string[];
  favoritesSizes?: string;
  family?: string;
  interests?: string;
  values?: string;
  /** Who they are */
  job?: string;
  skills?: string;
  hobbies?: string;
  lifeStage?: string;
  location?: string;
  languages?: string;
  /** Stored drive time in minutes (optional) */
  driveTimeMinutes?: number;
  /** First memory: when you met (timeline shows "You met") */
  relationshipOrigin?: { year: number; note?: string };

  // InGauge integration
  linkedUserId?: string;
  canSeeTemperature: boolean;
  sharedTemperature?: SharedTemperature;

  // Connection tracking
  lastContactDate?: Date;
  connectionLog: ConnectionEntry[];
  averageContactDays?: number;

  // Computed
  brightness: number;
  temperature: LightTemperature;
  temperatureLabel: string;
  /** Five-state person temperature (overrides/extends circle temp when set). */
  personTemperatureState?: PersonTemperatureState;
  /** Optional context for temperature (e.g. "Heavy work week", "Traveling"). */
  temperatureReason?: string;
  /** AI or manual suggestion (e.g. "Short encouraging message"). */
  temperatureSuggestedSupport?: string;
  status: LightStatus;
  daysSinceContact: number;
  /** 0–100 from momentum engine; when set, drives status label and Hero ranking */
  momentumScore?: number;
  /** Relationship season (affects decay, hero, Constellation) */
  season?: 'growth' | 'active' | 'dormant' | 'archived';
  /** Life context override: e.g. life_transition (moving, new job, new parent) → season can shift to dormant without implying the relationship is weakening */
  relationshipContext?: 'life_transition';
  /** Stored timeline events (reconnection, milestone, etc.) — attached in getLights */
  timelineEvents?: TimelineEventEntry[];

  // Meta
  createdAt: Date;
  updatedAt: Date;
}

/** Map 0-100 value to warm / neutral / cool (Lights metaphor) */
export const LIGHT_TEMPERATURE_SCALE = {
  warm: { min: 67, max: 100, color: '#FF9500', kelvin: '2700K', label: 'Doing well' },
  neutral: { min: 34, max: 66, color: '#FFD60A', kelvin: '3500K', label: 'Could use some love' },
  cool: { min: 0, max: 33, color: '#64D2FF', kelvin: '5000K', label: 'Having a hard time' },
} as const;

/** Days without contact before a light "flickers" by tier */
export const FLICKER_DAYS: Record<Exclude<LightTier, 'archived'>, number> = {
  five: 7,
  fifteen: 14,
  fifty: 30,
  network: 90,
};

/** Brightness % by tier (Dunbar) */
export const TIER_BRIGHTNESS: Record<LightTier, number> = {
  five: 100,
  fifteen: 75,
  fifty: 50,
  network: 25,
  archived: 0,
};

export const TIER_LABELS: Record<LightTier, string> = {
  five: 'Your 5',
  fifteen: 'Your 15',
  fifty: 'Your 50',
  network: 'Your 150',
  archived: 'Archived',
};

export function valueToLightTemperature(value: number): LightTemperature {
  if (value >= 67) return 'warm';
  if (value >= 34) return 'neutral';
  if (value >= 0) return 'cool';
  return 'unknown';
}

export function getLightTemperatureLabel(temp: LightTemperature): string {
  return LIGHT_TEMPERATURE_SCALE[temp === 'unknown' ? 'neutral' : temp]?.label ?? 'Unknown';
}
