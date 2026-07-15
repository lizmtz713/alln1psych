-- Voice columns for Heart Notes & Heart Mail (Mind Mail voice notes)
-- Run this migration, then configure Storage bucket "voice" in Dashboard if needed.

-- Heart Notes: voice attachment
ALTER TABLE heart_notes ADD COLUMN IF NOT EXISTS has_voice BOOLEAN DEFAULT FALSE;
ALTER TABLE heart_notes ADD COLUMN IF NOT EXISTS voice_uri TEXT;
ALTER TABLE heart_notes ADD COLUMN IF NOT EXISTS voice_duration_sec INTEGER;
ALTER TABLE heart_notes ADD COLUMN IF NOT EXISTS voice_transcript TEXT;

-- Heart Mail: voice attachment (received)
ALTER TABLE heart_mail ADD COLUMN IF NOT EXISTS has_voice BOOLEAN DEFAULT FALSE;
ALTER TABLE heart_mail ADD COLUMN IF NOT EXISTS voice_uri TEXT;
ALTER TABLE heart_mail ADD COLUMN IF NOT EXISTS voice_duration_sec INTEGER;
ALTER TABLE heart_mail ADD COLUMN IF NOT EXISTS voice_transcript TEXT;

-- Optional: create Storage bucket for voice uploads (if your Supabase project allows storage in migrations).
-- If this fails (e.g. permission), create bucket "voice" in Dashboard and set:
--   - Public: true (so stored URLs work for playback), or use private + signed URLs in app.
--   - Policy: Allow authenticated INSERT where (storage.foldername(name))[1] = auth.uid()::text
--   - Policy: Allow SELECT for bucket_id = 'voice' (if public, or restrict as needed).
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice', 'voice', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own voice"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Voice bucket read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'voice');
*/
