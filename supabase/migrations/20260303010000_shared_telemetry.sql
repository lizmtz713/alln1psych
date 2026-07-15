-- Shared Telemetry — Family Edition (Fleet Dashboard)
-- One row per pilot per gauge: status (green/amber/red) and optional probabilistic insight.
-- Privacy Curtain: only status is shared; raw values stay in cockpit.

CREATE TABLE IF NOT EXISTS public.shared_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gauge_type TEXT NOT NULL CHECK (gauge_type IN ('body', 'state', 'emotion', 'connection', 'direction', 'alignment')),
  status TEXT NOT NULL CHECK (status IN ('green', 'amber', 'red')),
  probabilistic_insight TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pilot_id, gauge_type)
);

CREATE INDEX IF NOT EXISTS idx_shared_telemetry_pilot ON public.shared_telemetry(pilot_id);
CREATE INDEX IF NOT EXISTS idx_shared_telemetry_updated ON public.shared_telemetry(updated_at DESC);

-- Row Level Security
ALTER TABLE public.shared_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own telemetry" ON public.shared_telemetry;
DROP POLICY IF EXISTS "Users can update own telemetry" ON public.shared_telemetry;
DROP POLICY IF EXISTS "Users can view own telemetry" ON public.shared_telemetry;

-- Users can insert/update their own telemetry (pilots report their gauges)
CREATE POLICY "Users can insert own telemetry"
  ON public.shared_telemetry FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Users can update own telemetry"
  ON public.shared_telemetry FOR UPDATE
  USING (auth.uid() = pilot_id)
  WITH CHECK (auth.uid() = pilot_id);

-- Users can view their own telemetry (fleet read-access for Ground Control added later)
CREATE POLICY "Users can view own telemetry"
  ON public.shared_telemetry FOR SELECT
  USING (auth.uid() = pilot_id);

REVOKE ALL ON TABLE public.shared_telemetry FROM anon, public;
GRANT SELECT, INSERT, UPDATE ON TABLE public.shared_telemetry TO authenticated;
