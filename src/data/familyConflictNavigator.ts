/**
 * Family Conflict Navigator — Content and structure.
 * Purpose: understanding, boundaries, and support. Respects safety and autonomy.
 * Connects to: Connection, Emotion, Alignment, State (PHOSM gauges).
 */

export const FAMILY_CONFLICT_GAUGES = [
  { id: 'emotion', label: 'Emotion', emoji: '💭', description: 'Anger, hurt, guilt, sadness' },
  { id: 'connection', label: 'Connection', emoji: '💕', description: 'Relationship strain' },
  { id: 'alignment', label: 'Alignment', emoji: '✨', description: 'Values (loyalty, respect, independence)' },
  { id: 'state', label: 'State', emoji: '🧠', description: 'Stress, nervous system' },
] as const;

export const FAMILY_CONFLICT_PATTERNS = [
  { id: 'communication', label: 'Communication breakdown', short: 'Misunderstandings, not feeling heard' },
  { id: 'boundaries', label: 'Boundary violations', short: 'Limits not respected' },
  { id: 'old-roles', label: 'Old family roles resurfacing', short: 'Falling back into childhood dynamics' },
  { id: 'unresolved', label: 'Unresolved past conflict', short: 'History repeating' },
  { id: 'expectations', label: 'Mismatched expectations', short: 'Different views of what family means' },
] as const;

export const BOUNDARY_EXAMPLES = [
  'Limiting certain topics (e.g. politics, personal choices)',
  'Reducing contact temporarily when things are raw',
  'Asking for respectful communication (no yelling, no name-calling)',
  'Choosing not to be alone with someone who has harmed you',
  'Deciding what you will and won’t discuss',
];

export const PATHS = [
  {
    id: 'repair',
    label: 'Repair conversation',
    emoji: '🤝',
    description: 'Prepare what you want to say. Focus on feelings and needs rather than blame.',
  },
  {
    id: 'boundary',
    label: 'Set a boundary',
    emoji: '🛡️',
    description: 'Clearly state your limits. You can explain what happens if the limit is crossed.',
  },
  {
    id: 'distance',
    label: 'Create distance',
    emoji: '↔️',
    description: 'Temporary or permanent, if needed. You get to decide what contact feels safe.',
  },
  {
    id: 'support',
    label: 'Seek support',
    emoji: '🫂',
    description: 'Talk with a trusted friend, or consider counseling or mediation.',
  },
] as const;

export const CONVERSATION_STRUCTURE = [
  { step: 1, label: 'Describe what happened', prompt: 'Stick to facts, not accusations.' },
  { step: 2, label: 'Share how you felt', prompt: ''I felt..." keeps it about your experience.' },
  { step: 3, label: 'State what you need', prompt: 'One clear request.' },
  { step: 4, label: 'Invite their perspective', prompt: ''I’d like to hear how you see it."' },
] as const;

export interface FamilyConflictResource {
  id: string;
  label: string;
  description: string;
  emphasis?: boolean;
  links?: Array<{ label: string; url: string; phone?: string }>;
}

export const RESOURCES: FamilyConflictResource[] = [
  {
    id: 'therapy',
    label: 'Family or individual therapy',
    description: 'A therapist can help with communication, boundaries, and processing past hurt.',
  },
  {
    id: 'mediation',
    label: 'Conflict mediation',
    description: 'A neutral mediator can help family members have structured, safer conversations.',
  },
  {
    id: 'safety',
    label: 'Safety and crisis support',
    description: 'If you are in emotional or physical danger, your safety comes first. You do not have to stay in harmful situations.',
    emphasis: true,
    links: [
      { label: 'National Domestic Violence Hotline', url: 'https://www.thehotline.org', phone: '1-800-799-7233' },
      { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org', phone: '988' },
      { label: 'Crisis Text Line', url: 'https://www.crisistextline.org', phone: 'Text HOME to 741741' },
    ],
  },
];
