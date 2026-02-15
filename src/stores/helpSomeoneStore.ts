import { create } from 'zustand';

export interface HelpSession {
  id: string;
  personName: string;
  relationship: string;
  situation: string;
  concerns: string[];
  messages: { role: 'user' | 'assistant'; content: string }[];
  actionPlan?: string;
  reminderSet?: boolean;
  createdAt: string;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface HelpSomeoneState {
  sessions: HelpSession[];
  currentSession: HelpSession | null;
  startNewSession: (session: Omit<HelpSession, 'id' | 'createdAt'>) => HelpSession;
  addSession: (session: Omit<HelpSession, 'id' | 'createdAt'>) => HelpSession;
  updateCurrentSession: (updates: Partial<HelpSession>) => void;
  setCurrentSession: (session: HelpSession | null) => void;
  addMessageToCurrent: (role: 'user' | 'assistant', content: string) => void;
  setActionPlan: (actionPlan: string) => void;
  setReminderSet: (value: boolean) => void;
  getSessionById: (id: string) => HelpSession | undefined;
  clearCurrentSession: () => void;
  reset: () => void;
}

export const useHelpSomeoneStore = create<HelpSomeoneState>((set, get) => ({
  sessions: [],
  currentSession: null,

  startNewSession: (session) => {
    const id = genId();
    const createdAt = new Date().toISOString();
    const full: HelpSession = { ...session, id, createdAt };
    set({ currentSession: full });
    return full;
  },

  addSession: (session) => {
    const id = genId();
    const createdAt = new Date().toISOString();
    const full: HelpSession = { ...session, id, createdAt };
    set((state) => ({ sessions: [full, ...state.sessions] }));
    return full;
  },

  updateCurrentSession: (updates) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({ currentSession: { ...currentSession, ...updates } });
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  addMessageToCurrent: (role, content) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({
      currentSession: {
        ...currentSession,
        messages: [...currentSession.messages, { role, content }],
      },
    });
  },

  setActionPlan: (actionPlan) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({ currentSession: { ...currentSession, actionPlan } });
  },

  setReminderSet: (value) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({ currentSession: { ...currentSession, reminderSet: value } });
  },

  getSessionById: (id) => {
    const { currentSession, sessions } = get();
    if (currentSession?.id === id) return currentSession;
    return sessions.find((s) => s.id === id);
  },

  clearCurrentSession: () => set({ currentSession: null }),
  reset: () => set({ sessions: [], currentSession: null }),
}));
