# Share Insight Feature

> Break the gossip loop. Share understanding, not just feelings.

## Overview

Enables users to share educational content (lessons, discoveries, AI insights) with anyone via a link. Recipients don't need the app — they get a mobile-optimized web experience.

## Architecture

```
src/features/share-insight/
├── index.ts              # Public exports
├── ShareInsightModal.tsx # Modal component + share flow
├── buildContent.ts       # Helpers to build shareable content
└── README.md             # This file

app/insight/[code].tsx    # Public web page for recipients

supabase/
├── migrations/20250219_share_insight.sql  # Database schema
└── functions/share-insight/index.ts       # Edge function

src/data/academicSources.ts  # 22 textbooks + topic mapping
```

## Usage

### In a Lesson Screen
```tsx
import { ShareInsightButton, buildLessonShareContent } from '@/features/share-insight';

<ShareInsightButton 
  content={buildLessonShareContent(lesson, content)} 
/>
```

### In Talk to Psych
```tsx
import { ShareInsight, buildAIResponseShareContent } from '@/features/share-insight';

<ShareInsight
  content={buildAIResponseShareContent('ai_response', 'Insight', message, 'Talk to Psych')}
  trigger={(onPress) => <Button onPress={onPress}>Share</Button>}
/>
```

### In Discoveries
```tsx
import { ShareInsight, buildDiscoveryShareContent } from '@/features/share-insight';

<ShareInsight content={buildDiscoveryShareContent(discovery)} />
```

## Content Types

| Type | Source | Builder Function |
|------|--------|------------------|
| `manual_lesson` | Human Manual | `buildLessonShareContent()` |
| `discovery` | 101 Discoveries | `buildDiscoveryShareContent()` |
| `ai_response` | Talk to Psych | `buildAIResponseShareContent()` |
| `relate_insight` | Relate Tool | `buildRelateShareContent()` |
| `replay_insight` | Replay Tool | `buildReplayShareContent()` |

## Database Schema

### `shared_insights`
- `id` — UUID primary key
- `user_id` — Who shared it
- `insight_type` — Type of content
- `title`, `summary`, `key_points`, etc. — Content
- `sender_name`, `sender_context` — Personal message
- `short_code` — Unique URL slug (8 chars)
- `connected_gauges` — Which gauges it connects to
- `academic_sources` — Research backing
- `view_count` — Tracking
- `expires_at` — 90 days default

### `insight_responses`
- `id` — UUID primary key
- `insight_id` — Which insight
- `response_type` — relate/helped/different/talk/written
- `response_text` — Optional written response
- `responder_name` — Optional name

## API Endpoints

### Create Share (authenticated)
```
POST /functions/v1/share-insight
Authorization: Bearer <token>
{
  insightType, title, summary, senderName, senderContext, ...
}
→ { shortCode, url }
```

### Get Share (public)
```
GET /functions/v1/share-insight/:code
→ { title, summary, senderName, senderContext, ... }
```

### Submit Response (public)
```
POST /functions/v1/share-insight/respond
{ shortCode, responseType, responseText?, responderName? }
→ { success: true }
```

## Academic Sources

Content is automatically enriched with:
- **Connected gauges** — Which of the 6 gauges this topic relates to
- **Academic sources** — Citations from 22 psychology textbooks

See `src/data/academicSources.ts` for the full mapping.

## Deploy

```bash
# 1. Run migration
supabase db push

# 2. Deploy edge function
supabase functions deploy share-insight

# 3. Test
# Open app → Lesson → Share → Generate link → Open link
```
