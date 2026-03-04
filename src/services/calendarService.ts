/**
 * Calendar integration for Body Maintenance (and other features).
 * Requires: npx expo install expo-calendar
 * Add to app.json plugins: ["expo-calendar", { "calendarPermission": "..." }]
 */

import type { Frequency } from '../types/bodyMaintenance';

// eslint-disable-next-line @typescript-eslint/no-require-imports
let Calendar: any = null;
try {
  Calendar = require('expo-calendar');
} catch {
  // expo-calendar not installed — all ops no-op
}

export async function requestCalendarPermissions(): Promise<boolean> {
  if (!Calendar) return false;
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function getCalendars(): Promise<Array<{ id: string; title: string; isPrimary?: boolean }>> {
  if (!Calendar) return [];
  try {
    const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return cals.map((c: { id: string; title?: string | null; isPrimary?: boolean | null }) => ({ id: c.id, title: c.title ?? c.id, isPrimary: c.isPrimary ?? false }));
  } catch {
    return [];
  }
}

function buildRecurrenceRule(frequency: Frequency): string | undefined {
  switch (frequency.type) {
    case 'daily':
      return 'FREQ=DAILY';
    case 'weekly':
      return 'FREQ=WEEKLY';
    case 'biweekly':
      return 'FREQ=WEEKLY;INTERVAL=2';
    case 'monthly':
      return 'FREQ=MONTHLY';
    case 'quarterly':
      return 'FREQ=MONTHLY;INTERVAL=3';
    case 'yearly':
      return 'FREQ=YEARLY';
    default:
      return undefined;
  }
}

export async function addBodyMaintenanceEvent(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  frequency?: Frequency;
  calendarId?: string;
  reminderMinutesBefore?: number;
}): Promise<string | null> {
  if (!Calendar) return null;
  try {
    const granted = await requestCalendarPermissions();
    if (!granted) return null;

    const calendars = await getCalendars();
    const calendarId = params.calendarId ?? calendars.find((c) => c.isPrimary)?.id ?? calendars[0]?.id;
    if (!calendarId) return null;

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: params.title,
      startDate: params.startDate,
      endDate: params.endDate,
      notes: params.notes,
      recurrenceRule: params.frequency ? buildRecurrenceRule(params.frequency) : undefined,
      alarms: params.reminderMinutesBefore != null
        ? [{ relativeOffset: -Math.abs(params.reminderMinutesBefore) }]
        : undefined,
    });
    return eventId;
  } catch (e) {
    console.warn('[calendarService] addEvent failed:', e);
    return null;
  }
}

export async function removeEvent(eventId: string): Promise<boolean> {
  if (!Calendar) return false;
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch {
    return false;
  }
}
