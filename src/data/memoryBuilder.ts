/**
 * Memory Builder — Names & faces. Science-based: attention, association, spaced recall.
 * Tips and learning content for the tool.
 */

export const MEMORY_TIPS = [
  { id: 'attention', title: 'Pay attention when you hear the name', body: 'Most people forget because they were distracted. Look at the person and listen when they say their name.' },
  { id: 'repeat', title: 'Repeat the name', body: 'Say it back: "Nice to meet you, Alex." Repetition strengthens encoding.' },
  { id: 'use', title: 'Use the name in conversation', body: 'Example: "So Alex, how did you get into that work?" Using the name once or twice helps lock it in.' },
  { id: 'connect', title: 'Connect the name to something familiar', body: 'Example: Maria → reminds me of my cousin Maria. Linking to existing memory networks improves recall.' },
  { id: 'visualize', title: 'Visualize the name', body: 'Create a mental image. Example: Mr. Green → imagine him wearing green. The brain remembers images better than abstract words.' },
];

export const MEMORY_LEARN_MORE = [
  { id: 'why-forget', title: 'Why humans forget names', body: 'Names are arbitrary labels with few connections to other memories. We often don\'t pay full attention when we hear them. Encoding happens in the moment—so the first few seconds matter.' },
  { id: 'encoding', title: 'How memory encoding works', body: 'Information goes from short-term to long-term memory when we pay attention, link it to existing knowledge, and rehearse or recall it. Association and repetition strengthen the trace.' },
  { id: 'spacing', title: 'The spacing effect', body: 'Revisiting information after gaps (1 hour, 1 day, 1 week) improves long-term retention more than cramming. Spaced recall is one of the most effective memory techniques.' },
  { id: 'faces', title: 'Face recognition science', body: 'We encode faces by distinctive features (eyes, hair, face shape). Noticing one clear feature—glasses, smile, hair—and linking it to the name improves recognition and recall.' },
];

/** Suggested distinctive features for face anchor (user can pick or add their own) */
export const DISTINCTIVE_FEATURES = [
  'glasses',
  'curly hair',
  'dimples',
  'beard',
  'smile',
  'freckles',
  'hair color',
  'eyebrows',
  'nose',
  'earrings',
];

/** Generate a simple association suggestion from name + detail (mnemonic hook) */
export function suggestAssociation(name: string, detail: string): string {
  const n = name.trim().split(/\s+/)[0] || name;
  if (!detail.trim()) return `${n} — add a detail to get a memory hook`;
  const d = detail.trim().toLowerCase();
  const firstWord = d.split(/\s+/)[0] || d;
  const cap = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);
  return `${cap(firstWord)} ${n}`;
}
