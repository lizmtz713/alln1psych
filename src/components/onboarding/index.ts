/**
 * Adaptive Onboarding - Exports and integration guide.
 *
 * Experience levels: new (<7 check-ins or <3 days), learning (7-30), engaged (30-100), power (100+).
 * Home sections are controlled by useAdaptiveHomeSections() and conditionals in app/(tabs)/index.tsx.
 * Focus Mode: Settings > Home > Focus Mode. Persisted in AsyncStorage; shared via onboardingStore.
 * Feature invitations: usePendingInvitation() and FeatureInvitationModal; triggers in onboardingService.
 */

export { FeatureInvitationModal } from './FeatureInvitationModal';
