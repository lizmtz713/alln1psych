# InGauge Governance Matrix

Single source of truth for **AI roles**, **voice modes**, **safety levels**, **data classification**, **retention**, **permissions**, and **analytics** per route. Think of this as the compliance + architecture contract.

**Data classification, retention policy, and device permissions** are defined in [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md). This doc references those labels (e.g. Data class, Retention) and adds route standards, AI/voice/safety rules, and the full feature matrix.

**See also:** [README.md](./README.md) · [INGAUGE-ROUTE-MAP.md](./INGAUGE-ROUTE-MAP.md) · [INGAUGE-AI-ARCHITECTURE.md](./INGAUGE-AI-ARCHITECTURE.md) · [INGAUGE-SYSTEM-MAP.md](./INGAUGE-SYSTEM-MAP.md)

---

## 1. Route standards

**For every new screen or feature area, the following must be defined before ship.**

| Requirement | What to define |
|-------------|-----------------|
| **AI presence** | Yes / No / Optional. If yes: use a standard **AI role** from section 3 (Coach, Explainer, Analyzer, Simulator, Translator, Planner, Detector, Summarizer). |
| **Voice presence** | Yes / No / Optional. If yes: use a standard **voice mode** from section 4 (Conversation, Reflection, Practice, Narration, Command). |
| **Data collected** | What is stored (e.g. gauge scores, journal text, voice transcript). See Privacy Policy and data-use. |
| **Disclaimer** | Which disclaimer appears (global, AI, educational, simulation, pattern, crisis, voice, none). Use `src/data/legalDisclaimers.ts`. |
| **Crisis / sensitive handling** | If the surface can show distress or sensitive content: crisis detection, 988/741741, no diagnosis, link to crisis resources. |
| **Analytics event** | Event name(s) for key actions (e.g. `screen_view`, `cockpit_checkin_completed`, `talk_started`). |
| **Permission** | Microphone, notifications, health (Apple Health, Oura), contacts — only if used on this route. See [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md) device permissions. |

**Checklist for a new route:** AI? Voice? Data? Disclaimer? Crisis path? Event? Permission?

---

## 2. Data class, retention, and permissions

**Data classification** (Public, Personal, Behavioral, Emotional, Biometric, Relational), **retention policy** (user-controlled deletion, long-term history, etc.), and **device permissions index** (Microphone, Notifications, Health, Contacts) are defined in [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md). Use those definitions when filling the matrix columns below.

---

## 3. AI role taxonomy (standard)

Use only these labels so devs don't invent new ones. A route can use more than one.

| AI role | Meaning |
|---------|---------|
| **Coach** | Reflective guidance; helps user think or act (e.g. Ask Gauge, reach-out, decision). |
| **Explainer** | Teaches concepts (e.g. lessons, gauge detail, boundaries, love modal). |
| **Analyzer** | Detects patterns or structure in data (e.g. Decode message analysis, drift). |
| **Simulator** | Role-play or "replay" scenarios (e.g. Role-play, Replay). |
| **Translator** | Perspective or phrasing translation (e.g. Decode response options, Relate, Perspective Translator). |
| **Planner** | Generates action plans or steps (e.g. relationship repair, integration path in Resolve). |
| **Detector** | Identifies signals or states (e.g. drift warning, bias check, crisis keywords). |
| **Summarizer** | Condenses data or generates summaries (e.g. insights, weekly insight, forecast, Wrapped). |

---

## 4. Voice mode types (standard)

Use only these for "voice role" so engineers implement consistently.

| Voice mode | Meaning | Example |
|------------|---------|---------|
| **Command** | Short command (e.g. "Open Cockpit"). | Future / accessibility. |
| **Conversation** | Full back-and-forth with AI. | Talk. |
| **Reflection** | User speaks for journaling or reflection. | Journal, lesson reflection, activity. |
| **Practice** | User speaks in a simulated scenario. | Role-play. |
| **Narration** | App reads content aloud (TTS). | Manual lessons (optional). |
| **None** | No voice on this route. | — |

---

## 5. Crisis handling protocol (global)

**If user expresses self-harm intent or severe distress:**

