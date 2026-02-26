/**
 * Post-Flight Debrief — Recursive Feedback Loop
 * 
 * Philosophy:
 * - Most apps tell you what happened; we tell you how to change what happens next
 * - 24-hour follow-up after tool use: "Did the intervention work?"
 * - Learn what works FOR THIS SPECIFIC USER
 * - Self-correcting recommendations over time
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type GaugeKey } from '../stores/cockpitStore';

const DEBRIEF_QUEUE_KEY = 'post_flight_debrief_queue';
const DEBRIEF_HISTORY_KEY = 'post_flight_debrief_history';
const TOOL_EFFECTIVENESS_KEY = 'tool_effectiveness_data';

export type ToolType = 
  | 'quick-reset'
  | 'replay' 
  | 'relate'
  | 'decode'
  | 'role-play'
  | 'journal'
  | 'help'
  | 'talk';

export interface ToolUsage {
  id: string;
  tool: ToolType;
  timestamp: number;
  gaugesBefore: Record<GaugeKey, number>;
  targetGauge?: GaugeKey; // Which gauge was this meant to help
  context?: string; // Brief context of what they were working on
  debriefScheduled: number; // When to follow up (24hrs later)
  debriefCompleted: boolean;
}

export interface DebriefResponse {
  usageId: string;
  gaugesAfter: Record<GaugeKey, number>;
  feltHelpful: 'yes' | 'somewhat' | 'no';
  whatHelped?: string;
  whatDidnt?: string;
  wouldUseAgain: boolean;
  timestamp: number;
}

export interface ToolEffectiveness {
  tool: ToolType;
  totalUses: number;
  helpfulCount: number;
  somewhatCount: number;
  notHelpfulCount: number;
  averageGaugeImprovement: Record<GaugeKey, number>;
  bestForGauges: GaugeKey[];
  userNotes: string[];
}

const TOOL_LABELS: Record<ToolType, string> = {
  'quick-reset': 'Quick Reset',
  'replay': 'Replay',
  'relate': 'Relate',
  'decode': 'Decode',
  'role-play': 'Role Play',
  'journal': 'Journal',
  'help': 'Help Someone',
  'talk': 'Talk to Gauge',
};

const TOOL_TARGET_GAUGES: Record<ToolType, GaugeKey[]> = {
  'quick-reset': ['state', 'body'],
  'replay': ['emotion', 'state'],
  'relate': ['connection'],
  'decode': ['emotion', 'connection'],
  'role-play': ['connection', 'alignment'],
  'journal': ['emotion', 'direction', 'alignment'],
  'help': ['connection', 'direction'],
  'talk': ['emotion', 'state'],
};

// ============ Recording Tool Usage ============

/**
 * Record when a user starts using a tool
 * Call this when they open a tool modal
 */
