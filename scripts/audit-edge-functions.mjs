import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const functionsRoot = path.join(root, 'supabase', 'functions');
const config = fs.readFileSync(path.join(root, 'supabase', 'config.toml'), 'utf8');
const failures = [];

const functionFiles = fs
  .readdirSync(functionsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => ({
    name: entry.name,
    file: path.join(functionsRoot, entry.name, 'index.ts'),
  }))
  .filter(({ file }) => fs.existsSync(file));

for (const { name, file } of functionFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: file,
    reportDiagnostics: true,
  });
  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      failures.push(`${name}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    }
  }

  if (/console\.(log|info|debug)\s*\(/.test(source)) {
    failures.push(`${name}: remove console logging from the production edge function`);
  }

  if (source.includes('api.openai.com')) {
    for (const required of ['auth.getUser', 'ai_usage_events', 'AbortController']) {
      if (!source.includes(required)) {
        failures.push(`${name}: OpenAI gateway is missing ${required}`);
      }
    }
  }
}

const explicitlyAuthenticated = [
  'chat',
  'analyze-checkin',
  'generate-wrapped-insights',
  'vision',
  'tts',
  'delete-account',
  'export-account',
];
for (const name of explicitlyAuthenticated) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = new RegExp(`\\[functions\\.${escaped}\\][\\s\\S]*?verify_jwt\\s*=\\s*true`);
  if (!block.test(config)) failures.push(`${name}: verify_jwt=true must be explicit in supabase/config.toml`);
}

const clientRoots = ['app', 'src'];
for (const clientRoot of clientRoots) {
  const stack = [path.join(root, clientRoot)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      if (!entry.isFile() || !/\.[cm]?[jt]sx?$/.test(entry.name)) continue;
      if (fs.readFileSync(fullPath, 'utf8').includes('api.openai.com')) {
        failures.push(`${path.relative(root, fullPath)}: mobile code must not call OpenAI directly`);
      }
    }
  }
}

if (failures.length) {
  console.error(`Edge security audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Edge security audit passed (${functionFiles.length} functions parsed).`);
