# Next: Product polish and real usage testing

Onboarding + Cockpit are in a good enough state to stop patching and move into product polish and real usage testing. This doc captures the ordered next steps and the first "trust" layer (persistence).

---

## 1. Run the full first-run flow end-to-end

**Test this exact sequence on device:**

1. Fresh install  
2. Onboarding  
3. Legal consent  
4. Quick setup  
5. First check-in  
6. Enter Cockpit  
7. Tap Signals  
8. Send one Transmit  
9. Return to Cockpit  

**Watch for:**

- Broken state after onboarding  
- Missing name / missing gauge data  
- Layout jumps  
- Dead links  
- Slow transitions  

---

## 2. Persistence check (survives app restart)

These should survive app restart. Current implementation:

| Data | Where persisted | Restored by |
|------|-----------------|-------------|
| **Legal consent timestamp** | AsyncStorage `onboarding_legal_consent_at` | Written in onboarding Legal step; can be read for compliance/settings |
| **Onboarding completion** | Supabase `profiles.onboarding_completed` | AuthSync `getProfile()` → `userStore.onboardingCompleted` |
| **Name / birth year (age_group)** | Supabase `profiles.name`, `profiles.age_group` | AuthSync `getProfile()` → `userStore.name`, `userStore.ageGroup` |
| **First check-in values** | AsyncStorage via `cockpitStore` persist (body, state, emotion, connection, direction, alignment) | Zustand rehydration on app load |
| **Last check-in date** | AsyncStorage via `cockpitStore` persist `lastCheckInDate` | Zustand rehydration |

**Trust layer:** Before heavy usage testing, do one manual test: complete onboarding + first check-in → force-quit app → reopen → confirm Cockpit shows correct name, gauges, and “last check-in” state.

---

## 3. Tighten onboarding copy

Structure is in place. Focus on wording:

- Shorter lines  
- Fewer abstract phrases  
- Stronger benefit language  

---

## 4. First real Context inputs (Cockpit context slot)

Cockpit context slot is ready. First three to wire:

- **Sleep**  
- **Life transition**  
- **Stress load**  

These will make Cockpit feel meaningfully smarter quickly.

---

## 5. First-session success metrics

Events to log (so you can see where people drop):

- `onboarding_started`  
- `legal_accepted`  
- `onboarding_completed`  
- `first_checkin_completed`  
- `cockpit_viewed`  
- `first_transmit_sent`  
- `first_signal_opened`  

---

## Product read

You’ve moved from “interesting idea” to “coherent product system.” The biggest risk now is no longer architecture; it’s over-polishing before enough user testing and adding too many new layers before validating daily behavior.

**Smart move:** Stabilize → test → observe → refine.
