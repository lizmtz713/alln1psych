# Lights Constellation — "A Radar for Human Connection"

**Product design spec · Build-ready**

---

## 1. Vision

The Constellation is the signature visualization of the Lights system: **a radar for human connection**. It surfaces who matters, who needs attention, and how your relationship landscape changes over time. No other app shows "your people" as a living, breathable map.

---

## 2. Five Core Relationship Signals

Every relationship is encoded by five signals derived from existing Lights data:

| Signal | Meaning | Source data |
|--------|--------|-------------|
| **Closeness** | How central this person is (Dunbar tier) | `tier` (5 / 15 / 50 / 150) |
| **Recency** | When you last connected | `lastContactDate`, `daysSinceContact` |
| **Temperature** | How they're doing (shared or inferred) | `temperature` (warm / neutral / cool) |
| **Domain** | Life domain / cluster | `relationshipType`, optional `cluster` |
| **Urgency** | Needs attention (flickering / dimming) | `status`, tier-based thresholds |

---

## 3. Visual Encoding (Three Signals Only — See Rule #2)

To avoid overloaded encoding, the map uses **only three** visual dimensions:

| Dimension | Meaning | Encoding |
|-----------|---------|----------|
| **Distance** | Closeness tier | Center = YOU; ring 1 = 5, ring 2 = 15, ring 3 = 50, ring 4 = 150. |
| **Color** | Relationship state | Green = doing well, yellow = warm, orange = drifting, red = needs attention. Unknown = muted. |
| **Size** | Importance / centrality | Recent contact = larger; faded = smaller. |

**Motion** is reserved for life, not extra meaning: subtle breathing (all nodes), one-time glow (after Transmit), and optional flicker for “needs attention.” No icons, labels on nodes, or extra dimensions.

---

## 4. Three-Zone Screen Structure

- **Zone 1 (Top): Radar**  
  The constellation canvas. Pinch to zoom, pan to move. Center = you. Nodes = lights. Tap node for Person Card.

- **Zone 2 (Middle): Context**  
  Timeline slider (optional: "Last 7 days" / "Last 30 days" / "All time" to show how constellation changed). Optional legend: tier rings, temperature key.

- **Zone 3 (Bottom): Focus**  
  When a node is selected: **Person Card** (name, tier, temperature, days since contact, quick actions: Call, Text, Log contact, Open full profile). When nothing selected: short tagline — e.g. "Tap a light to see who needs you."

---

## 5. Relationship Clusters (Life Domains)

Optional grouping by life domain to reduce clutter and show "who's in which world":

- Family  
- Close friends  
- Work / professional  
- Community / faith / hobby  
- Other  

Clusters can be:
- **Visual**: Same region or subtle background shade.  
- **Progressive**: "Show by cluster" toggle; clusters expand on tap.  

Data: Use `relationshipType` or a new `cluster` field on the light.

---

## 6. Constellation Rules (Anti–Hairball Design)

These rules prevent the map from becoming noise and keep it readable and emotionally legible.

---

### Constellation Rule #1 — Show Only What Humans Can Process

**Problem (hairball):** Showing the entire network at once → 120 dots, overlapping nodes, chaotic layout. The brain interprets this as noise, not insight.

**Rule:** Show only the relationships a user can emotionally process at once.

| Level   | Visible   |
|--------|-----------|
| Default | Inner 15 (Your 5 + Your 15) |
| Expand | 50        |
| Expand | 150       |

The map should feel like **your social world**, not your contact database.

---

### Constellation Rule #2 — One Meaning Per Dimension (No Overloaded Encoding)

**Problem:** Encoding too many meanings (color, size, shape, lines, labels, icons, heat maps, alerts) makes the map cognitively impossible to read.

**Rule:** Each visual dimension represents **only one** meaning.

| Dimension | Meaning        | Do not use for |
|-----------|----------------|-----------------|
| **Distance** | Closeness tier (center = YOU, ring 1 = 5, ring 2 = 15, ring 3 = 50, ring 4 = 150) | — |
| **Color** | Relationship state (green = doing well, yellow = warm, orange = drifting, red = needs attention) | — |
| **Size**  | Importance / emotional centrality (large = more meaningful) | — |

**Avoid:** Icons, labels everywhere, text clutter, relationship-type badges, alert overlays, numbers on nodes. The map must remain calm and readable.

### Constellation Rule #3 — Orbital Stability

**Problem:** If node positions change every time the list is re-sorted (e.g. by attention), users cannot build spatial memory of "where" each person lives on the map.

**Rule:** Within each tier ring, nodes are ordered **deterministically by member id** (e.g. `id.localeCompare`). The same person always appears in the same angular position, so the map feels stable and intuitive. Implementation: `computeConstellationNodes` sorts each tier's list by `light.id` before assigning angles.

---

### Constellation Rule #3 — Alive, Never Busy

