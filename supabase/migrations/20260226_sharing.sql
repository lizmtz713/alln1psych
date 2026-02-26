-- Sharing Infrastructure: Operating Snapshots
-- Ethical sharing: plain-language summaries, no raw numbers, time-bound, revocable

-- Shared snapshots table
CREATE TABLE IF NOT EXISTS shared_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Share token (public identifier)
  token VARCHAR(32) UNIQUE NOT NULL,
  
  -- Snapshot content (no raw gauge numbers)
  display_name VARCHAR(100), -- "Liz" or anonymous
  current_mode TEXT NOT NULL CHECK (current_mode IN ('capacity', 'stabilization')),
  mode_message TEXT, -- "System stable" or "Foundation needs attention"
  
  -- What helps / doesn't help (user-provided)
  helps_text TEXT[], -- Array of things that help
  doesnt_help_text TEXT[], -- Array of things that don't help
  custom_message TEXT, -- Optional personal note
  
  -- Time bounds
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Revocation
  revoked_at TIMESTAMPTZ,
  
  -- Metadata
  view_count INTEGER DEFAULT 0
);

-- Index for token lookups (public access)
CREATE INDEX idx_shared_snapshots_token ON shared_snapshots(token);

-- Index for user's shares
CREATE INDEX idx_shared_snapshots_user ON shared_snapshots(user_id);

-- RLS Policies
ALTER TABLE shared_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can manage their own shares
CREATE POLICY "Users can view own shares" ON shared_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares" ON shared_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares" ON shared_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares" ON shared_snapshots
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view non-expired, non-revoked shares by token (for share viewer)
-- This is handled by the edge function, not RLS

-- Function to generate secure token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR(32) AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(32) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count (called by edge function)
CREATE OR REPLACE FUNCTION increment_share_views(share_token VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE shared_snapshots 
  SET view_count = view_count + 1 
  WHERE token = share_token 
    AND revoked_at IS NULL 
    AND expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
