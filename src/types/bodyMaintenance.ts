/**
 * Body Maintenance — Hygiene & self-care tracker.
 * Routine items, service providers, frequencies, reminders.
 */

export type RoutineCategory =
  | 'hair'
  | 'nails'
  | 'skin'
  | 'oral'
  | 'bathing'
  | 'face'
  | 'environment'
  | 'wardrobe'
  | 'other';

export type FrequencyType =
  | 'daily'
  | 'every_x_days'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'every_x_months'
  | 'quarterly'
  | 'yearly';

export interface Frequency {
  type: FrequencyType;
  value?: number;
  daysOfWeek?: number[];
}

export interface RoutineItem {
  id: string;
  userId: string;
  category: RoutineCategory;
  name: string;
  emoji?: string;
  frequency: Frequency;
  customFrequencyDays?: number;
  lastCompleted?: string;
  nextDue?: string;
  streak?: number;
  reminderEnabled: boolean;
  reminderTime?: string;
  addToCalendar: boolean;
  calendarId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProviderType =
  | 'hair'
  | 'nails'
  | 'spa'
  | 'dentist'
  | 'brows'
  | 'skincare'
  | 'tailor'
  | 'cleaning'
  | 'other';

export type PaymentMethodType =
  | 'cash'
  | 'card'
  | 'zelle'
  | 'venmo'
  | 'paypal'
  | 'cashapp'
  | 'applepay'
  | 'other';

export interface PaymentMethod {
  type: PaymentMethodType;
  details?: string;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  type: ProviderType;
  businessName: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  website?: string;
  bookingUrl?: string;
  paymentMethods: PaymentMethod[];
  typicalCost?: string;
  frequency?: Frequency;
  lastVisit?: string;
  nextDue?: string;
  reminderEnabled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  completedAt: string;
  notes?: string;
}

export const ROUTINE_CATEGORY_LABELS: Record<RoutineCategory, string> = {
  hair: 'Hair',
  nails: 'Nails',
  skin: 'Skin',
  oral: 'Oral',
  bathing: 'Bathing',
  face: 'Face',
  environment: 'Environment',
  wardrobe: 'Wardrobe',
  other: 'Other',
};

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  hair: 'Hair',
  nails: 'Nails',
  spa: 'Spa',
  dentist: 'Dentist',
  brows: 'Brows',
  skincare: 'Skincare',
  tailor: 'Tailor',
  cleaning: 'Cleaning',
  other: 'Other',
};
