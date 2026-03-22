/**
 * Just-in-Time Learning — Contextual lesson delivery
 * 
 * Philosophy:
 * - Don"t give users a textbook; give them the right lesson at the right moment
 * - Lessons surface when gauge states indicate they're relevant
 * - \"Observe → Orient → Operate\" framework
 */

import { type GaugeKey, type SystemMode } from "../stores/cockpitStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JIT_SHOWN_KEY = 'jit_lessons_shown';
const JIT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours before re-suggesting same lesson

export interface GaugeSnapshot {
  body: number;
  state: number;
  emotion: number;
  connection: number;
  direction: number;
  alignment: number;
}

export interface JustInTimeLesson {
  lessonId: string;
  title: string;
  emoji: string;
  reason: string; // Why this lesson is being suggested now
  urgency: 'gentle' | 'timely' | 'important";
  observeNote: string; // What's happening in your system
  orientNote: string; // Why this matters (evolutionary/biological reason)
  operateTool?: string; // Which AI tool might help
}

interface LessonTrigger {
  lessonId: string;
  title: string;
  emoji: string;
  condition: (gauges: GaugeSnapshot, duration?: number) => boolean;
  reason: (gauges: GaugeSnapshot) => string;
  urgency: "gentle' | 'timely' | 'important';
  observe: string;
  orient: string;
  suggestTool?: string;
}

/**
 * Lesson triggers mapped to gauge states
 * These connect gauge values to relevant Human Manual lessons
 */
