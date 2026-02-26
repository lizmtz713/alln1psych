/**
 * Share Edge Function
 * 
 * Handles creating and viewing Operating Snapshots.
 * No raw gauge numbers — only plain-language summaries.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateShareRequest {
  displayName?: string;
  currentMode: 'capacity' | 'stabilization';
  modeMessage?: string;
  helpsText?: string[];
  doesntHelpText?: string[];
  customMessage?: string;
  expiresInHours?: number; // Default 24, max 168 (7 days)
}

interface ShareResponse {
  token: string;
  shareUrl: string;
  expiresAt: string;
}

interface ViewShareResponse {
  displayName: string | null;
  currentMode: 'capacity' | 'stabilization';
  modeMessage: string;
  helpsText: string[];
  doesntHelpText: string[];
  customMessage: string | null;
  createdAt: string;
  expiresAt: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // GET /share/:token - View a share (public)
    if (req.method === 'GET' && pathParts.length >= 2) {
      const token = pathParts[pathParts.length - 1];
      
      // Fetch share
      const { data: share, error } = await supabaseClient
        .from('shared_snapshots')
        .select('*')
        .eq('token', token)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !share) {
        return new Response(
          JSON.stringify({ error: 'Share not found or expired' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment view count
      await supabaseClient.rpc('increment_share_views', { share_token: token });

      const response: ViewShareResponse = {
        displayName: share.display_name,
        currentMode: share.current_mode,
        modeMessage: share.mode_message || (share.current_mode === 'capacity' ? 'System stable' : 'Foundation needs attention'),
        helpsText: share.helps_text || [],
        doesntHelpText: share.doesnt_help_text || [],
        customMessage: share.custom_message,
        createdAt: share.created_at,
        expiresAt: share.expires_at,
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /share - Create a share (authenticated)
    if (req.method === 'POST') {
      // Get auth token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body: CreateShareRequest = await req.json();
      
      // Validate expiry (max 7 days)
      const expiresInHours = Math.min(body.expiresInHours || 24, 168);
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      // Generate token
      const { data: tokenData } = await supabaseClient.rpc('generate_share_token');
      const shareToken = tokenData || crypto.randomUUID().replace(/-/g, '');

      // Create share
      const { data: share, error: createError } = await supabaseClient
        .from('shared_snapshots')
        .insert({
          user_id: user.id,
          token: shareToken,
          display_name: body.displayName || null,
          current_mode: body.currentMode,
          mode_message: body.modeMessage,
          helps_text: body.helpsText || [],
          doesnt_help_text: body.doesntHelpText || [],
          custom_message: body.customMessage || null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Create share error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create share' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build share URL
      const baseUrl = Deno.env.get('SHARE_BASE_URL') || 'https://ingauge.app/share';
      const shareUrl = `${baseUrl}/${shareToken}`;

      const response: ShareResponse = {
        token: shareToken,
        shareUrl,
        expiresAt: expiresAt.toISOString(),
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /share/:token - Revoke a share (authenticated)
    if (req.method === 'DELETE' && pathParts.length >= 2) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authToken = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authToken);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const shareToken = pathParts[pathParts.length - 1];

      // Revoke (soft delete)
      const { error: revokeError } = await supabaseClient
        .from('shared_snapshots')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token', shareToken)
        .eq('user_id', user.id);

      if (revokeError) {
        return new Response(
          JSON.stringify({ error: 'Failed to revoke share' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Share function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
