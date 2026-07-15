# Manual QA checklist (TestFlight / device)

Use one row per run: fill **Actual result**, **Severity** (blocker / high / medium / low / n/a), **Notes**.

## Auth & session

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Login | Cold launch → sign in | Lands in app shell with correct user | | | |
| Logout / session | Sign out → relaunch | Stays logged out until sign in | | | |
| Token refresh | Background app 30+ min → foreground | No unexpected logout | | | |

## Onboarding

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| First run | Delete app → install → open | Onboarding shows; can complete or skip per product rules | | | |
| Resume | Kill app mid-onboarding → reopen | Sensible resume (no blank screen / no duplicate account) | | | |

## Cockpit (home)

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Gauges load | Open Cockpit tab | Gauges render without crash; placeholders if no data | | | |
| Health influence | With Apple Health connected | Body/State reflect supporting signals where implemented | | | |
| Pull to refresh | If supported | Completes without freeze | | | |

## Me → Apple Health (`/(modals)/health-connections`)

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| iOS only | Open on Android | Clear message; no crash | | | |
| Pre-copy | Read “What we’ll ask for” | Matches minimal permissions story | | | |
| Connect | Tap Connect → Health sheet | Permission UI appears; app does not crash | | | |
| Deny | Deny permissions | Graceful copy + link to Settings; no loop | | | |
| Allow | Allow read | Success alert; metrics or empty state; last synced updates | | | |
| Refresh | Tap Refresh from Health | Spinner; synced time updates; no duplicate crash | | | |
| No data | Fresh Health with no samples | Empty state copy; no red error unless sync failed | | | |
| Reopen | Background → foreground | State preserved; last sync visible | | | |

## Decode modal

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Paste + Decode | Short message → Decode | Analysis sections present | | | |
| Suggested intent | Check `SUGGESTED_INTENT` in response | Trajectory + explanation when parsed | | | |
| Intent override | Tap chip | Scoring updates; copy matches selection | | | |
| Bias banner | Low state + biased text | Banner can appear; can dismiss | | | |

## AI outputs (general)

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Offline / API error | Airplane mode → action that calls AI | Fallback or error UI; no hang | | | |
| Long response | Long paste | Scroll works; no layout explosion | | | |

## Save / edit / delete (pick flows you ship)

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Journal / notes | Create → kill app → reopen | Data persists per design | | | |
| Delete | Delete item | Confirms; item gone; no ghost in list | | | |

## Background & reopen

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Cold start | Force quit → open | Restores to stable screen | | | |
| Memory warning | Heavy session then background | Returns without white screen | | | |

## Permission denied states

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Mic (Talk) | Deny mic → open Talk | Clear prompt; path to Settings | | | |
| Photos (Decode) | Deny library → attach | Graceful message | | | |
| Health | Deny Health reads | Me → Apple Health shows not connected + guidance | | | |

## Crash-prone areas

| Feature / screen | Steps to test | Expected result | Actual result | Severity | Notes |
|------------------|---------------|-----------------|---------------|----------|-------|
| Image picker | Rapid open/cancel | No crash | | | |
| Modals stack | Open several modals in sequence | Back navigation works | | | |
| Stabilization mode | Trigger if applicable | Caution UI; no navigation loop | | | |

---

**Prior pass order (recommended):** Auth → Onboarding → Cockpit → Me → Apple Health → Decode → background/reopen → permission denials.
