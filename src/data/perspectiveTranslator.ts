/**
 * Perspective Translator — Developmental language for communication.
 * Helps frame messages so they land with the other person's developmental stage and role.
 * Based on developmental psychology and communication research. No shaming or labeling.
 */

export interface TranslatorRole {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  /** What they tend to respond to (safety, respect, etc.) */
  respondsTo: string[];
}

export interface TranslatorStage {
  id: string;
  label: string;
  hint: string;
}

export interface TranslatorIntent {
  id: string;
  label: string;
  /** Example of what someone might feel like saying (direct) */
  exampleDirect: string;
}

/** Translation example: role + intent → translated phrasing and why it works */
export interface TranslationExample {
  roleId: string;
  intentId: string;
  /** Framed in developmentally appropriate language */
  translated: string;
  /** Short note: why this framing helps (no judgment of the person) */
  whyItWorks: string;
}

export const PERSPECTIVE_ROLES: TranslatorRole[] = [
  { id: 'child', label: 'Child', shortLabel: 'Child', emoji: '🧒', respondsTo: ['Safety', 'Simple cause and effect', 'Reassurance', 'Doing things together'] },
  { id: 'teen', label: 'Teen / Adolescent', shortLabel: 'Teen', emoji: '🎧', respondsTo: ['Autonomy', 'Fairness', 'Respect', 'Being heard'] },
  { id: 'parent', label: 'Parent', shortLabel: 'Parent', emoji: '👤', respondsTo: ['Respect', 'Appreciation', 'Family values', 'Being heard'] },
  { id: 'partner', label: 'Partner / Spouse', shortLabel: 'Partner', emoji: '💑', respondsTo: ['Vulnerability', 'Collaboration', 'Repair', 'Shared goals'] },
  { id: 'friend', label: 'Friend', shortLabel: 'Friend', emoji: '🤝', respondsTo: ['Honesty', 'Reciprocity', 'No judgment', 'Trust'] },
  { id: 'sibling', label: 'Sibling', shortLabel: 'Sibling', emoji: '👫', respondsTo: ['Fairness', 'Recognition', 'Shared history', 'Not being compared'] },
  { id: 'coworker', label: 'Boss / Coworker', shortLabel: 'Work', emoji: '💼', respondsTo: ['Clarity', 'Professional respect', 'Shared objectives', 'Boundaries'] },
  { id: 'elder', label: 'Elder / Older adult', shortLabel: 'Elder', emoji: '👴', respondsTo: ['Respect', 'Dignity', 'Inclusion', 'Being valued'] },
];

export const PERSPECTIVE_STAGES: TranslatorStage[] = [
  { id: 'young-child', label: 'Young child', hint: 'Simple, concrete language. Safety and feelings.' },
  { id: 'teen', label: 'Teen / Adolescent', hint: 'Autonomy and fairness. Avoid sounding dismissive.' },
  { id: 'young-adult', label: 'Young adult', hint: 'Independence and respect. Room for their view.' },
  { id: 'mature-adult', label: 'Mature adult', hint: 'Collaboration and clarity. Shared goals.' },
  { id: 'older-adult', label: 'Older adult', hint: 'Dignity and inclusion. Acknowledge experience.' },
];

export const PERSPECTIVE_INTENTS: TranslatorIntent[] = [
  { id: 'set-boundary', label: 'Set a boundary', exampleDirect: 'I need you to stop interrupting me.' },
  { id: 'repair-conflict', label: 'Repair after conflict', exampleDirect: 'You never listen to me and it\'s really frustrating.' },
  { id: 'ask-for-help', label: 'Ask for help', exampleDirect: 'I can\'t do everything by myself.' },
  { id: 'explain-feelings', label: 'Explain your feelings', exampleDirect: 'You don\'t care how I feel.' },
  { id: 'motivate', label: 'Motivate someone', exampleDirect: 'You need to try harder.' },
  { id: 'express-appreciation', label: 'Express appreciation', exampleDirect: 'Thanks, I guess.' },
  { id: 'confront-harmful', label: 'Address harmful behavior', exampleDirect: 'What you did was wrong.' },
];

