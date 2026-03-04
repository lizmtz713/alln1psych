/**
 * Red Flag / Green Flag Tool — Science-based relationship markers.
 * Research: Gottman (Four Horsemen), attachment theory, accountability/respect literature.
 * @see docs/ingauge-RED-GREEN-FLAGS-TOOL.md
 */

export type FlagType = 'red' | 'green';

export interface FlagItem {
  id: string;
  label: string;
  research?: string;
}

export interface FlagCategory {
  id: string;
  title: string;
  researchBacking: string;
  items: FlagItem[];
}

// ─── RED FLAGS ─────────────────────────────────────────────────────────────

export const RED_FLAG_CATEGORIES: FlagCategory[] = [
  {
    id: 'four-horsemen',
    title: 'The Four Horsemen (Gottman)',
    researchBacking: "Gottman's research identified four behaviors that predict divorce with ~93% accuracy when persistent. They corrode trust and safety.",
    items: [
      { id: 'criticism', label: 'Criticism', research: 'Attacking character or personality instead of a specific behavior. "You never..." vs "When you did X, I felt..."' },
      { id: 'contempt', label: 'Contempt', research: 'Disrespect, sarcasm, eye-rolling, mockery, superiority. The most toxic of the four; implies disgust.' },
      { id: 'defensiveness', label: 'Defensiveness', research: 'Deflecting, making excuses, counter-attacking. Blocks ownership and repair.' },
      { id: 'stonewalling', label: 'Stonewalling', research: 'Withdrawing, shutting down, refusing to engage. Often a response to flooding; leaves the other person alone in the conflict.' },
    ],
  },
  {
    id: 'attachment-red',
    title: 'Attachment Red Flags',
    researchBacking: 'Insecure attachment can show up as push-pull dynamics, fear of vulnerability, or overwhelming intensity that doesn\'t match the depth of the relationship.',
    items: [
      { id: 'hot-cold', label: 'Hot/cold cycles', research: 'Intense closeness followed by withdrawal or distance. Creates anxiety and unpredictability.' },
      { id: 'love-bombing', label: 'Love bombing', research: 'Over-the-top attention, flattery, or commitment very early. Can be a tactic to create dependency before boundaries are set.' },
      { id: 'avoids-vulnerability', label: 'Avoids vulnerability', research: 'Rarely shares feelings, needs, or fears. Makes true intimacy difficult.' },
    ],
  },
  {
    id: 'respect-red',
    title: 'Respect Red Flags',
    researchBacking: 'How someone treats people who can\'t do anything for them (service workers, exes) often predicts how they\'ll treat you when conflict or power shifts.',
    items: [
      { id: 'rude-service', label: 'Rude to service workers', research: 'Dismissive, condescending, or hostile to waitstaff, drivers, etc.' },
      { id: 'badmouths-exes', label: 'Bad-mouths all exes', research: 'Every past partner is "crazy" or "the problem." Suggests lack of ownership or pattern of blame.' },
      { id: 'ignores-boundaries', label: 'Ignores boundaries', research: 'Your "no" doesn\'t count. Pushes, guilts, or dismisses when you set a limit.' },
    ],
  },
  {
    id: 'accountability-red',
    title: 'Accountability Red Flags',
    researchBacking: 'Healthy relationships require ownership of harm and real behavior change. Without it, the same hurts repeat.',
    items: [
      { id: 'never-apologizes', label: 'Never apologizes', research: 'No genuine "I was wrong." Deflects, minimizes, or turns it back on you.' },
      { id: 'darvo', label: 'DARVO', research: 'Deny, Attack, Reverse Victim and Offender. Makes you feel like you\'re the one who did something wrong when you raise a concern.' },
      { id: 'repeats-without-changing', label: 'Repeats without changing', research: 'Says sorry but behavior doesn\'t change. Or acknowledges the pattern but keeps doing it.' },
    ],
  },
  {
    id: 'serious-warning',
    title: 'Serious Warning Signs',
    researchBacking: 'These patterns are associated with abuse and control. They often escalate. Trust your instincts and seek support if you see these.',
    items: [
      { id: 'isolates', label: 'Isolates you', research: 'Discourages or blocks contact with friends, family, or support. You become more dependent on them.' },
      { id: 'controls-finances', label: 'Controls finances', research: 'Limits your access to money, hides accounts, or makes you ask for every expense.' },
      { id: 'physical-intimidation', label: 'Physical intimidation', research: 'Throwing things, blocking doors, getting in your face, or making you fear physical harm.' },
      { id: 'threats', label: 'Threats', research: 'Threats to you, to themselves, or to others. Used to control or create fear.' },
    ],
  },
];

