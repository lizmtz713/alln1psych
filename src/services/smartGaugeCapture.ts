/**
 * Smart Gauge Capture — Intelligent inference for Connection, Direction, and Alignment
 * 
 * Philosophy:
 * - Body/State/Emotion have direct measurement (check-ins, HealthKit, etc.)
 * - Connection/Direction/Alignment require inference from:
 *   - Journal entries
 *   - AI conversations
 *   - Check-in patterns
 *   - Time-based patterns
 * 
 * This service analyzes text and behavioral patterns to suggest gauge updates.
 * Never auto-updates — always returns suggestions with confidence scores.
 */

import { useCockpitStore, type GaugeKey } from '../stores/cockpitStore';
import { useJournalStore, type JournalEntry } from '../stores/journalStore';
import { useConversationStore, type ConversationMessage } from '../stores/conversationStore';
import { useConversationSummaryStore, type ConversationSummary } from '../stores/conversationSummaryStore';
import { useCircleStore } from '../stores/circleStore';

// ============================================================================
// TYPES
// ============================================================================

export type SmartGaugeKey = 'connection' | 'direction' | 'alignment';

export type IndicatorCategory = 
  | 'social_mention'      // Names, relationships, "we", "they"
  | 'loneliness'          // Isolation language
  | 'social_plans'        // Future social activities
  | 'goal_language'       // Goals, targets, aspirations
  | 'purpose_language'    // Meaning, why, purpose
  | 'motivation'          // Energy, drive, excitement
  | 'drift'               // Aimlessness, lost, stuck
  | 'values_conflict'     // Should vs want, guilt
  | 'authenticity'        // Real self, true, honest
  | 'compromise'          // Settling, giving up
  | 'alignment_positive'; // Living values, integrity

export interface TextIndicator {
  category: IndicatorCategory;
  matches: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  weight: number; // 0-1, how much this indicator matters
}

export interface GaugeSuggestion {
  gauge: SmartGaugeKey;
  suggestedValue: number; // 0-100
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  indicators: TextIndicator[];
  source: 'text_analysis' | 'pattern_analysis' | 'time_based' | 'combined';
}

export interface TextAnalysisResult {
  connection: {
    score: number; // 0-100
    indicators: TextIndicator[];
    summary: string;
  };
  direction: {
    score: number;
    indicators: TextIndicator[];
    summary: string;
  };
  alignment: {
    score: number;
    indicators: TextIndicator[];
    summary: string;
  };
}

// ============================================================================
// KEYWORD DICTIONARIES
// ============================================================================

/**
 * Connection Indicators
 * Looks for: social mentions, relationship quality, loneliness, isolation
 */
const CONNECTION_POSITIVE = {
  social_mention: [
    // Relationship words
    'friend', 'friends', 'family', 'mom', 'dad', 'brother', 'sister', 'partner',
    'husband', 'wife', 'boyfriend', 'girlfriend', 'colleague', 'coworker',
    'neighbor', 'roommate', 'buddy', 'pal',
    // Group words
    'we', 'us', 'our', 'together', 'group', 'team', 'community',
    // Social verbs
    'hung out', 'met up', 'called', 'texted', 'talked to', 'visited',
    'dinner with', 'lunch with', 'coffee with', 'went out with',
  ],
  social_plans: [
    'meeting up', 'plans with', 'seeing', 'going to see', 'invited',
    'party', 'gathering', 'get-together', 'hangout', 'date',
    'looking forward to seeing', 'excited to see', 'can\'t wait to',
  ],
  connection_quality: [
    'supported', 'understood', 'heard', 'seen', 'loved', 'cared for',
    'connected', 'belonging', 'accepted', 'appreciated', 'valued',
    'good conversation', 'deep talk', 'opened up', 'real connection',
    'feels good to talk', 'nice to be around',
  ],
};