1. **AI** provides a supportive, non-judgmental response.
2. **Display** crisis resources (988, Crisis Text Line 741741, 911).
3. **Encourage** contacting a trusted person or professional.
4. **Do not** present the app as therapy or crisis care; do not diagnose or promise treatment.

Apply this in Talk, Ask Gauge, and any surface where the user can type or speak freely. See `src/data/legalDisclaimers.ts` and crisis detection in the AI pipeline.

---

## 6. AI transparency (global)

- **Users must always know** when they are interacting with AI (disclosure before first use; no deceptive UI).
- **AI responses must not** be presented as professional (medical, legal, therapeutic) advice.
- **AI insights must** include transparency about uncertainty where appropriate (e.g. "patterns are reflective, not diagnostic").

Aligns with expectations from frameworks such as the EU AI Act.

---

## 7. Feature phase

| Phase | Meaning |
|-------|---------|
| **MVP** | Required for launch. |
| **Phase 2** | Early growth; ship after MVP is stable. |
| **Phase 3** | Advanced features. |
| **Research** | Experimental; may not ship. |

Use in the matrix instead of "Later" where applicable.

---

## 8. App store compliance

Apple App Store and Google Play expect (and the matrix supports):

- **Privacy policy** — Linked from Settings/Me and onboarding; see disclaimer and data-use.
- **Disclosure of data collection** — Data-use page + data classification + retention (see [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md)).
- **Clear AI behavior** — AI disclaimer, voice disclosure, no deception (see section 6).
- **Safe handling of minors** — Age 13+ in onboarding; no targeted ads; appropriate content.

Keep the matrix and legal copy in sync with store listing and data safety forms.

---

## 9. AI risk level

For regulatory readiness (e.g. EU Artificial Intelligence Act) and internal design, classify AI use per route.

| Risk | Meaning | Example routes |
|------|---------|----------------|
| **Low** | Informational: explains concepts, shows content, no behavioral or emotional guidance. | Manual lessons, Gauge detail, Disclaimer, Data-use, most Explainer-only screens. |
| **Medium** | Behavioral guidance: suggests actions, interprets input, helps with decisions or communication. | Decode, Perspective Translator, Decision tool, Reach-out scaffold, Drift detector, Patterns (insight display). |
| **High** | Emotional reflection: ongoing conversation about feelings, conflict, identity, or distress. | Talk, Ask Gauge, Resolve, Role-play, Journal (AI insight), Crisis (supportive response), Emergency (reach-out). |

Use in the matrix "AI risk" column (see Legend below).

---

## 10. Governance & architecture matrix

**Feature areas** (grouped routes) with governance columns. Use this as the single source of truth for AI, voice, legal, data, and safety.

**Legend**

- **AI role:** Coach | Explainer | Summarizer | Simulator | Analyzer | Translator | Planner | Detector | None (use taxonomy section 3).
- **Voice role:** Conversation | Reflection | Practice | Narration | Command | None (use voice types section 4).
- **Safety level:** Low | Medium | High (emotional/sensitive/legal risk).
- **AI risk:** Low (informational) | Medium (behavioral guidance) | High (emotional reflection) — see section 9.
- **Insight source:** How insights on this route are generated: User input | Pattern detection | Wearable | AI inference | Historical aggregation | — (none). Keeps AI Brain explainable.
- **Phase:** MVP | Phase 2 | Phase 3 | Research.
- **Data class:** Public | Personal | Behavioral | Emotional | Biometric | Relational — see [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md).
- **Retention:** User-controlled deletion | Permanent unless deleted | Long-term history | Temporary logging | None — see [INGAUGE-DATA-POLICY.md](./INGAUGE-DATA-POLICY.md).

---

