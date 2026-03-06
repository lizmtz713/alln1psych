# InGauge Relationship System — Overview

**Single master diagram for how the relationship intelligence layer connects.**

This doc helps future developers see how Interaction → Momentum → Season → Constellation → Hero → Signals → Transmit fit together.

---

## The pipeline

```
Interaction
    ↓
Momentum Engine
    ↓
Season Engine
    ↓
Constellation Visualization
    ↓
Hero Intelligence
    ↓
Signals Nudges
    ↓
Transmit Actions
```

---

## Stage by stage

| Stage | What it does | Key outputs |
|-------|----------------|-------------|
| **Interaction** | User (or system) records contact: Transmit, call, meetup, etc. | Connection log, last contact date |
| **Momentum Engine** | 0–100 relationship strength; decay over time; growth/dormant/archived modifiers | `momentumScore`, status (healthy / flickering / dark) |
| **Season Engine** | Context: Growth / Active / Dormant / Archived. Life context (e.g. life_transition) can force Dormant. | `season` per light; used by momentum, hero, constellation |
| **Constellation Visualization** | Map of relationships: position by tier + cluster, brightness by momentum/season, growth nodes closer to center | Nodes with x, y, brightness, flickering |
| **Hero Intelligence** | Picks who to nudge today; respects seasons (dormant dampened, archived excluded) | Hero member + optional life-event label |
| **Signals Nudges** | “What needs attention today” — Hero card, list of people, status labels | Signals screen with person list |
| **Transmit Actions** | User sends encouragement or logs contact; feeds back into Interaction | Recorded contact, momentum boost |

---

## Data flow (simplified)

1. **Circle members** + **lightsStore** (tiers, connection log, momentum, season overrides, light extras) → **computeLights** / **getLights**.
2. **getLights** calls **getMomentumScoresForLights** (momentum + season derivation) and attaches `momentumScore` and `season` to each light.
3. **Lights** (with momentum + season) feed:
   - **Constellation** (positions, brightness, radius tweak for growth),
   - **Hero** (ranking with season weights),
   - **Signals** (who to show, status copy),
   - **Person Detail Sheet** (season label, Reconnect / Mark as Dormant, Connection Timeline).
4. **Transmit** / **Log contact** → **recordConnection** / **addConnectionEntry** / **addMomentumBoost** → updates store → next **getLights** reflects new state.

---

## Key files

| Layer | Files |
|-------|--------|
| Interaction / storage | `lightsStore.ts` (connectionLogByMemberId, lastContactByMemberId, recordConnection, addConnectionEntry, logContact) |
| Momentum | `momentumEngine.ts` (decay, floor, growth/dormant/archived modifiers), `lightsStore` (momentumByMemberId, addMomentumBoost, getMomentumScoresForLights) |
| Season | `seasonsEngine.ts` (deriveSeason), `seasons.ts` (types, labels, helpers), `lightsStore` (seasonByMemberId, setSeason; relationshipContext in extras) |
| Constellation | `lightsConstellation.ts` (lightToConstellationNode: brightness, radius ×0.95 for growth), components that consume nodes |
| Hero | `heroEngine.ts` (selectHero, season-aware weights) |
| Signals | Signals screen, Hero card, Person list, PersonDetailSheet (season controls, timeline) |
| Transmit | Mind Mail / Transmit flow → recordConnection + addMomentumBoost |

---

## Relationship lifecycle (covered)

| Stage | Season / system |
|-------|------------------|
| Meeting someone | Growth |
| Maintaining closeness | Active |
| Quiet but meaningful | Dormant (decay slowed; optional “Mark as Dormant”) |
| Letting go | Archived (frozen, no hero) |

Life context (e.g. **life_transition**) can shift a relationship to Dormant without implying it’s weakening — e.g. moving, new job, new parent. User can always override with **Reconnect** or **Mark as Dormant** in the person sheet.

---

## Related docs

- **RELATIONSHIP_SEASONS.md** — Seasons spec (derivation, overrides, life context, UI).
- **RELATIONSHIP_TIMELINE.md** — Connection Timeline (history in person sheet).
- **MOMENTUM_AND_HERO_ENGINES.md** — Momentum and Hero in detail.
- **ingauge-LIGHTS-CONSTELLATION-SPEC.md** — Constellation behavior and 5-signal encoding.
- **SIGNALS_CONSTELLATION_LOOP.md** — How Signals and Constellation reinforce each other.
