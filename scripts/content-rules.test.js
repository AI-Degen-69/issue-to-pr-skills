import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { contentViolation, blocksSync, blocksPublication, stripLocalOnly, localizeToEnglish, neutralizeLanguage } from './content-rules.js';

test('plain English passes', () => {
  assert.equal(contentViolation('Nothing wrong here.\n'), null);
});

test('Hebrew characters are rejected', () => {
  const r = contentViolation('דוח סיכום');
  assert.ok(r, 'Hebrew text must be rejected');
  assert.match(r, /Hebrew/);
});

test('English that names Hebrew as the reporting language is rejected', () => {
  const r = contentViolation('This station reports the value in plain Hebrew to the operator.');
  assert.ok(r, 'Hebrew reporting must be rejected even in pure English');
});

test('technical mentions of Hebrew as input are whitelisted', () => {
  assert.equal(contentViolation('Branch slugs are never Hebrew.'), null);
  assert.equal(contentViolation('Accepts Hebrew-only voice-notes.'), null);
  assert.equal(contentViolation('Accepts Hebrew voice-notes for intake.'), null);
});

test('machine-specific home paths are rejected', () => {
  const cases = [
    'Load the persona from ~/.agents/agents/code-reviewer.md.',
    'Load the persona from ~/.agents/skills.',
    'Config lives at C:\\Users\\Tiger\\.agents\\config.json',
    'Config lives at C:/Users/Tiger/.agents',
    'Read /home/tiger/.agents/notes.md for context.',
    'See /Users/tiger/notes.md',
  ];
  for (const c of cases) {
    const r = contentViolation(c);
    assert.ok(r, `must reject: ${c}`);
    assert.match(r, /home path/);
  }
});

test('a portable reference to this repo is allowed', () => {
  assert.equal(
    contentViolation('Personas live in this repo\'s `agents/` directory.'),
    null
  );
  assert.equal(contentViolation('See the station map in docs/pipeline.md.'), null);
});

test('the reason is quotable and names the problem', () => {
  assert.match(contentViolation('דוח'), /English-only/);
  assert.match(contentViolation('~/.agents/agents/x.md'), /portable/);
});

// The sync writer deliberately uses a narrower rule set than the gate. Using the
// word-level Hebrew heuristic to block a copy was tried and reverted in #50: it
// matched English prose that merely mentions the reporting language and
// mislabelled 20 already-translated files as untranslated. This test fails if
// that regression is ever reintroduced.
test('blocksSync ignores the Hebrew-reporting word heuristic', () => {
  const prose = 'This station reports the value in plain Hebrew to the operator.';
  assert.ok(contentViolation(prose), 'the gate still rejects it in the published pack');
  assert.equal(blocksSync(prose), null, 'but it must not block the copy');
});

test('blocksSync still stops Hebrew characters and home paths', () => {
  assert.match(blocksSync('דוח סיכום'), /Hebrew/);
  assert.match(blocksSync('See ~/.agents/agents/code-reviewer.md'), /home path/);
  assert.equal(blocksSync('Plain, portable English.\n'), null);
});

test('blocksSync is never broader than contentViolation', () => {
  const samples = [
    'Plain English.',
    'דוח',
    'Plain, portable English.',
    'reports in plain Hebrew',
    '~/.agents/skills',
    'C:\\Users\\Tiger\\x.md',
    '/home/tiger/.agents',
    'Branch slugs are never Hebrew.',
  ];
  for (const s of samples) {
    assert.ok(
      blocksSync(s) === null || contentViolation(s) !== null,
      `sync must never block something the gate allows: ${s}`
    );
  }
});

// The defect that motivated blocksPublication: canonical orders its output in
// Hebrew using plain ASCII ("everyday Hebrew"), so blocksSync's character test
// passed it and `npm run sync` overwrote the pack's English output contracts.
// Each case below is a real line from a canonical station.
test('blocksPublication stops a Hebrew output order written in ASCII', () => {
  const cases = [
    '8. Closeout in chat: You MUST report to the user in clean, everyday Hebrew.',
    'Answer in Hebrew in the chat only.',
    '- Report plan summary in plain Hebrew to the user.',
    'Answer in Hebrew in the chat only. Always use this exact markdown shape.',
  ];
  for (const c of cases) {
    const r = blocksPublication(c);
    assert.ok(r, `must block: ${c}`);
    assert.match(r, /Hebrew/);
  }
});

