import { create } from 'zustand';
import { useCircleStore } from './circleStore';
import { useEducationStore } from './educationStore';
import { useConversationStore } from './conversationStore';
import { useJournalStore } from './journalStore';
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

  const moodCount = (circle.moodHistory ?? []).length;
  const streakDays = education?.streakDays ?? 0;
  const completedLessonIds = education?.completedLessons ?? [];
  const hasVoiceMessage = (conversation.messages ?? []).some((m) => m.isVoice);
  const membersCount = (circle.members ?? []).length;
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
  getEngagementStreak: () => number;
  getConversationCountThisWeek: () => number;
  getLessonsCompletedThisWeek: () => number;
  getMostCommonMoodThisWeek: () => string | null;
  getGaugeSays: (engagementStreak: number) => string;
  /** Alias for getGaugeSays (Psych says insight line). */
  getPsychSays: (engagementStreak: number) => string;
  getWeeklySummary: () => { mostCommonMood: string | null; checkInDays: number; lessonsCount: number; conversationDays: number; line: string } | null;
  reset: () => void;
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
    return (circle.moodHistory ?? [])
      .filter((e) => new Date(e.timestamp).getTime() >= since)
      .map((e) => ({
        date: new Date(e.timestamp).toLocaleDateString(),
        mood: e.mood,
      }))
      .reverse();
  },

  getCheckInStreak: () => useEducationStore.getState().streakDays,

  getEngagementStreak: () => {
    const circle = useCircleStore.getState();
    const conv = useConversationStore.getState();
    const journal = useJournalStore.getState();
    const education = useEducationStore.getState();
    const dates = new Set<string>();
    (circle.moodHistory ?? []).forEach((e) => dates.add(new Date(e.timestamp).toDateString()));
    (conv.messages ?? []).filter((m) => m.role === 'user').forEach((m) => dates.add(new Date(m.timestamp).toDateString()));
    (journal.entries ?? []).forEach((e) => dates.add(new Date(e.createdAt).toDateString()));
    if (education.lastLessonDate) dates.add(new Date(education.lastLessonDate).toDateString());
    const sorted = Array.from(dates).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toDateString();
    if (sorted[0] !== today) return 0;
    let streak = 0;
    let prev = today;
    for (const d of sorted) {
      const prevTime = new Date(prev).getTime();
      const dTime = new Date(d).getTime();
      if (prevTime - dTime === 86400000) {
        streak++;
        prev = d;
      } else if (d !== today) break;
    }
    return streak + 1;
  },

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

  getMostCommonMoodThisWeek: (): string | null => {
    const trend = useInsightsStore.getState().getWeeklyMoodTrend();
    if (trend.length === 0) return null;
    const counts: Record<string, number> = {};
    trend.forEach(({ mood }: { mood: string }) => {
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

  getGaugeSays: (engagementStreak: number): string => {
    const trend = useInsightsStore.getState().getWeeklyMoodTrend();
    const greenCount = trend.filter((t: { mood: string }) => t.mood === 'green').length;
    const lastMood = trend.length > 0 ? trend[0].mood : null;
    if (greenCount >= 3 && lastMood === 'green")
      return \"You've been feeling good this week. What"s contributing to that?";
    if (engagementStreak >= 2)
      return `${engagementStreak} days in a row! Consistency builds self-awareness.`;
    if (trend.length === 0)
      return "Haven"t heard from you in a bit. I'm here whenever you"re ready.";
    const tips = [
      "Naming your feelings can make them easier to handle.",
      "Small steps still move you forward.",
      "It's okay to take things one moment at a time.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  },

  getPsychSays: (engagementStreak: number): string =>
    useInsightsStore.getState().getGaugeSays(engagementStreak),

  getWeeklySummary: (): { mostCommonMood: string | null; checkInDays: number; lessonsCount: number; conversationDays: number; line: string } | null => {
    const now = new Date();
    if (now.getDay() !== 0) return null; // Sunday = 0
    const trend = useInsightsStore.getState().getWeeklyMoodTrend();
    const convCount = useInsightsStore.getState().getConversationCountThisWeek();
    const lessonsCount = useInsightsStore.getState().getLessonsCompletedThisWeek();
    const moodCounts: Record<string, number> = {};
    trend.forEach(({ mood }: { mood: string }) => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    let mostCommonMood: string | null = null;
    let max = 0;
    Object.entries(moodCounts).forEach(([m, c]: [string, number]) => {
      if (c > max) {
        max = c;
        mostCommonMood = m;
      }
    });
    const checkInDays = trend.length;
    const dayLabels: Record<string, string> = { green: 'good', yellow: 'okay', orange: 'low', red: 'struggling' };
    const moodLabel = mostCommonMood ? dayLabels[mostCommonMood] ?? mostCommonMood : 'mixed';
    let line: string;
    if (checkInDays >= 5) line = 'You showed up ' + checkInDays + ' days this week. That\'s amazing.';
    else if (checkInDays >= 2) line = 'You showed up ' + checkInDays + ' days this week. That\'s a great start.';
    else line = 'You showed up ' + checkInDays + ' day(s) this week. Something to build on.';
    return { mostCommonMood: moodLabel, checkInDays, lessonsCount, conversationDays: convCount, line };
  },
  reset: () => {},
}));

// Re-export for components that need to read achievements reactively
export function useAchievements(): Achievement[] {
  const getAchievements = useInsightsStore((s) => s.getAchievements);
  return getAchievements();
}
