/**
 * Body Maintenance Schedule — default categories and items.
 * Like a car service schedule for the human body. All frequencies are editable by the user.
 * Typical guidelines only; not medical advice.
 */

export type IntervalUnit = 'days' | 'weeks' | 'months' | 'years';

export interface MaintenanceInterval {
  value: number;
  unit: IntervalUnit;
}

export interface MaintenanceItemDef {
  id: string;
  label: string;
  /** Default frequency; user can override in store. */
  defaultInterval: MaintenanceInterval;
  /** e.g. "once per year" for display when not customized */
  defaultLabel?: string;
}

export interface MaintenanceCategoryDef {
  id: string;
  title: string;
  emoji: string;
  items: MaintenanceItemDef[];
}

/** Default categories and items. User completions and custom frequencies live in bodyMaintenanceStore. */
export const BODY_MAINTENANCE_CATEGORIES: MaintenanceCategoryDef[] = [
  {
    id: 'health',
    title: 'Health',
    emoji: '🩺',
    items: [
      { id: 'health-doctor', label: 'Doctor / primary care', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'once per year' },
      { id: 'health-eye', label: 'Eye exam', defaultInterval: { value: 2, unit: 'years' }, defaultLabel: 'every 1–2 years' },
      { id: 'health-blood', label: 'Blood work', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'yearly or as advised' },
      { id: 'health-vaccinations', label: 'Vaccinations', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'varies by age' },
      { id: 'health-mental', label: 'Mental health check-in', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'as needed' },
    ],
  },
  {
    id: 'dental',
    title: 'Dental',
    emoji: '🦷',
    items: [
      { id: 'dental-cleaning', label: 'Dental cleaning', defaultInterval: { value: 6, unit: 'months' }, defaultLabel: 'every 6 months' },
      { id: 'dental-ortho', label: 'Orthodontist check', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'if needed' },
    ],
  },
  {
    id: 'grooming',
    title: 'Grooming / appearance',
    emoji: '✂️',
    items: [
      { id: 'grooming-haircut', label: 'Haircut', defaultInterval: { value: 8, unit: 'weeks' }, defaultLabel: 'every 6–12 weeks' },
      { id: 'grooming-eyebrows', label: 'Eyebrows', defaultInterval: { value: 3, unit: 'weeks' }, defaultLabel: 'every 2–4 weeks' },
      { id: 'grooming-nails', label: 'Nails', defaultInterval: { value: 3, unit: 'weeks' }, defaultLabel: 'every 3–4 weeks' },
      { id: 'grooming-shaving', label: 'Shaving / grooming', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: 'personal preference' },
    ],
  },
  {
    id: 'skin',
    title: 'Skin',
    emoji: '✨',
    items: [
      { id: 'skin-derm', label: 'Dermatology check', defaultInterval: { value: 1, unit: 'years' }, defaultLabel: 'yearly' },
      { id: 'skin-routine', label: 'Skin care routine', defaultInterval: { value: 1, unit: 'days' }, defaultLabel: 'daily' },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    emoji: '🏃',
    items: [
      { id: 'movement-goal', label: 'Movement goal', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: '150 min moderate or 75 min intense per week' },
    ],
  },
  {
    id: 'recovery',
    title: 'Recovery',
    emoji: '😴',
    items: [
      { id: 'recovery-sleep', label: 'Sleep (7–9 hrs)', defaultInterval: { value: 1, unit: 'days' }, defaultLabel: 'nightly' },
      { id: 'recovery-rest-day', label: 'Rest day', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: 'weekly' },
    ],
  },
  {
    id: 'mental-emotional',
    title: 'Mental / emotional care',
    emoji: '💭',
    items: [
      { id: 'mental-journal', label: 'Reflection / journaling', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: 'weekly' },
      { id: 'mental-friend', label: 'Friend check-in', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: 'weekly' },
      { id: 'mental-nature', label: 'Nature time', defaultInterval: { value: 1, unit: 'weeks' }, defaultLabel: 'weekly' },
    ],
  },
];

export function getMaintenanceItemById(itemId: string): MaintenanceItemDef | undefined {
  for (const cat of BODY_MAINTENANCE_CATEGORIES) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}

export function getMaintenanceCategoryById(categoryId: string): MaintenanceCategoryDef | undefined {
  return BODY_MAINTENANCE_CATEGORIES.find((c) => c.id === categoryId);
}
