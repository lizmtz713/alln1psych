/**
 * Weekly Insight Store — generates and caches weekly personalized insights.
 */

import { create } from 'zustand';
import type { WeeklyInsight } from '../types/weeklyInsight';

interface WeeklyInsightState {
  insight: WeeklyInsight | null;
  isGenerating: boolean;
  lastFetched: Date | null;
  getInsight: () => Promise<WeeklyInsight | null>;
  clearInsight: () => void;
}

function getWeekOfLabel(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export const useWeeklyInsightStore = create<WeeklyInsightState>((set, get) => ({
  insight: null,
  isGenerating: false,
  lastFetched: null,

  getInsight: async () => {
    const state = get();
    
    // Return cached if fresh (within 6 hours)
    if (state.insight && state.lastFetched) {
      const age = Date.now() - state.lastFetched.getTime();
      if (age < 6 * 60 * 60 * 1000) return state.insight;
    }

    set({ isGenerating: true });

    // TODO: Replace with AI-generated insight from Supabase edge function when available.
    // For now, return a static local insight so the UI is useful.
    const placeholder: WeeklyInsight = {
      id: `insight-${Date.now()}`,
      weekOf: getWeekOfLabel(),
      generatedAt: new Date().toISOString(),
      personalSummary: 'Small steps add up. This week, notice one moment each day when you felt calm or connected—and one thing you can do tomorrow to support that.',
      theme: {
        title: 'Building Momentum',
        description: 'This week is about steady progress. Focus on one intention per day rather than overhauling everything at once.',
      },
      gaugeFocus: {
        gauge: 'state',
        reason: 'Your nervous system benefits from predictable rhythm.',
        target: 70,
        practices: ['Morning check-in', 'Breathwork', 'One grounding pause'],
      },
      archetypeGuidance: {
        archetype: 'Explorer',
        strength: 'Curiosity drives growth',
        watchOut: 'Avoid overextending',
        practice: 'Set one clear intention daily',
      },
    };

    set({ insight: placeholder, isGenerating: false, lastFetched: new Date() });
    return placeholder;
  },

  clearInsight: () => set({ insight: null, lastFetched: null }),
}));
