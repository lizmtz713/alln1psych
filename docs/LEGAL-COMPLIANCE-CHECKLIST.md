# InGauge Legal Compliance Checklist

This document maps the four main legal areas (data privacy, AI regulations, intellectual property, app store rules) to what is already built in the app and what to do before launch. **Use it with your lawyer for a final review.**

---

## 1. Data Privacy Laws (GDPR, CCPA, COPPA)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Clear Privacy Policy** (what, why, where, who, how to delete) | Privacy Policy linked from Settings, Me, and Disclaimer; full policy lives at getingauge.com/privacy (or alln1network.com/privacy — confirm canonical URL with legal). | ✅ In app |
| **User consent before collecting data** | Onboarding Step 5 (Legal): checkboxes for Terms of Service, Privacy Policy, health/AI/age. User must accept all to proceed. | ✅ |
| **Data deletion rights** | Settings → Privacy & Data: "Delete my data" (permanent); "Download my data" (export). Copy references GDPR/CCPA. | ✅ |
| **Data minimization** | "How Your Data Is Used" page states we collect only what’s needed; no location for tracking; no selling or advertising use. | ✅ |
| **COPPA / minors** | Age requirement 13+ with explicit checkbox in onboarding. No targeted advertising to minors; no unnecessary collection. | ✅ |

**Pre-launch:** Ensure the live Privacy Policy and Terms URLs (getingauge.com vs alln1network.com) are consistent and that the policy text explicitly covers: data collected, purpose, storage, access, deletion, and (if applicable) international transfer.

---

## 2. AI Regulations (transparency, no deception, risk mitigation, human oversight)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Transparency** (users know they’re interacting with AI) | AI Guidance Notice before first AI use; voice disclosure before first voice use. Disclaimer screen includes full "AI Disclosure" section. | ✅ |
| **No deceptive AI** | Copy states AI is not a human or licensed professional. Crisis detection directs to 988/741741, not to the AI. | ✅ |
| **Risk mitigation** | AI system prompt forbids diagnosis, prescription, replacement of professional help. Crisis keywords trigger safety flow + resources. | ✅ |
| **Human oversight** (report problems, contact support) | Me → Send Feedback (mailto), Help Center (docs.getingauge.com). Disclaimer "Safety & support" section explains how to report. | ✅ |

**Pre-launch:** Consider adding a short in-conversation reminder (e.g. footer) that "Gauge is an AI" if your lawyer or EU AI Act review recommends it.

---

## 3. Intellectual Property (copyright, plagiarism, branding)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Original content** | Lessons and explanations are written in-house; concepts are public psychology, wording is original. | ✅ Design |
| **No training on restricted content** | AI uses licensed/API models; no copying of proprietary books or curricula into training. | ✅ Design |
| **No copying other apps’ branding** | No Headspace/Calm/Oura lookalike; reference only when appropriate. | ✅ Design |
| **Protect your own IP** | Not in-app: consider copyrighting curriculum, trademarking "InGauge," protecting logo. | ⬜ Business/legal |

**Pre-launch:** Lawyer can confirm curriculum and marketing materials don’t inadvertently copy protected wording.

---

## 4. App Store Rules (Apple & Google)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Disclose data collection** | Privacy Policy + "How Your Data Is Used" + data minimization note. | ✅ |
| **Provide privacy policy** | Linked in Settings, Me, Disclaimer. | ✅ |
| **Obtain user consent** | Onboarding consent step; AI and voice disclosures before first use. | ✅ |
| **Protect minors** | Age 13+; no targeted ads; supportive, non-competitive tone. | ✅ |
| **Avoid misleading claims** | Disclaimers: not therapy, not crisis intervention, not medical/legal/financial advice. | ✅ |
| **Allow data deletion** | Settings → Privacy & Data → Delete my data. | ✅ |
| **No deceptive AI behavior** | AI Disclosure and notices make clear it’s AI. | ✅ |