### 6.1 Tabs & home

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(tabs)** Cockpit | See how I’m doing and what to do next | View gauges, tap suggestions, quick log, share | Summarizer, Coach | Reflection (optional in activities) | Low | Medium | Yes | Optional | Yes (scores, reflections) | Emotional, Behavioral | Long-term history | Pattern detection + user input | Score reflective, not diagnostic | Notifications (optional) | cockpit_opened, insight_tapped, quick_log_done | MVP |
| **/(tabs)/signals** | See what might need my attention | View drift, birthdays, predictions; go to People or check-in | Detector, Summarizer | None | Low | Medium | Yes | No | Yes (relationship data) | Relational, Behavioral | Long-term history | Pattern detection | Pattern/insight disclaimer | None | signals_opened, drift_tapped | MVP |
| **/(tabs)/people** | See who matters and who needs attention | View ring, tiers, Transmit; add person; open Mind Mail | Summarizer | None | Low | Low | Yes | No | Yes (contacts, temps) | Relational, Personal | Permanent unless deleted | — | — | Contacts (add) | people_opened, transmit_started | MVP |
| **/(tabs)/tools** | Find the right tool for my situation | Pick situation or tool; open tool | — | None | Low | — | No (grid only) | No | No | — | None | — | — | None | tools_opened, tool_tapped | MVP |
| **/(tabs)/learn** Manual | Understand how my system works | Browse manual, open lesson, 12 Questions, skills | Explainer, Coach | Reflection, Narration (optional) | Low | Low | Yes | Optional | Yes (progress, answers) | Personal, Emotional | Long-term history | User input | Educational disclaimer | None | manual_opened, lesson_started | MVP |
| **/(tabs)/me** | Manage identity, data, and settings | Edit profile, open insights, goals, settings, legal | Summarizer | None | Medium | Low | Yes | No | High (profile, preferences) | Personal, Behavioral | User-controlled deletion (export/delete in Settings) | User input + pattern (insights) | Global + links to disclaimer/data-use | Notifications, Health (if used) | me_opened, settings_opened | MVP |
| **/(tabs)/talk** | Talk to the AI (voice or text) | Converse with Gauge; voice or type | Coach | Conversation | High | High | Yes | Yes | High (conversation) | Emotional, Personal | User-controlled deletion | User input + AI inference | AI guidance only; not therapy/crisis; voice disclosure | Microphone | talk_started, voice_enabled, message_sent | MVP |
| **/(tabs)/circle** Mind Mail | Read and send messages in my circle | Inbox / Sent / Drafts; compose; view mail | Optional | Reflection (voice note) | Medium | Medium | Optional | Optional | High (content, recipients) | Relational, Emotional | Permanent unless deleted | User input | Voice disclosure if voice | Microphone (if voice) | circle_opened, mail_sent | MVP |
| **/(tabs)/lights** | See everyone by tier; reach out | View tiers, radar, world; add; log contact | Summarizer | None | Low | Low | Yes | No | Yes (contacts, logs) | Relational, Behavioral | Permanent unless deleted | Pattern detection | — | Contacts | lights_opened, contact_logged | MVP |

---

### 6.2 Check-in & gauges

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/cockpit-checkin** | Rate my six gauges | Slider each gauge; submit | Summarizer | Reflection (optional) | Low | Medium | Yes | Optional | Yes (scores) | Emotional, Behavioral | Long-term history | User input | Reflective, not diagnostic | None | cockpit_checkin_completed | MVP |
| **/(modals)/mood-checkin** | Quick mood snapshot | Pick mood; optional note | Optional | Reflection (optional) | Low | Medium | Optional | Optional | Yes (mood) | Emotional | Long-term history | User input | — | None | mood_checkin_done | MVP |
| **/(modals)/quick-log** | Log a moment fast | Short log entry | None | Reflection (optional) | Low | — | No | Optional | Yes (text) | Emotional | User-controlled deletion | User input | — | None | quick_log_done | MVP |
| **/(modals)/gauge-detail** | Understand one gauge | Read; tap “Talk” or “Body Maintenance” | Explainer | None | Low | Low | Yes | No | No | — | None | — | Educational | None | gauge_detail_viewed | MVP |
| **/(modals)/history** | See past check-ins | Scroll history | None | None | Low | — | No | No | Yes (historical) | Emotional, Behavioral | Long-term history | Pattern detection | — | None | history_opened | MVP |

---

