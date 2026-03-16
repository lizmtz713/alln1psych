# InGauge — QA & Apple App Store Approval Checklist

This document supports full QA and Apple App Review readiness. Use it for pre-submission testing and to ensure all flows work with and without AI, personalization is intact, and integrations are testable.

---

## 1. Concepts, Loops & Systems (all intact)

| System | Entry | Core flow | Exit | Notes |
|--------|--------|-----------|------|--------|
| **6 Gauges / Cockpit** | Home → Check in / Quick log | cockpit-checkin or quick-log → gauges updated | Back / Done | Body, State, Emotion, Connection, Direction, Alignment |
| **Temperature / Circle** | Circle tab, People | View temps, nudge, invite | Back | Love language in nudges |
| **Learn / Manual** | Learn tab | Search, sections, lesson [id] | Back | Age-adaptive content |
| **Timeline** | Timeline route | Chronological events | Back | Check-ins, journal, connections |
| **Signals / Lights** | Signals, People | Radar, tiers, [id], drift | Back | Connection log, birthdays |
| **Heart Notes / Mind-mail** | Inbox, compose | Compose → AI clarify (optional) → send | Close, Back | Works without AI (no clarify) |
| **Crisis** | Crisis resources modal | Hotlines, 988, text | Back | Always available, no AI required |
| **Share** | Share insight, therapist report | Build content → share link/file | Back | No AI in build |
| **Onboarding** | Post sign-up | Name, age, legal, quick setup, first check-in | Enter Cockpit | Persist love_language, age_group, onboarding_completed |

**QA:** For each system, confirm: user can enter, complete at least one meaningful action, and exit without getting stuck.

---

## 2. AI Connected & Fallbacks (app works without AI)

| Feature | AI used? | Non-AI fallback | QA |
|---------|----------|------------------|-----|
| **Talk** | Yes | Edge → client; error string if no key | Test with API key off: see clear message, no crash |
| **Decode** | Yes | `getDecodeFallback(message, sender)` — reflection guide when API fails or no key | Paste text → get guide even when AI unavailable |
| **Thought Challenger** | Yes | `thoughtChallengerFallback(step, thought, messages)` — CBT prompts | Start challenge with API off → get step 1 fallback; follow-up → step 2–4 fallback |
| **Cockpit cross-system insight** | Yes | `getHardcodedInsight(gauges, driverContext)` | After check-in, insight appears even if API fails |
| **Wrapped** | Yes | Edge `fallbackInsights(payload)` | Year-in-review works without key |
| **Check-in voice** | Yes | `heuristicScore(question, transcript)` | Pre/Post-flight voice still gives score on error |
| **Discovery direction/values** | Yes | `fallbackDirectionSynthesis` / `fallbackValuesSynthesis` | Discovery flows complete |
| **Activity (other)** | Yes | No fallback | Optional: add static tips for emotion match / body scan if desired |
| **Roleplay, Heart notes AI, Love quiz, Lesson “Ask Gauge”, Help someone, Resolve/Referee/Replay/Relate** | Yes | No fallback | Show clear “AI unavailable” and retry or skip; app does not crash |

**QA:** Turn off API key (or use bad key) and run through: Talk, Decode, Thought Challenger, Cockpit insight, Wrapped. Confirm fallbacks and no hard crashes.

---

## 3. Personalization (adaptive to user)

| Item | Stored | Used | QA |
|------|--------|------|-----|
| **Love language** | userStore, profiles.love_language | Talk prompt, ReachOut tips, Circle nudge, export, therapist share, prompt-generator | Set in onboarding or how-you-connect → persist to Supabase; reload session → still set |
| **Age / developmental** | userStore (ageGroup, ageRange, birthday) | ageAdaptive.ts, Talk, manual, discoveries, roleplay, lesson intro | Onboarding sets age_group → AI and content adapt |
| **Learning style** | userStore.learningStyle, profiles.learning_style | adaptiveContext (AI prompt), how-you-connect, learning-style-quiz | Quiz or how-you-connect → updateExtendedProfile(learning_style); AuthSync hydrates learningStyle from profile on login |
| **History** | Conversations, check-ins, journal, mood | Talk context, insights, timeline, wrapped, therapist share | Add data → see it in timeline and in AI context where applicable |

