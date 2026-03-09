# Wearables → Human OS: Mapping Raw Data to the Six Gauges

**Core principle:** Wearables produce raw signals; the system translates them into **human signals** that map to the six gauges. AI then turns those + check-in data into insights that improve life.

**Example:** Raw data = Heart rate variability → Human signal = Nervous system stress → Gauge = **State**.

---

## 1. Body Gauge (Physical Capacity)

Wearables are strongest here.

**Data streams to use:**
- Sleep duration, stages (REM, deep), regularity
- Resting heart rate, HRV, body temperature trends, respiratory rate, SpO2
- Activity: steps, movement, exercise minutes, calories, VO₂ max / cardiorespiratory fitness
- Recovery score (Oura / Whoop style)

**Human signal:** Physical recovery, energy capacity, illness stress.

**AI insight examples:**
- "Your energy tends to drop on days after poor deep sleep."
- "Sleep debt is accumulating."
- "Body under illness stress."
- "Exercise is improving your baseline energy."

---

## 2. State Gauge (Nervous System Regulation)

HRV and stress metrics are primary.

**Signals:**
- Heart rate variability (primary)
- Resting heart rate deviations, stress score (Apple Watch / Garmin)
- Respiration rate, skin temperature shifts
- Sleep quality, activity load vs recovery

**Human signal:** Autonomic balance, chronic stress load, recovery cycles, burnout risk.

**AI insight examples:**
- "Your nervous system appears overloaded after three consecutive late nights."
- "Your HRV drops significantly during heavy work weeks."

---

## 3. Emotion Gauge (Mood & Affect)

Wearables don’t measure emotion directly; use digital phenotyping.

**Signals:**
- Sleep patterns, activity levels, circadian stability, HRV
- Voice tone (if permitted), behavioral signals from usage

**Pattern:** Low activity + irregular sleep + reduced social interaction often predicts mood decline.

**AI insight examples:**
- "Low activity and poor sleep often precede days where you report low mood."
- "You feel emotionally better on nights with 7+ hours of sleep."

---

## 4. Connection Gauge (Social Health)

Indirect contribution from wearables.

**Signals:**
- Location (visiting others vs isolation), communication frequency (calls/messages metadata only)
- Calendar social events, movement outside home, group activities

**Human signal:** Social engagement vs isolation.

**AI insight examples:**
- "You report higher mood on days you spend time outside your home."
- "Your mood improves when you spend time with close friends."

---

## 5. Direction Gauge (Life Navigation)

Not directly measured; patterns help.

**Signals:**
- Calendar, work hours, productivity/focus/learning time, routine consistency

**Human signal:** Chaotic vs aligned schedules, goal alignment, productivity rhythms.

**AI insight examples:**
- "Your focus improves when you schedule deep work earlier in the day."

---

## 6. Alignment Gauge (Values & Meaning)

Wearables can’t measure meaning; patterns suggest alignment.

**Signals:**
- Time on valued activities, goal completion, journal/reflection, social engagement aligned with values

**AI insight examples:**
- "You report stronger alignment on days when you exercise and spend time with family."

---

## Summary: Human System Model for Wearables

All wearable data should feed this mapping — **life intelligence, not just health tracking:**

| Gauge | Human signal |
|-------|----------------|
| **Body** | Physical recovery, sleep, activity |
| **State** | Nervous system regulation |
| **Emotion** | Mood predictions from physiological signals |
| **Connection** | Social engagement patterns |
| **Direction** | Goal and productivity rhythms |
| **Alignment** | Values-based behavior patterns |

---

## Additional Data Scholars Recommend

- Circadian rhythm stability, chronotype, light exposure
- Travel / time zone shifts
- Consistency of daily routines
- Stress load vs recovery cycles
- Movement diversity (not just step count)

---

## The Most Important AI Role

AI should **translate data into actionable insights**, not just display metrics.

**Four high-impact insight types:**
- **Sleep pattern:** "You feel emotionally better on nights with 7+ hours of sleep."
- **Stress:** "Your HRV drops significantly during heavy work weeks."
- **Connection:** "Your mood improves when you spend time with close friends."
- **Recovery:** "You recover faster when you avoid intense workouts after poor sleep."

---

## The Magic: Objective + Subjective

**Wearables** = objective signals.  
**Check-ins** = subjective signals.

AI should **compare both** and align them.

**Example:** "Your HRV suggests high stress, and you reported feeling overwhelmed."  
That alignment creates the most powerful insights.

---

## Data Sources to Integrate (Priority)

- Apple Health / Apple Watch
- Oura Ring, Whoop, Fitbit, Garmin
- Google Fit
- Calendar (Direction, Connection)
- Location patterns (optional), screen time (optional)

---

## Privacy Principle

- User ownership of data
- Transparent data use
- Local processing where possible
- Optional integrations

Trust is critical when combining physiological and behavioral data.

---

## Implementation Notes (Codebase)

- **Body:** `healthStore` / `healthKit` → `bodyScoreFromHealth`; sync into cockpit Body gauge.
- **State:** `healthKit` → `stateContributionFromHealth` (HRV, etc.); sync into cockpit State gauge.
- **cockpitAI.ts:** `HealthContext` (sleep, steps, exercise, HRV, etc.) is passed into `generateCrossSystemInsight`; keep mapping aligned with this doc.
- Future: Oura, Whoop, etc. should feed the same **human signals** (Body, State, Emotion-relevant patterns) so AI insights stay gauge-based, not device-specific.
