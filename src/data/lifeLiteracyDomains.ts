/**
 * Life Literacy - What humans need to know to navigate life well.
 * Each topic answers: What is this? Why does it matter? What helps?
 * Short, practical, meaningful. Not an encyclopedia.
 * Connects to gauges, Manual Signals/Cascades/Repairs, and tools.
 */

export interface LifeLiteracyDomain {
  id: string;
  title: string;
  emoji: string;
  /** What is this? (one clear sentence) */
  quickTruth: string;
  /** Why does it matter? (1-2 sentences) */
  whyMatters: string;
  /** What helps? (3-5 short, practical bullets) */
  whatHelps: string[];
  /** Optional: Manual page slug or route for "Go deeper" */
  manualRef?: string;
  /** Optional: route path to a tool */
  toolRef?: string;
}

export const LIFE_LITERACY_DOMAINS: LifeLiteracyDomain[] = [
  {
    id: 'understanding-yourself',
    title: 'Understanding yourself',
    emoji: '🪞',
    quickTruth: 'You already have a built-in dashboard: your gauges (Body, State, Emotion, Connection, Direction, Alignment) show how your system is doing.',
    whyMatters: 'Self-awareness is the foundation. Most people never learn to read their own signals. Your gauges and drivers help you spot patterns before they become crises.',
    whatHelps: [
      'Check your gauges when you feel off-Body and State first (sleep, food, stress).',
      'Notice cascades: one gauge dropping often pulls others (e.g. poor sleep → emotion and attention).',
      'Use insights and conversation history to see recurring themes.',
    ],
    manualRef: 'manual-1-dashboard',
    toolRef: '/learn/self-discovery',
  },
  {
    id: 'emotional-skills',
    title: 'Emotional skills',
    emoji: '💭',
    quickTruth: 'Emotional skills are learnable: naming feelings, regulating intensity, and repairing after hurt.',
    whyMatters: 'Most people were never taught how to handle anger, shame, or anxiety. These skills reduce suffering and improve relationships.',
    whatHelps: [
      'Name the emotion-"I feel X" instead of "I am X."',
      'Pause before reacting; use Breath or Grounding to lower intensity.',
      'For shame or anxiety: validate the feeling, then ask "What would help right now?"',
      'After emotional harm: acknowledge impact, apologize, and repair (see Relationship Toolkit).',
    ],
    manualRef: 'signal-anxiety',
    toolRef: '/learn/skills',
  },
  {
    id: 'relationships',
    title: 'Relationships',
    emoji: '💕',
    quickTruth: 'Relationships form through attention, reliability, and communication-and sometimes need repair or healthy distance.',
    whyMatters: 'Humans are social animals. Connection is one of the strongest predictors of well-being. Knowing how to make, keep, and repair relationships changes life.',
    whatHelps: [
      'Making: trust builds through small, consistent actions; attraction and friendship need time and shared experience.',
      'Maintaining: regular attention, showing up, and clear communication.',
      'Repairing: conflict resolution, apology, and repair (use Family Conflict Navigator when needed).',
      'Ending or distancing: boundaries, saying no without guilt, recognizing unhealthy dynamics.',
    ],
    manualRef: 'manual-1-dashboard',
    toolRef: '/learn/relationship-toolkit',
  },
  {
    id: 'identity-growth',
    title: 'Identity & personal growth',
    emoji: '🌱',
    quickTruth: 'Identity shifts across life. Values, self-respect, and purpose can be discovered and refined-not fixed once and for all.',
    whyMatters: 'Identity confusion and comparison with others cause huge stress. Understanding that growth has stages reduces the sense of being "behind."',
    whatHelps: [
      'Discover values through reflection (Alignment gauge, Life Direction Finder).',
      'Expect identity shifts in big transitions-adolescence, early adulthood, parenthood, midlife.',
      'Build self-respect by keeping small commitments to yourself.',
    ],
    manualRef: 'long-identity',
    toolRef: '/learn/questions',
  },
  {
    id: 'direction-career',
    title: 'Direction & career',
    emoji: '🎯',
    quickTruth: 'Career is direction, not a single job. Exploration, skills, and tolerating uncertainty matter more than one "right" choice.',
    whyMatters: 'Direction stress affects State and Alignment. People who understand career as evolving-and who develop decision skills-feel less stuck.',
    whatHelps: [
      'Use the Life Direction Finder: themes and possible fields, not a job title.',
      'Develop skills in areas that energize you (Thinking, Creating, Helping, Leading).',
      'Tolerate uncertainty: small experiments beat waiting for certainty.',
    ],
    manualRef: 'manual-1-engine',
    toolRef: '/tools/life-direction-finder',
  },
  {
    id: 'mental-health-literacy',
    title: 'Mental health literacy',
    emoji: '🧠',
    quickTruth: 'Mental health literacy means recognizing signals of anxiety, depression, burnout, trauma, or addiction-and knowing when to seek help.',
    whyMatters: 'Not diagnosing-just helping people name what they notice. That makes it easier to reach out for professional support when needed.',
    whatHelps: [
      'Learn common signals (Manual: Burnout, Anxiety, Overwhelm, Numbness, Motivation loss).',
      'If something persists or interferes with life, consider talking to a professional.',
      'Crisis: 988 Lifeline, Crisis Text Line 741741. This app is a companion, not a replacement for care.',
    ],
    manualRef: 'signal-burnout',
    toolRef: '/learn/self-discovery',
  },
  {
    id: 'decision-making',
    title: 'Decision making',
    emoji: '⚖️',
    quickTruth: 'Good decisions come from clear values, long-term thinking, and accepting that uncertainty and regret are part of life.',
    whyMatters: 'Many life problems come from poor decision frameworks. Teens and adults both benefit from a simple structure.',
    whatHelps: [
      'Align decisions with your values (Alignment gauge).',
      'Weigh long-term vs short-term: "How will I feel about this in a year?"',
      'Accept uncertainty-you rarely get full information; "good enough" often beats "perfect."',
      'Regret management: learn from it, repair if needed, then move forward.',
    ],
    manualRef: 'big-decisions',
    toolRef: '/learn/questions',
  },
  {
    id: 'boundaries',
    title: 'Boundaries',
    emoji: '🛡️',
    quickTruth: 'Boundaries are limits that protect your energy, time, and emotional safety-and you can say no without guilt.',
    whyMatters: 'One of the most requested topics in therapy. Without boundaries, resentment and burnout build; with them, relationships can be healthier.',
    whatHelps: [
      'Emotional boundaries: you don't have to take on others' feelings or fix their problems.',
      'Time boundaries: protect rest and priorities; "I can't this time" is enough.',
      'Say no clearly and kindly; you don't owe a long explanation.',
      'Recognize when someone repeatedly crosses boundaries-distance or support may be needed.',
    ],
    manualRef: 'manual-2-oil',
    toolRef: '/learn/relationship-toolkit',
  },
  {
    id: 'stress-recovery',
    title: 'Stress & recovery',
    emoji: '😴',
    quickTruth: 'Stress is normal; recovery is non-negotiable. Nervous system regulation, sleep, and breaking overwork cycles prevent burnout.',
    whyMatters: 'Modern life is extremely stressful. Without recovery, the system breaks down. Your Recovery cascade in the Manual explains how this works.',
    whatHelps: [
      'Prioritize sleep-it's the foundation of recovery.',
      'Use Breath, Grounding, Reset when you're activated.',
      'Break overwork cycles: small rest beats crash-and-burn.',
      'Watch your gauges: Body and State often drop first.',
    ],
    manualRef: 'cascade-recovery',
    toolRef: '/learn/skills',
  },
  {
    id: 'digital-attention',
    title: 'Digital life & attention',
    emoji: '📱',
    quickTruth: 'Screens affect attention and mood. Social media, distraction, and dopamine cycles are real-and manageable with awareness.',
    whyMatters: 'Digital life shapes stress, focus, and comparison. Your Attention cascade in the Manual ties this to your system.',
    whatHelps: [
      'Notice how you feel before and after scrolling; adjust use based on what helps.',
      'Protect focus time: reduce notifications, use blocks of uninterrupted work or rest.',
      'Dopamine cycles: variety and novelty are addictive; balance with offline connection and rest.',
    ],
    manualRef: 'cascade-attention',
    toolRef: '/learn/skills',
  },
  {
    id: 'life-transitions',
    title: 'Life transitions',
    emoji: '🦋',
    quickTruth: 'Humans go through predictable stages-adolescence, early adulthood, parenthood, midlife, aging-and often feel lost in between.',
    whyMatters: 'Transitions are disorienting. A map of life stages normalizes "this is a phase" and helps you prepare or seek support.',
    whatHelps: [
      'Use the Human Development Map (Life Stages) to see where you are and what's typical.',
      'Mark "I'm here" or "Preparing" to make transitions visible.',
      'During transitions, lean on Connection and Repairs; expect some gauge dips.',
    ],
    manualRef: 'long-identity',
    toolRef: '/learn/life-stages',
  },
  {
    id: 'money-stability',
    title: 'Money & life stability',
    emoji: '💰',
    quickTruth: 'Money stress affects State and Direction. Basics-budgeting, delayed gratification, and understanding financial stress-help even if the app doesn't give financial advice.',
    whyMatters: 'Financial worry is a major life stressor. Literacy reduces shame and supports clearer thinking.',
    whatHelps: [
      'Budgeting basics: know what comes in and goes out; small buffers reduce anxiety.',
      'Delayed gratification: link today's choices to tomorrow's stability.',
      'Financial stress is real-it affects sleep and mood; naming it helps you use other tools (Body, State, Connection).',
    ],
    manualRef: 'manual-3-warning',
    toolRef: '/learn/skills',
  },
  {
    id: 'health-literacy',
    title: 'Health literacy',
    emoji: '🫀',
    quickTruth: 'Sleep, movement, nutrition, and substance use all affect your Body gauge and the rest of your system.',
    whyMatters: 'Many people misunderstand how health works. Basic literacy supports better choices and fewer myths.',
    whatHelps: [
      'Sleep: consistency and enough hours; poor sleep cascades into emotion and attention.',
      'Movement: regular activity supports mood and energy.',
      'Nutrition: steady fuel helps State; extreme restriction or excess both strain the system.',
      'Substance use: understand how it affects your gauges; seek support if it's hard to change.',
    ],
    manualRef: 'body',
    toolRef: '/learn/self-discovery',
  },
  {
    id: 'meaning-purpose',
    title: 'Meaning & purpose',
    emoji: '✨',
    quickTruth: 'Meaning comes from contribution, values alignment, and how you relate to work and legacy-not from one big answer.',
    whyMatters: 'One of the biggest human questions. The Alignment gauge and Big Questions in the Manual speak to this directly.',
    whatHelps: [
      'Reflect on "What kind of work or contribution would make my life feel meaningful?" (Home prompt, Life Direction Finder).',
      'Align daily choices with what you value (Alignment gauge).',
      'Meaning can be found in small moments and relationships, not only in career or legacy.',
    ],
    manualRef: 'big-meaning',
    toolRef: '/learn/questions',
  },
  {
    id: 'social-impact',
    title: 'Social impact',
    emoji: '🌍',
    quickTruth: 'Community, helping others, belonging, and civic engagement increase life satisfaction and connect to something larger than oneself.',
    whyMatters: 'People who feel they contribute and belong tend to report higher well-being. This ties to Connection and Alignment.',
    whatHelps: [
      'Find one community or cause that fits your values and capacity.',
      'Helping others doesn't have to be huge-small, consistent contributions count.',
      'Balance giving with your own recovery; sustainable impact needs a regulated system.',
    ],
    manualRef: 'manual-1-dashboard',
    toolRef: '/learn/modern-manners',
  },
];

export function getLifeLiteracyDomainById(id: string): LifeLiteracyDomain | undefined {
  return LIFE_LITERACY_DOMAINS.find((d) => d.id === id);
}

export function getLifeLiteracyDomainIds(): string[] {
  return LIFE_LITERACY_DOMAINS.map((d) => d.id);
}
