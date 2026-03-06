/**
 * Life Wrapped — Incremental data collection.
 * Call after each relevant action (check-in, journal, connection log, pre/post flight).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WRAPPED_YEAR } from '../types/wrapped';
import type { WrappedGaugeSnapshot, WrappedCollectionState } from '../types/wrapped';

const STORAGE_KEY = `wrapped_${WRAPPED_YEAR}`;

async function read(): Promise<WrappedCollectionState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as WrappedCollectionState;
  } catch (_) {}
  return {
    year: WRAPPED_YEAR,
    checkIns: 0,
    journalEntries: 0,
    connectionLogs: 0,
    preFlights: 0,
    postFlights: 0,
  };
}

async function write(state: WrappedCollectionState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export async function recordCheckIn(_gauges?: WrappedGaugeSnapshot): Promise<void> {
  const state = await read();
  state.checkIns += 1;
  state.lastCheckInAt = new Date().toISOString();
  await write(state);
}

export async function recordJournalEntry(): Promise<void> {
  const state = await read();
  state.journalEntries += 1;
  state.lastJournalAt = new Date().toISOString();
  await write(state);
}

export async function recordConnectionLog(): Promise<void> {
  const state = await read();
  state.connectionLogs += 1;
  state.lastConnectionAt = new Date().toISOString();
  await write(state);
}

export async function recordPreFlight(): Promise<void> {
  const state = await read();
  state.preFlights += 1;
  state.lastPreFlightAt = new Date().toISOString();
  await write(state);
}

export async function recordPostFlight(): Promise<void> {
  const state = await read();
  state.postFlights += 1;
  state.lastPostFlightAt = new Date().toISOString();
  await write(state);
}

export async function getWrappedProgress(): Promise<WrappedCollectionState> {
  return read();
}

/** Progress as 0–100 for display (e.g. cap at 100% for "coming December") */
export function progressPercent(state: WrappedCollectionState): number {
  const total =
    state.checkIns + state.journalEntries + state.connectionLogs + state.preFlights + state.postFlights;
  const cap = 200;
  return Math.min(100, Math.round((total / cap) * 100));
}
