/**
 * Light Helpers — Unified system for "Your People"
 * 
 * Each Light has three dimensions:
 * 1. Color — Their emotional status (green/yellow/orange/red/unknown)
 * 2. Brightness — Your connection strength (on/dim/off)
 * 3. Animation — Attention signal (none/pulse/blink/glow)
 */

export type LightStatus = 'green' | 'yellow' | 'orange' | 'red' | 'unknown';
export type LightBrightness = 'on' | 'dim' | 'off';
export type LightAnimation = 'none' | 'pulse' | 'blink' | 'glow';
export type LightTier = 'inner' | 'close' | 'friends' | 'community';
export type LightUrgency = 'none' | 'low' | 'medium' | 'high';

export interface LightState {
  color: LightStatus;
  colorHex: string;
  brightness: LightBrightness;
  opacity: number;
  animation: LightAnimation;
  urgency: LightUrgency;
  needsAttention: boolean;
}

// Same colors as gauges — unified system
export const STATUS_COLORS: Record<LightStatus, string> = {
  green: '#34D399',   // Doing well
  yellow: '#FBBF24',  // Could use love
  orange: '#FB923C',  // Having hard time
  red: '#F87171',     // Really struggling
  unknown: '#6B7280', // No status
};

export const STATUS_LABELS: Record<LightStatus, string> = {
  green: 'Doing well',
  yellow: 'Could use love',
  orange: 'Having a hard time',
  red: 'Really struggling',
  unknown: 'No status',
};

export const BRIGHTNESS_OPACITY: Record<LightBrightness, number> = {
  on: 1,
  dim: 0.5,
  off: 0.2,
};

export const TIER_LABELS: Record<LightTier, string> = {
  inner: 'Inner Circle',
  close: 'Close Friends',
  friends: 'Friends',
  community: 'Community',
};

export const TIER_LIMITS: Record<LightTier, number> = {
  inner: 5,
  close: 15,
  friends: 50,
  community: 150,
};

/**
 * Calculate days since a date
 */
export function getDaysSince(date: Date | string | null): number {
  if (!date) return 999;
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the full Light state for a person
 */
export function calculateLightState(
  status: LightStatus | undefined,
  lastContact: Date | string | null,
  tier: LightTier = 'friends'
): LightState {
  const effectiveStatus = status || 'unknown';
  const daysSinceContact = getDaysSince(lastContact);
  
  // Brightness based on contact recency
  const brightness: LightBrightness = 
    daysSinceContact <= 7 ? 'on' :
    daysSinceContact <= 30 ? 'dim' : 
    'off';
  
  // Status-based urgency
  const statusUrgent = effectiveStatus === 'red';
  const statusNeedsLove = effectiveStatus === 'orange';
  const statusYellow = effectiveStatus === 'yellow';
  
  // Connection-based urgency
  const connectionUrgent = daysSinceContact >= 45;
  const connectionFading = daysSinceContact >= 14;
  
  // Is this an important relationship?
  const isInnerCircle = tier === 'inner';
  const isClose = tier === 'close';
  
  // Combined urgency level
  let urgency: LightUrgency = 'none';
  if (statusUrgent || connectionUrgent) {
    urgency = 'high';
  } else if (statusNeedsLove || (connectionFading && (isInnerCircle || isClose))) {
    urgency = 'medium';
  } else if (statusYellow || connectionFading) {
    urgency = 'low';
  }
  
  // Animation based on urgency + tier
  let animation: LightAnimation = 'none';
  if (urgency === 'high') {
    animation = 'blink';
  } else if (urgency === 'medium') {
    animation = isInnerCircle ? 'glow' : 'pulse';
  } else if (urgency === 'low' && isInnerCircle) {
    animation = 'pulse';
  }
  
  const needsAttention = urgency !== 'none';
  
  return {
    color: effectiveStatus,
    colorHex: STATUS_COLORS[effectiveStatus],
    brightness,
    opacity: BRIGHTNESS_OPACITY[brightness],
    animation,
    urgency,
    needsAttention,
  };
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format "last contact" as human-readable
 */
export function formatLastContact(date: Date | string | null): string {
  if (!date) return 'Never';
  
  const days = getDaysSince(date);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'Last month';
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return 'Over a year ago';
}

/**
 * Get suggested action based on light state
 */
export function getSuggestedAction(
  name: string,
  state: LightState,
  tier: LightTier
): string | null {
  if (state.urgency === 'high' && state.color === 'red') {
    return `${name} is really struggling. Reach out now.`;
  }
  if (state.urgency === 'high' && state.brightness === 'off") {
    return `It's been too long since you talked to ${name}.`;
  }
  if (state.urgency === "medium' && state.color === 'orange') {
    return `${name} is having a hard time. A call would mean a lot.`;
  }
  if (state.urgency === 'medium' && state.brightness === 'dim') {
    return `Your connection with ${name} is fading. Check in?`;
  }
  if (state.color === 'yellow' && tier === 'inner') {
    return `${name} could use some love.`;
  }
  return null;
}
