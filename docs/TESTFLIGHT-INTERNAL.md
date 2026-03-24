# TestFlight Internal Testing — Checklist

**Setup:** This project is **Expo with EAS**. Use the steps below for your first or next internal TestFlight upload.

**Before you start:** Confirm whether this is your **first ever** iOS/TestFlight upload or an **update** to an existing app. For first upload use `version: "0.1.0"` (or `"1.0.0"`) and `buildNumber: "1"`. For updates, keep or bump `expo.version` and **always increase** `ios.buildNumber`.

---

## 1. Save everything with git (do this first)

```bash
git status
git add .
git commit -m "Prepare internal TestFlight build"
git checkout -b release/testflight-internal-1
git tag v0.1.0-internal.1
git push --follow-tags origin release/testflight-internal-1
```

If your default branch is `main` and you prefer to tag from `main` after committing:

```bash
git checkout main
git status && git add . && git commit -m "Prepare internal TestFlight build"
git push origin main
git checkout -b release/testflight-internal-1
git tag v0.1.0-internal.1
git push --follow-tags origin release/testflight-internal-1
```

This gives you a clean restore point and keeps docs (architecture, route map, etc.) in the repo.

---

## 2. Bump version and build number

Edit **`app.config.js`** (this project’s source of truth; `app.json` may be overridden by it):

- **`expo.version`** — user-facing App Store version (e.g. `"0.1.0"` for first internal, or `"1.0.0"`).
- **`ios.buildNumber`** — iOS build number (CFBundleVersion). Use `"1"` for first upload; for every **subsequent** upload, increment (e.g. `"2"`, `"3"`).

Example for **first** internal:

```js
version: '0.1.0',
// ...
ios: {
  // ...
  buildNumber: '1',
```

Example for **update**:

```js
// version: leave as-is or bump if you’re doing a new store version
ios: {
  buildNumber: '2',  // was '1'
```

**Note:** Your `eas.json` has `"appVersionSource": "remote"`. You can still set these in `app.config.js` for this internal build so the tag matches a known state. EAS can auto-increment later if you switch to that.

---

## 3. Run the safety gate

```bash
npm run audit
npm run lint
```

If `expo lint` does network-dependent checks and fails in a restricted environment, run `npm run lint` on your machine (or with network allowed). Fix any failures before building.

---

## 4. Build for iOS (EAS)

Use the **testflight** profile (store distribution, real device):

```bash
eas build --platform ios --profile testflight
```

Or, if you use a **production** profile for TestFlight:

```bash
eas build --platform ios --profile production
```

Wait for the build to finish in EAS. You’ll get a build ID and a link.

---

## 5. Submit to App Store Connect / TestFlight

After the build succeeds:

```bash
eas submit --platform ios --profile production --latest
```

Or submit a specific build:

```bash
eas submit --platform ios --profile production --id <BUILD_ID>
```

Your `eas.json` has `submit.production.ios` with `appleId` and `appleTeamId`; EAS will use these. The build will appear in App Store Connect → TestFlight after processing.

---

## 6. Add yourself as an internal tester

1. Open [App Store Connect](https://appstoreconnect.apple.com).
2. Your app → **TestFlight**.
3. **Internal Testing** → create or open a group (e.g. “Internal”).
4. Add yourself (and up to 100 App Store Connect team members) if not already in the group.
5. Add the **build** you just submitted to that group. Internal testers can receive builds automatically.

---

## 7. Add test info (optional)

In TestFlight, use **Provide test information** to add notes for yourself and future testers (what’s in this build, what to try, known issues).

**Suggested test info snippet (copy/paste or adapt):**

- **How to Show Up for Me:** People → open a person → “How to show up for them” → create link (signed in). Open link on phone browser (or Safari) → complete questionnaire → confirm summary appears in app. Try completion flow: “Copy invite message” vs “Copy my private update link.”
- **Relational Bridge:** Tools → Relational Bridge → pick someone who completed How to Show Up → confirm teal “What they shared” card and that openers / phrases / repair reflect their preferences. Use “Tone Check with their preferences” from that card.
- **Needs:** Supabase migration `20260316_show_up_preferences.sql` applied; `EXPO_PUBLIC_APP_URL` set for web invite links; OpenAI key for summaries.

---

## 8. Install and test

Install the build from the TestFlight app on a real device and run through the main flows (tabs, Tone Check, temperature visibility, etc.).

**Include in this internal pass:** **How to Show Up for Me** (invite → web → summary → inviter “Did this help?”) and **Relational Bridge** with a person who has a show-up summary (card + augmented bridge + Tone Check shortcut).

---

## Quick reference

| Step | Command or action |
|------|--------------------|
| 1. Git | `git add . && git commit -m "..." && git checkout -b release/testflight-internal-1 && git tag v0.1.0-internal.1 && git push --follow-tags origin release/testflight-internal-1` |
| 2. Version | Set `expo.version` and `ios.buildNumber` in `app.config.js` |
| 3. Gate | `npm run audit && npm run lint` |
| 4. Build | `eas build --platform ios --profile testflight` |
| 5. Submit | `eas submit --platform ios --profile production --latest` |
| 6–7. ASC | App Store Connect → TestFlight → Internal group → add build, test info |
| 8. Test | Install from TestFlight on device |

---

## If something goes wrong

You have a tagged branch (`release/testflight-internal-1`, tag `v0.1.0-internal.1`) to restore from. To try again from that state:

```bash
git checkout release/testflight-internal-1
# or
git checkout v0.1.0-internal.1
```

Then fix issues, bump `buildNumber` if you already submitted a build, and repeat from step 3 or 4.
