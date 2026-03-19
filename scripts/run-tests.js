#!/usr/bin/env node
/**
 * Runs project validation: typecheck + route audit.
 * Use for CI or pre-commit. Add Jest later with: npm run test:unit
 * Run: npm run test
 */

const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = false;

function run(name, cmd) {
  console.log('\n---', name, '---\n');
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit' });
  } catch (e) {
    failed = true;
  }
}

run('TypeScript', 'npx tsc --noEmit');
run('Route audit', 'node scripts/audit-routes.js');

if (failed) {
  console.log('\nOne or more checks failed.\n');
  process.exit(1);
}
console.log('\nAll checks passed.\n');
