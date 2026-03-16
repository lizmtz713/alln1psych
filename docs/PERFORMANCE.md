# InGauge — Performance & Reducing Lag

Tips to keep the app responsive and avoid slowdowns for users.

## Already in place

- **Expo / React Native:** Hermes enabled by default; new architecture can be enabled (newArchEnabled in app.config.js).
- **Lists:** Use `FlatList` (or `FlashList` if you add it) for long lists so only visible items are rendered.
- **Images:** Use `expo-image` or resize/cache where appropriate; avoid huge assets on the main bundle.

## What you can do

### 1. **Heavy screens (e.g. Home, Activity, Learn)**

- **Memoize derived data:** Use `useMemo` for expensive computations (e.g. grouping timeline, filtering lessons). Avoid recalculating on every render.
- **Callbacks:** Use `useCallback` for handlers passed to child components so children don’t re-render unnecessarily.
- **Component split:** Break large screens into smaller components so only the part that needs to update re-renders.

### 2. **Lists**

- Use **FlatList** (or **FlashList**) with `keyExtractor`, `getItemLayout` if item height is fixed (reduces layout work), and `windowSize` / `maxToRenderPerBatch` if you have very long lists.
- Avoid putting heavy components inside list item render; keep list items light.

### 3. **Stores (Zustand)**

- **Selectors:** Prefer `useStore((s) => s.someField)` instead of `useStore()` so the component only re-renders when that field changes.
- Avoid storing large objects that change often if only a small part is used in the UI.

### 4. **Data loading**

- Use **React Query** (or similar) for server data so you get caching, deduplication, and background refetch without blocking the UI.
- Show skeletons or placeholders while loading instead of blocking the whole screen.

### 5. **JS thread**

- Move heavy work off the JS thread: **large JSON parsing**, **big sorts/filters** — consider doing in a worker or chunking (e.g. process in batches with requestAnimationFrame or setTimeout(0)).
- Avoid doing a lot of synchronous work right after navigation or on first paint.

### 6. **Assets**

- Compress images; use appropriate resolutions for device (e.g. @2x, @3x).
- Lazy-load screens or heavy modals with `React.lazy` / dynamic import where it makes sense (e.g. rarely used tools).

### 7. **Logging**

- In production, avoid `console.log` in hot paths; use a logger that no-ops or is stripped in release.

If you see a specific screen or flow that feels slow, focus on: (1) that screen’s render path (what re-renders), (2) any heavy computation in the same frame as user input, and (3) list virtualization if the screen has long lists.
