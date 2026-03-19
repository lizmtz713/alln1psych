# ai/

**AI Brain system.** Prompt logic, signal/pattern/insight engines, safety, voice orchestration.

AI should usually be **called from** `features/` or a dedicated hook/service—not directly from random screens.

**Suggested layout:**

- brain/ — signalEngine, patternEngine, insightEngine, actionEngine
- prompts/ — talkPrompt, decodePrompt, resolvePrompt
- safety/ — crisisDetection, aiGuardrails
- voice/ — speechToText, textToSpeech (orchestration; device APIs may live in services/)

See [docs/INGAUGE-REPO-STRUCTURE.md](../docs/INGAUGE-REPO-STRUCTURE.md) and [docs/INGAUGE-AI-ARCHITECTURE.md](../docs/INGAUGE-AI-ARCHITECTURE.md).
