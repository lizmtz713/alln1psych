# Light Profiles — Personal Relationship CRM

**Tagline:** *Know your people. Love them better.*

A friends-and-family CRM inside Lights: one profile per person with everything you need to stay connected.

---

## Profile Contains

### Basic info
- Name, photo, contact (from phone / Apple Contacts)

### Love language + notes
- Love language (from Circle)
- Free-form notes on how they feel loved

### DO Profile (how they operate)
- How they operate
- How they show love
- How they need support

### Relate insights
- Insights saved from the Relate tool (personality dynamics, communication style, etc.)

### Key dates
- Birthday
- Anniversary (or other significant dates)

### Connection log
- Every interaction: type, date, duration, mood, what you talked about, follow-ups to remember

### Gifts
- Gift ideas
- Past gifts given
- Favorites / sizes (e.g. shirt size, coffee order)

### Know them
- Family (who’s in their circle)
- Interests
- Values

### Location
- Address
- Drive time to them (stored or computed)

---

## Quick Actions

| Action | Behavior |
|--------|----------|
| **Call** | Opens dialer; optionally log the call after |
| **Text** | Opens messages; suggest follow-ups (e.g. from last conversation) |
| **Gift** | Shows ideas, favorites, sizes |
| **Visit** | Shows distance + directions (Maps) |

---

## Connection Log

Each entry includes:
- **Type** — call, text, in-person, video, social, mind-mail, other
- **Duration** — e.g. minutes
- **Mood** — how it felt (great / okay / hard / custom)
- **What you talked about** — short summary
- **Follow-ups** — things to remember (e.g. "Ask about her interview")

---

## Smart Features

- **"You haven’t talked to [Name] in X weeks"** — from last contact date
- **"[Name]'s birthday is in X days"** — from key dates
- **"Follow-up: Ask about her interview"** — from connection log follow-ups
- **Patterns** — e.g. "You talk most on Tuesdays" (from log history)

---

## Integrations

- **Apple Contacts** — Import / link contact; pull name, photo, phone, email
- **Relate tool** — Save insights to this profile
- **Log calls automatically** — (Future) e.g. after Call action or via call detection

---

## Data model (summary)

- **Light** (existing) + **LightExtras** (extended):
  - Contact, love language, notes
  - DO: howTheyOperate, howTheyShowLove, whatTheyNeed (existing), bestWayToConnect (existing)
  - relateInsights[], keyDates[], giftIdeas[], pastGifts[], favoritesSizes
  - family, interests, values
  - address (existing), driveTimeMinutes (optional)
- **ConnectionEntry** (extended):
  - type, date, duration, mood, summary, followUps[], note, quality

---

*This is a legit friends CRM. Know your people, love them better.*
