# InGauge Mental Model Diagram

**Purpose:** One visual that explains the entire Life OS in under 5 seconds. Fortune-100 product teams call this the "mental model diagram." When users get it instantly, the app becomes intuitive instead of confusing.

---

## The Human System Wheel

The simplest scientifically grounded structure is **six core signals** with **you** at the center:

```
        Alignment
            ▲
            │
Connection ◄─ YOU ─► Direction
            │
            ▼
        Emotion
            │
            ▼
           State
            │
            ▼
           Body
```

**Visually (the wheel):**

- **Alignment** — top  
- **Connection** — upper left | **Direction** — upper right  
- **Emotion** — middle  
- **State** — lower  
- **Body** — bottom  

All six connect; when one moves, the others move too.

---

## Why This Layout Is Scientific

The order reflects research on how human systems interact:

| From → To | What it means |
|-----------|----------------|
| **Body → State** | Physical health (sleep, exercise, nutrition) influences energy and nervous system regulation. |
| **State → Emotion** | Physiological state shapes emotional experience (stress, fatigue, calm, overload). |
| **Emotion → Connection** | Emotions affect relationships (irritability, withdrawal, warmth, empathy). |
| **Connection → Alignment** | Relationships influence identity and meaning (family, community, belonging, purpose). |
| **Alignment → Direction** | Values guide choices (career, goals, decisions, life direction). |
| **Direction → State** | Work and responsibilities feed back into stress or satisfaction (workload, achievement, pressure). |

So the wheel is a **loop**: Body → State → Emotion → Connection → Alignment → Direction → State …

---

## The One Idea Users Must Learn

**Life problems are system problems.**

Not: *"I am broken."*  
Instead: *"One part of my system needs attention."*

That reframe alone is life-changing.

---

## How the Cockpit Fits

The **Cockpit** is the **System Dashboard**:

- Like an airplane cockpit  
- Like a car dashboard  
- Like a spacecraft control panel  

It shows the six gauges at a glance. Check in → see what’s low → understand patterns → take action.

---

## The Invisible Layer: Drivers

Around the wheel are **drivers** — the causes that move the gauges:

- Sleep · Work · Family · Stress · Health · Environment  

So the full model is:

```
Drivers
   ↓
Human System (6 gauges)
   ↓
Insights
   ↓
Actions
   ↓
Improved System
```

This is the **Life Loop**: **Notice → Understand → Act → Learn → Repeat.** That’s what makes the system adaptive.

---

## Example in One Line

**Drivers → Gauges → Insights → Actions**

- Sleep ↓ → Body ↓ → State ↓ → Emotion ↓  
- **Insight:** "Low sleep may be affecting your energy."  
- **Action:** "Try an earlier night."

---

## UX Rule: Show This Once

Show the **Human System Wheel** once in onboarding with the line:

> **You are a system.**  
> Body · State · Emotion · Connection · Direction · Alignment  
> When one moves, the others move too.

That single explanation can make the entire app click instantly.

---

## Implementation

- **Component:** `src/components/HumanSystemWheel.tsx` — reusable wheel with "YOU" in center, six gauge labels, optional ring.
- **Onboarding:** Step 2 (Human System) uses `HumanSystemWheel` + the key copy above.
- **Elsewhere:** Can be reused in Learn, Me, or a "How InGauge works" modal.
