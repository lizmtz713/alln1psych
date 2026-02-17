// Brain health education cards
// Bite-sized neuroscience that empowers without overwhelming

export interface BrainCard {
  id: string;
  title: string;
  emoji: string;
  category: 'basics' | 'sleep' | 'movement' | 'stress' | 'mood' | 'focus';
  quickTake: string; // One sentence hook
  content: string; // 2-3 sentences of explanation
  funFact?: string; // Optional "did you know"
  tryThis?: string; // Optional micro-action
}

export interface BrainCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const BRAIN_CATEGORIES: BrainCategory[] = [
  {
    id: 'basics',
    name: 'Your Brain 101',
    emoji: '🧠',
    description: 'How your brain actually works',
    color: '#8B5CF6',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    emoji: '😴',
    description: 'Why rest is a superpower',
    color: '#6366F1',
  },
  {
    id: 'movement',
    name: 'Movement',
    emoji: '🏃',
    description: 'Exercise is brain medicine',
    color: '#10B981',
  },
  {
    id: 'stress',
    name: 'Stress',
    emoji: '😤',
    description: 'What cortisol does to you',
    color: '#EF4444',
  },
  {
    id: 'mood',
    name: 'Mood',
    emoji: '🌈',
    description: 'The chemistry of feelings',
    color: '#F59E0B',
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '🎯',
    description: 'Attention in a distracted world',
    color: '#3B82F6',
  },
];

