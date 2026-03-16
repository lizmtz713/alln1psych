# InGauge Onboarding — Simple Version

**Goal:** Show immediate value first, explain the system after the user experiences it. Keep everything under ~1 minute. Avoid overwhelming people.

**Principle:** First thing a user can do within ~20 seconds: **Fix a message** or **Check how they feel**. Universal moments.

---

## Flow (6 screens)

### Screen 1 — Hook

- **Title:** Life is complicated. Most people were never taught how to navigate it.
- **Subtext:** InGauge helps you understand yourself, handle difficult conversations, and improve relationships.
- **Button:** Get Started

### Screen 2 — Choose Why You're Here

- **Question:** What would help you most right now?
- **Options:**
  - Fix a message or conversation
  - Understand how I'm feeling
  - Improve my relationships
  - Practice difficult conversations
  - Just explore

Each option leads to a different first experience on the next screen.

### Screen 3 — Immediate Value

Branch by choice:

| Choice | Experience |
|--------|------------|
| **Fix a message** | Paste the message you're about to send → app shows tone feedback + rewrite. User understands the product. |
| **Understand how I'm feeling** | Quick check-in: "How are you doing right now?" → show gauges + short insight. |
| **Improve my relationships** | Repair Builder: "What happened?" → generate a suggested repair message. |
| **Practice conversations** | Role Play: show scenarios (Start a difficult conversation, Apologize, Ask for help, Set a boundary). |
| **Just explore** | Skip to system intro (Screen 4). |

### Screen 4 — Show the System

- **Copy:** InGauge helps you navigate life using three things:
  - **Signals** — Understand what's happening
  - **Tools** — Handle real situations
  - **Learning** — Build skills over time
- Connects the dashboard and tools in one mental model.

### Screen 5 — Permissions (Optional)

- **If the user wants:** Connect Apple Health or Oura
- **Explain:** Your signals help us suggest the right tools.
- **Allow skipping.**

### Screen 6 — Cockpit

- Show the Cockpit (or transition to it).
- Highlight **one** thing:
  - "Try your first check-in"
  - or "Need help with a message?"

---

## What users should feel after onboarding

- **This helps me handle real-life situations.**
- Not: *This looks like a complicated dashboard.*

---

## How it connects to architecture

- **Signals** → understand  
- **Tools** → act  
- **Learn** → grow  

Onboarding introduces this order: experience first, then the three-part system, then Cockpit.

---

## Implementation notes

- Legal/consent and name/age can remain as required steps (e.g. after System, before Cockpit) for compliance.
- Screen 3 "Immediate value" can be inline (mini Tone Check, mini check-in, etc.) so the user never leaves onboarding, or can open the real tool and return (e.g. `fromOnboarding` param).
- First actionable moment within ~20 seconds: Fix a message (Tone Check) or Check how you feel (quick check-in).
