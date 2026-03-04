# Difficult People Tool — Integration Guide

## Location in codebase

| What | Path |
|------|------|
| Types | `src/types/difficultPeople.ts` |
| Data (8 types, 7 strategies, scripts, 15 questions, crisis text) | `src/data/difficultPeopleData.ts` |
| Scoring (type identifier) | `src/services/difficultPeopleService.ts` |
| Store (assessment result, AI context) | `src/stores/difficultPeopleStore.ts` |
| UI | `app/(modals)/difficult-people.tsx` |

## What it includes

- **8 difficult person types**: Narcissist 👑, Manipulator 🎭, Gaslighter 💨, Passive-Aggressive 😊💢, Toxic Coworker 🏢, Emotional Vampire 🧛, Boundary Violator 🚧, Controller 🎮. Each has: red flags, common phrases, how they make you feel, psychology, context tips (family/romantic/work/friend), when to walk away, resources.
- **7 strategies with steps**: Grey Rock 🪨, Broken Record 🔁, Don't JADE 🚫, Document Everything 📝, Medium Chill 😐, Fogging 🌫️, State Consequences ⚖️.
- **Scripts library**: "They say" / "You say" / "Why it works" for common traps (e.g. "After everything I've done for you...", "You're too sensitive.").
- **15-question Type Identifier**: 1–5 scale; scores by type, returns top 3. Result links to Type Browser.
- **AI Coach tab**: Navigate to Talk with context so CoPilot can use assessment + strategies; crisis/danger prioritized in prompt.
- **Safety**: Crisis resources banner (links to crisis-resources modal); "When to walk away" for each type; crisis text in AI Coach section.

## Science

- Dr. Ramani Durvasula (narcissism)
- Dr. George Simon (*In Sheep's Clothing* — manipulation)
- Dr. Robin Stern, *The Gaslight Effect*
- Henry Cloud & John Townsend, *Boundaries*
- Patricia Evans, *Controlling People*; Scott Wetzler (passive-aggression)

## Placement

- **Toolkit** (home): Difficult People 👤 pill → `/(modals)/difficult-people`.
- Pairs with **Boundaries**, **Red/Green Flags**, **Relate**, and **Role Play**.

## AI integration

`useDifficultPeopleStore.getState().getAIContext()` returns a string with the user's top type IDs from the assessment, plus instructions to use Grey Rock, Don't JADE, Broken Record, when to walk away, and to prioritize crisis resources if the user describes danger. Append to CoPilot system prompt when the user opens Talk from the Difficult People tool (e.g. "Talk to CoPilot about difficult people" button).

## Routes

- Open tool: `router.push('/(modals)/difficult-people')`.
- Modal registered in `app/(modals)/_layout.tsx` as `difficult-people`.
