/**
 * Widget Bridge - React Native to iOS Widget communication
 * 
 * Pushes gauge data to shared UserDefaults for widget to read.
 * Requires native iOS module (WidgetBridge.swift) and App Groups setup.
 */

import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

export interface WidgetGaugeData {
  body: number | null;
  state: number | null;
  emotion: number | null;
  connection: number | null;
  direction: number | null;
  alignment: number | null;
  lastCheckIn: string; // ISO date string
  insight: string | null;
}

/**
 * Update widget with current gauge data
 * Call this after every check-in or gauge update
 */
export const updateWidget = async (data: WidgetGaugeData): Promise<void> => {
  if (Platform.OS !== 'ios') {
    // Android widgets not yet supported
    return;
  }
  
  try {
    if (WidgetBridge?.updateGaugeData) {
      await WidgetBridge.updateGaugeData(data);
      if (__DEV__) {
        console.log('[Widget] Updated with data:', data);
      }
    } else {
      if (__DEV__) {
        console.log('[Widget] Bridge not available (run on device with widget installed)');
      }
    }
  } catch (error) {
    console.warn('[Widget] Failed to update:', error);
  }
};

/**
 * Force refresh all InGauge widgets
 * Call this when user opens app to ensure widget is current
 */
export const refreshWidget = async (): Promise<void> => {
  if (Platform.OS !== 'ios') return;
  
  try {
    if (WidgetBridge?.refreshWidget) {
      await WidgetBridge.refreshWidget();
    }
  } catch (error) {
    console.warn('[Widget] Failed to refresh:', error);
  }
};

/**
 * Check if widget bridge is available
 * Returns false if native module not installed or on Android
 */
export const isWidgetAvailable = (): boolean => {
  return Platform.OS === 'ios' && !!WidgetBridge?.updateGaugeData;
};
