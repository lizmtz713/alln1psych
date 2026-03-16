# InGauge Route Map

Expo Router (file-based). Root layout renders a **Stack**; `(tabs)` and `(modals)` are stack screens. Group names in parentheses do not appear in the URL.

**See also:** [README.md](./README.md) (index) · [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) · [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) · [INGAUGE-AI-ARCHITECTURE.md](./INGAUGE-AI-ARCHITECTURE.md) · [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md)

---

## 1. Route map (URL → screen)

### Root stack (app/_layout.tsx)

```
/                     → index.tsx (redirect: auth / onboarding / (tabs))
/(auth)/sign-in       → (auth)/sign-in.tsx
/(auth)/sign-up       → (auth)/sign-up.tsx
/(auth)/forgot-password → (auth)/forgot-password.tsx
/(tabs)               → (tabs) layout → default tab
/onboarding           → onboarding stack (first-run flow, consent, setup; owned by Cockpit)
/identity-setup       → identity-setup stack (configuration/profile flow; owned by Me; may move under /profile later)
/invite-circle        → invite-circle stack (circle invite flow; owned by People)
/(modals)/*           → modal stack (see Modals below)
/lesson/[id]          → lesson/[id].tsx
/share/cockpit        → share/cockpit.tsx
/forecast             → forecast/index.tsx
/tools/*              → tools layout + nested (see Tools below)
/learn/*              → learn layout + nested (see Learn below)
/foundation/*          → foundation stack (setup/configuration flow: values, directions, people, body, state, emotion; owned by Manual)
/profile/*            → profile layout + nested (see Profile below)
/habits/*             → habits layout + nested
/love/*               → love layout + nested
/love-history/*       → love-history layout + nested
/body-maintenance/*   → body-maintenance layout + nested
/news-my-way/*        → news-my-way layout + nested
/emergency/*          → emergency layout + nested
/rituals/*            → rituals layout + nested
/mind-mail/*          → mind-mail layout + nested
/lights/*             → lights layout + nested
/flight-log/*         → flight-log layout + nested
/timeline             → timeline/index.tsx
/wrapped              → wrapped/index.tsx
/insight/[code]       → insight/[code].tsx
/your-story/*         → your-story layout + nested
/patterns             → patterns/index.tsx
```

### Tabs (app/(tabs)/) — URL prefix `/(tabs)/`

| Path | File | Tab label |
|------|------|-----------|
| `/(tabs)` or `/(tabs)/` | index.tsx | **Cockpit** |
| `/(tabs)/signals` | signals.tsx | **Signals** |
| `/(tabs)/people` | people.tsx | **People** |
| `/(tabs)/tools` | tools.tsx | **Tools** |
| `/(tabs)/learn` | learn.tsx | **Manual** |
| `/(tabs)/me` | me.tsx | **Me** |
| `/(tabs)/talk` | talk.tsx | (hidden) Talk |
| `/(tabs)/circle` | circle.tsx | (hidden) Mind Mail |
| `/(tabs)/lights` | lights.tsx | (hidden) Lights |

### Modals (app/(modals)/) — URL prefix `/(modals)/`

