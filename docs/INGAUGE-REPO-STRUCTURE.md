# InGauge Repository Structure

Recommended layout so the project stays organized as it grows. This structure works well for **Expo + React Native + AI** and keeps navigation, business logic, and integrations clearly separated.

**See also:** [README.md](./README.md) · [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md) (10 domains) · [INGAUGE-ROUTE-MAP.md](./INGAUGE-ROUTE-MAP.md) (app routes)

---

## Visual architecture: how the main parts connect

```
                              USER
                               │
                               ▼
                         app/ (screens)
                    Expo Router navigation
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   components/            features/              store/
 reusable UI         product/domain logic      global state
          │                    │                    │
          │                    ▼                    │
          │                 hooks/                 │
          │            feature + shared hooks      │
          │                    │                    │
          └───────────────┬────┴────┬──────────────┘
                          │         │
                          ▼         ▼
                        ai/     services/
                  AI brain logic  APIs/integrations
                          │         │
                          └────┬────┘
                               ▼
                              lib/
                      shared helpers/utilities
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
        data/               types/               styles/
   static content        TypeScript models      design system

                               │
                               ▼
                             docs/
                    architecture + governance
```

---

## What talks to what

| Layer | Uses | Should not contain |
|-------|------|--------------------|
| **app/** | features/, components/, hooks/, store/ | Heavy AI logic, data-policy logic, or API code. |
| **features/** | components/, hooks/, store/, ai/, services/, lib/ | Raw API calls or route definitions; keep as product/domain brain. |
| **ai/** | services/, lib/, data/, types/ | UI or navigation; called from features/ or a dedicated hook/service, not from random screens. |
| **services/** | lib/, types/ | UI or feature logic; owns provider calls, Oura, Health, notifications, analytics, auth. |
| **store/** | lib/, types/ | Business logic; owns user, settings, signals, conversations, permissions, temporary UI state. |
| **data/** | — | Runtime logic; static content only (lessons, gauges, questions, legal, tool definitions). |
| **docs/** | — | Code; architecture and governance only. |

**Safe rule (folder boundaries):**

- **app/** = where users go  
- **features/** = what the product does  
- **ai/** = how intelligence works  
- **services/** = how outside systems connect  
- **store/** = what the app remembers during use  
- **data/** = what is predefined  
- **docs/** = how humans understand the system  

---

## Root layout

**Top-level folders (create these so the repo structure exists physically; use README or .gitkeep so empty dirs stay in git):**

```
app/
components/
features/
hooks/
lib/
ai/
data/
services/
store/
styles/
types/
docs/
scripts/
tests/
assets/
```

**Key subfolders (features mirror product; ai has brain/prompts/safety/voice):**

```
features/cockpit/
features/signals/
features/people/
features/tools/
features/learn/
features/profile/
features/insights/
features/body/
features/emergency/
features/rituals/

ai/brain/
ai/prompts/
ai/safety/
ai/voice/
```

---

## What each folder contains

### `app/` — Navigation + screens only

Expo Router file-based routes. **No business logic here.**

```
app/
  (auth)/
  (tabs)/
  people/
  tools/
  learn/
  profile/
  insights/
  body/
  emergency/
  rituals/
  share/
  lesson/
  (modals)/
```

**Rule:** `app` = routes + screens only. Everything else lives outside.

---

### `components/` — Reusable UI

UI elements that do not know about routes. Use from screens or from `features/*/components/`.

**Examples:**

- `GaugeCard.tsx`, `GaugeRing.tsx`
- `InsightCard.tsx`, `PersonTile.tsx`, `MindMailCard.tsx`
- `ToolButton.tsx`, `VoiceInput.tsx`, `ModalSheet.tsx`

---

### `features/` — Feature-specific logic

Keeps large domains organized. **Mirrors the product architecture** (see [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md)).

```
features/
  cockpit/
  signals/
  people/
  tools/
  learn/
  profile/
  insights/
  body/
  emergency/
  rituals/
```

**Inside each feature:**

```
features/cockpit/
  components/     # Cockpit-specific UI
  hooks/          # e.g. useCockpitScore.ts
  logic/          # domain logic (no UI)

features/people/
  components/
  hooks/
  logic/
  lightsEngine.ts
  relationshipSignals.ts
```

**Rule:** Business logic for a domain lives in `features/<domain>/`, not in `app/`.

---

### `hooks/` — Reusable React hooks

Shared hooks used across screens and features.

**Examples:**

- `useGaugeSignals.ts`, `useVoiceInput.ts`
- `useUserProfile.ts`, `useCheckin.ts`, `useInsights.ts`

---

### `lib/` — Shared utilities

Pure helpers: no React, no routes, no API keys.

**Examples:**

- `date.ts`, `formatting.ts`, `validation.ts`
- `analytics.ts`, `permissions.ts`

---

### `ai/` — AI Brain system

AI logic lives here, separate from UI. Aligns with [INGAUGE-AI-ARCHITECTURE.md](./INGAUGE-AI-ARCHITECTURE.md).

```
ai/
  brain/
    signalEngine.ts
    patternEngine.ts
    insightEngine.ts
    actionEngine.ts

  prompts/
    talkPrompt.ts
    decodePrompt.ts
    resolvePrompt.ts

  safety/
    crisisDetection.ts
    aiGuardrails.ts

  voice/
    speechToText.ts
    textToSpeech.ts
