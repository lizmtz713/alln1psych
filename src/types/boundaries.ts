/**
 * Boundaries tool types — Tawwab, Cloud & Townsend, Brené Brown.
 */

export type BoundaryTypeId =
  | 'physical'
  | 'emotional'
  | 'time'
  | 'energy'
  | 'material'
  | 'digital'
  | 'conversational'
  | 'sexual';

export interface BoundaryType {
  id: BoundaryTypeId;
  label: string;
  emoji: string;
  description: string;
}

export type ScriptContext = 'work' | 'family' | 'friends' | 'general';

export interface BoundaryScript {
  id: string;
  title: string;
  contexts: ScriptContext[];
  typeId: BoundaryTypeId;
  soft: string;
  firm: string;
  brokenRecord: string;
}

export interface BoundaryBlock {
  id: string;
  label: string;
  emoji: string;
  description: string;
  howToOvercome: string[];
  affirmation: string;
}

export interface BoundaryMyth {
  id: string;
  myth: string;
  truth: string;
}

export interface BoundaryAssessmentQuestion {
  id: string;
  typeId: BoundaryTypeId;
  text: string;
}

export interface BoundaryAssessmentAnswer {
  questionId: string;
  value: number; // 1-5
}

export interface BoundaryCategoryScore {
  typeId: BoundaryTypeId;
  average: number;
  count: number;
}

export interface BoundaryLogEntry {
  id: string;
  date: string; // ISO
  typeId: BoundaryTypeId;
  scriptUsed?: string;
  note?: string;
}
