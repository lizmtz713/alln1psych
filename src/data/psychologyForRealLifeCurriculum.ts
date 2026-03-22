/**
 * Psychology for Real Life — Curriculum map.
 * Maps "Human Skills 101" to existing content so we don't duplicate.
 * Use for framing (e.g. Learn tab), onboarding paths, or "Your learning path."
 *
 * All topics are already taught via:
 * - educationContent.ts MODULES (Feelings 101, Triggers, Communication, Boundaries, Self-Compassion, Relationships)
 * - Human Manual (humanManualToc HUMAN_MANUAL_PARTS, humanManual categories, manualContent MANUAL_SECTIONS)
 * - Tools (Decode, Replay, Perspective Translator, Relationship Repair, Decision, Bias Check, Attachment, etc.)
 * - Talk / Ask Gauge (voice: "Explain boundaries to me" → Gauge explains)
 */

export interface CurriculumModule {
  id: string;
  title: string;
  shortDescription: string;
  /** Education module ids (educationContent MODULES) */
  educationModuleIds: string[];
  /** Tool route keys or paths (from tools.tsx TOOLS) */
  toolKeys: string[];
  /** Human Manual part ids (humanManualToc) or category ids (humanManual) for "go deeper" */
  manualPartIds: string[];
}

/** Psychology for Real Life = Human Skills 101. Maps to existing content only. */
export const PSYCHOLOGY_FOR_REAL_LIFE_MODULES: CurriculumModule[] = [
  {
    id: 'understanding-yourself',
    title: 'Understanding Yourself',
    shortDescription: 'Emotions, triggers, self-awareness, identity, values, motivation, habits.',
    educationModuleIds: ['feelings-101', 'triggers', 'self-compassion'],
    toolKeys: ['decode', 'replay', 'self-discovery', 'prompts'],
    manualPartIds: ['system', 'signals'],
  },
  {
    id: "understanding-others',
    title: "Understanding Other People',
    shortDescription: 'Empathy, perspective-taking, social signals, communication styles, misunderstandings.',
    educationModuleIds: ['communication'],
    toolKeys: ['decode', 'relate', 'perspective-translator', 'memory-builder', 'flags'],
    manualPartIds: ['roles'],
  },
  {
    id: 'relationships',
    title: 'Relationships',
    shortDescription: 'Healthy vs unhealthy, boundaries, trust, attachment, conflict, repair.',
    educationModuleIds: ['boundaries', 'relationships'],
    toolKeys: ['boundaries', 'resolve', 'relationship-repair', 'attachment', 'family-conflict', 'referee', 'red-green-flags'],
    manualPartIds: ['roles', 'repairs'],
  },
  {
    id: 'thinking-decisions',
    title: 'Thinking & Decision Making',
    shortDescription: 'Biases, how we choose, risk and fear, overthinking, self-doubt.',
    educationModuleIds: [],
    toolKeys: ['critical', 'decision', 'bias-check'],
    manualPartIds: ['long-game'],
  },
  {
    id: 'emotional-strength',
    title: 'Emotional Strength',
    shortDescription: 'Stress, resilience, rejection, confidence.',
    educationModuleIds: ['self-compassion'],
    toolKeys: ['quick-reset', 'resolve', 'help', 'body'],
    manualPartIds: ['signals', 'cascades', 'repairs'],
  },
  {
    id: 'purpose-direction',
    title: 'Purpose & Direction',
    shortDescription: 'Meaning, growth, alignment with values.',
    educationModuleIds: [],
    toolKeys: ['life-direction-finder', 'share-insight'],
    manualPartIds: ['long-game', 'big-questions'],
  },
];

export const CURRICULUM_TAGLINE = 'Human Skills 101 — the stuff schools usually don\'t teach.';
