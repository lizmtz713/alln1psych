# InGauge — Follow This Lead

Use this as your checklist so the app is ready for Spanish speakers, testers, and Apple.

---

## 1. **App name & product**

- **Public name:** **InGauge** everywhere (app.config.js, constants, i18n, share strings).
- **What it is:** **PHOSM** is the body–mind / cockpit model; **The Human Cockpit** is the tagline. Kept in constants and where it makes sense (not cheesy).
- **Sweep:** Any remaining “AllN1 Psych” in user-facing copy has been reverted to InGauge. If you add new screens, use `APP_CONFIG.name` (InGauge) and `APP_CONFIG.productName` (PHOSM) from `src/lib/constants`.

---

## 2. **Spanish from the start**

- **Device language:** On first launch, if the device language is Spanish, the app sets language to Spanish automatically (no tap needed).
- **User choice:** In **Settings**, users can switch language (English / Español). Once they change it, we no longer override with device language.
- **Coverage:** `src/i18n/en.ts` and `es.ts` have the same keys (gauges, check-in, crisis, onboarding, cycle, heart notes, premium, errors, time, etc.). Screens that use `useI18n()` and `t(key)` will show the selected language. To make **every** screen fully bilingual, gradually replace hardcoded strings with `t('key')` using these keys.
- **AI:** Talk and other AI features already get the current language (e.g. from `getCurrentLanguage()` or adaptive context) so Gauge can respond in Spanish when the app is in Spanish.

**What you can do:** In Settings, confirm the language switcher is easy to find. On a device set to Spanish, install fresh and confirm the app opens in Spanish.

---

## 3. **Integrations**

- **Apple Health:** Me → **Apple Health** (or Settings → Health Integrations → **Apple Health**) opens **health-connections**. Connect there; sleep, activity, heart, and **menstrual** data flow into Body/State and cycle.
- **Menstrual:** Cycle comes from HealthKit (and/or manual entry in Cycle Intelligence). It’s already wired into `buildAggregatedHealthContext` and cockpit AI.
- **Oura:** Me → **Oura Ring** (or Settings → **Oura Ring**) opens **oura-connect**. User can connect (OAuth) or disconnect. To enable OAuth, set **EXPO_PUBLIC_OURA_CLIENT_ID** in your env. Redirect URI is `alln1-psych://oauth/oura`; you’ll need a backend (e.g. Supabase Edge) to exchange the code for a token and then pass the token back to the app (e.g. via deep link) and call `setOuraToken(token)`.
- **Apple Watch:** Me → **Apple Watch** goes to **health-connections** (same as Apple Health). Watch data that syncs to HealthKit will appear there. A dedicated Watch app (e.g. WatchBridge) would need a native iOS Watch target; the app is ready to consume the same health data.

**What you can do:**  
1) Connect Apple Health and add cycle data (or use Cycle Intelligence); run a check-in and confirm Body/cycle context.  
2) For Oura: add `EXPO_PUBLIC_OURA_CLIENT_ID` and implement the token-exchange + deep-link flow so “Connect with Oura” completes end-to-end.

---

## 4. **Performance (no lags / slowdowns)**

- **Docs:** `docs/PERFORMANCE.md` has concrete tips: `useMemo` / `useCallback`, list virtualization (FlatList), selectors for Zustand, moving heavy work off the JS thread, and lighter assets.
- **If something feels slow:** Focus on that screen’s re-renders and any heavy work on the JS thread; apply the PERFORMANCE.md suggestions there first.

**What you can do:** Run the app on a device, go through Home → Check-in → Talk → Learn → Me. If a screen lags, open PERFORMANCE.md and apply the relevant section (e.g. memoize a big list or a heavy computation).

---

## 5. **Copyright & safety**

- **Docs:** `docs/COPYRIGHT-AND-SAFETY.md` covers: original or properly attributed content, no long book excerpts, disclaimers (not medical/therapy), crisis resources, and no diagnose/treat language.
- **In the app:** Onboarding and Settings already state that InGauge is not a medical device and not a replacement for therapy or professional care. Crisis screen has 988, 741741, 911.

**What you can do:** Re-read COPYRIGHT-AND-SAFETY.md and do a quick pass: no copied text from books/sites, and all disclaimers and crisis info present.

---

## 6. **QA & Apple**

- **Checklist:** `docs/QA-APPLE-APPROVAL.md` — concepts/loops, AI + fallbacks, personalization, health (Apple Health, Oura, menstrual), safety, and Apple App Review notes.
- **Run before submit:** Fresh install, sign up → onboarding → check-in → Talk (with and without API key) → Crisis → Me (Health, Oura). Confirm no crashes and clear errors when API is off.

---

## 7. **Quick command reference**

```bash
# Run app
npm start
# then i (iOS) or a (Android)

# Type-check
npx tsc --noEmit
```

---

You’re in a good place: name is InGauge + PHOSM, Spanish works from the start and can be extended screen-by-screen, Apple Health and menstrual are integrated, Oura has a connect flow (token exchange is the only missing piece if you want full OAuth), and you have clear docs for performance, copyright, and QA. Follow this lead and adjust as you ship.
