# Life OS — Roadmap & Emerging Loops

The app is evolving into a **Human Life Operating System**: one large loop — **Observe → Understand → Guide → Learn** — with many interconnected systems (gauges, check-ins, drivers, suggestions, pattern insights, “what usually helps,” etc.). Roughly 20+ systems today.

What follows are the **three loops still emerging** to make the system fully complete. They are spec-level for now; implement when ready.

---

## 1. Forecast Loop

**Goal:** Predict future system states from current signals.

**Examples:**
- Sleep deficit → likely low energy tomorrow
- Sustained low connection → risk of isolation spiral
- Direction overload + no rest → state drop in 1–2 days

**What it needs:**
- Inputs: gauge history, check-in context (sleep, stress), drivers, maybe calendar/weather
- A lightweight prediction layer (rules or simple models) that outputs “likely tomorrow” or “watch out for X”
- Surfaces: cockpit alert strip, ritual prompts, or a small “Forecast” card

**Serves:** **Observe** (we have the data) → **Understand** (we infer “what’s coming”) → **Guide** (suggest preventive actions).

---

## 2. Social Reciprocity Loop

**Goal:** Track both **care given** and **care received** to build relationship awareness.

**Examples:**
- “You reached out to 3 people this week; 2 reached out to you.”
- “Your circle has been giving more than receiving lately.”
- Nudges that consider balance, not just “reach out to X.”

**What it needs:**
- Definitions of “care given” (e.g. sent message, logged contact, nudge sent) and “care received” (e.g. received message, was contacted, got a nudge)
- Per-relationship or aggregate counts over a window (e.g. week)
- Surfaces: Circle/Lights, weekly review, or a small “Reciprocity” insight

**Serves:** **Observe** (who gave/received) → **Understand** (balance, patterns) → **Guide** (who to reach out to, or how to receive more).

---

## 3. Personal Strategy Loop

**Goal:** Identify **what works for this user** and reinforce it.

**Examples:**
- “Walking improves your state.”
- “Reaching out improves connection.”
- “Prioritizing one task reduces direction stress.”

**What it needs:**
- Link **actions taken** (e.g. from `suggestedActionsTaken`, rituals, tools used) to **gauge changes** (before/after or next-day). We already have “what usually helps” (action + context); this adds **outcome** (did state/connection/direction improve?).
- A simple “strategy” store or view: action → typical gauge deltas or correlation
- Surfaces: “What usually helps” (already started), weekly review, insights tab, or a “What works for you” card

**Serves:** **Learn** (we see what actually moved the needle) → **Understand** (personal playbook) → **Guide** (suggest what works for *you*).

---

## Big picture

| Loop              | Observe              | Understand              | Guide                        | Learn                    |
|-------------------|----------------------|--------------------------|------------------------------|--------------------------|
| **Forecast**      | Gauges, sleep, stress| “What’s likely next”     | Preventive suggestions       | —                         |
| **Social reciprocity** | Care given/received | Balance, patterns        | Who to reach out to / receive from | —                 |
| **Personal strategy** | Actions + gauge history | “What works for you” | Suggest proven actions       | Action → outcome links    |

All three feed the same meta-loop: **Observe → Understand → Guide → Learn**, i.e. a Human Life Operating System.

---

## Current state vs missing

| Piece                         | Status |
|------------------------------|--------|
| Observe (gauges, check-ins, drivers, context) | ✅ In place |
| Understand (pattern insights, cross-system insight, “what usually helps”) | ✅ In place |
| Guide (driver-aware suggestions, personalization, rituals) | ✅ In place |
| Learn (suggestedActionsTaken with context, “what usually helps” evidence) | ✅ In place |
| **Forecast** (predict tomorrow / risk)        | 🔲 Not built |
| **Social reciprocity** (care given/received)  | 🔲 Not built |
| **Personal strategy** (action → outcome)      | 🔲 Partial: we have “what usually helps” by context; missing outcome linkage |

Implementing these three loops is the next step to make the system **fully complete** while keeping the architecture one coherent Life OS.

---

## Five Influencing Systems (explain why gauges move)

Beyond the six core gauges, the Life OS models five **influencing systems** from research (behavioral science, neuroscience, psychology, sociology, longevity): **Recovery**, **Attention**, **Reciprocity**, **Meaning**, **Environment**. They are not additional gauges; they are drivers, context, and pattern insight language.

- **Recovery** — sleep, rest, nervous system reset; maps to body/state sleep drivers + checkInContext.sleep.
- **Attention** — focus, task switching, cognitive load; maps to dir-work, dir-tasks, dir-overload, state-distraction.
- **Reciprocity** — care given vs care received; from connection logs (initiatedBy).
- **Meaning** — purpose, values, identity; maps to align-values, align-purpose, etc.
- **Environment** — weather, daylight, location; optional future context/drivers.

See **docs/LIFE-OS-INFLUENCING-SYSTEMS.md** for the full architecture and mapping. Implementation: `src/lib/influencingSystems.ts`; forecast and pattern insights use system labels in copy (e.g. "Recovery has been low", "Attention may strain your state").
