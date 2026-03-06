/**
 * Sleep from Apple HealthKit — Fetch last night's sleep and normalize to app SleepData.
 * Use when HealthKit is available; fallback to manual/Pre-Flight in sleepStore.
 */

import { Platform } from 'react-native';
import { healthKitService } from './healthKit';
import type { SleepData, SleepQuality } from '../types/sleep';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Map HealthKit quality string to 1–5 */
function qualityToScore(quality: 'poor' | 'fair' | 'good' | 'excellent'): SleepQuality {
  const map: Record<string, SleepQuality> = {
    poor: 1,
    fair: 2,
    good: 4,
    excellent: 5,
  };
  return map[quality] ?? 3;
}

export interface HealthKitSleepResult {
  available: boolean;
  data: SleepData | null;
  /** Error or reason when unavailable */
  message?: string;
}

/**
 * Fetch last night's sleep from Apple HealthKit (iOS only).
 * Returns normalized SleepData for the morning date (today or yesterday).
 */
export async function fetchSleepFromHealthKit(): Promise<HealthKitSleepResult> {
  if (Platform.OS !== 'ios') {
    return { available: false, data: null, message: 'HealthKit is only available on iOS' };
  }

  try {
    const initialized = await healthKitService.initialize();
    if (!initialized) {
      return { available: false, data: null, message: 'HealthKit not available' };
    }

    const authorized = await healthKitService.requestAuthorization();
    if (!authorized) {
      return { available: true, data: null, message: 'HealthKit access not authorized' };
    }

    const raw = await healthKitService.getSleepData();
    const last = raw.lastNight;
    if (last.duration <= 0) {
      const date = new Date().getHours() < 12 ? yesterday() : today();
      return {
        available: true,
        data: null,
        message: 'No sleep data for last night',
      };
    }

    const hour = new Date().getHours();
    const morningDate = hour < 12 ? yesterday() : today();

    const data: SleepData = {
      date: morningDate,
      hours: Math.round(last.duration * 10) / 10,
      quality: qualityToScore(last.quality),
      source: 'healthkit',
      updatedAt: new Date().toISOString(),
      bedTime: last.bedTime?.toISOString?.() ?? undefined,
      wakeTime: last.wakeTime?.toISOString?.() ?? undefined,
    };

    return { available: true, data };
  } catch (e) {
    return {
      available: false,
      data: null,
      message: e instanceof Error ? e.message : 'Failed to fetch sleep',
    };
  }
}
