# InGauge AI Architecture

The **AI Brain** is the central processor of the Human Operating System. It connects Cockpit, Signals, Talk, Tools, Patterns, Flight Log, and Lessons so the app feels like **one intelligent system** instead of many separate features.

**Vision:** InGauge becomes a **dashboard + mentor + mirror** for understanding your life — not just a tracker, but a **thinking partner**.

**See also:** [README.md](./README.md) · [INGAUGE-ROUTE-MAP.md](./INGAUGE-ROUTE-MAP.md) · [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) · [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) · [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md) · [INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md)

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

**Data Graph:** The internal structure that connects signals, patterns, relationships, tools, and lessons so the Brain can reason across them is defined in [INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md). The graph's nodes (User, Signal, Event, Emotion, Person, Pattern, Insight, Tool Interaction, Lesson) and edges are what the five layers read and write.

---

## 1. Input Layer — Where data comes from

The system collects **raw signals** from every part of the app the user engages with.

### 1.1 User actions

| Source | Example | Becomes |
|--------|---------|---------|
| **Check-ins** | Cockpit check-in, mood check-in, quick-log | Gauge scores, mood labels, short notes |
| **Reflections** | Journal entry, post-flight, lesson reflection | Free text, emotion cues |
| **Talk conversations** | Messages with Gauge (voice or text) | Topics, sentiment, requests |
| **Tool usage** | Decode, role-play, resolve, decision, etc. | Context (e.g. "work conflict", "hard conversation") |
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

### 1.4 Example inputs → "raw signals"

- Journal entry: *"I'm frustrated with my coworker."*
- Voice reflection after check-in
- Conversation with Talk: *"I feel overwhelmed today."*
- Habit activity: "Post-flight completed"
- Relationship interaction: contact logged, Mind Mail sent

These **do not** leave the Input Layer as raw text for storage; they are normalized into **structured signals** in the next layer.

---

## 2. Signal Processing Layer — Raw → structured

This layer converts raw inputs into **structured signals** that the Pattern Engine can use.

### 2.1 Mapping examples

| Raw input | Structured signal(s) |
|-----------|----------------------|
| Journal: *"I'm frustrated with my coworker."* | `emotion = frustration`, `topic = work conflict` |
| User says: *"I feel overwhelmed today."* | `emotion = stress`, `confidence = medium` |
| Conversation with AI about sleep | `topic = sleep`, `sentiment = concern` |
| Habit "Post-flight" completed | `behavior = ritual`, `type = post_flight` |
| Relationship: "Logged contact with Alex" | `social = contact`, `target = Alex` |

### 2.2 Signal types (conceptual)

- **Emotion signals** — from check-ins, journal, Talk (e.g. stress, frustration, calm).
- **Topic signals** — from Talk and journal (e.g. work conflict, sleep, family).
- **Behavior signals** — from habits, rituals, tool usage (e.g. "used Decode", "did breathing reset").
- **Social signals** — from People/Lights, Mind Mail, contact logs (e.g. who was contacted, temperature changes).
- **Body/energy signals** — from gauges, optional wearables (e.g. sleep, recovery, state).

Signals are **stored and retained** according to the route map. See [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) (data classification, retention).

### 2.3 The 12 core InGauge signals (vital signs)

These **12 core signals** are the fundamental measurements of human state that feed the Cockpit, Signals tab, Pattern Engine, and Insights.

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
| 12 | **Social Environment** | How the user's environment affects them | Circle interactions, emotional reactions to people, relationship tools | *Certain interactions appear to increase stress.* |

**Design principle — guidance, not judgment:** Signals should always feel like **guidance**, not judgment. Use neutral, observational language.

| Avoid | Use instead |
|-------|-------------|
| ❌ "Your stress is bad." | ✔ "Your stress signals have increased." |
| ❌ "You're failing at connection." | ✔ "Connection signals have decreased recently." |

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
Signals show **changes and alerts** — early warnings from the 12 core signals.

**Patterns module**  
Signals over time become **patterns** (e.g. energy after social interaction, stress when sleep drops).

**Weekly Insight**  
The AI can summarize the week using the 12 signals.

