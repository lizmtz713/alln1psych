/**
 * Foundation Store
 * 
 * Manages the 3 "anchors" for existential gauges:
 * - Values (Alignment anchor)
 * - Directions (Direction anchor)  
 * - Key People (Connection anchor)
 * 
 * These provide SPECIFICITY to check-ins so users aren't just guessing.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

/** Connection frequency for key relationships */
export type ConnectionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'asNeeded';

/** Relationship type for key people */
export type RelationshipType = 'family' | 'friend' | 'partner' | 'mentor' | 'colleague' | 'other';

/** Direction/goal status */
export type DirectionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

/** Connection quality for logging */
export type ConnectionQuality = 'deep' | 'light' | 'missed';

/** A life direction the user is working toward */
export interface Direction {
  id: string;
  title: string;
  why?: string;
  status: DirectionStatus;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** A key person in the user's inner circle */
export interface KeyPerson {
  id: string;
  name: string;
  type: RelationshipType;
  emoji?: string;
  frequency: ConnectionFrequency;
  intention?: string; // "Call on Sundays"
  lastConnected?: string; // ISO date
  createdAt: string;
}

/** A logged connection with a key person */
export interface ConnectionLog {
  id: string;
  personId: string;
  date: string;
  quality: ConnectionQuality;
  note?: string;
  createdAt: string;
}

// ============================================================================
// SYSTEM GAUGE TYPES (Body, State, Emotion)
// ============================================================================

/** Body Baseline - personalization for Body gauge */
export interface BodyBaseline {
  idealSleepHours: number;
  preferredBedtime: string;
  preferredWakeTime: string;
  sleepChallenges: string[];
  mealsPerDay: number;
  hydrationGoal: number;
  dietaryNotes: string;
  exerciseTypes: string[];
  exerciseDaysPerWeek: number;
  movementBarriers: string[];
  healthNotes: string;
}

/** Regulation Map - personalization for State gauge */
export interface RegulationMap {
  defaultState: 'calm' | 'alert' | 'anxious' | 'variable';
  triggers: string[];
  topTriggers: string[];
  tools: string[];
  topTools: string[];
  earlyWarnings: string[];
  customTrigger: string;
  customTool: string;
}

/** Emotional Profile - personalization for Emotion gauge */
export interface EmotionalProfile {
  granularity: 'low' | 'medium' | 'high';
  frequentPositive: string[];
  frequentNegative: string[];
  difficultEmotions: string[];
  patterns: string[];
  needsWhenUpset: string[];
  expressionStyle: 'internal' | 'external' | 'selective';
}

// ============================================================================
// SUGGESTED VALUES (for Values Workshop)
// ============================================================================

export const SUGGESTED_VALUES = [
  'Family',
  'Growth',
  'Authenticity',
  'Health',
  'Freedom',
  'Security',
  'Adventure',
  'Creativity',
  'Knowledge',
  'Connection',
  'Achievement',
  'Service',
  'Peace',
  'Justice',
  'Faith',
  'Loyalty',
  'Independence',
  'Fun',
  'Integrity',
  'Wealth',
  'Love',
  'Compassion',
  'Balance',
  'Courage',
  'Gratitude',
  'Honesty',
  'Respect',
  'Kindness',
] as const;

// ============================================================================
// STORE STATE
// ============================================================================

interface FoundationState {
  // Values (Alignment anchor) - extends userStore.values
  valuesPriority: string[]; // Ordered by importance
  valuesSetAt: string | null;
  valuesLastReviewed: string | null;

  // Directions (Direction anchor)
  directions: Direction[];
  directionsLastReviewed: string | null;

  // Key People (Connection anchor)
  keyPeople: KeyPerson[];
  connectionLogs: ConnectionLog[];
  connectionLastReviewed: string | null;

  // System Gauges (Body, State, Emotion)
  bodyBaseline: BodyBaseline | null;
  regulationMap: RegulationMap | null;
  emotionalProfile: EmotionalProfile | null;

  // Actions - Values
  setValuesPriority: (ordered: string[]) => void;
  markValuesSet: () => void;
  markValuesReviewed: () => void;

  // Actions - Directions
  addDirection: (title: string, why?: string) => void;
  updateDirection: (id: string, updates: Partial<Omit<Direction, 'id' | 'createdAt'>>) => void;
  completeDirection: (id: string) => void;
  pauseDirection: (id: string) => void;
  resumeDirection: (id: string) => void;
  removeDirection: (id: string) => void;
  markDirectionsReviewed: () => void;

  // Actions - Key People
  addKeyPerson: (person: Omit<KeyPerson, 'id' | 'createdAt'>) => void;
  updateKeyPerson: (id: string, updates: Partial<Omit<KeyPerson, 'id' | 'createdAt'>>) => void;
  removeKeyPerson: (id: string) => void;
  logConnection: (personId: string, quality: ConnectionQuality, note?: string) => void;
  markConnectionReviewed: () => void;

  // Actions - System Gauges
  setBodyBaseline: (baseline: BodyBaseline) => void;
  setRegulationMap: (map: RegulationMap) => void;
  setEmotionalProfile: (profile: EmotionalProfile) => void;

  // Computed helpers
  getActiveDirections: () => Direction[];
  getOverduePeople: () => KeyPerson[];

