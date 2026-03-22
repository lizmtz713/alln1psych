/**
 * Option sets for gauge definition pages (Human Control Panel).
 */

export const BODY_PRIORITIES = [
  'Energy levels',
  'Sleep quality',
  'Chronic pain management',
  'Fitness / exercise',
  'Nutrition / eating',
  'Physical recovery',
  'Illness management',
  'Body image',
  'Mobility',
];

export const STATE_TRIGGERS = [
  'Work stress',
  'Family conflict',
  'Social situations',
  'Health anxiety',
  'Money worries',
  'News / world events',
  'Lack of sleep',
  'Being alone',
  'Being around too many people',
];

export const REGULATION_TOOLS = [
  'Breathwork',
  'Movement / exercise',
  'Nature / outside',
  'Music',
  'Talking to someone',
  'Alone time',
  'Meditation',
  'Cold water',
  'Grounding exercises',
  'My pet',
];

export const EMOTION_STYLE_OPTIONS = [
  'I feel everything intensely',
  'I tend to intellectualize',
  'I suppress until I explode',
  'I process through talking',
  'I process through writing',
  'I need time alone to feel',
  'I\'m still figuring it out',
];

export const EMOTIONS_STRUGGLE = [
  'Anger (I avoid it / explode)',
  'Sadness (I push it down)',
  'Fear (I pretend I\'m fine)',
  'Joy (I feel guilty being happy)',
  'Shame (It paralyzes me)',
  'Grief (I haven\'t processed)',
  'Vulnerability',
];

export const CONNECTION_NEEDS = [
  'Deep 1-on-1 conversations',
  'Being around people (even casually)',
  'Physical touch / hugs',
  'Feeling understood',
  'Shared activities',
  'Someone checking on me',
  "Being needed by others',
  "Community belonging',
  'Romantic intimacy',
  'Family closeness',
];

export const CONNECTION_STRUGGLES = [
  'Initiating connection',
  'Vulnerability',
  'Trust',
  'Setting boundaries',
  'Conflict',
  'Loneliness',
  'Feeling like a burden',
  'Maintaining friendships',
  'Family relationships',
  'Romantic relationships',
];

export const DIRECTION_BLOCKS = [
  'Lack of clarity',
  'Fear of failure',
  'Fear of success',
  'Overwhelm',
  'Distraction',
  'Other responsibilities',
  'Self-doubt',
  'External obstacles',
  'I don\'t know what I want',
];

export const ALIGNMENT_VALUES = [
  'Family',
  'Freedom',
  'Honesty',
  'Creativity',
  'Growth',
  'Security',
  'Adventure',
  'Service',
  'Health',
  'Connection',
  'Success',
  'Peace',
  'Justice',
  'Loyalty',
  'Authenticity',
  'Knowledge',
  'Love',
  'Independence',
  'Fun',
  'Faith',
];

export const ALIGNMENT_INTENTIONS = [
  'Say no to one thing that does not align this week',
  'Spend 30 min on what matters',
  'Tell someone what I appreciate',
  'Rest without guilt',
];

export const CHECK_IN_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily (with main check-in)' },
  { value: 'every-other-day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly reflection' },
  { value: 'when-i-bring-up', label: 'Only when I bring it up' },
] as const;
