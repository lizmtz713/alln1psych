import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { useCircleStore, type CircleMember, type Temperature } from './circleStore';
import type {
  Light,
  LightTier,
  LightTemperature,
  ConnectionEntry,
  SharedTemperature,
} from '../types/lights';
import {
  FLICKER_DAYS,
  TIER_BRIGHTNESS,
  LIGHT_TEMPERATURE_SCALE,
} from '../types/lights';
import { trackConnectionLog } from '../hooks/useWrappedTracking';

// Map circle temperature (green/yellow/orange/red) to Lights temperature (warm/neutral/cool)
function circleTempToLightTemp(t: Temperature): LightTemperature {
  if (t === 'green') return 'warm';
  if (t === 'yellow') return 'neutral';
  return 'cool'; // orange, red
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface LightExtras {
  howWeMet?: string;
  whatTheyNeed?: string;
  bestWayToConnect?: string;
  notes?: string;
  relationshipType?: string;
  contactId?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUri?: string;
  // CRM
  loveLanguageNotes?: string;
  howTheyOperate?: string;
  howTheyShowLove?: string;
  relateInsights?: string[];
  anniversary?: string;
  giftIdeas?: string[];
  pastGifts?: string[];
  favoritesSizes?: string;
  family?: string;
  interests?: string;
  values?: string;
  driveTimeMinutes?: number;
}

interface LightsPersist {
  tierByMemberId: Record<string, LightTier>;
  connectionLogByMemberId: Record<string, ConnectionEntry[]>;
  lastContactByMemberId: Record<string, string>;
  lightExtrasByMemberId: Record<string, LightExtras>;
}

const defaultTier: LightTier = 'five';

function computeDaysSinceContact(lastContactIso: string | undefined): number {
  if (!lastContactIso) return 999;
  const d = new Date(lastContactIso);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function computeStatus(tier: LightTier, daysSinceContact: number): 'healthy' | 'flickering' | 'dark' {
  if (tier === 'archived') return 'dark';
  const threshold = FLICKER_DAYS[tier];
  if (daysSinceContact <= threshold) return 'healthy';
  return 'flickering';
}

/** Pure: build Light[] from circle members + lights persisted state */
export function computeLights(
  members: CircleMember[],
  state: LightsPersist
): Light[] {
  const userId = useAuthStore.getState().userId ?? '';
  const now = new Date();

  return members.map((m) => {
    const tier = state.tierByMemberId[m.id] ?? defaultTier;
    const rawLog = state.connectionLogByMemberId[m.id] ?? [];
    const log = rawLog.map((e) => ({
      ...e,
      date: e.date instanceof Date ? e.date : new Date(e.date as string),
    }));
    const lastContactIso = state.lastContactByMemberId[m.id];
    const lastContactDate = lastContactIso ? new Date(lastContactIso) : undefined;
    const extras = state.lightExtrasByMemberId[m.id] ?? {};

    const daysSinceContact = computeDaysSinceContact(lastContactIso);
    const status = computeStatus(tier, daysSinceContact);
    const brightness = TIER_BRIGHTNESS[tier];
    const temperature = m.temperature
      ? circleTempToLightTemp(m.temperature)
      : 'unknown';
    const temperatureLabel =
      temperature === 'unknown'
        ? 'Unknown'
        : LIGHT_TEMPERATURE_SCALE[temperature].label;

    const sharedTemperature: SharedTemperature | undefined = m.temperature
      ? {
          value: m.temperature === 'green' ? 80 : m.temperature === 'yellow' ? 50 : 25,
          label: circleTempToLightTemp(m.temperature),
          sharedAt: m.lastUpdated,
        }
      : undefined;

    return {
      id: m.id,
      userId,
      name: m.name,
      photo: undefined,
      tier,
      contactId: extras.contactId,
      phone: extras.phone,
      email: extras.email,
      address: extras.address,
      photoUri: extras.photoUri,
      photoUrl: undefined,
      relationshipType: extras.relationshipType ?? m.relationship,
      howWeMet: extras.howWeMet,
      metDate: undefined,
      birthday: m.birthday,
      loveLanguage: m.loveLanguage ?? undefined,
      loveLanguageNotes: extras.loveLanguageNotes,
      whatTheyNeed: extras.whatTheyNeed,
      bestWayToConnect: extras.bestWayToConnect,
      howTheyOperate: extras.howTheyOperate,
      howTheyShowLove: extras.howTheyShowLove,
      notes: extras.notes,
      relateInsights: extras.relateInsights,
      anniversary: extras.anniversary,
      giftIdeas: extras.giftIdeas,
      pastGifts: extras.pastGifts,
      favoritesSizes: extras.favoritesSizes,
      family: extras.family,
      interests: extras.interests,
      values: extras.values,
      driveTimeMinutes: extras.driveTimeMinutes,
      linkedUserId: undefined,
      canSeeTemperature: true,
      sharedTemperature,
      lastContactDate,
      connectionLog: log,
      averageContactDays: undefined, // could compute from log
      brightness,
      temperature,
      temperatureLabel,
      status,
      daysSinceContact,
      createdAt: m.addedAt,
      updatedAt: m.lastUpdated,
    } satisfies Light;
  });
}

interface LightsState extends LightsPersist {
  setTier: (memberId: string, tier: LightTier) => void;
  setLastContact: (memberId: string, dateIso: string) => void;
  /** Update lastContact to now (e.g. after sending Mind Mail to this person). */
  recordConnection: (memberId: string) => void;
  addConnectionEntry: (memberId: string, entry: Omit<ConnectionEntry, 'id'>) => void;
  logContact: (memberId: string, opts?: { type?: ConnectionEntry['type']; quality?: ConnectionEntry['quality']; note?: string }) => void;
  updateLightExtras: (memberId: string, extras: Partial<LightExtras>) => void;
  addLight: (
    member: Omit<CircleMember, 'id' | 'temperature' | 'temperatureLabel' | 'lastUpdated' | 'addedAt' | 'tier'> & {
      tier?: LightTier;
      howWeMet?: string;
      whatTheyNeed?: string;
      bestWayToConnect?: string;
      notes?: string;
      contactId?: string;
      phone?: string;
      email?: string;
      address?: string;
      photoUri?: string;
    }
  ) => void;
  removeLight: (id: string) => void;
  getLights: (members: CircleMember[]) => Light[];
}

const initial: LightsPersist = {
  tierByMemberId: {},
  connectionLogByMemberId: {},
  lastContactByMemberId: {},
  lightExtrasByMemberId: {},
};

export const useLightsStore = create<LightsState>()(
  persist(
    (set, get) => ({
      ...initial,

      setTier: (memberId, tier) =>
        set((s) => ({
          tierByMemberId: { ...s.tierByMemberId, [memberId]: tier },
        })),

      setLastContact: (memberId, dateIso) =>
        set((s) => ({
          lastContactByMemberId: { ...s.lastContactByMemberId, [memberId]: dateIso },
        })),

      recordConnection: (memberId) => {
        const dateIso = new Date().toISOString().slice(0, 10);
        set((s) => ({
          lastContactByMemberId: { ...s.lastContactByMemberId, [memberId]: dateIso },
        }));
      },

      addConnectionEntry: (memberId, entry) => {
        const id = genId();
        const full: ConnectionEntry = { ...entry, id, date: entry.date };
        set((s) => ({
          connectionLogByMemberId: {
            ...s.connectionLogByMemberId,
            [memberId]: [full, ...(s.connectionLogByMemberId[memberId] ?? [])],
          },
          lastContactByMemberId: {
            ...s.lastContactByMemberId,
            [memberId]: entry.date.toISOString().slice(0, 10),
          },
        }));
      },

      logContact: (memberId, opts = {}) => {
        get().addConnectionEntry(memberId, {
          date: new Date(),
          type: opts.type ?? 'text',
          quality: opts.quality ?? 'brief',
          note: opts.note,
        });
        trackConnectionLog();
      },

      updateLightExtras: (memberId, extras) =>
        set((s) => ({
          lightExtrasByMemberId: {
            ...s.lightExtrasByMemberId,
            [memberId]: { ...(s.lightExtrasByMemberId[memberId] ?? {}), ...extras },
          },
        })),

      addLight: (member) => {
        const { addMember } = useCircleStore.getState();
        const tier = member.tier ?? 'five';
        addMember({
          name: member.name,
          relationship: member.relationship,
          contactMethod: member.contactMethod ?? '',
          sharingLevel: member.sharingLevel ?? 'full',
          birthday: member.birthday,
          loveLanguage: member.loveLanguage ?? null,
        });
        // Tier will be set when the new member gets an id; we need to set it after addMember resolves.
        // circleStore addMember is async (DB). We set tier by id after. So we need to get the new id.
        // For now set tier when we have the id - we could do it in a setTimeout or the caller could call setTier after add. Actually addMember in circleStore sets state synchronously with a temp id (genId()), so the new member is in state immediately. We don't have access to that id here. So: either circleStore.addMember returns the new id, or we set tier by name (fragile). Better: have addLight call addMember and then find the member by name (last one added) and set tier. Fragile if two same names. Best: extend addMember to accept optional tier and have circleStore pass it to a callback or have lightsStore set tier by scanning for the newest member without tier. I'll do: after addMember(), get members from circleStore, find the one that doesn't have a tier in our store yet (or the one that was just added - we can use the fact that the new member is first in the list if we add to front). Actually addMember prepends when replacing demo, or appends. So the newly added member might be at index 0 or at the end. Let me just set tier in the UI flow: Add Light screen calls addMember then router.back(); the hub will show the new member with default tier 'five'. User can change tier in profile. So we don't set tier in addLight for the new member - we default to five in computeLights. If we want to support "add to Your 15" we need the new id. So we need addMember to return the new member id. Checking circleStore addMember... it doesn't return. So for "Add to Your 5" we have two options: (1) addMember returns id in a callback or promise - we'd need to change circleStore. (2) When adding from Lights add screen we pass tier; after addMember we do setTier with a delay by finding the latest member. I'll get the latest member id: useCircleStore.getState().members[0] (if we prepend) or members[members.length-1]. Circle store prepends when replacing demo, else appends. So new member is at index 0 when we had demo and replaced, or at end when we had existing. So we can't reliably get "the one just added". I'll add a small optional return from addMember: we could patch circleStore to return the new id. Let me check addMember again - it creates newMember with id: genId(), then set state, then async database.addCircleMember and then set state again to replace temp id with res.id. So the id is sync (temp) or async (real). So right after addMember() call, state.members has the new member with a temp id. So we can do: const members = useCircleStore.getState().members; const newOne = members.find(m => !get().tierByMemberId[m.id]); that could be any without tier. So the newly added is the one that was just pushed. Actually the order is: newMember is created with genId(), then set(state => ... newMembers = isDemoOnly ? [newMember] : [...state.members, newMember]. So new member is last in the list (when not replacing demo). So we can take members[members.length - 1].id and setTier(id, tier). Let me do that in addLight: after addMember(), get members, take the last one's id, setTier(id, tier). Also set lightExtras if provided.
        setTimeout(() => {
          const members = useCircleStore.getState().members;
          const last = members[members.length - 1];
          if (last && last.name === member.name) {
            get().setTier(last.id, tier);
            if (
              member.howWeMet ||
              member.whatTheyNeed ||
              member.bestWayToConnect ||
              member.notes ||
              member.contactId ||
              member.phone ||
              member.email ||
              member.address ||
              member.photoUri
            ) {
              get().updateLightExtras(last.id, {
                howWeMet: member.howWeMet,
                whatTheyNeed: member.whatTheyNeed,
                bestWayToConnect: member.bestWayToConnect,
                notes: member.notes,
                relationshipType: member.relationship,
                contactId: member.contactId,
                phone: member.phone,
                email: member.email,
                address: member.address,
                photoUri: member.photoUri,
              });
            }
          }
        }, 0);
      },

      removeLight: (id) => {
        useCircleStore.getState().removeMember(id);
        set((s) => {
          const { [id]: _, ...tierByMemberId } = s.tierByMemberId;
          const { [id]: __, ...connectionLogByMemberId } = s.connectionLogByMemberId;
          const { [id]: ___, ...lastContactByMemberId } = s.lastContactByMemberId;
          const { [id]: ____, ...lightExtrasByMemberId } = s.lightExtrasByMemberId;
          return {
            tierByMemberId,
            connectionLogByMemberId,
            lastContactByMemberId,
            lightExtrasByMemberId,
          };
        });
      },

      getLights: (members) => computeLights(members, get()),
    }),
    {
      name: 'alln1-lights',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tierByMemberId: s.tierByMemberId,
        connectionLogByMemberId: s.connectionLogByMemberId,
        lastContactByMemberId: s.lastContactByMemberId,
        lightExtrasByMemberId: s.lightExtrasByMemberId,
      }),
    }
  )
);

