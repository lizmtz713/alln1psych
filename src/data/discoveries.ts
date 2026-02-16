export interface Discovery {
  id: string;
  category: 'ancient' | 'science' | 'funfact' | 'future';
  emoji: string;
  title: string;
  content: string;
  source?: string;
}

export const DISCOVERIES: Discovery[] = [
  // ANCIENT WISDOM
  {
    id: 'stoics-cbt',
    category: 'ancient',
    emoji: '🏛️',
    title: 'The Stoics Had CBT First',
    content: "2,000 years before therapists invented Cognitive Behavioral Therapy, Marcus Aurelius wrote: 'You have power over your mind, not outside events.' The Thought Challenger activity? The Stoics were doing it in 170 AD.",
  },
  {
    id: 'buddhism-dashboard',
    category: 'ancient',
    emoji: '🧘',
    title: "Buddhism's Dashboard",
    content: "Buddhist monks have been practicing emotional observation for 2,500 years. They called it mindfulness. Your Emotion Wheel? Same idea: name it, watch it, let it pass.",
  },
  {
    id: 'rumi-breakdowns',
    category: 'ancient',
    emoji: '✨',
    title: 'Rumi on Breakdowns',
    content: "The 13th-century poet Rumi wrote: 'The wound is the place where the light enters you.' Modern psychology calls this post-traumatic growth. Ancient poets knew it first.",
  },
  {
    id: 'know-thyself',
    category: 'ancient',
    emoji: '🏺',
    title: 'Know Thyself',
    content: "The ancient Greeks carved 'Know Thyself' above the Oracle at Delphi. It was considered the most important thing a human could do. This entire app is built on that one idea.",
  },
  {
    id: 'ubuntu',
    category: 'ancient',
    emoji: '🤝',
    title: 'Ubuntu',
    content: "In Southern African philosophy, 'Ubuntu' means 'I am because we are.' Your Circle feature — sharing how you feel with the people who matter — is Ubuntu in your pocket.",
  },
  {
    id: 'tao-doing-nothing',
    category: 'ancient',
    emoji: '☯️',
    title: 'The Tao of Doing Nothing',
    content: "Lao Tzu taught that sometimes the wisest action is no action. When Psych goes quiet and lets you sit with a feeling instead of fixing it — that's 2,500-year-old wisdom.",
  },
  {
    id: 'indigenous-body-wisdom',
    category: 'ancient',
    emoji: '🌿',
    title: 'Indigenous Body Wisdom',
    content: "Indigenous healing traditions have always known the body stores emotion. Western science 'discovered' this in the 1990s. Your Body Scan activity connects to knowledge that's thousands of years old.",
  },
  {
    id: 'seneca-anger',
    category: 'ancient',
    emoji: '📜',
    title: 'Seneca on Anger',
    content: "The Stoic philosopher Seneca wrote an entire book on anger in 41 AD. His advice? Delay your response. That's the same 6-second rule modern neuroscience recommends.",
  },
  {
    id: 'kintsugi',
    category: 'ancient',
    emoji: '🍶',
    title: 'The Japanese Art of Kintsugi',
    content: "Kintsugi is the practice of repairing broken pottery with gold. The cracks become the most beautiful part. Your scars and struggles aren't flaws — they're where the gold is.",
  },
  {
    id: 'aristotle-golden-mean',
    category: 'ancient',
    emoji: '⚖️',
    title: "Aristotle's Golden Mean",
    content: "Aristotle taught that every emotion has a healthy middle ground. Not too much anger, not too little. Not too much fear, not too little. Emotional intelligence isn't about eliminating feelings — it's about balance.",
  },
  // BRAIN SCIENCE
  {
    id: 'brain-6-second',
    category: 'science',
    emoji: '🧠',
    title: 'Your Brain Has a 6-Second Delay',
    content: "Your amygdala reacts to threats in milliseconds. Your prefrontal cortex takes about 6 seconds to catch up. That's why you say things you regret. Those 6 seconds are where emotional intelligence lives.",
  },
  {
    id: 'serotonin-gut',
    category: 'science',
    emoji: '🦠',
    title: '90% of Serotonin Is in Your Gut',
    content: "The 'happy chemical' isn't made in your brain — 90% of it is produced in your gut. That 'gut feeling' is literally your second brain talking to your first one.",
  },
  {
    id: 'crying-stress-flush',
    category: 'science',
    emoji: '😢',
    title: 'Crying Is a Stress Flush',
    content: "Emotional tears contain stress hormones and toxins that your body is literally flushing out. Crying isn't weakness — it's your body's built-in detox system.",
  },
  {
    id: 'neuroplasticity',
    category: 'science',
    emoji: '🔌',
    title: 'Your Brain Rewires Itself',
    content: "Neuroplasticity means your brain physically changes based on what you repeatedly do. Every time you pause instead of react, you're building a new neural pathway. You are literally rewiring your brain.",
  },
  {
    id: 'sleep-emotional-laundry',
    category: 'science',
    emoji: '😴',
    title: 'Sleep Is Emotional Laundry',
    content: "During REM sleep, your brain processes emotional experiences and strips the emotional charge from memories. One bad night of sleep reduces emotional regulation by up to 60%.",
  },
  {
    id: 'naming-feelings',
    category: 'science',
    emoji: '🏷️',
    title: 'Naming Feelings Calms You Down',
    content: "Brain scans show that simply naming an emotion (affect labeling) reduces amygdala activation. When you tell Psych 'I feel anxious,' your brain is already starting to calm down.",
  },
  {
    id: 'heart-neurons',
    category: 'science',
    emoji: '❤️',
    title: 'Your Heart Has Neurons',
    content: "Your heart contains about 40,000 neurons — its own mini nervous system. When people say 'listen to your heart,' there's actual neuroscience behind it.",
  },
  {
    id: 'stress-contagious',
    category: 'science',
    emoji: '📡',
    title: 'Stress Is Contagious',
    content: "Research shows you can 'catch' stress from people around you, even strangers. Your Temperature system works both ways — seeing someone green can actually calm your nervous system.",
  },
  {
    id: 'exercise-antidepressant',
    category: 'science',
    emoji: '🚶',
    title: 'Exercise Is an Antidepressant',
    content: "A 20-minute walk can be as effective as a mild antidepressant for some people. Your body was designed to move, and movement completes the stress cycle.",
  },
  {
    id: 'laughter-chemistry',
    category: 'science',
    emoji: '😂',
    title: 'Laughter Changes Brain Chemistry',
    content: "Genuine laughter releases endorphins, reduces cortisol, and activates the same brain regions as meditation. It's not just fun — it's medicine.",
  },
  // FUN FACTS
  {
    id: '27-emotions',
    category: 'funfact',
    emoji: '🎭',
    title: 'Humans Experience 27 Emotions',
    content: "Researchers at UC Berkeley identified 27 distinct emotions humans experience. Most people can only name about 3: good, bad, and tired. Your Emotion Wheel has 36.",
  },
  {
    id: 'babies-feel-mood',
    category: 'funfact',
    emoji: '👶',
    title: 'Babies Can Feel Your Mood',
    content: "Infants can detect emotional states in adults before they can speak. Your temperature affects the people around you, even if you don't say a word.",
  },
  {
    id: 'dogs-smell-emotions',
    category: 'funfact',
    emoji: '🐕',
    title: 'Dogs Can Smell Your Emotions',
    content: "Dogs can literally smell cortisol and adrenaline. When you're stressed, your dog knows before you do. They're living emotional dashboards.",
  },
  {
    id: 'nostalgia-good',
    category: 'funfact',
    emoji: '📻',
    title: 'Nostalgia Is Good for You',
    content: "Researchers found that nostalgia increases feelings of social connection, meaning, and self-continuity. Your Gratitude Jar isn't just for new memories — the old ones matter too.",
  },
  {
    id: '35000-decisions',
    category: 'funfact',
    emoji: '🤯',
    title: 'You Make 35,000 Decisions a Day',
    content: "The average adult makes about 35,000 decisions daily. Decision fatigue is real — that's why you feel drained even when you 'didn't do anything.' Your brain was working overtime.",
  },
  // FUTURE
  {
    id: 'ai-knows-mood',
    category: 'future',
    emoji: '⌚',
    title: 'AI Will Know Your Mood Before You Do',
    content: "Wearable AI will soon detect emotional states through heart rate variability, skin conductance, and voice patterns — before you're consciously aware of the feeling.",
  },
  {
    id: 'car-reads-emotions',
    category: 'future',
    emoji: '🚗',
    title: 'Your Car Will Read Your Emotions',
    content: "Automotive companies are building emotion-detection into vehicles. Imagine your car adjusting music, temperature, and route based on how your day went. That future is 3-5 years away.",
  },
  {
    id: 'emotional-data-oil',
    category: 'future',
    emoji: '🛢️',
    title: 'Emotional Data Is the New Oil',
    content: "Anonymized emotional pattern data will become one of the most valuable datasets in the world. Understanding human feelings at scale will reshape healthcare, education, and design.",
  },
  {
    id: 'eq-in-school',
    category: 'future',
    emoji: '🏫',
    title: 'Kids Will Learn EQ in School',
    content: "Emotional intelligence curricula are being adopted in schools worldwide. The next generation will grow up with emotional vocabulary as a basic skill, like reading and math.",
  },
  {
    id: 'loneliness-tech',
    category: 'future',
    emoji: '📱',
    title: 'The Loneliness Epidemic Has a Tech Solution',
    content: "Loneliness kills more people than smoking. Technology that makes emotional connection visible and actionable — like your Temperature system — may be part of the cure.",
  },
];

const CATEGORY_TAG: Record<Discovery['category'], string> = {
  ancient: '🏛️ Ancient',
  science: '🧬 Science',
  funfact: '🎲 Fun Fact',
  future: '🔮 Future',
};

export function getCategoryTag(category: Discovery['category']): string {
  return CATEGORY_TAG[category];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Returns 3 discoveries for today (deterministic by day-of-year). */
export function getDiscoveriesForDay(): Discovery[] {
  const day = getDayOfYear();
  const n = DISCOVERIES.length;
  const i0 = day % n;
  const i1 = (day + 11) % n;
  const i2 = (day + 22) % n;
  return [DISCOVERIES[i0], DISCOVERIES[i1], DISCOVERIES[i2]];
}

/** Returns 3 random discoveries not in excludeIds. */
export function getMoreDiscoveries(excludeIds: Set<string>): Discovery[] {
  const pool = DISCOVERIES.filter((d) => !excludeIds.has(d.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
