# InGauge Data Graph — Internal Structure for the AI Brain

The **Data Graph** is the internal model that lets the AI Brain reason about **relationships** between everything in the system instead of treating each feature in isolation. Think of it as the map of how a user’s life data connects.

**Why a graph?** Most apps store data in simple tables (user → journal, user → habits). Human life is relational: emotions tie to events, events to people, people to stress, stress to sleep, sleep to focus. A **graph model** allows the AI to detect real-life cause-and-effect and cycles. Traditional tables struggle with that.

**Governance:** Data in the graph is subject to the same **data class**, **retention**, and **privacy** rules as in [INGAUGE-DATA-POLICY.md](INGAUGE-DATA-POLICY.md) and [INGAUGE-GOVERNANCE-MATRIX.md](INGAUGE-GOVERNANCE-MATRIX.md). The graph is the *structure*; those docs define how each input is classified and how long it is kept.

---

## 1. Core nodes (entities)

Nodes are the main types of information in the graph. The **User** is the center; everything else connects to the user and to each other.

| Node | Description | Examples | Where it shows up |
|------|-------------|----------|-------------------|
| **User** | The center node. Connected to all other nodes. | Profile, preferences, identity. | Everywhere. |
| **Signal** | A measurement or state from the system. | stress, focus, energy, connection, direction (aligns with the [12 core InGauge signals](INGAUGE-AI-ARCHITECTURE.md#23-the-12-core-ingauge-signals-vital-signs)). | Cockpit, Signals tab, Patterns. |
| **Event** | Something that happened (user-reported or inferred). | Argument with friend, difficult meeting, exercise session, journaling moment, check-in. | Flight Log, Timeline, Patterns. |
| **Emotion** | Detected or reported emotional state. | Frustration, excitement, anxiety, calm. | Connects to Events, People, Signals. |
| **Person** | Someone in the user’s life (from Circle / Lights). | Contacts, tier, temperature, interaction history. | People, Lights, Mind Mail, relationship tools. |
| **Pattern** | A pattern discovered by the AI over time. | Stress spike after poor sleep; mood improvement after exercise; conflict cycles with certain people. | Patterns module, insights, Wrapped. |
| **Insight** | Human-readable explanation derived from patterns/signals. | *You tend to feel more energized after social interaction.* | Signals tab, Cockpit, Weekly, Wrapped. |
| **Tool Interaction** | Record that the user used a tool. | Decode, Role-play, Quick Reset, Decision, etc. | Used by AI to suggest actions and understand what helps. |
| **Lesson** | A learning unit from the Manual. | Boundaries, emotional triggers, communication. | Learn tab; AI can link lessons to real experiences. |

Signals in the graph map to the **12 core signals** (Emotional Stability, Stress Level, Energy/Vitality, Focus, Direction/Purpose, Connection, Communication Health, Growth, Alignment, Curiosity/Learning, Resilience, Social Environment). Events, emotions, and tool interactions are the main **inputs** that create and update signal nodes over time.

---

## 2. Relationships (edges)

Edges define how nodes influence or relate to each other. They enable **causal reasoning** (e.g. “what events increase stress?”).

### 2.1 Edge types (examples)

| From → To | Edge (relationship) | Meaning |
|-----------|---------------------|---------|
| Emotion → Event | `triggered_by` | This emotion was associated with this event. |
| Event → Person | `involves` | The event involved this person. |
| Person → Signal | `affects` | Interaction with this person affects these signals (e.g. connection, stress). |
| Signal → Cockpit | `contributes_to` | This signal feeds the Cockpit score / gauge. |
| Pattern → Signal(s) | `derived_from` | This pattern was detected from these signals over time. |
| Insight → Pattern | `explains` | This insight is the human-readable explanation of this pattern. |
| Insight → Tool | `suggests` | This insight suggests using this tool. |
| Tool Interaction → Event / Emotion | `used_in_context` | User used this tool in the context of this event or emotion. |
| Lesson → Signal / Pattern | `relevant_to` | This lesson is relevant to this signal or pattern (for recommendations). |
| User → * | (all) | User is connected to every node (ownership, scope). |

### 2.2 Direction and queries

Edges are **directed**: e.g. `Emotion --triggered_by--> Event` means “this emotion was triggered by this event.” The AI Brain can query in both directions:

- **Forward:** “Which events triggered stress?” (Event → Emotion).
- **Backward:** “What emotions are linked to arguments with Alex?” (Person + Event → Emotion).

Cycles in the graph (e.g. sleep ↓ → energy ↓ → focus ↓) are exactly what the Pattern Engine looks for.

---

## 3. Example real-life flow

**User writes a journal entry:** *“I argued with Alex today and feel drained.”*

The system creates or updates graph nodes and edges:

| Created/updated | Type | Example value / edge |
|-----------------|------|------------------------|
| Event | argument (with Alex) | `involves` → Person: Alex |
| Emotion | frustration, drained | `triggered_by` → Event |
| Signal | connection ↓, energy ↓ | Updated from event + emotion |
| (Later) Pattern | Arguments with Alex → emotional drain | `derived_from` → Signals + Events + Person |
| (Later) Insight | *Interactions with Alex appear to reduce your energy.* | `explains` → Pattern |
| (Later) Action | Suggested tool | Relationship repair tool ← `suggested_by` Insight |

So: **journal text** → **Event + Person + Emotion** → **Signal impact** → **Pattern** → **Insight** → **Suggested tool**. The graph is what allows the AI to connect “argued with Alex” to “relationship repair” instead of treating journal and tools separately.

---

## 4. How surfaces use the graph

### 4.1 Cockpit

The Cockpit pulls from **Signal** nodes. Example:

- Signals: `connection = 72`, `emotion = 64`, `focus = 81`, `energy = 75`
- The system score (e.g. *YOU: 84*) is computed from these signal nodes (and their contribution rules).
- Tapping a gauge can traverse the graph: e.g. “Why did connection drop?” → Events and People that `affect` connection.

### 4.2 Signals tab

The Signals tab detects **changes** in nodes (especially Signals and, where relevant, Emotions/Events). Example:

- `stress ↑`, `sleep ↓` → alert generated.
- Implemented by querying the graph for recent signal deltas or threshold breaches.

### 4.3 Patterns module

Patterns are built by **analyzing relationships across the graph** (e.g. Signal ↔ Event ↔ Person over time). Example:

- Pattern: `sleep ↓ → energy ↓ → focus ↓`
- Stored as a **Pattern** node with edges `derived_from` the relevant Signal and Event nodes.

### 4.4 Flight Log

The Flight Log is a **timeline of Event** nodes (and optionally linked Emotions and Tool Interactions). Example:

- *Monday:* Event: difficult meeting | Emotion: stress | Tool used: breathing reset  
- *Tuesday:* Emotion: calm | Focus improved | Mind Mail sent  

So the Flight Log is essentially a chronological view over Event (and related) nodes.

### 4.5 Mind Mail (Circle)

Mind Mail connects **Person** nodes and **Emotion** (or emotional impact) nodes. Example:

- Message → **Person** (recipient/sender) → **Emotional effect** (e.g. “felt better after reading”).
- This allows later reflection and patterns like “Conversations with [Person] often improve your mood.”

### 4.6 Talk / Ask Gauge

Conversations can create **Event** and **Emotion** nodes and update **Signal** nodes. The AI can **query the graph** to answer questions (e.g. “What’s been affecting my stress lately?”) and to suggest tools based on Insight → Tool edges.

---

## 5. Privacy design

Graph data must respect the same **privacy and retention** rules as the rest of the app.

**Sensitive nodes** (high care for storage and deletion):

- **Emotion** — feelings, reflections.
- **Event** — especially those describing relationships or conflict.
- **Person** — relationship data, interaction history.
- **Insight** — can reflect sensitive patterns.

**Rules:**

- **Data class** and **retention** per source (journal, Talk, check-in, etc.) are defined in [INGAUGE-DATA-POLICY.md](INGAUGE-DATA-POLICY.md). Graph nodes and edges inherit those rules by source.
- **User-controlled deletion:** Users can delete journal entries, Talk history, and other inputs; the graph must reflect that (remove or anonymize the corresponding nodes/edges).
- **Export:** Where the route map allows export, the graph’s exportable subset should be consistent (e.g. user’s events, signals, insights in a readable form).

Sensitive nodes should be **deletable** and not retained longer than the retention policy for their source.

---

## 6. AI Brain using the graph

The AI Brain **queries the graph** to power insights, answers, and tool suggestions.

### 6.1 Example queries

| Query | Graph usage |
|-------|-------------|
| *What events increase stress?* | Return Events linked (via Emotion or Signal) to elevated stress signals. |
| *Which relationships improve my mood?* | Person nodes with edges to positive emotion/signal changes. |
| *What helps when I feel overwhelmed?* | Tool Interaction nodes in context of overwhelm (Emotion/Event); suggest those or similar tools. |
| *Why did my connection score drop?* | Events and People that `affect` connection signal in the relevant window. |

### 6.2 Flow

1. **Input Layer** writes into the graph (e.g. journal → Event, Person, Emotion; check-in → Signal).
2. **Signal Processing** ensures consistent Signal nodes (and optionally Emotion/Event) from raw input.
3. **Pattern Engine** runs over the graph (nodes + edges over time) and creates **Pattern** nodes.
4. **Insight Engine** creates **Insight** nodes that `explain` Pattern nodes.
5. **Action Engine** uses Insight → Tool edges (and Tool Interaction history) to suggest tools.

So the Data Graph is the **shared structure** the five AI Brain layers read and write; it’s why the system can reason across emotions, relationships, habits, decisions, and growth instead of treating them as isolated features.

---

## 7. Why a graph model is powerful

Human life is **relational**, not linear. A graph allows the system to represent and reason about:

- **Cause and effect** — e.g. poor sleep → lower energy → lower focus.
- **Behavioral cycles** — e.g. conflict with Person A → stress → avoidance → more tension.
- **Social influences** — e.g. frequency and emotional impact of contact with each Person.
- **Emotional triggers** — e.g. which Events or People are linked to which Emotions.

Traditional relational tables can store the same raw data but make it harder to ask “what influences what?” across many entity types. The graph is the **internal map** that makes those questions answerable.

---

## 8. Long-term vision

With a rich graph over time, the system can support questions like:

- *What conditions make me feel my best?*
- *Which relationships increase my stress?*
- *When am I most likely to benefit from the Decision tool?*

That turns InGauge from “storing data” into a **living model of the user’s life system** — emotions, relationships, habits, decisions, and growth all **connected**, with the AI Brain reasoning over one coherent graph.

---

## 9. Document relationships

| Document | Role |
|----------|------|
| **INGAUGE-DATA-GRAPH.md** (this doc) | Graph model: nodes, edges, how surfaces and the AI Brain use it, privacy. |
| **INGAUGE-AI-ARCHITECTURE.md** | Five layers (Input → Signal Processing → Pattern → Insight → Action); 12 core signals; how the Brain uses the graph. |
| **INGAUGE-DATA-POLICY.md** | Data class, retention, permissions; governs what can be written into the graph and how long it is kept. |
| **INGAUGE-GOVERNANCE-MATRIX.md** | AI risk, insight source per route; compliance contract. |

**Implementation note:** The graph can be implemented with a dedicated graph DB (e.g. for complex traversals), or with a relational schema that models nodes and edges (e.g. `nodes` table + `edges` table) and query patterns that mimic graph traversal. The important part is that the **conceptual model** is a graph so that the AI Brain and product surfaces reason in terms of **relationships** between User, Signal, Event, Emotion, Person, Pattern, Insight, Tool Interaction, and Lesson.
