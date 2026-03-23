// Submit Friend Survey (Public)
// POST /functions/v1/submit-friend-survey
// No auth required - friends submit without accounts

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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const {
      token,
      loveLanguage,
      loveLanguageNotes,
      commPreference,
      contactFrequency,
      supportStyle,
      celebrationStyle,
      birthday,
      wishList,
      additionalNotes,
    } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get and validate survey link
    const { data: surveyLink, error: linkError } = await supabase
      .from('friend_survey_links')
      .select('id, expires_at, is_active, completed_at, user_id, light_id')
      .eq('token', token)
      .single();

    if (linkError || !surveyLink) {
      return new Response(
        JSON.stringify({ error: 'Survey not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate survey is still open
    if (new Date(surveyLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This survey link has expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (surveyLink.completed_at) {
      return new Response(
        JSON.stringify({ error: 'This survey has already been completed' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!surveyLink.is_active) {
      return new Response(
        JSON.stringify({ error: 'This survey is no longer active' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert survey response
    const { error: insertError } = await supabase
      .from('friend_survey_responses')
      .insert({
        survey_link_id: surveyLink.id,
        love_language: loveLanguage,
        love_language_notes: loveLanguageNotes,
        comm_preference: commPreference,
        contact_frequency: contactFrequency,
        support_style: supportStyle,
        celebration_style: celebrationStyle,
        birthday: birthday || null,
        wish_list: wishList,
        additional_notes: additionalNotes,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark survey as completed
    await supabase
      .from('friend_survey_links')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', surveyLink.id);

    // TODO: Send push notification to user that friend completed survey

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your responses have been sent.',
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
