/**
 * Habit Tracker — Types for habits, completions, and streaks.
 */

/** Habit type: boolean (done/not), count (e.g. glasses of water), or timer (e.g. minutes meditated) */
export type HabitType = 'boolean' | 'count' | 'timer';

/** Unique id for a habit */
export type HabitId = string;

/** One habit definition */
export interface Habit {
  id: HabitId;
  name: string;
  type: HabitType;
  /** For count: target per day (e.g. 8 glasses). For timer: target minutes. Ignored for boolean. */
  target?: number;
  /** Optional unit label for count/timer (e.g. "glasses", "min") */
  unit?: string;
  /** Optional emoji or icon */
  emoji?: string;
  /** ISO date when habit was created */
  createdAt: string;
  /** ISO date when habit was last updated (name, target, etc.) */
  updatedAt: string;
  /** If true, habit is archived and hidden from today list */
  archived?: boolean;
}

/** A single completion record for a day */
export interface HabitCompletion {
  habitId: HabitId;
  /** Date in YYYY-MM-DD */
  date: string;
  /** For boolean: 1 = done, 0 = skipped/unset. For count: number done. For timer: minutes. */
  value: number;
  /** Optional note */
  note?: string;
  /** When the completion was recorded (ISO) */
  recordedAt: string;
}

/** Streak info for a habit (current and longest) */
export interface HabitStreak {
  habitId: HabitId;
  /** Current consecutive days meeting target */
  current: number;
  /** Longest streak ever for this habit */
  longest: number;
  /** Date of last completion (YYYY-MM-DD) or null */
  lastCompletedDate: string | null;
}
