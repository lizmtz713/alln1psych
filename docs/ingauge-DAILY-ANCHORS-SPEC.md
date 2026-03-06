# Daily Anchors — "Your Life Today"

**Product spec · Home section**

---

## 1. Purpose

A dedicated home section that anchors the user in **today**: system check (gauges), connection prompt (who to reach out to), and a daily insight. Resets at midnight so each day feels fresh.

---

## 2. "Your Life Today" Section

- **Placement:** Home screen, above or below cockpit (configurable). High visibility.
- **Contains:**
  1. **System Check card** — Quick prompt to check in (6 gauges). If already checked in today → show **post-check insight** (one line from Unified Insight Engine or gauge summary).
  2. **Connection Prompt card** — "Reach out to [Name]" with priority logic (Lights/circle: who needs attention, who hasn’t been contacted in a while). Tappable → Log contact or Mind Mail / Reach Out.
  3. **Daily Insight** — One generated insight (patterns, correlations, milestones). Can reuse existing DailyInsight / contextual insight; optionally drive from daily store.

---

## 3. System Check Card

- **If not checked in today:** CTA "How are you today?" / "Quick check-in" → opens cockpit check-in.
- **If checked in today:** Show **post-check insight** (e.g. "Your Body and State are low — small steps today" or "Connection has been steady this week").
- **Data:** Use cockpit store `lastCheckInDate` and cockpit-checkin completion; optional one-line insight from `useGeneratedInsights` (postCheckIn context) or cross-system insight.

---

## 4. Connection Prompt Card

- **Priority logic:**
  1. Circle/Lights nudges (who could use a check-in).
  2. Flickering / overdue contact (Lights: days since contact by tier).
  3. Fallback: "Someone you haven’t talked to in a while" or "Send a quick note to someone who matters."
- **Action:** Tap → open Reach Out scaffold, or Log contact for a specific light, or Mind Mail compose.
- **Data:** Circle store (members, nudges), Lights store (getDailyReachOuts, getLightBrightness).

---

## 5. Daily State Store (Midnight Reset)

- **Store:** `dailyAnchorsStore` or extend a daily state.
- **Fields (per day, keyed by YYYY-MM-DD):**
  - `systemCheckDone: boolean` (or derive from cockpit `lastCheckInDate`).
  - `connectionPromptActedOn: boolean` (optional).
  - `dailyInsightSeen: boolean` (optional).
- **Reset:** At app open, if current date > stored date, clear or recompute for today. No need for a literal "midnight" timer; date comparison on launch is enough.

---

## 6. Daily Insight Generation

- **Sources:** Patterns (e.g. "You check in most on Tuesdays"), correlations (e.g. "When Body is low, State tends to follow"), milestones (e.g. "7-day streak").
- **Delivery:** One card or line in "Your Life Today" or existing DailyInsight section. Can use `useGeneratedInsights` with a "daily" or "home" context.

---

## 7. Notification Scheduling (Optional)

- **Spec:** Schedule a single daily notification (e.g. morning) to open app / "Your Life Today" — "Time for your daily check-in" or "Who have you connected with today?"
- **Implementation:** Use Expo Notifications; store user preference (on/off, time) in settings.

---

## 8. TypeScript Interfaces

- `DailyAnchorsState`: `{ date: string; systemCheckDone: boolean; connectionPromptActedOn?: boolean; dailyInsightSeen?: boolean }`.
- `SystemCheckCardProps`: `{ checkedInToday: boolean; onPressCheckIn: () => void; postCheckInsight?: string }`.
- `ConnectionPromptCardProps`: `{ suggestedName?: string; suggestedReason?: string; onPress: () => void }`.

---

## 9. Implementation Priority

1. Daily state store with date key and midnight reset.
2. System Check card (CTA vs post-check insight).
3. Connection Prompt card with priority from Lights/circle.
4. "Your Life Today" wrapper on home; add `showYourLifeToday` to home sections.
5. Daily Insight wiring (reuse or extend).
6. Notification scheduling (optional).
