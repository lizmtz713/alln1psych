-- Maintenance Tickets — Family Edition (Mind Mail)
-- Pilot (Teen) requests low-demand support from Ground Control (Parent).
-- Async, structured; avoids high-stress verbal confrontation.

CREATE TABLE IF NOT EXISTS maintenance_tickets (
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

CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_sender ON maintenance_tickets(sender_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_fleet ON maintenance_tickets(fleet_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_created ON maintenance_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_status ON maintenance_tickets(status);

-- Row Level Security
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Pilots can create and view their own tickets
CREATE POLICY "Users can view own tickets"
  ON maintenance_tickets FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can create own tickets"
  ON maintenance_tickets FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Ground Control (fleet members) can view tickets for their fleet via fleet_id;
-- add policies when fleet_groups and shared_telemetry are in place.
