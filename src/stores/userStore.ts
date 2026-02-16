import { create } from 'zustand';

export type AgeGroup =
  | 'under13'
  | '13-17'
  | '18-25'
  | '26-40'
  | '41-60'
  | '60+';

export type CommunicationPreference = 'voice' | 'text';

export type LoveLanguage =
  | 'words'
  | 'quality-time'
  | 'acts-of-service'
  | 'physical-touch'
  | 'gifts'
  | 'unknown';

export type LearningStyle = 'reading' | 'listening' | 'doing' | 'talking';

export type Pronouns =
  | 'she/her'
  | 'he/him'
  | 'they/them'
  | 'he/they'
  | 'she/they'
  | 'any'
  | 'other';

export interface CircleInvite {
  name: string;
  relationship: 'parent' | 'sibling' | 'friend' | 'partner' | 'other';
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

/** Saved from Trigger Map activity — so AI can reference known triggers in conversation */
export interface TriggerMapEntry {
  id: string;
  situation: string;
  emotions: string[];
  bodyZones: string[];
  reaction: string;
  otherReaction?: string;
  validation?: string;
  pattern?: string;
  alternative?: string;
  encouragement?: string;
  createdAt: string;
}

interface UserState {
  name: string;
  pronouns: Pronouns | null;
  ageGroup: AgeGroup | null;
  communicationPreference: CommunicationPreference | null;
  loveLanguage: LoveLanguage | null;
  circleInvite: CircleInvite | null;
  onboardingCompleted: boolean;
  /** Topics the user wants Psych to be extra gentle about (trauma-informed) */
  sensitiveTopics: string[];
  /** How the user learns best — affects lesson/activity presentation */
  learningStyle: LearningStyle | null;
  /** Up to 3 contacts for crisis (name + phone) */
  emergencyContacts: EmergencyContact[];
  /** When pronouns === 'other', user-typed pronouns (e.g. "ze/zir") */
  customPronouns: string;
  /** Saved trigger maps from the Trigger Map activity */
  triggerMaps: TriggerMapEntry[];

  setName: (name: string) => void;
  addTriggerMap: (entry: Omit<TriggerMapEntry, 'id' | 'createdAt'>) => void;
  setPronouns: (pronouns: Pronouns | null) => void;
  setCustomPronouns: (value: string) => void;
  setAgeGroup: (ageGroup: AgeGroup | null) => void;
  setCommunicationPreference: (pref: CommunicationPreference | null) => void;
  setLoveLanguage: (lang: LoveLanguage | null) => void;
  setCircleInvite: (invite: CircleInvite | null) => void;
  setSensitiveTopics: (topics: string[]) => void;
  setLearningStyle: (style: LearningStyle | null) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialState = {
  name: '',
  pronouns: null as Pronouns | null,
  ageGroup: null as AgeGroup | null,
  communicationPreference: null as CommunicationPreference | null,
  loveLanguage: null as LoveLanguage | null,
  circleInvite: null as CircleInvite | null,
  onboardingCompleted: false,
  sensitiveTopics: [] as string[],
  learningStyle: null as LearningStyle | null,
  emergencyContacts: [] as EmergencyContact[],
  customPronouns: '',
  triggerMaps: [] as TriggerMapEntry[],
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setName: (name) => set({ name }),
  setPronouns: (pronouns) => set({ pronouns }),
  setAgeGroup: (ageGroup) => set({ ageGroup }),
  setCommunicationPreference: (communicationPreference) => set({ communicationPreference }),
  setLoveLanguage: (loveLanguage) => set({ loveLanguage }),
  setCircleInvite: (circleInvite) => set({ circleInvite }),
  setSensitiveTopics: (sensitiveTopics) => set({ sensitiveTopics }),
  setLearningStyle: (learningStyle) => set({ learningStyle }),
  setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
  setCustomPronouns: (customPronouns) => set({ customPronouns }),
  addTriggerMap: (entry) =>
    set((state) => ({
      triggerMaps: [
        {
          ...entry,
          id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
        },
        ...state.triggerMaps,
      ],
    })),
  completeOnboarding: () => set({ onboardingCompleted: true }),
  resetOnboarding: () => set(initialState),
}));
