# InGauge AI Brain — System Architecture

The **AI Brain** is the central processor of the Human Operating System. It connects Cockpit, Signals, Talk, Tools, Patterns, Flight Log, and Lessons so the app feels like **one intelligent system** instead of many separate features.

**Vision:** InGauge becomes a **dashboard + mentor + mirror** for understanding your life — not just a tracker, but a **thinking partner**.

---

## High-level flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         InGauge AI Brain                                      │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 1. INPUT    │ 2. SIGNAL   │ 3. PATTERN  │ 4. INSIGHT  │ 5. ACTION           │
│    LAYER    │   PROCESSING│   ENGINE    │   ENGINE    │   ENGINE            │
│             │   LAYER     │             │             │                     │
│ Raw data    │ Structured  │ Patterns    │ Clear       │ Suggested tools,    │
│ from app    │ signals     │ across time │ explanations│ next steps          │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
        │              │              │              │              │
        ▼              ▼              ▼              ▼              ▼
   Check-ins      emotion,        recurring     Signals tab,   Decode, Reset,
   Talk, tools    topic,           stress       Cockpit,       role-play,
   journal,       behavior,        triggers     Weekly,        Talk reflection
   habits         social           cycles       Wrapped
```

**Governance:** Data class, retention, and AI/voice use per route are defined in [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) and [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md). The AI Brain processes only data the user has provided or consented to; see **Privacy Layer** and **Safety Layer** below.

**Data Graph:** The internal structure that connects signals, patterns, relationships, tools, and lessons so the Brain can reason across them (not as isolated features) is defined in [INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md). The graph’s nodes (User, Signal, Event, Emotion, Person, Pattern, Insight, Tool Interaction, Lesson) and edges are what the five layers read and write.

---

## 1. Input Layer — Where data comes from

The system collects **raw signals** from every part of the app the user engages with.

### 1.1 User actions

| Source | Example | Becomes |
|--------|---------|---------|
| **Check-ins** | Cockpit check-in, mood check-in, quick-log | Gauge scores, mood labels, short notes |
| **Reflections** | Journal entry, post-flight, lesson reflection | Free text, emotion cues |
| **Talk conversations** | Messages with Gauge (voice or text) | Topics, sentiment, requests |
| **Tool usage** | Decode, role-play, resolve, decision, etc. | Context (e.g. “work conflict”, “hard conversation”) |
| **Habit / ritual** | Pre-flight, post-flight, body maintenance | Completion, timing, optional notes |

### 1.2 Behavioral signals

| Signal type | Examples |
|-------------|----------|
| **Time patterns** | Time of day, day of week, frequency of check-ins |
| **Activity frequency** | How often user opens Talk, completes tools, logs habits |
| **Interaction style** | Prefers voice vs text, length of journal entries, which tools they use |

### 1.3 Optional integrations

| Source | Data | Use in Brain |
|--------|------|--------------|
| **Wearables** | Sleep, steps, HRV, readiness (e.g. Oura, Apple Health) | Body/energy context, cause insights |
| **Calendar** | Load, busy days (if user connects) | Timing and load patterns |

### 1.4 Example inputs → “raw signals”

- Journal entry: *“I’m frustrated with my coworker.”*
- Voice reflection after check-in
- Conversation with Talk: *“I feel overwhelmed today.”*
- Habit activity: “Post-flight completed”
- Relationship interaction: contact logged, Mind Mail sent

These **do not** leave the Input Layer as raw text for storage; they are normalized into **structured signals** in the next layer.

---

## 2. Signal Processing Layer — Raw → structured

This layer converts raw inputs into **structured signals** that the Pattern Engine can use.

### 2.1 Mapping examples

| Raw input | Structured signal(s) |
|-----------|----------------------|
| Journal: *“I’m frustrated with my coworker.”* | `emotion = frustration`, `topic = work conflict` |
| User says: *“I feel overwhelmed today.”* | `emotion = stress`, `confidence = medium` |
| Conversation with AI about sleep | `topic = sleep`, `sentiment = concern` |
| Habit “Post-flight” completed | `behavior = ritual`, `type = post_flight` |
| Relationship: “Logged contact with Alex” | `social = contact`, `target = Alex` |

### 2.2 Signal types (conceptual)

- **Emotion signals** — from check-ins, journal, Talk (e.g. stress, frustration, calm).
- **Topic signals** — from Talk and journal (e.g. work conflict, sleep, family).
- **Behavior signals** — from habits, rituals, tool usage (e.g. “used Decode”, “did breathing reset”).
- **Social signals** — from People/Lights, Mind Mail, contact logs (e.g. who was contacted, temperature changes).
- **Body/energy signals** — from gauges, optional wearables (e.g. sleep, recovery, state).

Signals are **stored and retained** according to the route map (e.g. journal → user-controlled deletion; check-ins → long-term history). See [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) (data classification, retention).

### 2.3 The 12 core InGauge signals (vital signs)

These **12 core signals** are the fundamental measurements of human state that feed the Cockpit, Signals tab, Pattern Engine, and Insights. Think of them as the vital signs of the Human Operating System.

| # | Signal | What it tracks | Main sources | Example insight / alert |
|---|--------|----------------|--------------|--------------------------|
| 1 | **Emotional Stability** | Emotional patterns over time | Journal, Talk, mood check-ins, optional voice tone | *Your emotional stress has increased over the past 3 days.* |
| 2 | **Stress Level** | Pressure and overwhelm | Self-report, wearables, sleep disruptions, frequent negative reflections | ⚠️ Stress rising |
| 3 | **Energy / Vitality** | Physical and mental energy | Sleep, exercise, body maintenance, wearables | *Your energy tends to drop after poor sleep.* |
| 4 | **Focus** | Concentration and cognitive clarity | Task completion, distraction patterns, productivity reflections | *Focus is strongest in the morning hours.* |
| 5 | **Direction / Purpose** | Clarity about life direction | Goals, planning activity, values alignment, life direction tools | ⚠️ Direction unclear |
| 6 | **Connection** | Relationship health | Circle interactions, communication reflections, relationship tools | *Conversations with close friends have decreased recently.* |
| 7 | **Communication Health** | How effectively the user expresses themselves | Conflict reflections, communication practice tools, relationship analysis | *Difficult conversations have been avoided this week.* |
| 8 | **Growth** | Personal development | Lessons completed, skill progression, reflection depth | *Self-awareness skills improved this month.* |
| 9 | **Alignment** | How well actions match values and goals | Value exercises, goal progress, behavior patterns | *Your daily actions strongly support your long-term goals.* |
| 10 | **Curiosity / Learning** | Intellectual engagement | Manual lessons, question activity, exploration tools | Curiosity rising |
| 11 | **Resilience** | Recovery after setbacks | Reflections, emotional recovery speed, stress patterns | *You recovered quickly from recent challenges.* |
| 12 | **Social Environment** | How the user’s environment affects them | Circle interactions, emotional reactions to people, relationship tools | *Certain interactions appear to increase stress.* |

**Design principle — guidance, not judgment:** Signals should always feel like **guidance**, not judgment. Use neutral, observational language.

| Avoid | Use instead |
|-------|-------------|
| ❌ “Your stress is bad.” | ✔ “Your stress signals have increased.” |
| ❌ “You’re failing at connection.” | ✔ “Connection signals have decreased recently.” |

Neutral language builds trust and keeps the system feeling like a **thinking partner**, not a critic.

**Domains covered:** Together these 12 signals cover the major domains of human experience — **emotion**, **body**, **mind**, **relationships**, and **purpose** — for a balanced model of human life.

### 2.4 How the 12 signals feed the product

**Cockpit (dashboard)**  
The center shows the **system score** (e.g. *YOU: 84*). The five categories around it are each powered by multiple core signals:

| Cockpit category | Core signals that feed it |
|------------------|----------------------------|
| **Emotion** | Emotional Stability, Stress Level |
| **State** | Energy / Vitality, Focus, Resilience (nervous system, regulation) |
| **Connection** | Connection, Communication Health, Social Environment |
| **Direction** | Direction / Purpose, Alignment |
| **Body** | Energy / Vitality (physical), optional wearable data |

Tapping a category or gauge can surface *why* the score changed (Insight Engine + Pattern Engine using these signals).

**Signals tab**  
Signals show **changes and alerts** — early warnings from the 12 core signals. Examples:

- ⚠️ Stress rising  
- ⚠️ Focus declining  
- ⚠️ Social interaction reduced  

**Patterns module**  
Signals over time become **patterns**. Examples:

- *You tend to feel most energized after social interaction.*  
- *Stress increases when sleep drops below 6 hours.*  

**Weekly Insight**  
The AI can summarize the week using the 12 signals. Example:

- *Your week in review: Energy improved · Focus stable · Stress slightly elevated · Strong connection moments with family.*  

**Wrapped (annual summary)**  
Signals become the **yearly reflection**. Example highlights:

- *Your strongest area: resilience*  
- *Most improved: communication*  
- *Biggest growth moment: relationship repair*  

**Result**  
With these 12 core signals, InGauge becomes:

- a **life dashboard** (Cockpit)  
- a **pattern detector** (Patterns, Signals tab)  
- a **self-awareness tool** (insights, explanations)  
- a **growth guide** (Growth, Alignment, Curiosity, Action Engine)  

All connected by the AI Brain.

---

## 3. Pattern Engine — Connecting the dots

The Pattern Engine looks for **patterns across time** so the system can explain *why* things feel the way they do.

### 3.1 What it looks for

| Pattern type | Example |
|--------------|---------|
| **Recurring stress triggers** | “Stress tends to rise after long work sessions without breaks.” |
| **Social / relationship cycles** | “Conversations with Alex often improve your mood.” / “Unresolved conflict with [person] repeats.” |
| **Motivation / energy patterns** | “Your focus improves after you exercise.” |
| **Sleep vs mood** | “Poor sleep correlates with lower State and Emotion scores.” |
| **Timing** | “Tuesday check-ins are often lower; mid-week slump.” |

### 3.2 Where patterns live

- **Patterns module** (`/patterns`) — deep analysis center: emotional trends, relationship cycles, productivity patterns. Users explore patterns here; it’s the self-awareness tool.
- **Internal storage** — pattern metadata and aggregates used by the Insight Engine and Action Engine (retention: long-term history; data class: behavioral, emotional — see route map).

### 3.3 Existing implementation

Current codebase already has pattern-related logic in:

- `src/services/patternDetection.ts` — day_of_week, sleep_state, connection_gaps, trend_momentum.
- `src/services/patternEngine.ts` — narrative patterns (Body→State, State–Emotion, Direction–Alignment).
- `src/services/systemicDrift.ts` — gauge events, weekly_drop, volatility.
- `src/services/driftDetector.ts` — value-alignment and drift insights.

The AI Brain architecture **unifies** these under one conceptual Pattern Engine that feeds the Insight and Action engines.

---

## 4. Insight Engine — Patterns → clear explanations

The Insight Engine turns patterns into **clear, human-readable insights** for the user.

### 4.1 Example insights

- *“Your focus improves after you exercise.”*
- *“Conversations with Alex often improve your mood.”*
- *“Work interactions have been stressful recently.”*

### 4.2 Where insights surface

| Surface | Role of AI Brain |
|---------|-------------------|
| **Signals tab** | Real-time alerts (e.g. “Stress trend increasing”, “Sleep pattern declining”, “Unresolved conflict signal”). |
| **Cockpit** | Summary of alignment, emotional/direction/relationship/body signals; “why did my score change?” explanations. |
| **Weekly insights** | Weekly insight card / email. |
| **Wrapped** | Year-in-review narrative from patterns and insights. |
| **Patterns module** | Deeper exploration of trends and cycles. |

### 4.3 Tone and constraints

- **Reflective, not diagnostic** — no mental health or medical diagnosis (see Safety Layer).
- **Transparent** — insights are clearly from the app’s analysis; uncertainty can be mentioned where relevant ([INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) AI transparency).
- **Actionable** — insights are designed to feed into the Action Engine (suggested tools, next steps).

Existing implementation: `src/services/insightEngine.ts`, `cockpitAI.ts`, and related services (see [INSIGHT-ENGINE-AUDIT.md](./INSIGHT-ENGINE-AUDIT.md)).

### 4.4 Insight source (explainability)

Tracking **how** insights are generated keeps the AI Brain explainable and aligns with transparency expectations (e.g. EU AI Act). The route map matrix includes an **Insight source** column per route; high-level mapping by surface:

| Surface | Primary insight source |
|---------|--------------------------|
| **Cockpit score** | Pattern detection + user input (gauges, check-ins). |
| **Signals tab** | Pattern detection (trends, drift, connection gaps). |
| **Weekly insight** | Pattern detection + AI inference. |
| **Wrapped** | Historical aggregation (year of signals and patterns). |
| **Patterns module** | Pattern detection (stored patterns, narrative engine). |
| **Forecast** | Pattern detection + AI inference. |
| **Talk / Ask Gauge** | User input + AI inference. |
| **Decode, Resolve, Role-play** | User input + AI inference. |

Sources used in the matrix: **User input** | **Pattern detection** | **Wearable** | **AI inference** | **Historical aggregation** | — (none).

---

## 5. Action Engine — Insights → suggested actions

Insights are useful only when they lead to **action**. The Action Engine suggests the right **tools** and next steps.

### 5.1 Example

- **Pattern detected:** User overwhelmed.
- **Suggested actions:** Breathing reset (Quick Reset), planning tool (e.g. decision), Talk reflection.

### 5.2 How it connects to the app

- **Cockpit** — “What to do next” / quick actions driven by current signals and patterns.
- **Tools tab** — situation-based tool picker; suggestions can be personalized from Action Engine.
- **Talk** — Gauge can suggest a tool during conversation (e.g. “Want to try the Decode tool for that message?”).
- **Signals** — a signal can link to a specific tool (e.g. “Unresolved conflict” → Decode or role-play).

All suggested tools are from the existing Tools taxonomy (Decode, role-play, resolve, perspective translator, quick reset, etc.); see route map section 6.4.

---

## End-to-end example flow

1. **User writes journal entry:** *“I’m frustrated with my coworker.”*
2. **Signal Processing:**  
   - `emotion = frustration`  
   - `topic = work conflict`
3. **Pattern Engine:**  
   - Sees three similar entries this week → pattern: “Work interactions have been stressful recently.”
4. **Insight Engine:**  
   - Produces user-facing insight: *“Work interactions have been stressful recently.”*
5. **Action Engine suggests:**  
   - Decode tool (understand a message)  
   - Perspective translator (rephrase for someone else)  
   - Role-play (practice the conversation)

The same flow can start from a **Talk** conversation or a **check-in** note; the Brain unifies all inputs into one coherent system.

---

## How each surface uses the AI Brain

### Cockpit (Home)

- **Role:** Summary of the AI Brain.
- **Shows:** Alignment score, emotional/direction/relationship/body signals.
- **Interaction:** User can tap any area to see *why* the score or signal changed (Insight Engine + Pattern Engine).
- **Data:** Uses gauge history, check-ins, optional health; see route map 6.1 (Cockpit row: Emotional, Behavioral; long-term history; reflective, not diagnostic).

### Signals tab

- **Role:** Real-time alerts from the AI Brain.
- **Examples:** “Stress trend increasing”, “Sleep pattern declining”, “Unresolved conflict signal.”
- **Metaphor:** System notifications for life.

### Talk

- **Role:** Conversational interface to the AI Brain.
- **Example:** User asks *“Why am I feeling stuck lately?”* — AI uses patterns and insights to explain (without diagnosing).
- **Integration:** Talk is both an **input** (conversations become signals) and an **output** (insights and suggestions can be delivered in conversation). See route map: Talk = Coach, Conversation voice, Emotional + Personal, user-controlled deletion.

### Flight Log

- **Role:** Memory system for the Human OS.
- **Records:** Major reflections, important insights, milestones, changes over time.
- **Use:** Long-term learning and “what happened then” context for the Pattern and Insight engines.

### Patterns module

- **Role:** Deep analysis center.
- **User explores:** Emotional trends, relationship cycles, productivity patterns.
- **Becomes:** A self-awareness tool powered by the same Pattern and Insight engines; disclaimer “not diagnostic” (route map 6.7).

### Lessons (Manual / Learn)

- **Role:** Education layer; can be **suggested** by the Action Engine when a pattern matches (e.g. “You often feel this way before big decisions — want to try the decision tool or the bias-check lesson?”).
- **Input:** Lesson progress and reflections can feed behavioral/emotional signals (e.g. “completed boundaries lesson”) for the Pattern Engine.

---

## Privacy Layer

The AI Brain must respect user privacy and comply with [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) and [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md).

| Principle | Implementation |
|-----------|----------------|
| **Data stays private** | All Brain processing uses only data the user has provided or explicitly connected (e.g. wearables). No selling or unauthorized sharing. |
| **User controls deletion** | Routes that feed the Brain (journal, Talk, check-ins, etc.) have retention and export/delete as in the route map (user-controlled deletion where specified). |
| **Sensitive insights** | Where possible, sensitive insight logic can run on-device or in user-scoped backend; avoid unnecessary retention of raw conversational text. |
| **Transparency** | Data-use and privacy policy explain what is collected and how it’s used; Settings and onboarding link to these (route map 5h, App store compliance). |

---

## Safety Layer

Because the app handles emotions and relationships, the AI Brain must stay within safe, non-clinical bounds.

| Do not | Do instead |
|--------|------------|
| Diagnose mental illness | Reflect patterns (e.g. “You’ve had a lot of low-energy days lately.”) |
| Replace therapy | Suggest reflection, tools, and — when appropriate — encourage trusted people or professionals (see [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) crisis protocol). |
| Make harmful or definitive claims | Use “may”, “often”, “your patterns suggest”; surface uncertainty where relevant (AI transparency in [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md)). |

**Crisis:** If the system detects possible self-harm or severe distress, follow the **Crisis handling protocol** in [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md): supportive response, display crisis resources, encourage professionals; never present the app as therapy or crisis care.

---

## What makes this system powerful

- **Many apps collect data; few connect the dots.**  
  The AI Brain’s job is to:
  1. **Connect** signals (from check-ins, Talk, tools, journal, habits, optional wearables).
  2. **Detect** patterns (recurring stress, relationship cycles, sleep–mood, etc.).
  3. **Explain** insights (clear, reflective language in Signals, Cockpit, Weekly, Wrapped, Patterns).
  4. **Suggest** actions (tools and next steps via Cockpit, Talk, Signals).

That’s what makes the system feel **intelligent** and like one **thinking partner** instead of many separate features.

---

## Three pillars (strategic frame)

InGauge is structured around three major pillars that the AI Brain connects:

| Pillar | Areas |
|--------|--------|
| **Self-awareness** | Cockpit, Signals, Patterns, Flight Log. |
| **Human skills** | Tools, Manual (Learn), Role-play, Decode, and the rest of the tool set. |
| **Relationships** | People, Circle (Mind Mail), Lights, Relational bridge. |

The AI Brain reasons across signals, patterns, relationships, tools, and lessons so the app feels like **one intelligent system** instead of separate features. The **InGauge Data Graph** ([INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md)) formalizes the internal structure: nodes (User, Signal, Event, Emotion, Person, Pattern, Insight, Tool Interaction, Lesson) and edges (e.g. Emotion → triggered_by → Event, Pattern → derived_from → Signals) so the Brain can query and traverse relationships for cross-system reasoning.

---

## Document relationships

| Document | Role |
|----------|------|
| **INGAUGE-AI-BRAIN.md** (this doc) | Central processor architecture: 5 layers, surfaces, privacy, safety. (Canonical AI design is also in [INGAUGE-AI-ARCHITECTURE.md](./INGAUGE-AI-ARCHITECTURE.md) with updated links.) |
| **INGAUGE-DATA-GRAPH.md** | Graph model: nodes (User, Signal, Event, Emotion, Person, Pattern, Insight, Tool Interaction, Lesson), edges, how the Brain and surfaces use it, privacy. |
| **INGAUGE-ROUTE-MAP.md** | Routes, file tree, modal rule, domain ownership. |
| **INGAUGE-GOVERNANCE-MATRIX.md** | Per-route matrix, AI/voice taxonomy, crisis, transparency, app store. |
| **INGAUGE-DATA-POLICY.md** | Data class, retention, permissions (GDPR/CCPA). |
| **INGAUGE-SYSTEM-MAP.md** | Product blueprint: 10 domains, system map. |
| **INGAUGE-ARCHITECTURE-ORGANIZATION.md** | Domain ownership, target layout, KEEP/MOVE/MERGE/REMOVE, modal rule. |
| **INSIGHT-ENGINE-AUDIT.md** | Current insight systems, data flows, files. |
| **HUMAN-OS-FIVE-LAYERS.md** | Meaning, values, bias, energy, skills — can feed into Pattern/Insight engines. |
| **GLOBAL-SYSTEM-ARCHITECTURE.md** | Universal AI Guide, voice everywhere, AI personality. |

Implementing the AI Brain means wiring existing services (cockpitAI, insightEngine, patternEngine, patternDetection, etc.) into this layered model and ensuring every new feature that produces or consumes “intelligence” flows through these five layers and respects the Privacy and Safety layers above.
