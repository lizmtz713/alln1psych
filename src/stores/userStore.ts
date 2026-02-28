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

export type LearningStyle = 'reading' | 'listening' | 'doing' | 'talking' | 'unknown';

export type Pronouns =
  | 'she/her'
  | 'he/him'
  | 'they/them'
  | 'he/they'
  | 'she/they'
  | 'any'
  | 'other';

/** Life stage for age-adaptive AI (identity setup). */
export type AgeRange = 'teen' | 'young-adult' | 'adult' | 'midlife' | 'older-adult';

/** Therapy experience for adaptive tone (identity setup). */
export type TherapyExperience = 'never' | 'tried-it' | 'currently' | 'positive' | 'negative';

/** Sport type for athlete mode */
export type SportType = 'team' | 'individual' | 'endurance' | 'power' | 'mixed' | null;

/** Spectrum mode accessibility preferences */
export interface SpectrumModeSettings {
  /** Reduce animations and motion */
  reducedAnimations: boolean;
  /** Use muted, softer colors */
  mutedColors: boolean;
  /** Simplified check-in flow with fewer steps */
  simplifiedCheckin: boolean;
  /** Use picture-based emotion selection */
  pictureEmotions: boolean;
  /** Use clear, literal language (less metaphor) */
  literalLanguage: boolean;
  /** ADHD-specific features (shorter interactions, reminders) */
  adhdFeatures: boolean;
  /** Autism-specific features (social scripts, routine support) */
  autismFeatures: boolean;
  /** Sensory tracking in body gauge */
  sensoryTracking: boolean;
}

/** Athlete mode settings */
export interface AthleteModeSettings {
  /** Type of sport for context */
  sportType: SportType;
  /** Focus on recovery metrics */
  recoveryFocus: boolean;
  /** Include performance psychology insights */
  performancePsych: boolean;
  /** Track training load */
  trackTrainingLoad: boolean;
  /** Competition mode (pre/post-competition support) */
  competitionMode: boolean;
}

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
  /** Topics the user wants Gauge to be extra gentle about (trauma-informed) */
  sensitiveTopics: string[];
  /** How the user learns best — affects lesson/activity presentation */
  learningStyle: LearningStyle | null;
  /** Up to 3 contacts for crisis (name + phone) */
  emergencyContacts: EmergencyContact[];
  /** When pronouns === 'other', user-typed pronouns (e.g. "ze/zir") */
  customPronouns: string;
  /** Saved trigger maps from the Trigger Map activity */
  triggerMaps: TriggerMapEntry[];

  /** Specialized Mode: Athlete Mode enabled */
  athleteMode: boolean;
  /** Athlete mode detailed settings */
  athleteModeSettings: AthleteModeSettings;

  /** Specialized Mode: Spectrum/Accessibility Mode enabled */
  spectrumMode: boolean;
  /** Spectrum mode detailed settings */
  spectrumModeSettings: SpectrumModeSettings;

  /** Cultural background (multi-select from onboarding/settings) */
  culturalBackground: string[];
  /** Environment/upbringing that shaped the user */
  environmentUpbringing: string[];
  /** Cultural values that matter in the user's world */
  culturalValues: string[];
  /** When culturalBackground includes "Other", optional free text */
  culturalBackgroundOther: string;
  /** User birthday ISO "YYYY-MM-DD" — for Circle relationship insights */
  birthday: string | null;

  /** Cultural + Identity Profile (identity-setup flow) */
  ageRange: AgeRange | null;
  /** Free text: "Mexican-American", "Korean", "Black American", etc. */
  culturalBackgroundText: string;
  /** "single mom", "two dads", "grandparents", "foster care", "nuclear", etc. */
  familyStructure: string;
  /** "English", "Spanish", "Both", "Korean", etc. */
  languageOfEmotion: string;
  /** What "being strong" meant in their family */
  strengthMeaning: string;
  therapyExperience: TherapyExperience | null;

  /** 
   * Human Fingerprint™ — Insights learned from lesson reflections
   * Format: { lessonId: "insight text", ... }
   * These get injected into AI context for personalization
   */
  humanFingerprint: Record<string, string>;

  /**
   * Personal Values — Core values the user has chosen to track alignment with
   * Used by the Drift Detector for weekly value alignment reflections
   */
  values: string[];

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
  setCulturalBackground: (v: string[]) => void;
  setEnvironmentUpbringing: (v: string[]) => void;
  setCulturalValues: (v: string[]) => void;
  setCulturalBackgroundOther: (v: string) => void;
  setBirthday: (v: string | null) => void;
  setAgeRange: (v: AgeRange | null) => void;
  setCulturalBackgroundText: (v: string) => void;
  setFamilyStructure: (v: string) => void;
  setLanguageOfEmotion: (v: string) => void;
  setStrengthMeaning: (v: string) => void;
  setTherapyExperience: (v: TherapyExperience | null) => void;
  /** Add a lesson insight to the Human Fingerprint */
  addHumanFingerprintInsight: (lessonId: string, insight: string) => void;
  /** Set personal values for drift detector */
  setValues: (values: string[]) => void;
  /** Athlete mode */
  setAthleteMode: (v: boolean) => void;
  setAthleteModeSettings: (v: Partial<AthleteModeSettings>) => void;
  /** Spectrum/Accessibility mode */
  setSpectrumMode: (v: boolean) => void;
  setSpectrumModeSettings: (v: Partial<SpectrumModeSettings>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  reset: () => void;
}

