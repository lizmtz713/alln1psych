-- Friend Survey Feature
-- Allows users to send surveys to friends who DON'T need the app

-- Survey links table
CREATE TABLE IF NOT EXISTS friend_survey_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  light_id TEXT NOT NULL, -- local Light ID (stored in app)
  token VARCHAR(12) UNIQUE NOT NULL, -- short URL token (e.g., "abc123def456")
  friend_name VARCHAR(100) NOT NULL, -- shown in survey
  sender_name VARCHAR(100), -- who's asking (shown to friend)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  completed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS friend_survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_link_id UUID REFERENCES friend_survey_links(id) ON DELETE CASCADE,
  
  -- Love language
  love_language VARCHAR(50), -- words, time, help, gifts, touch
  love_language_notes TEXT,
  
  -- Communication preferences
  comm_preference VARCHAR(50), -- texts, calls, in_person, group, mix
  contact_frequency VARCHAR(50), -- daily, few_times_week, weekly, when_needed, they_reach_out
  
  -- Support style
  support_style VARCHAR(50), -- listen, distract, problem_solve, check_in, give_space
  
  -- Celebration style
  celebration_style VARCHAR(50), -- public_shoutout, private, celebrate_together, gift, presence
  
  -- Optional info
  birthday DATE,
  wish_list TEXT, -- what they're saving for or wanting
  
  -- Open field
  additional_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_links_token ON friend_survey_links(token);
CREATE INDEX IF NOT EXISTS idx_survey_links_user ON friend_survey_links(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_link ON friend_survey_responses(survey_link_id);

-- RLS Policies

-- Enable RLS
ALTER TABLE friend_survey_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_survey_responses ENABLE ROW LEVEL SECURITY;

-- Users can create their own survey links
CREATE POLICY "Users can create own survey links"
  ON friend_survey_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own survey links
CREATE POLICY "Users can read own survey links"
  ON friend_survey_links FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own survey links (e.g., deactivate)
CREATE POLICY "Users can update own survey links"
  ON friend_survey_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can read survey link by token (for public survey page)
-- This is handled by edge function, not direct access

-- Users can read responses to their surveys
CREATE POLICY "Users can read their survey responses"
  ON friend_survey_responses FOR SELECT
  USING (
    survey_link_id IN (
      SELECT id FROM friend_survey_links WHERE user_id = auth.uid()
    )
  );

-- Public insert for survey responses (via edge function with service role)
-- Direct inserts blocked; must go through edge function