const CONNECTION_NEGATIVE = {
  loneliness: [
    'alone', 'lonely', 'isolated', 'no one', 'nobody', 'by myself',
    'haven\'t talked to anyone', 'haven\'t seen anyone', 'no friends',
    'feel invisible', 'no one understands', 'no one cares',
    'pushed everyone away', 'don\'t want to bother anyone',
  ],
  disconnection: [
    'distant', 'disconnected', 'withdrawn', 'avoiding people',
    'don\'t want to see anyone', 'can\'t relate', 'feel different',
    'don\'t fit in', 'outsider', 'left out', 'excluded',
    'fake', 'surface level', 'shallow conversations',
  ],
  conflict: [
    'fight', 'argument', 'falling out', 'not talking to',
    'hurt by', 'betrayed', 'let down', 'disappointed by',
    'don\'t trust', 'can\'t rely on', 'toxic', 'draining',
  ],
};

/**
 * Direction Indicators
 * Looks for: goals, purpose, motivation, meaning
 */
const DIRECTION_POSITIVE = {
  goal_language: [
    'goal', 'goals', 'target', 'aim', 'aspire', 'aspiration',
    'working toward', 'working on', 'planning to', 'going to',
    'want to achieve', 'dream of', 'hope to', 'looking forward to',
    'milestone', 'progress', 'step toward', 'on track',
  ],
  purpose_language: [
    'purpose', 'meaning', 'meaningful', 'matters', 'important to me',
    'why I', 'reason for', 'calling', 'passion', 'what I\'m here for',
    'makes a difference', 'contributing', 'impact',
    'legacy', 'bigger than me', 'something to work toward',
  ],
  motivation: [
    'motivated', 'driven', 'excited about', 'energized', 'inspired',
    'can\'t wait to', 'pumped', 'ready to', 'eager', 'enthusiastic',
    'finally doing', 'making moves', 'taking action', 'getting after it',
    'momentum', 'flow', 'in the zone',
  ],
  clarity: [
    'clear', 'clarity', 'know what I want', 'figured out',
    'decided', 'committed', 'certain', 'sure about',
    'path forward', 'next steps', 'direction', 'focused',
  ],
};

const DIRECTION_NEGATIVE = {
  drift: [
    'lost', 'aimless', 'directionless', 'stuck', 'stagnant',
    'going through the motions', 'just existing', 'surviving',
    'don\'t know what I want', 'don\'t know what to do',
    'spinning wheels', 'treading water', 'no progress',
  ],
  purposelessness: [
    'pointless', 'meaningless', 'what\'s the point', 'why bother',
    'doesn\'t matter', 'nothing matters', 'no purpose',
    'empty', 'void', 'hollow', 'going nowhere',
  ],
  demotivation: [
    'unmotivated', 'can\'t find motivation', 'don\'t want to',
    'no energy for', 'what\'s the use', 'given up',
    'apathetic', 'indifferent', 'don\'t care anymore',
    'burned out', 'exhausted', 'depleted',
  ],
  confusion: [
    'confused', 'uncertain', 'unsure', 'don\'t know',
    'torn', 'conflicted', 'paralyzed', 'overwhelmed by options',
    'can\'t decide', 'too many paths', 'no clarity',
  ],
};

/**
 * Alignment Indicators
 * Looks for: values conflicts, authenticity, should vs want
 */
const ALIGNMENT_POSITIVE = {
  authenticity: [
    'authentic', 'true to myself', 'being myself', 'real',
    'genuine', 'honest', 'true self', 'who I am',
    'finally being', 'stopped pretending', 'dropped the mask',
    'living my truth', 'showing up as me',
  ],
  values_living: [
    'integrity', 'aligned', 'in alignment', 'living my values',
    'doing what matters', 'true to what I believe',
    'proud of', 'feel good about', 'right thing',
    'honoring', 'respecting myself', 'boundaries',
  ],
  congruence: [
    'makes sense', 'feels right', 'fits', 'resonates',
    'what I want', 'what I need', 'chose this', 'my choice',
    'on my terms', 'my way', 'what works for me',
  ],
};

