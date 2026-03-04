/**
 * Attachment style scoring — maps 12 question responses to anxiety/avoidance dimensions
 * and classifies into one of four styles (Bartholomew & Horowitz, 1991).
 */

import type { AttachmentStyle, AttachmentScores, AttachmentResult } from '../types/attachment';
import { ATTACHMENT_QUESTIONS } from '../data/attachmentQuestions';

export type QuestionAnswer = { questionId: string; value: number }; // value 1–5

function scoreDimension(
  answers: QuestionAnswer[],
  dimension: 'anxiety' | 'avoidance'
): number {
  const items = ATTACHMENT_QUESTIONS.filter((q) => q.dimension === dimension);
  let sum = 0;
  let count = 0;
  for (const item of items) {
    const a = answers.find((x) => x.questionId === item.id);
    if (a == null || a.value < 1 || a.value > 5) continue;
    const raw = a.value;
    const score = item.reverseScored ? 6 - raw : raw; // 1–5 scale, reverse = 5→1, 4→2...
    sum += score;
    count += 1;
  }
  if (count === 0) return 2.5; // neutral
  return Math.round((sum / count) * 10) / 10; // one decimal
}

/**
 * Classify into one of four attachment styles using anxiety and avoidance scores (1–5).
 * Threshold at 3.0: below = low, above = high. (Can use median or tertiles; 3 is simple.)
 */
export function classifyAttachmentStyle(scores: AttachmentScores): AttachmentStyle {
  const { anxiety, avoidance } = scores;
  const highAnxiety = anxiety >= 3;
  const highAvoidance = avoidance >= 3;
  if (!highAnxiety && !highAvoidance) return 'secure';
  if (highAnxiety && !highAvoidance) return 'anxious';
  if (!highAnxiety && highAvoidance) return 'avoidant';
  return 'fearful';
}

/**
 * Compute scores and style from answers.
 */
export function computeAttachmentResult(answers: QuestionAnswer[]): AttachmentResult {
  const anxiety = scoreDimension(answers, 'anxiety');
  const avoidance = scoreDimension(answers, 'avoidance');
  const scores: AttachmentScores = { anxiety, avoidance };
  const style = classifyAttachmentStyle(scores);
  return {
    style,
    scores,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Validate that all 12 questions have an answer in 1–5.
 */
export function isAssessmentComplete(answers: QuestionAnswer[]): boolean {
  const ids = new Set(ATTACHMENT_QUESTIONS.map((q) => q.id));
  for (const a of answers) {
    if (!ids.has(a.questionId) || a.value < 1 || a.value > 5) return false;
  }
  return answers.length === ATTACHMENT_QUESTIONS.length;
}
