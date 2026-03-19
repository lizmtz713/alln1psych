# Entry-Point Cleanup (Moved Flows)

**Goal:** Ensure every flow moved out of modals is discoverable from the surface where users need it.

**Question for each:** *Can a user naturally discover this feature from the surface where they need it?*

---

## 1. Foundation

**Route:** `/foundation/*` (values, directions, people, body, state, emotion).

| Surface | Entry point | Status |
|---------|-------------|--------|
| **Me / Settings** | Settings → “My PHOSM” → Body Baseline, Regulation Map, Emotional Profile → `/foundation/body`, `/foundation/state`, `/foundation/emotion` | ✅ |
| **Cockpit** | Quick tools / “Helpful right now” → Body → `/foundation/body` | ✅ |
| **Tools** | Tools grid → Body → `/foundation/body` | ✅ |
| **Insight cards** | Connection/body insights → “Body” tool link → `/foundation/body` | ✅ |
| **Onboarding / setup** | No dedicated “Set up your foundations” from onboarding; user can reach via Settings after first run. | ⚠️ Optional: add setup prompt in onboarding or Me that links to `/foundation/values` or first step. |

**Fix applied:** Settings had one stale route `/(modals)/foundation-state` → updated to `/foundation/state`.

---

## 2. Onboarding

**Route:** `/onboarding` (and `/onboarding/old` deprecated).

| Surface | Entry point | Status |
|---------|-------------|--------|
| **App root** | Redirect when `!onboardingCompleted` → `/onboarding` | ✅ |
| **Auth** | sign-in / sign-up → `routeAfterSignIn` → `/onboarding` when profile incomplete | ✅ |
| **Me** | “Redo Onboarding” → `/onboarding` | ✅ |

No gaps.

---

## 3. Identity Setup

**Route:** `/identity-setup`.

| Surface | Entry point | Status |
|---------|-------------|--------|
| **Me** | Avatar press → `/identity-setup`; “Edit profile” → `/identity-setup` | ✅ |
| **Profile** | No separate profile stack link; Me is the profile entry. | ✅ |

No gaps.

---

## 4. Invite Circle

**Route:** `/invite-circle`.

| Surface | Entry point | Status |
|---------|-------------|--------|
| **People** | “Understand People” section → **Invite** card → `/invite-circle` | ✅ Added |
| **Circle / Mind Mail** | Connections view → “Invite someone to your Circle” row → `/invite-circle` | ✅ Added |

**Changes:** Entry points added on People (Invite card) and Circle (Invite row in Connections).

---

## 5. Help Someone

**Route:** `/tools/help-someone`.

| Surface | Entry point | Status |
|---------|-------------|--------|
| **Tools** | Tools grid + “Get Support” section → Help → `/tools/help-someone` | ✅ |
| **Cockpit** | “Helpful right now” / quick actions → Help → `/tools/help-someone` | ✅ |
| **Gauge detail** | “Help” action in gauge-detail modal → `/tools/help-someone` | ✅ |
| **Contextual cards** | Tool suggestions / gauge-triggered suggestions can surface Help. | ✅ |

No gaps.

---

## 6. Reach Out

**Route:** `/tools/reach-out`.

| Surface | Entry point | Status |
|---------|-------------|--------|
| **Cockpit** | Quick actions, priorities, “Helpful right now” → Reach Out → `/tools/reach-out` | ✅ |
| **Tools** | “Take Action” section → Reach Out → `/tools/reach-out` | ✅ |
| **Connection prompts** | ConnectionPromptCard, ReachOutPrompt → `/tools/reach-out` | ✅ |
| **Insight cards** | Connection insights → “Reach Out” tool link → `/tools/reach-out` | ✅ |
| **Onboarding / low connection** | reach-out-intro invitation → `/tools/reach-out` | ✅ |

No gaps.

---

## 7. Relational Bridge

**Route:** `/tools/relational-bridge`.

| Surface | Entry point | Status |
|---------|-------------|--------|
| **Tools** | “Navigate People” and “Take Action” sections → Relational Bridge → `/tools/relational-bridge` | ✅ Added |
| **People** | No direct link; user looking for “bridge” mediation may go to Tools. | ⚠️ Optional: add from People if product wants it visible there. |

**Changes:** Relational Bridge added to Tools tab (TOOLS array and both Navigate People and Take Action sections).

---

## Summary

| Flow | Primary surface(s) | Gaps fixed |
|------|--------------------|------------|
| Foundation | Me/Settings, Cockpit, Tools, insight cards | Settings route fix (foundation-state) |
| Onboarding | Root, Auth, Me | — |
| Identity Setup | Me (avatar, edit profile) | — |
| Invite Circle | People, Circle | **Added** People (Invite card) and Circle (Invite row) |
| Help Someone | Tools, Cockpit, gauge-detail | — |
| Reach Out | Cockpit, Tools, connection prompts, insights | — |
| Relational Bridge | Tools | **Added** to Tools tab (Navigate People + Take Action) |

---

## Recommended follow-ups (backlog)

1. **Foundation from onboarding/profile:** Add a “Set up your foundations” or “Personalize gauges” prompt from Me or post-onboarding that links to `/foundation/values` (or first step).
2. **People-facing entry for Relational Bridge:** If desired, add a card or link in “Understand People” or a relationship-action strip so Relational Bridge is discoverable from the People tab.
3. **Love migration (execute decision):** Implement the split in MODAL-REDUCTION-PLAN — educational content → Learn (`/learn/relationship-toolkit/love`); datesume/love-history → People. Do not move the current love modal as one route.
