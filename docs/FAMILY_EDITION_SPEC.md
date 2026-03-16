# InGauge: Family Edition (Fleet Management)
Domain: People / Signals / Emergency

## CONCEPT
The family is a "Fleet." Individual users are "Pilots" (Teens) or "Ground Control" (Parents). The goal is co-regulation via systemic telemetry.

## ARCHITECTURE INTEGRATION
- **Data Layer (Supabase):** - `fleet_groups`: Links users. 
    - `shared_telemetry`: Stores {user_id, gauge_type, status: 'green'|'amber'|'red', trend: 'up'|'down'}. 
    - *Crucial:* Raw values and check-in notes are private (Rule 10).
- **Navigation (Expo Router):**
    - `app/(tabs)/people/index.tsx` -> Entry to Family Fleet.
    - `app/emergency/lockdown.tsx` -> Triggered when two fleet members are RED.

## CORE FEATURES TO IMPLEMENT
1. **The Privacy Curtain:** Implementation: In the gauge cluster component (`src/components/CockpitCluster.tsx`), if `viewer !== owner` (Fleet Mode), blur raw numbers and only show the Status Color (Green/Amber/Red ring).
2. **Dual-Red Collision Avoidance (Signals Domain):**
   - Logic: If CurrentUser.State == RED && PeerUser.State == RED -> Block all communication tools and force `emergency/lockdown` view for 20 mins.
3. **Probabilistic Scripts (Tools Domain):**
   - Parents get "Quick-Deploy" buttons based on Teen's gauge status. 
   - Language: "Your system tends to..." or "5 out of 7 times..." (Avoid "You always").

## SCHOLARLY LOGIC (The "Why")
- **Biopsychology:** Prioritize Body/State (Tier 1) before Direction (Tier 3).
- **Social Psychology:** Use "Non-Invasive Standby" to reduce emotional contagion.
- **Developmental Psych:** Teens have a "Privacy Toggle" to control what Ground Control sees.

---

## RITUALS (rituals/)

### Pre-Flight Ritual (Stabilization)
**Goal:** Prevent collisions before the day starts. A 60-second morning check-in. Not "What are you doing today?" but "What is your engine's capacity?"

1. **Gauge Scan.** Everyone logs Body and State gauges.
2. **Fleet Forecast.** The app shows the parent: e.g. "The fleet is 66% Green. Pilot A is in Amber (Low State). Recommend 'Low-RPM' communication until after 4:00 PM."
3. **Intention.** Each member chooses a "Driving Style" for the day:
   - **Support Vehicle** — I have extra capacity to help.
   - **Solo Navigator** — I need space to focus.
   - **Maintenance Mode** — I am low on fuel; please don't push.

### Post-Flight Ritual (Repair)
**Goal:** Narrative-building and closing the loop (Rule 7: Narrative-First). Done at dinner or before bed.

- **Odometer Check:** "What was the smoothest part of the road today?"
- **Pothole Report:** "Did anyone's gauge hit Red? If so, did the system stabilize or stall?"
- **Mechanic's Thanks:** A quick prompt to thank another fleet member for a specific action.  
  Script: "I noticed your 'Connection' gauge was low and you gave me space. Thanks for checking the telemetry."

### Implementation in learn/
Deliver as **micro-lessons** in the learn/ stack. Data lives in `src/data/familyRitualsLessons.ts` (or `src/data/lessons.json`). Example lesson shape: `id`, `title`, `domain: "Learn"`, `content`, `action` (e.g. "Open Cockpit and sync gauges with Ground Control.").

---

## How to use this in Cursor (Your Guide)

### 1. Create the Spec
This file is the spec: `docs/FAMILY_EDITION_SPEC.md`. Keep it next to `docs/AI_CONTEXT.md` so Cursor has product + architecture context.

### 2. Ask the "Big Picture" Question
Highlight **both** `docs/FAMILY_EDITION_SPEC.md` and `docs/AI_CONTEXT.md`, then ask Cursor:

> I want to initialize the Family Edition. Based on these two docs, create a Supabase migration for the `fleet_groups` and `shared_telemetry` tables that enforces the Privacy Rule (Parents see status, not notes).

Cursor will have domain ownership, tech stack, and the spec’s data shape (e.g. `shared_telemetry`: user_id, gauge_type, status green/amber/red, trend; raw values and notes stay private).

### 3. Build the UI
After the DB migration is in place, ask:

> Now, update my `src/components/CockpitCluster.tsx` to handle "Fleet Mode." If it's in Fleet Mode, apply a blur filter to the raw numbers and only show the Green/Amber/Red ring. Also, add a tooltip or sub-text that uses probabilistic language (e.g., "System tends to be stable") instead of definitive scores.

**Pro-tip:** Cursor might try to add only a boolean prop. To make it truly world-changing, explicitly ask it to ensure **Probabilistic Language (Rule 9)** is used in the tooltips—e.g. "tends to…", "5 out of 7 times…"—so parents see supportive, non-definitive language, not raw scores.

This implements the Privacy Curtain: when the viewer is not the owner (e.g. a parent viewing a teen's cockpit), show only status color and probabilistic guidance, not raw gauge values or notes.