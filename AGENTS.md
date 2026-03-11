# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

AllN1 Psych / InGauge is a React Native (Expo SDK 54) mobile app with a Next.js 14 companion web app. Both use npm as the package manager. There are no Docker, monorepo tooling, or local database requirements — Supabase is hosted remotely.

### Services

| Service | Directory | Dev command | Port | Notes |
|---|---|---|---|---|
| Expo Metro bundler | `/workspace` | `npx expo start` | 8081 | Mobile-first; `--web` flag fails due to native-only `react-native-pager-view` import |
| Next.js web companion | `/workspace/web` | `npm run dev` | 3000 | Shared insight/report viewer |

### Lint / Type-check / Build

- **Root (Expo):** `npx tsc --noEmit` for type-checking. No ESLint config exists; there is no `lint` script in `package.json`.
- **Web:** `npm run lint` (Next.js ESLint), `npm run typecheck` (`tsc --noEmit`), `npm run build` (Next.js build). The `.eslintrc.json` uses `next/core-web-vitals`.
- Both projects have pre-existing TypeScript errors (9 in root, 1 in web). These are not setup-related.

### Gotchas

- **Expo web mode broken:** `npx expo start --web` fails because `react-native-pager-view` (native-only) is imported in `src/components/wrapped/WrappedStoryCards.tsx` → `app/wrapped/index.tsx`. Use Metro bundler (`npx expo start`) for native clients only.
- **react-native-web peer deps:** Installing `react-native-web` requires `--legacy-peer-deps` due to a React 19 / react-dom version mismatch.
- **Supabase is remote-only:** No local Supabase; the project is linked to hosted project `jtlhfjgbdkfkikzuqhpb`. Environment variables are needed in `.env` (see `.env.example`).
- **Next.js build fails:** Pre-existing TS error in `web/app/api/heart/[id]/route.ts` (uses `supabase.raw()` which doesn't exist in the current Supabase JS SDK). The dev server still works.
- **No test suite:** Neither project has automated test scripts or test frameworks configured.
