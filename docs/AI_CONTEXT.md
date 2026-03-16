# AI Context — Portable Project Brain

Paste the block below when another AI needs to understand your app without full repo access. It gives product intent, architecture rules, navigation, and tech stack so suggestions stay aligned.

---

```
APP: InGauge (AllN1 Psych)
Mobile app focused on emotional intelligence, relationship repair, and life navigation. Uses signals, tools, and short-form lessons. Not therapy.

PRODUCT PURPOSE
  InGauge helps users navigate emotions, relationships, and decisions using signals, tools, and short-form lessons. It focuses on real-world communication and repair, not general AI advice.

TECH
  Expo SDK 54
  React Native
  TypeScript
  Expo Router (file-based navigation)
  Supabase (auth, database, realtime)
  Zustand (state)
  React Query (data fetching)
  OpenAI (chat + tone/repair analysis)
  Whisper (speech transcription)

REPO ROOT
  app/            ← Expo Router screens only
  src/            ← components, services, stores, lib, data, providers
  docs/           ← architecture and specs
  scripts/, assets/

APP ROUTING STRUCTURE

  (tabs)/
    index        Cockpit dashboard (gauges + rituals)
    signals      Insights and attention alerts
    people       Relationships (circle, lights)
    tools        Entry to tools stack
    learn        Entry to learning stack
    me           Profile/settings

  tools/         Tool workflows
  learn/         Learning content
  foundation/    Gauge system (Body, State, Emotion, Connection, Direction, Alignment)
  profile/       Identity and user configuration
  emergency/     Crisis support tools
  rituals/       Pre-flight / post-flight reflection
  love/          Relationship records (datesume)
  lights/        Relationship status system
  mind-mail/     Communication layer
  share/         Snapshot sharing

  (modals)/      Transient full-screen flows only.

DOMAIN OWNERSHIP RULES
  Cockpit   → dashboard & check-ins
  Signals   → predictions and alerts
  People    → relationships & records
  Tools     → actionable workflows
  Learn     → educational content
  Me        → identity & settings

ARCHITECTURE RULES
  • Each feature belongs to one domain: Cockpit, Signals, People, Tools, Learn, Me, Insights, Body, Emergency, Rituals, Share.
  • New features must declare a domain owner.
  • Workflow tools belong under /tools.
  • Educational content belongs under /learn.
  • Relationship records belong under People/Love.
  • Modal reduction completed; avoid adding new modal workflows unless truly transient.

HIGH-LEVEL FEATURES

Cockpit
  Dashboard with six gauges and quick check-in.

Signals
  Attention alerts and relationship drift detection.

People
  Circle, Lights, Mind Mail, invite flows.

Tools
  Communication and decision tools:
  - Conversation Builder (Observe → Feel → Need → Request)
  - Tone Check (before you send)
  - Repair Builder
  - After the Fight
  - Role Play
  - Reach Out
  - Relational Bridge
  - Quick Reset
  - Decision

Learn
  Short lessons: relationship repair, modern manners, human skills, life literacy, self-discovery.

Me
  Identity, goals, preferences, integrations.

Talk
  Voice-first AI companion.

Emergency
  Crisis resources and stabilization tools.
```

---

**Why this matters**

When you paste this block, the other AI can:

- **Product intent** — Avoid generic chatbot or therapy features; stay on real-world communication and repair.
- **Architecture rules** — Keep features in the right domain and under the right routes; avoid new modals for multi-step flows.
- **Navigation** — Reason about (tabs), tools/, learn/, and other stacks correctly.
- **Tech stack** — Suggest implementations that fit Expo, Supabase, Zustand, and OpenAI.

**Tip:** Keep this file as your portable project brain. Paste it at the start of any conversation where the AI doesn’t have repo access.
