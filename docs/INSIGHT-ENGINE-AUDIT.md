# Insight Engine Audit — InGauge / AllN1 Psych

**Date:** March 2025  
**Scope:** All insight-related logic, data flows, and UI before any new implementation.  
**Rule:** No new systems implemented here; audit and improvement plan only.

---

## STEP 1 — Existing Insight Engine: Files & Systems

### Core insight systems (by purpose)

| System | Primary files | What it does |
|--------|--------------|--------------|
| **Cockpit / Cross-system insight** | `src/services/cockpitAI.ts`, `src/stores/cockpitStore.ts` | One AI-generated (or fallback) insight from 6 gauges + health + Spotify + weather + environment. Shown on Home when 3+ gauges active. |
| **Unified Insight Engine (5 types)** | `src/services/insightEngine.ts`, `src/types/insights-engine.ts`, `src/hooks/useGeneratedInsights.ts` | Generates Pattern, Cause, Timing, Growth, Meaning insights from gauge values, trends, check-in dates, rituals (pre/post flight), sleep, connection gaps, wins. Used by post-check-in and WeeklyInsightCard. |
| **Pattern detection (forecast-style)** | `src/services/patternDetection.ts`, `src/types/forecast.ts` | Detects: day_of_week, sleep_state, connection_gaps, calendar_load, sequence, trend_momentum. Feeds into insightEngine’s pattern/timing insights. |
| **Pattern engine (narrative)** | `src/services/patternEngine.ts` | Narrative patterns: Body→State loop, connection sustained, State–Emotion correlation, Direction–Alignment, gauge trends. Used by Patterns modal. |
| **Systemic drift** | `src/services/systemicDrift.ts` | Records gauge events (GaugeEvent), analyzes weekly_drop, time_of_day, gradual_decline, volatility, correlation. Separate history key from crisis pipeline. |
| **Drift detector (alignment)** | `src/services/driftDetector.ts`, `app/(modals)/drift-detector.tsx` | Value-alignment reflection; correlates gauge/sleep with value-consistent actions; DriftPattern/DriftInsight. Uses crisisPipeline.getGaugeHistory(). |
| **Crisis pipeline history** | `src/services/crisisPipeline.ts` | Records GaugeSnapshot (6 values per timestamp), 7-day history. Source of truth for getGaugeHistory() used by insightEngine, patternEngine, driftDetector, sovereigntyReport, etc. |
| **Contextual insight cards** | `src/services/insightService.ts`, `src/data/insightCards.ts`, `src/hooks/useContextualInsight.ts` | 50+ static InsightCards mapped to gauges; selectForHome/selectForGauge with 7-day no-repeat. DailyInsight (home) and gauge detail. |
| **Insights store (legacy)** | `src/stores/insightsStore.ts` | getPsychSays, getWeeklySummary, getWeeklyMoodTrend, getAchievements, getCheckInStreak, getEngagementStreak. Mood history from circleStore; weekly summary line. |
| **Daily content (AI)** | `src/services/personalization.ts`, `src/stores/dailyContentStore.ts` | AI-generated daily: greeting, affirmation, **insight**, challengeSuggestion. insight used as psychSays fallback on Home. |
| **Relationship insight** | Inline in `app/(tabs)/index.tsx` | getRelationshipInsight(lights, needAttentionCount): “A moment for someone today…” / “Your inner circle is strong…” for Cockpit↔Signals. |
| **System insight of the day** | Inline in `app/(tabs)/index.tsx` | getSystemInsightOfTheDay(body,…,alignment): cause/chain/action insight from current gauges (deterministic, day-seeded). |
| **Share Insight** | `src/features/share-insight/`, `src/data/academicSources.ts` | getInsightsForGauge (Learn), buildContent for sharing; SYNTHESIZED_INSIGHTS + Manual/Discovery. |
| **Discoveries / Manual** | `src/data/discoveries.ts`, manual content | Static discovery cards and manual lessons; some feed Share Insight and education. |
| **Lights insights** | `app/lights/insights.tsx` | Placeholder: “X flickering, Y cooled down”; no deep relationship insights yet. |
| **Relate insights** | `light.relateInsights` (lightsStore, PersonDetailSheet, [id]) | Per-person insights from Relate tool; stored on light, displayed on detail. |
| **Goals reflection** | `ReviewReflectModal`, goalsStore | Weekly goal reflection (rating, what helped, what got in the way); data stored but **not yet fed into any insight engine**. |
| **Timeline** | `src/services/humanTimelineService.ts`, `app/timeline/index.tsx` | Event type `insight` in timeline; aggregates check-ins, connection moments, insights, journal. |
| **Predictive warnings** | `src/services/predictiveWarnings.ts` | Uses getGaugeHistory(); tier-based risk; no direct “insight” copy. |
| **Sovereignty report** | `src/services/sovereigntyReport.ts` | Lead-lag, external triggers, day/time patterns; uses getGaugeHistory(). |