| Route | File |
|-------|------|
| mood-checkin | mood-checkin.tsx |
| new-journal | new-journal.tsx |
| role-play | role-play.tsx |
| activity | activity.tsx |
| cockpit-checkin | cockpit-checkin.tsx |
| quick-log | quick-log.tsx |
| gauge-detail | gauge-detail.tsx |
| body-maintenance | body-maintenance.tsx |
| body-maintenance-edit | body-maintenance-edit.tsx |
| replay | replay.tsx |
| decode | decode.tsx |
| relate | relate.tsx |
| love | love.tsx |
| history | history.tsx |
| features | features.tsx |
| weekly-insight | weekly-insight.tsx |
| resolve | resolve.tsx |
| health-connections | health-connections.tsx |
| oura-connect | oura-connect.tsx |
| notification-settings | notification-settings.tsx |
| heart-inbox | heart-inbox.tsx |
| heart-mail-detail | heart-mail-detail.tsx |
| heart-mail-compose | heart-mail-compose.tsx |
| heart-notes | heart-notes.tsx |
| heart-compose | heart-compose.tsx |
| heart-view | heart-view.tsx |
| awards | awards.tsx |
| awe-activities | awe-activities.tsx |
| crisis-resources | crisis-resources.tsx |
| cycle | cycle.tsx |
| debrief | debrief.tsx |
| drift-detector | drift-detector.tsx |
| learning-style-quiz | learning-style-quiz.tsx |
| patterns | patterns.tsx |
| pre-conversation-check | pre-conversation-check.tsx |
| prompt-generator | prompt-generator.tsx |
| quick-reset | quick-reset.tsx |
| referee | referee.tsx |
| settings | settings.tsx |
| share-insight | share-insight.tsx |
| share-snapshot | share-snapshot.tsx |
| sovereignty-report | sovereignty-report.tsx |
| therapist-share | therapist-share.tsx |
| therapist-share-create | therapist-share-create.tsx |
| attraction | attraction.tsx |
| attachment-style | attachment-style.tsx |
| boundaries | boundaries.tsx |
| difficult-people | difficult-people.tsx |
| critical-thinking | critical-thinking.tsx |
| red-green-flags | red-green-flags.tsx |
| ask-gauge | ask-gauge.tsx |
| disclaimer | disclaimer.tsx |
| data-use | data-use.tsx |

### Nested stacks

**lesson**
- `/lesson/[id]` → lesson/[id].tsx

**share**
- `/share/cockpit` → share/cockpit.tsx

**forecast**
- `/forecast` → forecast/index.tsx

**tools**
- `/tools` → (layout only; tab content is (tabs)/tools.tsx)
- `/tools/quick-reset` → tools/quick-reset/index.tsx
- `/tools/quick-reset/[id]` → tools/quick-reset/[id].tsx
- `/tools/decision` → tools/decision/index.tsx
- `/tools/decision/[id]` → tools/decision/[id].tsx
- `/tools/decision/quick` → tools/decision/quick.tsx
- `/tools/decision/new` → tools/decision/new.tsx
- `/tools/focus` → tools/focus/index.tsx
- `/tools/focus/session` → tools/focus/session.tsx
- `/tools/focus/exercise/[id]` → tools/focus/exercise/[id].tsx
- `/tools/creativity` → tools/creativity/index.tsx
- `/tools/creativity/ideas` → tools/creativity/ideas.tsx
- `/tools/creativity/prompt` → tools/creativity/prompt.tsx
- `/tools/creativity/unblock` → tools/creativity/unblock.tsx
- `/tools/bias-check` → tools/bias-check/index.tsx
- `/tools/bias-check/library` → tools/bias-check/library.tsx
- `/tools/bias-check/library/[id]` → tools/bias-check/library/[id].tsx
- `/tools/win-capture` → tools/win-capture/index.tsx
- `/tools/life-direction-finder` → tools/life-direction-finder/index.tsx
- `/tools/family-conflict` → tools/family-conflict/index.tsx
- `/tools/human-roles` → tools/human-roles/index.tsx
- `/tools/human-roles/[id]` → tools/human-roles/[id].tsx
- `/tools/parent-compass` → tools/parent-compass/index.tsx
- `/tools/parent-compass/[id]` → tools/parent-compass/[id].tsx
- `/tools/memory-builder` → tools/memory-builder/index.tsx
- `/tools/memory-builder/add` → tools/memory-builder/add.tsx
- `/tools/memory-builder/person/[id]` → tools/memory-builder/person/[id].tsx
- `/tools/memory-builder/practice` → tools/memory-builder/practice.tsx
- `/tools/memory-builder/practice/[exercise]` → tools/memory-builder/practice/[exercise].tsx
- `/tools/memory-builder/tips` → tools/memory-builder/tips.tsx
- `/tools/relationship-repair` → tools/relationship-repair/index.tsx
- `/tools/perspective-translator` → tools/perspective-translator/index.tsx
- `/tools/help-someone` → tools/help-someone/index.tsx (re-exports (modals)/help-someone; Tools — AI-assisted situational guidance)
- `/tools/reach-out` → tools/reach-out/index.tsx (re-exports (modals)/reach-out-scaffold; Tools — action-oriented reach-out flow)
- `/tools/relational-bridge` → tools/relational-bridge/index.tsx (re-exports (modals)/relational-bridge; Tools — guided mediation/bridge-building)

