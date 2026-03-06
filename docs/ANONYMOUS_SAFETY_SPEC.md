# Anonymous Messaging — Safety Design Spec

**Rule: Anonymous is allowed for kindness, not ambiguity.**

Anonymous messaging in InGauge must feel like **protected encouragement**, not mystery or social drama. These rules apply when we implement or expand anonymous sending.

---

## 1. Core Principle

**Constrain anonymous enough that it builds trust, not curiosity or fear.**

Apps get into trouble when anonymous creates: fear, obsession, social guessing, harassment, emotional manipulation. We avoid that by design.

---

## 2. Hard Rules

### 2.1 Who can receive

- **Anonymous only to people already in the user’s circle.** No sending to strangers or contacts outside the app’s relationship set.

### 2.2 Allowed intents (whitelist)

Anonymous is **only** from approved intent types:

- Appreciate  
- Encourage  
- Support  
- Gratitude  

No criticism, romantic ambiguity, conflict, accusations, jealousy-provoking content, “guess who,” or vague emotional bait.

### 2.3 No freeform by default

- Prefer **guided prompts** and **short templates**.
- If we allow editable text: **safety filters** and tone guidance (supportive only).

### 2.4 Rate limits

- Example: **max 1 anonymous note per person per 7 days.**
- Small **daily cap overall** (e.g. 3–5 anonymous sends per day per user).

### 2.5 Recipient controls

Recipients must be able to:

- **Turn anonymous off** (global or per circle).
- **Mute** anonymous from certain circles.
- **Archive** without replying.

### 2.6 No identity-guessing mechanics

- **Never** encourage “guess who sent this,” sender hints, or engagement loops around mystery.
- No read receipts or pressure to reply.

### 2.7 No read-pressure

- Frame as **“No reply needed”** / **“Just a note of support.”**
- Anonymous should not create obligation.

---

## 3. What to Allow (examples)

- “Someone in your circle appreciates how steady you are.”
- “You made a bigger difference than you know.”
- “Someone is rooting for you today.”

Emotionally safe, supportive, clear that it’s from the circle.

---

## 4. What Not to Allow (examples)

- “Someone likes you.”
- “You hurt someone.”
- “You should know what you did.”
- “Guess who misses you.”

These create anxiety, not connection.

---

## 5. UX Placement

- In Transmit flow, **modes** can be: **From you** (default) | **Soft share** | **Glimpse** | **Anonymous**.
- Under **Anonymous**, show: *“Anonymous is for encouragement and appreciation only.”*
- Anonymous should feel like a **thoughtful alternative**, not the main path.

---

## 6. Summary Table

| Rule | Requirement |
|------|-------------|
| Recipients | Circle members only |
| Intents | Appreciate, Encourage, Support, Gratitude only |
| Content | Template-guided; no freeform without safety filters |
| Frequency | 1 per person per 7 days; small daily cap |
| Recipient controls | Turn off, mute, archive without replying |
| No guess-who | No sender hints or mystery loops |
| No pressure | “No reply needed” framing |

---

## 7. When Implementing

- Enforce whitelist and rate limits in backend or client logic.
- Store anonymous sends with no sender identity exposed to recipient; support “turn off anonymous” and “mute” in settings.
- Copy and moderation should reinforce supportive tone only.
