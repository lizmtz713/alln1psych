#!/usr/bin/env node
/**
 * Route inventory for Expo Router (app/ tree).
 * Phase 1 absolute-truth helper — counts screens and lists route files.
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const APP = join(ROOT, 'app');

/** @type {string[]} */
const routes = [];

/** @param {string} dir */
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(tsx|ts|jsx|js)$/.test(name)) continue;
    if (name.startsWith('_')) continue; // layouts / loading
    routes.push(relative(APP, full));
  }
}

walk(APP);
routes.sort();
console.log(`ROUTE_COUNT=${routes.length}`);
for (const r of routes) console.log(r);