**Wrapped (annual summary)**  
Signals become the **yearly reflection**.

**Result**  
With these 12 core signals, InGauge becomes a **life dashboard**, **pattern detector**, **self-awareness tool**, and **growth guide** — all connected by the AI Brain.

---

## 3. Pattern Engine — Connecting the dots

The Pattern Engine looks for **patterns across time** so the system can explain *why* things feel the way they do.

### 3.1 What it looks for

| Pattern type | Example |
|--------------|---------|
| **Recurring stress triggers** | "Stress tends to rise after long work sessions without breaks." |
| **Social / relationship cycles** | "Conversations with Alex often improve your mood." |
| **Motivation / energy patterns** | "Your focus improves after you exercise." |
| **Sleep vs mood** | "Poor sleep correlates with lower State and Emotion scores." |
| **Timing** | "Tuesday check-ins are often lower; mid-week slump." |

### 3.2 Where patterns live

- **Patterns module** (`/patterns`) — deep analysis center; users explore patterns here.
- **Internal storage** — pattern metadata and aggregates (retention: long-term history; see [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md)).

### 3.3 Existing implementation

Current codebase: `src/services/patternDetection.ts`, `patternEngine.ts`, `systemicDrift.ts`, `driftDetector.ts`. The AI Brain architecture **unifies** these under one conceptual Pattern Engine that feeds the Insight and Action engines.

---

## 4. Insight Engine — Patterns → clear explanations

The Insight Engine turns patterns into **clear, human-readable insights** for the user.

### 4.1 Example insights

- *"Your focus improves after you exercise."*
- *"Conversations with Alex often improve your mood."*
- *"Work interactions have been stressful recently."*

### 4.2 Where insights surface

| Surface | Role of AI Brain |
|---------|-------------------|
| **Signals tab** | Real-time alerts (stress trend, sleep pattern, unresolved conflict). |
| **Cockpit** | Summary of alignment, emotional/direction/relationship/body signals; "why did my score change?" |
| **Weekly insights** | Weekly insight card. |
| **Wrapped** | Year-in-review narrative. |
| **Patterns module** | Deeper exploration of trends and cycles. |

### 4.3 Tone and constraints

- **Reflective, not diagnostic** — no mental health or medical diagnosis (see Safety Layer).
- **Transparent** — insights clearly from the app's analysis; uncertainty where relevant ([INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) AI transparency).
- **Actionable** — insights feed the Action Engine (suggested tools, next steps).

### 4.4 Insight source (explainability)

The governance matrix includes an **Insight source** column per route. High-level mapping:

| Surface | Primary insight source |
|---------|--------------------------|
| **Cockpit score** | Pattern detection + user input. |
| **Signals tab** | Pattern detection. |
| **Weekly insight** | Pattern detection + AI inference. |
| **Wrapped** | Historical aggregation. |
| **Patterns module** | Pattern detection. |
| **Forecast** | Pattern detection + AI inference. |
| **Talk / Ask Gauge** | User input + AI inference. |
| **Decode, Resolve, Role-play** | User input + AI inference. |

Sources: **User input** | **Pattern detection** | **Wearable** | **AI inference** | **Historical aggregation** | — (none).

---

## 5. Action Engine — Insights → suggested actions

Insights lead to **action**. The Action Engine suggests the right **tools** and next steps.

### 5.1 Example

- **Pattern detected:** User overwhelmed.
- **Suggested actions:** Quick Reset, decision tool, Talk reflection.

### 5.2 How it connects to the app

- **Cockpit** — "What to do next" / quick actions.
- **Tools tab** — situation-based tool picker; suggestions can be personalized.
- **Talk** — Gauge can suggest a tool during conversation.
- **Signals** — a signal can link to a specific tool (e.g. "Unresolved conflict" → Decode or role-play).

All suggested tools are from the existing Tools taxonomy; see [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) (Tools section) and [INGAUGE-ROUTE-MAP.md](./INGAUGE-ROUTE-MAP.md).

---

## End-to-end example flow

