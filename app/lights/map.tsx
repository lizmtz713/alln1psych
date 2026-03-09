/**
 * Map route — redirects to Relationship Universe (radar).
 * Kept so /lights/map deep links land on the constellation screen.
 */

import { Redirect } from 'expo-router';

export default function LightsMapRedirect() {
  return <Redirect href="/lights/radar" />;
}
