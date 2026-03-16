# InGauge Architecture

**Start here.** Architecture docs live in `/docs` and are for developers, Cursor, and stakeholders. They do not ship to the app bundle.

| # | Doc | Purpose |
|---|-----|---------|
| 1 | [INGAUGE-ROUTE-MAP.md](./INGAUGE-ROUTE-MAP.md) | Route map, file tree, tabs/stacks/modals, navigation, domain ownership, migration plan. |
| 2 | [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) | Compliance + architecture contract: AI roles, voice, safety, matrix (per-route), analytics. |
| 3 | [INGAUGE-AI-ARCHITECTURE.md](./INGAUGE-AI-ARCHITECTURE.md) | AI Brain design, signals, pattern engine, insight generation, voice integration. |
| 4 | [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) | Data classification, retention, privacy, permissions, export/delete (GDPR/CCPA alignment). |
| 5 | [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md) | Product blueprint: 10 domains, how they connect, diagrams (investors, designers, new engineers). |

**Other references**

- [INGAUGE-REPO-STRUCTURE.md](./INGAUGE-REPO-STRUCTURE.md) — Repository layout: `app/`, `features/`, `ai/`, `components/`, `services/`, etc.; what lives where; migration from `src/`.
- [INGAUGE-DATA-GRAPH.md](./INGAUGE-DATA-GRAPH.md) — Internal graph model (nodes/edges) for the AI Brain.
- [INGAUGE-ARCHITECTURE-ORGANIZATION.md](./INGAUGE-ARCHITECTURE-ORGANIZATION.md) — KEEP / MOVE / MERGE / REMOVE migration checklist.

**Audit and release**

- [AUDIT-SYSTEM.md](./AUDIT-SYSTEM.md) — Five-layer audit (static, route, runtime, integration, product); what’s implemented.
- [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) — Pre-ship: typecheck, lint, route audit, build, runtime, permissions.
- [QA-CHECKLIST.md](./QA-CHECKLIST.md) — Manual QA by domain (Cockpit, Signals, People, Tools, Manual, Me, Insights, Body, Emergency, Rituals).

**Commands:** `npm run typecheck` · `npm run lint` · `npm run audit:routes` · `npm run audit` (typecheck + routes) · `npm run test` (typecheck + route audit).

**Rule:** Keep architecture docs in `/docs`. App code lives in `/app`, `/components`, `/lib`, etc. — the user’s device never loads these markdown files.
