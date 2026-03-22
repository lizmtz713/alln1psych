/**
 * Life Direction Finder — 12-question assessment.
 * Evidence-based (Holland/RIASEC, interests + strengths + values), simplified for real life.
 * Returns direction themes and possible fields, not a single job title.
 */

export type DirectionThemeId =
  | 'problem-solver'
  | 'helper'
  | 'creator'
  | 'organizer'
  | 'teacher'
  | 'leader'
  | 'analyst'
  | 'builder';

export interface DirectionTheme {
  id: DirectionThemeId;
  label: string;
  shortLabel: string;
  /** Possible fields/jobs that align */
  fields: string[];
}

export interface DirectionOption {
  id: string;
  label: string;
  /** Themes this choice contributes to */
  themeIds: DirectionThemeId[];
  /** For "You thrive when" summary */
  thriveLabel?: string;
}

export interface DirectionQuestion {
  id: string;
  section: string;
  sectionLabel: string;
  text: string;
  /** maxSelections: 1 = single, 2 = choose up to 2 */
  maxSelections: 1 | 2;
  options: DirectionOption[];
}

export const DIRECTION_THEMES: DirectionTheme[] = [
  { id: 'problem-solver', label: 'Problem solver', shortLabel: 'Problem solver', fields: ['Product design', 'Engineering', 'Consulting', 'Strategy', 'Research'] },
  { id: 'helper', label: 'Helper', shortLabel: 'Helper', fields: ['Healthcare', 'Social work', 'Coaching', 'Education', 'Nonprofit'] },
  { id: 'creator', label: 'Creator', shortLabel: 'Creator', fields: ['Design', 'Writing', 'Arts', 'Product development', 'Marketing'] },
  { id: 'organizer', label: 'Organizer', shortLabel: 'Organizer', fields: ['Operations', 'Project management', 'Finance', 'Administration'] },
  { id: 'teacher', label: 'Teacher', shortLabel: 'Teacher', fields: ['Education', 'Training', 'Coaching', 'Writing', 'Consulting'] },
  { id: 'leader', label: 'Leader', shortLabel: 'Leader', fields: ['Management', 'Entrepreneurship', 'Politics', 'Executive roles'] },
  { id: 'analyst', label: 'Analyst', shortLabel: 'Analyst', fields: ['Research', 'Data', 'Strategy', 'Finance', 'Technology'] },
  { id: 'builder', label: 'Builder', shortLabel: 'Builder', fields: ['Engineering', 'Construction', 'Manufacturing', 'Product', 'Hands-on trades'] },
];

const Q = (id: string, section: string, sectionLabel: string, text: string, maxSelections: 1 | 2, options: DirectionOption[]): DirectionQuestion =>
  ({ id, section, sectionLabel, text, maxSelections, options });

