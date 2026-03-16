# InGauge Life Intelligence Model

Apple-style structure adapted to the InGauge system. Not copying UI — extracting the design principles.

## 5-layer structure

```
STATE
  ↓
SYSTEM IMPACT
  ↓
DRIVERS
  ↓
ACTIONS
  ↓
INSIGHTS
```

**Example:** Emotion: stressed → System Impact: Direction + Connection → Drivers: work tasks → Action: reach out / take break → Insights: pattern over time.

## Speed rule

**Logging takes less than 10 seconds.** Tap state → tap system impact → tap drivers → done. No typing. Fast systems get used.

## Drivers (associations by gauge)

Life factors mapped to the 6 gauges — used for pattern detection and action suggestions.

| Gauge      | Drivers |
|-----------|---------|
| Body      | Sleep, Health, Nutrition, Movement, Medication |
| Connection| Family, Friends, Partner, Community, Work relationships |
| Direction | Work, Tasks, Task switching / overload, Education, Money, Goals |
| Alignment | Values, Identity, Purpose, Spirituality |
| State     | Sleep, Caffeine, Stress, Distraction / focus |
| Emotion   | Relationships, Work, Uncertainty |

Drivers also map into **five influencing systems** (Recovery, Attention, Reciprocity, Meaning, Environment) that explain *why* gauges move. See **LIFE-OS-INFLUENCING-SYSTEMS.md**.

## Pattern detection (beyond Apple)

- Emotion vs sleep, exercise (like Apple)
- **Plus:** Emotion vs connection, Emotion vs direction, Emotion vs alignment
- Relationship and purpose signals Apple cannot measure

## Action recommendations

- Connection low → suggest reaching out to someone
- Body low → suggest short walk / hydrate
- Direction overloaded → suggest task prioritization
- Use `checkInSystemImpact` and `checkInDrivers` to tailor suggestions

## Implementation

- **Quick log:** `(modals)/quick-log` — State → System Impact → Drivers, tap-only.
- **Store:** `cockpitStore.checkInSystemImpact`, `cockpitStore.checkInDrivers`.
- **Data:** `src/data/driversByGauge.ts`, `src/types/drivers.ts`.
- **Circumplex:** Energy × valence emotion picker (science-backed, own visual) — future.
- **Charts:** Emotion vs connection, direction, alignment — future in Insights/Manual.
