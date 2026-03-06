# Relationship Timeline

**Product spec · Visual history of a connection**

The Timeline is the layer that adds **history** to InGauge. Humans understand relationships through stories over time (Narrative Psychology, Social Psychology), not just snapshots. Instead of only seeing a momentum score, users see how the relationship evolved.

---

## 1. What the Timeline Is

Each person has a **Connection Timeline** — a visual history of your connection.

- **Where it lives:** Inside the **Person Detail Sheet** (opened from Signals when you tap a person).
- **Section title:** "Connection Timeline".
- **Content:** Chronological list of events (newest first): transmits, calls, meetups, celebrations, repairs, milestones. Minimal text, simple icons, expandable details. Feel like **memory lane**, not a CRM audit log.

Example:

- Today — You sent encouragement  
- 3 weeks ago — Call (45 min)  
- Jan 2026 — Celebrated birthday  
- Oct 2025 — Reconnected  
- 2022 — Relationship went dormant  

---

## 2. Event Types

| Type             | Meaning                    | Source / notes                          |
|------------------|----------------------------|-----------------------------------------|
| `message_sent`   | Message / Transmit         | Connection log: mind-mail, text        |
| `call`           | Phone / video call         | Connection log: call (duration optional)|
| `meeting`        | In person, video, social   | Connection log: in-person, video, social|
| `celebration`    | Celebration                | User-added or stored (future)           |
| `repair`         | Repair / clearing up       | User-added or stored (future)           |
| `milestone`      | Relationship milestone     | User-added or stored (future)           |
| `season_change`  | Season changed             | System (future)                         |
| `reconnection`   | Reconnected after quiet    | **Trigger:** season dormant → growth (e.g. user taps Reconnect). Stored in `timelineEventsByMemberId`. |

**Implementation:** Timeline is built from **connection log** + **stored timeline events** (`timelineEventsByMemberId`). Reconnection is auto-added when user sets season to Growth from Dormant. Other standalone events (milestone, celebration, repair, season_change) use the same type system; UI for adding them can be added later.

---

## 3. Data Model

**Types:** `src/types/timeline.ts`

- `TimelineEventType` — union of the event types above (including `reconnection`).
- `TimelineEventEntry` — stored event: `id`, `dateIso`, `type`, optional `note`, `durationMinutes`.
- `TimelineDisplayItem` — UI model: `id`, `date`, `type`, `label`, optional `sublabel`, optional `count` (for grouped same-day).

**Sources:** (1) Each light’s `connectionLog`. (2) **Stored events** in `lightsStore.timelineEventsByMemberId` — used for events that are not auto-derived: `reconnection` (when dormant → growth), `milestone`, `celebration`, `repair`, `season_change`, manual memory. Timeline is built by `buildTimelineFromLight(light)`, which merges log + stored, then groups same-day. **First memory:** optional `relationshipOrigin?: { year, note? }` on light (from lightExtras) adds a "You met" (or custom note) row at the oldest point.

---

## 4. Timeline Engine

**File:** `src/services/timelineEngine.ts`

- **`buildTimelineFromLight(light)`** — Merges `connectionLog` + `light.timelineEvents`, adds `relationshipOrigin` as first memory if set, **groups same-day events** into one row (e.g. "Today — 3 interactions"), sorts by date descending, returns last N (e.g. 12). Timeline must feel like **highlights**, not a full log.
- **`formatTimelineDate(date)`** — Relative/calendar labels: "Today", "Yesterday", "3 weeks ago", "Jan 2026", etc.
- **`getHeroTimelineHint(light)`** — Story-based nudge for Hero: e.g. "You haven't talked with Alex since your last call in January." Used in Signals hero card when no life-event label.
- **`getLastInteractionSummary(light)`** — Short summary for Constellation card: "Last interaction: 3 weeks ago — Call."

Connection log types are mapped as: mind-mail, text → `message_sent`; call → `call`; video, in-person, social → `meeting`.

---

## 5. UI Rules

- **Chronological** (newest first).
- **Limit density** — Timeline must feel like **highlights**, not a full log. If multiple interactions occur the same day, show one row: e.g. "Today — 3 interactions" (grouping rule).
- **Icons first, labels second** — Icons communicate event type faster than text. Use simple icons per type (mail, call, people, heart, hand-left, flag, leaf, reconnection → heart).
- **Minimal text** — short label + optional sublabel (e.g. "Call (45 min)").
- **Expandable details** — can be added later (e.g. tap row to see note/summary).
- **Emotional rule** — Timeline should feel like **memory lane**, not activity logs. Avoid repetitive "message sent" × 3; prefer grouping or varied labels. No guilt.

---

## 6. Place in the InGauge System

| Layer        | Role                          |
|-------------|--------------------------------|
| **Timeline**   | History — how you got here     |
| **Constellation** | Awareness — current state      |
| **Momentum**    | Strength — current score       |
| **Seasons**     | Context — growth/active/dormant/archived |
| **Signals**     | Guidance — what needs attention today    |
| **Transmit**    | Action — send encouragement    |

Together: **Timeline → history; Constellation → awareness; Momentum → strength; Seasons → context; Signals → guidance; Transmit → action.**

---

## 7. Timeline + Rest of System

- **Hero + Timeline** — Implemented. Hero card can show story-based nudge from `getHeroTimelineHint(light)` (e.g. "You haven't talked with Alex since your last call in January.").
- **Constellation + Timeline** — Implemented. When user taps a node, Constellation Person Card shows `getLastInteractionSummary(light)` (e.g. "Last interaction: 3 weeks ago — Call."). Bridges space (Constellation) with time (Timeline).

## 8. Storage Strategy

- **Derive first:** Most timeline rows come from `connectionLog`. No extra storage for those.
- **Store only non-derived:** `timelineEventsByMemberId` holds events that are not auto-derived: `reconnection` (when user taps Reconnect from Dormant), `milestone`, `celebration`, `repair`, `season_change`, manual memory. Keeps storage clean.

## 9. Future Enhancements

- **Momentum over time** — Historical momentum graph (e.g. by month/year) on person detail.
- **Season history on timeline** — Subtle markers: 🌱 Growth, 🌿 Active, 🍂 Dormant, ❄ Archived (e.g. "2024 — 🍂 Relationship became dormant").
- **Timeline insights** — Pattern-based copy, e.g. "You reconnect with Alex every winter."
- **User-added events** — Add celebration, repair, milestone from Person sheet or full profile.

---

## 10. Why This Matters

Users start seeing their relationships as **living stories** instead of contacts to maintain. That’s emotionally powerful and aligns with the app’s goal: a human relationship OS, not a normal contact app.
