/**
 * Context Engine — When to prompt check-ins
 * 
 * Science: Event-contingent sampling, pattern-based prompting
 * 
 * Decides:
 * - Should we prompt a check-in?
 * - What level (micro, quick, deep)?
 * - What contextual message to show?
 */

import type { GaugeName } from './types';

interface UserPattern {
  // Historical patterns
  usualCheckInTimes?: string[]; // ['09:00', '21:00']
  lowStateDays?: string[]; // ['monday', 'wednesday']
  lowStateAfterEvents?: string[]; // ['family_call', 'work_meeting']
  averagesByDayPart?: {
    morning: Partial<Record<GaugeName, number>>;
    afternoon: Partial<Record<GaugeName, number>>;
    evening: Partial<Record<GaugeName, number>>;
    night: Partial<Record<GaugeName, number>>;
  };
}

interface CurrentContext {
  lastCheckInTime?: Date;
  lastGaugeValues?: Partial<Record<GaugeName, number>>;
  recentEvents?: string[]; // ['meeting_ended', 'location_home']
  currentDayPart: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  hour: number;
}

interface CheckInPrompt {
  shouldPrompt: boolean;
  level: 'micro' | 'quick' | 'deep';
  gauge?: GaugeName; // For micro check-ins
  message: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
}

/** Stub for contextual prompt (e.g. time-based message). */
export const getContextualPrompt = (): string => '";

/**
 * Determine if we should prompt a check-in
 */
