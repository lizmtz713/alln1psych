import type { GaugeKey } from '../stores/cockpitStore';
import type { CanonicalHealthDay } from '../types/canonicalHealth';
import type { WearableDailySample } from '../stores/wearableBaselineStore';

export type CheckInIntensity = 'normal' | 'recovery';
export type WearableSignalKind = 'sleep_short' | 'sleep_long' | 'hrv_down' | 'resting_hr_up' | 'recovery_low';

export type WearableSignal = {
  kind: WearableSignalKind;
  gauge: 'body' | 'state';
  label: string;
  detail: string;
  severity: 'noticeable' | 'persistent';
};

export type AdaptiveCheckInPlan = {
  intensity: CheckInIntensity;
  opening: string;
  choices: string[];
  signals: WearableSignal[];
  suggestedGauge: GaugeKey | null;
  hasPersonalBaseline: boolean;
};

function mean(values: Array<number | null | undefined>): number | null {
  const usable = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function percentChange(value: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((value - baseline) / baseline) * 100;
}

export function detectWearableSignals(
  today: CanonicalHealthDay | null,
  history: WearableDailySample[]
): { signals: WearableSignal[]; hasPersonalBaseline: boolean } {
  if (!today) return { signals: [], hasPersonalBaseline: false };

  const prior = history.filter((sample) => sample.date !== today.date).slice(0, 14);
  const hasPersonalBaseline = prior.length >= 5;
  const p = today.physiology;
  const signals: WearableSignal[] = [];

  const sleepBaseline = hasPersonalBaseline ? mean(prior.map((sample) => sample.sleepHours)) : null;
  if (p.sleepDurationHours != null) {
    const short = sleepBaseline != null ? p.sleepDurationHours < sleepBaseline - 1.25 : p.sleepDurationHours < 5.5;
    const long = sleepBaseline != null ? p.sleepDurationHours > sleepBaseline + 1.75 : p.sleepDurationHours > 10;
    if (short) {
      signals.push({
        kind: 'sleep_short',
        gauge: 'body',
        label: 'Shorter sleep',
        detail: sleepBaseline != null
          ? `Sleep was ${p.sleepDurationHours.toFixed(1)}h, below your recent ${sleepBaseline.toFixed(1)}h pattern.`
          : `Sleep was ${p.sleepDurationHours.toFixed(1)}h.`,
        severity: 'noticeable',
      });
    } else if (long) {
      signals.push({
        kind: 'sleep_long',
        gauge: 'body',
        label: 'Longer sleep',
        detail: sleepBaseline != null
          ? `Sleep was ${p.sleepDurationHours.toFixed(1)}h, above your recent ${sleepBaseline.toFixed(1)}h pattern.`
          : `Sleep was ${p.sleepDurationHours.toFixed(1)}h.`,
        severity: 'noticeable',
      });
    }
  }

  const hrvBaseline = hasPersonalBaseline ? mean(prior.map((sample) => sample.hrvMs)) : null;
  if (p.hrvMs != null && hrvBaseline != null && percentChange(p.hrvMs, hrvBaseline) <= -20) {
    signals.push({
      kind: 'hrv_down',
      gauge: 'state',
      label: 'Recovery signal shifted',
      detail: 'Your HRV is meaningfully below your own recent pattern.',
      severity: 'noticeable',
    });
  }

  const rhrBaseline = hasPersonalBaseline ? mean(prior.map((sample) => sample.restingHeartRate)) : null;
  if (p.restingHeartRate != null && rhrBaseline != null && p.restingHeartRate >= rhrBaseline + 7) {
    signals.push({
      kind: 'resting_hr_up',
      gauge: 'state',
      label: 'Body working harder',
      detail: 'Resting heart rate is elevated compared with your recent pattern.',
      severity: 'noticeable',
    });
  }

  if (p.recoveryScore != null && p.recoveryScore < 60) {
    signals.push({
      kind: 'recovery_low',
      gauge: 'body',
      label: 'Lower recovery',
      detail: `Your wearable recovery score is ${Math.round(p.recoveryScore)} today.`,
      severity: p.recoveryScore < 45 ? 'persistent' : 'noticeable',
    });
  }

  return { signals: signals.slice(0, 3), hasPersonalBaseline };
}

export function buildAdaptiveCheckInPlan(
  today: CanonicalHealthDay | null,
  history: WearableDailySample[]
): AdaptiveCheckInPlan {
  const { signals, hasPersonalBaseline } = detectWearableSignals(today, history);
  const recovery = signals.some((signal) => signal.severity === 'persistent') || signals.length >= 2;
  const primary = signals[0];

  if (!primary) {
    return {
      intensity: 'normal',
      opening: 'What changed since we last checked in?',
      choices: ['Nothing really changed', 'I feel better', 'Something feels harder', 'Let me explain'],
      signals,
      suggestedGauge: null,
      hasPersonalBaseline,
    };
  }

  const opening = primary.kind === 'sleep_long'
    ? 'You slept longer than your usual pattern. Did it feel restorative or heavy?'
    : primary.kind === 'sleep_short'
      ? 'Your sleep was shorter than usual. How is that showing up today?'
      : 'Your body is showing more strain than its recent pattern. Does that match how you feel?';

  return {
    intensity: recovery ? 'recovery' : 'normal',
    opening,
    choices: primary.kind === 'sleep_long'
      ? ['Restored', 'Still heavy', 'Mentally okay, physically tired', 'Let me explain']
      : ['Yes, I feel it', 'No, I feel okay', 'Only physically', 'Let me explain'],
    signals,
    suggestedGauge: primary.gauge,
    hasPersonalBaseline,
  };
}

export const HUMAN_PROMPTS: Record<GaugeKey, string[]> = {
  body: [
    'What does your body have available today?',
    'How much fuel is in the tank?',
    'Could your body comfortably carry today’s plans?',
    'Is your body asking for food, water, movement, or rest?',
    'Compared with yesterday, do you have more physical capacity or less?',
  ],
  state: [
    'How loud is your nervous system right now?',
    'Does your system feel able to exhale?',
    'Are you settled, alert, activated, or shutting down?',
    'How much internal static are you carrying?',
    'How close to the edge do things feel?',
  ],
  emotion: [
    'Which feeling has the microphone today?',
    'What are you carrying emotionally?',
    'What might be underneath your first answer?',
    'Does today feel clear, heavy, stormy, or numb?',
    'If your mood could say one sentence, what would it say?',
  ],
  connection: [
    'Do you feel seen today?',
    'Did anyone really meet you where you are?',
    'Are you reaching toward people or pulling away?',
    'Who feels close today—and who feels far?',
    'How supported do you feel right now?',
  ],
  direction: [
    'Do you know what matters next?',
    'Does today have a north star?',
    'Are you moving forward or mostly spinning?',
    'How clear is the next right step?',
    'Do your priorities feel chosen or imposed?',
  ],
  alignment: [
    'Did today feel like you?',
    'Did your actions match what matters to you?',
    'Is any part of you saying, “This isn’t right”?',
    'Did you abandon yourself anywhere today?',
    'If nobody were watching, would you make the same choices?',
  ],
};

export function promptForGauge(gauge: GaugeKey, date = new Date()): string {
  const prompts = HUMAN_PROMPTS[gauge];
  const daySeed = Math.floor(date.getTime() / 86_400_000);
  return prompts[Math.abs(daySeed) % prompts.length];
}