**Problem:** Static graphs feel like data visualization, not a living relationship system.

**Rule:** The map must feel **alive but never busy**.

**Allowed motion:**
- Subtle breathing (nodes: scale 1 → 1.03 → 1, very slow, subconscious).
- Glow on interaction (e.g. after Transmit).
- Gentle momentum changes (e.g. node slightly brighter / cooler with interaction over time).

**Forbidden motion:**
- Constant flashing.
- Alert pulsing (except reserved, subtle flicker for “needs attention”).
- Node jitter.
- Heavy animations.

The map should feel calm, organic, almost celestial.

---

### Constellation Rule #4 — User Is Always the Center

**Rule:** Never move the user node. YOU stays fixed in the center. This creates orientation stability. If the center moves, users lose spatial memory.

---

### Constellation Rule #5 — Meaningful Lines Only (Future)

**Rule:** Connection lines only for the **inner circle** (e.g. YOU → partner, best friend, sibling). **No lines** for 50/150 tiers. Otherwise the graph becomes spaghetti.

---

## 7. Progressive Reveal (5-15-50-150)

- **Default view**: **Inner 15** (Your 5 + Your 15). Low cognitive load; “your inner world.”
- **Expand**: 50, then 150. So the radar never overwhelms.
- Implementation: Reveal level control (5 | 15 | 50 | all); default = 15.

---

## 8. Focus + Context Visualization

- **Context**: Full constellation (all visible tiers at current zoom).  
- **Focus**: Selected node highlighted (glow, label, or pull-out Person Card).  
- Optional "Focus mode": Dim non-selected nodes so the chosen light stands out.

---

## 9. Timeline Slider

- Control: **Last 7 days** | **Last 30 days** | **All time** (or custom range).  
- Effect: Node positions/sizes or a secondary "ghost" layer show how the constellation looked at that time (e.g. who was in Your 5, who had contact).  
- Data: Use connection log dates to compute "as of date" snapshots (simplified: filter by lastContactDate or show current + one past snapshot).

---

## 10. Person Card Interaction

- **Trigger**: Tap node on radar.  
- **Content**: Name, tier label, temperature, days since contact, optional one-line note.  
- **Actions**: Call, Text, Log contact, Open full Light profile.  
- **Dismiss**: Tap outside or "Close"; optional swipe down.

---

## 11. The 3 Wow Moments

1. **First open**: "This is my relationship radar." One sentence under the radar: "Your 5 are closest. Tap any light to see who needs you."  
2. **First tap**: Person Card slides up with name and quick actions — "Oh, I can act from here."  
3. **First timeline change**: Slider moves → constellation subtly updates — "My map changes over time."

---

## 12. Visual Design Style (Deep Space Aesthetic)

- **Background**: Deep dark (e.g. `#09090F`), subtle starfield or gradient (dark blue/purple to black).  
- **Center (you)**: Soft glow, small dot or icon; "You" label optional.  
- **Nodes**: Glowing orbs (temperature color); flickering = subtle pulse animation.  
- **Connections**: Optional thin lines from center to node (opacity low); or no lines for cleaner look.  
- **Typography**: Minimal labels; clear hierarchy (name > meta).  
- **Motion**: Subtle, purposeful (pulse for urgency; smooth pan/zoom).

---

## 13. Share Card Format

- **Export**: Generate a card (square or story) showing:  
  - Blurred or abstract constellation (no names).  
  - Tagline: "My Lights · X people I care about" or "A radar for human connection."  
  - App branding: AllN1 Psych / InGauge.  
- **Use**: Social share, lock screen, or "Year in Lights" moment.  
- **Implemented**: Share button on Constellation screen shares message: "My constellation — X connections. A radar for human connection. AllN1 Psych." Visual card (image) can be added in a later phase.

---

## 14. TypeScript Data Model

See `src/types/lightsConstellation.ts`:

- `ConstellationNode`: id, name, tier, temperature, brightness, x, y, flickering, daysSinceContact, **cluster**, **sizeRatio**, **pulse**
- `RelationshipCluster`: id, label, color (optional), nodeIds
- `ConstellationSnapshot`: nodes, timestamp (for timeline)
- `ConstellationViewState`: zoom, pan, selectedNodeId, timelineRange

---

## 15. Implementation Priorities (4 Phases)

| Phase | Delivered |
|-------|-----------|
| **1** | Data model, three-zone layout, radar with 5-signal encoding (position, size, color, motion, cluster), deep space style. |
| **2** | Progressive reveal (5 → 15 → 50), focus mode (dim non-selected), timeline slider (7d / 30d / all). |
| **3** | Person Card (tap node), quick actions, share card (square/story). |
| **4** | Polish: 3 wow moments copy, micro-animations, accessibility, performance. |

---

*"A radar for human connection" — signature innovation for Lights.*
