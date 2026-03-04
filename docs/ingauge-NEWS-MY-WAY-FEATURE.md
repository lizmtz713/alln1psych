# News My Way

Tagline: **Finally, news that considers your mind.**

## Science
Doomscrolling and mental health; constructive/solutions journalism; awe (Keltner); negativity bias and information overload.

## Features
- **Capacity-aware** — Adapts to State: minimal (3–5), light (5–8), balanced, full.
- **5 categories** — Awe, Connection, Solutions, Need to Know, Your Interests.
- **Gauge-responsive** — Low Direction → more awe. Low Connection → more human stories.
- **Doomscroll protection** — Check-in after 15 min: "How do you feel?"
- **News-free days** — Skip when State is very low.
- **Impact tracking** — Better / worse / neutral per story.

## Tech
- NewsAPI.org (free tier). Set `EXPO_PUBLIC_NEWS_API_KEY` in env.
- Mock digest when no key or offline.
- Capacity from `useCockpitStore.state.value`; digest built in `newsMyWayService.fetchDigest`.

## Entry
- Home: "News My Way" card.
- Explore (Learn) tab: Grow → News My Way.
