/**
 * Premium subscription store
 * 
 * PRICING:
 * - Free: Crisis 24/7, 3 AI chats/day, all gauges, full manual
 * - Pro ($9.99/mo): Unlimited AI, voice, full Circle, Personology deep dives
 * - Family ($15/mo for 5): Pro for everyone, shared family Circle
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PremiumTier = 'free' | 'pro' | 'family';

export interface PremiumLimits {
  dailyAIConversations: number;
  circleMembers: number;
  voiceEnabled: boolean;
  unlimitedReplay: boolean;
  personologyDeepDives: boolean;
  familyCircle: boolean;
}

const FREE_LIMITS: PremiumLimits = {
  dailyAIConversations: 3,
  circleMembers: 3,
  voiceEnabled: false,
  unlimitedReplay: false,
  personologyDeepDives: false,
  familyCircle: false,
};

// "Unlimited" = 100/day (way more than anyone needs, protects against abuse)
// Average user does 3-5/day, power users maybe 20
// 100/day = ~3000/month = still reasonable API costs
const PRO_LIMITS: PremiumLimits = {
  dailyAIConversations: 100, // "Unlimited" with fair use cap
  circleMembers: Infinity,
  voiceEnabled: true,
  unlimitedReplay: true,
  personologyDeepDives: true,
  familyCircle: false,
};

const FAMILY_LIMITS: PremiumLimits = {
  dailyAIConversations: 100, // Per family member
  circleMembers: Infinity,
  voiceEnabled: true,
  unlimitedReplay: true,
  personologyDeepDives: true,
  familyCircle: true,
};

export const PRICING = {
  pro: {
    monthly: 4.99,
    yearly: 39.99, // $3.33/mo - CHEAPEST premium mental health app
    yearlyPerMonth: 3.33,
    savings: 20,
    productId: 'ingauge_pro_monthly',
    yearlyProductId: 'ingauge_pro_yearly',
  },
  family: {
    monthly: 7.99,
    yearly: 59.99, // $5/mo for 5 people = $12/person/year!
    yearlyPerMonth: 5.00,
    savings: 36,
    maxMembers: 5,
    productId: 'ingauge_family_monthly',
    yearlyProductId: 'ingauge_family_yearly',
  },
} as const;

interface PremiumState {
  tier: PremiumTier;
  expiresAt: string | null; // ISO date string
  familyOwnerId: string | null; // For family members
  
  // Daily usage tracking
  aiConversationsToday: number;
  lastUsageDate: string | null; // YYYY-MM-DD
  
  // Computed
  isPremium: () => boolean;
  isPro: () => boolean;
  isFamily: () => boolean;
  getLimits: () => PremiumLimits;
  canUseAI: () => boolean;
  getRemainingAIChats: () => number;
  
  // Actions
  setPro: (expiresAt: string) => void;
  setFamily: (expiresAt: string, ownerId?: string) => void;
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
      familyOwnerId: null,
      aiConversationsToday: 0,
      lastUsageDate: null,
      
      isPremium: () => {
        const { tier, expiresAt } = get();
        if (tier === 'free') return false;
        if (!expiresAt) return false;
        return new Date(expiresAt) > new Date();
      },
      
      isPro: () => {
        const state = get();
        return state.isPremium() && state.tier === 'pro';
      },
      
      isFamily: () => {
        const state = get();
        return state.isPremium() && state.tier === 'family';
      },
      
      getLimits: () => {
        const state = get();
        if (!state.isPremium()) return FREE_LIMITS;
        if (state.tier === 'family') return FAMILY_LIMITS;
        return PRO_LIMITS;
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
      
      setPro: (expiresAt: string) => {
        set({ tier: 'pro', expiresAt, familyOwnerId: null });
      },
      
      setFamily: (expiresAt: string, ownerId?: string) => {
        set({ tier: 'family', expiresAt, familyOwnerId: ownerId || null });
      },
      
      clearPremium: () => {
        set({ tier: 'free', expiresAt: null, familyOwnerId: null });
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
          expiresAt: tier !== 'free' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
            : null,
          familyOwnerId: null,
        });
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        expiresAt: state.expiresAt,
        familyOwnerId: state.familyOwnerId,
        aiConversationsToday: state.aiConversationsToday,
        lastUsageDate: state.lastUsageDate,
      }),
    }
  )
);

// Helper hook for components
export function usePremium() {
  const tier = usePremiumStore((s) => s.tier);
  const isPremium = usePremiumStore((s) => s.isPremium());
  const isPro = usePremiumStore((s) => s.isPro());
  const isFamily = usePremiumStore((s) => s.isFamily());
  const canUseAI = usePremiumStore((s) => s.canUseAI());
  const remaining = usePremiumStore((s) => s.getRemainingAIChats());
  const limits = usePremiumStore((s) => s.getLimits());
  
  return { tier, isPremium, isPro, isFamily, canUseAI, remaining, limits };
}