### Other references

- **psychSaysContent** on Home: `crossSystemInsight` (when 3+ gauges) **or** `dailyContent.insight` **or** `getPsychSays(streak)`.
- **Weekly summary**: insightsStore.getWeeklySummary() → line, mostCommonMood, checkInDays, lessonsCount, conversationDays; shown Home and in weekly insight section.
- **JIT / Copilot**: justInTimeLearning, copilotGaugeContext — suggest tools/lessons; not “insight” text per se.

---

## STEP 2 — Data Flow Into Insights

### Data sources → normalization → pattern/insight → UI

| Data source | Normalization / store | Used by insight systems | UI |
|-------------|----------------------|-------------------------|-----|
| **Check-ins / mood** | circleStore.moodHistory, cockpitStore (gauges), crisisPipeline snapshots | insightEngine (checkInDates, gaugeValues), insightsStore (weekly mood, streak), getSystemInsightOfTheDay, cockpitAI | Home, Patterns, Weekly summary |
| **Rituals (pre/post flight)** | ritualsStore | insightEngine (preFlights, postFlights), patternDetection (day_of_week, sleep_state) | Unified engine, Patterns |
| **Sleep** | sleepStore (byDate, healthKitCache) | insightEngine (sleepByDay), cause (Body/sleep), driftDetector (sleep average) | Cause insights, Drift |
| **Gauge history** | crisisPipeline (GaugeSnapshot[], 7 days) | insightEngine (recentGaugeByDay when withHistory), patternEngine, driftDetector, predictiveWarnings, sovereigntyReport, reachOutScaffold, aweNudge | Patterns, Drift, forecasts |
| **Gauge events** | systemicDrift (GaugeEvent[], 30 days) | systemicDrift.analyzeDriftPatterns() — **separate from crisisPipeline** | Drift modal (different “drift”) |
| **Connection / Signals** | lightsStore (lastContactByMemberId, momentumByMemberId) | insightEngine (daysSinceConnection), getRelationshipInsight, patternDetection (connection_gaps) | Home relationship card, cause insights |
| **Health / wearables** | healthStore (HealthKit), Oura (cached), aggregatedHealth | cockpitAI (HealthContext: sleep, steps, HRV, readiness, etc.) | Cross-system insight only |
| **Weather** | weatherStore | cockpitAI (WeatherContext) | Cross-system insight |
| **Spotify** | spotifyStore | cockpitAI (SpotifyContext) | Cross-system insight |
| **Environment / time** | environment service | cockpitAI (time, moon, season) | Cross-system insight |
| **Goals / wins** | goalsStore, winStore | insightEngine (winsThisWeek for growth), goals reflection **not** fed to insights | Growth insights; reflection data underused |
| **Values** | userStore.values | driftDetector (value alignment reflection) | Drift detector modal |
| **Conversation / journal** | conversationStore, journalStore | personalization (daily content context); insightsStore engagement streak | Daily insight text, streak |

### Pipeline summary

- **Cockpit insight:** Gauges + health (HealthKit + Oura) + Spotify + weather + environment → cockpitAI → one sentence → Home “Psych says” / summary line.
- **Unified engine:** Gauges, trends, checkInDates, rituals, sleepByDay, daysSinceConnection, winsThisWeek → patternDetection + generateCause/Timing/Growth/Meaning → PostCheckIn + WeeklyInsightCard.
- **Contextual cards:** Current gauge values → insightService (score + 7-day no-repeat) → DailyInsight (home), gauge detail.
- **Patterns modal:** getGaugeHistory() → patternEngine (narrative patterns) + drift (useDriftPatterns from driftDetector) + PurposeThroughPattern.
- **Drift detector:** getGaugeHistory() + value reflections → driftDetector patterns/correlations → Drift modal.
- **Weekly summary:** mood history + lessons + conversations → insightsStore.getWeeklySummary() → Home.

