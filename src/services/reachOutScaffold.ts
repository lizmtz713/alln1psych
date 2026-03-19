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

  // WARM messages (heartfelt, direct affection)
  messages.push(
    { id: 'warm-1', tone: 'warm', message: `Hey. I've been thinking about you. How are you doing?` },
    { id: 'warm-2', tone: 'warm', message: `I miss you. Just wanted you to know.` },
    { id: 'warm-3', tone: 'warm', message: `Been quiet between us. I'm still here. ❤️` },
    { id: 'warm-4', tone: 'warm', message: `You matter to me. Checking in.` },
    { id: 'warm-5', tone: 'warm', message: `Hey. No agenda, just wanted to say I care about you.` },
    { id: 'warm-6', tone: 'warm', message: `Thinking about you today. Sending you love.` },
    { id: 'warm-7', tone: 'warm', message: `I know it's been a minute. You're still on my heart.` },
    { id: 'warm-8', tone: 'warm', message: `Just wanted to say: I'm grateful you're in my life.` },
    { id: 'warm-9', tone: 'warm', message: `Hey you. How's your heart doing?` },
    { id: 'warm-10', tone: 'warm', message: `Distance doesn't change how much I care. ❤️` },
  );

  // LIGHT messages (casual, easy, low pressure)
  messages.push(
    { id: 'light-1', tone: 'light', message: `Hey stranger 👋 What's one good thing from your day?` },
    { id: 'light-2', tone: 'light', message: `Random thought: you popped into my head. So here I am.` },
    { id: 'light-3', tone: 'light', message: `Saw something that reminded me of you today. Hope you're doing okay.` },
    { id: 'light-4', tone: 'light', message: `Hey! Life update? I want the highlights.` },
    { id: 'light-5', tone: 'light', message: `This is your reminder that I exist and I'm rooting for you 😊` },
    { id: 'light-6', tone: 'light', message: `Quick check: you alive? Send proof of life.` },
    { id: 'light-7', tone: 'light', message: `Hi. That's it. That's the text.` },
    { id: 'light-8', tone: 'light', message: `Poking my head in to say hey 👀` },
    { id: 'light-9', tone: 'light', message: `When's the last time we actually talked? Too long.` },
    { id: 'light-10', tone: 'light', message: `Thought about texting you like 3 times this week. Finally doing it.` },
  );

  // CURIOUS messages (interested, inviting conversation)
  messages.push(
    { id: 'curious-1', tone: 'curious', message: `How's your week been going? I want to hear about it.` },
    { id: 'curious-2', tone: 'curious', message: `What's been on your mind lately? I'm curious.` },
    { id: 'curious-3', tone: 'curious', message: `What's something good happening in your world right now?` },
    { id: 'curious-4', tone: 'curious', message: `Tell me something you're excited about. Anything.` },
    { id: 'curious-5', tone: 'curious', message: `What are you into these days? I want to know.` },
    { id: 'curious-6', tone: 'curious', message: `What's your brain chewing on lately?` },
    { id: 'curious-7', tone: 'curious', message: `Catch me up — what's new in your universe?` },
    { id: 'curious-8', tone: 'curious', message: `What's bringing you joy right now? I need to know.` },
    { id: 'curious-9', tone: 'curious', message: `If you had to describe your week in one word, what would it be?` },
    { id: 'curious-10', tone: 'curious', message: `What would you do if you had zero obligations this weekend?` },
  );

  // SUPPORTIVE messages (for when you know they're going through something)
  messages.push(
    { id: 'support-1', tone: 'warm', message: `Hey. No need to respond. Just wanted you to know I'm here if you need anything.` },
    { id: 'support-2', tone: 'warm', message: `Thinking about you. Whatever you're going through, you don't have to do it alone.` },
    { id: 'support-3', tone: 'warm', message: `I know things have been hard. I'm in your corner.` },
    { id: 'support-4', tone: 'warm', message: `Just checking in. No pressure to talk — just wanted you to know I care.` },
    { id: 'support-5', tone: 'warm', message: `You've been on my mind. Here if you want to talk, or just want company.` },
  );

  // RECONNECTION messages (after time apart)
  messages.push(
    { id: 'reconnect-1', tone: 'light', message: `It's been way too long. When can we catch up?` },
    { id: 'reconnect-2', tone: 'warm', message: `I let too much time pass. Can we fix that?` },
    { id: 'reconnect-3', tone: 'light', message: `Life got in the way but I'm here now. Miss you.` },
    { id: 'reconnect-4', tone: 'curious', message: `Tell me everything I missed. I have time.` },
    { id: 'reconnect-5', tone: 'warm', message: `I should have reached out sooner. Here now. ❤️` },
  );

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