export const BRAIN_CARDS: BrainCard[] = [
  // === YOUR BRAIN 101 ===
  {
    id: 'neuroplasticity',
    title: 'Your Brain Can Change',
    emoji: '🔄',
    category: 'basics',
    quickTake: 'Your brain isn\'t fixed — it rewires itself based on what you do.',
    content: 'Neuroplasticity means your brain physically changes when you learn and practice things. Every time you repeat a behavior or thought pattern, you strengthen those neural pathways. This is why habits feel automatic over time — and why you CAN change patterns that aren\'t serving you.',
    funFact: 'London taxi drivers have larger hippocampi (memory centers) than average because they memorize thousands of streets. Your brain literally grows based on what you use it for.',
    tryThis: 'Pick one small positive habit this week. Each time you do it, know you\'re physically rewiring your brain.',
  },
  {
    id: 'amygdala',
    title: 'Your Brain\'s Alarm System',
    emoji: '🚨',
    category: 'basics',
    quickTake: 'The amygdala is why you react before you think.',
    content: 'Your amygdala is a small almond-shaped region that scans for threats 24/7. When it senses danger (real or imagined), it triggers your fight-flight-freeze response BEFORE your thinking brain can evaluate the situation. That\'s why you jump at loud noises or feel panic before logic kicks in.',
    funFact: 'Your amygdala can\'t tell the difference between a real threat (lion) and a social one (embarrassment). It reacts the same way to both.',
    tryThis: 'Next time you feel sudden fear or anxiety, say "that\'s just my amygdala." Naming it creates distance.',
  },
  {
    id: 'prefrontal-cortex',
    title: 'Your Brain\'s CEO',
    emoji: '👔',
    category: 'basics',
    quickTake: 'The prefrontal cortex is your planning, decision-making, impulse-control center.',
    content: 'Located behind your forehead, the prefrontal cortex handles complex thinking: planning, weighing consequences, controlling impulses, and regulating emotions. Here\'s the catch — it\'s not fully developed until your mid-20s. That\'s why teens feel things intensely and sometimes make impulsive choices.',
    funFact: 'When you\'re stressed, tired, or overwhelmed, your prefrontal cortex goes "offline" and your emotional brain takes over. This is why you make worse decisions when exhausted.',
    tryThis: 'Before a big decision, ask: "Am I rested and calm enough to think clearly?"',
  },
  {
    id: 'neurons',
    title: 'Brain Cells That Talk',
    emoji: '⚡',
    category: 'basics',
    quickTake: 'You have 86 billion neurons constantly sending messages.',
    content: 'Neurons are brain cells that communicate through electrical and chemical signals. When you think, feel, or do anything, neurons are firing and connecting. "Neurons that fire together, wire together" — meaning repeated experiences create stronger connections.',
    funFact: 'A single neuron can connect to up to 10,000 other neurons. Your brain has more connections than there are stars in the Milky Way.',
  },

  // === SLEEP ===
  {
    id: 'sleep-cleaning',
    title: 'Sleep Cleans Your Brain',
    emoji: '🧹',
    category: 'sleep',
    quickTake: 'While you sleep, your brain takes out the trash.',
    content: 'Your brain has a "cleaning system" called the glymphatic system that activates during deep sleep. It flushes out toxins and metabolic waste that build up during the day — including proteins linked to Alzheimer\'s. Skip sleep, skip the cleaning.',
    funFact: 'Your brain shrinks by about 60% during sleep to make room for cleaning fluid to flow through. It literally makes space for maintenance.',
    tryThis: 'Prioritize 7-9 hours tonight. Think of it as letting the cleaning crew do their job.',
  },
  {
    id: 'sleep-memory',
    title: 'Sleep Locks In Memories',
    emoji: '🔐',
    category: 'sleep',
    quickTake: 'What you learned today gets saved to long-term storage tonight.',
    content: 'During sleep, your brain replays the day\'s experiences and decides what to keep. Important stuff gets moved from short-term to long-term memory. REM sleep (when you dream) is especially crucial for emotional memories and learning.',
    funFact: 'Students who sleep after studying remember significantly more than those who stay up cramming. Sleep IS studying.',
    tryThis: 'Review important material before bed instead of first thing in the morning.',
  },
  {
    id: 'sleep-consistency',
    title: 'Same Wake Time > More Sleep',
    emoji: '⏰',
    category: 'sleep',
    quickTake: 'A consistent wake time matters more than total hours.',
    content: 'Your body runs on a circadian rhythm — a 24-hour internal clock. Waking up at random times confuses this clock and makes you feel worse, even if you sleep "enough." A consistent wake time (even on weekends) keeps your rhythm stable.',
    funFact: 'Social jetlag (staying up late and sleeping in on weekends) has similar effects to actual jetlag. Your body doesn\'t know it\'s Saturday.',
    tryThis: 'Pick a wake time and stick to it for a week — even weekends. Notice how you feel.',
  },
  {
    id: 'sleep-screens',
    title: 'Blue Light Lies to Your Brain',
    emoji: '📱',
    category: 'sleep',
    quickTake: 'Screens before bed trick your brain into thinking it\'s daytime.',
    content: 'Blue light from phones and screens suppresses melatonin — the hormone that makes you sleepy. Your brain interprets blue light as sunlight and delays your sleep cycle. Even 30 minutes of scrolling can push back your natural bedtime.',
    tryThis: 'Try 30 minutes of no screens before bed for 3 nights. See if you fall asleep faster.',
  },

  // === MOVEMENT ===
  {
    id: 'movement-bdnf',
    title: 'Exercise Grows Your Brain',
    emoji: '🌱',
    category: 'movement',
    quickTake: 'Physical activity releases "fertilizer" for brain cells.',
    content: 'Exercise releases BDNF (brain-derived neurotrophic factor), which helps neurons grow and form new connections. It\'s literally fertilizer for your brain. Regular movement increases the size of your hippocampus — the memory and learning center.',
    funFact: 'A single workout boosts BDNF levels for hours. The effects on mood and focus are immediate, not just long-term.',
    tryThis: 'Before studying or doing something important, take a 10-minute walk. Your brain will work better.',
  },
  {
    id: 'movement-anxiety',
    title: 'Movement Burns Off Anxiety',
    emoji: '🔥',
    category: 'movement',
    quickTake: 'Anxiety prepares your body to move — so move.',
    content: 'Anxiety triggers the fight-or-flight response, flooding you with adrenaline and cortisol designed for physical action. When you don\'t move, those chemicals just sit in your system making you feel jittery. Movement metabolizes stress hormones naturally.',
    tryThis: 'Next time you feel anxious, do 20 jumping jacks or take a brisk walk. You\'re using the energy your body prepared.',
  },
  {
    id: 'movement-mood',
    title: 'The Runner\'s High Is Real',
    emoji: '✨',
    category: 'movement',
    quickTake: 'Exercise releases the same chemicals as some antidepressants.',
    content: 'Movement releases endorphins, serotonin, and dopamine — your brain\'s feel-good chemicals. Studies show regular exercise can be as effective as medication for mild-to-moderate depression. You\'re not imagining it when you feel better after moving.',
    funFact: 'You don\'t need intense workouts. Even a 20-minute walk significantly improves mood. Consistency beats intensity.',
  },
  {
    id: 'movement-minimum',
    title: 'Any Movement Counts',
    emoji: '🚶',
    category: 'movement',
    quickTake: 'You don\'t need the gym. Just don\'t stay still.',
    content: 'Your brain doesn\'t care if it\'s a workout or a walk to get water. Any movement helps. Sitting for hours is what hurts — breaking it up with even small movements keeps blood and oxygen flowing to your brain.',
    tryThis: 'Set a reminder to stand up and move for 2 minutes every hour. Your brain will thank you.',
  },

  // === STRESS ===
  {
    id: 'stress-cortisol',
    title: 'Cortisol: Helpful Until It\'s Not',
    emoji: '⚠️',
    category: 'stress',
    quickTake: 'Short-term stress helps you. Chronic stress harms you.',
    content: 'Cortisol is your stress hormone. In short bursts, it\'s useful — it helps you focus, react quickly, and perform under pressure. But when cortisol stays elevated (chronic stress), it damages your brain, weakens your immune system, and disrupts sleep.',
    funFact: 'Chronic stress can actually shrink your hippocampus (memory center) and enlarge your amygdala (fear center). Your brain physically changes shape under prolonged stress.',
    tryThis: 'Identify one source of ongoing stress. Can you reduce it, or do you need to build in more recovery time?',
  },
  {
    id: 'stress-breathing',
    title: 'Breathing Is a Cheat Code',
    emoji: '🫁',
    category: 'stress',
    quickTake: 'Slow exhales literally turn off the stress response.',
    content: 'Your breath is the one part of your autonomic nervous system you can control consciously. Long exhales activate the vagus nerve, which signals your body to calm down. This is why every breathing technique emphasizes exhaling longer than inhaling.',
    funFact: 'The "physiological sigh" (double inhale through the nose, long exhale through the mouth) is the fastest way to calm down — even one rep works.',
    tryThis: 'Try it now: inhale-inhale through nose, loooong exhale through mouth. Notice the shift.',
  },
  {
    id: 'stress-recovery',
    title: 'Stress + Recovery = Growth',
    emoji: '💪',
    category: 'stress',
    quickTake: 'It\'s not about avoiding stress — it\'s about recovering from it.',
    content: 'Some stress is necessary for growth (think: exercise, challenges, learning). The problem isn\'t stress itself — it\'s stress without recovery. Athletes know this: you get stronger during rest, not during the workout. Same with your brain.',
    tryThis: 'After intense periods (exams, projects, conflict), schedule real recovery time. It\'s not lazy — it\'s how growth works.',
  },

  // === MOOD ===
  {
    id: 'mood-serotonin',
    title: 'Serotonin: The Stability Chemical',
    emoji: '⚖️',
    category: 'mood',
    quickTake: 'Serotonin keeps your mood stable and helps you feel okay.',
    content: 'Serotonin regulates mood, sleep, appetite, and digestion. Low serotonin is linked to depression and anxiety. Sunlight, exercise, and certain foods (like those containing tryptophan) help your body make more of it.',
    funFact: '95% of your serotonin is made in your gut, not your brain. Your digestive system directly affects your mood.',
    tryThis: 'Get morning sunlight within an hour of waking. It triggers serotonin production and sets your circadian rhythm.',
  },
  {
    id: 'mood-dopamine',
    title: 'Dopamine: Motivation, Not Just Pleasure',
    emoji: '🎯',
    category: 'mood',
    quickTake: 'Dopamine drives you toward goals — it\'s about wanting, not just having.',
    content: 'Dopamine is often called the "pleasure chemical," but it\'s really about motivation and anticipation. It spikes when you\'re pursuing something rewarding, not just when you get it. That\'s why the chase can feel better than the prize.',
    funFact: 'Social media hijacks dopamine with variable rewards (will this post do well?). It\'s the same mechanism as slot machines.',
    tryThis: 'Notice what gives you cheap dopamine (scrolling, snacking) vs. earned dopamine (completing tasks, exercise). Balance matters.',
  },
  {
    id: 'mood-negativity-bias',
    title: 'Your Brain Is Biased Negative',
    emoji: '➖',
    category: 'mood',
    quickTake: 'Bad experiences stick more than good ones. It\'s not you — it\'s evolution.',
    content: 'Your brain is wired to remember threats better than rewards. This "negativity bias" kept ancestors alive but makes modern life harder. You need about 3-5 positive experiences to balance one negative. That\'s why intentionally noticing good things matters.',
    tryThis: 'At the end of each day, name 3 good things that happened. You\'re training your brain to notice the positive.',
  },

  // === FOCUS ===
  {
    id: 'focus-attention',
    title: 'Attention Is a Limited Resource',
    emoji: '🔋',
    category: 'focus',
    quickTake: 'You only have so much focus per day. Spend it wisely.',
    content: 'Your prefrontal cortex (the focus center) uses a lot of energy and gets depleted with use. This is why decision fatigue is real and why willpower is harder at night. Important tasks should get your best attention hours.',
    tryThis: 'Identify when you focus best (morning? afternoon?) and protect that time for important work.',
  },
  {
    id: 'focus-multitasking',
    title: 'Multitasking Is a Myth',
    emoji: '🚫',
    category: 'focus',
    quickTake: 'Your brain can\'t actually do two thinking tasks at once.',
    content: 'What feels like multitasking is actually rapid task-switching — and it\'s expensive. Each switch costs time and mental energy as your brain reloads context. Studies show multitaskers perform worse on BOTH tasks compared to doing them separately.',
    funFact: 'It takes an average of 23 minutes to fully refocus after an interruption. Every notification has a hidden cost.',
    tryThis: 'Try single-tasking for 25 minutes (one thing, no switching). Notice how much more you get done.',
  },
  {
    id: 'focus-phone',
    title: 'Your Phone Drains Focus (Even Off)',
    emoji: '📵',
    category: 'focus',
    quickTake: 'Just having your phone visible reduces cognitive capacity.',
    content: 'Research shows that having your phone in sight — even face-down and silent — uses up some of your attention because part of your brain is monitoring it. Out of sight isn\'t just out of mind — it frees up actual cognitive resources.',
    funFact: 'Participants in studies performed significantly better on cognitive tasks when their phones were in another room vs. on the desk (even turned off).',
    tryThis: 'During focus time, put your phone in another room or in a bag. Not just silent — truly away.',
  },
];

// Helpers
export const getCardsByCategory = (categoryId: string): BrainCard[] => {
  return BRAIN_CARDS.filter(card => card.category === categoryId);
};

export const getCategory = (categoryId: string): BrainCategory | undefined => {
  return BRAIN_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getRandomCard = (): BrainCard => {
  return BRAIN_CARDS[Math.floor(Math.random() * BRAIN_CARDS.length)];
};
