# Modal Reduction Plan (Option B)

**Goal:** Move major workflow modals into real screens so multi-step flows live in stacks instead of modals.

**Rule (from AUDIT-SYSTEM):** Use `npm run audit:structure` while restructuring; use `npm run audit` and `npm run lint` before merge/ship.

**Status:** Modal reduction is **complete for now**, with one intentional hold. **Done:** Foundation, Onboarding, Identity Setup, Invite Circle, Help Someone, Reach Out, Relational Bridge. **Pending by design:** love (ownership decided; migrate when ready — see Love decision below).

---

## Product language: Foundation (and future stacks)

- **Foundation** is a **setup/configuration flow**, not a modal utility. Team and docs should describe it consistently as:
  - A real stack (`/foundation/*`) for personalization and baseline setup (values, directions, people, body, state, emotion).
  - **Ownership:** Manual (or Profile/Foundation, depending on final architecture). Currently assigned to Manual in route ownership.
- The same principle applies to other flows moved out of modals: treat them as first-class stacks and setup/configuration or workflow flows, not “modal utilities.”

---

## 1. Workflow modals to convert (order)

**Suggested batch order (after foundation):** onboarding → identity-setup → help-someone → invite-circle → larger workflow tools (love, reach-out-scaffold, relational-bridge) later. Onboarding and identity-setup are structurally important and affect first-run clarity; they’re easier to reason about than some of the more AI-heavy tools.

| Order | Modal(s) | Stack location | Notes |
|-------|----------|----------------|-------|
| 1 | **Foundation (6)** ✅ | `app/foundation/` | values, directions, people, body, state, emotion. Single coherent flow; high traffic from settings + tools + cockpit. **Done.** |
| 2 | **Onboarding (+ old)** ✅ | `app/onboarding/` | First-run flow, consent, setup. **Done (Batch 2).** |
| 3 | **Identity-setup** ✅ | `app/identity-setup/` | Configuration/profile flow (name, age, pronouns, etc.). **Done (Batch 3).** May move under /profile later. |
| 4 | **Invite-circle** ✅ | `app/invite-circle/` | Circle invite flow. **Done (Batch 4).** |
| 5 | **Help-someone** ✅ | `app/tools/help-someone/` | AI-assisted situational guidance. **Done (Batch 5).** Owned by Tools. |
| 6 | **Reach-out** ✅ | `app/tools/reach-out/` | Action-oriented reach-out flow. **Done (Batch 6).** Owned by Tools. |
| 7 | **Relational-bridge** ✅ | `app/tools/relational-bridge/` | Guided mediation, bridge-building. **Done (Batch 7).** Owned by Tools. |
| 8 | love | **Pending by design** | Decision made: educational → `/learn/relationship-toolkit/love`; records/history → People. Migrate when ready (or pause and do other high-value work first). |

---

## 2. Foundation flow (Batch 1) — done this pass

### 2.1 New structure

- **Stack:** `app/foundation/_layout.tsx` (Stack, no tabs).
- **Screens:** `app/foundation/values.tsx`, `directions.tsx`, `people.tsx`, `body.tsx`, `state.tsx`, `emotion.tsx`.
- **Implementation:** New screen files re-export the existing modal components from `app/(modals)/foundation-*.tsx` so there is no logic duplication. Modal stack entries are removed from `(modals)/_layout.tsx`; modal files remain as the single source of truth until we optionally inline them into `app/foundation/*.tsx` later.

### 2.2 Route changes

- Old: `/(modals)/foundation-values`, `/(modals)/foundation-directions`, etc.
- New: `/foundation/values`, `/foundation/directions`, `/foundation/people`, `/foundation/body`, `/foundation/state`, `/foundation/emotion`.

### 2.3 Ref updates

- `app/(modals)/settings.tsx`: `router.push('/(modals)/foundation-body')` → `router.push('/foundation/body')` (and state, emotion).
- `app/(tabs)/index.tsx`, `app/(tabs)/tools.tsx`: `route: '/(modals)/foundation-body'` → `route: '/foundation/body'`.
- `src/data/toolGaugeMappings.ts`: `route: '/(modals)/foundation-body'` → `route: '/foundation/body'`.
- `src/data/insightCards.ts`: `toolRoute: '/(modals)/foundation-body'` → `toolRoute: '/foundation/body'`.
- `src/data/toolIntroContent.ts`: Key `foundation-body` kept as-is (content key only; not a route).

### 2.4 Root layout

