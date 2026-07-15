import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

/**
 * Env boundary (Local / EAS / TestFlight):
 *
 * SAFE to ship in the client binary (EXPO_PUBLIC_*):
 *   - EXPO_PUBLIC_SUPABASE_URL
 *   - EXPO_PUBLIC_SUPABASE_ANON_KEY  (RLS-enforced anon key ONLY)
 *
 * NEVER put in EXPO_PUBLIC_* or app.config extras:
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - OPENAI_API_KEY / any provider secret
 *   Those belong in Supabase Edge Function secrets / EAS server-only env.
 *
 * Resolution order:
 *   1. process.env.EXPO_PUBLIC_* (Metro / EAS injects at build time)
 *   2. expo-constants extra (app.config.js) — still public, same keys only
 */

type PublicExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  eas?: { projectId?: string };
};

function readPublicSupabaseConfig(): { url: string; anonKey: string } {
  const extra = (Constants.expoConfig?.extra ?? {}) as PublicExtra;

  const url =
    (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) ||
    extra.supabaseUrl?.trim() ||
    '';

  const anonKey =
    (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()) ||
    extra.supabaseAnonKey?.trim() ||
    '';

  if (!url || !anonKey) {
    throw new Error(
      '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set them in .env for local, and via EAS env for preview/TestFlight builds. ' +
        'Never use the service_role key in the client.'
    );
  }

  // Hard fail if service role was ever injected into the client env surface.
  const serviceRoleLeak =
    (typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
  if (serviceRoleLeak) {
    throw new Error(
      '[supabase] SUPABASE_SERVICE_ROLE_KEY must never be present in the mobile client bundle. ' +
        'Remove it from .env / EAS public env. Use Edge Functions only.'
    );
  }

  return { url, anonKey };
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = readPublicSupabaseConfig();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
