# Route Verification Report

**Date:** March 2025  
**Scope:** All routes from the InGauge feature inventory; screen existence, load behavior, and back navigation.

---

## Summary

| Category   | Listed | Exist | Notes |
|-----------|--------|-------|--------|
| TABS      | 5      | 5 ✅  | All present; no lint errors. |
| TOOLKIT   | 7      | 7 ✅  | **Paths differ:** tools live under `(modals)/`, not `toolkit/`. |
| LIGHTS    | 10     | 10 ✅ | All present; stack or manual back. |
| PROFILE   | 9      | 9 ✅  | All present; manual back (chevron). |
| NEW       | 11     | 11 ✅ | All present. |
| RITUALS   | 2      | 2 ✅  | Pre-flight, Post-flight. |
| EMERGENCY | 4      | 4 ✅  | All present. |
| MODALS    | 3      | 3 ✅  | Onboarding, Cockpit, Settings. |

**No screens crash from lint/import.** Back navigation was audited in `docs/NAVIGATION-AUDIT-BACK-REPORT.md`; fixes were applied where needed.

---

## 1. TABS

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Home | `app/(tabs)/index.tsx` | ✅ | Tab root; no back needed. |
| CoPilot | `app/(tabs)/talk.tsx` | ✅ | Tab root. |
| Lights | `app/(tabs)/lights.tsx` | ✅ | Tab root; stack screens have header back. |
| Explore | `app/(tabs)/learn.tsx` | ✅ | Tab root. |
| Me | `app/(tabs)/me.tsx` | ✅ | Tab root. |

**Lint:** No errors on these files.

---

## 2. TOOLKIT (AI tools)

The inventory lists **`app/toolkit/*`**. This app has **no `app/toolkit/`** folder. The 7 tools are **modals** under **`app/(modals)/`**:

| Tool       | Actual route / file | Exists | Back / Nav |
|------------|----------------------|--------|------------|
| Relate     | `(modals)/relate.tsx` | ✅ | ✅ arrow-back + gesture |
| Replay     | `(modals)/replay.tsx` | ✅ | ✅ arrow-back, close |
| Role Play  | `(modals)/role-play.tsx` | ✅ | ✅ arrow-back, close |
| Journal    | `(modals)/new-journal.tsx` | ✅ | ✅ arrow-back, cancel, done |
| Help       | `(modals)/help-someone.tsx` | ✅ | ✅ arrow-back, close |
| Decode     | `(modals)/decode.tsx` | ✅ | ✅ arrow-back |
| Love       | `(modals)/love.tsx` | ✅ | ✅ close / arrow-back (mode) |

**Access:** From **Learn → Tools** tab (or Home/discover), user taps a tool and is taken to the corresponding modal. No `/toolkit/relate` etc. routes exist.

**Lint:** No errors on these modal screens.

---

## 3. LIGHTS

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Light profile | `app/lights/[id].tsx` | ✅ | Stack header + inline “Back” in error state |
| Lessons list | `app/lights/lessons/index.tsx` | ✅ | Stack header |
| Lesson detail | `app/lights/lessons/[lessonId].tsx` | ✅ | Stack header |
| Your 5 | `app/lights/tiers/five.tsx` | ✅ | Stack header |
| Your 15 | `app/lights/tiers/fifteen.tsx` | ✅ | Stack header |
| Your 50 | `app/lights/tiers/fifty.tsx` | ✅ | Stack header |
| Your 150 | `app/lights/tiers/network.tsx` | ✅ | Stack header |
| Family hub | `app/lights/family/index.tsx` | ✅ | Stack header |
| Family dashboard | `app/lights/family/[familyId]/index.tsx` | ✅ | Stack header + “Back” in error state |
| Log entry | `app/lights/log-entry.tsx` | ✅ | Stack header + Cancel / Back |

All under `lights/_layout.tsx` with **headerShown: true** (or nested stack), so back is provided by the stack.

---

## 4. PROFILE

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Profile root | `app/profile/index.tsx` | ✅ | ✅ chevron-back |
| Body gauge | `app/profile/gauges/body.tsx` | ✅ | ✅ chevron-back |
| State gauge | `app/profile/gauges/state.tsx` | ✅ | ✅ chevron-back |
| Emotion gauge | `app/profile/gauges/emotion.tsx` | ✅ | ✅ chevron-back |
| Connection gauge | `app/profile/gauges/connection.tsx` | ✅ | ✅ chevron-back |
| Direction gauge | `app/profile/gauges/direction.tsx` | ✅ | ✅ chevron-back |
| Alignment gauge | `app/profile/gauges/alignment.tsx` | ✅ | ✅ chevron-back |
| Direction discovery | `app/profile/gauges/direction-discovery.tsx` | ✅ | ✅ “← Back” + intro back (fixed in audit) |
| Alignment discovery | `app/profile/gauges/alignment-discovery.tsx` | ✅ | ✅ “← Back” + intro back (fixed in audit) |

