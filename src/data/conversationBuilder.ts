/**
 * Conversation Builder — Observe → Feel → Need → Request (NVC-style).
 * Turns messy emotions into a clear, respectful message. Signature MVP tool.
 */

export const WHAT_HAPPENED_OPTIONS = [
  { id: 'ignored_message', label: 'They ignored my message' },
  { id: 'canceled_plans', label: 'They canceled plans' },
  { id: 'argument', label: 'We had an argument' },
  { id: 'i_said_wrong', label: 'I said something wrong' },
  { id: 'they_said_hurtful', label: 'They said something hurtful' },
  { id: 'dismissed', label: 'I felt dismissed' },
  { id: 'no_show', label: 'They didn\'t show up' },
  { id: 'other', label: 'Something else' },
] as const;

export const FEEL_OPTIONS = [
  { id: 'hurt', label: 'Hurt' },
  { id: 'frustrated', label: 'Frustrated' },
  { id: 'embarrassed', label: 'Embarrassed' },
  { id: 'ignored', label: 'Ignored' },
  { id: 'disappointed', label: 'Disappointed' },
  { id: 'confused', label: 'Confused' },
  { id: 'angry', label: 'Angry' },
  { id: 'sad', label: 'Sad' },
  { id: 'anxious', label: 'Anxious' },
] as const;

export const NEED_OPTIONS = [
  { id: 'respect', label: 'Respect' },
  { id: 'attention', label: 'Attention' },
  { id: 'understanding', label: 'Understanding' },
  { id: 'support', label: 'Support' },
  { id: 'clarity', label: 'Clarity' },
  { id: 'time', label: 'Time' },
  { id: 'connection', label: 'Connection' },
  { id: 'honesty', label: 'Honesty' },
  { id: 'space', label: 'Space' },
] as const;

export const WANT_NOW_OPTIONS = [
  { id: 'apology', label: 'An apology', requestPhrase: 'talk about what happened so we can clear the air' },
  { id: 'conversation', label: 'A conversation', requestPhrase: 'talk about it' },
  { id: 'more_effort', label: 'More effort', requestPhrase: 'find a way to make this work together' },
  { id: 'reset', label: 'A reset', requestPhrase: 'start fresh' },
  { id: 'boundary', label: 'A boundary', requestPhrase: 'agree on what works for both of us' },
  { id: 'acknowledgment', label: 'To be heard', requestPhrase: 'take a few minutes to hear each other out' },
  { id: 'next_steps', label: 'Clear next steps', requestPhrase: 'figure out the next steps together' },
  { id: 'other', label: 'Something else', requestPhrase: 'talk about it' },
] as const;

/** Build a clear message from the 4 steps. Template-based for MVP (works without API). */
export function buildConversationMessage(
  observe: string,
  feel: string,
  need: string,
  requestPhraseOrLabel: string
): string {
  const o = observe.trim();
  const f = feel.trim();
  const n = need.trim();
  const r = requestPhraseOrLabel.trim();
  if (!o || !f) return '';

  const observationPhrase = o.toLowerCase().startsWith('when ') || o.toLowerCase().startsWith('you ')
    ? o
    : `when ${o}`;
  const observation = observationPhrase.endsWith('.') ? observationPhrase.slice(0, -1) : observationPhrase;

  const feelPhrase = `I felt ${f.toLowerCase()}`;
  const needPhrase = n ? ` because I needed ${n.toLowerCase()}` : '';
  const req = r
    ? (r.toLowerCase().startsWith('could we') || r.toLowerCase().startsWith('can we') || r.toLowerCase().startsWith('i\'d like') || r.endsWith('?'))
      ? r
      : `Could we ${r.toLowerCase()}?`
    : 'Could we talk about it?';

  return `${capitalize(observation)},\n${feelPhrase}${needPhrase}.\n${req}`.trim();
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
