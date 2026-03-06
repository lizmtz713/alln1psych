# Gauge-Triggered Tools — Spec

**Issue:** Tool discoverability. Users don't know which tool to use when.

## 1. Master tool to gauge mapping (27 tools)

- Each tool maps to one or more **trigger gauges** (Body, State, Emotion, Connection, Direction, Alignment).
- When a gauge is low or declining, tools that support that gauge are candidates for suggestion.
- **27 tools** with explicit trigger mapping (e.g. Breathing to State/Body; Relate to Connection; Role Play to Emotion).

## 2. Suggestion engine

- **Inputs:** Current gauge values and trends (improving/stable/declining), optional recent check-in.
- **Logic:** Rank tools by urgency (which gauge is most in need plus tool relevance).
- **Output:** Ordered list of suggested tools (e.g. top 3 to 5) with short reason (e.g. "State is low — try Breathing").

## 3. Home screen "Suggested for you"

- Section on home: "Suggested for you" (or "For you right now").
- Renders top suggestions from the engine (cards or chips) with deep link to tool.
- Only show when user has completed onboarding and has at least one gauge with data.

## 4. Post check-in tool suggestions

- After user completes a check-in (mood or cockpit): modal or bottom sheet with 1 to 3 suggested tools based on current gauges.
- Dismissible; do not block flow.

## 5. CoPilot / Talk awareness of gauges

- When user is in Talk (voice or text), CoPilot has access to current gauge state (and optionally recent trend).
- Enables responses like "Your State gauge has been low — want to try a quick reset?" or "I see Emotion has been tough; we can work through that here."
- No raw numbers in copy; use gentle, supportive language.

---

**Files to touch:** Tool-to-gauge map (data or config), suggestion engine (service), home "Suggested for you" component, post-check-in modal/sheet, Talk/CoPilot context (gauges in prompt or context).
