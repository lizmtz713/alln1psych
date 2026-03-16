#!/usr/bin/env node
/**
 * Route ownership audit for InGauge.
 * Ensures every route belongs to a product domain and flags:
 * - routes with no assigned domain
 * - new top-level stacks not in the documented list
 * - modal routes that look like full workflows (candidates for screen vs modal review)
 *
 * Domains: Cockpit, Signals, People, Tools, Manual, Me, Insights, Body, Emergency, Rituals
 * Run: npm run audit:ownership
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');

// Path prefix (or segment) → domain. Order matters: more specific first.
const PATH_TO_DOMAIN = [
  // Cockpit
  ['(tabs)/index', 'Cockpit'],
  ['cockpit-checkin', 'Cockpit'],
  ['quick-log', 'Cockpit'],
  ['gauge-detail', 'Cockpit'],
  ['mood-checkin', 'Cockpit'],
  // Signals
  ['(tabs)/signals', 'Signals'],
  ['drift-detector', 'Signals'],
  ['(tabs)/people', 'People'],
  ['(tabs)/circle', 'People'],
  ['(tabs)/lights', 'People'],
  ['invite-circle/', 'People'],
  ['(modals)/invite-circle', 'People'],
  ['(modals)/relational-bridge', 'Tools'],
  ['(modals)/reach-out-scaffold', 'Tools'],
  ['(modals)/help-someone', 'Tools'],
  ['heart-inbox', 'People'],
  ['heart-mail-detail', 'People'],
  ['heart-mail-compose', 'People'],
  ['heart-notes', 'People'],
  ['heart-compose', 'People'],
  ['heart-view', 'People'],
  ['love', 'People'],
  ['lights/', 'People'],
  ['mind-mail/', 'People'],
  // Tools
  ['(tabs)/tools', 'Tools'],
  ['tools/', 'Tools'],
  ['activity', 'Tools'],
  ['role-play', 'Tools'],
  ['decode', 'Tools'],
  ['resolve', 'Tools'],
  ['quick-reset', 'Tools'],
  ['referee', 'Tools'],
  ['replay', 'Tools'],
  ['relate', 'Tools'],
  ['ask-gauge', 'Tools'],
  ['prompt-generator', 'Tools'],
  ['pre-conversation-check', 'Tools'],
  ['awe-activities', 'Tools'],
  // Manual (Learn)
  ['(tabs)/learn', 'Manual'],
  ['learn/', 'Manual'],
  ['lesson/', 'Manual'],
  ['learning-style-quiz', 'Manual'],
  ['foundation/', 'Manual'],
  ['(modals)/foundation-', 'Manual'],
  ['attraction', 'Manual'],
  ['attachment-style', 'Manual'],
  ['boundaries', 'Manual'],
  ['difficult-people', 'Manual'],
  ['critical-thinking', 'Manual'],
  ['red-green-flags', 'Manual'],
  // Me
  ['(tabs)/me', 'Me'],
  ['profile/', 'Me'],
  ['settings', 'Me'],
  ['identity-setup/', 'Me'],
  ['(modals)/identity-setup', 'Me'],
  ['awards', 'Me'],
  ['notification-settings', 'Me'],
  ['disclaimer', 'Me'],
  ['data-use', 'Me'],
  ['features', 'Me'],
  ['habits/', 'Me'],
  ['(tabs)/talk', 'Tools'],
  ['new-journal', 'Me'],
  ['onboarding/', 'Cockpit'],
  ['(modals)/onboarding', 'Cockpit'],
  ['(modals)/onboarding-old', 'Cockpit'],
  ['body-maintenance-edit', 'Body'],
  // Insights
  ['forecast/', 'Insights'],
  ['timeline', 'Insights'],
  ['wrapped', 'Insights'],
  ['insight/', 'Insights'],
  ['share/', 'Insights'],
  ['weekly-insight', 'Insights'],
  ['share-insight', 'Insights'],
  ['share-snapshot', 'Insights'],
  ['flight-log/', 'Insights'],
  ['your-story/', 'Insights'],
  ['patterns', 'Insights'],
  ['history', 'Insights'],
  ['sovereignty-report', 'Insights'],
  ['therapist-share', 'Insights'],
  ['therapist-share-create', 'Insights'],
  // Body
  ['body-maintenance', 'Body'],
  ['cycle', 'Body'],
  ['health-connections', 'Body'],
  ['oura-connect', 'Body'],
  // Emergency
  ['emergency/', 'Emergency'],
  ['crisis-resources', 'Emergency'],
  // Rituals
  ['rituals/', 'Rituals'],
  ['debrief', 'Rituals'],
  // Auth (not a product domain; allowlisted)
  ['(auth)/', 'Auth'],
  // Root redirect
  ['index', 'Cockpit'],
];

// Documented top-level stacks (first segment under app/). New stacks must be added here and to route map.
const DOCUMENTED_TOP_LEVEL = new Set([
  '(auth)', '(tabs)', '(modals)', 'lesson', 'share', 'forecast', 'tools', 'learn',
  'foundation', 'onboarding', 'identity-setup', 'invite-circle', 'profile', 'habits', 'love', 'love-history', 'body-maintenance', 'news-my-way',
  'emergency', 'rituals', 'mind-mail', 'lights', 'flight-log', 'timeline', 'wrapped',
  'your-story', 'patterns', 'insight', 'index',
]);

// Modals that are multi-step or heavy workflows — consider whether they should be full screens.
const MODAL_WORKFLOW_CANDIDATES = [
  'love',
];

function getDomainForPath(relPath) {
  const normalized = relPath.replace(/\\/g, '/').replace(/\.tsx$/, '');
  for (const [prefix, domain] of PATH_TO_DOMAIN) {
    if (normalized === prefix || normalized.startsWith(prefix + '/') || normalized.startsWith(prefix)) return domain;
    if (prefix.endsWith('/') && normalized.startsWith(prefix)) return domain;
    if (!prefix.includes('/') && (normalized.endsWith('/' + prefix) || normalized === prefix)) return domain;
  }
  return null;
}

function listRouteFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name.startsWith('_')) continue;
      files.push(...listRouteFiles(path.join(dir, e.name), rel));
    } else if (e.name.endsWith('.tsx') && e.name !== '_layout.tsx') {
      if (e.name.startsWith('_')) continue;
      files.push(rel);
    }
  }
  return files;
}

function getTopLevelSegment(relPath) {
  const parts = relPath.split(path.sep).filter(Boolean);
  const first = parts[0] || '';
  return first.replace(/\.tsx$/, '');
}

function getModalName(relPath) {
  if (!relPath.startsWith('(modals)')) return null;
  const parts = relPath.split(path.sep).filter(Boolean);
  if (parts[0] === '(modals)' && parts[1] && !parts[1].endsWith('.tsx')) return parts[1];
  const file = parts[parts.length - 1];
  return file ? file.replace(/\.tsx$/, '') : null;
}

const routeFiles = listRouteFiles(APP_DIR);
const unowned = [];
const undocumentedStacks = new Set();
const modalWorkflowNotes = [];

for (const rel of routeFiles) {
  const domain = getDomainForPath(rel);
  if (!domain) unowned.push(rel);

  const top = getTopLevelSegment(rel);
  if (top && !top.startsWith('(') && !DOCUMENTED_TOP_LEVEL.has(top)) {
    undocumentedStacks.add(top);
  }

  const modalName = getModalName(rel);
  if (modalName && MODAL_WORKFLOW_CANDIDATES.includes(modalName)) {
    modalWorkflowNotes.push({ route: rel, modal: modalName });
  }
}

// --- Report ---
console.log('\n=== InGauge route ownership audit ===\n');

if (unowned.length > 0) {
  console.log('Routes with no assigned domain (add to PATH_TO_DOMAIN in this script):');
  unowned.slice(0, 40).forEach((r) => console.log('  -', r));
  if (unowned.length > 40) console.log('  ... and', unowned.length - 40, 'more');
  console.log('');
}

if (undocumentedStacks.size > 0) {
  console.log('Undocumented top-level stacks (add to INGAUGE-ROUTE-MAP and DOCUMENTED_TOP_LEVEL):');
  [...undocumentedStacks].sort().forEach((s) => console.log('  -', s));
  console.log('');
}

if (modalWorkflowNotes.length > 0) {
  console.log('Modal-vs-screen review (workflow-like modals; consider full screen if multi-step):');
  modalWorkflowNotes.slice(0, 25).forEach(({ route, modal }) => console.log('  -', modal, '→', route));
  if (modalWorkflowNotes.length > 25) console.log('  ... and', modalWorkflowNotes.length - 25, 'more');
  console.log('');
}

const hasIssues = unowned.length > 0 || undocumentedStacks.size > 0;
const exitCode = hasIssues ? 1 : 0;
console.log(hasIssues
  ? 'Ownership audit found routes without a domain or undocumented stacks (update script and route map).'
  : 'Route ownership audit passed (all routes have a domain; no new undocumented stacks).');
console.log('');
process.exit(exitCode);
