# Deploy Supabase Edge Functions

Use these steps to run OpenAI (chat and TTS) server-side so the API key never ships in the app bundle.

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Logged in: `supabase login`
- Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

## Set the OpenAI secret

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

## Deploy functions

```bash
supabase functions deploy chat
supabase functions deploy tts
```

## Verify

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

You should get a JSON response with `content` and optionally `usage`.

## Notes

- Until edge functions are deployed, the app falls back to the client-side API key (SecureStore / env) for chat and TTS. The app works with or without edge functions.
- Deploy edge functions before any public release so the OpenAI key is never in the app.
