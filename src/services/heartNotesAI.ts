/**
 * Heart Notes AI Service
 * 
 * AI assistance for writing heart notes:
 * - Clarify core message
 * - Identify emotions
 * - Rephrase with care
 * - Screen for harmful content
 * - Convert to talking points
 */

import { sendMessageWithSystemPrompt, type Message } from './ai';
import { buildAgeAdaptivePrompt, getAgeTier } from './ageAdaptive';
import { type NoteType } from '../stores/heartNotesStore';

const HEART_NOTES_SYSTEM_PROMPT = `You are the Heart Notes assistant in InGauge. You help users write messages to people they care about — messages that may be difficult to express.

YOUR ROLE:
- Help clarify what they really want to say
- Identify the core emotion underneath
- Suggest gentle rephrasing when needed
- Help them find courage without pushing
- Never judge what they want to express

PRINCIPLES:
- The goal is authentic expression, not "nice" expression
- Hard truths can be said with care
- Their feelings are valid even if complicated
- Help them say what THEY mean, not what you think they should say
- Short is often better than long

WHAT MAKES A GOOD HEART NOTE:
- Clear about the one thing they want the person to know
- Honest but not attacking
- Specific when possible
- Comes from their experience ("I feel..." not "You always...")
- Leaves room for the relationship to continue

WHEN HELPING REPHRASE:
- Keep their voice, don't make it sound like you
- Remove accusations, keep observations
- Remove demands, keep requests
- Remove ultimatums, keep boundaries
- Keep the emotional truth intact`;

const SCREENING_PROMPT = `You are a content moderator for Heart Notes, a feature where people send emotional messages to loved ones.

Your job is to identify messages that would be HARMFUL to send. Not uncomfortable — harmful.

FLAG these (return harmful: true):
- Direct insults or name-calling
- Threats of any kind
- Manipulation or gaslighting language
- Demands/ultimatums disguised as sharing
- Content that could constitute harassment
- Abuse (verbal, emotional)

ALLOW these (return harmful: false):
- Difficult truths expressed with care
- Expressing hurt or disappointment
- Setting boundaries
- Sharing concerns about behavior
- Criticism delivered constructively
- Anger expressed about actions (not attacks on person)

Remember: People SHOULD be able to tell hard truths. The goal isn't to make everything "nice" — it's to prevent genuine harm.

Respond with JSON only: { "harmful": boolean, "reason": string | null, "suggestion": string | null }`;

/**
 * Help clarify the core message of a heart note
 */
export async function clarifyNote(
  content: string,
  recipientName: string,
  noteType: NoteType
): Promise<{
  coreMessage: string;
  emotion: string;
  suggestions: string[];
}> {
  const ageTier = getAgeTier();
  
  const prompt = `${HEART_NOTES_SYSTEM_PROMPT}

${buildAgeAdaptivePrompt()}

The user is writing a ${noteType} note to "${recipientName}".

Here's what they wrote:
"""
${content}
"""

Help them clarify. Respond with JSON:
{
  "coreMessage": "The ONE thing they most want this person to understand (1-2 sentences)",
  "emotion": "The primary emotion driving this message (one word)",
  "suggestions": ["2-3 brief suggestions for making the message clearer or more effective"]
}

Keep their voice. Don't make it sound corporate or therapy-speak.
Respond with JSON only.`;

  const messages: Message[] = [{ role: 'user', content: prompt }];
  
  try {
    const response = await sendMessageWithSystemPrompt(messages, '');
    const parsed = JSON.parse(response);
    return {
      coreMessage: parsed.coreMessage || '',
      emotion: parsed.emotion || '',
      suggestions: parsed.suggestions || [],
    };
  } catch {
    return {
      coreMessage: '',
      emotion: '',
      suggestions: [],
    };
  }
}

/**
 * Rephrase a note with a specific tone adjustment
 */
export async function rephraseNote(
  content: string,
  recipientName: string,
  adjustment: 'softer' | 'clearer' | 'shorter' | 'more-honest' | 'less-angry'
): Promise<string> {
  const adjustmentInstructions = {
    'softer': 'Make this gentler without losing the truth. Soften the edges but keep the message.',
    'clearer': 'Make this more direct and clear. Remove ambiguity.',
    'shorter': 'Cut this down to the essential message. Less is more.',
    'more-honest': 'Help them say what they\'re actually feeling, even if it\'s harder to admit.',
    'less-angry': 'Keep the valid feelings but remove the heat. Hurt can be expressed without attack.',
  };

  const prompt = `${HEART_NOTES_SYSTEM_PROMPT}

The user is writing to "${recipientName}" and wants help adjusting their message.

Their request: ${adjustmentInstructions[adjustment]}

Original message:
"""
${content}
"""

Rewrite this message following their request. Keep their voice. Don't add therapy-speak.
Return ONLY the rewritten message, nothing else.`;

  const messages: Message[] = [{ role: 'user', content: prompt }];
  
  try {
    const response = await sendMessageWithSystemPrompt(messages, '');
    return response.trim();
  } catch {
    return content;
  }
}