const defaultAthleteModeSettings: AthleteModeSettings = {
  sportType: null,
  recoveryFocus: true,
  performancePsych: true,
  trackTrainingLoad: true,
  competitionMode: false,
};

const defaultSpectrumModeSettings: SpectrumModeSettings = {
  reducedAnimations: false,
  mutedColors: false,
  simplifiedCheckin: false,
  pictureEmotions: false,
  literalLanguage: false,
  adhdFeatures: false,
  autismFeatures: false,
  sensoryTracking: false,
};

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
  culturalBackground: [] as string[],
  environmentUpbringing: [] as string[],
  culturalValues: [] as string[],
  culturalBackgroundOther: '',
  birthday: null as string | null,
  ageRange: null as AgeRange | null,
  culturalBackgroundText: '',
  familyStructure: '',
  languageOfEmotion: '',
  strengthMeaning: '',
  therapyExperience: null as TherapyExperience | null,
  humanFingerprint: {} as Record<string, string>,
  values: [] as string[],
  // Specialized modes
  athleteMode: false,
  athleteModeSettings: { ...defaultAthleteModeSettings } as AthleteModeSettings,
  spectrumMode: false,
  spectrumModeSettings: { ...defaultSpectrumModeSettings } as SpectrumModeSettings,
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
  setCulturalBackground: (culturalBackground) => set({ culturalBackground }),
  setEnvironmentUpbringing: (environmentUpbringing) => set({ environmentUpbringing }),
  setCulturalValues: (culturalValues) => set({ culturalValues }),
  setCulturalBackgroundOther: (culturalBackgroundOther) => set({ culturalBackgroundOther }),
  setBirthday: (birthday) => set({ birthday }),
  setAgeRange: (ageRange) => set({ ageRange }),
  setCulturalBackgroundText: (culturalBackgroundText) => set({ culturalBackgroundText }),
  setFamilyStructure: (familyStructure) => set({ familyStructure }),
  setLanguageOfEmotion: (languageOfEmotion) => set({ languageOfEmotion }),
  setStrengthMeaning: (strengthMeaning) => set({ strengthMeaning }),
  setTherapyExperience: (therapyExperience) => set({ therapyExperience }),
  // Human Fingerprint — lesson insights
  addHumanFingerprintInsight: (lessonId, insight) =>
    set((state) => ({
      humanFingerprint: { ...state.humanFingerprint, [lessonId]: insight },
    })),
  // Personal values for drift detector
  setValues: (values) => set({ values }),
  // Athlete mode
  setAthleteMode: (athleteMode) => set({ athleteMode }),
  setAthleteModeSettings: (settings) =>
    set((state) => ({
      athleteModeSettings: { ...state.athleteModeSettings, ...settings },
    })),
  // Spectrum/Accessibility mode
  setSpectrumMode: (spectrumMode) => set({ spectrumMode }),
  setSpectrumModeSettings: (settings) =>
    set((state) => ({
      spectrumModeSettings: { ...state.spectrumModeSettings, ...settings },
    })),
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
  reset: () => set(initialState),
}));
