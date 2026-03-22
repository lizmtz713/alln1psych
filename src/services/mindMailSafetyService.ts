/**
 * Mind Mail Safety — Cooldowns, content moderation, block/report.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { containsCrisisKeywords } from './emergencyService';
import type { SendType } from '../stores/mindMailStore';
import type { ContentCheckResult, ContentCheckLevel, ReportReason } from '../types/mindMail';

const COOLDOWN_KEY = 'mind_mail_last_send';
const BLOCKED_KEY = 'mind_mail_blocked_ids';
const REPORTS_KEY = 'mind_mail_reports";

/** Cooldown minutes: open 0, soft 5, anonymous 10 (spec) */
export const COOLDOWN_MINUTES: Record<SendType, number> = {
  open: 0,
  soft: 5,
  anonymous: 10,
  glimpse: 0, // treat glimpse like open for cooldown
};

export async function getCooldownRemaining(sendType: SendType): Promise<number> {
  const mins = COOLDOWN_MINUTES[sendType];
  if (mins <= 0) return 0;
  const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
  if (!raw) return 0;
  const data = JSON.parse(raw) as { [K in SendType]?: string };
  const last = data[sendType];
  if (!last) return 0;
  const elapsed = (Date.now() - new Date(last).getTime()) / 60000;
  const remaining = mins - elapsed;
  return Math.max(0, Math.ceil(remaining));
}

export async function recordSend(sendType: SendType): Promise<void> {
  const mins = COOLDOWN_MINUTES[sendType];
  if (mins <= 0) return;
  const raw = await AsyncStorage.getItem(COOLDOWN_KEY);
  const data = (raw ? JSON.parse(raw) : {}) as { [K in SendType]?: string };
  data[sendType] = new Date().toISOString();
  await AsyncStorage.setItem(COOLDOWN_KEY, JSON.stringify(data));
}

/** Criticism patterns that often escalate conflict */
const CRITICISM_PATTERNS = [
  /\byou\s+always\b/i,
  /\byou\s+never\b/i,
  /\byou\s+really\s+need\s+to\b/i,
  /\byou\s+should\s+just\b/i,
  /\byou\s+don't\s+even\b/i,
  /\bwhy\s+can"t\s+you\s+ever\b/i,
];

/** Heavy content (abuse, trauma) — flag for sensitivity, not crisis by default */
const HEAVY_PATTERNS = [
  /\babuse\b/i,
  /\babus(ed|ing)\b/i,
  /\btrauma\b/i,
  /\bassault\b/i,
  /\bviolence\b/i,
  /\bself\s*harm\b/i,
  /\bcutting\b/i,
];

function emotionalIntensity(text: string): number {
  let score = 0;
  const lower = text.trim();
  if (lower.length > 200) score += 1;
  const capsRatio = (lower.match(/[A-Z]/g) || []).length / Math.max(1, lower.length);
  if (capsRatio > 0.3) score += 2;
  const exclamations = (lower.match(/!+/g) || []).length;
  if (exclamations >= 3) score += 1;
  if (lower.includes('???') || lower.includes('!!!')) score += 1;
  return score;
}

/**
 * Check message content for emotional intensity, criticism, heavy content, crisis.
 * Crisis → show intervention; sensitive → suggest content warning / safety check.
 */
export function checkContent(text: string): ContentCheckResult {
  const t = (text || '').trim();
  if (!t.length) return { level: 'normal', isCrisis: false };

  if (containsCrisisKeywords(t)) {
    return {
      level: 'crisis',
      isCrisis: true,
      message: 'Your message mentions crisis or self-harm. We care about you. Please consider reaching out to support before sending.',
    };
  }

  const intense = emotionalIntensity(t);
  const hasCriticism = CRITICISM_PATTERNS.some((p) => p.test(t));
  const hasHeavy = HEAVY_PATTERNS.some((p) => p.test(t));

  if (hasHeavy) {
    return {
      level: 'sensitive',
      isCrisis: false,
      message: 'This message may contain heavy or sensitive content. Consider adding a content warning for the recipient.',
    };
  }
  if (hasCriticism || intense >= 3) {
    return {
      level: 'emotional',
      isCrisis: false,
      message: 'This reads as intense or critical. Take a breath. Is this something you\'d say to their face?',
    };
  }
  return { level: 'normal', isCrisis: false };
}

/** Block a sender (user id or anonymous token). Stored locally until backend. */
export async function blockSender(blockedId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(BLOCKED_KEY);
  const set = new Set<string>(raw ? JSON.parse(raw) : []);
  set.add(blockedId);
  await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify([...set]));
}

export async function isBlocked(senderIdOrToken: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(BLOCKED_KEY);
  const set = new Set<string>(raw ? JSON.parse(raw) : []);
  return set.has(senderIdOrToken);
}

export async function getBlockedIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(BLOCKED_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Report a message. Stored locally until moderation backend. */
export async function reportMessage(
  messageId: string,
  reason: ReportReason,
  details?: string
): Promise<void> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const list: Array<{ messageId: string; reason: ReportReason; details?: string; at: string }> = raw ? JSON.parse(raw) : [];
  list.push({ messageId, reason, details, at: new Date().toISOString() });
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
}
