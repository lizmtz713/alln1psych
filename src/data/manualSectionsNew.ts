/**
 * Human Owner's Manual - New Sections Index
 * 
 * These three sections complete the PHOSM (Personal Health Operating System for the Mind)
 * by covering the EXTERNAL life domains where humans actually live.
 * 
 * The existing manual covers the INTERNAL system:
 * - Section 1: Know Your Machine (emotions, brain, body)
 * - Section 2: Maintenance Schedule (daily care, talking, tracking)
 * - Section 3: Troubleshooting (anxiety, depression, anger, trauma)
 * - Section 4: Upgrades (EQ, boundaries)
 * 
 * These new sections cover EXTERNAL life domains:
 * - Section 5: School - where learning and social stress collide
 * - Section 6: Work - where adults spend their lives
 * - Section 7: Family & Relationships - where humans shape each other
 * 
 * Together: Internal system + External life domains = Complete PHOSM
 * 
 * "You are not broken. You are a pilot who was never given a cockpit. Now you have one."
 */

export { MANUAL_SECTION_5 } from './manualSection5-school';
export { MANUAL_SECTION_6 } from './manualSection6-work';
export { MANUAL_SECTION_7 } from './manualSection7-family';

/**
 * Integration note:
 * 
 * To add these to the main manual, update manualContent.ts:
 * 
 * 1. Import the new sections:
 *    import { MANUAL_SECTION_5, MANUAL_SECTION_6, MANUAL_SECTION_7 } from './manualSectionsNew';
 * 
 * 2. Add them to MANUAL_SECTIONS array:
 *    export const MANUAL_SECTIONS = [
 *      section1,  // Know Your Machine
 *      section2,  // Maintenance Schedule
 *      section3,  // Troubleshooting
 *      section4,  // Upgrades
 *      MANUAL_SECTION_5,  // School
 *      MANUAL_SECTION_6,  // Work
 *      MANUAL_SECTION_7,  // Family & Relationships
 *    ];
 * 
 * The sections are designed to match the existing ManualSection interface.
 */

// ============================================================
// PHOSM COMPLETE SUMMARY
// ============================================================

export const PHOSM_OVERVIEW = {
  name: 'Personal Health Operating System for the Mind',
  tagline: 'The Human Cockpit',
  
  philosophy: `Like a cockpit, when you understand all the moving pieces, you understand yourself better. 
You need to know all of that data and be able to make adjustments - same for humans.
The gauges show your internal state, but other gauges alongside and behind them also have effects.`,

  internalSystem: {
    title: 'Know Your Machine',
    sections: [
      { id: 1, name: 'Know Your Machine', focus: 'Emotions, brain, body-mind connection' },
      { id: 2, name: 'Maintenance Schedule', focus: 'Daily care, communication, tracking' },
      { id: 3, name: 'Troubleshooting', focus: 'Anxiety, depression, anger, trauma' },
      { id: 4, name: 'Upgrades', focus: 'EQ, boundaries, growth' },
    ],
  },

  externalDomains: {
    title: 'Where Life Happens',
    sections: [
      { id: 5, name: 'School', focus: 'Academic stress, learning, social dynamics' },
      { id: 6, name: 'Work', focus: 'Burnout, motivation, work-life boundaries' },
      { id: 7, name: 'Family & Relationships', focus: 'Parent-child dynamics, intergenerational patterns" },
    ],
  },

  coreInsight: `Your gauges don't exist in isolation. 
School affects them. Work affects them. Family affects them. Relationships affect them.
Understanding HOW life affects your mind - and having a dashboard for ALL of it - 
is what makes you a pilot, not a passenger.`,

  originStory: `Built for the conversations that don't happen.
For parents who want to understand their kids when kids can't or won't talk.
For teens who need to learn about themselves early so they don't feel alone.
Circle lets families share gauges when words fail.`,
};

// ============================================================
// CONTENT STATISTICS
// ============================================================

export const CONTENT_STATS = {
  newSections: 3,
  totalNewLessons: 14,
  
  section5: {
    name: 'School',
    modules: 2,
    lessons: 5,
    topics: [
      'School Stress Is Real Stress',
      'Learning How YOU Learn',
      'The Social Side of School',
      'Starting New (Transitions)',
      'The College Transition',
    ],
  },
  
  section6: {
    name: 'Work',
    modules: 2,
    lessons: 7,
    topics: [
      'How Work Affects Every Gauge',
      'Burnout: The Engine Fire (Maslach)',
      'Work-Life Boundaries',
      'Motivation: Why You Work (Herzberg)',
      'Workplace Relationships',
      'When Work Doesn\'t Fit',
      'Career Transitions',
    ],
  },
  
  section7: {
    name: 'Family & Relationships',
    modules: 3,
    lessons: 7,
    topics: [
      'Where Your Wiring Came From',
      'Intergenerational Patterns',
      'When Family Wasn\'t Safe',
      'The Parent-Child Gauge Connection',
      'When Kids Can\'t or Won\'t Talk',
      'Understanding Your Teen (For Parents)',
      'Understanding Your Parents (For Teens)',
      'How Relationships Affect Your Gauges',
    ],
  },
  
  academicFoundations: [
    'Maslach Burnout Inventory (burnout dimensions)',
    'Herzberg Two-Factor Theory (motivation)',
    'Attachment Theory (family of origin)',
    'Polyvagal Theory (co-regulation)',
    'Neuroplasticity (rewiring patterns)',
    'VARK Learning Styles',
  ],
};
