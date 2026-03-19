/**
 * Skill themes — Scientific strength clusters for direction/assessment.
 * Thinking, Creating, Helping, Leading (4 domains × 4 skills). AI or assessment maps answers to these.
 * Used alongside direction themes for "Your strongest skill themes" output.
 */

export type SkillThemeId =
  | 'analytical-thinking'
  | 'problem-solving'
  | 'strategic-thinking'
  | 'systems-thinking'
  | 'creative-design'
  | 'innovation'
  | 'storytelling'
  | 'visual-communication'
  | 'coaching-mentoring'
  | 'emotional-intelligence'
  | 'conflict-resolution'
  | 'teaching'
  | 'leadership'
  | 'decision-making'
  | 'organization-execution'
  | 'entrepreneurship';

export type SkillThemeDomainId = 'thinking' | 'creating' | 'helping' | 'leading';

export interface SkillTheme {
  id: SkillThemeId;
  domainId: SkillThemeDomainId;
  label: string;
  shortLabel: string;
}

export interface SkillThemeDomain {
  id: SkillThemeDomainId;
  label: string;
  emoji: string;
  skillIds: SkillThemeId[];
}

export const SKILL_THEME_DOMAINS: SkillThemeDomain[] = [
  {
    id: 'thinking',
    label: 'Thinking',
    emoji: '🧠',
    skillIds: ['analytical-thinking', 'problem-solving', 'strategic-thinking', 'systems-thinking'],
  },
  {
    id: 'creating',
    label: 'Creating',
    emoji: '✨',
    skillIds: ['creative-design', 'innovation', 'storytelling', 'visual-communication'],
  },
  {
    id: 'helping',
    label: 'Helping',
    emoji: '🫂',
    skillIds: ['coaching-mentoring', 'emotional-intelligence', 'conflict-resolution', 'teaching'],
  },
  {
    id: 'leading',
    label: 'Leading',
    emoji: '🎯',
    skillIds: ['leadership', 'decision-making', 'organization-execution', 'entrepreneurship'],
  },
];

export const SKILL_THEMES: SkillTheme[] = [
  { id: 'analytical-thinking', domainId: 'thinking', label: 'Analytical thinking', shortLabel: 'Analysis' },
  { id: 'problem-solving', domainId: 'thinking', label: 'Problem solving', shortLabel: 'Problem solving' },
  { id: 'strategic-thinking', domainId: 'thinking', label: 'Strategic thinking', shortLabel: 'Strategy' },
  { id: 'systems-thinking', domainId: 'thinking', label: 'Systems thinking', shortLabel: 'Systems thinking' },
  { id: 'creative-design', domainId: 'creating', label: 'Creative design', shortLabel: 'Design' },
  { id: 'innovation', domainId: 'creating', label: 'Innovation', shortLabel: 'Innovation' },
  { id: 'storytelling', domainId: 'creating', label: 'Storytelling', shortLabel: 'Storytelling' },
  { id: 'visual-communication', domainId: 'creating', label: 'Visual communication', shortLabel: 'Visual' },
  { id: 'coaching-mentoring', domainId: 'helping', label: 'Coaching / mentoring', shortLabel: 'Coaching' },
  { id: 'emotional-intelligence', domainId: 'helping', label: 'Emotional intelligence', shortLabel: 'EQ' },
  { id: 'conflict-resolution', domainId: 'helping', label: 'Conflict resolution', shortLabel: 'Conflict resolution' },
  { id: 'teaching', domainId: 'helping', label: 'Teaching', shortLabel: 'Teaching' },
  { id: 'leadership', domainId: 'leading', label: 'Leadership', shortLabel: 'Leadership' },
  { id: 'decision-making', domainId: 'leading', label: 'Decision making', shortLabel: 'Decisions' },
  { id: 'organization-execution', domainId: 'leading', label: 'Organization / execution', shortLabel: 'Execution' },
  { id: 'entrepreneurship', domainId: 'leading', label: 'Entrepreneurship', shortLabel: 'Entrepreneurship' },
];

/** Map direction theme IDs to related skill theme IDs (for "Your strongest skill themes" from direction results). */
export const DIRECTION_THEME_TO_SKILL_THEMES: Partial<Record<string, SkillThemeId[]>> = {
  'problem-solver': ['problem-solving', 'analytical-thinking', 'strategic-thinking'],
  analyst: ['analytical-thinking', 'systems-thinking', 'strategic-thinking'],
  teacher: ['teaching', 'coaching-mentoring', 'storytelling'],
  helper: ['emotional-intelligence', 'coaching-mentoring', 'conflict-resolution'],
  creator: ['creative-design', 'innovation', 'storytelling', 'visual-communication'],
  organizer: ['organization-execution', 'systems-thinking', 'decision-making'],
  leader: ['leadership', 'decision-making', 'entrepreneurship'],
  builder: ['problem-solving', 'organization-execution'],
};

export function getSkillThemeById(id: SkillThemeId): SkillTheme | undefined {
  return SKILL_THEMES.find((t) => t.id === id);
}

export function getSkillThemesForDirectionTheme(directionThemeId: string): SkillTheme[] {
  const ids = DIRECTION_THEME_TO_SKILL_THEMES[directionThemeId];
  if (!ids?.length) return [];
  return ids.map((id) => getSkillThemeById(id)).filter((t): t is SkillTheme => Boolean(t));
}