/** Prewritten translations by role + intent. People often respond better to messages framed like this. */
export const TRANSLATION_EXAMPLES: TranslationExample[] = [
  // Child
  { roleId: 'child', intentId: 'set-boundary', translated: 'I need you to put the toy away so nobody gets hurt. Let\'s do it together.', whyItWorks: 'Simple cause and effect plus doing it together reduces resistance.' },
  { roleId: 'child', intentId: 'repair-conflict', translated: 'I got upset earlier. I still love you. Let\'s try again.', whyItWorks: 'Reassurance and safety first; then a fresh start.' },
  { roleId: 'child', intentId: 'explain-feelings', translated: 'When you do that, I feel worried. I want us both to be okay.', whyItWorks: 'Names your feeling without blame; invites safety.' },
  // Teen
  { roleId: 'teen', intentId: 'set-boundary', translated: 'I need to finish what I\'m saying so you can understand my point. Can we let each other finish?', whyItWorks: 'Respects their need to be heard and frames it as mutual.' },
  { roleId: 'teen', intentId: 'repair-conflict', translated: 'I know you want independence. I just want to understand what\'s going on so we can figure it out together.', whyItWorks: 'Acknowledges autonomy and fairness; invites collaboration.' },
  { roleId: 'teen', intentId: 'motivate', translated: 'I see you\'re capable of more. What would help you get there?', whyItWorks: 'Respect and agency instead of pressure.' },
  // Parent
  { roleId: 'parent', intentId: 'set-boundary', translated: 'I respect how much you care about our family. I need us to talk about this in a way where I feel heard too.', whyItWorks: 'Respect and appreciation first; then your need.' },
  { roleId: 'parent', intentId: 'repair-conflict', translated: 'I don\'t want us to be on opposite sides. I\'d like to understand your view and share mine.', whyItWorks: 'Signals connection and mutual respect.' },
  { roleId: 'parent', intentId: 'explain-feelings', translated: 'When this happens, I feel hurt. I\'m not asking you to fix it—I just need you to know.', whyItWorks: 'Clear feeling + no demand; easier to hear.' },
  // Partner
  { roleId: 'partner', intentId: 'set-boundary', translated: 'I want to finish my thought so you understand what I\'m trying to say. Can we let each other finish speaking?', whyItWorks: 'Shared goal (understanding) and a clear, gentle ask.' },
  { roleId: 'partner', intentId: 'repair-conflict', translated: 'I\'m feeling overwhelmed and I need your support. Can we figure this out together?', whyItWorks: 'Vulnerability and collaboration reduce defensiveness.' },
  { roleId: 'partner', intentId: 'ask-for-help', translated: 'I\'m struggling with this and I\'d feel better if we could tackle it as a team.', whyItWorks: 'Invites partnership instead of blame.' },
  // Friend
  { roleId: 'friend', intentId: 'set-boundary', translated: 'I value our friendship. I need to say something that\'s hard for me, and I hope you can hear it.', whyItWorks: 'Names the relationship and your intention; softens the ask.' },
  { roleId: 'friend', intentId: 'repair-conflict', translated: 'I don\'t want this to come between us. Can we talk about what happened?', whyItWorks: 'Prioritizes the relationship; opens dialogue.' },
  { roleId: 'friend', intentId: 'express-appreciation', translated: 'I really appreciate that you did that. It meant a lot to me.', whyItWorks: 'Specific and genuine; strengthens connection.' },
  // Sibling
  { roleId: 'sibling', intentId: 'set-boundary', translated: 'I need us to respect each other\'s limits. I\'ll do the same for you.', whyItWorks: 'Fairness and reciprocity.' },
  { roleId: 'sibling', intentId: 'repair-conflict', translated: 'I want us to be good. Can we clear the air?', whyItWorks: 'Short, shared goal, no blame.' },
  { roleId: 'sibling', intentId: 'explain-feelings', translated: 'When that happened, I felt left out. I\'m not saying you meant it—I just needed to say it.', whyItWorks: 'Your experience without accusing; easier to hear.' },
  // Coworker / Boss
  { roleId: 'coworker', intentId: 'set-boundary', translated: 'I want to make sure we\'re aligned. Can we each share our piece without interrupting, then decide next steps?', whyItWorks: 'Professional, clear, and goal-oriented.' },
  { roleId: 'coworker', intentId: 'ask-for-help', translated: 'I could use your input on this so we can get it right.', whyItWorks: 'Respects their role and focuses on the outcome.' },
  { roleId: 'coworker', intentId: 'confront-harmful', translated: 'What happened didn\'t work for me. I\'d like to discuss how we handle this going forward.', whyItWorks: 'Names impact, stays professional, forward-looking.' },
  // Elder
  { roleId: 'elder', intentId: 'set-boundary', translated: 'I respect your experience. I need to share how I see this and what I need.', whyItWorks: 'Respect and dignity first; then your needs.' },
  { roleId: 'elder', intentId: 'repair-conflict', translated: 'You matter to me. I don\'t want this to stand between us. Can we talk?', whyItWorks: 'Values the relationship and invites connection.' },
  { roleId: 'elder', intentId: 'ask-for-help', translated: 'I\'d value your perspective on this. Would you be willing to help?', whyItWorks: 'Acknowledges their value; clear ask.' },
];

/** Get translation example for role + intent. Falls back to a generic tip if no exact match. */
export function getTranslationExample(roleId: string, intentId: string): TranslationExample | undefined {
  return TRANSLATION_EXAMPLES.find((e) => e.roleId === roleId && e.intentId === intentId);
}

/** Get all examples for a role (for fallback or multiple suggestions). */
export function getTranslationsForRole(roleId: string): TranslationExample[] {
  return TRANSLATION_EXAMPLES.filter((e) => e.roleId === roleId);
}

/** Get role by id */
export function getRoleById(id: string): TranslatorRole | undefined {
  return PERSPECTIVE_ROLES.find((r) => r.id === id);
}

/** Get intent by id */
export function getIntentById(id: string): TranslatorIntent | undefined {
  return PERSPECTIVE_INTENTS.find((i) => i.id === id);
}
