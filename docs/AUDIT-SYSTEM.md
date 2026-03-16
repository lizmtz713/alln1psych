# InGauge audit system

Multi-layer checks so we catch **code errors**, **broken imports**, **type issues**, **route problems**, **missing screens**, **dead links**, **modal/screen wiring**, **feature regressions**, **permission bugs**, and **AI/tool connection issues** before shipping.

---

## Milestone: TypeScript green + audit green (2025-03-03)

**Checks passing as of this date:**

- `npm run typecheck`
- `npm run audit:routes`
- `npm run audit:ownership`
- `npm run audit`

**Merge rule from here on:**

- **While restructuring / refactoring:** run `npm run audit:structure`.
- **Before merge or ship:** run `npm run audit` and `npm run lint`.

---

## Five layers

| Layer | What it catches | How we check it |
|-------|------------------|------------------|
| **1. Static code** | Bad imports, undefined vars, wrong props, type mismatches, many route mistakes | TypeScript, ESLint/Expo lint |
| **2. Route / file-tree** | Missing route files, broken links, duplicate routes, orphan screens, missing exports | `npm run audit:routes` (script) |
| **3. Runtime** | Crashes, blank screens, broken nav, state/permission bugs | Manual QA + click-through (see QA-CHECKLIST) |
| **4. Integration** | Talk ↔ AI, Ask Gauge, Lights ↔ People, Body Maintenance, Oura/Health, share, crisis | Manual QA + future E2E |
| **5. Product / architecture** | Right domain, modal vs screen, reachability, AI/voice/disclaimer per route, dead ends | Human review + INGAUGE-GOVERNANCE-MATRIX |

---

## What’s implemented

### A. One command for code health

| Command | What it does |
|---------|----------------|
| `npm run typecheck` | `tsc --noEmit` — all TypeScript errors. |
| `npm run lint` | `expo lint` — ESLint/Expo rules. |
| `npm run audit:routes` | Route audit script (see below). |
| `npm run audit:ownership` | Route ownership / architecture audit (see below). |
| `npm run audit:structure` | **Route/reference/ownership integrity only** — route audit + ownership audit. Fast green check for architecture while TS cleanup is in progress. |
| `npm run audit` | **Full structural + type-safety gate** — typecheck + audit:structure. Use before merge/ship. |
| `npm run test` | typecheck + route audit (same as audit for now). |

**Quick distinction:** `audit:structure` = route/reference/ownership integrity (no typecheck). `audit` = full structural + type-safety gate (typecheck + structure). Use `audit:structure` for fast architecture confidence; use `audit` before merging or shipping.

### B. Route audit script (`scripts/audit-routes.js`)

- **Route files:** All `app/**/*.tsx` (excluding `_layout.tsx`) → normalized route paths (Expo: `(group)` not in URL, `[param]` dynamic).
- **References:** Scans `app/` and `src/` for `router.push(...)`, `pathname:`, `route:`, `href=` and collects route strings.
- **Checks:**
  - Every referenced route has a matching file (with `index` and template literals handled).
  - Duplicate route segments (multiple files → same path).
  - Possible orphans (file exists but no direct reference).
  - Files that may lack `export default`.
- **Exit:** 0 if no broken references; 1 if any REF_NO_FILE (so CI can fail).
- **Dynamic paths:** Refs like `/tools/focus/exercise/` (with trailing slash or no id) are treated as valid when a file route `/tools/focus/exercise/[id]` exists.

### C. Route ownership audit (`scripts/audit-route-ownership.js`)

