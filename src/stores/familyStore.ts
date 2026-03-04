import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { useCircleStore } from './circleStore';
import { useLightsStore } from './lightsStore';
import type {
  FamilyGroup,
  FamilySettings,
  CareLogEntry,
  FamilyEvent,
  FamilyInsight,
  CareAction,
} from '../types/family';
import type { Light } from '../types/lights';
import { DEFAULT_FAMILY_SETTINGS } from '../types/family';

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface FamilyState {
  families: FamilyGroup[];
  careLog: CareLogEntry[];
  events: FamilyEvent[];

  createFamily: (name: string, memberIds: string[], emoji?: string) => FamilyGroup;
  updateFamily: (id: string, updates: Partial<FamilyGroup>) => void;
  deleteFamily: (id: string) => void;

  addMemberToFamily: (familyId: string, lightId: string) => void;
  removeMemberFromFamily: (familyId: string, lightId: string) => void;

  logCareAction: (entry: Omit<CareLogEntry, 'id' | 'date'>) => void;

  addEvent: (event: Omit<FamilyEvent, 'id'>) => void;
  removeEvent: (eventId: string) => void;

  getFamilyById: (id: string) => FamilyGroup | undefined;
  getFamilyMembers: (familyId: string) => Light[];
  getFamilyTemperature: (familyId: string) => number;
  getFamilyInsights: (familyId: string) => FamilyInsight[];
  getMembersNeedingCare: (familyId: string) => Light[];
  getUpcomingEvents: (familyId: string, days: number) => FamilyEvent[];
  getCareLog: (familyId: string, limit?: number) => CareLogEntry[];
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      families: [],
      careLog: [],
      events: [],

      createFamily: (name, memberIds, emoji) => {
        const userId = useAuthStore.getState().userId ?? 'local';
        const now = new Date().toISOString();
        const family: FamilyGroup = {
          id: genId(),
          name,
          emoji,
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
          memberIds: [...memberIds],
          settings: { ...DEFAULT_FAMILY_SETTINGS },
        };
        set((s) => ({ families: [...s.families, family] }));
        return family;
      },

      updateFamily: (id, updates) => {
        set((s) => ({
          families: s.families.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        }));
      },

      deleteFamily: (id) => {
        set((s) => ({ families: s.families.filter((f) => f.id !== id) }));
      },

      addMemberToFamily: (familyId, lightId) => {
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  memberIds: f.memberIds.includes(lightId) ? f.memberIds : [...f.memberIds, lightId],
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      removeMemberFromFamily: (familyId, lightId) => {
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  memberIds: f.memberIds.filter((mid) => mid !== lightId),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      logCareAction: (entry) => {
        const full: CareLogEntry = {
          ...entry,
          id: genId(),
          date: new Date().toISOString(),
        };
        set((s) => ({
          careLog: [full, ...s.careLog].slice(0, 500),
        }));
      },

      addEvent: (event) => {
        const full: FamilyEvent = { ...event, id: genId() };
        set((s) => ({ events: [...s.events, full] }));
      },

      removeEvent: (eventId) => {
        set((s) => ({ events: s.events.filter((e) => e.id !== eventId) }));
      },

      getFamilyById: (id) => get().families.find((f) => f.id === id),

      getFamilyMembers: (familyId) => {
        const family = get().getFamilyById(familyId);
        if (!family || family.memberIds.length === 0) return [];
        const members = useCircleStore.getState().members;
        const lights = useLightsStore.getState().getLights(members);
        return family.memberIds
          .map((id) => lights.find((l) => l.id === id))
          .filter((l): l is Light => l != null);
      },

      getFamilyTemperature: (familyId) => {
        const members = get().getFamilyMembers(familyId);
        if (members.length === 0) return 0;
        const values = members.map((m) => {
          if (m.sharedTemperature?.value !== undefined) return m.sharedTemperature.value;
          if (m.temperature === 'warm') return 75;
          if (m.temperature === 'neutral') return 50;
          return 25;
        });
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      },

      getMembersNeedingCare: (familyId) => {
        const members = get().getFamilyMembers(familyId);
        return members.filter(
          (m) =>
            m.temperature === 'cool' ||
            m.status === 'flickering' ||
            (m.sharedTemperature?.value !== undefined && m.sharedTemperature.value < 40)
        );
      },

      getUpcomingEvents: (familyId, days) => {
        const now = new Date();
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return get()
          .events.filter((e) => e.familyId === familyId)
          .filter((e) => {
            let d = new Date(e.date);
            if (e.recurring === 'yearly') {
              d = new Date(now.getFullYear(), d.getMonth(), d.getDate());
              if (d < now) d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
            }
            return d >= now && d <= cutoff;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getCareLog: (familyId, limit = 20) =>
        get()
          .careLog.filter((e) => e.familyId === familyId)
          .slice(0, limit),

      getFamilyInsights: (familyId) => {
        const insights: FamilyInsight[] = [];
        const members = get().getFamilyMembers(familyId);
        const needingCare = get().getMembersNeedingCare(familyId);
        const upcomingEvents = get().getUpcomingEvents(familyId, 7);

        needingCare.forEach((member) => {
          insights.push({
            type: 'alert',
            title: `${member.name} needs support`,
            description:
              member.temperature === 'cool'
                ? "They've been having a hard time"
                : "Haven't connected in a while",
            memberIds: [member.id],
            actionable: true,
            action: {
              label: 'Coordinate care',
              route: `/lights/family/${familyId}/coordinate?lightId=${member.id}`,
            },
          });
        });

        upcomingEvents.forEach((event) => {
          const eventDate = new Date(event.date);
          const daysUntil = Math.ceil(
            (eventDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );
          insights.push({
            type: daysUntil <= 1 ? 'alert' : 'celebration',
            title:
              daysUntil === 0 ? `Today: ${event.title}` : `${event.title} in ${daysUntil} days`,
            description: event.type === 'birthday' ? "🎂 Don't forget!" : '',
            memberIds: event.memberIds,
          });
        });

        const stable = members.filter((m) => m.temperature === 'warm');
        if (stable.length > 0) {
          insights.push({
            type: 'celebration',
            title: `${stable[0].name} is doing well`,
            description: 'The family rock 🌟',
          });
        }

        return insights;
      },
    }),
    {
      name: 'alln1-family',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        families: s.families,
        careLog: s.careLog,
        events: s.events,
      }),
    }
  )
);
