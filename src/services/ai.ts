/**
 * AI conversation service — OpenAI API.
 * Reads API key from: SecureStore (user-entered) > expo extra > EXPO_PUBLIC_OPENAI_API_KEY env.
 */

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useUsageStore } from '../stores/usageStore';

const API_KEY_STORAGE = 'openai_api_key';

export async function getOpenAIKey(): Promise<string | null> {
  try {
    const fromStore = await SecureStore.getItemAsync(API_KEY_STORAGE);
    if (fromStore?.trim()) return fromStore.trim();
  } catch {
    // ignore
  }
  const fromExtra = Constants.expoConfig?.extra?.openaiApiKey as string | undefined;
  if (fromExtra?.trim()) return fromExtra.trim();
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

CULTURAL CONTEXT:
The user identifies with: {culturalBackground}
Their upbringing: {environmentUpbringing}
Cultural values: {culturalValues}

CULTURAL COMMUNICATION RULES:
- Understand that "family comes first" cultures may experience guilt around boundaries differently. Don't push Western individualism. Help them find boundaries that HONOR their family values while protecting themselves.
- If "emotions are private" or "don't show weakness" is a value: acknowledge how brave it is to be here. Don't push them to be more emotional than they're comfortable with. Meet them where they are.
- If "mental health isn't talked about" is a value: normalize their hesitation. "In a lot of families and cultures, this stuff isn't discussed. The fact that you're exploring it takes real courage."
- If religious/faith is central: integrate their faith as a resource, not a barrier. "Your faith can be a source of strength here" not "maybe you're relying too much on faith."
- If immigrant experience: understand that assimilation stress, language barriers, documentation anxiety, cultural identity conflicts, and generational trauma are real emotional experiences.
- If first-generation: understand the pressure of being the family's hope, the guilt of succeeding when family struggles, the exhaustion of code-switching between cultures.
- If "we don't air our dirty laundry": respect this while gently offering that talking to an AI isn't "airing" anything. "This stays between us. No one in your family will ever see this."
- If collectivist values: frame self-care as serving the community. "Taking care of yourself isn't selfish — you can't pour from an empty cup. Your family needs you whole."
- If gender roles are important: be sensitive to how this affects emotional expression, especially for men who were taught not to cry, and women who were taught to put everyone else first.
- If strict household: understand that the user may carry patterns of people-pleasing, fear of authority, or difficulty expressing needs. Don't pathologize survival strategies.
- If low-income background: don't suggest solutions that cost money (therapy at $150/session, yoga retreats, etc). Suggest free resources, community support, and what they can do right now with what they have.

LANGUAGE AND TONE:
- Match the user's communication style. If they use slang, be comfortable with it. Don't be overly formal.
- If they're bilingual, they might code-switch. Roll with it. If they drop Spanish, respond naturally. Don't make it a thing.
- Don't use clinical language unless they do first. "You might be experiencing cognitive distortions" means nothing to most people. "Your brain is lying to you right now" lands better.
- Cultural references are welcome when natural. But don't force them or stereotype.

WHAT TO NEVER DO (CULTURAL):
- Never assume a cultural background means a specific experience
- Never say "in your culture..." as if you know their specific family
- Never suggest they reject their cultural values to heal
- Never treat their culture as the problem
- Never use stereotypes, even "positive" ones
- Never assume language preference from cultural background
- Never assume religion from cultural background
- Never suggest therapy is the only answer when the user comes from a culture that doesn't trust it — validate alternative support systems (elders, community, faith leaders, curanderos, etc)

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
- Under 13 (safety net — app is 13+): Use extra-safe mode: no mature content, simpler language only, age-appropriate examples. Gently suggest talking to a parent or guardian when something is big or confusing. Keep everything supportive and safe.
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
  culturalBackground?: string[];
  environmentUpbringing?: string[];
  culturalValues?: string[];
  culturalBackgroundOther?: string;
}

