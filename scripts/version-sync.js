#!/usr/bin/env node
/**
 * Versioning Synchronization System
 *
 * Compares two values (Folder Version vs Site Version) along with content hashes
 * to verify whether the site accurately reflects what is in the folder.
 *
 * Rules:
 *   - Folder Version: Stored in root VERSION & version.json, labeled in README.md & AGENTS.md.
 *   - Site Version: Stored in site/version.json, labeled in site/index.html badge & footer.
 *   - Version increment rules:
 *       +0.1 for small changes (docs, README, scripts, site styling)
 *       +1.0 when a skill was changed (any file in skills/ or agents/)
 *
 * Commands:
 *   node scripts/version-sync.js check         Compare Folder Version and Site Version
 *   node scripts/version-sync.js bump [type]   Bump folder version (+1.0 for skill, +0.1 for doc/auto)
 *   node scripts/version-sync.js sync          Sync site (skills.json, site/version.json, HTML badges)
 *   node scripts/version-sync.js init          Initialize versioning at Version: 1.0
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VERSION_FILE = path.join(ROOT, 'VERSION');
const VERSION_JSON = path.join(ROOT, 'version.json');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const README_MD = path.join(ROOT, 'README.md');
const AGENTS_MD = path.join(ROOT, 'AGENTS.md');

const SITE_DIR = path.join(ROOT, 'site');
const SITE_VERSION_JSON = path.join(SITE_DIR, 'version.json');
const SITE_SKILLS_JSON = path.join(SITE_DIR, 'skills.json');
const SITE_INDEX_HTML = path.join(SITE_DIR, 'index.html');
const SITE_SKILLS_HTML = path.join(SITE_DIR, 'skills', 'index.html');
const SITE_AGENTS_HTML = path.join(SITE_DIR, 'agents', 'index.html');
const SITE_DOCS_HTML = path.join(SITE_DIR, 'docs', 'index.html');

const SKILLS_DIR = path.join(ROOT, 'skills');

// --- Helper Functions ---

function walkFiles(dir, base = dir, out = {}) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, base, out);
    else out[path.relative(base, full).split(path.sep).join('/')] = full;
  }
  return out;
}

function parseFrontmatter(fileContent) {
  const cleanContent = fileContent.replace(/\r\n/g, '\n');
  if (!cleanContent.startsWith('---')) return {};
  const end = cleanContent.indexOf('\n---', 3);
  if (end === -1) return {};
  const fm = cleanContent.slice(3, end);
  const lines = fm.split('\n');
  const res = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim().replace(/^['"]|['"]$/g, '');
      if (!val || /^(\||>)[+-]?$/.test(val)) {
        const buf = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nxt = lines[j];
          if (/^\s{2,}\S/.test(nxt) || /^\t+\S/.test(nxt)) {
            buf.push(nxt.trim());
          } else {
            break;
          }
        }
        val = buf.join(' ');
      }
      res[key] = val;
    }
  }
  return res;
}

export function extractSkillsData() {
  const list = [];
  const entries = fs.readdirSync(SKILLS_DIR).sort();
  for (const entry of entries) {
    const skillPath = path.join(SKILLS_DIR, entry, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const text = fs.readFileSync(skillPath, 'utf8');
      const fm = parseFrontmatter(text);
      list.push({
        name: entry,
        desc: fm.description || ''
      });
    }
  }
  return list;
}

export function computeFolderHash() {
  const hash = crypto.createHash('sha256');
  // Hash all skill files (SKILL.md, references/, scripts/, evals) except historical artifacts
  const isHistorical = (rel) => rel.includes('/evals/snapshots/') || rel.includes('/evals/iteration-') || rel.endsWith('/results.json');
  if (fs.existsSync(SKILLS_DIR)) {
    const skillFiles = [];
    for (const skill of fs.readdirSync(SKILLS_DIR).sort()) {
      const skillDir = path.join(SKILLS_DIR, skill);
      if (fs.statSync(skillDir).isDirectory()) {
        for (const [rel, full] of Object.entries(walkFiles(skillDir))) {
          if (!isHistorical(rel)) skillFiles.push([`${skill}/${rel}`, full]);
        }
      }
    }
    skillFiles.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    for (const [rel, full] of skillFiles) {
      hash.update(`skill:${rel}:${fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')}`);
    }
  }
  // Hash docs and reviewer personas
  for (const [label, dir] of [['doc', path.join(ROOT, 'docs')], ['agent', path.join(ROOT, 'agents')]]) {
    if (fs.existsSync(dir)) {
      const files = Object.entries(walkFiles(dir))
        .filter(([rel]) => rel.endsWith('.md'))
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
      for (const [rel, full] of files) {
        hash.update(`${label}:${rel}:${fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')}`);
      }
    }
  }
  return hash.digest('hex').slice(0, 10);
}

export function getFolderVersion() {
  if (fs.existsSync(VERSION_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(VERSION_JSON, 'utf8'));
      if (data.version) return data.version;
    } catch {}
  }
  if (fs.existsSync(VERSION_FILE)) {
    const raw = fs.readFileSync(VERSION_FILE, 'utf8').trim();
    if (raw) return raw.replace(/^Version:\s*/i, '');
  }
  return '1.0';
}