**learn**
- `/learn` → (layout; tab content is (tabs)/learn.tsx)
- `/learn/manual/[slug]` → learn/manual/[slug].tsx
- `/learn/self-discovery` → learn/self-discovery/index.tsx
- `/learn/self-discovery/[id]` → learn/self-discovery/[id].tsx
- `/learn/life-literacy` → learn/life-literacy/index.tsx
- `/learn/life-literacy/[id]` → learn/life-literacy/[id].tsx
- `/learn/relationship-toolkit` → learn/relationship-toolkit/index.tsx
- `/learn/life-stages` → learn/life-stages/index.tsx
- `/learn/questions` → learn/questions/index.tsx
- `/learn/questions/[id]` → learn/questions/[id].tsx
- `/learn/questions/map` → learn/questions/map.tsx
- `/learn/skills` → learn/skills/index.tsx
- `/learn/skills/[id]` → learn/skills/[id].tsx

**onboarding** (first-run flow, consent, setup; owned by Cockpit — not a modal)
- `/onboarding` → onboarding/index.tsx (re-exports (modals)/onboarding)
- `/onboarding/old` → onboarding/old.tsx (re-exports (modals)/onboarding-old). **Deprecated:** legacy route only; do not use for new flows.

**identity-setup** (configuration/profile flow; owned by Me — not a modal; may move under /profile later)
- `/identity-setup` → identity-setup/index.tsx (re-exports (modals)/identity-setup)

**invite-circle** (circle invite flow; owned by People — not a modal)
- `/invite-circle` → invite-circle/index.tsx (re-exports (modals)/invite-circle)

**foundation** (setup/configuration flow; owned by Manual — not a modal utility)
- `/foundation/values` → foundation/values.tsx (re-exports (modals)/foundation-values)
- `/foundation/directions` → foundation/directions.tsx
- `/foundation/people` → foundation/people.tsx
- `/foundation/body` → foundation/body.tsx
- `/foundation/state` → foundation/state.tsx
- `/foundation/emotion` → foundation/emotion.tsx

**profile**
- `/profile` → profile/index.tsx
- `/profile/identity` → profile/identity.tsx
- `/profile/how-you-connect` → profile/how-you-connect.tsx
- `/profile/what-gives-life` → profile/what-gives-life.tsx
- `/profile/values` → profile/values.tsx
- `/profile/sensitive` → profile/sensitive.tsx
- `/profile/in-your-own-words` → profile/in-your-own-words.tsx
- `/profile/gauges/body` → profile/gauges/body.tsx
- `/profile/gauges/state` → profile/gauges/state.tsx
- `/profile/gauges/emotion` → profile/gauges/emotion.tsx
- `/profile/gauges/connection` → profile/gauges/connection.tsx
- `/profile/gauges/direction` → profile/gauges/direction.tsx
- `/profile/gauges/direction-discovery` → profile/gauges/direction-discovery.tsx
- `/profile/gauges/alignment` → profile/gauges/alignment.tsx
- `/profile/gauges/alignment-discovery` → profile/gauges/alignment-discovery.tsx
- `/profile/goals` → profile/goals.tsx
- `/profile/achievements` → profile/achievements.tsx
- `/profile/preferences` → profile/preferences.tsx
- `/profile/human-profile` → profile/human-profile.tsx

**habits**
- `/habits` → habits/index.tsx
- `/habits/add` → habits/add.tsx
- `/habits/[id]` → habits/[id].tsx

