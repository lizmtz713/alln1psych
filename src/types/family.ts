/**
 * Family Dashboard — Group Lights for coordinated care, events, and insights.
 */

import type { Light } from './lights';

export interface FamilySettings {
  allowCareCoordination: boolean;
  shareTemperatures: boolean;
  notifyOnLow: boolean;
  lowThreshold: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  emoji?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
  settings: FamilySettings;
}

export type CareAction =
  | 'reached_out'
  | 'sent_mind_mail'
  | 'called'
  | 'visited'
  | 'sent_gift'
  | 'coordinated'
  | 'event'
  | 'other';

export interface CareLogEntry {
  id: string;
  familyId: string;
  date: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  action: CareAction;
  note?: string;
}

export interface FamilyInsight {
  type: 'pattern' | 'alert' | 'celebration' | 'suggestion';
  title: string;
  description: string;
  memberIds?: string[];
  actionable?: boolean;
  action?: { label: string; route: string };
}

export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  memberIds?: string[];
  recurring?: 'yearly' | 'monthly' | 'weekly';
}

export const DEFAULT_FAMILY_SETTINGS: FamilySettings = {
  allowCareCoordination: true,
  shareTemperatures: true,
  notifyOnLow: true,
  lowThreshold: 30,
};
