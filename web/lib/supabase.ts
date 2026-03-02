import { createClient } from '@supabase/supabase-js';

// Server-side client with service role (for API routes)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Types for shared reports
export interface SharedReport {
  id: string;
  user_id: string;
  short_code: string;
  config: ReportConfig;
  expires_at: string;
  max_views: number | null;
  view_count: number;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  last_accessed_at: string | null;
}

export interface ReportConfig {
  timeRange: {
    start: string;
    end: string;
    preset?: string;
  };
  sections: {
    executiveSummary: boolean;
    gaugeTrends: boolean;
    patternAnalysis: boolean;
    recentEntries: boolean;
    aiInsights: boolean;
  };
  recipientInfo?: {
    name: string;
    title?: string;
  };
  patientIdentifier?: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  body: number | null;
  state: number | null;
  emotion: number | null;
  connection: number | null;
  direction: number | null;
  alignment: number | null;
  notes?: string;
  created_at: string;
}
