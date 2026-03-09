/**
 * Health data layer: source adapters → canonical schema → gauge mapping.
 * Use this for aggregated health (HealthKit + Oura + future Health Connect).
 * See docs/WEARABLE-DATA-AUDIT.md and docs/WEARABLES-HUMAN-OS.md.
 */

export { healthKitToCanonical } from './healthKitAdapter';
export { ouraToCanonical } from './ouraAdapter';
export { healthConnectToCanonical, type HealthConnectSnapshot } from './healthConnectAdapter';
export { mergeIntoCanonicalDay, type MergeInput } from './mergeLayer';
export {
  physiologyToBodyInput,
  physiologyToStateInput,
  canonicalDayToBodyStateInputs,
  type BodyStateInputs,
} from './gaugeMapping';
export {
  getAggregatedBodyState,
  buildAggregatedHealthContext,
  type AggregatedHealthResult,
} from './aggregatedHealth';