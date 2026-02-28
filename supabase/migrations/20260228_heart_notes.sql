-- Heart Notes & Heart Inbox System
-- "Mail for the mind"

-- Heart Notes - messages I write to others
CREATE TABLE IF NOT EXISTS heart_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient info
  recipient_type TEXT NOT NULL DEFAULT 'external' CHECK (recipient_type IN ('circle', 'external')),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  
  -- Content
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  core_message TEXT, -- AI-distilled summary
  emotion TEXT, -- Primary emotion identified
  
  -- Classification
  note_type TEXT NOT NULL DEFAULT 'general' 
    CHECK (note_type IN ('general', 'gratitude', 'concern', 'apology', 'forgiveness', 'boundary', 'grief', 'encouragement')),
  send_type TEXT CHECK (send_type IN ('open', 'anonymous', 'soft')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'private', 'ready', 'pending', 'shared', 'declined', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shared_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Response from recipient
  recipient_response TEXT,
  recipient_acknowledged BOOLEAN DEFAULT FALSE,
  
  -- Reminders
  reminder_date TIMESTAMPTZ
);

-- Heart Mail - messages I receive from others
CREATE TABLE IF NOT EXISTS heart_mail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- People
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT, -- NULL if anonymous
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Content
  note_type TEXT NOT NULL DEFAULT 'general'
    CHECK (note_type IN ('general', 'gratitude', 'concern', 'apology', 'forgiveness', 'boundary', 'grief', 'encouragement')),
  content TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'read', 'archived', 'declined')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Response
  response TEXT,
  responded_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_heart_notes_user ON heart_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_heart_notes_status ON heart_notes(status);
CREATE INDEX IF NOT EXISTS idx_heart_notes_recipient ON heart_notes(recipient_id);

CREATE INDEX IF NOT EXISTS idx_heart_mail_recipient ON heart_mail(recipient_id);
CREATE INDEX IF NOT EXISTS idx_heart_mail_sender ON heart_mail(sender_id);
CREATE INDEX IF NOT EXISTS idx_heart_mail_status ON heart_mail(status);

-- Row Level Security
ALTER TABLE heart_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE heart_mail ENABLE ROW LEVEL SECURITY;

-- Heart Notes policies - only owner can access their notes
CREATE POLICY "Users can view own notes"
  ON heart_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON heart_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON heart_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON heart_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Heart Mail policies - recipients can see their mail, senders can create
CREATE POLICY "Recipients can view their mail"
  ON heart_mail FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Senders can view mail they sent"
  ON heart_mail FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can send mail"
  ON heart_mail FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update their mail (mark read, respond)"
  ON heart_mail FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Senders can delete pending mail (unsend)"
  ON heart_mail FOR DELETE
  USING (auth.uid() = sender_id AND status = 'pending');

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_heart_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER heart_notes_updated_at
  BEFORE UPDATE ON heart_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_heart_notes_updated_at();

-- Function to send notification when heart mail is received
CREATE OR REPLACE FUNCTION notify_heart_mail()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for recipient
  INSERT INTO notifications (user_id, type, title, body, data, created_at)
  VALUES (
    NEW.recipient_id,
    'heart_mail',
    CASE 
      WHEN NEW.is_anonymous THEN '💜 Someone in your Circle sent you Heart Mail'
      ELSE '💜 ' || COALESCE(NEW.sender_name, 'Someone') || ' sent you Heart Mail'
    END,
    CASE
      WHEN NEW.is_anonymous THEN 'Someone who cares about you has something to share.'
      ELSE 'Open when you''re ready.'
    END,
    jsonb_build_object('mail_id', NEW.id, 'is_anonymous', NEW.is_anonymous),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER heart_mail_notify
  AFTER INSERT ON heart_mail
  FOR EACH ROW
  EXECUTE FUNCTION notify_heart_mail();

-- Function to validate anonymous mail (only Circle members)
CREATE OR REPLACE FUNCTION validate_anonymous_mail()
RETURNS TRIGGER AS $$
BEGIN
  -- If anonymous, verify sender is in recipient's Circle
  IF NEW.is_anonymous THEN
    IF NOT EXISTS (
      SELECT 1 FROM circle_members 
      WHERE user_id = NEW.recipient_id 
      AND member_id = NEW.sender_id
      AND status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'Anonymous mail can only be sent to Circle members';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER heart_mail_validate_anonymous
  BEFORE INSERT ON heart_mail
  FOR EACH ROW
  EXECUTE FUNCTION validate_anonymous_mail();

-- Analytics view for heart mail usage
CREATE OR REPLACE VIEW heart_mail_stats AS
SELECT 
  recipient_id,
  COUNT(*) as total_received,
  COUNT(*) FILTER (WHERE is_anonymous) as anonymous_received,
  COUNT(*) FILTER (WHERE status = 'read') as read_count,
  COUNT(*) FILTER (WHERE response IS NOT NULL) as responded_count
FROM heart_mail
GROUP BY recipient_id;
