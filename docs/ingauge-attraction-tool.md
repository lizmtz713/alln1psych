# How Attraction Works — Integration Guide

## Location in codebase

| What | Path |
|------|------|
| Types | `src/types/attraction.ts` |
| Data (chemistry, stages, factors, types, myths, patterns, questions) | `src/data/attractionData.ts` |
| Scoring (pattern assessment) | `src/services/attractionService.ts` |
| Store (assessment result, AI context) | `src/stores/attractionStore.ts` |
| UI | `app/(modals)/attraction.tsx` |

## What it includes

- **6 brain chemicals**: Testosterone/Estrogen (lust), Dopamine (high of new love), Norepinephrine (butterflies), Serotonin (drops = obsession), Oxytocin (bonding), Vasopressin (loyalty).
- **3 stages of love**: Lust (days–weeks), Attraction (weeks–2 years — “brain on cocaine + OCD”), Attachment (years–lifetime).
- **10 attraction factors**: Proximity, Familiarity, Similarity, Reciprocity, Mystery, Confidence, Humor, Status, Warmth, Physical.
- **5 types of attraction**: Physical/Sexual, Romantic, Emotional, Intellectual, Aesthetic.
- **8 myths busted**: e.g. “Opposites attract” → similarity wins; “The One exists” → love is built.
- **4 unhealthy patterns**: Anxious–Avoidant Trap, Trauma Bonding, Intensity Seeking, Savior/Project — each with description and insight.
- **12-question pattern assessment**: Anxious / avoidant / healthy / intensity dimensions; personalized insight and recommendations.
- **AI Coach**: Navigate to Talk with assessment context for tailored conversation.

## Science

- Helen Fisher (brain chemistry of love)
- David Buss (evolutionary mating psychology)
- Esther Perel (desire in long-term relationships)
- Attachment Theory

## Placement

- **Toolkit** (Love section): “How Attraction Works” 💫 pill → `/(modals)/attraction`.
- Pairs with **Love** (Love Languages), **Attachment Style**, **Boundaries**, **Difficult People**.

## AI integration

`useAttractionStore.getState().getAIContext()` returns a string with the user’s pattern scores (anxious, avoidant, healthy, intensity), dominant pattern, and insight. Append to CoPilot system prompt when the user opens Talk from this tool so conversations about attraction and relationships can reference brain chemistry, attachment, and secure vs. anxiety-driven “chemistry.”

## Routes

- Open tool: `router.push('/(modals)/attraction')`.
- Modal registered in `app/(modals)/_layout.tsx` as `attraction`.
