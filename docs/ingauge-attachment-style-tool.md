# Attachment Style Tool — Integration Guide

## Location in codebase

| What | Path |
|------|------|
| Types | `src/types/attachment.ts` |
| Questions + style info | `src/data/attachmentQuestions.ts` |
| Scoring logic | `src/services/attachmentService.ts` |
| Persistence + AI context | `src/stores/attachmentStore.ts` |
| UI | `app/(modals)/attachment-style.tsx` |

## What it does

- **12 questions** measuring two dimensions: **anxiety** (worry about abandonment, need for reassurance) and **avoidance** (discomfort with closeness, preference for independence).
- **4 styles** (Bartholomew & Horowitz, 1991): **Secure** 🌳, **Anxious** 🌊, **Avoidant** 🏔️, **Fearful** 🌪️.
- **Result screen**: scores (anxiety/avoidance 1–5), insight, strengths, growth tips.
- **Persistence**: Result saved in Zustand store (`attachmentStore`) and persisted to AsyncStorage.
- **AI helper**: `useAttachmentStore.getState().getAIContext()` returns a short string you can inject into CoPilot/system prompts so responses are tailored to the user’s attachment style.

## Science

- **Bowlby / Ainsworth**: Attachment theory (secure base, internal working models).
- **Bartholomew & Horowitz (1991)**: Four-category model (model of self × model of other → Secure, Anxious, Avoidant, Fearful).
- **ECR-R**: Experiences in Close Relationships – Revised; questions are inspired by this validated instrument (anxiety + avoidance subscales).

## Suggested placement

- **Toolkit** (home): Add an “Attachment” or “Style” pill that opens `/(modals)/attachment-style`.
- **Relate**: From the Relate modal, add a link like “Learn your attachment style” that opens the assessment.
- **Human Manual / Learn**: After an “Attachment 101” lesson, add a CTA: “Take the attachment style assessment” → `/(modals)/attachment-style`.

## AI integration

Call `getAIContext()` when building the CoPilot system prompt or when the user asks about relationships:

```ts
import { useAttachmentStore } from '../stores/attachmentStore';

// In your prompt builder:
const attachmentContext = useAttachmentStore.getState().getAIContext();
// If non-empty, append to system prompt:
// attachmentContext => "User's attachment style (self-reported): Secure 🌳. Anxiety: 2.1/5, Avoidance: 1.8/5. Use this to tailor..."
```

Use it to:
- Validate need for reassurance (anxious).
- Respect need for space (avoidant).
- Go slow and name safety (fearful).
- Reflect security without over-explaining (secure).

## Routes

- Open assessment: `router.push('/(modals)/attachment-style')`.
- Modal is registered in `app/(modals)/_layout.tsx` as `attachment-style`.
