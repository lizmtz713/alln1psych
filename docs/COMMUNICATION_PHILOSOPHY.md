# Communication Philosophy — Apple vs InGauge

**Product principle: Apple handles communication. InGauge handles connection.**

---

## 1. The Split

| Layer | Who owns it | What it does |
|-------|-------------|--------------|
| **Relationship intelligence** | InGauge | Signals, Constellation, Momentum, Seasons, Hero, who needs attention, better prompts |
| **Delivery** | Apple (or native) | Text (Messages), Call (Phone), Email (Mail) |

InGauge stays the **brain** of the relationship system. Apple Contacts and native Message/Call/Email flows are the **delivery layer**. We do not try to be a full messaging platform or a parallel inbox.

---

## 2. Why This Is Better

- **Trust** — Users already trust Apple’s communication surfaces. Handoff to familiar flows removes friction.
- **Focus** — Our differentiator is relationship signals, momentum, seasons, hero nudges, and guided prompts — not another inbox.
- **Simplicity** — Using Contacts + native compose/handoff avoids owning delivery, threading, receipts, sync, spam, blocking, and social edge cases.

---

## 3. Person Sheet Action Hierarchy

Actions are structured so the distinction is clear:

**Reach them directly** (native rails)

- **Text** — Opens Messages (`sms:`). Shown only if we have phone.
- **Call** — Launches Phone (`tel:`). Shown only if we have phone.
- **Email** — Opens Mail (`mailto:`). Shown only if we have email.

**Share thoughtfully** (InGauge layer)

- **Transmit** — Primary CTA. Guided relational action (encouragement, appreciation, support, repair, etc.). Stays inside InGauge.
- **Or choose another** — Appreciate, Support, Repair, Celebrate, etc. These open Transmit with that intent or other InGauge flows.

So: quick check-in → Text. Longer thoughtful note → Email. Emotionally guided support → Transmit. Urgent/high warmth → Call.

---

## 4. What Native Cannot Do

Apple messaging does **not** provide:

- Guided appreciation / encouragement prompts  
- Repair scaffolds  
- Season-aware nudges  
- Glimpse / soft-share / temporary view  
- Anonymous supportive notes  

So **Transmit** (and future Anonymous/Glimpse/Soft share) remain InGauge’s unique value. We do not remove Transmit in favor of only native actions.

---

## 5. Anonymous and InGauge-Only Channels

Anonymous messaging **cannot** go through Apple (identity is always exposed). So:

- **Direct communication** (identity known): Text, Call, Email → Apple.
- **InGauge communication** (identity optional or relational): Transmit, Anonymous note, Glimpse, Soft share → our system.

Anonymous must stay inside InGauge and be heavily constrained (see ANONYMOUS_SAFETY_SPEC.md).

---

## 6. What We Avoid

- Positioning InGauge as a **parallel communications destination** (another inbox to check).
- Replacing Signals or Transmit with “just use Apple.”
- Building a full in-app messaging stack when native handoff is enough for direct reach-out.

---

## 7. Technical Notes

- **Contacts:** Use Apple Contacts (e.g. CNContactStore) for read/sync; `Light` already has `phone`, `email`, `contactId`.
- **Handoff:** `Linking.openURL` for `tel:`, `sms:`, `mailto:` — used in Person Detail Sheet and Constellation Person Card.
- **Compose:** On iOS, `sms:` and `mailto:` open the system compose UI; `tel:` launches Phone (user confirms before dialing). No need for MFMessageComposeViewController / MFMailComposeViewController unless we want an in-app compose surface; handoff is enough for “Reach them directly.”

---

## 8. One-Line Summary

**Apple handles communication. InGauge handles connection.**
