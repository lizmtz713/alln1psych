/**
 * Gauge Definitions — per-gauge personalization for the Human Control Panel.
 * Defines what each gauge means FOR YOU: priorities, context, triggers, tools, goals.
 */

import { create } from 'zustand';

export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export interface BodyDefinition {
  priorities: string[];
  context: string;
  currentGoal: string;
  goals: string[];
  checkInFrequency: 'daily' | 'every-other-day' | 'weekly' | 'when-i-bring-up';
  morningReminder: boolean;
  eveningReminder: boolean;
  customReminder: string;
  whatHelps: string[];
}

export interface StateDefinition {
  baselineNote: string;
  typicalScore: number | null;
  triggers: string[];
  regulationTools: string[];
  remindWhenBelow: number | null;
  morningPrompt: boolean;
  eveningPrompt: boolean;
  whatHelps: string[];
}

export interface EmotionDefinition {
  style: string;
  emotionsStruggle: string[];
  context: string;
  currentGoal: string;
}

export interface ConnectionDefinition {
  needs: string[];
  myPeople: string;
  struggles: string[];
  goal: string;
  weeklyReminder: boolean;
  whatHelps: string[];
}

export interface DirectionDefinition {
  bigPicture: string;
  thisSeason: string;
  goals: string[];
  blocks: string[];
  weeklyCheckin: boolean;
  monthlyReflection: boolean;
  whatHelps: string[];
}

export interface AlignmentDefinition {
  coreValuesSelected: string[];
  topValues: string[];
  gapText: string;
  intentions: string[];
  weeklyCheckin: boolean;
  remindWhenBelow: number | null;
  whatHelps: string[];
}

interface GaugeDefinitionsState {
  body: BodyDefinition;
  state: StateDefinition;
  emotion: EmotionDefinition;
  connection: ConnectionDefinition;
  direction: DirectionDefinition;
  alignment: AlignmentDefinition;
  setBody: (v: Partial<BodyDefinition>) => void;
  setState: (v: Partial<StateDefinition>) => void;
  setEmotion: (v: Partial<EmotionDefinition>) => void;
  setConnection: (v: Partial<ConnectionDefinition>) => void;
  setDirection: (v: Partial<DirectionDefinition>) => void;
  setAlignment: (v: Partial<AlignmentDefinition>) => void;
}

const defaultBody: BodyDefinition = {
  priorities: [],
  context: '',
  currentGoal: '',
  goals: [],
  checkInFrequency: 'daily',
  morningReminder: false,
  eveningReminder: false,
  customReminder: '',
  whatHelps: [],
};

const defaultState: StateDefinition = {
  baselineNote: '',
  typicalScore: null,
  triggers: [],
  regulationTools: [],
  remindWhenBelow: null,
  morningPrompt: false,
  eveningPrompt: false,
  whatHelps: [],
};

const defaultEmotion: EmotionDefinition = {
  style: '',
  emotionsStruggle: [],
  context: '',
  currentGoal: '',
};

const defaultConnection: ConnectionDefinition = {
  needs: [],
  myPeople: '',
  struggles: [],
  goal: '',
  weeklyReminder: false,
  whatHelps: [],
};

const defaultDirection: DirectionDefinition = {
  bigPicture: '',
  thisSeason: '',
  goals: [],
  blocks: [],
  weeklyCheckin: false,
  monthlyReflection: false,
  whatHelps: [],
};

const defaultAlignment: AlignmentDefinition = {
  coreValuesSelected: [],
  topValues: [],
  gapText: '',
  intentions: [],
  weeklyCheckin: false,
  remindWhenBelow: null,
  whatHelps: [],
};

export const useGaugeDefinitionsStore = create<GaugeDefinitionsState>((set) => ({
  body: { ...defaultBody },
  state: { ...defaultState },
  emotion: { ...defaultEmotion },
  connection: { ...defaultConnection },
  direction: { ...defaultDirection },
  alignment: { ...defaultAlignment },
  setBody: (v) => set((s) => ({ body: { ...s.body, ...v } })),
  setState: (v) => set((s) => ({ state: { ...s.state, ...v } })),
  setEmotion: (v) => set((s) => ({ emotion: { ...s.emotion, ...v } })),
  setConnection: (v) => set((s) => ({ connection: { ...s.connection, ...v } })),
  setDirection: (v) => set((s) => ({ direction: { ...s.direction, ...v } })),
  setAlignment: (v) => set((s) => ({ alignment: { ...s.alignment, ...v } })),
}));