/**
 * Screen content for harmful messages (especially for anonymous)
 */
export async function screenContent(
  content: string,
  isAnonymous: boolean
): Promise<{
  harmful: boolean;
  reason: string | null;
  suggestion: string | null;
}> {
  const prompt = `${SCREENING_PROMPT}

${isAnonymous ? 'This message will be sent ANONYMOUSLY, so the recipient won\'t know who sent it. Be slightly more cautious.' : ''}

Message to screen:
"""
${content}
"""

Respond with JSON only.`;

  const messages: Message[] = [{ role: 'user', content: prompt }];
  
  try {
    const response = await sendMessageWithSystemPrompt(messages, '');
    const parsed = JSON.parse(response);
    return {
      harmful: parsed.harmful || false,
      reason: parsed.reason || null,
      suggestion: parsed.suggestion || null,
    };
  } catch {
    // If screening fails, err on the side of caution for anonymous
    return {
      harmful: isAnonymous,
      reason: isAnonymous ? 'Unable to verify content safety' : null,
      suggestion: null,
    };
  }
}

/**
 * Convert a note to talking points for a real conversation
 */
export async function convertToTalkingPoints(
  content: string,
  recipientName: string,
  noteType: NoteType
): Promise<{
  openingLine: string;
  keyPoints: string[];
  phrasesToUse: string[];
  thingsToAvoid: string[];
  closingLine: string;
}> {
  const ageTier = getAgeTier();

  const prompt = `${HEART_NOTES_SYSTEM_PROMPT}

${buildAgeAdaptivePrompt()}

The user wrote this ${noteType} note to "${recipientName}" and now wants to have the conversation in person.

Their note:
"""
${content}
"""

Convert this into talking points for a real conversation. Respond with JSON:
{
  "openingLine": "How to start the conversation (natural, not scripted)",
  "keyPoints": ["3-4 key things to make sure they communicate"],
  "phrasesToUse": ["2-3 specific phrases that capture what they want to say"],
  "thingsToAvoid": ["2-3 things to NOT say or do"],
  "closingLine": "How to end the conversation well"
}

Keep it practical and in their voice.
Respond with JSON only.`;

  const messages: Message[] = [{ role: 'user', content: prompt }];
  
  try {
    const response = await sendMessageWithSystemPrompt(messages, '');
    const parsed = JSON.parse(response);
    return {
      openingLine: parsed.openingLine || '',
      keyPoints: parsed.keyPoints || [],
      phrasesToUse: parsed.phrasesToUse || [],
      thingsToAvoid: parsed.thingsToAvoid || [],
      closingLine: parsed.closingLine || '',
    };
  } catch {
    return {
      openingLine: '',
      keyPoints: [],
      phrasesToUse: [],
      thingsToAvoid: [],
      closingLine: '',
    };
  }
}

/**
 * Generate prompts to help start writing
 */
export function getWritingPrompts(noteType: NoteType): string[] {
  const prompts: Record<NoteType, string[]> = {
    general: [
      "I've been wanting to tell you...",
      "Something I never said but should have...",
      "What I wish you knew is...",
    ],
    gratitude: [
      "I never thanked you for...",
      "Something you did that meant more than you know...",
      "I'm grateful for you because...",
    ],
    concern: [
      "I care about you, which is why I want to share...",
      "I've noticed something that worries me...",
      "This might be hard to hear, but I'm telling you because I love you...",
    ],
    apology: [
      "I'm sorry for...",
      "I know I hurt you when...",
      "I wish I could go back and...",
    ],
    forgiveness: [
      "I've been holding onto...",
      "I'm ready to let go of...",
      "I forgive you for...",
    ],
    boundary: [
      "What I need from our relationship is...",
      "I love you, and I also need...",
      "Something that's not working for me is...",
    ],
    grief: [
      "I wish I could tell you...",
      "What I miss most is...",
      "If you could hear me now...",
    ],
    encouragement: [
      "I see you, and I want you to know...",
      "What I admire about you is...",
      "I believe in you because...",
    ],
  };
  
  return prompts[noteType] || prompts.general;
}

/**
 * Suggest note type based on content analysis
 */
export async function suggestNoteType(content: string): Promise<NoteType> {
  const prompt = `Analyze this message and determine what type of Heart Note it is.

Message:
"""
${content}
"""

Options:
- gratitude: expressing thanks or appreciation
- concern: sharing worry about the person
- apology: saying sorry for something
- forgiveness: letting go of hurt from them
- boundary: setting limits in the relationship
- grief: writing to someone who passed
- encouragement: building them up
- general: none of the above

Respond with ONLY the type word, nothing else.`;

  const messages: Message[] = [{ role: 'user', content: prompt }];
  
  try {
    const response = await sendMessageWithSystemPrompt(messages, '');
    const type = response.trim().toLowerCase() as NoteType;
    const validTypes: NoteType[] = ['general', 'gratitude', 'concern', 'apology', 'forgiveness', 'boundary', 'grief', 'encouragement'];
    return validTypes.includes(type) ? type : 'general';
  } catch {
    return 'general';
  }
}