**QA:** Set love language and learning style; sign out and sign back in; confirm they’re still set. Change age group and confirm tone/content adapt.

**DB:** Ensure `profiles` has `learning_style` (and `love_language`, `age_group`, `onboarding_completed`). Add migration if missing.

---

## 4. Health Integrations (testers get real input)

| Integration | How to connect | Data used | QA |
|-------------|----------------|-----------|-----|
| **Apple Health** | Me → Apple Health (health-connections) → Connect | Sleep, steps, activity, heart rate, HRV, menstrual | Grant permissions → confirm data in health store; Body gauge and insights use it |
| **Menstrual cycle** | HealthKit MenstruationData; cycleStore (manual fallback) | cyclePhase, cycleDay in HealthContext → cockpitAI, Body/State context | Enable Health → log or sync cycle → see phase/day in Cycle Intelligence and in cross-system insight when relevant |
| **Oura** | Me → Oura Ring (when “Coming Soon” replaced with real flow) → OAuth | Sleep, readiness, HRV, activity | When live: connect → merged with HealthKit in aggregatedHealth; readiness/sleep in insights |
| **Apple Watch** | Me → Apple Watch (if WatchBridge implemented) | Gauges, check-ins, health snapshot | When native module is implemented: pair and verify sync |

**QA:** On device: connect Apple Health, add cycle data (or manual in Cycle Intelligence), run check-in and view insight — cycle context should appear when available. Document Oura “Coming Soon” until oura-oauth and app flow are ready.

---

## 5. Science, Research & Safety

- **Content:** Manual, discoveries, and tools reference research and lived experience; no unsupported claims.
- **Crisis:** 988, Crisis Text Line (741741), 911; disclaimer that app is not a substitute for professional help.
- **Disclaimer:** “InGauge is not a medical device; not a replacement for therapy or professional care” (and similar) present in onboarding and settings.
- **Age:** App for 13+; age-adaptive language and content for teens through older adults.

**QA:** Spot-check crisis screen, onboarding legal, and settings disclaimer. Confirm no “diagnose” or “treat” language.

---

## 6. Apple App Review Considerations

- **Privacy:** Explain in App Store description and in-app how data is used (conversations, check-ins, health). Health data only for Body gauge and insights; optional.
- **HealthKit:** Usage descriptions in app.config.js (NSHealthShareUsageDescription, NSHealthUpdateUsageDescription); request only what’s needed; no write unless documented.
- **Microphone:** For Talk and voice check-in; clear permission string.
- **Sign in with Apple:** If offered as an option, implement per guidelines.
- **No broken features:** All primary flows (check-in, Talk, Learn, Circle, Me, Crisis) work; no placeholder-only screens that block progress.
- **Offline / no API:** App opens and core flows (check-in, timeline, manual, crisis, Decode/Thought Challenger fallbacks) work without API key where fallbacks exist.
- **Stability:** No crashes on main flows; graceful errors when API or network fails.

**QA:** Run through primary user paths on a clean install and with API key removed; confirm no crashes and clear messaging.

---

## 7. Quick QA Script (high level)

1. **Fresh install:** Sign up → onboarding (name, age, legal) → first check-in → enter cockpit.
2. **Check-in:** Complete full cockpit-checkin → confirm gauges update and cross-system insight appears (with or without AI).
3. **Talk:** Send a message with API key; then remove key and send again → expect error message or fallback, no crash.
4. **Decode:** Paste a short message, decode with API off → reflection guide appears.
5. **Thought Challenger:** Enter a thought with API off → fallback step 1 appears; continue → fallback steps 2–4.
6. **Learn:** Open a lesson; confirm age-appropriate tone if age set.
7. **Circle:** Add a member (if allowed); confirm temperature and nudge copy.
8. **Me:** Open Apple Health connection; grant permissions; confirm cycle (if available) and Body gauge context.
9. **Crisis:** Open crisis resources; confirm 988 and disclaimer.
10. **Personalization:** Set love language and learning style; sign out and in → confirm still set.

Use this checklist for full QA and to align with Apple approval expectations.
