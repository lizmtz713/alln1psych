/**
 * Renders AchievementModal when there are pending unlocked achievements.
 * Place once in root layout.
 */

import React from 'react';
import { useAchievementStore } from '../../stores/achievementStore';
import { AchievementModal } from './AchievementModal';

export function AchievementModalHolder() {
  const pendingUnlocked = useAchievementStore((s) => s.pendingUnlocked);
  const shiftPending = useAchievementStore((s) => s.shiftPending);

  const currentId = pendingUnlocked[0] ?? null;
  const visible = currentId !== null;

  const handleDismiss = () => {
    shiftPending();
  };

  return (
    <AchievementModal
      achievementId={currentId}
      visible={visible}
      onDismiss={handleDismiss}
    />
  );
}
