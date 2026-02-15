import { create } from 'zustand';
import { useCircleStore } from './circleStore';
import { useEducationStore } from './educationStore';
import { useConversationStore } from './conversationStore';
import { MODULES } from '../data/educationContent';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first-checkin', title: 'First Check-in', description: 'Completed your first mood check-in', emoji: '🌱' },
  { id: 'week-streak', title: 'Week Warrior', description: '7 days of check-ins', emoji: '🔥' },
  { id: 'first-lesson', title: 'Curious Mind', description: 'Completed your first lesson', emoji: '📖' },
  { id: 'circle-builder', title: 'Circle Builder', description: 'Invited someone to your circle', emoji: '💛' },
  { id: 'brave-voice', title: 'Brave Voice', description: 'Had your first voice conversation', emoji: '🎙️' },
  { id: 'self-aware', title: 'Self-Aware', description: 'Completed Feelings 101', emoji: '🧠' },
  { id: 'month-streak', title: 'Committed', description: '30 days of check-ins', emoji: '⭐' },
  { id: 'all-modules', title: 'Scholar', description: 'Completed all education modules', emoji: '🎓' },
];

function getAchievementsUnlocked(): Record<string, boolean> {
  const circle = useCircleStore.getState();
  const education = useEducationStore.getState();
  const conversation = useConversationStore.getState();

  const moodCount = circle.moodHistory.length;
  const streakDays = education.streakDays;
  const completedLessonIds = education.completedLessons;
  const hasVoiceMessage = conversation.messages.some((m) => m.isVoice);
  const membersCount = circle.members.length;
  const feelings101LessonIds = [
    'feelings-101-what-are-emotions',
    'feelings-101-name-it-to-tame-it',
    'feelings-101-body-keeps-score',
  ];
  const completedFeelings101 = feelings101LessonIds.every((id) => completedLessonIds.includes(id));
  const allLessonIds = MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedAll = allLessonIds.every((id) => completedLessonIds.includes(id));

  return {
    'first-checkin': moodCount >= 1,
    'week-streak': streakDays >= 7,
    'first-lesson': completedLessonIds.length >= 1,
    'circle-builder': membersCount >= 1,
    'brave-voice': hasVoiceMessage,
    'self-aware': completedFeelings101,
    'month-streak': streakDays >= 30,
    'all-modules': completedAll,
  };
}

interface InsightsState {
  getAchievements: () => Achievement[];
  getWeeklyMoodTrend: () => Array<{ date: string; mood: string }>;
  getCheckInStreak: () => number;
  getConversationCountThisWeek: () => number;
  getLessonsCompletedThisWeek: () => number;
  getMostCommonMoodThisWeek: () => string | null;
}

const oneWeekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.getTime();
};

export const useInsightsStore = create<InsightsState>(() => ({
  getAchievements: () => {
    const unlocked = getAchievementsUnlocked();
    return ACHIEVEMENT_DEFS.map((a) => ({
      ...a,
      unlocked: unlocked[a.id] ?? false,
      unlockedAt: undefined,
    }));
  },

  getWeeklyMoodTrend: () => {
    const circle = useCircleStore.getState();
    const since = oneWeekAgo();
    return circle.moodHistory
      .filter((e) => new Date(e.timestamp).getTime() >= since)
      .map((e) => ({
        date: new Date(e.timestamp).toLocaleDateString(),
        mood: e.mood,
      }))
      .reverse();
  },

  getCheckInStreak: () => useEducationStore.getState().streakDays,

  getConversationCountThisWeek: () => {
    const conv = useConversationStore.getState();
    const since = oneWeekAgo();
    const days = new Set(
      conv.messages
        .filter((m) => m.role === 'user' && new Date(m.timestamp).getTime() >= since)
        .map((m) => new Date(m.timestamp).toDateString())
    );
    return days.size;
  },

  getLessonsCompletedThisWeek: () => {
    return useEducationStore.getState().completedLessons.length;
  },

  getMostCommonMoodThisWeek: () => {
    const trend = useInsightsStore.getState().getWeeklyMoodTrend();
    if (trend.length === 0) return null;
    const counts: Record<string, number> = {};
    trend.forEach(({ mood }) => {
      counts[mood] = (counts[mood] || 0) + 1;
    });
    let max = 0;
    let mood: string | null = null;
    Object.entries(counts).forEach(([m, c]) => {
      if (c > max) {
        max = c;
        mood = m;
      }
    });
    return mood;
  },
}));

// Re-export for components that need to read achievements reactively
export function useAchievements(): Achievement[] {
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  return getAchievements();
}
