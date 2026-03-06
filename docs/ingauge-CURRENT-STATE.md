# InGauge / AllN1 Psych — Current State

**Purpose:** So Cursor (or any builder) knows **what’s already built** vs **what still needs building** when following the master build guide. Use this to skip implemented work and focus on gaps.

**How to use:**  
1. Read `ingauge-CURSOR-BUILD-GUIDE.md` (when present) for the 9-phase sequence.  
2. Use this doc to see what exists in each phase.  
3. For feature detail, point at the specific spec in `/docs` (e.g. `ingauge-CONTEXTUAL-INSIGHTS-SPEC.md`).

---

## Build guide phases (overview)

The master guide is sequenced in **9 phases**:

1. **Foundation** — App shell, auth, navigation, design system  
2. **Cockpit** — 6 gauges, cluster UI, gauge detail  
3. **Check-in** — Pre-flight / cockpit check-in, post-flight, decay  
4. **CoPilot** — Talk tab, AI + gauge context, voice  
5. **Toolkit** — Tools (Decode, Resolve, Relate, etc.), gauge-triggered suggestions  
6. **Lights** — Lights map, tiers, family, log entries  
7. **Manual** — Learn tab, lessons, Human Manual, contextual insights  
8. **Profile** — Me tab, journal, settings, focus mode  
9. **Premium** — Paywall, premium features (if applicable)

---

## Phase 1 — Foundation

| Item | Status | Notes |
|------|--------|------|
| App shell (Expo, React Native, TypeScript) | Done | `app/_layout.tsx`, tabs, modals |
| Auth (Supabase) | Done | Sign-in, sign-up, `AuthProvider`, `AuthSync` |
| Navigation (Expo Router) | Done | File-based; tabs + modals |
| Design system | Done | `src/lib/constants.ts` (COLORS, SPACING, TYPOGRAPHY, etc.) |
| Onboarding redirect | Done | `app/index.tsx` → onboarding or tabs |
| Stores (Zustand) | Done | `userStore`, `cockpitStore` (gauges), `circleStore` (lights), `conversationStore` (CoPilot); check-in/streaks in insightsStore, cockpitStore |
| Types (guide alignment) | Done | `src/types/gauges.ts` (GaugeType, GaugeValue, GaugeGoal), `src/types/user.ts` (AgeTier, UserProfile) |

---

## Phase 2 — Cockpit

| Item | Status | Notes |
|------|--------|------|
| 6 gauges (Body, State, Emotion, Connection, Direction, Alignment) | Done | `cockpitStore`, `GAUGE_CONFIG`, gauge helpers |
| Cockpit cluster UI (hex) | Done | `CockpitCluster.tsx`, home cockpit section |
| Gauge detail screen | Done | `app/(modals)/gauge-detail.tsx`, arc, tools, insights |
| Gauge colors / tiers | Done | Design system + `cockpitStore` (e.g. `GAUGE_TIERS`) |

---

## Phase 3 — Check-in

| Item | Status | Notes |
|------|--------|------|
| Cockpit check-in flow | Done | `app/(modals)/cockpit-checkin.tsx` |
| Pre-flight / post-flight | Done | `app/rituals/pre-flight.tsx`, `post-flight.tsx`, flight log |
| Daily decay | Done | `cockpitStore.runDailyDecayIfNeeded` |
| Post–check-in suggestions | Done | `PostCheckInSuggestions.tsx` after cockpit check-in |

---

## Phase 4 — CoPilot

| Item | Status | Notes |
|------|--------|------|
| Talk tab (voice-first) | Done | `app/(tabs)/talk.tsx` |
| AI + gauge context in system prompt | Done | `copilotGaugeContext.ts`, `useCoPilotGaugeContext`, wired in `ai.ts` |
| Voice recording / transcription | Done | Voice stack in place (e.g. `VoiceRecorder`, services) |

---

## Phase 5 — Toolkit

| Item | Status | Notes |
|------|--------|------|
| Core tools (Decode, Resolve, Relate, etc.) | Done | Modals + routes |
| Tool–gauge mappings | Done | `toolGaugeMappings.ts` |
| Gauge-triggered suggestions | Done | `toolSuggestionService`, `useToolSuggestions`, `GaugeTriggeredSuggestions` (home), `GaugeToolSuggestions` (gauge detail) |
| Home “Suggested for you” | Done | Home + gauge detail |

