# Momentum + Hero Intelligence Engines

**Product spec · Relationship intelligence layer**

---

## 1. Relationship Momentum Engine

**Question it answers:** Is this relationship strengthening or fading?

Instead of only “last contact,” we track **interaction energy over time** (Social Network Analysis + Behavioral Design).

### Core momentum score (0–100)

| Score   | Meaning        | Status label      |
|--------|----------------|-------------------|
| 80–100 | Thriving       | Doing well        |
| 60–80  | Warm           | Warm              |
| 40–60  | Stable         | Could use support |
| 20–40  | Drifting       | Drifting          |
| 0–20   | Needs attention| Needs attention   |

### Boosts (on action)

| Action           | Boost |
|------------------|-------|
| Transmit message | +4    |
| Log contact      | +1    |
| Meaningful convo | +6    |
| Celebration      | +5    |
| Support moment   | +7    |
| Repair           | +12   |

### Tier-based decay (-1 per period)

| Tier   | Period  |
|--------|---------|
| 5      | 2 days  |
| 15     | 5 days  |
| 50     | 14 days |
| 150    | 30 days |

### Rules

- **Momentum floor:** If contacted within last **7 days**, score is at least 50 (healthy relationships don’t drop too fast).
- **Daily update:** Decay is applied lazily when scores are read (e.g. when opening Signals or Constellation).

### Where momentum is used

- **Status labels** — When `momentumScore` is present, status comes from momentum bands; otherwise from recency (brightness).
- **Hero ranking** — Low momentum increases hero score (drifting / needs attention get higher weight). Hero candidates include `momentumScore < 50`.
- **Constellation** — Node brightness and flicker come from momentum when available:
  - **High (80–100)** → brighter node  
  - **Medium (40–80)** → stable  
  - **Low (20–40)** → dim  
  - **Critical (0–20)** → dim + subtle flicker

---

## 2. Hero Intelligence Engine

**Question it answers:** Who most deserves your attention today?

Hero chooses the **one** person for the Signals nudge (not just “who you haven’t contacted recently”).

### Hero score formula

```
heroScore =
  momentumDrop * 3    (low momentum → higher score)
  + daysSinceContact * 2
  + circleWeight      (inner circle matters more)
  + lifeEventWeight   (birthday/anniversary today = strong override)
```

### Circle weight (inner circle = higher)

| Tier | Weight |
|------|--------|
| 5    | +30    |
| 15   | +20    |
| 50   | +10    |
| 150  | +5     |

### Life events (override)

- **Birthday today** → e.g. “Celebrate with [Name]”
- **Anniversary today** → e.g. “Transmit appreciation to [Name]”

When a life event is detected, that person is strongly favored (lifeEventWeight = 80).

### Hero diversity (cooldown)

- After someone is shown as hero, they are not shown again for **5 days**.
- **Exception:** If their momentum is critical (score < 20), they can appear again before cooldown ends.

### Flow

1. Build candidate pool (all non-archived lights, respecting cooldown).
2. Score each with `getHeroScore(light, { momentumScore })`.
3. Sort by score descending; pick top.
4. When hero is displayed, store `lastHeroShownByMemberId[id] = today` so cooldown applies.

---

## 3. Data and wiring

- **Momentum** — Stored in `lightsStore`: `momentumByMemberId`, `addMomentumBoost`, `getMomentumScoresForLights` (applies decay when reading). Persisted.
- **Hero cooldown** — `lastHeroShownByMemberId` in `lightsStore`. Persisted.
- **Transmit** — `recordConnection(memberId, 'transmit')` updates lastContact and adds +4 momentum.
- **Log contact** — `logContact` adds +1 or +6 (meaningful). 
- **Status** — `getRelationshipStatusLabel(light, needsAttention)` uses `light.momentumScore` when present via `getStatusLabelFromMomentum`.
- **Lights** — `getLights(members)` returns lights with `momentumScore` (decay applied on read).
- **Hero** — Signals calls `selectHero(lights, { momentumByMemberId, lastHeroByMemberId })` and passes result to `DailyConnectionPrompt` as `priority` + `lifeEventLabel`.
- **Constellation** — `computeConstellationNodes(lights)` uses `light.momentumScore` when present for node brightness and flicker (see `lightsConstellation.ts`: `brightnessFromMomentum`, critical → flickering).

---

## 4. System architecture

Everything stays synchronized:

```
Interaction (Transmit / log / repair)
    ↓
Momentum update (boost + decay on read)
    ↓
Status label (Doing well / Warm / … / Needs attention)
    ↓
Constellation brightness + flicker (high → bright, critical → flicker)
    ↓
Hero ranking (momentum drop, days, circle, life event)
    ↓
Signals nudge (one hero + “Transmit” / “Celebrate with…”)
```

**Why it matters:** Without momentum, the system feels like a reminder app. With momentum and seasons, it feels like a living relationship system that respects natural rhythms. See **RELATIONSHIP_SEASONS.md** for the seasons layer.

---

## 5. Hero + Signals flow (end-to-end)

1. User opens **Signals** → sees e.g. *“Jake could use a moment from you today”* or *“Celebrate with Sarah”* + **Transmit**.
2. User sends message → **Reinforcement**: *“Connection strengthened. Jake is glowing in your Constellation.”*
3. User opens **Constellation** → Jake’s node glows once (post-Transmit glow).
4. Momentum increases for that relationship; hero ranking updates tomorrow; cooldown prevents same hero for 5 days (unless critical).

---

## 6. Relationship Seasons (implemented)

Seasons are implemented. See **RELATIONSHIP_SEASONS.md**. Summary:

- **Growth** — +20% momentum gain; Constellation slightly brighter.
- **Active** — Normal decay and hero.
- **Dormant** — Decay 70% slower; hero score ×0.4 (occasional nudges); Constellation slightly faded; gentle copy.
- **Archived** — No decay, no hero, hidden from Constellation (by tier).

---

## 7. Files

| File | Role |
|------|------|
| `src/services/momentumEngine.ts` | Bands, decay, boost constants, pure helpers |
| `src/services/heroEngine.ts` | Life events, hero score, selectHero |
| `src/stores/lightsStore.ts` | momentumByMemberId, lastHeroShownByMemberId, addMomentumBoost, getMomentumScoresForLights, setLastHeroShown, getLights (with momentum) |
| `src/lib/signalsCopy.ts` | getRelationshipStatusLabel uses momentum when present |
| `app/(tabs)/signals.tsx` | getLights, selectHero, pass hero to DailyConnectionPrompt, setLastHeroShown |
| `src/components/mind-mail/DailyConnectionPrompt.tsx` | Optional priority + lifeEventLabel from parent |
| `src/services/lightsConstellation.ts` | brightnessFromMomentum, flicker when critical (momentum &lt; 20) |
