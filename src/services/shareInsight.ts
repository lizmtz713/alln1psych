/**
 * Share Insight Service
 * 
 * Enables users to share what they've learned with loved ones.
 * "I learned something important. I want you to understand me better."
 */

import { supabase } from '../lib/supabase';
import { useCockpitStore, type GaugeKey, type SystemMode } from '../stores/cockpitStore';
import { useUserStore } from '../stores/userStore';
import { useCircleStore, type CircleMember } from '../stores/circleStore';
import { getPersonality, type PersonalityPeriod } from './personology';
import { analyzeSystemicDrift, type DriftPattern } from './systemicDrift';
import type { Discovery } from '../data/discoveries';
import type { ManualLesson, LessonContent } from '../data/manualContent';

// ============================================
// Types
// ============================================

export type InsightType = 'gauge-status' | 'lesson' | 'discovery' | 'personology' | 'operating-snapshot';

export interface GaugeReading {
  key: GaugeKey;
  value: number;
  trend: 'improving' | 'stable' | 'declining' | null;
}

export interface GaugeStatusInsight {
  type: 'gauge-status';
  senderName: string;
  gauges: GaugeReading[];
  systemMode: SystemMode;
  centerScore: number;
  context: string; // "I'm feeling X because..."
  personalNote?: string;
  timestamp: string;
}

export interface LessonInsight {
  type: 'lesson';
  senderName: string;
  lessonId: string;
  lessonTitle: string;
  lessonEmoji: string;
  summary: string;
  keyTakeaway?: string;
  whySharing: string; // "This helped me understand..."
  personalNote?: string;
  timestamp: string;
}

export interface DiscoveryInsight {
  type: 'discovery';
  senderName: string;
  discoveryId: string;
  title: string;
  emoji: string;
  category: string;
  content: string;
  expanded?: string;
  whySharing: string;
  personalNote?: string;
  timestamp: string;
}

export interface PersonologyInsight {
  type: 'personology';
  senderName: string;
  personality: PersonalityPeriod;
  birthday: string;
  highlights: {
    strengths: string[];
    challenges: string[];
    communicationStyle: string;
    needsInRelationships: string;
    stressResponse: string;
  };
  personalNote?: string;
  timestamp: string;
}

/**
 * Operating Snapshot — A relational translation of how someone works
 * "Here's my manual so you can understand me better"
 */
export interface OperatingSnapshotInsight {
  type: 'operating-snapshot';
  senderName: string;
  systemMode: SystemMode;
  currentState: {
    summary: string; // "I'm in stabilization mode right now"
    primaryNeeds: string[]; // What I need most right now
  };
  patterns: {
    sensitivities: string[]; // "When I'm low on sleep, I tend to withdraw"
    warningSignsFor: string[]; // "If I seem distant, check my State"
    whatHelps: string[]; // "I need quiet time to recharge"
  };
  supportGuide: {
    doThis: string[]; // Concrete helpful actions
    avoidThis: string[]; // What not to do
    checkIn: string; // How to check in with me
  };
  recentPatterns: string[]; // Plain-language patterns from drift analysis
  lastUpdated: string;
  personalNote?: string;
  timestamp: string;
}

export type ShareableInsight = 
  | GaugeStatusInsight 
  | LessonInsight 
  | DiscoveryInsight 
  | PersonologyInsight
  | OperatingSnapshotInsight;

export interface ShareResult {
  success: boolean;
  shareId?: string;
  shareUrl?: string;
  error?: string;
}

export interface SendToCircleResult {
  success: boolean;
  memberId: string;
  error?: string;
}

// ============================================
// Gauge Status Helpers
// ============================================

const GAUGE_LABELS: Record<GaugeKey, string> = {
  body: 'Body',
  state: 'Mental State',
  emotion: 'Emotion',
  connection: 'Connection',
  direction: 'Direction',
  alignment: 'Alignment',
};

