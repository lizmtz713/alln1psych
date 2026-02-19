# InGauge — AI Handoff Document
## Everything you need to continue building this app

**Last Updated:** February 19, 2026  
**Owner:** Elizabeth Martinez (Liz)  
**Status:** LIVE on TestFlight, preparing for App Store  
**GitHub:** lizmtz713/alln1psych

---

# WHAT IS THIS APP?

InGauge (formerly AllN1 Psych) is a mental health app that treats humans as complex systems, not broken machines. It provides a "cockpit" with 6 gauges to monitor your whole self, plus AI-powered tools grounded in 22+ academic psychology textbooks.

**Philosophy:** "You are not broken. You are a system. And now you have a dashboard."

**Name origin:** "InGauge" sounds like "engage" + describes what the app does (gauges/dashboard).

---

# THE 6 GAUGES

| Gauge | Icon | What It Measures |
|-------|------|------------------|
| Body | 🫀 | Sleep, hydration, nutrition, exercise, pain |
| State | ⚡ | Nervous system: calm ↔ activated ↔ shutdown |
| Emotion | 💜 | Emotional granularity (27+ distinct emotions) |
| Connection | 🤝 | Social/relational health |
| Direction | 🎯 | Purpose & motivation |
| Alignment | ⚖️ | Are actions matching values? |

Each gauge is backed by research (Polyvagal Theory, Biopsychology, Social Psychology, etc.)

---

# TECH STACK

- **Framework:** React Native / Expo (SDK 52)
- **Navigation:** Expo Router (file-based)
- **Backend:** Supabase (auth, PostgreSQL, Edge Functions)
- **AI:** OpenAI API via Supabase Edge Functions
- **State Management:** Zustand
- **Styling:** StyleSheet (no Tailwind/NativeWind)
- **Icons:** @expo/vector-icons (Ionicons)
- **Haptics:** expo-haptics
- **Build:** EAS Build

---

# FILE STRUCTURE

```
alln1psych/
├── app/                      # Expo Router pages
│   ├── (auth)/               # Auth screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/               # Main tab navigation
│   │   ├── index.tsx         # Cockpit (home) - 6 gauges display
│   │   ├── talk.tsx          # Talk to Gauge (main AI chat)
│   │   ├── circle.tsx        # Circle - relationships
│   │   ├── learn.tsx         # Human Manual + 101 Discoveries
│   │   └── me.tsx            # Profile & settings
│   ├── (modals)/             # Modal screens
│   │   ├── cockpit-checkin.tsx   # Daily gauge check-in
│   │   ├── relate.tsx            # Understand anyone (personality)
│   │   ├── replay.tsx            # Process events (5 phases)
│   │   ├── decode.tsx            # Analyze messages received
│   │   ├── role-play.tsx         # Practice conversations
│   │   ├── new-journal.tsx       # Journaling
│   │   ├── help-someone.tsx      # Help others
│   │   ├── love.tsx              # Love/intimacy (planned)
│   │   ├── prompt-generator.tsx  # AI prompts based on context
│   │   ├── patterns.tsx          # View gauge patterns over time
│   │   ├── settings.tsx          # App settings, BYOK
│   │   └── ...
│   ├── lesson/
│   │   └── [id].tsx          # Dynamic lesson pages
│   └── insight/
│       └── [code].tsx        # 101 Discoveries detail
├── src/
│   ├── components/
│   │   ├── gauges/           # Individual gauge components
│   │   ├── CockpitCluster.tsx
│   │   ├── CrisisOverlay.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── PaywallModal.tsx
│   ├── services/
│   │   ├── ai.ts             # AI service (sendMessageWithSystemPrompt)
│   │   └── supabase.ts       # Supabase client
│   ├── stores/
│   │   ├── userStore.ts      # User state (name, birthday, settings)
│   │   ├── circleStore.ts    # Circle members
│   │   ├── gaugeStore.ts     # Gauge readings history
│   │   └── subscriptionStore.ts
│   ├── data/
│   │   ├── psychKnowledge.ts # 22+ textbook knowledge base
│   │   ├── personology.ts    # Goldschneider personality data
│   │   └── humanManual.ts    # Lesson content
│   └── lib/
│       └── constants.ts      # Colors, typography, etc.
├── supabase/
│   └── functions/            # Edge functions for AI
└── assets/                   # Images, fonts
```

---

# KEY PATTERNS

## AI Service
```typescript
// src/services/ai.ts
import { sendMessageWithSystemPrompt } from '../../src/services/ai';

const response = await sendMessageWithSystemPrompt(
  [{ role: 'user', content: userMessage }],
  SYSTEM_PROMPT_STRING
);
```

