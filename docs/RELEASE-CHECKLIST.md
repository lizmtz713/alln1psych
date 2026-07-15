# Release checklist (go/no-go before TestFlight)

Use this list before shipping an internal TestFlight build.

---

## Pass 1: Static / code health

Run locally and **stop if any fail**:

```bash
npm ci
npm run audit
npx --yes expo-doctor@1.20.0
npm audit --omit=dev --audit-level=high
```

- [ ] Exact dependency install passes
- [ ] `npm run audit` passes (types, routes, account isolation, edge security)
- [ ] Expo Doctor passes 18/18
- [ ] Dependency audit has no high or critical findings

---

## Pass 2: Build health

- [ ] App builds cleanly for iOS
- [ ] Cold start opens app
- [ ] No red screen on load
- [ ] No missing env/config errors
- [ ] Auth works (sign in / sign out)
- [ ] Onboarding can complete
- [ ] Cockpit loads
- [ ] AI flows fail gracefully on provider timeout or poor connectivity
- [ ] A second store build receives a higher iOS build number

---

## Pass 3: Full manual smoke test

**Cockpit**

- [ ] Loads correctly
- [ ] Gauges render
- [ ] Helpful Right Now strip works
- [ ] Rituals button works
- [ ] Support button works
- [ ] Quick check-in works
- [ ] A failed save stays visible and can be retried
- [ ] Retrying the same save does not create duplicate rows or rewards
- [ ] Capacity/Stabilization mode changes only after the server confirms the save

**Signals**

- [ ] Opens
- [ ] List renders
- [ ] No empty-state weirdness
- [ ] Links go where expected

**People**

- [ ] Opens
- [ ] Circle opens
- [ ] Lights opens
- [ ] Invite Circle works
- [ ] No broken navigation
- [ ] **How to Show Up for Me:** person → show-up screen → create link → (web) complete form → summary + highlight + Reach Out / Tone Check / Relational Bridge shortcuts; guest completion distinguishes **invite message** vs **private update link**

**Tools** (at least)

- [ ] Tone Check
- [ ] Repair / Conversation Builder
- [ ] Role Play
- [ ] Reach Out
- [ ] Help Someone
- [ ] Relational Bridge (with person who has **How to show up** summary: card + blended openers/phrases/repair)
- [ ] Quick Reset
- [ ] Decision

**Learn**

- [ ] Lessons load
- [ ] Relationship repair lessons load
- [ ] Skills/self-discovery paths work

**Me**

- [ ] Sections expand/collapse
- [ ] Edit Profile works
- [ ] Foundations links work
- [ ] Settings / privacy / legal links work
- [ ] Sign out works
- [ ] Export includes cloud records and device data
- [ ] Delete Account requires confirmation and removes the account

---

## Pass 4: Critical flows

- [ ] **Onboarding** — 3-second promise is clear; valid 18+ birthday saves; consent persistence succeeds; first six-gauge calibration opens
- [ ] **Auth** — Email and Apple sign-in; sign out; session restore; re-open app behaves correctly
- [ ] **Account isolation** — Sign out of user A, sign into user B, and verify no A data appears before or after app restart
- [ ] **Cockpit integrity** — Header, six gauges, and momentum state commit together; offline failure is visible; retry is idempotent
- [ ] **AI privacy** — Personalization defaults off; opt-in changes context; raw prompt/response text is absent from telemetry
- [ ] **HealthKit** — Grant and deny paths both work; raw HealthKit snapshots do not survive sign-out
- [ ] **Privacy rights** — Export succeeds; account deletion signs out and leaves no local user data
- [ ] **Emergency** — Support route opens; crisis resources visible; breathe works; trusted-contact/reach-out don’t break
- [ ] **Foundation** — All 6 routes open; back nav works; no modal leftovers
- [ ] **Moved routes** — All open from real entry points: `/foundation/*`, `/onboarding`, `/identity-setup`, `/invite-circle`, `/tools/help-someone`, `/tools/reach-out`, `/tools/relational-bridge`

---

## Pass 5: Edge cases

- [ ] AI provider timeout — local/fallback behavior works and app doesn’t crash
- [ ] No HealthKit permission — no crash
- [ ] Oura is clearly unavailable/coming soon and no OAuth flow launches
- [ ] First install, no data — empty states and onboarding work
- [ ] Invalid or under-18 birthday — blocked with clear copy
- [ ] Consent persistence failure — visible retry; onboarding does not silently continue
- [ ] Empty People/Circle state — no crash
- [ ] No wearable data — no crash
- [ ] No lessons completed — Learn still usable
- [ ] No relationships added — People still usable
- [ ] Offline / poor connection — acceptable behavior

---

## Blockers (do not ship if any of these)

- [ ] Startup crash
- [ ] Auth broken
- [ ] Onboarding cannot complete
- [ ] Cockpit blank or broken
- [ ] Any main tab crashes
- [ ] Critical tool crashes
- [ ] Emergency route broken
- [ ] Broken navigation loop
- [ ] Sign out broken
- [ ] Any duplicate Cockpit submission
- [ ] Any cross-account data leakage
- [ ] Export or account deletion broken
- [ ] Production mobile bundle contains a provider/service-role secret

---

## Acceptable for internal testing (can ship if clearly noted)

- Rough copy
- Placeholder visuals
- Non-critical feature hidden
- Not-yet-connected integrations
- Some empty states still plain
- expo-doctor warnings (app.json vs app.config, @types/react-native, RNDirectory metadata) — document and fix in a follow-up

---

## Bug log format

When testing, log each issue as:

```
Area:
Route:
Device:
Steps:
Expected:
Actual:
Severity: blocker | high | medium | low
Screenshot/video:
```

---

## Cloud deployment gate

Authenticate the CLIs locally or provide CI tokens. Never paste credentials into the repo.

```bash
supabase login
eas login
supabase migration list --linked
supabase db push --linked --dry-run
supabase db push --linked
supabase functions deploy chat
supabase functions deploy tts
supabase functions deploy vision
supabase functions deploy analyze-checkin
supabase functions deploy generate-wrapped-insights
supabase functions deploy delete-account
supabase functions deploy export-account
```

- [ ] Linked Supabase project is named **InGauge**
- [ ] All local migrations are present remotely
- [ ] `OPENAI_API_KEY` exists as an Edge Function secret
- [ ] Only the seven authenticated release functions above are deployed
- [ ] Public survey/share and Oura functions remain undeployed for this release
- [ ] EAS production environment contains `EXPO_PUBLIC_SUPABASE_URL`
- [ ] EAS production environment contains the anon/publishable key—not a service-role key

## Before TestFlight: save and ship

```bash
git status
git push origin fix/ingauge-release-candidate
eas build --platform ios --profile testflight --auto-submit
```

Do not invite external testers until Passes 2–5 are complete on the uploaded build.
