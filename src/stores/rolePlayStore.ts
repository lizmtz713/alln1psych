import { create } from 'zustand';

export type RolePlayDifficulty = 'supportive' | 'neutral' | 'challenging';

export interface RolePlayMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface RolePlaySession {
  id: string;
  scenario: string;
  character: string;
  difficulty: RolePlayDifficulty;
  messages: RolePlayMessage[];
  debrief?: string;
  phase: 'setup' | 'practice' | 'debrief';
  createdAt: Date;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface RolePlayState {
  currentSession: RolePlaySession | null;
  pastSessions: RolePlaySession[];
  startSession: (scenario: string, character: string, difficulty: RolePlayDifficulty) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setDebrief: (text: string) => void;
  setPhase: (phase: RolePlaySession['phase']) => void;
  endSession: () => void;
  clearCurrentSession: () => void;
  getSessionById: (id: string) => RolePlaySession | undefined;
}

export const useRolePlayStore = create<RolePlayState>((set, get) => ({
  currentSession: null,
  pastSessions: [],

  startSession: (scenario, character, difficulty) => {
    const session: RolePlaySession = {
      id: genId(),
      scenario: scenario.trim(),
      character: character.trim() || 'The other person',
      difficulty,
      messages: [],
      phase: 'practice',
      createdAt: new Date(),
    };
    set({ currentSession: session });
  },

  addMessage: (role, content) => {
    const { currentSession } = get();
    if (!currentSession) return;
    const message: RolePlayMessage = {
      role,
      content: content.trim(),
      timestamp: new Date(),
    };
    set({
      currentSession: {
        ...currentSession,
        messages: [...currentSession.messages, message],
      },
    });
  },

  setDebrief: (text) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({
      currentSession: {
        ...currentSession,
        debrief: text,
        phase: 'debrief',
      },
    });
  },

  setPhase: (phase) => {
    const { currentSession } = get();
    if (!currentSession) return;
    set({
      currentSession: { ...currentSession, phase },
    });
  },

  endSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;
    set((state) => ({
      pastSessions: [currentSession, ...state.pastSessions],
      currentSession: null,
    }));
  },

  clearCurrentSession: () => set({ currentSession: null }),

  getSessionById: (id) => {
    const { currentSession, pastSessions } = get();
    if (currentSession?.id === id) return currentSession;
    return pastSessions.find((s) => s.id === id);
  },
}));
