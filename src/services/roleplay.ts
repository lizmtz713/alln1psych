/**
 * Role play AI — character conversation and debrief.
 */

import { sendMessageWithSystemPromptOnly } from './ai';
import { buildKnowledgePrompt } from '../data/psychKnowledge';
import { buildAgeAdaptivePrompt } from './ageAdaptive';

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

const DEBRIEF_SYSTEM_TEMPLATE = `You are Gauge, the AI companion in InGauge. The user just finished a role play practice session.

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
  const base = ROLEPLAY_SYSTEM_TEMPLATE.replace('{scenario}', scenario)
    .replace(/{character}/g, character)
    .replace('{difficulty}', difficulty);
  // Add age-adaptive language rules
  return base + buildAgeAdaptivePrompt();
}

function buildDebriefPrompt(
  scenario: string,
  character: string,
  difficulty: string,
  transcript: string
): string {
  const base = DEBRIEF_SYSTEM_TEMPLATE.replace('{scenario}', scenario)
    .replace(/{character}/g, character)
    .replace('{difficulty}', difficulty)
    .replace('{transcript}', transcript);
  // Add age-adaptive language rules
  return base + buildAgeAdaptivePrompt();
}

export async function sendRolePlayMessage(
  messages: RolePlayMessage[],
  scenario: string,
  character: string,
  difficulty: 'supportive' | 'neutral' | 'challenging'
): Promise<string> {
  const systemPrompt = buildRolePlayPrompt(scenario, character, difficulty);
  const content = await sendMessageWithSystemPromptOnly(messages, systemPrompt, 300, 0.8);
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

export async function getDebrief(
  messages: RolePlayMessage[],
  scenario: string,
  character: string,
  difficulty: string
): Promise<string> {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'User' : character}: ${m.content}`)
    .join('\n\n');
  let systemPrompt = buildDebriefPrompt(scenario, character, difficulty, transcript);
  systemPrompt += buildKnowledgePrompt();

  const content = await sendMessageWithSystemPromptOnly(
    [{ role: 'user', content: 'Please provide the debrief.' }],
    systemPrompt,
    500,
    0.7
  );
  if (!content) throw new Error('Empty debrief from OpenAI');
  return content;
}
