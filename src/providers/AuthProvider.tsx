import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { destroyLocalSessionState } from '../services/sessionReset';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Auth screen for unauthenticated users — Expo Router file group `(auth)/sign-in`. */
const UNAUTHENTICATED_ROUTE = '/(auth)/sign-in' as const;

/**
 * Fail-safe sign-out.
 * 1) try: fire local Supabase sign-out (do not hang on network)
 * 2) finally: wipe React Query + Zustand + AsyncStorage (best-effort)
 * 3) always: force navigate to auth, even if everything above failed
 */
export async function performSignOut(): Promise<void> {
  try {
    // Clear React session immediately so UI unmounts protected trees without waiting on I/O.
    // Local scope avoids a blocking remote revoke that freezes physical devices offline.
    void supabase.auth.signOut({ scope: 'local' }).catch(() => {
      /* network / storage — ignore */
    });
  } catch {
    /* never block logout */
  } finally {
    try {
      destroyLocalSessionState();
    } catch {
      /* never block logout */
    }
    try {
      router.replace(UNAUTHENTICATED_ROUTE);
    } catch {
      try {
        router.push(UNAUTHENTICATED_ROUTE);
      } catch {
        /* navigation unavailable — AuthSync / index Redirect will still gate */
      }
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() || 'Friend' } },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async (idToken: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    // Optimistic UI: drop session state so tabs unmount even if SecureStore lags.
    setSession(null);
    setUser(null);
    await performSignOut();
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
