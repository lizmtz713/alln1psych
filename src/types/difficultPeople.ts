/**
 * Difficult People tool types — Dr. Ramani, Dr. George Simon, Stern (Gaslight Effect), Cloud & Townsend.
 */

export type DifficultPersonTypeId =
  | 'narcissist'
  | 'manipulator'
  | 'gaslighter'
  | 'passive-aggressive'
  | 'toxic-coworker'
  | 'emotional-vampire'
  | 'boundary-violator'
  | 'controller';

export type ContextTag = 'family' | 'romantic' | 'work' | 'friend';

export interface DifficultPersonType {
  id: DifficultPersonTypeId;
  label: string;
  emoji: string;
  tagline: string;
  redFlags: string[];
  commonPhrases: string[];
  howTheyMakeYouFeel: string[];
  psychology: string;
  tipsByContext: Partial<Record<ContextTag, string[]>>;
  whenToWalkAway: string;
  resources: string[];
}

export interface DifficultPersonStrategy {
  id: string;
  label: string;
  emoji: string;
  description: string;
  steps: string[];
  whenToUse: string;
}

export interface DifficultPersonScript {
  id: string;
  theySay: string;
  youSay: string;
  whyItWorks: string;
  typeIds?: DifficultPersonTypeId[];
}

export interface DifficultPersonAssessmentQuestion {
  id: string;
  text: string;
  typeId: DifficultPersonTypeId;
}
