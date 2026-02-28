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

export type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch' | null;

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
  /** ISO date string "1999-03-15" — unlocks relationship insights */
  birthday?: string;
  /** Their love language — enables personalized nudges */
  loveLanguage?: LoveLanguage;
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

const DEMO_MEMBER_IDS = ['demo-mom', 'demo-sarah', 'demo-dad'];

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
  updateMemberBirthday: (id: string, birthday: string | undefined) => void;
  updateMemberLoveLanguage: (id: string, lang: LoveLanguage) => void;
  getLoveLanguageNudge: (member: CircleMember) => string | null;
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
    // Clear demo data when adding first real member
    set((state) => {
      const isDemoOnly = state.members.every(m => DEMO_MEMBER_IDS.includes(m.id));
      const newMembers = isDemoOnly ? [newMember] : [...state.members, newMember];
      return { members: newMembers };
    });
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

  updateMemberBirthday: (id, birthday) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, birthday: birthday || undefined, lastUpdated: new Date() } : m
      ),
    }));
  },

  updateMemberLoveLanguage: (id, lang) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, loveLanguage: lang, lastUpdated: new Date() } : m
      ),
    }));
  },

  getLoveLanguageNudge: (member) => {
    if (!member.loveLanguage) return null;
    
    const NUDGES: Record<string, string[]> = {
      words: [
        `Send ${member.name} a text telling them why you appreciate them`,
        `Write ${member.name} a note about what makes them special`,
        `Tell ${member.name} specifically what you admire about them`,
        `Compliment ${member.name} on something they did recently`,
        `Send ${member.name} an encouraging voice message`,
      ],
      acts: [
        `Do something helpful for ${member.name} without being asked`,
        `Offer to run an errand or handle a task for ${member.name}`,
        `Cook or order food for ${member.name}`,
        `Help ${member.name} with something on their to-do list`,
        `Take care of something ${member.name} has been putting off`,
      ],
      gifts: [
        `Get ${member.name} their favorite snack or drink`,
        `Find a small gift that reminded you of ${member.name}`,
        `Send ${member.name} flowers or a surprise delivery`,
        `Pick up something ${member.name} mentioned wanting`,
        `Create or make something personal for ${member.name}`,
      ],
      time: [
        `Schedule uninterrupted time with ${member.name}`,
        `Put your phone away and be fully present with ${member.name}`,
