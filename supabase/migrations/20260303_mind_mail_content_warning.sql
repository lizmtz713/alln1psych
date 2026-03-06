-- Mind Mail Safety: content warning for receivers
ALTER TABLE heart_notes ADD COLUMN IF NOT EXISTS content_warning BOOLEAN DEFAULT FALSE;
ALTER TABLE heart_mail ADD COLUMN IF NOT EXISTS content_warning BOOLEAN DEFAULT FALSE;
