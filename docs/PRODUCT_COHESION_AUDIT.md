# Product Cohesion Audit

**Product:** InGauge / AllN1 Psych — Human Life Operating System  
**Date:** 2026-07-01  
**Scope:** Seven major screens + cross-cutting cohesion analysis  
**Method:** Full-repository static audit (routes, stores, services, docs). No code modified.

---

## Executive summary

InGauge has a **clear architectural intent** (Cockpit → Signals → People → Tools → Manual → Me, with Talk as the AI spine) but **implementation breadth exceeds cohesion**. Many subsystems are **Good** or **Complete** in isolation; the product’s main risk is **surface-area sprawl**—duplicate entry points, parallel messaging systems, and intelligence that is computed in many places but not always wired into the loop users feel.

**Strongest cohesion loop today:** Check-in → Cockpit gauges → Signals/People drift → Reach Out / Talk → Save summary → Cockpit daily content.

**Weakest cohesion:** Manual ↔ Tools overlap, Heart Notes / Mind Mail / Circle triple naming, Me as a second hub for history/settings/tools, and `smartGaugeCapture` not yet closing the Talk → gauge suggestion loop.

---

## Screen audits

### Cockpit

**Route:** `app/(tabs)/index.tsx`  
**Role:** Life overview — “How am I doing as a human?”

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Single home for system awareness: six gauges, daily greeting/insight, one primary suggestion, relationship/social preview, forecast, and quick paths to check-in, Talk, Tools, and Signals. |
| 2 | **User problem solved** | “I’m overwhelmed — what matters today? How is my whole life system doing, not just tasks?” |
| 3 | **Inputs** | Gauge values (`cockpitStore`), check-in history/drivers/impact, circle members & lights, conversation summaries, mood/engagement streaks, education progress, journal/conversation activity, health/Oura (optional), adaptive onboarding level, first-visit flag. |
| 4 | **Outputs** | Rendered gauge cluster, daily AI content (greeting, affirmation, insight, challenge), primary driver-aware suggestion, pattern lines, forecast card, Signals preview, tool suggestions, crisis/awe banners, navigation to check-in/Talk/Tools/People. |
| 5 | **AI used** | `generateDailyContent()` (personalization), optional `crossSystemInsight` from cockpit AI path, JIT lesson selection (rule + content, not always LLM). |
| 6 | **Stores used** | `cockpitStore`, `userStore`, `dailyContentStore`, `conversationSummaryStore`, `conversationStore`, `circleStore`, `lightsStore`, `journalStore`, `insightsStore`, `engagementStore`, `educationStore`, `goalsStore`, onboarding-related reads via hooks. |
| 7 | **Services used** | `personalization`, `driverAwareSuggestions`, `checkInPatternInsights`, `whatUsuallyHelps`, `forecastService`, `reciprocityService`, `personalStrategyService`, `friendshipMaintenance`, `heroEngine`, `justInTimeLearning`, `predictiveWarnings`, `aweNudge`, `onboardingService`, `getDiscoveriesForDay` (data). |
| 8 | **Other screens affected** | Check-in modal, Talk, Signals preview, People (reach-outs), Tools (suggestions), Manual (JIT lessons), Me (profile context), `(modals)/history` (indirect via summaries), forecast/timeline/wrapped entry points. |
| 9 | **Teaches the system?** | **Yes** — check-ins, suggested actions taken, daily content generation, and driver logging feed pattern engines and “what usually helps.” |
| 10 | **Receives intelligence?** | **Yes** — aggregates summaries, lights drift, patterns, forecast, reciprocity, personal strategy, predictive warnings. |
| 11 | **Maturity** | **Good** — core loop works; daily content + summary hydration recently fixed (PR #9). Still dense UI; adaptive sections help but first-run can feel busy. |

---

### Signals

**Route:** `app/(tabs)/signals.tsx`  
**Role:** Awareness layer — all insights and predictions in one place.

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Consolidated read-only hub for relationship drift, social health, birthdays, “last time” moments, daily reach-outs, and predictive warnings — with CTAs to People and check-in. |
| 2 | **User problem solved** | “What should I be aware of that I might be missing?” (drift, birthdays, trajectory warnings). |
| 3 | **Inputs** | Circle members → lights (`circleStore`, `lightsStore`), connection log implicit in lights, predictive model inputs via `getMostUrgentWarning()`. |
| 4 | **Outputs** | Card list of signals; tap → People (with hero id) or check-in; refresh UI only (no new persistence on this screen). |
| 5 | **AI used** | **Partial** — `predictiveWarnings` may use AI/heuristics; drift/birthdays/reach-outs are rule-based. |
| 6 | **Stores used** | `circleStore`, `lightsStore` only (minimal store footprint by design). |
| 7 | **Services used** | `friendshipMaintenance` (drift, social health, reach-outs), `memoryEngine` (birthdays, last-time), `predictiveWarnings`. |
| 8 | **Other screens affected** | People (primary action target), Cockpit (overlapping preview via `CockpitSignalsPreview`), Tools (reach-out, repair). |
| 9 | **Teaches the system?** | **Minimal** — mostly read-only; acting on signals in People updates connection log / lights. |
| 10 | **Receives intelligence?** | **Yes** — same engines as Cockpit/People relationship layer. |
| 11 | **Maturity** | **Good** — focused, shippable. Overlaps with Cockpit Signals preview and People attention logic (intentional but duplicated surface). |

---

### People

**Route:** `app/(tabs)/people/index.tsx` (+ nested fleet routes, `lights/*`, `mind-mail/*`)  
**Role:** Relationship subsystem — who matters, who needs attention, act.

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Dunbar-tier relationship ring, person cards, Transmit/Mind Mail compose, links to constellation radar, fleet/family features, add person, friendship lessons. |
| 2 | **User problem solved** | “Who in my life needs me? How do I reach out without awkwardness?” |
| 3 | **Inputs** | Circle members, lights (brightness, drift, tiers), daily reach-out priorities, daily anchors (connection prompt acted on), search params (`hero`). |
| 4 | **Outputs** | Person detail sheet, Transmit composer, navigation to lights profiles, mind-mail, fleet sub-screens, invite circle; updates connection log / anchors on transmit. |
| 5 | **AI used** | **Indirect** — Mind Mail / Show Up / friend survey use AI in sub-flows; People hub itself is mostly non-AI. |
| 6 | **Stores used** | `circleStore`, `lightsStore`, `dailyAnchorsStore`; sub-routes add `familyStore`, `heartNotesStore`, `mindMailStore`, etc. |
| 7 | **Services used** | `friendshipMaintenance`, `memoryEngine`, `momentumEngine`, `heroEngine`, `reachOutActions`, `showUpService`, `timelineEngine` (via deep routes). |
| 8 | **Other screens affected** | Signals (source of drift cards), Cockpit (hero, reach-outs), Talk (relationship topics), Tools (reach-out, repair, relational bridge), Manual (friendship lessons), hidden `lights` tab, hidden `circle` inbox. |
| 9 | **Teaches the system?** | **Yes** — connection logs, transmit events, tier placement, and fleet telemetry feed lights brightness and social health. |
| 10 | **Receives intelligence?** | **Yes** — drift, reach-out priority, hero selection, seasons/momentum (in deeper lights routes). |
| 11 | **Maturity** | **Good** — core People hub is solid; Family Edition fleet routes are **Partial** (specialized audience); `lights` vs `people` dual navigation is confusing. |

---

### Talk

**Route:** `app/(tabs)/talk.tsx` (hidden tab)  
**Role:** Voice-first AI companion (Gauge) — primary emotional processing surface.

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Open-ended conversation with age-adaptive AI; voice or text; crisis overlay; save summaries; follow-up continuity. |
| 2 | **User problem solved** | “I need someone to listen, help me think, or practice what to say — without judgment.” |
| 3 | **Inputs** | User messages (voice/text), `UserContext` (profile, age, love language, gauges, health snapshot, life questions/skills progress), legal/voice consent, API key or edge auth, route params (prompt, crisis mode). |
| 4 | **Outputs** | AI replies (text + optional TTS), conversation summary on save/background, human skills points, usage counters, crisis routing; clears in-memory messages after save. |
| 5 | **AI used** | **Core** — `sendMessage()` → edge `chat` + fallback; `generateConversationSummary()` → edge path (PR #11); `Voice` STT/TTS; crisis keyword pipeline. |
| 6 | **Stores used** | `conversationStore`, `conversationSummaryStore`, `userStore`, `cockpitStore`, `healthStore`, `humanSkillsStore`, `lifeQuestionsStore`, `usageStore`, `premiumStore`, `settingsStore`, `legalConsentStore`. |
| 7 | **Services used** | `ai.ts`, `voice.ts`, Share Insight builders; reads gauge context via stores (not yet `smartGaugeCapture` post-talk — future PR #12). |
| 8 | **Other screens affected** | Cockpit (summaries → daily content), `(modals)/history`, Signals/People (indirect via mood/connection inference), Manual (deep links), Ask Gauge modal (parallel shorter AI path). |
| 9 | **Teaches the system?** | **Yes** — summaries (emotions, triggers, followUp), skills points, crisis patterns; **`smartGaugeCapture` exists but not wired post-save**. |
| 10 | **Receives intelligence?** | **Yes** — full adaptive context: gauges, health, profile, prior summary follow-up banner. |
| 11 | **Maturity** | **Good** — save + edge summary path recently fixed; hidden tab hurts discoverability; BYOK banner still appears when edge unavailable. |

---

### Tools

**Route:** `app/(tabs)/tools.tsx` + `app/tools/*` + many `(modals)/*`  
**Role:** Action layer — situation-first tool launcher.

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Help user pick the right intervention: Essential 7 + categorized grid (relationship repair, understand situation, navigate people, take action, get support, understand yourself, life tools). |
| 2 | **User problem solved** | “Something specific is happening — what do I do right now?” |
| 3 | **Inputs** | Static tool registry; optional situation chips on tab (user selection); no persistent state on tab shell itself. |
| 4 | **Outputs** | Navigation to 40+ tool screens/modals; debrief/post-flight hooks in individual tools. |
| 5 | **AI used** | **Per tool** — Decode, Resolve, Role Play, Tone Check, Repair, Help Someone, etc. each call `ai.ts` or edge; tab shell is non-AI. |
| 6 | **Stores used** | Tab shell: none directly; sub-tools use many (`boundariesStore`, `decisionStore`, `resetStore`, `rolePlayStore`, …). |
| 7 | **Services used** | Tab shell: none; ecosystem: 30+ tool backends in `src/services/` and modal implementations. |
| 8 | **Other screens affected** | Cockpit (tool suggestions, helpful-right-now), Signals (reach-out CTAs), People (repair/transmit), Manual (overlapping learn routes), Me (some tools linked from profile). |
| 9 | **Teaches the system?** | **Per tool** — successes, debriefs, gauge snapshots on some paths; inconsistent globally. |
| 10 | **Receives intelligence?** | **Partial** — Cockpit `GaugeTriggeredSuggestions` and JIT link gauges → tools; Tools tab itself does not read gauges. |
| 11 | **Maturity** | **Partial** — Essential 7 is coherent; full grid is **Good** content but **Partial** cohesion (duplicates modals, uneven AI/offline behavior, `TESTING_MODE` hides paywall story). |

---

### Manual

**Route:** `app/(tabs)/learn.tsx` + `app/learn/*`  
**Role:** Human handbook — education, gauge literacy, life skills.

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Teach how humans work: gauge system intro, Human Manual library, daily discoveries, suggested lessons, skills, 12 Life Questions entry, academic insights tied to gauges. |
| 2 | **User problem solved** | “I want to understand why I feel/ act this way and build real-life skills.” |
| 3 | **Inputs** | `educationStore` progress, `userStore` age, `cockpitStore` gauge values (patterns card), static content corpora (`manualContent`, `humanManual`, `discoveries`, `gaugeSystem`, `academicSources`). |
| 4 | **Outputs** | Lesson/quiz completion → `educationStore` + Supabase sync; share insight cards; navigation to deep manual routes; human skills progress (via quizzes). |
| 5 | **AI used** | **Minimal on hub** — mostly static content; self-discovery and some lesson flows use AI in sub-routes. |
| 6 | **Stores used** | `educationStore`, `userStore`, `cockpitStore` (patterns card); sub-routes add `lifeQuestionsStore`, `humanSkillsStore`, etc. |
| 7 | **Services used** | Hub: mostly data files; `justInTimeLearning` consumed from Cockpit not Manual tab directly; `educationStore` sync via `database.ts`. |
| 8 | **Other screens affected** | Cockpit (JIT lessons, discoveries preview), Tools (self-discovery link), Talk (learn link), profile/human-profile, Me (growth section). |
| 9 | **Teaches the system?** | **Yes** — lesson completion, quiz answers, life questions feed education and skills stores. |
| 10 | **Receives intelligence?** | **Partial** — “Your System Patterns” reads live gauges; no personalized lesson queue on Manual tab itself (SuggestedLessons component exists but JIT is Cockpit-driven). |
| 11 | **Maturity** | **Good** content volume; **Partial** UX cohesion (two manual corpora: `manualContent` + `humanManual`; deep routes split across tab vs `/learn/*` stack). |

---

### Me

**Route:** `app/(tabs)/me.tsx` + `app/profile/*`  
**Role:** Identity + configuration — “How is my system set up?”

| # | Question | Answer |
|---|----------|--------|
| 1 | **Purpose** | Collapsible hub: Identity, Growth, Foundations, Preferences & Data, Legal & Support — profile, gauges config, journal/history links, integrations, settings, sign-out. |
| 2 | **User problem solved** | “Who am I in this app? How do I configure sharing, health, notifications, and my story?” |
| 3 | **Inputs** | `userStore`, `circleStore` (temperature visibility, members), `insightsStore`, `achievementStore`, `educationStore`, auth session. |
| 4 | **Outputs** | Navigation to 19+ profile sub-screens, settings modal, Oura connect, export/delete flows, temperature visibility changes. |
| 5 | **AI used** | **Indirect** — profile AI fields consumed by Talk; gauge discovery sub-screens use `discoveryAI`. |
| 6 | **Stores used** | `userStore`, `circleStore`, `insightsStore`, `achievementStore`, `educationStore`; profile routes add `gaugeDefinitionsStore`, `foundationStore`, `therapistShareStore`, etc. |
| 7 | **Services used** | Me shell: minimal; profile: `profileService`, `userStoryService`, `database`, `exportData`, `healthKit`, `ouraIntegration`. |
| 8 | **Other screens affected** | Talk (UserContext), Cockpit (name, age, modes), all gauge-aware features; settings → notifications, API key, premium. |
| 9 | **Teaches the system?** | **Yes** — profile, values, triggers, gauge definitions, foundation anchors shape adaptive context and AI behavior. |
| 10 | **Receives intelligence?** | **Partial** — shows streaks/achievements/lesson counts; not a live intelligence dashboard (by design). |
| 11 | **Maturity** | **Good** structure (5 blocks doc-aligned); **Partial** where menu duplicates Tools/Manual entries and Cockpit History button wrongly routes to Me. |

---

## Cross-cutting cohesion matrix

| From → To | Cockpit | Signals | People | Talk | Tools | Manual | Me |
|-----------|---------|---------|--------|------|-------|--------|-----|
| **Cockpit** | — | preview | hero/reach-out | Talk btn | suggestions | JIT lessons | Reflect/History* |
| **Signals** | — | — | primary CTA | — | reach-out | — | — |
| **People** | lights data | drift source | — | transmit topics | repair/reach-out | friendship lessons | profile overlap |
| **Talk** | summaries | — | relationship talk | — | tool links | learn link | settings/key |
| **Tools** | gauge triggers | — | people tools | talk routes | — | self-discovery | goals/prefs |
| **Manual** | gauge patterns | — | toolkit | skills | overlapping content | — | growth section |
| **Me** | identity context | — | circle sharing | AI context | menu links | lesson count | — |

\*Cockpit “History” control routes to Me, not conversation history — cohesion bug.

---

## Duplication analysis

### What is duplicated?

| Duplication | Locations | Impact |
|-------------|-----------|--------|
| **Relationship signals** | Cockpit preview, Signals tab, People attention cards | Same drift/reach-out logic, three surfaces |
| **Tool registries** | `tools.tsx`, Cockpit `ALL_TOOLS` / `HELPFUL_RIGHT_NOW_TOOLS` | Two lists to maintain; routes can drift |
| **AI entry points** | Talk (full), Ask Gauge FAB (contextual), some tool modals | Same `ai.ts` stack, different UX promises |
| **Messaging** | Heart Notes, Mind Mail, `(tabs)/circle`, `mind-mail/` stack, heart-inbox modals | Parallel naming and routes |
| **Manual content** | `manualContent.ts`, `humanManual.ts`, `educationContent.ts` | Overlapping corpora |
| **Achievements** | `achievementStore` + `insightsStore` + `(modals)/awards` + `profile/achievements` | Two unlock systems |
| **Lights vs People** | `(tabs)/people`, `(tabs)/lights`, `app/lights/*` | Same relationship universe, multiple homes |
| **Quick Reset** | `/tools/quick-reset` and `/(modals)/quick-reset` | Dual routes |
| **Onboarding** | `onboarding.tsx` + `onboarding-old.tsx` | Legacy parallel |
| **Insight cards** | Cockpit influencing card, weekly insight, unified insight engine, Signals predictions | Multiple “insight” concepts |
| **Check-in** | `cockpit-checkin`, `mood-checkin`, SmartCheckIn components (unwired) | Multiple check-in UX experiments |

### What should merge?

| Merge candidate | Recommendation |
|-----------------|----------------|
| **Heart Notes + Mind Mail + Circle tab** | Single **People → Messages** subsystem with one store API (`mindMailStore` / `heartNotesStore` unify) |
| **Achievement systems** | Merge `insightsStore` achievement defs into `achievementStore`; one awards surface in Me |
| **Manual corpora** | Single content index feeding Manual tab + JIT; deprecate duplicate TOC paths |
| **Tool route lists** | One `src/data/toolRegistry.ts` consumed by Tools tab and Cockpit suggestions |
| **Lights hidden tab + People** | People owns relationship UI; `/lights/*` becomes detail stack only (no hidden tab) |
| **Ask Gauge + Talk** | Ask Gauge as **mode inside Talk** (context prefill), not separate modal long-term |

### What should become internal?

| Surface | Become internal (detail / settings / dev) |
|---------|-------------------------------------------|
| Family Edition fleet sub-routes | Advanced section inside People (not primary tabs) |
| Datésumé (22 screens) | Me or People deep link — not launch-primary |
| News My Way, Spotify, World temperature | Settings-lab or post-MVP |
| `onboarding-old`, `(modals)/features`, `patterns/index` stub | Remove or archive |
| SwipeCockpit, SwipeCheckIn, CockpitHome | Delete or feature-flag off |
| Psych-stage-archive (13 files) | Remove from bundle |
| Therapist share, sovereignty report, Life Wrapped | Me → Growth (secondary), not Cockpit-primary |
| 30+ niche tools (bias-check, creativity, flight-plan, etc.) | Tools → “More tools” collapsed; Essential 7 primary |

### What should become primary?

| Primary (launch face of product) | Rationale |
|----------------------------------|-----------|
| **Cockpit** | Home — gauges + one suggestion + one insight |
| **Talk** | Prominent entry (not hidden): FAB + Cockpit + optional 7th tab or center action |
| **Check-in** | Single path: `(modals)/cockpit-checkin` |
| **Essential 7 tools** | Quick Reset, Check-in, Decode, Reach Out, Prioritize, Rituals, Crisis |
| **Signals → People action loop** | Awareness → one tap to act |
| **Save conversation memory** | Talk Save → Cockpit personalization (now wired) |
| **People tier strip + Transmit** | Core relationship differentiation |

### What should become secondary?

| Secondary (discover after week 1) | Rationale |
|-----------------------------------|-----------|
| Manual full library | JIT from Cockpit first; browse Manual later |
| Fleet / Family Edition | Niche household use case |
| Assessments (attachment, attraction, flags, difficult people) | Tool drawer, not tab prominence |
| Datésumé, Love History | Relationship power-user features |
| Timeline, Flight log, Wrapped | Reflection archives |
| Profile gauge discovery AI flows | After manual check-ins establish baseline |
| Premium paywall surfaces | After value proven (`TESTING_MODE` off) |

---

## Launch tomorrow: 20% → 80% value

If shipping in 24 hours, the **minimum coherent product** that delivers most life value:

### The vital 20%

1. **Sign in + simple onboarding** → land on Cockpit  
2. **One check-in** (`cockpit-checkin`) → populate gauges  
3. **Cockpit readout** → greeting, one “helpful right now,” gauge cluster  
4. **Talk** (discoverable) → 4+ messages → **Save** → persisted summary  
5. **Cockpit on reopen** → summary-informed daily content (PR #9 + #11)  
6. **Signals** → see drift → **People** → reach out or Transmit  
7. **Essential 7 tools** only exposed in UI (hide the rest)  
8. **Quick Reset** + **Crisis resources** (safety)  
9. **Me → Settings** (account, disclaimer, sign-out)  

### The 80% user value this delivers

| User need | Delivered by |
|-----------|--------------|
| “How am I doing?” | Cockpit gauges + check-in |
| “I need to talk” | Talk + Save memory |
| “Something feels off in my relationships” | Signals → People |
| “Help me act” | Reach Out / Quick Reset / Decode |
| “Don’t lose me between sessions” | Persisted summaries + gauges + auth |
| “I’m in crisis” | Crisis overlay + crisis modal |

### Explicitly defer (not in launch 20%)

- Datésumé, Fleet, News My Way, Wrapped, Timeline, therapist share  
- Full Manual browse (keep JIT snippets on Cockpit only)  
- 30+ secondary tools and assessments  
- Premium monetization (`TESTING_MODE` decision)  
- Android, Watch, web dashboard  
- PR #12 `smartGaugeCapture` post-Talk (high leverage but not blocking first loop)  
- Schema drift tables without migrations  

---

## Maturity summary

| Screen | Maturity | One-line verdict |
|--------|----------|------------------|
| Cockpit | **Good** | Strong hub; trim cards for launch |
| Signals | **Good** | Focused; overlaps Cockpit preview |
| People | **Good** | Core ring solid; fleet/lights split hurts |
| Talk | **Good** | AI spine works; needs visible entry |
| Tools | **Partial** | Essential 7 ready; grid is sprawl |
| Manual | **Good** content / **Partial** nav | Teach layer rich; merge corpora |
| Me | **Good** | Config hub; dedupe menus |

**Experimental (not major tabs but affect cohesion):** Ask Gauge modal, hidden tabs, Family fleet, Swipe check-in variants, `smartGaugeCapture` (built, unwired), `TESTING_MODE` premium bypass.

---

## Recommended cohesion sequence (no code — planning only)

1. **Wire Talk → Cockpit loop** on device (verify PRs #9–#11)  
2. **PR #12:** `smartGaugeCapture` post-Talk suggestions  
3. **Unify tool registry** + expose Essential 7 only at launch  
4. **Merge messaging** (Mind Mail / Heart Notes / Circle)  
5. **Promote Talk** entry (tab bar or persistent Cockpit CTA)  
6. **Collapse Manual** entry to JIT-first; browse secondary  
7. **Remove dead surfaces** (onboarding-old, psych-stage-archive, unwired swipe UIs)  

---

## References

- `docs/PRODUCT-INVENTORY-AUDIT.md` — route-level inventory  
- `docs/NAVIGATION_HUMAN_OS.md` — intended tab model  
- `docs/CORE-HUMAN-TOOLS.md` — Essential 7 definition  
- `docs/SMOKE-TEST-REPORT.md` — launch readiness gaps  
- `docs/NEXT-PRODUCT-ROADMAP.md` — stabilize → test → observe  
- `.cursorrules` — six-tab Human OS design rule  

---

*Audit complete. No application code was modified.*
