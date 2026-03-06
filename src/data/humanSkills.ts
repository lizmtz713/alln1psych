/**
 * 16 Human Skills — Data: 4 domains, 16 skills.
 */

import type { SkillId, SkillDomainId, HumanSkill, SkillDomain } from '../types/human-skills';

const SKILLS: HumanSkill[] = [
  // Self (Awareness)
  { id: 'self-awareness', domainId: 'self', order: 1, title: 'Self-Awareness', shortTitle: 'Self-Awareness', emoji: '🪞', description: 'Noticing your thoughts, feelings, and patterns without judgment.' },
  { id: 'emotional-awareness', domainId: 'self', order: 2, title: 'Emotional Awareness', shortTitle: 'Emotional Awareness', emoji: '❤️', description: 'Recognizing and naming what you feel in the moment.' },
  { id: 'body-awareness', domainId: 'self', order: 3, title: 'Body Awareness', shortTitle: 'Body Awareness', emoji: '🧘', description: 'Tuning into physical sensations and what your body is telling you.' },
  { id: 'values-clarity', domainId: 'self', order: 4, title: 'Values Clarity', shortTitle: 'Values Clarity', emoji: '⚖️', description: 'Knowing what matters most to you and when you are aligned.' },
  // Regulate (State)
  { id: 'regulation', domainId: 'regulate', order: 5, title: 'Regulation', shortTitle: 'Regulation', emoji: '🌊', description: 'Calming or energizing your nervous system when you need to.' },
  { id: 'stress-tolerance', domainId: 'regulate', order: 6, title: 'Stress Tolerance', shortTitle: 'Stress Tolerance', emoji: '🛡️', description: 'Staying present and functional under pressure.' },
  { id: 'grounding', domainId: 'regulate', order: 7, title: 'Grounding', shortTitle: 'Grounding', emoji: '🌍', description: 'Anchoring in the here and now when you feel scattered or overwhelmed.' },
  { id: 'recovery', domainId: 'regulate', order: 8, title: 'Recovery', shortTitle: 'Recovery', emoji: '🔋', description: 'Bouncing back after difficulty and restoring your baseline.' },
  // Connect (Relationship)
  { id: 'empathy', domainId: 'connect', order: 9, title: 'Empathy', shortTitle: 'Empathy', emoji: '💜', description: 'Sensing and understanding what others might be feeling.' },
  { id: 'communication', domainId: 'connect', order: 10, title: 'Communication', shortTitle: 'Communication', emoji: '💬', description: 'Expressing yourself clearly and listening with care.' },
  { id: 'boundaries', domainId: 'connect', order: 11, title: 'Boundaries', shortTitle: 'Boundaries', emoji: '🚧', description: 'Knowing and honoring your limits with others.' },
  { id: 'repair', domainId: 'connect', order: 12, title: 'Repair', shortTitle: 'Repair', emoji: '🔧', description: 'Mending ruptures and restoring trust after conflict or hurt.' },
  // Grow (Direction)
  { id: 'reflection', domainId: 'grow', order: 13, title: 'Reflection', shortTitle: 'Reflection', emoji: '🔭', description: 'Looking back to learn and make meaning from experience.' },
  { id: 'learning', domainId: 'grow', order: 14, title: 'Learning', shortTitle: 'Learning', emoji: '📚', description: 'Taking in new information and adapting your understanding.' },
  { id: 'intention', domainId: 'grow', order: 15, title: 'Intention', shortTitle: 'Intention', emoji: '🎯', description: 'Setting and returning to what you want to prioritize.' },
  { id: 'meaning', domainId: 'grow', order: 16, title: 'Meaning', shortTitle: 'Meaning', emoji: '✨', description: 'Connecting your actions to what gives your life purpose.' },
];

const DOMAINS: SkillDomain[] = [
  {
    id: 'self',
    order: 1,
    title: 'Self',
    shortTitle: 'Self',
    emoji: '🪞',
    description: 'Awareness of your inner world — thoughts, feelings, body, and values.',
    skillIds: ['self-awareness', 'emotional-awareness', 'body-awareness', 'values-clarity'],
  },
  {
    id: 'regulate',
    order: 2,
    title: 'Regulate',
    shortTitle: 'Regulate',
    emoji: '🌊',
    description: 'Managing your state — calm, stress, grounding, and recovery.',
    skillIds: ['regulation', 'stress-tolerance', 'grounding', 'recovery'],
  },
  {
    id: 'connect',
    order: 3,
    title: 'Connect',
    shortTitle: 'Connect',
    emoji: '💜',
    description: 'Relationship skills — empathy, communication, boundaries, and repair.',
    skillIds: ['empathy', 'communication', 'boundaries', 'repair'],
  },
  {
    id: 'grow',
    order: 4,
    title: 'Grow',
    shortTitle: 'Grow',
    emoji: '✨',
    description: 'Direction and growth — reflection, learning, intention, and meaning.',
    skillIds: ['reflection', 'learning', 'intention', 'meaning'],
  },
];

export const HUMAN_SKILL_DOMAINS = DOMAINS;
export const HUMAN_SKILLS = SKILLS;
export const SKILL_IDS: SkillId[] = SKILLS.map((s) => s.id);
export const SKILL_DOMAIN_IDS: SkillDomainId[] = DOMAINS.map((d) => d.id);

export function getSkillById(id: SkillId): HumanSkill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getDomainById(id: SkillDomainId): SkillDomain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function getSkillsInOrder(): HumanSkill[] {
  return [...SKILLS].sort((a, b) => a.order - b.order);
}

export function getDomainsInOrder(): SkillDomain[] {
  return [...DOMAINS].sort((a, b) => a.order - b.order);
}

export function getSkillsForDomain(domainId: SkillDomainId): HumanSkill[] {
  const domain = getDomainById(domainId);
  if (!domain) return [];
  return domain.skillIds
    .map((id) => getSkillById(id))
    .filter((s): s is HumanSkill => Boolean(s));
}
