# Relationship Seasons

**Product spec · Context states for how relationships exist over time**

Seasons explain why a relationship might change without assuming something is wrong. Grounded in Developmental and Social Psychology. Prevents the app from pushing every connection at the same intensity.

---

## 1. The four seasons

Context states, not value judgments.

| Season    | Meaning | Examples |
|-----------|---------|----------|
| **Growth** | Forming or deepening | New friend, early romantic, reconnection, coworker becoming close |
| **Active** | Stable, regularly maintained | Close friends, siblings, regular collaborators |
| **Dormant** | Meaningful but inactive | Old friends, former coworkers, extended family, long-distance |
| **Archived** | No longer active in day-to-day life | Former partners, past friendships, intentionally stepped away from |

---

## 2. Momentum + seasons

Momentum still tracks current health; seasons adjust expectations.

| Season   | Momentum behavior |
|----------|-------------------|
| Growth   | +20% momentum gain (growth multiplier) |
| Active   | Normal decay, normal hero |
| Dormant  | Decay 70% slower (prevents nagging) |
| Archived | Frozen (no decay, no hero) |

---

## 3. Derivation and overrides

- **Archived:** `tier === 'archived'` → season = archived.
- **Override:** `seasonByMemberId[memberId]` in lightsStore (user can set via "Reconnect" or "Mark as Dormant" in person sheet).
- **Life context:** `relationshipContext === 'life_transition'` (e.g. moving, new job, new parent) → season = dormant. Makes the system empathetic: life bandwidth changed, not the relationship.
- **Derived when no override and no life_transition:**
  - Dormant: `daysSinceContact >= 60` and momentum &lt; 50.
  - Growth: momentum ≥ 70 and days ≤ 14.
  - Else: Active.

---

## 4. Hero intelligence with seasons

| Season   | Hero behavior |
|----------|----------------|
| Growth   | Frequent nudges (normal score) |
| Active   | Moderate nudges (normal score) |
| Dormant  | Occasional nudges (hero score × 0.4) |
| Archived | None (excluded from hero pool) |

Gentle copy for dormant hero: *"You haven't talked with [Name] in a while. Reconnect?"*

---

## 5. Constellation effects

| Season   | Node behavior |
|----------|----------------|
| Growth   | Slightly brighter (×1.1), slightly closer to center (radius ×0.95) — "becoming more central" |
| Active   | Stable |
| Dormant  | Slightly faded (×0.85) |
| Archived | Hidden (excluded by tier) |

Kept subtle.

---

## 6. UI: person sheet

- Show **Season: [Growth | Active | Dormant | Archived]** with optional helper.
- Helper copy (no guilt): e.g. *"Some relationships stay meaningful even when quiet."*
- **Reconnect** (when Dormant): sets season to Growth; closes sheet so next open reflects change.
- **Mark as Dormant** (when Active or Growth): sets season to Dormant so derivation never feels authoritative — user can say "this relationship is intentionally quiet."
- See `SEASON_LABELS` and `SEASON_HELPERS` in `src/types/seasons.ts`.

---

## 7. Seasonal transitions (future)

- **Growth → Active:** Interaction frequency stabilizes.
- **Active → Dormant:** Momentum low for 60–90 days (we use 60).
- **Dormant → Growth:** Reconnection event (e.g. Transmit).
- **Active → Archived:** User manually archives (tier = archived).

---

## 8. Data model

- **lightsStore:** `seasonByMemberId: Record<string, RelationshipSeason>`, `setSeason(memberId, season)`.
- **Light:** `season?: 'growth' | 'active' | 'dormant' | 'archived'` (computed/attached in getLights).
- **Life context:** `Light.relationshipContext?: 'life_transition'` (from lightExtras); stored via `updateLightExtras(memberId, { relationshipContext: 'life_transition' })`. Used in deriveSeason to force dormant when life bandwidth changed.

---

## 9. Why it matters

Without seasons, the system assumes every relationship should stay active — which is false. With seasons, the system respects natural relationship rhythms and avoids guilt. That builds trust.

**Complete relationship engine flow:**

```
Interaction
    ↓
Momentum update (boost + decay; season modifiers)
    ↓
Season adjustment (derive or override)
    ↓
Status label
    ↓
Constellation brightness + season tweak
    ↓
Hero ranking (season filters and weights)
    ↓
Signals nudge
```

---

## 10. Files

| File | Role |
|------|------|
| `src/types/seasons.ts` | RelationshipSeason, SEASON_LABELS, SEASON_HELPERS, DORMANT_DAYS_THRESHOLD, GROWTH_MOMENTUM_MULTIPLIER, DORMANT_DECAY_FACTOR |
| `src/services/seasonsEngine.ts` | deriveSeason(light, options) |
| `src/services/momentumEngine.ts` | applyMomentumDecayWithSeason (dormant 70% slower, archived frozen) |
| `src/stores/lightsStore.ts` | seasonByMemberId, setSeason, getMomentumScoresForLights returns seasons, addMomentumBoost growth ×1.2 |
| `src/services/heroEngine.ts` | Filter archived by season; dormant score ×0.4 |
| `src/services/lightsConstellation.ts` | growth brightness ×1.1, dormant ×0.85; growth radius ×0.95 (closer to center) |
| `src/components/signals/PersonDetailSheet.tsx` | Season label + helper + Reconnect / Mark as Dormant |
