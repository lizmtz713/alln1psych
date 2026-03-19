# The InGauge Navigation Loop

**The most important system concept for the app.** If this is implemented well, the whole product feels coherent instead of like separate features.

---

## The Loop

The system should always follow this pattern:

```
Signals  →  Insight  →  Action  →  Reflection  →  Updated Signals
   ↑                                                      │
   └──────────────────────────────────────────────────────┘
```

That’s the entire philosophy: **one repeating cycle** that ties Cockpit, Signals, Tools, Decisions, People, and Learn into a single navigation system.

---

## Step 1: Signals (Understanding)

Signals come from:

- **Gauges** — Body, State, Emotion, Connection, Direction, Alignment
- Behavior patterns (check-ins, usage)
- User input (conversations, journal)
- Wearables (later)
- Relationship data (circle, lights)

Example: *Emotion: low · State: tense · Connection: stable* → the system infers that something emotional may be going on.

**Signals alone are not useful.** They must lead to the next step.

---

## Step 2: Insight (Interpretation)

The system turns signals into **meaning**.

Examples:

- *Your emotional state is lower than usual. You may be feeling overwhelmed.*
- *You haven’t connected with your circle recently.*

This step answers: **What might be going on?**

Surfaces: Cockpit copy, “Influencing your system,” system insight of the day, relationship insight, gauge-triggered explanations.

---

## Step 3: Action (Tools)

The system suggests **one helpful action** (or a small, clear set).

Examples:

- Quick Reset  
- Tone Check  
- Repair Builder  
- Reach Out  
- Check-in  

This is where the **Helpful Right Now** strip and primary suggestion live. Never leave the user at “Signal → confusion.” Always move them **Signal → Action**.

---

## Step 4: Reflection (Learning)

After the action, the user reflects.

Examples:

- *Did this help?* / *Feeling calmer?*
- *What did you learn?*
- Optional micro-lesson: *Lesson: How to start difficult conversations*

This builds skill over time. Surfaces: post-tool prompts, Learn tab, just-in-time lessons.

---

## Step 5: Updated Signals

The system (and user) updates state.

Examples:

- Emotion improved  
- Connection improved  
- State calmer  

Check-ins, tool completion, and conversation summaries feed back into the cockpit. Then the loop repeats.

---

## What the user experiences

**Without the loop:** *“This app has a lot of features.”*

**With the loop:** *“This app helps me understand what’s happening and shows me what to do next.”*

That’s the difference.

---

## How this shows up in the UI

| Loop step   | Surface in the app                          |
|------------|----------------------------------------------|
| **Signals** | Cockpit (gauges, cluster), People signals    |
| **Insight** | System insight of the day, “Influencing your system,” relationship insight, gauge explanations |
| **Action** | Helpful Right Now (single CTA + strip), CockpitPriorities, primary suggestion |
| **Tools**  | Quick Reset, Tone Check, Decisions, Reach Out, etc. |
| **Reflection** | Post-tool prompts (“Feeling calmer?”), Learn, just-in-time lessons |
| **Updated Signals** | Check-in → cockpit update; tool completion; conversation impact |

---

## Key design rule

**Always move the user from Signal → Action.**

Never leave them stuck at **Signal → confusion**. That’s the main failure mode of dashboards: data without a clear next step.

So:

- Every meaningful signal should have an associated **insight** (what might be going on).
- Every insight should have at least one **action** (what to do next).
- Every action should have a path to **reflection** and **updated signals**.

---

## Example: Real scenario

1. User opens the app.
2. **Cockpit:** Emotion low, State tense.
3. **Helpful Right Now:** *Give yourself a quick reset.*
4. User taps **Quick Reset** and completes it.
5. **After the tool:** *Feeling calmer?* Optional lesson: *How to pause before reacting.*
6. **Signals update** (e.g. state/emotion from check-in or tool).
7. Loop repeats.

---

## Why this is powerful

Most apps either **show data** or **offer tools**. This app does both **in sequence**: understand → interpret → act → reflect → update. That’s what makes it feel like a **navigation system** for life and relationships.

---

## Current implementation (reference)

- **Signals:** `CockpitCluster`, gauge values in `cockpitStore`, People signals (`CockpitSignalsPreview`).
- **Insight:** `getSystemInsightOfTheDay`, "Influencing your system" copy, compassion line when state/emotion low, relationship insight from `getRelationshipInsight`.
- **Action:** Single "Helpful right now" CTA is signal-driven: first visit / no gauges → Check in; low emotion or state → Quick Reset; need attention (circle) → Reach out; else → Tone Check. Plus `CockpitPriorities`, primary suggestion, and the "Helpful right now" tools strip.
- **Reflection:** Learn tab, just-in-time lessons; post-tool flows (e.g. "Feeling calmer?") live in individual tools.
- **Updated Signals:** Check-in and tool completion update `cockpitStore`; loop repeats.

When adding or changing features, keep the loop in mind: every signal path should lead to an insight and at least one action; every action should have a path to reflection and back to updated signals.

---

## Related docs

- **COCKPIT_INSTRUMENT_PANEL.md** — How the cockpit displays signals.
- **SIGNALS_CONSTELLATION_LOOP.md** — Relationship slice (Constellation → Signals → Transmit → Reinforcement).
- **ingauge-GAUGE-TRIGGERED-TOOLS-SPEC.md** — How gauges drive tool suggestions.
