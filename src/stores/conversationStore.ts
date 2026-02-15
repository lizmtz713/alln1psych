import { create } from 'zustand';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice: boolean;
}

interface ConversationState {
  messages: ConversationMessage[];
  isRecording: boolean;
  isProcessing: boolean;
  isAiTyping: boolean;
  inputMode: 'voice' | 'text';
  initialGreetingAdded: boolean;
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  setRecording: (val: boolean) => void;
  setProcessing: (val: boolean) => void;
  setAiTyping: (val: boolean) => void;
  setInputMode: (mode: 'voice' | 'text') => void;
  toggleInputMode: () => void;
  setInitialGreetingAdded: (val: boolean) => void;
  clearMessages: () => void;
  reset: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  isRecording: false,
  isProcessing: false,
  isAiTyping: false,
  inputMode: 'voice',
  initialGreetingAdded: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        },
      ],
    })),

  setRecording: (isRecording) => set({ isRecording }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setAiTyping: (isAiTyping) => set({ isAiTyping }),
  setInputMode: (inputMode) => set({ inputMode }),

  toggleInputMode: () =>
    set((state) => ({ inputMode: state.inputMode === 'voice' ? 'text' : 'voice' })),

  setInitialGreetingAdded: (initialGreetingAdded) => set({ initialGreetingAdded }),

  clearMessages: () => set({ messages: [], initialGreetingAdded: false }),
  reset: () =>
    set({
      messages: [],
      initialGreetingAdded: false,
      isRecording: false,
      isProcessing: false,
      isAiTyping: false,
      inputMode: 'voice',
    }),
}));