### Gaps / duplication

- **Two gauge histories:** crisisPipeline (GaugeSnapshot, 7d) and systemicDrift (GaugeEvent, 30d). Different shapes and consumers; no single “gauge history” authority.
- **Goals reflection data** is stored but not used to generate insights or feed any engine.
- **Lights Insights** screen is minimal (counts only); no narrative or pattern insights from Signals/Constellation.
- **Weekly summary** is numeric + one line only; no 3–5 deeper weekly insights as in the behavioral spec.

---

## STEP 3 — Insights vs Six Gauges (Human OS)

| Gauge | Awareness (current state) | Pattern (over time) | Cause | Prediction | Action | Where today |
|-------|----------------------------|---------------------|-------|------------|--------|-------------|
| **Body** | cockpitAI, daily content | patternEngine (Body→State), insightEngine (sleep–Body cause), patternDetection (sleep_state) | Cause (sleep/Body), insightCards | — | insightCards, hardcoded cockpit | Cross-system, cause, cards, system insight of day |
| **State** | cockpitAI, daily | patternDetection (day_of_week, sequence, trend_momentum), patternEngine, systemicDrift | Cause (stress/sleep), insightCards | predictiveWarnings | Cards, cockpit fallback | Strong: patterns, cause, timing |
| **Emotion** | cockpitAI | patternEngine (State–Emotion), connection_gaps → emotion | Cause (connection/emotion), insightCards | — | Cards | Good cause/pattern; no dedicated prediction/action layer |
| **Connection** | getRelationshipInsight | connection_gaps, patternEngine (connection sustained) | Cause (connection gap → emotion) | — | Reach out, cards | Good; Signals data could strengthen |
| **Direction** | cockpitAI, system insight of day | patternEngine (Direction–Alignment, trend), insightEngine (growth wins) | insightCards, discoveryAI (direction synthesis) | — | Cards, PurposeThroughPattern | Patterns + growth; goals reflection not wired |
| **Alignment** | cockpitAI, system insight of day | patternEngine (Direction–Alignment), driftDetector (value alignment) | Drift detector, insightCards | — | Drift modal, cards | Value reflection + patterns; no prediction |

**Summary**

- **Body, State, Emotion:** Well covered by cross-system + cause + pattern + cards; prediction/action are mostly generic (cards) or single fallback sentences.
- **Connection:** Good cause/pattern; relationship insight is simple (inner circle / need attention). Signals momentum/Constellation not used for narrative insights.
- **Direction:** Good pattern/growth; goals reflection and “direction clarity” over time not yet feeding insights.
- **Alignment:** Strong in drift detector and pattern engine; no prediction/action beyond “consider what’s changed.”

No gauge has a **full, explicit** Awareness → Pattern → Cause → Prediction → Action ladder; the pieces exist but are not labeled or sequenced that way.

---

## STEP 4 — Insight Quality

### What works

1. **Data-grounded where used:** Pattern engine and drift detector require 7+ days; language uses “tends to,” “in your data.”
2. **Conservative language:** cockpitAI and patternEngine avoid claiming certainty.
3. **Relevance:** Contextual cards and Unified Engine use gauge values and context (e.g. low Body → sleep cause).
4. **Actionable reframes:** insightCards and Meaning insights give “what this might mean” and next steps; tools (Breathing, Reach Out, etc.) are linked.
5. **Single daily cross-system insight:** Prevents overload on Home.
6. **7-day no-repeat** on insight cards avoids repetition.

### Problems

