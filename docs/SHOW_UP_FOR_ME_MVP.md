Paste this into Cursor:

**Feature: How to Show Up for Me**

**Goal:**  
Allow users to invite people (no app required) to answer a short questionnaire about how they prefer to be supported, communicated with, and remembered. Use this data to generate an AI-powered support summary that improves tools like Reach Out, Tone Check, and Relational Bridge.

**Core flow:**
1. User generates invite link for a person  
2. Recipient opens mobile web form (no login)  
3. Recipient answers short questionnaire  
4. Data saved in Supabase  
5. AI generates support summary  
6. Summary appears in People → person detail  
7. Tools use this context to personalize outputs  

**Key requirements:**
- Frictionless guest experience  
- Short questionnaire (2–3 minutes)  
- Actionable summary (not raw data)  
- Integrated into communication tools  

---

# How to Show Up for Me — MVP (implemented)

**Product insight:** This moves someone from **guessing** how to show up → **knowing** how to show up. It’s distinctive, solves a real problem, ties into the rest of the system, and gets used again and again as relationships evolve.

**Goal:** Inviter sends a **no-download** link; responder completes a **mobile-first** questionnaire; answers become a **Support summary** in InGauge and feed **Reach Out** + **Tone Check**.

**Guest UX (completion):** Intro screen states value *before* questions (“This helps me know: …”). Completion screen reminds responders they can **update anytime** and should **save the link** for control.

## What was built

| Area | Details |
|------|--------|
| **Database** | `supabase/migrations/20260316_show_up_preferences.sql` — `show_up_invites`, `show_up_responses`, `show_up_summaries`, RLS for owner, RPCs `get_show_up_invite_preview` + `submit_show_up_response` for **anon** guests |
| **Guest web** | `app/show-up/[token].tsx` + `ShowUpGuestQuestionnaire` — core flow + optional deeper section, privacy copy, consent checkbox, **value-first intro** + **post-completion control copy** |
| **Inviter** | `app/lights/[id]/show-up.tsx` — create link (copy/share), view AI summary, shortcuts to Reach Out & Tone Check |
| **People** | `app/lights/[id].tsx` — card **How to show up for them** → show-up screen |
| **AI summary** | `src/services/showUpAI.ts` — structured JSON → stored in `show_up_summaries` (generated when inviter opens show-up screen if missing) |
| **Reach Out** | `reach-out-scaffold.tsx` — `showUpPersonId` / `showUpPersonName` params + banner + AI prompt context |
| **Tone Check** | `showUpContext` param (URI-encoded) → `analyzeToneForMessage` `recipientPreferenceContext` |
| **Relational Bridge** | Fetches summary for selected Circle member; **What they shared** card; `augmentBridgeWithShowUpPreferences()` blends communication, repair, avoid, stress-help into openers / phrases / repair; shortcut to Tone Check with preferences |

## Deploy checklist

1. **Run migration** in Supabase SQL editor (or CLI).
2. **Set `EXPO_PUBLIC_APP_URL`** to the URL where **Expo web** (or your hosted web build) serves `/show-up/:token` — e.g. `https://getingauge.com`. Invite links use this base.
3. **Web build:** `npx expo export --platform web` (or your CI) and host so `/show-up/[token]` resolves.
4. **OpenAI:** Inviter needs BYO key (or edge path later) for summary + Tone Check.

## Routes

- Guest: **`/show-up/:token`**
- In app: **`/lights/:id/show-up`** (from person profile)

## Not in MVP (per product spec)

Responder accounts, shared dashboards, couples sync, public profiles, DM from web form, deep personality testing.

## Guest completion: two different links (product note)

- **Copy invite message** — pass-along growth copy + app URL. Safe to share with a friend. **Not** the token URL.
- **Copy my private update link** — token URL to **change your own answers** for the inviter only. Keep private (not for group chats).

## Organic growth loop (designed in product)

**Target path:** Invite → Answer → **Feels good** → **Shares** → Repeats — not “I filled out a survey.”

| Element | Implementation |
|--------|----------------|
| **Completion moment** | Guest sees: *You just made it easier for someone to show up for you* + *Most people never know how to do that* — share-worthy framing. |
| **Reciprocity nudge** | Short “two-way street” copy: they know how to show up for you; you can explore showing up for them too (conversation, no forced form). |
| **Growth CTAs** | *Want to send this to someone you care about too?* → **Copy invite message** (pass-along + app URL), **Send to a friend** (Share sheet), **Not now** — separate from **private update link**. |
| **Pass-along copy** | `getGuestPassAlongShareMessage()` — human, intentional, not spammy; points to `EXPO_PUBLIC_APP_URL`. |
| **Micro preview (intro)** | Value bullets + *A few quick questions — then you're done* + privacy line. |
| **Inviter reward** | After completion: *You now know how to show up for [Name] better* + **At a glance** highlight (`buildInviterHighlightLine`). |
| **Usage loop** | Inviter: **Did this help you show up better?** (`DidThisHelp` on person show-up screen). |

**Later (not MVP):** Circle momentum (e.g. *5/15 close relationships set up*) tied to Dunbar tiers.

**Avoid:** fake gamification, forced invites, aggressive share prompts, long surveys. Keep it **intentional, personal, human**.

**Why it spreads:** Curiosity, care, self-expression, reciprocity — *“I want you to understand me better”* — not *“download an app.”*

**Opportunity:** This can be the **social layer** of InGauge — not social media, but **human connection infrastructure** — something rarer than chasing engagement: **increasing real connection between people.**

## Cursor build prompt (reference)

Use this doc + `TOOL-QUALITY-STANDARD.md` for tone. Extend later: Signals / Cockpit nudges for show-up, tier-specific question sets (5/15/50/150).
