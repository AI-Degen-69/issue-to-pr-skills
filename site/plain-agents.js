// Plain-language layer for the 17 reviewer personas, for non-developer
// visitors on the agents page.
//
// The AGENTS array in site/agents/index.html already carries a short
// one-liner per persona, but it leans on developer terms (hooks, a11y, RSC,
// goroutines, borrow checker). This file adds a second, jargon-free line plus
// an analogy, shown on each agent card.
//
// Rules (enforced by scripts/plain-language.test.js):
//   - every one of the 17 personas in agents/ has an entry
//   - no entry is missing, empty, or duplicated
//   - the plain line avoids the same jargon denylist the skills layer uses
//
// Additive: the technical one-liner and AGENT_SUMMARIES stay as-is.
window.PLAIN_AGENTS = {
  'code-reviewer': {
    plain: 'Reads the whole change the way a senior engineer would and says whether it is ready or not.',
    analogy: 'Like a second pair of eyes before you send an important email.'
  },
  'security-reviewer': {
    plain: 'Hunts for ways someone could break in or abuse the change: weak logins, leaked passwords, unguarded doors.',
    analogy: 'Like a locksmith testing every lock you just installed.'
  },
  'typescript-reviewer': {
    plain: 'Checks the data rules are airtight, so a wrong value can never sneak through and cause a hidden failure.',
    analogy: 'Like a form that refuses to accept a phone number in the date field.'
  },
  'react-reviewer': {
    plain: 'Checks the on-screen parts behave correctly for everyone, including people using a keyboard or screen reader, and update smoothly.',
    analogy: 'Like checking every page of a menu is readable and every door opens.'
  },
  'python-reviewer': {
    plain: 'Checks the code is written the clean, accepted way, and that slow background tasks cannot collide.',
    analogy: 'Like an editor enforcing house style and catching crossed wires.'
  },
  'go-reviewer': {
    plain: 'Checks that tasks running at the same time share resources safely and report problems the way they should.',
    analogy: 'Like making sure two chefs sharing one kitchen never grab the same pan.'
  },
  'rust-reviewer': {
    plain: 'Checks the code can never access something it should not, so the most dangerous class of crash is ruled out.',
    analogy: 'Like a guard rail that makes falling off the edge impossible.'
  },
  'database-reviewer': {
    plain: 'Checks the change does not make lookups crawl, and that saved data stays safe and correct.',
    analogy: 'Like making sure the filing system still finds any file in seconds.'
  },
  'silent-failure-hunter': {
    plain: 'Finds the places where something goes wrong but the code quietly carries on as if nothing happened.',
    analogy: 'Like a smoke alarm with the battery removed — the fire never announces itself.'
  },
  'tdd-guide': {
    plain: 'Makes sure the safety checks are written before the feature, so the feature has to prove itself to exist.',
    analogy: 'Like writing the exam questions before studying, not after.'
  },
  'build-error-resolver': {
    plain: 'When the project refuses to build, finds the smallest fix that gets it working again.',
    analogy: 'Like a mechanic who reads the one error light and replaces exactly one part.'
  },
  'react-build-resolver': {
    plain: 'Fixes the specific breakages that happen when the screen-building tools do not line up.',
    analogy: 'Like untangling why the same recipe failed only in your oven.'
  },
  'go-build-resolver': {
    plain: 'Fixes the compile problems that stop a Go project from coming together.',
    analogy: 'Like finding the missing page that makes the manual make sense.'
  },
  'rust-build-resolver': {
    plain: 'Works through the strict compiler complaints that block a Rust project from building.',
    analogy: 'Like answering every question on a checklist before you are allowed to proceed.'
  },
  'type-design-analyzer': {
    plain: 'Checks the core concepts are set up so a nonsensical situation simply cannot be written down.',
    analogy: 'Like designing a form so an impossible answer cannot be entered.'
  },
  'code-explorer': {
    plain: 'Maps how the existing code actually runs before anyone changes it, so the fix lands in the right place.',
    analogy: 'Like tracing every wire in a wall before drilling a new hole.'
  },
  'doc-updater': {
    plain: 'Catches the instructions that no longer match what the code now does.',
    analogy: 'Like updating the sign after the shop moves.'
  }
};
