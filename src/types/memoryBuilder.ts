/**
 * Memory Builder — types for people met and recall schedule.
 */

export interface MemoryPerson {
  id: string;
  name: string;
  photoUri?: string;
  whereMet?: string;
  detail?: string;
  /** User or suggested association, e.g. "Arctic Alex" */
  association?: string;
  /** Distinctive feature for face encoding */
  distinctiveFeature?: string;
  createdAt: string;
  /** ISO date. Next time we should prompt for recall. */
  nextRecallAt: string;
  /** 0 = just added, 1 = after 1h, 2 = after 1d, 3 = after 3d, 4 = after 1w (done or 2w) */
  recallLevel: number;
}

export type MemoryExerciseId = 'name-lock' | 'face-anchor' | 'association-builder' | 'quick-recall' | 'spaced-reminder' | 'real-life';
