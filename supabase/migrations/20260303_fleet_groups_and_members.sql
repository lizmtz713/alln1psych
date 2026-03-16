-- Fleet Security Matrix — Family Edition
-- Fleet = a family unit; members are Ground Control (parent) or Pilot (teen).
-- Telemetry is scoped so users only see telemetry for pilots in their fleet(s).

-- 1. Fleet Groups table
CREATE TABLE IF NOT EXISTS public.fleet_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Fleet Members (links users to fleets)
CREATE TABLE IF NOT EXISTS public.fleet_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_id UUID NOT NULL REFERENCES public.fleet_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ground_control', 'pilot')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(fleet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fleet_members_fleet ON public.fleet_members(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_members_user ON public.fleet_members(user_id);
CREATE INDEX IF NOT EXISTS idx_fleet_groups_invite ON public.fleet_groups(invite_code);

-- 3. RLS
ALTER TABLE public.fleet_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_members ENABLE ROW LEVEL SECURITY;

-- Fleet groups: members can read their fleets
CREATE POLICY "Members can view fleet"
  ON public.fleet_groups FOR SELECT
  USING (
    id IN (SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid())
  );

-- Fleet groups: any authenticated user can create (becomes ground_control via fleet_members)
CREATE POLICY "Users can create fleet"
  ON public.fleet_groups FOR INSERT
  WITH CHECK (true);

-- Fleet members: members can view others in same fleet
CREATE POLICY "Members can view fleet members"
  ON public.fleet_members FOR SELECT
  USING (
    fleet_id IN (SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join as pilot or be added as ground_control"
  ON public.fleet_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Replace permissive telemetry policy with fleet-scoped read
DROP POLICY IF EXISTS "Users can view telemetry" ON public.shared_telemetry;
DROP POLICY IF EXISTS "Users can view own telemetry" ON public.shared_telemetry;

CREATE POLICY "Users can view fleet telemetry"
  ON public.shared_telemetry FOR SELECT
  USING (
    pilot_id IN (
      SELECT fm.user_id FROM public.fleet_members fm
      WHERE fm.fleet_id IN (
        SELECT fleet_id FROM public.fleet_members WHERE user_id = auth.uid()
      )
    )
  );
