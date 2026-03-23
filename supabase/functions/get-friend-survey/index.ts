// Get Friend Survey (Public)
// GET /functions/v1/get-friend-survey?token=abc123
// No auth required - this is the public survey page

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get token from query params
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role (to bypass RLS for public access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get survey link
    const { data: surveyLink, error } = await supabase
      .from('friend_survey_links')
      .select('id, friend_name, sender_name, expires_at, is_active, completed_at')
      .eq('token', token)
      .single();

    if (error || !surveyLink) {
      return new Response(
        JSON.stringify({ error: 'Survey not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(surveyLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This survey link has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already completed
    if (surveyLink.completed_at) {
      return new Response(
        JSON.stringify({ error: 'This survey has already been completed' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if deactivated
    if (!surveyLink.is_active) {
      return new Response(
        JSON.stringify({ error: 'This survey is no longer active' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return survey info (no sensitive data)
    return new Response(
      JSON.stringify({
        success: true,
        survey: {
          friendName: surveyLink.friend_name,
          senderName: surveyLink.sender_name,
        },
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
