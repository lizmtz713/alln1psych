# InGauge 3-Minute Onboarding

**Goal:** User understands the relationship system in ~3 minutes. No tutorials. No long explanations. Three core ideas.

---

## The 3 screens

| Screen | Teaches | Visual | CTA |
|--------|--------|--------|-----|
| 1 | **Your Relationship Universe** (Constellation) | Simplified map: YOU center, nodes (friend, family, partner, mentor) around | Next |
| 2 | **Relationships Change** (no guilt) | One node brightening and dimming (loop) | Next |
| 3 | **Small Moments Matter** (Signals + Transmit) | “Send encouragement” → node glows | Open Signals |

---

## Copy rules

- **Never use in onboarding copy:** Momentum, Season, Decay, Algorithm. Those are system concepts, not user concepts.
- User should feel: *“The app understands my relationships”* — not *“The app tracks relationship scores.”*

---

## Screen copy (current)

**Screen 1**  
- Title: *Your life is shaped by the people around you.*  
- Subtitle: *InGauge helps you see and care for the relationships that matter.*

**Screen 2**  
- Title: *Relationships naturally strengthen, drift, and reconnect.*  
- Subtitle: *InGauge understands these rhythms.*  
- Lines: *Some relationships grow. Some stay steady. Some go quiet for a while.*

**Screen 3**  
- Title: *Small moments keep relationships strong.*  
- Subtitle: *A quick message can make a real difference.*  
- CTA: **Open Signals**

---

## After onboarding

- User is taken to **Signals** tab (`/(tabs)/signals`).
- First Transmit reinforcement (already implemented): *“That matters. You'll see this connection glowing in your Constellation.”*

---

## What the user learns

| Concept | Learned as |
|--------|------------|
| Constellation | Relationships map |
| Change over time | Relationships change (grow, steady, quiet) — no guilt |
| Signals / Transmit | Small actions help |

Everything else (Momentum, Seasons, Timeline, Hero) can be discovered in the app.

---

## File

- `app/(modals)/onboarding.tsx` — 3-screen flow, finish → `completeOnboarding()` + `router.replace('/(tabs)/signals')`.
