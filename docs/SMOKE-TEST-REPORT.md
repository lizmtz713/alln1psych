# Smoke Test Report — No-Code Inspection

**Date:** 2026-07-01  
**Branch inspected:** `main` @ `249c22c` (PRs #3–#8 merged)  
**Method:** Static code-path review + `npx expo export --platform ios` (bundle compiles all tab routes). No device/simulator session in this environment.

**Build gate:** `npx expo export --platform ios` — **PASS** (2509 modules, exit 0)

---

## Summary

| Area | Status | Severity |
|------|--------|----------|
| 1. Sign in / onboarding / Cockpit | Pass (config-dependent) | — |
| 2. Talk 4+ messages | Pass (AI config-dependent) | — |
| 3. Save → Cockpit | Pass with caveats | Should fix before beta |
| 4. Force restart persistence | Partial | Should fix before beta |
| 5. Signals tab | Pass | — |
| 6. People tab | Pass | — |
| 7. Tools tab | Pass | — |
| 8. Manual tab | Pass | — |
| 9. Me tab | Pass | — |

**Blockers before TestFlight (code):** None found in this pass.  
**Blockers before TestFlight (release config):** EAS must inject `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `app.config.js` → `extra`, `.env.example`).

---

## 1. Sign in / onboarding / Cockpit load

**Route flow**

```
app/index.tsx
  → loading: SplashScreen
  → !user: Redirect /(auth)/sign-in
  → !profileHydrated: SplashScreen (AuthSync hydrates profile)
  → !onboardingCompleted: Redirect /onboarding
  → Redirect /(tabs)  (Cockpit = index)
```

**Files inspected**

- `app/index.tsx` — gate order correct; avoids onboarding flash via `profileHydrated`
- `app/(auth)/sign-in.tsx` — email/password, Apple, optional Google; routes via Supabase `profiles.onboarding_completed`
- `src/providers/AuthProvider.tsx` — session from SecureStore-backed Supabase auth
- `src/providers/AuthSync.tsx` — hydrates user, journal, circle, education from Supabase after sign-in
- `app/(modals)/onboarding.tsx` — 8-step flow; `completeOnboardingDb` + `router.replace('/(tabs)')`
- `app/(tabs)/index.tsx` — Cockpit wrapped in `ErrorBoundary`; render fallbacks on setup errors

**Expected manual test**

1. Cold launch → Splash → Sign in (or Apple)
2. New user → onboarding (~8 steps) → Cockpit
3. Returning user → Splash briefly → Cockpit (no onboarding flash)

**Issues**

| Issue | Classification |
|-------|----------------|
| Auth requires Supabase env at build time (`app.config.js`, `src/lib/supabase.ts`). Missing secrets → sign-in fails at runtime. | **Release config blocker** (not a code defect) |
| Google sign-in only shown when `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` set | Polish later |

**Result:** **Pass** (assuming TestFlight build has Supabase secrets)

---

## 2. Talk — 4+ messages

**Entry points (Talk tab is hidden; `href: null` in `app/(tabs)/_layout.tsx`)**

- Cockpit quick action: `src/components/CockpitCluster.tsx` → `/(tabs)/talk`
- FAB Ask Gauge: `app/(tabs)/_layout.tsx` → `/(modals)/ask-gauge`
- Many deep links across Tools/Signals/Emergency

**Files inspected**

- `app/(tabs)/talk.tsx` — voice/text chat; `sendMessage` via `src/services/ai.ts`
- `src/stores/conversationStore.ts` — **not persisted** (in-memory only; expected)
- Chat uses Supabase edge `chat` function first, falls back to client OpenAI key

**Expected manual test**

1. Cockpit → Talk icon (bottom cluster)
2. Send 4+ user/assistant messages (minimum 3 required for save; 4+ recommended for meaningful summary)
3. AI replies when edge function or client API key available

**Issues**

| Issue | Classification |
|-------|----------------|
| Without edge + without client API key, user sees banner and journaling fallback; AI replies limited | Should fix before beta (TestFlight should rely on edge, not user-entered keys) |
| Talk not in tab bar (by design) | Polish later (discoverability) |

**Result:** **Pass** when Supabase edge `chat` is deployed or user has API key

---

## 3. Save and return to Cockpit

**Files inspected**

- `app/(tabs)/talk.tsx` — PR #8 merged: `handleSaveAndClose` awaits `runSaveConversation(true)` then `router.push('/(tabs)')`
- Save requires `messages.length >= 3`; clears messages after snapshot
- `generateConversationSummary` in `src/services/ai.ts` → `addSummary` in `src/stores/conversationSummaryStore.ts`

**Expected manual test**

1. After 4+ messages, tap **Save**
2. Toast “saved” (when `showToast: true`)
3. Lands on tab root (Cockpit)

**Issues**

| Issue | Classification | File (if fix needed) |
|-------|----------------|----------------------|
| `generateConversationSummary` uses **client OpenAI key only** — does not call edge function. Users who chat via edge (no client key) can talk but **Save silently fails** (dev `console.warn` only). | **Should fix before beta** | `src/services/ai.ts` |
| Save still navigates away even if summary generation fails | Should fix before beta | `app/(tabs)/talk.tsx` |

**Result:** **Pass** only when OpenAI key available to summary path; **Fail** for edge-only TestFlight setup until `generateConversationSummary` uses edge

---

## 4. Force restart — persistence expectation

**What persists (AsyncStorage / SecureStore)**

| Data | Store | Key / mechanism |
|------|-------|-----------------|
| Conversation summaries | `src/stores/conversationSummaryStore.ts` | Zustand persist → `conversation-summaries` |
| Auth session | `src/lib/supabase.ts` | SecureStore via Supabase client |
| Cockpit gauges | `src/stores/cockpitStore.ts` | Zustand persist |
| Talk messages | — | **Not persisted** (cleared on save) |

**Cockpit consumption**

- `app/(tabs)/index.tsx` reads `getLastSummary`, `getRecentTriggers`, `getEmotionalPatterns` inside daily-content `useEffect`
- Feeds `generateDailyContent()` → `psychSays` / greeting on Cockpit cards
- Saved summaries also visible in `app/(modals)/history.tsx`

**Expected manual test**

1. Complete Talk save flow
2. Force quit app
3. Reopen → Cockpit
4. Expect personalized insight/greeting referencing last Talk topic
5. Optional: open History modal (if linked) — summary row present

**Issues**

| Issue | Classification | File (if fix needed) |
|-------|----------------|----------------------|
| PR #9 (**open**, not on `main`): Cockpit subscribed to stable getter functions, not `summaries` array — cold start may generate daily content **before** persist hydration, missing summary on first load | **Should fix before beta** | `app/(tabs)/index.tsx` (fix in PR #9) |
| Summary save fails without client API key (see §3) — nothing to persist after restart | **Should fix before beta** | `src/services/ai.ts` |
| Cockpit “History” quick action routes to `/(tabs)/me`, not `/(modals)/history` | Polish later | `src/components/CockpitCluster.tsx` |
| Summaries are device-local only (not synced to Supabase) | Polish later (document in privacy copy) | — |

**Result:** **Partial** — store persistence works; Cockpit surfacing depends on PR #9 + summary generation path

---

## 5. Signals tab load

**File:** `app/(tabs)/signals.tsx`

- `ErrorBoundary` at tab layout level
- Defensive `try/catch` on `getLights`
- Loads drift, social health, birthdays, reach-outs, predictive warnings (async)

**Expected manual test:** Tap Signals → scroll cards → pull to refresh

**Issues:** None blocking.

**Result:** **Pass**

---

## 6. People tab load

**File:** `app/(tabs)/people/index.tsx` (+ nested stack in `app/(tabs)/people/_layout.tsx`)

- Relationship cards, tiers, Transmit composer
- Uses `circleStore` + `lightsStore`; empty state when no members

**Expected manual test:** Tap People → list/empty state renders → tap person sheet

**Issues:** None blocking.

**Result:** **Pass**

---

## 7. Tools tab load

**File:** `app/(tabs)/tools.tsx`

- Situation-first layout; static tool registry with routes
- No network required for tab shell

**Expected manual test:** Tap Tools → categories expand → tap a tool route

**Issues:** Individual tool screens not exhaustively tested in this pass; tab shell loads in bundle.

**Result:** **Pass** (tab load)

---

## 8. Manual tab load

**File:** `app/(tabs)/learn.tsx` (tab title “Manual” in `app/(tabs)/_layout.tsx`)

- Large content surface: manual sections, discoveries, gauge system, search
- `ErrorBoundary` present

**Expected manual test:** Tap Manual → scroll sections → open a lesson link

**Issues:** None blocking for tab load.

**Result:** **Pass**

---

## 9. Me tab load

**File:** `app/(tabs)/me.tsx`

- Profile, gauges grid, settings links, sign-out
- Uses auth + multiple stores; `ErrorBoundary` present

**Expected manual test:** Tap Me → profile blocks render → settings navigates

**Issues:** None blocking.

**Result:** **Pass**

---

## Recommended actions before TestFlight / beta

| Priority | Action | PR / file |
|----------|--------|-----------|
| Before TestFlight | Confirm EAS secrets: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`; deploy edge `chat` function | Release config |
| Before beta | Merge PR #9 — Cockpit reads summaries after hydration | `app/(tabs)/index.tsx` |
| Before beta | Route `generateConversationSummary` through edge (mirror `sendMessageServerSide`) | `src/services/ai.ts` |
| Before beta | Surface save failure to user when summary fails (toast/alert) | `app/(tabs)/talk.tsx` |
| Polish later | Cockpit History button → `/(modals)/history` | `src/components/CockpitCluster.tsx` |
| Polish later | Fix `/talk` nudge routes → `/(tabs)/talk` | `src/data/psychNudges.ts` |

---

## Manual test script (full smoke)

1. **Auth:** Sign in → complete or skip onboarding → Cockpit renders gauges/greeting
2. **Talk:** Cockpit → Talk icon → 4+ messages with AI replies
3. **Save:** Tap Save → return to Cockpit → optional toast
4. **Persist:** Force quit → reopen → Cockpit shows summary-influenced content (after PR #9 + working summary API)
5. **Tabs:** Tap Signals → People → Tools → Manual → Me — each loads without crash
6. **Dev check:** Metro log `[Talk] Failed to save…` or `[Cockpit] conversationSummaryStore` (after PR #9)

---

## Verification commands (this report)

```bash
npx expo export --platform ios   # PASS
npx tsc --noEmit                 # 6745 errors (baseline; non-blocking for export)
```

No application code was changed for this report.
