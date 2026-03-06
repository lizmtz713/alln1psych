/**
 * Mind Mail Safety — Types and crisis resources for send/receive flows.
 * Mind Mail Rebuild — Intent types for compose flow (maps to heartNotesStore NoteType).
 */

/** Receive setting: who can send Mind Mail to this user */
export type MindMailReceiveSetting = 'anyone' | 'circle' | 'nobody';

/** 6 intents for Mind Mail compose — reduces anxiety by choosing purpose first */
export type MindMailIntent =
  | 'encouragement'
  | 'gratitude'
  | 'apology'
  | 'concern'
  | 'boundary'
  | 'grief';

/** Order: frequency of use → emotional difficulty (easy wins first) */
export const MIND_MAIL_INTENTS: { id: MindMailIntent; label: string; emoji: string }[] = [
  { id: 'concern', label: 'Check-in', emoji: '💭' },
  { id: 'encouragement', label: 'Encouragement', emoji: '✨' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'grief', label: 'Support', emoji: '🕊️' },
  { id: 'apology', label: 'Apology', emoji: '🤝' },
  { id: 'boundary', label: 'Boundary', emoji: '🚧' },
];

/** Content check result from safety service */
export type ContentCheckLevel = 'normal' | 'emotional' | 'sensitive' | 'crisis';

export interface ContentCheckResult {
  level: ContentCheckLevel;
  isCrisis: boolean;
  message?: string;
}

/** Report reason for moderation */
export type ReportReason =
  | 'harassment'
  | 'abuse'
  | 'spam'
  | 'unwanted'
  | 'other';

/** Crisis resources — same as app crisis protocol (988, Crisis Text Line, etc.) */
export interface CrisisResourceItem {
  name: string;
  action: string;
  available: string;
  description?: string;
  /** tel: or sms: link */
  phone?: string;
  /** Text number for SMS */
  textNumber?: string;
}

export const CRISIS_RESOURCES: CrisisResourceItem[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    action: 'Call or text 988',
    available: '24/7',
    description: 'Free, confidential support',
    phone: '988',
    textNumber: '988',
  },
  {
    name: 'Crisis Text Line',
    action: 'Text HOME to 741741',
    available: '24/7',
    description: 'Text-based crisis support',
    textNumber: '741741',
  },
  {
    name: 'Trans Lifeline',
    action: 'Call 877-565-8860',
    available: '24/7',
    description: 'By and for trans people',
    phone: '8775658860',
  },
];
