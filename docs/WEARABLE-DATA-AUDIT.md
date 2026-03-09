# InGauge Wearable & Data Layer — Audit & Implementation Status

**Principle:** Wearables = objective signals. Check-ins = subjective truth. AI = interpreter. Cockpit = understanding. Tools/Signals = action.

---

## PART 1 — AUDIT: Current Integration Layer

### Apple Health / HealthKit

| Item | Status | Location |
|------|--------|----------|
| Initialize / availability | ✅ Implemented | `src/services/healthKit.ts` |
| Request permissions (read) | ✅ Single block | Sleep, Steps, ActiveEnergy, Exercise, Stand, Water, EnergyConsumed, MenstrualFlow, HeartRate, HRV, RestingHeartRate |
| Sleep (duration, quality, week average) | ✅ | `getSleepData()` |
| Sleep stages (REM, deep) | ❌ Not requested | HealthKit has HKCategoryTypeIdentifierSleepAnalysis; current code uses ASLEEP/INBED only |
| Activity (steps, exercise min, active calories) | ✅ | `getActivityData()` |
| Stand hours | ❌ Not queried | Returned as 0 |
| Nutrition (water, calories in) | ✅ | `getNutritionData()` |
| Menstruation / cycle | ✅ | `getMenstruationData()` |
| Heart (resting HR, HRV) | ✅ | `getHeartData()` |
| Respiratory rate, SpO2, temperature | ❌ Not requested | HealthKit supports these |
| VO₂ max / cardio fitness | ❌ Not requested | iOS supports HKQuantityTypeIdentifierVO2Max |
| Full snapshot → Body score | ✅ | `calculateBodyScore()` — sleep 40%, activity 30%, water 15%, HRV 15% |
| Full snapshot → State contribution | ✅ | `calculateStateContribution()` — HRV only |
| Sync flow | ✅ | `healthStore.syncHealthData()` → healthKitService.getFullSnapshot() → body/state → cockpit.syncBodyFromHealth() |
| Partial permissions | ⚠️ No granular handling | If user denies one type, whole init can fail; no per-type fallback |
| Incremental / date-range sync | ❌ | Always full snapshot; no incremental or lastSynced filter |
| Stale data / last synced | ✅ | healthStore.lastSyncAttempt, snapshot.lastSynced |

### Apple Watch

| Item | Status | Location |
|------|--------|----------|
| Watch connectivity (pairing, reachability) | ✅ Via native module | `src/services/watchConnectivity.ts`, WatchBridge |
| Send gauge data to watch | ✅ | `sendGaugeData`, `sendComplicationData` |
| Receive check-in from watch | ✅ | `processWatchCheckIn` → cockpit updates |
| Request health snapshot from watch | ✅ | `requestHealthSnapshot()` → WatchHealthSnapshot (HRV, HR, steps, etc.) |
| Watch data → Body/State in cockpit | ⚠️ Not wired | `suggestBodyFromHealth()` exists but Watch snapshot is not merged into healthStore or cockpit automatically |
| Native Watch app | ⚠️ Depends on ios/WatchBridge | Not audited in this doc |

### Oura Ring

| Item | Status | Location |
|------|--------|----------|
| OAuth connect / disconnect | ✅ | `ouraIntegration.ts`, Supabase function `oura-oauth` |
| Fetch sleep (score, duration, stages, latency) | ✅ | `fetchSleepData()` — API v2 daily_sleep |
| Fetch readiness (score, temp deviation, HRV balance, RHR, recovery) | ✅ | `fetchReadinessData()` |
| Fetch activity (steps, calories, activity time) | ✅ | `fetchActivityData()` |
| Fetch heart (RHR, HRV, breathing rate) | ✅ | `fetchHeartData()` |
| Cache snapshot | ✅ | AsyncStorage OURA_DATA_KEY |
| Body gauge from Oura | ✅ | `calculateBodyGaugeFromOura()` — sleep 40%, readiness 35%, activity 25% |
| State hint from Oura | ✅ | `calculateStateHintFromOura()` — readiness + HRV balance |
| Oura → cockpit gauges | ❌ Not wired | Oura data is not merged into cockpit or into fetchCrossSystemInsight |
| Oura + HealthKit merge | ❌ | No single canonical record; no source priority when both connected |

