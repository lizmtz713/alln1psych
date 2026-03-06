# Life Forecast Engine — Specification

## Overview

The Life Forecast Engine is InGauge’s predictive layer: it learns patterns from the user’s history (rituals, gauges, connections) and produces **tomorrow’s forecast**, **today’s forecast** (Pre-Flight), and a **week forecast** with risk factors and suggestions.

## Pattern Types Detected

1. **Day-of-week** — e.g. “Wednesdays are your hardest day”
2. **Sleep → State** — “Poor sleep = lower State next day”
3. **Connection gaps** — “3+ days no contact = Emotion drops”
4. **Calendar load** — “4+ meetings = State dips” (placeholder until calendar integration)
5. **Sequence** — “2 drops often lead to a 3rd”
6. **Trend momentum** — Recent direction continues

## Data Sources

- **Rituals store:** Pre-Flight (sleep quality, morning feeling, intention), Post-Flight (day rating, voice answers)
- **Cockpit store:** Gauge values and trends (body, state, emotion, connection, direction, alignment)
- **Circle store:** Mood check-in dates
- **Lights store:** `lastContactByMemberId` → days since last connection log

## API

- **`getTomorrowForecast()`** — For home card
- **`getTodayForecast()`** — For Pre-Flight screen
- **`getFullWeekForecast()`** — For forecast screen (`/forecast`)

## UI Integration

| Location        | Component            | Purpose                                      |
|----------------|----------------------|----------------------------------------------|
| Home           | `<ForecastCard />`   | Tomorrow’s forecast, risk line, suggestion   |
| Pre-Flight     | `<PreFlightForecast />` | Today’s forecast, factors, “Got it”      |
| `/forecast`    | Full week screen     | Day-by-day predictions, patterns, suggestions |

## Files

- `src/types/forecast.ts` — Types (patterns, predictions, suggestions)
- `src/services/patternDetection.ts` — Pattern detection from history
- `src/services/predictionModel.ts` — Multi-factor prediction
- `src/services/forecastService.ts` — Main API (consumes stores)
- `src/components/forecast/ForecastCard.tsx` — Home widget
- `src/components/forecast/PreFlightForecast.tsx` — Pre-Flight block
- `app/forecast/index.tsx` — Week forecast screen
