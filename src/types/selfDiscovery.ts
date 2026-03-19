/**
 * Self-Discovery quizzes — short, research-backed insight tools.
 * Not labels or diagnoses; reveal how someone operates.
 */

import type { GaugeKey } from '../stores/cockpitStore';

/** Unique id for each Self-Discovery quiz */
export type SelfDiscoveryQuizId =
  | 'big-five'
  | 'attachment'
  | 'stress-response'
  | 'decision-style'
  | 'motivation-type'
  | 'social-energy'
  | 'thinking-bias'
  | 'conflict-style';

/** Single question: either scale (1–5) or multiple choice */
export interface SelfDiscoveryQuestion {
  id: string;
  text: string;
  /** If present, scale 1–5; otherwise use options */
  scaleLabels?: [string, string];
  /** For multiple choice: which dimension each option adds to */
  options: { value: string; label: string; dimension?: string }[];
}

/** One possible result (e.g. "Flight" for stress, "Intuitive" for decision) */
export interface SelfDiscoveryResult {
  key: string;
  title: string;
  emoji: string;
  insight: string;
  /** Gauges this pattern affects */
  gauges: GaugeKey[];
  /** What helps — short, actionable */
  whatHelps: string[];
}

/** Quiz that opens an external screen (e.g. existing Attachment modal) */
export interface SelfDiscoveryQuizExternal {
  id: SelfDiscoveryQuizId;
  type: 'external';
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  timeEstimate: string;
  /** Route to open (e.g. modal or other screen) */
  route: string;
}

/** Quiz with inline questions and results */
export interface SelfDiscoveryQuizInline {
  id: SelfDiscoveryQuizId;
  type: 'inline';
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  timeEstimate: string;
  questions: SelfDiscoveryQuestion[];
  /** Map dimension name → result key (for dimension-based scoring) */
  dimensionToResultKey: Record<string, string>;
  results: Record<string, SelfDiscoveryResult>;
}

export type SelfDiscoveryQuiz = SelfDiscoveryQuizExternal | SelfDiscoveryQuizInline;

export function isInlineQuiz(q: SelfDiscoveryQuiz): q is SelfDiscoveryQuizInline {
  return q.type === 'inline';
}
