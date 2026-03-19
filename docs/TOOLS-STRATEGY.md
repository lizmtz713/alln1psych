# Tools Tab Strategy

**Philosophy:** Tools answer *“What should I do right now?”* — situational, action-oriented, often practice-based and AI-assisted.

This doc captures placement rules, high-value tool specs, and how to keep the Tools tab from becoming overwhelming.

---

## 1. Tone Check / Communication Feedback (standalone tool)

**Concept:** A tool that helps users understand how their message might sound to someone else — **communication awareness, not tone policing.** The system never labels the user as wrong; it describes how the message may be perceived and offers alternatives.

**Route:** `/tools/tone-check` (implemented).  
**Domain:** Tools, alongside other communication tools (Decode, Relate, Role Play, Reach Out, Relational Bridge).  
**Input:** Text (paste or type) or **voice** — tap “Record with voice”, then we transcribe via Whisper and run the same tone analysis on the transcript. So it can be voice.

### Why it fits InGauge

- Connection, alignment, communication, understanding are core. Most communication problems: *intent ≠ perceived tone*. This tool helps close that gap.
- Frames feedback as *awareness* (e.g. “Your message may come across as frustrated”) not *judgment* (e.g. “Your tone is aggressive”). Subtle wording, big impact.

### Three modes (when built)

| Mode | Input | Output |
|------|--------|--------|
| **Tone check** | User speaks or pastes a message | Tone detected (e.g. frustrated / accusatory), possible impact on listener, alternative phrasing. Example: “Why didn’t you call me back?” → “I was hoping to catch up earlier. Is everything okay?” |
| **Speak-before-you-send** | User practices what they plan to say (voice or text) | AI analyzes tone, emotional intensity, clarity. E.g. “You sounded tense and rushed. Suggestion: slow down slightly and remove the phrase ‘always.’” |
| **Emotional translation** | User speaks emotionally; wants help expressing clearly | AI names emotion (e.g. hurt / feeling overlooked) and suggests a clearer message. E.g. “I’m just tired of being ignored” → “I’ve been feeling disconnected lately and would really like to talk.” |

### Design rule (non-negotiable)

- **Never** say things like: “Your tone is aggressive.”
- **Do** say: “Your message may come across as frustrated.” / “The listener may feel blamed.”
- Goal: help users, not judge them.

### Technical feasibility

- Text-based tone/sentiment analysis is well within reach of current models. **Voice is supported:** user records → we transcribe with Whisper → the same tone analysis runs on the transcript. No separate “voice tone” model needed for v1.
- **Optional later:** Raw voice tone (pace, stress) could be analyzed separately; for now, transcript is enough.
- **Optional:** AI-detected tone could contribute signals for the six gauges. Document in gauge logic if adopted.

### Where it could appear

- **Tools tab** — primary home.
- **Ask Gauge** — “How does this message sound?”
- **Reach Out** — suggest tone improvements before sending.
- **Relational Bridge** — suggest neutral phrasing.
- **Role Play** — tone feedback after a simulation.

### Tone Check success criteria

- User can paste or speak a message (text + voice both supported).
- App returns: (1) likely tone, (2) possible listener impact, (3) alternative phrasing.
- Feedback is non-judgmental (perception language: “may come across as…” / “listener may feel…”).
- Output is fast enough to feel usable in real conversations (aim for under a few seconds after Analyze).
- Tool is reachable from Tools and, when added, from contextual communication surfaces (Reach Out, Relational Bridge, Role Play, Ask Gauge).

---

## 2. Speech / conversation practice (standalone tool when fitting)

**Idea:** A dedicated speech/conversation practice tool: difficult conversation, apology, asking for help, boundaries, feedback, public speaking, relationship talk, job interview; AI modes: rehearse, analyze tone, suggest improvements, simulate listener.

**Placement when/if built:** Under Tools. Examples: `/tools/practice` + `/tools/practice/speech`, or `/tools/speech-practice`. Sits naturally next to **Tone Check** and Role Play.

**Why it fits Tools:** Situational, action-oriented, practice-based, AI-assisted.

**MVP option:** If Role Play can cover the core scenarios, start with presets (e.g. Role Play → Public speaking, Role Play → Difficult conversation). When the use case justifies it, promote to its own tool.

---

## 3. Tool explosion risk

Tools already include: help someone, reach out, relational bridge, decision, resolve, role-play, perspective translator, memory builder, life direction finder, and others. If every idea becomes a new tool, the Tools tab becomes hard to scan.

**Mitigation:** Organize tools into **categories** in the Tools tab UI, for example:

| Category | Example tools |
|----------|----------------|
| **Communication** | reach out, relational bridge, role play |
| **Decision & thinking** | decision, bias check, critical thinking |
| **Self regulation** | quick reset, breathing, awe activities |
| **Relationships** | help someone, relationship repair |
| **Growth** | life direction finder, memory builder |

Categories keep the tool library scannable and make it easier to add new tools without clutter. Implement category groupings when the list grows or when doing a Tools tab UX pass.

---

## 4. Tools registry (quick reference)

A registry helps developers and product see what exists at a glance. Group by category; mark status to prevent backlog confusion.

**Status labels:** **Existing** (shipped) · **Planned, MVP candidate** (prioritize for launch) · **Planned, later** (backlog) · **Planned** (no phase yet).

| Category | Tools |
|----------|--------|
| **Communication** | Decode (existing), Relate (existing), Reach Out (existing), Relational Bridge (existing), Role Play (existing), **Tone Check** (existing), Speech Practice (planned, later) |
| **Decision & thinking** | Decision (existing), Bias Check (existing), Critical Thinking (existing) |
| **Self regulation** | Quick Reset (existing), Breathing (existing), Awe Activities (existing) |
| **Relationships** | Help Someone (existing), Relationship Repair (existing) |
| **Growth** | Life Direction Finder (existing), Memory Builder (existing) |

Update status when tools ship or are deprioritized. Use this table to avoid duplicate tools and to assign new ideas to the right category.

---

## 5. Relation to other docs

- **FEATURE-INTAKE.md** — Use before adding any new tool or feature (including “just one more tool”).
- **TAB-ORGANIZATION-STATUS.md** — Tools is structurally complete; new tools should fit existing domains and entry points.