const LESSON_TRIGGERS: LessonTrigger[] = [
  // Body-related lessons
  {
    lessonId: 'manual-2-1-1',
    title: 'Sleep: The Foundation',
    emoji: '😴',
    condition: (g) => g.body < 40 && g.state < 50,
    reason: (g) => `Your Body gauge is at ${g.body}% and State is low — your foundation needs attention.`,
    urgency: 'important',
    observe: 'Your body is running on depleted resources.',
    orient: 'Sleep deprivation increases amygdala reactivity by 60%+. Everything feels harder when you\'re tired — that\'s biology, not weakness.',
    suggestTool: 'quick-reset',
  },
  {
    lessonId: 'manual-2-1-2',
    title: 'The Gut-Brain Connection',
    emoji: '🍽️',
    condition: (g) => g.body < 35 && g.emotion < 50,
    reason: (g) => `Body at ${g.body}% affecting your emotional regulation.`,
    urgency: 'timely',
    observe: 'Physical depletion is influencing your mood.',
    orient: '95% of serotonin is produced in your gut. When your body is depleted, your brain\'s mood regulation suffers — it\'s not in your head, it\'s in your gut.',
    suggestTool: undefined,
  },
  
  // State-related lessons (nervous system)
  {
    lessonId: 'manual-2-2-1',
    title: 'Your Nervous System States',
    emoji: '⚡',
    condition: (g) => g.state < 40,
    reason: (g) => `State gauge at ${g.state}% — your nervous system needs support.`,
    urgency: 'important',
    observe: 'Your nervous system is in a protective state (sympathetic or dorsal).',
    orient: 'Polyvagal Theory: Your body chooses fight/flight/freeze automatically. Understanding this isn\'t about willpower — it\'s about working WITH your biology.',
    suggestTool: 'quick-reset',
  },
  {
    lessonId: 'manual-2-2-2',
    title: 'The Window of Tolerance',
    emoji: '🪟',
    condition: (g) => g.state < 30 || (g.state > 80 && g.body < 50),
    reason: (g) => g.state < 30 
      ? `State at ${g.state}% — you may be outside your window of tolerance.`
      : `High activation (${g.state}%) with depleted body — hyperarousal pattern.`,
    urgency: 'important',
    observe: 'You\'re operating outside your optimal regulation zone.',
    orient: 'When we leave our "window," our prefrontal cortex goes offline. Decisions made here often don\'t reflect our values. The goal is getting back in the window first.',
    suggestTool: 'quick-reset',
  },

  // Emotion-related lessons
  {
    lessonId: 'manual-1-1-1',
    title: 'What Are Emotions, Really?',
    emoji: '💡',
    condition: (g) => g.emotion < 45 && g.state > 40,
    reason: (g) => `Emotion gauge at ${g.emotion}% — naming what you feel can help.`,
    urgency: 'timely',
    observe: 'Your emotional gauge indicates distress that\'s ready to be processed.',
    orient: 'Research shows emotional granularity (naming feelings precisely) improves regulation. The brain processes named emotions better than vague "bad feelings."',
    suggestTool: 'replay',
  },
  {
    lessonId: 'manual-1-1-2',
    title: 'Anger: The Bodyguard Emotion',
    emoji: '🔥',
    condition: (g) => g.emotion < 35 && g.state > 60,
    reason: (g) => `High activation (${g.state}%) with emotional distress — anger pattern.`,
    urgency: 'timely',
    observe: 'Your system is activated and emotionally charged.',
    orient: 'Anger is almost always a secondary emotion — the bodyguard for hurt, fear, or powerlessness. What\'s under the anger is usually more vulnerable.',
    suggestTool: 'replay',
  },

  // Connection-related lessons
  {
    lessonId: 'manual-3-1-1',
    title: "Why We Need Others',
    emoji: "🤝',
    condition: (g) => g.connection < 40,
    reason: (g) => `Connection at ${g.connection}% — social needs may be unmet.`,
    urgency: 'timely',
    observe: 'Your relational gauge indicates isolation or disconnection.',
    orient: 'Humans are wired for co-regulation. Isolation amplifies every other problem because our nervous systems literally need other people to stabilize.',
    suggestTool: 'relate',
  },
  {
    lessonId: 'manual-3-2-1',
    title: 'Attachment Styles',
    emoji: '🔗',
    condition: (g) => g.connection < 35 && g.emotion < 50,
    reason: (g) => `Low connection (${g.connection}%) and emotional struggle — attachment patterns may be active.`,
    urgency: 'gentle',
    observe: 'Relationship strain is affecting your emotional state.',
    orient: 'Our early attachment experiences create templates we replay. Recognizing your pattern is the first step to choosing differently.',
    suggestTool: 'relate',
  },

  // Direction-related lessons
  {
    lessonId: 'manual-4-1-1',
    title: 'Finding Your Direction',
    emoji: '🧭',
    condition: (g) => g.direction < 40 && g.body > 50 && g.state > 50,
    reason: (g) => `Direction at ${g.direction}% while body/state are stable — this is about meaning, not energy.`,
    urgency: 'gentle',
    observe: 'You have capacity, but direction feels unclear.',
    orient: 'Purpose research shows: having something to move toward buffers against depression. Small direction beats no direction.',
    suggestTool: 'journal',
  },
  {
    lessonId: 'purpose-through-pattern',
    title: 'What Usually Lifts Your Direction?',
    emoji: '🔍',
    condition: (g) => g.direction < 45 && g.direction >= 0,
    reason: (g) => `Direction at ${g.direction}% — your data may hold clues about what lifts your sense of purpose.`,
    urgency: 'gentle',
    observe: 'Your Direction gauge is running low. Instead of searching for purpose, let\'s look at what already works.',
    orient: 'Purpose is often reverse-engineered from patterns. Your history shows when Direction tends to rise — that\'s data, not guesswork.',
    suggestTool: 'patterns', // Will link to patterns modal
  },

  // Alignment-related lessons
  {
    lessonId: 'manual-4-2-1',
    title: 'Values and Integrity',
    emoji: '⚖️',
    condition: (g) => g.alignment < 40 && g.direction > 50,
    reason: (g) => `Alignment at ${g.alignment}% — possible values-action gap.`,
    urgency: 'gentle',
    observe: 'Your actions may not be matching your values.',
    orient: 'Cognitive dissonance research: acting against our values creates stress and erodes self-trust. The gap hurts — that\'s information.',
    suggestTool: 'journal',
  },

  // Cross-gauge patterns
  {
    lessonId: 'manual-2-3-1',
    title: 'The Body-Mind Loop',
    emoji: '🔄',
    condition: (g) => g.body < 40 && g.emotion < 40 && g.state < 50,
    reason: (g) => `Body (${g.body}%), Emotion (${g.emotion}%), State (${g.state}%) — cascading depletion pattern.`,
    urgency: 'important',
    observe: 'Multiple systems are strained — this is a feedback loop.',
    orient: 'Body affects State affects Emotion — they cascade. Starting with Body (sleep, food) often unlocks the others.',
    suggestTool: 'quick-reset',
  },
  {
    lessonId: 'manual-3-3-1',
    title: 'Relationship Repair',
    emoji: '🩹',
    condition: (g) => g.connection < 30 && g.alignment < 50,
    reason: (g) => `Connection crashed (${g.connection}%) with low alignment — possible conflict aftermath.`,
    urgency: 'timely',
    observe: 'A relationship rupture may have occurred.',
    orient: 'Rupture and repair is normal in all relationships. The repair attempt matters more than avoiding conflict.',
    suggestTool: 'role-play',
  },
];