const GAUGE_DESCRIPTIONS: Record<GaugeKey, { low: string; mid: string; high: string }> = {
  body: {
    low: 'physically depleted (sleep, food, water, or movement needs attention)',
    mid: 'body needs are met but not optimal',
    high: 'feeling physically grounded and energized',
  },
  state: {
    low: 'overwhelmed or mentally exhausted',
    mid: 'managing but at capacity',
    high: 'mentally clear and focused',
  },
  emotion: {
    low: 'emotionally heavy or struggling',
    mid: 'emotionally present but processing',
    high: 'emotionally balanced and open',
  },
  connection: {
    low: 'feeling disconnected or isolated',
    mid: 'some connection but wanting more',
    high: 'feeling connected and supported',
  },
  direction: {
    low: 'unclear on direction or purpose',
    mid: 'moving forward but searching',
    high: 'clear sense of purpose and momentum',
  },
  alignment: {
    low: 'living out of alignment with values',
    mid: 'partially aligned, some friction',
    high: 'living in alignment with what matters',
  },
};

function getGaugeDescription(key: GaugeKey, value: number): string {
  const desc = GAUGE_DESCRIPTIONS[key];
  if (value < 40) return desc.low;
  if (value < 70) return desc.mid;
  return desc.high;
}

function getOverallStatusMessage(mode: SystemMode, centerScore: number): string {
  if (mode === 'stabilization') {
    if (centerScore < 30) return 'I\'m going through a really difficult time right now';
    return 'I\'m working on stabilizing — foundation needs some attention';
  }
  if (centerScore < 50) return 'I\'m managing, but could use some support';
  if (centerScore < 70) return 'I\'m doing okay overall';
  return 'I\'m feeling pretty good right now';
}

// ============================================
// Operating Snapshot Helpers
// ============================================

/**
 * Generate sensitivities based on gauge patterns
 * "When I'm low on X, I tend to Y"
 */
function generateSensitivities(gauges: GaugeReading[], patterns: DriftPattern[]): string[] {
  const sensitivities: string[] = [];
  
  // Low body -> behavioral impacts
  const bodyGauge = gauges.find(g => g.key === 'body');
  if (bodyGauge && bodyGauge.value < 50) {
    sensitivities.push('When I\'m low on sleep or physically depleted, I tend to be less patient');
  }
  
  // Low state -> mental impacts
  const stateGauge = gauges.find(g => g.key === 'state');
  if (stateGauge && stateGauge.value < 50) {
    sensitivities.push('When my mental state is strained, I may seem distant or preoccupied');
  }
  
  // Low connection -> social impacts
  const connectionGauge = gauges.find(g => g.key === 'connection');
  if (connectionGauge && connectionGauge.value < 50) {
    sensitivities.push('When I\'m feeling disconnected, I tend to withdraw — but I still need people');
  }
  
  // Low emotion -> emotional impacts
  const emotionGauge = gauges.find(g => g.key === 'emotion');
  if (emotionGauge && emotionGauge.value < 50) {
    sensitivities.push('When I\'m emotionally heavy, small things might feel bigger than they are');
  }
  
  // Add pattern-based sensitivities
  const weeklyPatterns = patterns.filter(p => p.type === 'weekly_drop');
  for (const pattern of weeklyPatterns.slice(0, 2)) {
    const match = pattern.description.match(/(\w+) tends to drop on (\w+)s/);
    if (match) {
      const [, gauge, day] = match;
      sensitivities.push(`${day}s tend to be harder for me (${gauge.toLowerCase()} usually dips)`);
    }
  }
  
  return sensitivities.slice(0, 4);
}

/**
 * Generate warning signs for loved ones
 * "If I seem X, check my Y"
 */
