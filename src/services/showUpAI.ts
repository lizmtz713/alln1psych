/**
 * AI summary for How to Show Up questionnaire responses.
 */
import type { ShowUpAnswers, ShowUpPreferenceSummaryResult } from '../types/showUp';
import { sendMessageWithSystemPromptOnly } from './ai';

const SYSTEM = `You are summarizing one person's support and communication preferences so someone close to them can show up better.

Create a concise, practical summary in plain language.

Return ONLY valid JSON (no markdown, no code fence) with these exact keys:
- bestWaysToShowUp: string array, 3-6 short bullets
- stressHelp: string array, 2-5 short bullets
- avoid: string array, 2-5 short bullets
- communicationStyle: one short sentence
- repairStyle: one short sentence (use "Not specified" if no repair data)
- easyWayToShowUp: one short sentence using their words when possible
- importantDates: optional string, one line or empty string
- summaryBlurb: 2-3 sentences tying it together for quick reading

Rules:
- Be warm, clear, and practical
- Do not judge
- Do not over-interpret
- Stay close to what the person actually said`;

export async function generateShowUpPreferenceSummary(
  answers: ShowUpAnswers,
  responderName?: string
): Promise<ShowUpPreferenceSummaryResult | null> {
  const userContent = JSON.stringify(
    {
      responderPreferredName: responderName ?? null,
      answers,
    },
    null,
    0
  );

  try {
    const content = await sendMessageWithSystemPromptOnly(
      [{ role: 'user', content: userContent }],
      SYSTEM,
      700,
      0.35
    );
    if (!content) return null;

    const cleaned = content.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    const asArr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];

    return {
      bestWaysToShowUp: asArr(parsed.bestWaysToShowUp),
      stressHelp: asArr(parsed.stressHelp),
      avoid: asArr(parsed.avoid),
      communicationStyle: String(parsed.communicationStyle ?? '').trim() || '—',
      repairStyle: String(parsed.repairStyle ?? '').trim() || '—',
      easyWayToShowUp: String(parsed.easyWayToShowUp ?? '').trim() || '—',
      importantDates: String(parsed.importantDates ?? '').trim() || undefined,
      summaryBlurb: String(parsed.summaryBlurb ?? '').trim() || '—',
    };
  } catch (e) {
    if (__DEV__) console.warn('[showUpAI] generate failed', e);
    return null;
  }
}
