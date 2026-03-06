# Navigation — Human Operating System

**InGauge = Human Operating System.** Tabs represent human life domains, not individual features.

**Rule: 5 tabs maximum.** More increases cognitive load (HCI research). Do not add more tabs.

---

## The five tabs

| Tab | Icon | Purpose | Answers |
|-----|------|---------|---------|
| **Cockpit** | gauge (speedometer) | System awareness | How am I doing? |
| **Signals** | radio (dot.radiowaves) | Relationship system | How are my relationships doing? |
| **Tools** | wrench (construct) | Life problem solving | How do I handle this situation? |
| **Manual** | book | Understanding the human system | How do humans actually work? |
| **Me** | person.crop.circle | Identity + configuration | How is my system configured? |

---

## What lives where

### Cockpit
- 6 gauges (Body, State, Emotion, Connection, Direction, Alignment)
- Check-ins, rituals, patterns
- Weekly insight, quick reset
- Gauge-triggered suggestions, daily content

### Signals
- People list, Hero prompts
- Constellation (relationship map)
- Timeline (per-person history)
- Transmit, direct actions (Text / Call / Email)
- Two views: People | Constellation

### Tools
- 27+ life tools: Decode, Resolve, Role Play, Replay, Relate, Think, Boundaries, Difficult People, Attraction, Attachment, Crisis, Awe, etc.
- Each opens a modal or dedicated route

### Manual
- Human Manual
- Body science, nervous system, emotions, attachment, purpose, development
- Discoveries, disciplines, gauge system intro

### Me
- Profile, story, triggers, preferences
- Therapist share, sovereignty report
- Integrations (e.g. Apple Contacts), notifications, privacy

---

## Cognitive mapping

| Human function | Tab |
|----------------|-----|
| Self awareness | Cockpit |
| Social world | Signals |
| Problem solving | Tools |
| Knowledge | Manual |
| Identity | Me |

---

## Hidden routes (no tab)

- **talk** — InGauge AI companion (accessible from Cockpit or deep link)
- **circle** — Legacy circle route (merged into Signals)
- **lights** — Legacy lights route (merged into Signals)

---

## Files

- `app/(tabs)/_layout.tsx` — Tab order and icons
- `app/(tabs)/index.tsx` — Cockpit
- `app/(tabs)/signals.tsx` — Signals
- `app/(tabs)/tools.tsx` — Tools
- `app/(tabs)/learn.tsx` — Manual
- `app/(tabs)/me.tsx` — Me