// ─── GREEN FLAGS ───────────────────────────────────────────────────────────

export const GREEN_FLAG_CATEGORIES: FlagCategory[] = [
  {
    id: 'secure-attachment',
    title: 'Secure Attachment Markers',
    researchBacking: 'Secure attachment is characterized by consistency, comfort with both closeness and space, and a stable sense of "I can count on you."',
    items: [
      { id: 'consistent', label: 'Consistent', research: 'Words match actions over time. You don\'t have to guess where you stand.' },
      { id: 'closeness-and-space', label: 'Comfortable with closeness AND space', research: 'Can be close without smothering; can give space without disappearing. No push-pull games.' },
    ],
  },
  {
    id: 'respect-green',
    title: 'Respect Markers',
    researchBacking: 'Respect shows up in how they treat your boundaries, other people, and your wins — not just when they want something from you.',
    items: [
      { id: 'respects-no', label: 'Respects your no', research: 'When you set a boundary, they honor it. No guilt-tripping or "just this once."' },
      { id: 'kind-to-everyone', label: 'Kind to everyone', research: 'Considerate to service workers, strangers, people who can\'t help them. Not just nice to you.' },
      { id: 'celebrates-success', label: 'Celebrates your success', research: 'Genuinely happy for your wins. Not threatened or competitive.' },
    ],
  },
  {
    id: 'accountability-green',
    title: 'Accountability Markers',
    researchBacking: 'Real accountability means specific apologies, openness to feedback, and actual behavior change — not just saying the right things.',
    items: [
      { id: 'real-apologies', label: 'Real apologies', research: 'Specific ("I did X"), no "but," and follow-through. Behavior changes.' },
      { id: 'takes-feedback', label: 'Takes feedback', research: 'Can hear "that hurt me" without defensiveness, denial, or turning it back on you.' },
      { id: 'changes-behavior', label: 'Changes behavior', research: 'When something matters to you, they adjust. You see the change over time.' },
    ],
  },
  {
    id: 'conflict-green',
    title: 'Conflict Markers',
    researchBacking: 'Healthy conflict stays on the issue, stays in the room, and ends with repair. Gottman\'s research shows repair attempts are key to lasting relationships.',
    items: [
      { id: 'fights-fair', label: 'Fights fair', research: 'No name-calling, contempt, or character attacks. Sticks to the issue.' },
      { id: 'stays-present', label: 'Stays present', research: 'Doesn\'t stonewall or run away. Stays in the conversation even when it\'s hard.' },
      { id: 'repairs-after', label: 'Repairs after', research: 'Comes back to make it right. Apologizes, reconnects, or checks in after conflict.' },
    ],
  },
  {
    id: 'growth',
    title: 'Growth Markers',
    researchBacking: 'Partners who do their own work and support yours create a growth-oriented relationship instead of a static or restrictive one.',
    items: [
      { id: 'self-work', label: 'Does self-work', research: 'Therapy, reflection, reading, or other ways of working on themselves. Not perfect — willing to grow.' },
      { id: 'curious-about-you', label: 'Curious about you', research: 'Asks questions, remembers what you share, follows up. You feel seen.' },
      { id: 'supports-growth', label: 'Supports your growth', research: 'Not threatened by your success, goals, or change. Cheers you on.' },
    ],
  },
];

// ─── FLAT LISTS (for assessment checklist) ─────────────────────────────────

export interface FlatFlag {
  type: FlagType;
  categoryId: string;
  categoryTitle: string;
  id: string;
  label: string;
}

export function getRedFlagsFlat(): FlatFlag[] {
  return RED_FLAG_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({
      type: 'red' as const,
      categoryId: cat.id,
      categoryTitle: cat.title,
      id: item.id,
      label: item.label,
    }))
  );
}

export function getGreenFlagsFlat(): FlatFlag[] {
  return GREEN_FLAG_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({
      type: 'green' as const,
      categoryId: cat.id,
      categoryTitle: cat.title,
      id: item.id,
      label: item.label,
    }))
  );
}

export function getAllFlagsFlat(): FlatFlag[] {
  return [...getRedFlagsFlat(), ...getGreenFlagsFlat()];
}
