/**
 * usePatternReadiness Hook
 * 
 * Checks if user has enough check-ins for pattern detection.
 * Minimum: 7 check-ins to build a meaningful system model.
 */

import { useState, useEffect } from 'react';
import { getGaugeHistory } from '../services/crisisPipeline';

const MINIMUM_CHECKINS = 7;

export interface PatternReadiness {
  isReady: boolean;
  checkInCount: number;
  neededForPatterns: number;
  progressPercent: number;
  message: string | null;
}

export function usePatternReadiness(): PatternReadiness & { loading: boolean } {
  const [loading, setLoading] = useState(true);
  const [checkInCount, setCheckInCount] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getGaugeHistory();
        // Count unique check-in sessions (by day)
        const uniqueDays = new Set(
          history.map(h => new Date(h.timestamp).toDateString())
        ).size;
        setCheckInCount(uniqueDays);
      } catch (e) {
        console.warn('[usePatternReadiness] Failed to load history:', e);
        setCheckInCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const isReady = checkInCount >= MINIMUM_CHECKINS;
  const neededForPatterns = Math.max(0, MINIMUM_CHECKINS - checkInCount);
  const progressPercent = Math.min(100, Math.round((checkInCount / MINIMUM_CHECKINS) * 100));

  const message = isReady
    ? null
    : checkInCount === 0
      ? 'Start checking in to reveal your patterns'
      : neededForPatterns === 1
        ? 'Almost there! 1 more check-in to unlock your patterns'
        : `Building your system model... ${neededForPatterns} more check-ins needed`;

  return {
    loading,
    isReady,
    checkInCount,
    neededForPatterns,
    progressPercent,
    message,
  };
}
