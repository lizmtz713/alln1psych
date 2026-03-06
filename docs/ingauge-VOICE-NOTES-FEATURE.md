# Voice Notes — What Your Daughter Gets

## Features

### 🎤 Voice Journal
- Tap mic → speak → save
- Optional transcription (Whisper)
- "Talk to yourself" therapy style

### 💌 Voice Mind Mail
- Record instead of type
- Recipient hears your actual voice
- Carries tone, emotion, everything text loses

### 👁️ Voice Glimpse (THE MAGIC)
- Plays ONCE, then dissolves
- Can't replay, can't screenshot
- "I needed you to hear this, not read it"

### ☀️ Voice Check-in
- Pre-Flight: "How'd you sleep?" → speak
- Post-Flight: "What's on your mind?" → speak
- Faster than typing, more honest

### 🤖 CoPilot Voice Mode
- Talk to CoPilot, hear responses (TTS)
- Full voice-to-voice conversation

---

## Tech Stack
- **expo-av** — recording + playback
- **expo-file-system** — local storage
- **Supabase Storage** — Mind Mail audio
- **Whisper API** — transcription ($0.006/min)

---

## Implementation Order
1. **Core** — VoiceRecorder, VoicePlayer, Waveform
2. **Journal** — mic button, voice entries
3. **Mind Mail** — voice messages
4. **Glimpse Voice** — play once, dissolve
5. **Check-ins** — Pre/Post-Flight voice