function generateWarningSignsFor(gauges: GaugeReading[], mode: SystemMode): string[] {
  const signs: string[] = [];
  
  // Find lowest gauges as warning indicators
  const sortedGauges = [...gauges].sort((a, b) => a.value - b.value);
  const lowestGauges = sortedGauges.filter(g => g.value < 60).slice(0, 3);
  
  for (const gauge of lowestGauges) {
    switch (gauge.key) {
      case 'body':
        signs.push('If I seem tired or snappy, my body needs are probably not met');
        break;
      case 'state':
        signs.push('If I seem scattered or overwhelmed, my mental state needs attention');
        break;
      case 'emotion':
        signs.push('If I seem reactive or tearful, I\'m processing heavy emotions');
        break;
      case 'connection':
        signs.push('If I seem distant, I might actually be craving connection');
        break;
      case 'direction':
        signs.push('If I seem lost or aimless, I\'m working through questions about purpose');
        break;
      case 'alignment':
        signs.push('If I seem frustrated, I might be feeling out of alignment with my values');
        break;
    }
  }
  
  if (mode === 'stabilization') {
    signs.unshift('I\'m in a protective mode right now — extra patience helps');
  }
  
  return signs.slice(0, 3);
}

/**
 * Generate what helps based on current needs
 */
function generateWhatHelps(gauges: GaugeReading[], mode: SystemMode): string[] {
  const helps: string[] = [];
  
  // Find gauges that need attention
  const needsAttention = gauges.filter(g => g.value < 50);
  
  for (const gauge of needsAttention.slice(0, 3)) {
    switch (gauge.key) {
      case 'body':
        helps.push('Encouragement to rest, eat, or take a walk');
        break;
      case 'state':
        helps.push('Quiet time and space to decompress');
        break;
      case 'emotion':
        helps.push('Someone to listen without trying to fix');
        break;
      case 'connection':
        helps.push('Quality time — even just sitting together');
        break;
      case 'direction':
        helps.push('Encouragement and reminders of my strengths');
        break;
      case 'alignment':
        helps.push('Support in making choices that feel right');
        break;
    }
  }
  
  if (mode === 'stabilization') {
    helps.push('Patience and understanding while I rebuild my foundation');
  } else if (helps.length === 0) {
    helps.push('I\'m doing well — your presence is enough');
  }
  
  return helps.slice(0, 4);
}

/**
 * Generate support guide actions
 */
function generateSupportGuide(gauges: GaugeReading[], mode: SystemMode): {
  doThis: string[];
  avoidThis: string[];
  checkIn: string;
} {
  const doThis: string[] = [];
  const avoidThis: string[] = [];
  
  // Common helpful actions
  doThis.push('Ask how I\'m doing and actually listen');
  doThis.push('Give me space when I need it');
  
  // Common things to avoid
  avoidThis.push('Don\'t take my mood personally');
  
  // Mode-specific guidance
  if (mode === 'stabilization') {
    doThis.push('Help me focus on basics (sleep, food, rest)');
    doThis.push('Remind me that this phase will pass');
    avoidThis.push('Avoid pressuring me to "just feel better"');
    avoidThis.push('Don\'t bring up big decisions right now');
  } else {
    doThis.push('Celebrate small wins with me');
    avoidThis.push('Avoid adding unnecessary stress to my plate');
  }
  
  // Gauge-specific guidance
  const lowConnection = gauges.find(g => g.key === 'connection' && g.value < 50);
  if (lowConnection) {
    doThis.push('Reach out — even if I seem withdrawn');
    avoidThis.push('Don\'t assume I want to be alone');
  }
  
  const lowBody = gauges.find(g => g.key === 'body' && g.value < 50);
  if (lowBody) {
    doThis.push('Encourage (don\'t force) self-care');
  }
  
  // Check-in guidance
  let checkIn = 'A simple "How are you really doing?" goes a long way';
  if (mode === 'stabilization') {
    checkIn = 'Check in gently — "Is there anything you need right now?"';
  }
  
  return {
    doThis: doThis.slice(0, 4),
    avoidThis: avoidThis.slice(0, 3),
    checkIn,
  };
}

