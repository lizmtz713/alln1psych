# Mind Mail Safety — Spec

**Issue:** Emotional and physical safety for senders and receivers of Mind Mail (heart mail / anonymous notes).

## 1. Receive settings

- **Accept from:** `anyone` | `circle` | `nobody`.
  - **anyone:** Can receive from anonymous and from circle.
  - **circle:** Only from people in the user's circle (no anonymous).
  - **nobody:** Disable receiving (or hide inbox).
- Stored per user (e.g. `mind_mail_receive_setting` or on `profiles`).

## 2. 10-minute cooldown for anonymous messages

- After sending one **anonymous** message, sender cannot send another anonymous message for 10 minutes (per receiver or global — specify in product).
- Reduces spam and heat-of-the-moment flooding.
- Cooldown stored client-side or server-side (e.g. `anonymous_sends` table with `sent_at`).

## 3. Emotional safety check before send

- Before sending (especially anonymous): short in-app step.
  - e.g. "Is this kind? Is this something you'd say to their face?" or "Take a breath. Send when ready."
- Optional: delay send by 5–10 seconds (confirmation step).
- No hard block; gentle nudge.

## 4. Content warning system for receivers

- Sender can mark a message as **sensitive** (content warning).
- Receiver sees "This message may contain sensitive content" with option to "Show" or "Dismiss".
- Stored on message: `content_warning: boolean` or `sensitive: boolean`.

## 5. Block sender

- Receiver can **block** a sender (by sender user id or anonymous id).
- Blocked senders cannot send to this receiver again.
- **Works for anonymous:** Anonymous sends get a stable anonymous id (e.g. device/session-based) so block applies to that anonymous sender.
- Block list stored per user (e.g. `blocked_sender_ids` or `mind_mail_blocks` table).

## 6. Report & crisis detection

- **Report:** Receiver can report a message (harassment, abuse, etc.). Report stored and optionally sent to moderation or support.
- **Crisis detection:** If message content (or sender’s prior messages) triggers crisis keywords, follow app crisis protocol (e.g. show 988, Crisis Text Line, 911; don’t diagnose).
- Outbound: if **sender** is in crisis, detect in compose/send flow and show resources before sending.

## 7. Database schema (outline)

- **profiles:** `mind_mail_receive_setting` (anyone/circle/none), optional `mind_mail_content_warning_default`.
- **mind_mail_messages** (or equivalent): `sender_id` (nullable for anonymous), `anonymous_sender_token`, `receiver_id`, `content`, `content_warning`, `created_at`, `reported_at`, etc.
- **mind_mail_blocks:** `user_id`, `blocked_id` (user_id or anonymous token), `created_at`.
- **anonymous_sends:** `anonymous_token`, `receiver_id`, `sent_at` (for cooldown).
- **mind_mail_reports:** `message_id`, `reporter_id`, `reason`, `created_at`.

---

**Files to touch:** Settings screen (receive + content warning), send flow (cooldown, emotional check, content warning flag), inbox (content warning UI, block, report), Supabase migrations (tables above), crisis pipeline integration.
