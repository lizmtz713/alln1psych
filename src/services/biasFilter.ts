export type BiasType = 'loss_aversion' | 'confirmation_bias' | 'catastrophizing' | 'mind_reading' | 'emotional_reasoning' | 'black_and_white';

export interface DetectedBias {
  type: BiasType;
  label: string;
  confidence: number;
  matchedPatterns: string[];
  explanation: string;
}

export interface BiasFilterResult {
  detected: boolean;
  biases: DetectedBias[];
  primaryBias: DetectedBias | null;
  system1Alert: string | null;
}

export function detectBiases(text: string, state?: number): BiasFilterResult {
  return { detected: false, biases: [], primaryBias: null, system1Alert: null };
}

export function suggestReframe(bias: BiasType): string {
  return 'Try stepping back and asking: Is this the whole picture?';
}

export function getSystem2Prompt(bias: BiasType): string {
  return 'What would a wise friend tell you right now?';
}

export function getAllSystem2Prompts(bias: BiasType): string[] {
  return ['What would a wise friend tell you right now?'];
}

export function getFilterExplanation(state?: number): string {
  return 'Your brain is taking some mental shortcuts.';
}

export function formatBiasForDisplay(bias: DetectedBias): { title: string; subtitle: string; emoji: string } {
  return { title: bias.label, subtitle: bias.explanation, emoji: '🧠' };
}
