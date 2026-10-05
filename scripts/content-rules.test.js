import test from 'node:test';
import assert from 'node:assert/strict';
import { contentViolation, blocksSync, blocksPublication, stripLocalOnly } from './content-rules.js';

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