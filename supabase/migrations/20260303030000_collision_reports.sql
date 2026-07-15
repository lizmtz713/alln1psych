-- Collision Report — Family Edition (Gottman-inspired post-fight repair)
-- Structured repair form: what spiked my RPMs, what I misunderstood, my 1% responsibility. Fleet-scoped.

CREATE TABLE IF NOT EXISTS public.collision_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fleet_id UUID REFERENCES public.fleet_groups(id) ON DELETE CASCADE,
  what_spiked_my_rpms TEXT,
  what_i_misunderstood TEXT,
  my_one_percent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_collision_reports_pilot ON public.collision_reports(pilot_id);
CREATE INDEX IF NOT EXISTS idx_collision_reports_fleet ON public.collision_reports(fleet_id);
CREATE INDEX IF NOT EXISTS idx_collision_reports_created ON public.collision_reports(created_at DESC);

ALTER TABLE public.collision_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own collision reports" ON public.collision_reports;
DROP POLICY IF EXISTS "Users can view fleet collision reports" ON public.collision_reports;

CREATE POLICY "Users can insert own collision reports"
  ON public.collision_reports FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Users can view fleet collision reports"
  ON public.collision_reports FOR SELECT
  USING (auth.uid() = pilot_id OR public.shares_fleet_with(pilot_id));

REVOKE ALL ON TABLE public.collision_reports FROM anon, public;
GRANT SELECT, INSERT ON TABLE public.collision_reports TO authenticated;
