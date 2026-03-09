/**
 * Memory Engine — "Your app remembers moments"
 * Birthday reminders, last time you saw someone, CTAs to reconnect.
 */

import type { Light } from '../types/lights';

export interface BirthdayReminder {
  light: Light;
  daysUntil: number;
  label: string;
}

/** Parse birthday string (MM-DD, YYYY-MM-DD, or month name) to month/day. */
function parseBirthday(birthday: string | undefined): { month: number; day: number } | null {
  if (!birthday || !birthday.trim()) return null;
  const s = birthday.trim();
  const match = s.match(/^(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return { month, day };
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const month = parseInt(iso[2], 10);
    const day = parseInt(iso[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return { month, day };
  }
  return null;
}

/** Days until next occurrence of month/day (0 = today). */
function daysUntil(month: number, day: number): number {
  const now = new Date();
  let next = new Date(now.getFullYear(), month - 1, day);
  if (next.getTime() < now.getTime()) {
    next = new Date(now.getFullYear() + 1, month - 1, day);
  }
  const diff = next.getTime() - now.getTime();
  return Math.floor(diff / 86400000);
}

export function getBirthdayReminders(lights: Light[], withinDays: number = 14): BirthdayReminder[] {
  const out: BirthdayReminder[] = [];
  for (const light of lights) {
    if (!light.birthday) continue;
    const parsed = parseBirthday(light.birthday);
    if (!parsed) continue;
    const d = daysUntil(parsed.month, parsed.day);
    if (d < 0 || d > withinDays) continue;
    const label = d === 0 ? "Today's their birthday" : d === 1 ? "Tomorrow" : `In ${d} days`;
    out.push({ light, daysUntil: d, label });
  }
  out.sort((a, b) => a.daysUntil - b.daysUntil);
  return out;
}

export interface LastTimeMoment {
  light: Light;
  lastDate: Date;
  lastActivities: string[];
  daysAgo: number;
}

/** Last in-person or meaningful contact: build "Last time you: X, Y" from connection log. */
export function getLastTimeMoments(lights: Light[], minDaysAgo: number = 21, maxItems: number = 3): LastTimeMoment[] {
  const now = new Date();
  const out: LastTimeMoment[] = [];

  for (const light of lights) {
    if (light.tier === 'archived' || !light.connectionLog?.length) continue;
    const sorted = [...light.connectionLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const last = sorted[0];
    const lastDate = new Date(last.date);
    const diffMs = now.getTime() - lastDate.getTime();
    const daysAgo = Math.floor(diffMs / 86400000);
    if (daysAgo < minDaysAgo) continue;

    const activities: string[] = [];
    for (const e of sorted.slice(0, 3)) {
      if (e.type === 'in-person' && e.summary) activities.push(e.summary);
      else if (e.type === 'in-person') activities.push('Got together');
      else if (e.type === 'video') activities.push('Video call');
      else if (e.type === 'call' && e.duration != null) activities.push(`${e.duration} min call`);
      else if (e.note && e.note.length <= 30) activities.push(e.note);
      else if (e.type === 'in-person' || e.type === 'social') activities.push('Hangout');
    }
    const lastActivities = [...new Set(activities)].slice(0, 3);
    out.push({ light, lastDate, lastActivities, daysAgo });
  }

  out.sort((a, b) => b.daysAgo - a.daysAgo);
  return out.slice(0, maxItems);
}
