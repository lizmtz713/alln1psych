import { create } from 'zustand';

export type Temperature = 'green' | 'yellow' | 'orange' | 'red';

export const TEMPERATURE_LABELS: Record<Temperature, string> = {
  green: 'Doing well',
  yellow: 'Could use some love',
  orange: 'Having a hard time',
  red: 'Really struggling',
};

export type RelationshipType =
  | 'parent'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'partner'
  | 'mentor'
  | 'other';

export interface CircleMember {
  id: string;
  name: string;
  relationship: RelationshipType;
  contactMethod: string;
  sharingLevel: 'full' | 'limited';
  temperature: Temperature;
  temperatureLabel: string;
  lastUpdated: Date;
  addedAt: Date;
}

export interface MoodEntry {
  id: string;
  mood: Temperature;
  label: string;
  note?: string;
  timestamp: Date;
}

export interface Nudge {
  id: string;
  memberName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actedOn: boolean;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEMO_MEMBERS: CircleMember[] = [
  {
    id: 'demo-mom',
    name: 'Mom',
    relationship: 'parent',
    contactMethod: '',
    sharingLevel: 'full',
    temperature: 'green',
    temperatureLabel: TEMPERATURE_LABELS.green,
    lastUpdated: new Date(),
    addedAt: new Date(),
  },
  {
    id: 'demo-sarah',
    name: 'Sarah',
    relationship: 'friend',
    contactMethod: '',
    sharingLevel: 'full',
    temperature: 'yellow',
    temperatureLabel: TEMPERATURE_LABELS.yellow,
    lastUpdated: new Date(),
    addedAt: new Date(),
  },
  {
    id: 'demo-dad',
    name: 'Dad',
    relationship: 'parent',
    contactMethod: '',
    sharingLevel: 'full',
    temperature: 'orange',
    temperatureLabel: TEMPERATURE_LABELS.orange,
    lastUpdated: new Date(),
    addedAt: new Date(),
  },
];

interface CircleState {
  members: CircleMember[];
  myTemperature: Temperature;
  myTemperatureLabel: string;
  myTemperatureNote: string;
  myTemperatureUpdatedAt: Date | null;
  moodHistory: MoodEntry[];
  nudges: Nudge[];
  addMember: (
    member: Omit<
      CircleMember,
      'id' | 'temperature' | 'temperatureLabel' | 'lastUpdated' | 'addedAt'
    >
  ) => void;
  removeMember: (id: string) => void;
  updateMemberTemperature: (id: string, temp: Temperature) => void;
  updateMyTemperature: (temp: Temperature, note?: string) => void;
  addMoodCheckin: (mood: Temperature, note?: string) => void;
  addNudge: (memberName: string, message: string) => void;
  markNudgeRead: (id: string) => void;
  markNudgeActedOn: (id: string) => void;
  clearDemoData: () => void;
}

export const useCircleStore = create<CircleState>((set) => ({
  members: DEMO_MEMBERS,
  myTemperature: 'green',
  myTemperatureLabel: TEMPERATURE_LABELS.green,
  myTemperatureNote: '',
  myTemperatureUpdatedAt: null,
  moodHistory: [],
  nudges: [
    {
      id: 'nudge-dad',
      memberName: 'Dad',
      message: 'Dad could use a check-in',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      actedOn: false,
    },
  ],

  addMember: (member) =>
    set((state) => ({
      members: [
        ...state.members,
        {
          ...member,
          id: genId(),
          temperature: 'green',
          temperatureLabel: TEMPERATURE_LABELS.green,
          lastUpdated: new Date(),
          addedAt: new Date(),
        },
      ],
    })),

  removeMember: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),

  updateMemberTemperature: (id, temperature) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id
          ? {
              ...m,
              temperature,
              temperatureLabel: TEMPERATURE_LABELS[temperature],
              lastUpdated: new Date(),
            }
          : m
      ),
    })),

  updateMyTemperature: (temp, note) =>
    set({
      myTemperature: temp,
      myTemperatureLabel: TEMPERATURE_LABELS[temp],
      myTemperatureNote: note ?? '',
      myTemperatureUpdatedAt: new Date(),
    }),

  addMoodCheckin: (mood, note) =>
    set((state) => ({
      moodHistory: [
        {
          id: genId(),
          mood,
          label: TEMPERATURE_LABELS[mood],
          note,
          timestamp: new Date(),
        },
        ...state.moodHistory,
      ],
      myTemperature: mood,
      myTemperatureLabel: TEMPERATURE_LABELS[mood],
      myTemperatureNote: note ?? '',
      myTemperatureUpdatedAt: new Date(),
    })),

  addNudge: (memberName, message) =>
    set((state) => ({
      nudges: [
        { id: genId(), memberName, message, timestamp: new Date(), read: false, actedOn: false },
        ...state.nudges,
      ],
    })),

  markNudgeRead: (id) =>
    set((state) => ({
      nudges: state.nudges.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markNudgeActedOn: (id) =>
    set((state) => ({
      nudges: state.nudges.map((n) => (n.id === id ? { ...n, actedOn: true, read: true } : n)),
    })),

  clearDemoData: () =>
    set({
      members: [],
      nudges: [],
      myTemperature: 'green',
      myTemperatureLabel: TEMPERATURE_LABELS.green,
      myTemperatureNote: '',
      myTemperatureUpdatedAt: null,
    }),
}));
