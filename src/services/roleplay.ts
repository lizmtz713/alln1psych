/**
 * Role play AI — character conversation and debrief.
 */

import { getOpenAIKey } from './ai';
import { useUsageStore } from '../stores/usageStore';

export interface RolePlayMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ROLEPLAY_SYSTEM_TEMPLATE = `You are playing the role of {character} in a practice conversation. Stay in character. Respond naturally and realistically. Help the user practice this conversation.

SCENARIO: {scenario}
DIFFICULTY: {difficulty} (Supportive = understanding and receptive. Neutral = realistic, fair. Challenging = push back a little, ask tough questions — but never abusive.)

RULES:
- Stay in character at all times. You are {character}, not an AI.
- Keep responses concise (2-4 sentences) like a real conversation.
- After each response, add a brief note in parentheses about what the user did well or what they could try differently. Example: (That was clear. You could also try pausing after they respond to see if they add more.)
- React to what they actually said. Don't sound generic.`;

const DEBRIEF_SYSTEM_TEMPLATE = `You are Psych, the AI companion in AllN1 Psych. The user just finished a role play practice session.

THE SCENARIO: {scenario}
THEY WERE PRACTICING WITH: {character}
DIFFICULTY: {difficulty}

Here is the conversation transcript:
{transcript}

Provide a warm, constructive debrief:
1. Start with what they did well (be specific, reference actual things they said)
2. Offer 1-2 things they might consider adjusting (be gentle, frame as suggestions)
3. Give them a specific phrase or approach they could use in the real conversation
4. End with encouragement

Keep it concise — 3-4 short paragraphs max. Be warm, be specific, be helpful.`;

function buildRolePlayPrompt(scenario: string, character: string, difficulty: string): string {
  return ROLEPLAY_SYSTEM_TEMPLATE.replace('{scenario}', scenario)
    .replace(/{character}/g, character)
    .replace('{difficulty}', difficulty);
}

function buildDebriefPrompt(
  scenario: string,
  character: string,
  difficulty: string,
  transcript: string
): string {
  return DEBRIEF_SYSTEM_TEMPLATE.replace('{scenario}', scenario)
    .replace(/{character}/g, character)
    .replace('{difficulty}', difficulty)
    .replace('{transcript}', transcript);
}

export async function sendRolePlayMessage(
  messages: RolePlayMessage[],
  scenario: string,
  character: string,
  difficulty: 'supportive' | 'neutral' | 'challenging'
): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const systemPrompt = buildRolePlayPrompt(scenario, character, difficulty);
  const apiMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      max_tokens: 300,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `OpenAI error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');
  useUsageStore.getState().incrementGPT();
  return content;
}

export async function getDebrief(
  messages: RolePlayMessage[],
  scenario: string,
  character: string,
  difficulty: string
): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'User' : character}: ${m.content}`)
    .join('\n\n');
  const systemPrompt = buildDebriefPrompt(scenario, character, difficulty, transcript);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Please provide the debrief.' }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `OpenAI error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty debrief from OpenAI');
  useUsageStore.getState().incrementGPT();
  return content;
}