export function getSiteVersion() {
  if (fs.existsSync(SITE_VERSION_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(SITE_VERSION_JSON, 'utf8'));
      if (data.version) return data.version;
    } catch {}
  }
  if (fs.existsSync(SITE_INDEX_HTML)) {
    const html = fs.readFileSync(SITE_INDEX_HTML, 'utf8');
    const m = html.match(/id=["']siteVersionBadge["'][^>]*>Version:\s*([0-9.]+)/i);
    if (m) return m[1];
  }
  return 'unknown';
}

/**
 * The contentHash version.json records about the folder. `bump` writes it, but
 * nothing ever read it back: the gate compared the SITE hash against the
 * freshly computed folder hash and declared the pair verified. A stale value
 * could therefore sit in the committed file indefinitely - which is exactly
 * what had happened.
 *
 * Only an ABSENT file is "nothing to compare". A file that is present but
 * unreadable, or that carries no contentHash, is a broken artifact and has to
 * fail: folding those into the same null made every one of them a silent pass.
 */
export function readDeclaredFolderHash() {
  if (!fs.existsSync(VERSION_JSON)) return { state: 'absent', hash: null, reason: null };
  let data;
  try {
    data = JSON.parse(fs.readFileSync(VERSION_JSON, 'utf8'));
  } catch (e) {
    return { state: 'unreadable', hash: null, reason: `invalid JSON (${e.message})` };
  }
  if (!data || typeof data.contentHash !== 'string' || !data.contentHash) {
    return { state: 'malformed', hash: null, reason: 'no contentHash field' };
  }
  return { state: 'declared', hash: data.contentHash, reason: null };
}

export function getDeclaredFolderHash() {
  return readDeclaredFolderHash().hash;
}

export function getSiteHash() {
  if (fs.existsSync(SITE_VERSION_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(SITE_VERSION_JSON, 'utf8'));
      return data.contentHash || 'none';
    } catch {}
  }
  return 'none';
}

// --- Commands ---