**love**
- `/love` → love layout
- `/love/datesume` → love/datesume/index.tsx
- `/love/datesume/[relationshipId]` → love/datesume/[relationshipId].tsx
- `/love/datesume/add-relationship` → love/datesume/add-relationship.tsx
- `/love/datesume/edit-header` → love/datesume/edit-header.tsx
- `/love/datesume/edit-logistics` → love/datesume/edit-logistics.tsx
- `/love/datesume/edit-style` → love/datesume/edit-style.tsx
- `/love/datesume/edit-summary` → love/datesume/edit-summary.tsx
- `/love/datesume/edit-offerings` → love/datesume/edit-offerings.tsx
- `/love/datesume/edit-skills` → love/datesume/edit-skills.tsx
- `/love/datesume/edit-milestones` → love/datesume/edit-milestones.tsx
- `/love/datesume/edit-growth` → love/datesume/edit-growth.tsx
- `/love/datesume/edit-testimonials` → love/datesume/edit-testimonials.tsx
- `/love/datesume/edit/good-to-know` → love/datesume/edit/good-to-know/index.tsx
- `/love/datesume/edit/good-to-know/love-style` → love/datesume/edit/good-to-know/love-style.tsx
- `/love/datesume/edit/good-to-know/values` → love/datesume/edit/good-to-know/values.tsx
- `/love/datesume/edit/good-to-know/conflict` → love/datesume/edit/good-to-know/conflict.tsx
- `/love/datesume/edit/good-to-know/relationships` → love/datesume/edit/good-to-know/relationships.tsx
- `/love/datesume/edit/good-to-know/life-goals` → love/datesume/edit/good-to-know/life-goals.tsx
- `/love/datesume/edit/good-to-know/lifestyle` → love/datesume/edit/good-to-know/lifestyle.tsx
- `/love/datesume/edit/good-to-know/attachment` → love/datesume/edit/good-to-know/attachment.tsx
- `/love/datesume/preview` → love/datesume/preview.tsx
- `/love/datesume/share` → love/datesume/share.tsx

**love-history**
- `/love-history` → love-history/index.tsx
- `/love-history/add` → love-history/add.tsx
- `/love-history/[id]` → love-history/[id].tsx
- `/love-history/insights` → love-history/insights.tsx
- `/love-history/patterns` → love-history/patterns.tsx

**body-maintenance**
- `/body-maintenance` → body-maintenance/index.tsx
- `/body-maintenance/add-routine` → body-maintenance/add-routine.tsx
- `/body-maintenance/add-provider` → body-maintenance/add-provider.tsx
- `/body-maintenance/[routineId]` → body-maintenance/[routineId].tsx
- `/body-maintenance/providers/[id]` → body-maintenance/providers/[id].tsx

**news-my-way**
- `/news-my-way` → news-my-way/index.tsx
- `/news-my-way/settings` → news-my-way/settings.tsx

**emergency**
- `/emergency` → emergency/index.tsx
- `/emergency/reach-out` → emergency/reach-out.tsx
- `/emergency/breathe` → emergency/breathe.tsx
- `/emergency/crisis` → emergency/crisis.tsx

**rituals**
- `/rituals/pre-flight` → rituals/pre-flight.tsx
- `/rituals/post-flight` → rituals/post-flight.tsx
- `/rituals/gratitude-review` → rituals/gratitude-review.tsx

**mind-mail**
- `/mind-mail` → mind-mail/index.tsx
- `/mind-mail/compose` → mind-mail/compose.tsx
- `/mind-mail/[id]` → mind-mail/[id].tsx
- `/mind-mail/glimpse-view` → mind-mail/glimpse-view.tsx

**lights**
- `/lights` → (tabs)/lights or lights layout
- `/lights/add` → lights/add.tsx
- `/lights/edit/[id]` → lights/edit/[id].tsx
- `/lights/[id]` → lights/[id].tsx
- `/lights/radar` → lights/radar.tsx
- `/lights/world` → lights/world.tsx
- `/lights/learn` → lights/learn.tsx
- `/lights/map` → lights/map.tsx
- `/lights/insights` → lights/insights.tsx
- `/lights/log-entry` → lights/log-entry.tsx
- `/lights/tiers/five` → lights/tiers/five.tsx
- `/lights/tiers/fifteen` → lights/tiers/fifteen.tsx
- `/lights/tiers/fifty` → lights/tiers/fifty.tsx
- `/lights/tiers/network` → lights/tiers/network.tsx
- `/lights/family` → lights/family/index.tsx
- `/lights/family/create` → lights/family/create.tsx
- `/lights/family/[familyId]` → lights/family/[familyId]/index.tsx
- `/lights/family/[familyId]/settings` → lights/family/[familyId]/settings.tsx
- `/lights/family/[familyId]/coordinate` → lights/family/[familyId]/coordinate.tsx
- `/lights/family/[familyId]/patterns` → lights/family/[familyId]/patterns.tsx
- `/lights/lessons` → lights/lessons/index.tsx
- `/lights/lessons/[lessonId]` → lights/lessons/[lessonId].tsx

