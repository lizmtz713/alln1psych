# Influencing Card — Polish Pass Summary

## 1. Summary of changes

- **Card priority and caps:** The "Influencing your system" card now shows at most one primary suggestion, one pattern insight line, and one weekly line (only when it adds new information). Content is ordered: (1) strongest driver-aware suggestion, (2) one recent pattern insight, (3) optional weekly driver line.
- **Wording:** All suggestion copy was updated to be more human and specific; each action has a stable `id` for follow-through tracking.
- **Overcrowding:** Removed multiple suggestion buttons and multiple pattern lines. The card never shows more than one CTA, one supporting pattern line, and one optional weekly line.
- **Action follow-through:** Tapping the primary suggestion calls `recordSuggestedActionTaken({ actionId, route, label })`. The last 50 events are stored in the cockpit store and persisted for future learning.

---

## 2. Files changed

| File | Changes |
|------|--------|
| **`src/services/driverAwareSuggestions.ts`** | Added `id` to every suggestion; refined labels to be human and specific; added `getPrimarySuggestion()` that returns the single strongest action. |
| **`src/stores/cockpitStore.ts`** | Added `suggestedActionsTaken` (max 50) and `recordSuggestedActionTaken()`. Persisted in cockpit storage. |
| **`src/services/checkInPatternInsights.ts`** | Added `weeklyLineAddsNewInfo(primaryPatternLine, weeklyLine)` so the card only shows the weekly line when it adds new information (e.g. different driver or no pattern line). |
| **`app/(tabs)/index.tsx`** | Card uses `getPrimarySuggestion` for one CTA; shows at most one pattern line and one weekly line (when `weeklyLineAddsNewInfo`); on suggestion tap calls `recordSuggestedActionTaken` then navigates. Memoized `primarySuggestion`, `primaryPatternLine`, `showWeeklyInCard`. |
| **`docs/INFLUENCING-CARD-POLISH.md`** | This summary and rules doc. |

---

## 3. New card priority rules

When multiple content types are available, the card displays in this order:

1. **Strongest current driver-aware suggestion** — One primary CTA (from `getPrimarySuggestion`), shown as a single tappable line. No "Suggested:" prefix; the label is the full copy (e.g. "Pick one thing to move — it can ease the pressure.").
2. **One recent pattern insight** — At most the first line from `getPatternInsights(history)` (e.g. "Work has influenced your system 3 times this week.").
3. **Weekly driver line only if it adds new information** — `topDriverThisWeek` is shown only when `weeklyLineAddsNewInfo(primaryPatternLine, topDriverThisWeek)` is true (avoids repeating the same "this week" / same driver as the pattern line).

**Cap:** 1 primary suggestion + 1 supporting pattern line + 1 optional weekly line. The card never becomes a dense stack of text.

---

## 4. Updated suggestion wording strategy

- **Human, specific, one clear action per line.** No generic "Reach out" without context; when drivers are present we use driver-aware copy.
- **Same underlying logic:** Driver + impact combinations still drive which suggestion is chosen; only the displayed string changed.

| Context | Before | After |
|--------|--------|--------|
| Direction + Work/Tasks | "Prioritize one task to reduce pressure" | "Pick one thing to move — it can ease the pressure." |
| Connection + Family/Friends/Partner | "Send a quick message to someone important" | "Send a quick text to someone who matters to you." |
| Body/State + Sleep | "A short rest or earlier sleep tonight could help" | "A short rest or an earlier night could help." |
| Direction + Tasks only | "Pick one task to move forward" | "Choose one task and give it 20 minutes." |
| State/Emotion + Stress | "Quick reset or breathe" | "Try a quick reset or a few deep breaths." |
| Connection (fallback) | "Reach out to someone" | "Reach out to one person today." |
| Body (fallback) | "Short walk or hydration" | "A short walk or a glass of water." |
| Direction (fallback) | "Prioritize one task" | "Pick one task to focus on." |
| Alignment (fallback) | "Check in with your values" | "Check in with what matters to you." |

---

## 5. How action follow-through is tracked

- **When:** User taps the single primary suggestion in the "Influencing your system" card.
- **What is stored:** `recordSuggestedActionTaken({ actionId, route, label })` is called before navigation. The store appends `{ actionId, route, label?, takenAt: ISO string }` to `suggestedActionsTaken`.
- **Where:** `cockpitStore.suggestedActionsTaken` (array, max 50 entries). Persisted with the rest of the cockpit in AsyncStorage.
- **Ids used:** Same as in `driverAwareSuggestions.ts`: e.g. `direction-prioritize`, `connection-reach-out`, `body-rest-sleep`, `state-quick-reset`, `alignment-values`, etc.
- **Future use:** This list can be used to learn which suggested actions the user actually follows (e.g. to rank or personalize suggestions, or to power insights like "You often find quick reset helpful when stress is high."). No UI changes for that yet; the groundwork is in place.