export function checkSync() {
  const folderVer = getFolderVersion();
  const siteVer = getSiteVersion();
  const folderHash = computeFolderHash();
  const siteHash = getSiteHash();

  // Cross-check every declared version source independently: version.json is
  // only one of them, so a stale VERSION or package.json would otherwise pass.
  const versionSources = [];
  if (fs.existsSync(VERSION_FILE)) {
    versionSources.push(['VERSION', fs.readFileSync(VERSION_FILE, 'utf8').trim().replace(/^Version:\s*/i, '')]);
  }
  if (fs.existsSync(PACKAGE_JSON)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
      if (pkg.version) versionSources.push(['package.json', String(pkg.version).replace(/\.0$/, '')]);
    } catch {}
  }
  const sourceDrift = versionSources.filter(([, v]) => v !== folderVer);

  // Check catalog diffs. Both directions: a site entry with no folder
  // counterpart is as wrong as a stale description, and diffing only the folder
  // forward let checkSync print "47/47 skills aligned" and exit 0 while the
  // public site advertised a skill this pack never shipped.
  const folderSkills = extractSkillsData();
  const totalSkills = folderSkills.length;
  const catalogDiffs = [];
  let alignedSkills = 0;
  if (fs.existsSync(SITE_SKILLS_JSON)) {
    try {
      const siteSkills = JSON.parse(fs.readFileSync(SITE_SKILLS_JSON, 'utf8'));
      // Build the lookup by hand so a repeated name is reported instead of
      // silently collapsing: `new Map(entries)` keeps the last value for a
      // repeated key, which let a contradictory duplicate hide behind a
      // correct one.
      const siteMap = new Map();
      const duplicated = new Set();
      for (const entry of siteSkills) {
        if (!entry || typeof entry.name !== 'string' || !entry.name) {
          catalogDiffs.push('malformed site catalog entry');
          continue;
        }
        if (siteMap.has(entry.name)) duplicated.add(entry.name);
        siteMap.set(entry.name, entry.desc);
      }
      for (const name of duplicated) catalogDiffs.push(`${name} (duplicated on site)`);
      const folderNames = new Set(folderSkills.map((s) => s.name));

      for (const skill of folderSkills) {
        const sDesc = siteMap.get(skill.name);
        if (sDesc !== skill.desc) {
          catalogDiffs.push(skill.name);
        } else {
          alignedSkills++;
        }
      }

      for (const name of siteMap.keys()) {
        if (!folderNames.has(name)) {
          catalogDiffs.push(`${name} (site only)`);
        }
      }
    } catch (e) {
      catalogDiffs.push(`Error reading site/skills.json: ${e.message}`);
      alignedSkills = 0;
    }
  } else {
    catalogDiffs.push('site/skills.json missing');
  }

  const versionsMatch = folderVer === siteVer;
  const hashesMatch = folderHash === siteHash;
  const catalogClean = catalogDiffs.length === 0;
  const sourcesClean = sourceDrift.length === 0;
  // version.json's own record of the folder is part of "is this true?", not
  // just bookkeeping. It was written on every bump and verified never.
  const declared = readDeclaredFolderHash();
  const declaredClean = declared.state === 'absent' || (declared.state === 'declared' && declared.hash === folderHash);
  const inSync = versionsMatch && hashesMatch && catalogClean && sourcesClean && declaredClean;

  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     VERSIONING SYNCHRONIZATION STATUS                      ║');
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  console.log(`║  Folder Version : Version: ${folderVer.padEnd(8)} [Content Hash: ${folderHash}]             ║`);
  console.log(`║  Site Version   : Version: ${siteVer.padEnd(8)} [Content Hash: ${siteHash.padEnd(10)}]       ║`);
  console.log(`║  Skills In Sync : ${catalogClean ? `${alignedSkills}/${totalSkills} skills aligned` : `${alignedSkills}/${totalSkills} aligned (${catalogDiffs.length} differ)`.padEnd(20)}                         ║`);
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  if (inSync) {
    console.log('║  STATUS         : ✓ IN SYNC — The site accurately reflects the folder!    ║');
  } else {
    console.log('║  STATUS         : ✗ OUT OF SYNC — The site does NOT match the folder!     ║');
    console.log('║  Discrepancies  :                                                          ║');
    if (!versionsMatch) {
      console.log(`║    - Version mismatch: Folder=${folderVer} vs Site=${siteVer}`.padEnd(77) + '║');
    }
    if (!hashesMatch) {
      console.log(`║    - Content hash mismatch: Folder=${folderHash} vs Site=${siteHash}`.padEnd(77) + '║');
    }
    if (!catalogClean) {
      console.log(`║    - Skill catalog differs: ${catalogDiffs.slice(0, 3).join(', ')}${catalogDiffs.length > 3 ? '...' : ''}`.padEnd(77) + '║');
    }
    if (!declaredClean) {
      const detail = declared.reason
        ? `version.json is unusable: ${declared.reason}`
        : `version.json hash is stale: ${declared.hash} (folder ${folderHash})`;
      // Truncate rather than pad: a long hash pair used to run past the frame
      // and the closing border landed in the wrong column.
      console.log(`║    - ${detail}`.slice(0, 77).padEnd(77) + '║');
    }
    if (!sourcesClean) {
      console.log(`║    - Version source drift: ${sourceDrift.map(([f, v]) => `${f}=${v}`).join(', ')} (folder=${folderVer})`.padEnd(77) + '║');
    }
    // syncSite() rewrites site/* and never version.json, so the old fixed advice
    // sent a maintainer in a circle on a stale declared hash: run it, stay red.
    const action = !declaredClean
      ? 'Run "npm run version:bump" then "npm run sync:site".'
      : 'Run "npm run sync:site" to bring site into sync.';
    console.log(`║  Action Needed  : ${action}`.padEnd(77) + '║');
  }
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  return inSync;
}

