# Boundaries Tool — Integration Guide

## Location in codebase

| What | Path |
|------|------|
| Types | `src/types/boundaries.ts` |
| Data (types, scripts, blocks, myths, questions) | `src/data/boundariesData.ts` |
| Scoring | `src/services/boundariesService.ts` |
| Store (assessment, log, AI context) | `src/stores/boundariesStore.ts` |
| UI | `app/(modals)/boundaries.tsx` |

## What it includes

- **8 boundary types**: Physical 🤲, Emotional 💙, Time ⏰, Energy ⚡, Material 💰, Digital 📱, Conversational 💬, Sexual 🔒 — each with a short description.
- **20+ scripts** with 3 versions each: **Soft**, **Firm**, **Broken record**. Filter by work / family / friends.
- **7 boundary blocks**: Guilt, Fear of conflict, Fear of rejection, People pleasing, Childhood conditioning, Fear of being "mean", Not knowing what you need — each with how to overcome and an affirmation.
- **10 myths busted**: e.g. "Setting boundaries is selfish" → truth: self-honoring; "If they loved me, I wouldn't need boundaries" → love requires limits.
- **17-question assessment** by category; results show average score per type (1–5). Stored in Zustand.
- **Boundary log**: Track when you set a boundary (type + optional note). Last 100 entries kept.
- **Daily affirmations**: One affirmation per day from a list of 10; link to CoPilot to talk about boundaries.
- **Practice**: "Practice with Role Play" opens the Role Play modal for scenarios.

## Science

- Nedra Glover Tawwab, *Set Boundaries, Find Peace*
- Henry Cloud & John Townsend, *Boundaries*
- Brené Brown on vulnerability and clear expectations

## Placement

- **Toolkit** (home): Boundaries 🛡️ pill → `/(modals)/boundaries`.
- Pairs with **Difficult People** / **Relate** and **Red/Green Flags** for relationship tools.

## AI integration

`useBoundariesStore.getState().getAIContext()` returns a short string summarizing the user’s assessment (stronger/weaker areas) and that they’ve been practicing boundary-setting. Append to CoPilot system prompt when discussing limits, guilt, or people-pleasing.

## Routes

- Open tool: `router.push('/(modals)/boundaries')`.
- Modal registered in `app/(modals)/_layout.tsx` as `boundaries`.
