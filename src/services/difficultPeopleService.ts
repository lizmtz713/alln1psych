/**
 * Difficult People — Type identifier: score 15 questions by type, return top matches.
 */

import type { DifficultPersonTypeId } from '../types/difficultPeople';
import { DIFFICULT_PERSON_ASSESSMENT_QUESTIONS } from '../data/difficultPeopleData';

export interface DifficultPersonAnswer {
  questionId: string;
  value: number;
}

export interface DifficultPersonTypeScore {
  typeId: DifficultPersonTypeId;
  total: number;
  count: number;
  average: number;
}

export function computeTypeScores(answers: DifficultPersonAnswer[]): DifficultPersonTypeScore[] {
  const byType: Record<string, number[]> = {};
  const typeIds = [...new Set(DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.map((q) => q.typeId))];
  for (const id of typeIds) {
    byType[id] = [];
  }
  for (const q of DIFFICULT_PERSON_ASSESSMENT_QUESTIONS) {
    const a = answers.find((x) => x.questionId === q.id);
    if (a != null && a.value >= 1 && a.value <= 5) {
      byType[q.typeId].push(a.value);
    }
  }
  return (Object.entries(byType) as [DifficultPersonTypeId, number[]][]).map(([typeId, vals]) => {
    const sum = vals.reduce((s, v) => s + v, 0);
    const count = vals.length;
    const average = count ? Math.round((sum / count) * 10) / 10 : 0;
    return { typeId, total: sum, count, average };
  });
}

export function getTopTypes(scores: DifficultPersonTypeScore[], topN = 3): DifficultPersonTypeId[] {
  return [...scores]
    .filter((s) => s.count > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, topN)
    .map((s) => s.typeId);
}

export function isAssessmentComplete(answers: DifficultPersonAnswer[]): boolean {
  const required = DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.length;
  const valid = DIFFICULT_PERSON_ASSESSMENT_QUESTIONS.filter((q) => {
    const a = answers.find((x) => x.questionId === q.id);
    return a != null && a.value >= 1 && a.value <= 5;
  });
  return valid.length >= required;
}
