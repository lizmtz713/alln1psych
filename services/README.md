# services/

**External APIs and integrations.** Isolate all outside systems here.

**Examples:** openai.ts (or model provider), analytics.ts, oura.ts, appleHealth.ts, notifications.ts, auth/backend APIs.

Do not mix with UI or feature logic. `features/` and `ai/` call into services; services do not know about routes or screens.

See [docs/INGAUGE-REPO-STRUCTURE.md](../docs/INGAUGE-REPO-STRUCTURE.md).
