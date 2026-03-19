# Feature Intake

**Purpose:** Before adding a new feature, run through this checklist. It prevents architecture drift and keeps domain ownership clear.

---

## Before adding a new feature

1. **What problem does this solve?** (User need, not just “it would be nice”.)
2. **Which domain owns it?** Cockpit, Signals, People, Tools, Manual (Learn), Me — or a specific sub-domain (e.g. Tools → practice).
3. **Is it a modal or a full screen?** Prefer real screens (stacks) for multi-step flows; modals for quick overlays. See modal-reduction rules.
4. **Does it duplicate an existing tool or flow?** If yes, extend the existing one (e.g. presets) instead of adding a new route.
5. **Does it need AI?** If yes, which service, and is it covered by existing AI patterns?
6. **Does it require voice?** Voice-first rules and accessibility implications.
7. **Does it collect sensitive data?** Privacy, consent, and data-use implications.
8. **What entry points will expose it?** Which tab(s), which screens? Avoid “only in Me” or orphan routes.
9. **Did we update the route map and governance matrix?** Route map, ownership script, and any governance docs.
10. **Does it pass audit checks?** `npm run audit` and `npm run lint` before merge.

---

## When in doubt

- Prefer **extending an existing tool** (e.g. Role Play presets) over adding a new tool.
- Prefer **one clear owner** (one tab/domain) rather than spreading the feature across multiple places.
- See **TAB-ORGANIZATION-STATUS.md** and **MODAL-REDUCTION-PLAN.md** for structural guardrails.
