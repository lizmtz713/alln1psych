/**
 * 16 Human Skills — Types for skill IDs, levels, domains, and point tracking.
 */

/** Unique id for each of the 16 skills */
export type SkillId =
  // Self (Awareness)
  | 'self-awareness'
  | 'emotional-awareness'
  | 'body-awareness'
  | 'values-clarity'
  // Regulate (State)
  | 'regulation'
  | 'stress-tolerance'
  | 'grounding'
  | 'recovery'
  // Connect (Relationship)
  | 'empathy'
  | 'communication'
  | 'boundaries'
  | 'repair'
  // Grow (Direction)
  | 'reflection'
  | 'learning'
  | 'intention'
  | 'meaning';

/** Four domains that group the 16 skills */
export type SkillDomainId = 'self' | 'regulate' | 'connect' | 'grow';

/** User-facing level based on points (e.g. 0–99 = Exploring, 100–249 = Developing, …) */
export type SkillLevel = 'exploring' | 'developing' | 'practiced' | 'strong' | 'integrated';

/** Points threshold per level (cumulative points for that skill) */
export interface SkillLevelThresholds {
  exploring: number;   // 0
  developing: number;  // e.g. 100
  practiced: number;  // e.g. 250
  strong: number;     // e.g. 500
  integrated: number; // e.g. 1000
}

/** One skill definition (id, domain, display info) */
export interface HumanSkill {
  id: SkillId;
  domainId: SkillDomainId;
  order: number;
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
}

/** Domain definition (id, display info, skill ids) */
export interface SkillDomain {
  id: SkillDomainId;
  order: number;
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  skillIds: SkillId[];
}

/** Stored points per skill (skillId -> total points) */
export type SkillPoints = Partial<Record<SkillId, number>>;

/** Single point event for history/analytics (optional) */
export interface SkillPointEvent {
  skillId: SkillId;
  points: number;
  source: 'check-in' | 'quick-reset' | 'post-flight' | 'ai-talk' | 'manual';
  at: string; // ISO
}
