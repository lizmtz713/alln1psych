/**
 * Attraction science tool — brain chemistry, stages, factors, types, myths, patterns.
 * Science: Helen Fisher, David Buss, Esther Perel, Attachment Theory.
 */

export interface AttractionChemical {
  id: string;
  emoji: string;
  name: string;
  role: string;
}

export interface AttractionStage {
  id: string;
  emoji: string;
  label: string;
  timeframe: string;
  description: string;
}

export interface AttractionFactor {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export interface AttractionType {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export interface AttractionMyth {
  id: string;
  myth: string;
  truth: string;
}

export type UnhealthyPatternId = 'anxious-avoidant' | 'trauma-bonding' | 'intensity-seeking' | 'savior-project';

export interface UnhealthyPattern {
  id: UnhealthyPatternId;
  emoji: string;
  label: string;
  description: string;
  insight: string;
}

export interface AttractionAssessmentQuestion {
  id: string;
  text: string;
  dimension: 'anxious' | 'avoidant' | 'healthy' | 'intensity';
}

export interface AttractionPatternScores {
  anxious: number;
  avoidant: number;
  healthy: number;
  intensity: number;
}
