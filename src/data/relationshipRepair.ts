/**
 * Relationship Repair Tool — Guide people through repair attempts after conflict or misunderstanding.
 * Research: healthy relationships use repair attempts (Gottman et al.).
 * Integrates with Emotion and Connection gauges.
 */

export interface RepairStep {
  id: string;
  stepNumber: number;
  title: string;
  prompt: string;
  placeholder: string;
  hint?: string;
}

export const REPAIR_STEPS: RepairStep[] = [
  {
    id: 'acknowledge',
    stepNumber: 1,
    title: 'Acknowledge the situation',
    prompt: 'In a sentence or two, name what happened from your perspective—without blame.',
    placeholder: 'e.g. "We had a disagreement about…" or "I said something that hurt you when…"',
    hint: 'Acknowledging is not admitting you were wrong. It shows you see the situation.',
  },
  {
    id: 'responsibility',
    stepNumber: 2,
    title: 'Take responsibility where appropriate',
    prompt: 'Is there a part you want to own? (Only if it feels true to you.)',
    placeholder: 'e.g. "I spoke harshly" or "I didn’t listen when you needed me to" or "I’m not sure yet"',
    hint: 'Taking responsibility doesn’t mean taking all the blame. Just your part, if any.',
  },
  {
    id: 'understanding',
    stepNumber: 3,
    title: 'Express understanding',
    prompt: 'What do you want them to know you understand about their experience?',
    placeholder: 'e.g. "That I hurt you" or "That you felt dismissed" or "That this matters to you"',
    hint: 'This helps the other person feel heard before moving forward.',
  },
  {
    id: 'ask',
    stepNumber: 4,
    title: 'Ask what would help repair things',
    prompt: 'What would you like to ask them or offer?',
    placeholder: 'e.g. "What would help?" or "Can we talk when you’re ready?" or "I’d like to understand how you experienced it"',
    hint: 'Inviting their input shows you want to repair, not just explain.',
  },
];

/** Example opening line users can adapt */
export const EXAMPLE_REPAIR_PHRASE =
  'I realize I hurt you. I’m sorry for that. I want to understand how you experienced it.';

/** Build a draft message from step answers (optional intro + their words). */
export function buildRepairDraft(answers: Record<string, string>): string {
  const parts: string[] = [];
  const ack = (answers.acknowledge || '').trim();
  const resp = (answers.responsibility || '').trim();
  const under = (answers.understanding || '').trim();
  const ask = (answers.ask || '').trim();
  if (ack) parts.push(ack.endsWith('.') ? ack : ack + '.');
  if (resp) parts.push(resp.endsWith('.') ? resp : resp + '.');
  if (under) parts.push(under.endsWith('.') ? under : under + '.');
  if (ask) parts.push(ask.endsWith('?') ? ask : ask + '.');
  return parts.join(' ');
}
