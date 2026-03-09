# Human OS — Five Layers (Meaning, Values, Bias, Energy, Skills)

**Purpose:** Move InGauge from "How am I doing? What should I do?" to "Who am I becoming? What matters most? What chapter of life am I in?" — so the app addresses **interpretation, meaning, and translation into behavior**, not just data.

---

## 1. Meaning Layer (Life Chapters & Narrative Identity)

**Research:** Dan McAdams, narrative identity — humans regulate identity through life stories.

**Already in app:**  
- `userStore.currentLifeStage`, `whatBringsMeaning`  
- Goals, Signals, Manual

**Gap:** No explicit **life chapter** (e.g. "New parent", "Career transition", "Recovery") that shapes insights.

**Implementation:**
- **LIFE_CHAPTERS** constant (canonical chapters); user can set **current life chapter** (or we use `currentLifeStage` as proxy).
- Insights use chapter when present: e.g. "During life transitions, connection and direction often fluctuate."
- Future: turning points, identity shifts (optional).

---

## 2. Personal Values Layer

**Research:** ACT, Self-Determination Theory, moral psychology — values clarity improves wellbeing.

**Already in app:**  
- `userStore.values` (string[]), `setValues` (used by Drift Detector)  
- `ALIGNMENT_VALUES` in `lib/gaugeOptions.ts` (Family, Freedom, Creativity, …)  
- Goals, Alignment gauge, Drift Detector value reflection

**Gap:** Values not yet used in **insights** (e.g. "Your goals align with your value of X" / "Workload may be crowding out family").

**Implementation:**
- Pass **userValues** into the Insight Engine.
- Cause/growth insights: "Your recent goals align with your value of [value]"; "Your reflections suggest [value] is getting crowded out."
- Keep goals → values mapping (goals already have `whyItMatters`); use in insights.

---

## 3. Cognitive Bias / Thinking Layer

**Research:** Behavioral science — predictable distortions (catastrophizing, mind-reading, confirmation bias, sunk cost, negativity bias).

**Already in app:**  
- `src/data/biases.ts` (BIASES with patterns)  
- `src/services/biasDetection.ts` (`detectBiasesInText`)  
- `biasStore`, `BiasFilterCard`, tools (Reframe, etc.)

**Gap:** Bias detection not wired into **insights** or **tool suggestions** from context (e.g. "Your thoughts may be leaning toward worst-case thinking" → suggest Reframe).

**Implementation:**
- Pass **recentText** (last check-in note or last user message) into the Insight Engine when available.
- Run `detectBiasesInText(recentText)`; if any match, add one **cause** insight + **suggestedTool** (e.g. Reframe, Thought Challenger).
- Theme: `emotional_support` or new `thinking_bias`; dedupe so only one bias insight per batch.

---

## 4. Human Energy Management Layer

**Research:** Energy regulation (sleep, cognitive load, emotional load, social energy, decision fatigue) — not just motivation/discipline.

**Already in app:**  
- Body and State gauges; health/wearable cause insights (sleep, recovery, HRV)  
- `userStore.energyPattern` (profile)

**Gap:** No explicit **energy budgeting** or insights like "You've used most of your cognitive energy today; a break may help."

**Implementation:**
- **Energy context** in the engine: e.g. `checkInsToday`, `hour`, optional `conversationCountToday`.
- One or two insights when appropriate: e.g. "You've had a lot of inputs today; a short break may help" (when check-ins high + State low); "Late evening check-ins often mean a busy day — rest supports tomorrow."
- No new data sources; use existing check-in count and time of day.

---

## 5. Life Skills Library (Core Human Skills)

**Research:** Core life skills (emotional regulation, conflict, decision-making, repair, boundaries, uncertainty tolerance) are **learnable**, not personality flaws.

**Already in app:**  
- **16 Human Skills** in 4 domains (Self, Regulate, Connect, Grow): `src/data/humanSkills.ts`, `src/types/human-skills.ts`  
- Learn > Skills UI (`app/learn/skills/index.tsx`, `[id].tsx`); points from check-ins, Quick Reset, Post-Flight, Talk  
- Tools (Boundaries, Reach Out, Referee, etc.) and Manual

**Gap:** Not yet framed as **"Core Human Skills — learnable, not flaws"** in one place; could be more discoverable and linked to tools.

**Implementation:**
- Frame the existing Skills screen as **Core Human Skills** (subtitle: "These are learnable skills, not personality traits").
- Optional: one **insight or discovery card** that links to Skills ("Building these skills supports all your gauges") and/or JIT lesson that surfaces a skill when relevant.
- Map tools to skills (e.g. Boundaries → boundaries, Reach Out → communication, repair) for suggestions.

---

## Phased Implementation

| Phase | Focus | Status |
|-------|--------|--------|
| **1** | Meaning + Values + Energy in insights | **Done.** LIFE_CHAPTERS (`src/data/lifeChapters.ts`); lifeChapter (from `userStore.currentLifeStage`), userValues, energyContext in engine; cause insights for life chapter, values, energy; caps unchanged. |
| **2** | Bias in insights + tool suggestion | **Done.** recentText from last conversation message; detectBiasesInText; one bias cause insight with suggestedToolRoute/Label; GeneratedInsightCard shows "Try: Thought Challenger". |
| **3** | Life Skills framing | **Done.** Learn > Skills screen titled "Core Human Skills" with subtitle "These are learnable skills, not personality traits." |
| **4** | Deeper meaning (optional) | Not started. Life chapter can be set in Profile > What gives life (currentLifeStage); optional dedicated LIFE_CHAPTERS picker later. |

---

## File Map (existing)

- **Values:** `userStore.values`, `setValues`; `lib/gaugeOptions.ts` (ALIGNMENT_VALUES); `services/driftDetector.ts` (SUGGESTED_VALUES).
- **Bias:** `data/biases.ts`, `services/biasDetection.ts`, `stores/biasStore.ts`, `types/bias.ts`.
- **Energy:** Body/State gauges; health context in insight engine; `userStore.energyPattern`.
- **Skills:** `data/humanSkills.ts`, `types/human-skills.ts`, `stores/humanSkillsStore.ts`; `app/learn/skills/*`.
- **Meaning / life stage:** `userStore.currentLifeStage`, `whatBringsMeaning`.
