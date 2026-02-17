/**
 * Minimal cockpit store stub for activity bonuses.
 * Provides gauge state and update methods; bonuses apply when this store is used.
 */

import { create } from 'zustand';

export type GaugeKey = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

interface GaugeState {
  value: number;
  trend?: 'up' | 'down' | 'stable' | null;
}

interface CockpitState {
  body: GaugeState;
  state: GaugeState;
  emotion: GaugeState;
  connection: GaugeState;
  direction: GaugeState;
  alignment: GaugeState;
  crossSystemInsight: string | null;
  getGaugeColor: (key: GaugeKey) => string;
  updateBody: (v: number) => void;
  updateState: (v: number) => void;
  updateEmotion: (v: number) => void;
  updateConnection: (v: number) => void;
  updateDirection: (v: number) => void;
  updateAlignment: (v: number) => void;
  fetchCrossSystemInsight: () => void;
  runDailyDecayIfNeeded: () => void;
}

const emptyGauge = (): GaugeState => ({ value: -1 });

export const useCockpitStore = create<CockpitState>((set) => ({
  body: emptyGauge(),
  state: emptyGauge(),
  emotion: emptyGauge(),
  connection: emptyGauge(),
  direction: emptyGauge(),
  alignment: emptyGauge(),
  crossSystemInsight: null,
  getGaugeColor: () => '#55556A',
  updateBody: () => {},
  updateState: () => {},
  updateEmotion: () => {},
  updateConnection: () => {},
  updateDirection: () => {},
  updateAlignment: () => {},
  fetchCrossSystemInsight: () => {},
  runDailyDecayIfNeeded: () => {},
}));
