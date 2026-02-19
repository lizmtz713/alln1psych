// Share Insight Edge Function
// Handles creating shareable links and retrieving shared content

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateShareRequest {
  insightType: 'manual_lesson' | 'discovery' | 'ai_response' | 'relate_insight' | 'replay_insight';
  insightId?: string;
  title: string;
  summary: string;
  keyPoints?: string[];
  deepContent?: string;
  science?: string;
  realWorldExamples?: string[];
  tryThis?: string;
  sourceLabel: string;
  senderName: string;
  senderContext?: string;
  recipientType?: 'family' | 'friend' | 'partner' | 'coworker' | 'other';
  // Academic backing
  connectedGauges?: string[];
  academicSources?: { author: string; insight: string }[];
}

interface RespondRequest {
  shortCode: string;
  responseType: 'relate' | 'helped' | 'different' | 'talk' | 'written';
  responseText?: string;
  responderName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // GET /share-insight/:code - Get shared insight (public)
    if (req.method === 'GET' && path && path !== 'share-insight') {
      const shortCode = path;
      
      // Fetch the shared insight
      const { data: insight, error } = await supabase
        .from('shared_insights')
        .select('*')
        .eq('short_code', shortCode)
        .single();

      if (error || !insight) {
        return new Response(
          JSON.stringify({ error: 'Insight not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check expiration
      if (insight.expires_at && new Date(insight.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'This link has expired' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment view count
      await supabase
        .from('shared_insights')
        .update({ view_count: (insight.view_count || 0) + 1 })
        .eq('id', insight.id);

      return new Response(
        JSON.stringify({
          title: insight.title,
          summary: insight.summary,
          keyPoints: insight.key_points,
          deepContent: insight.deep_content,
          science: insight.science,
          realWorldExamples: insight.real_world_examples,
          tryThis: insight.try_this,
          sourceLabel: insight.source_label,
          senderName: insight.sender_name,
          senderContext: insight.sender_context,
          recipientType: insight.recipient_type,
          insightType: insight.insight_type,
          createdAt: insight.created_at,
          connectedGauges: insight.connected_gauges,
          academicSources: insight.academic_sources,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /share-insight - Create a new share (authenticated)
    if (req.method === 'POST' && path === 'share-insight') {
      // Get auth token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body: CreateShareRequest = await req.json();

      // Validate required fields
      if (!body.title || !body.summary || !body.senderName || !body.sourceLabel || !body.insightType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the share
      const { data: share, error: insertError } = await supabase
        .from('shared_insights')
        .insert({
          user_id: user.id,
          insight_type: body.insightType,
          insight_id: body.insightId,
          title: body.title,
          summary: body.summary,
          key_points: body.keyPoints,
          deep_content: body.deepContent,
          science: body.science,
          real_world_examples: body.realWorldExamples,
          try_this: body.tryThis,
          source_label: body.sourceLabel,
          sender_name: body.senderName,
          sender_context: body.senderContext,
          recipient_type: body.recipientType,
          connected_gauges: body.connectedGauges,
          academic_sources: body.academicSources,
        })
        .select('short_code')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create share' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const shareUrl = `https://getingauge.com/insight/${share.short_code}`;

      return new Response(
        JSON.stringify({
          shortCode: share.short_code,
          url: shareUrl,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /share-insight/respond - Submit a response (public)
    if (req.method === 'POST' && path === 'respond') {
      const body: RespondRequest = await req.json();

      if (!body.shortCode || !body.responseType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the insight ID from short code
      const { data: insight, error: fetchError } = await supabase
        .from('shared_insights')
        .select('id, user_id')
        .eq('short_code', body.shortCode)
        .single();

      if (fetchError || !insight) {
        return new Response(
          JSON.stringify({ error: 'Insight not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the response
      const { error: insertError } = await supabase
        .from('insight_responses')
        .insert({
          insight_id: insight.id,
          response_type: body.responseType,
          response_text: body.responseText,
          responder_name: body.responderName,
        });

      if (insertError) {
        console.error('Response insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // TODO: Send notification to the sharer (push notification or in-app)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