- Add `<Stack.Screen name="foundation" />` in `app/_layout.tsx` so the foundation stack is reachable.

### 2.5 Audit and route map

- Add `foundation` to `DOCUMENTED_TOP_LEVEL` in `scripts/audit-route-ownership.js`.
- Add `['foundation/', 'Manual']` to `PATH_TO_DOMAIN` (foundation-* entries can remain for backward compatibility or be removed in favor of foundation/).
- Update `docs/INGAUGE-ROUTE-MAP.md`: add `/foundation/*` under root stack; remove foundation-* from Modals table.

### 2.6 Verification

- `npm run audit:structure` (during refactor).
- `npm run audit` and `npm run lint` before merge/ship.

### 2.7 Future cleanup (optional, once things settle)

- The new `app/foundation/*.tsx` screens currently **re-export** from `app/(modals)/foundation-*.tsx`. Later, you may want to make the foundation screen files the **true source of truth** and retire the old modal files (move component code into `app/foundation/*.tsx`, then remove `(modals)/foundation-*.tsx`). Not urgent; good cleanup after the pattern is proven.

---

## 2b. Onboarding flow (Batch 2) — done

- **Stack:** `app/onboarding/_layout.tsx` (fade animation). **Screens:** `index.tsx` (re-exports `(modals)/onboarding`), `old.tsx` (re-exports `(modals)/onboarding-old`). Routes: `/onboarding`, `/onboarding/old`.
- **Deprecated:** `/onboarding/old` is a **temporary legacy route only**. Do not use for new flows; mark it clearly in docs so it doesn’t linger. Prefer removing or folding into main onboarding when safe.
- **Refs updated:** `app/index.tsx` (Redirect), `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `app/(tabs)/me.tsx` (Redo Onboarding).
- **Removed** `Stack.Screen name="onboarding"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="onboarding"` to root `app/_layout.tsx`.
- **Audit:** `onboarding/` and `(modals)/onboarding`, `(modals)/onboarding-old` in PATH_TO_DOMAIN (Cockpit); `onboarding` in DOCUMENTED_TOP_LEVEL; onboarding/onboarding-old removed from MODAL_WORKFLOW_CANDIDATES. Route map updated.
- **Checkpoint:** `npm run audit:structure` and `npm run audit` pass.

---

## 2c. Identity-setup flow (Batch 3) — done

- **Stack:** `app/identity-setup/_layout.tsx`. **Screen:** `index.tsx` (re-exports `(modals)/identity-setup`). Route: `/identity-setup`. Kept at top level for now; may move under `/profile` later.
- **Refs updated:** `app/(tabs)/me.tsx` (avatar and edit profile → `navigateTo('/identity-setup')`).
- **Removed** `Stack.Screen name="identity-setup"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="identity-setup"` to root `app/_layout.tsx`.
- **Audit:** `identity-setup/` and `(modals)/identity-setup` in PATH_TO_DOMAIN (Me); `identity-setup` in DOCUMENTED_TOP_LEVEL; identity-setup removed from MODAL_WORKFLOW_CANDIDATES. Route map updated.
- **Checkpoint:** run `npm run audit:structure` and `npm run audit`.

---

## 2d. Invite-circle flow (Batch 4) — done

- **Stack:** `app/invite-circle/_layout.tsx`. **Screen:** `index.tsx` (re-exports `(modals)/invite-circle`). Route: `/invite-circle`. Owned by People.
- **Refs:** No active app code referenced `/(modals)/invite-circle`; `app/(tabs)/circle.tsx.backup` updated to `router.push('/invite-circle')` for consistency if that file is ever restored. Link from People or Circle tab to invite flow should use `/invite-circle`.
- **Removed** `Stack.Screen name="invite-circle"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="invite-circle"` to root `app/_layout.tsx`.
- **Audit:** `invite-circle/` and `(modals)/invite-circle` in PATH_TO_DOMAIN (People); `invite-circle` in DOCUMENTED_TOP_LEVEL; invite-circle removed from MODAL_WORKFLOW_CANDIDATES. Route map updated.
- **Checkpoint:** run `npm run audit:structure` and `npm run audit`.

---

## 2e. Help-someone flow (Batch 5) — done

- **Location:** `app/tools/help-someone/index.tsx` (re-exports `(modals)/help-someone`). Route: **`/tools/help-someone`**. Owned by **Tools** (AI-assisted, situational, guidance-oriented — not People).
- **Refs updated:** `app/(tabs)/index.tsx`, `app/(tabs)/tools.tsx`, `src/data/toolGaugeMappings.ts`, `app/(modals)/gauge-detail.tsx` → `/tools/help-someone`.
- **Removed** `Stack.Screen name="help-someone"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="help-someone"` to `app/tools/_layout.tsx`.
- **Audit:** `(modals)/help-someone` in PATH_TO_DOMAIN (Tools); help-someone removed from MODAL_WORKFLOW_CANDIDATES. Route map updated (tools section).
- **Checkpoint:** run `npm run audit:structure` and `npm run audit`.
- **Product language:** Describe help-someone as a **guided support tool for helping someone else**, not as a relationship destination (People). It’s Tools.

---

## 2f. Reach-out flow (Batch 6) — done

- **Location:** `app/tools/reach-out/index.tsx` (re-exports `(modals)/reach-out-scaffold`). Route: **`/tools/reach-out`**. Owned by **Tools** (action-oriented; simplified name from reach-out-scaffold).
- **Refs updated:** `app/(tabs)/index.tsx`, `app/(tabs)/tools.tsx`, `src/data/toolGaugeMappings.ts`, `src/data/insightCards.ts` (3), `src/components/home/ConnectionPromptCard.tsx`, `src/services/onboardingService.ts`, `src/components/ReachOutPrompt.tsx` → `/tools/reach-out`.
- **Removed** `Stack.Screen name="reach-out-scaffold"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="reach-out"` to `app/tools/_layout.tsx`.
- **Audit:** `(modals)/reach-out-scaffold` in PATH_TO_DOMAIN (Tools); reach-out-scaffold removed from MODAL_WORKFLOW_CANDIDATES. Route map updated (tools section).
- **Checkpoint:** run `npm run audit:structure` and `npm run audit`.

---

## 2g. Relational-bridge flow (Batch 7) — done

- **Location:** `app/tools/relational-bridge/index.tsx` (re-exports `(modals)/relational-bridge`). Route: **`/tools/relational-bridge`**. Owned by **Tools** (guided mediation, bridge-building, situational AI — not People).
- **Refs:** No active app code navigated to `/(modals)/relational-bridge`; any new links should use `/tools/relational-bridge`.
- **Removed** `Stack.Screen name="relational-bridge"` from `(modals)/_layout.tsx`. **Added** `Stack.Screen name="relational-bridge"` to `app/tools/_layout.tsx`.
- **Audit:** `(modals)/relational-bridge` in PATH_TO_DOMAIN (Tools); relational-bridge removed from MODAL_WORKFLOW_CANDIDATES. Route map updated (tools section).
- **Checkpoint:** run `npm run audit:structure` and `npm run audit`.

---

## Love: ownership decision (decision made)

**Decision made.** Unless new evidence says otherwise:

- **Love modal (educational/reflection content)** → **Learn.** Target: **`/learn/relationship-toolkit/love`**. Learn owns love education.
- **Datesume / love-history / relationship records** → **People.** Leave under the existing People-owned love stack. People owns love records and workflows.
- **Any mixed screen** → **Split** rather than move as one overloaded route. Do not migrate the current love modal into People as-is; either move the educational modal into Learn or split the content before moving.

This is the cleanest final model. When you do the love migration: create `learn/relationship-toolkit/love`, re-export from the current modal first, update refs, remove from modal layout; leave datesume/love-history under People.

**Architectural rule:** Educational content about relationships belongs to Learn. Actual relationship records and workflows belong to People. Do not mix these concerns in a single route. (Prevents future regressions.)

---

## 3. Later batches / next steps

- **Modal reduction:** Batch 7 done. Love is the only remaining workflow modal; it is **pending by design**, not blocking. The dangerous workflow modals are already cleaned up.
- **When ready to finish love:** Use the decision above. Option: create `learn/relationship-toolkit/love`, re-export from modal, update refs, remove from modal layout.
- **Cockpit cleanup:** Design is **documented and locked** in `docs/COCKPIT_INSTRUMENT_PANEL.md` (§11): rituals (left), support/emergency (right), no extra side tools, center ring size 100. Implementation in `CockpitCluster.tsx` already matches. Do not add side tool columns back.
- **Entry-point cleanup:** Audit and fixes documented in `docs/ENTRY-POINT-CLEANUP.md`. Invite Circle (People + Circle) and Relational Bridge (Tools) entry points added; Settings foundation-state route fixed.
- **Other high-value next:** MVP scope, route/domain consolidation.