export const LIFE_DIRECTION_QUESTIONS: DirectionQuestion[] = [
  Q('q1', 'energize', 'What energizes you', 'When you feel most engaged in work or life, what are you usually doing? (Choose up to 2)', 2, [
    { id: 'q1a', label: 'Solving complex problems', themeIds: ['problem-solver', 'analyst'], thriveLabel: 'solving complex problems' },
    { id: 'q1b', label: 'Helping someone improve their life', themeIds: ['helper', 'teacher'], thriveLabel: 'helping someone improve their life' },
    { id: 'q1c', label: 'Creating or designing something new', themeIds: ['creator'], thriveLabel: 'creating or designing something new' },
    { id: 'q1d', label: 'Organizing systems or processes', themeIds: ['organizer'], thriveLabel: 'organizing systems or processes' },
    { id: 'q1e', label: "Explaining ideas to others', themeIds: ["teacher', 'analyst'], thriveLabel: "explaining ideas to others' },
    { id: "q1f', label: 'Building or fixing things', themeIds: ['builder', 'problem-solver'], thriveLabel: 'building or fixing things' },
    { id: 'q1g', label: 'Analyzing information or patterns', themeIds: ['analyst'], thriveLabel: 'analyzing information or patterns' },
  ]),
  Q('q2', 'energize', 'What energizes you', 'What kind of challenge excites you most?', 1, [
    { id: 'q2a', label: 'Figuring out difficult problems', themeIds: ['problem-solver', 'analyst'] },
    { id: 'q2b', label: 'Helping people grow or heal', themeIds: ['helper', 'teacher'] },
    { id: 'q2c', label: 'Creating something original', themeIds: ['creator'] },
    { id: 'q2d', label: 'Leading people toward a goal', themeIds: ['leader'] },
    { id: 'q2e', label: 'Understanding how systems work', themeIds: ['organizer', 'analyst'] },
    { id: 'q2f', label: 'Mastering a skill', themeIds: ['builder', 'analyst'] },
  ]),
  Q('q3', 'strengths', 'Natural strengths', 'What do people often come to you for?', 2, [
    { id: 'q3a', label: 'Advice', themeIds: ['teacher', 'helper'] },
    { id: 'q3b', label: 'Technical help', themeIds: ['problem-solver', 'builder'] },
    { id: 'q3c', label: 'Organization', themeIds: ['organizer'] },
    { id: 'q3d', label: 'Creative ideas', themeIds: ['creator'] },
    { id: 'q3e', label: 'Emotional support', themeIds: ['helper'] },
    { id: 'q3f', label: 'Leadership', themeIds: ['leader'] },
    { id: 'q3g', label: 'Research or analysis', themeIds: ['analyst'] },
  ]),
  Q('q4', 'strengths', 'Natural strengths', 'Which of these feels easiest for you?', 1, [
    { id: 'q4a', label: 'Explaining complex things clearly', themeIds: ['teacher', 'analyst'] },
    { id: 'q4b', label: 'Solving puzzles or technical problems', themeIds: ['problem-solver', 'analyst'] },
    { id: 'q4c', label: 'Motivating people', themeIds: ['leader', 'helper'] },
    { id: 'q4d', label: 'Creating visuals or designs', themeIds: ['creator'] },
    { id: 'q4e', label: 'Planning and organizing projects', themeIds: ['organizer'] },
    { id: 'q4f', label: 'Researching and learning new topics', themeIds: ['analyst', 'teacher'] },
  ]),
  Q('q5', 'environment', 'Work environment', 'Where do you feel most productive?', 1, [
    { id: 'q5a', label: 'Working independently', themeIds: ['analyst', 'creator'] },
    { id: 'q5b', label: 'Collaborating with a team', themeIds: ['helper', 'organizer'] },
    { id: 'q5c', label: 'Mentoring or helping people', themeIds: ['teacher', 'helper'] },
    { id: 'q5d', label: 'Solving technical challenges', themeIds: ['problem-solver', 'builder'] },
    { id: 'q5e', label: 'Building something tangible', themeIds: ['builder', 'creator'] },
    { id: 'q5f', label: 'Leading projects', themeIds: ['leader'] },
  ]),
  Q('q6', 'environment', 'Work environment', 'What type of environment drains you most?', 1, [
    { id: 'q6a', label: 'Chaotic environments', themeIds: ['organizer', 'analyst'] },
    { id: 'q6b', label: 'Repetitive work', themeIds: ['creator', 'problem-solver'] },
    { id: 'q6c', label: 'Isolation', themeIds: ['helper', 'teacher', 'leader'] },
    { id: 'q6d', label: 'Constant social interaction', themeIds: ['analyst', 'builder'] },
    { id: 'q6e', label: 'Lack of challenge', themeIds: ['problem-solver', 'analyst'] },
    { id: 'q6f', label: 'Strict rules and structure', themeIds: ['creator', 'leader'] },
  ]),
  Q('q7', 'values', 'Values (Alignment)', 'What matters most in your work? (Choose two)', 2, [
    { id: 'q7a', label: 'Freedom', themeIds: ['creator', 'leader'] },
    { id: 'q7b', label: 'Stability', themeIds: ['organizer'] },
    { id: 'q7c', label: 'Creativity', themeIds: ['creator'] },
    { id: 'q7d', label: 'Helping people', themeIds: ['helper', 'teacher'] },
    { id: 'q7e', label: 'Learning and growth', themeIds: ['analyst', 'teacher'] },
    { id: 'q7f', label: 'Influence or leadership', themeIds: ['leader'] },
    { id: 'q7g', label: 'Building something meaningful', themeIds: ['builder', 'creator'] },
  ]),
  Q('q8', 'values', 'Values (Alignment)", \"If money didn't matter, you would rather spend your time:\", 1, [
    { id: "q8a', label: 'Solving interesting problems', themeIds: ['problem-solver', 'analyst'] },
    { id: 'q8b', label: 'Teaching or mentoring', themeIds: ['teacher', 'helper'] },
    { id: 'q8c', label: 'Creating things', themeIds: ['creator'] },
    { id: 'q8d', label: 'Leading projects', themeIds: ['leader'] },
    { id: 'q8e', label: 'Studying ideas', themeIds: ['analyst', 'teacher'] },
    { id: 'q8f', label: 'Building or fixing things', themeIds: ['builder'] },
  ]),
  Q('q9', 'energy', 'Energy patterns', 'When do you feel most energized?', 1, [
    { id: 'q9a', label: 'Solving difficult challenges', themeIds: ['problem-solver'] },
    { id: 'q9b', label: 'Interacting with people', themeIds: ['helper', 'teacher'] },
    { id: 'q9c', label: 'Creating or designing', themeIds: ['creator'] },
    { id: 'q9d', label: 'Building or fixing', themeIds: ['builder'] },
    { id: 'q9e', label: 'Researching ideas', themeIds: ['analyst'] },
    { id: 'q9f', label: "Leading others', themeIds: ["leader'] },
  ]),
  Q('q10', 'energy', 'Energy patterns', 'What type of work leaves you feeling satisfied?', 1, [
    { id: 'q10a', label: 'Finishing a complex task', themeIds: ['problem-solver', 'builder'] },
    { id: 'q10b', label: 'Helping someone succeed', themeIds: ['helper', 'teacher'] },
    { id: 'q10c', label: 'Producing something creative', themeIds: ['creator'] },
    { id: 'q10d', label: 'Improving a system', themeIds: ['organizer', 'analyst'] },
    { id: 'q10e', label: 'Discovering something new', themeIds: ['analyst'] },
  ]),
  Q('q11', 'clarity', 'Direction clarity', 'Which statement feels closest to you right now?', 1, [
    { id: 'q11a', label: 'I know my direction clearly', themeIds: [] },
    { id: 'q11b', label: 'I have a few ideas but am exploring', themeIds: [] },
    { id: 'q11c', label: 'I feel stuck and unsure', themeIds: [] },
    { id: 'q11d', label: 'I want to change direction', themeIds: [] },
  ]),
  Q('q12', 'clarity', 'Direction clarity', 'If you had a year to experiment freely, you would try:', 1, [
    { id: 'q12a', label: 'Building something new', themeIds: ['builder', 'creator'] },
    { id: 'q12b', label: 'Starting a project', themeIds: ['leader', 'organizer'] },
    { id: 'q12c', label: 'Learning a new field', themeIds: ['analyst', 'teacher'] },
    { id: 'q12d', label: 'Helping people directly', themeIds: ['helper'] },
    { id: 'q12e', label: 'Researching ideas', themeIds: ['analyst'] },
    { id: 'q12f', label: 'Launching something entrepreneurial', themeIds: ['leader', 'creator'] },
  ]),
];

/** Experiment suggestions (not tied to a single theme) */
export const DIRECTION_EXPERIMENTS = [
  'Shadow someone in a field that interests you',
  'Take a short course or workshop in one of your theme areas',
  'Start a small project that uses one of your strengths',
  'Volunteer in a domain that matches your values',
];

/** Single deeper prompt (values, direction, impact). Replaces two shallow prompts. */
export const MEANINGFUL_WORK_PROMPT =
  'What kind of work or contribution would make your life feel meaningful?';

/** Reflective questions: write or speak → AI (or keyword extraction) interprets. Optional examples are hints, not choices. */
export interface ReflectiveQuestion {
  id: string;
  text: string;
  examples: string[];
}

export const REFLECTIVE_DIRECTION_QUESTIONS: ReflectiveQuestion[] = [
  { id: 'r1', text: 'When do you feel most alive or energized?', examples: ['solving difficult problems', 'helping someone improve', 'creating something new', 'organizing complex systems', "teaching others'] },
  { id: "r2', text: 'What kinds of problems do people often come to you for help with?', examples: ['emotional advice', 'technical problems', 'organizing chaos', 'creative ideas', 'leadership'] },
  { id: 'r3', text: 'What kind of work drains you quickly?', examples: ['repetitive tasks', 'social overload', 'strict rules', 'chaotic environments'] },
  { id: 'r4', text: 'If you had unlimited time to learn something, what would you explore?', examples: [] },
  { id: 'r5', text: 'What kind of impact do you want your life or work to have?', examples: [] },
  { id: 'r6', text: 'When you imagine your best day of work, what are you doing?', examples: [] },
  { id: 'r7', text: 'What skills have you developed without being forced to?', examples: [] },
  { id: 'r8', text: 'What kind of environment helps you perform best?', examples: ['quiet focus', 'collaboration', 'leadership', 'research', 'creative exploration'] },
  { id: 'r9', text: 'What subjects or ideas naturally hold your attention?', examples: [] },
  { id: 'r10', text: 'What kind of recognition feels meaningful to you?', examples: ['helping someone succeed', 'solving something difficult', 'building something lasting', 'influencing change'] },
  { id: 'r11', text: 'What problem in the world bothers you enough to want to fix it?', examples: [] },
  { id: 'r12', text: 'If you had to teach something to others, what would you teach?', examples: [] },
];

/** Keywords per theme for simple extraction from written answers (no AI). */
const THEME_KEYWORDS: Record<DirectionThemeId, string[]> = {
  'problem-solver': ['problem', 'solve', 'puzzle', 'fix', 'figure out', 'challenge', 'complex'],
  helper: ['help', 'people', 'support', 'care', 'heal', 'improve', 'advice', 'emotional'],
  creator: ['create', 'design', 'build', 'make', 'art', 'write', 'story', 'original', 'new'],
  organizer: ['organize', 'system', 'process', 'plan', 'structure', 'order', 'efficient'],
  teacher: ['teach', 'explain', 'mentor', 'learn', 'share', 'guide', 'others understand'],
  leader: ['lead', 'team', 'decision', 'vision', 'entrepreneur', 'start', 'manage'],
  analyst: ['analyze', 'research', 'data', 'pattern', 'understand', 'study', 'strategy'],
  builder: ['build', 'fix', 'hands', 'tangible', 'make', 'craft', 'technical'],
};

/** Extract theme scores from combined text (simple keyword match). Used when user writes instead of tapping chips. */
export function extractThemesFromText(text: string): Record<DirectionThemeId, number> {
  const scores: Record<DirectionThemeId, number> = {
    'problem-solver': 0,
    helper: 0,
    creator: 0,
    organizer: 0,
    teacher: 0,
    leader: 0,
    analyst: 0,
    builder: 0,
  };
  const lower = text.toLowerCase();
  for (const [themeId, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[themeId as DirectionThemeId]++;
    }
  }
  return scores;
}

/** Compute results from reflective (written) answers only. */
export function computeDirectionResultsFromReflection(
  meaningfulWork: string,
  reflectiveAnswers: Record<string, string>
): DirectionResults {
  const combined = [meaningfulWork, ...Object.values(reflectiveAnswers)].filter(Boolean).join(' ');
  const themeScores = extractThemesFromText(combined);
  const sorted = (Object.entries(themeScores) as [DirectionThemeId, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  const topThemeIds = sorted.slice(0, 3).map(([id]) => id);
  let topThemes = topThemeIds.map((id) => DIRECTION_THEMES.find((t) => t.id === id)!).filter(Boolean);
  if (topThemes.length === 0) {
    topThemes = DIRECTION_THEMES.slice(0, 3);
  }
  const possibleFields = Array.from(new Set(topThemes.flatMap((t) => t.fields))).slice(0, 8);
  const thriveWhen = Object.values(reflectiveAnswers).filter((s) => s && s.length > 15).slice(0, 5);
  return {
    themeScores,
    topThemes,
    possibleFields,
    thriveWhen: thriveWhen.map((s) => (s.length > 60 ? s.slice(0, 57) + '...' : s)),
  };
}

/** Gauges most relevant to direction (for results) */
export const DIRECTION_GAUGES = [
  { id: 'direction', label: 'Direction', emoji: '🎯' },
  { id: 'alignment', label: 'Alignment', emoji: '✨' },
  { id: 'connection', label: 'Connection', emoji: '💕' },
];

export interface DirectionResults {
  themeScores: Record<DirectionThemeId, number>;
  topThemes: DirectionTheme[];
  possibleFields: string[];
  thriveWhen: string[];
}

/** Convert AI interpretation (from ai.interpretDirectionReflection) to DirectionResults. */
export function directionInterpretationToResults(interp: {
  themeIds: string[];
  thriveWhen: string[];
  possibleFields: string[];
}): DirectionResults {
  const allIds: DirectionThemeId[] = ['problem-solver', 'helper', 'creator', 'organizer', 'teacher', 'leader', 'analyst', 'builder'];
  const validIds = interp.themeIds.filter((id): id is DirectionThemeId => allIds.includes(id as DirectionThemeId));
  const topThemes = validIds
    .slice(0, 4)
    .map((id) => DIRECTION_THEMES.find((t) => t.id === id)!)
    .filter(Boolean);
  const themeScores = allIds.reduce(
    (acc, id) => ({ ...acc, [id]: validIds.includes(id) ? 1 : 0 }),
    {} as Record<DirectionThemeId, number>
  );
  return {
    themeScores,
    topThemes: topThemes.length > 0 ? topThemes : DIRECTION_THEMES.slice(0, 3),
    possibleFields: interp.possibleFields,
    thriveWhen: interp.thriveWhen,
  };
}

/** Compute results from answers: questionId -> optionId[] (for multi) or optionId (for single) */
export function computeDirectionResults(answers: Record<string, string | string[]>): DirectionResults {
  const themeScores: Record<DirectionThemeId, number> = {
    'problem-solver': 0,
    helper: 0,
    creator: 0,
    organizer: 0,
    teacher: 0,
    leader: 0,
    analyst: 0,
    builder: 0,
  };
  const thriveWhen: string[] = [];

  for (const q of LIFE_DIRECTION_QUESTIONS) {
    const raw = answers[q.id];
    const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const optionId of selected) {
      const option = q.options.find((o) => o.id === optionId);
      if (option) {
        for (const t of option.themeIds) {
          themeScores[t] = (themeScores[t] || 0) + 1;
        }
        if (option.thriveLabel && !thriveWhen.includes(option.thriveLabel)) {
          thriveWhen.push(option.thriveLabel);
        }
      }
    }
  }

  const sorted = (Object.entries(themeScores) as [DirectionThemeId, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  const topThemeIds = sorted.slice(0, 3).map(([id]) => id);
  const topThemes = topThemeIds.map((id) => DIRECTION_THEMES.find((t) => t.id === id)!).filter(Boolean);
  const possibleFields = Array.from(
    new Set(topThemes.flatMap((t) => t.fields))
  ).slice(0, 8);

  return {
    themeScores,
    topThemes,
    possibleFields,
    thriveWhen: thriveWhen.slice(0, 6),
  };
}