const ALIGNMENT_NEGATIVE = {
  values_conflict: [
    'should', 'supposed to', 'have to', 'ought to', 'must',
    'expected of me', 'what they want', 'to please',
    'obligation', 'duty', 'responsible for',
    'against my values', 'compromising my beliefs',
  ],
  inauthenticity: [
    'fake', 'pretending', 'putting on a show', 'acting',
    'wearing a mask', 'not being myself', 'hiding',
    'can\'t be myself', 'have to be someone else',
    'playing a role', 'who I\'m supposed to be',
  ],
  guilt_shame: [
    'guilty', 'guilt', 'ashamed', 'shame', 'regret',
    'shouldn\'t have', 'wrong', 'bad person',
    'letting people down', 'disappointing', 'failing',
    'not good enough', 'not measuring up',
  ],
  compromise: [
    'settling', 'giving up', 'sacrificing myself',
    'losing myself', 'don\'t recognize myself',
    'sold out', 'gave in', 'caved', 'abandoned my',
    'betrayed myself', 'went against',
  ],
  should_vs_want: [
    'should but don\'t want', 'want but shouldn\'t',
    'torn between', 'what I want vs', 'heart says but',
    'know I should but', 'feel like I have to but',
  ],
};

// ============================================================================
// TEXT ANALYSIS ENGINE
// ============================================================================

/**
 * Normalize text for analysis
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find all keyword matches in text
 */
function findMatches(text: string, keywords: string[]): string[] {
  const normalized = normalizeText(text);
  const matches: string[] = [];
  
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    // Use word boundaries for single words, substring match for phrases
    if (normalizedKeyword.includes(' ')) {
      if (normalized.includes(normalizedKeyword)) {
        matches.push(keyword);
      }
    } else {
      const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'gi');
      if (regex.test(normalized)) {
        matches.push(keyword);
      }
    }
  }
  
  return matches;
}

/**
 * Analyze text for connection indicators
 */
function analyzeConnectionIndicators(text: string): TextIndicator[] {
  const indicators: TextIndicator[] = [];
  
  // Positive indicators
  for (const [category, keywords] of Object.entries(CONNECTION_POSITIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'positive',
        weight: category === 'connection_quality' ? 0.8 : 0.6,
      });
    }
  }
  
  // Negative indicators
  for (const [category, keywords] of Object.entries(CONNECTION_NEGATIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'negative',
        weight: category === 'loneliness' ? 0.9 : 0.7,
      });
    }
  }
  
  return indicators;
}

/**
 * Analyze text for direction indicators
 */
function analyzeDirectionIndicators(text: string): TextIndicator[] {
  const indicators: TextIndicator[] = [];
  
  // Positive indicators
  for (const [category, keywords] of Object.entries(DIRECTION_POSITIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'positive',
        weight: category === 'purpose_language' ? 0.9 : 0.7,
      });
    }
  }
  
  // Negative indicators
  for (const [category, keywords] of Object.entries(DIRECTION_NEGATIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'negative',
        weight: category === 'purposelessness' ? 0.9 : 0.7,
      });
    }
  }
  
  return indicators;
}

/**
 * Analyze text for alignment indicators
 */
function analyzeAlignmentIndicators(text: string): TextIndicator[] {
  const indicators: TextIndicator[] = [];
  
  // Positive indicators
  for (const [category, keywords] of Object.entries(ALIGNMENT_POSITIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'positive',
        weight: category === 'authenticity' ? 0.9 : 0.7,
      });
    }
  }
  
  // Negative indicators
  for (const [category, keywords] of Object.entries(ALIGNMENT_NEGATIVE)) {
    const matches = findMatches(text, keywords);
    if (matches.length > 0) {
      indicators.push({
        category: category as IndicatorCategory,
        matches,
        sentiment: 'negative',
        // "should vs want" and "values_conflict" are strong signals
        weight: ['values_conflict', 'should_vs_want'].includes(category) ? 0.9 : 0.7,
      });
    }
  }
  
  return indicators;
}

/**
 * Calculate gauge score from indicators
 * Returns 0-100 where 50 is neutral
 */
