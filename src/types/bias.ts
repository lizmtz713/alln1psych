/**
 * Bias Detector — Types for cognitive bias definitions, detection results, and check history.
 */

/** Definition of a cognitive bias (from the library). */
export interface BiasPattern {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Example phrases or keywords used for pattern matching (case-insensitive). */
  patterns: string[];
  /** Optional category for grouping in the library. */
  category?: 'thinking' | 'social' | 'memory' | 'decision' | 'self';
}

/** A single detection result: which bias was matched and where. */
export interface DetectedBias {
  biasId: string;
  biasName: string;
  /** Snippet of text that triggered the match (optional). */
  snippet?: string;
  /** Pattern or keyword that matched. */
  matchedPattern?: string;
}

/** One bias-check session: user input and detected biases. */
export interface BiasCheckEntry {
  id: string;
  inputText: string;
  detected: DetectedBias[];
  createdAt: string; // ISO
}
