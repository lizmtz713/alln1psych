/**
 * Utilities for building shareable content from various app sources
 */

import type { ShareableContent, InsightType } from './ShareInsightModal';
import type { ManualLesson } from '../../data/manualContent';
import type { Discovery } from '../../data/discoveries';
import { 
  findInsightByKeywords, 
  getSourceById, 
  formatInsightForShare,
  type SynthesizedInsight,
  type GaugeType 
} from '../../data/academicSources';

/**
 * Find matching synthesized insight based on content
 * Uses PHOSM's integrated knowledge, not just citations
 */
function findMatchingInsight(
  title: string,
  additionalText?: string
): {
  gauges: GaugeType[];
  coreTruth: string;
  sources: { author: string; insight: string }[];
  whatThisMeans: string;
  whatYouCanDo: string;
} | null {
  // Combine all searchable text
  const searchText = [title, additionalText || ''].join(' ');
  
  // Find the best matching synthesized insight
  const insight = findInsightByKeywords(searchText);
  
  if (!insight) return null;
  
  const formatted = formatInsightForShare(insight);
  
  return {
    gauges: formatted.gauges,
    coreTruth: formatted.coreTruth,
    sources: formatted.sources.map(s => ({
      author: s.author,
      insight: s.contribution,
    })),
    whatThisMeans: formatted.whatThisMeans,
    whatYouCanDo: formatted.whatYouCanDo,
  };
}

/**
 * Build shareable content from a Human Manual lesson
 */
export function buildLessonShareContent(
  lesson: ManualLesson,
  content: { introduction: string; keyConcepts: { title: string; explanation: string }[] },
  ageAdaptiveIntro?: string
): ShareableContent {
  const summary = ageAdaptiveIntro || content.introduction;
  
  // Combine all text for better keyword matching
  const searchText = [
    lesson.title,
    content.introduction,
    lesson.deepDive || '',
    content.keyConcepts.map(kc => `${kc.title} ${kc.explanation}`).join(' '),
  ].join(' ');
  
  // Find matching synthesized insight from PHOSM knowledge base
  const insight = findMatchingInsight(lesson.title, searchText);
  
  return {
    type: 'manual_lesson',
    id: lesson.id,
    title: lesson.title,
    summary,
    keyPoints: content.keyConcepts.map(kc => `**${kc.title}:** ${kc.explanation}`),
    deepContent: insight?.coreTruth || lesson.deepDive, // Use synthesized truth if available
    realWorldExamples: lesson.realWorld,
    tryThis: insight?.whatYouCanDo || lesson.tryThis, // Use actionable if available
    sourceLabel: 'Human Manual',
    connectedGauges: insight?.gauges || lesson.connectsTo as any,
    academicSources: insight?.sources,
  };
}

/**
 * Build shareable content from a Discovery
 */
export function buildDiscoveryShareContent(discovery: Discovery, ageAdaptiveContent?: string): ShareableContent {
  const summary = ageAdaptiveContent || discovery.content;
  
  // Find matching synthesized insight
  const insight = findMatchingInsight(discovery.title, discovery.expanded);
  
  return {
    type: 'discovery',
    id: discovery.id,
    title: `${discovery.emoji} ${discovery.title}`,
    summary,
    deepContent: insight?.coreTruth || discovery.expanded,
    science: insight?.whatThisMeans || discovery.source,
    tryThis: insight?.whatYouCanDo,
    sourceLabel: '101 Discoveries',
    connectedGauges: insight?.gauges,
    academicSources: insight?.sources,
  };
}

/**
 * Build shareable content from an AI response
 * Used for Talk to Psych, Relate, Replay insights
 */
export function buildAIResponseShareContent(
  type: 'ai_response' | 'relate_insight' | 'replay_insight',
  title: string,
  content: string,
  sourceLabel: string,
  additionalContext?: {
    keyPoints?: string[];
    tryThis?: string;
  }
): ShareableContent {
  // Extract first 2-3 sentences as summary
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const summary = sentences.slice(0, 3).join('. ').trim() + '.';
  
  return {
    type,
    title,
    summary,
    deepContent: content,
    keyPoints: additionalContext?.keyPoints,
    tryThis: additionalContext?.tryThis,
    sourceLabel,
  };
}

/**
 * Build shareable content from Relate tool insight
 */
export function buildRelateShareContent(
  relationshipName: string,
  insight: string,
  suggestions?: string[]
): ShareableContent {
  return buildAIResponseShareContent(
    'relate_insight',
    `Understanding ${relationshipName}`,
    insight,
    'Relate Tool',
    {
      keyPoints: suggestions,
      tryThis: suggestions?.[0],
    }
  );
}

/**
 * Build shareable content from Replay tool insight
 */
export function buildReplayShareContent(
  eventTitle: string,
  phases: { phase: string; content: string }[]
): ShareableContent {
  const fullContent = phases.map(p => `**${p.phase}:**\n${p.content}`).join('\n\n');
  const summary = phases[0]?.content?.slice(0, 200) + '...' || 'Processing a difficult moment.';
  
  return {
    type: 'replay_insight',
    title: `Processing: ${eventTitle}`,
    summary,
    deepContent: fullContent,
    sourceLabel: 'Replay Tool',
    keyPoints: phases.map(p => p.phase),
  };
}
