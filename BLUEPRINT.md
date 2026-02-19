# InGauge — Complete Blueprint
## The Human Cockpit: Personal Health Operating System for the Mind (PHOSM)

**Last Updated:** February 19, 2026  
**Owner:** Elizabeth Martinez (lizmtz713)  
**Status:** LIVE on TestFlight  
**Bundle ID:** com.alln1network.psych  
**GitHub:** lizmtz713/alln1psych

---

# TABLE OF CONTENTS

1. [Vision & Philosophy](#vision--philosophy)
2. [The 6 Gauges](#the-6-gauges)
3. [Core Features](#core-features)
4. [AI Toolkit (7 Tools)](#ai-toolkit-7-tools)
5. [Technical Architecture](#technical-architecture)
6. [Academic Foundation](#academic-foundation)
7. [Monetization](#monetization)
8. [Current Status](#current-status)
9. [Roadmap](#roadmap)

---

# VISION & PHILOSOPHY

## What is InGauge?

InGauge is a personal mental health operating system that treats humans as complex systems, not broken machines. Instead of pathologizing feelings, it gives you a dashboard — like a pilot's cockpit — to monitor and understand your whole self.

**Core Insight:** "You are not broken. You are a system. And now you have a dashboard."

## Philosophy

```
1. YOU ARE NOT BROKEN
   - Mental health apps make you feel deficient
   - InGauge treats you as a complex system to understand
   - No diagnoses, no pathology — just data and insight

2. SYSTEMS THINKING
   - Everything connects: body affects mood, mood affects relationships
   - Can't fix emotion without checking body first
   - The 6 gauges capture the whole picture

3. EDUCATION OVER MEDICATION
   - Grounded in 22+ academic psychology textbooks
   - Teaches you WHY you feel what you feel
   - Knowledge is power over your own mind

4. ACCESSIBLE TO ALL
   - Crisis support is FREE forever
   - Premium is the cheapest on the market
   - No paywall on learning to understand yourself

5. WARM, NOT CLINICAL
   - Talks like a knowledgeable friend
   - No therapy-speak or medical jargon
   - Real, human, sometimes funny
```

## The Name

**InGauge** — sounds like "engage" + describes what the app does (gauges/dashboard). Perfect fit.

---

# THE 6 GAUGES

The cockpit displays 6 gauges that together capture human experience:

| Gauge | What It Measures | Key Question |
|-------|------------------|--------------|
| **🫀 Body** | Physical state | Sleep, hydration, nutrition, exercise, pain |
| **⚡ State** | Nervous system activation | Calm ↔ Activated ↔ Shutdown |
| **💜 Emotion** | Emotional granularity | What exactly am I feeling? (27+ emotions) |
| **🤝 Connection** | Social/relational health | Who knows what I'm going through? |
| **🎯 Direction** | Purpose & motivation | Am I moving toward something meaningful? |
| **⚖️ Alignment** | Values congruence | Are my actions matching my values? |

### Why These 6?

Each gauge is backed by research:

- **Body:** Biopsychology — 95% of serotonin in gut, sleep affects amygdala 60%+
- **State:** Polyvagal Theory — fight/flight/freeze are nervous system states
- **Emotion:** Emotional Granularity research — naming emotions precisely = better regulation
- **Connection:** Social Psychology — isolation amplifies every problem
- **Direction:** Purpose research — meaning buffers against depression
- **Alignment:** Cognitive Dissonance — acting against values creates stress

---

# CORE FEATURES

## 1. Cockpit Check-In
- Quick daily check-in across all 6 gauges
- Visual temperature display (green/yellow/red)
- Tracks patterns over time
- Suggests which gauge needs attention

## 2. Talk to Gauge (AI Companion)
- Main AI chat interface
- Draws from 22+ textbook knowledge base
- Knows your gauge history and context
- Warm, direct, knowledgeable

## 3. Human Manual (48+ Lessons)
- Psychology education in digestible chunks
- Topics: emotions, relationships, nervous system, etc.
- "The manual you should have gotten for being human"

## 4. 101 Discoveries
- Quick psychology insights
- Swipeable cards
- Shareable

## 5. Circle (Relationship Intelligence)
- Add people in your life with their birthdays
- See personality profiles (Goldschneider-based)
- Understand relationship dynamics
- Temperature sharing (optional)

## 6. Personology
- Birthday-based personality profiles
- Based on Goldschneider's "Secret Language of Relationships"
- Deep dives into communication styles, strengths, challenges

## 7. Crisis Support
- Always free, always available
- 988, Trans Lifeline, Trevor Project
- Built into the AI — detects crisis and responds appropriately

---

# AI TOOLKIT (7 TOOLS)

All 7 tools are AI-powered and designed for specific situations:

## 1. 🔍 Relate
**Purpose:** Understand anyone through personality dynamics

- Enter two birthdays → see compatibility
- Compare yourself with anyone
- Understand communication styles, friction points
- Great for: new relationships, family dynamics, work conflicts

## 2. 🔄 Replay
**Purpose:** Process difficult events in 5 phases

1. **Tell** — What happened?
2. **Mirror** — AI reflects back what it heard
3. **Decode** — What's really going on beneath the surface
4. **Coach** — What now? Practical next steps
5. **Checkout** — Integration and closing

## 3. 🎭 Role Play
**Purpose:** Practice difficult conversations

- Set up the scenario and who you're talking to
- AI plays the other person
- Practice before the real thing
- Great for: confrontations, asking for raises, boundaries

## 4. 📓 Journal
**Purpose:** Reflect and write with AI support

- Free-form journaling
- AI can prompt or respond
- Private and secure

## 5. 🤝 Help
**Purpose:** Help someone else who's struggling

- Input what they're going through
- Get guidance on how to support them
- Learn without making it about you

## 6. 🔎 Decode
**Purpose:** Analyze messages you received

- Paste a message someone sent you
- AI breaks down: what they said, what they meant, what they want
- Choose your intent → get response suggestions
- Great for: confusing texts, passive aggression, mixed signals

## 7. 💕 Love (Planned)
**Purpose:** Love languages, intimacy, sex ed

- The whole experience: love, intimacy, sex, connection
- Safe space for real questions, no judgment
- Grounded in science (Kalat, Carlson) but human delivery
- Addresses shame, misinformation — what nobody teaches

---

# TECHNICAL ARCHITECTURE

## Stack
- **Frontend:** React Native / Expo
- **Backend:** Supabase (auth, database, edge functions)
- **AI:** OpenAI via Supabase Edge Functions
- **State:** Zustand stores
- **Navigation:** Expo Router

## Key Files
```
app/
  (tabs)/
    index.tsx      — Cockpit (home)
    circle.tsx     — Circle relationships
    learn.tsx      — Human Manual + 101
    me.tsx         — Profile & settings
  (modals)/
    mood-checkin.tsx
    cockpit-checkin.tsx
    relate.tsx
    replay.tsx
    decode.tsx
    role-play.tsx
    new-journal.tsx
    help-someone.tsx
    love.tsx
    prompt-generator.tsx
    settings.tsx

src/
  services/
    ai.ts          — AI service layer
    supabase.ts    — Supabase client
  stores/
    userStore.ts   — User state
    circleStore.ts — Circle members
    gaugeStore.ts  — Gauge readings
  data/
    psychKnowledge.ts  — 22+ textbook knowledge base
    personology.ts     — Goldschneider personality data
    humanManual.ts     — Lesson content
```

## AI Setup
- **Default:** Supabase Edge Function (Liz pays, gpt-4o-mini)
- **Power users:** BYOK option (their key + model choice)
- **Models supported:** gpt-4o-mini, gpt-4o, gpt-4-turbo

---

# ACADEMIC FOUNDATION

InGauge is built on 22+ academic psychology textbooks, not pop psychology.

## Confirmed Sources

### Neuroscience & Biopsychology
1. *Biopsychology* — John P.J. Pinel
2. *Biological Psychology* — James W. Kalat
3. *Foundations of Physiological Psychology (7th Ed)* — Neil R. Carlson

### Cognitive Psychology
4. *Cognition* — Margaret W. Matlin

### Social Psychology
5. *Social Psychology* — Elliot Aronson

### Abnormal & Clinical
6. *Abnormal Psychology* — David H. Barlow & V. Mark Durand
7. *Clinical Psychology* — Bruce E. Compas & Ian H. Gotlib

### Personality
8. *Personality Psychology* — Jess Feist & Gregory Feist

### Relationships & Specialized
9. *The Secret Language of Relationships* — Gary Goldschneider
10. *The Polyvagal Theory* — Stephen Porges
11. *The 5 Love Languages* — Gary Chapman
12. *Nonviolent Communication* — Marshall Rosenberg

### Additional (to be confirmed)
- Developmental Psychology
- Research Methods
- Statistics
- Political Science texts (from second degree)

**Liz's Background:** B.S. Psychology + B.S. Political Science

---

# MONETIZATION

## Free Forever
- ✅ Crisis support 24/7/365
- ✅ All 6 gauges + check-ins
- ✅ Full Human Manual (48 lessons)
- ✅ 3 AI chats/day

## InGauge Pro — $4.99/mo or $39.99/yr
- ✅ Unlimited AI (Gauge + all 7 tools)
- ✅ Voice responses
- ✅ Full Circle features
- ✅ Personology deep dives
- 🏆 **Cheapest premium mental health app on the market**

## Family Plan — $7.99/mo or $59.99/yr (up to 5)
- ✅ Pro for everyone
- ✅ Shared family Circle
- 💰 Just $12/person/year!

---

# CURRENT STATUS (Feb 19, 2026)

## ✅ Complete & Live
- Cockpit with 6-gauge check-in
- Talk to Gauge (main AI chat)
- Human Manual (48 lessons)
- 101 Discoveries
- Circle (relationship management)
- Personology (personality profiles)
- Crisis detection
- Relate tool
- Replay tool
- Decode tool (fixing crash)
- Role Play tool
- Journal tool
- Help tool
- Prompt Generator
- Patterns view
- Settings with BYOK
- Branded splash screen

## 🔧 In Progress
- Decode crash fix (removed ImagePicker temporarily)
- Copy polish

## 📋 Planned
- Love tool (sex ed / intimacy)
- Voice responses
- Family plan implementation
- Push notifications
- Apple Watch companion

---

# ROADMAP

## Phase 1: Launch Ready (Current)
- [x] Core 6-gauge system
- [x] 7 AI tools (6 complete, 1 planned)
- [x] Human Manual
- [x] Circle + Personology
- [x] TestFlight live
- [ ] Fix remaining crashes
- [ ] App Store submission

## Phase 2: Post-Launch
- [ ] Love tool
- [ ] Voice responses (ElevenLabs)
- [ ] Push notifications
- [ ] Streak/gamification
- [ ] More lessons

## Phase 3: Growth
- [ ] Android version
- [ ] Web dashboard
- [ ] Family plans
- [ ] Apple Watch
- [ ] Widgets

## Phase 4: Advanced
- [ ] Therapist/coach portal
- [ ] Group features
- [ ] Integrations (Apple Health, etc.)
- [ ] International (translations)

---

# QUICK REFERENCE

## Key URLs
- **TestFlight:** (internal)
- **GitHub:** github.com/lizmtz713/alln1psych
- **Domains to grab:** ingauge.app, getingauge.com

## Commands
```bash
# Run locally
cd alln1psych && npx expo start

# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Branding
- **App Name:** InGauge
- **Tagline:** "The Human Cockpit"
- **Icon:** Brain + temperature gradient ring + 6 dots
- **Colors:** Purple accent (#7C4DFF), dark background

---

*This blueprint is the single source of truth for InGauge development.*
