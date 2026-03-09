/**
 * World Temperature map data — aggregated from app users only.
 * Colors match People: green, yellow, orange, red.
 */

import type { Light } from '../types/lights';
import type { WorldRegionPoint, WorldTemperatureSummary } from '../types/worldTemperature';
import { TEMPERATURE_COLORS } from '../utils/gaugeHelpers';

/** Same as People tab: green, yellow, orange, red */
export const WORLD_TEMP_COLORS: Record<'green' | 'yellow' | 'orange' | 'red', string> = {
  green: TEMPERATURE_COLORS.green,
  yellow: TEMPERATURE_COLORS.yellow,
  orange: TEMPERATURE_COLORS.orange,
  red: TEMPERATURE_COLORS.red,
};

/** Your circle's average temperature (for "You vs World") */
export interface CircleTemperatureSummary {
  value: number;
  label: string;
  count: number;
}

/**
 * Compute average temperature for the user's circle.
 * Uses momentumScore when available, else maps warm/neutral/cool to a value.
 */
export function getCircleTemperatureAverage(lights: Light[]): CircleTemperatureSummary | null {
  if (!lights.length) return null;
  const values: number[] = [];
  for (const l of lights) {
    if (l.momentumScore != null) {
      values.push(Math.max(0, Math.min(100, l.momentumScore)));
    } else {
      if (l.temperature === 'warm') values.push(75);
      else if (l.temperature === 'neutral') values.push(50);
      else if (l.temperature === 'cool') values.push(25);
      else values.push(50);
    }
  }
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const value = Math.round(avg);
  const label = value >= 67 ? 'Warm' : value >= 34 ? 'Neutral' : 'Cool';
  return { value, label, count: lights.length };
}

/**
 * Returns region points and summary for the world map.
 * Currently mock data; replace with API that aggregates by region.
 */
export function getWorldTemperatureData(): WorldTemperatureSummary {
  const regionPoints: WorldRegionPoint[] = [
    { id: 'us', name: 'United States', lat: 39.8283, lng: -98.5795, temperature: 'green', userCount: 4200, needsHelpCount: 380 },
    { id: 'uk', name: 'United Kingdom', lat: 55.3781, lng: -3.4360, temperature: 'yellow', userCount: 1800, needsHelpCount: 290 },
    { id: 'de', name: 'Germany', lat: 51.1657, lng: 10.4515, temperature: 'yellow', userCount: 1200, needsHelpCount: 180 },
    { id: 'ca', name: 'Canada', lat: 56.1304, lng: -106.3468, temperature: 'green', userCount: 900, needsHelpCount: 95 },
    { id: 'au', name: 'Australia', lat: -25.2744, lng: 133.7751, temperature: 'green', userCount: 800, needsHelpCount: 110 },
    { id: 'br', name: 'Brazil', lat: -14.2350, lng: -51.9253, temperature: 'orange', userCount: 600, needsHelpCount: 180 },
    { id: 'in', name: 'India', lat: 20.5937, lng: 78.9629, temperature: 'yellow', userCount: 1100, needsHelpCount: 220 },
    { id: 'mx', name: 'Mexico', lat: 23.6345, lng: -102.5528, temperature: 'yellow', userCount: 500, needsHelpCount: 90 },
    { id: 'fr', name: 'France', lat: 46.2276, lng: 2.2137, temperature: 'green', userCount: 700, needsHelpCount: 85 },
    { id: 'jp', name: 'Japan', lat: 36.2048, lng: 138.2529, temperature: 'orange', userCount: 400, needsHelpCount: 95 },
    { id: 'ng', name: 'Nigeria', lat: 9.0820, lng: 8.6753, temperature: 'yellow', userCount: 350, needsHelpCount: 70 },
    { id: 'za', name: 'South Africa', lat: -30.5595, lng: 22.9375, temperature: 'yellow', userCount: 280, needsHelpCount: 55 },
  ];

  return {
    totalCheckInsToday: 12847,
    worldAverageLabel: 'Warm',
    worldAverageValue: 72,
    regionPoints,
  };
}
