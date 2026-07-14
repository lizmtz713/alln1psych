import { supabase } from '../lib/supabase';
import type { GaugeKey } from '../stores/cockpitStore';
import type { AdaptiveCheckInPlan } from './adaptiveCheckIn';

export type DebriefGaugeReading = {
  score: number;
  confidence: 'low' | 'medium' | 'high';
  evidence: string;
};

export type DailyDebriefResult = {
  gauges: Partial<Record<GaugeKey, DebriefGaugeReading>>;
  summary: string;
  reflection: string;
  followUpQuestion: string | null;
  missingGauges: GaugeKey[];
  source: 'ai' | 'heuristic';
};

const GAUGES: GaugeKey[] = ['body', 'state', 'emotion', 'connection', 'direction', 'alignment'];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function localFallback(transcript: string): DailyDebriefResult {
  const text = transcript.toLowerCase();
  const gauges: DailyDebriefResult['gauges'] = {};

  if (/tired|exhausted|drained|slept badly|no sleep|sick|pain/.test(text)) {
    gauges.body = { score: 35, confidence: 'low', evidence: 'You described physical depletion.' };
  } else if (/rested|energized|slept well|physically good/.test(text)) {
    gauges.body = { score: 80, confidence: 'low', evidence: 'You described physical capacity.' };
  }
  if (/anxious|activated|wired|on edge|overstimulated|panic/.test(text)) {
    gauges.state = { score: 35, confidence: 'low', evidence: 'You described activation or internal pressure.' };
  } else if (/calm|settled|regulated|at peace/.test(text)) {
    gauges.state = { score: 80, confidence: 'low', evidence: 'You described a settled nervous system.' };
  }
  if (/sad|angry|grief|upset|overwhelmed|numb/.test(text)) {
    gauges.emotion = { score: 40, confidence: 'low', evidence: 'You named a difficult emotional experience.' };
  } else if (/happy|hopeful|content|good mood|excited/.test(text)) {
    gauges.emotion = { score: 80, confidence: 'low', evidence: 'You named a positive emotional experience.' };
  }
  if (/alone|lonely|avoiding everyone|disconnected|argument|fight/.test(text)) {
    gauges.connection = { score: 35, confidence: 'low', evidence: 'You described distance or relationship strain.' };
  } else if (/supported|connected|listened|close to/.test(text)) {
    gauges.connection = { score: 80, confidence: 'low', evidence: 'You described feeling connected or supported.' };
  }
  if (/lost|stuck|no idea what|spinning/.test(text)) {
    gauges.direction = { score: 35, confidence: 'low', evidence: 'You described uncertainty about what comes next.' };
  } else if (/clear|focused|know what|productive|on track/.test(text)) {
    gauges.direction = { score: 80, confidence: 'low', evidence: 'You described clarity or forward movement.' };
  }
  if (/not me|against my values|wrong for me|betrayed myself/.test(text)) {
    gauges.alignment = { score: 35, confidence: 'low', evidence: 'You described tension with your values.' };
  } else if (/felt like me|true to myself|my values|right choice/.test(text)) {
    gauges.alignment = { score: 80, confidence: 'low', evidence: 'You described acting in line with your values.' };
  }

  const missingGauges = GAUGES.filter((gauge) => !gauges[gauge]);
  return {
    gauges,
    summary: Object.keys(gauges).length
      ? 'I found a few possible signals in what you shared.'
      : 'I heard you, but I need one more detail before suggesting scores.',
    reflection: 'You are the authority on what these signals mean. Review them before anything is saved.',
    followUpQuestion: missingGauges.length
      ? `What feels most important to clarify: ${missingGauges.slice(0, 2).join(' or ')}?`
      : null,
    missingGauges,
    source: 'heuristic',
  };
}

export async function analyzeDailyDebrief(
  transcript: string,
  currentGauges: Partial<Record<GaugeKey, number>>,
  plan: AdaptiveCheckInPlan
): Promise<DailyDebriefResult> {
  const fallback = () => localFallback(transcript);
  try {
    const { data, error } = await supabase.functions.invoke('analyze-debrief', {
      body: {
        transcript: transcript.slice(0, 12_000),
        currentGauges,
        wearableContext: plan.signals.map(({ kind, gauge, detail }) => ({ kind, gauge, detail })),
      },
    });
    if (error || !data || typeof data !== 'object') return fallback();

    const gauges: DailyDebriefResult['gauges'] = {};
    for (const gauge of GAUGES) {
      const reading = data.gauges?.[gauge];
      if (!reading || typeof reading.score !== 'number') continue;
      gauges[gauge] = {
        score: clamp(reading.score),
        confidence: ['low', 'medium', 'high'].includes(reading.confidence) ? reading.confidence : 'low',
        evidence: typeof reading.evidence === 'string'
          ? reading.evidence.slice(0, 180)
          : 'Inferred from what you shared.',
      };
    }
    const missingGauges = GAUGES.filter((gauge) => !gauges[gauge]);
    return {
      gauges,
      summary: typeof data.summary === 'string' ? data.summary.slice(0, 320) : 'Here is what I heard.',
      reflection: typeof data.reflection === 'string'
        ? data.reflection.slice(0, 320)
        : 'Review these suggestions before saving.',
      followUpQuestion: typeof data.followUpQuestion === 'string'
        ? data.followUpQuestion.slice(0, 240)
        : null,
      missingGauges,
      source: 'ai',
    };
  } catch {
    return fallback();
  }
}

