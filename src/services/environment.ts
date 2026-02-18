/**
 * Environment Context Service
 * Free data that needs no API keys or user setup
 * - Moon phase
 * - Time of day
 * - Day of week patterns
 * - Season
 */

export interface MoonPhase {
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 
         'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  illumination: number;  // 0-100%
  emoji: string;
  moodNote: string;
}

export interface TimeContext {
  timeOfDay: 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late-night';
  dayOfWeek: string;
  isWeekend: boolean;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  daysUntilWeekend: number;
  hourOfDay: number;
}

export interface EnvironmentContext {
  moon?: MoonPhase;
  time?: TimeContext;
}

/**
 * Calculate moon phase for a given date
 * Based on lunar cycle calculation
 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
  // Known new moon reference: Jan 6, 2000
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const lunarCycle = 29.53059; // days
  
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cyclePosition = ((daysSinceKnown % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = Math.round((1 - Math.cos((cyclePosition / lunarCycle) * 2 * Math.PI)) / 2 * 100);
  
  let phase: MoonPhase['phase'];
  let emoji: string;
  let moodNote: string;
  
  const dayInCycle = cyclePosition;
  
  if (dayInCycle < 1.85) {
    phase = 'new';
    emoji = '🌑';
    moodNote = 'New moon — good for new beginnings, introspection';
  } else if (dayInCycle < 7.38) {
    phase = 'waxing-crescent';
    emoji = '🌒';
    moodNote = 'Waxing crescent — building energy, setting intentions';
  } else if (dayInCycle < 9.23) {
    phase = 'first-quarter';
    emoji = '🌓';
    moodNote = 'First quarter — time for action, decisions';
  } else if (dayInCycle < 14.77) {
    phase = 'waxing-gibbous';
    emoji = '🌔';
    moodNote = 'Waxing gibbous — refining, adjusting course';
  } else if (dayInCycle < 16.61) {
    phase = 'full';
    emoji = '🌕';
    moodNote = 'Full moon — heightened emotions, illumination';
  } else if (dayInCycle < 22.15) {
    phase = 'waning-gibbous';
    emoji = '🌖';
    moodNote = 'Waning gibbous — gratitude, sharing';
  } else if (dayInCycle < 24.0) {
    phase = 'last-quarter';
    emoji = '🌗';
    moodNote = 'Last quarter — release, letting go';
  } else {
    phase = 'waning-crescent';
    emoji = '🌘';
    moodNote = 'Waning crescent — rest, surrender, prepare for renewal';
  }
  
  return { phase, illumination, emoji, moodNote };
}

/**
 * Get time-based context
 */
export function getTimeContext(date: Date = new Date()): TimeContext {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday
  const month = date.getMonth();
  
  // Time of day
  let timeOfDay: TimeContext['timeOfDay'];
  if (hour >= 5 && hour < 9) {
    timeOfDay = 'early-morning';
  } else if (hour >= 9 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else if (hour >= 21 || hour < 1) {
    timeOfDay = 'night';
  } else {
    timeOfDay = 'late-night';
  }
  
  // Day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[day];
  const isWeekend = day === 0 || day === 6;
  
  // Days until weekend (Saturday)
  let daysUntilWeekend = (6 - day + 7) % 7;
  if (daysUntilWeekend === 0 && !isWeekend) daysUntilWeekend = 7;
  if (isWeekend) daysUntilWeekend = 0;
  
  // Season (Northern hemisphere)
  let season: TimeContext['season'];
  if (month >= 2 && month <= 4) {
    season = 'spring';
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
  } else if (month >= 8 && month <= 10) {
    season = 'fall';
  } else {
    season = 'winter';
  }
  
  return {
    timeOfDay,
    dayOfWeek,
    isWeekend,
    season,
    daysUntilWeekend,
    hourOfDay: hour,
  };
}

/**
 * Get full environment context for AI
 */
export function getEnvironmentContext(): EnvironmentContext {
  return {
    moon: getMoonPhase(),
    time: getTimeContext(),
  };
}

/**
 * Get mood-relevant notes for current environment
 */
export function getEnvironmentNotes(): string[] {
  const notes: string[] = [];
  const time = getTimeContext();
  const moon = getMoonPhase();
  
  // Time-based notes
  if (time.timeOfDay === 'late-night') {
    notes.push('Late night — sleep deprivation affects all gauges');
  }
  if (time.dayOfWeek === 'Sunday' && time.timeOfDay === 'evening') {
    notes.push('Sunday evening — common time for anticipatory anxiety');
  }
  if (time.dayOfWeek === 'Monday' && time.timeOfDay === 'morning') {
    notes.push('Monday morning — transition stress is normal');
  }
  if (time.isWeekend) {
    notes.push('Weekend — different rhythm, different needs');
  }
  if (time.daysUntilWeekend === 1) {
    notes.push('Friday — end-of-week fatigue is real');
  }
  
  // Moon-based notes (for users who track this)
  if (moon.phase === 'full') {
    notes.push('Full moon — some report heightened emotions, sleep changes');
  }
  if (moon.phase === 'new') {
    notes.push('New moon — low energy is common, good for rest');
  }
  
  // Season-based
  if (time.season === 'winter') {
    notes.push('Winter — reduced daylight affects mood (SAD pattern)');
  }
  
  return notes;
}