/**
 * Convert drift patterns to plain-language recent patterns
 */
function convertPatternsToPlainLanguage(patterns: DriftPattern[]): string[] {
  const plainPatterns: string[] = [];
  
  for (const pattern of patterns.slice(0, 4)) {
    // Use the insight directly as it's already plain language
    if (pattern.insight) {
      plainPatterns.push(pattern.insight);
    }
  }
  
  return plainPatterns;
}

/**
 * Generate primary needs based on current state
 */
function generatePrimaryNeeds(gauges: GaugeReading[], mode: SystemMode): string[] {
  const needs: string[] = [];
  
  // Sort gauges by value (lowest first = highest priority)
  const sortedGauges = [...gauges].sort((a, b) => a.value - b.value);
  const lowGauges = sortedGauges.filter(g => g.value < 50);
  
  for (const gauge of lowGauges.slice(0, 3)) {
    switch (gauge.key) {
      case 'body':
        needs.push('Physical recovery (sleep, rest, nourishment)');
        break;
      case 'state':
        needs.push('Mental space and reduced demands');
        break;
      case 'emotion':
        needs.push('Emotional support and processing time');
        break;
      case 'connection':
        needs.push('Meaningful connection with people I care about');
        break;
      case 'direction':
        needs.push('Time to reflect on what matters to me');
        break;
      case 'alignment':
        needs.push('Freedom to make choices that align with my values');
        break;
    }
  }
  
  if (needs.length === 0) {
    needs.push('Continuing what\'s working');
  }
  
  return needs;
}

/**
 * Generate an Operating Snapshot — a relational translation of how someone works
 * This is meant to be shared with loved ones to help them understand and support better
 */
