/**
 * The 12 Life Questions — Types for inquiry modules, prompts, exercises,
 * progress, responses, and evolving outputs (Identity Snapshot, Purpose Hypothesis, etc.).
 */

/** Unique id for each of the 12 questions (used in routes and store) */
export type LifeQuestionId =
  | 'identity'
  | 'purpose'
  | 'values'
  | 'strengths'
  | 'fears'
  | 'relationships'
  | 'meaning'
  | 'legacy'
  | 'growth'
  | 'belonging'
  | 'choice'
  | 'story';

/** A single prompt shown to the user (e.g. "Who are you when no one is watching?") */
export interface LifeQuestionPrompt {
  id: string;
  text: string;
  /** Optional sub-prompt or reflection hint */
  hint?: string;
}

/** An exercise within a question module (e.g. "Write three words that describe you") */
export interface LifeQuestionExercise {
  id: string;
  type: 'reflection' | 'list' | 'scale' | 'freeform';
  title: string;
  instruction: string;
  /** For list: placeholder or "List 3–5..." */
  placeholder?: string;
  /** For scale: 1–5 or 1–10 label */
  scaleLabels?: [string, string];
  /** Max items for list type */
  maxItems?: number;
}

/** One of the 12 inquiry modules */
export interface LifeQuestionModule {
  id: LifeQuestionId;
  order: number;
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  prompts: LifeQuestionPrompt[];
  exercises: LifeQuestionExercise[];
  /** Output type this feeds (Identity Snapshot, Purpose Hypothesis, etc.) */
  outputLabel: string;
}

/** User's response to one exercise (stored per questionId + exerciseId) */
export interface LifeQuestionExerciseResponse {
  exerciseId: string;
  /** For list: string[]; for scale: number; for freeform/reflection: string */
  value: string | string[] | number;
  updatedAt: string; // ISO
}

/** User's response set for one question module */
export interface LifeQuestionResponse {
  questionId: LifeQuestionId;
  /** Response per exercise */
  exercises: LifeQuestionExerciseResponse[];
  /** Optional overall reflection */
  reflection?: string;
  updatedAt: string; // ISO
}

/** Progress for the 12 questions (which are started/completed) */
export interface LifeQuestionsProgress {
  /** Question id -> completed at (ISO) or undefined if not completed */
  completed: Partial<Record<LifeQuestionId, string>>;
  /** Question id -> last started at (ISO) */
  started: Partial<Record<LifeQuestionId, string>>;
}

/** Evolving outputs derived from responses (for Human Profile / Journey Map) */
export interface IdentitySnapshot {
  questionIds: LifeQuestionId[];
  summary: string;
  /** 3–5 keywords from identity question */
  keywords: string[];
  updatedAt: string;
}

export interface PurposeHypothesis {
  questionIds: LifeQuestionId[];
  statement: string;
  updatedAt: string;
}

export interface LifeBlueprint {
  questionIds: LifeQuestionId[];
  /** Short themes or pillars */
  pillars: string[];
  updatedAt: string;
}

/** Legacy statement derived from the legacy question (one-line impact, tombstone, etc.) */
export interface LegacyStatement {
  questionIds: LifeQuestionId[];
  /** Primary one-line legacy (e.g. from "Legacy in one line" exercise) */
  oneLine?: string;
  /** Tombstone test (three words or one line) */
  tombstone?: string;
  updatedAt: string;
}

/** Combined Human Profile (all 12) */
export interface HumanProfile {
  identitySnapshot?: IdentitySnapshot;
  purposeHypothesis?: PurposeHypothesis;
  lifeBlueprint?: LifeBlueprint;
  /** Legacy-specific output from Life Question #8 (legacy) */
  legacyStatement?: LegacyStatement;
  /** All question responses for map and profile */
  responses: LifeQuestionResponse[];
  updatedAt: string;
}
