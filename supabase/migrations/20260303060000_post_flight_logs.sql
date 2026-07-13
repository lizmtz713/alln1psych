-- Post-Flight Logger — Family Edition (evening debrief)
-- Daily odometer (fuel), pothole report, mechanic's thanks. Fleet-scoped for trends.

CREATE TABLE IF NOT EXISTS public.post_flight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fleet_id UUID REFERENCES public.fleet_groups(id) ON DELETE CASCADE,
  fuel_remaining INTEGER NOT NULL CHECK (fuel_remaining >= 0 AND fuel_remaining <= 100),
  pothole_report TEXT,
  mechanics_thanks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_post_flight_logs_pilot ON public.post_flight_logs(pilot_id);
CREATE INDEX IF NOT EXISTS idx_post_flight_logs_fleet ON public.post_flight_logs(fleet_id);
CREATE INDEX IF NOT EXISTS idx_post_flight_logs_created ON public.post_flight_logs(created_at DESC);

ALTER TABLE public.post_flight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own logs" ON public.post_flight_logs;
DROP POLICY IF EXISTS "Users can view fleet logs" ON public.post_flight_logs;

CREATE POLICY "Users can insert own logs"
  ON public.post_flight_logs FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Users can view fleet logs"
  ON public.post_flight_logs FOR SELECT
  USING (auth.uid() = pilot_id OR public.shares_fleet_with(pilot_id));

REVOKE ALL ON TABLE public.post_flight_logs FROM anon, public;
GRANT SELECT, INSERT ON TABLE public.post_flight_logs TO authenticated;
