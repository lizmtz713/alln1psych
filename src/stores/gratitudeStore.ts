/**
 * Gratitude Practice — 3 Good Things (evening), morning gratitude, streak, and review.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyGratitude, GratitudeWeekSummary, GratitudePattern, GratitudeJarEntry } from '../types/gratitude';

const STORAGE_KEY = 'ingauge_gratitude';
const MAX_DAYS = 365;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function now(): string {
  return new Date().toISOString();
}

/** Start of week (Monday) for a given date string YYYY-MM-DD. */
function weekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Last N days (including today) as YYYY-MM-DD, newest first. */
function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() - i);
    out.push(copy.toISOString().slice(0, 10));
  }
  return out;
}

function genId(): string {
  return `gj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface GratitudeState {
  days: Record<string, DailyGratitude>;
  /** Gratitude Jar (activity) — free-form list of entries. */
  entries: GratitudeJarEntry[];

  addThreeGoodThings: (date: string, things: [string, string, string]) => void;
  addMorningGratitude: (date: string, text: string) => void;
  getDay: (date: string) => DailyGratitude | undefined;
  getStreak: () => number;
  getWeekSummary: (startDate?: string) => GratitudeWeekSummary;
  getPatterns: (startDate?: string) => GratitudePattern[];
  addEntry: (text: string, why?: string) => void;
  removeEntry: (id: string) => void;
  reset: () => void;
}

const defaultState = { days: {} as Record<string, DailyGratitude>, entries: [] as GratitudeJarEntry[] };

export const useGratitudeStore = create<GratitudeState>()(
  persist(
    (set, get) => ({
      days: {},
      entries: [],

      addThreeGoodThings: (date, things) => {
        const trimmed: [string, string, string] = [
          things[0].trim(),
          things[1].trim(),
          things[2].trim(),
        ];
        set((s) => {
          const next = { ...s.days };
          const existing = next[date];
          next[date] = {
            date,
            threeGoodThings: trimmed,
            morningGratitude: existing?.morningGratitude,
            updatedAt: now(),
          };
          const keys = Object.keys(next).sort();
          if (keys.length > MAX_DAYS) {
            keys.slice(0, keys.length - MAX_DAYS).forEach((k) => delete next[k]);
          }
          return { days: next };
        });
      },

      addMorningGratitude: (date, text) => {
        const trimmed = text.trim();
        set((s) => {
          const next = { ...s.days };
          const existing = next[date];
          next[date] = {
            date,
            threeGoodThings: existing?.threeGoodThings ?? ['', '', ''],
            morningGratitude: trimmed || undefined,
            updatedAt: now(),
          };
          const keys = Object.keys(next).sort();
          if (keys.length > MAX_DAYS) {
            keys.slice(0, keys.length - MAX_DAYS).forEach((k) => delete next[k]);
          }
          return { days: next };
        });
      },

      getDay: (date) => get().days[date],

      getStreak: () => {
        const days = get().days;
        const dates = lastDays(60);
        let streak = 0;
        for (const date of dates) {
          const day = days[date];
          const hasEvening = day?.threeGoodThings.some((t) => t.length > 0);
          const hasMorning = !!day?.morningGratitude?.trim();
          if (hasEvening || hasMorning) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },

      getWeekSummary: (startDate) => {
        const days = get().days;
        const start = startDate ?? weekStart(today());
        const end = today();
        let daysWithEvening = 0;
        let daysWithMorning = 0;
        let totalGoodThings = 0;
        const weekDates: string[] = [];
        for (let d = new Date(start + 'T12:00:00Z'); d <= new Date(end + 'T23:59:59Z'); d.setUTCDate(d.getUTCDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          weekDates.push(dateStr);
          const day = days[dateStr];
          if (day?.threeGoodThings.some((t) => t.length > 0)) {
            daysWithEvening++;
            totalGoodThings += day.threeGoodThings.filter((t) => t.length > 0).length;
          }
          if (day?.morningGratitude?.trim()) daysWithMorning++;
        }
        let streakAtEnd = 0;
        for (let i = weekDates.length - 1; i >= 0; i--) {
          const day = days[weekDates[i]];
          const has = day?.threeGoodThings.some((t) => t.length > 0) || !!day?.morningGratitude?.trim();
          if (has) streakAtEnd++;
          else break;
        }
        return {
          startDate: start,
          endDate: end,
          daysWithEvening,
          daysWithMorning,
          totalGoodThings,
          streakAtEnd,
        };
      },

      getPatterns: (startDate) => {
        const days = get().days;
        const start = startDate ?? (() => {
          const d = new Date();
          d.setDate(d.getDate() - 6);
          return d.toISOString().slice(0, 10);
        })();
        const end = today();
        const patterns: GratitudePattern[] = [];
        let totalPhrases = 0;
        let dayCount = 0;
        const wordCount: Record<string, number> = {};
        const stop = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'to', 'for', 'of', 'in', 'on', 'at', 'is', 'it', 'my', 'i', 'me', 'was', 'were', 'have', 'had', 'with', 'that', 'this']);
        for (let d = new Date(start + 'T12:00:00Z'); d <= new Date(end + 'T23:59:59Z'); d.setUTCDate(d.getUTCDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          const day = days[dateStr];
          if (!day) continue;
          dayCount++;
          const phrases = [...day.threeGoodThings.filter((t) => t.length > 0), day.morningGratitude ?? ''].filter(Boolean);
          totalPhrases += phrases.length;
          for (const p of phrases) {
            p.toLowerCase()
              .replace(/[^\w\s]/g, ' ')
              .split(/\s+/)
              .filter((w) => w.length > 2 && !stop.has(w))
              .forEach((w) => { wordCount[w] = (wordCount[w] ?? 0) + 1; });
          }
        }
        const topWords = Object.entries(wordCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([w]) => w);
        if (dayCount > 0) {
          patterns.push({
            label: 'This week',
            description: `You logged ${totalPhrases} gratitude moment${totalPhrases === 1 ? '' : 's'} across ${dayCount} day${dayCount === 1 ? '' : 's'}.`,
          });
          if (topWords.length > 0) {
            patterns.push({
              label: 'Themes',
              description: `Words you often used: ${topWords.join(', ')}.`,
            });
          }
        }
        return patterns;
      },

      addEntry: (text, why) => {
        const entry: GratitudeJarEntry = {
          id: genId(),
          text: text.trim(),
          createdAt: now(),
          ...(why ? { why } : {}),
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
      },

      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },

      reset: () => set(defaultState),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ days: s.days, entries: s.entries }),
    }
  )
);
