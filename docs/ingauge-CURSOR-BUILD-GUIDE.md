# InGauge - Cursor Build Guide

**What is this?** A complete build roadmap for Cursor. Work through each section in order.

**How to use:** Drop this file + the spec files into your project. Tell Cursor: "Read CURSOR-BUILD-GUIDE.md and start building."

---

## 🎯 THE APP IN ONE SENTENCE

InGauge is a Personal Health Operating System for the Mind (PHOSM) — "The Human Cockpit" with 6 gauges that help you understand and regulate yourself.

---

## 📁 PROJECT STRUCTURE

```
/app
  /(tabs)           # Bottom nav screens
    index.tsx       # Home (Cockpit)
    toolkit.tsx     # AI Tools
    lights.tsx      # Relationships
    learn.tsx       # Human Manual + Explore
    profile.tsx     # Human Control Panel
  /checkin          # Check-in flows
  /copilot          # AI chat
  /tools            # Individual AI tools
  /lights           # Relationship screens
  /manual           # Human Manual lessons
  /settings         # Settings screens
/components
  /ui               # Reusable UI components
  /cockpit          # Cockpit-specific components
  /gauges           # Gauge visualizations
/stores             # Zustand stores
/services           # API + business logic
/constants          # Colors, prompts, config
/types              # TypeScript types
```

---

## 🏗️ BUILD ORDER

### PHASE 1: CORE FOUNDATION (Build First)

#### 1.1 Design System
**Spec:** `ingauge-DESIGN-SYSTEM-SPEC.md`, `ingauge-OURA-DESIGN-INSPO.md`

Create `/constants/theme.ts`:
```typescript
export const colors = {
  // Temperature gradient (signature look)
  gradient: {
    cool: '#4ECDC4',    // Teal
    warm: '#FF6B6B',    // Coral
  },
  
  // Gauge colors (each unique)
  gauges: {
    body: '#F59E0B',      // Amber
    state: '#06B6D4',     // Cyan/Teal
    emotion: '#F97316',   // Coral/Orange
    connection: '#8B5CF6', // Violet
    direction: '#84CC16',  // Sage/Lime
    alignment: '#EAB308',  // Gold
  },
  
  // Backgrounds
  bg: {
    primary: '#0A0A0F',
    secondary: '#12121A',
    card: '#1A1A24',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#52525B',
  }
};

export const typography = {
  score: { fontSize: 56, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};
```

#### 1.2 Stores (Zustand)
**Create these stores:**

`/stores/userStore.ts` - User profile, settings, age tier
`/stores/gaugeStore.ts` - All 6 gauge values, history, goals
`/stores/checkInStore.ts` - Check-in state, streaks
`/stores/lightsStore.ts` - Relationships (Circle/Lights)
`/stores/copilotStore.ts` - AI chat history

#### 1.3 Types
**Spec:** Reference all specs for type definitions

`/types/gauges.ts`:
```typescript
export type GaugeType = 'body' | 'state' | 'emotion' | 'connection' | 'direction' | 'alignment';

export interface GaugeValue {
  type: GaugeType;
  value: number; // 0-100
  updatedAt: string;
  notes?: string;
}

export interface GaugeGoal {
  type: GaugeType;
  targetValue: number;
  deadline?: string;
  accountability?: string;
}
```

`/types/user.ts`:
```typescript
export type AgeTier = 'teen' | 'youngAdult' | 'adult' | 'mature' | 'senior';

export interface UserProfile {
  name: string;
  birthday?: string;
  ageTier: AgeTier;
  loveLanguage?: string;
  learningStyle?: string;
  // ... see ingauge-PHOSM-COMPLETE-SETUP.md for full profile
}
```

---

### PHASE 2: HOME SCREEN (Cockpit)

#### 2.1 Cockpit Cluster
**Spec:** `ingauge-COCKPIT-SNAPSHOT.md`

The home screen IS the cockpit. Build:

1. **CockpitCluster** - Hexagonal layout of 6 gauges around center score
2. **SystemScore** - Big 56pt number in center (average of 6 gauges)
3. **GaugeArc** - Individual gauge with arc visualization
4. **PayAttentionAlert** - Oura-style alert when gauge is low

```
        [Body]
    [State]  [Emotion]
        [SCORE]
  [Direction] [Connection]
       [Alignment]
```

#### 2.2 Home Header
```typescript
// Time-aware greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: '☀️', action: 'Pre-Flight' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: '🌤️', action: 'Check-in' };
  if (hour >= 17 && hour < 21) return { text: 'Good evening', icon: '🌅', action: 'Post-Flight' };
  return { text: 'Good night', icon: '🌙', action: 'Post-Flight' };
};
```

Layout: `Hey, {name}    {icon}    🚨`

#### 2.3 Home Cards (Below Cockpit)
Scrollable cards:
- Quick Check-in CTA
- CoPilot card (last message preview)
- Lights needing attention
- Today's insight
- Streak counter

