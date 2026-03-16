# scripts/

**Developer helpers** and **audit scripts**.

**Audit (run from repo root):**

- `npm run typecheck` — TypeScript (`tsc --noEmit`).
- `npm run lint` — Expo lint.
- `npm run audit:routes` — Route audit: every referenced route has a file, duplicates, possible orphans, missing default export.
- `npm run audit` — typecheck + route audit.
- `npm run test` — typecheck + route audit (same as audit).

**Scripts:**

- `audit-routes.js` — Scans `app/` and `src/` for route files and `router.push`/pathname/route/href; reports broken refs, duplicates, orphans.
- `run-tests.js` — Runs typecheck and route audit (for CI or pre-commit).

**Other:** generateRoutes.ts, seedData.ts, exportUserData.ts (as needed).

See [docs/INGAUGE-REPO-STRUCTURE.md](../docs/INGAUGE-REPO-STRUCTURE.md) and [docs/RELEASE-CHECKLIST.md](../docs/RELEASE-CHECKLIST.md).