### 6.3 Talk, Ask Gauge, activities

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/ask-gauge** | Ask Gauge from context | Type or speak prompt; get reply | Coach | Conversation | High | High | Yes | Yes | High (prompt + reply) | Emotional, Personal | User-controlled deletion | User input + AI inference | AI + voice (if voice) | Microphone (if voice) | ask_gauge_opened, prompt_sent | MVP |
| **/(modals)/activity** | Do a micro-activity (breathe, gratitude, etc.) | Complete activity; optional share to Talk | Coach, Explainer, Detector | Reflection (optional) | Low–Medium | Medium | Yes | Optional | Yes (responses) | Emotional | Long-term history | User input | Educational / simulation where relevant | None | activity_started, activity_completed | MVP |
| **/(modals)/prompt-generator** | Get conversation starters | Pick or generate prompt; open Talk | Coach | None | Low | Medium | Yes | No | No | — | None | AI inference | — | None | prompt_generator_used | MVP |

---

### 6.4 Tools (modals & stacks)

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/decode** | Understand a message I received | Paste/attach message; get analysis + options | Analyzer, Translator | None | Medium | Medium | Yes | No | High (message content) | Emotional, Personal | User-controlled deletion | User input + AI inference | — | None | decode_used | MVP |
| **/(modals)/resolve** | Work through internal conflict | Describe conflict; voice parts; get integration | Coach, Explainer | Practice (voice parts) | Medium | High | Yes | Optional | High (conflict text) | Emotional | User-controlled deletion | User input + AI inference | Simulation / not therapy | Microphone (if voice) | resolve_started, resolve_completed | MVP |
| **/(modals)/role-play** | Practice a hard conversation | Simulate with AI; get debrief | Simulator, Coach | Practice | Medium | High | Yes | Yes | High (scenario, transcript) | Emotional | User-controlled deletion | User input + AI inference | Simulation disclaimer | Microphone | role_play_started, role_play_ended | MVP |
| **/(modals)/replay** | Replay a past reply differently | Pick message; get alternative reply | Simulator, Coach | None | Low | High | Yes | Optional | Yes (conversation) | Emotional | User-controlled deletion | User input + AI inference | Simulation | None | replay_used | MVP |
| **/(modals)/relate** | See another’s perspective (Personology) | Enter context; get phrasing / perspective | Translator, Explainer | None | Low | Medium | Yes | Optional | Medium | Relational, Personal | User-controlled deletion | User input + AI inference | — | None | relate_used | MVP |
| **/(modals)/referee** | Mediate two sides | Enter both sides; get reframe | Coach | None | Low | Medium | Yes | No | Medium | Emotional | User-controlled deletion | User input + AI inference | — | None | referee_used | MVP |
| **/(modals)/reach-out-scaffold** | Get help reaching out to someone | Follow scaffold; send or log | Coach | None | Low | Medium | Yes | No | Yes (contact, content) | Relational | User-controlled deletion | User input | — | None | reach_out_started | MVP |
| **/(modals)/pre-conversation-check** | Prep before a hard conversation | Check prompts; optional Quick Reset | Coach | None | Low | Medium | Yes | No | Low | — | None | User input | — | None | pre_check_used | MVP |
| **/(modals)/quick-reset** | 2‑min in-context regulation | Follow ground / breathe / shake | None | None | Low | — | No | No | No | — | None | — | — | None | quick_reset_completed | MVP |
| **/tools/quick-reset** | Do a regulation exercise | Pick exercise; complete | None | None | Low | — | No | No | No | — | None | — | — | None | quick_reset_exercise_done | MVP |
| **/tools/decision** | Think through a decision | Use pathway; optional AI clarity | Coach (optional) | None | Low | Medium | Optional | No | Yes (decision text) | Personal, Behavioral | User-controlled deletion | User input + AI inference | — | None | decision_started, decision_ai_used | MVP |
| **/tools/relationship-repair** | Step through repair | Build message; optional AI personalize | Coach (optional) | None | Medium | Medium | Optional | No | High (relationship, message) | Relational, Emotional | User-controlled deletion | User input + AI inference | — | None | relationship_repair_used | MVP |
| **/tools/perspective-translator** | Rephrase for someone else | Enter situation; get phrasing | Translator | None | Low | Medium | Yes | No | Medium | Relational | User-controlled deletion | User input + AI inference | — | None | perspective_translator_used | MVP |
| **/(modals)/boundaries** | Explore boundaries | Read + reflect; optional Talk | Explainer, Coach | Reflection (optional) | Medium | Low | Yes | Optional | Yes (reflections) | Emotional | Long-term history | User input | Educational | None | boundaries_opened | MVP |
| **/(modals)/difficult-people** | Handle difficult people | Read + optional Talk | Explainer, Coach | Reflection (optional) | Medium | Low | Yes | Optional | Yes | Emotional | Long-term history | User input | Educational | None | difficult_people_opened | MVP |
| **/(modals)/red-green-flags** | Reflect on relationship flags | Get short take; optional Talk | Explainer | Reflection (optional) | Medium | Low | Yes | Optional | Yes | Relational, Emotional | Long-term history | User input | Educational | None | red_green_flags_used | MVP |
| **/(modals)/critical-thinking** | Think through a situation | Get prompts + optional analysis | Coach, Explainer | None | Low | Medium | Yes | No | Yes (situation) | Personal, Behavioral | User-controlled deletion | User input + AI inference | — | None | critical_thinking_used | MVP |
| **/(modals)/help-someone** | Help someone else | Pick scenario; get guidance | Coach | None | Medium | Medium | Yes | No | Yes (scenario) | Emotional | User-controlled deletion | User input + AI inference | Not professional advice | None | help_someone_opened | MVP |
| **/tools/memory-builder** | Remember people and practice | Add person; practice recall | Coach (suggest hook) | None | Low | Medium | Optional | No | Yes (people, notes) | Relational, Personal | Permanent unless deleted | User input | — | None | memory_builder_used | Phase 2 |
| **/tools/life-direction-finder** | Explore direction | Answer; get reflection | Coach | None | Medium | High | Yes | No | Yes (answers) | Personal, Emotional | Long-term history | User input + AI inference | — | None | life_direction_used | MVP |
| **/tools/bias-check** | Check for bias | Enter situation; use library | Detector, Explainer | None | Low | Medium | Yes | No | Yes (situation) | Personal, Behavioral | User-controlled deletion | User input + AI inference | — | None | bias_check_used | MVP |
| **/(modals)/drift-detector** | See relationship drift | View drift; act in People | Detector | None | Low | Medium | Yes | No | Yes (relationship) | Relational, Behavioral | Long-term history | Pattern detection | — | None | drift_detector_opened | MVP |
| **/(modals)/awe-activities** | Do an awe activity | Pick and do activity | Coach | None | Low | Low | Yes | No | No | — | None | — | — | None | awe_activity_done | Phase 2 |

