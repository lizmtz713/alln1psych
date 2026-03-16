# Life OS — Core Gauges + Five Influencing Systems

InGauge models human wellbeing as a **Human Life Operating System**: six core gauges plus five **influencing systems** that explain *why* gauges move. These five appear consistently across behavioral science, neuroscience, psychology, sociology, and longevity research.

They are **not** additional gauges. They work as **drivers, context, and pattern insights** so the system can say things like:

---

## The 3 Major Human System Failures (Research-Backed)

Across psychology, medicine, sociology, and behavioral science, **~80% of major life problems** cluster around three system failures. They show up in research on burnout, depression, relationship breakdown, poor health, and loss of purpose. InGauge measures all three.

| Failure | Typical cascade | Gauges affected | Influencing system |
|--------|------------------|-----------------|---------------------|
| **1. Recovery collapse** | Poor sleep → nervous system stress → fatigue → irritability → poor decisions → emotional crash | Body ↓, State ↓, Emotion ↓ | Recovery |
| **2. Attention fragmentation** | Task switching → cognitive overload → unfinished work → stress → feeling behind | Direction ↓, State ↓, Emotion ↓ | Attention |
| **3. Social disconnection** | Less contact → loneliness → emotional decline → meaning loss | Connection ↓, Emotion ↓, Alignment ↓ | Reciprocity |

**Why this matters for product design:** The app should quietly monitor these three risks. No special screen—the insight engine recognizes *recovery cascade*, *attention cascade*, and *connection drift*. When one appears, the app becomes **preventative instead of reactive**. Example shift: instead of "I'm overwhelmed," users see "Recovery has been low this week" or "Your attention may be fragmented by work pressure" or "Connection has been quiet recently."

**Differentiator:** Most apps detect only one dimension (sleep apps → recovery; productivity apps → attention; social apps → connection). InGauge detects **all three simultaneously**. That’s rare.

---

- "Recovery has been low this week → Body ↓, Emotion ↓, State ↓"
- "High task switching is affecting your Direction."
- "You supported others this week, but received little support."
- "You feel more stable when working toward meaningful goals."
- "Low daylight may be affecting your mood this week."

---

## Architecture

```
Sensors
---------
wearables · check-ins · drivers · relationship signals

Core Gauges
---------
Body · State · Emotion · Connection · Direction · Alignment

Influencing Systems (explain why gauges move)
---------
Recovery · Attention · Reciprocity · Meaning · Environment

Intelligence Layer
---------
pattern detection · insights · guidance · learning
```

---

## 1. Recovery System

**What it is:** Sleep, rest, nervous system reset, downtime, stress recovery. Scientists increasingly separate *recovery* from raw body health; wearables measure it via HRV, sleep quality, readiness scores.

**Maps to gauges:** Body, State, Emotion (low recovery often pulls all three down).

**In the app:**
- **Drivers:** `body-sleep`, `state-sleep`, `body-health`, `body-movement`, `body-rest-sleep` (action), `state-stress` (stress recovery).
- **Context:** `checkInContext.sleep` (e.g. Poor, Okay, Great).
- **Wearables:** Sleep duration/quality, HRV, readiness (Oura, HealthKit).

**Example insight:** "Recovery has been low this week. That often shows up in Body, Emotion, and State."

---

## 2. Attention System

**What it is:** Focus, distraction, cognitive load, task switching, information overload. Modern life makes this a major wellbeing factor; it connects strongly to Direction, State, and Emotion.

**Maps to gauges:** Direction, State, Emotion.

**In the app:**
- **Drivers:** `dir-work`, `dir-tasks`, `emotion-work`, `state-stress`; plus optional `dir-overload`, `state-distraction` (task switching / cognitive load).
- **Context:** Can add "cognitive load" or "task switching" to check-in context later.

**Example insight:** "High task switching is affecting your Direction."

---

## 3. Social Reciprocity System

**What it is:** Connection *given* vs connection *received*. Humans need both; imbalance predicts burnout, loneliness, and one-sided relationships.

**Maps to gauges:** Connection (and often Emotion).

**In the app:**
- **Data:** `connectionLogByMemberId` with `initiatedBy: 'me' | 'them'`; reciprocity service already computes given/received.
- **Surfaces:** Weekly review line ("You reached out to 3 people; 2 reached out to you"), Circle/Lights.

**Example insight:** "You supported others this week, but received little support."

---

## 4. Meaning System

