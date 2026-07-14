import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  const auth = req.headers.get('Authorization');
  if (!url || !anon || !serviceRole || !openAIKey) return json({ error: 'Transcription is not configured' }, 503);
  if (!auth?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);

  const client = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return json({ error: 'Invalid session' }, 401);
  const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const { count, error: usageError } = await admin
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dayAgo);
  if (usageError) return json({ error: 'Usage controls unavailable' }, 503);
  if ((count ?? 0) >= 500) return json({ error: 'Daily AI limit reached' }, 429);

  const body = await req.json().catch(() => null) as { audio?: unknown; mimeType?: unknown } | null;
  const audio = typeof body?.audio === 'string' ? body.audio : '';
  if (!audio) return json({ error: 'Audio is required' }, 400);
  if (audio.length > 12_000_000) return json({ error: 'Audio is too large' }, 413);

  try {
    const bytes = decodeBase64(audio);
    const form = new FormData();
    form.append('model', 'whisper-1');
    form.append('file', new Blob([bytes], { type: typeof body?.mimeType === 'string' ? body.mimeType : 'audio/m4a' }), 'debrief.m4a');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openAIKey}` },
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const payload = await response.json().catch(() => ({})) as { text?: string };
    const success = response.ok && typeof payload.text === 'string';
    await admin.from('ai_usage_events').insert({
      user_id: user.id, request_id: requestId, feature: 'transcribe',
      prompt_version: 'voice-transcription-v1', input_chars: audio.length,
      latency_ms: Date.now() - startedAt, status: success ? 'success' : 'provider_error',
    });
    if (!success) return json({ error: 'Transcription unavailable' }, 502);
    return json({ transcript: payload.text.slice(0, 12_000) });
  } catch (error) {
    await admin.from('ai_usage_events').insert({
      user_id: user.id, request_id: requestId, feature: 'transcribe',
      prompt_version: 'voice-transcription-v1', input_chars: audio.length,
      latency_ms: Date.now() - startedAt,
      status: error instanceof DOMException && error.name === 'AbortError' ? 'timeout' : 'provider_error',
    });
    return json({ error: 'Transcription unavailable' }, 502);
  }
});
