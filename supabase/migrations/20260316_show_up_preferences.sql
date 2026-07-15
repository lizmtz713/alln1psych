-- How to Show Up for Me — guest questionnaire + inviter summaries
-- Mobile-first; responders use anon RPC only (no account).

CREATE TABLE IF NOT EXISTS show_up_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  inviter_display_name TEXT NOT NULL DEFAULT 'Someone',
  person_display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_opened_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_show_up_invites_owner_person ON show_up_invites(owner_user_id, person_id);
CREATE INDEX IF NOT EXISTS idx_show_up_invites_token ON show_up_invites(token);
CREATE INDEX IF NOT EXISTS idx_show_up_invites_owner ON show_up_invites(owner_user_id);

CREATE TABLE IF NOT EXISTS show_up_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  invite_id UUID NOT NULL REFERENCES show_up_invites(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  responder_preferred_name TEXT,
  consent_personalization BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_show_up_responses_owner_person ON show_up_responses(owner_user_id, person_id);
CREATE INDEX IF NOT EXISTS idx_show_up_responses_invite ON show_up_responses(invite_id);

CREATE TABLE IF NOT EXISTS show_up_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  response_id UUID NOT NULL REFERENCES show_up_responses(id) ON DELETE CASCADE,
  summary_text TEXT,
  best_ways_to_show_up JSONB,
  stress_help JSONB,
  avoid JSONB,
  communication_style_summary TEXT,
  repair_style_summary TEXT,
  easy_show_up_summary TEXT,
  important_dates_note TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_show_up_summaries_owner_person ON show_up_summaries(owner_user_id, person_id);
CREATE INDEX IF NOT EXISTS idx_show_up_summaries_response ON show_up_summaries(response_id);

ALTER TABLE show_up_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_up_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_up_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "show_up_invites_owner_all" ON show_up_invites;
DROP POLICY IF EXISTS "show_up_responses_owner_select" ON show_up_responses;
DROP POLICY IF EXISTS "show_up_summaries_owner_all" ON show_up_summaries;

CREATE POLICY "show_up_invites_owner_all" ON show_up_invites
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "show_up_responses_owner_select" ON show_up_responses
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "show_up_summaries_owner_all" ON show_up_summaries
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Guest-safe preview (no auth)
CREATE OR REPLACE FUNCTION public.get_show_up_invite_preview(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv show_up_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv FROM show_up_invites WHERE token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  UPDATE show_up_invites SET last_opened_at = now() WHERE id = inv.id;

  IF inv.expires_at < now() THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'expired',
      'inviter_display_name', inv.inviter_display_name,
      'person_display_name', inv.person_display_name
    );
  END IF;

  IF inv.status = 'completed' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'completed', true,
      'inviter_display_name', inv.inviter_display_name,
      'person_display_name', inv.person_display_name
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'completed', false,
    'inviter_display_name', inv.inviter_display_name,
    'person_display_name', inv.person_display_name
  );
END;
$$;

-- Guest submit (no auth)
CREATE OR REPLACE FUNCTION public.submit_show_up_response(
  p_token TEXT,
  p_answers JSONB,
  p_responder_preferred_name TEXT,
  p_consent_personalization BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv show_up_invites%ROWTYPE;
  new_id UUID;
BEGIN
  SELECT * INTO inv FROM show_up_invites WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  IF inv.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;

  IF inv.status = 'completed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_completed');
  END IF;

  INSERT INTO show_up_responses (
    owner_user_id,
    person_id,
    invite_id,
    answers,
    responder_preferred_name,
    consent_personalization
  ) VALUES (
    inv.owner_user_id,
    inv.person_id,
    inv.id,
    COALESCE(p_answers, '{}'::jsonb),
    NULLIF(trim(p_responder_preferred_name), ''),
    COALESCE(p_consent_personalization, false)
  )
  RETURNING id INTO new_id;

  UPDATE show_up_invites
  SET status = 'completed', completed_at = now()
  WHERE id = inv.id;

  RETURN jsonb_build_object('ok', true, 'response_id', new_id);
END;
$$;

REVOKE ALL ON TABLE public.show_up_invites FROM anon, public;
REVOKE ALL ON TABLE public.show_up_responses FROM anon, public;
REVOKE ALL ON TABLE public.show_up_summaries FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.show_up_invites TO authenticated;
GRANT SELECT ON TABLE public.show_up_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.show_up_summaries TO authenticated;

REVOKE ALL ON FUNCTION public.get_show_up_invite_preview(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_show_up_response(TEXT, JSONB, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_show_up_invite_preview(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_show_up_response(TEXT, JSONB, TEXT, BOOLEAN) TO anon, authenticated;
