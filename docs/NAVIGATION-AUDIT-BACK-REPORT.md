# Back Navigation Audit Report

**Date:** March 2025  
**Scope:** All screens in `app/`, including tabs, modals, profile, lights, love-history, news-my-way, body-maintenance, emergency, rituals, mind-mail, toolkit, your-story, lesson, insight, flight-log, auth.

---

## Summary

- **Stack with header (back from OS/Expo):** lights, love-history, news-my-way, body-maintenance.
- **Stack with headerShown: false:** modals, profile, mind-mail, your-story, lesson, emergency, rituals, flight-log. These rely on **manual back/close** or **gesture** (modals: swipe down).
- **Root layout:** headerShown: false globally.

---

## By area

### app/(tabs)/ — Tab roots
- **index, talk, learn, lights, circle, me** — Tab entry points; no back needed. ✅

### app/(modals)/ — Modals (headerShown: false, gestureEnabled: true)
All modals have **gesture** (swipe to dismiss). Most also have **manual back or close** in the UI:

| Screen | Navigation |
|--------|------------|
| onboarding | ✅ (arrow-back in UI) |
| mood-checkin | ✅ Cancel / router.back() |
| invite-circle | ✅ arrow-back |
| new-journal | ✅ arrow-back, cancel, done |
| role-play | ✅ arrow-back, close |
| activity | ✅ arrow-back, done (many steps) |
| help-someone | ✅ arrow-back, close |
| cockpit-checkin | ✅ arrow-back |
| gauge-detail | ✅ arrow-back |
| replay | ✅ arrow-back, close |
| decode | ✅ arrow-back |
| relate | ✅ arrow-back |
| love | ✅ close / arrow-back (mode toggle) |
| history | ✅ arrow-back |
| weekly-insight | ✅ close |
| resolve | ✅ (back in UI) |
| health-connections | ✅ (back in UI) |
| notification-settings | ✅ (back in UI) |
| heart-inbox, heart-mail-detail, heart-mail-compose | ✅ back/close |
| awards, awe-activities, crisis-resources, cycle | ✅ back/close |
| debrief, drift-detector, identity-setup | ✅ arrow-back / close |
| learning-style-quiz, patterns | ✅ back/close |
| pre-conversation-check, prompt-generator, quick-reset | ✅ back/close |
| reach-out-scaffold, referee, relational-bridge | ✅ back/close |
| settings | ✅ arrow-back |
| share-insight, share-snapshot, sovereignty-report | ✅ back/close |
| therapist-share, therapist-share-create | ✅ back/close |
| phosm-state, phosm-emotion, phosm-body, heart-view | ✅ back/close |

### app/profile/ (headerShown: false)
- **index** — Has back (to tabs). ✅  
- **identity, how-you-connect, what-gives-life, sensitive, in-your-own-words** — Manual back (chevron-back). ✅  
- **gauges/body, state, emotion, connection, direction, alignment** — Manual back. ✅  
- **gauges/direction-discovery, alignment-discovery** — **FIXED:** Intro step now has chevron-back to profile. ✅  
- **gauges/goals, preferences** — Manual back. ✅  

### app/lights/ (headerShown: true)
- **[id], add, log-entry, insights, learn, world** — Stack header back. ✅  
- **tiers/five, fifteen, fifty, network** — Stack header back. ✅  
- **family/index, create, [familyId]/index, settings, coordinate, patterns** — Stack header back; some also have “Back” link in error states. ✅  

### app/love-history/ (headerShown: true)
- **index, add, [id], patterns, insights** — Stack header back; [id] and add also use router.back() in flows. ✅  

### app/news-my-way/ (headerShown: true + headerLeft)
- **index, settings** — headerLeft with arrow-back. ✅  

### app/body-maintenance/ (headerShown: true)
- **index, [routineId], providers/[id], add-routine, add-provider** — Stack header back; error/delete flows use router.back(). ✅  

### app/emergency/ (headerShown: false)
- **index** — “Exit Emergency Mode” (router.replace). ✅  
- **crisis, breathe, reach-out** — Manual back (chevron-back). ✅  

### app/rituals/ (headerShown: false)
- **pre-flight, post-flight** — Manual back (chevron-back). ✅  

### app/flight-log/ (headerShown: false)
- **index** — Manual back (chevron-back). ✅  

### app/mind-mail/ (headerShown: false)
- **index** — chevron-back. ✅  
- **[id]** — arrow-back. ✅  
- **compose** — close (modal). ✅  

### app/your-story/ (headerShown: false)
- **index** — Entry. ✅  
- **edit/[field]** — close. ✅  

### app/lesson/ (headerShown: false)
- **[id]** — arrow-back (multiple steps). ✅  

### app/insight/ (root Stack, no dedicated layout)
- **[code]** — **FIXED:** Added arrow-back (top-left) on loading, error, and main content. ✅  

### app/(auth)/
- **sign-in, sign-up, forgot-password** — Auth flow; back/dismiss as appropriate. ✅  

---

## Fixes applied

1. **app/insight/[code].tsx**  
   - Added `useRouter` and a back button (arrow-back) in the top-left.  
   - Shown on loading, error, and main content (position: absolute; safe area respected).  

2. **app/profile/gauges/alignment-discovery.tsx**  
   - Intro step had no way to leave.  
   - Added a Pressable with `chevron-back` that calls `router.back()` at the top of the intro view.  

3. **app/profile/gauges/direction-discovery.tsx**  
   - Same as alignment-discovery.  
   - Added Ionicons import and a Pressable with `chevron-back` on the intro step.  

---

## Pattern for manual back

```tsx
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const router = useRouter();

<Pressable onPress={() => router.back()} style={{ padding: 8 }} hitSlop={8}>
  <Ionicons name="arrow-back" size={24} color={COLORS.text} />
</Pressable>
```

For modals, many screens use `Ionicons name="close"` instead of `arrow-back`.
