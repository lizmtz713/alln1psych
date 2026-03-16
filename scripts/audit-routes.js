#!/usr/bin/env node
/**
 * Route audit for Expo Router app.
 * Checks: route files exist, referenced routes resolve, no duplicate route names,
 * screens have default export (basic), and lists orphan candidates.
 * Run: npm run audit:routes
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const SRC_DIR = path.join(__dirname, '..', 'src');

// --- 1. Collect all route files (app/**/*.tsx) ---
function listRouteFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name.startsWith('_')) continue; // e.g. _layout is not a route segment in the same way
      files.push(...listRouteFiles(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.tsx') && e.name !== '_layout.tsx') {
      const name = e.name.replace(/\.tsx$/, '');
      if (name.startsWith('_')) continue;
      files.push({ rel, full: path.join(dir, e.name), segment: name });
    }
  }
  return files;
}

// Expo Router: (group) does not add to URL; [param] is dynamic; strip .tsx from segment.
function fileToRoute(rel) {
  const parts = rel.split(path.sep).map((p) => {
    const name = p.replace(/\.tsx$/, '');
    if (name.startsWith('(') && name.endsWith(')')) return null;
    if (name.startsWith('[') && name.endsWith(']')) return '[param]';
    return name;
  });
  return '/' + parts.filter(Boolean).join('/');
}

const routeFiles = listRouteFiles(APP_DIR);
const routeByPath = new Map();
routeFiles.forEach(({ rel, full }) => {
  const r = fileToRoute(rel);
  if (!routeByPath.has(r)) routeByPath.set(r, []);
  routeByPath.get(r).push(rel);
});

// --- 2. Extract route strings from code (router.push, pathname, route:) ---
function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function* walkDir(dir, ext = '.tsx') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && !e.name.startsWith('.')) {
      yield* walkDir(full, ext);
    } else if (e.name.endsWith(ext) || e.name.endsWith('.ts')) {
      yield full;
    }
  }
}

