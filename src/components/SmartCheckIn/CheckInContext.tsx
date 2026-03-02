/**
 * CheckInContext — React context for smart check-in state
 * 
 * Provides:
 * - Current check-in prompt (if any)
 * - Functions to trigger check-ins
 * - Pattern tracking for contextual prompts
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { shouldPromptCheckIn, getDayPart, getDayOfWeek } from './contextEngine';
import type { GaugeName, CheckInResult, CheckInLevel } from './types';

interface CheckInContextValue {
  // Current prompt
  currentPrompt: {
    shouldShow: boolean;
    level: CheckInLevel;
    gauge?: GaugeName;
    message: string;
  } | null;
  
  // Actions
  triggerCheckIn: (level: CheckInLevel, gauge?: GaugeName) => void;
  dismissPrompt: () => void;
  recordCheckIn: (result: CheckInResult) => void;
  
  // State
  lastCheckIn?: CheckInResult;
  patterns: UserPatterns;
}

interface UserPatterns {
  usualCheckInTimes: string[];
  lowStateDays: string[];
  lowStateAfterEvents: string[];
}

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [currentPrompt, setCurrentPrompt] = useState<CheckInContextValue['currentPrompt']>(null);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | undefined>();
  const [patterns, setPatterns] = useState<UserPatterns>({
    usualCheckInTimes: ['09:00', '21:00'],
    lowStateDays: [],
    lowStateAfterEvents: [],
  });
  
  // Trigger a check-in
  const triggerCheckIn = useCallback((level: CheckInLevel, gauge?: GaugeName) => {
    setCurrentPrompt({
      shouldShow: true,
      level,
      gauge,
      message: gauge ? `How's your ${gauge}?` : 'Time for a check-in',
    });
  }, []);
  
  // Dismiss current prompt
  const dismissPrompt = useCallback(() => {
    setCurrentPrompt(null);
  }, []);
  
  // Record a completed check-in
  const recordCheckIn = useCallback((result: CheckInResult) => {
    setLastCheckIn(result);
    setCurrentPrompt(null);
    
    // Update patterns based on result
    // (In real app, this would persist to storage and analyze over time)
  }, []);
  
  // Check if we should prompt
  useEffect(() => {
    const checkPrompt = () => {
      const prompt = shouldPromptCheckIn(patterns, {
        lastCheckInTime: lastCheckIn?.timestamp,
        lastGaugeValues: lastCheckIn?.gauges,
        currentDayPart: getDayPart(),
        dayOfWeek: getDayOfWeek(),
        hour: new Date().getHours(),
      });
      
      if (prompt.shouldPrompt && !currentPrompt) {
        setCurrentPrompt({
          shouldShow: true,
          level: prompt.level,
          gauge: prompt.gauge,
          message: prompt.message,
        });
      }
    };
    
    // Check on mount and every 30 minutes
    checkPrompt();
    const interval = setInterval(checkPrompt, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [patterns, lastCheckIn, currentPrompt]);
  
  return (
    <CheckInContext.Provider
      value={{
        currentPrompt,
        triggerCheckIn,
        dismissPrompt,
        recordCheckIn,
        lastCheckIn,
        patterns,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckInContext() {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckInContext must be used within CheckInProvider');
  }
  return context;
}

export default CheckInContext;