function calculateScoreFromIndicators(indicators: TextIndicator[]): number {
  if (indicators.length === 0) return -1; // No signal
  
  let positiveWeight = 0;
  let negativeWeight = 0;
  
  for (const indicator of indicators) {
    const matchWeight = indicator.weight * Math.min(indicator.matches.length, 3);
    if (indicator.sentiment === 'positive') {
      positiveWeight += matchWeight;
    } else if (indicator.sentiment === 'negative') {
      negativeWeight += matchWeight;
    }
  }
  
  // No clear signal
  if (positiveWeight === 0 && negativeWeight === 0) return -1;
  
  // Calculate ratio and map to 0-100
  const total = positiveWeight + negativeWeight;
  const positiveRatio = positiveWeight / total;
  
  // Map: 0 (all negative) → 20, 0.5 (balanced) → 50, 1 (all positive) → 80
  const baseScore = 20 + (positiveRatio * 60);
  
  // Intensity modifier: more indicators = more extreme
  const intensityBonus = Math.min(total / 5, 1) * 10;
  const adjustedScore = positiveRatio > 0.5 
    ? baseScore + intensityBonus 
    : baseScore - intensityBonus;
  
  return Math.max(0, Math.min(100, Math.round(adjustedScore)));
}

/**
 * Generate a human-readable summary of indicators
 */