  // Reset
  reset: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getFrequencyDays = (freq: ConnectionFrequency): number => {
  switch (freq) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'biweekly': return 14;
    case 'monthly': return 30;
    case 'quarterly': return 90;
    case 'asNeeded': return Infinity;
    default: return 30;
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  valuesPriority: [] as string[],
  valuesSetAt: null as string | null,
  valuesLastReviewed: null as string | null,
  directions: [] as Direction[],
  directionsLastReviewed: null as string | null,
  keyPeople: [] as KeyPerson[],
  connectionLogs: [] as ConnectionLog[],
  connectionLastReviewed: null as string | null,
  // System Gauges
  bodyBaseline: null as BodyBaseline | null,
  regulationMap: null as RegulationMap | null,
  emotionalProfile: null as EmotionalProfile | null,
};

// ============================================================================
// STORE
// ============================================================================

export const useFoundationStore = create<FoundationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== VALUES ==========

      setValuesPriority: (ordered) => set({ valuesPriority: ordered }),

      markValuesSet: () => set({ valuesSetAt: new Date().toISOString() }),

      markValuesReviewed: () => set({ valuesLastReviewed: new Date().toISOString() }),

      // ========== DIRECTIONS ==========

      addDirection: (title, why) =>
        set((state) => ({
          directions: [
            ...state.directions,
            {
              id: generateId(),
              title,
              why,
              status: 'active',
              progress: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateDirection: (id, updates) =>
        set((state) => ({
          directions: state.directions.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      completeDirection: (id) =>
        set((state) => ({
          directions: state.directions.map((d) =>
            d.id === id
              ? { ...d, status: 'completed', progress: 100, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : d
          ),
        })),

      pauseDirection: (id) =>
        set((state) => ({
          directions: state.directions.map((d) =>
            d.id === id ? { ...d, status: 'paused', updatedAt: new Date().toISOString() } : d
          ),
        })),

      resumeDirection: (id) =>
        set((state) => ({
          directions: state.directions.map((d) =>
            d.id === id ? { ...d, status: 'active', updatedAt: new Date().toISOString() } : d
          ),
        })),

      removeDirection: (id) =>
        set((state) => ({
          directions: state.directions.filter((d) => d.id !== id),
        })),

      markDirectionsReviewed: () => set({ directionsLastReviewed: new Date().toISOString() }),

      // ========== KEY PEOPLE ==========

      addKeyPerson: (person) =>
        set((state) => ({
          keyPeople: [
            ...state.keyPeople,
            {
              ...person,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateKeyPerson: (id, updates) =>
        set((state) => ({
          keyPeople: state.keyPeople.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removeKeyPerson: (id) =>
        set((state) => ({
          keyPeople: state.keyPeople.filter((p) => p.id !== id),
          // Also remove their connection logs
          connectionLogs: state.connectionLogs.filter((l) => l.personId !== id),
        })),

      logConnection: (personId, quality, note) =>
        set((state) => {
          const now = new Date().toISOString();
          return {
            connectionLogs: [
              ...state.connectionLogs,
              {
                id: generateId(),
                personId,
                date: now.slice(0, 10),
                quality,
                note,
                createdAt: now,
              },
            ],
            // Update lastConnected on the person
            keyPeople: state.keyPeople.map((p) =>
              p.id === personId ? { ...p, lastConnected: now } : p
            ),
          };
        }),

      markConnectionReviewed: () => set({ connectionLastReviewed: new Date().toISOString() }),

      // ========== SYSTEM GAUGES ==========

      setBodyBaseline: (baseline) => set({ bodyBaseline: baseline }),

      setRegulationMap: (map) => set({ regulationMap: map }),

      setEmotionalProfile: (profile) => set({ emotionalProfile: profile }),

      // ========== COMPUTED HELPERS ==========

      getActiveDirections: () => {
        return get().directions.filter((d) => d.status === 'active');
      },

      getOverduePeople: () => {
        const { keyPeople } = get();
        const now = Date.now();
        return keyPeople.filter((p) => {
          if (!p.lastConnected) return true; // Never connected = overdue
          const daysSince = (now - new Date(p.lastConnected).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince > getFrequencyDays(p.frequency);
        });
      },

      // ========== RESET ==========

      reset: () => set(initialState),
    }),
    {
      name: 'ingauge-foundation',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// HOOKS
// ============================================================================

/** Check if user has set up their values */
export const useHasValues = () => {
  const valuesSetAt = useFoundationStore((s) => s.valuesSetAt);
  return valuesSetAt !== null;
};

/** Check if user has set up their directions */
export const useHasDirections = () => {
  const directions = useFoundationStore((s) => s.directions);
  return directions.some((d) => d.status === 'active');
};

/** Check if user has set up their key people */
export const useHasKeyPeople = () => {
  const keyPeople = useFoundationStore((s) => s.keyPeople);
  return keyPeople.length > 0;
};

/** Get active directions for check-in */
export const useActiveDirections = () => {
  return useFoundationStore((s) => s.directions.filter((d) => d.status === 'active'));
};

/** Get key people for check-in */
export const useKeyPeople = () => {
  return useFoundationStore((s) => s.keyPeople);
};

/** Get overdue connections */
export const useOverduePeople = () => {
  const keyPeople = useFoundationStore((s) => s.keyPeople);
  const now = Date.now();
  return keyPeople.filter((p) => {
    if (!p.lastConnected) return true;
    const daysSince = (now - new Date(p.lastConnected).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > getFrequencyDays(p.frequency);
  });
};