1. **Generic advice:** getSystemInsightOfTheDay is deterministic (day-seeded); cause/chain/action arrays are static. Not truly personalized to today’s data.
2. **Weak correlations:** Some cause insights fire with minimal data (e.g. 3 nights sleep); confidence could be gated by sample size.
3. **Unused signals:** Goals reflection, wins detail, relationship seasons/momentum, calendar/meeting load (placeholder), weather/music only in cockpit (not in pattern/cause).
4. **Redundancy:** Two “system” insights on Home: crossSystemInsight (AI) and systemInsightOfTheDay (static). Plus psychSays/daily insight. Can feel like several similar lines.
5. **Volume vs limits:** Unified Engine can return 3 (home) or 4 (gauge) insights; no explicit “1–2 daily” rule. Weekly summary is one line, not 3–5 deeper insights.
6. **Gauge coverage:** Alignment and Direction have fewer narrative insights outside Drift and pattern engine; Connection could use more Signals-derived insight.
7. **Two drift systems:** “Systemic drift” (systemicDrift.ts, GaugeEvent) vs “Drift detector” (value alignment, GaugeSnapshot). Names and entry points can confuse.

---

## STEP 5 — Unused / Underused Data

| Data | Collected / available | Used in insights? | Opportunity |
|------|------------------------|-------------------|-------------|
| Sleep (hours, quality) | sleepStore, HealthKit, Oura | Yes (cause, drift) | Use in prediction (“if sleep stays low…”) and action (“earlier bedtime tonight”). |
| HRV / readiness | HealthKit, Oura, aggregatedHealth | cockpitAI only | State/body cause and pattern (“low HRV tends to match low State”). |
| Resting HR | HealthKit, Oura | cockpitAI only | Same as HRV. |
| Activity / steps | HealthKit, Oura | cockpitAI only | Body pattern and action (“on days you move more, Body tends to be higher”). |
| Goals reflection (what helped / got in the way) | goalsStore | No | Direction/Alignment cause and pattern; “when you do X, direction tends to improve.” |
| Wins (with detail) | winStore | winsThisWeek count only | Direction growth narrative and action. |
| Relationship momentum / seasons | lightsStore (momentumScore, season) | getRelationshipInsight (binary) | Connection pattern and prediction (“momentum with X has been cooling”). |
| Check-in history (which gauges, when) | crisisPipeline, moodHistory | Yes | Already used; could add “streak of low State” type insights. |
| Weather | weatherStore | cockpitAI only | Pattern: “on overcast days your State tends to…” (with enough data). |
| Time / day / routine | environment, patternDetection | cockpitAI, day_of_week | Already used. |
| Meeting/calendar load | patternDetection (meetingCountByDate) | Placeholder only | State cause/pattern when wired. |
| Relate insights (per person) | light.relateInsights | Shown on person only | Could feed “relationship insights” summary or Connection narrative. |

---

## STEP 6 — Insight Delivery (UI)

| Location | What’s shown | Contextual? | Timely? | Understandable? | Non-intrusive? |
|----------|--------------|-------------|---------|-----------------|----------------|
| **Home — Psych says / Cockpit** | crossSystemInsight or daily insight or getPsychSays | Yes (gauges + health + context) | Yes (after check-in, 3+ gauges) | Yes (short) | Yes (one line) |
| **Home — System insight of the day** | getSystemInsightOfTheDay (cause/chain/action) | Partial (gauges only) | Yes | Yes | Yes |
| **Home — Relationship** | getRelationshipInsight | Yes (lights, need attention) | Yes | Yes | Yes |
| **Home — Weekly summary** | getWeeklySummary().line + mood/lessons/conversations | Yes | Sundays | Yes | Yes |
| **Home — DailyInsight** | 1–2 insight cards (insightCards) | Yes (gauge score, 7-day no-repeat) | Daily | Yes | Yes |
| **Home — WeeklyInsightCard** | Unified Engine (What we’re seeing) | Yes (withHistory) | When data exists | Yes | Yes (3 max) |
| **Post check-in** | 1 generated insight (Unified) | Yes (postCheckIn context) | Right after check-in | Yes | Yes |
| **Signals** | Relationship prompt, Lights Insights entry | Yes | Yes | Minimal (Lights = counts) | Yes |
| **Goals** | ReviewReflectModal (no insight back) | N/A | Weekly | Yes | N/A (data not fed to insights) |
| **Learn** | crossSystemInsight + getInsightsForGauge (academic) | Gauge-scoped | Yes | Yes | Yes |
| **Me → Patterns** | patternEngine + drift + PurposeThroughPattern | Yes (history) | When enough data | Moderate (data-heavy) | Yes |
| **Drift detector** | Value alignment + correlations | Yes (values + gauge history) | Weekly | Yes | Yes |
| **Manual / Discoveries** | Static cards | By topic | Anytime | Yes | Yes |
| **Lights Insights** | Flickering/cool counts | Low | Yes | Yes | Yes (minimal) |