Profile uses **headerShown: false**; every screen has an explicit back (chevron or “← Back”).

---

## 5. NEW FEATURES

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| News My Way | `app/news-my-way/index.tsx` | ✅ | Stack + headerLeft back |
| News settings | `app/news-my-way/settings.tsx` | ✅ | Stack + headerLeft back |
| Love History | `app/love-history/index.tsx` | ✅ | Stack header |
| Love History add | `app/love-history/add.tsx` | ✅ | Stack header |
| Love History entry | `app/love-history/[id].tsx` | ✅ | Manual back (chevron) |
| Love History patterns | `app/love-history/patterns.tsx` | ✅ | Stack header |
| Love History insights | `app/love-history/insights.tsx` | ✅ | Stack header |
| Body Maintenance | `app/body-maintenance/index.tsx` | ✅ | Stack header |
| Add routine | `app/body-maintenance/add-routine.tsx` | ✅ | Stack header |
| Add provider | `app/body-maintenance/add-provider.tsx` | ✅ | Stack header |
| Mind Mail list | `app/mind-mail/index.tsx` | ✅ | chevron-back |
| Mind Mail detail | `app/mind-mail/[id].tsx` | ✅ | arrow-back |
| Mind Mail compose | `app/mind-mail/compose.tsx` | ✅ | close (modal) |

---

## 6. RITUALS

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Pre-Flight | `app/rituals/pre-flight.tsx` | ✅ | ✅ chevron-back (manual) |
| Post-Flight | `app/rituals/post-flight.tsx` | ✅ | ✅ chevron-back (manual) |

Rituals layout has **headerShown: false**; both screens have an explicit back button.

---

## 7. EMERGENCY

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Emergency hub | `app/emergency/index.tsx` | ✅ | “Exit Emergency Mode” (replace to tabs) |
| Crisis lines | `app/emergency/crisis.tsx` | ✅ | ✅ chevron-back |
| Breathe | `app/emergency/breathe.tsx` | ✅ | ✅ chevron-back + stop |
| Reach out | `app/emergency/reach-out.tsx` | ✅ | ✅ chevron-back |

---

## 8. MODALS (sample)

| Route | File | Exists | Back / Nav |
|-------|------|--------|------------|
| Onboarding | `app/(modals)/onboarding.tsx` | ✅ | Flow + gesture |
| Cockpit check-in | `app/(modals)/cockpit-checkin.tsx` | ✅ | ✅ arrow-back |
| Settings | `app/(modals)/settings.tsx` | ✅ | ✅ arrow-back |

Modals use **gestureEnabled: true** and, where checked, an explicit back or close button.

---

## Findings

1. **Toolkit paths:** There are no `app/toolkit/*` routes. The 7 AI tools are implemented as **`app/(modals)/*`** (e.g. `(modals)/relate.tsx`). Navigation to them is from the Learn/Tools tab (and elsewhere); no code changes required for “toolkit” beyond using the modal routes.
2. **Crashes:** Lint/import checks on the listed screens show **no errors**; no obvious load/syntax issues detected.
3. **Back navigation:** Covered in `docs/NAVIGATION-AUDIT-BACK-REPORT.md`. All verified screens have either stack header back, manual back/close, or gesture (modals). Gaps previously found (e.g. insight `[code]`, profile discovery intros) have been fixed.

---

## Manual test checklist (optional)

You can run through this on a device/simulator:

- [ ] **Tabs:** Home, Talk, Lights, Learn, Me — each tab loads.
- [ ] **Lights:** Open a light → profile; open Lessons → list → one lesson; open Your 5/15/50/150; Family hub → one family; Log entry. Back from each.
- [ ] **Learn → Tools:** Open Relate, Replay, Role Play, Journal, Help, Decode, Love. Dismiss with back/close or gesture.
- [ ] **Profile:** Open Profile → open each gauge (Body, State, Emotion, Connection, Direction, Alignment); open Direction Discovery and Alignment Discovery (intro + back). Back from each.
- [ ] **New features:** News My Way, Love History (list, add, one entry, patterns, insights), Body Maintenance (list, add routine, add provider), Mind Mail (list, one thread, compose). Back from each.
- [ ] **Rituals:** Pre-Flight, Post-Flight. Back from each.
- [ ] **Emergency:** Emergency hub → Crisis, Breathe, Reach out. Back or Exit.
- [ ] **Modals:** Onboarding (if applicable), Cockpit check-in, Settings. Back or close.

---

*Generated for InGauge route verification. For back-nav details, see `docs/NAVIGATION-AUDIT-BACK-REPORT.md`.*
