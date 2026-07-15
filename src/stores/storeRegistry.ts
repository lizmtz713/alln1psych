/**
 * Central account-boundary registry.
 *
 * Every Zustand store that can hold user-derived state must be reset when the
 * authenticated identity changes. Keeping this list explicit makes new stores
 * visible in review and prevents cross-account memory leakage on shared devices.
 */
import { useAchievementStore } from './achievementStore';
import { useAttachmentStore } from './attachmentStore';
import { useAttractionStore } from './attractionStore';
import { useAuthStore } from './authStore';
import { useBiasStore } from './biasStore';
import { useBodyMaintenanceStore } from './bodyMaintenanceStore';
import { useBoundariesStore } from './boundariesStore';
import { useCircleStore } from './circleStore';
import { useCockpitStore } from './cockpitStore';
import { useConversationStore } from './conversationStore';
import { useConversationSummaryStore } from './conversationSummaryStore';
import { useCreativityStore } from './creativityStore';
import { useCriticalThinkingStore } from './criticalThinkingStore';
import { useCycleStore } from './cycleStore';
import { useDailyAnchorsStore } from './dailyAnchorsStore';
import { useDailyContentStore } from './dailyContentStore';
import { useDatesumeStore } from './datesumeStore';
import { useDecisionStore } from './decisionStore';
import { useDifficultPeopleStore } from './difficultPeopleStore';
import { useEducationStore } from './educationStore';
import { useEmergencyStore } from './emergencyStore';
import { useEngagementStore } from './engagementStore';
import { useFamilyStore } from './familyStore';
import { useFocusStore } from './focusStore';
import { useFoundationStore } from './foundationStore';
import { useGaugeDefinitionsStore } from './gaugeDefinitionsStore';
import { useGoalsStore } from './goalsStore';
import { useGratitudeStore } from './gratitudeStore';
import { useHabitStore } from './habitStore';
import { useHealthStore } from './healthStore';
import { useHeartInboxStore } from './heartInboxStore';
import { useHeartNotesStore } from './heartNotesStore';
import { useHelpSomeoneStore } from './helpSomeoneStore';
import { useHumanSkillsStore } from './humanSkillsStore';
import { useInsightsStore } from './insightsStore';
import { useJournalStore } from './journalStore';
import { useLegalConsentStore } from './legalConsentStore';
import { useLifeQuestionsStore } from './lifeQuestionsStore';
import { useLifeStagesStore } from './lifeStagesStore';
import { useLightsStore } from './lightsStore';
import { useLoveHistoryStore } from './loveHistoryStore';
import { useMemoryBuilderStore } from './memoryBuilderStore';
import { useNewsMyWayStore } from './newsMyWayStore';
import { useNotificationSettingsStore } from './notificationSettingsStore';
import { useOnboardingStore } from './onboardingStore';
import { usePremiumStore } from './premiumStore';
import { useResetStore } from './resetStore';
import { useRitualsStore } from './ritualsStore';
import { useRolePlayStore } from './rolePlayStore';
import { useSettingsStore } from './settingsStore';
import { useSleepStore } from './sleepStore';
import { useSpotifyStore } from './spotifyStore';
import { useSuccessStore } from './successStore';
import { useTherapistShareStore } from './therapistShareStore';
import { useUsageStore } from './usageStore';
import { useUserStore } from './userStore';
import { useWearableBaselineStore } from './wearableBaselineStore';
import { useWeatherStore } from './weatherStore';
import { useWeeklyInsightStore } from './weeklyInsightStore';
import { useWinStore } from './winStore';

type ZustandStore = {
  getInitialState: () => unknown;
  setState: (state: unknown, replace?: boolean) => void;
};

const USER_SCOPED_STORES: ZustandStore[] = [
  useAchievementStore,
  useAttachmentStore,
  useAttractionStore,
  useAuthStore,
  useBiasStore,
  useBodyMaintenanceStore,
  useBoundariesStore,
  useCircleStore,
  useCockpitStore,
  useConversationStore,
  useConversationSummaryStore,
  useCreativityStore,
  useCriticalThinkingStore,
  useCycleStore,
  useDailyAnchorsStore,
  useDailyContentStore,
  useDatesumeStore,
  useDecisionStore,
  useDifficultPeopleStore,
  useEducationStore,
  useEmergencyStore,
  useEngagementStore,
  useFamilyStore,
  useFocusStore,
  useFoundationStore,
  useGaugeDefinitionsStore,
  useGoalsStore,
  useGratitudeStore,
  useHabitStore,
  useHealthStore,
  useHeartInboxStore,
  useHeartNotesStore,
  useHelpSomeoneStore,
  useHumanSkillsStore,
  useInsightsStore,
  useJournalStore,
  useLegalConsentStore,
  useLifeQuestionsStore,
  useLifeStagesStore,
  useLightsStore,
  useLoveHistoryStore,
  useMemoryBuilderStore,
  useNewsMyWayStore,
  useNotificationSettingsStore,
  useOnboardingStore,
  usePremiumStore,
  useResetStore,
  useRitualsStore,
  useRolePlayStore,
  useSettingsStore,
  useSleepStore,
  useSpotifyStore,
  useSuccessStore,
  useTherapistShareStore,
  useUsageStore,
  useUserStore,
  useWearableBaselineStore,
  useWeatherStore,
  useWeeklyInsightStore,
  useWinStore,
] as unknown as ZustandStore[];

export function resetAllUserScopedStoresInMemory(): void {
  for (const store of USER_SCOPED_STORES) {
    try {
      store.setState(store.getInitialState(), true);
    } catch {
      // One malformed feature store must never prevent the rest from being wiped.
    }
  }
}

export const USER_SCOPED_STORE_COUNT = USER_SCOPED_STORES.length;
