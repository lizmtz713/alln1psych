/**
 * Reach-Out Scaffold — Connection repair intelligence
 * 
 * Philosophy:
 * - Connection dropping for 2+ days is a signal, not a failure
 * - Provide options, not pressure
 * - Casual > formal, warm > clinical
 * - Always offer regulation before action
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGaugeHistory, type GaugeSnapshot } from './crisisPipeline';

const REACH_OUT_DISMISSED_KEY = 'reach_out_scaffold_dismissed';
const CONNECTION_LOW_THRESHOLD = 40;
const DAYS_REQUIRED = 2;

export interface ReachOutContext {
  connectionLevel: number;
  daysBelowThreshold: number;
  partnerName?: string;
  recentContext?: string; // What's been going on
}

export interface CheckInMessage {
  id: string;
  tone: 'warm' | 'light' | 'curious';
  message: string;
  emoji?: string;
}

export interface RepairStep {
  phase: 'open' | 'acknowledge' | 'ask' | 'close';
  prompt: string;
  example?: string;
  tip?: string;
}

export interface SharedActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  energy: 'low' | 'medium' | 'high';
  time: string;
}

export interface ReconnectionSuggestion {
  type: 'check-in' | 'repair' | 'shared-time';
  title: string;
  description: string;
  emoji: string;
}

/**
 * Check if Connection has been low for the required number of days
 */
export async function checkConnectionLowPersistence(): Promise<{
  isLow: boolean;
  daysBelowThreshold: number;
  currentLevel: number;
}> {
  try {
    const history = await getGaugeHistory();
    if (history.length === 0) {
      return { isLow: false, daysBelowThreshold: 0, currentLevel: -1 };
    }

    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Group snapshots by day
    const dayMap = new Map<string, GaugeSnapshot[]>();
    for (const snapshot of history) {
      const dayKey = new Date(snapshot.timestamp).toDateString();
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, []);
      }
      dayMap.get(dayKey)!.push(snapshot);
    }

    // Check the last DAYS_REQUIRED + 1 days (need consecutive low days)
    let consecutiveLowDays = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i <= DAYS_REQUIRED + 2; i++) {
      const checkDate = new Date(now - i * msPerDay).toDateString();
      const snapshots = dayMap.get(checkDate);
      
      if (!snapshots || snapshots.length === 0) {
        // No data for this day - break the streak
        if (i > 0) break;
        continue;
      }

      // Get average connection for this day
      const connectionValues = snapshots
        .filter(s => s.connection >= 0)
        .map(s => s.connection);
      
      if (connectionValues.length === 0) {
        if (i > 0) break;
        continue;
      }

      const avgConnection = connectionValues.reduce((a, b) => a + b, 0) / connectionValues.length;
      
      if (avgConnection < CONNECTION_LOW_THRESHOLD) {
        consecutiveLowDays++;
      } else {
        break; // Connection was above threshold - break streak
      }
    }

    // Get current connection level
    const latestSnapshot = history[history.length - 1];
    const currentLevel = latestSnapshot?.connection ?? -1;

    return {
      isLow: consecutiveLowDays >= DAYS_REQUIRED,
      daysBelowThreshold: consecutiveLowDays,
      currentLevel,
    };
  } catch (e) {
    console.warn('[ReachOutScaffold] Error checking connection persistence:', e);
    return { isLow: false, daysBelowThreshold: 0, currentLevel: -1 };
  }
}

/**
 * Check if the prompt was recently dismissed
 */
export async function wasRecentlyDismissed(): Promise<boolean> {
  try {
    const dismissed = await AsyncStorage.getItem(REACH_OUT_DISMISSED_KEY);
    if (!dismissed) return false;
    
    const dismissedTime = parseInt(dismissed, 10);
    const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
    
    // Show again after 24 hours
    return hoursSinceDismissed < 24;
  } catch {
    return false;
  }
}

/**
 * Mark the prompt as dismissed
 */
