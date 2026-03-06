# Navigation Audit — No trapped users

Every screen must offer a clear way back: **back arrow**, **Cancel** button, **X** (modals), or **working swipe gesture**.

## Fix pattern

### Stack screens (e.g. lights, rituals)
Add a standard header with back button:

```tsx
<View style={[styles.header, { paddingTop: insets.top }]}>
  <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
  </Pressable>
  <Text style={styles.headerTitle}>Screen Title</Text>
  <View style={{ width: 40 }} />
</View>
```

Styles:
- `header`: row, alignItems center, padding, borderBottom
- `backBtn`: padding 8
- `headerTitle`: fontSize 18, fontWeight 600

### Modals (`app/(modals)/*`)
- `headerShown: false` in layout → each modal must implement its own close.
- Prefer **X** in top-right: `<Pressable onPress={() => router.back()}><Ionicons name="close" size={24} /></Pressable>`.

## Checklist — what was fixed

| Area | Screen | Had back? | Fix |
|------|--------|-----------|-----|
| **app/lights/** | world.tsx | Stack header only | ✅ Added in-screen header with chevron-back |
| **app/lights/** | insights.tsx | Stack header only | ✅ Added in-screen header with chevron-back |
| **app/lights/** | learn.tsx | Stack header only | ✅ Added in-screen header with chevron-back |
| **app/lights/** | add.tsx | Stack header only | ✅ Added in-screen header with chevron-back |
| **app/lights/** | [id].tsx | "Go back" when not found; Stack header when found | ✅ Already OK |
| **app/lights/** | log-entry.tsx | Cancel + Stack | ✅ Already OK |
| **app/lights/** | lessons/* | Inner Stack header | ✅ Already OK |
| **app/lights/** | family/* | Back / Cancel | ✅ Already OK |
| **(modals)** | All | Various (close / back) | ✅ Audited; all have close or back |

## Files to check when adding new screens

- **app/lights/** — Prefer in-screen header + back so users are never stuck even if Stack header is hidden.
- **app/(modals)/*** — Every new modal must include an X or back in its header.
- **app/rituals/**, **app/mind-mail/**, **app/love/**, **app/profile/**, **app/emergency/** — Same rule: visible back or cancel.

## Quick scan command

```bash
# Screens that might lack router.back() or close
rg -L "router\.back|chevron-back|close-outline|close\"|Cancel" app --glob "*.tsx"
```

Run after adding new screens to ensure none are missing.
