-- Shared Telemetry — Family Edition (Fleet Dashboard)
-- One row per pilot per gauge: status (green/amber/red) and optional probabilistic insight.
-- Privacy Curtain: only status is shared; raw values stay in cockpit.

CREATE TABLE IF NOT EXISTS shared_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gauge_type TEXT NOT NULL CHECK (gauge_type IN ('body', 'state', 'emotion', 'connection', 'direction', 'alignment')),
  status TEXT NOT NULL CHECK (status IN ('green', 'amber', 'red')),
  probabilistic_insight TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pilot_id, gauge_type)
);

CREATE INDEX IF NOT EXISTS idx_shared_telemetry_pilot ON shared_telemetry(pilot_id);
CREATE INDEX IF NOT EXISTS idx_shared_telemetry_updated ON shared_telemetry(updated_at DESC);

-- Row Level Security
ALTER TABLE shared_telemetry ENABLE ROW LEVEL SECURITY;

-- Users can insert/update their own telemetry (pilots report their gauges)
CREATE POLICY "Users can insert own telemetry"
  ON shared_telemetry FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Users can update own telemetry"
  ON shared_telemetry FOR UPDATE
  USING (auth.uid() = pilot_id);

-- Users can view their own telemetry (fleet read-access for Ground Control added later)
CREATE POLICY "Users can view own telemetry"
  ON shared_telemetry FOR SELECT
  USING (auth.uid() = pilot_id);