export async function dismissReachOutPrompt(): Promise<void> {
  try {
    await AsyncStorage.setItem(REACH_OUT_DISMISSED_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

/**
 * Get contextual reconnection suggestions
 */
export function getReconnectionSuggestions(
  connectionLevel: number,
  daysBelowThreshold: number
): ReconnectionSuggestion[] {
  const suggestions: ReconnectionSuggestion[] = [];

  // Always include check-in option
  suggestions.push({
    type: 'check-in',
    title: 'Send a light check-in',
    description: 'A simple message to break the distance — no pressure, just presence',
    emoji: '💬',
  });

  // Repair option if connection has been low for a while
  if (daysBelowThreshold >= 2) {
    suggestions.push({
      type: 'repair',
      title: 'Repair something unresolved',
      description: 'A guided script for addressing what might be underneath',
      emoji: '🌉',
    });
  }

  // Shared time is always good
  suggestions.push({
    type: 'shared-time',
    title: 'Plan shared time',
    description: 'Low-pressure activities to reconnect without forcing conversation',
    emoji: '🌟',
  });

  return suggestions;
}

/**
 * Generate casual check-in messages
 * These should feel human, not AI-generated or clinical
 */
export function generateCheckInMessages(context?: ReachOutContext): CheckInMessage[] {
  const messages: CheckInMessage[] = [];
  const name = context?.partnerName || 'you';

  // Warm messages
  messages.push({
    id: 'warm-1',
    tone: 'warm',
    message: `Hey. I've been thinking about you. How are you doing?`,
    emoji: '💜',
  });

  messages.push({
    id: 'warm-2',
    tone: 'warm',
    message: `I miss you. Just wanted you to know.`,
    emoji: '🤗',
  });

  messages.push({
    id: 'warm-3',
    tone: 'warm',
    message: `Been quiet between us. I'm still here. ❤️`,
  });

  // Light messages
  messages.push({
    id: 'light-1',
    tone: 'light',
    message: `Hey stranger 👋 What's one good thing from your day?`,
    emoji: '☀️',
  });

  messages.push({
    id: 'light-2',
    tone: 'light',
    message: `Random thought: you popped into my head. So here I am.`,
    emoji: '💭',
  });

  messages.push({
    id: 'light-3',
    tone: 'light',
    message: `Saw something that reminded me of you today. Hope you're doing okay.`,
    emoji: '🌸',
  });

  // Curious messages
  messages.push({
    id: 'curious-1',
    tone: 'curious',
    message: `How's your week been going? I want to hear about it.`,
    emoji: '🎧',
  });

  messages.push({
    id: 'curious-2',
    tone: 'curious',
    message: `What's been on your mind lately? I'm curious.`,
    emoji: '🤔',
  });

  return messages;
}

/**
 * Generate a guided repair script
 * This is a scaffold — prompts to fill in, not words to copy verbatim
 */
export function generateRepairScript(context?: ReachOutContext): RepairStep[] {
  const steps: RepairStep[] = [];

  // Opening - create safety
  steps.push({
    phase: 'open',
    prompt: "Start by signaling you want to connect, not fight",
    example: "Hey, I've been wanting to talk. Not to relitigate anything — just to reconnect. Is now okay?",
    tip: "Asking permission shows respect. It also gives them a chance to say 'not yet' which is valid.",
  });

  // Acknowledge - own your part
  steps.push({
    phase: 'acknowledge',
    prompt: "Name what you might have contributed — even if it's small",
    example: "I know I've been distant / short / distracted lately, and I don't think that's helped.",
    tip: "You don't have to take full blame. Just acknowledging something opens the door.",
  });

  // Ask - create space for them
  steps.push({
    phase: 'ask',
    prompt: "Invite their perspective without defending yourself yet",
    example: "How have you been feeling about things between us? I want to understand where you're at.",
    tip: "Listen without interrupting. Their answer might surprise you.",
  });

  // Close - reconnect
  steps.push({
    phase: 'close',
    prompt: "End with what matters: the relationship itself",
    example: "I care about us. That's why I wanted to talk. Whatever's going on, I want to work through it together.",
    tip: "The goal isn't to solve everything in one conversation. It's to reopen the channel.",
  });

  return steps;
}

/**
 * Suggest low-pressure shared activities
 */
export function suggestSharedActivities(): SharedActivity[] {
  return [
    {
      id: 'walk',
      title: 'Take a walk together',
      description: 'Side-by-side movement often makes conversation easier than face-to-face',
      emoji: '🚶',
      energy: 'low',
      time: '20-30 min',
    },
    {
      id: 'meal',
      title: 'Cook or eat together',
      description: 'Shared meals are ancient bonding tech. No phones.',
      emoji: '🍳',
      energy: 'medium',
      time: '30-60 min',
    },
    {
      id: 'show',
      title: 'Watch something together',
      description: 'Parallel activity creates closeness without pressure to talk',
      emoji: '📺',
      energy: 'low',
      time: '45-90 min',
    },
    {
      id: 'car-ride',
      title: 'Go for a drive',
      description: 'The car is a confessional booth. Eyes forward, less pressure.',
      emoji: '🚗',
      energy: 'low',
      time: '15-30 min',
    },
    {
      id: 'errand',
      title: 'Run an errand together',
      description: 'Even mundane tasks become connection points when done together',
      emoji: '🛒',
      energy: 'low',
      time: '30-60 min',
    },
    {
      id: 'project',
      title: 'Work on something together',
      description: 'Collaborative tasks (cleaning, building, organizing) build teamwork',
      emoji: '🔧',
      energy: 'medium',
      time: '1-2 hours',
    },
    {
      id: 'outdoors',
      title: 'Get outside together',
      description: 'Nature resets nervous systems. Even a 10-minute porch sit counts.',
      emoji: '🌲',
      energy: 'low',
      time: '10-60 min',
    },
    {
      id: 'game',
      title: 'Play a game together',
      description: 'Low-stakes competition or cooperation. Cards, board games, video games.',
      emoji: '🎮',
      energy: 'medium',
      time: '30-90 min',
    },
  ];
}

/**
 * Get a single activity recommendation based on energy/time
 */
export function getActivityRecommendation(
  preferLowEnergy: boolean = true
): SharedActivity {
  const activities = suggestSharedActivities();
  const filtered = preferLowEnergy
    ? activities.filter(a => a.energy === 'low')
    : activities;
  
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}

/**
 * Get regulation suggestions before reaching out
 * (This hooks into Quick Reset but adds context)
 */
export function getPreReachOutRegulation(): {
  suggestion: string;
  reason: string;
} {
  return {
    suggestion: "Would you like to regulate first?",
    reason: "Reaching out from a calm state tends to go better. A 2-minute reset can shift your nervous system enough to make a difference.",
  };
}
