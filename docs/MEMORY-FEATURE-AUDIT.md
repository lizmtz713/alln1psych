# Full Audit — MEMORY.md (Previously Built Features)

**Date:** March 3, 2026  
**Scope:** All features from MEMORY.md — existence (files/dirs), navigation access, broken imports/missing components. Fixes applied where possible.

---

## Cockpit / Home

| Feature | Exists? | Accessible? | Notes |
|--------|---------|--------------|--------|
| **Cockpit hex layout with 6 gauges** | ✅ | ✅ | `src/components/CockpitCluster.tsx` — hex layout, 6 gauges. Rendered on Home `app/(tabs)/index.tsx` (~line 579). |
| **PayAttentionAlert (Oura-style)** | ✅ | ✅ | Inside `CockpitCluster.tsx` (~line 173, 294) — shows when any gauge is low. |
| **System Score in center** | ✅ | ✅ | `CockpitCluster` shows center score; `CockpitHome.tsx` has "System Score" label. Home uses `CockpitCluster` with overall score. |
| **Home header with time-aware greeting** | ✅ | ✅ | `src/components/HomeHeader.tsx` — "Hey, {userName}". Time-aware greeting in `index.tsx` via `getDynamicGreeting`, `timeGreetings` (morning/afternoon/evening/night). |

**Broken imports:** None found.

---

## Rituals

| Feature | Exists? | Accessible? | Notes |
|--------|---------|--------------|--------|
| **Pre-Flight (morning)** | ✅ | ✅ | `app/rituals/pre-flight.tsx`. Home header ☀️/🌙 → `/rituals/pre-flight` (day) or `/rituals/post-flight` (night). Body gauge detail links "Log sleep in Pre-Flight". |
| **Post-Flight (evening)** | ✅ | ✅ | `app/rituals/post-flight.tsx`. Home header (night) → `/rituals/post-flight`. |
| **Check-in flow (6 gauges)** | ✅ | ✅ | `app/(modals)/cockpit-checkin.tsx` — 6-step flow. Home "Tap to check in" → `/(modals)/cockpit-checkin`. |

**Root layout:** `Stack.Screen name="rituals"` added so `/rituals/*` is a root-level stack.

---

## AI / CoPilot

| Feature | Exists? | Accessible? | Notes |
|--------|---------|--------------|--------|
| **Talk tab / CoPilot chat** | ✅ | ✅ | `app/(tabs)/talk.tsx` — InGauge tab. |
| **Age-adaptive prompts** | ✅ | ✅ | `src/services/ageAdaptive.ts`, `buildAgeAdaptivePrompt()` used in `adaptiveContext.ts`. |
| **Crisis detection** | ✅ | ✅ | Crisis pipeline, keywords, 988/Crisis Text Line. Referenced in Talk, emergency, mind mail. |
| **Context injection (gauges, profile, etc.)** | ✅ | ✅ | `src/services/adaptiveContext.ts` — `buildAdaptiveContext()` includes gauges, profile (identity, values, sensitive topics), love language, learning style, etc. |

---

## Toolkit (7+ AI Tools)

| Feature | Exists? | Accessible? | Notes |
|--------|---------|-------------|--------|
| **Relate** | ✅ | ✅ | `app/(modals)/relate.tsx`. Layout registered. Home Toolkit + Learn. |
| **Replay** | ✅ | ✅ | `app/(modals)/replay.tsx`. Layout registered. Home Toolkit. |
| **Role Play** | ✅ | ✅ | `app/(modals)/role-play.tsx`. Layout registered. Home Toolkit. |
| **Journal** | ✅ | ✅ | `app/(modals)/new-journal.tsx`. Layout registered. Home Toolkit, Learn. |
| **Help Someone** | ✅ | ✅ | `app/(modals)/help-someone.tsx`. Layout registered. Home Toolkit. |
| **Decode** | ✅ | ✅ | `app/(modals)/decode.tsx`. Layout registered. Home Toolkit. |
| **Love tool** | ✅ | ✅ | `app/(modals)/love.tsx`. Layout registered. Home Toolkit. |
| **Resolve** | ✅ | ✅ | `app/(modals)/resolve.tsx`. Layout registered. Home Toolkit. |
| **Referee** | ✅ | ✅ | `app/(modals)/referee.tsx`. Layout registered. Home Toolkit. |

All 9 tools are in `(modals)/_layout.tsx` and in Home `ALL_TOOLS` (horizontal scroll).

---

## Lights / Relationships

