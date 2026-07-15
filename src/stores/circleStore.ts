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

// Use 'unknown' for people with no status shared (cast to any Temperature for demo)
type DemoTemp = Temperature | 'unknown';
const noStatus = undefined as unknown as Temperature;

// Full Dunbar demo: 5 inner + 15 close + 30 friends + 25 community = 75 people
const DEMO_MEMBERS: CircleMember[] = [
  /* Archived prototype fixtures. Deliberately excluded from runtime state.
  // ═══════════════════════════════════════════════════════════════
  // INNER CIRCLE (5) — Your closest people
  // ═══════════════════════════════════════════════════════════════
  { id: 'i1', name: 'Mom', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(1) },
  { id: 'i2', name: 'Partner', relationship: 'partner', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(0) },
  { id: 'i3', name: 'Sister', relationship: 'sibling', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(2) },
  { id: 'i4', name: 'Best Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(1) },
  { id: 'i5', name: 'Dad', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'inner', lastContact: daysAgo(5) },

  // ═══════════════════════════════════════════════════════════════
  // CLOSE FRIENDS (15) — Good friends you see regularly
  // ═══════════════════════════════════════════════════════════════
  { id: 'c1', name: 'Sarah', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(3) },
  { id: 'c2', name: 'Mike', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(5) },
  { id: 'c3', name: 'Jake', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(8) },
  { id: 'c4', name: 'Emma', relationship: 'sibling', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(4) },
  { id: 'c5', name: 'Grandma', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(14) },
  { id: 'c6', name: 'Lisa', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(2) },
  { id: 'c7', name: 'Grandpa', relationship: 'parent', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(14) },
  { id: 'c8', name: 'Alex', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(6) },
  // Some with NO status (unknown) — they don't share
  { id: 'c9', name: 'Jordan', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(10) },
  { id: 'c10', name: 'Taylor', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(20) },
  { id: 'c11', name: 'Chris', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(7) },
  { id: 'c12', name: 'Aunt Maria', relationship: 'other', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(21) },
  { id: 'c13', name: 'Rachel', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(1) },
  { id: 'c14', name: 'Mentor Tom', relationship: 'mentor', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(30) },
  { id: 'c15', name: 'Cousin Jess', relationship: 'sibling', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'close', lastContact: daysAgo(12) },

  // ═══════════════════════════════════════════════════════════════
  // FRIENDS (30) — Regular friends, varied contact
  // ═══════════════════════════════════════════════════════════════
  { id: 'f1', name: 'Anna', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(10) },
  { id: 'f2', name: 'Ben', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(15) },
  { id: 'f3', name: 'Chloe', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(18) },
  { id: 'f4', name: 'Daniel', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(7) },
  { id: 'f5', name: 'Eva', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(5) },
  { id: 'f6', name: 'Frank', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(25) },
  { id: 'f7', name: 'Grace', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(12) },
  { id: 'f8', name: 'Henry', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(35) },
  { id: 'f9', name: 'Ivy', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(20) },
  { id: 'f10', name: 'Jack', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(8) },
  { id: 'f11', name: 'Kate', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(14) },
  { id: 'f12', name: 'Liam', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(45) },
  { id: 'f13', name: 'Mia', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(3) },
  { id: 'f14', name: 'Noah', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(22) },
  { id: 'f15', name: 'Olivia', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(16) },
  { id: 'f16', name: 'Uncle Joe', relationship: 'other', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(28) },
  { id: 'f17', name: 'Quinn', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(40) },
  { id: 'f18', name: 'Ryan', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(6) },
  { id: 'f19', name: 'Sophie', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(11) },
  { id: 'f20', name: 'Tyler', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(19) },
  { id: 'f21', name: 'Uma', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(55) },
  { id: 'f22', name: 'Victor', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(13) },
  { id: 'f23', name: 'Wendy', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(9) },
  { id: 'f24', name: 'Xavier', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(17) },
  { id: 'f25', name: 'Yara', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(4) },
  { id: 'f26', name: 'Zach', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(60) },
  { id: 'f27', name: 'Abby', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(23) },
  { id: 'f28', name: 'Blake', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(26) },
  { id: 'f29', name: 'Cara', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(15) },
  { id: 'f30', name: 'Drew', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'friends', lastContact: daysAgo(21) },

  // ═══════════════════════════════════════════════════════════════
  // COMMUNITY (25) — Acquaintances, many dormant/fading
  // ═══════════════════════════════════════════════════════════════
  { id: 'a1', name: 'Old Coworker', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(90) },
  { id: 'a2', name: 'College Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(120) },
  { id: 'a3', name: 'Neighbor Dan', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(45) },
  { id: 'a4', name: 'Gym Buddy', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(30) },
  { id: 'a5', name: 'Book Club Jen', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(35) },
  { id: 'a6', name: 'Ex-Boss', relationship: 'mentor', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(180) },
  { id: 'a7', name: 'High School BFF', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(60) },
  { id: 'a8', name: 'Aunt Sue', relationship: 'other', contactMethod: '', sharingLevel: 'full', temperature: 'orange', temperatureLabel: TEMPERATURE_LABELS.orange, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(75) },
  { id: 'a9', name: 'Yoga Teacher', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(14) },
  { id: 'a10', name: 'Church Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(21) },
  { id: 'a11', name: 'Therapist', relationship: 'mentor', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(7) },
  { id: 'a12', name: 'Hair Stylist', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(28) },
  { id: 'a13', name: 'Online Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'red', temperatureLabel: TEMPERATURE_LABELS.red, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(10) },
  { id: 'a14', name: 'Cousin Tim', relationship: 'sibling', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(100) },
  { id: 'a15', name: 'Old Roommate', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(200) },
  { id: 'a16', name: 'Doc Smith', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(60) },
  { id: 'a17', name: 'Landlord', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(45) },
  { id: 'a18', name: 'Coffee Shop Sam', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(3) },
  { id: 'a19', name: 'Dog Park Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'limited', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(5) },
  { id: 'a20', name: 'Ex Partner', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(365) },
  { id: 'a21', name: 'Band Mate', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'green', temperatureLabel: TEMPERATURE_LABELS.green, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(40) },
  { id: 'a22', name: 'Dentist', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(180) },
  { id: 'a23', name: 'Childhood Friend', relationship: 'friend', contactMethod: '', sharingLevel: 'full', temperature: 'yellow', temperatureLabel: TEMPERATURE_LABELS.yellow, lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(90) },
  { id: 'a24', name: 'Conference Contact', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(150) },
  { id: 'a25', name: 'Twitter Mutual', relationship: 'other', contactMethod: '', sharingLevel: 'limited', temperature: 'green', temperatureLabel: '', lastUpdated: new Date(), addedAt: new Date(), tier: 'community', lastContact: daysAgo(30) },
  */
];

