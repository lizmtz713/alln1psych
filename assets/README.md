# AllN1 Psych – App assets

Placeholder assets are present so EAS Build succeeds. Replace with final designs before release.

## Required files

| File | Size | Notes |
|------|------|--------|
| `icon.png` | 1024×1024 | App icon. Dark (#0F0B1E) + lavender (#7C4DFF). No transparency for iOS. |
| `splash.png` | 1284×2778 | Splash screen. Dark bg, “AllN1 Psych” white, tagline “You Are Not Alone.” |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon. Same as icon with safe padding for cropping. |
| `notification-icon.png` | 96×96 | **Android only:** white-only shape on transparent background (single color). |
| `favicon.png` | 48×48 | Web favicon. |

## Notification icon (Android)

For `expo-notifications`, use a **white silhouette on transparent** (e.g. heart or “AP”). No other colors.

## EAS / env

- Set `EAS_PROJECT_ID` in EAS secrets or in `.env` for `app.config.js`.
- Supabase: use `eas secret:create` for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` if needed.
