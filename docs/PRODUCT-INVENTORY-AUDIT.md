# InGauge Product Inventory Audit

**Generated:** Full codebase audit.  
**Tabs (Human OS):** Cockpit, Signals, People, Tools, Manual, Me.  
**Hidden tab routes:** Talk, Circle (Mind Mail), Lights (reachable via deep link or in-app nav).

---

## 1. Tabs, pages, routes, and subpages (complete list)

### Root-level stack screens (app/_layout.tsx)
| Route/Group | Purpose |
|-------------|---------|
| `index` | Redirect: auth → sign-in, else onboarding or (tabs) |
| `(auth)` | sign-in, sign-up |
| `(tabs)` | Main 6 tabs + 3 hidden |
| `(modals)` | All modal screens (see below) |
| `lesson` | lesson/[id] — single lesson + reflection |
| `share` | share/cockpit, etc. |
| `forecast` | forecast/index — Human Weather |
| `tools` | tools/* (quick-reset, decision, focus, etc.) |
| `learn` | learn/* (manual, skills, questions, etc.) |
| `profile` | profile/* (identity, values, goals, achievements, gauges, preferences) |
| `habits` | habits/* |
| `love` | love/* (datesume, edit) |
| `love-history` | love-history/index + patterns |
| `body-maintenance` | body-maintenance/* (routines, providers) |
| `news-my-way` | news-my-way/index |
| `emergency` | emergency/index, reach-out |
| `rituals` | rituals/pre-flight, post-flight, gratitude-review |
| `mind-mail` | mind-mail/index, [id], compose, glimpse-view |
| `lights` | lights/* (add, edit, tiers, family, radar, world, learn, lessons, map, insights, log-entry) |
| `flight-log` | flight-log/index |
| `timeline` | timeline/index |
| `wrapped` | wrapped/index |
| (implicit) | insight/[code] — shared insight view |

### Tab screens (app/(tabs)/)
| Tab | Route | Purpose |
|-----|--------|---------|
| Cockpit | `index` | Home: gauges, suggestions, activities, tools, share |
| Signals | `signals` | Insights & predictions, relationship drift, check-in CTA |
| People | `people` | Relationship ring, tiers, Transmit, add person, Mind Mail CTA |
| Tools | `tools` | Tool grid by situation (Essential 7 + sections) |
| Manual | `learn` | Human Manual: gauges, library, lessons, skills, 12 Questions |
| Me | `me` | Identity, system, insights, goals, share, data, settings, safety |
| (hidden) | `talk` | Voice-first AI (Gauge) — linked from FAB, activities, gauge detail |
| (hidden) | `circle` | Mind Mail Inbox (Inbox/Sent/Drafts/Archive) |
| (hidden) | `lights` | Lights tier list, radar, world, add — same content as People but full-screen |

### Modal screens (app/(modals)/)
All below are Stack.Screen in (modals)/_layout.tsx.

- onboarding, onboarding-old, mood-checkin, invite-circle, new-journal, role-play, activity, help-someone, cockpit-checkin, quick-log, gauge-detail, body-maintenance, body-maintenance-edit, replay, decode, relate, love, history, features, weekly-insight, resolve, health-connections, oura-connect, notification-settings, heart-inbox, heart-mail-detail, heart-mail-compose, awards, awe-activities, crisis-resources, cycle, debrief, drift-detector, identity-setup, learning-style-quiz, patterns, pre-conversation-check, prompt-generator, quick-reset (modal), reach-out-scaffold, referee, relational-bridge, settings, share-insight, share-snapshot, sovereignty-report, therapist-share, therapist-share-create, heart-notes, foundation-values, foundation-directions, foundation-people, foundation-body, foundation-state, foundation-emotion, attraction, attachment-style, boundaries, difficult-people, critical-thinking, red-green-flags, ask-gauge, disclaimer, data-use.

### Nested routes (by group)
- **learn/** — _layout, self-discovery, life-literacy, relationship-toolkit, life-stages, manual/[slug], questions, questions/map, skills, skills/[id].
- **tools/** — quick-reset, quick-reset/[id], decision, decision/[id], decision/quick, decision/new, focus, focus/exercise/[id], focus/session, creativity, creativity/ideas, creativity/prompt, creativity/unblock, bias-check, bias-check/library, bias-check/library/[id], win-capture, life-direction-finder, family-conflict, human-roles, human-roles/[id], parent-compass, parent-compass/[id], memory-builder (+ person/[id], practice, practice/[exercise], tips), relationship-repair, perspective-translator.
- **profile/** — index, identity, how-you-connect, what-gives-life, values, sensitive, in-your-own-words, gauges (body, state, emotion, connection, direction, alignment, direction-discovery, alignment-discovery), goals, achievements, preferences, human-profile.
- **love/** — datesume (index, share, preview), datesume/edit, datesume/edit/good-to-know (index, love-style, values, conflict, relationships).
- **lights/** — add, edit/[id], [id], tiers (five, fifteen, fifty, network), family (index, create, [familyId]/settings, [familyId]/coordinate), radar, world, learn, lessons/[lessonId], map, insights, log-entry.
- **body-maintenance/** — index, [id] (routine detail?), add-routine, providers, providers/[id], add-provider.
- **rituals/** — pre-flight, post-flight, gratitude-review.
- **mind-mail/** — index, [id], compose, glimpse-view.
- **emergency/** — index, reach-out.
- **share/** — cockpit (and possibly others).
- **your-story/** — index (referenced from Me → Your Story).

---

## 2. Master table: current feature → location → purpose → status → recommended tab → action

| Current feature name | Current location | Purpose | Status | Recommended new tab | Action |
|---------------------|------------------|---------|--------|---------------------|--------|
| **Cockpit (Home)** | (tabs)/index | Gauges, suggestions, activities, quick actions, share | Active | Cockpit | Keep |
| **Signals** | (tabs)/signals | Relationship drift, birthdays, social health, predictions, check-in CTA | Active | Signals (CoPilot awareness) | Keep |
| **People** | (tabs)/people | Relationship ring, tiers, Transmit, add person, links to Lights/Mind Mail | Active | People | Keep |
| **Tools (tab)** | (tabs)/tools | Situation-first tool grid (Essential 7 + sections) | Active | Tools | Keep |
| **Manual (Learn tab)** | (tabs)/learn | Human Manual: 6 gauges, library, lessons, skills, 12 Questions | Active | Manual | Keep |
| **Me** | (tabs)/me | Identity, system, insights, goals, share, data, settings, safety | Active | Me | Keep |
| **Ask Gauge (FAB)** | (modals)/ask-gauge | Contextual AI prompt from any tab | Active | CoPilot (FAB) | Keep |
| **Talk (AI)** | (tabs)/talk (hidden) | Voice-first AI companion | Active | CoPilot | Keep; consider surfacing in nav or FAB |
| **Circle / Mind Mail** | (tabs)/circle (hidden) | Inbox, Sent, Drafts, Archive | Active | People | Move: make Mind Mail primary from People; keep Circle as alias or merge into People |
| **Lights** | (tabs)/lights (hidden) + lights/* | Tier list, radar, world, add, edit, family | Active | People | Merge: People already shows lights; ensure one entry point (People) to full Lights stack |
| **Check-in (Cockpit)** | (modals)/cockpit-checkin | Full 6-gauge check-in | Active | Cockpit | Keep |
| **Mood check-in** | (modals)/mood-checkin | Quick mood popup | Active | Cockpit | Keep |
| **Quick log** | (modals)/quick-log | Fast log from Cockpit | Active | Cockpit | Keep |
| **Gauge detail** | (modals)/gauge-detail | Single gauge explanation + actions | Active | Cockpit / Manual | Keep |
| **Activity (breathing, gratitude, etc.)** | (modals)/activity | Multi-activity modal (breathing, gratitude, emotion match, etc.) | Active | Cockpit / Tools | Keep |
| **Share cockpit** | share/cockpit | Share cockpit snapshot | Active | Cockpit | Keep |
| **Share insight** | (modals)/share-insight | Share AI/lesson insight | Active | Cockpit / Me | Keep |
| **Share snapshot** | (modals)/share-snapshot | Share current state | Active | Me | Keep |
| **Forecast (Human Weather)** | forecast/index | How you'll likely feel tomorrow | Active | Signals / Me | Keep; link from Me + Signals |
| **Timeline** | timeline/index | Life record, patterns over time | Active | Me | Keep |
| **Flight log** | flight-log/index | Pre-Flight & Post-Flight timeline | Active | Me | Keep |
| **Patterns & insights** | (modals)/patterns | Pattern insights (AI) | Active | Me / Signals | Keep |
| **Check-in history** | (modals)/history | Past check-ins | Active | Me | Keep |
| **Weekly insight** | (modals)/weekly-insight | Weekly insight modal | Active | Cockpit / Signals | Keep (linked from WeeklyInsightCard) |
| **Life Wrapped** | wrapped/index | Year in review | Active | Me | Keep |
| **Decode** | (modals)/decode | Analyze message, get response options | Active | Tools | Keep |
| **Resolve** | (modals)/resolve | Internal conflict (IFS-style) | Active | Tools | Keep |
| **Role-play** | (modals)/role-play | Conversation simulation | Active | Tools | Keep |
| **Replay** | (modals)/replay | Replay conversation with different response | Active | Tools | Keep |
| **Relate** | (modals)/relate | Personology / perspective | Active | Tools / People | Keep |
| **Referee** | (modals)/referee | Mediate two sides | Active | Tools | Keep |
| **Relationship Repair** | tools/relationship-repair | Step-by-step repair | Active | Tools | Keep |
| **Perspective Translator** | tools/perspective-translator | Rephrase for another perspective | Active | Tools | Keep |
| **Pre-Check** | (modals)/pre-conversation-check | Pre-conversation prep | Active | Tools | Keep |
| **Reach out** | (modals)/reach-out-scaffold | Scaffolded reach-out | Active | Tools / People | Keep |
| **Boundaries** | (modals)/boundaries | Boundaries tool | Active | Tools | Keep |
| **Difficult people** | (modals)/difficult-people | Difficult people guidance | Active | Tools | Keep |
| **Red/Green flags** | (modals)/red-green-flags | Relationship flags | Active | Tools | Keep |
| **Critical thinking** | (modals)/critical-thinking | Think through situations | Active | Tools | Keep |
| **Human Roles** | tools/human-roles | Human roles education | Active | Tools / Manual | Keep |
| **Family conflict** | tools/family-conflict | Family conflict steps | Active | Tools | Keep |
| **Parent Compass** | tools/parent-compass | Parent guidance | Active | Tools | Keep |
| **Memory Builder** | tools/memory-builder | People + practice | Active | Tools | Keep |
| **Attachment style** | (modals)/attachment-style | Attachment education | Active | Tools / Manual | Keep |
| **Attraction** | (modals)/attraction | Attraction education | Active | Tools / Manual | Keep |
| **Help someone** | (modals)/help-someone | Help someone else | Active | Tools | Keep |
| **Crisis resources** | (modals)/crisis-resources | 988, Crisis Text Line, etc. | Active | Me / Tools | Keep |
| **Quick Reset (full)** | tools/quick-reset | List of exercises + [id] | Active | Tools | Keep |
| **Quick Reset (in-context)** | (modals)/quick-reset | 2-min reset from StabilizationBanner / decode / role-play etc. | Active | Tools | Keep (different use: in-flow reset vs browse) |
| **Decision** | tools/decision | Decision pathway | Active | Tools | Keep |
| **Bias Check** | tools/bias-check | Bias library & check | Active | Tools | Keep |
| **Focus** | tools/focus | Focus sessions | Active | Tools | Keep |
| **Creativity** | tools/creativity | Creativity tools | Active | Tools | Keep |
| **Win capture** | tools/win-capture | Capture wins | Active | Tools | Keep |
| **Life Direction Finder** | tools/life-direction-finder | Life direction | Active | Tools / Manual | Keep |
| **Self-Discovery** | learn/self-discovery | Self-discovery flow | Active | Manual | Keep |
| **Learning style quiz** | (modals)/learning-style-quiz | Learning style | Active | Manual / Tools | Keep |
| **Awe activities** | (modals)/awe-activities | Awe prompts | Active | Tools / Manual | Keep |
| **Prompt generator** | (modals)/prompt-generator | Conversation prompts | Active | Tools / CoPilot | Keep |
| **Drift detector** | (modals)/drift-detector | Relationship drift | Active | Tools / People | Keep |
| **Foundation Body/State/Emotion** | (modals)/foundation-* | Foundation gauges (body, state, emotion) | Active | Manual / Settings | Keep (Settings links) |
| **Body Maintenance (modal)** | (modals)/body-maintenance | Schedule by category (mark done) | Active | Me / Tools | Merge: see below |
| **Body Maintenance (stack)** | body-maintenance/* | Routines + providers, sub-routes | Active | Me / Tools | Merge: one Body Maintenance — prefer stack (full UX) from Me/Tools; modal can redirect to stack or be removed |
| **Body Maintenance edit** | (modals)/body-maintenance-edit | Edit schedule item | Active | Me / Tools | Keep (or move into stack flow) |
| **Love (modal)** | (modals)/love | Love / relationship content | Active | Tools | Keep |
| **Datesume** | love/datesume | AI date summary | Active | Me / People | Keep |
| **Love History** | love-history/* | Relationship timeline & patterns | Active | Me / People | Keep |
| **Rituals** | rituals/* | Pre-Flight, Post-Flight, gratitude | Active | Me / Cockpit | Keep |
| **Habits** | habits/* | Habits list | Active | Me / Cockpit | Keep |
| **News My Way** | news-my-way/index | Capacity-aware news | Active | Me | Keep |
| **Apple Health** | (modals)/health-connections | Health integrations | Active | Me | Keep |
| **Oura connect** | (modals)/oura-connect | Oura Ring | Active | Me | Keep |
| **Therapist Share** | (modals)/therapist-share, therapist-share-create | Wellness reports | Active | Me | Keep |
| **Sovereignty Report** | (modals)/sovereignty-report | Full system overview | Active | Me | Keep |
| **Lessons (Manual)** | lesson/[id] | Single lesson + reflection | Active | Manual | Keep |
| **Manual (library)** | learn/manual/[slug] | Manual article by slug | Active | Manual | Keep |
| **12 Life Questions** | learn/questions | 12 questions map | Active | Manual | Keep |
| **Human Skills** | learn/skills, learn/skills/[id] | 16 skills, levels, XP | Active | Manual | Keep |
| **Life literacy** | learn/life-literacy | Life literacy modules | Active | Manual | Keep |
| **Relationship toolkit** | learn/relationship-toolkit | Relationship education | Active | Manual | Keep |
| **Life stages** | learn/life-stages | Life stages | Active | Manual | Keep |
| **Onboarding** | (modals)/onboarding | First-time setup | Active | — | Keep |
| **Onboarding (old)** | (modals)/onboarding-old | Legacy onboarding | Incomplete / unused | — | Remove or archive |
| **Settings** | (modals)/settings | All app settings, privacy, BYOK, appearance | Active | Me | Keep |
| **Identity setup** | (modals)/identity-setup | Name, avatar, temperature | Active | Me | Keep |
| **Disclaimer** | (modals)/disclaimer | Legal disclaimer + links | Active | Me | Keep |
| **Data use** | (modals)/data-use | How data is used | Active | Me | Keep |
| **Profile (Me)** | profile/index | Profile home | Active | Me | Keep |
| **Human Profile** | profile/human-profile | Life blueprint | Active | Me | Keep |
| **Your Story** | your-story/index | Origins, culture, upbringing | Active | Me | Keep |
| **Identity** | profile/identity | Body, disability, gender | Active | Me | Keep |
| **How you connect** | profile/how-you-connect | Love language, communication | Active | Me | Keep |
| **What gives life** | profile/what-gives-life | Interests, meaning | Active | Me | Keep |
| **Personal values** | profile/values | Values | Active | Me | Keep |
| **Sensitive topics** | profile/sensitive | Triggers, careful areas | Active | Me | Keep |
| **In your own words** | profile/in-your-own-words | What makes you different | Active | Me | Keep |
| **Profile gauges** | profile/gauges/* | Per-gauge config | Active | Me | Keep |
| **Goals** | profile/goals | Active goals | Active | Me | Keep |
| **Achievements** | profile/achievements | Achievements list | Active | Me | Keep |
| **Preferences** | profile/preferences | Notifications, check-in, AI | Active | Me | Keep |
| **Awards (modal)** | (modals)/awards | Awards/milestones screen | Duplicate | Me | Merge: Me links to profile/achievements; either link to (modals)/awards or remove awards modal and use profile/achievements only |
| **Features (modal)** | (modals)/features | "Features coming soon" placeholder | Unused | — | Remove (no in-app link) or repurpose |
| **Invite Circle** | (modals)/invite-circle | Invite to circle | Unused / legacy? | People | Check: if Circle is Mind Mail, invite may be for old temperature circle; link from People if still needed |
| **Heart inbox / mail** | (modals)/heart-inbox, heart-mail-* | Heart mail (legacy naming?) | Unused from main nav | People | Clarify: if same as Mind Mail, Circle tab is the inbox; remove duplicate modals or link from People |
| **Heart notes** | (modals)/heart-notes | Notes | Unused? | People / Me | Audit: link from Me or People if needed; else remove |
| **New journal** | (modals)/new-journal | New journal entry | Active | Me / Cockpit | Keep |
| **Debrief** | (modals)/debrief | Post-conversation debrief | Active | Tools | Keep (e.g. after role-play) |
| **Relational bridge** | (modals)/relational-bridge | Bridge two people | Active | Tools / People | Keep |
| **Cycle** | (modals)/cycle | Cycle intelligence | Active | Me | Keep |
| **Notification settings** | (modals)/notification-settings | Notification prefs | Active | Me | Keep (or fold into Settings) |
| **Emergency** | emergency/index, reach-out | Crisis reach-out flow | Active | Me / Tools | Keep |
| **Insight (shared)** | insight/[code] | Public shared insight view | Active | — | Keep |
| **Sign-in / Sign-up** | (auth)/sign-in, sign-up | Auth | Active | — | Keep |

---

## 3. Duplicate or overlapping features

| Issue | Locations | Recommendation |
|-------|-----------|----------------|
| **Body Maintenance** | (modals)/body-maintenance (category schedule) vs body-maintenance/* (routines + providers) | **Merge:** Use one product. Prefer stack `body-maintenance/` as primary; have Me and gauge-detail open `/body-maintenance`. Modal can redirect to stack or be removed after migration. |
| **Awards vs Achievements** | (modals)/awards vs profile/achievements | **Merge:** One destination. Either (1) Me → "Awards & Achievements" goes to (modals)/awards and deprecate profile/achievements, or (2) Me goes to profile/achievements and remove (modals)/awards. Prefer single profile/achievements and delete modal if content is redundant. |
| **Quick Reset** | tools/quick-reset (full list) vs (modals)/quick-reset (2-min in-context) | **Keep both:** Modal = in-flow stabilization from other tools; stack = full exercise list. No merge. |
| **Talk vs Ask Gauge** | (tabs)/talk (full screen) vs (modals)/ask-gauge (contextual prompt) | **Keep both:** Talk = full AI; Ask Gauge = quick prompt from context. No merge. |
| **Circle vs People vs Lights** | (tabs)/circle = Mind Mail; (tabs)/people = relationship ring; (tabs)/lights = tier list | **Clarify:** People is main relationship hub; Circle is Mind Mail inbox (hidden tab); Lights is full tier/lights stack. Consider: Mind Mail as primary entry from People; Lights as "See all" from People. One entry to "Lights" stack from People. |
| **Heart inbox / heart-mail / heart-notes** | heart-inbox, heart-mail-detail, heart-mail-compose, heart-notes | **Audit:** If these are legacy names for Mind Mail, consolidate to Mind Mail (Circle tab) and remove duplicate modal routes or redirect to mind-mail. If separate, add clear entry from Me or People. |

---

## 4. Broken, unused, hidden, or incomplete

| Item | Type | Recommendation |
|------|------|----------------|
| **(modals)/features** | Unused (placeholder "Features coming soon", no nav) | Remove from layout or repurpose; no in-app link. |
| **(modals)/onboarding-old** | Legacy / incomplete | Remove from modal layout and nav, or keep only for internal/testing. |
| **profile/identity** (and other profile sub-routes) | May 404 if route missing | Verified: profile has identity, how-you-connect, etc. in _layout — OK. |
| **invite-circle** | Unused from main nav (only in circle.backup) | If invite is for temperature circle, add link from People or Circle; else remove. |
| **Talk tab** | Hidden (href: null) | By design; keep. Ensure deep links and "Talk to Gauge" always open (tabs)/talk. |
| **Circle tab** | Hidden | By design; Mind Mail. Consider "Mind Mail" entry from People that pushes Circle or mind-mail. |
| **Lights tab** | Hidden | By design; People links to lights/add, lights/learn, lights/radar, lights/world. Full lights stack is root-level. OK. |

---

## 5. Repeated links or unnecessary navigation

| Observation | Recommendation |
|-------------|----------------|
| **Me → Settings** | Multiple items (Appearance, Privacy, Upgrade, BYOK, Account) all open (modals)/settings. | Keep; single settings modal with sections. |
| **Me → Goals** | "Active Goals", "Goal Setter", "Review & Reflect" all go to profile/goals. | Keep or collapse to one "Goals" row. |
| **Body Maintenance** | Me → Body Maintenance → /body-maintenance; profile/gauges/body → /body-maintenance; gauge-detail → (modals)/body-maintenance. | Unify to /body-maintenance (stack) everywhere. |
| **Apple Health vs Apple Watch** | Both open health-connections. | Keep; same screen, two entry points for clarity. |
| **Crisis** | Tools (Essential 7) + Me (Crisis Support 988). | Keep both; 988 is quick call, Crisis is full resources. |

---

## 6. Recommended tab mapping (Cockpit, CoPilot, People, Tools, Manual, Me)

| Tab | Contains |
|-----|----------|
| **Cockpit** | Home, check-in (cockpit + mood), quick log, gauge detail, activities, share cockpit/insight, forecast card, weekly insight, suggestions. |
| **CoPilot** | Ask Gauge (FAB), Talk (hidden tab), prompt generator; awareness layer = Signals (drift, predictions). |
| **People** | People tab (ring, tiers, Transmit), Mind Mail (Circle), Lights (add, radar, world, learn), invite (if kept), Relate/Personology. |
| **Tools** | All situation tools: Decode, Resolve, Role-play, Replay, Referee, Relationship Repair, Reach out, Pre-Check, Boundaries, Difficult people, Flags, Critical thinking, Human Roles, Family conflict, Parent Compass, Memory Builder, Perspective Translator, Attachment, Attraction, Help someone, Crisis, Quick Reset, Decision, Bias Check, Focus, Creativity, Win capture, Life Direction, Self-Discovery, Learning style, Awe, Drift detector, Body (foundation), Body Maintenance, Love, Debrief, Relational bridge. |
| **Manual** | Human Manual (gauges, library), Lessons, 12 Questions, Human Skills, Life literacy, Relationship toolkit, Life stages, Self-Discovery (or link from Tools). |
| **Me** | Identity, profile (human profile, story, identity, how you connect, what gives life, values, sensitive, in your own words), gauges config, Patterns, History, Timeline, Flight log, Forecast, Wrapped, Body Maintenance, Datesume, Love History, Cycle, Awards/Achievements, Goals, Therapist Share, Sovereignty Report, Share Snapshot, News My Way, Health/Oura, Notifications, Settings (appearance, privacy, BYOK, account), Safety (988, Help, Feedback, Redo onboarding, Privacy policy, Terms), Disclaimer. |

---

## 7. Reorganization plan (no deletion of important functionality)

1. **Single Body Maintenance**  
   - Make `body-maintenance/` (stack) the only entry.  
   - Me → "Body Maintenance" → `/body-maintenance`.  
   - gauge-detail and Tools → `/body-maintenance` (not modal).  
   - (modals)/body-maintenance: redirect to `/body-maintenance` or remove after migration.  
   - (modals)/body-maintenance-edit: keep for edit flow or move into body-maintenance stack.

2. **Single achievements entry**  
   - Me → "Awards & Achievements" → `profile/achievements` only.  
   - Remove (modals)/awards from layout and nav, or redirect to profile/achievements.

3. **Quick Reset**  
   - Primary entry for "do a Quick Reset" → `tools/quick-reset`.  
   - Keep (modals)/quick-reset for in-context 2-min reset (StabilizationBanner, decode, role-play, etc.).

4. **Features modal**  
   - Remove (modals)/features from layout, or repurpose as "What’s new" / changelog and link from Me.

5. **Onboarding-old**  
   - Remove from (modals)/_layout and any nav; keep file for reference or delete.

6. **Invite Circle**  
   - If still used for temperature/circle invites: add explicit link from People (or Circle).  
   - If obsolete: remove from layout.

7. **Heart inbox / heart-mail / heart-notes**  
   - If same as Mind Mail: use Mind Mail (Circle) as single inbox; redirect or remove heart-* modals.  
   - If different: document and add one entry from Me or People.

8. **Navigation clarity**  
   - People: one clear "Mind Mail" that opens Circle (or mind-mail).  
   - People: one "See all" or "Lights" that opens full lights stack.  
   - No duplicate "Lights" and "People" content without clear role.

9. **Talk**  
   - Keep hidden tab; ensure FAB and all "Talk to Gauge" links go to (tabs)/talk.  
   - Optional: add "Talk" to Me or Cockpit as secondary entry.

10. **Settings**  
    - Keep single (modals)/settings; all Me settings items open it. Optional: in-settings section for Legal (Disclaimer, Data use) if you want fewer top-level Me rows.

---

## 8. Summary table (action only)

| Action | Items |
|--------|--------|
| **Keep** | Cockpit, Signals, People, Tools, Manual, Me, Talk, Circle, Lights, Ask Gauge, all active modals and stack screens listed as Active above. |
| **Merge** | Body Maintenance (one stack), Awards → profile/achievements. |
| **Move** | Mind Mail entry from hidden Circle to People; Lights "See all" from People. |
| **Rename** | Optional: "Circle" → "Mind Mail" in any user-facing label. |
| **Remove** | (modals)/features (or repurpose), (modals)/onboarding-old; (modals)/awards if merged into profile/achievements. |
| **Redirect** | (modals)/body-maintenance → /body-maintenance; heart-* → Mind Mail if same product. |

This audit gives a single reference for every route, feature, and recommended change without removing important functionality.