function generateIndicatorSummary(
  gauge: SmartGaugeKey,
  indicators: TextIndicator[],
  score: number
): string {
  if (indicators.length === 0 || score < 0) {
    return `Not enough ${gauge} signals detected in text.`;
  }
  
  const positiveIndicators = indicators.filter(i => i.sentiment === 'positive');
  const negativeIndicators = indicators.filter(i => i.sentiment === 'negative');
  
  const gaugeLabels = {
    connection: 'social/relational',
    direction: 'purpose/motivation',
    alignment: 'values/authenticity',
  };
  
  if (positiveIndicators.length > negativeIndicators.length) {
    const topMatches = positiveIndicators
      .flatMap(i => i.matches)
      .slice(0, 3)
      .join(', ');
    return `Positive ${gaugeLabels[gauge]} signals detected: ${topMatches}.`;
  } else if (negativeIndicators.length > positiveIndicators.length) {
    const topMatches = negativeIndicators
      .flatMap(i => i.matches)
      .slice(0, 3)
      .join(', ');
    return `${gaugeLabels[gauge].charAt(0).toUpperCase() + gaugeLabels[gauge].slice(1)} challenges detected: ${topMatches}.`;
  } else {
    return `Mixed ${gaugeLabels[gauge]} signals detected.`;
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze a single text for all smart gauges
 */
export function analyzeText(text: string): TextAnalysisResult {
  const connectionIndicators = analyzeConnectionIndicators(text);
  const directionIndicators = analyzeDirectionIndicators(text);
  const alignmentIndicators = analyzeAlignmentIndicators(text);
  
  const connectionScore = calculateScoreFromIndicators(connectionIndicators);
  const directionScore = calculateScoreFromIndicators(directionIndicators);
  const alignmentScore = calculateScoreFromIndicators(alignmentIndicators);
  
  return {
    connection: {
      score: connectionScore,
      indicators: connectionIndicators,
      summary: generateIndicatorSummary('connection', connectionIndicators, connectionScore),
    },
    direction: {
      score: directionScore,
      indicators: directionIndicators,
      summary: generateIndicatorSummary('direction', directionIndicators, directionScore),
    },
    alignment: {
      score: alignmentScore,
      indicators: alignmentIndicators,
      summary: generateIndicatorSummary('alignment', alignmentIndicators, alignmentScore),
    },
  };
}

/**
 * Analyze recent journal entries
 */
export function analyzeJournalEntries(
  entries: JournalEntry[],
  daysBack: number = 7
): TextAnalysisResult {
  const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const recentEntries = entries.filter(e => 
    new Date(e.createdAt).getTime() >= cutoff
  );
  
  if (recentEntries.length === 0) {
    return {
      connection: { score: -1, indicators: [], summary: 'No recent journal entries.' },
      direction: { score: -1, indicators: [], summary: 'No recent journal entries.' },
      alignment: { score: -1, indicators: [], summary: 'No recent journal entries.' },
    };
  }
  
  // Combine all recent text
  const combinedText = recentEntries.map(e => e.content).join(' ');
  return analyzeText(combinedText);
}

/**
 * Analyze recent conversations
 */
export function analyzeConversations(
  messages: ConversationMessage[],
  daysBack: number = 7
): TextAnalysisResult {
  const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const recentMessages = messages.filter(m => 
    m.role === 'user' && new Date(m.timestamp).getTime() >= cutoff
  );
  
  if (recentMessages.length === 0) {
    return {
      connection: { score: -1, indicators: [], summary: 'No recent conversations.' },
      direction: { score: -1, indicators: [], summary: 'No recent conversations.' },
      alignment: { score: -1, indicators: [], summary: 'No recent conversations.' },
    };
  }
  
  const combinedText = recentMessages.map(m => m.content).join(' ');
  return analyzeText(combinedText);
}

/**
 * Analyze conversation summaries for patterns
 */
export function analyzeConversationSummaries(
  summaries: ConversationSummary[],
  daysBack: number = 14
): TextAnalysisResult {
  const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const recentSummaries = summaries.filter(s =>
    new Date(s.createdAt).getTime() >= cutoff
  );
  
  if (recentSummaries.length === 0) {
    return {
      connection: { score: -1, indicators: [], summary: 'No recent conversation summaries.' },
      direction: { score: -1, indicators: [], summary: 'No recent conversation summaries.' },
      alignment: { score: -1, indicators: [], summary: 'No recent conversation summaries.' },
    };
  }
  
  // Summaries contain rich insight data
  const combinedText = recentSummaries
    .map(s => `${s.summary} ${s.insights} ${s.followUp}`)
    .join(' ');
  
  return analyzeText(combinedText);
}

// ============================================================================
// TIME-BASED PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze check-in patterns for Connection gauge
 * - Time since last social mention
 * - Circle activity
 * - Conversation frequency
 */
export function analyzeConnectionPatterns(): {
  score: number;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
} {
  try {
    const circleStore = useCircleStore.getState();
    const conversationStore = useConversationStore.getState();
    
    const members = circleStore.members ?? [];
    const messages = conversationStore.messages ?? [];
    
    // Factor 1: Circle size
    const hasCircle = members.length > 0;
    
    // Factor 2: Recent conversation activity
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentUserMessages = messages.filter(m => 
      m.role === 'user' && new Date(m.timestamp).getTime() >= weekAgo
    ).length;
    
    // Factor 3: Analyze recent messages for social content
    const recentText = messages
      .filter(m => m.role === 'user')
      .slice(-20)
      .map(m => m.content)
      .join(' ');
    
    const socialIndicators = analyzeConnectionIndicators(recentText);
    const hasPositiveSocial = socialIndicators.some(i => i.sentiment === 'positive');
    const hasNegativeSocial = socialIndicators.some(i => i.sentiment === 'negative');
    
    // Calculate score
    let score = 50; // Baseline
    
    // Circle presence
    if (hasCircle) score += 10;
    if (members.length >= 3) score += 5;
    
    // Conversation activity
    if (recentUserMessages >= 7) score += 10;
    else if (recentUserMessages >= 3) score += 5;
    else if (recentUserMessages === 0) score -= 10;
    
    // Social sentiment
    if (hasPositiveSocial) score += 15;
    if (hasNegativeSocial) score -= 15;
    
    // Determine confidence
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (recentUserMessages >= 5 && socialIndicators.length >= 2) {
      confidence = 'high';
    } else if (recentUserMessages >= 2 || socialIndicators.length >= 1) {
      confidence = 'medium';
    }
    
    // Build reasoning
    const reasons: string[] = [];
    if (hasCircle) reasons.push(`${members.length} people in Circle`);
    if (recentUserMessages > 0) reasons.push(`${recentUserMessages} conversations this week`);
    if (hasPositiveSocial) reasons.push('positive social mentions detected');
    if (hasNegativeSocial) reasons.push('isolation/loneliness signals detected');
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: reasons.length > 0 
        ? reasons.join('; ') 
        : 'Not enough data to analyze connection patterns.',
      confidence,
    };
  } catch {
    return { score: -1, reasoning: 'Unable to analyze patterns.', confidence: 'low' };
  }
}

/**
 * Analyze patterns for Direction gauge
 * - Check-in consistency (indicates routine/structure)
 * - Goal/purpose language in recent content
 */
export function analyzeDirectionPatterns(): {
  score: number;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
} {
  try {
    const conversationStore = useConversationStore.getState();
    const journalStore = useJournalStore.getState();
    
    const messages = conversationStore.messages ?? [];
    const entries = journalStore.entries ?? [];
    
    // Factor 1: Content consistency (regular engagement suggests structure)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const uniqueDays = new Set([
      ...messages
        .filter(m => m.role === 'user' && new Date(m.timestamp).getTime() >= weekAgo)
        .map(m => new Date(m.timestamp).toDateString()),
      ...entries
        .filter(e => new Date(e.createdAt).getTime() >= weekAgo)
        .map(e => new Date(e.createdAt).toDateString()),
    ]).size;
    
    // Factor 2: Direction language in content
    const recentText = [
      ...messages.filter(m => m.role === 'user').slice(-20).map(m => m.content),
      ...entries.slice(0, 10).map(e => e.content),
    ].join(' ');
    
    const directionIndicators = analyzeDirectionIndicators(recentText);
    const hasPositiveDirection = directionIndicators.some(i => i.sentiment === 'positive');
    const hasNegativeDirection = directionIndicators.some(i => i.sentiment === 'negative');
    
    // Calculate score
    let score = 50;
    
    // Engagement consistency
    if (uniqueDays >= 5) score += 15;
    else if (uniqueDays >= 3) score += 10;
    else if (uniqueDays === 0) score -= 10;
    
    // Direction sentiment
    if (hasPositiveDirection) score += 20;
    if (hasNegativeDirection) score -= 20;
    
    // Confidence
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (directionIndicators.length >= 3 && uniqueDays >= 3) {
      confidence = 'high';
    } else if (directionIndicators.length >= 1 || uniqueDays >= 2) {
      confidence = 'medium';
    }
    
    const reasons: string[] = [];
    if (uniqueDays > 0) reasons.push(`active ${uniqueDays} days this week`);
    if (hasPositiveDirection) reasons.push('goal/purpose language detected');
    if (hasNegativeDirection) reasons.push('drift/aimlessness signals detected');
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: reasons.length > 0
        ? reasons.join('; ')
        : 'Not enough data to analyze direction patterns.',
      confidence,
    };
  } catch {
    return { score: -1, reasoning: 'Unable to analyze patterns.', confidence: 'low' };
  }
}