Delivery is generally contextual, timely, and non-intrusive. Main gaps: no weekly “3–5 deeper insights” block, goals reflection doesn’t feed any insight, Lights Insights is underdeveloped.

---

## STEP 7 — Improvement Plan (No Implementation Yet)

### 1. What already exists

- **Cockpit AI:** One cross-system insight (gauges + health + Spotify + weather + environment); fallback rules; aggregated HealthKit + Oura.
- **Unified Insight Engine:** 5 types (Pattern, Cause, Timing, Growth, Meaning); patternDetection; useGeneratedInsights for home and post-check-in.
- **Contextual cards:** 50+ cards, 7-day no-repeat, gauge-scored selection for home and gauge detail.
- **Pattern engine:** Narrative patterns (Body–State, State–Emotion, Direction–Alignment, etc.); Patterns modal.
- **Drift detector:** Value alignment, weekly reflection, gauge/sleep correlations.
- **Systemic drift:** Separate GaugeEvent-based analysis (weekly/time/gradual).
- **Weekly summary:** One line + mood/lessons/conversations (Sundays).
- **Daily content:** AI-generated daily insight (fallback for psychSays).
- **Relationship insight:** Simple binary message from Signals; Lights Insights placeholder.
- **Share Insight / academic sources:** getInsightsForGauge for Learn; share content from manual/discoveries.

### 2. What’s working well

- Single cross-system insight and one “system insight” line avoid clutter.
- Pattern and cause logic are data-grounded and use cautious language.
- Insight cards are actionable and gauge-mapped.
- Post-check-in and WeeklyInsightCard use the same engine; 7-day no-repeat avoids repetition.
- Health, Spotify, weather, and time are integrated into the cockpit insight.

### 3. What to improve

- **Unify “insight types” with behavior ladder:** Tag or route existing insights (and new ones) into Awareness / Pattern / Cause / Prediction / Action so the product can prioritize (e.g. 1–2 daily, 3–5 weekly) and avoid redundancy.
- **One gauge history authority:** Prefer crisisPipeline (or a single abstraction) for “gauge history” and have systemicDrift consume the same or a clear derivative so there’s one story for “what we know about gauge over time.”
- **Reduce redundancy on Home:** Clarify roles of crossSystemInsight vs systemInsightOfTheDay vs dailyContent.insight; consider one primary “daily insight” and one “system connection” line.
- **Wire goals and wins into insights:** Feed goals reflection and win detail into Direction/Alignment cause and growth insights.
- **Use wearable data beyond cockpit:** Use sleep/HRV/readiness/activity in pattern and cause (e.g. “low sleep may be contributing…”) with conservative language.
- **Lights Insights:** Add at least one narrative (e.g. “X relationship(s) could use attention”) or pattern from momentum/season.
- **Weekly “deeper” insights:** Use existing engines to produce 3–5 weekly insights (pattern/cause/action) and show in Me or a dedicated weekly block; keep daily to 1–2.

### 4. New insight types to consider

- **Awareness:** Explicit “right now” state (e.g. “Your nervous system appears more stressed than usual today”) using State + health; keep short.
- **Prediction:** “If sleep stays below 6h tonight, energy may be lower tomorrow” (Body/State); gate on data and confidence.
- **Action:** Short, one-step suggestions tied to lowest gauge or context (e.g. “A short walk may help regulate your nervous system today”); could extend cockpit fallback or Meaning/insightCards.

### 5. Underutilized data (priority)

1. Goals reflection → Direction/Alignment insights.  
2. Sleep/HRV/activity in pattern and cause (not only cockpit).  
3. Relationship momentum/seasons → Connection narrative.  
4. Wins detail → Direction growth and action.

### 6. Architectural improvements

