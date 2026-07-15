-- Maintenance Tickets — Family Edition (Mind Mail)
-- Pilot (Teen) requests low-demand support from Ground Control (Parent).
-- Async, structured; avoids high-stress verbal confrontation.

CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fleet_id UUID NULL,
  -- Optional: add REFERENCES fleet_groups(id) when that table exists

  system_status TEXT NOT NULL CHECK (system_status IN ('amber', 'red')),
  requested_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'closed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_sender ON public.maintenance_tickets(sender_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_fleet ON public.maintenance_tickets(fleet_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_created ON public.maintenance_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_status ON public.maintenance_tickets(status);

-- Row Level Security
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.maintenance_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.maintenance_tickets;
DROP POLICY IF EXISTS "Fleet can view maintenance tickets" ON public.maintenance_tickets;

-- Pilots can create and view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.maintenance_tickets FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can create own tickets"
  ON public.maintenance_tickets FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Fleet can view maintenance tickets"
  ON public.maintenance_tickets FOR SELECT
  USING (public.shares_fleet_with(sender_id));

REVOKE ALL ON TABLE public.maintenance_tickets FROM anon, public;
GRANT SELECT, INSERT ON TABLE public.maintenance_tickets TO authenticated;
