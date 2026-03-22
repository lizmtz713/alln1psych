/**
 * Human Manual — Foundations (START HERE)
 * Content aligned with ingauge-HUMAN-MANUAL-FOUNDATIONS spec.
 * These lessons appear at the top of the Manual tab; detail is shown in app/lesson/[id].tsx.
 */

export type FoundationsSection =
  | 'foundations'
  | 'body'
  | 'state'
  | 'emotion'
  | 'connection'
  | 'direction'
  | 'alignment'
  | 'development'
  | 'context'
  | 'problems'
  | 'growth';

export type AgeKey = 'teen' | 'young_adult' | 'adult' | 'mature' | 'senior';

export interface FoundationsLesson {
  id: string;
  section: FoundationsSection;
  title: string;
  subtitle: string;
  emoji: string;
  readTime: number;
  content: string;
  keyInsight: string;
  reflectionPrompt: string;
  ageAdaptations?: Partial<Record<AgeKey, string>>;
}

export const FOUNDATIONS_LESSONS: FoundationsLesson[] = [
  {
    id: 'foundations-what-is-a-human',
    section: 'foundations',
    title: 'What Is a Human?',
    subtitle: 'The question you never thought to ask',
    emoji: '🧬",
    readTime: 6,
    content: `You're not a machine that occasionally glitches. You"re a living system — evolved over millions of years, built for a world that no longer exists in the same form. Understanding what you are is the first step to working with yourself instead of against yourself.

**Three brains in one.** Your brain isn"t a single unit. It's layers: the ancient reptilian brain (survival, heartbeat, breathing), the limbic system (emotions, attachment, memory), and the neocortex (language, planning, self-reflection). They don"t always agree. When you"re stressed, the older layers can override the newer ones. That's not a character flaw. That"s biology.

**An emotional being.** Research in affective science shows that emotions aren"t add-ons to thinking — they're the foundation. You feel before you think. Your body sends signals that your mind then interprets. Ignoring that doesn"t make you more rational; it makes you less accurate about what"s actually going on.

The point: You're not broken. You"re a system. Systems need monitoring, understanding, maintenance, and support. This manual is for that.`,
    keyInsight: "You"re not broken. You're a system.\",
    reflectionPrompt: \"What part of being human have you been fighting against instead of working with?\",
    ageAdaptations: {
      teen: \"More emphasis on "you"re not weird, you're human" — your brain is still building. What you feel is real.",
      young_adult: "Focus on "you're still forming, that"s normal" — identity and brain development continue into your twenties.\",
      adult: \"Acknowledge competing demands — work, relationships, and the gap between how you want to feel and how you do.\",
      mature: \"Legacy and meaning themes — what you've learned about being human and what you want to pass on.\",
      senior: \"Wisdom framing — your system has been running a long time; maintenance and self-compassion matter more than ever.\",
    },
  },
  {
    id: "foundations-your-biological-design',
    section: 'foundations',
    title: 'Your Biological Design',
    subtitle: 'Why does my body do what it does?',
    emoji: '🦴",
    readTime: 7,
    content: `Your hardware is ancient. Your world is modern. That gap causes a lot of problems — and a lot of confusion about why you react the way you do.

**The mismatch problem.** We evolved for short bursts of danger, not 24/7 news cycles. For physical movement, not eight hours at a screen. For face-to-face connection, not likes and DMs. Your stress response was designed to save you from a predator, then turn off. In modern life, the \"predator\" is often a deadline or a difficult conversation — and the response doesn't turn off as cleanly.

**Three brains, again.** When you"re triggered, your prefrontal cortex (the part that plans and reflects) can go offline. The amygdala and older systems take over. You don"t get to \"think your way out\" in that moment because the part that thinks isn't fully in charge. That"s why "just calm down" rarely works. You have to work with the body first — breath, movement, safety — before the thinking brain can come back online.

The takeaway: Your body isn"t betraying you. It's running software that was written for a different world. Understanding that is the first step to updating how you work with it.`,
    keyInsight: \"Your hardware is ancient. Your world is modern. The gap causes problems.\",
    reflectionPrompt: \"Where in your life are you fighting your design instead of working with it?\",
    ageAdaptations: {
      teen: \"Your body is still changing. Sleep, food, and movement aren"t optional — they"re what your growing brain needs.\",
      adult: \"Stress accumulates. The body keeps score. Small, consistent care beats crisis management.\",
      senior: \"Aging changes the system — sleep, metabolism, recovery. It's not decline; it"s different settings. Adjust accordingly.",
    },
  },
  {
    id: 'foundations-what-you-need',
    section: 'foundations',
    title: 'What You Actually Need',
    subtitle: 'Why do I want what I want?',
    emoji: '💧',
    readTime: 5,
    content: `Maslow"s hierarchy is a simplification, but it points at something real: humans have needs, and unmet needs drive behavior. In this app we use six \"gauges\" that map to what you need: Body (physical safety, rest, movement), State (nervous system regulation), Emotion (feeling and being understood), Connection (belonging), Direction (purpose and meaning), and Alignment (living in line with your values).

**Just because a need CAN be met doesn't mean it IS being met.** You might have friends and still feel lonely (connection need). You might have a job and still feel lost (direction need). You might be \"fine\" physically and still be running on empty (body/state need). The gauges in this app help you check which needs are getting attention and which are running on empty.

When a need is chronically unmet, you"ll see it in your mood, your reactions, and your choices. Not as a moral failure — as information. "What do I need right now?" is one of the most useful questions you can ask.`,
    keyInsight: "Just because a need CAN be met doesn't mean it IS being met.",
    reflectionPrompt: "Which of the six needs is most neglected in your life right now?",
  },
  {
    id: 'foundations-how-you-got-here',
    section: 'foundations',
    title: 'How You Got Here',
    subtitle: 'Why am I the way I am?',
    emoji: '🕰️",
    readTime: 6,
    content: `You didn't choose most of what shapes you. Your genetics, your early environment, the culture you grew up in, and the experiences that left a mark — they built the system you"re now living with. That can be uncomfortable to sit with. It can also be freeing: you"re not broken for being a certain way. You're the result of a long chain of causes.

**Four layers.** Think of it as: (1) Biology — what you"re born with. (2) Attachment and early experience — how you learned to be in relationship and regulate. (3) Beliefs and stories — what you concluded about yourself and the world. (4) Current context — what"s happening now. All four interact. You can't change your biology, but you can update your beliefs and shift your context. You can"t redo childhood, but you can develop new patterns.

**The uncomfortable truth.** Before you can change, you have to understand what you"re working with. That might mean recognizing that a \"flaw\" is actually an adaptation that once kept you safe. That a pattern you hate came from somewhere. This isn't about blame — it"s about clarity. Change is possible. But it starts with seeing the system.`,
    keyInsight: "Before you can change, you have to understand what you"re working with.\",
    reflectionPrompt: \"What belief do you hold that you didn't consciously choose?\",
  },
  {
    id: "foundations-how-to-use-manual',
    section: 'foundations',
    title: 'How to Use This Manual',
    subtitle: 'Now what?',
    emoji: '📖",
    readTime: 4,
    content: `This manual is a map, not a prescription. You're not here to \"fix\" yourself. You"re here to understand how you work so you can make better choices and get better support.

**Using the gauges.** The six gauges (Body, State, Emotion, Connection, Direction, Alignment) are a way to check in: What"s running low? What's stable? You don"t have to be "good" at all of them. You just have to notice. When a gauge is low, the app can suggest lessons and tools that fit.

**Using the lessons.** Read what resonates. Skip what doesn"t. Come back when life shifts. The lessons are grounded in research, but they're not a substitute for professional care when you need it. Think of them as owner"s manual material — how the system is designed, what often goes wrong, what often helps.

**Mindset.** You are not broken. You are a system. Systems need monitoring, understanding, maintenance, and support. This manual is one piece of that. The rest is you — and the people and practices that help you run well.`,
    keyInsight: "You are not broken. You are a system. Systems need monitoring, understanding, maintenance, and support.",
    reflectionPrompt: "What's one thing you learned about yourself that changes how you'll approach today?",
  },
];

export function getFoundationsLessonById(id: string): FoundationsLesson | undefined {
  return FOUNDATIONS_LESSONS.find((l) => l.id === id);
}

export function isFoundationsLessonId(id: string): boolean {
  return FOUNDATIONS_LESSONS.some((l) => l.id === id);
}