---

### PHASE 3: CHECK-IN FLOW

#### 3.1 Quick Check-in
**Spec:** `ingauge-SCIENCE-OF-CHECKIN.md`

Simple slider for each gauge (0-100), one at a time:
1. Body → 2. State → 3. Emotion → 4. Connection → 5. Direction → 6. Alignment

Each screen:
- Gauge name + description
- Big slider (chunky, satisfying)
- Optional note field
- "What might be affecting this?" suggestions

#### 3.2 Pre-Flight Check (Morning)
**Spec:** `ingauge-APP-OVERVIEW.md`

Morning ritual:
1. How did you sleep? (1-5)
2. Quick gauge check-in
3. Set intention for the day
4. Review today's calendar (if connected)
5. Any Lights to reach out to?

#### 3.3 Post-Flight Debrief (Evening)
Evening reflection:
1. Quick gauge check-in
2. Did you meet your intention?
3. Wins today?
4. What drained you?
5. Gratitude moment

---

### PHASE 4: COPILOT (AI Chat)

#### 4.1 Chat Interface
**Spec:** `ingauge-AGE-ADAPTIVE-PROMPTS.md`

- Full-screen chat with CoPilot
- Voice input option (expo-speech)
- Context-aware (knows your gauges, recent check-ins, Lights)

#### 4.2 System Prompt
```typescript
const buildSystemPrompt = (user: UserProfile, gauges: GaugeValue[]) => `
You are CoPilot, the AI companion inside InGauge.

USER CONTEXT:
- Name: ${user.name}
- Age tier: ${user.ageTier}
- Current gauges: ${gauges.map(g => `${g.type}: ${g.value}`).join(', ')}
- Love language: ${user.loveLanguage}
- Learning style: ${user.learningStyle}

COMMUNICATION STYLE:
${getAgeTierPrompt(user.ageTier)}

RULES:
- Never diagnose or replace therapy
- Always validate feelings first
- Offer tools from the Toolkit when relevant
- If crisis detected, gently suggest Emergency resources
`;
```

#### 4.3 Crisis Detection
**Spec:** `ingauge-APP-OVERVIEW.md` (Emergency Mode section)

Keywords to detect: "kill myself", "end it", "suicide", "self-harm", "don't want to live"

When detected:
```typescript
if (containsCrisisKeywords(message)) {
  // Switch to crisis mode
  // Show: "I hear you. This sounds really hard. Can I share some resources?"
  // Offer: 988, Crisis Text Line, appropriate identity-specific lines
}
```

---

### PHASE 5: AI TOOLKIT (7 Tools)

#### 5.1 Tool List Screen
Grid of 7 tools:
1. **Relate** - Understand others
2. **Replay** - Process events
3. **Role Play** - Practice conversations
4. **Journal** - Reflect & write
5. **Help** - Help someone else
6. **Decode** - Analyze messages
7. **Love** - Intimacy & connection education

**Spec:** `ingauge-AITA-TOOL.md`, `ingauge-CRITICAL-THINKING-TOOL.md`, `ingauge-LOVE-SAFETY-EXPANDED.md`

#### 5.2 Each Tool Pattern
```typescript
// Standard tool screen structure
const ToolScreen = () => (
  <View>
    <ToolHeader title="Replay" subtitle="Process what happened" />
    <ToolInput 
      placeholder="What happened?" 
      multiline 
    />
    <ToolSubmit onPress={handleSubmit} />
    <ToolDisclaimer />
  </View>
);
```

---

### PHASE 6: LIGHTS (Relationships)

#### 6.1 Lights List
**Spec:** `ingauge-LIGHTS-SYSTEM-V2.md`, `ingauge-LIGHT-PROFILES-CRM.md`

Show relationships grouped by Dunbar tier:
- 💫 Inner 5 (closest)
- ✨ Close 15
- 🌟 Friends 50
- 💡 Acquaintances 150

