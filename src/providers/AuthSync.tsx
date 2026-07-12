import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useJournalStore } from '../stores/journalStore';
import { useCircleStore } from '../stores/circleStore';
import { useEducationStore } from '../stores/educationStore';
import {
  getProfile,
  getJournalEntries,
  getMoodHistory,
  getEducationProgress,
  getCircleMembers,
  getNudges,
} from '../services/database';
import type { AgeGroup, LearningStyle } from '../stores/userStore';
import { TEMPERATURE_LABELS } from '../stores/circleStore';
import type { Temperature } from '../stores/circleStore';
import { resetUserScopedStoresInMemory } from '../services/sessionReset';

/**
 * Syncs auth userId to authStore and hydrates all stores from Supabase when user is present.
 * Clears userId on sign out.
 */
export function AuthSync({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const setUserId = useAuthStore((s) => s.setUserId);

  useEffect(() => {
    // Wait for initial session resolve — do NOT wipe local state during auth bootstrap
    if (loading) return;

    if (!user) {
      // Memory-only reset. Do NOT await AsyncStorage here — that double-purge
      // after performSignOut() was freezing logout on physical devices.
      setUserId(null);
      useUserStore.setState({ profileHydrated: false });
      resetUserScopedStoresInMemory();
      return;
    }
    const id = user.id;
    setUserId(id);

    let cancelled = false;

    async function hydrate() {
      const profile = await getProfile(id);
      if (cancelled) return;
      useUserStore.setState({ profileHydrated: true });
      if (!profile) return;
      useUserStore.setState({
        name: profile.name ?? '',
        pronouns: (profile.pronouns as 'she/her' | 'he/him' | 'they/them' | 'other') ?? null,
        ageGroup: (profile.age_group as AgeGroup) ?? null,
        communicationPreference:
          (profile.communication_preference as 'voice' | 'text') ?? null,
        loveLanguage:
          (profile.love_language as 'words' | 'quality-time' | 'acts-of-service' | 'physical-touch' | 'gifts' | 'unknown') ?? null,
        learningStyle: (profile.learning_style as LearningStyle) ?? null,
        onboardingCompleted: profile.onboarding_completed ?? false,
        profileHydrated: true,
      });

      const entries = await getJournalEntries(id, 100);
      if (!cancelled && entries.length > 0) {
        useJournalStore.setState({
          entries: entries.map((e) => ({
            id: e.id,
            content: e.content,
            mood: e.mood as 'green' | 'yellow' | 'orange' | 'red' | undefined,
            source: (e.source as 'manual' | 'conversation') || 'manual',
            conversationId: e.conversation_id ?? undefined,
            createdAt: new Date(e.created_at),
          })),
        });
      }

      const moodHistory = await getMoodHistory(id, 365);
      if (!cancelled && moodHistory.length > 0) {
        useCircleStore.setState({
          moodHistory: moodHistory.map((m) => ({
            id: m.id,
            mood: m.mood as Temperature,
            label: m.mood_label,
            note: m.note ?? undefined,
            timestamp: new Date(m.created_at),
          })),
        });
      }

      const progress = await getEducationProgress(id);
      if (!cancelled && progress.length > 0) {
        const completed = progress.filter((p) => p.completed).map((p) => p.lesson_id);
        const lastCompleted = progress
          .filter((p) => p.completed_at)
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];
        useEducationStore.setState((s) => ({
          completedLessons: completed.length > 0 ? completed : s.completedLessons,
          lastLessonDate: lastCompleted?.completed_at ? new Date(lastCompleted.completed_at) : s.lastLessonDate,
          streakDays: s.streakDays,
        }));
      }

      const members = await getCircleMembers(id);
      if (!cancelled && members.length > 0) {
        useCircleStore.setState((s) => ({
          members: members.map((m) => ({
            id: m.id,
            name: m.member_name,
            relationship: m.relationship as import('../stores/circleStore').RelationshipType,
            contactMethod: m.contact_method ?? '',
            sharingLevel: (m.sharing_level as 'full' | 'limited') || 'full',
            temperature: 'green' as Temperature,
            temperatureLabel: TEMPERATURE_LABELS.green,
            lastUpdated: new Date(),
            addedAt: new Date(m.created_at),
          })),
        }));
      }

      const nudgesList = await getNudges(id);
      if (!cancelled && nudgesList.length > 0) {
        useCircleStore.setState((s) => ({
          nudges: nudgesList.map((n) => ({
            id: n.id,
            memberName: n.member_name,
            message: n.message,
            timestamp: new Date(n.created_at),
            read: n.read,
            actedOn: n.acted_on,
          })),
        }));
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [loading, user?.id, setUserId]);

  return <>{children}</>;
}
