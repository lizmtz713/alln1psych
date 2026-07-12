import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { destroyLocalSessionState } from '../services/sessionReset';
import { useAuthStore } from '../stores/authStore';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** True when session came from a password-recovery link — do not hydrate Cockpit. */
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (idToken: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const UNAUTHENTICATED_ROUTE = '/(auth)/sign-in' as const;
const PASSWORD_RECOVERY_ROUTE = '/(auth)/reset-password-confirm' as const;

/**
 * Fail-safe sign-out.
 * 1) try: fire local Supabase sign-out (do not hang on network)
 * 2) finally: wipe React Query + Zustand + AsyncStorage (best-effort)
 * 3) always: force navigate to auth, even if everything above failed
 */
export async function performSignOut(): Promise<void> {
  try {
    useAuthStore.getState().setPasswordRecovery(false);
  } catch {
    /* ignore */
  }
  try {
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
  const isPasswordRecovery = useAuthStore((s) => s.isPasswordRecovery);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // PASSWORD_RECOVERY is not a normal login — freeze dashboard routing + hydration.
      if (event === 'PASSWORD_RECOVERY') {
        useAuthStore.getState().setPasswordRecovery(true);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
        try {
          router.replace(PASSWORD_RECOVERY_ROUTE);
        } catch {
          try {
            router.push(PASSWORD_RECOVERY_ROUTE);
          } catch {
            /* index Redirect will still catch isPasswordRecovery */
          }
        }
        return;
      }

      if (!nextSession) {
        // Do not destroy mid-recovery UI transitions that briefly clear session.
        if (useAuthStore.getState().isPasswordRecovery && event !== 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          return;
        }
        useAuthStore.getState().setPasswordRecovery(false);
        setSession(null);
        setUser(null);
        // Sign-out path already navigates via performSignOut; avoid fighting recovery screens.
        if (event === 'SIGNED_OUT') {
          try {
            destroyLocalSessionState();
          } catch {
            /* ignore */
          }
        }
        return;
      }

      // Normal authenticated session (SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, etc.)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // USER_UPDATED after password change — leave recovery flag until confirm screen clears it.
        if (event === 'SIGNED_IN') {
          // A fresh password sign-in is never recovery.
          if (!useAuthStore.getState().isPasswordRecovery) {
            useAuthStore.getState().setPasswordRecovery(false);
          }
        }
      }

      setSession(nextSession);
      setUser(nextSession.user ?? null);
      setLoading(false);
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
    useAuthStore.getState().setPasswordRecovery(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async (idToken: string): Promise<{ error: Error | null }> => {
    useAuthStore.getState().setPasswordRecovery(false);
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    setSession(null);
    setUser(null);
    await performSignOut();
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Deep link into the confirm screen when the recovery token arrives.
      redirectTo: undefined,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const clearPasswordRecovery = () => {
    useAuthStore.getState().setPasswordRecovery(false);
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearPasswordRecovery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
