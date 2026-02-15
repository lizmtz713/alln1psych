import { create } from 'zustand';

const DAILY_CHALLENGES = [
  { text: 'Tell someone you appreciate them today', emoji: '💌' },
  { text: "Name 3 things you're grateful for", emoji: '🙏' },
  { text: 'Take 5 deep breaths right now', emoji: '🌬️' },
  { text: 'Write one sentence about how you feel', emoji: '✍️' },
  { text: 'Send a check-in to someone in your circle', emoji: '💛' },
  { text: 'Listen to a song that makes you feel good', emoji: '🎵' },
  { text: 'Step outside for 2 minutes', emoji: '🌿' },
  { text: 'Compliment yourself — out loud', emoji: '🪞' },
  { text: 'Put your phone down for 10 minutes', emoji: '📵' },
  { text: "Tell Psych about the best part of your day", emoji: '⭐' },
  { text: 'Drink a glass of water right now', emoji: '💧' },
  { text: 'Stretch for 30 seconds', emoji: '🧘' },
  { text: 'Forgive yourself for one thing today', emoji: '🕊️' },
  { text: "Text a friend you haven't talked to in a while", emoji: '📱' },
] as const;

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

interface EngagementState {
  completedChallengeDates: Record<string, boolean>;
  completeTodayChallenge: () => void;
  isTodayChallengeDone: () => boolean;
  getTodayChallenge: () => { text: string; emoji: string };
  reset: () => void;
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  completedChallengeDates: {},

  completeTodayChallenge: () =>
    set((state) => ({
      completedChallengeDates: {
        ...state.completedChallengeDates,
        [new Date().toDateString()]: true,
      },
    })),

  isTodayChallengeDone: () => {
    return get().completedChallengeDates[new Date().toDateString()] === true;
  },

  getTodayChallenge: () => {
    const idx = dayOfYear() % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[idx];
  },
  reset: () => set({ completedChallengeDates: {} }),
}));

export { DAILY_CHALLENGES };
