#!/usr/bin/env node
/**
 * Ownership inventory — maps Zustand stores to persist vs ephemeral.
 * Phase 1 absolute-truth helper for UI-state vs server-cache separation.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const STORES = join(ROOT, 'src', 'stores');

const files = readdirSync(STORES)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.bak') && f !== 'storeRegistry.ts')
  .sort();

const registry = readFileSync(join(STORES, 'storeRegistry.ts'), 'utf8');
const unregistered = files.filter((file) => {
  const source = readFileSync(join(STORES, file), 'utf8');
  if (!/^export const use[A-Za-z0-9]+Store/m.test(source)) return false;
  return !registry.includes(`'./${file.replace(/\.ts$/, '')}'`);
});

if (unregistered.length > 0) {
  console.error(`UNREGISTERED_USER_STORES=${unregistered.join(',')}`);
  process.exitCode = 1;
}

/** @type {{ file: string, persist: boolean, supabase: boolean, category: string }[]} */
const rows = [];

for (const file of files) {
  const src = readFileSync(join(STORES, file), 'utf8');
  const persist = /\bpersist\s*\(/.test(src);
  const supabase = /from\(['"`]|supabase\./.test(src);
  let category = 'ephemeral-ui';
  if (supabase) category = 'should-be-react-query';
  else if (persist) category = 'local-persist-candidate-for-server';
  rows.push({ file, persist, supabase, category });
}

console.log(`STORE_COUNT=${rows.length}`);
console.log(`UNREGISTERED_USER_STORE_COUNT=${unregistered.length}`);
console.log('file\tpersist\tsupabase\tcategory');
for (const r of rows) {
  console.log(`${r.file}\t${r.persist}\t${r.supabase}\t${r.category}`);
}

const by = Object.create(null);
for (const r of rows) by[r.category] = (by[r.category] || 0) + 1;
console.log('---SUMMARY---');
for (const [k, v] of Object.entries(by)) console.log(`${k}=${v}`);
