# Tool Audit Framework

**Three families of tools, then a category-by-category audit.**

Use this to decide how each tool should behave: **Action** tools give clear recommendations; **Insight** tools give interpretation, not instructions; **Practice** tools give scenarios and feedback. Relate should not look like a repair tool.

---

## Part 1: Three Types of Tools

| Type | When used | Output |
|------|-----------|--------|
| **Action** | User needs to **do something right now** | Clear recommendations, next step, optional script |
| **Insight** | User wants **understanding or perspective** | Interpretation, possible meanings, no forced recommendation |
| **Practice** | User wants to **build skill through simulation** | Practice scenarios, feedback, rehearsal |

### Action tools (examples)

- Tone Check  
- Repair Builder  
- Quick Decision  
- Reach Out  

**Produce:** clear recommendations, one next move, actionable buttons.

### Insight tools (examples)

- Relate  
- Decode  
- Bias Check  
- Critical Thinking  

**Produce:** interpretation, perspective, possible motivations/misunderstandings. **Do not** force a recommendation.

### Practice tools (examples)

- Role Play  
- Conversation Builder  
- Boundary practice  

**Produce:** practice scenarios, feedback, optional follow-up (e.g. Tone Check).

---

## Part 2: Category-by-Category Audit

### Relate

- **Purpose:** Perspective-taking.  
- **Status:** Good concept. Minor improvements only.  
- **Keep focused on:**  
  - How the other person might see the situation  
  - Possible motivations  
  - Possible misunderstandings  
- **Add:** Example phrasing; optional follow-up (Tone Check).  
- **Do not:** Force a recommendation. (Insight tool.)

---

### Tone Check

- **Purpose:** Rewrite messages before sending.  
- **Status:** Strong tool.  
- **Focus on:** Tone detection · Impact explanation · Suggested rewrite.  
- **Improvement:** Multiple rewrite styles: **softer**, **clearer**, **shorter** (and firmer if already in spec).

---

### Repair Builder / Conversation Builder

- **Purpose:** Relationship repair.  
- **Status:** Core feature.  
- **Focus on:** What happened · What you felt · What you need · What you want.  
- **Output:** Suggested message · Practice option (e.g. Role Play).

---

### Quick Decision

- **Purpose:** Everyday decision clarity.  
- **Status:** Needs redesign (already moving this way).  
- **Make it:** Fast · 3 inputs max · One clear next move.

---

### Reach Out

- **Purpose:** Initiate communication.  
- **Status:** Good but could be stronger.  
- **Add:** Message templates · Conversation starters · Tone suggestions.  
- **Goal:** Reduce friction.

---

### Relational Bridge

- **Purpose:** Understand both sides of a conflict.  
- **Status:** Good concept.  
- **Output:** Your perspective · Their perspective · **Bridge language**.  
- **Example:** *"I think we're both frustrated about this."*

---

### Decode

- **Purpose:** Interpret messages (what did they mean?).  
- **Status:** Needs improvement; likely generic today.  
- **Better structure:**  
  - Possible meaning  
  - Possible emotional tone  
  - Possible misunderstanding  
  - Suggested response  

---

### Boundaries

- **Purpose:** Teach boundary setting.  
- **Status:** Good concept; likely needs simplification.  
- **Input:** Situation · Relationship type · Boundary type.  
- **Output:** Suggested boundary · Why it matters · Example script.

---

### Difficult People

- **Purpose:** Handle challenging behavior.  
- **Status:** Useful but may feel vague.  
- **Structure around types:** Critic · Manipulator · Passive-aggressive · Dominant · Avoidant.  
- **Output:** Recommended approach · Example response.

---

### Bias Check

- **Purpose:** Reduce cognitive distortions.  
- **Status:** Good but probably too abstract.  
- **Make it situation-based.**  
- **Example:** *You might be assuming intent. Suggested step: Ask a clarifying question.*

---

### Critical Thinking

- **Purpose:** Evaluate ideas or arguments.  
- **Status:** Probably the weakest for everyday use.  
- **Consider:** Merging with Decision or Bias Check rather than standing alone.

---

### Role Play

- **Purpose:** Conversation practice.  
- **Status:** Very strong if done well.  
- **Add preset scenarios:** Apology · Asking for help · Setting boundary · Difficult conversation.

---

### Quick Reset

- **Purpose:** Emotional regulation.  
- **Status:** Good simple tool.  
- **Keep it short:** Breathing · Grounding · Pause.

---

### Decision (Full)

- **Purpose:** Bigger life decisions (not quick everyday).  
- **Status:** Different from Quick Decision.  
- **Should allow:** Deeper reflection; more inputs/steps OK.

---

## Part 3: Suggested Tool Categories (UI / navigation)

Group tools so users can find them by goal:

| Category | Tools |
|----------|--------|
| **Communication** | Tone Check · Reach Out · Relate · Relational Bridge |
| **Conflict & Repair** | Repair Builder · After the Fight · Decode |
| **Thinking & Decisions** | Quick Decision · Full Decision · Bias Check |
| **Personal Regulation** | Quick Reset · Emotional tools |
| **Practice** | Role Play · Conversation Builder · Boundary practice |

Use these when organizing the Tools tab, Helpful Right Now, or cockpit suggestions.

---

## How this fits the Tool Quality Standard

- **TOOL-QUALITY-STANDARD.md** defines: Fast, Clear, Context-aware, Actionable; standard output (Understanding, Recommendation, Why, Next step); “Did this help?”  
- **This doc** defines: **Action vs Insight vs Practice** so we don’t force recommendations on Insight tools (e.g. Relate) and we give the right output shape for each family.  
- When upgrading a tool, ask: Is it Action, Insight, or Practice? Then apply the right output and behavior.
