/**
 * Therapist Share — create and manage shared reports (share with provider).
 * Uses Supabase shared_reports table.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { SharedReport, SharedReportConfig, CreateReportInput } from '../types/therapist-share';

function randomShortCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function randomToken(): string {
  const arr = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function mapRow(row: Record<string, unknown>): SharedReport {
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    short_code: String(row.short_code ?? ''),
    token: String(row.token ?? ''),
    config: (row.config as SharedReportConfig) ?? {},
    expires_at: String(row.expires_at ?? ''),
    max_views: row.max_views != null ? Number(row.max_views) : null,
    view_count: Number(row.view_count ?? 0),
    status: (row.status as SharedReport['status']) ?? 'active',
    created_at: String(row.created_at ?? ''),
    last_accessed_at: row.last_accessed_at != null ? String(row.last_accessed_at) : null,
  };
}

interface TherapistShareState {
  reports: SharedReport[];
  loading: boolean;
  error: string | null;

  fetchReports: (userId: string) => Promise<void>;
  createReport: (userId: string, input: CreateReportInput) => Promise<SharedReport | null>;
  revokeReport: (id: string) => Promise<void>;
  getShareUrl: (shortCode: string, token?: string) => string;
  clearError: () => void;
  reset: () => void;
}

export const useTherapistShareStore = create<TherapistShareState>((set, get) => ({
  reports: [],
  loading: false,
  error: null,

  fetchReports: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ reports: (data ?? []).map(mapRow), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createReport: async (userId: string, input: CreateReportInput): Promise<SharedReport | null> => {
    set({ error: null });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    const shortCode = randomShortCode();
    const token = randomToken();
    try {
      const { data, error } = await supabase
        .from('shared_reports')
        .insert({
          user_id: userId,
          short_code: shortCode,
          token,
          config: input.config ?? {},
          expires_at: expiresAt.toISOString(),
          max_views: input.maxViews,
          view_count: 0,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;
      const report = mapRow(data as Record<string, unknown>);
      set((s) => ({ reports: [report, ...s.reports] }));
      return report;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  revokeReport: async (id: string) => {
    try {
      await supabase.from('shared_reports').update({ status: 'revoked' }).eq('id', id);
      set((s) => ({
        reports: s.reports.map((r) => (r.id === id ? { ...r, status: 'revoked' as const } : r)),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  getShareUrl: (shortCode: string, token?: string): string => {
    const base = process.env.EXPO_PUBLIC_APP_URL ?? 'https://alln1psych.com';
    const path = `/share/${shortCode}`;
    return token ? `${base}${path}?t=${token}` : `${base}${path}`;
  },

  clearError: () => set({ error: null }),
  reset: () => set({ reports: [], loading: false, error: null }),
}));
