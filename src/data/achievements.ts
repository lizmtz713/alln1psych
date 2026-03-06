/**
 * Achievements — 35 achievements across 7 categories.
 */

import type { Achievement } from '../types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Consistency (5) ───
  {
    id: 'first-checkin',
    title: 'First Step',
    description: 'Completed your first check-in',
    emoji: '🌱',
    category: 'consistency',
    criteria: { type: 'first_checkin', target: 1 },
  },
  {
    id: 'checkin-5',
    title: 'Getting Started',
    description: '5 check-ins completed',
    emoji: '📋',
    category: 'consistency',
    criteria: { type: 'checkin_count', target: 5 },
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day engagement streak',
    emoji: '🔥',
    category: 'consistency',
    criteria: { type: 'streak_days', target: 7 },
  },
  {
    id: 'streak-14',
    title: 'Two Weeks Strong',
    description: '14-day engagement streak',
    emoji: '💪',
    category: 'consistency',
    criteria: { type: 'streak_days', target: 14 },
  },
  {
    id: 'streak-30',
    title: 'Committed',
    description: '30-day engagement streak',
    emoji: '⭐',
    category: 'consistency',
    criteria: { type: 'streak_days', target: 30 },
  },
  // ─── Exploration (5) ───
  {
    id: 'first-lesson',
    title: 'Curious Mind',
    description: 'Completed your first lesson',
    emoji: '📖',
    category: 'exploration',
    criteria: { type: 'first_lesson', target: 1 },
  },
  {
    id: 'lessons-5',
    title: 'Learner',
    description: 'Completed 5 lessons',
    emoji: '🎯',
    category: 'exploration',
    criteria: { type: 'lesson_count', target: 5 },
  },
  {
    id: 'lessons-15',
    title: 'Student',
    description: 'Completed 15 lessons',
    emoji: '📚',
    category: 'exploration',
    criteria: { type: 'lesson_count', target: 15 },
  },
  {
    id: 'first-tool',
    title: 'Tool Explorer',
    description: 'Used your first tool',
    emoji: '🧰',
    category: 'exploration',
    criteria: { type: 'first_tool', target: 1 },
  },
  {
    id: 'tools-5',
    title: 'Multi-Tool',
    description: 'Used 5 different tools',
    emoji: '🔧',
    category: 'exploration',
    criteria: { type: 'tool_used', target: 5 },
  },
  // ─── Connection (5) ───
  {
    id: 'circle-builder',
    title: 'Circle Builder',
    description: 'Added someone to your circle',
    emoji: '💛',
    category: 'connection',
    criteria: { type: 'circle_members', target: 1 },
  },
  {
    id: 'circle-3',
    title: 'Tribe',
    description: '3 people in your circle',
    emoji: '👥',
    category: 'connection',
    criteria: { type: 'circle_members', target: 3 },
  },
  {
    id: 'brave-voice',
    title: 'Brave Voice',
    description: 'Had your first voice conversation',
    emoji: '🎙️',
    category: 'connection',
    criteria: { type: 'first_voice', target: 1 },
  },
  {
    id: 'conversations-10',
    title: 'Conversation Starter',
    description: '10 conversations with Gauge',
    emoji: '💬',
    category: 'connection',
    criteria: { type: 'conversation_count', target: 10 },
  },
  {
    id: 'conversations-50',
    title: 'Regular Chatter',
    description: '50 conversations',
    emoji: '🗣️',
    category: 'connection',
    criteria: { type: 'conversation_count', target: 50 },
  },
  // ─── Growth (5) ───
  {
    id: 'first-journal',
    title: 'First Reflection',
    description: 'Wrote your first journal entry',
    emoji: '✍️',
    category: 'growth',
    criteria: { type: 'first_journal', target: 1 },
  },
  {
    id: 'journal-5',
    title: 'Reflective',
    description: '5 journal entries',
    emoji: '📓',
    category: 'growth',
    criteria: { type: 'journal_entries', target: 5 },
  },
  {
    id: 'first-decision',
    title: 'Decider',
    description: 'Completed your first decision',
    emoji: '🔀',
    category: 'growth',
    criteria: { type: 'first_decision', target: 1 },
  },
  {
    id: 'first-win',
    title: 'Win Catcher',
    description: 'Captured your first win',
    emoji: '🏆',
    category: 'growth',
    criteria: { type: 'first_win', target: 1 },
  },
  {
    id: 'wins-10',
    title: 'Win Collector',
    description: '10 wins captured',
    emoji: '🌟',
    category: 'growth',
    criteria: { type: 'win_count', target: 10 },
  },
  // ─── Wellness (5) ───
  {
    id: 'bias-check-1',
    title: 'Bias Aware',
    description: 'Used Bias Check once',
    emoji: '🧠',
    category: 'wellness',
    criteria: { type: 'bias_check_count', target: 1 },
  },
  {
    id: 'sleep-3',
    title: 'Sleep Logger',
    description: 'Logged sleep 3 times',
    emoji: '😴',
    category: 'wellness',
    criteria: { type: 'sleep_logged', target: 3 },
  },
  {
    id: 'gratitude-3',
    title: 'Grateful',
    description: '3 days of gratitude',
    emoji: '🙏',
    category: 'wellness',
    criteria: { type: 'gratitude_streak', target: 3 },
  },
  {
    id: 'first-gratitude',
    title: 'First Thanks',
    description: 'Logged gratitude once',
    emoji: '💚',
    category: 'wellness',
    criteria: { type: 'first_gratitude', target: 1 },
  },
  {
    id: 'human-skill-100',
    title: 'Skill Builder',
    description: '100 human skill points',
    emoji: '🎖️',
    category: 'wellness',
    criteria: { type: 'human_skill_points', target: 100 },
  },
  // ─── Ritual (5) ───
  {
    id: 'first-preflight',
    title: 'Morning Pilot',
    description: 'Completed your first Pre-Flight',
    emoji: '☀️',
    category: 'ritual',
    criteria: { type: 'first_preflight', target: 1 },
  },
  {
    id: 'first-postflight',
    title: 'Evening Pilot',
    description: 'Completed your first Post-Flight',
    emoji: '🌙',
    category: 'ritual',
    criteria: { type: 'first_postflight', target: 1 },
  },
  {
    id: 'preflight-5',
    title: 'Morning Regular',
    description: '5 Pre-Flight check-ins',
    emoji: '✈️',
    category: 'ritual',
    criteria: { type: 'ritual_preflight', target: 5 },
  },
  {
    id: 'postflight-5',
    title: 'Evening Regular',
    description: '5 Post-Flight debriefs',
    emoji: '🛬',
    category: 'ritual',
    criteria: { type: 'ritual_postflight', target: 5 },
  },
  {
    id: 'ritual-10',
    title: 'Ritual Keeper',
    description: '10 total rituals (Pre + Post)',
    emoji: '📿',
    category: 'ritual',
    criteria: { type: 'ritual_preflight', target: 10 }, // checker can sum pre+post
  },
  // ─── Milestone (5) ───
  {
    id: 'self-aware',
    title: 'Self-Aware',
    description: 'Completed Feelings 101',
    emoji: '🧠',
    category: 'milestone',
    criteria: { type: 'module_complete', target: 1 }, // specific module id in checker
  },
  {
    id: 'all-modules',
    title: 'Scholar',
    description: 'Completed all education modules',
    emoji: '🎓',
    category: 'milestone',
    criteria: { type: 'lesson_count', target: 999 }, // checker uses actual module count
  },
  {
    id: 'checkin-50',
    title: 'Half Century',
    description: '50 check-ins',
    emoji: '💯',
    category: 'milestone',
    criteria: { type: 'checkin_count', target: 50 },
  },
  {
    id: 'streak-60',
    title: 'Two Months',
    description: '60-day streak',
    emoji: '🏅',
    category: 'milestone',
    criteria: { type: 'streak_days', target: 60 },
  },
  {
    id: 'decisions-5',
    title: 'Decision Maker',
    description: '5 decisions completed',
    emoji: '⚖️',
    category: 'milestone',
    criteria: { type: 'decision_count', target: 5 },
  },
];

const CATEGORY_ORDER: Achievement['category'][] = [
  'consistency',
  'exploration',
  'connection',
  'growth',
  'wellness',
  'ritual',
  'milestone',
];

export const ACHIEVEMENT_CATEGORY_LABELS: Record<Achievement['category'], string> = {
  consistency: 'Consistency',
  exploration: 'Exploration',
  connection: 'Connection',
  growth: 'Growth',
  wellness: 'Wellness',
  ritual: 'Ritual',
  milestone: 'Milestone',
};

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(): Array<{ category: Achievement['category']; label: string; achievements: Achievement[] }> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: ACHIEVEMENT_CATEGORY_LABELS[category],
    achievements: ACHIEVEMENTS.filter((a) => a.category === category),
  }));
}
