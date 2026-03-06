/**
 * analyze-checkin — Voice check-in sentiment scoring (Pre-Flight / Post-Flight).
 * Input: { question, transcript, context? }
 * Output: { score: 1-5, insight?: string }
 * Uses GPT-4o-mini with json_object for consistent scoring.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CheckInContext =
  | 'sleep'      // 1=very poor, 5=excellent rest
  | 'highlight'  // 1=no highlight/negative, 5=great highlight
  | 'weighing'   // 1=heavily burdened, 5=nothing weighing on them
  | 'ending'     // 1=ending badly, 5=ending well/calm
  | 'general';

function contextHint(context: string | undefined): string {
  switch (context as CheckInContext) {
    case 'sleep':
      return 'Score 1-5: 1=very poor sleep, 5=excellent rest.';
    case 'highlight':
      return 'Score 1-5: 1=no highlight or negative day, 5=great highlight or very positive day.';
    case 'weighing':
      return 'Score 1-5: 1=heavily burdened, a lot weighing on them; 5=nothing weighing on them, feeling light.';
    case 'ending':
      return 'Score 1-5: 1=ending the day badly or stressed, 5=ending well, calm, at peace.';
    default:
      return 'Score 1-5: 1=very negative, 5=very positive.';
  }
}

const SYSTEM_PROMPT = `You analyze short voice check-in answers. Given a question and the user's spoken transcript, output a JSON object with:
- "score": number 1-5 (integer only)
- "insight": optional one-sentence reflection (warm, non-clinical)

RULES:
- Use ONLY the scale described in the context hint below. Do not invert scales.
- If the transcript is empty or unclear, use score 3 and set insight to something like "Unclear — defaulting to neutral."
- Keep insight brief and supportive, not diagnostic.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { question, transcript, context } = await req.json();
    const hint = contextHint(context);
    const userContent = `Context (use this scale): ${hint}\n\nQuestion: ${question || 'How are you?'}\nAnswer (transcript): ${transcript || '(empty)'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'OpenAI error' }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const raw = data.choices?.[0]?.message?.content ?? '{}';
    let result: { score: number; insight?: string };
    try {
      result = JSON.parse(raw);
    } catch {
      result = { score: 3 };
    }
    const score = Math.max(1, Math.min(5, Math.round(Number(result.score)) || 3));

    return new Response(
      JSON.stringify({ score, insight: result.insight ?? undefined }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
