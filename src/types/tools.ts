/**
 * Standard tool output shape (Tool Quality Standard).
 * Every tool should aim for: Understanding → Recommendation → Why → Next step.
 * See docs/TOOL-QUALITY-STANDARD.md.
 */

export interface StandardToolResult {
  /** What's happening (one short line). */
  understanding: string;
  /** Best next move (one line). */
  recommendation: string;
  /** 2–3 short reasons (bullets). */
  whyBullets: string[];
  /** Label for primary action (e.g. "Rewrite message → Tone Check"). */
  nextStep: string;
  /** Optional: "What exactly should I say?" — dramatically increases usefulness. */
  exampleScript?: string;
}
