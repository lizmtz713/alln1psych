/**
 * Types for shared reports (Share with Provider / therapist share).
 * Matches Supabase shared_reports table.
 */

export type ExportRange = '7' | '30' | 'all';

export type SharedReportStatus = 'active' | 'expired' | 'revoked';

export interface SharedReportConfig {
  range?: ExportRange;
  includeConversations?: boolean;
  includeJournal?: boolean;
  includeMood?: boolean;
  includeEducation?: boolean;
  includeGratitude?: boolean;
  includeTriggers?: boolean;
}

export interface SharedReport {
  id: string;
  user_id: string;
  short_code: string;
  token: string;
  config: SharedReportConfig;
  expires_at: string;
  max_views: number | null;
  view_count: number;
  status: SharedReportStatus;
  created_at: string;
  last_accessed_at: string | null;
}

export interface CreateReportInput {
  config: SharedReportConfig;
  expiresInDays: number;
  maxViews: number | null;
}