const DEMO_MEMBER_IDS = DEMO_MEMBERS.map(m => m.id);

/** Who can see my temperature. Default inner_circle to avoid awkwardness. */
export type TemperatureVisibility = 'inner_circle' | 'close_friends' | 'private';

interface CircleState {
  members: CircleMember[];
  myTemperature: Temperature;
  myTemperatureLabel: string;
  myTemperatureNote: string;
  myTemperatureUpdatedAt: Date | null;
  /** Who can see my temperature (shared awareness, not monitoring). */
  temperatureVisibility: TemperatureVisibility;
  moodHistory: MoodEntry[];
  nudges: Nudge[];
  setTemperatureVisibility: (v: TemperatureVisibility) => void;
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
  members: [],
  myTemperature: 'green',
  myTemperatureLabel: TEMPERATURE_LABELS.green,
  myTemperatureNote: '',
  myTemperatureUpdatedAt: null,
  temperatureVisibility: 'private',
  setTemperatureVisibility: (v) => set({ temperatureVisibility: v }),
  moodHistory: [],
  nudges: [],

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
        `Hold ${member.name}"s hand or put your arm around them`,
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
    // Local UI only. Server persistence + React Query invalidation must go through
    // useCreateCheckin / createCheckinOnServer so Cockpit reopen stays consistent.
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
