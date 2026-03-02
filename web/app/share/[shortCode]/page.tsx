import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ReportViewer from '@/components/ReportViewer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getTimeRange(report: { config?: { timeRange?: { start: string; end: string }; range?: string }; created_at: string }) {
  const tr = report.config?.timeRange;
  if (tr?.start && tr?.end) return { start: tr.start, end: tr.end };
  const end = new Date();
  const start = new Date(report.created_at);
  const range = report.config?.range ?? '30';
  if (range === '7') start.setDate(start.getDate() - 7);
  else if (range === '30') start.setDate(start.getDate() - 30);
  else start.setFullYear(start.getFullYear() - 10);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: { shortCode: string };
  searchParams: { t?: string };
}) {
  const { shortCode } = params;
  const token = searchParams.t;

  const { data: report, error: reportError } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('short_code', shortCode)
    .eq('status', 'active')
    .single();

  if (reportError || !report) notFound();
  if (new Date(report.expires_at) < new Date()) notFound();
  if (token != null && report.token !== token) notFound();
  if (report.max_views != null && report.view_count >= report.max_views) notFound();

  const { start, end } = getTimeRange(report);
  const userId = report.user_id;
  const config = report.config ?? {};

  const [profileRes, moodRes, convRes, journalRes] = await Promise.all([
    supabase.from('profiles').select('name, pronouns').eq('id', userId).single(),
    config.includeMood !== false
      ? supabase
          .from('mood_checkins')
          .select('id, mood, mood_label, note, created_at')
          .eq('user_id', userId)
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true })
      : { data: [] },
    config.includeConversations !== false
      ? supabase
          .from('conversations')
          .select('id, summary, emotional_tone, created_at')
          .eq('user_id', userId)
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true })
      : { data: [] },
    config.includeJournal !== false
      ? supabase
          .from('journal_entries')
          .select('id, content, mood, created_at')
          .eq('user_id', userId)
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true })
      : { data: [] },
  ]);

  await supabase
    .from('shared_reports')
    .update({
      view_count: report.view_count + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq('id', report.id);

  return (
    <ReportViewer
      report={report}
      profile={profileRes.data ?? undefined}
      moodCheckins={moodRes.data ?? []}
      conversations={convRes.data ?? []}
      journalEntries={journalRes.data ?? []}
    />
  );
}
