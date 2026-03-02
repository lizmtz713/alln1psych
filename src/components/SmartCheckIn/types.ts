/**
 * SmartCheckIn Types
 */

export type GaugeName = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export type CheckInLevel = 'micro' | 'quick' | 'deep';

export interface CheckInResult {
  level: CheckInLevel;
  timestamp: Date;
  gauges: Partial<Record<GaugeName, number>>;
  context?: {
    trigger?: string;  // What triggered this check-in
    location?: string;
    dayPart?: 'morning' | 'afternoon' | 'evening' | 'night';
    event?: string;    // Calendar event, call, etc.
  };
  reflection?: string; // Free text for deep check-ins
  insights?: string[]; // AI-generated insights
}

export interface QuestionVariant {
  id: string;
  text: string;
  subtext?: string;
  emoji?: string;
}

export interface GaugeQuestion {
  gauge: GaugeName;
  variants: QuestionVariant[];
  type: 'checklist' | 'single' | 'multi' | 'scale' | 'image';
  options: GaugeOption[];
}

export interface GaugeOption {
  id: string;
  label: string;
  emoji: string;
  value: number;
  description?: string;
}

export interface CheckInState {
  currentGauge: GaugeName;
  answers: Partial<Record<GaugeName, any>>;
  startTime: Date;
  variant: number; // Which question variant to use
}
