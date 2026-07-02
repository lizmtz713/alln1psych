/**
 * Relationship Repair micro-lessons (MVP).
 * Each: 3–5 cards, 1 example, 1 action, CTA to a tool.
 */

export interface RepairLessonCard {
  text: string;
}

export interface RepairLesson {
  id: string;
  title: string;
  cards: RepairLessonCard[];
  example: string;
  action: string;
  toolCta: { label: string; route: string };
}

export const RELATIONSHIP_REPAIR_LESSONS: RepairLesson[] = [
  {
    id: 'defensiveness',
    title: 'Why defensiveness makes conflict worse',
    cards: [
      { text: 'When we get defensive, we send a message: "I\'m not the problem." The other person feels dismissed.' },
      { text: 'Defensiveness blocks repair. The brain goes into protect mode instead of listen mode.' },
      { text: 'You don\'t have to agree. You can say "I hear you" before explaining your side.' },
    ],
    example: 'Instead of "That\'s not what I meant," try "I can see how it came across that way."',
    action: 'Next time you feel defensive, pause. Say one thing that shows you heard them before you respond.',
    toolCta: { label: 'Repair Builder', route: '/tools/repair' },
  },
  {
    id: 'apologize',
    title: 'How to apologize properly',
    cards: [
      { text: 'A good apology names what you did and how it might have landed. No "but" or "you made me."' },
      { text: ''I\'m sorry you felt that way" is not a real apology. "I\'m sorry I said X" is.' },
      { text: 'After you apologize, give them space. Repair is a gift; they don\'t have to accept it on your timeline.' },
    ],
    example: ''I\'m sorry I snapped. That wasn\'t fair to you. I was stressed and I took it out on you."',
    action: 'Think of one thing you could own in a recent conflict. Say it out loud once, just to practice.',
    toolCta: { label: 'Role Play', route: '/(modals)/role-play' },
  },
  {
    id: 'validate',
    title: 'How to validate someone',
    cards: [
      { text: 'Validation doesn\'t mean you agree. It means you show you understand their experience.' },
      { text: 'You can validate feelings without validating behavior. "I get that you\'re angry" is not "You were right to yell."' },
      { text: 'Validation often softens the other person. They feel heard, so they’re less likely to escalate.' },
    ],
    example: ''That makes sense. I’d be frustrated too if I felt like I wasn’t being heard."',
    action: 'Next conflict, lead with one validating sentence before you explain or ask for anything.',
    toolCta: { label: 'Tone Check', route: '/tools/tone-check' },
  },
  {
    id: 'start-hard-convo',
    title: 'How to start a difficult conversation',
    cards: [
      { text: 'Name the topic and your intent. "I want to talk about X. I’m not trying to blame you—I want to understand."' },
      { text: 'Pick a time when you’re both calm. "Can we talk when we have a few minutes?"' },
      { text: 'One topic at a time. Don’t pile on old grievances.' },
    ],
    example: ''There’s something I’ve been wanting to bring up. Can we talk about it when you have a minute?"',
    action: 'Script one opening line for a conversation you’ve been avoiding. Say it out loud once.',
    toolCta: { label: 'Role Play', route: '/(modals)/role-play' },
  },
  {
    id: 'repair-after-fight',
    title: 'How to repair after a fight',
    cards: [
      { text: 'Repair works best when both people have cooled down. A short, sincere message often opens the door.' },
      { text: 'Focus on your part. "I didn’t mean to dismiss you" lands better than "You always overreact."' },
      { text: 'Invite the next step. "I’d like to talk when you’re ready" gives them agency.' },
    ],
    example: ''I don’t want to leave things like this. I care about you. Can we talk when you’re ready?"',
    action: 'Use After the Fight to reflect, then send one short message (or practice it in Role Play first).',
    toolCta: { label: 'After the Fight', route: '/tools/after-fight' },
  },
  {
    id: 'compromise',
    title: 'How to compromise without resentment',
    cards: [
      { text: 'Compromise doesn’t mean someone wins and someone loses. Look for a third option.' },
      { text: 'If you give in and stay bitter, it’s not a real compromise. Say what you need so you can find a middle ground.' },
      { text: ''What would make this work for both of us?" is a repair question.' },
    ],
    example: ''I hear what you need. Here’s what I need. Can we find something that works for both?"',
    action: 'In your next disagreement, ask one "both of us" question before pushing your solution.',
    toolCta: { label: 'Repair Builder', route: '/tools/repair' },
  },
];
