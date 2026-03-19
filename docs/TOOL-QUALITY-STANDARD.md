# Tool Quality Standard

**Pause expansion. Upgrade the intelligence and usefulness of every tool.**

The difference between a mediocre app and a great one is how useful each tool feels **in the moment**. Every tool should pass the four tests below and produce a consistent, actionable result.

**Three families:** Tools fall into **Action** (clear recommendations, next step), **Insight** (interpretation, perspective — do *not* force a recommendation), and **Practice** (scenarios, feedback). Match the output to the type: e.g. Relate is Insight, not a repair tool. See `docs/TOOL-AUDIT-FRAMEWORK.md`.

---

## Step 1: What makes a tool "good"

Every tool must pass **four tests**:

| Test | Bar |
|------|-----|
| **1. Fast** | User reaches the result in **under 60 seconds**. |
| **2. Clear** | One clear outcome, **not a paragraph of advice**. |
| **3. Context-aware** | Uses **decision context**, **relationship type**, and **emotional signals** (gauges). |
| **4. Actionable** | User knows **exactly what to do next**. |

If a tool fails any of these, it needs an upgrade before adding new features.

---

## Step 2: Standard tool output

Every tool should produce a **consistent structure** (max 4 sections):

| Section | Purpose | Example |
|---------|---------|--------|
| **Understanding** | What’s happening (one short line) | *This looks like a relationship timing decision.* |
| **Recommendation** | Best next move (one line) | *Wait until tomorrow before sending the message.* |
| **Why** | 2–3 short reasons (bullets) | • You’re emotionally activated.<br>• Difficult conversations often escalate at night. |
| **Next step** | Action button(s) | *Rewrite message → Tone Check* |

If a tool doesn’t produce something this clear, it needs redesign.

---

## Step 3: Priority order for upgrades

Fix the **most-used** tools first. Do **not** fix everything at once.

| Priority | Tool | Route / location |
|----------|------|-------------------|
| 1 | **Tone Check** | `/tools/tone-check` |
| 2 | **Repair Builder / Conversation Builder** | `/tools/repair`, `/tools/conversation-builder` |
| 3 | **Quick Decision** | `/tools/decision/quick` |
| 4 | **Reach Out** | `/tools/reach-out` |
| 5 | **Role Play** | `/(modals)/role-play`, `/tools/role-play` |
| 6 | **After the Fight** | `/tools/after-fight` |
| 7 | **Relational Bridge** | `/tools/relational-bridge`, `/(modals)/relational-bridge` |

Upgrade one tool per week; test before moving to the next.

---

## Step 4: Tool intelligence (context)

Tools feel weak when they don’t use enough context. Each tool should consider:

- **Relationship type** (partner, friend, family, coworker, etc.)
- **Emotional state** (gauges: emotion, state, body)
- **Decision type** (timing, repair, boundary, etc.)
- **User values** (when available)
- **User intent** (what they’re trying to achieve)

**Example:**

- **Generic:** *Talk to them calmly.*
- **Context-aware:** *Your emotional state is low and this involves a partner. Best next move: pause and write your message tomorrow.*

That feels human.

---

## Step 5: Example scripts

People want to know: **“What exactly should I say?”**

Tools should include **example scripts** where relevant (e.g. Repair Builder, Tone Check rewrite, Reach Out).

**Example:**

**Suggested message**  
*"I realize I sounded harsh earlier. I care about our relationship and want to talk."*

This dramatically increases usefulness.

---

## Step 6: Limit complexity

Many tools fail because they ask too many questions.

**Rules:**

- **Maximum inputs:** 3–4 (e.g. what happened, who with, how intense).
- **Maximum output sections:** 4 (Understanding, Recommendation, Why, Next step).

If a tool needs more, it should be the **Full** version (e.g. Full Decision), not the quick version.

---

## Step 7: Test with real scenarios

When testing tools, run them against **realistic situations**:

- Should I apologize to my friend?
- Should I text my boss tonight?
- How do I tell my partner I’m upset?
- How do I decline this invitation?

If the output feels **obvious or useless**, the tool needs improvement.

---

## Step 8: Measure usefulness

After using a tool, ask:

**Did this help?**  
👍 Yes · 👎 No

Store the response (anonymous is fine). Use it to see which tools actually work and which need more upgrades.

---

## Step 9: Tone

Tool and AI tone should feel:

- **Calm**
- **Thoughtful**
- **Non-judgmental**
- **Clear**

Avoid:

- Lecture
- Therapy-speak
- Robot / generic

---

## Step 10: Upgrade gradually

Do **not** rewrite everything at once.

- **Week 1** → Tone Check  
- **Week 2** → Repair Builder  
- **Week 3** → Quick Decision  
- …

Test each upgrade before moving to the next.

---

## The real goal

When a user finishes a tool, they should feel:

**“That actually helped.”**

Not:

**“I already knew that.”**

---

## Implementation notes

- **Quick Decision** already uses signals (gauges) and a structured result (decisionRead, bestNextMove, whyBullets, nextStep). Use that pattern as the reference for other tools.
- **Standard result type:** `src/types/tools.ts` exports `StandardToolResult` (understanding, recommendation, whyBullets, nextStep, exampleScript?). Use or align tool outputs with this shape.
- **“Did this help?”:** `src/components/tools/DidThisHelp.tsx` — drop at the bottom of tool result screens; pass `toolId` and optional `onFeedback(helpful, toolId)` for persistence/analytics. Quick Decision uses it as the first adoption.
- See **NAVIGATION_LOOP.md** so tools fit the loop: Signal → Insight → Action → Reflection (tool = action; “Did this help?” = reflection).
- See **TOOL-AUDIT-FRAMEWORK.md** for the three tool types (Action / Insight / Practice), category-by-category audit, and suggested UI categories (Communication, Conflict & Repair, Thinking & Decisions, Personal Regulation, Practice).
