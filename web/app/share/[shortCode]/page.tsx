import { notFound } from 'next/navigation';
import { createServiceClient, SharedReport, CheckIn } from '@/lib/supabase';
import { ReportViewer } from '@/components/ReportViewer';

interface PageProps {
  params: { shortCode: string };
}

async function getReport(shortCode: string) {
  const supabase = createServiceClient();
  
  // Get the report
  const { data: report, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('short_code', shortCode)
    .eq('status', 'active')
    .single();
  
  if (error || !report) {
    return { error: 'not_found' as const };
  }
  
  // Check expiration
  if (new Date(report.expires_at) < new Date()) {
    await supabase
      .from('shared_reports')
      .update({ status: 'expired' })
      .eq('id', report.id);
    return { error: 'expired' as const };
  }
  
  // Check max views
  if (report.max_views && report.view_count >= report.max_views) {
    return { error: 'max_views' as const };
  }
  
  // Get check-in data
  const { start, end } = report.config.timeRange;
  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', report.user_id)
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: true });
  
  // Log access and increment view count
  await Promise.all([
    supabase.from('report_access_logs').insert({
      report_id: report.id,
      action: 'viewed',
    }),
    supabase
      .from('shared_reports')
      .update({
        view_count: report.view_count + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', report.id),
  ]);
  
  return {
    report: report as SharedReport,
    checkins: (checkins || []) as CheckIn[],
  };
}

export default async function SharePage({ params }: PageProps) {
  const result = await getReport(params.shortCode);
  
  if ('error' in result) {
    if (result.error === 'not_found') {
      notFound();
    }
    
    return (
      <main className="report-container">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {result.error === 'expired' ? 'Report Expired' : 'View Limit Reached'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {result.error === 'expired'
              ? 'This report link has expired. Please request a new one.'
              : 'This report has reached its maximum view limit.'}
          </p>
        </div>
      </main>
    );
  }
  
  return <ReportViewer report={result.report} checkins={result.checkins} />;
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'InGauge Wellness Report',
    description: 'Private wellness report shared via InGauge',
    robots: 'noindex, nofollow',
  };
}
