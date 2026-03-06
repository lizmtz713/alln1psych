/**
 * Decision Tool — Types for decisions, options, risks, and reflections.
 */

/** One option in a decision */
export interface DecisionOption {
  id: string;
  label: string;
  /** Optional score or ranking from evaluation step */
  score?: number;
}

/** A risk or downside tied to an option */
export interface DecisionRisk {
  optionId: string;
  description: string;
  /** low | medium | high */
  severity?: 'low' | 'medium' | 'high';
}

/** Full 8-step decision or quick decision */
export type DecisionType = 'full' | 'quick';

/** Stored decision (full or quick) */
export interface Decision {
  id: string;
  type: DecisionType;
  /** The decision question / what's being decided */
  question: string;
  /** When the decision was created (ISO) */
  createdAt: string;
  /** When the user committed to a choice (ISO); absent if not yet decided */
  decidedAt?: string;
  /** Chosen option id (for quick/full with options) */
  chosenOptionId?: string;
  /** Optional note at time of decision */
  decisionNote?: string;

  // --- Full 8-step flow data ---
  /** Step 1: Clarify — refined description */
  clarify?: string;
  /** Step 2: Options */
  options?: DecisionOption[];
  /** Step 3: Values that matter for this decision */
  values?: string[];
  /** Step 4: Evaluation notes (e.g. option id -> score or text) */
  evaluateNotes?: string;
  /** Step 5: Risks per option */
  risks?: DecisionRisk[];
  /** Step 6: Bias check — what biases might be at play */
  biasCheck?: string;
  /** Step 7: 10-10-10 — how will I feel in 10 min, 10 months, 10 years */
  forecast101010?: { in10min: string; in10months: string; in10years: string };
}

/** Follow-up reflection on a past decision */
export interface DecisionReflection {
  id: string;
  decisionId: string;
  body: string;
  createdAt: string; // ISO
}