Each Light shows:
- Name + photo
- Temperature (how they're doing)
- Last contact
- Flicker indicator (needs attention)

#### 6.2 Light Profile
Full CRM for each person:
- Basic info
- How they communicate
- Their love language (if known)
- Connection log
- Mind Mail history

#### 6.3 Mind Mail
**Spec:** `ingauge-MIND-MAIL-SAFETY-SPEC.md`, `ingauge-HEART-INBOX-SYSTEM.md`

Send modes:
- **Open** - They see it's from you
- **Anonymous** - "Someone in your Circle"
- **Soft Share** - They accept to see who

---

### PHASE 7: HUMAN MANUAL (Learn)

#### 7.1 Lesson Structure
**Spec:** `ingauge-HUMAN-MANUAL-FOUNDATIONS.md`, `ingauge-HUMAN-MANUAL-REORGANIZATION.md`

10 Sections, 162 lessons:
1. Foundations (What is a Human?)
2. Body
3. Emotions
4. Mind
5. Relationships
6. Development
7. Context
8. Problems
9. Growth
10. Integration

#### 7.2 Lesson Screen
```typescript
const LessonScreen = ({ lesson }) => (
  <ScrollView>
    <LessonHeader title={lesson.title} section={lesson.section} />
    <LessonContent content={lesson.content} />
    <LessonReflection questions={lesson.reflectionQuestions} />
    <RelatedTools tools={lesson.relatedTools} />
    <ShareInsight lessonId={lesson.id} />
  </ScrollView>
);
```

---

### PHASE 8: PROFILE (Human Control Panel)

#### 8.1 Profile Sections
**Spec:** `ingauge-PHOSM-COMPLETE-SETUP.md`

6 sections:
1. **Your Story** - Name, birthday, location
2. **Identity** - Gender, pronouns, orientation, culture
3. **How You Connect** - Love language, communication style
4. **What Gives Life** - Values, interests, goals
5. **Sensitive Topics** - Triggers, boundaries
6. **In Your Own Words** - Free-form self-description

#### 8.2 Settings
- Notification preferences
- AI settings (BYOK option)
- Privacy controls
- Data export
- Theme (dark only for now)

---

### PHASE 9: PREMIUM FEATURES

#### 9.1 Cycle Intelligence
**Spec:** `ingauge-CYCLE-INTELLIGENCE-FEATURE.md`

- Connect to Apple HealthKit
- Read menstrual cycle data
- Overlay cycle phase on gauge context
- "You're on Day 23 — this dip is normal for you"

#### 9.2 Prompt Generator
**Spec:** `ingauge-PROMPT-GENERATOR-FEATURE.md`

Generate AI prompts based on full user context:
- Current gauges
- Recent patterns
- Cycle phase (if applicable)
- Goals and values

#### 9.3 Life Wrapped
**Spec:** `ingauge-LIFE-WRAPPED.md`

Annual/monthly review like Spotify Wrapped:
- Gauge trends
- Growth moments
- Patterns discovered
- Relationship highlights

---

## 🔌 INTEGRATIONS

### Supabase
- Auth (email + Apple Sign In)
- Database (profiles, check-ins, Lights)
- Edge Functions (AI calls)

### Apple HealthKit
- Read: Sleep, HRV, activity, menstrual cycle
- Write: Mindful minutes

### Notifications
- Check-in reminders
- Light flickers
- Insight nudges

---

## 📱 NAVIGATION

Bottom tabs (5):
1. **Home** - Cockpit
2. **Toolkit** - AI Tools
3. **Lights** - Relationships
4. **Learn** - Human Manual
5. **Profile** - Settings + Human Control Panel

---

## 🚨 CRITICAL RULES

1. **Crisis resources always accessible** - 988 button on every screen
2. **Never diagnose** - We're a tool, not a therapist
3. **Age-appropriate everything** - Check user.ageTier before showing content
4. **Privacy first** - No data leaves device without consent
5. **Offline capable** - Core features work without internet

---

## 🎨 VIBE CHECK

- **Warm, not clinical** - This is a friend, not a doctor
- **Empowering, not pathologizing** - "You're not broken, you're a system"
- **Simple, not overwhelming** - One thing at a time
- **Dark mode** - Easy on the eyes, feels premium
- **Oura-inspired** - Big scores, arcs, gradients, smooth animations

---

## 📋 SPEC FILES REFERENCE

| Feature | Spec File |
|---------|-----------|
| Design System | `ingauge-DESIGN-SYSTEM-SPEC.md` |
| Age Adaptive | `ingauge-AGE-ADAPTIVE-FEATURE.md` |
| Check-in Science | `ingauge-SCIENCE-OF-CHECKIN.md` |
| Lights System | `ingauge-LIGHTS-SYSTEM-V2.md` |
| Mind Mail | `ingauge-MIND-MAIL-SAFETY-SPEC.md` |
| Human Manual | `ingauge-HUMAN-MANUAL-REORGANIZATION.md` |
| Cycle Intelligence | `ingauge-CYCLE-INTELLIGENCE-FEATURE.md` |
| Prompt Generator | `ingauge-PROMPT-GENERATOR-FEATURE.md` |
| Full Profile | `ingauge-PHOSM-COMPLETE-SETUP.md` |
| Navigation | `ingauge-NAVIGATION-IA-SPEC.md` |

---

## 🚀 START HERE

Tell Cursor:

> "Read ingauge-CURSOR-BUILD-GUIDE.md. Start with Phase 1: create the design system in /constants/theme.ts, then create the base stores in /stores/. After that, build the Cockpit (Phase 2)."

Then iterate through each phase. Reference the specific spec files when building each feature.

**You got this.** 🧠⚡