### Google Fit / Health Connect

| Item | Status | Location |
|------|--------|----------|
| Android support | ❌ | health-connections: "Android support via Google Fit is coming soon" |
| Health Connect adapter | ❌ | No adapter; no placeholder |
| Source-agnostic normalization | ❌ | HealthKit and Oura each have their own types; no shared canonical schema |

### Data Ingestion & Stores

| Store / Service | Purpose | Persisted |
|------------------|---------|-----------|
| healthStore | HealthKit snapshot, bodyScoreFromHealth, stateContributionFromHealth | Yes (snapshot, scores) |
| cockpitStore | Six gauges; syncBodyFromHealth() reads healthStore | Yes (gauges) |
| sleepStore | Sleep by date, healthKitCache | Yes |
| Oura (AsyncStorage) | Token, cached Oura snapshot | Yes |
| checkInContext (cockpit) | Sleep/social/stress from check-in | Yes |

### Permissions & Consent

| Item | Status |
|------|--------|
| Health Connections screen | ✅ app/(modals)/health-connections.tsx |
| Explain what data is used for | ✅ HEALTH_DATA_TYPES with gauge mapping |
| Request HealthKit permissions | ✅ From healthStore.initialize + requestAuthorization |
| Disconnect / revoke | ✅ healthStore.clearHealthData; Oura disconnectOura |
| Last sync time | ✅ healthStore.lastSyncAttempt; Oura lastSynced in snapshot |
| Use app without wearables | ✅ Check-ins and cockpit work without health data |

### Insights Using Wearable Data

| Item | Status |
|------|--------|
| fetchCrossSystemInsight (cockpitAI) | ✅ Receives healthData from healthStore.snapshot only (HealthKit). Uses sleep, steps, exercise, water, HRV, cycle. |
| useGeneratedInsights / insightEngine | ✅ Uses sleepByDate (sleepStore), gauge history, checkInDates. sleepStore can be populated from HealthKit. No Oura in engine. |
| Cause insights (sleep → body, connection → emotion) | ✅ insightEngine; wording is correlation (“often”, “tends to”). |
| Emotion/meaning from wearables | ✅ Not claimed; emotion cause uses connection gap + self-report. |

---

## PART 2–3 — Normalized Data Model & Gauge Mapping

See **`src/types/canonicalHealth.ts`** and **`src/services/healthData/`** for:

- **Canonical schema:** Physiology (sleep, heart, activity, recovery), Behavior (movement, routine), Context (environment), Self-report (check-ins).
- **Source provenance:** Every canonical field can carry `source: 'healthkit' | 'oura' | 'health_connect'` and optional `sourceId`.
- **Gauge mapping:**
  - **Body:** sleep, sleep stages, activity, exercise, RHR, temperature deviation, respiratory rate, recovery indicators.
  - **State:** HRV, RHR deviation, sleep quality, stress/recovery patterns, activity load vs recovery; self-report (calm/overwhelm) primary.
  - **Emotion:** Self-report first; sleep, activity, routine as context only; no direct measurement.
  - **Connection:** Self-report + Signals/app data; optional behavioral context only.
  - **Direction:** Self-report (clarity); goals/review; routine stability as support only.
  - **Alignment:** Self-report and reflection; wearables do not measure meaning.

---

## PART 4 — HealthKit: Gaps & Recommendations

- **Add (optional):** Sleep stages if available (REM, deep), Respiratory rate, SpO2, wrist temperature if available, VO2Max if available. Request only what the app uses; document in HEALTH_PERMISSIONS.
- **Partial permissions:** On init, catch per-type errors and continue with available types; do not fail entire auth.
- **Incremental sync:** Optional: store lastSynced per data type and request only new data since then to reduce load.
- **Graceful degradation:** Already present: if HealthKit unavailable or unauthorized, bodyScoreFromHealth/stateContributionFromHealth stay null; cockpit works from check-ins.

---

## PART 5 — Oura: Gaps & Merge Logic

