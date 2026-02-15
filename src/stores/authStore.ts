/**
 * Holds current user id for use by other stores when syncing to Supabase.
 * Set when session is available; cleared on sign out.
 */

import { create } from 'zustand';

interface AuthStoreState {
  userId: string | null;
  setUserId: (id: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),
  reset: () => set({ userId: null }),
}));
