# InGauge Data Policy

Data classification, retention, permissions, and privacy. This doc aligns with **GDPR** and **CCPA** and is the source of truth for the governance matrix labels (see [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md)).

---

## 1. Data classification

Use these classes for compliance and security design. A route can have more than one.

| Class | Meaning |
|-------|---------|
| **Public** | Non-personal info (e.g. shared insight view, anonymous aggregates). |
| **Personal** | User identity (name, email, profile, preferences). |
| **Behavioral** | Usage patterns (check-in frequency, tool use, session length). |
| **Emotional** | Feelings, reflections, journal, conversation content, gauge scores. |
| **Biometric** | Wearables data (Apple Health, Oura — sleep, HRV, readiness). |
| **Relational** | Relationship information (contacts, Lights, Mind Mail, datesume, love history). |

**Examples:** Talk → Emotional + Personal. Oura integration → Biometric. Mind Mail → Relational + Emotional. Crisis resources → minimal logging (see Retention).

---

## 2. Retention policy

Define per feature; final durations TBD. Every route must have a retention category.

| Retention | Meaning | Example routes |
|-----------|---------|----------------|
| **User-controlled deletion** | User can delete anytime; no fixed expiry. | Talk (conversation history), Journal, Mind Mail. |
| **Permanent unless deleted** | Stored until user deletes or account closure. | Profile, Your Story, Love History, Lights. |
| **Long-term history** | Kept for history/insights; user can export/delete. | Flight Log, Timeline, Check-in history, Patterns. |
| **Temporary logging** | Short retention for safety or ops; then purge or anonymize. | Crisis-related logs, debug/analytics (per policy). |
| **None** | No persistent storage of user data on this route. | Crisis resources (view-only), Disclaimer. |

---

## 3. Device permissions index

Request only the permissions each feature needs. Prevents misuse.

| Permission | Used by |
|------------|---------|
| **Microphone** | Talk, Role-play, Journal (voice reflection), Ask Gauge (when voice), Mind Mail / Circle (voice note), Resolve (voice parts), Replay (optional voice). |
| **Notifications** | Signals alerts, Reminders (body maintenance, rituals), optional Cockpit/check-in nudges, Onboarding (optional), Settings (preferences). |
| **Health integrations** | Oura (`oura-connect`), Apple Health (`health-connections`). Sleep, steps, HRV, readiness when user connects. |
| **Contacts** | People (add to circle), Lights (add person, log contact), Invite Circle (`invite-circle`). |

Only request a permission when the user is on a route that uses it.

---

## 4. Privacy model

- **Data stays private** — No selling or unauthorized sharing. Processing uses only data the user provided or explicitly connected (e.g. wearables).
- **User controls deletion** — Routes that store user content support export/delete as defined in retention (e.g. Settings: download data, delete account).
- **Sensitive data** — Emotions, relationships, journal, and health data are classified and retained per this policy; user can delete source data and the system must reflect that (e.g. graph nodes updated).

---

## 5. Export and delete

- **Export** — Where the route map specifies user-controlled deletion or export, users can export their data (e.g. from Settings/Me).
- **Delete** — User can delete specific content (e.g. journal entry, conversation) or account; retention and storage must honor deletion (remove or anonymize corresponding data).

---

## 6. GDPR / CCPA alignment

- **Lawful basis / notice** — Privacy policy and data-use page disclose what is collected and why; onboarding and Settings link to them.
- **Rights** — Access, correction, deletion, and portability (export) are supported per retention and export/delete above.
- **Data minimization** — Only collect what each route needs; use the governance matrix and this policy when adding new routes.

Keep the matrix and legal copy in sync with store listing and data safety forms (see [INGAUGE-GOVERNANCE-MATRIX.md](./INGAUGE-GOVERNANCE-MATRIX.md) App store compliance).