/**
 * Get recently shown lessons to avoid repetition
 */
async function getRecentlyShown(): Promise<Record<string, number>> {
  try {
    const data = await AsyncStorage.getItem(JIT_SHOWN_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * Mark a lesson as shown
 */
export async function markLessonShown(lessonId: string): Promise<void> {
  try {
    const shown = await getRecentlyShown();
    shown[lessonId] = Date.now();
    await AsyncStorage.setItem(JIT_SHOWN_KEY, JSON.stringify(shown));
  } catch (e) {
    console.warn('[JIT] Failed to mark lesson shown:', e);
  }
}

/**
 * Get contextual lesson suggestions based on current gauge state
 * Returns up to 2 most relevant lessons
 */
export async function getJustInTimeLessons(
  gauges: GaugeSnapshot,
  systemMode: SystemMode
): Promise<JustInTimeLesson[]> {
  const recentlyShown = await getRecentlyShown();
  const now = Date.now();
  
  // Filter triggers that match current state
  const matches = LESSON_TRIGGERS.filter(trigger => {
    // Check if on cooldown
    const lastShown = recentlyShown[trigger.lessonId];
    if (lastShown && (now - lastShown) < JIT_COOLDOWN_MS) {
      return false;
    }
    
    // Check condition
    return trigger.condition(gauges);
  });

  // Sort by urgency (important > timely > gentle)
  const urgencyOrder = { important: 0, timely: 1, gentle: 2 };
  matches.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // In stabilization mode, prioritize Body/State lessons
  if (systemMode === 'stabilization') {
    matches.sort((a, b) => {
      const aIsFoundational = a.lessonId.includes('2-1') || a.lessonId.includes('2-2');
      const bIsFoundational = b.lessonId.includes('2-1') || b.lessonId.includes('2-2');
      if (aIsFoundational && !bIsFoundational) return -1;
      if (!aIsFoundational && bIsFoundational) return 1;
      return 0;
    });
  }

  // Return top 2 lessons
  return matches.slice(0, 2).map(trigger => ({
    lessonId: trigger.lessonId,
    title: trigger.title,
    emoji: trigger.emoji,
    reason: trigger.reason(gauges),
    urgency: trigger.urgency,
    observeNote: trigger.observe,
    orientNote: trigger.orient,
    operateTool: trigger.suggestTool,
  }));
}

/**
 * Check if any lesson should be surfaced as a gentle nudge
 * (For use in cockpit or after check-in)
 */
export async function shouldShowLessonNudge(
  gauges: GaugeSnapshot,
  systemMode: SystemMode
): Promise<JustInTimeLesson | null> {
  const lessons = await getJustInTimeLessons(gauges, systemMode);
  
  // Only nudge for important or timely lessons
  const urgent = lessons.find(l => l.urgency === 'important' || l.urgency === 'timely");
  return urgent || null;
}

/**
 * Get lesson for a specific gauge that's struggling
 */
export async function getLessonForGauge(
  gauge: GaugeKey,
  value: number,
  gauges: GaugeSnapshot
): Promise<JustInTimeLesson | null> {
  const recentlyShown = await getRecentlyShown();
  const now = Date.now();

  // Find lessons related to this gauge
  const gaugeMapping: Record<GaugeKey, string[]> = {
    body: ["2-1'],
    state: ['2-2'],
    emotion: ['1-1'],
    connection: ['3-1', '3-2', '3-3'],
    direction: ['4-1'],
    alignment: ['4-2'],
  };

  const relevantPrefixes = gaugeMapping[gauge];
  
  const match = LESSON_TRIGGERS.find(trigger => {
    // Check if relevant to this gauge
    const isRelevant = relevantPrefixes.some(prefix => trigger.lessonId.includes(prefix));
    if (!isRelevant) return false;

    // Check cooldown
    const lastShown = recentlyShown[trigger.lessonId];
    if (lastShown && (now - lastShown) < JIT_COOLDOWN_MS) {
      return false;
    }

    // Check condition
    return trigger.condition(gauges);
  });

  if (!match) return null;

  return {
    lessonId: match.lessonId,
    title: match.title,
    emoji: match.emoji,
    reason: match.reason(gauges),
    urgency: match.urgency,
    observeNote: match.observe,
    orientNote: match.orient,
    operateTool: match.suggestTool,
  };
}
