/**
 * Bias Detector — Pattern matching to detect cognitive biases in user input.
 */

import { BIASES } from '../data/biases';
import type { DetectedBias } from '../types/bias';

/**
 * Detect which bias patterns match the given text.
 * Returns one DetectedBias per matching bias (deduplicated by biasId).
 * Snippet is a short substring around the match when possible.
 */
export function detectBiasesInText(input: string): DetectedBias[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();
  const seen = new Set<string>();
  const results: DetectedBias[] = [];

  for (const bias of BIASES) {
    if (seen.has(bias.id)) continue;

    for (const pattern of bias.patterns) {
      const idx = lower.indexOf(pattern.toLowerCase());
      if (idx === -1) continue;

      seen.add(bias.id);
      const snippet = trimmed.slice(Math.max(0, idx - 10), idx + pattern.length + 20).trim();
      results.push({
        biasId: bias.id,
        biasName: bias.name,
        snippet: snippet.length > 60 ? snippet.slice(0, 57) + '...' : snippet,
        matchedPattern: pattern,
      });
      break;
    }
  }

  return results;
}