const routeRefs = new Set();
const routeRefPatterns = [
  /router\.push\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /router\.push\s*\(\s*\{\s*pathname:\s*['"`]([^'"`]+)['"`]/g,
  /pathname:\s*['"`]([^'"`]+)['"`]/g,
  /route:\s*['"`]([^'"`]+)['"`]/g,
  /href=\s*['"`]([^'"`?#]+)/g,
  /Link\s+.*?href=\s*['"`]([^'"`?#]+)/g,
];

for (const file of [...walkDir(APP_DIR), ...walkDir(SRC_DIR)]) {
  const content = readFileSafe(file);
  for (const re of routeRefPatterns) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(content)) !== null) {
      let r = m[1].trim();
      if (r.includes('?')) r = r.split('?')[0];
      if (r && !r.startsWith('http') && !r.startsWith('mailto:')) {
        if (!r.startsWith('/')) r = '/' + r;
        routeRefs.add(r);
      }
    }
  }
}

// Normalize ref for comparison: strip (groups) and treat [x] as [param]
function normalizeRoute(ref) {
  let s = ref.replace(/^\/+/, '/');
  const parts = s.split('/').filter(Boolean);
  const normalized = parts
    .map((p) => {
      if (p.startsWith('(') && p.endsWith(')')) return null;
      if (p.startsWith('[')) return '[param]';
      return p;
    })
    .filter(Boolean);
  return '/' + normalized.join('/');
}

const normalizedRouteFiles = new Set();
routeFiles.forEach(({ rel }) => normalizedRouteFiles.add(normalizeRoute(fileToRoute(rel))));

// --- 3. Report ---
const issues = [];
const referenced = new Set();

routeRefs.forEach((ref) => {
  if (ref.includes('${')) return; // template literal; skip
  const norm = normalizeRoute(ref);
  referenced.add(norm);
  const possible = Array.from(normalizedRouteFiles).filter((r) => {
    if (r === norm) return true;
    const normNoIndex = norm.replace(/\/index$/, '');
    const rNoIndex = r.replace(/\/index$/, '');
    if (normNoIndex === rNoIndex || norm === rNoIndex || r === normNoIndex) return true;
    const rParts = r.split('/').filter(Boolean);
    const nParts = norm.split('/').filter(Boolean);
    // Ref is path prefix of a dynamic route: e.g. /tools/focus/exercise matches /tools/focus/exercise/[param]
    if (rParts.length === nParts.length + 1 && rParts[rParts.length - 1] === '[param]' && nParts.every((np, i) => rParts[i] === np)) return true;
    if (rParts.length !== nParts.length) return false;
    return rParts.every((rp, i) => rp === '[param]' || rp === nParts[i]);
  });
  const isEntry = ref === '/' || ref === '/(tabs)' || ref === '/(tabs)/' || ref === '/(auth)' || ref === '/(modals)' || ref.endsWith('/index');
  if (possible.length === 0 && !isEntry) {
    issues.push({ type: 'REF_NO_FILE', route: ref, normalized: norm });
  }
});

// Orphans: route files that are never referenced (heuristic: many index/layout are reached via parent)
const routeFileNorm = routeFiles.map(({ rel }) => normalizeRoute(fileToRoute(rel)));
const orphans = routeFileNorm.filter((r) => !referenced.has(r));
// Filter out obvious entry points that are reached by tab or root
const entryLike = /^\/(\(tabs\)|\(auth\)|\(modals\)|index|lesson|insight|share|forecast|wrapped|timeline|flight-log|emergency|rituals|lights|mind-mail|love|love-history|habits|profile|body-maintenance|patterns|news-my-way)$/;
const orphanCandidates = orphans.filter((o) => !entryLike.test(o.replace(/\[param\]/g, 'x')));

console.log('\n=== InGauge route audit ===\n');
console.log('Route files found:', routeFiles.length);
console.log('Unique route references in code:', referenced.size);
console.log('');

if (issues.length > 0) {
  console.log('Issues (referenced route has no matching file):');
  issues.slice(0, 30).forEach(({ route }) => console.log('  -', route));
  if (issues.length > 30) console.log('  ... and', issues.length - 30, 'more');
  console.log('');
}

if (orphanCandidates.length > 0) {
  console.log('Possible orphan routes (file exists but no direct reference found):');
  orphanCandidates.slice(0, 20).forEach((r) => console.log('  -', r));
  if (orphanCandidates.length > 20) console.log('  ... and', orphanCandidates.length - 20, 'more');
  console.log('');
}

// Duplicate route names (same URL pattern from different files)
const byNorm = new Map();
routeFiles.forEach(({ rel, full }) => {
  const n = normalizeRoute(fileToRoute(rel));
  if (!byNorm.has(n)) byNorm.set(n, []);
  byNorm.get(n).push(rel);
});
const duplicates = [...byNorm.entries()].filter(([, files]) => files.length > 1);
if (duplicates.length > 0) {
  console.log('Duplicate route segments (multiple files map to same path):');
  duplicates.forEach(([norm, files]) => console.log('  ', norm, '->', files.join(', ')));
  console.log('');
}
if (issues.length > 0 && new Set(issues.map((i) => i.route)).has('/profile/gauges/${gaugeId}')) {
  console.log('Note: Refs with ${ are template literals and are skipped.');
  console.log('');
}

// Missing default export (quick check: "export default" or "export { default }")
const noDefault = routeFiles.filter(({ full }) => {
  const content = readFileSafe(full);
  return !/\bexport\s+default\b/.test(content) && !/export\s*\{\s*default\s*\}/.test(content);
});
if (noDefault.length > 0) {
  console.log('Files that may lack default export (layout files are OK):');
  noDefault.slice(0, 15).forEach(({ rel }) => console.log('  -', rel));
  if (noDefault.length > 15) console.log('  ... and', noDefault.length - 15, 'more');
  console.log('');
}

// Exit 1 only when there are broken references (REF_NO_FILE). Orphans and duplicates are informational.
const exitCode = issues.length > 0 ? 1 : 0;
console.log(issues.length === 0 ? 'Route audit passed (no broken references).' : 'Route audit found broken references (fix or add route files).');
console.log('');
process.exit(exitCode);
