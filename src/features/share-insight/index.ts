/**
 * Share Insight Feature
 * 
 * Enables users to share educational content with context,
 * backed by academic sources and gauge connections.
 * 
 * @example
 * import { ShareInsight, buildLessonShareContent } from '@/features/share-insight';
 * 
 * <ShareInsight content={buildLessonShareContent(lesson, content)} />
 */

// Components
export { ShareInsight, ShareInsightButton } from './ShareInsightModal';
export type { ShareableContent, InsightType, RecipientType } from './ShareInsightModal';

// Content builders
export {
  buildLessonShareContent,
  buildDiscoveryShareContent,
  buildAIResponseShareContent,
  buildRelateShareContent,
  buildReplayShareContent,
} from './buildContent';
