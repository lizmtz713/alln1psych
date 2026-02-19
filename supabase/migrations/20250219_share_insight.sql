-- Share Insight Feature
-- Enables users to share educational content with context

-- Shared insights table
CREATE TABLE IF NOT EXISTS shared_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What's being shared
  insight_type TEXT NOT NULL CHECK (insight_type IN ('manual_lesson', 'discovery', 'ai_response', 'relate_insight', 'replay_insight')),
  insight_id TEXT, -- Reference to lesson/discovery ID if applicable
  
  -- Full content for standalone sharing (especially AI responses)
  title TEXT NOT NULL,
  summary TEXT NOT NULL, -- 2-3 sentence overview
  key_points JSONB, -- Array of main points
  deep_content TEXT, -- Full deep dive / expanded content
  science TEXT, -- Academic backing
  real_world_examples JSONB, -- Array of examples
  try_this TEXT, -- Actionable suggestion
  source_label TEXT, -- "Human Manual" / "Talk to Psych" / etc.
  
  -- Sharing context
  sender_name TEXT NOT NULL,
  sender_context TEXT, -- Why they're sharing this
  recipient_type TEXT CHECK (recipient_type IN ('family', 'friend', 'partner', 'coworker', 'other')),
  
  -- Academic backing
  connected_gauges JSONB, -- Array of gauge names
  academic_sources JSONB, -- Array of {author, insight}
  
  -- Link generation
  short_code TEXT UNIQUE NOT NULL,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Responses to shared insights
CREATE TABLE IF NOT EXISTS insight_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID REFERENCES shared_insights(id) ON DELETE CASCADE,
  
  -- Response type
  response_type TEXT NOT NULL CHECK (response_type IN ('relate', 'helped', 'different', 'talk', 'written')),
  response_text TEXT, -- For written responses
  responder_name TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by short code
CREATE INDEX IF NOT EXISTS idx_shared_insights_short_code ON shared_insights(short_code);
CREATE INDEX IF NOT EXISTS idx_shared_insights_user_id ON shared_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_responses_insight_id ON insight_responses(insight_id);

-- RLS policies
ALTER TABLE shared_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_responses ENABLE ROW LEVEL SECURITY;

-- Users can create their own shares
CREATE POLICY "Users can create shares" ON shared_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own shares
CREATE POLICY "Users can view own shares" ON shared_insights
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view shares by short_code (for public links) - handled by edge function
-- Responses can be created by anyone (anonymous)
CREATE POLICY "Anyone can respond" ON insight_responses
  FOR INSERT WITH CHECK (true);

-- Users can view responses to their shares
CREATE POLICY "Users can view responses to their shares" ON insight_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_insights 
      WHERE shared_insights.id = insight_responses.insight_id 
      AND shared_insights.user_id = auth.uid()
    )
  );

-- Function to generate short codes
CREATE OR REPLACE FUNCTION generate_short_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate short_code on insert
CREATE OR REPLACE FUNCTION set_short_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.short_code IS NULL THEN
    LOOP
      new_code := generate_short_code(8);
      SELECT EXISTS(SELECT 1 FROM shared_insights WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_short_code
  BEFORE INSERT ON shared_insights
  FOR EACH ROW
  EXECUTE FUNCTION set_short_code();