## Navigation
```typescript
import { useRouter } from 'expo-router';
const router = useRouter();

// Navigate to modal
router.push('/(modals)/relate');

// Go back
router.back();

// With params
router.push({ pathname: '/(modals)/relate', params: { name, birthday } });
```

## Styling
```typescript
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../src/lib/constants';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background  // #09090F
  },
  text: { 
    color: COLORS.text,                  // #F0F0F5
    fontSize: 16 
  },
  accent: { 
    color: COLORS.accent                 // #7C4DFF (purple)
  },
});
```

## Zustand Stores
```typescript
import { useUserStore } from '../../src/stores/userStore';

// In component
const userName = useUserStore((s) => s.name);
const birthday = useUserStore((s) => s.birthday);
```

---

# THE 7 AI TOOLS

| Tool | File | Purpose |
|------|------|---------|
| **Relate** | relate.tsx | Compare two people's personalities |
| **Replay** | replay.tsx | Process events in 5 phases |
| **Decode** | decode.tsx | Analyze messages, get response suggestions |
| **Role Play** | role-play.tsx | Practice difficult conversations |
| **Journal** | new-journal.tsx | AI-assisted journaling |
| **Help** | help-someone.tsx | Get guidance helping others |
| **Love** | love.tsx | Intimacy/sex ed (planned) |

---

# CURRENT ISSUES (Feb 19, 2026)

## 🔴 Decode Crash
- **Problem:** Clicking Decode exits the app completely
- **Attempted fixes:** Reverted progress indicator changes, removed ImagePicker
- **Current state:** Simplified version pushed, needs testing
- **File:** app/(modals)/decode.tsx

## ✅ Recently Fixed
- Relate crash (missing variable aliases)
- Security hardening (rate limiting, auth)
- Splash screen branding

---

# AI BEHAVIOR GUIDELINES

The AI companion is called **Gauge** and should:

1. **Be warm but direct** — Talk like a knowledgeable friend, not a therapist
2. **Use the knowledge base** — Reference the 22+ textbooks in psychKnowledge.ts
3. **Know the gauges** — Understand the 6-gauge system
4. **Detect crisis** — If user seems in danger, surface crisis resources (988, etc.)
5. **No diagnosis** — Never diagnose conditions, just provide understanding
6. **Cite sources** — Mention research when relevant ("Research shows...")

---

# MONETIZATION

## Free Forever
- Crisis support 24/7
- All 6 gauges + check-ins  
- Full Human Manual (48 lessons)
- 3 AI chats/day

## InGauge Pro — $4.99/mo or $39.99/yr
- Unlimited AI
- Voice responses
- Full Circle features
- Personology deep dives

## Family Plan — $7.99/mo or $59.99/yr (5 people)

---

# BUILD & DEPLOY

```bash
# Install dependencies
npm install

# Run locally
npx expo start

# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# Deploy Supabase Edge Functions
cd supabase && supabase functions deploy
```

**Bundle ID:** com.alln1network.psych  
**Apple Developer:** Elizabeth Martinez

---

# ACADEMIC FOUNDATION

Grounded in 22+ textbooks. Confirmed sources:

1. *Biopsychology* — Pinel
2. *Biological Psychology* — Kalat
3. *Foundations of Physiological Psychology* — Carlson
4. *Cognition* — Matlin
5. *Social Psychology* — Aronson
6. *Abnormal Psychology* — Barlow & Durand
7. *Clinical Psychology* — Compas & Gotlib
8. *Personality Psychology* — Feist & Feist
9. *The Secret Language of Relationships* — Goldschneider
10. *The Polyvagal Theory* — Porges
11. *The 5 Love Languages* — Chapman
12. *Nonviolent Communication* — Rosenberg

(More to be documented)

**Liz's credentials:** B.S. Psychology + B.S. Political Science

---

# DESIGN SYSTEM

## Colors
```
Background: #09090F (near black)
Surface: #111118 (cards)
Text: #F0F0F5 (white)
Text Muted: #8888A0
Accent: #7C4DFF (purple)
Success: #10B981
Warning: #F59E0B
Error: #EF4444
```

## Components
- Dark mode only
- Rounded corners (12-16px)
- Subtle borders (rgba white 6%)
- Haptic feedback on interactions
- Smooth animations

---

# WHAT'S NEXT

1. **Immediate:** Fix Decode crash, submit to App Store
2. **Soon:** Love tool, voice responses, push notifications
3. **Later:** Android, web dashboard, Apple Watch

---

# CONTACT

**Owner:** Elizabeth Martinez (Liz)  
**Location:** Houston, TX (CST)  
**GitHub:** lizmtz713

---

*This document contains everything needed to understand and continue building InGauge.*
