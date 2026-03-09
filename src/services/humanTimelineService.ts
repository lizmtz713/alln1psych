/**
 * Human Timeline — Unified life stream from narrative identity research.
 * Aggregates: check-ins/mood, connection moments, insights, journal, relationship events.
 * Not social media. A personal life record that connects Cockpit, Signals, Tools, Manual, Me.
 */

import { formatTimelineDate } from './timelineEngine';

export type HumanTimelineEventType =
  | 'connection'
  | 'mood'
  | 'insight'
  | 'journal'
  | 'relationship'
  | 'conversation';

export interface HumanTimelineEvent {
  id: string;
  date: Date;
  type: HumanTimelineEventType;
  label: string;
  sublabel?: string;
  /** Optional deep link or context */
  payload?: { route?: string; memberId?: string; summaryId?: string };
}

export interface HumanTimelineInput {
  /** From circleStore.moodHistory (or DB) — use timestamp or createdAt */
  moodHistory: Array<{ id: string; mood?: string; mood_label?: string; label?: string; note?: string | null; createdAt?: Date; timestamp?: Date }>;
  /** From circleStore.members (for names) */
  members: Array<{ id: string; name: string }>;
  /** From lightsStore: connection log per member */
  connectionLogByMemberId: Record<string, Array<{ id: string; date: Date | string; type: string; note?: string }>>;
  /** From lightsStore: stored timeline events per member */
  timelineEventsByMemberId: Record<string, Array<{ id: string; dateIso: string; type: string; note?: string }>>;
  /** From conversationSummaryStore.getSummaries() */
  conversationSummaries: Array<{ id: string; title?: string; createdAt: Date | string }>;
  /** From journalStore.entries */
  journalEntries: Array<{ id: string; content: string; createdAt: Date }>;
  /** From cockpitStore: last check-in date (YYYY-MM-DD) for "checked in today" style line if desired */
  lastCheckInDate?: string | null;
}

const MAX_EVENTS = 100;

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function connectionTypeToLabel(type: string, isMindMail?: boolean): string {
  if (type === 'mind-mail' || isMindMail) return 'Transmitted encouragement to';
  if (type === 'text') return 'Message to';
  if (type === 'call') return 'Call with';
  if (type === 'video' || type === 'in-person' || type === 'social') return 'Met with';
  return 'Contact with';
}

/**
 * Build a single chronological stream of human timeline events from all sources.
 * Newest first. Grouped by date for display (caller can use formatTimelineDate).
 */
export function buildHumanTimeline(input: HumanTimelineInput): HumanTimelineEvent[] {
  const events: HumanTimelineEvent[] = [];
  const seen = new Set<string>();

  // —— Mood / check-in history ——
  for (const m of input.moodHistory) {
    const date = m.timestamp ?? m.createdAt ?? new Date(0);
    if (isNaN(date.getTime())) continue;
    const id = `mood-${m.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const moodLabel = m.mood_label ?? m.label ?? m.mood ?? '';
    const label = moodLabel ? `Check-in — ${moodLabel}` : 'Check-in';
    events.push({
      id,
      date: toDate(date),
      type: 'mood',
      label,
      sublabel: m.note ?? undefined,
    });
  }

  // —— Connection log (all members) ——
  for (const member of input.members) {
    const log = input.connectionLogByMemberId[member.id] ?? [];
    for (const entry of log) {
      const date = toDate(entry.date);
      if (isNaN(date.getTime())) continue;
      const id = `conn-${entry.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const actionLabel = connectionTypeToLabel(entry.type, entry.type === 'mind-mail');
      events.push({
        id,
        date,
        type: 'connection',
        label: `${actionLabel} ${member.name}`,
        sublabel: entry.note ?? undefined,
        payload: { memberId: member.id },
      });
    }
  }

  // —— Stored timeline events (season change, milestone, etc.) ——
  for (const member of input.members) {
    const stored = input.timelineEventsByMemberId[member.id] ?? [];
    for (const e of stored) {
      const date = new Date(e.dateIso);
      if (isNaN(date.getTime())) continue;
      const id = `te-${e.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const label = e.note?.trim() ? e.note : (e.type === 'season_change' ? `Relationship with ${member.name} — season change` : e.type === 'milestone' ? `Milestone with ${member.name}` : `${member.name}`);
      events.push({
        id,
        date,
        type: 'relationship',
        label,
        payload: { memberId: member.id },
      });
    }
  }

  // —— Conversation summaries ——
  for (const s of input.conversationSummaries) {
    const date = toDate(s.createdAt);
    if (isNaN(date.getTime())) continue;
    const id = `conv-${s.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    events.push({
      id,
      date,
      type: 'conversation',
      label: s.title ? `Conversation: ${s.title}` : 'Conversation with Gauge',
      payload: { summaryId: s.id },
    });
  }

  // —— Journal entries ——
  for (const j of input.journalEntries) {
    const date = j.createdAt instanceof Date ? j.createdAt : new Date(j.createdAt as unknown as string);
    if (isNaN(date.getTime())) continue;
    const id = `journal-${j.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const preview = j.content.length > 40 ? j.content.slice(0, 40).trim() + '…' : j.content;
    events.push({
      id,
      date,
      type: 'journal',
      label: 'Journal',
      sublabel: preview || undefined,
    });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return events.slice(0, MAX_EVENTS);
}

/** Group events by date label for sectioned UI (Today, Yesterday, 3 days ago, ...). */
export function groupTimelineByDate(events: HumanTimelineEvent[]): Array<{ dateLabel: string; dateKey: string; events: HumanTimelineEvent[] }> {
  const byDay = new Map<string, HumanTimelineEvent[]>();
  for (const e of events) {
    const dateKey = e.date.toISOString().slice(0, 10);
    if (!byDay.has(dateKey)) byDay.set(dateKey, []);
    byDay.get(dateKey)!.push(e);
  }
  const sortedKeys = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
  return sortedKeys.map((dateKey) => {
    const dayEvents = byDay.get(dateKey)!;
    const firstDate = dayEvents[0]?.date ?? new Date(dateKey);
    return {
      dateKey,
      dateLabel: formatTimelineDate(firstDate),
      events: dayEvents,
    };
  });
}
