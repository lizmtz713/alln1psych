/**
 * useDriftDetector Hook
 * 
 * Provides access to drift detection functionality:
 * - Weekly reflection trigger
 * - Pattern insights when enough data exists
 * - Loading states for async operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isWeeklyReflectionDue,
  getValueDriftPatterns,
  generateDriftInsight,
  getReflectionHistory,
  type DriftPattern,
  type DriftInsight,
  type ValueReflection,
} from '../services/driftDetector';
import { useUserStore } from '../stores/userStore';

const MIN_WEEKS_FOR_PATTERNS = 4;

export interface WeeklyReflectionState {
  isDue: boolean;
  loading: boolean;
  hasValues: boolean;
  valuesCount: number;
  refresh: () => Promise<void>;
}

/**
 * Hook to check if weekly reflection is due
 */
export function useWeeklyReflection(): WeeklyReflectionState {
  const [isDue, setIsDue] = useState(false);
  const [loading, setLoading] = useState(true);
  const values = useUserStore((s) => s.values);

  const checkDue = useCallback(async () => {
    setLoading(true);
    try {
      const due = await isWeeklyReflectionDue();
      setIsDue(due);
    } catch (e) {
      console.warn('[useWeeklyReflection] Error checking due:', e);
      setIsDue(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDue();
  }, [checkDue]);

  return {
    isDue,
    loading,
    hasValues: values.length > 0,
    valuesCount: values.length,
    refresh: checkDue,
  };
}

export interface DriftPatternsState {
  insights: DriftInsight[];
  patterns: DriftPattern[];
  history: ValueReflection[];
  hasEnoughData: boolean;
  weeksOfData: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to get drift patterns and insights
 * Only returns data when enough history exists (4+ weeks)
 */
export function useDriftPatterns(): DriftPatternsState {
  const [patterns, setPatterns] = useState<DriftPattern[]>([]);
  const [insights, setInsights] = useState<DriftInsight[]>([]);
  const [history, setHistory] = useState<ValueReflection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedPatterns, fetchedHistory] = await Promise.all([
        getValueDriftPatterns(),
        getReflectionHistory(),
      ]);

      setPatterns(fetchedPatterns);
      setInsights(generateDriftInsight(fetchedPatterns));
      setHistory(fetchedHistory);
    } catch (e) {
      console.warn('[useDriftPatterns] Error loading patterns:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  // Count unique weeks in history
  const uniqueWeeks = new Set(history.map(r => r.weekStartDate)).size;

  return {
    insights,
    patterns,
    history,
    hasEnoughData: uniqueWeeks >= MIN_WEEKS_FOR_PATTERNS,
    weeksOfData: uniqueWeeks,
    loading,
    refresh: loadPatterns,
  };
}

/**
 * Combined hook for common drift detector needs
 */
export function useDriftDetector() {
  const reflection = useWeeklyReflection();
  const patternsState = useDriftPatterns();

  return {
    // Weekly reflection
    reflectionDue: reflection.isDue,
    hasValues: reflection.hasValues,
    valuesCount: reflection.valuesCount,
    
    // Patterns
    insights: patternsState.insights,
    hasPatterns: patternsState.insights.length > 0,
    hasEnoughData: patternsState.hasEnoughData,
    weeksOfData: patternsState.weeksOfData,
    
    // Loading
    loading: reflection.loading || patternsState.loading,
    
    // Refresh
    refresh: async () => {
      await Promise.all([
        reflection.refresh(),
        patternsState.refresh(),
      ]);
    },
  };
}
