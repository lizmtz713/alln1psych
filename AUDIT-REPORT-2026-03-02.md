# InGauge App Codebase Audit Report
**Date:** 2026-03-02  
**Auditor:** Automated Code Audit  
**Codebase:** `/home/node/.openclaw/workspace/alln1psych`

---

## Executive Summary

The InGauge codebase is generally well-structured but has several issues requiring attention:
- **1 Critical** issue (broken color imports causing runtime errors)
- **2 High** severity issues (unregistered modals, missing feature entry points)
- **3 Medium** severity issues (unused stores, potential dead routes)
- **2 Low** severity issues (style inconsistencies, documentation)

---

## 🔴 CRITICAL Issues

### 1. Broken COLORS Imports in CycleDashboard.tsx
**File:** `src/components/CycleDashboard.tsx`  
**Severity:** CRITICAL  
**Impact:** Runtime crashes when component renders

The component imports COLORS from `../lib/constants` but uses properties that don't exist:

```typescript
// Line 20: imports global COLORS
import { COLORS } from '../lib/constants';

// Line 328: COLORS.danger doesn't exist (should be COLORS.error)
? COLORS.danger

// Lines 469, 517, 558, 577, 635, 667, 725, 771, 807: COLORS.card doesn't exist
backgroundColor: COLORS.card,
```

**Fix:**
```typescript
// Replace all instances of:
COLORS.danger → COLORS.error
COLORS.card → COLORS.surface  // or define 'card' in constants.ts
```

**Note:** `card` exists in `BORDER_RADIUS` and `COMPONENT_STYLES`, but NOT in `COLORS`. Either:
1. Add `card: '#111118'` to COLORS in constants.ts, OR
2. Replace `COLORS.card` with `COLORS.surface` throughout

---

## 🟠 HIGH Severity Issues

### 2. Unregistered Modal Screens
**File:** `app/(modals)/_layout.tsx`  
**Severity:** HIGH  
**Impact:** Routes exist but won't work properly

The following modal files exist but are **NOT registered** in `_layout.tsx`:

| File | Used In | Fix |
|------|---------|-----|
| `crisis-resources.tsx` | CrisisOverlay | Add to Stack.Screen |
| `debrief.tsx` | Post-activity flow | Add to Stack.Screen |
| `health-connections.tsx` | Circle features | Add to Stack.Screen |
| `quick-reset.tsx` | Home screen (line 473) | Add to Stack.Screen |
| `relational-bridge.tsx` | Circle screen (line 230) | Add to Stack.Screen |
| `share-insight.tsx` | Share features | Add to Stack.Screen |
| `share-snapshot.tsx` | Share features | Add to Stack.Screen |
| `sovereignty-report.tsx` | Therapist share | Add to Stack.Screen |

**Fix:** Add to `app/(modals)/_layout.tsx`:
```tsx
<Stack.Screen name="crisis-resources" options={{ presentation: 'modal' }} />
<Stack.Screen name="debrief" options={{ presentation: 'modal' }} />
<Stack.Screen name="health-connections" options={{ presentation: 'modal' }} />
<Stack.Screen name="quick-reset" options={{ presentation: 'modal' }} />
<Stack.Screen name="relational-bridge" options={{ presentation: 'modal' }} />
<Stack.Screen name="share-insight" options={{ presentation: 'modal' }} />
<Stack.Screen name="share-snapshot" options={{ presentation: 'modal' }} />
<Stack.Screen name="sovereignty-report" options={{ presentation: 'modal' }} />
```

### 3. Heart Notes Feature Has No UI Entry Point
**Severity:** HIGH  
**Impact:** Feature fully built but inaccessible to users

**Existing Components:**
- `src/components/HeartNotes/HeartNotesScreen.tsx`
- `src/components/HeartNotes/HeartInboxScreen.tsx`
- `src/components/HeartNotes/HeartNoteComposer.tsx`
- `src/stores/heartNotesStore.ts`
- `src/services/heartNotesAI.ts`
- i18n keys exist (`heartNotesTitle`, etc.)

**Missing:**
- No modal route for Heart Notes
- No navigation link from any screen
- Components are exported but never imported in app/

**Fix:** 
1. Create `app/(modals)/heart-notes.tsx` that imports HeartNotesScreen
2. Add route to modals layout
3. Add entry point in toolkit or me screen

---

## 🟡 MEDIUM Severity Issues

### 4. Potentially Unused Stores
**Severity:** MEDIUM  