---

### 6.5 Crisis, legal, and safety

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/crisis-resources** | Get crisis help | View 988, 741741, 911; call/text | None | None | High | High | No | No | No | — | Temporary logging | — | Not crisis intervention; use 988/741741 | None | crisis_resources_opened | MVP |
| **/emergency** | Get support in crisis | Reach out to person; breathe; crisis links | Coach (reach-out), None (crisis) | None | High | High | Yes (reach-out) | No | Yes (contact) | Relational | User-controlled deletion | User input | Crisis notice; not replacement for 988 | None | emergency_opened, reach_out_done | MVP |
| **/(modals)/disclaimer** | Read full legal disclaimer | Read; link to Terms/Privacy | None | None | Low | Low | No | No | No | — | None | — | Full disclaimer text | None | disclaimer_opened | MVP |
| **/(modals)/data-use** | See how data is used | Read; link to Settings privacy | None | None | Low | Low | No | No | No | — | None | — | Data minimization note | None | data_use_opened | MVP |
| **/(modals)/settings** | Configure account and privacy | Toggle privacy, download/delete, BYOK, appearance | None | None | Medium | Low | No | No | High (preferences) | Personal, Behavioral | User-controlled deletion (export/delete) | — | Links to disclaimer/data-use | Notifications, Health (if connected) | settings_opened, privacy_toggled | MVP |

---

