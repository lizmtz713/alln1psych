# Global System Architecture for InGauge

This doc defines the target architecture: **Universal AI Guide** + **Voice everywhere** + **Pattern detection over time**. The app should feel like a **Human Guidance System**, not a questionnaire.

---

## 1. Universal AI Assistant Layer

**Every screen can call the InGauge AI Guide (Gauge).**

**Functions:** explain · guide · coach · ask deeper questions · summarize · give suggestions

**Example:**
- User: *"I don't know what to write here."*
- Gauge: *"Let me help. Think about a time you felt proud recently. What happened?"*

**Implementation:** An "Ask Gauge" entry point (e.g. floating button or header) opens a context-aware modal. The AI receives the current screen and optional hint so it can help in place.

---

## 2. Voice Layer (Everywhere Possible)

**Voice should support:**

| Mode | Description |
|------|-------------|
| **Voice input** | User speaks instead of typing; speech-to-text fills the field or feeds AI. |
| **Voice conversation** | User talks with the AI (Talk tab). |
| **Voice journaling** | User talks freely; AI transcribes, extracts insights, organizes. |

**UX:** Microphone icon wherever there is text input. Tap mic → talk → AI handles the rest (STT, interpretation, feedback).

---

## 3. Where AI + Voice Should Exist

| Area | AI role | Voice |
|------|---------|--------|
| **Onboarding** | Extract personality, goals, priorities from open-ended speech. | "Tell me about yourself." |
| **Identity Builder** (12 Questions, Human Profile) | Help user answer; e.g. "Which matters more: freedom or stability?" | Optional voice answers. |
| **Relationship Decoder** (Decode, Relate) | Interpret situation; suggest communication. | User describes by voice. |
| **Emotional Awareness** (check-in, emotion tools) | Ask questions, identify triggers, suggest reflection. | "I feel frustrated but I don't know why." |
| **Memory Trainer** | Voice practice: repeat name, recall. | AI: "Repeat this name: Michael." |
| **Life Direction** | User talks about goals; AI extracts patterns, suggests directions. | Voice input + AI interpretation. |
| **Human Manual / Learn** | Explain concepts conversationally. | "Explain attachment styles to me." |
| **Parenting (Parent Compass)** | Strategies, scripts. | "My teenager won't talk to me." |
| **Role-play / Conflict** | Simulate other person; user speaks. | User speaks; AI responds as interviewer/partner. |
| **Journal** | Transcribe; extract patterns, growth insights. | Voice journaling. |
| **Dashboard** | Explain user's patterns. | Optional voice summary. |
| **Learning modules** | Tutor: explain differently if stuck. | "I still don't understand boundaries." |

---

## 4. Additional AI Features

- **AI Insight Engine** — Analyzes data over time: emotional trends, relationship patterns, growth.
- **Personal Pattern Detector** — e.g. "You report feeling most energized when working on creative tasks."
- **AI Coach Mode** — User talks; AI asks questions, guides thinking (reflection, not therapy).
- **AI Question Generator** — When stuck, AI generates prompts (e.g. "What is something you avoid because it scares you?").

---

## 5. AI Personality

Gauge should feel like a **wise guide**, **thoughtful friend**, **calm mentor** — not robotic.

---

## 6. Build Instruction

Every major feature should support:

1. **Text input**
2. **Voice input** (tap mic → speak → STT → structured data or AI)
3. **AI-assisted guidance** (explain, guide, coach, suggest)

Voice input converts speech to text and feeds the AI. Each feature should expose an **AI interaction layer** and **voice interaction layer** so the experience feels **conversational**, not form-based.

**Every place where a user types should optionally allow:**
- Tap microphone to speak
- AI assistance to help answer
- AI summarization of responses

---

## 7. Pattern Detection Over Time (High Impact)

The power of the app is **pattern detection over time**, e.g.:

- Emotional triggers
- Communication style
- Growth trends
- Personality signals

Insights like *"You tend to feel stressed when you have unclear expectations"* or *"Your connection gauge is often low on Mondays"* make the system feel intelligent and personal.

**Implementation direction:** Aggregate check-ins, conversation summaries, and gauge history; run periodic or on-demand insight generation; surface in dashboard and in AI context so Gauge can reference patterns in conversation.
