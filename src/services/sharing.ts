/**
 * Sharing Service — Operating Snapshots
 * 
 * Ethical sharing: plain-language summaries, no raw numbers,
 * time-bound, revocable, consensual.
 */

import { supabase } from '../lib/supabase';
import { useCockpitStore, type SystemMode, type GaugeKey } from '../stores/cockpitStore';

export interface OperatingSnapshot {
  displayName?: string;
  currentMode: SystemMode;
  modeMessage?: string;
  helpsText: string[];
  doesntHelpText: string[];
  customMessage?: string;
  expiresInHours?: number;
}

export interface ShareResult {
  success: boolean;
  token?: string;
  shareUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface SharedSnapshot {
  displayName: string | null;
  currentMode: SystemMode;
  modeMessage: string;
  helpsText: string[];
  doesntHelpText: string[];
  customMessage: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface MyShare {
  id: string;
  token: string;
  displayName: string | null;
  currentMode: SystemMode;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  viewCount: number;
}

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_URL 
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/share`
  : '';

/**
 * Create a shareable Operating Snapshot
 */
export async function createShare(snapshot: OperatingSnapshot): Promise<ShareResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        displayName: snapshot.displayName,
        currentMode: snapshot.currentMode,
        modeMessage: snapshot.modeMessage,
        helpsText: snapshot.helpsText,
        doesntHelpText: snapshot.doesntHelpText,
        customMessage: snapshot.customMessage,
        expiresInHours: snapshot.expiresInHours || 24,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to create share' };
    }

    const data = await response.json();
    return {
      success: true,
      token: data.token,
      shareUrl: data.shareUrl,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('Create share error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * View a shared Operating Snapshot (public, no auth required)
 */
export async function viewShare(token: string): Promise<SharedSnapshot | null> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('View share error:', error);
    return null;
  }
}

/**
 * Revoke a share (soft delete)
 */
export async function revokeShare(token: string): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }

    const response = await fetch(`${EDGE_FUNCTION_URL}/${token}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Revoke share error:', error);
    return false;
  }
}

/**
 * Get user's active shares
 */
export async function getMyShares(): Promise<MyShare[]> {
  try {
    const { data, error } = await supabase
      .from('shared_snapshots')
      .select('id, token, display_name, current_mode, created_at, expires_at, revoked_at, view_count')
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get shares error:', error);
      return [];
    }

    return (data || []).map(share => ({
      id: share.id,
      token: share.token,
      displayName: share.display_name,
      currentMode: share.current_mode as SystemMode,
      createdAt: share.created_at,
      expiresAt: share.expires_at,
      revokedAt: share.revoked_at,
      viewCount: share.view_count,
    }));
  } catch (error) {
    console.error('Get shares error:', error);
    return [];
  }
}

/**
 * Build default snapshot from current cockpit state
 */
export function buildSnapshotFromCockpit(displayName?: string): OperatingSnapshot {
  const cockpit = useCockpitStore.getState();
  
  return {
    displayName,
    currentMode: cockpit.systemMode,
    modeMessage: cockpit.systemMode === 'capacity' 
      ? 'System running steady' 
      : 'Foundation needs attention right now',
    helpsText: [],
    doesntHelpText: [],
  };
}

/**
 * Suggested "what helps" options
 */
export const HELPS_SUGGESTIONS = [
  'Space to process before responding',
  'Check-ins that aren\'t "are you okay?"',
  'Movement or walks together',
  'Quiet presence, not advice',
  'Distraction and humor',
  'Physical touch (if appropriate)',
  'Practical help with tasks',
  'Just listening',
];

/**
 * Suggested \"what doesn't help\" options
 */
export const DOESNT_HELP_SUGGESTIONS = [
  'Problem-solving before I\'ve vented',
  'Crowded social situations',
  'Have you tried... suggestions',
  'Toxic positivity',
  'Being told to calm down',
  'Comparisons to others',
  'Unsolicited advice',
  'Pressure to talk about it',
];
