# AI Voice Responses (Gauge speaks back)

The app **can** speak Gauge’s replies out loud using OpenAI TTS. It only does so when both of the following are true.

---

## 1. Setting is on

**Me → Settings** (or **Me → Preferences & Data** → open **Account Settings** or the screen that has **AI Voice Responses**):

- Find **AI Voice Responses** / **Gauge speaks back with voice**.
- Turn the switch **ON**.

If you don’t see it or it’s grayed out, the feature may be gated as “Pro” in the UI; with `TESTING_MODE = true` in `premiumStore`, the switch should be available.

---

## 2. OpenAI API key is set

Voice uses the **same** OpenAI key as chat (Bring Your Own Key):

- **Me → Preferences & Data → Bring Your Own Key** (or **Account Settings** → wherever the API key is set).
- Enter a valid OpenAI API key and save.

If the key is missing or invalid, TTS does nothing (no error is shown in the UI). So if “AI Voice Responses” is on but you never hear anything, check the key first.

---

## 3. Where it’s used

When the setting is on and a key is present, Gauge’s reply is spoken in:

- **Talk** tab (after each AI reply)
- **Role Play**
- **Help Someone**
- Any other flow that calls `Voice.speakWithOpenAI(response)` when `useSettingsStore.getState().aiVoiceEnabled` is true.

---

## Summary

**Why can’t the AI speak back?**

1. **Setting off** — Turn **AI Voice Responses** on in Me → Settings.
2. **No API key** — Set **Bring Your Own Key** in Me → Preferences & Data (same key as for chat).
3. **Pro gate** — In production the toggle is labeled Pro; in testing (`TESTING_MODE`) it’s available to everyone.

Implementation: `src/services/voice.ts` → `speakWithOpenAI()`, and Talk (and other screens) call it when `aiVoiceEnabled` is true.
