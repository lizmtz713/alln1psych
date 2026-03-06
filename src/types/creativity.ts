/**
 * Creativity Tool — Types for ideas, prompts, and responses.
 */

/** Prompt category for creative prompts */
export type CreativePromptCategory = 'writing' | 'thinking' | 'visual' | 'constraint';

/** A single creative prompt (from the prompt bank) */
export interface CreativePrompt {
  id: string;
  category: CreativePromptCategory;
  text: string;
  /** Optional sub-prompt or constraint */
  hint?: string;
}

/** Quick-capture idea (no prompt attached) */
export interface CreativeIdea {
  id: string;
  body: string;
  /** Optional tag or category */
  tag?: string;
  createdAt: string; // ISO
}

/** User's response to a prompt */
export interface CreativePromptResponse {
  id: string;
  promptId: string;
  /** Response text (or ref to idea id if we link them) */
  body: string;
  createdAt: string; // ISO
}
