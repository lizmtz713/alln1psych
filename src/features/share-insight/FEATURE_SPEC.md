# Share Insight — Complete Feature Specification

> Break the gossip loop. Share understanding, not just feelings.

## Problem Statement

People struggle with the same relationship issues for decades:
- Venting loops that go nowhere
- No shared language between parties
- Feelings vs. feelings = stalemate
- Same conflicts at 20, 30, 50+

**Real example:** A 50-year-old woman dealing with sibling drama — trust, betrayal, secrets. She vents to her daughter. The cycle continues. No resolution.

## Solution

**Share Insight** enables users to share educational content (lessons, discoveries, AI insights) with anyone via a link. Recipients get:
- The insight with full context
- The science behind it (academic sources)
- Which gauges it connects to
- A way to respond
- An invitation to explore InGauge

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User reads lesson/discovery/AI response in InGauge      │
│                         ↓                                   │
│  2. Taps "Share This Insight"                               │
│                         ↓                                   │
│  3. Adds personal context ("I read this and thought of us") │
│                         ↓                                   │
│  4. Generates shareable link                                │
│                         ↓                                   │
│  5. Sends via text/email/DM                                 │
│                         ↓                                   │
│  6. Recipient opens link (no app needed)                    │
│                         ↓                                   │
│  7. Sees: sender context + insight + science + gauges       │
│                         ↓                                   │
│  8. Can respond (quick tap or written)                      │
│                         ↓                                   │
│  9. Sender gets notified                                    │
│                         ↓                                   │
│  10. Recipient optionally downloads InGauge                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/features/share-insight/
├── index.ts              # Public exports
├── ShareInsightModal.tsx # Modal component (574 lines)
├── buildContent.ts       # Content builders (148 lines)
├── README.md             # Quick reference
└── FEATURE_SPEC.md       # This file

app/insight/
└── [code].tsx            # Public web page (786 lines)

supabase/
├── migrations/
│   └── 20250219_share_insight.sql   # Database schema
└── functions/share-insight/
    └── index.ts                      # Edge function (243 lines)

src/data/
└── academicSources.ts    # 22 textbooks + 24 topics (850+ lines)
```

---

## Database Schema

### `shared_insights`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `insight_type` | TEXT | manual_lesson, discovery, ai_response, relate_insight, replay_insight |
| `insight_id` | TEXT | Reference to source content |
| `title` | TEXT | Display title |
| `summary` | TEXT | 2-3 sentence overview |
| `key_points` | JSONB | Array of bullet points |
| `deep_content` | TEXT | Expanded content |
| `science` | TEXT | Academic backing |
| `real_world_examples` | JSONB | Array of examples |
| `try_this` | TEXT | Actionable suggestion |
| `source_label` | TEXT | "Human Manual", "Talk to Psych", etc. |
| `sender_name` | TEXT | Display name |
| `sender_context` | TEXT | Personal message |
| `recipient_type` | TEXT | family, friend, partner, coworker, other |
| `connected_gauges` | JSONB | Array of gauge names |
| `academic_sources` | JSONB | Array of {author, insight} |
| `short_code` | TEXT | Unique 8-char URL slug |
| `view_count` | INT | Tracking |
| `created_at` | TIMESTAMPTZ | Creation time |
| `expires_at` | TIMESTAMPTZ | 90 days default |

### `insight_responses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `insight_id` | UUID | FK to shared_insights |
| `response_type` | TEXT | relate, helped, different, talk, written |
| `response_text` | TEXT | Optional written response |
| `responder_name` | TEXT | Optional name |
| `created_at` | TIMESTAMPTZ | Response time |

---

## Academic Sources

### Textbooks (22)
| Domain | Authors |
|--------|---------|
| Biological | Kalat, Carlson, Pinel |
| Clinical | Barlow, Comer, Beck, van der Kolk |
| Social | Aronson, Myers, Gottman, Ekman |
| Developmental | Berger, Siegler, Erikson, Bowlby |
| Cognitive | Matlin, Goldstein, Kahneman |
| Personality | Funder |
| Health | Sarafino |
| Family | Goldscheider |
| Neuroscience | Porges, Barrett |

