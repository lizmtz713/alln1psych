#!/usr/bin/env bash
# Device/simulator QA: Pass 2–5 from docs/RELEASE-CHECKLIST.md
# Run this after starting the app (e.g. npx expo run:ios or npm start + device).
# Use the checklist interactively; this script prints it and build steps.

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== Pass 1 (already run) ==="
echo "  npm run audit && npm run lint && npx expo-doctor"
echo ""

echo "=== Pass 2: Build health ==="
echo "  1. Build iOS:  npx expo run:ios"
echo "  2. Or start dev: npm start, then press 'i' for iOS simulator"
echo "  Then verify: cold start, no red screen, no env errors, auth, onboarding, Cockpit, AI fails gracefully without API key"
echo ""

echo "=== Pass 3: Smoke (Cockpit, Signals, People, Tools, Learn, Me) ==="
echo "  See docs/RELEASE-CHECKLIST.md — tick each item on device."
echo ""

echo "=== Pass 4: Critical flows ==="
echo "  Onboarding, Auth, Emergency, Foundation, Moved routes."
echo ""

echo "=== Pass 5: Edge cases ==="
echo "  No API key, no Health/Oura, first install, skip onboarding, empty People, no wearable, no lessons, offline."
echo ""

echo "=== Before TestFlight: git ==="
echo "  git status"
echo "  git add ."
echo "  git commit -m \"Release candidate QA sweep\""
echo "  git checkout -b release/internal-test-1"
echo "  git tag v0.1.0-internal.1"
echo "  git push --follow-tags origin release/internal-test-1"
echo ""
echo "Checklist: docs/RELEASE-CHECKLIST.md"
