# 3-Question Clarity Test (Pre–App Store)

*Not an official Apple doc — reflects the design philosophy behind products that feel clear and useful instead of overwhelming (e.g. iPhone, Headspace, Calm).*

---

## The test

**Before shipping, ask:** Can a new user answer these three questions **in under 10 seconds** of opening the app?

1. **How am I doing?** (Status)
2. **Why might that be happening?** (Cause)
3. **What should I do next?** (Action)

- **If yes** → Ship it.
- **If no** → Simplify until they can.

---

## Why it works

When all three are answerable quickly, the product delivers **behavior guidance**, not just tracking. The loop is:

**Status → Cause → Action**

That’s the Life OS design goal.

---

## How InGauge answers each question

### 1️⃣ How am I doing? (Status)

**Where it appears (Cockpit / Home):**

- **Top:** Greeting + **System status** label (e.g. Thriving, Stable, Strained, Needs support) + optional one-line summary.
- **Below:** Six gauges (Body, State, Emotion, Connection, Direction, Alignment) + center score. “Needs care” strip if any gauge is low.

**Target:** User can see “Body: low, State: stressed, Connection: okay” in **under 3 seconds**.

**InGauge:** Cockpit + gauges are built for this. ✅

---

### 2️⃣ Why might that be happening? (Cause)

**Where it appears:**

- **“Influencing your system”** card: short line (cross-system insight, driver-based line, or “Patterns from your recent check-ins”).
- **Forecast strip/card:** “Tomorrow may feel…” (forward-looking cause/risk).
- **Unified Insight Card** (“What we’re seeing”): cascade, pattern, cause insights.
- **Gauge detail / Patterns:** drivers, influencing systems, cascades.

**Target:** User gets a causal line, e.g. “Recovery has been low,” “Work pressure is affecting Direction.”

**InGauge:** Drivers, influencing systems, insights, cascades, patterns. Stronger than most apps that stop at “You slept 5h.” ✅

---

### 3️⃣ What should I do next? (Action)

**Where it appears:**

- **Primary suggestion** in “Influencing your system” card (driver-aware): one clear CTA (e.g. “Pick one task to move,” “Reach out to someone,” “Quick Reset”).
- **CockpitPriorities:** up to 4 items (goal nudge, tool suggestions, hero reach-out).
- **Ritual entry:** Morning / Evening ritual + Emergency.
- **Needs care strip:** “Tap to check in.”

**Target:** User sees at least one concrete next step.

**InGauge:** Driver-aware suggestions, rituals, reach out, reset tools, prioritize. ✅

---

## Clarity checklist (first screen)

| Question              | Where on Cockpit                         | Pass? |
|-----------------------|------------------------------------------|--------|
| How am I doing?       | Header (system status) + gauge cluster   | ✅     |
| Why might that be?    | “Influencing your system” line + forecast| ✅     |
| What should I do next?| Primary suggestion + priorities + rituals| ✅     |

Run once with a fresh user: can they answer all three in **under 10 seconds** without scrolling? If anything is unclear or buried, simplify that one thing.

---

## Rule before freezing features

**Every feature in the app should support one of the three:**

- **Status** — gauges, constellation, cockpit
- **Cause** — drivers, influencing systems, cascades, insights
- **Action** — suggestions, rituals, reach out, reset tools

If something doesn’t support Status, Cause, or Action, treat it as potential bloat and justify or cut.

---

## Summary

InGauge already implements the full loop:

- **Status** → cockpit, gauges, snapshot  
- **Cause** → drivers, influencing systems, cascades, insights  
- **Action** → suggestions, rituals, reach out, reset, prioritize  

The right question now is: **“How can I make this clearer?”**  
**Clarity > features.**
