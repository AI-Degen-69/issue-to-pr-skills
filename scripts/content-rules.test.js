import test from 'node:test';
import assert from 'node:assert/strict';
import { contentViolation, blocksSync } from './content-rules.js';

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