1. **User writes journal entry:** *"I'm frustrated with my coworker."*
2. **Signal Processing:** `emotion = frustration`, `topic = work conflict`
3. **Pattern Engine:** Sees three similar entries this week → pattern: "Work interactions have been stressful recently."
4. **Insight Engine:** Produces user-facing insight.
5. **Action Engine suggests:** Decode tool, Perspective translator, Role-play.

The same flow can start from **Talk** or a **check-in**; the Brain unifies all inputs into one coherent system.

---

## How each surface uses the AI Brain

| Surface | Role |
|---------|------|
| **Cockpit** | Summary of the AI Brain; alignment score, signals; tap to see *why* (Insight + Pattern). |
| **Signals tab** | Real-time alerts (stress trend, sleep pattern, unresolved conflict). |
| **Talk** | Conversational interface; both **input** (conversations → signals) and **output** (insights, suggestions). |
| **Flight Log** | Memory system; major reflections, milestones; context for Pattern and Insight engines. |
| **Patterns module** | Deep analysis center; self-awareness tool; disclaimer "not diagnostic." |
| **Lessons (Manual)** | Education layer; can be **suggested** by Action Engine when a pattern matches. |

---

## Privacy Layer

The AI Brain must respect user privacy and comply with [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) and [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md).

| Principle | Implementation |
|-----------|----------------|
| **Data stays private** | All Brain processing uses only data the user has provided or explicitly connected. No selling or unauthorized sharing. |
| **User controls deletion** | Routes that feed the Brain have retention and export/delete as in the data policy. |
| **Sensitive insights** | Where possible, sensitive insight logic can run on-device or in user-scoped backend. |
| **Transparency** | Data-use and privacy policy explain what is collected and how; Settings and onboarding link to these. |

---

## Safety Layer

Because the app handles emotions and relationships, the AI Brain must stay within safe, non-clinical bounds.

| Do not | Do instead |
|--------|------------|
| Diagnose mental illness | Reflect patterns (e.g. "You've had a lot of low-energy days lately.") |
| Replace therapy | Suggest reflection, tools, and — when appropriate — encourage trusted people or professionals (see [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) crisis protocol). |
| Make harmful or definitive claims | Use "may", "often", "your patterns suggest"; surface uncertainty where relevant. |

**Crisis:** If the system detects possible self-harm or severe distress, follow the **Crisis handling protocol** in [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md): supportive response, display crisis resources, encourage professionals; never present the app as therapy or crisis care.

---

## Three pillars (strategic frame)

| Pillar | Areas |
|--------|--------|
| **Self-awareness** | Cockpit, Signals, Patterns, Flight Log. |
| **Human skills** | Tools, Manual (Learn), Role-play, Decode, and the rest of the tool set. |
| **Relationships** | People, Circle (Mind Mail), Lights, Relational bridge. |

The AI Brain reasons across signals, patterns, relationships, tools, and lessons. The **InGauge Data Graph** ([INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md)) formalizes the internal structure so the Brain can query and traverse relationships for cross-system reasoning.

---

## Document relationships

| Document | Role |
|----------|------|
| **INGAUGE-AI-ARCHITECTURE.md** (this doc) | AI Brain: 5 layers, 12 signals, surfaces, privacy, safety. |
| **INGAUGE-DATA-GRAPH.md** | Graph model: nodes, edges, how the Brain and surfaces use it. |
| **INGAUGE-ROUTE-MAP.md** | Routes, file tree, modal rule, domain ownership. |
| **INGAUGE-GOVERNANCE-MATRIX.md** | AI/voice taxonomy, crisis, transparency, full feature matrix. |
| **INGAUGE-DATA-POLICY.md** | Data classification, retention, permissions, GDPR/CCPA. |
| **INGAUGE-SYSTEM-MAP.md** | Product blueprint: 10 domains, how they connect. |
| **INGAUGE-ARCHITECTURE-ORGANIZATION.md** | Domain migration: KEEP/MOVE/MERGE/REMOVE. |

Implementing the AI Brain means wiring existing services (cockpitAI, insightEngine, patternEngine, etc.) into this layered model and ensuring every new feature that produces or consumes "intelligence" flows through these five layers and respects the Privacy and Safety layers.
