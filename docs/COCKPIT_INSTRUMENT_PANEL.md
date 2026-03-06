# Cockpit — Human OS Instrument Panel

**One central system display, not six widgets.** Tesla / Apple / Garmin / aviation: a single instrument cluster that answers *How is my human system doing right now?*

---

## 1. Design principle

The Cockpit must feel **calm, organized, instrument-like** — not busy, gamified, or social. Think **aircraft panel**, not social feed.

---

## 2. Layout (integrated system)

One cluster, not six cards:

```
        BODY

  STATE        EMOTION

      SYSTEM SCORE

 CONNECTION     DIRECTION

      ALIGNMENT
```

- **Body** — top
- **State** and **Emotion** — middle left/right
- **System Score** — center (single summary signal)
- **Connection** and **Direction** — below center left/right
- **Alignment** — bottom

Implementation: hexagonal positions (e.g. Body -90°, State -30°, Emotion 30°, Connection 90°, Direction 150°, Alignment 210°) so the brain sees one integrated system and recognizes imbalance quickly.

---

## 3. System Score (center gauge)

The center is the **Human System Score**.

- **Value:** 0–100 (average or weighted composite of the six gauges).
- **Label (status bands):**
  - **80–100** — Thriving
  - **60–79** — Stable
  - **40–59** — Strained
  - **0–39** — Needs support

Same logic everywhere: one number + one word. Tesla does this with battery/vehicle health; we do it for the human system.

Tap center → check-in (or Pre-Flight / Post-Flight when those are active).

---

## 4. Color logic

Every gauge and the center use the **same** gradient:

- **Green** — balanced / strong
- **Yellow** — caution
- **Orange** — strained
- **Red** — needs attention

Never mix color meanings across the app. Consistency is critical.

---

## 5. Gauge interaction

Tap a gauge → **expand into a deep screen** (modal or stack).

| Gauge      | Deep screen contains |
|-----------|-----------------------|
| Emotion   | Emotional check-in, emotional vocabulary, journal, patterns |
| Body      | Sleep, movement, energy, health inputs |
| Connection| Signals shortcut, relationship momentum, social health |
| State     | Nervous system check-in, regulation tools |
| Direction | Purpose / momentum, goals |
| Alignment | Values, congruence |

Cockpit stays the **control center**; deeper features live in gauge-detail, check-in, and other modals.

---

## 6. Morning ritual — Pre-Flight

When the user opens the app in the **morning**, optionally show **Pre-Flight** before the dashboard:

**Pre-Flight check**

- How did you sleep?
- How are you feeling?
- Anything on your mind today?

Then gauges update. This mirrors aviation pre-flight and sets the tone for the day.

Implementation: time-of-day gate (e.g. 4am–12pm) + “pre-flight not done today” → show Pre-Flight first; on complete → show Cockpit.

---

## 7. Evening ritual — Post-Flight

**Post-Flight**

- What went well today?
- Anything weighing on you?

Updates gauges and patterns. Can be shown when opening app in evening (e.g. after 6pm) or via a dedicated “End day” action.

---

## 8. Pattern insights (below gauges)

Below the cluster, show **pattern insights** when available:

- *“You feel better when you reach out to friends.”*
- *“Sleep below 6 hours lowers your State gauge.”*

These tie gauge states to behavior and context. Data can come from cross-system insight, drift engine, or manual rules.

---

## 9. Human OS loop

- **Observe** → Cockpit  
- **Understand** → Manual  
- **Act** → Signals / Tools  
- **Reflect** → Rituals (Pre-Flight, Post-Flight)

---

## 10. What lives in Cockpit (summary)

- One **instrument cluster** (6 gauges + center System Score)
- Optional **Pre-Flight** (morning) / **Post-Flight** (evening)
- **Context** strip below (see Context System spec) — e.g. “Sleep debt detected”, “Cycle phase”
- **Pattern insights** below that
- Quick actions: check-in, share, wins (existing)
- No feed, no social clutter — one question: *How am I doing?*

---

## 11. Files

- `src/components/CockpitCluster.tsx` — hex layout, center ring ("System" + score + band), gauge rings, tap handlers. Center label uses `getSystemScoreLabel` (Thriving / Stable / Strained / Needs support).
- `src/utils/gaugeHelpers.ts` — `getSystemScoreLabel`, `getOverallStatusLabel`, `getGaugeColor`, `SYSTEM_SCORE_BANDS`
- `src/components/home/CockpitContextStrip.tsx` — Context strip below cluster; accepts `ContextItem[]` (label + detail). Renders nothing when empty. See CONTEXT_SYSTEM.md.
- `src/stores/cockpitStore.ts` — gauge state, overall/center score
- `app/(tabs)/index.tsx` — Cockpit tab; renders CockpitCluster, CockpitContextStrip (items from context layer when wired), and surrounding sections
