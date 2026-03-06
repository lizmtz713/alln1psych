# Feature Accessibility Audit

**Date:** March 3, 2026  
**Scope:** All “today’s builds” + existing features. For each: ✅ Built AND accessible, ⚠️ Built but NOT accessible, ❌ Not built. Fixes applied where needed.

---

## TODAY'S BUILDS

| # | Feature | Status | Where it lives | How to reach it |
|---|--------|--------|----------------|------------------|
| 1 | **Unified Insight Engine** | ✅ Built AND accessible | Home, Gauge detail, Post check-in | **Home:** `UnifiedInsightCard` (WeeklyInsightCard) on `app/(tabs)/index.tsx` (~line 573). **Gauge detail:** “From your data” block + `useGeneratedInsights` in `app/(modals)/gauge-detail.tsx`. **Post check-in:** `PostCheckInSuggestions` receives `postCheckInInsights` in `app/(modals)/cockpit-checkin.tsx`. |
| 2 | **Quick Reset** | ✅ Built AND accessible | Toolkit + Emergency | **Learn → Regulate:** Quick Reset → `/(modals)/quick-reset`. **Home Toolkit:** horizontal scroll includes Quick Reset → `/tools/quick-reset`. **Emergency:** card links to `/tools/quick-reset`. |
| 3 | **Win Capture** | ✅ Built AND accessible | Home, Post-Flight | **Home:** `WinButton` next to cockpit share (`app/(tabs)/index.tsx` ~613). **Post-Flight:** “Capture a win” button → `/tools/win-capture` (`app/rituals/post-flight.tsx`). |
| 4 | **12 Life Questions** | ✅ Built AND accessible | Learn, Profile | **Learn → Grow:** “12 Life Questions” → `/learn/questions`. **Journey Map:** from questions list (“View Life Journey Map”) → `/learn/questions/map`; also from Profile → Human Profile. |
| 5 | **16 Human Skills** | ✅ Built AND accessible | Learn | **Learn → Grow:** “16 Human Skills” → `/learn/skills`. Four domains in `src/data/humanSkills.ts`; list + detail at `/learn/skills` and `/learn/skills/[id]`. |
| 6 | **Focus Tool** | ✅ Built AND accessible | Learn, Toolkit | **Learn → Regulate:** Focus → `/tools/focus`. **Home Toolkit:** Focus in `ALL_TOOLS` horizontal scroll. |
| 7 | **Habit Tracker** | ✅ Built AND accessible | Home, Toolkit | **Home:** `HabitsWidget` (today’s habits + link to `/habits`). **Home Toolkit:** Habits in `ALL_TOOLS`. **Post-Flight:** link to `/habits`. |
| 8 | **Creativity Tool** | ✅ Built AND accessible | Learn, Toolkit | **Learn → Grow:** Creativity → `/tools/creativity`. **Home Toolkit:** Creativity in `ALL_TOOLS`. |
| 9 | **Decision Tool** | ✅ Built AND accessible | Learn, Toolkit | **Learn → Grow:** Decision → `/tools/decision`. **Home Toolkit:** Decision in `ALL_TOOLS`. |
| 10 | **Bias Detector** | ✅ Built AND accessible | Learn, Toolkit | **Learn → Understand:** Bias Check → `/tools/bias-check`. **Home Toolkit:** Bias Check in `ALL_TOOLS`. |
| 11 | **Gratitude** | ✅ Built AND accessible | Post-Flight, Pre-Flight, Learn | **Post-Flight:** “3 Good Things” section + gratitude streak; complete → Gratitude Review `/rituals/gratitude-review`. **Pre-Flight:** optional morning gratitude field. **Learn → Grow:** Gratitude → `/(modals)/activity?id=gratitude-jar`. |
| 12 | **Sleep Insights** | ✅ Built AND accessible | Pre-Flight, Body gauge | **Pre-Flight:** sleep quality (emoji/voice) + `addFromPreFlight` in `sleepStore`. **Body gauge detail:** “SLEEP & BODY” block + “Log sleep in Pre-Flight” link. |
| 13 | **Achievements** | ✅ Built AND accessible | Me, Profile | **Me → My Progress:** “Awards & Achievements” → `/profile/achievements`. Unlock modals via `AchievementModalHolder` in root layout. |

---

## EXISTING FEATURES