| Feature | Exists? | Accessible? | Notes |
|--------|---------|-------------|--------|
| **Lights list with Dunbar tiers** | ✅ | ✅ | `app/(tabs)/lights.tsx` — Your 5/15/50/150, tier health. |
| **Light profiles (add, edit, detail)** | ✅ | ✅ | `app/lights/add.tsx`, `app/lights/[id].tsx`, edit from detail. |
| **Connection logs** | ✅ | ✅ | `app/lights/log-entry.tsx`, log contact from light detail. |
| **Temperature tracking** | ✅ | ✅ | Circle/Lights store; temperature on cards. |
| **Family dashboard** | ✅ | ✅ | `app/lights/family/index.tsx`, create, [familyId], coordinate, patterns, settings. |
| **Mind Mail / Heart Mail** | ✅ | ✅ | Circle tab = Mind Mail; `/(modals)/heart-inbox`, `/mind-mail/compose`, etc. |
| **Heart Inbox** | ✅ | ✅ | `app/(modals)/heart-inbox.tsx`. Circle tab → "Heart Inbox". |
| **World Temperature** | ✅ | ✅ **Fixed** | `app/lights/world.tsx`. **Was:** No nav from Lights tab. **Fix:** Added "World Temperature" card on Lights screen → `/lights/world`. |

**Root layout:** `Stack.Screen name="lights"` added so `/lights/*` is root-level.

---

## Learn

| Feature | Exists? | Accessible? | Notes |
|--------|---------|-------------|--------|
| **Human Manual (lessons)** | ✅ | ✅ | Learn tab — "The Human Manual" + categories → `app/lesson/[id].tsx`. |
| **101 Discoveries** | ✅ | ✅ | `src/data/discoveries101.ts`, `getDiscoveriesForDay()` in `discoveries.ts`. Home discovery card; Learn discoveries. |
| **Contextual lessons** | ✅ | ✅ | Just-in-time lessons, gauge-triggered suggestions, manual categories. |

---

## Profile

| Feature | Exists? | Accessible? | Notes |
|--------|---------|-------------|--------|
| **Human Control Panel (all sections)** | ✅ | ✅ | Me → "Human Control Panel" → `/profile`. Identity, How You Connect, What Gives Life, Sensitive Topics, In Your Own Words, Your Gauges, Goals, Preferences. |
| **Foundation screens (6 modals)** | ✅ | ✅ | `foundation-values`, `foundation-directions`, `foundation-people`, `foundation-body`, `foundation-state`, `foundation-emotion` in `(modals)/_layout.tsx`. Settings links to foundation-body/state/emotion; Home Toolkit has Body → foundation-body. |
| **Settings** | ✅ | ✅ | `app/(modals)/settings.tsx`. Me → Settings. |
| **Therapist Share** | ✅ | ✅ | `app/(modals)/therapist-share.tsx`, `therapist-share-create.tsx`. Me → Sharing & Reports → "Therapist Share". |

---

## Other

| Feature | Exists? | Accessible? | Notes |
|--------|---------|-------------|--------|
| **Emergency flow / Beacon** | ✅ | ✅ | `app/emergency/index.tsx` — "You pressed the beacon." Home header 🚨 → `/emergency`. Crisis, Breathe, Quick Reset, Reach out. |
| **Cycle Intelligence** | ✅ | ✅ | `app/(modals)/cycle.tsx`. Me → My Progress → "Cycle Intelligence". |
| **Prompt Generator** | ✅ | ✅ | `app/(modals)/prompt-generator.tsx`. Learn, Home Toolkit ("Prompts"), Talk tab link. |
| **World Temperature** | ✅ | ✅ | See Lights section — fixed with nav from Lights screen. |
| **Body Maintenance Tracker** | ✅ | ✅ | `app/body-maintenance/` (index, add-routine, add-provider, [routineId], providers/[id]). Profile → Body gauge → "Body Maintenance" links → `/body-maintenance`. **Root:** `Stack.Screen name="body-maintenance"` added. |
| **News My Way** | ✅ | ✅ | `app/news-my-way/index.tsx`, `settings.tsx`. Home Toolkit → "News My Way" → `/news-my-way`. **Root:** `Stack.Screen name="news-my-way"` added. |

---

## Root Layout Fixes Applied

The root `app/_layout.tsx` Stack did not register several top-level route groups, which can cause navigation to those routes (e.g. from Home or Profile) to fail or behave inconsistently. Added:

- `Stack.Screen name="body-maintenance"`  
- `Stack.Screen name="news-my-way"`  
- `Stack.Screen name="emergency"`  
- `Stack.Screen name="rituals"`  
- `Stack.Screen name="mind-mail"`  
- `Stack.Screen name="lights"`  
- `Stack.Screen name="flight-log"`  
- `Stack.Screen name="wrapped"` (kept; was already present)

---

## Summary

- **All MEMORY.md features exist** in the codebase (files/dirs present).
- **All are accessible** from navigation (tabs, modals, profile, home toolkit, or Me).
- **Fixes applied:**
  1. **World Temperature** — Added "World Temperature" card on Lights tab → `/lights/world`.
  2. **Root layout** — Registered `body-maintenance`, `news-my-way`, `emergency`, `rituals`, `mind-mail`, `lights`, `flight-log`, `wrapped` so deep links and programmatic navigation to these stacks work reliably.

**Broken imports / missing components:** Spot-check of modals and key screens found no broken imports. If you see runtime errors on a specific screen, share the file and error and we can target that next.
