/**
 * Relational Memory — data models for tracking Circle members,
 * success log entries, gauge snapshots, and interaction correlations.
 */

/** Gauge keys matching cockpit store */
export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

/** Circle member reference for relational memory (id + name + relationship) */
export interface RelationalCircleMember {
  id: string;
  name: string;
  relationship: string;
  /** ISO date string when added or last linked */
  linkedAt: string;
}

/** Single gauge value at a point in time */
export interface GaugeSnapshotValue {
  value: number;
  /** ISO date string */
  at: string;
}

/** Point-in-time snapshot of all cockpit gauges */
export interface GaugeSnapshot {
  id: string;
  /** User who owns this snapshot */
  userId: string;
  /** ISO date string */
  at: string;
  body: GaugeSnapshotValue;
  state: GaugeSnapshotValue;
  emotion: GaugeSnapshotValue;
  connection: GaugeSnapshotValue;
  direction: GaugeSnapshotValue;
  alignment: GaugeSnapshotValue;
  /** Overall regulation 0–100 or -1 if none */
  overall: number;
}

/** Success log entry — e.g. positive outcome, check-in completed, conversation had */
export interface SuccessLogEntry {
  id: string;
  userId: string;
  /** Type of success for filtering/analytics */
  type: 'check_in' | 'conversation' | 'journal' | 'activity' | 'circle_reach_out' | 'other';
  /** Short description or title */
  description: string;
  /** Optional: circle member id if success was with/about them */
  circleMemberId?: string;
  /** Optional: gauge snapshot id if captured at time of success */
  gaugeSnapshotId?: string;
  /** ISO date string */
  createdAt: string;
  /** Optional metadata (e.g. activity id, conversation id) */
  meta?: Record<string, string | number | boolean>;
}

/** Correlation between an interaction and outcomes (e.g. after talking to X, connection gauge rose) */
export interface InteractionCorrelation {
  id: string;
  userId: string;
  /** Circle member id involved in the interaction, if any */
  circleMemberId?: string;
  /** Gauge snapshot before the interaction */
  gaugeSnapshotBeforeId: string;
  /** Gauge snapshot after the interaction (or later that day) */
  gaugeSnapshotAfterId: string;
  /** Kind of interaction */
  interactionType: 'conversation' | 'reach_out' | 'journal_about' | 'activity' | 'other';
  /** ISO date string */
  at: string;
  /** Optional: which gauge(s) moved most (e.g. ['connection', 'emotion']) */
  gaugesAffected?: GaugeKey[];
}

/** Conversation summary linked to a circle member */
export interface ConversationSummary {
  id: string;
  summary: string;
  /** ISO date string */
  at: string;
}

/** Topic mentioned in relation to a circle member */
export interface TopicMention {
  topic: string;
  /** ISO date string */
  lastMentionedAt: string;
}

/** Observed relationship pattern (e.g. "Opens up after asking about their day") */
export interface RelationshipPattern {
  id: string;
  description: string;
  /** ISO date string */
  at: string;
}
