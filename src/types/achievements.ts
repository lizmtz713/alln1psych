/**
 * Achievements — Types for achievement definitions, criteria, and user progress.
 */

export type AchievementCategory =
  | 'consistency'
  | 'exploration'
  | 'connection'
  | 'growth'
  | 'wellness'
  | 'ritual'
  | 'milestone';

/** Criterion type and target value (e.g. 7 for streak_days = 7). */
export interface AchievementCriteria {
  type:
    | 'checkin_count'
    | 'streak_days'
    | 'lesson_count'
    | 'circle_members'
    | 'voice_used'
    | 'module_complete'
    | 'ritual_preflight'
    | 'ritual_postflight'
    | 'tool_used'
    | 'journal_entries'
    | 'gratitude_streak'
    | 'win_count'
    | 'conversation_count'
    | 'decision_count'
    | 'bias_check_count'
    | 'sleep_logged'
    | 'human_skill_points'
    | 'first_checkin'
    | 'first_lesson'
    | 'first_voice'
    | 'first_postflight'
    | 'first_preflight'
    | 'first_tool'
    | 'first_journal'
    | 'first_win'
    | 'first_decision'
    | 'first_gratitude';
  target: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
}

/** User state: when each achievement was unlocked (ISO string). */
export interface UserAchievements {
  unlockedAt: Record<string, string>;
}
