/**
 * Human Roles — Scientifically grounded guides for how to show up in relationships.
 * Roles, not advice. Fits inside the Life OS; connects to Connection, Emotion, Alignment.
 * Structure: Layer 1 (Quick Truth) → Layer 2 (Why It Matters) → Layer 3 (What To Do) → Layer 4 (Learn More).
 */

export interface HumanRoleQuickAction {
  id: string;
  label: string;
}

export interface HumanRole {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  /** Section title for Layer 1, e.g. "What children need" */
  needsSectionTitle: string;
  /** Layer 1: What this role needs (science) — 3–5 bullets */
  whatTheyNeed: string[];
  /** Layer 2: Short science explanation */
  whyItMatters: string;
  /** Common mistakes — 3–5 bullets */
  commonMistakes: string[];
  /** What works best — 3–5 bullets */
  whatWorks: string[];
  /** Quick actions (buttons) */
  quickActions: HumanRoleQuickAction[];
  /** Layer 4: Optional deeper topics */
  learnMoreTopics?: string[];
}

export const HUMAN_ROLES: HumanRole[] = [
  {
    id: 'parent',
    label: 'Parent',
    shortLabel: 'Parent',
    emoji: '👨‍👩‍👧',
    needsSectionTitle: 'What children need',
    whatTheyNeed: [
      'Safety — physical and emotional',
      'Predictability — routines they can count on',
      'Attention — being seen and heard',
      'Encouragement — belief in their capacity',
      'Boundaries — clear, kind limits',
    ],
    whyItMatters:
      'Developmental psychology shows that children’s brains wire for security and self-regulation when caregivers provide consistent safety and attunement. Predictability reduces anxiety; attention builds attachment; boundaries teach self-regulation.',
    commonMistakes: [
      'Confusing control with guidance',
      'Withdrawing attention when stressed',
      'Focusing only on correction, not connection',
      'Inconsistent boundaries',
    ],
    whatWorks: [
      'Connection before correction',
      'Consistent routines',
      'Emotional validation (“I see you’re upset”)',
      'Repair after rupture — “I was short earlier; I’m sorry.”',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'listen', label: 'Listen' },
      { id: 'encourage', label: 'Encourage' },
      { id: 'set-boundary', label: 'Set boundary' },
      { id: 'repair', label: 'Repair' },
    ],
    learnMoreTopics: ['Developmental psychology', 'Attachment theory', 'Child development'],
  },
  {
    id: 'partner',
    label: 'Partner / Spouse',
    shortLabel: 'Partner',
    emoji: '💑',
    needsSectionTitle: 'What partners need',
    whatTheyNeed: [
      'Emotional responsiveness — being met when they reach out',
      'Appreciation — being noticed and thanked',
      'Shared direction — aligned on what matters',
      'Physical closeness — touch, presence',
      'Conflict repair — “we’re okay” after disagreement',
    ],
    whyItMatters:
      'Research from the Gottman Institute and attachment theory shows that relationships thrive on a ratio of about 5 positive interactions to 1 negative, and that repair attempts after conflict predict longevity. Emotional responsiveness calms the nervous system and builds trust.',
    commonMistakes: [
      'Criticism instead of specific requests',
      'Withdrawal during stress',
      'Assuming intentions instead of asking',
      'Letting resentment build without repair',
    ],
    whatWorks: [
      'Appreciation ratio (5:1 positive to negative)',
      'Repair attempts — “I don’t want to be on opposite sides”',
      'Curiosity instead of blame — “What was that like for you?”',
      'Planning time together, not just logistics',
    ],
    quickActions: [
      { id: 'send-appreciation', label: 'Send appreciation' },
      { id: 'plan-time', label: 'Plan time together' },
      { id: 'repair', label: 'Repair conflict' },
      { id: 'ask-how-they-feel', label: 'Ask how they feel' },
    ],
    learnMoreTopics: ['Gottman Institute research', 'Attachment theory', 'Relationship neuroscience'],
  },
  {
    id: 'friend',
    label: 'Friend',
    shortLabel: 'Friend',
    emoji: '🤝',
    needsSectionTitle: 'What friends need',
    whatTheyNeed: [
      'Reliability — show up when it matters',
      'Emotional safety — no judgment',
      'Shared time — friendships decay without contact',
    ],
    whyItMatters:
      'Humans evolved in small groups. Social neuroscience shows that trusted relationships reduce stress responses in the brain. When we know someone is there for us, the nervous system relaxes. Isolation increases anxiety; supportive friendships improve resilience.',
    commonMistakes: [
      'Assuming they’re fine without checking in',
      'Only talking about yourself',
      'Disappearing when life gets busy',
    ],
    whatWorks: [
      'Small, consistent check-ins',
      'Shared experiences over time',
      'Acknowledging when you’ve been absent',
    ],
    quickActions: [
      { id: 'text-them', label: 'Text them' },
      { id: 'plan-something', label: 'Plan something' },
      { id: 'send-appreciation', label: 'Send appreciation' },
    ],
    learnMoreTopics: ['Attachment theory', 'Friendship maintenance research', 'Social baseline theory'],
  },
  {
    id: 'child',
    label: 'Child / Son / Daughter',
    shortLabel: 'Child',
    emoji: '🧒',
    needsSectionTitle: 'What parents need',
    whatTheyNeed: [
      'Respect — for their choices and boundaries',
      'Acknowledgement — that their life and feelings matter',
      'Inclusion — in family decisions when appropriate',
      'Emotional connection — not just logistics',
    ],
    whyItMatters:
      'Family systems and attachment research show that adult children and parents stay close when there is mutual respect and regular emotional contact. Parents need to feel that their experience is seen; adult children need to feel they can be themselves without performing.',
    commonMistakes: [
      'Only contacting when you need something',
      'Dismissing their advice or perspective',
      'Avoiding hard topics to keep the peace',
    ],
    whatWorks: [
      'Regular check-ins that aren’t task-based',
      'Appreciation for what they’ve given you',
      'Listening to their stories and opinions',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'listen', label: 'Listen' },
      { id: 'send-appreciation', label: 'Send appreciation' },
    ],
    learnMoreTopics: ['Family systems theory', 'Attachment theory'],
  },
  {
    id: 'sibling',
    label: 'Sibling',
    shortLabel: 'Sibling',
    emoji: '👫',
    needsSectionTitle: 'What siblings need',
    whatTheyNeed: [
      'Fairness — feeling seen, not compared',
      'Presence — showing up for milestones and hard times',
      'Recognition — that the relationship matters',
    ],
    whyItMatters:
      'Sibling relationships are among the longest of our lives. Research shows that feeling “on the same team” as adults reduces loneliness and provides a unique shared history. Rivalry often softens when both feel acknowledged.',
    commonMistakes: [
      'Taking sides with a parent against a sibling',
      'Only reaching out when there’s drama',
      'Comparing lives or achievements',
    ],
    whatWorks: [
      'One-on-one time without the whole family',
      'Remembering what matters to them',
      'Repair after conflict — “I want us to be good.”',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'plan-something', label: 'Plan something' },
      { id: 'send-appreciation', label: 'Send appreciation' },
    ],
    learnMoreTopics: ['Sibling relationship research', 'Family systems'],
  },
  {
    id: 'grandparent',
    label: 'Grandparent',
    shortLabel: 'Grandparent',
    emoji: '👴',
    needsSectionTitle: 'What grandchildren need',
    whatTheyNeed: [
      'Emotional stability — a steady, calm presence',
      'Identity continuity — stories and roots',
      'Family wisdom — “you come from somewhere”',
    ],
    whyItMatters:
      'Research shows grandparents provide emotional stability, identity continuity, and a sense of belonging across generations. Their presence can buffer stress for both children and parents when it’s consistent and non-intrusive.',
    commonMistakes: [
      'Overriding parents’ boundaries',
      'Competing for affection with the other grandparents',
      'Only showing up for holidays',
    ],
    whatWorks: [
      'Storytelling and passing on family history',
      'Focused attention when together',
      'Presence without fixing — listening more than advising',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'share-story', label: 'Share a story' },
      { id: 'plan-visit', label: 'Plan a visit' },
    ],
    learnMoreTopics: ['Grandparenting research', 'Intergenerational attachment'],
  },
  {
    id: 'mentor',
    label: 'Mentor',
    shortLabel: 'Mentor',
    emoji: '🎓',
    needsSectionTitle: 'What mentees need',
    whatTheyNeed: [
      'Clarity — what you can and can’t offer',
      'Availability — consistent, bounded time',
      'Honesty — real feedback, not only praise',
      'Belief — “I see potential in you.”',
    ],
    whyItMatters:
      'Mentorship research shows that one trusted adult who believes in a young person can significantly affect resilience and direction. The key is consistency and honesty, not perfection. Mentees need to feel safe to try and fail.',
    commonMistakes: [
      'Taking over instead of guiding',
      'Being inconsistent or canceling often',
      'Only giving advice, not listening',
    ],
    whatWorks: [
      'Asking what they need before advising',
      'Sharing your own failures and learnings',
      'Setting clear expectations and following through',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'listen', label: 'Listen' },
      { id: 'encourage', label: 'Encourage' },
    ],
    learnMoreTopics: ['Mentorship effectiveness', 'Developmental relationships'],
  },
  {
    id: 'caregiver',
    label: 'Caregiver',
    shortLabel: 'Caregiver',
    emoji: '🫂',
    needsSectionTitle: 'What the person in care needs',
    whatTheyNeed: [
      'Recognition — that their needs matter too',
      'Respite — time to recharge',
      'Partnership — not doing it all alone',
      'Clarity — what the person in care wants',
    ],
    whyItMatters:
      'Caregiver research shows that burnout is high when support is low. The person receiving care benefits from a caregiver who is regulated and supported. Sustainable care requires boundaries and backup.',
    commonMistakes: [
      'Neglecting your own health',
      'Assuming you know what they want without asking',
      'Refusing help when it’s offered',
    ],
    whatWorks: [
      'Asking the person in care what they want, when possible',
      'Accepting help and delegating',
      'Scheduling rest and connection for yourself',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in with them' },
      { id: 'ask-for-help', label: 'Ask for help' },
      { id: 'schedule-rest', label: 'Schedule rest' },
    ],
    learnMoreTopics: ['Caregiver wellbeing', 'Compassionate care research'],
  },
  {
    id: 'leader',
    label: 'Leader / Manager',
    shortLabel: 'Leader',
    emoji: '📋',
    needsSectionTitle: 'What your team needs',
    whatTheyNeed: [
      'Clarity — what’s expected and why',
      'Safety — to speak up and make mistakes',
      'Recognition — that their work and wellbeing matter',
      'Growth — room to learn',
    ],
    whyItMatters:
      'Leadership and organizational psychology show that psychological safety and clear expectations improve performance and retention. People need to feel seen as humans, not only as producers. Trust is built through consistency and fairness.',
    commonMistakes: [
      'Only giving feedback when something’s wrong',
      'Unclear or shifting priorities',
      'Ignoring burnout signals',
    ],
    whatWorks: [
      'Regular one-on-ones that include “How are you?”',
      'Clear, fair boundaries and expectations',
      'Acknowledging effort and progress, not only outcomes',
    ],
    quickActions: [
      { id: 'check-in', label: 'Check in' },
      { id: 'encourage', label: 'Encourage' },
      { id: 'clarify', label: 'Clarify expectations' },
    ],
    learnMoreTopics: ['Psychological safety', 'Inclusive leadership'],
  },
  {
    id: 'community',
    label: 'Community Member',
    shortLabel: 'Community',
    emoji: '🌍',
    needsSectionTitle: 'What community needs',
    whatTheyNeed: [
      'Belonging — a place where they fit',
      'Contribution — a way to give back',
      'Reciprocity — give and receive',
    ],
    whyItMatters:
      'Humans are wired for belonging. Community participation is linked to lower loneliness and better mental health. Even small, consistent involvement — a group, a neighborhood, a cause — strengthens identity and connection.',
    commonMistakes: [
      'Only showing up when you need something',
      'Staying on the sidelines without participating',
      'Judging instead of curious engagement',
    ],
    whatWorks: [
      'Showing up consistently',
      'Offering skills or time, not only taking',
      'Building a few deeper ties within the group',
    ],
    quickActions: [
      { id: 'show-up', label: 'Show up' },
      { id: 'offer-help', label: 'Offer help' },
      { id: 'check-in', label: 'Check in on someone' },
    ],
    learnMoreTopics: ['Community psychology', 'Social capital'],
  },
];

export function getHumanRoleById(id: string): HumanRole | undefined {
  return HUMAN_ROLES.find((r) => r.id === id);
}