**What it is:** Purpose, values, identity, contribution, long-term direction. One of the strongest predictors of long-term wellbeing; Alignment touches it but meaning is studied as its own system.

**Maps to gauges:** Alignment (primary), also State and Direction when purpose is clear.

**In the app:**
- **Drivers:** `align-values`, `align-identity`, `align-purpose`, `align-spirituality`.
- **User store:** `values`, goals with `whyItMatters`, life stage.

**Example insight:** "You feel more stable when working toward meaningful goals."

---

## 5. Environmental System

**What it is:** Weather, light exposure, location, travel, news, noise, social environment. Humans are strongly influenced by context; Apple Health tracks daylight/exercise/sleep but rarely connects it to life context.

**Maps to gauges:** Can affect Body, State, Emotion (e.g. low daylight → mood; travel → State).

**In the app:**
- **Context:** Optional future fields: `checkInContext.weather`, `checkInContext.daylight`, `checkInContext.travel`.
- **Wearables:** Daylight, location (when we integrate).

**Example insight:** "Low daylight may be affecting your mood this week."

---

## Soft labels (how users learn the systems)

Influencing systems stay **visible in language**, not as a separate lesson. Use this structure in insights:

**Influencing system → cause → gauge effect** — compressed into one sentence with *which*:

| Avoid (mechanical) | Prefer (smoother) |
|--------------------|--------------------|
| Recovery has been low this week. That may be affecting your energy. | **Recovery has been low this week, which may be affecting your energy.** |
| Reciprocity (connection) may be low. That may be affecting your emotion. | **Connection reciprocity may be low, which may be affecting your mood.** |

**Occasionally show the driver** (Driver → System → Gauge) so users see the cause chain:

| System-only | Sometimes use driver-led |
|-------------|---------------------------|
| Recovery has been low this week, which may be affecting your energy. | **Sleep has been low, which may be affecting your recovery and energy.** |

Mix driver-led phrasing in sometimes (e.g. ~1/3 of the time when driver data exists), not always. Users still learn the system; the copy feels less mechanical.

---

## Optional sixth: Identity (debated)

Some human models add **Identity** (self-concept, roles, beliefs, narrative): e.g. mother, leader, student, entrepreneur. It strongly influences Direction, Alignment, and Connection. In InGauge this may already live **inside Alignment** (values, identity, purpose). We keep **five** influencing systems; adding a sixth would increase cognitive load. Do not add more systems.

---

## Full model visual (if you show it)

When the product is shown visually, the layout should look like:

```
       Alignment
    Meaning System

Connection     Direction
Reciprocity     Attention

       Emotion
       State
       Body
      Recovery

(Environment surrounds everything.)
```

That visual alone explains the whole product: 6 gauges, 5 influencing systems, Environment as context.

---

## Design rule

These five do **not** become gauges. They are:

- **Drivers** — user-tagged influences (existing driver taxonomy maps into them).
- **Context** — sleep, stress, social, and future environment fields.
- **Pattern insights** — "Recovery low → Body ↓", "Reciprocity imbalanced", "Meaning supports Alignment."

The complete model makes the system feel **scientifically complete** and **empathetic**: we don’t just say "Body low," we say "Sleep debt (Recovery) and work overload (Attention) may be driving it."

---

## Implementation

- **Constants & mapping:** `src/lib/influencingSystems.ts` — system IDs, labels, and mapping from driver IDs + checkInContext to systems.
- **Insights / forecast:** Use **soft labels**: lead with the influencing system name, then cause → gauge effect (e.g. "Recovery has been low this week. That may be affecting your energy."). See `src/services/insightEngine.ts` and `forecastService.ts`.
- **Do not add more systems.** 6 gauges + 5 influencing systems is the right cognitive load; more becomes overwhelming.
- **Cascade detection:** `src/services/cascadeDetection.ts` — rule-based detection of chains (e.g. recovery → body/state/emotion; attention → direction/state; reciprocity → connection/emotion). Returns at most one cause insight per run; integrates with the insight engine. No new UI; cascades appear as cause insights (e.g. "Possible recovery cascade", "Connection has been quiet recently").
- **Forecast / Human Weather:** Current `forecastService` + Home strip already predict likely states (e.g. "Recovery has been low — likely low energy tomorrow."). A **Human Weather Forecast** — predicting how someone will likely feel tomorrow from current system signals — would extend this and can build on the same inputs (gauges, check-in context, drivers).
