/**
 * Repair Builder (MVP) — What happened, who with, how intense.
 * Feeds getRepairBuilderAdvice() and the /tools/repair UI.
 */

export const WHAT_HAPPENED_OPTIONS = [
  { id: 'argument', label: 'Argument' },
  { id: 'hurt_feelings', label: 'Hurt feelings' },
  { id: 'misunderstanding', label: 'Misunderstanding' },
  { id: 'i_said_wrong', label: 'I said something wrong' },
  { id: 'they_said_hurtful', label: 'They said something hurtful' },
  { id: 'ongoing', label: 'Ongoing issue' },
] as const;

export const WHO_WITH_OPTIONS = [
  { id: 'partner', label: 'Partner' },
  { id: 'friend', label: 'Friend' },
  { id: 'family', label: 'Family' },
  { id: 'coworker', label: 'Coworker' },
  { id: 'parent_child', label: 'Parent/Child' },
  { id: 'other', label: 'Other' },
] as const;

export const INTENSITY_OPTIONS = [
  { id: 'small', label: 'Small tension' },
  { id: 'medium', label: 'Medium conflict' },
  { id: 'big', label: 'Big fight' },
] as const;
