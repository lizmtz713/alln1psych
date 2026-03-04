/**
 * Emergency Mode — When you're not okay. Minimal tracking, safety-first.
 */

export type EmergencyTrigger = 'manual' | 'auto_state' | 'checkin_keywords' | 'copilot_detected';

export type EmergencyAction = 'crisis_lines' | 'copilot' | 'breathe' | 'reach_out';

export interface EmergencySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  trigger: EmergencyTrigger;
  actionsUsed: EmergencyAction[];
  contactedLightId?: string;
  trustedContactNotified: boolean;
}

export interface EmergencySettings {
  autoSuggestWhenStateLow: boolean;
  stateThreshold: number;
  trustedContactEnabled: boolean;
  trustedContactId: string | null;
  showNotOkayButtonOnHome: boolean;
}

export const DEFAULT_EMERGENCY_SETTINGS: EmergencySettings = {
  autoSuggestWhenStateLow: true,
  stateThreshold: 15,
  trustedContactEnabled: false,
  trustedContactId: null,
  showNotOkayButtonOnHome: true,
};
