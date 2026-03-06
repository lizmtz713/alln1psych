# Signals Merge — Architecture Audit & Refactor Plan

## 1. Current Architecture Audit

### 1.1 Tab Bar (app/(tabs)/_layout.tsx)
- **6 tabs:** Home, InGauge (Talk), **Mind Mail** (circle), Explore, **Lights**, Me.
- **Mind Mail tab** → route `circle`, file `app/(tabs)/circle.tsx`, title "Mind Mail".
- **Lights tab** → route `lights`, file `app/(tabs)/lights.tsx`, title "Lights".

### 1.2 Mind Mail (Relationship Action / Messaging)
- **Tab content:** `app/(tabs)/circle.tsx` — Connections | Messages toggle; DailyConnectionPrompt; ConnectionsList; Inbox/Sent/Drafts/Archive.
- **Stack (root):** `app/mind-mail/` — index, compose, [id], glimpse-view; used when navigating to compose/detail/glimpse.
- **Stores:** mindMailStore (re-exports heartNotesStore), heartNotesStore.
- **Components:** mind-mail/* (IntentSelector, GuidedPrompts, PostSendReinforcement, ConnectionsList, DailyConnectionPrompt, MindMailExplainer), mindmail/* (safety: CrisisIntervention, EmotionalSafetyCheck, CooldownTimer, ContentWarning, MessageActions).
- **Services:** mindMailSafetyService, heartNotesAI, voiceStorage.
- **Types:** mindMail.ts (MindMailIntent, MIND_MAIL_INTENTS, etc.).

### 1.3 Lights (Relationship Awareness)
- **Tab content:** `app/(tabs)/lights.tsx` — Dunbar tiers (5/15/50/150), search, Constellation/Map/World cards, "Reach out today" strip, tier health bars, person rows, science footer.
- **Stack (root):** `app/lights/` — _layout, radar (Constellation), map, world, add, [id], log-entry, learn, lessons/*, family/*, tiers/*.
- **Stores:** circleStore (members, temperatures), lightsStore (tierByMemberId, lastContactByMemberId, connectionLogByMemberId, lightExtrasByMemberId; computeLights, setTier, recordConnection, logContact, addLight, removeLight).
- **Components:** lights/* (ConstellationRadar, ConstellationTimeline, ConstellationPersonCard, LightsConstellation, LightsMapSnapshot, etc.), circle/TemperatureGauge, PersonLight.
- **Services:** friendshipMaintenance (getDailyReachOuts, getLightBrightness, getTierHealth, IDEAL_CONTACT_DAYS, etc.), forecastService, wrappedDataCollector.
- **Types:** lights.ts (Light, LightTier, ConnectionEntry, etc.).

### 1.4 Shared / Overlap
- **Circle members** = source of truth for “people”; circleStore.members used by both.
- **Lights** = circle members + lightsStore state (tiers, lastContact, connectionLog) → computeLights().
- **Daily “who to reach out to”** = getDailyReachOuts(lights) — used by DailyConnectionPrompt (Mind Mail) and Lights “Reach out today”.
- **dailyAnchorsStore** = connectionPromptActedOn, completeConnectionPrompt (used after sending from Connections flow).
- **Navigation cross-links:** lights/[id] has “Mind Mail” → /mind-mail/compose; ConnectionPromptCard (home) → lights/log-entry or reach-out-scaffold; DailyConnectionPrompt → mind-mail/compose.

### 1.5 Dunbar Model (Current)
- Tiers: five (5), fifteen (15), fifty (50), network (150), archived.
- Stored in lightsStore.tierByMemberId; not additive — nested layers within ~150 total.
- friendshipMaintenance: IDEAL_CONTACT_DAYS, getLightBrightness, getTierHealth, getDailyReachOuts.

---

## 2. Refactor Plan

### 2.1 Goal
One **Signals** tab that is the single relationship hub: awareness + action in one place. No separate Lights or Mind Mail tabs.

### 2.2 High-Level Steps
1. **Rename and merge tab entry:** One tab “Signals” pointing to a new unified screen.
2. **Unified hub screen structure:**
   - Header: “Signals” + optional subtitle; search/filter/more.
   - Today’s Focus / Hero: one recommended action (reuse DailyConnectionPrompt + getDailyReachOuts).
   - Relationship Signals Snapshot: short strip (e.g. “3 need attention, 5 warm, 2 drifting”).
   - Constellation: card linking to /lights/radar (or embedded later).
   - People list: single list with sort (needs attention, Inner 5, Close 15, etc.), temperature/signal, quick actions; tap → person detail.
   - Person detail: bottom sheet or push to /lights/[id] (preserve existing).
   - Transmit: open /mind-mail/compose (or sheet) with recipient/intent pre-set when coming from hero or row.
3. **Keep existing stacks:** /lights/* and /mind-mail/* remain; deep links and flows unchanged.
4. **Preserve all stores and services:** circleStore, lightsStore, mindMailStore, heartNotesStore, friendshipMaintenance, etc.
5. **Copy/naming:** Prefer “Transmit” for the send action where it fits; keep “Mind Mail” for inbox/messages where clarity is needed. Hero and list use warm, non-shaming copy.

### 2.3 File Strategy
- **New:** `app/(tabs)/signals.tsx` — unified hub (replaces what circle and lights tabs showed).
- **Remove from tab bar:** `circle`, `lights` (files can remain for redirects or be deleted after signals is canonical).
- **Update:** `app/(tabs)/_layout.tsx` — remove two tabs, add one “Signals” tab.
- **Reuse:** All lights/* and mind-mail/* routes; all components (DailyConnectionPrompt, ConnectionsList, Constellation card, getDailyReachOuts, tier list, etc.) composed into signals.tsx or subcomponents.
- **New components (optional):** RelationshipHubHeader, TodaysConnectionHeroCard, RelationshipSignalsStrip, RelationshipListSection — can be inline in signals.tsx first, then extracted.

### 2.4 Success Criteria
- User sees one “Signals” tab.
- From one screen: see who matters, who needs attention, take action (Transmit / Check in / Log contact).
- No “do I go to Lights or Mind Mail?”.
- 5/15/50/150 and all existing features preserved underneath.

---

## 3. Implementation Status

- [x] Tab layout: one Signals tab (circle + lights hidden via `href: null`)
- [x] Unified hub: Header, Hero (DailyConnectionPrompt), Signals strip, Constellation card, People list
- [x] Person detail: tap row → push to `/lights/[id]` (existing screen)
- [x] Transmit: hero + row "Transmit" → `/mind-mail/compose` with optional recipient, `from: 'connections'`
- [x] Messages/Inbox: header mail icon → `/mind-mail` (stack index)
- [x] Reused stores/services: circleStore, lightsStore, dailyAnchorsStore, getDailyReachOuts, getTierHealth, getLightBrightness, BRIGHTNESS_CONFIG, DailyConnectionPrompt
- [ ] Person sheet (bottom sheet) — optional later
- [ ] Transmit composer inline/sheet — optional later

### File-by-File Changes

| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | Replaced Mind Mail + Lights tabs with one Signals tab; added `signals` color; circle + lights screens hidden with `href: null` |
| `app/(tabs)/signals.tsx` | **New** — unified hub: Header, Hero, Signals strip, Constellation card, People list (sort: needs attention / by circle), More (Map, World temp, Learn) |
| `app/(tabs)/circle.tsx` | Unchanged; still exists, hidden from tab bar |
| `app/(tabs)/lights.tsx` | Unchanged; still exists, hidden from tab bar |
| `docs/ingauge-SIGNALS-MERGE-AUDIT-AND-PLAN.md` | **New** — audit + plan + status |

### Legacy vs Migrated

- **Fully in use from Signals:** Hero (DailyConnectionPrompt), people list (lights + tier/attention), Constellation → radar, Transmit → compose, Inbox → mind-mail.
- **Legacy (still reachable):** Full Lights screen at `(tabs)/lights` (e.g. deep link); full Mind Mail inbox at `(tabs)/circle` or `/mind-mail`. All `/lights/*` and `/mind-mail/*` routes unchanged.
- **Not removed:** No stores or services removed; all preserved.

---

## 4. Reused Stores & Services (No Rewrite)

| Area | Store / Service | Use in Signals Hub |
|------|-----------------|---------------------|
| People | circleStore | members, temperatures |
| Tiers & contact | lightsStore, computeLights | people list, hero, signals strip |
| Reach-out logic | getDailyReachOuts, getTierHealth, getLightBrightness | hero card, strip, sorting |
| Messaging | mindMailStore, heartNotesStore | Transmit, Inbox |
| Daily prompt | dailyAnchorsStore | hero “acted on” state |
| Safety | mindMailSafetyService | unchanged in compose |

---

## 5. Blockers & Assumptions

- **Assumption:** Root stacks `mind-mail` and `lights` stay as-is; no route renames required for first pass.
- **Assumption:** Person detail can stay full-screen `/lights/[id]` for now; bottom sheet can be a later enhancement.
- **Assumption:** “Signals” is the tab name; “Transmit” used for the send action in UI copy where appropriate.
- **Blocker:** None identified; refactor is additive (new screen + tab layout change) then deprecate old tab screens.

---

## 6. Recommended Next Steps After First Pass

1. Add bottom sheet for person detail (optional) and/or Transmit composer inline.
2. Progressive disclosure: hide advanced (family, tiers, world temp, learn) under “More” or expandable sections.
3. Naming consistency: “Transmit” vs “Mind Mail” in UI copy.
4. Analytics: track usage of hero card, list sort, and Transmit from hub.