- **Purpose:** Every route should belong to one product domain so ownership and architecture stay clear.
- **Domains:** Cockpit, Signals, People, Tools, Manual, Me, Insights, Body, Emergency, Rituals (see INGAUGE-SYSTEM-MAP / QA-CHECKLIST).
- **Checks:**
  - Every route file under `app/` is mapped to a domain (path-prefix map in the script).
  - No new top-level stack (new directory under `app/`) without being in the documented list; new stacks must be added to INGAUGE-ROUTE-MAP and to the script’s `DOCUMENTED_TOP_LEVEL`.
  - **Modal vs screen:** Modals that look like full multi-step workflows are listed for review (e.g. onboarding, identity-setup, help-someone, relational-bridge). Rule: use a **modal** for quick overlays (single step or short flow); use a **screen** (stack) for multi-step workflows. The audit does not fail on these; it reports them so teams can decide. **Foundation** has been moved to a real stack (`/foundation/*`) and is treated as a setup/configuration flow (owned by Manual), not a modal utility — see MODAL-REDUCTION-PLAN.md.
- **Exit:** 0 if all routes have a domain and there are no undocumented top-level stacks; 1 otherwise.
- **Run:** `npm run audit:ownership`.

### D. Manual QA checklist

- **QA-CHECKLIST.md** — Per-domain checklist: Cockpit, Signals, People, Tools, Manual, Me, Insights, Body, Emergency, Rituals. For each: opens, loads, navigates, saves, returns, disclaimer, permissions.

### E. Release checklist

- **RELEASE-CHECKLIST.md** — Pre-ship: typecheck, lint, route audit, iOS/Android build, runtime (no red screens), navigation, AI/tools, permissions, critical flows.

---

## Known broken references (status)

Previously reported broken refs have been fixed and stay documented here so future refs can be tracked the same way.

| Ref | Resolution | Status |
|-----|------------|--------|
| `/checkin` | Nudges and links point to `/(modals)/cockpit-checkin` | Fixed |
| `/tools/body-scan` | Use `/(modals)/activity?id=body-scan` | Fixed |
| `/tools/emotion-wheel` | Use `/(modals)/activity?id=emotion-wheel` | Fixed |
| `/tools/breathing` | Use `/(modals)/activity?id=breathing` | Fixed |
| `/tools/journal` | Use `/(modals)/new-journal` | Fixed |
| `/tools/focus/exercise/` (no id) | Audit treats ref as valid when file is `/tools/focus/exercise/[id]` | Fixed (audit rule) |

When new broken refs appear, fix them (typo / future route / dynamic path), then add a row above and set status to Fixed.

---

## Lightweight runtime smoke-test plan

Not full E2E yet. A minimal automated or manual smoke pass to catch obvious runtime failures:

1. **App launch** — App opens without crash; root layout loads.
2. **Tabs** — Open each tab (Cockpit, Signals, People, Tools, Manual, Me); no crash, tab content visible or expected placeholder.
3. **Key modals** — Open and dismiss: check-in (cockpit-checkin), activity (e.g. body-scan), new-journal, settings; no crash on open or close.
4. **Major stacks** — Navigate into at least one screen per stack: tools (e.g. focus), learn (e.g. manual), profile, emergency, rituals; no immediate crash.

**How to run (for now):** Manual click-through using the list above, or later a single Jest test that imports the root layout and key entry screens and asserts they don’t throw on render. E2E (Detox/Maestro) can replace or extend this once added.

---

## What to add later (optional)

- **Jest + smoke tests:** Import root layout or key screens; assert no throw (catches broken imports at test time).
- **E2E (Detox or Maestro):** Tap through tabs → modals → stacks; assert no crash and correct screen.
- **audit:links:** Scan docs for `](./...` and verify linked files exist.
- **audit:screens:** Deeper check that every screen in the route map has a file and default export.

---

## Highest-value checks (do these first)

1. **typecheck** — Fix TypeScript errors.
2. **lint** — Fix lint errors.
3. **audit:routes** — Fix broken route references and add missing route files.
4. **audit:ownership** — Ensure every route has a domain; no new undocumented stacks.
5. **Smoke pass** — App launch, tabs, key modals, major stacks (see Lightweight runtime smoke-test plan above).
6. **Click-through** — Use QA-CHECKLIST for all major flows before each release.

---

See: [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md), [QA-CHECKLIST.md](./QA-CHECKLIST.md), [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md).