---

## Phase 6 — Lights

| Item | Status | Notes |
|------|--------|------|
| Lights map (constellation, nodes) | Done | `app/lights/map.tsx`, `LightsConstellation`, etc. |
| Lights add / log entry | Done | `lights/add.tsx`, `log-entry.tsx` |
| Family / tiers | Done | Family and tier routes under `lights/` |
| Lights services & types | Done | e.g. `lightsMap.ts`, `lightsMapSnapshot` |

---

## Phase 7 — Manual (Learn)

| Item | Status | Notes |
|------|--------|------|
| Learn tab | Done | `app/(tabs)/learn.tsx` |
| Lessons / Human Manual | Done | Lesson routes, manual content |
| Contextual Insights (50+ cards) | Done | Spec: `ingauge-CONTEXTUAL-INSIGHTS-SPEC.md` |
| Insight selection + 7-day no-repeat | Done | `insightService`, `useContextualInsight` |
| Daily Insight (home) / Gauge Insight (gauge detail) | Done | `DailyInsight`, `GaugeInsight`, `InsightCard` |

---

## Phase 8 — Profile (Me)

| Item | Status | Notes |
|------|--------|------|
| Me tab | Done | `app/(tabs)/me.tsx` |
| Journal | Done | Journal store + flows |
| Settings | Done | `app/(modals)/settings.tsx` |
| Focus Mode (simple home) | Done | `onboardingStore`, Settings toggle, home section flags |
| Adaptive home by experience level | Done | `useAdaptiveHomeSections`, level-based sections on home |
| Feature invitations (milestone-based) | Done | `FeatureInvitationModal`, `onboardingService` triggers |

---

## Phase 9 — Premium

| Item | Status | Notes |
|------|--------|------|
| Premium / paywall | Partial | e.g. `premiumStore`; clarify scope per product |
| Premium-only features | Partial | Some features gated (e.g. PRO badges in settings) |

---

## Specs fully implemented (recent)

These specs have been implemented end-to-end in this repo:

| Spec | Location | What was built |
|------|----------|----------------|
| **Gauge-Triggered Tools** | `docs/ingauge-GAUGE-TRIGGERED-TOOLS-SPEC.md` | Tool–gauge mapping, suggestion engine, home + gauge detail + post–check-in suggestions |
| **Contextual Insights** | `docs/ingauge-CONTEXTUAL-INSIGHTS-SPEC.md` | 50+ insight cards, selection + 7-day no-repeat, `InsightCard`, `DailyInsight`, `GaugeInsight` |
| **Mind Mail Safety** | `docs/ingauge-MIND-MAIL-SAFETY-SPEC.md` | Cooldowns, content check, EmotionalSafetyCheck, CooldownTimer, ContentWarning, CrisisIntervention, MessageActions, compose + detail integration, `content_warning` |
| **Adaptive Onboarding** | `docs/ingauge-ADAPTIVE-ONBOARDING-SPEC.md` | Experience levels, Focus Mode, feature invitations, `useAdaptiveHomeSections`, home conditionals, Settings Focus Mode toggle |

---

## Other notable areas

- **Life Wrapped:** Preview on home, `app/wrapped/index.tsx`, tracking + edge function (e.g. `generate-wrapped-insights`).  
- **Mind Mail:** Inbox, compose, glimpse, detail; safety layer above.  
- **Crisis / safety:** Crisis pipeline, crisis resources, Mind Mail crisis intervention.  
- **Forecast / predictions:** Forecast card, prediction model, pattern detection (e.g. `forecastService`, `predictiveWarnings`).

---

## Quick reference: where things live

- **Stores:** `src/stores/` (cockpit, circle, user, insights, onboarding, etc.)  
- **Services:** `src/services/` (ai, voice, onboarding, insight, mindMailSafety, etc.)  
- **Home:** `app/(tabs)/index.tsx` (adaptive sections, invitations, crisis check)  
- **Tabs:** Home, Talk, Learn, Circle (Mind Mail), Me  
- **Specs:** `docs/ingauge-*.md` and other `docs/*.md`

---

**Last updated:** When this file was added. Refresh “Already built” as you complete more of the build guide.
