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

/** Closeness tier based on Dunbar's Number */
export type PersonTier = 'inner' | 'close' | 'friends' | 'community';

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
  /** Last time you contacted this person */
  lastContact?: Date;
  /** Closeness tier: inner (5), close (15), friends (50), community (150) */
  tier?: PersonTier;
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

// Helper to create dates in the past
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// 20 demo members with varied status, tier, and lastContact
const DEMO_MEMBERS: CircleMember[] = [
  // INNER CIRCLE (5) — closest people
  { id: 'demo-1', name: 'Mom', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(1) },
  { id: 'demo-2', name: 'Dad', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(3) },
  { id: 'demo-3', name: 'Partner', relationship: 'partner', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(0) },
  { id: 'demo-4', name: 'Sister', relationship: 'sibling', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(2) },
  { id: 'demo-5', name: 'Best Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(1) },
  
  // CLOSE FRIENDS (5) — good friends
  { id: 'demo-6', name: 'Sarah', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(5) },
  { id: 'demo-7', name: 'Mike', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(10) },
  { id: 'demo-8', name: 'Jake', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(8) },
  { id: 'demo-9', name: 'Lisa', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(4) },
  { id: 'demo-10', name: 'Grandma', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(20) },
  
  // FRIENDS (5) — regular friends  
  { id: 'demo-11', name: 'Tom', relationship: 'mentor', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(15) },
  { id: 'demo-12', name: 'Anna', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(25) },
  { id: 'demo-13', name: 'Chris', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(12) },
  { id: 'demo-14', name: 'Rachel', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(7) },
  { id: 'demo-15', name: 'Uncle Joe', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(45) },
  
  // COMMUNITY (5) — acquaintances (some fading/dormant)
  { id: 'demo-16', name: 'Mia', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(35) },
  { id: 'demo-17', name: 'David', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(60) },
  { id: 'demo-18', name: 'Aunt Sue', relationship: 'other', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(90) },
  { id: 'demo-19', name: 'Jordan', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(14) },
  { id: 'demo-20', name: 'Old Coworker', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(120) },
];

const DEMO_MEMBER_IDS = DEMO_MEMBERS.map(m => m.id);

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
        `Plan an activity you can do together with ${member.name}`,
        `Go for a walk or drive with ${member.name}, just to talk`,
        `Video call ${member.name} if you can't meet in person`,
      ],
      touch: [
        `Give ${member.name} a long hug when you see them`,
        `Sit close to ${member.name} — physical presence matters`,
        `Offer ${member.name} a shoulder massage or back rub`,
        `Hold ${member.name}'s hand or put your arm around them`,
        `Make plans to see ${member.name} in person`,
      ],
    };
    
    const options = NUDGES[member.loveLanguage] || [];
    if (!options.length) return null;
    
    // Rotate based on day + member name hash for variety
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const nameHash = member.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return options[(dayOfYear + nameHash) % options.length];
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
