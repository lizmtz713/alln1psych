# Changes summary and verification

Quick reference for what changed and current error status.

---

## 1. Changes from this session (what we did)

### A. Docs split and repo structure

| Change | Location |
|--------|----------|
| **Architecture doc split** | One monolith → 5 focused docs + index. |
| **Entry point** | `docs/README.md` — links to Route Map, Governance Matrix, AI Architecture, Data Policy, System Map. |
| **New docs** | `INGAUGE-ROUTE-MAP.md`, `INGAUGE-GOVERNANCE-MATRIX.md`, `INGAUGE-AI-ARCHITECTURE.md`, `INGAUGE-DATA-POLICY.md`, `INGAUGE-SYSTEM-MAP.md`, `INGAUGE-REPO-STRUCTURE.md`. |
| **Monolith** | `INGAUGE-ROUTE-MAP-AND-FILE-TREE.md` replaced with a short pointer to the new docs. |
| **Cross-links** | `INGAUGE-AI-BRAIN.md`, `INGAUGE-DATA-GRAPH.md`, `INGAUGE-ARCHITECTURE-ORGANIZATION.md` updated to reference the new filenames. |
| **Repo structure** | `INGAUGE-REPO-STRUCTURE.md` — visual diagram, “what talks to what,” folder list, migration checklist, priority order. |
| **New folders** | `components/`, `features/`, `hooks/`, `lib/`, `ai/`, `data/`, `services/`, `store/`, `styles/`, `types/`, `tests/` (each with README). Plus `features/*` and `ai/*` subfolders with `.gitkeep`. |
| **Migration checklist** | In `INGAUGE-REPO-STRUCTURE.md`: do not mass-move; new code in new structure; old code moves only when touched; priority order (components → services → data → ai → features → store). |

### B. Cockpit layout (CockpitCluster.tsx)

| Change | Detail |
|--------|--------|
| **Side actions reduced** | Removed the four crossed-out tools (Breath, Focus, Family, Direction) and the rest of the old left/right lists. Only **two** side actions now. |
| **Upper-left** | **Rituals** — one context-aware action by time of day: morning → Pre-Flight, afternoon → Reset, evening → Post-Flight, night → Wind Down. |
| **Upper-right** | **Support** — single button to `/emergency` (breathe, reach out, crisis resources). |
| **Spacing** | Radial gauge positions and column anchors unchanged; same `TOOLS_TOP`, `toolsLeftX`, `toolsRightX`. |
| **Center ring** | `CENTER_SIZE` 92 → 100; glow radius 89 → 95. |
| **“YOU” label** | Smaller (fontSize 9), lighter weight, marginBottom 2, opacity 0.9; sublabel marginTop 8 → 6. |
| **Rituals logic** | `getRitualsSlot()` runs in render so the label/route updates when the user returns to Cockpit (time of day). |
| **pushTool** | Handles both items with and without `params`; Support has no params, Rituals only has params for Wind Down. |

---

## 2. Verification

### CockpitCluster and Home (index)

- **Lint:** No ESLint/IDE errors in `src/components/CockpitCluster.tsx` or `app/(tabs)/index.tsx`.
- **Props:** Home already passes `hideStatusHint`, `leftSignalLines`, `rightSignalLines`; CockpitCluster defines defaults for those, so no breaking change.
- **Routes:** Rituals use `/rituals/pre-flight`, `/rituals/post-flight`, `/tools/quick-reset`, `/(modals)/activity?id=breathing`. Support uses `/emergency`. All exist in the app.

### TypeScript (full repo)

- **CockpitCluster:** No TypeScript errors in `CockpitCluster.tsx`.
- **Rest of repo:** `npx tsc --noEmit` reports errors in **other** files (e.g. ask-gauge, body-maintenance, onboarding, talk, bodyMaintenanceStore, forecast, decision/new, family-conflict, memory-builder, self-discovery, etc.). These are **pre-existing** and not introduced by the doc split or Cockpit changes.

---

## 3. Pre-existing TypeScript errors (not from our changes)

Summary of areas with existing TS errors (for follow-up; no change required for the work above):

- **Body maintenance:** Store type missing methods (e.g. `getTimelineEntries`, `getOverdueItems`, `getRoutine`, `routines`, `providers`, etc.) and some `any` types.
- **Onboarding:** `agreeAI`, `agreeAge`, `setAgreeAI`, `setAgreeAge` not defined in scope.
- **ask-gauge / talk:** Callable expression / void type issues.
- **Decision tool:** `setAiClarity`, `aiClarityLoading`, etc. not defined.
- **Memory builder:** `handleSuggestWithAI`, `aiHookLoading` not defined.
- **Forecast:** Iterator type and function arity.
- **Family conflict:** `emphasis`, `links` on union type; `any` parameters.
- **Self-discovery:** Missing export `isInlineQuiz`.
- **life-direction-finder:** `requestPermissionsAsync` on expo-av type.
- **body-maintenance providers:** Missing `computeNextDue` export and store methods.

Fixing these is separate from the Cockpit and docs work.

---

## 4. How to see all changes (git)

```bash
# List modified and new files
git status

# Diff for Cockpit only
git diff src/components/CockpitCluster.tsx

# Diff for docs (modified)
git diff docs/README.md docs/INGAUGE-REPO-STRUCTURE.md docs/INGAUGE-AI-BRAIN.md docs/INGAUGE-DATA-GRAPH.md docs/INGAUGE-ARCHITECTURE-ORGANIZATION.md

# New doc files (untracked)
ls docs/INGAUGE-*.md
```

---

## 5. Summary

- **Docs:** Split into 5 focused docs + index; monolith is a pointer; cross-links and repo-structure doc (with migration checklist) added.
- **Repo structure:** New top-level folders and feature/ai subfolders with READMEs and .gitkeep; migration checklist in `INGAUGE-REPO-STRUCTURE.md`.
- **Cockpit:** Two side actions (Rituals + Support), bigger center ring, smaller “YOU” label; no new lint or TS errors; Home passes props correctly.
- **Bugs:** No new bugs in the changed files; existing TS errors elsewhere in the repo are unchanged and can be fixed independently.