/**
 * Analyze patterns for Alignment gauge
 * - "Should" vs "want" language ratio
 * - Values conflict mentions
 */
export function analyzeAlignmentPatterns(): {
  score: number;
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
} {
  try {
    const conversationStore = useConversationStore.getState();
    const journalStore = useJournalStore.getState();
    
    const messages = conversationStore.messages ?? [];
    const entries = journalStore.entries ?? [];
    
    // Combine recent content
    const recentText = [
      ...messages.filter(m => m.role === 'user').slice(-30).map(m => m.content),
      ...entries.slice(0, 15).map(e => e.content),
    ].join(' ');
    
    const alignmentIndicators = analyzeAlignmentIndicators(recentText);
    
    // Special analysis: count "should" occurrences
    const shouldCount = (recentText.match(/\bshould\b/gi) || []).length;
    const wantCount = (recentText.match(/\bwant\b/gi) || []).length;
    
    const hasPositiveAlignment = alignmentIndicators.some(i => i.sentiment === 'positive');
    const hasNegativeAlignment = alignmentIndicators.some(i => i.sentiment === 'negative');
    
    // Calculate score
    let score = 50;
    
    // Should vs want ratio (high should = potential misalignment)
    if (shouldCount > 0 && wantCount > 0) {
      const shouldRatio = shouldCount / (shouldCount + wantCount);
      if (shouldRatio > 0.7) score -= 15;
      else if (shouldRatio > 0.5) score -= 5;
      else if (shouldRatio < 0.3) score += 10;
    }
    
    // Alignment sentiment
    if (hasPositiveAlignment) score += 20;
    if (hasNegativeAlignment) score -= 20;
    
    // Confidence
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (alignmentIndicators.length >= 3) {
      confidence = 'high';
    } else if (alignmentIndicators.length >= 1 || (shouldCount + wantCount) >= 3) {
      confidence = 'medium';
    }
    
    const reasons: string[] = [];
    if (shouldCount > 0) reasons.push(`${shouldCount} "should" mentions`);
    if (wantCount > 0) reasons.push(`${wantCount} "want" mentions`);
    if (hasPositiveAlignment) reasons.push('authenticity/values alignment detected');
    if (hasNegativeAlignment) reasons.push('values conflict/guilt detected');
    
    return {
      score: Math.max(0, Math.min(100, score)),
      reasoning: reasons.length > 0
        ? reasons.join('; ')
        : 'Not enough data to analyze alignment patterns.',
      confidence,
    };
  } catch {
    return { score: -1, reasoning: 'Unable to analyze patterns.', confidence: 'low' };
  }
}