export async function recordToolUsage(
  tool: ToolType,
  currentGauges: Record<GaugeKey, number>,
  context?: string
): Promise<string> {
  const id = `usage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  
  const usage: ToolUsage = {
    id,
    tool,
    timestamp: now,
    gaugesBefore: { ...currentGauges },
    targetGauge: TOOL_TARGET_GAUGES[tool]?.[0],
    context,
    debriefScheduled: now + (24 * 60 * 60 * 1000), // 24 hours later
    debriefCompleted: false,
  };

  // Add to queue
  const queue = await getDebriefQueue();
  queue.push(usage);
  
  // Keep only last 20 pending debriefs
  const trimmed = queue.slice(-20);
  await AsyncStorage.setItem(DEBRIEF_QUEUE_KEY, JSON.stringify(trimmed));

  return id;
}

/**
 * Get pending debriefs that are due
 */
export async function getDebriefQueue(): Promise<ToolUsage[]> {
  const data = await AsyncStorage.getItem(DEBRIEF_QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get debriefs that are ready for follow-up (24+ hours passed)
 */
export async function getPendingDebriefs(): Promise<ToolUsage[]> {
  const queue = await getDebriefQueue();
  const now = Date.now();
  
  return queue.filter(u => 
    !u.debriefCompleted && 
    u.debriefScheduled <= now
  );
}

/**
 * Check if any debrief is due (for notifications)
 */
export async function hasDebriefDue(): Promise<{ due: boolean; usage?: ToolUsage }> {
  const pending = await getPendingDebriefs();
  if (pending.length === 0) {
    return { due: false };
  }
  
  // Return oldest pending
  const oldest = pending.sort((a, b) => a.debriefScheduled - b.debriefScheduled)[0];
  return { due: true, usage: oldest };
}

// ============ Recording Debrief Responses ============

/**
 * Record user's debrief response
 */
export async function recordDebriefResponse(
  usageId: string,
  currentGauges: Record<GaugeKey, number>,
  feltHelpful: 'yes' | 'somewhat' | 'no',
  wouldUseAgain: boolean,
  whatHelped?: string,
  whatDidnt?: string
): Promise<void> {
  const response: DebriefResponse = {
    usageId,
    gaugesAfter: { ...currentGauges },
    feltHelpful,
    whatHelped,
    whatDidnt,
    wouldUseAgain,
    timestamp: Date.now(),
  };

  // Save response to history
  const history = await getDebriefHistory();
  history.push(response);
  await AsyncStorage.setItem(DEBRIEF_HISTORY_KEY, JSON.stringify(history.slice(-100)));

  // Mark usage as completed
  const queue = await getDebriefQueue();
  const updated = queue.map(u => 
    u.id === usageId ? { ...u, debriefCompleted: true } : u
  );
  await AsyncStorage.setItem(DEBRIEF_QUEUE_KEY, JSON.stringify(updated));

  // Update effectiveness data
  const usage = queue.find(u => u.id === usageId);
  if (usage) {
    await updateToolEffectiveness(usage, response);
  }
}

/**
 * Get debrief history
 */
export async function getDebriefHistory(): Promise<DebriefResponse[]> {
  const data = await AsyncStorage.getItem(DEBRIEF_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

// ============ Tool Effectiveness Learning ============

/**
 * Update effectiveness data based on debrief
 */
async function updateToolEffectiveness(
  usage: ToolUsage,
  response: DebriefResponse
): Promise<void> {
  const effectiveness = await getToolEffectiveness();
  
  const tool = usage.tool;
  if (!effectiveness[tool]) {
    effectiveness[tool] = {
      tool,
      totalUses: 0,
      helpfulCount: 0,
      somewhatCount: 0,
      notHelpfulCount: 0,
      averageGaugeImprovement: {
        body: 0, state: 0, emotion: 0,
        connection: 0, direction: 0, alignment: 0,
      },
      bestForGauges: [],
      userNotes: [],
    };
  }

  const data = effectiveness[tool];
  data.totalUses++;
  
  if (response.feltHelpful === 'yes') data.helpfulCount++;
  else if (response.feltHelpful === 'somewhat') data.somewhatCount++;
  else data.notHelpfulCount++;

  // Calculate gauge improvements
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  for (const gauge of gauges) {
    const before = usage.gaugesBefore[gauge] ?? 50;
    const after = response.gaugesAfter[gauge] ?? 50;
    const improvement = after - before;
    
    // Running average
    const prevAvg = data.averageGaugeImprovement[gauge] || 0;
    data.averageGaugeImprovement[gauge] = 
      (prevAvg * (data.totalUses - 1) + improvement) / data.totalUses;
  }

  // Update best-for gauges (where average improvement > 5)
  data.bestForGauges = gauges.filter(g => 
    (data.averageGaugeImprovement[g] || 0) > 5
  );

  // Store user notes
  if (response.whatHelped) {
    data.userNotes.push(`✓ ${response.whatHelped}`);
  }
  if (response.whatDidnt) {
    data.userNotes.push(`✗ ${response.whatDidnt}`);
  }
  data.userNotes = data.userNotes.slice(-10); // Keep last 10

  await AsyncStorage.setItem(TOOL_EFFECTIVENESS_KEY, JSON.stringify(effectiveness));
}

/**
 * Get tool effectiveness data
 */
export async function getToolEffectiveness(): Promise<Record<ToolType, ToolEffectiveness>> {
  const data = await AsyncStorage.getItem(TOOL_EFFECTIVENESS_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * Get personalized tool recommendation based on current gauge state
 */
export async function getPersonalizedToolRecommendation(
  currentGauges: Record<GaugeKey, number>,
  targetGauge?: GaugeKey
): Promise<{
  recommended: ToolType;
  reason: string;
  effectiveness: number; // 0-100
  alternatives: ToolType[];
} | null> {
  const effectiveness = await getToolEffectiveness();
  
  // Find gauge that needs most help
  const gauges: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];
  const target = targetGauge || gauges.reduce((lowest, g) => 
    (currentGauges[g] ?? 50) < (currentGauges[lowest] ?? 50) ? g : lowest
  , gauges[0]);

  // Find tools that work best for this gauge
  const tools: ToolType[] = ['quick-reset', 'replay', 'relate', 'decode', 'role-play', 'journal', 'help', 'talk'];
  
  const scored = tools.map(tool => {
    const data = effectiveness[tool];
    if (!data || data.totalUses < 2) {
      // Not enough data, use default mapping
      const isDefault = TOOL_TARGET_GAUGES[tool]?.includes(target);
      return { tool, score: isDefault ? 50 : 30, reason: 'default' };
    }

    const avgImprovement = data.averageGaugeImprovement[target] || 0;
    const helpRate = (data.helpfulCount + data.somewhatCount * 0.5) / data.totalUses;
    const score = (avgImprovement * 2) + (helpRate * 50);
    
    return { tool, score, reason: 'learned' };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  
  if (!best) return null;

  const data = effectiveness[best.tool];
  const helpRate = data 
    ? Math.round(((data.helpfulCount + data.somewhatCount * 0.5) / data.totalUses) * 100)
    : 50;

  return {
    recommended: best.tool,
    reason: best.reason === 'learned'
      ? `Based on your history, ${TOOL_LABELS[best.tool]} has helped your ${target} gauge ${helpRate}% of the time.`
      : `${TOOL_LABELS[best.tool]} is designed to help with ${target}.`,
    effectiveness: helpRate,
    alternatives: scored.slice(1, 3).map(s => s.tool),
  };
}

// ============ Debrief Prompt Generation ============

/**
 * Generate the debrief prompt for a specific tool usage
 */
export function generateDebriefPrompt(usage: ToolUsage): {
  title: string;
  question: string;
  context: string;
} {
  const toolLabel = TOOL_LABELS[usage.tool];
  const timeAgo = getTimeAgo(usage.timestamp);
  
  return {
    title: `Quick Check-in: ${toolLabel}`,
    question: `You used ${toolLabel} ${timeAgo}. Did it help?`,
    context: usage.context || `Working on your ${usage.targetGauge || 'wellbeing'}`,
  };
}

function getTimeAgo(timestamp: number): string {
  const hours = Math.round((Date.now() - timestamp) / (1000 * 60 * 60));
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'yesterday';
  return `${Math.round(hours / 24)} days ago`;
}

/**
 * Skip a debrief (user doesn't want to answer)
 */
export async function skipDebrief(usageId: string): Promise<void> {
  const queue = await getDebriefQueue();
  const updated = queue.map(u => 
    u.id === usageId ? { ...u, debriefCompleted: true } : u
  );
  await AsyncStorage.setItem(DEBRIEF_QUEUE_KEY, JSON.stringify(updated));
}
