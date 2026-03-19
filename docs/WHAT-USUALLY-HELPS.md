# "What usually helps" — Evidence-based insight copy

## 1. Summary of the rule

We surface **action patterns** back to the user only when there is **enough repeated evidence**. Copy is **soft and humble** ("often helps", "tend to respond well to") and avoids absolutes. The same data powers:

- A single line **under the primary suggestion** in the influencing card
- A **"What usually helps"** block in the **weekly review** card
- **Future use** in an insights tab (data shape is ready; UI can call `getWhatUsuallyHelps()`)

---

## 2. Files changed

| File | Changes |
|------|--------|
| **`src/services/whatUsuallyHelps.ts`** | New service. `MIN_TAKES_WITH_CONTEXT = 3`, `MIN_DISTINCT_DAYS = 2`. `getWhatUsuallyHelps(suggestedActionsTaken)` returns `WhatUsuallyHelpsItem[]` (actionId, actionLabel, contextPhrase, copy). `getWhatUsuallyHelpsForAction(actionId, suggestedActionsTaken)` returns one line for the card. Uses `getActionTakeCountsByContext`, gauge/driver phrase maps, evidence filter. |
| **`app/(tabs)/index.tsx`** | Import `getWhatUsuallyHelps`, `getWhatUsuallyHelpsForAction`. Memo `whatUsuallyHelpsList`, `whatUsuallyHelpsForPrimary`. Under primary suggestion: show `whatUsuallyHelpsForPrimary` as small italic line when set. Weekly card: show "What usually helps" section with list of `item.copy` when list length > 0. Styles: `primarySuggestionWrap`, `whatUsuallyHelpsLine`, `whatHelpedWrap`, `whatHelpedTitle`, `whatHelpedItem`. |
| **`docs/WHAT-USUALLY-HELPS.md`** | This doc. |

---

## 3. Evidence threshold used

- **Minimum 3 takes** of the same action (`actionId`) that have **context** (at least one of `systemImpact` or `drivers` present).
- **At least 2 distinct days**: among those takes, `takenAt` must span at least 2 different calendar days (YYYY-MM-DD).

If either condition fails for an action, we do **not** show "usually helps" for that action. This avoids overconfident or fake-sounding copy early on.

---

## 4. Sample generated copy patterns

| Context source | Example phrase | Example full copy |
|----------------|----------------|--------------------|
| Driver: stress | when stress is high | Quick reset often helps when stress is high. |
| Gauge: direction | when Direction feels overloaded | Prioritizing one task often helps when Direction feels overloaded. |
| Gauge: connection | when Connection feels low | Reaching out often helps when Connection feels low. |
| Driver: work | when work feels heavy | Prioritizing one task often helps when work feels heavy. |
| Under primary suggestion | — | This often helps when work affects your Direction. |

Copy style: **"[Action] often helps [context phrase]."** For the line under the primary suggestion we use: **"This often helps [context phrase]."** No absolutes ("will help", "always"); wording stays evidence-based and humble.

---

## 5. Where the new copy is available in UI / data

| Place | What’s shown | Data / API |
|-------|----------------|------------|
| **Influencing card (Home)** | Under the primary suggestion button: one line only when the **current** primary action meets the evidence threshold. E.g. "This often helps when stress is high." | `getWhatUsuallyHelpsForAction(primarySuggestion.id, suggestedActionsTaken)` |
| **Weekly review card (Home)** | Section **"What usually helps"** with a list of full sentences (e.g. "Quick reset often helps when stress is high."). Shown when `whatUsuallyHelpsList.length > 0`; card is also visible when only this section has content. | `getWhatUsuallyHelps(suggestedActionsTaken)` → `whatUsuallyHelpsList` |
| **Future insights tab** | Small pattern card(s) with the same copy. Not built yet; data is ready. | Call `getWhatUsuallyHelps(suggestedActionsTaken)` and render `item.copy` (and optionally `item.contextPhrase`, `item.actionLabel`). |

All copy is generated from `suggestedActionsTaken` (with optional `systemImpact` / `drivers`) and the same evidence rule; no separate backend.
