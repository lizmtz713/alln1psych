# Context System — Why Your Gauges Are What They Are

**Humans don’t operate in isolation.** Behavior and gauges are highly context-dependent. Without context, a dashboard is incomplete; with it, the system feels like **understanding**, not just tracking.

---

## 1. Role of context

**Context → affects gauges → affects behavior → affects relationships.**

So the full architecture is:

```
Context
   ↓
Body / State / Emotion / Connection / Direction / Alignment
   ↓
Signals / Tools
   ↓
Learning (Manual)
```

Context explains *why* a gauge is low or shifting. Example: “Emotion ↓ — Possible contributors: Sleep debt, Stress load.”

---

## 2. Context categories

| Category         | Examples |
|------------------|----------|
| **Biological**   | Sleep, menstrual cycle, illness, physical recovery |
| **Environmental**| Weather, season, daylight |
| **Life**         | New job, moving, breakup, exams, parenting stage |
| **Social**       | Conflict, celebration, isolation |
| **Cognitive**    | Stress load, decision fatigue, burnout |

---

## 3. Where context appears (no separate tab)

Context is **not** its own tab. It appears inside existing surfaces:

| Surface  | Use of context |
|----------|-----------------|
| **Cockpit** | System explanations: “Sleep debt detected”, “Cycle phase — late luteal”, “Life transition: you recently moved”. Optional “Possible contributors” under a gauge (e.g. Emotion ↓). |
| **Signals** | Social context: e.g. “Jake recently became a new parent. Connections may be quieter right now.” |
| **Tools**    | Situational advice: e.g. “You seem stressed today. Try a 2-minute reset.” |

---

## 4. Example Cockpit context block

Below the gauges:

**Context**

- *Sleep debt detected — You slept 4.5 hours last night.*
- *Cycle phase — Late luteal phase; mood fluctuations are common.*
- *Life transition — You recently moved cities.*

Tone: factual, non-judgmental. Context explains; it doesn’t blame.

---

## 5. Example insight with contributors

Instead of only:

> Emotion ↓

Show:

> Emotion ↓  
> *Possible contributors: Sleep debt, Stress load.*

Same color logic (e.g. orange/red), but the user gets *why*, which supports agency and reduces shame.

---

## 6. Data sources (implementation)

- **Sleep** — Apple Health / Oura (or user-reported).
- **Cycle** — User opt-in cycle tracking (if integrated).
- **Life events** — User-entered (e.g. “moved”, “new job”) or optional prompts.
- **Stress / load** — Inferred from check-ins, or optional short survey.

Context can be **stored** (e.g. `contextByDate`, `lifeEvents[]`) or **derived** at read time. Start with a small set of context types and expand.

---

## 7. Design rules

- **Explain, don’t judge** — “Sleep debt” is informational, not “You failed.”
- **Optional** — User can dismiss or disable specific context types (e.g. cycle).
- **Privacy-first** — Sensitive context (cycle, life events) is user-controlled and not shared.
- **Consistent placement** — e.g. “Context” section below the cluster in Cockpit; same pattern elsewhere.

---

## 8. Why this makes InGauge a Human OS

Most apps focus on one domain (fitness, productivity, therapy, social). InGauge aims for **human system navigation** across body, state, emotion, connection, direction, and alignment. The **Context layer** is what turns a set of gauges into a system that explains itself. That’s the difference between “tracking” and “understanding.”
