/**
 * Life OS — Five Influencing Systems (not gauges).
 * They explain why gauges move: Recovery, Attention, Reciprocity, Meaning, Environment.
 * Used as drivers, context, and pattern insight language.
 * @see docs/LIFE-OS-INFLUENCING-SYSTEMS.md
 */

export const INFLUENCING_SYSTEM_IDS = [
  'recovery',
  'attention',
  'reciprocity',
  'meaning',
  'environment',
] as const;

export type InfluencingSystemId = (typeof INFLUENCING_SYSTEM_IDS)[number];

export const INFLUENCING_SYSTEM_LABELS: Record<InfluencingSystemId, string> = {
  recovery: 'Recovery',
  attention: 'Attention',
  reciprocity: 'Reciprocity',
  meaning: 'Meaning',
  environment: 'Environment',
};

/** Driver IDs that map to each influencing system. */
export const DRIVER_TO_SYSTEM: Record<string, InfluencingSystemId> = {
  // Recovery — sleep, rest, stress recovery, health, movement
  'body-sleep': 'recovery',
  'state-sleep': 'recovery',
  'body-health': 'recovery',
  'body-movement': 'recovery',
  'body-rest-sleep': 'recovery',
  'state-stress': 'recovery',
  'state-caffeine': 'recovery',
  // Attention — work, tasks, cognitive load, task switching
  'dir-work': 'attention',
  'dir-tasks': 'attention',
  'dir-overload': 'attention',
  'state-distraction': 'attention',
  'emotion-work': 'attention",
  // Reciprocity — connection drivers are relationship context; reciprocity is care given/received (handled by reciprocityService)
  // No driver ID → reciprocity; it's from connectionLogByMemberId.initiatedBy
  // Meaning — purpose, values, identity
  "align-values': 'meaning',
  'align-identity': 'meaning',
  'align-purpose': 'meaning',
  'align-spirituality': 'meaning',
  // Environment — optional future drivers (env-weather, env-travel); for now context-only
  'env-weather': 'environment',
  'env-daylight': 'environment',
  'env-travel': 'environment',
};

/** checkInContext keys that imply an influencing system. */
export type CheckInContextSlice = {
  sleep?: string;
  social?: string;
  stressSource?: string;
};

/**
 * Which influencing system(s) are suggested by check-in context.
 * sleep → recovery; stressSource (Work, etc.) → attention; social → reciprocity context.
 */
export function contextToSystems(ctx: CheckInContextSlice | null): InfluencingSystemId[] {
  if (!ctx) return [];
  const out: InfluencingSystemId[] = [];
  if (ctx.sleep && ctx.sleep.length > 0) {
    const poor = ['Poor', 'Very poor', 'Okay'].includes(ctx.sleep);
    if (poor) out.push('recovery');
  }
  const stressAttention = ['Work', 'Relationships', 'Health', 'Uncertainty', 'Financial'];
  if (ctx.stressSource && stressAttention.some((s) => ctx.stressSource!.includes(s))) {
    out.push('attention');
  }
  return out;
}

/**
 * Map driver IDs to influencing system IDs (deduped).
 */
export function driversToSystems(driverIds: string[]): InfluencingSystemId[] {
  const set = new Set<InfluencingSystemId>();
  for (const id of driverIds) {
    const sys = DRIVER_TO_SYSTEM[id];
    if (sys) set.add(sys);
  }
  return Array.from(set);
}

/**
 * Human-readable label for an influencing system (for insights/forecast copy).
 */
export function getInfluencingSystemLabel(systemId: InfluencingSystemId): string {
  return INFLUENCING_SYSTEM_LABELS[systemId];
}
