/**
 * Datésumé — Dating Resume types
 * Structured profile for intentional dating (18+).
 */

export type RelationshipStatus =
  | 'single'
  | 'dating'
  | 'in_relationship'
  | 'engaged'
  | 'married'
  | 'divorced'
  | 'its_complicated';

export interface DatesumeRelationship {
  id: string;
  title: string;
  type: 'casual' | 'serious' | 'engaged' | 'married';
  partnerName?: string;
  isAnonymous: boolean;
  startYear: number;
  endYear?: number;
  isOngoing: boolean;
  whatIBrought: string[];
  wins: string[];
  howItEnded?: string;
  whoEnded?: 'me' | 'them' | 'mutual';
  currentStatus?: string;
  lessonsLearned: string[];
}

export interface GrowthEntry {
  id: string;
  title: string;
  type: 'therapy' | 'self_work' | 'experience' | 'book' | 'heartbreak' | 'other';
  year?: number;
  ongoing: boolean;
  insights: string[];
}

export interface Milestone {
  id: string;
  emoji: string;
  title: string;
  year?: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  source: string;
}

/** Science-based compatibility: attachment, values, goals, conflict, love style, how I relate, lifestyle, three things to know. */
export interface GoodToKnow {
  attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | 'earned_secure';
  howIHandleHardEmotions?: string;
  howISelfSoothe?: string;

  coreValues: string[];
  religion?: string;
  politicalLeaning?: 'liberal' | 'moderate' | 'conservative' | 'prefer_not_to_say';

  wantsKids?: 'yes' | 'no' | 'maybe' | 'have_them';
  openToMarriage?: boolean;
  locationFlexibility?: string;
  careerAmbition?: 'low' | 'moderate' | 'high';

  howIFight?: string;
  whatINeedDuringConflict?: string;
  howIApologize?: string;
  howINeedApologies?: string;
  redFlagsIWatchFor: string[];

  loveLanguages: string[];
  howIShowLove: string[];
  howINeedLove: string[];
  qualityTimeStyle?: string;

  familyRelationship?: string;
  friendshipStyle?: string;
  exRelationships?: string;
  howITreatStrangers?: string;

  energy?: 'introvert' | 'extrovert' | 'ambivert';
  schedule?: 'morning' | 'night' | 'flexible';
  homeStyle?: string;
  plannerOrSpontaneous?: 'planner' | 'spontaneous' | 'both';

  threeThingsToKnow: string[];
}

export const ATTACHMENT_STYLES: { value: GoodToKnow['attachmentStyle']; label: string }[] = [
  { value: 'secure', label: 'Secure' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'avoidant', label: 'Avoidant' },
  { value: 'disorganized', label: 'Disorganized' },
  { value: 'earned_secure', label: 'Earned secure' },
];

export const CORE_VALUES_SUGGESTIONS = [
  'Honesty', 'Growth', 'Family', 'Loyalty', 'Adventure', 'Freedom', 'Creativity',
  'Stability', 'Independence', 'Partnership', 'Spirituality', 'Health', 'Learning', 'Fun',
];

export const POLITICAL_OPTIONS: { value: GoodToKnow['politicalLeaning']; label: string }[] = [
  { value: 'liberal', label: 'Liberal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'conservative', label: 'Conservative' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const CAREER_AMBITION_OPTIONS: { value: GoodToKnow['careerAmbition']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

export const ENERGY_OPTIONS: { value: GoodToKnow['energy']; label: string }[] = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'extrovert', label: 'Extrovert' },
  { value: 'ambivert', label: 'Ambivert' },
];

export const SCHEDULE_OPTIONS: { value: GoodToKnow['schedule']; label: string }[] = [
  { value: 'morning', label: 'Morning person' },
  { value: 'night', label: 'Night owl' },
  { value: 'flexible', label: 'Flexible' },
];

export const PLANNER_OPTIONS: { value: GoodToKnow['plannerOrSpontaneous']; label: string }[] = [
  { value: 'planner', label: 'Planner' },
  { value: 'spontaneous', label: 'Spontaneous' },
  { value: 'both', label: 'Both' },
];

export const LOVE_LANGUAGE_OPTIONS = [
  'Words of affirmation', 'Quality time', 'Acts of service', 'Physical touch', 'Gifts',
];

export interface Datesume {
  id: string;

  displayName: string;
  age?: number;
  location?: string;
  pronouns?: string;
  tagline?: string;
  photoUri?: string;
  relationshipStatus: RelationshipStatus;

  summary?: string;
  lookingFor?: string[];
  dealbreakers?: string[];

  relationships: DatesumeRelationship[];
  growthJourney: GrowthEntry[];
  milestones: Milestone[];

  skills: {
    expert: string[];
    proficient: string[];
    developing: string[];
  };

  attachmentStyle?: string;
  loveLanguages?: string[];
  conflictStyle?: string;
  strengths?: string[];
  growthEdges?: string[];

  offerings: {
    dailyLife?: string[];
    adventures?: string[];
    toughTimes?: string[];
    fun?: string[];
  };

  testimonials: Testimonial[];

  logistics: {
    openToLDR?: boolean;
    willingToTravel?: boolean;
    communicationPref?: string;
    livingSituation?: string;
    pets?: string;
    wantsKids?: 'yes' | 'no' | 'maybe' | 'have_them';
    openToMarriage?: boolean;
  };

  goodToKnow: GoodToKnow;

  isPublic: boolean;
  showRealNames: boolean;

  createdAt: string;
  updatedAt: string;
}

export const RELATIONSHIP_TITLES = [
  'Partner',
  'Boyfriend',
  'Girlfriend',
  'Spouse',
  'Fiancé(e)',
  'Dating',
  'Situationship',
  'Other',
];

export const RELATIONSHIP_TYPES = ['casual', 'serious', 'engaged', 'married'] as const;

export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  single: 'Single',
  dating: 'Dating',
  in_relationship: 'In a relationship',
  engaged: 'Engaged',
  married: 'Married',
  divorced: 'Divorced',
  its_complicated: "It's complicated",
};

export const SKILL_SUGGESTIONS = [
  'Active listening',
  'Communication',
  'Emotional support',
  'Loyalty',
  'Conflict resolution',
  'Physical affection',
  'Quality time',
  'Independence',
  'Compromise',
  'Vulnerability',
  'Patience',
  'Forgiveness',
  'Boundaries',
  'Expressing needs',
  'Planning',
  'Spontaneity',
];

export const MILESTONE_SUGGESTIONS: { emoji: string; title: string }[] = [
  { emoji: '💍', title: 'Engaged' },
  { emoji: '💒', title: 'Married' },
  { emoji: '🏠', title: 'Moved in together' },
  { emoji: '❤️', title: 'First "I love you"' },
  { emoji: '💔', title: 'First heartbreak survived' },
  { emoji: '🗣️', title: 'First honest conversation' },
  { emoji: '🧘', title: 'Started therapy' },
  { emoji: '📚', title: 'Read "Attached"' },
];

export const GROWTH_TYPES: { value: GrowthEntry['type']; label: string }[] = [
  { value: 'therapy', label: 'Therapy' },
  { value: 'self_work', label: 'Self-work' },
  { value: 'experience', label: 'Experience' },
  { value: 'book', label: 'Book / course' },
  { value: 'heartbreak', label: 'Heartbreak' },
  { value: 'other', label: 'Other' },
];
