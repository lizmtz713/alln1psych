import fs from 'node:fs';
import path from 'node:path';

const migrationsRoot = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs
  .readdirSync(migrationsRoot)
  .filter((file) => file.endsWith('.sql'))
  .map((file) => {
    const match = /^(\d{8}(?:\d{6})?)_[a-z0-9_]+\.sql$/.exec(file);
    return { file, version: match ? match[1] : null };
  })
  // Supabase applies migration files in filename order. Comparing the complete
  // filename also handles legacy 8-digit versions that prefix newer timestamps.
  .sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0))
  .map(({ file }) => file);
const failures = [];
const versions = new Map();
const tableCreators = new Map();

for (const [index, file] of files.entries()) {
  const match = /^(\d{8}(?:\d{6})?)_[a-z0-9_]+\.sql$/.exec(file);
  if (!match) {
    failures.push(`${file}: use <YYYYMMDDHHMMSS>_<name>.sql (legacy YYYYMMDD is accepted)`);
    continue;
  }

  const version = match[1];
  const existing = versions.get(version);
  if (existing) failures.push(`${file}: migration version ${version} is already used by ${existing}`);
  versions.set(version, file);

  const source = fs.readFileSync(path.join(migrationsRoot, file), 'utf8');
  for (const table of source.matchAll(/create\s+table\s+if\s+not\s+exists\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi)) {
    if (!tableCreators.has(table[1])) tableCreators.set(table[1], { file, index });
  }
}

for (const [index, file] of files.entries()) {
  const source = fs.readFileSync(path.join(migrationsRoot, file), 'utf8');
  const dependencies = new Set();

  for (const match of source.matchAll(/references\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi)) {
    dependencies.add(match[1]);
  }
  for (const match of source.matchAll(/(?:alter\s+table|on)\s+public\.([a-z_][a-z0-9_]*)/gi)) {
    dependencies.add(match[1]);
  }

  for (const table of dependencies) {
    const creator = tableCreators.get(table);
    if (creator && creator.index > index) {
      failures.push(`${file}: references ${table} before it is created by ${creator.file}`);
    }
  }
}

if (failures.length) {
  console.error(`Migration audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Migration audit passed (${files.length} unique, dependency-ordered migrations).`);
