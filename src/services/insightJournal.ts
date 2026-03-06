/**
 * Save Pre-Flight / Post-Flight CoPilot insights to the journal as formatted markdown.
 */

import { useJournalStore } from '../stores/journalStore';

export interface FlightInsightItem {
  question: string;
  score: number;
  insight?: string;
  source: 'ai' | 'heuristic';
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const am = h < 12;
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

/**
 * Build markdown for Post-Flight insights (evening).
 * Format:
 * ---
 * 🌙 **Post-Flight** — 10:30 PM
 * > insight 1
 * > insight 2
 * *— CoPilot*
 */
export function formatPostFlightInsightsMarkdown(insights: FlightInsightItem[]): string {
  const date = new Date();
  const time = formatTime(date);
  const lines: string[] = [
    '---',
    `🌙 **Post-Flight** — ${time}`,
    '',
  ];
  const withInsight = insights.filter((i) => i.insight && i.source === 'ai');
  withInsight.forEach((i) => lines.push(`> ${i.insight!.trim()}`));
  if (withInsight.length > 0) lines.push('', '*— CoPilot*');
  return lines.join('\n');
}

/**
 * Build markdown for Pre-Flight insight (morning).
 */
export function formatPreFlightInsightMarkdown(insight: string | undefined, score: number): string {
  const date = new Date();
  const time = formatTime(date);
  const lines: string[] = [
    '---',
    `☀️ **Pre-Flight** — ${time}`,
    '',
  ];
  if (insight?.trim()) {
    lines.push(`> ${insight.trim()}`, '', '*— CoPilot*');
  }
  return lines.join('\n');
}

/**
 * Save Post-Flight insights to journal and return the content that was saved.
 */
export function savePostFlightInsightsToJournal(insights: FlightInsightItem[]): string {
  const content = formatPostFlightInsightsMarkdown(insights);
  if (content.trim().length <= 10) return '';
  useJournalStore.getState().addEntry(content);
  return content;
}

/**
 * Save Pre-Flight insight to journal (e.g. after voice sleep answer).
 */
export function savePreFlightInsightToJournal(insight: string | undefined, score: number): string {
  const content = formatPreFlightInsightMarkdown(insight, score);
  if (content.trim().length <= 10) return '';
  useJournalStore.getState().addEntry(content);
  return content;
}
