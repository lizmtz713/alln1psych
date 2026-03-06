# Contextual Insights (Human Manual) — Spec

**Issue:** Users need the "human manual" — insight cards that explain gauges and patterns — surfaced in context, not buried.

## 1. 50+ insight cards mapped to gauges

- **Insight cards:** Short, readable cards (title + 2–4 sentences) that explain one concept: e.g. "Why State Drops After Poor Sleep", "What Connection Does to Your Nervous System", "When to Use Your Body Gauge."
- Each card is mapped to one or more **gauges** (Body, State, Emotion, Connection, Direction, Alignment).
- 50+ cards covering: gauge meanings, patterns, when to act, how tools help.

## 2. Surface contextually

- **Home:** Show 1–2 insight cards relevant to current gauges (e.g. if State is low, show "Why State Drops" or "Quick resets for State").
- **Gauge detail:** When user opens a gauge (e.g. State), show 2–3 insight cards for that gauge.
- **Post check-in:** Optionally one insight card after check-in (e.g. "You often feel this way on Wednesdays — here's why that might be").

## 3. Each card links to full Manual lesson

- Each insight card has a **manual_lesson_id** (or slug) linking to the full lesson in Learn / Manual.
- "Read more" or "Go to lesson" CTA on the card.

## 4. Tool → Manual lesson mappings

- Tools can map to specific Manual lessons (e.g. "Breathing" tool → "Nervous system basics" lesson).
- Enables "After using Breathing, you might like this lesson" or surfacing the lesson from the tool screen.

## 5. 7-day no-repeat tracking

- Do not show the **same** insight card to the user within 7 days (per card id).
- Store last_shown_at per (user_id, card_id); filter suggestions to exclude recently shown.
- Ensures variety and avoids fatigue.

---

**Files to touch:** Insight cards data (50+ entries with gauge mapping + lesson id), contextual surfacing service (home, gauge detail, post check-in), "Suggested for you" or "Insight" card component, Manual/Learn route for lessons, last_shown_at storage (e.g. AsyncStorage or DB), tool→lesson map.