### 6.6 Learning, profile, and identity

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/lesson/[id]** | Complete a lesson | Read; reflect; complete | Explainer, Coach (insight) | Reflection (optional) | Low | Low | Yes | Optional | Yes (reflection) | Personal, Emotional | Long-term history | User input | Educational disclaimer | None | lesson_started, lesson_completed | MVP |
| **/learn/skills** | See my Human Skills progress | View skills; open detail; earn XP | None | None | Low | — | No | No | Yes (points) | Personal, Behavioral | Long-term history | Pattern detection | — | None | skills_opened | MVP |
| **/learn/questions** | Answer 12 Life Questions | Answer; view map | Optional (reflect) | None | Medium | Low | Optional | No | High (answers) | Personal, Emotional | Long-term history | User input | — | None | questions_opened, question_answered | MVP |
| **/(modals)/learning-style-quiz** | Learn my learning style | Take quiz; get result | Explainer | None | Low | Low | Yes | No | Yes (answers) | Personal, Behavioral | Long-term history | User input | — | None | learning_style_quiz_done | Phase 2 |
| **/profile/** (identity, values, etc.) | Edit my profile and gauges | Edit fields; save | Optional (human profile) | None | Medium | Low | Optional | No | High (identity, values) | Personal | User-controlled deletion | User input | — | None | profile_edited | MVP |
| **/(modals)/identity-setup** | Set name, avatar, temperature | Edit; save | None | None | Medium | — | No | No | Yes | Personal | Long-term history | User input | — | None | identity_setup_done | MVP |
| **/(modals)/foundation-*** | Configure foundation (body, state, emotion, etc.) | Read + set | Explainer | None | Low | Low | Yes | No | Yes | Personal, Emotional | Long-term history | User input | Educational | None | foundation_opened | MVP |

---

### 6.7 Sensitive and high-touch areas

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/patterns** | See AI pattern insights | View insights; understand limits | Detector, Summarizer | None | Medium | Medium | Yes | No | High (derived from data) | Behavioral, Emotional | Long-term history | Pattern detection | Pattern disclaimer (not diagnostic) | None | patterns_opened | MVP |
| **/your-story** | Tell my story (origins, culture) | Edit story fields | Optional | None | High | Medium | Optional | No | High (identity, upbringing) | Personal, Emotional | User-controlled deletion | User input | — | None | your_story_opened, your_story_edited | MVP |
| **/love/datesume** | See relationship snapshot | View/edit datesume; share | Summarizer (optional) | None | Medium | Low | Optional | No | High (relationship) | Relational | Permanent unless deleted | User input | — | None | datesume_opened | MVP |
| **/love-history** | See relationship history | Add entry; view timeline; patterns | Optional (insights) | None | Medium | Low | Optional | No | High (relationships) | Relational, Emotional | Long-term history | Pattern detection | — | None | love_history_opened | MVP |
| **/(modals)/love** | Learn about love/relationships | Read content; optional Talk | Explainer, Coach | Reflection (optional) | Low | Low | Yes | Optional | No | — | None | User input | Educational | None | love_modal_opened | MVP |
| **/(modals)/attraction** | Learn about attraction | Read; optional Talk | Explainer | Reflection (optional) | Low | Low | Yes | Optional | No | — | None | User input | Educational | None | attraction_opened | Phase 2 |
| **/(modals)/attachment-style** | Learn about attachment | Read; optional Talk | Explainer | Reflection (optional) | Low | Low | Yes | Optional | No | — | None | User input | Educational | None | attachment_opened | Phase 2 |
| **/(modals)/cycle** | Understand my cycle | View cycle info | Optional | None | High (health) | Low | Optional | No | High | Biometric | User-controlled deletion | Wearable (if linked) | Not medical advice | Health (if linked) | cycle_opened | Phase 2 |
| **/body-maintenance** | Track self-care schedule | Add routine/provider; mark done | None | None | Medium | — | No | No | Yes (health routines) | Personal, Behavioral | User-controlled deletion | User input | Educational only; not medical advice | Notifications (reminders) | body_maintenance_opened | MVP |
| **/(modals)/body-maintenance** (modal) | Quick schedule view by category | Mark done; edit | None | None | Medium | — | No | No | Yes | Personal, Behavioral | User-controlled deletion | User input | Same as above | None | body_maintenance_modal_opened | MVP |
| **/forecast** | See how I might feel tomorrow | View forecast | Summarizer | None | Low | Medium | Yes | No | Yes (historical) | Emotional, Behavioral | Long-term history | Pattern detection + AI inference | Reflective, not diagnostic | None | forecast_opened | MVP |
| **/timeline** | See my life record over time | Scroll timeline | None | None | Medium | — | No | No | High (history) | Emotional, Behavioral | Long-term history | Historical aggregation | — | None | timeline_opened | MVP |
| **/wrapped** | See my year in review | View Wrapped | Summarizer | None | Low | Medium | Yes | No | Yes (aggregated) | Emotional, Behavioral | Long-term history | Historical aggregation | Reflective | None | wrapped_opened | Phase 2 |
| **/(modals)/weekly-insight** | Read weekly insight | View; optional share | Summarizer | None | Low | Medium | Yes | No | Yes | Emotional, Behavioral | Long-term history | Pattern detection + AI inference | Pattern/insight disclaimer | None | weekly_insight_opened | MVP |
| **/(modals)/therapist-share** | Share report with provider | Create link; revoke | None | None | High | Low | No | No | High (report content) | Emotional, Personal | User-controlled deletion | Historical aggregation | Share disclaimer | None | therapist_share_opened | MVP |
| **/(modals)/sovereignty-report** | View full system overview | View report | None | None | High | Low | No | No | High | Personal, Behavioral | User-controlled deletion | Pattern detection | — | None | sovereignty_report_opened | MVP |
| **/(modals)/share-snapshot** | Share current state | Generate and share | None | None | Medium | Medium | No | No | Yes (state) | Emotional, Behavioral | User-controlled deletion | User input + pattern | — | None | share_snapshot_used | MVP |
| **/(modals)/new-journal** | Add journal entry | Write or speak entry | Optional (insight) | Reflection (optional) | High | High | Optional | Optional | High (journal) | Emotional, Personal | User-controlled deletion | User input + AI inference | — | Microphone (if voice) | journal_entry_created | MVP |
| **/(modals)/onboarding** | First-time setup | Complete steps; consent | Coach (optional) | Reflection (optional) | High | High | Optional | Optional | High (profile, consent) | Personal | Long-term history | User input | Terms, Privacy, AI, age, health | Notifications (optional) | onboarding_started, onboarding_completed | MVP |

