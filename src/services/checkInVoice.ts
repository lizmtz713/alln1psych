/**
 * Check-in voice analysis — AI (edge function) when online, heuristic fallback when offline/failure.
 */

import { supabase } from '../lib/supabase';

export type CheckInContext = 'sleep' | 'highlight' | 'weighing' | 'ending' | 'general';

export interface CheckInVoiceResult {
  score: number; // 1-5
  insight?: string;
  source: 'ai' | 'heuristic';
}

/** Convert 1–5 score to 0–100 gauge value (linear). */
export function scoreToGauge(score: number): number {
  const s = Math.max(1, Math.min(5, score));
  return Math.round(((s - 1) / 4) * 100);
}

/** Local heuristic: keyword/sentiment → 1-5. Used when edge function fails or offline. */
function heuristicScore(question: string, transcript: string): { score: number; insight?: string } {
  const t = (transcript || '').trim().toLowerCase();
  if (!t) return { score: 3 };

  const isWeighing =
    /weighing|weigh on|anything (on |)you|burden|stress/i.test(question || '");

  if (isWeighing) {
    const heavy = /\b(a lot|everything|so much|overwhelmed|stressed|anxious|worried|can't stop|weighing|burden|heavy)\b/;
    const light = /\b(nothing|fine|all good|clear|peace|nothing (really )?weighing|good)\b/;
    if (light.test(t) && !heavy.test(t)) return { score: 5 };
    if (heavy.test(t) && !light.test(t)) return { score: 1 };
    if (heavy.test(t)) return { score: 2 };
    if (light.test(t)) return { score: 4 };
    return { score: 3 };
  }

  const negative = /\b(awful|terrible|horrible|bad|poor|slept badly|didn"t sleep|insomnia|exhausted|tired|wired|anxious|stress)\b/;
  const positive = /\b(great|good|well|amazing|rested|refreshed|solid|deep sleep|slept like)\b/;
  const neutral = /\b(okay|ok|fine|alright|so-so|medium|average)\b/;

  if (positive.test(t) && !negative.test(t)) return { score: 5 };
  if (positive.test(t)) return { score: 4 };
  if (negative.test(t) && !positive.test(t)) return { score: 1 };
  if (negative.test(t)) return { score: 2 };
  if (neutral.test(t)) return { score: 3 };

  return { score: 3 };
}

/**
 * Analyze voice check-in: tries edge function when online, falls back to heuristic.
 * Same signature for Pre-Flight / Post-Flight; optional context improves AI scale (e.g. weighing = 5 is "nothing weighing").
 */
export async function analyzeCheckInVoice(
  question: string,
  transcript: string,
  context?: CheckInContext
): Promise<CheckInVoiceResult> {
  const fallback = () => {
    const { score, insight } = heuristicScore(question, transcript);
    return { score, insight, source: 'heuristic' as const };
  };

  try {
    const { data, error } = await supabase.functions.invoke('analyze-checkin', {
      body: { question, transcript: transcript || '', context: context ?? 'general' },
    });

    if (error || !data || typeof data.score !== 'number') {
      return fallback();
    }

    const score = Math.max(1, Math.min(5, Math.round(data.score)));
    return {
      score,
      insight: typeof data.insight === 'string' ? data.insight : undefined,
      source: 'ai',
    };
  } catch {
    return fallback();
  }
}

export interface AnalyzeMultipleItem {
  question: string;
  transcript: string;
  context?: CheckInContext;
}

/**
 * Batch analyze multiple voice check-ins (e.g. Post-Flight). Runs in parallel.
 */
export async function analyzeMultipleVoice(
  items: AnalyzeMultipleItem[]
): Promise<CheckInVoiceResult[]> {
  const results = await Promise.all(
    items.map(({ question, transcript, context }) =>
      analyzeCheckInVoice(question, transcript, context)
    )
  );
  return results;
}
