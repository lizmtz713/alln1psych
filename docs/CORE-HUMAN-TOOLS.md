# The 7 Core Human Tools (What Humans Actually Need)

This doc maps the evidence-based minimal tool set to InGauge. No bloat — clarity and ship readiness.

**Sources:** CBT, coaching frameworks, resilience training, behavioral science, emotional regulation research.

---

## The 7 Categories

### 1. Awareness Tool ✅ (No changes needed)

**Purpose:** *Understand what is happening inside me.*

**InGauge:** Gauges, quick log, cockpit, insights, drivers, patterns.

**Status:** Strong. No changes needed.

---

### 2. Nervous System Reset Tool ✅ (Critical)

**Purpose:** *Reduce stress quickly.*

**InGauge:** **Quick Reset** — box breathing, physiological sigh, 5-4-3-2-1 grounding, cold reset, shake it out, **short walk**.

**Route:** `/tools/quick-reset` (and modal `/(modals)/quick-reset` from some entry points).

**Status:** Complete. Includes the requested options.

---

### 3. Thinking Tool (Cognitive Reframe) ✅

**Purpose:** *Help with distorted thinking — evidence, reframe, “what would I tell a friend?”*

**InGauge:**
- **Decode** — message analysis and response (conversation-specific).
- **Thought Challenger** — CBT-style thought challenge: distortion name, evidence, reframe, action. In Activity modal: `/(modals)/activity?id=thought-challenger`.

**Surface:** Tools tab (Decode). Thought Challenger is in Try today / Activities; can be surfaced as “Reframe” in Essential 7.

**Status:** Present. Decode = messages; Thought Challenger = general cognitive reframe.

---

### 4. Decision Tool (Clarity) ✅

**Purpose:** *What should I do? Options, pros/cons, values, next step.*

**InGauge:** **Decision** (8-step + quick), **Goals**, **Prioritize** (direction, goals, cockpit priorities).

**Routes:** `/tools/decision`, `/profile/goals`, cockpit “Influencing your system” + CockpitPriorities.

**Status:** Covered. Decision tool + goals/prioritize = clarity.

---

### 5. Relationship Repair Tool ✅

**Purpose:** *Conflict, misunderstandings, difficult conversations — prepare with structure.*

**InGauge:**
- **Reach Out** — reconnection options, check-in messages, **repair script** (open → acknowledge → ask → close), shared activities. Route: `/(modals)/reach-out-scaffold`.
- **Pre-Conversation Check** — regulation before high-stakes talk. Route: `/(modals)/pre-conversation-check`.

**Repair prompts (in Reach Out):** Start by signaling you want to connect → Name what you might have contributed → Invite their perspective → End with what matters (the relationship).

**Status:** Present. Reach Out + Pre-Check = relationship repair.

---

### 6. Crisis Tool ✅

**Purpose:** *988, crisis support, emergency reset.*

**InGauge:** Crisis resources modal, emergency screen, 988 / Crisis Text Line.

**Route:** `/(modals)/crisis-resources`, `/emergency`.

**Status:** Correct. No changes needed.

---

### 7. Meaning Tool ✅

**Purpose:** *Why am I doing this? Values, purpose, identity, long-term direction.*

**InGauge:** Alignment gauge, values, goals, direction, review & reflect.

**Status:** Covered. No new tool needed.

---

## Minimal Ship List (App Store Tomorrow)

If shipping with the smallest coherent set, the **essential 7** are:

| # | Tool           | Role                 | InGauge route / surface              |
|---|----------------|----------------------|--------------------------------------|
| 1 | **Quick Reset**| Nervous system       | `/tools/quick-reset`                 |
| 2 | **Reflect**    | Awareness            | Check-in, cockpit, gauges            |
| 3 | **Decode**     | Thinking / reframe   | `/(modals)/decode` (+ Thought Challenger) |
| 4 | **Reach Out**  | Connection / repair  | `/(modals)/reach-out-scaffold`       |
| 5 | **Prioritize** | Decision / clarity   | `/tools/decision`, `/profile/goals`  |
| 6 | **Rituals**    | Daily structure      | Pre-Flight, Post-Flight, `/flight-log` |
| 7 | **Crisis**     | Safety               | `/(modals)/crisis-resources`, `/emergency` |

**That is balanced. No more tools needed.**

---

## Optional: “Ask Better Questions” Tool

**Idea:** One optional tool — shift from *Why is this happening to me?* to *What part of my system needs attention?*

**Example prompts:**
- What is actually happening?
- What might be influencing this?
- What small action could help?

**InGauge today:** This is already the cockpit + drivers + insights + suggested actions loop. Could be named or surfaced as a single “Ask better questions” flow later; not required for ship.

---

## The Loop (Final Test)

**Can a user move from confusion → understanding → action?**

- **Confusion** → Gauges, drivers, patterns  
- **Understanding** → Insights, Decode, Thought Challenger, repair script  
- **Action** → Quick Reset, Reach Out, Decision, Prioritize, Rituals  

**Risk now:** Overbuilding. Focus on clarity, simplicity, polish, shipping.