export function bumpVersion(typeArg) {
  let bumpType = typeArg;
  if (!bumpType || bumpType === 'auto' || bumpType === '--auto') {
    // Detect from git diff
    try {
      const diffFiles = execSync('git status --porcelain', { encoding: 'utf8', cwd: ROOT });
      const lines = diffFiles.split(/\r?\n/).filter((l) => l.trim().length > 0);
      // Parse status entries (XY PATH, or XY ORIG -> NEW for renames) and match
      // only paths actually rooted at skills/ or agents/, so site pages like
      // site/skills/index.html do not trigger a +1.0 skill bump.
      const paths = lines.flatMap((l) => {
        const body = l.slice(3);
        const parts = body.split(' -> ');
        return parts.map((p) => p.trim().replace(/^"|"$/g, ''));
      });
      const skillChanges = paths.some((p) => /^(skills|agents)[/\\]/.test(p));
      if (skillChanges) {
        bumpType = 'skill';
      } else {
        bumpType = 'doc';
      }
    } catch {
      bumpType = 'doc';
    }
  }

  const currentStr = getFolderVersion();
  const currentNum = parseFloat(currentStr) || 1.0;
  let newNum;
  let label;

  if (bumpType && bumpType.startsWith('set:')) {
    newNum = parseFloat(bumpType.replace('set:', '')) || 1.0;
    label = `set to ${newNum.toFixed(1)}`;
  } else if (bumpType === 'skill' || bumpType === '--skill') {
    newNum = Math.round((currentNum + 1.0) * 10) / 10;
    label = '+1.0 for skill change';
  } else {
    newNum = Math.round((currentNum + 0.1) * 10) / 10;
    label = '+0.1 for docs/minor change';
  }

  const newVer = newNum.toFixed(1);
  const contentHash = computeFolderHash();
  const timestamp = new Date().toISOString();

  // 1. Write VERSION
  fs.writeFileSync(VERSION_FILE, newVer + '\n', 'utf8');

  // 2. Write version.json
  const vData = {
    version: newVer,
    label: `Version: ${newVer}`,
    contentHash,
    // Derived, never a literal: a hardcoded 47 outlives a skill being added or
    // retired and turns the published count into a claim nothing checks.
    skillsCount: extractSkillsData().length,
    lastUpdated: timestamp,
    lastChangeType: bumpType
  };
  fs.writeFileSync(VERSION_JSON, JSON.stringify(vData, null, 2) + '\n', 'utf8');

  // 3. Update package.json
  if (fs.existsSync(PACKAGE_JSON)) {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    pkg.version = `${newVer}.0`;
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  // 4. Update README.md badge if present
  if (fs.existsSync(README_MD)) {
    let readme = fs.readFileSync(README_MD, 'utf8');
    readme = readme.replace(/badge\/version-[0-9.]+-emerald\.svg/g, `badge/version-${newVer}-emerald.svg`);
    fs.writeFileSync(README_MD, readme, 'utf8');
  }

  console.log(`✓ Folder version bumped: Version: ${currentStr} → Version: ${newVer} (${label})`);
  console.log(`  Content hash: ${contentHash}`);
  console.log(`  Next: run 'npm run sync:site' when site updates are ready to publish.`);

  return newVer;
}

export function syncSite() {
  const folderVer = getFolderVersion();
  const contentHash = computeFolderHash();
  const timestamp = new Date().toISOString();

  // 1. Regenerate site/skills.json
  const skillsData = extractSkillsData();
  fs.writeFileSync(SITE_SKILLS_JSON, JSON.stringify(skillsData, null, 2) + '\n', 'utf8');
  console.log(`✓ Regenerated site/skills.json (${skillsData.length} skills)`);

  // 2. Write site/version.json
  const siteVData = {
    version: folderVer,
    label: `Version: ${folderVer}`,
    contentHash,
    folderVersion: folderVer,
    syncedAt: timestamp
  };
  fs.writeFileSync(SITE_VERSION_JSON, JSON.stringify(siteVData, null, 2) + '\n', 'utf8');
  console.log(`✓ Updated site/version.json to Version: ${folderVer} [hash: ${contentHash}]`);

  // 3. Update site/index.html (navbar badge and footer)
  if (fs.existsSync(SITE_INDEX_HTML)) {
    let html = fs.readFileSync(SITE_INDEX_HTML, 'utf8');
    // navbar badge
    if (html.includes('id="siteVersionBadge"')) {
      html = html.replace(/(<span id="siteVersionBadge"[^>]*>)[^<]*(<\/span>)/, `$1Version: ${folderVer}$2`);
    }
    // else: nav badge intentionally removed (version lives in footer) — do not reinsert
    // footer label
    if (html.includes('id="siteVersionFooter"')) {
      html = html.replace(/(<span id="siteVersionFooter"[^>]*>)[^<]*(<\/span>)/, `$1Version: ${folderVer}$2`);
    } else {
      html = html.replace(
        /(<div>© 2026 issue-to-pr-skills · )(MIT)/,
        `$1<span id="siteVersionFooter">Version: ${folderVer}</span> · $2`
      );
    }
    fs.writeFileSync(SITE_INDEX_HTML, html, 'utf8');
    console.log(`✓ Updated site/index.html with Version: ${folderVer}`);
  }

  // 4. Update subpages footers (skills, agents, docs)
  for (const pagePath of [SITE_SKILLS_HTML, SITE_AGENTS_HTML, SITE_DOCS_HTML]) {
    if (fs.existsSync(pagePath)) {
      let html = fs.readFileSync(pagePath, 'utf8');
      if (html.includes('id="siteVersionFooter"')) {
        html = html.replace(/(<span id="siteVersionFooter"[^>]*>)[^<]*(<\/span>)/, `$1Version: ${folderVer}$2`);
      } else {
        html = html.replace(
          /(<span>© 2026 issue-to-pr-skills · )(MIT)/,
          `$1<span id="siteVersionFooter">Version: ${folderVer}</span> · $2`
        );
      }
      fs.writeFileSync(pagePath, html, 'utf8');
    }
  }

  // 5. Update README.md badge
  if (fs.existsSync(README_MD)) {
    let readme = fs.readFileSync(README_MD, 'utf8');
    if (!readme.includes('badge/version-')) {
      readme = readme.replace(
        /(\[!\[47 skills\])/,
        `[![Version](https://img.shields.io/badge/version-${folderVer}-emerald.svg)](version.json)\n$1`
      );
    } else {
      readme = readme.replace(/badge\/version-[0-9.]+-emerald\.svg/g, `badge/version-${folderVer}-emerald.svg`);
    }
    fs.writeFileSync(README_MD, readme, 'utf8');
  }

  // 6. Update AGENTS.md
  if (fs.existsSync(AGENTS_MD)) {
    let agents = fs.readFileSync(AGENTS_MD, 'utf8');
    if (agents.includes('Version:')) {
      agents = agents.replace(/Version:\s*[0-9.]+/g, `Version: ${folderVer}`);
    } else {
      agents = agents.replace(/(# AGENTS\.md — working in this repo)/, `$1 (Version: ${folderVer})`);
    }
    fs.writeFileSync(AGENTS_MD, agents, 'utf8');
  }

  console.log('\nSynchronization Complete:');
  checkSync();
}

// --- CLI Runner ---

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const action = process.argv[2] || 'check';
  const arg = process.argv[3];

  switch (action) {
    case 'check':
    case 'status': {
      const ok = checkSync();
      process.exit(ok ? 0 : 1);
      break;
    }
    case 'bump': {
      bumpVersion(arg);
      break;
    }
    case 'sync': {
      syncSite();
      break;
    }
    case 'init': {
      const v = '1.0';
      const hash = computeFolderHash();
      fs.writeFileSync(VERSION_FILE, v + '\n', 'utf8');
      fs.writeFileSync(VERSION_JSON, JSON.stringify({
        version: v,
        label: `Version: ${v}`,
        contentHash: hash,
        skillsCount: extractSkillsData().length,
        lastUpdated: new Date().toISOString(),
        lastChangeType: 'init'
      }, null, 2) + '\n', 'utf8');
      syncSite();
      break;
    }
    default: {
      console.log('Usage: node scripts/version-sync.js [check|bump|sync|init]');
      console.log('  check       Compare Folder Version and Site Version (exits 0 if in sync, 1 if out of sync)');
      console.log('  bump        Bump folder version (+1.0 for skill, +0.1 for docs/auto)');
      console.log('  sync        Synchronize site to folder version and regenerate site data');
      process.exit(1);
    }
  }
}
