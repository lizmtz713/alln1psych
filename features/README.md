# features/

**Product/domain logic.** This is the main product brain outside navigation.

Each feature mirrors a product domain. Use: `components/`, `hooks/`, `store/`, `ai/`, `services/`, `lib/`. Do not put heavy AI or API code in `app/`—keep it here or in `ai/`/`services/`.

**Recommended structure (mirror the app map):**

- cockpit/
- signals/
- people/
- tools/
- learn/
- profile/
- insights/
- body/
- emergency/
- rituals/

Inside each: `components/`, `hooks/`, `logic/` (and domain-specific modules as needed).

See [docs/INGAUGE-REPO-STRUCTURE.md](../docs/INGAUGE-REPO-STRUCTURE.md) and [docs/INGAUGE-SYSTEM-MAP.md](../docs/INGAUGE-SYSTEM-MAP.md).
