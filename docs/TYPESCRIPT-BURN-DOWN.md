# TypeScript burn-down

Track TypeScript errors by area so we fix them systematically instead of randomly.  
**Goal:** `npm run audit` green.

**Recommended fixing order:** 1 → 2 → 3 → 4 → 5 (onboarding first-run, then talk core, then decision tool, then body-maintenance store, then rest).

**Workflow:** After fixing an area, run `npm run typecheck`. Before merge/ship, run `npm run audit` and `npm run lint`.

**Current status**

| | Count |
|---|-------|
| Total TS errors | 67 |
| Fixed | 67 |
| Remaining | 0 |
| Last updated | 2025-03-03 |
| **Next focus** | **Done** |

*(When a section is done: update Fixed (cumulative total), Remaining, Last updated, and set Next focus to the following section. “Fixed” is always the total fixed so far, not just the current section.)*

---

## 1. Onboarding

| File | Error | Likely cause | Status | Owner | Fixed |
|------|--------|---------------|--------|-------|--------|
| app/(modals)/onboarding.tsx | Cannot find name 'agreeAI', 'agreeAge' (184, 204, 360, 366) | State vars not declared or renamed | Fixed | — | 2025-03-03 |
| app/(modals)/onboarding.tsx | Cannot find name 'setAgreeAI', 'setAgreeAge' (359, 365) | Setters not declared or renamed | Fixed | — | 2025-03-03 |
| app/(modals)/onboarding.tsx | Parameter 'v' implicitly has an 'any' type (359, 365) | Callback param needs type | Fixed | — | 2025-03-03 |

---

## 2. Talk

| File | Error | Likely cause | Status | Owner | Fixed |
|------|--------|---------------|--------|-------|--------|
| app/(tabs)/talk.tsx | This expression is not callable. Type 'void' has no call signatures (700) | Selector returned void: used `s.setVoiceDisclosureAccepted()` instead of `s.setVoiceDisclosureAccepted` | Fixed | — | 2025-03-03 |
| src/components/AiDisclaimerGate.tsx | This expression is not callable. Type 'void' has no call signatures (25) | Selector returned void: used `s.setAiDisclaimerAccepted()` instead of `s.setAiDisclaimerAccepted` | Fixed | — | 2025-03-03 |
| src/components/VoiceTextInput.tsx | This expression is not callable. Type 'void' has no call signatures (77) | Selector returned void: used `s.setVoiceDisclosureAccepted()` instead of `s.setVoiceDisclosureAccepted` | Fixed | — | 2025-03-03 |

---

## 3. Decision / new

| File | Error | Likely cause | Status | Owner | Fixed |
|------|--------|---------------|--------|-------|--------|
| app/tools/decision/new.tsx | Cannot find name 'setAiClarity', 'aiClarity', 'setAiClarityLoading', 'aiClarityLoading' (multiple lines) | State for AI clarity step missing; added useState for aiClarity and aiClarityLoading | Fixed | — | 2025-03-03 |

---

## 4. Body-maintenance store

Store type is missing methods/fields that screens use. Fix the store type (and implementation if needed), then implicit `any` in callbacks can be cleaned up.

| File | Error | Likely cause | Status | Owner | Fixed |
|------|--------|---------------|--------|-------|--------|
| src/stores/bodyMaintenanceStore | (type definition) | Added getOverdueItems, getTimelineEntries to type; implemented full routines/providers API + export computeNextDue | Fixed | — | 2025-03-03 |
| app/(modals)/body-maintenance.tsx | getTimelineEntries does not exist (43); implicit any (83, 89) | Store type | Fixed | — | 2025-03-03 |
| app/(modals)/gauge-detail.tsx | getOverdueItems does not exist (220); implicit any (235) | Store type | Fixed | — | 2025-03-03 |
| app/body-maintenance/[routineId].tsx | getRoutine, completeRoutine, snoozeRoutine, removeRoutine (27–30); snoozeRoutine(id, days) | Store type + snoozeRoutine(id, days?) | Fixed | — | 2025-03-03 |
| app/body-maintenance/add-provider.tsx | addProvider (24) | Store type | Fixed | — | 2025-03-03 |
| app/body-maintenance/add-routine.tsx | addRoutine (73) | Store type | Fixed | — | 2025-03-03 |
| app/body-maintenance/index.tsx | routines, providers, getRoutinesByFrequency, getComingUp, completeRoutine (30–34); possibly undefined r/p | Store type + entry guards | Fixed | — | 2025-03-03 |
| app/body-maintenance/providers/[id].tsx | computeNextDue import; getProvider, updateProvider, removeProvider (27–29); computeNextDue(freq, string) | Store export + computeNextDue(Date \| string) | Fixed | — | 2025-03-03 |
| app/profile/gauges/body.tsx | getComingUp (29); possibly undefined r/p | Entry guards | Fixed | — | 2025-03-03 |

---

## 5. Other remaining errors

| File | Error | Likely cause | Status | Owner | Fixed |
|------|--------|---------------|--------|-------|--------|
| app/(modals)/ask-gauge.tsx | This expression is not callable. Type 'Boolean' has no call signatures (80) | canUseAI is boolean from selector; use !canUseAI not !canUseAI() | Fixed | — | 2025-03-03 |
| app/forecast/index.tsx | Type 'unknown' must have '[Symbol.iterator]()' (18); Expected 0-1 arguments, but got 2 (27) | Typed tuple assertion; removed shallow (2nd arg) | Fixed | — | 2025-03-03 |
| src/components/forecast/PreFlightForecast.tsx | Same as forecast/index.tsx (18, 27) | Same | Fixed | — | 2025-03-03 |
| app/learn/self-discovery/[id].tsx | Module has no exported member 'isInlineQuiz' (17) | Re-exported isInlineQuiz from types in selfDiscoveryQuizzes | Fixed | — | 2025-03-03 |
| app/tools/family-conflict/index.tsx | Property 'emphasis', 'links' do not exist on therapy variant (163–166); implicit any (166) | FamilyConflictResource type with optional emphasis/links | Fixed | — | 2025-03-03 |
| app/tools/life-direction-finder/index.tsx | Property 'requestPermissionsAsync' does not exist on expo-av (126) | Import requestPermissionsAsync from expo-av/build/Audio/Recording | Fixed | — | 2025-03-03 |
| app/tools/memory-builder/add.tsx | Cannot find name 'handleSuggestWithAI', 'aiHookLoading' (155–157) | Added useState for aiHookLoading and handleSuggestWithAI handler | Fixed | — | 2025-03-03 |
| app/tools/relationship-repair/index.tsx | Cannot find name 'setPersonalizedDraft', 'setPersonalizeLoading', 'personalizedDraft', 'personalizeLoading' (multiple) | Added useState for personalizedDraft and personalizeLoading | Fixed | — | 2025-03-03 |
| src/data/humanRoles.ts | Property 'needsSectionTitle' is missing in type (105) | Added needsSectionTitle to friend role | Fixed | — | 2025-03-03 |

---

## Summary

- **Total areas:** 5  
- **Recommended order:** Onboarding → Talk → Decision/new → Body-maintenance store → Other  
- **After each area:** Run `npm run typecheck` and update this doc (Status = Fixed, Fixed date).  
- **Before merge/ship:** `npm run audit` and `npm run lint`.