| Store | Usage Count | Status |
|-------|-------------|--------|
| `dailyContentStore.ts` | 3 | ✅ Used (index.tsx) |
| `helpSomeoneStore.ts` | 1 | ⚠️ Only in store file itself |
| `rolePlayStore.ts` | 1 | ⚠️ Only in store file itself |

**Analysis:**
- `helpSomeoneStore` - Store exists but `help-someone.tsx` modal doesn't import it
- `rolePlayStore` - Store exists but `role-play.tsx` modal may have its own state

**Recommendation:** Verify these stores are intentionally unused or wire them up.

### 5. Local COLORS Shadowing (Intentional but Inconsistent)
**Severity:** MEDIUM  
**Impact:** Code maintenance difficulty

Several files define local `const COLORS = {...}` that shadow the global constants. This is intentional but inconsistent:

| File | Has Local COLORS |
|------|-----------------|
| `app/(tabs)/learn.tsx` | ✅ Line 66 |
| `app/(modals)/therapist-share.tsx` | ✅ Line 29 |
| `app/(modals)/cycle.tsx` | ✅ Line 15 |
| `src/components/SuggestedLessons.tsx` | ✅ Line 23 |
| `src/features/share-insight/ShareInsightModal.tsx` | ✅ Line 26 |
| `src/components/CycleDashboard.tsx` | ❌ Uses global (with bugs) |

**Recommendation:** Either:
1. Add missing colors (`card`, `bg`, `tabBg`, `tabActive`, `danger`, `cardElevated`) to global constants, OR
2. Ensure ALL files that need custom colors define local constants

### 6. Import Path Alias Not Configured
**Severity:** MEDIUM  

Found in `src/features/share-insight/index.ts`:
```typescript
// Example uses @/ alias which may not be configured
import { ShareInsight, buildLessonShareContent } from '@/features/share-insight';
```

**Recommendation:** Verify `tsconfig.json` has path aliases configured or use relative imports.

---

## 🟢 LOW Severity Issues

### 7. i18n Translation Coverage
**Severity:** LOW  
**Status:** ✅ GOOD

- English: 228 lines
- Spanish: 234 lines
- All keys match between en.ts and es.ts
- Translation hook exists in settings.tsx

**Note:** i18n is set up but minimally used in the app. Most UI strings are hardcoded.

### 8. Backup Files in Modals Directory
**Severity:** LOW  

Found: `app/(modals)/decode.tsx.backup`

**Recommendation:** Remove or move to a backup directory outside the app.

---

## ✅ Areas That Passed Audit

### Stores Usage
All stores have at least some usage:
- `authStore`: 5 refs
- `circleStore`: 27 refs
- `cockpitStore`: 44 refs
- `userStore`: 37 refs
- `journalStore`: 16 refs
- And others...

### Supabase Tables Referenced
Tables in use (via `database.ts`):
- `profiles`
- `conversations`
- `messages`
- `mood_checkins`
- `temperature`
- `circles`
- `nudges`
- `journal_entries`
- `education_progress`
- `notifications`

Migrations exist for:
- `shared_insights`
- `insight_responses`
- `shared_snapshots`
- `heart_notes`
- `heart_mail`

### Routes Structure
- Main tabs: `index`, `talk`, `learn`, `circle`, `me`
- Auth: `sign-in`, `sign-up`, `forgot-password`
- Deep links: `lesson/[id]`, `insight/[code]`

---

## Recommended Fix Order

1. **IMMEDIATE (Critical):**
   - Fix `CycleDashboard.tsx` COLORS references

2. **TODAY (High):**
   - Register all missing modals in `_layout.tsx`
   - Create Heart Notes entry point

3. **THIS WEEK (Medium):**
   - Decide on COLORS strategy (global vs local)
   - Wire up or remove unused stores
   - Check path alias configuration

4. **WHENEVER (Low):**
   - Remove backup files
   - Expand i18n usage throughout app

---

## Quick Fix Script

```bash
# Fix CycleDashboard.tsx
cd ~/alln1-psych

# Replace COLORS.danger with COLORS.error
sed -i 's/COLORS\.danger/COLORS.error/g' src/components/CycleDashboard.tsx

# For COLORS.card, either add to constants or replace with surface:
# Option A: Add to constants.ts (recommended)
# Add this line after 'surfaceElevated':
#   card: '#111118',

# Option B: Replace in file
sed -i 's/COLORS\.card/COLORS.surface/g' src/components/CycleDashboard.tsx
```

---

## Files Modified in This Audit
None - this is a read-only audit report.

---

*Generated by InGauge Codebase Audit*
