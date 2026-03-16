# Driver-aware suggestion personalization

## 1. Summary of ranking personalization

- **What changed:** The primary suggestion in the "Influencing your system" card is now chosen by **base relevance + a small personalization boost**. Actions the user has previously taken in **similar contexts** (same or overlapping system impact and/or drivers) get a modest score boost so they are preferred when they are already among the candidate suggestions.
- **Explainable:** The logic is: (1) get the same driver-aware candidate list as before; (2) for each candidate, add a boost proportional to how many times the user took that action in a similar context; (3) pick the top by total score. No black box.
- **Variety preserved:** The boost is capped (max +1.5) and per-take increment is small (+0.3). Base scores are 10, 9, 8 for the first three candidates, so the unpersonalized order still dominates; different check-ins (different impact/drivers) will often surface different suggestions.

---

## 2. Files changed

| File | Changes |
|------|--------|
| **`src/stores/cockpitStore.ts`** | `suggestedActionsTaken` entries now include optional `systemImpact?: GaugeKey[]` and `drivers?: string[]`. `recordSuggestedActionTaken` accepts and stores this context. |
| **`src/services/driverAwareSuggestions.ts`** | Added `SuggestedActionTaken` type; `isSimilarContext()`; `getPrimarySuggestionWithPersonalization(systemImpact, driverIds, suggestedActionsTaken)` that scores by base order + personalization boost; `getActionTakeCountsByContext()` for future insight copy. |
| **`app/(tabs)/index.tsx`** | Uses `getPrimarySuggestionWithPersonalization(..., suggestedActionsTaken)` for the primary suggestion. Passes `systemImpact` and `drivers` into `recordSuggestedActionTaken` when the user taps the suggestion. |
| **`docs/SUGGESTION-PERSONALIZATION.md`** | This doc. |

---

## 3. How similarity / context matching works

- **Stored context:** When the user taps a suggestion, we record `actionId`, `route`, `label`, `takenAt`, and (when available) **`systemImpact`** and **`drivers`** from the current check-in.
- **Similar context:** A past take is considered "similar" to the current context if:
  - The past take has context stored (`systemImpact` and/or `drivers`), and
  - **Either** current system impact overlaps past system impact (at least one gauge in common), **or** current drivers overlap past drivers (at least one driver id in common).
- **Matching is per action:** The boost counts only past takes of the **same** `actionId` in similar contexts. So "connection-reach-out" is only boosted by past connection-reach-out taps in similar situations, not by other actions.
- **Backward compatible:** Old entries without `systemImpact`/`drivers` are not used for similarity (they don’t get a boost and don’t contribute to boosting others).

---

## 4. How strong the personalization boost is

- **Per similar take:** +0.3 to that action’s score.
- **Cap:** Total personalization boost for one suggestion is capped at **+1.5** (so at most 5 similar past takes count).
- **Base scores:** First candidate = 10, second = 9, third = 8. So a capped boost of 1.5 can at most swap two adjacent candidates (e.g. 9 + 1.5 = 10.5 > 10). It cannot push a third-place suggestion above a strong first-place one (8 + 1.5 = 9.5 < 10).
- **Result:** Soft preference only; the original driver-aware order still dominates. Variety is kept because context (impact/drivers) changes from check-in to check-in.

---

## 5. Confirmation that suggestion variety remains

- **Soft preference, not hard lock:** We only reorder within the same candidate list; we never hide an action. The list is still built purely from current system impact and drivers.
- **Context-dependent:** Different check-ins produce different candidate lists and different "similar" past takes, so the winning suggestion will often change (e.g. connection vs direction vs state).
- **Cap and small increment:** With a max boost of 1.5 and base gap of 1 between positions, the same suggestion does not always win; it only gets a nudge when the user has a history of taking it in similar contexts.
- **Future-ready:** `getActionTakeCountsByContext(suggestedActionsTaken)` returns counts by action, by action+impact, and by action+driver, so insights like "Quick reset often helps when stress is high" or "You tend to respond well to prioritizing one task when Direction is strained" can be generated from the same data later.
