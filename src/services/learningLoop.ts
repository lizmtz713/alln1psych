import { supabase } from '../lib/supabase';
import type { GaugeKey } from '../stores/cockpitStore';

export type OutcomeValue = 'better' | 'same' | 'worse' | 'unsure';

export interface ToolOutcomeSummary {
  toolId: string;
  total: number;
  better: number;
  same: number;
  worse: number;
  unsure: number;
  betterRate: number;
  evidence: 'early' | 'developing' | 'established';
}

export interface PendingIntervention {
  id: string;
  toolId: string;
  createdAt: string;
}

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

  const { error } = await supabase.from('intervention_outcomes').insert({
    user_id: userId,
    intervention_id: input.interventionId ?? null,
    tool_id: input.toolId,
    outcome: input.outcome,
    gauges_after: input.gaugesAfter ?? {},
    note: input.note?.trim() || null,
    source: 'user_report',
  });
  if (error) throw error;
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
  const { data, error } = await supabase.from('intervention_events').insert({
    user_id: userId,
    tool_id: input.toolId,
    target_gauges: input.targetGauges ?? [],
    gauges_before: input.gaugesBefore ?? {},
    context: input.context ?? {},
    source: 'user_action',
  }).select('id').single();
  if (error) throw error;
  return data?.id ?? null;
}

/** Personal evidence only. This never mixes in population or AI-inferred sentiment. */
export async function getToolOutcomeSummaries(): Promise<ToolOutcomeSummary[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return [];
  const { data, error } = await supabase
    .from('intervention_outcomes')
    .select('tool_id,outcome')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;

  const grouped = new Map<string, Omit<ToolOutcomeSummary, 'betterRate' | 'evidence'>>();
  for (const row of data ?? []) {
    const toolId = String(row.tool_id);
    const current = grouped.get(toolId) ?? { toolId, total: 0, better: 0, same: 0, worse: 0, unsure: 0 };
    const outcome = row.outcome as OutcomeValue;
    current.total += 1;
    current[outcome] += 1;
    grouped.set(toolId, current);
  }
  return [...grouped.values()]
    .map((item) => {
      const decisive = item.better + item.same + item.worse;
      return {
        ...item,
        betterRate: decisive ? item.better / decisive : 0,
        evidence: decisive >= 10 ? 'established' as const : decisive >= 5 ? 'developing' as const : 'early' as const,
      };
    })
    .sort((a, b) => b.total - a.total || b.betterRate - a.betterRate);
}

/** Events become eligible for a later check after two hours, avoiding instant completion-as-success. */
export async function getPendingInterventions(): Promise<PendingIntervention[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user?.id) return [];
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: events, error: eventsError } = await supabase
    .from('intervention_events')
    .select('id,tool_id,created_at')
    .eq('user_id', auth.user.id)
    .lte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(30);
  if (eventsError) throw eventsError;
  if (!events?.length) return [];
  const { data: outcomes, error: outcomesError } = await supabase
    .from('intervention_outcomes')
    .select('intervention_id')
    .eq('user_id', auth.user.id)
    .in('intervention_id', events.map((event) => event.id));
  if (outcomesError) throw outcomesError;
  const answered = new Set((outcomes ?? []).map((row) => row.intervention_id).filter(Boolean));
  return events
    .filter((event) => !answered.has(event.id))
    .map((event) => ({ id: event.id, toolId: event.tool_id, createdAt: event.created_at }));
}
