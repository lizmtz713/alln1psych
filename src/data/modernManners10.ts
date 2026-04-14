/**
 * Modern Manners — 10 skills research says matter most for relationships and society.
 * Maps to existing tools and lessons. See docs/MODERN-MANNERS-10-SKILLS.md.
 */

export interface ModernMannersSkill {
  id: string;
  title: string;
  oneLiner: string;
  example: string;
  /** Route to micro-lesson if we have one (e.g. relationship-repair) */
  lessonRoute?: string;
  lessonLabel?: string;
  /** Primary practice tool */
  toolRoute: string;
  toolLabel: string;
  /** Optional: 16 Human Skills skill id for cross-link */
  humanSkillId?: string;
}

export const MODERN_MANNERS_10: ModernMannersSkill[] = [
  {
    id: 'listening',
    title: 'Listening without interrupting',
    oneLiner: 'Let someone finish before you respond.',
    example: ''I want to make sure I understand—can you say more?"',
    toolRoute: '/(modals)/role-play',
    toolLabel: 'Role Play',
    humanSkillId: 'communication',
  },
  {
    id: 'gratitude',
    title: 'Expressing gratitude',
    oneLiner: 'Acknowledge when someone helps or does something positive.',
    example: ''Thanks for helping me with that earlier. I appreciate it."',
    toolRoute: '/tools/reach-out',
    toolLabel: 'Reach Out',
  },
  {
    id: 'responsibility',
    title: 'Taking responsibility',
    oneLiner: 'Own your part instead of blaming others.',
    example: ''I realize I sounded harsh earlier. I\'m sorry."',
    lessonRoute: '/learn/relationship-repair/apologize',
    lessonLabel: 'How to apologize properly',
    toolRoute: '/tools/repair',
    toolLabel: 'Repair Builder',
    humanSkillId: 'repair',
  },
  {
    id: 'validation',
    title: 'Validating others\' feelings',
    oneLiner: 'Show you understand their experience without necessarily agreeing.',
    example: ''I can see why that upset you."',
    lessonRoute: '/learn/relationship-repair/validate',
    lessonLabel: 'How to validate someone',
    toolRoute: '/tools/tone-check',
    toolLabel: 'Tone Check',
    humanSkillId: 'empathy',
  },
  {
    id: 'disagreement',
    title: 'Respectful disagreement',
    oneLiner: 'Different opinions without insulting or dismissing.',
    example: ''I see it differently. Can I explain my perspective?"',
    toolRoute: '/(modals)/role-play',
    toolLabel: 'Role Play',
    humanSkillId: 'communication',
  },
  {
    id: 'apologizing',
    title: 'Apologizing effectively',
    oneLiner: 'Acknowledgment + responsibility + repair.',
    example: ''I\'m sorry I canceled last minute. I should have told you earlier. How can I make it up to you?"',
    lessonRoute: '/learn/relationship-repair/apologize',
    lessonLabel: 'How to apologize properly',
    toolRoute: '/(modals)/role-play',
    toolLabel: 'Role Play',
    humanSkillId: 'repair',
  },
  {
    id: 'needs',
    title: 'Asking for needs clearly',
    oneLiner: 'Say what you need instead of expecting others to guess.',
    example: ''I need some quiet time to finish this."',
    lessonRoute: '/learn/relationship-repair/start-hard-convo',
    lessonLabel: 'Start a difficult conversation',
    toolRoute: '/tools/repair',
    toolLabel: 'Repair Builder',
    humanSkillId: 'communication',
  },
  {
    id: 'empathy',
    title: 'Showing empathy',
    oneLiner: 'Try to understand the other person\'s perspective.',
    example: ''That sounds really stressful."',
    lessonRoute: '/learn/relationship-repair/validate',
    lessonLabel: 'How to validate someone',
    toolRoute: '/tools/tone-check',
    toolLabel: 'Tone Check',
    humanSkillId: 'empathy',
  },
  {
    id: 'regulation',
    title: 'Regulating emotional reactions',
    oneLiner: 'Pause when emotions are intense.',
    example: ''I\'m getting upset. Let\'s take a short break."',
    lessonRoute: '/learn/relationship-repair/defensiveness',
    lessonLabel: 'Why defensiveness makes conflict worse',
    toolRoute: '/tools/quick-reset',
    toolLabel: 'Quick Reset',
    humanSkillId: 'regulation',
  },
  {
    id: 'repair',
    title: 'Repairing after conflict',
    oneLiner: 'Restore connection after a disagreement.',
    example: ''I don\'t like how we left things. Can we talk?"',
    lessonRoute: '/learn/relationship-repair/repair-after-fight',
    lessonLabel: 'How to repair after a fight',
    toolRoute: '/tools/after-fight',
    toolLabel: 'After the Fight',
    humanSkillId: 'repair',
  },
];
