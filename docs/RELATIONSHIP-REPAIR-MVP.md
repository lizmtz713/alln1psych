# InGauge Relationship Repair MVP

**Goal:** Ship a tight MVP to test with users, stay within a $10/month value proposition.

**Core idea:** When someone has a relationship problem, the app helps them: **Understand** → **Calm down** → **Say something better** → **Repair.**

Not a therapy system or textbook. Practical repair tools for real situations.

---

## MVP: 5 parts

### 1. Repair Builder (main tool)

**Route:** `/tools/repair`

**Flow:**
- **Step 1 — What happened?** Argument | Hurt feelings | Misunderstanding | I said something wrong | They said something hurtful | Ongoing issue
- **Step 2 — Who with?** Partner | Friend | Family | Coworker | Parent/Child | Other
- **Step 3 — How intense?** Small tension | Medium conflict | Big fight

**Output:**
1. What might be happening (e.g. hurt + defensiveness loop)
2. Best next move (e.g. Start with validation before explaining)
3. Suggested script (example opening line)
4. Practice: [Tone Check] [Role Play] [Rewrite message]

### 2. Tone Check

**Route:** `/tools/tone-check` (already built)

Paste/type message → Tone + possible impact + suggested rewrite. Options: softer | clearer | shorter | firmer.

### 3. Role Play

Existing tool. **MVP presets:**
- Apologize
- Ask for repair
- Start a hard conversation
- Respond to criticism
- Set a boundary

After role play: What worked | What could be softer | Suggested improvement.

### 4. After the Fight

**Route:** `/tools/after-fight`

Short guided reflection:
- What hurt you the most?
- What do you think hurt them?
- What do you want now?

Output: Repair suggestion + example message + next step.

### 5. Micro Lessons (Learn)

**Route:** `/learn/relationship-repair`

Short lessons only. Each: 3–5 swipe cards, 1 example, 1 action. End with **Try this tool** → Repair Builder | Tone Check | Role Play.

**Example lessons:**
- Why defensiveness makes conflict worse
- How to apologize properly
- How to validate someone
- How to start a difficult conversation
- How to repair after a fight
- How to compromise without resentment

---

## How it connects

Conflict happens → **Repair Builder** → **Tone Check** → **Role Play** (optional) → **After the Fight** → **Micro lesson** reinforcement.

---

## Entry points

- **Tools tab:** Repair Builder | Tone Check | Role Play | After the Fight (prioritized at top or in one “Relationship repair” block).
- **Ask Gauge:** “How do I fix this argument?” → open **Repair Builder**.
- **Signals (later):** e.g. “Relationship tension detected → Try Repair Builder”.

---

## What NOT to build (until later)

- Deep attachment analysis
- Long therapy modules
- Couples programs
- Complex emotional diagnostics
- Voice tone analysis
- Relationship scoring

Keep it fast and useful.

---

## MVP success criteria

Users can:
1. Fix a message before sending (Tone Check)
2. Practice a difficult conversation (Role Play)
3. Repair after a fight (Repair Builder + After the Fight)
4. Learn one small communication skill (micro-lessons)

**And do it in under 2 minutes.**

---

## Final MVP tool list

| Tool | Route | Status |
|------|--------|--------|
| Repair Builder | /tools/repair | Done |
| Tone Check | /tools/tone-check | Done |
| Role Play | /(modals)/role-play | Presets added |
| After the Fight | /tools/after-fight | Done |
| Relationship Repair lessons | /learn/relationship-repair | Done |

**Entry points:** Tools tab (Relationship repair section first), Talk tab topic starter "Fix an argument" → Repair Builder, Learn tab "Relationship repair" card.

Enough to launch.
