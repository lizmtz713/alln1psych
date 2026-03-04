# Love History

**Tagline:** *Your love life isn't random. There are patterns.*

A real differentiator — nobody builds this, but everyone needs it.

---

## Data Model

### RelationshipEntry
- **id** — unique (uuid or nanoid)
- **name** — optional (anonymous option)
- **type** — relationship type (see Types below)
- **startDate** — ISO date string
- **endDate** — ISO date string or null (current)
- **durationMonths** — derived or user-entered
- **howItEnded** — ending type (see Endings)
- **lessons** — string[] (what I learned)
- **notes** — free text
- **optional**
  - **intimacyLevel** — 0–100 or tier (18+ only)
  - **skillsDeveloped** — string[]
- **createdAt** / **updatedAt** — ISO strings
- **isAnonymous** — boolean (no name stored)

### LovePattern
- **id** — unique
- **title** — short label ("I avoid conflict", "I pick emotionally unavailable people")
- **description** — optional longer note
- **createdAt** — ISO string

### Stats (derived)
- **total** — count of entries
- **longest** — longest relationship (months)
- **marriages** — count where type === 'married'
- **currentStatus** — single / in relationship / it's complicated (from most recent or user-set)

---

## Types

### Relationship type
- Crush
- Kiss
- Fling
- Situationship
- Dating
- Relationship
- Engaged
- Married
- Divorced

### How it ended
- Mutual
- Ghosted
- Grew apart
- Cheating
- Moved away
- Wrong timing
- Other (free text)

### Optional (18+)
- Intimacy level (e.g. 0–100 or tier)
- Skills developed (communication, boundaries, etc.)

---

## App-Wide Security System (Phase 2)

- **PIN or Face ID / Touch ID** (or both)
- **Auto-lock** after X minutes
- **Lockout** after 5 failed attempts (timer or require Face ID to retry)
- **Feature-level extra PIN** for sensitive features (Love History, Journal, etc.)

*Initial implementation: no PIN gate; data is local-only. Add PIN/Face ID in a follow-up.*

---

## Screens

1. **Timeline view** — Chronological list of entries; lessons highlighted; tap to view/edit.
2. **Add entry** — Guided prompts (type, dates, how it ended, lessons, notes); optional anonymous.
3. **My Patterns** — User-added patterns they've noticed; optional AI-suggested patterns (gentle).
4. **AI Insights** — Gentle pattern analysis from entries; never judgmental; "patterns you might notice" not "you always do X."

---

## Privacy

- **Local storage only** — not synced to cloud/Supabase.
- **Screenshots disabled** on Love History screens (where supported).
- **Export** requires PIN re-entry; export format JSON or CSV.
- **Anonymous option** for entries (no name stored).

---

## Age-Gated

- **18+** — Full feature (all types, intimacy optional, AI insights).
- **Teens (13–17)** — "Relationship Reflections" only:
  - No intimacy tracking
  - Types limited to Crush, Dating, Relationship (age-appropriate)
  - Focus on lessons and patterns, not labels
  - Softer copy and AI tone

---

## Marketing

*"Your love life isn't random. There are patterns."*

Position as: private, non-judgmental, pattern-aware. For people who want to understand their relationship history without therapy or oversharing.

---

## Tech Notes

- **Store:** Zustand + AsyncStorage (local only); key e.g. `ingauge_love_history`.
- **Security:** PIN hashed (e.g. bcrypt or simple hash); lockout state in AsyncStorage.
- **Screens:** Under `app/love-history/` or `app/(modals)/love-history/`; gate by PIN + age.
- **AI:** Optional insights service (local or small edge function) that reads anonymized stats + patterns and returns gentle narrative; never stored on server.
