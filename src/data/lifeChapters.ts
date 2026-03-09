/**
 * Life Chapters — Meaning layer (narrative identity).
 * Humans regulate identity through life stories; chapters shape how we interpret gauges and transitions.
 * See docs/HUMAN-OS-FIVE-LAYERS.md.
 */

export interface LifeChapterOption {
  id: string;
  label: string;
  shortLabel: string;
  /** Optional: which gauges are often in flux during this chapter */
  gaugesOftenAffected?: string[];
}

/** Canonical life chapters for user selection (Me/Onboarding) and insight context */
export const LIFE_CHAPTERS: LifeChapterOption[] = [
  { id: 'new-parent', label: 'New parent', shortLabel: 'New parent', gaugesOftenAffected: ['connection', 'body', 'direction'] },
  { id: 'career-transition', label: 'Career transition', shortLabel: 'Career transition', gaugesOftenAffected: ['direction', 'alignment', 'state'] },
  { id: 'recovery', label: 'Recovery', shortLabel: 'Recovery', gaugesOftenAffected: ['body', 'state', 'emotion'] },
  { id: 'building-independence', label: 'Building independence', shortLabel: 'Building independence', gaugesOftenAffected: ['direction', 'connection'] },
  { id: 'relationship-change', label: 'Relationship change', shortLabel: 'Relationship change', gaugesOftenAffected: ['connection', 'emotion', 'alignment'] },
  { id: 'loss-or-grief', label: 'Loss or grief', shortLabel: 'Loss or grief', gaugesOftenAffected: ['emotion', 'connection', 'direction'] },
  { id: 'health-challenge', label: 'Health challenge', shortLabel: 'Health challenge', gaugesOftenAffected: ['body', 'state', 'emotion'] },
  { id: 'identity-exploration', label: 'Identity exploration', shortLabel: 'Identity exploration', gaugesOftenAffected: ['direction', 'alignment'] },
  { id: 'steady-season', label: 'Steady season', shortLabel: 'Steady season' },
  { id: 'other', label: 'Other life chapter', shortLabel: 'Life transition' },
];

export const LIFE_CHAPTER_IDS = LIFE_CHAPTERS.map((c) => c.id);

export function getLifeChapterById(id: string): LifeChapterOption | undefined {
  return LIFE_CHAPTERS.find((c) => c.id === id);
}

/** Label for display when we only have a string (e.g. from profile currentLifeStage) */
export function getLifeChapterLabel(value: string): string {
  if (!value) return '';
  const byId = LIFE_CHAPTERS.find((c) => c.id === value);
  if (byId) return byId.shortLabel;
  return value;
}
