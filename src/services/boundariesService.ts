/**
 * Boundaries assessment — score by category (1–5 scale).
 */

import type { BoundaryTypeId } from '../types/boundaries';
import { BOUNDARY_ASSESSMENT_QUESTIONS, BOUNDARY_TYPES } from '../data/boundariesData';

export interface BoundaryAnswer {
  questionId: string;
  value: number;
}

export interface BoundaryCategoryScore {
  typeId: BoundaryTypeId;
  label: string;
  emoji: string;
  average: number;
  count: number;
}

export function computeCategoryScores(answers: BoundaryAnswer[]): BoundaryCategoryScore[] {
  const byType: Record<string, number[]> = {};
  for (const t of BOUNDARY_TYPES) {
    byType[t.id] = [];
  }
  for (const q of BOUNDARY_ASSESSMENT_QUESTIONS) {
    const a = answers.find((x) => x.questionId === q.id);
    if (a != null && a.value >= 1 && a.value <= 5) {
      byType[q.typeId].push(a.value);
    }
  }
  return BOUNDARY_TYPES.map((t) => {
    const vals = byType[t.id] ?? [];
    const sum = vals.reduce((s, v) => s + v, 0);
    const count = vals.length;
    const average = count ? Math.round((sum / count) * 10) / 10 : 0;
    return {
      typeId: t.id as BoundaryTypeId,
      label: t.label,
      emoji: t.emoji,
      average,
      count,
    };
  });
}

export function isAssessmentComplete(answers: BoundaryAnswer[]): boolean {
  const required = BOUNDARY_ASSESSMENT_QUESTIONS.length;
  const valid = BOUNDARY_ASSESSMENT_QUESTIONS.filter((q) => {
    const a = answers.find((x) => x.questionId === q.id);
    return a != null && a.value >= 1 && a.value <= 5;
  });
  return valid.length >= required;
}
