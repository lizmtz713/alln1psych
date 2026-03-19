/**
 * Relationship Toolkit — Under People / Connection.
 * Making, maintaining, nurturing, repairing, replacing, and removing harmful relationships.
 * Tied to Connection gauge and research (repeated contact, emotional safety, etc.).
 */

export interface ToolkitSection {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** Short principle or science line */
  principle: string;
  /** Bullet points or short paragraphs */
  content: string[];
  /** Quick actions (labels) */
  actions?: string[];
}

export const RELATIONSHIP_TOOLKIT_SECTIONS: ToolkitSection[] = [
  {
    id: 'making-friendships',
    title: 'Making friendships',
    subtitle: 'Where and how friendships form',
    emoji: '🌱',
    principle: 'Friendships form through repeated positive interactions.',
    content: [
      'Where friendships form: shared contexts (work, school, hobby, neighborhood), repeated contact, and low-pressure interaction.',
      'Shared experiences create bonds—doing something together, not just talking.',
      'Repeated contact builds familiarity; one-off encounters rarely become close friends.',
      'Vulnerability in small steps—sharing a little, then more—builds trust.',
    ],
    actions: ['Show up regularly', 'Suggest one shared activity', 'Share something small about yourself'],
  },
  {
    id: 'maintaining-friendships',
    title: 'Maintaining friendships',
    subtitle: 'What keeps friendships alive',
    emoji: '💪',
    principle: 'Science shows friendships require attention, reliability, shared experiences, and emotional safety.',
    content: [
      'Attention: check in regularly. Even short messages signal "you matter."',
      'Reliability: show up when you say you will. Trust builds on follow-through.',
      'Shared experiences: keep doing things together, not only texting.',
      'Emotional safety: no judgment, confidentiality, and room for both people to be real.',
    ],
    actions: ['Check in', 'Plan time together', 'Celebrate their wins', 'Offer support when they\'re struggling'],
  },
  {
    id: 'nurturing-deeper',
    title: 'Nurturing deeper relationships',
    subtitle: 'Going beyond surface connection',
    emoji: '💜',
    principle: 'Deeper connection grows with emotional validation, curiosity, active listening, and appreciation.',
    content: [
      'Emotional validation: "That makes sense," "I hear you," "That sounds hard." You don\'t have to fix—just acknowledge.',
      'Curiosity: ask follow-up questions. "What was that like?" "What do you want to do about it?"',
      'Active listening: put devices away. Reflect back what you heard so they feel seen.',
      'Appreciation: name what you value about them. Specific beats generic.',
    ],
    actions: ['Validate before advising', 'Ask one curious question', 'Say one specific thing you appreciate'],
  },
  {
    id: 'repairing-relationships',
    title: 'Repairing relationships',
    subtitle: 'Acknowledge → Understand → Repair',
    emoji: '🔧',
    principle: 'Repair is possible when both people can acknowledge hurt, understand the other\'s perspective, and take a step toward repair.',
    content: [
      '1. Acknowledge: "I realize that hurt you." No "but" or excuse yet.',
      '2. Understand: "I want to understand your perspective." Listen without defending.',
      '3. Repair: "How can we repair this?" or "What would help from here?"',
      'Example script: "I realize that hurt you. I want to understand your perspective. How can we repair this?"',
    ],
    actions: ['Acknowledge the hurt', 'Ask how they experienced it', 'Offer a repair step'],
  },
  {
    id: 'replacing-friendships',
    title: 'Replacing friendships',
    subtitle: 'When relationships fade or change',
    emoji: '🔄',
    principle: 'Sometimes relationships fade. That\'s normal. You can learn how friendships evolve and how to build new community.',
    content: [
      'How friendships evolve: life stages, moves, and priorities change. Some friendships deepen; others naturally fade.',
      'Meeting new people: join groups (hobby, faith, volunteer), say yes to invites, be the one who suggests plans.',
      'Building community: one or two close people plus a wider circle is enough. Quality and consistency matter.',
    ],
    actions: ['Join one group or activity', 'Reach out to one acquaintance', 'Say yes to one invite'],
  },
  {
    id: 'removing-harmful',
    title: 'Removing harmful relationships',
    subtitle: 'Boundaries and emotional safety',
    emoji: '🛡️',
    principle: 'Protecting your wellbeing is healthy. You are allowed to distance from toxic or harmful dynamics.',
    content: [
      'Boundaries: you get to decide how much contact, what topics are off-limits, and what behavior you will not accept.',
      'Emotional safety: if someone consistently dismisses, blames, or harms you, reducing or ending contact is valid.',
      'Distancing from toxic dynamics does not make you a bad person. It can be the only way to protect your mental health.',
      'You can still care about someone and choose not to be in their orbit.',
    ],
    actions: ['Name one boundary', 'Reduce contact if needed', 'Seek support (friend, therapist)'],
  },
  {
    id: 'relationship-signals',
    title: 'Relationship signals',
    subtitle: 'Connected to your Connection gauge',
    emoji: '📡',
    principle: 'Low Connection can mean isolation, neglected friendships, or unresolved conflict. Your gauges help you notice.',
    content: [
      'Low Connection might indicate: isolation, neglected friendships, unresolved conflict, or lack of meaningful contact.',
      'Repair suggestions: reach out to one person, have a repair conversation, or seek new community.',
      'Use the Family Conflict Navigator or Perspective Translator when conflict is involved. Use Reach Out when you\'ve been distant.',
    ],
    actions: ['Reach out', 'Repair conversation', 'Seek new community'],
  },
];

export function getRelationshipToolkitSection(id: string): ToolkitSection | undefined {
  return RELATIONSHIP_TOOLKIT_SECTIONS.find((s) => s.id === id);
}
