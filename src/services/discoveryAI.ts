/**
 * AI synthesis for Direction and Alignment discovery flows.
 * Uses OpenAI when key is available; fallback for offline/demo.
 */

import { getOpenAIKey } from './ai';
import { ALIGNMENT_VALUES } from '../lib/gaugeOptions';

export interface DirectionSynthesis {
  themes: string[];
  coreDesire: string;
  directionStatement: string;
}

export interface ValueWithReason {
  value: string;
  reason: string;
}

export interface ValuesSynthesis {
  topValues: ValueWithReason[];
  tensions: string;
}

/** Build a simple direction statement from answers (fallback when no AI). */
function fallbackDirectionSynthesis(answers: Record<string, string>): DirectionSynthesis {
  const texts = Object.values(answers).filter(Boolean);
  const combined = texts.slice(0, 3).join(' ').slice(0, 300);
  return {
    themes: ['Purpose', 'Meaning', 'Impact'],
    coreDesire: 'Living in alignment with what matters to you',
    directionStatement: combined
      ? `Your answers point toward: ${combined}... Reflect and refine this in your own words.`
      : "Take a moment to write what direction you want your life to move in. There's no wrong answer.",
  };
}

/** Tally value mentions from scenario choices and pick top 5 from ALIGNMENT_VALUES (fallback). */
function fallbackValuesSynthesis(
  scenarioChoices: Array< { scenarioId: string; selectedOption?: { label: string; values: string[] }; freeText?: string } >,
  reflections: string[]
): ValuesSynthesis {
  const count: Record<string, number> = {};
  for (const choice of scenarioChoices) {
    if (choice.selectedOption?.values) {
      for (const v of choice.selectedOption.values) {
        const key = v.trim();
        if (ALIGNMENT_VALUES.includes(key)) count[key] = (count[key] ?? 0) + 1;
      }
    }
  }
  const sorted = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
  const top5 = sorted.slice(0, 5);
  while (top5.length < 5) {
    const next = ALIGNMENT_VALUES.find((v) => !top5.includes(v));
    if (!next) break;
    top5.push(next);
  }
  return {
    topValues: top5.map((value, i) => ({
      value,
      reason: `This showed up in your choices and reflections.`,
    })),
    tensions: "You may notice some values can pull in different directions; that\'s normal.",
  };
}

export async function synthesizeDirection(answers: Record<string, string>): Promise<DirectionSynthesis> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) return fallbackDirectionSynthesis(answers);

  const prompt = `You are helping someone discover their life Direction (purpose/meaning).

They answered these reflection questions:
${JSON.stringify(answers, null, 2)}

Based on their responses:
1. Identify 2-3 themes that emerge
2. Name what they seem to care about most
3. Synthesize a Direction statement (1-2 sentences) that captures where they might be heading

Be warm, insightful, not generic. Use their words where possible. Don't be cheesy.

Respond in JSON only, no markdown:
{
  \"themes\": [\"theme1\", \"theme2\"],
  \"coreDesire\": \"what they want most\",
  \"directionStatement\": \"Their synthesized direction...\"
}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user' as const, content: prompt }],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response');
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr) as DirectionSynthesis;
    if (!parsed.themes || !Array.isArray(parsed.themes) || !parsed.directionStatement) {
      throw new Error('Invalid shape');
    }
    return {
      themes: parsed.themes,
      coreDesire: parsed.coreDesire ?? '',
      directionStatement: parsed.directionStatement,
    };
  } catch (e) {
    if (__DEV__) console.warn('[discoveryAI] Direction synthesis failed', e);
    return fallbackDirectionSynthesis(answers);
  }
}

const VALUES_LIST = ALIGNMENT_VALUES.join(', ');

export async function synthesizeValues(
  scenarioChoices: Array<{ scenarioId: string; selectedOption?: { label: string; values: string[] }; freeText?: string }>,
  reflections: string[]
): Promise<ValuesSynthesis> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) return fallbackValuesSynthesis(scenarioChoices, reflections);

  const prompt = `You are helping someone discover their core Values.

They made these choices in value-tradeoff scenarios:
${JSON.stringify(scenarioChoices, null, 2)}

They described these peak/anger moments:
${JSON.stringify(reflections, null, 2)}

Based on their pattern:
1. Identify their top 5 values from this list only: ${VALUES_LIST}
2. For each value, give a 1-sentence explanation of why it showed up
3. Note any tensions between values they hold

Be specific to THEM, not generic. Use evidence from their answers.
Use exact value names from the list (e.g. "Honesty" not "honesty").

Respond in JSON only, no markdown:
{
  "topValues": [
    { "value": "Honesty", "reason": "You chose truth even when..." }
  ],
  "tensions": "You value both X and Y, which can conflict when..."
}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user' as const, content: prompt }],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) throw new Error('Empty response');
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr) as ValuesSynthesis;
    if (!parsed.topValues || !Array.isArray(parsed.topValues)) throw new Error('Invalid shape');
    const normalized = parsed.topValues.slice(0, 5).map((v) => ({
      value: ALIGNMENT_VALUES.includes(v.value) ? v.value : ALIGNMENT_VALUES[0],
      reason: v.reason ?? '',
    }));
    return {
      topValues: normalized,
      tensions: parsed.tensions ?? '',
    };
  } catch (e) {
    if (__DEV__) console.warn('[discoveryAI] Values synthesis failed', e);
    return fallbackValuesSynthesis(scenarioChoices, reflections);
  }
}
