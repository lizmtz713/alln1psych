# QA checklist by domain

Use this for manual QA of each major product domain. For each area: **opens**, **loads**, **navigates**, **saves**, **returns**, **disclaimer**, **permissions**.

---

## Cockpit (Home)

| # | Check | Pass |
|---|--------|------|
| 1 | Screen opens from tab; no crash. | ☐ |
| 2 | Gauges and center “YOU” score render. | ☐ |
| 3 | Rituals (left) opens correct flow for time of day (Pre-Flight / Reset / Post-Flight / Wind Down). | ☐ |
| 4 | Support (right) opens Emergency (breathe, reach out, crisis). | ☐ |
| 5 | Center tap opens check-in or gauge detail as designed. | ☐ |
| 6 | Forecast/tomorrow card and status header load. | ☐ |
| 7 | Bottom row: Talk, Reflect, History open correct screens. | ☐ |
| 8 | No dead buttons; back/dismiss returns to Cockpit. | ☐ |

---

## Signals

| # | Check | Pass |
|---|--------|------|
| 1 | Signals tab opens; no crash. | ☐ |
| 2 | List/cards load (drift, birthdays, predictions if any). | ☐ |
| 3 | Tapping a signal navigates to People or check-in where expected. | ☐ |
| 4 | Pattern/insight disclaimer shown where required. | ☐ |
| 5 | Back returns to Signals or previous screen. | ☐ |

---

## People (Lights / Circle)

| # | Check | Pass |
|---|--------|------|
| 1 | People tab opens; no crash. | ☐ |
| 2 | Lights / tiers / list load. | ☐ |
| 3 | Add person opens add flow; contact permission only when adding. | ☐ |
| 4 | Tapping a person opens detail; edit works. | ☐ |
| 5 | Mind Mail / Circle: inbox, compose, send (or save draft). | ☐ |
| 6 | Radar, map, or other sub-views open and return. | ☐ |
| 7 | Back/dismiss returns correctly. | ☐ |

---

## Tools

| # | Check | Pass |
|---|--------|------|
| 1 | Tools tab opens; grid or list loads. | ☐ |
| 2 | Decode, Resolve, Role-play, Replay, Relate open correct modal/screen. | ☐ |
| 3 | Quick Reset, Focus, Decision, Perspective Translator open and run. | ☐ |
| 4 | Simulation/tool disclaimers show where required. | ☐ |
| 5 | Microphone requested only when starting voice in a tool. | ☐ |
| 6 | Completing a tool saves or debriefs; no crash on submit. | ☐ |
| 7 | Back from tool returns to Tools or previous screen. | ☐ |

---

## Manual (Learn)

| # | Check | Pass |
|---|--------|------|
| 1 | Manual / Learn tab opens; no crash. | ☐ |
| 2 | Manual TOC, lessons, 12 Questions, skills load. | ☐ |
| 3 | Lesson opens (e.g. `/lesson/[id]`); content and reflect step work. | ☐ |
| 4 | Educational disclaimer present where required. | ☐ |
| 5 | Life literacy, relationship toolkit, self-discovery (if present) open and return. | ☐ |
| 6 | Back returns to Manual or previous screen. | ☐ |

---

## Me (Profile / identity)

| # | Check | Pass |
|---|--------|------|
| 1 | Me tab opens; no crash. | ☐ |
| 2 | Profile, insights, goals, preferences load. | ☐ |
| 3 | Settings opens; toggles and links work. | ☐ |
| 4 | Export data / delete account (if present) open correct flow. | ☐ |
| 5 | Legal links (Terms, Privacy) open or show content. | ☐ |
| 6 | Notifications permission only when enabling in settings. | ☐ |
| 7 | Back/dismiss returns correctly. | ☐ |

---

## Insights (Patterns, Timeline, Wrapped, etc.)

| # | Check | Pass |
|---|--------|------|
| 1 | Patterns (or insights entry) opens; no crash. | ☐ |
| 2 | Pattern disclaimer (reflective, not diagnostic) shown. | ☐ |
| 3 | Timeline, Flight Log, Wrapped (if present) load. | ☐ |
| 4 | Weekly insight, therapist share, share snapshot open and behave. | ☐ |
| 5 | Back returns to previous screen. | ☐ |

---

## Body (Body Maintenance, Health)

| # | Check | Pass |
|---|--------|------|
| 1 | Body maintenance / body stack opens; no crash. | ☐ |
| 2 | Routines, providers, schedule load and save. | ☐ |
| 3 | Health connections (Apple Health, Oura) only when user taps connect. | ☐ |
| 4 | Educational / not medical disclaimer where required. | ☐ |
| 5 | Notifications for reminders only when user enables. | ☐ |
| 6 | Back returns correctly. | ☐ |

---

## Emergency (Support / Crisis)

| # | Check | Pass |
|---|--------|------|
| 1 | Emergency / Support entry opens (from Cockpit or elsewhere). | ☐ |
| 2 | Breathe, reach out, crisis resources all reachable. | ☐ |
| 3 | Crisis shows 988, 741741, 911; not in-app crisis intervention disclaimer. | ☐ |
| 4 | No crash; back returns safely. | ☐ |

---

## Rituals (Pre-Flight, Post-Flight, Wind Down)

| # | Check | Pass |
|---|--------|------|
| 1 | Pre-Flight opens from Cockpit or Flight Log; steps complete. | ☐ |
| 2 | Post-Flight opens; debrief and save work. | ☐ |
| 3 | Gratitude review (if present) opens and saves. | ☐ |
| 4 | Wind Down from Cockpit (night) opens correct activity. | ☐ |
| 5 | Back returns to Cockpit or Flight Log. | ☐ |

---

## Cross-cutting

| # | Check | Pass |
|---|--------|------|
| 1 | Ask Gauge (FAB or entry) opens from multiple screens; prompt sends. | ☐ |
| 2 | Talk opens; voice and text work; AI responds or error. | ☐ |
| 3 | No permission requested on screens that don’t use it. | ☐ |
| 4 | All primary CTAs do something (navigate or action). | ☐ |
| 5 | No modal loop (dismiss → unexpected re-open). | ☐ |

---

Reference: [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) (AI/voice/disclaimer per route), [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) (pre-ship list).
