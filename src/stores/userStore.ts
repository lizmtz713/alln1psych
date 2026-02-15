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

export type Pronouns = 'she/her' | 'he/him' | 'they/them' | 'other';

export interface CircleInvite {
  name: string;
  relationship: 'parent' | 'sibling' | 'friend' | 'partner' | 'other';
}

export interface EmergencyContact {
  name: string;
  phone: string;
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

  setName: (name: string) => void;
  setPronouns: (pronouns: Pronouns | null) => void;
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
  completeOnboarding: () => set({ onboardingCompleted: true }),
  resetOnboarding: () => set(initialState),
}));
