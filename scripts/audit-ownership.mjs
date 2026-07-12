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
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.bak'))
  .sort();

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
console.log('file\tpersist\tsupabase\tcategory');
for (const r of rows) {
  console.log(`${r.file}\t${r.persist}\t${r.supabase}\t${r.category}`);
}

const by = Object.create(null);
for (const r of rows) by[r.category] = (by[r.category] || 0) + 1;
console.log('---SUMMARY---');
for (const [k, v] of Object.entries(by)) console.log(`${k}=${v}`);
