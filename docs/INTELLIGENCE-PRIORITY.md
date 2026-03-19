# Life OS Intelligence Prioritization

**Goal:** Decide what should surface first across Cockpit and related surfaces so the app feels clear, not crowded. Cascade and Forecast must feel distinct; UI stays calm.

---

## 1. Priority model

Use this order when deciding **what is the one thing the user most needs to see first**:

| Priority | Signal | Meaning |
|----------|--------|--------|
| 1 | **Immediate action needed** | Crisis / safety, or a single high-leverage action (e.g. driver-aware primary suggestion) that unblocks the system now. |
| 2 | **Cascade severity** | A chain is already unfolding (recovery → body → state → emotion). Explains *what may already be happening*, not just tomorrow. |
| 3 | **Tomorrow risk severity** | Human Weather: tomorrow may feel heavier / lower energy. Forward-looking, with confidence language (likely, may, appears). |
| 4 | **Repeated pattern significance** | Pattern insight or weekly driver line — "this week X has been affecting you." |
| 5 | **Weekly relevance** | Reciprocity, growth, or weekly summary. Softer; better in weekly review than as hero. |

**Rule:** Do not stack more than one or two "intelligent" blocks in the same sight. Prefer one hero block, then supporting lines (e.g. one suggestion + one pattern line).

---

## 2. Copy distinction: Cascade vs Forecast

### Cascade = chain / already unfolding (present)

- **Job:** Explain the chain. "What may already be unfolding."
- **Tone:** Cause → effect → effect. Then one gentle action to slow the chain.
- **Examples:**
  - "Low sleep → lower energy → higher stress. This chain may already be unfolding. Rest or an earlier night can help slow it."
  - "Connection gaps → emotional strain. Reaching out to one person can slow the chain."
- **Avoid:** "Tomorrow will…" or "You will feel…" — that’s forecast.

### Forecast = likely near-future state (tomorrow / today)

- **Job:** Look ahead. "What tomorrow (or today) may feel like."
- **Tone:** Likely, may, appears, possible. Never certain.
- **Examples:**
  - "Tomorrow may feel heavier if recovery stays low tonight."
  - "Recovery has been low — tomorrow may feel lower on energy."
  - "Connection has been low — easy to drift from people tomorrow."
- **Avoid:** "Low sleep → low energy" without the time frame; that blurs into cascade.

---

## 3. Recommended placements by surface

| Output | Cockpit (Home) | Post–check-in | Weekly review | Forecast screen |
|--------|----------------|---------------|---------------|-----------------|
| **Primary driver-aware suggestion** | Yes — in "Influencing your system" + CockpitPriorities (one hero action) | Yes — top of summary | Optional | No |
| **Pattern insight line** | Yes — under primary suggestion or in same card (1 line) | Yes — if relevant | Yes | No |
| **Weekly driver line** | Yes — "This week" or inside influencing card (1 line) | No | Yes | No |
| **Cascade insight** | Yes — only via UnifiedInsightCard ("What we're seeing"), 1–2 insights max | Yes — in post-check-in insights (2 max) | Yes — in weekly insights (up to 5) | Optional — "Patterns we're seeing" only if no duplicate |
| **Human Weather forecast** | Yes — **one** block: either compact ForecastCard **or** a single forecast strip line, not both | No (focus on just-completed check-in) | No | Yes — full week; tomorrow from signals, day 2–7 placeholder with note |

**Cockpit rule:** One forecast surface only. Prefer the **compact ForecastCard** (tap → full /forecast). If you keep a strip, use it only when tomorrow risk is high and show at most one line; do not show both strip and card.

---

## 4. Confidence language (forecast)

Use lightly but consistently in forecast copy:

- **likely** — e.g. "Tomorrow is likely to feel…"
- **may** — e.g. "Tomorrow may feel heavier if…"
- **appears** — e.g. "Recovery appears low; tomorrow may…"
- **possible** — e.g. "It’s possible tomorrow will feel…"

Keep this strong for forecasts so we never sound certain.

---

## 5. Day 2–7 (later upgrade)

- **Day 1 (tomorrow):** Current signal-based (keep as is).
- **Day 2–3:** Softened continuation of day 1 (e.g. "May continue to feel…").
- **Day 4–7:** Baseline trend / uncertainty (e.g. "Patterns depend on how you check in. Stay consistent.").

Do not overbuild the week yet; placeholder is fine until this model is implemented.

---

## 6. Files to change (reference)

| Area | Files |
|------|--------|
| **Cascade copy** | `src/services/cascadeDetection.ts` — titles and bodies: chain + "already unfolding" / "slow the chain". |
| **Forecast copy** | `src/services/forecastService.ts` — getForecast (strip), getTomorrowForecast, getTodayForecast: "tomorrow may feel…" + confidence words. |
| **Cockpit single forecast** | `app/(tabs)/index.tsx` — show either forecast strip **or** ForecastCard, not both (e.g. show card only; or strip only when high risk). |
| **Insight card** | `src/components/insights/GeneratedInsightCard.tsx` — if cascade has a dedicated variant, ensure subtitle/tone matches "chain / unfolding". |
| **Forecast screen** | `app/forecast/index.tsx` — section titles and any copy: "likely", "may", "patterns we're seeing". |

---

## 7. Summary

- **Priority:** Immediate action > cascade severity > tomorrow risk > pattern > weekly.
- **Cascade** = chain, already unfolding, present. **Forecast** = tomorrow/today may feel like, with likely/may/appears.
- **Cockpit:** One hero intelligence; one forecast block (card or single strip line).
- **Confidence:** Use likely / may / appears / possible in all forecast copy.
