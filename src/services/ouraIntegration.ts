/**
 * Oura Ring Integration
 * 
 * Pulls data for Body & State gauges:
 * - Sleep (duration, efficiency, latency, REM, deep)
 * - Readiness (score, HRV, body temperature, recovery)
 * - Activity (steps, calories, movement)
 * - Heart rate & HRV (for nervous system/State gauge)
 * 
 * Oura API v2: https://cloud.ouraring.com/v2/docs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const OURA_TOKEN_KEY = 'oura_access_token';
const OURA_DATA_KEY = 'oura_cached_data';
const OURA_API_BASE = 'https://api.ouraring.com/v2';

// ============ Types ============

export interface OuraSleepData {
  score: number; // 0-100
  duration: number; // seconds
  efficiency: number; // percentage
  latency: number; // seconds to fall asleep
  remSleepDuration: number;
  deepSleepDuration: number;
  lightSleepDuration: number;
  awakeTime: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  restfulness: number;
}

export interface OuraReadinessData {
  score: number; // 0-100 (this is the main "readiness" score)
  temperatureDeviation: number; // body temp deviation from baseline
  temperatureTrendDeviation: number;
  activityBalance: number;
  sleepBalance: number;
  previousNightScore: number;
  recoveryIndex: number;
  restingHeartRate: number;
  hrvBalance: number;
}

export interface OuraActivityData {
  score: number; // 0-100
  steps: number;
  activeCalories: number;
  totalCalories: number;
  targetCalories: number;
  meetDailyTargets: number;
  moveEveryHour: number;
  trainingFrequency: number;
  trainingVolume: number;
  lowActivityTime: number; // seconds
  mediumActivityTime: number;
  highActivityTime: number;
}

export interface OuraHeartData {
  restingHeartRate: number;
  hrv: number; // HRV average (ms)
  hrvMax: number;
  breathingRate: number;
}

export interface OuraSnapshot {
  connected: boolean;
  lastSynced: Date | null;
  sleep: OuraSleepData | null;
  readiness: OuraReadinessData | null;
  activity: OuraActivityData | null;
  heart: OuraHeartData | null;
  error?: string;
}

// ============ Auth ============

/**
 * Check if Oura is connected
 */
export async function isOuraConnected(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(OURA_TOKEN_KEY);
  return !!token;
}

/**
 * Store Oura access token (after OAuth flow)
 */
export async function setOuraToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(OURA_TOKEN_KEY, token);
  await AsyncStorage.removeItem(OURA_TOKEN_KEY);
}

/**
 * Clear Oura connection
 */
export async function disconnectOura(): Promise<void> {
  await SecureStore.deleteItemAsync(OURA_TOKEN_KEY);
  await AsyncStorage.removeItem(OURA_TOKEN_KEY);
  await AsyncStorage.removeItem(OURA_DATA_KEY);
}

/**
 * Get stored token
 */
async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(OURA_TOKEN_KEY);
}

// ============ API Calls ============