**flight-log**
- `/flight-log` → flight-log/index.tsx

**timeline**
- `/timeline` → timeline/index.tsx

**wrapped**
- `/wrapped` → wrapped/index.tsx

**your-story**
- `/your-story` → your-story/index.tsx
- `/your-story/edit/[field]` → your-story/edit/[field].tsx

**patterns**
- `/patterns` → patterns/index.tsx

**insight**
- `/insight/[code]` → insight/[code].tsx

---

## 2. File tree (app/)

```
app/
├── _layout.tsx                    # Root stack
├── index.tsx                      # Redirect (auth / onboarding / (tabs))
│
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
│
├── (tabs)/
│   ├── _layout.tsx                # Tab bar: Cockpit, Signals, People, Tools, Manual, Me (+ hidden talk, circle, lights)
│   ├── index.tsx                  # Cockpit
│   ├── signals.tsx
│   ├── people.tsx
│   ├── tools.tsx                  # Tools tab (grid)
│   ├── learn.tsx                  # Manual tab
│   ├── me.tsx
│   ├── talk.tsx                   # (hidden)
│   ├── circle.tsx                 # (hidden) Mind Mail inbox
│   └── lights.tsx                 # (hidden)
│
├── (modals)/
│   ├── _layout.tsx                # Modal stack
│   ├── onboarding.tsx
│   ├── onboarding-old.tsx
│   ├── mood-checkin.tsx
│   ├── invite-circle.tsx
│   ├── new-journal.tsx
│   ├── role-play.tsx
│   ├── activity.tsx
│   ├── help-someone.tsx
│   ├── cockpit-checkin.tsx
│   ├── quick-log.tsx
│   ├── gauge-detail.tsx
│   ├── body-maintenance.tsx
│   ├── body-maintenance-edit.tsx
│   ├── replay.tsx
│   ├── decode.tsx
│   ├── relate.tsx
│   ├── love.tsx
│   ├── history.tsx
│   ├── features.tsx
│   ├── weekly-insight.tsx
│   ├── resolve.tsx
│   ├── health-connections.tsx
│   ├── oura-connect.tsx
│   ├── notification-settings.tsx
│   ├── heart-inbox.tsx
│   ├── heart-mail-detail.tsx
│   ├── heart-mail-compose.tsx
│   ├── heart-notes.tsx
│   ├── heart-compose.tsx
│   ├── heart-view.tsx
│   ├── awards.tsx
│   ├── awe-activities.tsx
│   ├── crisis-resources.tsx
│   ├── cycle.tsx
│   ├── debrief.tsx
│   ├── drift-detector.tsx
│   ├── identity-setup.tsx
│   ├── learning-style-quiz.tsx
│   ├── patterns.tsx
│   ├── pre-conversation-check.tsx
│   ├── prompt-generator.tsx
│   ├── quick-reset.tsx
│   ├── reach-out-scaffold.tsx
│   ├── red-green-flags.tsx
│   ├── referee.tsx
│   ├── relational-bridge.tsx
│   ├── settings.tsx
│   ├── share-insight.tsx
│   ├── share-snapshot.tsx
│   ├── sovereignty-report.tsx
│   ├── therapist-share.tsx
│   ├── therapist-share-create.tsx
│   ├── foundation-values.tsx
│   ├── foundation-directions.tsx
│   ├── foundation-people.tsx
│   ├── foundation-body.tsx
│   ├── foundation-state.tsx
│   ├── foundation-emotion.tsx
│   ├── attraction.tsx
│   ├── attachment-style.tsx
│   ├── boundaries.tsx
│   ├── difficult-people.tsx
│   ├── critical-thinking.tsx
│   ├── ask-gauge.tsx
│   ├── disclaimer.tsx
│   └── data-use.tsx
│
├── lesson/
│   ├── _layout.tsx
│   └── [id].tsx
│
├── share/
│   ├── _layout.tsx
│   └── cockpit.tsx
│
├── forecast/
│   └── index.tsx
│
├── tools/
│   ├── _layout.tsx
│   ├── quick-reset/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── decision/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   ├── quick.tsx
│   │   └── new.tsx
│   ├── focus/
│   │   ├── index.tsx
│   │   ├── session.tsx
│   │   └── exercise/
│   │       └── [id].tsx
│   ├── creativity/
│   │   ├── index.tsx
│   │   ├── ideas.tsx
│   │   ├── prompt.tsx
│   │   └── unblock.tsx
│   ├── bias-check/
│   │   ├── index.tsx
│   │   ├── library.tsx
│   │   └── library/
│   │       └── [id].tsx
│   ├── win-capture/
│   │   └── index.tsx
│   ├── life-direction-finder/
│   │   └── index.tsx
│   ├── family-conflict/
│   │   └── index.tsx
│   ├── human-roles/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── parent-compass/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── memory-builder/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── add.tsx
│   │   ├── person/
│   │   │   └── [id].tsx
│   │   ├── practice.tsx
│   │   ├── practice/
│   │   │   └── [exercise].tsx
│   │   └── tips.tsx
│   ├── relationship-repair/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── perspective-translator/
│       └── index.tsx
│
├── learn/
│   ├── _layout.tsx
│   ├── manual/
│   │   ├── _layout.tsx
│   │   └── [slug].tsx
│   ├── self-discovery/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── life-literacy/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── relationship-toolkit/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── life-stages/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── questions/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── map.tsx
│   └── skills/
│       ├── index.tsx
│       └── [id].tsx
│
├── profile/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── identity.tsx
│   ├── how-you-connect.tsx
│   ├── what-gives-life.tsx
│   ├── values.tsx
│   ├── sensitive.tsx
│   ├── in-your-own-words.tsx
│   ├── goals.tsx
│   ├── achievements.tsx
│   ├── preferences.tsx
│   ├── human-profile.tsx
│   └── gauges/
│       ├── body.tsx
│       ├── state.tsx
│       ├── emotion.tsx
│       ├── connection.tsx
│       ├── direction.tsx
│       ├── direction-discovery.tsx
│       ├── alignment.tsx
│       └── alignment-discovery.tsx
│
├── habits/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── add.tsx
│   └── [id].tsx
│
├── love/
│   ├── _layout.tsx
│   └── datesume/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── [relationshipId].tsx
│       ├── add-relationship.tsx
│       ├── edit-header.tsx
│       ├── edit-logistics.tsx
│       ├── edit-style.tsx
│       ├── edit-summary.tsx
│       ├── edit-offerings.tsx
│       ├── edit-skills.tsx
│       ├── edit-milestones.tsx
│       ├── edit-growth.tsx
│       ├── edit-testimonials.tsx
│       ├── preview.tsx
│       ├── share.tsx
│       └── edit/
│           ├── _layout.tsx
│           └── good-to-know/
│               ├── _layout.tsx
│               ├── index.tsx
│               ├── love-style.tsx
│               ├── values.tsx
│               ├── conflict.tsx
│               ├── relationships.tsx
│               ├── life-goals.tsx
│               ├── lifestyle.tsx
│               └── attachment.tsx
│
├── love-history/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── add.tsx
│   ├── [id].tsx
│   ├── insights.tsx
│   └── patterns.tsx
│
├── body-maintenance/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── add-routine.tsx
│   ├── add-provider.tsx
│   ├── [routineId].tsx
│   └── providers/
│       └── [id].tsx
│
├── news-my-way/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── settings.tsx
│
├── emergency/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── reach-out.tsx
│   ├── breathe.tsx
│   └── crisis.tsx
│
├── rituals/
│   ├── _layout.tsx
│   ├── pre-flight.tsx
│   ├── post-flight.tsx
│   └── gratitude-review.tsx
│
├── mind-mail/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── compose.tsx
│   ├── [id].tsx
│   └── glimpse-view.tsx
│
├── lights/
│   ├── _layout.tsx
│   ├── [id].tsx
│   ├── add.tsx
│   ├── edit/
│   │   └── [id].tsx
│   ├── radar.tsx
│   ├── world.tsx
│   ├── learn.tsx
│   ├── map.tsx
│   ├── insights.tsx
│   ├── log-entry.tsx
│   ├── tiers/
│   │   ├── five.tsx
│   │   ├── fifteen.tsx
│   │   ├── fifty.tsx
│   │   └── network.tsx
│   ├── family/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [familyId]/
│   │       ├── index.tsx
│   │       ├── settings.tsx
│   │       ├── coordinate.tsx
│   │       └── patterns.tsx
│   └── lessons/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── [lessonId].tsx
│
├── flight-log/
│   ├── _layout.tsx
│   └── index.tsx
│
├── timeline/
│   └── index.tsx
│
├── wrapped/
│   └── index.tsx
│
├── insight/
│   └── [code].tsx
│
├── your-story/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── edit/
│       └── [field].tsx
│
└── patterns/
    └── index.tsx
```