export async function generateOperatingSnapshot(
  personalNote?: string
): Promise<OperatingSnapshotInsight | null> {
  try {
    const userName = useUserStore.getState().name || 'Someone';
    const cockpit = useCockpitStore.getState();
    const timestamp = new Date().toISOString();
    
    // Get current gauges
    const gauges: GaugeReading[] = (['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as GaugeKey[])
      .filter(key => cockpit[key].value >= 0)
      .map(key => ({
        key,
        value: cockpit[key].value,
        trend: cockpit[key].trend,
      }));
    
    if (gauges.length === 0) {
      return null; // Need at least some gauge data
    }
    
    // Get drift patterns for pattern analysis
    const driftPatterns = await analyzeSystemicDrift();
    
    // Generate all components
    const sensitivities = generateSensitivities(gauges, driftPatterns);
    const warningSignsFor = generateWarningSignsFor(gauges, cockpit.systemMode);
    const whatHelps = generateWhatHelps(gauges, cockpit.systemMode);
    const supportGuide = generateSupportGuide(gauges, cockpit.systemMode);
    const recentPatterns = convertPatternsToPlainLanguage(driftPatterns);
    const primaryNeeds = generatePrimaryNeeds(gauges, cockpit.systemMode);
    
    const centerScore = cockpit.getOverallRegulation() >= 0 ? cockpit.getOverallRegulation() : 0;
    // Current state summary
    const currentStateSummary = cockpit.systemMode === 'stabilization'
      ? 'I\'m in a rebuilding phase — taking care of foundation needs'
      : centerScore >= 70
        ? 'I\'m feeling grounded and capable'
        : centerScore >= 50
          ? 'I\'m managing well, with some areas that need attention'
          : 'I\'m going through a challenging time and could use support';
    
    return {
      type: 'operating-snapshot',
      senderName: userName,
      systemMode: cockpit.systemMode,
      currentState: {
        summary: currentStateSummary,
        primaryNeeds,
      },
      patterns: {
        sensitivities,
        warningSignsFor,
        whatHelps,
      },
      supportGuide,
      recentPatterns,
      lastUpdated: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      personalNote,
      timestamp,
    };
  } catch (error) {
    console.error('Generate operating snapshot error:', error);
    return null;
  }
}

// ============================================
// Core Functions
// ============================================

/**
 * Generate a shareable insight from app content
 */
export function generateShareableInsight(
  type: InsightType,
  data: {
    // For gauge-status
    context?: string;
    // For lesson
    lesson?: ManualLesson;
    lessonContent?: LessonContent;
    whySharing?: string;
    // For discovery
    discovery?: Discovery;
    // For personology - uses current user's data
    // Common
    personalNote?: string;
  }
): ShareableInsight | null {
  const userName = useUserStore.getState().name || 'Someone';
  const timestamp = new Date().toISOString();

  switch (type) {
    case 'gauge-status': {
      const cockpit = useCockpitStore.getState();
      const gauges: GaugeReading[] = (['body', 'state', 'emotion', 'connection', 'direction', 'alignment'] as GaugeKey[])
        .filter(key => cockpit[key].value >= 0)
        .map(key => ({
          key,
          value: cockpit[key].value,
          trend: cockpit[key].trend,
        }));
      const centerScore = cockpit.getOverallRegulation() >= 0 ? cockpit.getOverallRegulation() : 0;
      return {
        type: 'gauge-status',
        senderName: userName,
        gauges,
        systemMode: cockpit.systemMode,
        centerScore,
        context: data.context || getOverallStatusMessage(cockpit.systemMode, centerScore),
        personalNote: data.personalNote,
        timestamp,
      };
    }

    case 'lesson': {
      if (!data.lesson || !data.lessonContent) return null;
      
      return {
        type: 'lesson',
        senderName: userName,
        lessonId: data.lesson.id,
        lessonTitle: data.lesson.title,
        lessonEmoji: data.lesson.emoji,
        summary: data.lessonContent.introduction,
        keyTakeaway: data.lessonContent.keyConcepts[0]?.explanation,
        whySharing: data.whySharing || 'I found this helpful and wanted to share it with you',
        personalNote: data.personalNote,
        timestamp,
      };
    }

    case 'discovery': {
      if (!data.discovery) return null;

      return {
        type: 'discovery',
        senderName: userName,
        discoveryId: data.discovery.id,
        title: data.discovery.title,
        emoji: data.discovery.emoji,
        category: data.discovery.category,
        content: data.discovery.content,
        expanded: data.discovery.expanded,
        whySharing: data.whySharing || 'I learned something interesting and wanted to share',
        personalNote: data.personalNote,
        timestamp,
      };
    }

    case 'personology': {
      const userStore = useUserStore.getState();
      const birthday = userStore.birthday;
      if (!birthday) return null;

      const personality = getPersonality(birthday);
      if (!personality) return null;

      return {
        type: 'personology',
        senderName: userName,
        personality,
        birthday,
        highlights: {
          strengths: personality.strengths,
          challenges: personality.challenges,
          communicationStyle: personality.communicationStyle,
          needsInRelationships: personality.needsInRelationships,
          stressResponse: personality.stressResponse,
        },
        personalNote: data.personalNote,
        timestamp,
      };
    }

    default:
      return null;
  }
}

/**
 * Create a web-viewable share link
 */
export async function createShareLink(insight: ShareableInsight): Promise<ShareResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/share-insight-v2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({
          insightType: insight.type,
          insightData: insight,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to create share link' };
    }

    const result = await response.json();
    return {
      success: true,
      shareId: result.id,
      shareUrl: result.url || `https://ingauge.app/shared/${result.id}`,
    };
  } catch (error) {
    console.error('Create share link error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send insight directly to a Circle member
 */
export async function sendToCircleMember(
  memberId: string,
  insight: ShareableInsight
): Promise<SendToCircleResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, memberId, error: 'Not authenticated' };
    }

    const member = useCircleStore.getState().members.find(m => m.id === memberId);
    if (!member) {
      return { success: false, memberId, error: 'Circle member not found' };
    }

    // Create the share link first
    const shareResult = await createShareLink(insight);
    if (!shareResult.success || !shareResult.shareUrl) {
      return { success: false, memberId, error: shareResult.error || 'Failed to create share' };
    }

    // Store in-app notification for the circle member
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/circle-share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          memberId,
          memberName: member.name,
          shareId: shareResult.shareId,
          shareUrl: shareResult.shareUrl,
          insightType: insight.type,
          senderName: insight.senderName,
        }),
      }
    );

    if (!response.ok) {
      // Even if circle notification fails, the share link exists
      console.warn('Circle notification failed, but share link created');
    }

    return { success: true, memberId };
  } catch (error) {
    console.error('Send to circle member error:', error);
    return { success: false, memberId, error: 'Failed to send' };
  }
}