export function shouldPromptCheckIn(
  patterns: UserPattern,
  context: CurrentContext
): CheckInPrompt {
  const { lastCheckInTime, lastGaugeValues, recentEvents, currentDayPart, dayOfWeek, hour } = context;
  
  // Don't prompt too frequently (minimum 30 min between prompts)
  if (lastCheckInTime) {
    const minutesSince = (Date.now() - lastCheckInTime.getTime()) / 1000 / 60;
    if (minutesSince < 30) {
      return { shouldPrompt: false, level: "micro', message: '', priority: 'low', reason: 'too_soon' };
    }
  }
  
  // Night time (11pm - 6am) - only prompt if explicitly needed
  if (hour >= 23 || hour < 6) {
    return { shouldPrompt: false, level: 'micro', message: '', priority: 'low', reason: 'night_time' };
  }
  
  // Check for event triggers
  if (recentEvents?.length) {
    const triggerEvent = recentEvents.find(e => 
      patterns.lowStateAfterEvents?.includes(e)
    );
    if (triggerEvent) {
      return {
        shouldPrompt: true,
        level: 'micro',
        gauge: 'state',
        message: getEventPrompt(triggerEvent),
        priority: 'high',
        reason: 'event_trigger',
      };
    }
  }
  
  // Check for pattern-based prompts
  const lowDay = dayOfWeek.toLowerCase();
  if (patterns.lowStateDays?.includes(lowDay)) {
    const averageState = patterns.averagesByDayPart?.[currentDayPart]?.state;
    if (averageState && averageState < 50) {
      return {
        shouldPrompt: true,
        level: 'micro',
        gauge: 'state',
        message: `${capitalize(lowDay)}s are usually harder for you. How's your State?`,
        priority: 'medium',
        reason: 'pattern_day',
      };
    }
  }
  
  // Check for time-based prompts
  if (patterns.usualCheckInTimes?.length) {
    const currentTimeStr = `${hour.toString().padStart(2, '0')}:00`;
    const nearUsualTime = patterns.usualCheckInTimes.some(t => {
      const [h] = t.split(':').map(Number);
      return Math.abs(h - hour) <= 1;
    });
    if (nearUsualTime && (!lastCheckInTime || hoursSince(lastCheckInTime) > 4)) {
      return {
        shouldPrompt: true,
        level: 'quick',
        message: currentDayPart === 'morning' ? 'Good morning. Quick check-in?' : 'Time for a check-in?',
        priority: 'medium',
        reason: 'usual_time",
      };
    }
  }
  
  // Check if it's been too long since last check-in
  if (!lastCheckInTime || hoursSince(lastCheckInTime) > 12) {
    return {
      shouldPrompt: true,
      level: "quick",
      message: \"It's been a while. How are you doing?\",
      priority: "low',
      reason: 'time_elapsed',
    };
  }
  
  // Check for gauge-specific concerns
  if (lastGaugeValues) {
    const lowGauges = (Object.entries(lastGaugeValues) as [GaugeName, number][])
      .filter(([_, v]) => v >= 0 && v < 40);
    
    if (lowGauges.length > 0) {
      const [lowestGauge] = lowGauges.sort((a, b) => a[1] - b[1]);
      return {
        shouldPrompt: true,
        level: 'micro',
        gauge: lowestGauge[0],
        message: getGaugePrompt(lowestGauge[0], lowestGauge[1]),
        priority: 'medium',
        reason: 'low_gauge',
      };
    }
  }
  
  // Default: no prompt
  return { shouldPrompt: false, level: 'micro', message: '', priority: 'low', reason: 'no_trigger' };
}

/**
 * Get contextual prompt message for an event
 */
function getEventPrompt(event: string): string {
  const prompts: Record<string, string[]> = {
    meeting_ended: [
      'Meeting just ended. How do you feel?',
      'Back from that meeting. Check your State?',
    ],
    family_call: [
      'Just talked to family. How are you doing?',
      'After that call — how do you feel?',
    ],
    location_home: [
      'You\'re home. How was the transition?',
      'Back home. Quick check-in?',
    ],
    location_work: [
      'Arrived at work. How are you starting?',
      'You\'re at work. Quick State check?',
    ],
    morning_routine: [
      'Morning. How did you sleep?',
      'Good morning. Body check?',
    ],
    evening_routine: [
      'Winding down. How was today?',
      'Evening check-in?',
    ],
  };
  
  const options = prompts[event] || ['Quick check-in?'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get contextual prompt for a low gauge
 */
function getGaugePrompt(gauge: GaugeName, value: number): string {
  const prompts: Record<GaugeName, string[]> = {
    body: [
      'Your Body has been low. What does it need?',
      'Body check — how are you physically?',
    ],
    state: [
      'Your State was low earlier. How is it now?',
      'Checking in on your nervous system.',
    ],
    emotion: [
      'Emotionally, how are you doing?',
      'What emotions are present right now?',
    ],
    connection: [
      'Connection has been low. Feeling isolated?',
      'How connected do you feel right now?',
    ],
    direction: [
      'Direction was low. Finding your way?',
      'Sense of purpose check.',
    ],
    alignment: [
      'Alignment check — are you being yourself?',
      'Living your values today?',
    ],
  };
  
  const options = prompts[gauge] || ['How are you?'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get a contextual greeting based on time and state
 */
export function getContextualGreeting(
  dayPart: 'morning' | 'afternoon' | 'evening' | 'night',
  lastState?: number
): string {
  const greetings: Record<string, string[]> = {
    morning: [
      'Good morning',
      'Morning',
      'Rise and check in',
    ],
    afternoon: [
      'Good afternoon',
      'Afternoon check',
      'Midday moment',
    ],
    evening: [
      'Good evening',
      'Evening check-in',
      'Winding down?',
    ],
    night: [
      'Still up?',
      'Late night',
      'Night owl check',
    ],
  };
  
  // If state was low, acknowledge it
  if (lastState !== undefined && lastState < 40) {
    return 'Checking in. How are you now?';
  }
  
  const options = greetings[dayPart];
  return options[Math.floor(Math.random() * options.length)];
}

// Helpers
function hoursSince(date: Date): number {
  return (Date.now() - date.getTime()) / 1000 / 60 / 60;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getDayPart(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getDayOfWeek(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}
