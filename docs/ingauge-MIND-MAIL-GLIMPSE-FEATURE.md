# Mind Mail — Glimpse (View-Once) Mode

**Tagline:** *Say it once. Then let it go.*

Like Snapchat for emotional messages — "disappearing mail" with intention. A differentiator: nobody else does view-once emotional mail with this level of care.

---

## Concept

- **Sender** chooses **Glimpse** when composing a Mind Mail.
- **Recipient** gets a notification: "You have a Glimpse message."
- They tap to view → message appears for **X seconds** (based on length).
- A **timer** is visible; the message **fades/dissolves** when time is up.
- **Can't re-read** — marked as "viewed" forever. No history of content.

**Why it's powerful:**

- Say something vulnerable without it living forever.
- Sender feels safer being honest.
- Recipient can't obsess, screenshot, or forward.
- "I said what I needed to say. Now it's gone."

---

## Data Model

### SendType (extend)

```ts
type MindMailSendType =
  | 'open'       // Normal — they see who sent it
  | 'anonymous'  // Hidden sender
  | 'soft'       // Accept first (soft share)
  | 'glimpse';   // View once, timed — then gone
```

### HeartNote / HeartMail (Glimpse-specific)

For `sendType === 'glimpse'`:

- **glimpseViewSeconds** — number (e.g. 5–60). Default from content length: e.g. `max(5, min(60, Math.ceil(content.length / 20)))`.
- **glimpseViewedAt** — ISO string or null. Once set, content must not be returned to client (or return placeholder: "This message was viewed and is no longer available").
- **Store content server-side only** until viewed; after view, optionally delete or redact content and keep only metadata (sender, recipient, viewedAt) for "you had a Glimpse from X" in activity.

### Backend (Supabase)

- Table `heart_notes` / `heart_mail`: add columns `glimpse_view_seconds`, `glimpse_viewed_at`, and ensure API never returns `content` when `glimpse_viewed_at` is set.
- Alternatively: separate table for glimpse content, deleted or redacted after first view.

---

## User Flows

### 1. Sender: Compose with Glimpse

- In [app/mind-mail/compose.tsx](app/mind-mail/compose.tsx), add **Glimpse** to send options:
  - `SEND_OPTIONS`: add `{ id: 'glimpse', label: 'Glimpse' }`.
- Short explainer: "They can view it once for a few seconds. Then it's gone."
- Optional: let sender pick duration (e.g. 5 / 10 / 15 / 30 sec) or auto from length.
- On send: `sendType: 'glimpse'`, store `glimpseViewSeconds` (and content server-side as today).

### 2. Recipient: Notification

- Push (or in-app): "You have a Glimpse message" (no preview of content).
- Tapping opens Mind Mail inbox or a dedicated Glimpse view.

### 3. Recipient: View Once

- **Screen:** Full-screen, minimal chrome. Content in center.
- **Timer:** Visible (e.g. progress ring or countdown "5… 4… 3…").
- **Duration:** X seconds from `glimpseViewSeconds`.
- When time ends: message **fades out** (opacity animation). Then:
  - Mark as viewed on server (`glimpse_viewed_at`).
  - Replace content with: "This message was viewed and is no longer available."
- **No re-open:** If they leave the screen before time ends, still count as "viewed" once the view screen was shown (or define policy: only "viewed" if they stayed until fade-out).

### 4. Sender: Receipt

- Optional: "Your Glimpse was viewed" (no content, no replay). Builds trust that it was seen.

---

## Screenshot & Copy Deterrents

Not perfect, but they raise the bar and set norms:

| Measure | Implementation note |
|--------|----------------------|
| **Blur on background** | When app goes to background (or Glimpse view loses focus), blur or obscure content. |
| **Screenshot detection** | Listen for screenshot (e.g. `userCaptureScreen` or platform APIs where available). Show "Screenshot detected" to **sender** (recipient sees nothing). Consider one-time notice in app. |
| **No copy/paste** | Glimpse view: disable text selection and copy. Use non-selectable `Text` or overlay. |
| **Harder to capture** | Optional: animated reveal (e.g. word-by-word or line-by-line), or subtle motion so a single screenshot is less useful. |

**Copy:** In UI, explain: "Glimpse messages can't be copied or saved. What you see is what you get — once."

---

## Screens / Components

1. **Compose** — Add Glimpse to send type picker; optional duration picker; short explainer.
2. **Inbox / List** — Glimpse items show "Glimpse from [Name]" or "Someone sent you a Glimpse"; no body preview. Badge or icon (e.g. 👁️ or "View once").
3. **Glimpse View (recipient)** — New screen or modal:
   - Full-screen, dark background.
   - Content only + countdown/timer.
   - Fade-out animation; then redirect and mark viewed.
4. **Sender receipt** — Optional "Glimpse viewed" in sent list or activity.

---

## API / Store

- **heartNotesStore** (and Mind Mail re-exports):
  - `SendType`: add `'glimpse'`.
  - `sendNote(id, sendType)`: when `sendType === 'glimpse'`, pass `glimpseViewSeconds` (and store on note/mail).
- **Supabase**: 
  - Insert/update with `glimpse_view_seconds`, `glimpse_viewed_at` (null until view).
  - When returning mail/notes, if `glimpse_viewed_at` is set, omit or redact `content` and return a placeholder.
- **View endpoint**: When recipient opens Glimpse, return content once; then immediately set `glimpse_viewed_at` (or after client confirms "view completed"). Subsequent fetches never return content.

---

## Edge Cases

- **Offline:** If recipient opens Glimpse while offline, content may be cached; mark viewed when back online and don’t re-serve content.
- **App kill during view:** Define policy: mark viewed when view screen is opened, or only when timer completes. Recommendation: mark viewed on **open** so they can’t re-open to read again.
- **Anonymous + Glimpse:** Allowed; sender still gets "Glimpse viewed" if we do receipts (no identity revealed).

---

## Implementation Order

1. **Types & store** — Add `'glimpse'` to `SendType`; add `glimpseViewSeconds` (and optionally `glimpseViewedAt`) to note/mail types and DB.
2. **Compose** — Glimpse option + explainer + optional duration.
3. **Backend** — Save glimpse fields; when returning mail, redact content if `glimpse_viewed_at` set.
4. **Glimpse view screen** — Timer, content, fade-out, call "mark viewed" API.
5. **Notification** — "You have a Glimpse message."
6. **Deterrents** — Blur on background, no copy/paste, then optional screenshot detection and animated reveal.

---

## Summary

| Item | Detail |
|------|--------|
| **SendType** | Add `'glimpse'` |
| **Duration** | Per-message (e.g. 5–60 s), from length or picker |
| **View rule** | One view, X seconds, then content gone |
| **Deterrents** | Blur on background, no copy/paste, optional screenshot notice to sender |
| **Differentiator** | Disappearing emotional mail with intention — "say it once, then let it go." |
