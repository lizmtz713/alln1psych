#!/usr/bin/env bash
# Device/simulator QA: Pass 2–5 from docs/RELEASE-CHECKLIST.md
# Run this after starting the app (e.g. npx expo run:ios or npm start + device).
# Use the checklist interactively; this script prints it and build steps.

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== Pass 1 (already run) ==="
echo "  npm run audit"
echo "  npx --yes expo-doctor@1.20.0"
echo "  npm audit --omit=dev --audit-level=high"
echo ""

echo "=== Pass 2: Build health ==="
echo "  1. Build iOS:  npx expo run:ios"
echo "  2. Or start dev: npm start, then press 'i' for iOS simulator"
echo "  Then verify: cold start, no red screen, production env, auth, onboarding, Cockpit, AI timeout/offline fallback"
echo ""

echo "=== Pass 3: Release-critical smoke ==="
echo "  See docs/RELEASE-CHECKLIST.md — tick each item on device."
echo ""

echo "=== Pass 4: Critical flows ==="
echo "  Onboarding, Auth, atomic Cockpit save/retry, export/delete, account switching, Emergency."
echo ""

echo "=== Pass 5: Edge cases ==="
echo "  AI timeout, HealthKit deny, first install, invalid birthday, failed consent save, empty state, offline retry."
echo ""

echo "=== Before TestFlight: git ==="
echo "  git status"
echo "  See the cloud deployment and TestFlight commands in docs/RELEASE-CHECKLIST.md"
echo ""
echo "Checklist: docs/RELEASE-CHECKLIST.md"