| # | Feature | Status | Where it lives | How to reach it |
|---|--------|--------|----------------|------------------|
| 14 | **Human Control Panel / Full Profile** | ✅ Built AND accessible | Profile hub | **Me:** “Human Control Panel” button → `/profile`. **Profile:** About You (Identity, How You Connect, What Gives Life, Sensitive Topics, In Your Own Words), Your Gauges, Goals, Preferences. |
| 15 | **Gauge Goals & Personalization** | ✅ Built AND accessible | Gauge detail, Profile gauges | **Gauge detail:** “Personalize this gauge” card → `/profile/gauges/[gaugeId]`. **Profile → Your Gauges:** each gauge (body, state, emotion, connection, direction, alignment) has goals, “what this means for me,” reminders. |
| 16 | **Datesume** | ✅ Built AND accessible | Love modal, Learn, Home | **Love modal:** “Datesume” card → `/love/datesume`. **Learn:** Datesume → `/love/datesume`. **Home Toolkit:** Datesume in `ALL_TOOLS`. |
| 17 | **Love History** | ✅ Built AND accessible | Love modal, Learn, Home | **Love modal:** “Love History” card → `/love-history`. **Learn:** Love History → `/love-history`. **Home Toolkit:** Love History in `ALL_TOOLS`. |
| 18 | **Mind Mail / Heart Notes** | ✅ Built AND accessible | Circle tab, modals | **Circle tab (Mind Mail):** “Heart Inbox” → `/(modals)/heart-inbox`. Compose via mind-mail flow. **Lights:** “Mind Mail” from light detail → `/mind-mail/compose`. **Heart Notes:** `/(modals)/heart-notes`. |
| 19 | **Lights / Circle system** | ✅ Built AND accessible | Lights tab | **Lights tab:** `app/(tabs)/lights.tsx` — tiers, add, map, per-person detail, log entry, family. Circle temperature/nudges on Circle (Mind Mail) tab. |
| 20 | **Human Manual** | ✅ Built AND accessible | Learn | **Learn:** “The Human Manual” + categories → `/lesson/[id]` for each lesson. 127+ lessons in `humanManualCategories`. |
| 21 | **Pre-Flight / Post-Flight** | ✅ Built AND accessible | Home header, Body gauge, Skills | **Home header:** ☀️/🌙 icon → morning `/rituals/pre-flight` or evening `/rituals/post-flight`. **Body gauge detail:** “Log sleep in Pre-Flight” → `/rituals/pre-flight`. **Learn → Skills:** Post-Flight Debrief link. **Flight Log:** Me → My Progress → “Flight Log” → `/flight-log`. |
| 22 | **Emergency flow / Beacon** | ✅ Built AND accessible | Home header | **Home header:** 🚨 → `/emergency`. Crisis lines, Breathe, Quick Reset, Reach out. |
| 23 | **CoPilot with full context** | ✅ Built AND accessible | Talk + adaptiveContext | **Talk tab:** CoPilot uses `buildAdaptiveContext()` from `src/services/adaptiveContext.ts`. Context includes identity (ethnicity, gender, orientation, disability), how they connect, what gives life, sensitive topics/triggers, plus existing name, pronouns, age, love language, learning style, therapy experience, gauge state. |
| 24 | **Life Wrapped** | ✅ Built AND accessible | Home, Wrapped screen | **Home:** `LifeWrappedPreview` (when `sections.showWrapped`) → `/wrapped`. Shows “Coming December” or “Your Life Wrapped is ready!” and progress. **Full screen:** `app/wrapped/index.tsx`. |

---

## FIXES APPLIED

1. **Flight Log** — Built but had no navigation from the app UI. **Fix:** Me → My Progress → new “Flight Log” (subtitle: “Pre-Flight & Post-Flight timeline”) → `/flight-log`.

No other “built but not accessible” issues were found in the 24 items. Human Control Panel and Gauge Personalization were already fixed in a previous session (Me → Human Control Panel; Gauge detail → “Personalize this gauge” → profile/gauges).

---

## NOTES

- **Toolkit** = Home horizontal scroll of tools (`ALL_TOOLS`). Visibility and count are controlled by `useAdaptiveHomeSections` (onboarding level / focus mode). All listed tools are in the list; users may need to scroll to see them.
- **Quick Reset** has two entry points: modal `/(modals)/quick-reset` (from Learn) and full stack `/tools/quick-reset` (from Home Toolkit and Emergency).
- **Mind Mail** is the Circle tab label; content is circle members + Heart Inbox. Full inbox/compose is also available via `/(modals)/heart-inbox` and `/mind-mail/*`.
