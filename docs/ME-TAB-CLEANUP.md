# Me Tab Cleanup

**Goal:** Me answers *"What belongs to my personal setup and identity?"* — not a junk drawer or second Tools/Learn tab.

**Principle:** *This is who I am • This is what I'm working on • This is how my app is set up.*

---

## 1. Pre-cleanup inventory (what was in Me)

| Section | Items |
|--------|--------|
| **Header** | Greeting, Free Plan badge, Avatar (→ identity-setup), Stats (Streak, Awards, Lessons, Circle), Edit Profile, Human Control Panel (→ /profile) |
| **Quick-jump** | Identity, System, Insights, Goals, Share, Settings (6 pills) |
| **Identity** | Human Profile, Your Story, Identity, How You Connect, What Gives You Life, Personal Values, Sensitive Topics, In Your Own Words (8 items) |
| **Your System** | 6 gauge cards → Body, State, Emotion, Connection, Direction, Alignment |
| **Insights & History** | Patterns & Insights, Check-In History, Your Human Timeline, Flight Log, Human Weather, Life Wrapped, Body Maintenance, Datesume, Love History, Cycle Intelligence, Awards & Achievements (11 items) |
| **Goals & Growth** | Active Goals, Goal Setter, Review & Reflect (all → /profile/goals) |
| **Sharing & Reports** | Temperature visibility, Therapist Share, Sovereignty Report, Share Snapshot, Personology Profile |
| **Data Sources** | News My Way, Apple Health, Apple Watch, Oura, Whoop, Fitbit, Garmin, Calendar, Location & Weather |
| **Settings** | Push Notifications toggle, Notifications & Reminders, Check-In, AI Preferences, Appearance, Privacy, Upgrade, BYOK, Account Settings |
| **Safety / Data / Support** | Crisis 988, Help Center, Send Feedback, Redo Onboarding, Privacy Policy, Terms |
| **Footer** | Disclaimer, Learn more, Sign Out, version |

**Problems:** Too many sections (8), Insights is a catch-all (11 links), Sharing is report-heavy, Identity has 8 sub-items, quick-jump doesn’t match 5-block model.

---

## 2. Target structure (5 blocks)

| Block | Purpose | Contents |
|-------|---------|----------|
| **1. Identity** | Who I am | Edit Profile (header), Identity Setup, Your Story, Human Profile, About you (→ /profile for values, how you connect, sensitive) |
| **2. Growth** | What I'm working on | Goals (single link), Achievements |
| **3. Foundations** | My gauges / PHOSM config | Body, State, Emotion, Connection, Direction, Alignment (6-card grid) |
| **4. Preferences & Data** | How the app is set up | Notifications, Notifications & Reminders, Check-In, AI Preferences, Appearance, Privacy, Temperature visibility, Data Sources (connected services), Upgrade, BYOK, Account Settings |
| **5. Legal & Support** | Safety, data, support | Crisis 988, Help, Feedback, Redo Onboarding, Privacy Policy, Terms, Disclaimer, Sign out |

**Visual order (top → bottom):** Profile header → Identity → Growth → Foundations → Preferences & Data → Legal & Support → Sign out.

---

## 3. What moved or was trimmed

- **Identity:** Kept 4–5 entry points; "About you" links to /profile for the rest (no 8 separate rows).
- **Insights & History:** Section removed. Only **Achievements** kept, under Growth. Patterns, History, Timeline, Flight Log, Weather, Wrapped, Body Maintenance, Datesume, Love History, Cycle stay discoverable via profile/tools/learn where they belong (or via one "Your data" later); not duplicated on Me.
- **Goals & Growth:** One **Goals** row (→ /profile/goals), one **Achievements** row. Removed duplicate "Goal Setter" / "Review & Reflect" as separate rows.
- **Sharing & Reports:** Section removed. **Temperature visibility** moved into Preferences & Data. Therapist Share, Sovereignty Report, Share Snapshot, Personology remain in settings modal or other surfaces; not repeated on Me.
- **Data Sources:** Kept under **Preferences & Data** as "connected services".
- **Quick-jump:** Updated to 5 pills: Identity, Growth, Foundations, Preferences, Legal.

---

## 4. What stayed

- Header: avatar, name, stats (streak, awards, lessons, circle), Edit Profile. Human Control Panel removed from header (access via Identity "About you" or first Identity row).
- All gauge links (unchanged routes).
- Settings/Preferences items consolidated in one section.
- Crisis, Help, Feedback, Redo Onboarding, Legal links, Disclaimer, Sign out at bottom.

---

## 5. Routes unchanged

- No route renames or deletions. Cleanup is UI/structure only; links still point to same destinations (e.g. /profile/goals, /profile/gauges/*, /identity-setup, /(modals)/settings, etc.).

---

## 6. Preferences & Data — two visual groups

Within the Preferences & Data section, items are split into two subgroups so the section doesn’t feel dense:

- **App Preferences:** Push Notifications (toggle), Temperature visibility, Notifications & Reminders, Check-In Settings, AI Preferences, Appearance, News My Way.
- **Data & Integrations:** Apple Health, Oura Ring, Bring Your Own Key, Privacy, Upgrade to Pro, Account Settings.

“Soon” integrations (Whoop, Fitbit, Garmin, Calendar, Location) were intentionally dropped from Me; they should only appear when actually supported or from a dedicated Integrations screen.

**Optional future:** A dedicated `/settings/integrations` screen (e.g. Apple Health, Oura, Calendar, Location, future devices) is not required for current cleanup.

---

## 7. Temperature sharing

Temperature sharing was **not removed**. The **control** was moved to **Me → Preferences & Data → Temperature visibility**. Intended behavior (default private, permission when turning on, what others see, where it appears, permission reminders) is documented in **docs/TEMPERATURE-SHARING.md**.
