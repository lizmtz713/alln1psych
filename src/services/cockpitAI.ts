/**
 * Cockpit AI — cross-system insight from the 6 gauges + health data.
 * Uses OpenAI when available; falls back to hardcoded patterns.
 */

import { buildKnowledgePrompt } from '../data/psychKnowledge';
import { sendMessageWithSystemPrompt } from './ai';

export interface CockpitGauges {
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

export interface HealthContext {
  sleepHours?: number;
  sleepQuality?: string;
  steps?: number;
  exerciseMinutes?: number;
  waterOz?: number;
  hrv?: number;
  cyclePhase?: string;
  cycleDay?: number;
}

export interface SpotifyContext {
  averageValence?: number;    // 0-1: positivity/happiness in music
  averageEnergy?: number;     // 0-1: energy level of music
  moodLabel?: string;         // e.g., "Melancholic & Reflective"
  trackCount?: number;        // how many tracks in the window
  moodScore?: number;         // 0-100 composite score
}

export async function generateCrossSystemInsight(
  gauges: CockpitGauges,
  healthData?: HealthContext,
  spotifyData?: SpotifyContext
): Promise<string | null> {
  const active = Object.values(gauges).filter((v) => v >= 0);
  if (active.length < 3) return null;

  // Build health context string
  let healthContext = '';
  if (healthData) {
    const parts: string[] = [];
    if (healthData.sleepHours !== undefined) {
      parts.push(`Sleep: ${healthData.sleepHours.toFixed(1)}h (${healthData.sleepQuality || 'unknown'})`);
    }
    if (healthData.steps !== undefined) {
      parts.push(`Steps: ${healthData.steps.toLocaleString()}`);
    }
    if (healthData.exerciseMinutes !== undefined && healthData.exerciseMinutes > 0) {
      parts.push(`Exercise: ${healthData.exerciseMinutes}min`);
    }
    if (healthData.waterOz !== undefined && healthData.waterOz > 0) {
      parts.push(`Water: ${healthData.waterOz}oz`);
    }
    if (healthData.hrv !== undefined) {
      parts.push(`HRV: ${healthData.hrv}ms`);
    }
    if (healthData.cyclePhase) {
      parts.push(`Cycle: Day ${healthData.cycleDay}, ${healthData.cyclePhase}`);
    }
    if (parts.length > 0) {
      healthContext = `\n\nHEALTH DATA (from Apple Health):\n${parts.join(' | ')}`;
    }
  }

  // Build Spotify/music context string
  let musicContext = '';
  if (spotifyData && (spotifyData.averageValence !== undefined || spotifyData.moodLabel)) {
    const parts: string[] = [];
    if (spotifyData.moodLabel) {
      parts.push(`Mood: ${spotifyData.moodLabel}`);
    }
    if (spotifyData.averageValence !== undefined) {
      parts.push(`Positivity: ${Math.round(spotifyData.averageValence * 100)}%`);
    }
    if (spotifyData.averageEnergy !== undefined) {
      parts.push(`Energy: ${Math.round(spotifyData.averageEnergy * 100)}%`);
    }
    if (spotifyData.trackCount !== undefined) {
      parts.push(`Tracks (24h): ${spotifyData.trackCount}`);
    }
    if (parts.length > 0) {
      musicContext = `\n\nMUSIC LISTENING (from Spotify, last 24h):\n${parts.join(' | ')}`;
    }
  }

  const systemPrompt = `You are the AI brain of a Human Cockpit — a 6-gauge emotional regulation system. You read all gauges AND health data together and provide ONE brief insight (2-3 sentences max) about how the user's systems are interacting.

The 6 gauges (0-100 scale, -1 means not checked):
- Body (sleep, nutrition, hydration, movement): ${gauges.body}
- State (nervous system: calm to shutdown): ${gauges.state}
- Emotion (emotional clarity): ${gauges.emotion}
- Connection (belonging, being seen): ${gauges.connection}
- Direction (purpose, momentum): ${gauges.direction}
- Alignment (actions matching values): ${gauges.alignment}${healthContext}${musicContext}

Rules:
- Read the PATTERN across gauges, not individual numbers
- Tell them what's CONNECTED: "Your anxiety might be coming from your body, not your emotions"
- Be direct but warm
- Never use clinical jargon
- If everything is high, acknowledge what they're doing right
- If something is low, name it without judgment and suggest which gauge to address first
- Always ground it in how the systems affect each other
- Sound like a wise friend who happens to understand neuroscience, not a therapist
- If music data is present, note patterns: low-energy music + low State = seeking calm; high-energy music + low Body = pushing through fatigue; melancholic music + low Emotion = processing something
- Music choices often reveal what the body/mind is seeking before we're conscious of it`;

  const knowledge = buildKnowledgePrompt(gauges);
  const systemPromptWithKnowledge = systemPrompt + knowledge;

  try {
    const response = await sendMessageWithSystemPrompt(
      [
        {
          role: 'user',
          content:
            'Read my gauges and give me one insight about how my systems are interacting right now.',
        },
      ],
      systemPromptWithKnowledge
    );
    // Check for error responses (AI service returns string like "[AI Error: ...]")
    if (!response || response.startsWith('[AI Error') || response.includes('error')) {
      return getHardcodedInsight(gauges);
    }
    return response.trim();
  } catch {
    return getHardcodedInsight(gauges);
  }
}

function getHardcodedInsight(gauges: CockpitGauges): string | null {
  const insights: string[] = [];

  if (gauges.body >= 0 && gauges.body < 40 && gauges.emotion >= 0 && gauges.emotion < 50) {
    insights.push(
      "Your emotional state may be tied to your body. Low sleep and nutrition amplify anxiety by up to 30%. Address your Body gauge first."
    );
  }
  if (gauges.state >= 0 && gauges.state < 40 && gauges.connection >= 0 && gauges.connection < 40) {
    insights.push(
      "You're in a stressed state AND feeling disconnected. That's the hardest combination for your brain. Even a short conversation with someone safe can shift both gauges."
    );
  }
  if (
    gauges.direction >= 0 &&
    gauges.direction < 40 &&
    gauges.alignment >= 0 &&
    gauges.alignment < 40
  ) {
    insights.push(
      "Low direction and low alignment together can feel like depression. It's often not — it's a navigation problem. Let's revisit what matters to you."
    );
  }
  const active = Object.values(gauges).filter((v) => v >= 0);
  if (active.length >= 4 && active.every((v) => v >= 70)) {
    insights.push(
      'Your systems are well-regulated. This is what balance feels like. Take note of what you did to get here.'
    );
  }

  return insights.length > 0 ? insights[0] : null;
}
