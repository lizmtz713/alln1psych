/**
 * Adaptive Onboarding - React hooks for level, sections, focus mode, invitations.
 */

import { useState, useEffect } from 'react';
import { useCircleStore } from '../stores/circleStore';
import { useCockpitStore } from '../stores/cockpitStore';
import type { ExperienceLevel, HomeSections } from '../types/onboarding';
import {
  ensureFirstLaunchDate,
  getDaysSinceInstall,
  getExperienceLevel,
  getSectionsForLevel,
  getPendingInvitation,
  type PendingInvitationPayload,
} from '../services/onboardingService';
import { useOnboardingStore } from '../stores/onboardingStore';

export function useExperienceLevel(): {
  level: ExperienceLevel;
  checkInCount: number;
  daysSinceInstall: number;
} {
  const moodHistory = useCircleStore((s) => s.moodHistory ?? []);
  const [daysSinceInstall, setDaysSinceInstall] = useState(0);

  useEffect(() => {
    ensureFirstLaunchDate().then(() => getDaysSinceInstall().then(setDaysSinceInstall));
  }, []);

  const checkInCount = moodHistory.length;
  const level = getExperienceLevel(checkInCount, daysSinceInstall);

  return { level, checkInCount, daysSinceInstall };
}

export function useAdaptiveHomeSections(): HomeSections & { level: ExperienceLevel } {
  const { level, checkInCount } = useExperienceLevel();
  const { focusMode } = useFocusMode();
  const sections = getSectionsForLevel(level, focusMode, checkInCount);
  return { ...sections, level };
}

export function useFocusMode(): {
  focusMode: boolean;
  setFocusMode: (on: boolean) => Promise<void>;
  isLoading: boolean;
} {
  const focusMode = useOnboardingStore((s) => s.focusMode);
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const setFocusMode = useOnboardingStore((s) => s.setFocusMode);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return { focusMode, setFocusMode, isLoading: !hydrated };
}

export function usePendingInvitation(): {
  invitation: PendingInvitationPayload | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { checkInCount } = useExperienceLevel();
  const [daysSinceInstall, setDaysSinceInstall] = useState(0);
  const stateValue = useCockpitStore((s) => s.state.value);
  const connectionValue = useCockpitStore((s) => s.connection.value);
  const [invitation, setInvitation] = useState<PendingInvitationPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDaysSinceInstall().then(setDaysSinceInstall);
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const inv = await getPendingInvitation({
        checkInCount,
        daysSinceInstall,
        stateValue: stateValue >= 0 ? stateValue : 100,
        connectionValue: connectionValue >= 0 ? connectionValue : 100,
      });
      setInvitation(inv);
    } catch {
      setInvitation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [checkInCount, daysSinceInstall, stateValue, connectionValue]);

  return { invitation, loading, refresh };
}
