/**
 * Focus Tool — Types for timer presets, focus sessions, and attention exercises.
 */

/** Preset focus durations in minutes */
export type FocusPresetMinutes = 5 | 15 | 25 | 45;

/** Attention training exercise id */
export type FocusExerciseId =
  | 'breath'
  | 'point'
  | 'body-scan'
  | 'listening'
  | 'thought-noting';

/** A completed focus session (timer only) */
export interface FocusSession {
  id: string;
  durationMinutes: number;
  completedAt: string; // ISO
  /** Actual seconds spent in session (may be less if user ended early) */
  completedSeconds?: number;
}

/** A completed attention exercise */
export interface FocusExerciseSession {
  id: string;
  exerciseId: FocusExerciseId;
  completedAt: string; // ISO
  durationSeconds: number;
}