// ============================================================================
// COMBINED ANALYSIS & SUGGESTIONS
// ============================================================================

/**
 * Combine multiple analysis sources into gauge suggestions
 */
export function generateGaugeSuggestions(): GaugeSuggestion[] {
  const suggestions: GaugeSuggestion[] = [];
  
  try {
    // Get current gauge values
    const cockpit = useCockpitStore.getState();
    
    // Gather data sources
    const journalStore = useJournalStore.getState();
    const conversationStore = useConversationStore.getState();
    const summaryStore = useConversationSummaryStore.getState();
    
    // Analyze from all sources
    const journalAnalysis = analyzeJournalEntries(journalStore.entries ?? []);
    const conversationAnalysis = analyzeConversations(conversationStore.messages ?? []);
    const summaryAnalysis = analyzeConversationSummaries(summaryStore.summaries ?? []);
    
    // Pattern analysis
    const connectionPatterns = analyzeConnectionPatterns();
    const directionPatterns = analyzeDirectionPatterns();
    const alignmentPatterns = analyzeAlignmentPatterns();
    
    // CONNECTION
    const connectionScores = [
      journalAnalysis.connection.score,
      conversationAnalysis.connection.score,
      summaryAnalysis.connection.score,
      connectionPatterns.score,
    ].filter(s => s >= 0);
    
    if (connectionScores.length > 0) {
      const avgConnection = Math.round(
        connectionScores.reduce((a, b) => a + b, 0) / connectionScores.length
      );
      
      const allIndicators = [
        ...journalAnalysis.connection.indicators,
        ...conversationAnalysis.connection.indicators,
        ...summaryAnalysis.connection.indicators,
      ];
      
      suggestions.push({
        gauge: 'connection',
        suggestedValue: avgConnection,
        confidence: connectionPatterns.confidence,
        reasoning: buildReasoning(
          'Connection',
          avgConnection,
          cockpit.connection.value,
          connectionPatterns.reasoning
        ),
        indicators: allIndicators,
        source: 'combined',
      });
    }
    
    // DIRECTION
    const directionScores = [
      journalAnalysis.direction.score,
      conversationAnalysis.direction.score,
      summaryAnalysis.direction.score,
      directionPatterns.score,
    ].filter(s => s >= 0);
    
    if (directionScores.length > 0) {
      const avgDirection = Math.round(
        directionScores.reduce((a, b) => a + b, 0) / directionScores.length
      );
      
      const allIndicators = [
        ...journalAnalysis.direction.indicators,
        ...conversationAnalysis.direction.indicators,
        ...summaryAnalysis.direction.indicators,
      ];
      
      suggestions.push({
        gauge: 'direction',
        suggestedValue: avgDirection,
        confidence: directionPatterns.confidence,
        reasoning: buildReasoning(
          'Direction',
          avgDirection,
          cockpit.direction.value,
          directionPatterns.reasoning
        ),
        indicators: allIndicators,
        source: 'combined',
      });
    }
    
    // ALIGNMENT
    const alignmentScores = [
      journalAnalysis.alignment.score,
      conversationAnalysis.alignment.score,
      summaryAnalysis.alignment.score,
      alignmentPatterns.score,
    ].filter(s => s >= 0);
    
    if (alignmentScores.length > 0) {
      const avgAlignment = Math.round(
        alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length
      );
      
      const allIndicators = [
        ...journalAnalysis.alignment.indicators,
        ...conversationAnalysis.alignment.indicators,
        ...summaryAnalysis.alignment.indicators,
      ];
      
      suggestions.push({
        gauge: 'alignment',
        suggestedValue: avgAlignment,
        confidence: alignmentPatterns.confidence,
        reasoning: buildReasoning(
          'Alignment',
          avgAlignment,
          cockpit.alignment.value,
          alignmentPatterns.reasoning
        ),
        indicators: allIndicators,
        source: 'combined',
      });
    }
  } catch (e) {
    // Return empty suggestions on error
  }
  
  return suggestions;
}

