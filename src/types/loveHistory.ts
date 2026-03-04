/**
 * Love History — data model and enums.
 * Local-only; see docs/ingauge-LOVE-HISTORY-FEATURE.md.
 */

export const RELATIONSHIP_TYPES = [
  'crush',
  'kiss',
  'fling',
  'situationship',
  'dating',
  'relationship',
  'engaged',
  'married',
  'divorced',
] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** For teens (13–17), only these types are shown. */
export const RELATIONSHIP_TYPES_TEEN: RelationshipType[] = ['crush', 'dating', 'relationship'];

export const ENDING_TYPES = [
  'mutual',
  'ghosted',
  'grew-apart',
  'cheating',
  'moved-away',
  'wrong-timing',
  'other',
] as const;
export type EndingType = (typeof ENDING_TYPES)[number];

export interface RelationshipEntry {
  id: string;
  name: string | null; // null when isAnonymous
  type: RelationshipType;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string | null; // null = current
  durationMonths: number | null;
  howItEnded: EndingType | null;
  howItEndedOther?: string;
  lessons: string[];
  notes: string;
  /** 18+ only; 0–100 or undefined */
  intimacyLevel?: number;
  skillsDeveloped: string[];
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
}

export interface LovePattern {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface LoveHistoryStats {
  total: number;
  longestMonths: number;
  marriages: number;
  currentStatus: 'single' | 'in-relationship' | 'complicated' | 'unknown';
}

export type CurrentStatus = LoveHistoryStats['currentStatus'];
