/**
 * Social Reciprocity Loop — Track care given vs care received.
 * Uses connection logs with initiatedBy (me = given, them = received).
 */

import type { ConnectionEntry } from '../types/lights';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ReciprocityInput = {
  connectionLogByMemberId: Record<string, ConnectionEntry[]>;
};

export type ReciprocityResult = {
  given: number;
  received: number;
  /** e.g. "You reached out to 3 people this week; 2 reached out to you." */
  line: string | null;
};

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d as string);
}

/**
 * Returns counts and a summary line for the last 7 days.
 * Only counts entries with initiatedBy set.
 */
export function getReciprocityThisWeek(input: ReciprocityInput): ReciprocityResult {
  const { connectionLogByMemberId } = input;
  const cutoff = Date.now() - 7 * MS_PER_DAY;
  let given = 0;
  let received = 0;

  for (const memberId of Object.keys(connectionLogByMemberId)) {
    const log = connectionLogByMemberId[memberId] ?? [];
    for (const entry of log) {
      const t = toDate(entry.date).getTime();
      if (t < cutoff) continue;
      if (entry.initiatedBy === 'me') given++;
      else if (entry.initiatedBy === 'them') received++;
    }
  }

  let line: string | null = null;
  if (given > 0 || received > 0) {
    if (given > 0 && received > 0) {
      line = `You reached out to ${given} person${given !== 1 ? 's' : ''} this week; ${received} reached out to you.`;
    } else if (given > 0) {
      line = `You reached out to ${given} person${given !== 1 ? 's' : ''} this week.`;
    } else {
      line = `${received} person${received !== 1 ? 's' : ''} reached out to you this week.`;
    }
  }

  return { given, received, line };
}
