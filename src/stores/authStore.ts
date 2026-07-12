/**
 * Holds current user id for use by other stores when syncing to Supabase.
 * Set when session is available; cleared on sign out.
 */

import { create } from 'zustand';

interface AuthStoreState {
  userId: string | null;
  /** True while handling PASSWORD_RECOVERY — freezes Cockpit hydration + normal routing. */
  isPasswordRecovery: boolean;
  setUserId: (id: string | null) => void;
  setPasswordRecovery: (active: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  userId: null,
  isPasswordRecovery: false,
  setUserId: (userId) => set({ userId }),
  setPasswordRecovery: (isPasswordRecovery) => set({ isPasswordRecovery }),
  reset: () => set({ userId: null, isPasswordRecovery: false }),
}));
