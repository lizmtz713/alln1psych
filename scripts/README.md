# scripts/

**Developer helpers** and **audit scripts**.

**Audit (run from repo root):**

- `npm run typecheck` — TypeScript (`tsc --noEmit`).
- `npm run audit:routes` — Route audit: every referenced route has a file, duplicates, possible orphans, missing default export.
- `npm run audit:ownership` — account-isolation audit for all Zustand stores.
- `npm run audit:edge` — edge-function syntax, JWT, AI gateway, and client-secret boundary audit.
- `npm run audit` — all release static checks above.
- `npm run test` — same release static baseline as `npm run audit`.

`npm run lint` is intentionally not a release command until ESLint is configured.

**Scripts:**

- `audit-routes.js` — Scans `app/` and `src/` for route files and `router.push`/pathname/route/href; reports broken refs, duplicates, orphans.
- `run-tests.js` — Runs typecheck and route audit (for CI or pre-commit).

**Other:** generateRoutes.ts, seedData.ts, exportUserData.ts (as needed).

See [docs/INGAUGE-REPO-STRUCTURE.md](../docs/INGAUGE-REPO-STRUCTURE.md) and [docs/RELEASE-CHECKLIST.md](../docs/RELEASE-CHECKLIST.md).
