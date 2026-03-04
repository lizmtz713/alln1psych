/**
 * Attraction tool — score 12-question pattern assessment by dimension.
 */

import type { AttractionPatternScores } from '../types/attraction';
import { ATTRACTION_ASSESSMENT_QUESTIONS } from '../data/attractionData';

export interface AttractionAnswer {
  questionId: string;
  value: number; // 1-5
}

export function computePatternScores(answers: AttractionAnswer[]): AttractionPatternScores {
  const sums = { anxious: 0, avoidant: 0, healthy: 0, intensity: 0 };
  const counts = { anxious: 0, avoidant: 0, healthy: 0, intensity: 0 };

  for (const q of ATTRACTION_ASSESSMENT_QUESTIONS) {
    const a = answers.find((x) => x.questionId === q.id);
    const v = a != null && a.value >= 1 && a.value <= 5 ? a.value : 0;
    if (v > 0) {
      sums[q.dimension] += v;
      counts[q.dimension]++;
    }
  }

  return {
    anxious: counts.anxious ? Math.round((sums.anxious / counts.anxious) * 10) / 10 : 0,
    avoidant: counts.avoidant ? Math.round((sums.avoidant / counts.avoidant) * 10) / 10 : 0,
    healthy: counts.healthy ? Math.round((sums.healthy / counts.healthy) * 10) / 10 : 0,
    intensity: counts.intensity ? Math.round((sums.intensity / counts.intensity) * 10) / 10 : 0,
  };
}

export function getInsightSummary(scores: AttractionPatternScores): {
  dominant: keyof AttractionPatternScores;
  label: string;
  tip: string;
} {
  const entries = (Object.entries(scores) as [keyof AttractionPatternScores, number][]).filter(
    ([_, v]) => v > 0
  );
  if (entries.length === 0) {
    return { dominant: 'healthy', label: 'Complete the assessment', tip: 'Answer all 12 questions to see your pattern.' };
  }
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const labels: Record<keyof AttractionPatternScores, string> = {
    anxious: 'Anxious pattern',
    avoidant: 'Avoidant pattern',
    healthy: 'Secure / healthy',
    intensity: 'Intensity-seeking',
  };
  const tips: Record<keyof AttractionPatternScores, string> = {
    anxious: 'You may be drawn to uncertainty. Consider whether calm, consistent partners feel \"boring\" — that might be your nervous system seeking familiarity with chaos.',
    avoidant: 'Closeness can feel threatening. Small steps toward vulnerability and commitment can build security without overwhelm.',
    healthy: 'You tend toward secure attraction. You can enjoy stability and still have passion; you don\'t need drama to feel love.',
    intensity: 'High drama can feel like love. Secure attachment may feel \"too quiet\" at first — give it time.',
  };
  return { dominant, label: labels[dominant], tip: tips[dominant] };
}

export function isAssessmentComplete(answers: AttractionAnswer[]): boolean {
  const required = ATTRACTION_ASSESSMENT_QUESTIONS.length;
  const valid = ATTRACTION_ASSESSMENT_QUESTIONS.filter((q) => {
    const a = answers.find((x) => x.questionId === q.id);
    return a != null && a.value >= 1 && a.value <= 5;
  });
  return valid.length >= required;
}