```

**Rule:** AI logic is in `ai/`; UI and routing stay in `app/` and `features/`.

---

### `data/` — Static data

Read-only content and legal copy.

**Examples:**

- `gauges.ts`, `lessons.ts`, `questions.ts`, `tools.ts`
- `legalDisclaimers.ts`, `privacyPolicy.ts`

Referenced by governance: e.g. [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) (disclaimers per route).

---

### `services/` — External integrations

APIs and third-party clients. Isolates external dependencies.

**Examples:**

- `openai.ts`, `analytics.ts`
- `oura.ts`, `appleHealth.ts`, `notifications.ts`

**Rule:** External APIs live in `services/`. Do not mix with UI or feature logic.

---

### `store/` — Global state

Global state management (e.g. Zustand).

**Examples:**

- `userStore.ts`, `signalStore.ts`
- `conversationStore.ts`, `settingsStore.ts`

---

### `styles/` — Design system

Theme and design tokens. Single source for look and feel.

**Examples:**

- `theme.ts`, `colors.ts`, `spacing.ts`, `typography.ts`

---

### `types/` — TypeScript types

Shared type definitions.

**Examples:**

- `user.ts`, `signals.ts`, `relationships.ts`, `insights.ts`

---

### `docs/` — Architecture documentation

All InGauge architecture and compliance docs. Does not ship to the app.

See [README.md](./README.md) for the index.

---

### `scripts/` — Developer helpers

One-off or dev scripts (e.g. codegen, seed, export).

**Examples:**

- `generateRoutes.ts`, `seedData.ts`, `exportUserData.ts`

---

### `tests/` — Tests

Unit and integration tests. Can mirror source layout.

**Example:**

```
tests/
  ai/
  tools/
  signals/
```

---

### `assets/` — Static files

Images, icons, fonts.

```
assets/
  icons/
  images/
  fonts/
```

---

## The three rules

| # | Rule | Meaning |
|---|------|---------|
| **1** | **Navigation lives only in `app/`** | `app` = routes + screens. No business logic in screen files. |
| **2** | **Business logic in `features/` or `ai/`** | `features` = product logic per domain. `ai` = AI brain logic. |
| **3** | **External APIs in `services/`** | `services` = integrations. Never mix with UI. |

---

## Example request flows

**Example 1: Talk screen**

```
app/(tabs)/talk.tsx
  → features/talk/
  → hooks/useTalk.ts
  → ai/prompts/talkPrompt.ts
  → ai/safety/crisisDetection.ts
  → services/openai.ts
  → store/conversationStore.ts
```

**Example 2: Cockpit insight**

```
app/(tabs)/index.tsx
  → features/cockpit/
  → hooks/useGaugeSignals.ts
  → ai/brain/signalEngine.ts
  → ai/brain/patternEngine.ts
  → ai/brain/insightEngine.ts
  → store/signalStore.ts
```

**Example 3: Oura connection**

```
app/body/oura/index.tsx
  → features/body/
  → services/oura.ts
  → store/settingsStore.ts
  → ai/brain/signalEngine.ts
```

Clean separation: screen → feature → hooks/ai/services/store; no heavy logic in `app/`.

---

## What this prevents

Without this structure, apps often become:

- `app/` with hundreds of files and mixed logic
- Duplicated utilities and unclear ownership
- AI and API code tangled with UI

This layout keeps navigation, features, AI, and integrations in predictable places and scales with the 10-domain product model ([INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md)).

---

## Migration checklist

- Do not mass-move everything at once.
- All new code should follow the new repo structure.
- When editing an old module, move it only if the move is small and safe.
- Keep route files in `app/`.
- Move shared UI into `components/`.
- Move product/domain logic into `features/`.
- Move AI logic into `ai/`.
- Move integrations into `services/`.
- Move static content into `data/`.
- Add or update docs when a domain changes.

**Rule:** *New code goes in the new structure. Old code moves only when touched.*

---

## What not to do yet

Do not do a giant refactor of the whole repo right now. Avoid:

- moving every file in one pass
- renaming everything at once
- restructuring routes and business logic simultaneously

That creates chaos.

---

## Priority order for migration

When you do start moving real code, use this order:

1. **components/** — low risk, easy wins
2. **services/** — isolate APIs
3. **data/** — static/legal content
4. **ai/** — AI brain logic
5. **features/** — domain logic
6. **store/** — global state
7. Larger route/domain reorganizations **later**

Reason: low risk first, less chance of breaking navigation. First small cleanup could be: move legal/static content into `data/`, or move one reusable UI area into `components/`.
