# InGauge Family Edition: Gottman-Inspired Tools Spec

Three evidence-based tools that close gaps in the current Fleet system. Science, missing piece, and tool shape for each.

---

## 1. The Collision Report (Repair)

**The Science:** Dr. John Gottman’s research shows that successful systems aren’t the ones that never fight; they’re the ones that **execute a Repair Attempt quickly and without shame**.

**What’s Missing:** Role Play lets families practice; there’s no structured path for **after a real, messy fight**.

**The Tool: Collision Report**  
A highly structured, asynchronous form used after a fight. It removes shame by treating the argument like a mechanical failure.

| Field | Purpose |
|-------|--------|
| **What spiked my RPMs?** | What triggered me / raised my intensity (systemic, not “you made me”). |
| **What I misunderstood about your telemetry** | What I got wrong about your state, intent, or needs. |
| **What is my 1% of responsibility for this crash?** | Forces systemic accountability; avoids “it was all you” or “it was all me.” |

- **Flow:** Pilot (or Ground Control) opens the tool post-collision, fills the three fields, can optionally share with the other party (fleet-scoped).
- **Tone:** Mechanical, non-blaming. “Crash” and “RPMs” keep it in the flight metaphor.
- **Data:** New table `collision_reports` (pilot_id, fleet_id, field answers, created_at); RLS by fleet.

---

## 2. The Black Box (Trend Radar / Analytics)

**The Science:** Behavioral science relies on **longitudinal data** to find hidden triggers (e.g. a teen’s State gauge drops every Sunday night due to school anxiety).

**What’s Missing:** Post-Flight Debriefs and telemetry are logged but **not visualized over time**.

**The Tool: Black Box (Trend Radar)**  
A chart screen that maps a Pilot’s gauge averages (or status distribution) over **~30 days**. Ground Control can see patterns (e.g. Connection dips every Tuesday) and act proactively (e.g. low-demand movie night on Mondays)—shifting from reactive disciplinarian to proactive behavioral awareness.

- **Audience:** Ground Control (parent) view; Pilots can have an optional self-view.
- **Data source:** Aggregate from `post_flight_logs` (fuel_remaining, etc.) and/or `shared_telemetry` (status over time).
- **UX:** Simple line/area chart or status-by-day grid; 30-day window; one gauge at a time or small multi-gauge summary.
- **Privacy:** Respect Privacy Curtain; if raw values are hidden, show only trend (e.g. “tends to dip Tuesdays”) or status bands, not exact numbers.

---

## 3. The Flight Plan (Cognitive Offloading)

**The Science:** When the **Direction** gauge is low, it’s often **Executive Dysfunction** (ADHD, anxiety, exhausted teen brain). Telling an overwhelmed kid to “clean your room” is like asking a stalled car to win a race.

**What’s Missing:** A way to break **Tier 3 (High Logic/Direction)** tasks into **Tier 1 (Low Demand/Mechanical)** steps.

**The Tool: Flight Plan**  
A micro-task generator. The teen submits a request (“I’m overwhelmed by this school project”). Ground Control uses the app to break it into **3–5 microscopic, frictionless steps** (e.g. “1. Open laptop. 2. Write your name on a blank doc. 3. Stop and get a snack.”). This bridges parent expectations and teen cognitive capacity.

- **Flow:**
  - **Pilot:** “Request a Flight Plan” — short description of the overwhelming thing.
  - **Ground Control:** Sees request, writes 3–5 micro-steps, assigns to Pilot.
  - **Pilot:** Sees steps, checks them off one by one (no pressure to do all at once).
- **Data:** `flight_plan_requests` (pilot_id, description, status, created_at); `flight_plan_steps` (request_id, order, title, completed_at).
- **Placement:** Tools or People (Fleet); entry from “I’m overwhelmed” or from Ground Control’s Fleet view.

---

## Implementation order (suggested)

| Order | Tool | Rationale |
|-------|------|-----------|
| 1 | **Collision Report** | Fits existing repair/Post-Flight language; single-user flow; high impact for post-fight repair. |
| 2 | **Black Box** | Builds on existing `post_flight_logs` and telemetry; needs charting and aggregation. |
| 3 | **Flight Plan** | Two-sided flow (request ↔ create steps); new tables and Fleet UX. |

---

## Integration with existing spec

- **FAMILY_EDITION_SPEC.md:** Collision Report = structured Repair ritual; Black Box = use of shared telemetry + Post-Flight data; Flight Plan = Probabilistic Scripts / Quick-Deploy in the “Direction” space.
- **Privacy:** Collision Report and Flight Plan are fleet-scoped; Black Box respects Privacy Curtain (trends vs raw values).
- **Language:** All three use the same flight/mechanical metaphor (RPMs, telemetry, crash, flight plan, Ground Control, Pilot).