test('blocksPublication still allows prose that merely mentions Hebrew', () => {
  // The #50 trap, in the narrow rule's own terms: a mention with no reporting
  // verb governing it must import, or ~20 translated files get mislabelled.
  const cases = [
    'The operator drops raw thoughts (Hebrew voice-notes style, bullet fragments).',
    'Branch slugs are never Hebrew.',
    'Accepts Hebrew-only voice-notes.',
    'Personas absorbed from ECC stay, but their provenance is dropped.',
  ];
  for (const c of cases) {
    assert.equal(blocksPublication(c), null, `must allow: ${c}`);
  }
});

test('blocksPublication is never narrower than blocksSync', () => {
  const samples = ['דוח', 'See ~/.agents/skills', 'C:\\Users\\Tiger\\x.md', 'Plain English.'];
  for (const s of samples) {
    if (blocksSync(s) !== null) {
      assert.ok(blocksPublication(s) !== null, `must keep blocking: ${s}`);
    }
  }
});

test('stripLocalOnly removes the marked block and nothing else', () => {
  const marked = [
    'Before.',
    '<!-- local-only:begin -->',
    'The chat output template is `references/output-template.md`.',
    '<!-- local-only:end -->',
    'After.',
  ].join('\n');
  const out = stripLocalOnly(marked);
  assert.equal(out.includes('output-template.md'), false, 'the local-only pointer must go');
  assert.equal(out.includes('Before.'), true);
  assert.equal(out.includes('After.'), true);
  assert.equal(out.includes('local-only'), false, 'no marker residue may survive');
});

test('a Hebrew order hidden inside a local-only block does not block', () => {
  // Stripping happens first, so a marker-only mention is not a reason to block
  // the whole file - it is simply removed on the way in.
  const marked = [
    'Station IV does its work.',
    '<!-- local-only:begin -->',
    'Report to the user in everyday Hebrew.',
    '<!-- local-only:end -->',
  ].join('\n');
  // A marker-only mention is not a reason to block: it is removed on the way in.
  assert.equal(blocksPublication(marked), null);
  // ...but once the text really does order Hebrew output, stripping must not
  // launder it. This is the same string with the block already removed, so the
  // only difference is whether the contract survived the strip.
  assert.equal(stripLocalOnly(marked), 'Station IV does its work.\n');
  assert.match(blocksPublication('Station IV does its work.\nReport in Hebrew.'), /Hebrew/);
});

test('a Hebrew order outside the markers still blocks', () => {
  const marked = [
    '<!-- local-only:begin -->',
    'Local pointer.',
    '<!-- local-only:end -->',
    '8. You MUST report to the user in clean, everyday Hebrew.',
  ].join('\n');
  assert.ok(blocksPublication(marked), 'stripping must not launder a real contract');
});

// localizeToEnglish produces the English copy of a localized file. The pack has
// always carried this translation by hand; every phrase below is taken from a
// real canonical file, and the hand-written copy is what it must reproduce.
test('localizeToEnglish rewrites reporting-language mentions', () => {
  const cases = [
    ['Reports in Hebrew per the output contract in `SKILL.md`.', 'Reports in English per the output contract in `SKILL.md`.'],
    ['Reports back in everyday Hebrew per the output contract in `SKILL.md`.', 'Reports back in everyday English per the output contract in `SKILL.md`.'],
    ['orchestration steps, Hebrew output contract).', 'orchestration steps, English output contract).'],
    ['Hebrew output contracts.', 'English output contracts.'],
    ['the Hebrew report names the PR', 'the English report names the PR'],
    ['Two reports in Hebrew from the template', 'Two reports in English from the template'],
    ['introduce yourself in plain Hebrew', 'introduce yourself in plain English'],
    ['reports back in Hebrew with link', 'reports back in English with link'],
  ];
  for (const [from, to] of cases) {
    assert.equal(localizeToEnglish(from), to, `must localize: ${from}`);
  }
});

test('localizeToEnglish preserves Hebrew that describes INPUT, not output', () => {
  // A bare word swap would turn these into nonsense ("English voice-notes").
  const keep = [
    'The operator drops raw thoughts (Hebrew voice-notes style, bullet fragments).',
    'Branch slugs are never Hebrew.',
    'Accepts Hebrew-only voice-notes.',
  ];
  for (const k of keep) {
    assert.equal(localizeToEnglish(k), k, `must NOT localize: ${k}`);
  }
});

test('a localized file is publishable only after localizeToEnglish', () => {
  // This is the condition that keeps the 12 localized READMEs out of the
  // "blocked" bucket: the bytes that land are the rewritten ones, so the
  // content gate must judge those, not the canonical original.
  const canonical = '4. Reports in Hebrew per the output contract in `SKILL.md`.';
  assert.ok(contentViolation(canonical), 'the canonical original is still unpublishable');
  assert.equal(contentViolation(localizeToEnglish(canonical)), null, 'its English copy is fine');
});

