/**
 * Attachment style types — Bowlby/Ainsworth, Bartholomew & Horowitz (1991) four-category model.
 * Dimensions: Anxiety (model of self), Avoidance (model of other). ECR-R inspired.
 */

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful';

export type AttachmentDimension = 'anxiety' | 'avoidance';

export interface AttachmentScores {
  anxiety: number;   // 1–5 average (higher = more worry about rejection/abandonment)
  avoidance: number; // 1–5 average (higher = more discomfort with closeness)
}

export interface AttachmentResult {
  style: AttachmentStyle;
  scores: AttachmentScores;
  completedAt: string; // ISO
}

export interface AttachmentQuestion {
  id: string;
  dimension: AttachmentDimension;
  text: string;
  reverseScored: boolean; // if true, 5→1, 4→2, etc.
}

export interface AttachmentStyleInfo {
  style: AttachmentStyle;
  label: string;
  emoji: string;
  shortDescription: string;
  insight: string;
  strengths: string[];
  growthTips: string[];
}
