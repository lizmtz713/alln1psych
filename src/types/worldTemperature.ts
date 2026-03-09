/**
 * World Temperature — aggregated by region from app users only.
 * Same scale as People: green / yellow / orange / red.
 * Needs help = count of users who could use support (orange/red).
 */

export type WorldTempLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface WorldRegionPoint {
  id: string;
  /** Display name (e.g. country or region) */
  name: string;
  lat: number;
  lng: number;
  /** Average temperature for users in this region (matches People ring colors) */
  temperature: WorldTempLevel;
  /** Number of app users in this region (for sizing/opacity) */
  userCount: number;
  /** Users in this region who need support (drives motion/pulse) */
  needsHelpCount: number;
}

export interface WorldTemperatureSummary {
  totalCheckInsToday: number;
  worldAverageLabel: string;
  worldAverageValue: number;
  regionPoints: WorldRegionPoint[];
}
