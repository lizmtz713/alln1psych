/**
 * Relationship Timeline — Visual history of a connection.
 * Grounded in Narrative Psychology: humans understand relationships through stories over time.
 */

export type TimelineEventType =
  | 'message_sent'
  | 'call'
  | 'meeting'
  | 'celebration'
  | 'repair'
  | 'milestone'
  | 'season_change'
  | 'reconnection';

/** Stored timeline event (e.g. user-added milestone, celebration, repair) */
export interface TimelineEventEntry {
  id: string;
  dateIso: string;
  type: TimelineEventType;
  note?: string;
  durationMinutes?: number;
}

/** One item for display in the Connection Timeline UI. May represent a grouped day (count > 1). */
export interface TimelineDisplayItem {
  id: string;
  date: Date;
  type: TimelineEventType;
  label: string;
  sublabel?: string;
  /** When > 1, this row represents multiple same-day interactions (highlights, not full log). */
  count?: number;
}
