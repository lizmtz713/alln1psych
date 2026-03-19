# Conversation Builder — Observe → Feel → Need → Request

**Route:** `/tools/conversation-builder`

**Purpose:** Signature MVP tool that turns messy emotions into a clear, respectful message using the NVC-style (Nonviolent Communication) framework. Works in 30–60 seconds.

---

## The framework

Research in conflict and relationship psychology supports a simple 4-step loop:

1. **Observe** (without judgment) — What happened? Start with facts, not accusations.
2. **Feel** — Name the emotion. "I felt ignored."
3. **Need** — The value or need behind the feeling. "I need to feel heard."
4. **Request** — A clear, respectful ask. "Could we put phones away when we talk?"

**Example output:**

> When my message went unanswered earlier,  
> I felt hurt because I needed attention.  
> Could we talk about it?

---

## Flow (MVP)

- **Step 1:** What happened? (select or type)
- **Step 2:** What did you feel? (Hurt, Frustrated, Ignored, etc.)
- **Step 3:** What did you need? (Respect, Attention, Understanding, etc.)
- **Step 4:** What do you want now? (A conversation, An apology, A boundary, etc.)

Then the app **builds the message** (template-based; no API required for MVP).

**After the message:** Tone Check | Practice saying it | Copy to send | After the Fight

---

## How it connects

- **Conversation Builder** → Tone Check → Role Play → Reach Out → After the Fight

Repair Builder also links to Conversation Builder: "Build a clear message (Observe → Feel → Need → Request)."

---

## Design rule

The app never says "You are wrong." It describes perception and suggests clearer phrasing. Conversation Builder keeps the output user-owned and respectful.

---

## Implementation

- **Data:** `src/data/conversationBuilder.ts` — options for each step, `buildConversationMessage(observe, feel, need, request)`.
- **Screen:** `app/tools/conversation-builder/index.tsx` — 4 steps, result view, CTAs.
- **Entry points:** Tools tab (Relationship repair section), Repair Builder result.

Phase 2 (later): optional AI polish, voice input, conflict-type detection.
