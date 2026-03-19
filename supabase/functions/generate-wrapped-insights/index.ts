/**
 * Life Wrapped — AI insights edge function.
 * Rich InGauge context, score bars, best/hardest days, streak. Fallback when AI unavailable.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the InGauge Life Wrapped insight writer. You write 3 short, warm, personalized insights for a user's year-in-review based on their activity data.

InGauge is an emotional intelligence operating system — not therapy, not meditation. It has 6 gauges:
- Body: sleep, fuel, movement. If this is off, everything feels off.
- State: nervous system (calm, alert, threatened, overstimulated).
- Emotion: emotional clarity — how clearly they can name what they feel.
- Connection: belonging, safety, being seen by others.
- Direction: purpose, agency, forward movement.
- Alignment: actions matching values.

Tone: warm, non-clinical, "we see you." No jargon. Short sentences. You are a companion, not a coach.
Output: exactly 3 insight strings. Each 1-2 sentences. No numbering or bullets in the strings.
Example good insights:
- "You showed up even on the days that felt impossible. That's not nothing."
- "Your connection log tells a story: you reached out. That takes courage."
- "State had its dips. You still did your Pre-Flights. That's the work."`;

function buildUserPrompt(payload: {
  stats?: Record<string, number>;
  scoreBars?: Record<string, string>;
  totalMoments?: number;
  bestDay?: { date: string; label: string };
  hardestDay?: { date: string; label: string };
  streakDays?: number;
  highMonth?: { month: number; label: string; value: number };
  lowMonth?: { month: number; label: string; value: number };
}): string {
  const stats = payload.stats ?? {};
  const bars = payload.scoreBars ?? {};
  const lines: string[] = [
    'User activity this year:',
    `Check-ins: ${stats.checkIns ?? 0} ${bars.checkIns ? `[${bars.checkIns}]` : ''}`,
    `Journal entries: ${stats.journalEntries ?? 0} ${bars.journalEntries ? `[${bars.journalEntries}]` : ''}`,
    `Connections logged: ${stats.connectionLogs ?? 0} ${bars.connectionLogs ? `[${bars.connectionLogs}]` : ''}`,
    `Pre-Flights: ${stats.preFlights ?? 0} ${bars.preFlights ? `[${bars.preFlights}]` : ''}`,
    `Post-Flights: ${stats.postFlights ?? 0} ${bars.postFlights ? `[${bars.postFlights}]` : ''}`,
    `Total moments: ${payload.totalMoments ?? 0}`,
  ];
  if (payload.streakDays != null) lines.push(`Longest streak: ${payload.streakDays} days`);
  if (payload.bestDay) lines.push(`Best day: ${payload.bestDay.label} (${payload.bestDay.date})`);
  if (payload.hardestDay) lines.push(`Hardest day: ${payload.hardestDay.label} (${payload.hardestDay.date})`);
  if (payload.highMonth) lines.push(`Peak month: ${payload.highMonth.label} (${payload.highMonth.value} check-ins)`);
  if (payload.lowMonth) lines.push(`Quieter month: ${payload.lowMonth.label} (${payload.lowMonth.value} check-ins)`);
  lines.push('');
  lines.push('Write 3 personalized insights as a JSON array of strings, e.g. ["insight one", "insight two", "insight three"]');
  return lines.join('\n');
}

function fallbackInsights(payload: {
  stats?: Record<string, number>;
  totalMoments?: number;
}): string[] {
  const stats = payload.stats ?? {};
  const total = payload.totalMoments ?? 0;
  const insights: string[] = [];
  if (total >= 100) {
    insights.push("You showed up more than a hundred times this year. That's not luck — that's you.");
  } else if (total >= 50) {
    insights.push("You're building something real. Fifty-plus moments of checking in with yourself.");
  } else if (total >= 1) {
    insights.push('Every moment you logged this year mattered. You started.');
  }
  if ((stats.journalEntries ?? 0) > 0) {
    insights.push(`You captured ${stats.journalEntries} moments in your journal. Those words are yours to keep.`);
  }
  if ((stats.connectionLogs ?? 0) > 0) {
    insights.push(`You logged ${stats.connectionLogs} connections. Reaching out counts.`);
  }
  while (insights.length < 3) {
    insights.push('You Are Not Alone. We see you.');
  }
  return insights.slice(0, 3);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      stats?: Record<string, number>;
      scoreBars?: Record<string, string>;
      totalMoments?: number;
      bestDay?: { date: string; label: string };
      hardestDay?: { date: string; label: string };
      streakDays?: number;
      highMonth?: { month: number; label: string; value: number };
      lowMonth?: { month: number; label: string; value: number };
    };
    const userPrompt = buildUserPrompt(body);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content) as { insights?: string[] } | string[];
          const list = Array.isArray(parsed) ? parsed : parsed?.insights;
          if (Array.isArray(list) && list.length > 0) {
            const insights = list.slice(0, 3).filter((s): s is string => typeof s === 'string');
            if (insights.length > 0) {
              return new Response(JSON.stringify({ insights }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              });
            }
          }
        }
      }
    }

    const insights = fallbackInsights(body);
    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (_) {
    const insights = fallbackInsights({});
    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