### Topics (24)
| Category | Topics |
|----------|--------|
| Emotions | emotions-basics, emotional-granularity, anger, anxiety, false-alarms |
| Body-Mind | body-mood, sleep, gut-brain, exercise |
| Nervous System | fight-flight-freeze, nervous-system-regulation, stress |
| Brain | brain-processing, neuroplasticity, cognitive-distortions |
| Relationships | attachment, family, betrayal-trust, communication, conflict |
| Identity | identity, values |
| Trauma | trauma |

### Keyword Matching
Each topic has keywords for fuzzy matching against lesson content:
```typescript
{
  topic: 'anger',
  keywords: ['anger', 'angry', 'rage', 'frustrated', 'secondary emotion'],
  gauges: ['emotion', 'connection'],
  sources: [
    { sourceId: 'barlow', concept: 'Secondary emotions', insight: '...' },
    { sourceId: 'gottman', concept: 'Anger in relationships', insight: '...' },
    { sourceId: 'kalat', concept: 'Amygdala activation', insight: '...' },
  ],
}
```

---

## API Endpoints

### Create Share
```
POST /functions/v1/share-insight
Authorization: Bearer <token>

{
  insightType: 'manual_lesson',
  insightId: 'manual-1-1-1',
  title: 'What Are Emotions, Really?',
  summary: '...',
  keyPoints: ['...'],
  deepContent: '...',
  senderName: 'Sarah',
  senderContext: 'I read this and thought of you',
  recipientType: 'family',
  connectedGauges: ['emotion', 'state'],
  academicSources: [{ author: 'Kalat', insight: '...' }]
}

Response: { shortCode: 'abc12xyz', url: 'https://getingauge.com/insight/abc12xyz' }
```

### Get Share
```
GET /functions/v1/share-insight/:code

Response: { title, summary, senderName, senderContext, ... }
```

### Submit Response
```
POST /functions/v1/share-insight/respond

{
  shortCode: 'abc12xyz',
  responseType: 'relate', // or 'helped', 'different', 'talk', 'written'
  responseText: 'This really helped me understand...',
  responderName: 'Mom'
}

Response: { success: true }
```

---

## Web Page Sections

The recipient experience (`app/insight/[code].tsx`) flows through:

1. **Hero** — Sender avatar + name + context quote
2. **Insight** — Title + summary
3. **Takeaways** — Numbered key point cards
4. **Try This** — Actionable suggestion
5. **Go Deeper** — Expandable accordions (deeper content, stories, research)
6. **Gauges** — Visual gauge meters + CTA
7. **Science** — Academic citations
8. **Response** — Quick response grid + write your own
9. **Footer** — App promo

---

## Usage Examples

### In Lesson Screen
```tsx
import { ShareInsightButton, buildLessonShareContent } from '@/features/share-insight';

<ShareInsightButton 
  content={buildLessonShareContent(lesson, content, ageAdaptiveIntro)} 
/>
```

### In Talk to Psych
```tsx
import { ShareInsight, buildAIResponseShareContent } from '@/features/share-insight';

{msg.content.length > 100 && (
  <ShareInsight
    content={buildAIResponseShareContent('ai_response', 'Insight', msg.content, 'Talk to Psych')}
    trigger={(onPress) => (
      <Pressable onPress={onPress}>
        <Text>Share</Text>
      </Pressable>
    )}
  />
)}
```

### In Discoveries
```tsx
import { ShareInsight, buildDiscoveryShareContent } from '@/features/share-insight';

{isExpanded && (
  <ShareInsight content={buildDiscoveryShareContent(discovery)} />
)}
```

---

## Deployment

```bash
# 1. Run migration
cd alln1psych
supabase db push

# 2. Deploy edge function
supabase functions deploy share-insight

# 3. Build and test
npx expo start
# Open lesson → Share → Generate link → Open link in browser
```

---

## Success Metrics

- **Shares created** — Are people using this?
- **Links opened** — Do recipients engage?
- **Responses submitted** — Does it spark dialogue?
- **App downloads from shares** — Organic growth
- **Repeat shares** — Do people keep using it?

---

## Future Possibilities

- Share a reflection (not just educational content)
- Request an insight ("Can you read this?")
- Mutual learning (both people read same content)
- Family/group insights (share with multiple)
- Insight threads (back-and-forth)
- Circle integration (shared insights in relationship history)

---

*Built for InGauge — The Human Cockpit*
