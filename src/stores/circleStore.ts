import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { useSettingsStore } from './settingsStore';
import * as database from '../services/database';
import { sendLocalNudge } from '../services/notifications';

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
  reset: () => void;
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

  addMember: (member) => {
    const userId = useAuthStore.getState().userId;
    const now = new Date();
    const newMember = {
      ...member,
      id: genId(),
      temperature: 'green' as Temperature,
      temperatureLabel: TEMPERATURE_LABELS.green,
      lastUpdated: now,
      addedAt: now,
    };
    set((state) => ({ members: [...state.members, newMember] }));
    if (userId) {
      database
        .addCircleMember(userId, {
          member_name: member.name,
          relationship: member.relationship,
          contact_method: member.contactMethod,
          sharing_level: member.sharingLevel,
        })
        .then((res) => {
          if ('id' in res) {
            set((state) => ({
              members: state.members.map((m) => (m.id === newMember.id ? { ...m, id: res.id } : m)),
            }));
          }
        })
        .catch(() => {});
    }
  },

  removeMember: (id) => {
    useAuthStore.getState().userId && database.removeCircleMember(id).catch(() => {});
    set((state) => ({ members: state.members.filter((m) => m.id !== id) }));
  },

  updateMemberTemperature: (id, temperature) => {
    set((state) => {
      const member = state.members.find((m) => m.id === id);
      const next = state.members.map((m) =>
        m.id === id
          ? {
              ...m,
              temperature,
              temperatureLabel: TEMPERATURE_LABELS[temperature],
              lastUpdated: new Date(),
            }
          : m
      );
      if (
        member &&
        (temperature === 'orange' || temperature === 'red') &&
        useSettingsStore.getState().notificationsCircleNudges
      ) {
        sendLocalNudge(member.name, `${member.name} could use a check-in.`).catch(() => {});
      }
      return { members: next };
    });
  },

  updateMyTemperature: (temp, note) =>
    set({
      myTemperature: temp,
      myTemperatureLabel: TEMPERATURE_LABELS[temp],
      myTemperatureNote: note ?? '',
      myTemperatureUpdatedAt: new Date(),
    }),

  addMoodCheckin: (mood, note) => {
    const userId = useAuthStore.getState().userId;
    const label = TEMPERATURE_LABELS[mood];
    const entry = {
      id: genId(),
      mood,
      label,
      note,
      timestamp: new Date(),
    };
    set((state) => ({
      moodHistory: [entry, ...state.moodHistory],
      myTemperature: mood,
      myTemperatureLabel: label,
      myTemperatureNote: note ?? '',
      myTemperatureUpdatedAt: new Date(),
    }));
    if (userId) {
      database.addMoodCheckin(userId, mood, label, note).catch(() => {});
    }
  },

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
  reset: () =>
    set({
      members: [],
      nudges: [],
      moodHistory: [],
      myTemperature: 'green',
      myTemperatureLabel: TEMPERATURE_LABELS.green,
      myTemperatureNote: '',
      myTemperatureUpdatedAt: null,
    }),
}));