/**
 * Get human-readable description of the insight for sharing
 */
export function getInsightShareText(insight: ShareableInsight): string {
  switch (insight.type) {
    case 'gauge-status': {
      const lines = [
        `${insight.senderName} shared how they're feeling:`,
        '',
        insight.context,
        '',
      ];
      
      if (insight.gauges.length > 0) {
        insight.gauges.forEach(g => {
          const label = GAUGE_LABELS[g.key];
          const desc = getGaugeDescription(g.key, g.value);
          lines.push(`• ${label}: ${desc}`);
        });
      }
      
      if (insight.personalNote) {
        lines.push('', `"${insight.personalNote}"`);
      }
      
      return lines.join('\n');
    }

    case 'lesson': {
      return `${insight.senderName} shared a lesson from InGauge:\n\n${insight.lessonEmoji} ${insight.lessonTitle}\n\n"${insight.whySharing}"${insight.personalNote ? `\n\n${insight.personalNote}` : ''}`;
    }

    case 'discovery': {
      return `${insight.senderName} shared a discovery:\n\n${insight.emoji} ${insight.title}\n\n${insight.content}${insight.personalNote ? `\n\n"${insight.personalNote}"` : ''}`;
    }

    case 'personology': {
      return `${insight.senderName} shared their personality profile:\n\n${insight.personality.name}\n\nCommunication style: ${insight.highlights.communicationStyle}\n\nWhat I need in relationships: ${insight.highlights.needsInRelationships}${insight.personalNote ? `\n\n"${insight.personalNote}"` : ''}`;
    }

    case 'operating-snapshot': {
      const lines = [
        `📖 ${insight.senderName}'s Operating Snapshot`,
        `Updated ${insight.lastUpdated}`,
        '',
        `🎯 Current State: ${insight.currentState.summary}`,
        '',
        '💡 What helps me right now:',
        ...insight.patterns.whatHelps.map(h => `• ${h}`),
        '',
        '🔔 If you notice warning signs:',
        ...insight.patterns.warningSignsFor.map(w => `• ${w}`),
        '',
        '❤️ How to support me:',
        ...insight.supportGuide.doThis.map(d => `✓ ${d}`),
        '',
        insight.supportGuide.checkIn,
      ];
      
      if (insight.personalNote) {
        lines.push('', `"${insight.personalNote}"`);
      }
      
      return lines.join('\n');
    }

    default:
      return '';
  }
}

/**
 * Get a message template based on insight type
 */
export function getShareMessageTemplate(insight: ShareableInsight): string {
  switch (insight.type) {
    case 'gauge-status':
      return 'I wanted to share how I\'m feeling right now so you can understand me better.';
    case 'lesson':
      return 'I learned something that helped me and wanted to share it with you.';
    case 'discovery':
      return 'I found this interesting and thought you might like it too.';
    case 'personology':
      return 'Here\'s a bit about how I\'m wired — thought it might help you understand me better.';
    case 'operating-snapshot':
      return 'Here\'s my "operating manual" — a guide to understanding and supporting me better.';
    default:
      return 'I wanted to share this with you.';
  }
}

// Export utility functions
export { getGaugeDescription, getOverallStatusMessage, GAUGE_LABELS };
