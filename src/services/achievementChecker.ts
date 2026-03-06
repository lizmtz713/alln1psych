/**
 * Achievement Checker — Runs after key actions; unlocks achievements and queues modal.
 */

import { ACHIEVEMENTS, getAchievementById } from '../data/achievements';
import { useAchievementStore } from '../stores/achievementStore';
import { useCircleStore } from '../stores/circleStore';
import { useEducationStore } from '../stores/educationStore';
import { useConversationStore } from '../stores/conversationStore';
import { useJournalStore } from '../stores/journalStore';
import { useRitualsStore } from '../stores/ritualsStore';
import { useGratitudeStore } from '../stores/gratitudeStore';
import { useSleepStore } from '../stores/sleepStore';
import { useWinStore } from '../stores/winStore';
import { useDecisionStore } from '../stores/decisionStore';
import { useBiasStore } from '../stores/biasStore';
import { useHumanSkillsStore } from '../stores/humanSkillsStore';
import { useInsightsStore } from '../stores/insightsStore';
import { MODULES } from '../data/educationContent';
import type { AchievementCriteria } from '../types/achievements';

function getEngagementStreak(): number {
  return useInsightsStore.getState().getEngagementStreak();
}

function getCurrentValue(criteria: AchievementCriteria): number {
  const circle = useCircleStore.getState();
  const education = useEducationStore.getState();
  const conv = useConversationStore.getState();
  const journal = useJournalStore.getState();
  const rituals = useRitualsStore.getState();
  const gratitude = useGratitudeStore.getState();
  const sleep = useSleepStore.getState();
  const win = useWinStore.getState();
  const decision = useDecisionStore.getState();
  const bias = useBiasStore.getState();
  const skills = useHumanSkillsStore.getState();

  const moodCount = (circle.moodHistory ?? []).length;
  const streak = getEngagementStreak();
  const lessonCount = education.completedLessons?.length ?? 0;
  const membersCount = (circle.members ?? []).length;
  const hasVoice = (conv.messages ?? []).some((m) => m.isVoice);
  const journalCount = (journal.entries ?? []).length;
  const preflightCount = rituals.preFlightEntries?.length ?? 0;
  const postflightCount = rituals.postFlightEntries?.length ?? 0;
  const gratitudeStreak = gratitude.getStreak();
  const sleepDays = sleep.getRecent(365).filter((d) => d.hours > 0 || d.quality > 0).length;
  const winCount = win.getTotalCount?.() ?? (win as any).wins?.length ?? 0;
  const conversationCount = (conv.messages ?? []).filter((m) => m.role === 'user').length;
  const decisionCount = (decision.getDecisions?.() ?? (decision as any).decisions ?? []).length;
  const biasCheckCount = (bias.getEntries?.() ?? (bias as any).entries ?? []).length;
  const totalSkillPoints = Object.values(skills.points ?? {}).reduce((a, b) => a + (b ?? 0), 0);

  const feelings101Ids = [
    'feelings-101-what-are-emotions',
    'feelings-101-name-it-to-tame-it',
    'feelings-101-body-keeps-score',
  ];
  const completedFeelings101 = feelings101Ids.every((id) => (education.completedLessons ?? []).includes(id));
  const allLessonIds = MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedAll = allLessonIds.every((id) => (education.completedLessons ?? []).includes(id));

  switch (criteria.type) {
    case 'first_checkin':
      return moodCount >= 1 ? 1 : 0;
    case 'checkin_count':
      return moodCount;
    case 'streak_days':
      return streak;
    case 'lesson_count':
      return lessonCount;
    case 'circle_members':
      return membersCount;
    case 'voice_used':
    case 'first_voice':
      return hasVoice ? 1 : 0;
    case 'module_complete':
      return completedFeelings101 ? 1 : 0;
    case 'ritual_preflight':
      return preflightCount;
    case 'ritual_postflight':
      return postflightCount;
    case 'journal_entries':
      return journalCount;
    case 'gratitude_streak':
      return gratitudeStreak;
    case 'win_count':
      return winCount;
    case 'conversation_count':
      return conversationCount;
    case 'decision_count':
      return decisionCount;
    case 'bias_check_count':
      return biasCheckCount;
    case 'sleep_logged':
      return sleepDays;
    case 'human_skill_points':
      return totalSkillPoints;
    case 'first_lesson':
      return lessonCount >= 1 ? 1 : 0;
    case 'first_postflight':
      return postflightCount >= 1 ? 1 : 0;
    case 'first_preflight':
      return preflightCount >= 1 ? 1 : 0;
    case 'first_journal':
      return journalCount >= 1 ? 1 : 0;
    case 'first_win':
      return winCount >= 1 ? 1 : 0;
    case 'first_decision':
      return decisionCount >= 1 ? 1 : 0;
    case 'first_gratitude':
      return gratitudeStreak >= 1 ? 1 : 0;
    case 'first_tool':
    case 'tool_used': {
      const used = [
        moodCount > 0,
        lessonCount > 0,
        journalCount > 0,
        winCount > 0,
        preflightCount > 0,
        postflightCount > 0,
        decisionCount > 0,
        biasCheckCount > 0,
        gratitudeStreak > 0,
        conversationCount > 0,
      ].filter(Boolean).length;
      return criteria.type === 'first_tool' ? (used >= 1 ? 1 : 0) : used;
    }
    default:
      return 0;
  }
}

/** Special cases: ritual-10 = preflight + postflight total; all-modules = completedAll */
function getCurrentValueForAchievement(achievementId: string, criteria: AchievementCriteria): number {
  if (achievementId === 'ritual-10') {
    const rituals = useRitualsStore.getState();
    return (rituals.preFlightEntries?.length ?? 0) + (rituals.postFlightEntries?.length ?? 0);
  }
  if (achievementId === 'all-modules') {
    const education = useEducationStore.getState();
    const allLessonIds = MODULES.flatMap((m) => m.lessons.map((l) => l.id));
    return allLessonIds.every((id) => (education.completedLessons ?? []).includes(id)) ? 1 : 0;
  }
  return getCurrentValue(criteria);
}

function getTargetForAchievement(achievementId: string, criteria: AchievementCriteria): number {
  if (achievementId === 'all-modules') return 1;
  return criteria.target;
}

/** Get current progress value for an achievement (for display). */
export function getAchievementProgress(achievementId: string): { current: number; target: number } {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return { current: 0, target: 0 };
  const current = getCurrentValueForAchievement(achievementId, achievement.criteria);
  const target = getTargetForAchievement(achievementId, achievement.criteria);
  return { current, target };
}

/**
 * Run all achievement checks. Unlocks any newly met and adds to pending for modal.
 * Call after check-in, tool use, ritual completion, etc.
 * Returns IDs that were newly unlocked this run.
 */
export function runAchievementChecks(): string[] {
  const unlock = useAchievementStore.getState().unlock;
  const isUnlocked = useAchievementStore.getState().isUnlocked;
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (isUnlocked(achievement.id)) continue;
    const current = getCurrentValueForAchievement(achievement.id, achievement.criteria);
    const target = getTargetForAchievement(achievement.id, achievement.criteria);
    if (current >= target) {
      if (unlock(achievement.id)) newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}
