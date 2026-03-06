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

## 3. Five-Signal Visual Encoding

| Signal | Visual encoding |
|--------|-----------------|
| **Closeness** | **Position** — Distance from center (you). Inner ring = Your 5, outer = Your 150. |
| **Recency** | **Size** — Node size reflects recency (recent contact = larger, faded = smaller). |
| **Color** | **Temperature** — Warm (orange/amber), Neutral (yellow), Cool (blue). Unknown = muted. |
| **Motion** | **Urgency** — Flickering/pulse for "needs attention"; steady glow for healthy. |
| **Cluster** | **Grouping** — Nodes in same life domain (family, work, friends) can cluster or share a subtle region. |

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

## 6. Progressive Reveal (5-15-50 Rule)

- **Default view**: Show **Your 5** (inner ring) fully; **Your 15** and **Your 50** as aggregated glow or count until user zooms or taps "Show more."
- **Zoom out / "Show all"**: Reveal 15, then 50, then 150 so the radar doesn’t overwhelm.
- Keeps the first impression simple: "Here are your 5. The rest are there when you need them."

---

## 7. Focus + Context Visualization

- **Context**: Full constellation (all visible tiers at current zoom).  
- **Focus**: Selected node highlighted (glow, label, or pull-out Person Card).  
- Optional "Focus mode": Dim non-selected nodes so the chosen light stands out.

---

## 8. Timeline Slider

- Control: **Last 7 days** | **Last 30 days** | **All time** (or custom range).  
- Effect: Node positions/sizes or a secondary "ghost" layer show how the constellation looked at that time (e.g. who was in Your 5, who had contact).  
- Data: Use connection log dates to compute "as of date" snapshots (simplified: filter by lastContactDate or show current + one past snapshot).

---

## 9. Person Card Interaction

- **Trigger**: Tap node on radar.  
- **Content**: Name, tier label, temperature, days since contact, optional one-line note.  
- **Actions**: Call, Text, Log contact, Open full Light profile.  
- **Dismiss**: Tap outside or "Close"; optional swipe down.

---

## 10. The 3 Wow Moments

1. **First open**: "This is my relationship radar." One sentence under the radar: "Your 5 are closest. Tap any light to see who needs you."  
2. **First tap**: Person Card slides up with name and quick actions — "Oh, I can act from here."  
3. **First timeline change**: Slider moves → constellation subtly updates — "My map changes over time."

---

## 11. Visual Design Style (Deep Space Aesthetic)

- **Background**: Deep dark (e.g. `#09090F`), subtle starfield or gradient (dark blue/purple to black).  
- **Center (you)**: Soft glow, small dot or icon; "You" label optional.  
- **Nodes**: Glowing orbs (temperature color); flickering = subtle pulse animation.  
- **Connections**: Optional thin lines from center to node (opacity low); or no lines for cleaner look.  
- **Typography**: Minimal labels; clear hierarchy (name > meta).  
- **Motion**: Subtle, purposeful (pulse for urgency; smooth pan/zoom).

---

## 12. Share Card Format

- **Export**: Generate a card (square or story) showing:  
  - Blurred or abstract constellation (no names).  
  - Tagline: "My Lights · X people I care about" or "A radar for human connection."  
  - App branding: AllN1 Psych / InGauge.  
- **Use**: Social share, lock screen, or "Year in Lights" moment.  
- **Implemented**: Share button on Constellation screen shares message: "My constellation — X connections. A radar for human connection. AllN1 Psych." Visual card (image) can be added in a later phase.

---

## 13. TypeScript Data Model

See `src/types/lightsConstellation.ts`:

- `ConstellationNode`: id, name, tier, temperature, brightness, x, y, flickering, daysSinceContact, **cluster**, **sizeRatio**, **pulse**
- `RelationshipCluster`: id, label, color (optional), nodeIds
- `ConstellationSnapshot`: nodes, timestamp (for timeline)
- `ConstellationViewState`: zoom, pan, selectedNodeId, timelineRange

---

## 14. Implementation Priorities (4 Phases)

| Phase | Delivered |
|-------|-----------|
| **1** | Data model, three-zone layout, radar with 5-signal encoding (position, size, color, motion, cluster), deep space style. |
| **2** | Progressive reveal (5 → 15 → 50), focus mode (dim non-selected), timeline slider (7d / 30d / all). |
| **3** | Person Card (tap node), quick actions, share card (square/story). |
| **4** | Polish: 3 wow moments copy, micro-animations, accessibility, performance. |

---

*"A radar for human connection" — signature innovation for Lights.*