function buildSystemPrompt(ctx: UserContext): string {
  const sensitiveTopics =
    ctx.sensitiveTopics?.length && ctx.sensitiveTopics.length > 0
      ? ctx.sensitiveTopics.join(', ')
      : 'None shared';
  const pronouns = ctx.pronouns ?? 'not specified';
  const culturalBg = ctx.culturalBackground?.length
    ? ctx.culturalBackground.join(', ') + (ctx.culturalBackgroundOther?.trim() ? ' — ' + ctx.culturalBackgroundOther.trim() : '')
    : 'Not specified';
  const environmentUp = ctx.environmentUpbringing?.length
    ? ctx.environmentUpbringing.join(', ')
    : 'Not specified';
  const culturalVals = ctx.culturalValues?.length
    ? ctx.culturalValues.join(', ')
    : 'Not specified';
  return SYSTEM_PROMPT_TEMPLATE.replace(/\{name\}/g, ctx.name || 'there')
    .replace(/\{ageGroup\}/g, ctx.ageGroup || 'unknown')
    .replace(/\{loveLanguage\}/g, ctx.loveLanguage || 'unknown')
    .replace(/\{communicationPreference\}/g, ctx.communicationPreference || 'voice')
    .replace(/\{pronouns\}/g, pronouns)
    .replace(/\{sensitiveTopics\}/g, sensitiveTopics)
    .replace(/\{culturalBackground\}/g, culturalBg)
    .replace(/\{environmentUpbringing\}/g, environmentUp)
    .replace(/\{culturalValues\}/g, culturalVals);
}

const NO_KEY_MESSAGE =
  "I'm having trouble connecting right now. Check that your API key is configured.";

export async function sendMessage(
  messages: Message[],
  userContext: UserContext
): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    if (__DEV__) console.warn('[AI] No API key — returning user-facing message');
    return NO_KEY_MESSAGE;
  }

  const systemPrompt = buildSystemPrompt(userContext);
  const apiMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const url = 'https://api.openai.com/v1/chat/completions';
  let res: Response;
  try {
    res = await fetch(url, {
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
  } catch (e) {
    if (__DEV__) console.error('[AI] Fetch failed:', e);
    throw new Error('Network error — check your connection.');
  }

  if (__DEV__) console.log('[AI] Response status:', res.status);

  if (!res.ok) {
    const body = await res.text();
    console.error('[AI] API error:', res.status, body);
    throw new Error(body || `OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (data.error?.message) {
    console.error('[AI] API error payload:', data.error.message);
    throw new Error(data.error.message);
  }
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    if (__DEV__) console.error('[AI] Empty response body');
    throw new Error('Empty response from OpenAI');
  }
  useUsageStore.getState().incrementGPT();
  return content;
}

/** Send a message with a custom system prompt (e.g. Help Someone coaching mode). */
export async function sendMessageWithSystemPrompt(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

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
      max_tokens: 600,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('AI API Error:', res.status, body);
    throw new Error(body || `OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from OpenAI');
  useUsageStore.getState().incrementGPT();
  return content;
}

export async function hasOpenAIKey(): Promise<boolean> {
  const key = await getOpenAIKey();
  return Boolean(key);
}

/** Summary shape returned by OpenAI (before we add id, conversationId, createdAt). */
export interface ConversationSummaryPayload {
  title: string;
  summary: string;
  emotions: string[];
  triggers: string[];
  insights: string;
  followUp: string;
}

export interface MessageForSummary {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateConversationSummary(
  messages: MessageForSummary[]
): Promise<ConversationSummaryPayload> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Psych'}: ${m.content}`)
    .join('\n');

  const prompt = `Summarize this conversation between a user and their AI companion Psych.

CONVERSATION:
${conversationText}

Provide a JSON response with:
{
  "title": "2-4 word title for this conversation",
  "summary": "2-3 sentence summary of what was discussed",
  "emotions": ["array of emotions the user expressed or explored"],
  "triggers": ["any triggers or stressors mentioned"],
  "insights": "1 sentence insight about the user's emotional state or growth",
  "followUp": "1 suggested follow-up topic or action for next time"
}

Be warm and specific. This is for the user to look back on.
Respond ONLY with valid JSON.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user' as const, content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response from OpenAI');

  // Strip possible markdown code block
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(jsonStr) as ConversationSummaryPayload;
  if (!parsed.title || !parsed.summary || !Array.isArray(parsed.emotions) || !Array.isArray(parsed.triggers)) {
    throw new Error('Invalid summary shape from OpenAI');
  }
  useUsageStore.getState().incrementGPT();
  return {
    title: parsed.title,
    summary: parsed.summary,
    emotions: parsed.emotions ?? [],
    triggers: parsed.triggers ?? [],
    insights: parsed.insights ?? '',
    followUp: parsed.followUp ?? '',
  };
}
