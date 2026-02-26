/**
 * Oura OAuth Edge Function
 * 
 * Handles the OAuth callback from Oura Ring:
 * 1. Receives auth code from Oura
 * 2. Exchanges code for access token
 * 3. Stores token securely for the user
 * 4. Redirects back to the app
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token';

// These should be set in Supabase Edge Function secrets
const OURA_CLIENT_ID = Deno.env.get('OURA_CLIENT_ID') || '';
const OURA_CLIENT_SECRET = Deno.env.get('OURA_CLIENT_SECRET') || '';
const REDIRECT_URI = Deno.env.get('OURA_REDIRECT_URI') || 'https://YOUR_PROJECT.supabase.co/functions/v1/oura-oauth';
const APP_REDIRECT = 'ingauge://oauth/oura/callback';

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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state'); // Contains user ID if we passed it
    
    // Handle OAuth errors
    if (error) {
      console.error('Oura OAuth error:', error);
      return Response.redirect(`${APP_REDIRECT}?error=${encodeURIComponent(error)}`);
    }

    // Validate code
    if (!code) {
      return Response.redirect(`${APP_REDIRECT}?error=missing_code`);
    }

    // Exchange code for token
    const tokenResponse = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: OURA_CLIENT_ID,
        client_secret: OURA_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return Response.redirect(`${APP_REDIRECT}?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token) {
      return Response.redirect(`${APP_REDIRECT}?error=no_access_token`);
    }

    // If we have a user ID in state, store the token in Supabase
    if (state) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Store token (encrypted in production)
      const { error: dbError } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: state,
          integration: 'oura',
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,integration',
        });

      if (dbError) {
        console.error('Failed to store token:', dbError);
        // Still redirect with token so app can store it locally
      }
    }

    // Redirect back to app with token
    // In production, consider passing a one-time code instead of the raw token
    return Response.redirect(
      `${APP_REDIRECT}?access_token=${encodeURIComponent(access_token)}&expires_in=${expires_in}`
    );

  } catch (err) {
    console.error('Oura OAuth error:', err);
    return Response.redirect(`${APP_REDIRECT}?error=server_error`);
  }
});

/**
 * Token refresh function (can be called separately)
 */
export async function refreshOuraToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  try {
    const response = await fetch(OURA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OURA_CLIENT_ID,
        client_secret: OURA_CLIENT_SECRET,
      }).toString(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
