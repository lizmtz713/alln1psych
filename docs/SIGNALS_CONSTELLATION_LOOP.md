# Signals + Constellation: The Living Loop

**Product vision · How awareness, guidance, action, and motivation feed each other**

---

## The Relationship System as a Living Loop

The relationship system is designed so that each part **feeds the next**:

| Step | Surface | Role |
|------|--------|------|
| **Constellation** | Awareness | Shows your relationship universe — who's close, who's drifting |
| **Signals** | Guidance | One meaningful nudge: "This person could use a moment today" |
| **Transmit** | Action | Easy send with prompts and intent; Open / Glimpse |
| **Reinforcement** | Motivation | "Connection strengthened. That matters." → hero shows "You reached out today" |

Constellation shows your social universe; Signals keeps it alive through small actions.

---

## Healthy Habit Loop (Cue → Action → Reward → Identity)

Habits stick when they follow this cycle. The product is designed to support it **without manipulation** — making caring feel natural and rewarding.

1. **Cue (Signals tab)**  
   User opens Signals. Hero card: *"[Name] could use a moment from you today"* → **Transmit**. One suggestion, not overwhelming.

2. **Action (Transmit)**  
   User taps Transmit. Guided prompts (e.g. "I'm thinking of you today.", "You've been on my mind.") make the action easy.

3. **Reward (Reinforcement)**  
   After sending: *"Sent." / "That matters."* Optional: *"You'll see this connection in Constellation."*  
   Back on Signals: *"You reached out today"* — small but meaningful.

4. **Identity**  
   Over time: *"I'm someone who takes care of my relationships."*

---

## How They Feed Each Other

- **Transmit → Constellation**  
  When the user sends to a circle member, we store `lastTransmittedToId`. When they open Constellation, that node **briefly glows** (scale + shadow), then returns to normal. They see: *connection strengthened* in the map.

- **Constellation → Signals**  
  Constellation is framed as "Your relationship universe — who's close, who's drifting." The radar subtitle: *"You're at the center. Connections you strengthen in Signals show here."* So the two surfaces reference each other.

- **Reinforcement → Constellation**  
  After send (when recipient is a circle member), we show micro-feedback: *"[Name] is glowing in your Constellation."* This makes the cause→effect connection instant without requiring the user to open Constellation. When they do open it, the node glows once.

---

## Constellation as the Emotional Center

Constellation should feel like the **living map** of your relationships, not a feature.

- **Layout:** YOU at center. Others orbit. Distance = closeness (inner ring = 5, then 15, 50, 150).
- **Node size:** Importance / recency (recent contact = larger).
- **Color:** Relationship warmth — green (doing well), yellow (warm), orange (drifting), red (needs attention).
- **Motion:** Subtle breathing; healthy connections gently glow; drifting ones dim. After Transmit, that node glows briefly.
- **Interaction:** Tap node → Person sheet. Long-press (future): Quick actions (Transmit, Call, Plan time). Pinch → explore wider network.
- **Progressive disclosure:** Default view = **top 15** (Your 5 + Your 15). Expand to 50, then 150. Keeps cognitive load low; opening the map should feel like "your inner world," not a LinkedIn galaxy.
- **Connection lines (future):** Subtle lines from center to **inner circle only** (e.g. YOU → partner, best friend, sibling). Do not draw lines for 50/150 tiers — keeps the map elegant.

**Relationship momentum (future):** If interactions increase, node grows slightly brighter; if ignored, it slowly cools. Gentle signals, nothing dramatic.

---

## Implementation Notes (Current)

- **lastTransmittedToId** is stored in `dailyAnchorsStore`; cleared after Constellation glow or on date change.
- **ConstellationRadar** accepts `recentlyConnectedId` and `onRecentGlowComplete`; the matching node runs a one-time glow (scale 1 → 1.35 → 1, shadow), then parent clears the id.
- **PostSendReinforcement** can show `showConstellationHint` when recipient is a circle member.
- Copy in Signals (Constellation card) and radar (subtitle) ties the two surfaces together.

---

## Next priorities (product roadmap)

1. Constellation visual refinement (including avoiding common relationship-map visualization mistakes)
2. Momentum scoring (hidden per-relationship value: +meaningful interaction, +small interaction, −time decay → brightness / status / hero)
3. Hero intelligence (combine momentum + recency + tier + life events → e.g. "Your sister has been on your mind lately. Transmit appreciation.")
4. Life-event awareness
5. Motion polish

---

## Next priorities (product roadmap)

1. Constellation visual refinement (including avoiding common relationship-map visualization mistakes)
2. Momentum scoring (per-relationship: +meaningful / +small interaction, −time decay → brightness, status, hero)
3. Hero intelligence (momentum + recency + tier + life events → e.g. "Your sister has been on your mind lately. Transmit appreciation.")
4. Life-event awareness
5. Motion polish

For full Constellation visual and interaction spec, see **ingauge-LIGHTS-CONSTELLATION-SPEC.md**.