---

## 3. Quick reference: how to open what

| To open… | Use path |
|----------|----------|
| Cockpit (home) | `/(tabs)` or `/(tabs)/` |
| Talk (AI) | `/(tabs)/talk` |
| Mind Mail inbox | `/(tabs)/circle` |
| Full check-in | `/(modals)/cockpit-checkin` |
| Single gauge | `/(modals)/gauge-detail?gauge=body` (body, state, emotion, connection, direction, alignment) |
| Lesson | `/lesson/[lessonId]` |
| Human Skills list | `/learn/skills` |
| Human Skill detail | `/learn/skills/[skillId]` |
| Settings | `/(modals)/settings` |
| Body Maintenance (stack) | `/body-maintenance` |
| Add person (Lights) | `/lights/add` |
| Mind Mail compose | `/mind-mail/compose` |
| Crisis resources | `/(modals)/crisis-resources` |
| Ask Gauge (contextual) | `/(modals)/ask-gauge?contextScreen=...` |

---

## 4. Branded names & plain-language

Use these for UI copy, docs, and handoffs so everyone (and first-time users) know what each name means.

| Branded name | Plain-language description |
|--------------|----------------------------|
| **Cockpit** | Home dashboard — your current state, gauges, and what to do next |
| **Signals** | Insights & predictions — relationship drift, birthdays, what might need attention |
| **Manual** | Learning library — how your system works, lessons, 12 Questions, Human Skills |
| **Mind Mail** | Messages to or from people in your circle (like letters; can be anonymous or glimpse) |
| **Lights** | People in your life, grouped by closeness (Your 5, 15, 50, network) |
| **Flight Log** | Timeline of Pre-Flight and Post-Flight rituals (before/after moments) |
| **Wrapped** | Your year in review — patterns and progress over time |
| **Your Story** | Your origins, culture, upbringing, and identity in your words |
| **Patterns** | AI-derived insights from your check-ins and usage (reflective, not diagnostic) |
| **Check-in** | Rating your six gauges (Body, State, Emotion, Connection, Direction, Alignment) |
| **Talk** | Voice-first AI companion (Gauge) — conversation, not therapy or crisis care |
| **Ask Gauge** | Quick contextual prompt to the AI from any screen (FAB) |
| **Crisis** | 988, Crisis Text Line, and safety resources — not in-app crisis intervention |
| **Settings** | Account, privacy, notifications, API key, appearance, legal links |
| **Lessons** | Single learning units inside the Manual (read + reflect) |
| **Habits** | Tracked habits and routines |
| **Body Maintenance** | Self-care schedule (routines, providers) — educational, not medical advice |

---

## 5. Modal discipline rule

A screen should remain in **`(modals)`** only if it:

- takes under ~60 seconds to complete,
- has minimal branching,
- does not store complex or domain-specific data,
- and is **not** a core feature.

Everything else should be a **real route** under the appropriate domain (e.g. `tools/decode/`, `insights/patterns/`, `body/maintenance/`). Modals can act as **launchers** that navigate into those routes. Full domain structure and migration plan: [INGAUGE-ARCHITECTURE-ORGANIZATION.md](./INGAUGE-ARCHITECTURE-ORGANIZATION.md).

---

## 6. Domain ownership & migration plan

**Target domain layout** and which routes/screens belong in which domain are defined in [INGAUGE-ARCHITECTURE-ORGANIZATION.md](./INGAUGE-ARCHITECTURE-ORGANIZATION.md). That doc also contains the **KEEP / MOVE / MERGE / REMOVE** checklist for migrating from the current `(modals)`-heavy structure to the long-term domain-based layout (Cockpit, Signals, People, Tools, Manual, Me, Insights, Body, Emergency, Rituals).

Use the route map above for current URLs and file tree; use the architecture-organization doc for ownership and migration steps.