test('Hebrew characters survive localization - only the English word is swapped', () => {
  // blocksSync's character test must keep working after the rewrite.
  assert.ok(blocksSync(localizeToEnglish('דוח סיכום')), 'Hebrew script is still blocked');
});

test('stripLocalOnly removes named local-only markers', () => {
  const marked = [
    'Before.',
    '<!-- local-only:pipeline-triage:output-template-begin -->',
    'The chat output template is `references/output-template.md`.',
    '<!-- local-only:pipeline-triage:output-template-end -->',
    'After.',
  ].join('\n');
  const out = stripLocalOnly(marked);
  assert.equal(out.includes('output-template.md'), false, 'the named local-only pointer must go');
  assert.equal(out.includes('Before.'), true);
  assert.equal(out.includes('After.'), true);
  assert.equal(out.includes('local-only'), false, 'no marker residue may survive');
});

test('neutralizeLanguage removes reporting orders, keeps input meanings', () => {
  assert.equal(
    neutralizeLanguage('Answer in Hebrew in the chat only.'),
    'Answer in the chat only.'
  );
  assert.equal(
    neutralizeLanguage('8. You MUST report to the user in clean, everyday Hebrew following the contract.'),
    '8. You MUST report to the user following the contract.'
  );
  assert.equal(
    neutralizeLanguage('Two short Hebrew sections routing to i-pick-issue.'),
    'Two short sections routing to i-pick-issue.'
  );
  assert.equal(
    neutralizeLanguage('## Hebrew Chat Output Contract (x)'),
    '## Chat Output Contract (x)'
  );
  assert.equal(
    neutralizeLanguage('the header lives in the Hebrew output template'),
    'the header lives in the output template'
  );
  // Input meanings survive untouched.
  assert.equal(
    neutralizeLanguage('Branch slugs are never Hebrew - Hebrew chars are stripped.'),
    'Branch slugs are never Hebrew - Hebrew chars are stripped.'
  );
  assert.equal(
    neutralizeLanguage('Accepts Hebrew-only voice-notes.'),
    'Accepts Hebrew-only voice-notes.'
  );
  // Neutralized reporting orders are publishable; paths and script still block.
  assert.equal(contentViolation(neutralizeLanguage('Answer in Hebrew in the chat only.')), null);
  assert.ok(contentViolation(neutralizeLanguage('See ~/.agents/agents/x.md')), 'home path still blocks');
  assert.ok(blocksSync(neutralizeLanguage('דוח סיכום')), 'Hebrew script still blocks');
});

test('neutralizeLanguage leaves non-removed text byte-identical', () => {
  // The cosmetic cleanup (space collapsing, "is with" join) runs only when a
  // removal fired. A line that merely mentions Hebrew keeps every byte, so a
  // double space or an "is with" elsewhere in the file can never be rewritten.
  const untouched = 'Accepts Hebrew-only voice-notes.  The issue is with login.';
  assert.equal(neutralizeLanguage(untouched), untouched);
  assert.equal(
    neutralizeLanguage('reports the issue number in everyday Hebrew.'),
    'reports the issue number.'
  );
});

test('neutralizeLanguage is a no-op without a language mention', () => {
  const plain = 'Personas live in this repo\'s `agents/` directory.\n\n| a  | b  |\n';
  assert.equal(neutralizeLanguage(plain), plain, 'whitespace must not invent drift');
});

test('the writer and the mirror gate apply the same rewrite table', () => {
  // The home-to-portable renames live in two files by hand (sync writes with
  // its table, the gate hashes with its own). If they ever disagree, every
  // renamed file becomes a false mismatch, so the tables must be identical.
  const here = path.resolve(import.meta.dirname);
  const table = (file) => {
    const text = fs.readFileSync(path.join(here, file), 'utf8');
    const block = text.match(/const REWRITE = \[([\s\S]*?)\n\];/);
    assert.ok(block, `${file} no longer declares a REWRITE table`);
    // Compare (pattern, replacement) pairs, not formatting: the two files lay
    // the same table out differently (expanded vs compact entries).
    const pairs = [...block[1].matchAll(/\[\s*(\/(?:[^/\n\\]|\\.)+\/[a-z]*)\s*,\s*("(?:[^"\n\\]|\\.)*")\s*,?\s*\]/g)]
      .map((m) => [m[1], JSON.parse(m[2])]);
    assert.ok(pairs.length > 0, `${file} REWRITE table parsed to zero entries`);
    return pairs;
  };
  assert.deepEqual(
    table('verify-mirror.js'),
    table('sync-from-canonical.js'),
    'REWRITE tables disagree - copy the change to both files'
  );
});