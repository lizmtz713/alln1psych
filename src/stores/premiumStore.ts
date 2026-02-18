/**
 * Premium subscription store
 * 
 * Free tier: 3 AI conversations/day, all gauges, full manual
 * Premium ($9.99/mo): Unlimited AI, voice mode, unlimited Circle
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PremiumTier = 'free' | 'premium';

export interface PremiumLimits {
  dailyAIConversations: number;
  circleMembers: number;
  voiceEnabled: boolean;
  unlimitedReplay: boolean;
}

const FREE_LIMITS: PremiumLimits = {
  dailyAIConversations: 3,
  circleMembers: 3,
  voiceEnabled: false,
  unlimitedReplay: false,
};

const PREMIUM_LIMITS: PremiumLimits = {
  dailyAIConversations: Infinity,
  circleMembers: Infinity,
  voiceEnabled: true,
  unlimitedReplay: true,
};

interface PremiumState {
  tier: PremiumTier;
  expiresAt: string | null; // ISO date string
  
  // Daily usage tracking
  aiConversationsToday: number;
  lastUsageDate: string | null; // YYYY-MM-DD
  
  // Computed
  isPremium: () => boolean;
  getLimits: () => PremiumLimits;
  canUseAI: () => boolean;
  getRemainingAIChats: () => number;
  
  // Actions
  setPremium: (expiresAt: string) => void;
  clearPremium: () => void;
  incrementAIUsage: () => void;
  resetDailyUsage: () => void;
  
  // For testing/development
  _setTier: (tier: PremiumTier) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      expiresAt: null,
      aiConversationsToday: 0,
      lastUsageDate: null,
      
      isPremium: () => {
        const { tier, expiresAt } = get();
        if (tier !== 'premium') return false;
        if (!expiresAt) return false;
        return new Date(expiresAt) > new Date();
      },
      
      getLimits: () => {
        return get().isPremium() ? PREMIUM_LIMITS : FREE_LIMITS;
      },
      
      canUseAI: () => {
        const state = get();
        if (state.isPremium()) return true;
        
        // Reset if new day
        const today = getToday();
        if (state.lastUsageDate !== today) {
          return true; // Will reset on next increment
        }
        
        return state.aiConversationsToday < FREE_LIMITS.dailyAIConversations;
      },
      
      getRemainingAIChats: () => {
        const state = get();
        if (state.isPremium()) return Infinity;
        
        const today = getToday();
        if (state.lastUsageDate !== today) {
          return FREE_LIMITS.dailyAIConversations;
        }
        
        return Math.max(0, FREE_LIMITS.dailyAIConversations - state.aiConversationsToday);
      },
      
      setPremium: (expiresAt: string) => {
        set({ tier: 'premium', expiresAt });
      },
      
      clearPremium: () => {
        set({ tier: 'free', expiresAt: null });
      },
      
      incrementAIUsage: () => {
        const today = getToday();
        const state = get();
        
        if (state.lastUsageDate !== today) {
          // New day, reset counter
          set({ aiConversationsToday: 1, lastUsageDate: today });
        } else {
          set({ aiConversationsToday: state.aiConversationsToday + 1 });
        }
      },
      
      resetDailyUsage: () => {
        set({ aiConversationsToday: 0, lastUsageDate: getToday() });
      },
      
      _setTier: (tier: PremiumTier) => {
        set({ 
          tier, 
          expiresAt: tier === 'premium' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
            : null 
        });
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        expiresAt: state.expiresAt,
        aiConversationsToday: state.aiConversationsToday,
        lastUsageDate: state.lastUsageDate,
      }),
    }
  )
);

// Helper hook for components
export function usePremium() {
  const isPremium = usePremiumStore((s) => s.isPremium());
  const canUseAI = usePremiumStore((s) => s.canUseAI());
  const remaining = usePremiumStore((s) => s.getRemainingAIChats());
  const limits = usePremiumStore((s) => s.getLimits());
  
  return { isPremium, canUseAI, remaining, limits };
}
