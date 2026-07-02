/**
 * Human Development Map — Life Stages.
 * Research-based (developmental psychology, Erikson, life-span development), simplified.
 * Orientation, not grading. Each stage: what develops, what's normal, what helps, gauge signals.
 */

export type GaugeId = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export interface LifeStage {
  id: string;
  title: string;
  ageRange: string;
  /** Soft color for the stage (calm, reflective) */
  color: string;
  colorBg: string;
  order: number;
  /** What humans are developing in this stage */
  whatDevelops: string[];
  /** What's normal — reassurance */
  whatsNormal: string[];
  /** Common challenges */
  commonChallenges: string[];
  /** What helps most */
  whatHelps: string[];
  /** Gauges that matter most in this stage */
  gaugesEmphasized: GaugeId[];
  /** Optional deeper learning */
  learnMoreTopics?: string[];
}

export const LIFE_STAGES: LifeStage[] = [
  {
    id: 'childhood',
    title: 'Childhood',
    ageRange: '0–12',
    color: '#6B9B7A',
    colorBg: 'rgba(107, 155, 122, 0.15)',
    order: 1,
    whatDevelops: ['Safety & trust', 'Emotional learning', 'Basic regulation', 'Attachment'],
    whatsNormal: ['Need for stable caregivers', 'Play as primary learning', 'Testing boundaries', 'Big feelings in small bodies'],
    commonChallenges: ['Inconsistent care', 'Overwhelm without words', 'School and social fit'],
    whatHelps: ['Stable, attuned caregivers', 'Play and exploration', 'Clear, kind boundaries', 'Emotional validation'],
    gaugesEmphasized: ['body', 'state', 'connection'],
    learnMoreTopics: ['Attachment theory', 'Child development', 'Emotional regulation in children'],
  },
  {
    id: 'adolescence',
    title: 'Adolescence',
    ageRange: '13–19',
    color: '#9B8AA6',
    colorBg: 'rgba(155, 138, 166, 0.15)',
    order: 2,
    whatDevelops: ['Identity', 'Independence', 'Peer belonging', 'Values exploration'],
    whatsNormal: ['Emotional intensity', 'Peer pressure and comparison', 'Experimentation', 'Pushing against limits', '“Who am I?” questions'],
    commonChallenges: ['Social anxiety', 'Conflict with parents', 'Academic stress', 'Body and identity changes'],
    whatHelps: ['Safe adults who listen', 'Peer connection', 'Room to try and fail', 'Consistent boundaries with flexibility'],
    gaugesEmphasized: ['emotion', 'connection', 'alignment'],
    learnMoreTopics: ['Adolescent brain development', 'Identity formation', 'Erikson’s stages'],
  },
  {
    id: 'young-adult',
    title: 'Young Adult',
    ageRange: '18–30',
    color: '#5B8FB9',
    colorBg: 'rgba(91, 143, 185, 0.15)',
    order: 3,
    whatDevelops: ['Direction', 'Independence', 'Intimate relationships', 'Career identity'],
    whatsNormal: ['Uncertainty about career', 'Changing friendships', 'Comparison with peers', 'Experimenting with identity', 'Feeling both excited and lost'],
    commonChallenges: ['Feeling behind', 'Relationship instability', 'Fear of choosing wrong path', 'Loneliness'],
    whatHelps: ['Exploration instead of perfection', 'Mentorship', 'Building strong connections', 'Trying new directions'],
    gaugesEmphasized: ['direction', 'connection', 'alignment'],
    learnMoreTopics: ['Emerging adulthood', 'Career development', 'Relationship formation'],
  },
  {
    id: 'building-life',
    title: 'Building Life',
    ageRange: '30–45',
    color: '#C9956B',
    colorBg: 'rgba(201, 149, 107, 0.15)',
    order: 4,
    whatDevelops: ['Stability', 'Family systems', 'Contribution', 'Legacy in motion'],
    whatsNormal: ['Career pressure', 'Parenting or partnership demands', 'Time scarcity', 'Juggling many roles', 'Re-evaluating priorities'],
    commonChallenges: ['Burnout', 'Work–life tension', 'Financial stress', 'Relationship strain'],
    whatHelps: ['Boundaries and priorities', 'Support systems', 'Realistic expectations', 'Connection and rest'],
    gaugesEmphasized: ['direction', 'connection', 'state'],
    learnMoreTopics: ['Adult development', 'Family systems', 'Career and parenting research'],
  },
  {
    id: 'midlife',
    title: 'Midlife',
    ageRange: '45–60',
    color: '#B8963E',
    colorBg: 'rgba(184, 150, 62, 0.15)',
    order: 5,
    whatDevelops: ['Meaning', 'Legacy', 'Self-reflection', 'Integrating the past'],
    whatsNormal: ['Questioning life choices', 'Identity evolution', 'Caring for parents or kids leaving', 'Body and energy changes', '“What now?”'],
    commonChallenges: ['Regret or restlessness', 'Sandwich generation stress', 'Health concerns', 'Purpose shift'],
    whatHelps: ['Reflection and meaning-making', 'Mentoring others', 'Accepting imperfection', 'Connection and contribution'],
    gaugesEmphasized: ['alignment', 'direction', 'connection'],
    learnMoreTopics: ['Midlife development', 'Generativity', 'Meaning and mortality'],
  },
  {
    id: 'later-life',
    title: 'Later Life',
    ageRange: '60–75',
    color: '#8B9BA8',
    colorBg: 'rgba(139, 155, 168, 0.15)',
    order: 6,
    whatDevelops: ['Wisdom', 'Generativity', 'Mentoring others', 'Integration'],
    whatsNormal: ['Retirement or work transition', 'Changing roles', 'Health and energy shifts', 'More time for relationships and reflection'],
    commonChallenges: ['Loss and grief', 'Identity after career', 'Loneliness or isolation', 'Physical limits'],
    whatHelps: ['Staying connected', 'Contributing (mentoring, community)', 'Adapting goals', 'Storytelling and legacy'],
    gaugesEmphasized: ['connection', 'alignment', 'emotion'],
    learnMoreTopics: ['Aging well', 'Generativity', 'Purpose in later life'],
  },
  {
    id: 'legacy-years',
    title: 'Legacy Years',
    ageRange: '75+',
    color: '#A89B8B',
    colorBg: 'rgba(168, 155, 139, 0.15)',
    order: 7,
    whatDevelops: ['Connection', 'Storytelling', 'Legacy', 'Peace and reflection'],
    whatsNormal: ['Focus on relationships and meaning', 'Passing on stories', 'Simpler priorities', 'Health and care considerations'],
    commonChallenges: ['Loss of peers', 'Physical dependence', 'Isolation', 'Making sense of a life'],
    whatHelps: ['Presence and connection', 'Being heard', 'Ritual and memory', 'Dignity and choice'],
    gaugesEmphasized: ['connection', 'alignment', 'emotion'],
    learnMoreTopics: ['Aging and wellbeing', 'Life review', 'End-of-life meaning'],
  },
];

export function getLifeStageById(id: string): LifeStage | undefined {
  return LIFE_STAGES.find((s) => s.id === id);
}

export function getLifeStagesOrdered(): LifeStage[] {
  return [...LIFE_STAGES].sort((a, b) => a.order - b.order);
}
