/**
 * Relationship Timeline Engine
 *
 * Builds a chronological history of connection events from connection log
 * and stored timeline events (reconnection, milestone, etc.). Used in Person Detail Sheet.
 * Timeline feels like highlights, not a full log — same-day events are grouped.
 */

import type { Light } from '../types/lights';
import type { ConnectionEntry } from '../types/lights';
import type { TimelineDisplayItem, TimelineEventType } from '../types/timeline';

const MAX_TIMELINE_ITEMS = 12;

/** Normalize to start of day (UTC date key for grouping) */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function connectionTypeToTimelineType(entry: ConnectionEntry): TimelineEventType {
  switch (entry.type) {
    case 'mind-mail':
    case 'text':
      return 'message_sent';
    case 'call':
      return 'call';
    case 'video':
    case 'in-person':
    case 'social':
      return 'meeting';
    default:
      return 'message_sent';
  }
}

function timelineTypeToLabel(type: TimelineEventType, entry?: ConnectionEntry): string {
  switch (type) {
    case 'message_sent':
      return entry?.type === 'mind-mail' ? 'Sent encouragement' : 'Message';
    case 'call':
      return 'Call';
    case 'meeting':
      return entry?.type === 'in-person' ? 'In person' : entry?.type === 'video' ? 'Video call' : 'Met up';
    case 'celebration':
      return 'Celebration';
    case 'repair':
      return 'Repair';
    case 'milestone':
      return 'Milestone';
    case 'season_change':
      return 'Season change';
    case 'reconnection':
      return 'Reconnected after a long quiet period';
    default:
      return 'Contact';
  }
}

function sublabelForEntry(entry: ConnectionEntry): string | undefined {
  if (entry.type === 'call' && entry.duration != null) return `${entry.duration} min`;
  if (entry.note && entry.note.length <= 40) return entry.note;
  return undefined;
}

/** Format date for timeline: "Today", "3 weeks ago", "Jan 2026", "Oct 2025" */
export function formatTimelineDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Build timeline display items from light's connection log + stored timeline events.
 * Same-day events are grouped into one row (e.g. "Today — 3 interactions"). Newest first.
 * Optional relationshipOrigin adds "You met" as first memory. Capped at MAX_TIMELINE_ITEMS.
 */
export function buildTimelineFromLight(light: Light): TimelineDisplayItem[] {
  const log = light.connectionLog ?? [];
  const stored = light.timelineEvents ?? [];

  const raw: TimelineDisplayItem[] = [
    ...log.map((entry) => {
      const date = entry.date instanceof Date ? entry.date : new Date(entry.date as string);
      const type = connectionTypeToTimelineType(entry);
      return {
        id: entry.id,
        date,
        type,
        label: timelineTypeToLabel(type, entry),
        sublabel: sublabelForEntry(entry),
      };
    }),
    ...stored.map((e) => {
      const date = new Date(e.dateIso);
      return {
        id: e.id,
        date,
        type: e.type as TimelineEventType,
        label: e.note ?? timelineTypeToLabel(e.type as TimelineEventType),
        sublabel: e.durationMinutes != null ? `${e.durationMinutes} min` : undefined,
      };
    }),
  ];

  if (light.relationshipOrigin?.year) {
    raw.push({
      id: `origin-${light.id}`,
      date: new Date(light.relationshipOrigin.year, 0, 1),
      type: 'milestone',
      label: light.relationshipOrigin.note?.trim() ? light.relationshipOrigin.note : 'You met',
      sublabel: undefined,
    });
  }

  raw.sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped: TimelineDisplayItem[] = [];
  const byDay = new Map<string, TimelineDisplayItem[]>();
  for (const item of raw) {
    const key = dayKey(item.date);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(item);
  }
  const sortedDays = [...byDay.entries()].sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
  for (const [, dayItems] of sortedDays) {
    if (dayItems.length === 1) {
      grouped.push(dayItems[0]);
    } else {
      grouped.push({
        id: dayItems[0].id + '-group',
        date: dayItems[0].date,
        type: dayItems[0].type,
        label: `${dayItems.length} interactions`,
        sublabel: undefined,
        count: dayItems.length,
      });
    }
    if (grouped.length >= MAX_TIMELINE_ITEMS) break;
  }
  return grouped;
}

/**
 * Story-based nudge for Hero: "You haven't talked with [name] since [last event]."
 * Returns null if no timeline or last event is today.
 */
export function getHeroTimelineHint(light: Light): string | null {
  const items = buildTimelineFromLight(light);
  const last = items[0];
  if (!last) return null;
  const today = dayKey(new Date());
  if (dayKey(last.date) === today) return null;
  const when = last.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const eventLabel = last.count && last.count > 1 ? 'your last contact' : last.label.toLowerCase();
  return `You haven't talked with ${light.name} since ${eventLabel} in ${when}.`;
}

/**
 * Short summary for Constellation tooltip: "Last interaction: 3 weeks ago"
 */
export function getLastInteractionSummary(light: Light): string {
  const items = buildTimelineFromLight(light);
  const last = items[0];
  if (!last) return `Last contact: ${light.daysSinceContact} days ago`;
  const rel = formatTimelineDate(last.date);
  if (last.count && last.count > 1) return `Last interaction: ${rel} (${last.count} that day)`;
  return `Last interaction: ${rel} — ${last.label}`;
}
