/**
 * AI conversation service — Supabase Edge Function first, then direct OpenAI fallback.
 * Reads Supabase URL/key from env and expo-constants extra; OpenAI key from secure-store/env.
 */

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_KEY_STORAGE = 'openai_api_key';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.supabaseUrl ||
  '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.supabaseAnonKey ||
  '';

async function callEdgeFunction<T = unknown>(
  functionName: string,
  payload: Record<string, unknown>
): Promise<T> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Edge function error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

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
- Pronouns: {pronouns}

GENDER & IDENTITY AWARENESS:
- Always use the user's chosen pronouns. Their pronouns are: {pronouns}.
- If the user is transgender, nonbinary, or LGBTQ+: their identity is valid. Period. Never question it, qualify it, or treat it as something to "work through."
- Gender dysphoria is real and painful. Acknowledge it without minimizing: "That sounds really hard. Your feelings about your body are valid."
- If family rejection or discrimination comes up: center the user's pain, not the other person's perspective. "You deserved acceptance. I'm sorry you didn't get it."
- Never suggest the user should "try to see their family's side" on identity issues. Their identity is not a debate.
- For body image conversations with trans users: be affirming of their identity regardless of where they are in any transition. "Your body is yours. However you feel about it is valid."
- Understand that for trans and LGBTQ+ users, everyday situations (bathrooms, forms, introductions, family gatherings, dating, medical appointments) can carry extra emotional weight.
- Use inclusive language always: "partner" instead of assuming "boyfriend/girlfriend", ask rather than assume.

MOOD & IDENTITY (if user has flagged gender identity or coming out in sensitive topics):
- Low moods might be connected to identity stress (dysphoria, misgendering, discrimination), not just general life stress.
- You may gently offer: "Is this connected to how you're feeling about yourself, or is it more about a situation?" — giving space to connect the dots.
- NEVER push. If they don't want to talk about it, respect that immediately.

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

SENSITIVE TOPICS: The user has indicated sensitivity around: {sensitiveTopics}
IMPORTANT RULES FOR THESE TOPICS:
- Never push the user to talk about these topics directly
- Use trauma-informed language: "when you're ready", "only if you want to", "you're in control"
- Avoid metaphors involving violence, captivity, or powerlessness
- If these topics come up naturally, acknowledge with extra care
- Never minimize their experience
- Emphasize their strength and autonomy
- For abuse survivors: emphasize that it was NOT their fault, they are NOT broken, healing is possible

CRISIS DETECTION:
- If the user mentions self-harm, suicide, or wanting to die, respond with care and provide:
  - 988 Suicide and Crisis Lifeline (call or text 988)
  - Crisis Text Line (text HOME to 741741)
  - Stay present: "I'm here with you right now. You are not alone."
  - Ask: "Would you like me to let someone in your circle know you could use support?"
- If you detect crisis language (e.g. "I want to die", "I can't do this anymore", "hurt myself", "end it", "nobody would care"), respond with: "I hear you, and I'm glad you're telling me this. You matter. Can I help you reach someone right now?" and the app will show crisis resources.`;

export interface UserContext {
  name: string;
  ageGroup: string;
  loveLanguage: string;
  communicationPreference: string;
  pronouns?: string | null;
  sensitiveTopics?: string[];
}

function buildSystemPrompt(ctx: UserContext): string {
  const sensitiveTopics =
    ctx.sensitiveTopics?.length && ctx.sensitiveTopics.length > 0
      ? ctx.sensitiveTopics.join(', ')
      : 'None shared';
  const pronouns = ctx.pronouns ?? 'not specified';
  return SYSTEM_PROMPT_TEMPLATE.replace(/\{name\}/g, ctx.name || 'there')
    .replace(/\{ageGroup\}/g, ctx.ageGroup || 'unknown')
    .replace(/\{loveLanguage\}/g, ctx.loveLanguage || 'unknown')
    .replace(/\{communicationPreference\}/g, ctx.communicationPreference || 'voice')
    .replace(/\{pronouns\}/g, pronouns)
    .replace(/\{sensitiveTopics\}/g, sensitiveTopics);
}

export async function sendMessage(
  messages: Message[],
  userContext: UserContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(userContext);
  const apiMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const data = await callEdgeFunction<{ content?: string; data?: { content?: string } }>(
        'chat',
        { messages: apiMessages, max_tokens: 500, temperature: 0.8 }
      );
      const content = data?.content ?? data?.data?.content ?? '';
      if (content) return content.trim();
    }
  } catch (edgeErr: unknown) {
    console.error('AI ERROR (edge):', edgeErr);
    const msg = (edgeErr as { message?: string })?.message ?? String(edgeErr);
    return `[AI Error: ${msg}]`;
  }

  try {
    const apiKey = await getOpenAIKey();
    if (!apiKey) return '[AI Error: OpenAI API key not configured]';
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
      const body = await res.text();
      console.error('AI API Error:', res.status, body);
      return `[AI Error: ${body || `OpenAI ${res.status}`}]`;
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return '[AI Error: Empty response from OpenAI]';
    return content;
  } catch (error: unknown) {
    console.error('AI ERROR:', (error as { message?: string })?.message ?? error);
    return `[AI Error: ${(error as { message?: string })?.message || 'Unknown error'}]`;
  }
}

/** One-off request with a custom system prompt (e.g. Relationship Check). Does not use UserContext. */
export async function sendMessageWithSystemPrompt(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const data = await callEdgeFunction<{ content?: string; data?: { content?: string } }>(
        'chat',
        { messages: apiMessages, max_tokens: 500, temperature: 0.8 }
      );
      const content = data?.content ?? data?.data?.content ?? '';
      if (content) return content.trim();
    }
  } catch (edgeErr: unknown) {
    console.error('AI ERROR (edge):', edgeErr);
    const msg = (edgeErr as { message?: string })?.message ?? String(edgeErr);
    return `[AI Error: ${msg}]`;
  }

  try {
    const apiKey = await getOpenAIKey();
    if (!apiKey) return '[AI Error: OpenAI API key not configured]';
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
      const body = await res.text();
      return `[AI Error: ${body || `OpenAI ${res.status}`}]`;
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content ?? '';
  } catch (error: unknown) {
    console.error('AI ERROR:', (error as { message?: string })?.message ?? error);
    return `[AI Error: ${(error as { message?: string })?.message || 'Unknown error'}]`;
  }
}

export async function hasOpenAIKey(): Promise<boolean> {
  const key = await getOpenAIKey();
  return Boolean(key);
}
