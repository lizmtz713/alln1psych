/**
 * Human Manual — Table of Contents (7 parts).
 * "Humans for Dummies / What to Expect — but for life."
 * Complete, scientifically grounded, simple to navigate, referenceable, layered.
 */

export type ManualTopicType = 'gauge' | 'page' | 'route';

export interface ManualTopic {
  id: string;
  title: string;
  emoji: string;
  type: ManualTopicType;
  /** For type 'page': slug in humanManualPages. For type 'route': path e.g. /tools/human-roles. For type 'gauge': gauge id. */
  target: string;
}

export interface ManualPart {
  id: string;
  partNumber: number;
  title: string;
  subtitle: string;
  emoji: string;
  topics: ManualTopic[];
}

export const HUMAN_MANUAL_PARTS: ManualPart[] = [
  {
    id: 'system',
    partNumber: 1,
    title: 'The Human System',
    subtitle: 'How humans actually work. Your six gauges.',
    emoji: '⚙️',
    topics: [
      { id: 'body', title: 'Body', emoji: '🫀', type: 'gauge', target: 'body' },
      { id: 'state', title: 'State', emoji: '🧠', type: 'gauge', target: 'state' },
      { id: 'emotion', title: 'Emotion', emoji: '💭', type: 'gauge', target: 'emotion' },
      { id: 'connection', title: 'Connection', emoji: '💕', type: 'gauge', target: 'connection' },
      { id: 'direction', title: 'Direction', emoji: '🎯', type: 'gauge', target: 'direction' },
      { id: 'alignment', title: 'Alignment', emoji: '✨', type: 'gauge', target: 'alignment' },
    ],
  },
  {
    id: 'signals',
    partNumber: 2,
    title: 'The Signals',
    subtitle: 'How to read what your system is telling you.',
    emoji: '📡',
    topics: [
      { id: 'burnout', title: 'Burnout', emoji: '🔥', type: 'page', target: 'signal-burnout' },
      { id: 'anxiety', title: 'Anxiety', emoji: '😰', type: 'page', target: 'signal-anxiety' },
      { id: 'loneliness', title: 'Loneliness', emoji: '🏝️', type: 'page', target: 'signal-loneliness' },
      { id: 'overwhelm', title: 'Overwhelm', emoji: '🌊', type: 'page', target: 'signal-overwhelm' },
      { id: 'emotional-numbness', title: 'Emotional numbness', emoji: '❄️', type: 'page', target: 'signal-numbness' },
      { id: 'motivation-loss', title: 'Motivation loss', emoji: '🔋', type: 'page', target: 'signal-motivation-loss' },
      { id: 'conflict', title: 'Conflict', emoji: '⚡', type: 'page', target: 'signal-conflict' },
      { id: 'feeling-lost', title: 'Feeling lost', emoji: '🧭', type: 'page', target: 'signal-feeling-lost' },
    ],
  },
  {
    id: 'cascades',
    partNumber: 3,
    title: 'The Cascades',
    subtitle: 'How problems spread through the system.',
    emoji: '🔄',
    topics: [
      { id: 'recovery-cascade', title: 'Recovery cascade', emoji: '😴', type: 'page', target: 'cascade-recovery' },
      { id: 'attention-cascade', title: 'Attention cascade', emoji: '📉', type: 'page', target: 'cascade-attention' },
      { id: 'reciprocity-cascade', title: 'Reciprocity cascade', emoji: '🤝', type: 'page', target: 'cascade-reciprocity' },
      { id: 'meaning-cascade', title: 'Meaning cascade', emoji: '💫', type: 'page', target: 'cascade-meaning' },
      { id: 'stress-cascade', title: 'Stress cascade', emoji: '🌪️', type: 'page', target: 'cascade-stress' },
    ],
  },
  {
    id: 'repairs',
    partNumber: 4,
    title: 'The Repairs',
    subtitle: 'Tools to stabilize the system.',
    emoji: '🔧',
    topics: [
      { id: 'breath', title: 'Breath', emoji: '🌬️', type: 'page', target: 'repair-breath' },
      { id: 'grounding', title: 'Grounding', emoji: '🌍', type: 'page', target: 'repair-grounding' },
      { id: 'reset', title: 'Reset', emoji: '↻', type: 'page', target: 'repair-reset' },
      { id: 'reframe', title: 'Reframe', emoji: '🔄', type: 'page', target: 'repair-reframe' },
      { id: 'focus', title: 'Focus', emoji: '⏱️', type: 'page', target: 'repair-focus' },
      { id: 'reach-out', title: 'Reach out', emoji: '💬', type: 'page', target: 'repair-reach-out' },
      { id: 'repair-conflict', title: 'Repair conflict', emoji: '🤝', type: 'page', target: 'repair-conflict' },
      { id: 'relationship-repair', title: 'Relationship Repair', emoji: '🤝', type: 'route', target: '/tools/relationship-repair' },
      { id: 'family-conflict', title: 'Family conflict support', emoji: '🏠', type: 'route', target: '/tools/family-conflict' },
      { id: 'perspective-translator', title: 'Perspective Translator', emoji: '🔄', type: 'route', target: '/tools/perspective-translator' },
    ],
  },
  {
    id: 'roles',
    partNumber: 5,
    title: 'The Roles & People',
    subtitle: 'How to show up for others. Relationship toolkit.',
    emoji: '👥',
    topics: [
      { id: 'human-roles', title: 'Human Roles guide', emoji: '📖', type: 'route', target: '/tools/human-roles' },
      { id: 'relationship-toolkit', title: 'Relationship Toolkit', emoji: '💕', type: 'route', target: '/learn/relationship-toolkit' },
      { id: 'parent-compass', title: 'Parent Compass', emoji: '🧭', type: 'route', target: '/tools/parent-compass' },
      { id: 'memory-builder', title: 'Memory Builder', emoji: '🧠', type: 'route', target: '/tools/memory-builder' },
    ],
  },
  {
    id: 'life-stages',
    partNumber: 6,
    title: 'Life Stages',
    subtitle: 'Where you are in the human journey. Developmental map.',
    emoji: '🗺️',
    topics: [
      { id: 'life-stages-map', title: 'Human Development Map', emoji: '📜', type: 'route', target: '/learn/life-stages' },
    ],
  },
  {
    id: 'long-game',
    partNumber: 7,
    title: 'The Long Game',
    subtitle: 'Life transitions and big changes.',
    emoji: '🦋',
    topics: [
      { id: 'career-choices', title: 'Career choices', emoji: '💼', type: 'page', target: 'long-career' },
      { id: 'life-direction-finder', title: 'Life Direction Finder', emoji: '🧭', type: 'route', target: '/tools/life-direction-finder' },
      { id: 'marriage-partnership', title: 'Marriage & partnership', emoji: '💑', type: 'page', target: 'long-marriage' },
      { id: 'parenting', title: 'Parenting', emoji: '👨‍👩‍👧', type: 'page', target: 'long-parenting' },
      { id: 'aging', title: 'Aging', emoji: '🌅', type: 'page', target: 'long-aging' },
      { id: 'grief-loss', title: 'Grief and loss', emoji: '🕊️', type: 'page', target: 'long-grief' },
      { id: 'identity-changes', title: 'Identity changes', emoji: '🪞', type: 'page', target: 'long-identity' },
      { id: 'midlife-shifts', title: 'Midlife shifts', emoji: '⏳', type: 'page', target: 'long-midlife' },
      { id: 'retirement', title: 'Retirement', emoji: '🏖️', type: 'page', target: 'long-retirement' },
    ],
  },
  {
    id: 'big-questions',
    partNumber: 8,
    title: 'The Big Questions',
    subtitle: 'The deeper human questions.',
    emoji: '❓',
    topics: [
      { id: 'meaningful-life', title: 'What is a meaningful life?', emoji: '🌟', type: 'page', target: 'big-meaning' },
      { id: 'difficult-decisions', title: 'How to make difficult decisions', emoji: '⚖️', type: 'page', target: 'big-decisions' },
      { id: 'why-suffering', title: 'Why humans suffer', emoji: '🕯️', type: 'page', target: 'big-suffering' },
      { id: 'what-creates-happiness', title: 'What creates happiness', emoji: '😊', type: 'page', target: 'big-happiness' },
      { id: 'how-people-grow', title: 'How people grow and change', emoji: '🌱', type: 'page', target: 'big-growth' },
      { id: 'what-matters-end', title: 'What matters at the end of life', emoji: '🌅', type: 'page', target: 'big-end-of-life' },
    ],
  },
  {
    id: 'life-literacy',
    partNumber: 9,
    title: 'Life Literacy',
    subtitle: 'What to know to navigate life well. What is it? Why it matters? What helps?',
    emoji: '📚',
    topics: [
      { id: 'literacy-understanding-yourself', title: 'Understanding yourself', emoji: '🪞', type: 'route', target: '/learn/life-literacy/understanding-yourself' },
      { id: 'literacy-emotional-skills', title: 'Emotional skills', emoji: '💭', type: 'route', target: '/learn/life-literacy/emotional-skills' },
      { id: 'literacy-relationships', title: 'Relationships', emoji: '💕', type: 'route', target: '/learn/life-literacy/relationships' },
      { id: 'literacy-identity-growth', title: 'Identity & growth', emoji: '🌱', type: 'route', target: '/learn/life-literacy/identity-growth' },
      { id: 'literacy-direction-career', title: 'Direction & career', emoji: '🎯', type: 'route', target: '/learn/life-literacy/direction-career' },
      { id: 'literacy-mental-health', title: 'Mental health literacy', emoji: '🧠', type: 'route', target: '/learn/life-literacy/mental-health-literacy' },
      { id: 'literacy-decision-making', title: 'Decision making', emoji: '⚖️', type: 'route', target: '/learn/life-literacy/decision-making' },
      { id: 'literacy-boundaries', title: 'Boundaries', emoji: '🛡️', type: 'route', target: '/learn/life-literacy/boundaries' },
      { id: 'literacy-stress-recovery', title: 'Stress & recovery', emoji: '😴', type: 'route', target: '/learn/life-literacy/stress-recovery' },
      { id: 'literacy-digital-attention', title: 'Digital life & attention', emoji: '📱', type: 'route', target: '/learn/life-literacy/digital-attention' },
      { id: 'literacy-life-transitions', title: 'Life transitions', emoji: '🦋', type: 'route', target: '/learn/life-literacy/life-transitions' },
      { id: 'literacy-money-stability', title: 'Money & stability', emoji: '💰', type: 'route', target: '/learn/life-literacy/money-stability' },
      { id: 'literacy-health', title: 'Health literacy', emoji: '🫀', type: 'route', target: '/learn/life-literacy/health-literacy' },
      { id: 'literacy-meaning-purpose', title: 'Meaning & purpose', emoji: '✨', type: 'route', target: '/learn/life-literacy/meaning-purpose' },
      { id: 'literacy-social-impact', title: 'Social impact', emoji: '🌍', type: 'route', target: '/learn/life-literacy/social-impact' },
    ],
  },
];

export function getPartById(id: string): ManualPart | undefined {
  return HUMAN_MANUAL_PARTS.find((p) => p.id === id);
}

export function getTopicBySlug(slug: string): { part: ManualPart; topic: ManualTopic } | undefined {
  for (const part of HUMAN_MANUAL_PARTS) {
    const topic = part.topics.find((t) => t.type === 'page' && t.target === slug);
    if (topic) return { part, topic };
  }
  return undefined;
}