- **Single gauge history API:** One function or store that returns “gauge history for insights” (e.g. last 14–30 days), used by patternEngine, driftDetector, insightEngine, and (if needed) systemicDrift.
- **Insight “kind” and “ladder” in types:** Add optional `behaviorKind?: 'awareness' | 'pattern' | 'cause' | 'prediction' | 'action'` and `gauge` to GeneratedInsight (or equivalent) so UI and limits can be consistent.
- **Configurable limits:** e.g. max 1–2 daily insights, 3–5 weekly; apply in engine or at display.
- **Naming:** Clarify “Systemic Drift” (gauge pattern over time) vs “Drift Detector” (value alignment) in UI and docs to avoid confusion.

---

## Summary Table: Insight Systems at a Glance

| System | Inputs | Output | UI |
|--------|--------|--------|-----|
| cockpitAI | Gauges, health, Spotify, weather, time | One cross-system insight | Home (Psych says) |
| insightEngine | Gauges, trends, rituals, sleep, connection, wins, check-ins | Pattern, Cause, Timing, Growth, Meaning | PostCheckIn, WeeklyInsightCard |
| patternDetection | Pre/post flight, checkInDates, recentGaugeByDay, daysSinceConnection | day_of_week, sleep_state, connection_gaps, sequence, trend_momentum | Via insightEngine |
| patternEngine | getGaugeHistory() | NarrativePattern, DirectionInsights | Patterns modal |
| driftDetector | getGaugeHistory(), value reflections | DriftPattern, DriftInsight | Drift modal |
| systemicDrift | GaugeEvent[] (own record) | DriftPattern (weekly, time, gradual) | — (refreshDriftCache; cockpit persist) |
| insightService | Gauge values, 7-day history | 1–2 InsightCards (home), 2–3 (gauge) | DailyInsight, gauge detail |
| insightsStore | moodHistory, conversations, lessons | getPsychSays, getWeeklySummary, getWeeklyMoodTrend | Home |
| personalization | User context | dailyContent.insight | Home (fallback) |
| getSystemInsightOfTheDay | Current gauges | One cause/chain/action line | Home |
| getRelationshipInsight | lights, needAttentionCount | One line | Home, CockpitSignalsPreview |

---

**Next step (when implementing):** Prioritize the single highest-impact improvement (recommendation: **wire goals reflection + wearable data into cause/pattern and add the 1–2 daily / 3–5 weekly limits with optional behavior ladder tagging**), then iterate.

---

## Polish pass (ranking, dedupe, metadata, weekly quality)

**Done after the upgrade above.**

### Ranking

- **rankScore()** combines: supporting signals (sourceTypes count + confidence), low-gauge relevance (primary gauge &lt; 50), actionability (cause/action/growth), pattern strength (pattern type). Weekly context adds a bonus for pattern and growth so “what we learned this week” outranks one-off cause lines.
- After **theme deduplication**, insights are sorted by this score before applying the cap.

### Theme deduplication

- **InsightTheme**: `sleep_recovery` | `direction_friction` | `connection_support` | `energy_regulation` | `body_basics` | `emotional_support` | `general`.
- Each candidate insight is assigned a theme from its factor, kind, and gauges. **dedupeByTheme()** keeps the single highest-ranked insight per theme, then the list is re-sorted by rank. So in a given batch you get at most one sleep/recovery-style insight, one direction-friction insight, one connection insight, etc.

### Metadata

- Every generated insight is **enriched** with: **primaryGauge**, **secondaryGauge** (optional), **insightType** (awareness | pattern | cause | prediction | action | growth), **sourceTypes** (self-report, health, oura, goals, wins, signals, context), **theme**.
- Used for ranking, dedupe, and future UI/analytics (gauge targeting, source attribution).

### Phrasing variety

- Health-cause insights (sleep, recovery, HRV) have **2 title/body variants** each; the variant is chosen by a day-based seed so the same user sees different wording on different days and repetition is reduced.

### Weekly vs daily

- **Daily (home/postCheckIn):** Same pipeline; cap 2; theme dedupe + rank. No special prioritization.
- **Weekly:** Same pipeline; cap 5; **rankScore()** adds a fixed bonus for insightType `pattern` and `growth`, so repeated patterns, trends, and “what helped / what got in the way” outrank one-off cause statements. Weekly feels like “what we learned this week” rather than “five daily-style lines.”

### Caps (unchanged)

- Daily (home, postCheckIn): 2. Weekly: 5. Gauge detail: 4.
