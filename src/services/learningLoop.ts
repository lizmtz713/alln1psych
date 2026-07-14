import { supabase } from '../lib/supabase';
import type { GaugeKey } from '../stores/cockpitStore';

export type OutcomeValue = 'better' | 'same' | 'worse' | 'unsure';

export async function recordInterventionOutcome(input: {
  interventionId?: string;
  toolId: string;
  outcome: OutcomeValue;
  gaugesAfter?: Partial<Record<GaugeKey, number>>;
  note?: string;
}): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  await supabase.from('intervention_outcomes').insert({
    user_id: userId,
    intervention_id: input.interventionId ?? null,
    tool_id: input.toolId,
    outcome: input.outcome,
    gauges_after: input.gaugesAfter ?? {},
    note: input.note?.trim() || null,
    source: 'user_report',
  });
}

export async function recordInterventionStart(input: {
  toolId: string;
  targetGauges?: GaugeKey[];
  gaugesBefore?: Partial<Record<GaugeKey, number>>;
  context?: Record<string, unknown>;
}): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  const { data } = await supabase.from('intervention_events').insert({
    user_id: userId,
    tool_id: input.toolId,
    target_gauges: input.targetGauges ?? [],
    gauges_before: input.gaugesBefore ?? {},
    context: input.context ?? {},
    source: 'user_action',
  }).select('id').single();
  return data?.id ?? null;
}