- **Wired:** Oura is fetched and cached; Body/State calculations exist but are **not** fed into cockpit or into AI insight.
- **Implemented:** Merge layer in `src/services/healthData/mergeLayer.ts` — one canonical record per date; source priority (e.g. Oura for sleep/readiness when connected, else HealthKit); provenance stored.
- **Integration:** Aggregated health service or healthStore enhancement that (1) runs HealthKit sync and Oura sync, (2) merges into canonical, (3) computes Body/State from canonical, (4) feeds cockpit and fetchCrossSystemInsight.

---

## PART 6 — Google / Android Readiness

- **Architecture:** Source adapters in `src/services/healthData/`: HealthKitAdapter, OuraAdapter, HealthConnectAdapter (placeholder). Each adapter outputs canonical schema. Gauge intelligence consumes canonical only.
- **Health Connect adapter:** Placeholder type and stub; implement when targeting Android.

---

## PART 7 — Insight Engine: Requirements Met

- **Cause insights:** e.g. sleep → State, sleep → Body, connection gap → emotion. Implemented; wording uses “often”, “tends to”.
- **System chain:** e.g. Body → State. Can be extended in insightEngine using gauge trends.
- **Action insights:** e.g. short walk, reach out. Present in tool suggestions and nudges.
- **Conservative wording:** Emotion/meaning/values not derived from wearables; insights use “may”, “tends to”, “often”.

---

## PART 8 — Privacy / Consent

- Transparent permissions and disconnect; last sync visible; app usable without wearables. Legal/product copy: data informs insights; not medical/mental health diagnosis; educational/supportive use. Verify in-app strings in health-connections and settings.

---

## PART 9 — UX

- No raw HRV/medical dashboards at product level; insights are phrased as “Your sleep was lower than usual…” and “You tend to feel better when…”. BiometricIndicator and detailed health screens exist for users who opt in.

---

## PART 10 — File-by-File Changes & Status

| File | Change | Status |
|------|--------|--------|
| docs/WEARABLE-DATA-AUDIT.md | This audit | ✅ Done |
| docs/WEARABLES-HUMAN-OS.md | Already exists; Human OS mapping | ✅ Done |
| src/types/canonicalHealth.ts | Canonical schema + provenance | ✅ Added |
| src/services/healthData/healthKitAdapter.ts | HealthKit → canonical | ✅ Added |
| src/services/healthData/ouraAdapter.ts | Oura → canonical | ✅ Added |
| src/services/healthData/healthConnectAdapter.ts | Placeholder for Android | ✅ Added |
| src/services/healthData/mergeLayer.ts | Merge rules, one record per date | ✅ Added |
| src/services/healthData/gaugeMapping.ts | Canonical → Body/State inputs | ✅ Added |
| src/services/healthData/index.ts | Re-exports | ✅ Added |
| healthStore / cockpitStore | Use merged canonical + Oura in insight | Optional next step |
| cockpitAI.ts | Accept aggregated health context (HealthKit + Oura) | Optional next step |

---

## Success Criteria Checklist

- [x] Audit complete and documented
- [x] Normalized internal schema and gauge mapping defined
- [x] Source adapter layer (HealthKit, Oura, Health Connect placeholder) added
- [x] Merge layer with provenance and priority
- [ ] Oura fed into cockpit and AI (recommended next: aggregate service calling merge, then feed to cockpit + fetchCrossSystemInsight)
- [x] Subjective check-ins remain central; wearables enhance only Body/State and context
- [x] Architecture ready for Google/Health Connect
- [x] No existing flows removed or broken

---

## Follow-Up Recommendations

1. **Wire Oura into cockpit and AI:** After sync, run merge layer; compute Body/State from canonical; set cockpit gauges (with priority vs HealthKit) and pass aggregated health context to fetchCrossSystemInsight.
2. **HealthKit:** Add optional sleep stages, respiratory rate, SpO2, VO2Max; handle partial permissions.
3. **Android:** Implement Health Connect adapter when ready; reuse canonical schema and gauge mapping.
4. **Insight engine:** Add more cause/system-chain insights using sleepByDay and checkInContext (e.g. “Sleep below 6h tends to lower State the next day”) with conservative wording.