**Pre-launch:** Review current Apple App Store and Google Play data safety / AI disclosure forms and ensure app store listing text matches in-app disclosures.

---

## 5. Security (technical)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Encrypted databases** | Supabase (Postgres) and storage; use HTTPS and secure auth. | ✅ Infra |
| **Secure authentication** | Supabase Auth; API keys in SecureStore where used client-side. | ✅ |
| **Secure API connections** | All requests over HTTPS. | ✅ |

**Pre-launch:** Confirm with your infra that Supabase (or any other provider) meets your target standard (e.g. SOC 2 if required).

---

## 6. Teen Users (extra care)

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **No targeted advertising to minors** | No ad-based model; no selling data for ads. | ✅ |
| **No unnecessary personal data** | Data minimization; optional voice; no location tracking. | ✅ |
| **Sensitive psych data only with consent** | Onboarding consent; user can disable AI learning and voice storage. | ✅ |

---

## 7. Voice Data

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Disclose voice processing** | Voice disclosure modal before first voice use; explains conversion to text and AI use. | ✅ |
| **User can disable / delete** | Settings → Privacy & Data: "Store voice transcripts" toggle; delete data removes all. | ✅ |

---

## 8. Research / Education Transparency

| Requirement | In-app implementation | Status |
|-------------|------------------------|--------|
| **Note that education is research-based** | Disclaimer screen: "Research & education" section — content based on widely accepted psychology/behavioral science; for learning, not diagnosis. | ✅ |

---

## 9. Legal Safety Layer (pages in app)

| Page | Where it appears | Status |
|------|------------------|--------|
| **Terms of Service** | Linked from Disclaimer, Settings, Me; onboarding. | ✅ |
| **Privacy Policy** | Linked from Disclaimer, Settings, Me; onboarding. | ✅ |
| **AI Disclosure** | Full section on Disclaimer screen; first-use AI and voice modals. | ✅ |
| **Data Use Explanation** | "How Your Data Is Used" modal (Settings → Legal / Privacy). | ✅ |
| **Safety / Crisis** | Disclaimer "Safety & support"; crisis resources screen; 988/741741 in Me. | ✅ |

---

## 10. Trusted Infrastructure

| Item | Notes |
|------|------|
| **Hosting / data** | Supabase (and any other providers) — confirm they meet your compliance needs (e.g. EU data residency if required). |
| **API providers** | OpenAI / Claude — review their DPA and data processing terms for your jurisdiction. |

---

## 11. Legal Review Before Launch

- [ ] Lawyer review of **Terms of Service** (live URL).
- [ ] Lawyer review of **Privacy Policy** (live URL).
- [ ] Lawyer review of **in-app AI and voice disclosures** (see `src/data/legalDisclaimers.ts` and Disclaimer / Data Use screens).
- [ ] Confirm **canonical URLs** for Terms/Privacy (getingauge.com vs alln1network.com) and use consistently in app and store listings.
- [ ] If targeting EU: consider **EU AI Act** classification and any extra transparency or documentation.

---

## 12. Where It Lives in the Codebase

| What | Location |
|------|----------|
| Central legal copy | `src/data/legalDisclaimers.ts` |
| Consent state (AI disclaimer, voice, AI learning, voice storage) | `src/stores/legalConsentStore.ts` |
| Disclaimer screen (full legal + AI + safety) | `app/(modals)/disclaimer.tsx` |
| Data use / transparency | `app/(modals)/data-use.tsx` |
| Privacy dashboard (download, delete, toggles) | `app/(modals)/settings.tsx` (Privacy & Data section) |
| Onboarding consent | `app/(modals)/onboarding.tsx` (Step 5) |
| AI first-use gate | `src/components/AiDisclaimerGate.tsx` |
| Voice first-use disclosure | `src/components/VoiceDisclosureModal.tsx` |

---

*Building these protections from the start puts InGauge at the level of many professional platforms. A final legal review before launch will help avoid expensive problems later.*