/**
 * Build human-readable reasoning for a suggestion
 */
function buildReasoning(
  gaugeName: string,
  suggested: number,
  current: number,
  patternReasoning: string
): string {
  const parts: string[] = [];
  
  if (current < 0) {
    parts.push(`Based on your recent activity, ${gaugeName} appears to be around ${suggested}%.`);
  } else if (Math.abs(suggested - current) >= 15) {
    const direction = suggested > current ? 'higher' : 'lower';
    parts.push(`Your recent content suggests ${gaugeName} may be ${direction} than currently set.`);
  } else {
    parts.push(`${gaugeName} appears consistent with current reading.`);
  }
  
  if (patternReasoning && !patternReasoning.includes('Not enough')) {
    parts.push(`Signals: ${patternReasoning}`);
  }
  
  return parts.join(' ');
}

/**
 * Apply a gauge suggestion (updates the cockpit store)
 */
export function applySuggestion(suggestion: GaugeSuggestion): void {
  const cockpit = useCockpitStore.getState();
  
  switch (suggestion.gauge) {
    case 'connection':
      cockpit.updateConnection(suggestion.suggestedValue);
      break;
    case 'direction':
      cockpit.updateDirection(suggestion.suggestedValue);
      break;
    case 'alignment':
      cockpit.updateAlignment(suggestion.suggestedValue);
      break;
  }
}

/**
 * Analyze a single piece of text (e.g., after journaling or conversation)
 * and return immediate suggestions without applying them
 */
export function analyzeAndSuggest(text: string): GaugeSuggestion[] {
  const analysis = analyzeText(text);
  const suggestions: GaugeSuggestion[] = [];
  
  const gauges: SmartGaugeKey[] = ['connection', 'direction', 'alignment'];
  
  for (const gauge of gauges) {
    const result = analysis[gauge];
    if (result.score >= 0) {
      suggestions.push({
        gauge,
        suggestedValue: result.score,
        confidence: result.indicators.length >= 3 ? 'high' 
          : result.indicators.length >= 1 ? 'medium' 
          : 'low',
        reasoning: result.summary,
        indicators: result.indicators,
        source: 'text_analysis',
      });
    }
  }
  
  return suggestions;
}

// ============================================================================
// EXPORTS FOR INTEGRATION
// ============================================================================

export {
  CONNECTION_POSITIVE,
  CONNECTION_NEGATIVE,
  DIRECTION_POSITIVE,
  DIRECTION_NEGATIVE,
  ALIGNMENT_POSITIVE,
  ALIGNMENT_NEGATIVE,
};
