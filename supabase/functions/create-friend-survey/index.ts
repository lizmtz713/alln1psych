// Create Friend Survey Link
// POST /functions/v1/create-friend-survey
// Requires auth

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a short, URL-safe token
function generateToken(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { lightId, friendName, senderName } = await req.json();

    if (!lightId || !friendName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lightId, friendName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique token
    let token = generateToken();
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure token is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('friend_survey_links')
        .select('id')
        .eq('token', token)
        .single();

      if (!existing) break;
      token = generateToken();
      attempts++;
    }

    // Create survey link
    const { data: surveyLink, error: insertError } = await supabase
      .from('friend_survey_links')
      .insert({
        user_id: user.id,
        light_id: lightId,
        token,
        friend_name: friendName,
        sender_name: senderName || user.user_metadata?.name || 'Your friend',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create survey link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the survey URL
    const baseUrl = Deno.env.get('SURVEY_BASE_URL') || 'https://getingauge.com';
    const surveyUrl = `${baseUrl}/s/${token}`;

    return new Response(
      JSON.stringify({
        success: true,
        token,
        url: surveyUrl,
        expiresAt: surveyLink.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
