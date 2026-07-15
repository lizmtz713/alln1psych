/**
 * Export user data as JSON or therapist summary.
 */

import * as FileSystem from 'expo-file-system';
import { APP_CONFIG } from '../lib/constants';
import * as Sharing from 'expo-sharing';
import { useUserStore } from '../stores/userStore';
import { useConversationSummaryStore } from '../stores/conversationSummaryStore';
import { useJournalStore } from '../stores/journalStore';
import { useCircleStore } from '../stores/circleStore';
import { useEducationStore } from '../stores/educationStore';
import { useGratitudeStore } from '../stores/gratitudeStore';
import type { TriggerMapEntry } from '../stores/userStore';
import { callEdgeFunction } from './ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExportRange = '7' | '30' | 'all';

export interface DataExport {
  schemaVersion: 2;
  exportDate: string;
  source: 'cloud-and-device';
  cloudData: Record<string, unknown[]>;
  deviceData: Record<string, unknown>;
  profile: {
    name: string;
    pronouns: string;
    ageGroup: string;
    loveLanguage: string;
    communicationPreference: string;
    createdAt: string;
  };
  conversations: {
    date: string;
    summary?: string;
    messages: { role: string; content: string; timestamp: string }[];
  }[];
  journalEntries: {
    date: string;
    content: string;
    mood?: string;
  }[];
  moodCheckins: {
    date: string;
    temperature: string;
    note?: string;
  }[];
  educationProgress: {
    lessonId: string;
    completedAt: string;
    reflection?: string;
  }[];
  gratitudeEntries: {
    date: string;
    text: string;
  }[];
  triggerMaps: {
    date: string;
    situation: string;
    emotions: string[];
    bodyAreas: string[];
    reaction: string;
  }[];
}

function sinceDate(range: ExportRange): number {
  const now = Date.now();
  if (range === '7') return now - 7 * 24 * 60 * 60 * 1000;
  if (range === '30') return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function inRange(isoDate: string, range: ExportRange): boolean {
  if (range === 'all') return true;
  return new Date(isoDate).getTime() >= sinceDate(range);
}

function buildDeviceExportData(range: ExportRange): DataExport {
  const user = useUserStore.getState();
  const summaries = useConversationSummaryStore.getState().getSummaries();
  const journalEntries = useJournalStore.getState().entries;
  const circle = useCircleStore.getState();
  const education = useEducationStore.getState();
  const gratitude = useGratitudeStore.getState().entries;

  const conversations = summaries
    .filter((s) => inRange(s.createdAt, range))
    .map((s) => ({
      date: s.createdAt,
      summary: s.summary,
      messages: [] as { role: string; content: string; timestamp: string }[],
    }));

  const journal = journalEntries
    .filter((e) => inRange(e.createdAt.toISOString(), range))
    .map((e) => ({
      date: e.createdAt.toISOString(),
      content: e.content,
      mood: e.mood,
    }));

  const moodCheckins = circle.moodHistory
    .filter((m) => inRange(m.timestamp.toISOString(), range))
    .map((m) => ({
      date: m.timestamp.toISOString(),
      temperature: m.mood,
      note: m.note,
    }));

  const educationProgress = education.completedLessons.map((lessonId) => {
    const reflection = education.reflections[lessonId];
    return {
      lessonId,
      completedAt: education.lastLessonDate?.toISOString() ?? new Date().toISOString(),
      reflection,
    };
  }).filter((e: { completedAt: string }) => range === 'all' || inRange(e.completedAt, range));

  const gratitudeEntries = gratitude
    .filter((e: { createdAt: string }) => inRange(e.createdAt, range))
    .map((e: { createdAt: string; text: string }) => ({ date: e.createdAt, text: e.text }));

  const triggerMaps = (user.triggerMaps ?? []).filter((t: TriggerMapEntry) =>
    inRange(t.createdAt, range)
  ).map((t: TriggerMapEntry) => ({
    date: t.createdAt,
    situation: t.situation,
    emotions: t.emotions,
    bodyAreas: t.bodyZones,
    reaction: t.reaction,
  }));

  return {
    schemaVersion: 2,
    exportDate: new Date().toISOString(),
    source: 'cloud-and-device',
    cloudData: {},
    deviceData: {},
    profile: {
      name: user.name ?? '',
      pronouns: user.pronouns ?? user.customPronouns ?? '',
      ageGroup: user.ageGroup ?? '',
      loveLanguage: user.loveLanguage ?? '',
      communicationPreference: user.communicationPreference ?? '',
      createdAt: new Date().toISOString(),
    },
    conversations,
    journalEntries: journal,
    moodCheckins,
    educationProgress,
    gratitudeEntries,
    triggerMaps,
  };
}

type AccountExportResponse = {
  schemaVersion: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
};

/**
 * Build a complete portability export. Cloud records are fetched through an
 * authenticated service endpoint; device-only records are included alongside
 * them so a user receives everything this installation can access.
 */
export async function buildExportData(range: ExportRange): Promise<DataExport> {
  const local = buildDeviceExportData(range);
  const [cloud, deviceEntries] = await Promise.all([
    callEdgeFunction<AccountExportResponse>('export-account', {}, 60_000),
    AsyncStorage.getAllKeys().then(async (keys) => {
      const exportableKeys = keys.filter((key) => !['oura_access_token', 'openai_api_key'].includes(key));
      return AsyncStorage.multiGet(exportableKeys);
    }),
  ]);
  if (!cloud?.data || typeof cloud.data !== 'object') {
    throw new Error('The account export service returned invalid data');
  }
  const deviceData: Record<string, unknown> = {};
  for (const [key, value] of deviceEntries) {
    if (value == null) continue;
    try {
      deviceData[key] = JSON.parse(value) as unknown;
    } catch {
      deviceData[key] = value;
    }
  }
  return {
    ...local,
    exportDate: cloud.exportedAt || local.exportDate,
    cloudData: cloud.data,
    deviceData,
  };
}

export async function shareExportFile(data: DataExport, filename: string): Promise<void> {
  const dir = (FileSystem as any).documentDirectory ?? '';
  const path = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2), {
    encoding: (FileSystem as any).EncodingType?.UTF8 ?? 'utf8',
  });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device');
  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Export your data',
  });
}

