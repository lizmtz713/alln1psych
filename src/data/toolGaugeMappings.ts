/**
 * Gauge-Triggered Tools — 27 tools mapped to trigger gauges.
 * When a gauge is low or declining, these tools are candidates for suggestion.
 */

import type { GaugeKey } from '../stores/cockpitStore';

export interface ToolMapping {
  key: string;
  label: string;
  icon: string;
  route: string;
  /** Gauges this tool supports (suggest when any is low/declining) */
  gauges: GaugeKey[];
}

/** Master list: tool key → gauges it supports */
export const TOOL_GAUGE_MAPPINGS: ToolMapping[] = [
  { key: 'decode', label: 'Decode', icon: '🔍', route: '/(modals)/decode', gauges: ['emotion', 'state'] },
  { key: 'resolve', label: 'Resolve', icon: '🤝', route: '/(modals)/resolve', gauges: ['connection', 'direction'] },
  { key: 'roleplay', label: 'Role Play', icon: '🎭', route: '/(modals)/role-play', gauges: ['emotion', 'connection'] },
  { key: 'referee', label: 'Referee', icon: '⚖️', route: '/(modals)/referee', gauges: ['alignment', 'emotion'] },
  { key: 'replay', label: 'Replay', icon: '🔄', route: '/(modals)/replay', gauges: ['emotion', 'state'] },
  { key: 'relate', label: 'Relate', icon: '💬', route: '/(modals)/relate', gauges: ['connection', 'emotion'] },
  { key: 'prompts', label: 'Prompts', icon: '✨', route: '/(modals)/prompt-generator', gauges: ['emotion', 'direction'] },
  { key: 'love', label: 'Love', icon: '❤️', route: '/(modals)/love', gauges: ['connection', 'emotion'] },
  { key: 'help', label: 'Help', icon: '🆘', route: '/(modals)/help-someone', gauges: ['connection', 'emotion'] },
  { key: 'datesume', label: 'Datesume', icon: '💝', route: '/love/datesume', gauges: ['connection'] },
  { key: 'love-history', label: 'Love History', icon: '💔', route: '/love-history', gauges: ['connection', 'emotion'] },
  { key: 'attraction', label: 'Attraction', icon: '💫', route: '/(modals)/attraction', gauges: ['connection', 'emotion'] },
  { key: 'attachment', label: 'Attachment', icon: '🌳', route: '/(modals)/attachment-style', gauges: ['connection', 'emotion'] },
  { key: 'boundaries', label: 'Boundaries', icon: '🚧', route: '/(modals)/boundaries', gauges: ['connection', 'alignment'] },
  { key: 'difficult', label: 'Difficult People', icon: '👤', route: '/(modals)/difficult-people', gauges: ['connection', 'emotion'] },
  { key: 'flags', label: 'Flags', icon: '🚩', route: '/(modals)/red-green-flags', gauges: ['connection', 'alignment'] },
  { key: 'critical', label: 'Think', icon: '🧠', route: '/(modals)/critical-thinking', gauges: ['alignment', 'direction'] },
  { key: 'body', label: 'Body', icon: '🫀', route: '/(modals)/foundation-body', gauges: ['body'] },
  { key: 'news-my-way', label: 'News My Way', icon: '📰', route: '/news-my-way', gauges: ['state'] },
  { key: 'pre-check', label: 'Pre-Check', icon: '✅', route: '/(modals)/pre-conversation-check', gauges: ['state', 'emotion'] },
  { key: 'reach-out', label: 'Reach Out', icon: '🤲', route: '/(modals)/reach-out-scaffold', gauges: ['connection'] },
  { key: 'quick-reset', label: 'Quick Reset', icon: '🌬️', route: '/(modals)/quick-reset', gauges: ['state', 'body'] },
  { key: 'share-insight', label: 'Share Insight', icon: '💡', route: '/(modals)/share-insight', gauges: ['state', 'emotion', 'direction'] },
  { key: 'drift', label: 'Drift', icon: '📐', route: '/(modals)/drift-detector', gauges: ['state', 'direction'] },
  { key: 'awe', label: 'Awe', icon: '🌟', route: '/(modals)/awe-activities', gauges: ['state', 'emotion'] },
  { key: 'crisis', label: 'Crisis', icon: '🆘', route: '/(modals)/crisis-resources', gauges: ['state', 'emotion'] },
  { key: 'learning-style', label: 'Learning Style', icon: '📚', route: '/(modals)/learning-style-quiz', gauges: ['direction'] },
];

/** Activity ids that are also suggestible (e.g. breathing) — map to route */
export const ACTIVITY_TOOL_ROUTES: Record<string, string> = {
  breathing: '/(modals)/activity?id=breathing',
  'emotion-wheel': '/(modals)/activity?id=emotion-wheel',
  'body-scan': '/(modals)/activity?id=body-scan',
  'thought-challenger': '/(modals)/activity?id=thought-challenger',
};

/** Get all tools that support a given gauge */
export function getToolsForGauge(gauge: GaugeKey): ToolMapping[] {
  return TOOL_GAUGE_MAPPINGS.filter((t) => t.gauges.includes(gauge));
}
