import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const ALLOWED_VOICES = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']);
const MAX_REQUESTS_PER_DAY = 200;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  const authHeader = req.headers.get('Authorization');
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !openAIKey) {
    return json({ error: 'Voice service is not configured' }, 503);
  }
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return json({ error: 'Invalid or expired session' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [minuteUsage, dailyUsage] = await Promise.all([
    admin
      .from('ai_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', minuteAgo),
    admin
      .from('ai_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('feature', 'tts')
      .gte('created_at', dayAgo),
  ]);
  if (minuteUsage.error || dailyUsage.error) return json({ error: 'Usage controls unavailable' }, 503);
  if ((minuteUsage.count ?? 0) >= 30) return json({ error: 'Too many requests. Try again in a minute.' }, 429);
  if ((dailyUsage.count ?? 0) >= MAX_REQUESTS_PER_DAY) return json({ error: 'Daily voice limit reached' }, 429);

  const rawBody = await req.text();
  if (rawBody.length > 6_000) return json({ error: 'Request is too large' }, 413);
  let body: { text?: unknown; voice?: unknown };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (typeof body.text !== 'string' || body.text.trim().length === 0 || body.text.length > 4_096) {
    return json({ error: 'Text must contain between 1 and 4096 characters' }, 400);
  }
  const voice = typeof body.voice === 'string' && ALLOWED_VOICES.has(body.voice) ? body.voice : 'nova';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let providerResponse: Response;
  try {
    providerResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'tts-1',
        input: body.text,
        voice,
        response_format: 'mp3',
      }),
    });
  } catch (error) {
    const status = error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'provider_error';
    await admin.from('ai_usage_events').insert({
      user_id: user.id,
      request_id: requestId,
      feature: 'tts',
      prompt_version: 'tts-v1',
      input_chars: body.text.length,
      output_tokens: null,
      latency_ms: Date.now() - startedAt,
      status,
    });
    return json({ error: status === 'timeout' ? 'Voice request timed out' : 'Voice provider unavailable' }, 504);
  } finally {
    clearTimeout(timeout);
  }

  if (!providerResponse.ok) {
    await admin.from('ai_usage_events').insert({
      user_id: user.id,
      request_id: requestId,
      feature: 'tts',
      prompt_version: 'tts-v1',
      input_chars: body.text.length,
      output_tokens: null,
      latency_ms: Date.now() - startedAt,
      status: 'provider_error',
    });
    return json({ error: 'Voice provider unavailable' }, 502);
  }

  const bytes = new Uint8Array(await providerResponse.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768));
  }
  await admin.from('ai_usage_events').insert({
    user_id: user.id,
    request_id: requestId,
    feature: 'tts',
    prompt_version: 'tts-v1',
    input_chars: body.text.length,
    output_tokens: null,
    latency_ms: Date.now() - startedAt,
    status: 'success',
  });
  return json({ audio: btoa(binary) }, 200);
});