---

### 6.8 Other modals and routes

| Route / area | User goal | Core action | AI role | Voice role | Safety | AI risk | AI? | Voice? | Sensitive data? | Data class | Retention | Insight source | Disclaimer | Permission | Analytics (example) | Phase |
|--------------|-----------|-------------|---------|------------|--------|---------|-----|--------|-----------------|------------|-----------|----------------|------------|------------|----------------------|-------|
| **/(modals)/invite-circle** | Invite to circle | Send invite | None | None | Low | — | No | No | Yes (contact) | Relational, Personal | User-controlled deletion | User input | — | None | invite_sent | MVP |
| **/(modals)/debrief** | Say if a tool helped | Rate helpfulness; optional feedback | None | None | Low | — | No | No | Yes (feedback) | Behavioral | Temporary logging | User input | — | None | debrief_submitted | MVP |
| **/(modals)/relational-bridge** | Bridge two people | Use tool | Coach | None | Medium | Medium | Yes | No | Yes | Relational | Long-term history | User input + AI inference | — | None | relational_bridge_used | Phase 2 |
| **/(modals)/health-connections** | Connect Apple Health | Connect; revoke | None | None | High | — | No | No | High (health) | Biometric | User-controlled (revoke) | Wearable | Health data use | Health (iOS) | health_connected | MVP |
| **/(modals)/oura-connect** | Connect Oura | Connect Oura Ring | None | None | High | — | No | No | High | Biometric | User-controlled (revoke) | Wearable | — | None | oura_connected | Phase 2 |
| **/mind-mail/** (stack) | Same as Mind Mail (circle) | Compose; view; glimpse | Optional | Reflection (optional) | Medium | Medium | Optional | Optional | High | Relational, Emotional | Permanent unless deleted | User input | Voice if voice | Microphone (if voice) | mind_mail_compose_opened | MVP |
| **/flight-log** | See Pre/Post-Flight timeline | View log | None | None | Low | — | No | No | Yes (rituals) | Behavioral | Long-term history | Historical aggregation | — | None | flight_log_opened | MVP |
| **/rituals/** | Do Pre-Flight or Post-Flight | Complete ritual | Coach (post-flight) | Reflection (optional) | Low | Medium | Yes | Optional | Yes | Emotional, Behavioral | Long-term history | User input | — | None | ritual_started, ritual_completed | MVP |
| **/share/cockpit** | Share cockpit snapshot | Generate share link | None | None | Medium | Medium | No | No | Yes (state) | Emotional, Behavioral | User-controlled deletion | User input + pattern | — | None | share_cockpit_used | MVP |
| **/insight/[code]** | View shared insight (public) | View shared content | None | None | Low | — | No | No | Depends on content | — | None | — | — | None | insight_viewed | MVP |
| **/(modals)/features** | Placeholder | — | None | None | Low | — | No | No | No | — | None | — | — | None | — | Research / remove |
| **/(modals)/onboarding-old** | Legacy onboarding | — | — | — | — | — | — | — | — | — | — | — | — | — | — | Remove |
| **/(auth)/*** | Sign in / up / forgot password | Auth | None | None | Medium | — | No | No | Yes (account) | Personal | User-controlled deletion | User input | — | None | auth_sign_in, auth_sign_up | MVP |

---

### 6.9 Data class & retention quick reference

For compliance (e.g. GDPR, CCPA), key routes at a glance:

| Route / area | Data class | Retention |
|--------------|------------|-----------|
| Talk, Ask Gauge | Emotional, Personal | User-controlled deletion |
| Mind Mail (circle) | Relational, Emotional | Permanent unless deleted |
| Flight Log, Timeline, History | Emotional, Behavioral | Long-term history |
| Crisis resources | — | Temporary logging |
| Settings, Profile | Personal, Behavioral | User-controlled deletion (export/delete) |
| Decode, Role-play, Resolve | Emotional / Relational | User-controlled deletion |
| Oura, Health connections | Biometric | User-controlled (revoke) |

---

## 7. Quick reference: route → governance

| If you're on… | AI? | Voice? | Sensitive? | AI risk | Insight source | Data class | Retention | Disclaimer | Permission |
|---------------|-----|--------|------------|---------|----------------|------------|-----------|------------|------------|
| Cockpit | Yes | Optional | Yes | Medium | Pattern + user input | Emotional, Behavioral | Long-term history | Reflective, not diagnostic | Notifications (opt) |
| Talk | Yes | Yes | High | High | User input + AI inference | Emotional, Personal | User-controlled deletion | AI + voice; not therapy/crisis | Microphone |
| Ask Gauge | Yes | Yes | High | High | User input + AI inference | Emotional, Personal | User-controlled deletion | AI + voice if voice | Microphone (if voice) |
| Check-in | Yes | Optional | Yes | Medium | User input | Emotional, Behavioral | Long-term history | Reflective, not diagnostic | — |
| Lesson | Yes | Optional | Yes | Low | User input | Personal, Emotional | Long-term history | Educational | — |
| Role-play | Yes | Yes | High | High | User input + AI inference | Emotional | User-controlled deletion | Simulation | Microphone |
| Decode | Yes | No | High | Medium | User input + AI inference | Emotional, Personal | User-controlled deletion | — | — |
| Resolve | Yes | Optional | High | High | User input + AI inference | Emotional | User-controlled deletion | Simulation | Mic (if voice) |
| Patterns | Yes | No | High | Medium | Pattern detection | Behavioral, Emotional | Long-term history | Pattern (not diagnostic) | — |
| Crisis resources | No | No | No | High | — | — | Temporary logging | Not crisis intervention | — |
| Emergency | Yes (reach-out) | No | Yes | High | User input | Relational | User-controlled deletion | Crisis notice | — |
| Body Maintenance | No | No | Yes | — | User input | Personal, Behavioral | User-controlled deletion | Educational; not medical | Notifications (opt) |
| Your Story | Optional | No | High | Medium | User input | Personal, Emotional | User-controlled deletion | — | — |
| Settings | No | No | High | Low | — | Personal, Behavioral | User-controlled deletion | Links to legal | Notifications, Health |
| Onboarding | Optional | Optional | High | High | User input | Personal | Long-term history | Terms, Privacy, AI, age | Notifications (opt) |

---

*Expo Router: groups like `(auth)`, `(tabs)`, `(modals)` do not add segments to the URL. Dynamic segments use `[param]`.*

