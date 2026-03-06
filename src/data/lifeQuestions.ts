/**
 * The 12 Life Questions — Inquiry modules with prompts and exercises.
 * Feeds Identity Snapshot, Purpose Hypothesis, Life Blueprint, and Human Profile.
 */

import type { LifeQuestionModule, LifeQuestionId } from '../types/life-questions';

export const LIFE_QUESTION_IDS: LifeQuestionId[] = [
  'identity',
  'purpose',
  'values',
  'strengths',
  'fears',
  'relationships',
  'meaning',
  'legacy',
  'growth',
  'belonging',
  'choice',
  'story',
];

export const LIFE_QUESTIONS: LifeQuestionModule[] = [
  {
    id: 'identity',
    order: 1,
    title: 'Who are you?',
    shortTitle: 'Identity',
    emoji: '🪞',
    description: 'Beyond roles and labels — who are you when no one is watching?',
    outputLabel: 'Identity Snapshot',
    prompts: [
      { id: 'p1', text: 'Who are you when no one is watching?', hint: 'Not your job or relationship — the you underneath.' },
      { id: 'p2', text: 'What would people who love you say is at your core?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Three words', instruction: 'Write three words that describe the real you.', placeholder: 'e.g. curious, steady, tender', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'I am...', instruction: 'Complete: "I am someone who..."', placeholder: 'Write one or two sentences.' },
    ],
  },
  {
    id: 'purpose',
    order: 2,
    title: 'What is your purpose?',
    shortTitle: 'Purpose',
    emoji: '🧭',
    description: 'What gets you up? What would you do even if no one paid you?',
    outputLabel: 'Purpose Hypothesis',
    prompts: [
      { id: 'p1', text: 'What would you do with your life if you knew you couldn’t fail?', hint: 'Not fame or money — the activity or cause.' },
      { id: 'p2', text: 'When do you lose track of time?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'Purpose in one sentence', instruction: 'Draft a single sentence: "My purpose is to..."', placeholder: 'It can change. This is a hypothesis.' },
      { id: 'e2', type: 'list', title: 'Signs of alignment', instruction: 'List 2–3 moments when you felt "this is what I’m for."', placeholder: 'Brief description of each', maxItems: 5 },
    ],
  },
  {
    id: 'values',
    order: 3,
    title: 'What do you value most?',
    shortTitle: 'Values',
    emoji: '⚖️',
    description: 'The principles you won’t compromise — even when it’s hard.',
    outputLabel: 'Life Blueprint',
    prompts: [
      { id: 'p1', text: 'What would you stand for even if everyone disagreed?' },
      { id: 'p2', text: 'When have you felt most proud of yourself? What value was in play?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Top 5 values', instruction: 'List your top 5 values. Order matters.', placeholder: 'e.g. honesty, freedom, family', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'Non‑negotiable', instruction: 'One value you will not compromise. Why?', placeholder: 'A few sentences.' },
    ],
  },
  {
    id: 'strengths',
    order: 4,
    title: 'What are you good at?',
    shortTitle: 'Strengths',
    emoji: '💪',
    description: 'Not just skills — the natural strengths others see in you.',
    outputLabel: 'Life Blueprint',
    prompts: [
      { id: 'p1', text: 'What do people often ask you for help with?' },
      { id: 'p2', text: 'What comes easily to you that others find hard?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Your superpowers', instruction: 'List 3–5 strengths. Think: what do others see?', placeholder: 'e.g. listening, solving, creating calm', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'Evidence', instruction: 'Describe one recent time you used a strength and it mattered.', placeholder: 'Brief story.' },
    ],
  },
  {
    id: 'fears',
    order: 5,
    title: 'What are you afraid of?',
    shortTitle: 'Fears',
    emoji: '🕳️',
    description: 'Naming fears reduces their power. No judgment.',
    outputLabel: 'Identity Snapshot',
    prompts: [
      { id: 'p1', text: 'What are you most afraid of? (Failure? Being seen? Losing someone?)', hint: 'It’s okay to name it.' },
      { id: 'p2', text: 'What would you do if that fear weren’t in the way?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'Name the fear', instruction: 'Write the fear in one sentence. No need to fix it yet.', placeholder: 'I’m afraid that...' },
      { id: 'e2', type: 'scale', title: 'How much does it run you?', instruction: 'Roughly how much does this fear influence your choices?', scaleLabels: ['Rarely', 'A lot'] },
    ],
  },
  {
    id: 'relationships',
    order: 6,
    title: 'Who matters to you?',
    shortTitle: 'Relationships',
    emoji: '🤝',
    description: 'The people who shape and are shaped by you.',
    outputLabel: 'Life Blueprint',
    prompts: [
      { id: 'p1', text: 'Who are the 3–5 people who have shaped you the most?' },
      { id: 'p2', text: 'Who do you want to show up better for?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Your circle', instruction: 'Name the people who matter most (and why in one word).', placeholder: 'Name — why', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'One relationship to nurture', instruction: 'Pick one relationship you want to invest in. What’s one small step?', placeholder: 'Person + one action.' },
    ],
  },
  {
    id: 'meaning',
    order: 7,
    title: 'What makes life meaningful?',
    shortTitle: 'Meaning',
    emoji: '✨',
    description: 'Where do you find meaning — work, love, creation, service?',
    outputLabel: 'Purpose Hypothesis',
    prompts: [
      { id: 'p1', text: 'When do you feel that life is meaningful?' },
      { id: 'p2', text: 'What would make your life feel meaningful in 10 years?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Sources of meaning', instruction: 'List 3–5 things that make life meaningful for you.', placeholder: 'e.g. helping others, creating, family', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'One sentence', instruction: 'Complete: "Life is meaningful to me when..."', placeholder: 'One or two sentences.' },
    ],
  },
  {
    id: 'legacy',
    order: 8,
    title: 'What do you want to leave behind?',
    shortTitle: 'Legacy',
    emoji: '🌱',
    description: 'Not fame — the imprint you want on people and the world.',
    outputLabel: 'Purpose Hypothesis',
    prompts: [
      { id: 'p1', text: 'How do you want people to remember you?' },
      { id: 'p2', text: 'What do you want to have contributed by the end of your life?' },
      { id: 'p3', text: 'The tombstone test: Imagine your tombstone. What three words or one line would you want on it?', hint: 'Not what others would write — what you’d choose.' },
      { id: 'p4', text: 'Letter to the future: If you could leave a short letter for someone in the future — a descendant or the world — what do you want them to know about you or what you value?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'Legacy in one line', instruction: 'If someone summed up your impact in one sentence, what would you want it to be?', placeholder: 'e.g. "They made people feel seen."' },
      { id: 'e2', type: 'list', title: 'Three contributions', instruction: 'List 3 ways you’d like to have made a difference.', placeholder: 'People, cause, or place', maxItems: 5 },
      { id: 'e3', type: 'freeform', title: 'Tombstone test', instruction: 'Imagine your tombstone. What three words or one line would you want on it?', placeholder: 'e.g. "Loved. Tried. Left it better."' },
      { id: 'e4', type: 'freeform', title: 'Letter to the future', instruction: 'Write a short letter to someone in the future. What do you want them to know about you or your values?', placeholder: 'A few sentences.' },
    ],
  },
  {
    id: 'growth',
    order: 9,
    title: 'How do you want to grow?',
    shortTitle: 'Growth',
    emoji: '🌿',
    description: 'The person you’re becoming — not fixing, growing.',
    outputLabel: 'Life Blueprint',
    prompts: [
      { id: 'p1', text: 'What’s one way you want to be different in a year?' },
      { id: 'p2', text: 'What old habit or belief are you ready to loosen?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'Growth edge', instruction: 'Name one area you’re actively trying to grow in.', placeholder: 'e.g. patience, boundaries, courage' },
      { id: 'e2', type: 'scale', title: 'How committed?', instruction: 'How committed are you to this growth right now?', scaleLabels: ['Just curious', 'All in'] },
    ],
  },
  {
    id: 'belonging',
    order: 10,
    title: 'Where do you belong?',
    shortTitle: 'Belonging',
    emoji: '🏠',
    description: 'Where and with whom do you feel at home?',
    outputLabel: 'Identity Snapshot',
    prompts: [
      { id: 'p1', text: 'Where do you feel most yourself?' },
      { id: 'p2', text: 'With whom do you feel you can be fully you?' },
    ],
    exercises: [
      { id: 'e1', type: 'list', title: 'Places of belonging', instruction: 'List 2–3 places or contexts where you feel you belong.', placeholder: 'e.g. my family, the gym, my team', maxItems: 5 },
      { id: 'e2', type: 'freeform', title: 'When you felt "I belong"', instruction: 'Describe one memory when you felt deeply that you belonged.', placeholder: 'Brief story.' },
    ],
  },
  {
    id: 'choice',
    order: 11,
    title: 'What choice are you avoiding?',
    shortTitle: 'Choice',
    emoji: '🔀',
    description: 'The decision that keeps showing up — and what’s really in the way.',
    outputLabel: 'Life Blueprint',
    prompts: [
      { id: 'p1', text: 'Is there a decision you’ve been putting off?', hint: 'Relationship, job, move, boundary...' },
      { id: 'p2', text: 'What would you choose if you weren’t afraid?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'The choice', instruction: 'Name the choice in one sentence.', placeholder: 'e.g. Whether to leave this job.' },
      { id: 'e2', type: 'freeform', title: 'What’s in the way?', instruction: 'What’s really stopping you? (Fear, money, others’ opinions?)', placeholder: 'A few sentences.' },
    ],
  },
  {
    id: 'story',
    order: 12,
    title: 'What’s your story?',
    shortTitle: 'Your Story',
    emoji: '📖',
    description: 'The narrative you tell about your life — and whether it still fits.',
    outputLabel: 'Identity Snapshot',
    prompts: [
      { id: 'p1', text: 'What’s the story you usually tell about your life?' },
      { id: 'p2', text: 'Is there a chapter you’re ready to rewrite or close?' },
    ],
    exercises: [
      { id: 'e1', type: 'freeform', title: 'Story in a paragraph', instruction: 'Write a short version of "your story" as you tell it today.', placeholder: '3–5 sentences.' },
      { id: 'e2', type: 'freeform', title: 'New chapter', instruction: 'If you could start a new chapter, what would it be titled?', placeholder: 'e.g. "The year I said no."' },
    ],
  },
];

export function getLifeQuestionById(id: LifeQuestionId): LifeQuestionModule | undefined {
  return LIFE_QUESTIONS.find((q) => q.id === id);
}

export function getLifeQuestionsInOrder(): LifeQuestionModule[] {
  return [...LIFE_QUESTIONS].sort((a, b) => a.order - b.order);
}
