# Release checklist (go/no-go before TestFlight)

Use this list before shipping an internal TestFlight build.

---

## Pass 1: Static / code health

Run locally and **stop if any fail**:

```bash
npm run audit          # typecheck + route audit + ownership audit
npm run lint           # expo lint (may need network)
npx expo-doctor        # Expo/native config
```

- [ ] `npm run audit` passes (no TS errors, no broken route refs)
- [ ] `npm run lint` passes
- [ ] `npx expo-doctor` — fix or document any failures

---

## Pass 2: Build health

- [ ] App builds cleanly for iOS
- [ ] Cold start opens app
- [ ] No red screen on load
- [ ] No missing env/config errors
- [ ] Auth works (sign in / sign out)
- [ ] Onboarding can complete
- [ ] Cockpit loads
- [ ] AI flows fail gracefully when no API key

---

## Pass 3: Full manual smoke test

**Cockpit**

- [ ] Loads correctly
- [ ] Gauges render
- [ ] Helpful Right Now strip works
- [ ] Rituals button works
- [ ] Support button works
- [ ] Quick check-in works

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

**Tools** (at least)

- [ ] Tone Check
- [ ] Repair / Conversation Builder
- [ ] Role Play
- [ ] Reach Out
- [ ] Help Someone
- [ ] Relational Bridge
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

---

## Pass 4: Critical flows

- [ ] **Onboarding** — Finishes cleanly; no dead-end; tone-check and feeling branches work; skip paths work
- [ ] **Auth** — Sign up, sign in, sign out; re-open app behaves correctly
- [ ] **Emergency** — Support route opens; crisis resources visible; breathe works; trusted-contact/reach-out don’t break
- [ ] **Foundation** — All 6 routes open; back nav works; no modal leftovers
- [ ] **Moved routes** — All open from real entry points: `/foundation/*`, `/onboarding`, `/identity-setup`, `/invite-circle`, `/tools/help-someone`, `/tools/reach-out`, `/tools/relational-bridge`

---

## Pass 5: Edge cases

- [ ] No API key — app doesn’t crash; AI flows fail gracefully
- [ ] No Health/Oura permissions — no crash
- [ ] First install, no data — empty states and onboarding work
- [ ] User skips onboarding options — no dead-end
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

## Before TestFlight: save state

```bash
git status
git add .
git commit -m "Release candidate QA sweep"
git checkout -b release/internal-test-1
git tag v0.1.0-internal.1
git push --follow-tags origin release/internal-test-1
```

Then create the TestFlight build from the release branch.
