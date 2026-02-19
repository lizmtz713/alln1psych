/**
 * AI-generated daily content for Home tab (greeting, affirmation, insight, challenge).
 */

import { getOpenAIKey } from './ai';

export interface DailyContentContext {
  name: string;
  ageGroup: string;
  recentMoods: string[];
  streak: number;
  lastConversationSummary?: string;
  lessonsCompleted: string[];
  loveLanguage?: string;
  triggers?: string[];
  /** Top emotions from recent conversation summaries */
  recentEmotions?: string[];
  /** improving | stable | struggling from conversation summaries */
  emotionalTrend?: string;
}

export interface DailyContent {
  greeting: string;
  affirmation: string;
  insight: string;
  challengeSuggestion: string;
}

function getStaticDefaults(name: string): DailyContent {
  const hour = new Date().getHours();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : "It's late";
  
  // Rotating affirmations — changes daily
  const AFFIRMATIONS = [
    "You're doing better than you think.",
    "Showing up is the hardest part. You did it.",
    "Progress isn't always visible. Trust the process.",
    "You don't have to be perfect to be growing.",
    "The fact that you're here means you care. That matters.",
    "Small steps still move you forward.",
    "You survived 100% of your worst days.",
    "Awareness is the first step. You're already ahead.",
    "Be patient with yourself. You're learning.",
    "Your effort counts, even when results are slow.",
    "It's okay to not be okay. But you won't stay here.",
    "You're allowed to take up space.",
    "Your feelings are valid, even the messy ones.",
    "Rest is productive. You've earned it.",
  ];
  
  return {
    greeting: `${timeGreeting}, ${name || 'you'} 💜`,
    affirmation: AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length],
    insight: 'Check in with yourself today. Your feelings matter.',
    challengeSuggestion: 'Take 5 deep breaths right now.',
  };
}

export async function generateDailyContent(userContext: DailyContentContext): Promise<DailyContent> {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    return getStaticDefaults(userContext.name);
  }

  const prompt = `You are Gauge, an emotional intelligence companion. Based on this user's recent history, generate personalized daily content.

USER: ${userContext.name}, age group: ${userContext.ageGroup}
RECENT MOODS (last 7 days): ${(userContext.recentMoods ?? []).join(', ') || 'No check-ins yet'}
STREAK: ${userContext.streak ?? 0} days
LOVE LANGUAGE: ${userContext.loveLanguage || 'Unknown'}
LESSONS COMPLETED: ${(userContext.lessonsCompleted ?? []).join(', ') || 'None yet'}
LAST CONVERSATION: ${userContext.lastConversationSummary || 'No conversations yet'}
KNOWN TRIGGERS: ${userContext.triggers?.join(', ') || 'None shared yet'}
RECENT EMOTIONS (from conversations): ${userContext.recentEmotions?.join(', ') || 'None yet'}
EMOTIONAL TREND: ${userContext.emotionalTrend ?? 'unknown'}

Generate a JSON response with:
1. "greeting" - A warm, time-appropriate greeting that references something specific from their recent activity (1 sentence)
2. "affirmation" - A personalized affirmation based on what they're going through (1 sentence)
3. "insight" - One insight about their emotional patterns based on their mood history (2 sentences max)
4. "challengeSuggestion" - A personalized micro-challenge for today based on what they need (1 sentence)

Be warm, specific, and personal. Don't be generic. Reference their actual data.
Respond ONLY with valid JSON, no markdown.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) {
      const parsed = JSON.parse(text) as DailyContent;
      if (parsed.greeting && parsed.affirmation && parsed.insight && parsed.challengeSuggestion) {
        return parsed;
      }
    }
  } catch {
    // fall through to defaults
  }
  return getStaticDefaults(userContext.name);
}
