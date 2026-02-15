import { create } from 'zustand';

export interface ConversationSummary {
  id: string;
  conversationId: string;
  title: string;
  summary: string;
  emotions: string[];
  triggers: string[];
  insights: string;
  followUp: string;
  messageCount: number;
  createdAt: string;
}

interface ConversationSummaryStore {
  summaries: ConversationSummary[];
  addSummary: (summary: Omit<ConversationSummary, 'id' | 'conversationId' | 'createdAt'> & { conversationId?: string }) => void;
  clearSummaries: () => void;
  getSummaries: () => ConversationSummary[];
  getSummariesByDateRange: (start: string, end: string) => ConversationSummary[];
  getRecentEmotions: (days: number) => string[];
  getRecentTriggers: (days: number) => string[];
  getEmotionalPatterns: (summaries?: ConversationSummary[]) => {
    topEmotions: { emotion: string; count: number }[];
    topTriggers: { trigger: string; count: number }[];
    trend: 'improving' | 'stable' | 'struggling';
  };
  getLastSummary: () => ConversationSummary | undefined;
  reset: () => void;
}

function generateId(): string {
  return `sum-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Emotion valence for trend: negative = struggling, positive = improving */
const NEGATIVE_EMOTIONS = new Set([
  'anxious', 'anxiety', 'sad', 'depressed', 'angry', 'frustrated', 'overwhelmed',
  'guilt', 'shame', 'hopeless', 'lonely', 'stressed', 'fear', 'scared', 'worried',
]);
const POSITIVE_EMOTIONS = new Set([
  'hopeful', 'calm', 'relieved', 'grateful', 'peaceful', 'content', 'happy',
  'motivated', 'confident', 'loved', 'connected',
]);

export const useConversationSummaryStore = create<ConversationSummaryStore>((set, get) => ({
  summaries: [],

  addSummary: (input) => {
    const conversationId = input.conversationId ?? `conv-${Date.now()}`;
    const summary: ConversationSummary = {
      ...input,
      id: generateId(),
      conversationId,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ summaries: [summary, ...state.summaries] }));
  },

  clearSummaries: () => set({ summaries: [] }),
  reset: () => set({ summaries: [] }),

  getSummaries: () => get().summaries,

  getSummariesByDateRange: (start, end) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    return get().summaries.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= startDate && t <= endDate;
    });
  },

  getRecentEmotions: (days) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recent = get().summaries.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
    const counts: Record<string, number> = {};
    recent.forEach((s) => {
      s.emotions.forEach((e) => {
        const key = e.toLowerCase().trim();
        if (key) counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([e]) => e);
  },

  getRecentTriggers: (days) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recent = get().summaries.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
    const counts: Record<string, number> = {};
    recent.forEach((s) => {
      s.triggers.forEach((t) => {
        const key = t.toLowerCase().trim();
        if (key) counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  },

  getEmotionalPatterns: (summariesArg) => {
    const summaries = summariesArg ?? get().summaries;
    const emotionCounts: Record<string, number> = {};
    const triggerCounts: Record<string, number> = {};
    summaries.forEach((s) => {
      s.emotions.forEach((e) => {
        const key = e.toLowerCase().trim();
        if (key) emotionCounts[key] = (emotionCounts[key] ?? 0) + 1;
      });
      s.triggers.forEach((t) => {
        const key = t.toLowerCase().trim();
        if (key) triggerCounts[key] = (triggerCounts[key] ?? 0) + 1;
      });
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([emotion, count]) => ({ emotion, count }));
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([trigger, count]) => ({ trigger, count }));

    // Trend: compare recent vs older emotion valence
    const sorted = [...summaries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recent = sorted.slice(0, Math.min(5, Math.ceil(sorted.length / 2)));
    const older = sorted.slice(recent.length, recent.length + 5);
    const score = (list: ConversationSummary[]) => {
      let v = 0;
      list.forEach((s) => {
        s.emotions.forEach((e) => {
          const lower = e.toLowerCase();
          if (NEGATIVE_EMOTIONS.has(lower)) v -= 1;
          else if (POSITIVE_EMOTIONS.has(lower)) v += 1;
        });
      });
      return v;
    };
    const recentScore = score(recent);
    const olderScore = score(older);
    let trend: 'improving' | 'stable' | 'struggling' = 'stable';
    if (recent.length >= 2 && older.length >= 1) {
      if (recentScore > olderScore + 2) trend = 'improving';
      else if (recentScore < olderScore - 2) trend = 'struggling';
    }

    return { topEmotions, topTriggers, trend };
  },

  getLastSummary: () => get().summaries[0] ?? undefined,
}));
