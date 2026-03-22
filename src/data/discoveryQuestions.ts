/**
 * Discovery flows — Direction (purpose) and Alignment (values) questions/scenarios.
 */

export interface DirectionQuestion {
  id: string;
  question: string;
  placeholder: string;
  followUp: string | null;
}

export const DIRECTION_QUESTIONS: DirectionQuestion[] = [
  {
    id: 'future",
    question: \"Imagine your life 5 years from now, and it feels GOOD. What's different?\",
    placeholder: "What does that life look like?',
    followUp: "What stands out most about that vision?",
  },
  {
    id: 'noMoney",
    question: \"If money weren't an issue, what would you spend your time doing?\",
    placeholder: \"Don"t filter yourself...",
    followUp: "What draws you to that?",
  },
  {
    id: 'anger',
    question: "What problems in the world make you angry or sad?",
    placeholder: 'Injustice, suffering, waste...',
    followUp: "Why does that one hit you hardest?",
  },
  {
    id: 'expertise",
    question: \"What do people come to you for? What do they think you're good at?\",
    placeholder: "Advice, skills, support...',
    followUp: "Do you enjoy being that person?",
  },
  {
    id: 'flow',
    question: "When do you lose track of time? What are you doing?",
    placeholder: 'Activities that absorb you...',
    followUp: "What is it about that activity?",
  },
  {
    id: 'legacy',
    question: "If you could only be remembered for one thing, what would it be?",
    placeholder: 'Your impact, contribution...',
    followUp: null,
  },
];

export interface ValuesScenarioOption {
  label: string;
  values: string[];
}

export interface ValuesScenario {
  id: string;
  scenario: string;
  options?: ValuesScenarioOption[];
  freeText?: boolean;
  followUp?: string;
}

export const VALUES_SCENARIOS: ValuesScenario[] = [
  {
    id: 'tradeoff1",
    scenario: \"You're offered a dream job, but it requires moving far from family. What do you do?\",
    options: [
      { label: "Take it — growth matters most', values: ['Growth', 'Adventure', 'Success'] },
      { label: 'Decline — family comes first', values: ['Family', 'Security', 'Connection'] },
      { label: 'Negotiate remote/hybrid', values: ['Creativity', 'Independence', 'Freedom'] },
      { label: "It depends on the family situation", values: ['Justice', 'Love'] },
    ],
  },
  {
    id: 'tradeoff2",
    scenario: \"A friend asks you to lie to protect them. It's not illegal, but it"s dishonest. What do you do?",
    options: [
      { label: 'Lie for them — loyalty matters', values: ['Loyalty', 'Love', 'Connection'] },
      { label: 'Refuse — honesty is non-negotiable', values: ['Honesty', 'Authenticity', 'Justice'] },
      { label: 'Find a middle path', values: ['Peace', 'Knowledge'] },
      { label: 'Depends what they did', values: ['Justice', 'Fairness'] },
    ],
  },
  {
    id: 'tradeoff3",
    scenario: \"You can either rest this weekend (you're exhausted) or help a friend move. What do you do?\",
    options: [
      { label: "Help them — I can rest later', values: ['Service', 'Love', 'Connection'] },
      { label: 'Rest — I need to take care of myself', values: ['Health', 'Independence', 'Peace'] },
      { label: 'Help for a few hours, then rest', values: ['Balance', 'Creativity'] },
      { label: 'Depends how close we are', values: ['Knowledge', 'Authenticity'] },
    ],
  },
  {
    id: 'peak',
    scenario: "Think of a moment when you felt most ALIVE and like yourself. What were you doing?",
    freeText: true,
    followUp: "What value was being honored in that moment?",
  },
  {
    id: 'anger',
    scenario: "Think of a time you felt genuinely angry or betrayed. What value was violated?",
    freeText: true,
    followUp: "That tells us what matters to you.",
  },
];