async function fetchOuraAPI<T>(endpoint: string): Promise<T | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${OURA_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await disconnectOura();
      }
      console.warn(`[Oura] API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('[Oura] Fetch error:', error);
    return null;
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ============ Data Fetching ============

/**
 * Fetch sleep data from Oura
 */
export async function fetchSleepData(): Promise<OuraSleepData | null> {
  // Sleep data is for the previous night
  const yesterday = getYesterdayDate();
  const today = getTodayDate();
  
  const data = await fetchOuraAPI<{ data: any[] }>(
    `/usercollection/daily_sleep?start_date=${yesterday}&end_date=${today}`
  );

  if (!data?.data?.length) return null;

  const latest = data.data[data.data.length - 1];
  
  return {
    score: latest.score || 0,
    duration: latest.contributors?.total_sleep || 0,
    efficiency: latest.contributors?.efficiency || 0,
    latency: latest.contributors?.latency || 0,
    remSleepDuration: latest.contributors?.rem_sleep || 0,
    deepSleepDuration: latest.contributors?.deep_sleep || 0,
    lightSleepDuration: latest.contributors?.light_sleep || 0,
    awakeTime: latest.contributors?.awake_time || 0,
    bedtimeStart: latest.bedtime_start || '',
    bedtimeEnd: latest.bedtime_end || '',
    restfulness: latest.contributors?.restfulness || 0,
  };
}

/**
 * Fetch readiness data from Oura
 */
export async function fetchReadinessData(): Promise<OuraReadinessData | null> {
  const today = getTodayDate();
  
  const data = await fetchOuraAPI<{ data: any[] }>(
    `/usercollection/daily_readiness?start_date=${today}&end_date=${today}`
  );

  if (!data?.data?.length) return null;

  const latest = data.data[data.data.length - 1];
  
  return {
    score: latest.score || 0,
    temperatureDeviation: latest.temperature_deviation || 0,
    temperatureTrendDeviation: latest.temperature_trend_deviation || 0,
    activityBalance: latest.contributors?.activity_balance || 0,
    sleepBalance: latest.contributors?.sleep_balance || 0,
    previousNightScore: latest.contributors?.previous_night || 0,
    recoveryIndex: latest.contributors?.recovery_index || 0,
    restingHeartRate: latest.contributors?.resting_heart_rate || 0,
    hrvBalance: latest.contributors?.hrv_balance || 0,
  };
}

/**
 * Fetch activity data from Oura
 */
export async function fetchActivityData(): Promise<OuraActivityData | null> {
  const today = getTodayDate();
  
  const data = await fetchOuraAPI<{ data: any[] }>(
    `/usercollection/daily_activity?start_date=${today}&end_date=${today}`
  );

  if (!data?.data?.length) return null;

  const latest = data.data[data.data.length - 1];
  
  return {
    score: latest.score || 0,
    steps: latest.steps || 0,
    activeCalories: latest.active_calories || 0,
    totalCalories: latest.total_calories || 0,
    targetCalories: latest.target_calories || 0,
    meetDailyTargets: latest.contributors?.meet_daily_targets || 0,
    moveEveryHour: latest.contributors?.move_every_hour || 0,
    trainingFrequency: latest.contributors?.training_frequency || 0,
    trainingVolume: latest.contributors?.training_volume || 0,
    lowActivityTime: latest.low_activity_time || 0,
    mediumActivityTime: latest.medium_activity_time || 0,
    highActivityTime: latest.high_activity_time || 0,
  };
}

/**
 * Fetch heart/HRV data from Oura
 */
export async function fetchHeartData(): Promise<OuraHeartData | null> {
  const today = getTodayDate();
  
  // HRV data from sleep
  const sleepData = await fetchOuraAPI<{ data: any[] }>(
    `/usercollection/sleep?start_date=${getYesterdayDate()}&end_date=${today}`
  );

  if (!sleepData?.data?.length) return null;

  const latest = sleepData.data[sleepData.data.length - 1];
  
  return {
    restingHeartRate: latest.lowest_heart_rate || 0,
    hrv: latest.average_hrv || 0,
    hrvMax: latest.hrv?.items ? Math.max(...latest.hrv.items.filter((x: any) => x)) : 0,
    breathingRate: latest.average_breath || 0,
  };
}

// ============ Main Sync Function ============

/**
 * Sync all Oura data
 */
export async function syncOuraData(): Promise<OuraSnapshot> {
  const connected = await isOuraConnected();
  
  if (!connected) {
    return {
      connected: false,
      lastSynced: null,
      sleep: null,
      readiness: null,
      activity: null,
      heart: null,
    };
  }

  try {
    const [sleep, readiness, activity, heart] = await Promise.all([
      fetchSleepData(),
      fetchReadinessData(),
      fetchActivityData(),
      fetchHeartData(),
    ]);

    const snapshot: OuraSnapshot = {
      connected: true,
      lastSynced: new Date(),
      sleep,
      readiness,
      activity,
      heart,
    };

    // Cache the data
    await AsyncStorage.setItem(OURA_DATA_KEY, JSON.stringify(snapshot));

    return snapshot;
  } catch (error) {
    console.warn('[Oura] Sync error:', error);
    return {
      connected: true,
      lastSynced: null,
      sleep: null,
      readiness: null,
      activity: null,
      heart: null,
      error: 'Failed to sync Oura data',
    };
  }
}

/**
 * Get cached Oura data (for quick display)
 */
export async function getCachedOuraData(): Promise<OuraSnapshot | null> {
  const cached = await AsyncStorage.getItem(OURA_DATA_KEY);
  return cached ? JSON.parse(cached) : null;
}

// ============ Body Gauge Calculation ============

/**
 * Convert Oura data to Body gauge value (0-100)
 * Weighted formula:
 * - Sleep score: 40%
 * - Readiness score: 35%  
 * - Activity score: 25%
 */
export function calculateBodyGaugeFromOura(snapshot: OuraSnapshot): number | null {
  if (!snapshot.connected) return null;
  
  const weights = {
    sleep: 0.4,
    readiness: 0.35,
    activity: 0.25,
  };

  let total = 0;
  let weightSum = 0;

  if (snapshot.sleep?.score) {
    total += snapshot.sleep.score * weights.sleep;
    weightSum += weights.sleep;
  }

  if (snapshot.readiness?.score) {
    total += snapshot.readiness.score * weights.readiness;
    weightSum += weights.readiness;
  }

  if (snapshot.activity?.score) {
    total += snapshot.activity.score * weights.activity;
    weightSum += weights.activity;
  }

  if (weightSum === 0) return null;

  return Math.round(total / weightSum);
}

/**
 * Convert Oura HRV/readiness to State gauge suggestion (0-100)
 * Higher HRV = more parasympathetic = calmer state
 * Lower readiness = more strain = activated/stressed state
 */
export function calculateStateHintFromOura(snapshot: OuraSnapshot): {
  suggestion: number | null;
  confidence: 'low' | 'medium' | 'high';
  note: string;
} {
  if (!snapshot.connected || !snapshot.readiness) {
    return { suggestion: null, confidence: 'low', note: 'No Oura data' };
  }

  const readiness = snapshot.readiness.score;
  const hrvBalance = snapshot.readiness.hrvBalance;
  
  // HRV balance is a good indicator of nervous system state
  // Readiness < 60 often means body is stressed
  
  let suggestion: number;
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  let note: string;

  if (readiness >= 85 && hrvBalance >= 80) {
    suggestion = 80; // Well-regulated
    confidence = 'high';
    note = 'Your biometrics suggest good nervous system regulation.';
  } else if (readiness >= 70) {
    suggestion = 65;
    confidence = 'medium';
    note = 'Your body is in a reasonable state.';
  } else if (readiness >= 50) {
    suggestion = 50;
    confidence = 'medium';
    note = 'Your biometrics show some strain. Check in with how you feel.';
  } else {
    suggestion = 35;
    confidence = 'high';
    note = 'Your body is showing signs of stress or under-recovery.';
  }

  return { suggestion, confidence, note };
}

// ============ OAuth Helper ============

/**
 * Generate Oura OAuth URL
 * User needs to visit this URL to authorize the app
 */
export function getOuraAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = 'daily personal heartrate workout session';
  return `https://cloud.ouraring.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
}

/**
 * Exchange auth code for access token
 * This should be done on the server side for security
 */
export async function exchangeOuraCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const response = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
