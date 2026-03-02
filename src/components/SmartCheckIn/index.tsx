/**
 * SmartCheckIn — Science-based check-in system
 * 
 * PRINCIPLES:
 * 1. Body first (interoception → emotion)
 * 2. Match to capacity (adaptive depth)
 * 3. Vary questions (anti-habituation)
 * 4. In-the-moment (micro > recall)
 * 5. Meaningful (insight, not data extraction)
 * 
 * LEVELS:
 * - Micro: Single gauge, 5 seconds (watch, widget)
 * - Quick: All 6 gauges, 30-60 seconds
 * - Deep: Reflection + patterns, 3-5 minutes
 */

export { MicroCheckIn } from './MicroCheckIn';
export { QuickCheckIn } from './QuickCheckIn';
export { DeepCheckIn } from './DeepCheckIn';
export { useCheckInContext } from './CheckInContext';
export { getContextualPrompt, shouldPromptCheckIn } from './contextEngine';

// Re-export types
export type { CheckInLevel, CheckInResult, GaugeName } from './types';
