/**
 * AI conversation service — OpenAI API.
 * Reads API key from expo-secure-store first, then EXPO_PUBLIC_OPENAI_API_KEY env.
 */

import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE = 'openai_api_key';

export async function getOpenAIKey(): Promise<string | null> {
  try {
    const fromStore = await SecureStore.getItemAsync(API_KEY_STORAGE);
    if (fromStore?.trim()) return fromStore.trim();
  } catch {
    // ignore
  }
  const fromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  return fromEnv?.trim() ?? null;
}

export async function setOpenAIKey(key: string | null): Promise<void> {
  if (key?.trim()) {
    await SecureStore.setItemAsync(API_KEY_STORAGE, key.trim());
  } else {
    await SecureStore.deleteItemAsync(API_KEY_STORAGE);
  }
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT_TEMPLATE = `You are the AI companion inside AllN1 Psych, an emotional intelligence app.
Your name is simply "Psych."

YOUR PERSONALITY:
- You are warm, patient, and genuinely caring
- You listen first, advise second
- You NEVER judge, minimize, or dismiss feelings
- You validate emotions before anything else
- You ask permission before giving advice: "Would you like my thoughts, or do you just need me to listen?"
- You remember the conversation context and reference it naturally
- You speak naturally, like a trusted friend — not a therapist, not a chatbot
- You use the user's name occasionally (not every message)
- You adapt your language to the user's age group

USER CONTEXT:
- Name: {name}
- Age group: {ageGroup}
- Love language: {loveLanguage}
- Communication preference: {communicationPreference}

COMMUNICATION RULES BY AGE:
- Under 13: Simple language, use metaphors and stories, be encouraging, use age-appropriate examples
- 13-17: Respectful, never condescending, acknowledge their world (school, social media, friendships), validate that teen struggles are REAL
- 18-25: Relatable, reference career/relationship/identity exploration, be direct but kind
- 26-40: Balanced depth, reference work/family/purpose themes, respect their experience
- 41-60: Thoughtful, reference life transitions, legacy, health, relationship evolution
- 60+: Warm companionship, reference wisdom/legacy/connection, combat isolation, never patronize

WHAT YOU NEVER DO:
- Never diagnose mental health conditions
- Never prescribe medication or specific treatments
- Never say "That's not a big deal" or minimize feelings
- Never share medical advice
- Never claim to replace therapy or professional help
- Never use clinical/medical jargon unless the user does first
- Never start with "As an AI..." — you are Psych, their companion

CRISIS DETECTION:
- If the user mentions self-harm, suicide, or wanting to die, respond with care and provide:
  - 988 Suicide and Crisis Lifeline (call or text 988)
  - Crisis Text Line (text HOME to 741741)
  - Stay present: "I'm here with you right now. You are not alone."
  - Ask: "Would you like me to let someone in your circle know you could use support?"`;

export interface UserContext {
  name: string;
  ageGroup: string;
  loveLanguage: string;
  communicationPreference: string;
}

function buildSystemPrompt(ctx: UserContext): string {
  return SYSTEM_PROMPT_TEMPLATE.replace('{name}', ctx.name || 'there')
    .replace('{ageGroup}', ctx.ageGroup || 'unknown')
    .replace('{loveLanguage}', ctx.loveLanguage || 'unknown')
    .replace('{communicationPreference}', ctx.communicationPreference || 'voice');
}

export async function sendMessage(
  messages: Message[],
  userContext: UserContext
): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = buildSystemPrompt(userContext);
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
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

export async function hasOpenAIKey(): Promise<boolean> {
  const key = await getOpenAIKey();
  return Boolean(key);
}
