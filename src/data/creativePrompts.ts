/**
 * Creativity Tool — 50+ prompts in 4 categories.
 */

import type { CreativePrompt, CreativePromptCategory } from '../types/creativity';

function prompt(id: string, category: CreativePromptCategory, text: string, hint?: string): CreativePrompt {
  return { id, category, text, hint };
}

const WRITING: CreativePrompt[] = [
  prompt('w1', 'writing', 'Write from the perspective of an object in the room.', 'What does it notice? Want?'),
  prompt('w2', 'writing', 'Describe a place you love in exactly 50 words.'),
  prompt('w3', 'writing', 'Start with: "The last time I felt truly surprised..."'),
  prompt('w4', 'writing', 'Write a letter to your past self from one year ago.'),
  prompt('w5', 'writing', 'A character has 24 hours to fix one mistake. What do they do?'),
  prompt('w6', 'writing', 'Write the first paragraph of a story you will never finish.'),
  prompt('w7', 'writing', 'Describe a meal so someone can taste it without eating it.'),
  prompt('w8', 'writing', 'Two people in a waiting room. One is lying. Write the scene.'),
  prompt('w9', 'writing', 'Start with: "Nobody knew that..."'),
  prompt('w10', 'writing', 'Write a dialogue where each line is a question.'),
  prompt('w11', 'writing', 'Describe your current mood as a weather system.'),
  prompt('w12', 'writing', 'A letter from the future — from you to you, 10 years from now.'),
  prompt('w13', 'writing', 'Write the same moment in three different tones: hopeful, bleak, absurd.'),
  prompt('w14', 'writing', 'Someone finds a key. What does it unlock?'),
  prompt('w15', 'writing', 'Start with: "The instruction manual said..."'),
];

const THINKING: CreativePrompt[] = [
  prompt('t1', 'thinking', 'What would you do if you had one hour of guaranteed no interruption?'),
  prompt('t2', 'thinking', 'List 10 questions you don’t know the answer to.'),
  prompt('t3', 'thinking', 'What’s a belief you held strongly that has changed?'),
  prompt('t4', 'thinking', 'If your life were a book, what would the next chapter title be?'),
  prompt('t5', 'thinking', 'What’s something you’re good at that you didn’t set out to learn?'),
  prompt('t6', 'thinking', 'Describe a problem in your life as if it were a puzzle. What’s one piece?'),
  prompt('t7', 'thinking', 'What would your opposite do in your situation?'),
  prompt('t8', 'thinking', 'What’s a rule you follow that you’ve never questioned?'),
  prompt('t9', 'thinking', 'If you could only keep three memories, which would they be?'),
  prompt('t10', 'thinking', 'What’s a small win you had this week that nobody saw?'),
  prompt('t11', 'thinking', 'What would you try if you knew you couldn’t fail publicly?'),
  prompt('t12', 'thinking', 'Who do you admire and what one trait do you want to borrow?'),
  prompt('t13', 'thinking', 'What’s a question you’re afraid to ask yourself?'),
  prompt('t14', 'thinking', 'If you could add one ritual to your day, what would it be?'),
  prompt('t15', 'thinking', 'What are you not saying that wants to be said?'),
];

const VISUAL: CreativePrompt[] = [
  prompt('v1', 'visual', 'Describe a color without naming it.'),
  prompt('v2', 'visual', 'Close your eyes. What’s the first image that appears? Describe it.'),
  prompt('v3', 'visual', 'If your mood had a shape and a texture, what would they be?'),
  prompt('v4', 'visual', 'Describe the room you’re in as a stranger would see it for the first time.'),
  prompt('v5', 'visual', 'Picture a door. What’s on the other side?'),
  prompt('v6', 'visual', 'Describe a sound as a shape.'),
  prompt('v7', 'visual', 'What does "home" look like in one image?'),
  prompt('v8', 'visual', 'If your mind were a landscape, what would it be right now?'),
  prompt('v9', 'visual', 'Describe a person you love using only objects and places.'),
  prompt('v10', 'visual', 'What would a map of your day look like?'),
  prompt('v11', 'visual', 'Describe light in this moment — where it comes from, how it falls.'),
  prompt('v12', 'visual', 'If you could freeze one moment from this week, which frame would it be?'),
  prompt('v13', 'visual', 'What’s a smell that carries a memory? Describe the memory in images.'),
  prompt('v14', 'visual', 'Draw with words: a path you walk often, turn by turn.'),
  prompt('v15', 'visual', 'What does "enough" look like?'),
];

const CONSTRAINT: CreativePrompt[] = [
  prompt('c1', 'constraint', 'Write a story in 6 words.'),
  prompt('c2', 'constraint', 'Explain something complex using only 10 one-syllable words.'),
  prompt('c3', 'constraint', 'Write a haiku about something that annoyed you today.'),
  prompt('c4', 'constraint', 'List 5 things you can do in the next 5 minutes.'),
  prompt('c5', 'constraint', 'Describe yourself in 3 emoji. Then one sentence.'),
  prompt('c6', 'constraint', 'Write a headline for today.'),
  prompt('c7', 'constraint', 'One sentence that could change someone’s mind.'),
  prompt('c8', 'constraint', 'Complete this in 20 words or fewer: "I wish I had..."'),
  prompt('c9', 'constraint', 'Write instructions for a simple task as if for an alien.'),
  prompt('c10', 'constraint', 'Describe your ideal day in 5 bullets.'),
  prompt('c11', 'constraint', 'One word that describes this week. Then one sentence why.'),
  prompt('c12', 'constraint', 'Rewrite a recent worry as a single question.'),
  prompt('c13', 'constraint', 'Your life motto in 8 words or fewer.'),
  prompt('c14', 'constraint', 'A thank-you note in 3 sentences.'),
  prompt('c15', 'constraint', 'Finish this in 15 words: "The thing I keep forgetting is..."'),
];

export const CREATIVE_PROMPTS: CreativePrompt[] = [...WRITING, ...THINKING, ...VISUAL, ...CONSTRAINT];

export const CREATIVE_PROMPT_CATEGORIES: { id: CreativePromptCategory; label: string; emoji: string }[] = [
  { id: 'writing', label: 'Writing', emoji: '✍️' },
  { id: 'thinking', label: 'Thinking', emoji: '💭' },
  { id: 'visual', label: 'Visual', emoji: '👁️' },
  { id: 'constraint', label: 'Constraint', emoji: '🎯' },
];

export function getPromptById(id: string): CreativePrompt | undefined {
  return CREATIVE_PROMPTS.find((p) => p.id === id);
}

export function getPromptsByCategory(category: CreativePromptCategory): CreativePrompt[] {
  return CREATIVE_PROMPTS.filter((p) => p.category === category);
}

/** Deterministic "daily" prompt index from date string (YYYY-MM-DD) */
export function getDailyPromptIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayOfYear = (new Date(y, m - 1, d).getTime() - new Date(y, 0, 0).getTime()) / 86400000;
  return dayOfYear % CREATIVE_PROMPTS.length;
}

export function getDailyPrompt(dateStr: string): CreativePrompt {
  const index = getDailyPromptIndex(dateStr);
  return CREATIVE_PROMPTS[index];
}
