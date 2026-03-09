/**
 * Manual tab — Knowledge library grouping.
 * Maps manual sections + human manual categories into 5 top-level groups
 * so the Manual feels like an operating manual, not a random feed.
 *
 * Structure: Intro → The System (6 gauges) → The Manual (these groups) → Discoveries
 */

export interface ManualLibraryGroup {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** Manual section ids (from MANUAL_SECTIONS) in this group */
  manualSectionIds: string[];
  /** Human manual category ids (from humanManualCategories) in this group */
  humanCategoryIds: string[];
}

export const MANUAL_LIBRARY_GROUPS: ManualLibraryGroup[] = [
  {
    id: 'read-your-system',
    title: 'Read Your System',
    subtitle: 'Foundations, gauges, and context',
    emoji: '📊',
    manualSectionIds: ['know-your-machine', 'maintenance-schedule'],
    humanCategoryIds: [],
  },
  {
    id: 'know-yourself',
    title: 'Know Yourself',
    subtitle: 'Body, mind, emotions, identity, and origins',
    emoji: '🪞',
    manualSectionIds: ['troubleshooting', 'upgrades', 'origins'],
    humanCategoryIds: ['body-health', 'identity-self', 'stress-survival'],
  },
  {
    id: 'know-your-people',
    title: 'Know Your People',
    subtitle: 'Relationships, belonging, and the social world',
    emoji: '💕',
    manualSectionIds: ['section-7-family'],
    humanCategoryIds: ['relationships', 'world-society'],
  },
  {
    id: 'know-your-path',
    title: 'Know Your Path',
    subtitle: 'Direction, alignment, change, work, and growth',
    emoji: '🦋',
    manualSectionIds: ['section-5-school', 'section-6-work'],
    humanCategoryIds: ['life-transitions', 'growth-healing', 'work-money'],
  },
  {
    id: 'navigate-challenges',
    title: 'Navigate Challenges',
    subtitle: 'Skills, mental health, patterns, and big questions',
    emoji: '🧠',
    manualSectionIds: [],
    humanCategoryIds: ['mental-health', 'building-stability'],
  },
];