export function buildTherapistSummary(data: DataExport): string {
  const lines: string[] = [];
  lines.push(`${APP_CONFIG.name} — Emotional wellness summary`);
  lines.push(`Generated for ${data.profile.name}`);
  lines.push(`Export date: ${new Date(data.exportDate).toLocaleDateString()}`);
  lines.push('');
  lines.push('--- Mood trends ---');
  const moodCounts: Record<string, number> = {};
  data.moodCheckins.forEach((m) => {
    moodCounts[m.temperature] = (moodCounts[m.temperature] ?? 0) + 1;
  });
  Object.entries(moodCounts).forEach(([temp, count]) => {
    lines.push(`${temp}: ${count} check-in(s)`);
  });
  lines.push('');
  lines.push('--- Conversation summaries ---');
  data.conversations.forEach((c) => {
    lines.push(`• ${c.date.slice(0, 10)}: ${c.summary ?? '(no summary)'}`);
  });
  lines.push('');
  lines.push('--- Top themes (from conversations) ---');
  const summaries = useConversationSummaryStore.getState().getSummaries();
  const emotions: Record<string, number> = {};
  const triggers: Record<string, number> = {};
  summaries.forEach((s) => {
    s.emotions.forEach((e) => { emotions[e] = (emotions[e] ?? 0) + 1; });
    s.triggers.forEach((t) => { triggers[t] = (triggers[t] ?? 0) + 1; });
  });
  const topEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTriggers = Object.entries(triggers).sort((a, b) => b[1] - a[1]).slice(0, 5);
  lines.push('Emotions: ' + topEmotions.map(([e, n]) => `${e} (${n})`).join(', ') || 'None');
  lines.push('Triggers: ' + topTriggers.map(([t, n]) => `${t} (${n})`).join(', ') || 'None');
  lines.push('');
  lines.push('---');
  lines.push(`Generated by ${APP_CONFIG.name} — emotional wellness data.`);
  return lines.join('\n');
}
