# Adaptive Onboarding — Spec

**Issue:** Cognitive load. New users see too much; power users want depth.

## 1. 3-screen onboarding

- **Screen 1 — Welcome:** Brand, tagline ("You Are Not Alone"), one CTA to continue.
- **Screen 2 — Cockpit:** Introduce the 6 gauges (Body, State, Emotion, Connection, Direction, Alignment). "This is your human cockpit."
- **Screen 3 — First check-in:** One gentle check-in (e.g. mood or single gauge). Completing this = onboarding done.

## 2. Adaptive home screen by experience level

- **New:** Minimal — greeting, single primary CTA (e.g. "Check in"), maybe one suggested activity. No cockpit hex until first check-in.
- **Learning:** Cockpit visible, 1–2 suggested tools, Life Wrapped / Forecast cards when relevant.
- **Engaged:** Full home: cockpit, suggestions, Weekly Insight, Life Wrapped, Forecast, tools grid.
- **Power:** Same as Engaged; optional "Focus Mode" for permanent simplicity.

Experience level derived from: onboarding completed, check-in count, days since install, feature usage.

## 3. Focus Mode (Settings)

- Toggle in Settings: "Focus Mode" or "Simple home".
- When on: home shows only greeting + primary check-in CTA (+ optional one suggestion). No full cockpit, no tools grid, no extra cards.
- Persisted (e.g. AsyncStorage or profile).

## 4. Feature invitations by milestones (not phases)

- Invite features when user hits **milestones**, e.g.:
  - First check-in → "You did your first check-in. Want to try a Pre-Flight tomorrow?"
  - 3 check-ins → "You're building a habit. Here's your cockpit."
  - First journal entry → "Journal is ready when you need it."
  - First connection log → "You logged a connection. See your Lights map?"
- No time-based "phase 2" gates; milestone-based only.

---

**Files to touch:** Onboarding flow, home (`app/(tabs)/index.tsx`), settings (Focus Mode), experience-level store or helper, milestone detection.
