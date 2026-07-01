/**
 * Cycle Intelligence Store
 * 
 * Manages menstrual cycle data, phase detection, and gauge correlation.
 * Builds on HealthKit data to provide cycle-aware insights.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHealthStore } from './healthStore';

// ============ Types ============

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  dayRange: string;
  energyLevel: 'low' | 'rising' | 'peak' | 'declining';
  typicalTraits: string[];
  bestFor: string[];
  selfCare: string[];
}

export interface CyclePatternData {
  phase: CyclePhase;
  gaugeType: string;
  avgValue: number;
  sampleCount: number;
}

export interface CycleInsight {
  type: 'context' | 'prediction' | 'pattern' | 'anomaly';
  message: string;
  gaugeAffected?: string;
  severity?: 'info' | 'gentle' | 'important';
}

export interface CycleState {
  // Enable/disable
  trackingEnabled: boolean;
  sharingEnabled: boolean;
  sharingLevel: 'phase_only' | 'full_context' | 'none';
  
  // Manual entry (fallback if no HealthKit)
  manualCycleLength: number;
  manualLastPeriodStart: string | null;
  
  // Calculated state
  currentPhase: CyclePhase | null;
  dayOfCycle: number | null;
  cycleLength: number;
  daysUntilPeriod: number | null;
  daysUntilOvulation: number | null;
  
  // Patterns (learned over time)
  patterns: CyclePatternData[];
  cycleHistory: Array<{
    startDate: string;
    length: number;
  }>;
  
  // Actions
  setTrackingEnabled: (enabled: boolean) => void;
  setSharingEnabled: (enabled: boolean) => void;
  setSharingLevel: (level: 'phase_only' | 'full_context' | 'none') => void;
  setManualPeriodStart: (date: string) => void;
  setManualCycleLength: (length: number) => void;
  syncFromHealthKit: () => void;
  recordGaugeForPattern: (gaugeType: string, value: number) => void;
  getPhaseInfo: () => PhaseInfo | null;
  getInsightsForGauge: (gaugeType: string) => CycleInsight[];
  getAllInsights: () => CycleInsight[];
  getCycleContextForAI: () => string;
}

// ============ Phase Definitions ============

export const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: 'Menstrual',
    emoji: '🌑',
    color: '#8B0000',
    description: 'Inner winter — time for rest and reflection',
    dayRange: 'Days 1-5',
    energyLevel: 'low',
    typicalTraits: [
      'Lower energy',
      'Need for rest',
      'Introspection',
      'Release',
    ],
    bestFor: [
      'Rest and recovery',
      'Journaling',
      'Gentle movement',
      'Saying no',
    ],
    selfCare: [
      'Warm baths or heating pads',
      'Comfort foods (iron-rich)',
      'Extra sleep',
      'Canceling non-essential plans',
    ],
  },
  follicular: {
    name: 'Follicular',
    emoji: '🌱',
    color: '#228B22',
    description: 'Inner spring — energy is building, optimism returns',
    dayRange: 'Days 6-14',
    energyLevel: 'rising',
    typicalTraits: [
      'Rising energy',
      'Optimism',
      'Creativity',
      'Open to new ideas',
    ],
    bestFor: [
      'Starting new projects',
      'Brainstorming',
      'Learning new skills',
      'Social planning',
    ],
    selfCare: [
      'Try new activities',
      'Fresh, light foods',
      'Morning workouts',
      'Planning and organizing',
    ],
  },
  ovulatory: {
    name: 'Ovulatory',
    emoji: '☀️',
    color: '#FFD700',
    description: 'Inner summer — peak energy and social magnetism',
    dayRange: 'Days 15-17',
    energyLevel: 'peak',
    typicalTraits: [
      'Peak energy',
      'Confidence',
      'Communication skills',
      'Social magnetism',
    ],
    bestFor: [
      'Important meetings',
      'Presentations',
      'Difficult conversations',
      'Networking',
    ],
    selfCare: [
      'High-intensity workouts',
      'Social activities',
      'Take on challenges',
      'Enjoy being out there',
    ],
  },
  luteal: {
    name: 'Luteal',
    emoji: '🌙',
    color: '#4B0082',
    description: 'Inner autumn — winding down, detail-oriented',
    dayRange: 'Days 18-28',
    energyLevel: 'declining',
    typicalTraits: [
      'Declining energy',
      'Detail-focused',
      'Inner critic louder',
      'Need more support',
    ],
    bestFor: [
      'Completing projects',
      'Detail work',
      'Organizing',
      'Tying up loose ends',
    ],
    selfCare: [
      'Extra self-compassion',
      'Magnesium and B6',
      'Moderate exercise',
      'Comfort and cozy',
    ],
  },
};

// ============ Helper Functions ============

function calculatePhase(dayOfCycle: number, cycleLength: number): CyclePhase {
  // Adjust phase boundaries based on cycle length
  const ovulationDay = Math.round(cycleLength - 14); // Ovulation is ~14 days before next period
  
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle < ovulationDay - 1) return 'follicular';
  if (dayOfCycle <= ovulationDay + 2) return 'ovulatory';
  return 'luteal';
}

function getDayOfCycle(lastPeriodStart: Date, today: Date = new Date()): number {
  const diff = today.getTime() - lastPeriodStart.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ============ Store ============

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      // Defaults
      trackingEnabled: false,
      sharingEnabled: false,
      sharingLevel: 'phase_only',
      manualCycleLength: 28,
      manualLastPeriodStart: null,
      currentPhase: null,
      dayOfCycle: null,
      cycleLength: 28,
      daysUntilPeriod: null,
      daysUntilOvulation: null,
      patterns: [],
      cycleHistory: [],

      setTrackingEnabled: (enabled) => {
        set({ trackingEnabled: enabled });
        if (enabled) {
          get().syncFromHealthKit();
        }
      },

      setSharingEnabled: (enabled) => set({ sharingEnabled: enabled }),
      
      setSharingLevel: (level) => set({ sharingLevel: level }),

      setManualPeriodStart: (date) => {
        set({ manualLastPeriodStart: date });
        get().syncFromHealthKit();
      },

      setManualCycleLength: (length) => {
        set({ manualCycleLength: length, cycleLength: length });
        get().syncFromHealthKit();
      },

      syncFromHealthKit: () => {
        const { trackingEnabled, manualLastPeriodStart, manualCycleLength } = get();
        if (!trackingEnabled) return;

        // Try to get from HealthKit first
        const healthSnapshot = useHealthStore.getState().snapshot;
        const menstruation = healthSnapshot?.menstruation;

        let lastPeriodStart: Date | null = null;
        let cycleLength = manualCycleLength;

        if (menstruation?.lastPeriodStart) {
          lastPeriodStart = new Date(menstruation.lastPeriodStart);
          cycleLength = menstruation.cycleLength || manualCycleLength;
        } else if (manualLastPeriodStart) {
          lastPeriodStart = new Date(manualLastPeriodStart);
        }

        if (!lastPeriodStart) {
          set({
            currentPhase: null,
            dayOfCycle: null,
            daysUntilPeriod: null,
            daysUntilOvulation: null,
          });
          return;
        }

        const dayOfCycle = getDayOfCycle(lastPeriodStart);
        const phase = calculatePhase(dayOfCycle, cycleLength);
        const ovulationDay = Math.round(cycleLength - 14);

        set({
          currentPhase: phase,
          dayOfCycle,
          cycleLength,
          daysUntilPeriod: cycleLength - dayOfCycle + 1,
          daysUntilOvulation: Math.max(0, ovulationDay - dayOfCycle),
        });
      },

      recordGaugeForPattern: (gaugeType: string, value: number) => {
        const { currentPhase, patterns } = get();
        if (!currentPhase) return;

        const existingIdx = patterns.findIndex(
          (p) => p.phase === currentPhase && p.gaugeType === gaugeType
        );

        if (existingIdx >= 0) {
          const existing = patterns[existingIdx];
          const newAvg = (existing.avgValue * existing.sampleCount + value) / (existing.sampleCount + 1);
          const updated = [...patterns];
          updated[existingIdx] = {
            ...existing,
            avgValue: Math.round(newAvg),
            sampleCount: existing.sampleCount + 1,
          };
          set({ patterns: updated });
        } else {
          set({
            patterns: [
              ...patterns,
              { phase: currentPhase, gaugeType, avgValue: value, sampleCount: 1 },
            ],
          });
        }
      },

      getPhaseInfo: () => {
        const { currentPhase } = get();
        if (!currentPhase) return null;
        return PHASE_INFO[currentPhase];
      },

      getInsightsForGauge: (gaugeType: string): CycleInsight[] => {
        const { currentPhase, dayOfCycle, patterns, cycleLength } = get();
        if (!currentPhase || dayOfCycle === null) return [];

        const insights: CycleInsight[] = [];
        const phaseInfo = PHASE_INFO[currentPhase];

        // Context insight
        const contextMessages: Record<CyclePhase, Record<string, string>> = {
          menstrual: {
            body: 'Lower energy is normal during menstruation',
            state: 'Your nervous system needs extra gentleness right now',
            emotion: 'Emotions may feel heavier — this is part of the release',
            connection: 'It\'s okay to need more solitude right now',
            direction: 'Motivation dips are normal — rest is productive',
            alignment: 'Good time to reflect on values, not push forward',
          },
          follicular: {
            body: 'Energy is building — great time for new activities',
            state: 'Your stress resilience is improving',
            emotion: 'Optimism is rising with your estrogen',
            connection: 'Social energy is returning',
            direction: 'Perfect time to start new projects',
            alignment: 'Vision-setting energy is high',
          },
          ovulatory: {
            body: 'Peak physical energy — use it!',
            state: 'Your nervous system is at its most resilient',
            emotion: 'Emotional expression comes easily now',
            connection: 'Communication skills are at their peak',
            direction: 'Best time for big moves and presentations',
            alignment: 'Values feel clearest during ovulation',
          },
          luteal: {
            body: 'Energy naturally declines — adjust expectations',
            state: 'Fight/flight sensitivity increases — be gentle',
            emotion: 'Inner critic may be louder — it\'s hormonal, not truth',
            connection: 'You may need support but feel like pushing away',
            direction: 'Detail work good, new initiatives harder',
            alignment: 'Doubt is common — don\'t make big decisions now',
          },
        };

        const contextMsg = contextMessages[currentPhase][gaugeType];
        if (contextMsg) {
          insights.push({
            type: 'context',
            message: contextMsg,
            gaugeAffected: gaugeType,
            severity: 'info',
          });
        }

        // Pattern insight (if we have enough data)
        const pattern = patterns.find(
          (p) => p.phase === currentPhase && p.gaugeType === gaugeType
        );
        if (pattern && pattern.sampleCount >= 3) {
          insights.push({
            type: 'pattern',
            message: `Your ${gaugeType} typically averages ${pattern.avgValue} during ${phaseInfo.name} phase`,
            gaugeAffected: gaugeType,
            severity: 'info',
          });
        }

        // Prediction insight (late luteal warning)
        if (currentPhase === 'luteal' && dayOfCycle >= cycleLength - 5) {
          insights.push({
            type: 'prediction',
            message: 'Period approaching — expect energy and mood shifts',
            gaugeAffected: gaugeType,
            severity: 'gentle',
          });
        }

        return insights;
      },

      getAllInsights: (): CycleInsight[] => {
        const { currentPhase, dayOfCycle, cycleLength, daysUntilPeriod, daysUntilOvulation } = get();
        if (!currentPhase || dayOfCycle === null) return [];

        const insights: CycleInsight[] = [];
        const phaseInfo = PHASE_INFO[currentPhase];

        // Phase context
        insights.push({
          type: 'context',
          message: `Day ${dayOfCycle} — ${phaseInfo.name} phase. ${phaseInfo.description}`,
          severity: 'info',
        });

        // Energy level
        const energyMessages = {
          low: 'Energy is naturally lower — honor your need for rest',
          rising: 'Energy is building — great time to take on new things',
          peak: 'Peak energy phase — make the most of it!',
          declining: 'Energy is winding down — prioritize and delegate',
        };
        insights.push({
          type: 'context',
          message: energyMessages[phaseInfo.energyLevel],
          severity: 'info',
        });

        // Upcoming events
        if (daysUntilOvulation !== null && daysUntilOvulation > 0 && daysUntilOvulation <= 5) {
          insights.push({
            type: 'prediction',
            message: `Ovulation in ~${daysUntilOvulation} days — peak energy coming`,
            severity: 'info',
          });
        }

        if (daysUntilPeriod !== null && daysUntilPeriod <= 7) {
          insights.push({
            type: 'prediction',
            message: `Period in ~${daysUntilPeriod} days — consider lightening your schedule`,
            severity: 'gentle',
          });
        }

        return insights;
      },

      getCycleContextForAI: (): string => {
        const { trackingEnabled, currentPhase, dayOfCycle, cycleLength, patterns } = get();
        
        if (!trackingEnabled || !currentPhase || dayOfCycle === null) {
          return '';
        }

        const phaseInfo = PHASE_INFO[currentPhase];
        
        let context = `
CYCLE CONTEXT:
- Current day: ${dayOfCycle} of ${cycleLength}
- Phase: ${phaseInfo.name} (${phaseInfo.description})
- Energy level: ${phaseInfo.energyLevel}
- Typical traits: ${phaseInfo.typicalTraits.join(', ')}

IMPORTANT: Factor cycle phase into your interpretation of readings.
- Don't pathologize normal cycle-related fluctuations
- Use normalizing language when appropriate (\"This is typical for ${phaseInfo.name} phase\")
- Suggest phase-appropriate self-care: ${phaseInfo.selfCare.join(', ')}
`;

        // Add pattern data if available
        const relevantPatterns = patterns.filter(
          (p) => p.phase === currentPhase && p.sampleCount >= 3
        );
        if (relevantPatterns.length > 0) {
          context += '\nUSER\'S HISTORICAL PATTERNS THIS PHASE:\n';
          relevantPatterns.forEach((p) => {
            context += `- ${p.gaugeType}: typically averages ${p.avgValue}\n`;
          });
        }

        return context;
      },
    }),
    {
      name: 'cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        trackingEnabled: state.trackingEnabled,
        sharingEnabled: state.sharingEnabled,
        sharingLevel: state.sharingLevel,
        manualCycleLength: state.manualCycleLength,
        manualLastPeriodStart: state.manualLastPeriodStart,
        patterns: state.patterns,
        cycleHistory: state.cycleHistory,
      }),
    }
  )
);

// ============ Hook for Components ============

export function useCycleData() {
  const trackingEnabled = useCycleStore((s) => s.trackingEnabled);
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const daysUntilPeriod = useCycleStore((s) => s.daysUntilPeriod);
  const daysUntilOvulation = useCycleStore((s) => s.daysUntilOvulation);
  const getPhaseInfo = useCycleStore((s) => s.getPhaseInfo);
  const getAllInsights = useCycleStore((s) => s.getAllInsights);
  const getInsightsForGauge = useCycleStore((s) => s.getInsightsForGauge);

  return {
    trackingEnabled,
    currentPhase,
    dayOfCycle,
    cycleLength,
    daysUntilPeriod,
    daysUntilOvulation,
    phaseInfo: getPhaseInfo(),
    insights: getAllInsights(),
    getInsightsForGauge,
  };
}
