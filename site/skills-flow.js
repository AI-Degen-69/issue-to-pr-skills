// Skills Flow Data & Renderer
// Station-first view matching Matt Pocock-style design layout

const STATIONS_FLOW = [
  {
    id: 'i-pick-issue',
    num: '01',
    title: 'Station I \u2014 Pick & Map',
    desc: 'Maps the open-issue backlog grouped by domain, recommends order, and highlights one pick. Routes into Station II.',
    startWithLabel: 'Start with',
    startWithCommand: '/i-pick-issue',
    accent: 'from-purple-600 to-fuchsia-600',
    invoked: [
      { id: 'pipeline-triage', name: 'pipeline-triage', title: 'The /pipeline-triage Skill', desc: 'State gate: runs first when the tree is dirty, commits are unpushed, or a PR is open \u2014 routes to the right station.', gradient: 'from-violet-600 to-indigo-600', icon: 'workflow', kind: 'skill' },
      { id: 'create-issue', name: 'create-issue', title: 'The /create-issue Skill', desc: 'Intake branch: turns a brand-new raw idea into a researched ready-for-agent issue.', gradient: 'from-fuchsia-600 to-pink-600', icon: 'issue', kind: 'skill' },
      { id: 'context-engineering', name: 'context-engineering', title: 'The /context-engineering Skill', desc: 'Locks session scope before opening repository files.', gradient: 'from-cyan-600 to-blue-600', icon: 'compass', kind: 'skill' }
    ]
  },

  {
    id: 'ii-plan-issue',
    num: '02',
    title: 'Station II \u2014 Plan',
    desc: 'Right-sizes the issue, locks CONSTRAINTS.md, and writes tasks/plan.md as atomic vertical slices before any code.',
    startWithLabel: 'Start with',
    startWithCommand: '/ii-plan-issue',
    accent: 'from-cyan-500 to-blue-600',
    invoked: [
      { id: 'context-engineering', name: 'context-engineering', title: 'The /context-engineering Skill', desc: 'Locks session scope and the task classification before planning.', gradient: 'from-cyan-600 to-blue-600', icon: 'compass', kind: 'skill' },
      { id: 'spec-driven-development', name: 'spec-driven-development', title: 'The /spec-driven-development Skill', desc: 'Turns ambiguous requirements into a clear specification first.', gradient: 'from-blue-600 to-indigo-600', icon: 'document', kind: 'skill' },
      { id: 'constraint-driven-development', name: 'constraint-driven-development', title: 'The /constraint-driven-development Skill', desc: 'Writes the CONSTRAINTS.md quality bar: zero regressions, no lowering the bar.', gradient: 'from-slate-600 to-slate-700', icon: 'shield', kind: 'skill' },
      { id: 'planning-and-task-breakdown', name: 'planning-and-task-breakdown', title: 'The /planning-and-task-breakdown Skill', desc: 'Breaks the work into ordered vertical slices in tasks/plan.md.', gradient: 'from-violet-600 to-purple-600', icon: 'plan', kind: 'skill' },
      { id: 'interview-me', name: 'interview-me', title: 'The /interview-me Skill', desc: 'Asks the operator only what is genuinely unresolvable from code.', gradient: 'from-teal-600 to-emerald-600', icon: 'terminal', kind: 'skill' },
      { id: 'idea-refine', name: 'idea-refine', title: 'The /idea-refine Skill', desc: 'Sharpens vague requests before they become tasks.', gradient: 'from-amber-600 to-yellow-600', icon: 'palette', kind: 'skill' },
      { id: 'doubt-driven-development', name: 'doubt-driven-development', title: 'The /doubt-driven-development Skill', desc: 'Questions risky assumptions with evidence.', gradient: 'from-rose-600 to-pink-600', icon: 'verify', kind: 'skill' },
      { id: 'code-explorer', name: 'code-explorer', title: 'The code-explorer Persona', desc: 'Traces execution paths in large or unfamiliar code.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' }
    ]
  },

  {
    id: 'iii-build-plan',
    num: '03',
    title: 'Station III \u2014 Build',
    desc: 'Executes tasks/plan.md one task at a time with TDD, atomic local commits, and domain-routed specialists. Never pushes.',
    startWithLabel: 'Start with',
    startWithCommand: '/iii-build-plan',
    accent: 'from-emerald-600 to-teal-600',
    invoked: [
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Writes the failing test first, then the minimal code to pass.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'source-driven-development', name: 'source-driven-development', title: 'The /source-driven-development Skill', desc: 'Grounds API usage in official documentation.', gradient: 'from-sky-600 to-cyan-600', icon: 'book', kind: 'skill' },
      { id: 'api-and-interface-design', name: 'api-and-interface-design', title: 'The /api-and-interface-design Skill', desc: 'Designs stable module and API boundaries.', gradient: 'from-indigo-600 to-violet-600', icon: 'layout', kind: 'skill' },
      { id: 'code-simplification', name: 'code-simplification', title: 'The /code-simplification Skill', desc: 'Simplifies working code without changing behavior.', gradient: 'from-teal-600 to-emerald-600', icon: 'build', kind: 'skill' },
      { id: 'debugging-and-error-recovery', name: 'debugging-and-error-recovery', title: 'The /debugging-and-error-recovery Skill', desc: 'Fixes runtime failures with evidence.', gradient: 'from-red-600 to-orange-600', icon: 'verify', kind: 'skill' },
      { id: 'diagnosing-bugs', name: 'diagnosing-bugs', title: 'The /diagnosing-bugs Skill', desc: 'Diagnoses root cause before patching.', gradient: 'from-orange-600 to-amber-600', icon: 'plan', kind: 'skill' },
      { id: 'incremental-implementation', name: 'incremental-implementation', title: 'The /incremental-implementation Skill', desc: 'Lands the work in small safe increments.', gradient: 'from-lime-600 to-green-600', icon: 'workflow', kind: 'skill' },
      { id: 'tdd-guide', name: 'tdd-guide', title: 'The tdd-guide Persona', desc: 'Enforces write-the-test-first discipline.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'build-error-resolver', name: 'build-error-resolver', title: 'The build-error-resolver Persona', desc: 'Fixes generic build and compile failures.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'react-build-resolver', name: 'react-build-resolver', title: 'The react-build-resolver Persona', desc: 'Fixes React build failures.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'go-build-resolver', name: 'go-build-resolver', title: 'The go-build-resolver Persona', desc: 'Fixes Go build failures.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'rust-build-resolver', name: 'rust-build-resolver', title: 'The rust-build-resolver Persona', desc: 'Fixes Rust build failures.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' }
    ]
  },

  {
    id: 'iiib-iterate-after-build',
    num: '04',
    title: 'Station IIIB \u2014 Iterate',
    desc: 'Fast fix loop for operator corrections on a fresh build. Minimal verified fixes, committed locally. Loops until clean.',
    startWithLabel: 'Start with',
    startWithCommand: '/iiib-iterate-after-build',
    accent: 'from-amber-600 to-orange-600',
    invoked: [
      { id: 'debugging-and-error-recovery', name: 'debugging-and-error-recovery', title: 'The /debugging-and-error-recovery Skill', desc: 'Fixes runtime bugs with a reproduction first.', gradient: 'from-red-600 to-orange-600', icon: 'verify', kind: 'skill' },
      { id: 'diagnosing-bugs', name: 'diagnosing-bugs', title: 'The /diagnosing-bugs Skill', desc: 'Finds the real root cause of reported corrections.', gradient: 'from-orange-600 to-amber-600', icon: 'plan', kind: 'skill' },
      { id: 'click-path-audit', name: 'click-path-audit', title: 'The /click-path-audit Skill', desc: 'Traces dead buttons through their full state sequence.', gradient: 'from-amber-600 to-orange-600', icon: 'browser', kind: 'skill' },
      { id: 'browser-testing-with-devtools', name: 'browser-testing-with-devtools', title: 'The /browser-testing-with-devtools Skill', desc: 'Verifies UI fixes in a live browser: DOM, console, network.', gradient: 'from-sky-600 to-blue-600', icon: 'browser', kind: 'skill' },
      { id: 'frontend-ui-engineering', name: 'frontend-ui-engineering', title: 'The /frontend-ui-engineering Skill', desc: 'Fixes component, state, and layout issues.', gradient: 'from-cyan-600 to-teal-600', icon: 'layout', kind: 'skill' },
      { id: 'code-simplification', name: 'code-simplification', title: 'The /code-simplification Skill', desc: 'Keeps each fix minimal and clean.', gradient: 'from-teal-600 to-emerald-600', icon: 'build', kind: 'skill' },
      { id: 'verification-before-completion', name: 'verification-before-completion', title: 'The /verification-before-completion Skill', desc: 'Re-verifies every fix before calling it done.', gradient: 'from-green-600 to-emerald-600', icon: 'verify', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Proves logic fixes with targeted tests.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' }
    ]
  },

  {
    id: 'iv-review-build-and-pr',
    num: '05',
    title: 'Station IV \u2014 Review & Ship',
    desc: 'Proof-before-review gate (playwright-cli browser pass or tests), OCR delegation scan, specialist reviewers, then push, PR, and the CodeRabbit trigger with ack classification.',
    startWithLabel: 'Start with',
    startWithCommand: '/iv-review-build-and-pr',
    accent: 'from-violet-600 to-purple-600',
    invoked: [
      { id: 'browser-testing-with-devtools', name: 'browser-testing-with-devtools', title: 'The /browser-testing-with-devtools Skill', desc: 'Live browser proof gate for UI changes.', gradient: 'from-sky-600 to-blue-600', icon: 'browser', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Targeted tests as the proof gate for logic changes.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'code-review-and-quality', name: 'code-review-and-quality', title: 'The /code-review-and-quality Skill', desc: 'Multi-axis review before anything merges.', gradient: 'from-violet-600 to-purple-600', icon: 'review', kind: 'skill' },
      { id: 'verification-before-completion', name: 'verification-before-completion', title: 'The /verification-before-completion Skill', desc: 'Re-verifies fixes before sign-off.', gradient: 'from-green-600 to-emerald-600', icon: 'verify', kind: 'skill' },
      { id: 'security-and-hardening', name: 'security-and-hardening', title: 'The /security-and-hardening Skill', desc: 'Vulnerability and secrets review lane.', gradient: 'from-red-600 to-rose-600', icon: 'shield', kind: 'skill' },
      { id: 'performance-optimization', name: 'performance-optimization', title: 'The /performance-optimization Skill', desc: 'Performance review lane.', gradient: 'from-amber-600 to-orange-600', icon: 'build', kind: 'skill' },
      { id: 'web-design-guidelines', name: 'web-design-guidelines', title: 'The /web-design-guidelines Skill', desc: 'Accessibility and ARIA review lane for UI.', gradient: 'from-teal-600 to-cyan-600', icon: 'palette', kind: 'skill' },
      { id: 'git-workflow-and-versioning', name: 'git-workflow-and-versioning', title: 'The /git-workflow-and-versioning Skill', desc: 'Clean push and PR hygiene.', gradient: 'from-orange-600 to-red-600', icon: 'git', kind: 'skill' },
      { id: 'database-reviewer', name: 'database-reviewer', title: 'The database-reviewer Persona', desc: 'Reviews SQL/ORM changes: N+1, indexes, migrations.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'doc-updater', name: 'doc-updater', title: 'The doc-updater Persona', desc: 'Checks docs still match changed behavior.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'go-reviewer', name: 'go-reviewer', title: 'The go-reviewer Persona', desc: 'Reviews Go: goroutines, errors, interfaces.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'python-reviewer', name: 'python-reviewer', title: 'The python-reviewer Persona', desc: 'Reviews Python: asyncio, typing, PEP 8.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'react-reviewer', name: 'react-reviewer', title: 'The react-reviewer Persona', desc: 'Reviews React: hooks, a11y, render performance.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'rust-reviewer', name: 'rust-reviewer', title: 'The rust-reviewer Persona', desc: 'Reviews Rust: lifetimes, unsafe, borrowing.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'security-reviewer', name: 'security-reviewer', title: 'The security-reviewer Persona', desc: 'Reviews vulnerabilities, auth, and secrets.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'silent-failure-hunter', name: 'silent-failure-hunter', title: 'The silent-failure-hunter Persona', desc: 'Hunts swallowed errors and empty catches.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'typescript-reviewer', name: 'typescript-reviewer', title: 'The typescript-reviewer Persona', desc: 'Reviews TS/JS: types, async, Node security.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'code-reviewer', name: 'code-reviewer', title: 'The code-reviewer Persona', desc: 'General code quality, five-axis review.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' }
    ]
  },

  {
    id: 'v-babysit-pr-and-merge',
    num: '06',
    title: 'Station V \u2014 Babysit & Merge',
    desc: 'Consumes the trigger status from Station IV. One review round, triages every comment, batch-fixes in one commit, squash-merges on green CI.',
    startWithLabel: 'Start with',
    startWithCommand: '/v-babysit-pr-and-merge',
    accent: 'from-pink-600 to-rose-600',
    invoked: [
      { id: 'iii-build-plan', name: 'iii-build-plan', title: 'The /iii-build-plan Skill', desc: 'Re-applies accepted review fixes locally, verified per task.', gradient: 'from-emerald-600 to-teal-600', icon: 'build', kind: 'skill' },
      { id: 'code-reviewer', name: 'code-reviewer', title: 'The code-reviewer Persona', desc: 'Fallback full review only when Station IV evidence cannot be reused.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'build-error-resolver', name: 'build-error-resolver', title: 'The build-error-resolver Persona', desc: 'Fixes build failures found in CI.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'go-build-resolver', name: 'go-build-resolver', title: 'The go-build-resolver Persona', desc: 'Fixes Go build failures found in CI.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'react-build-resolver', name: 'react-build-resolver', title: 'The react-build-resolver Persona', desc: 'Fixes React build failures found in CI.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'rust-build-resolver', name: 'rust-build-resolver', title: 'The rust-build-resolver Persona', desc: 'Fixes Rust build failures found in CI.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' }
    ]
  },
  {
    id: 'vi-close-pipeline',
    num: '07',
    title: 'Station VI \u2014 Close Pipeline',
    desc: 'Confirms the PR is merged, prunes only closed and unreferenced per-issue scratch, updates PROGRESS.md and the handoff. Suggests the ad-hoc showcase.',
    startWithLabel: 'Start with',
    startWithCommand: '/vi-close-pipeline',
    accent: 'from-slate-500 to-zinc-600',
    invoked: [
      { id: 'verification-before-completion', name: 'verification-before-completion', title: 'The /verification-before-completion Skill', desc: 'Two-gate obsolescence test before any deletion.', gradient: 'from-green-600 to-emerald-600', icon: 'verify', kind: 'skill' },
      { id: 'documentation-and-adrs', name: 'documentation-and-adrs', title: 'The /documentation-and-adrs Skill', desc: 'Relocates durable records to permanent docs.', gradient: 'from-blue-600 to-indigo-600', icon: 'document', kind: 'skill' },
      { id: 'deprecation-and-migration', name: 'deprecation-and-migration', title: 'The /deprecation-and-migration Skill', desc: 'Routes dead code to proper migration tracks, not the bin.', gradient: 'from-amber-600 to-orange-600', icon: 'migrate', kind: 'skill' }
    ]
  }
];


// Helper to render SVG icons
function getSkillIconSvg(iconType) {
  switch (iconType) {
    case 'workflow':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8m-8 6h16"/></svg>`;
    case 'terminal':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'issue':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    case 'plan':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`;
    case 'build':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
    case 'iterate':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
    case 'review':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
    case 'merge':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100 4 2 2 0 000-4zm8-4a2 2 0 100-4 2 2 0 000 4z"/></svg>`;
    case 'prune':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
    case 'present':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>`;
    case 'document':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    case 'shield':
    case 'lock':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
    case 'layout':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>`;
    case 'palette':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4 5 5 0 015-5h1a1 1 0 001-1V9a5 5 0 015-5 4 4 0 014 4v1a1 1 0 001 1h1a5 5 0 015 5 4 4 0 01-4 4h-2.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293H7z"/></svg>`;
    case 'scanner':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
    case 'api':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'debug':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;
    case 'doubt':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    case 'speed':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    case 'test':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>`;
    case 'book':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
    case 'clean':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`;
    case 'git':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100 4 2 2 0 000-4zm8-4a2 2 0 100-4 2 2 0 000 4z"/></svg>`;
    case 'pulse':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`;
    case 'click':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>`;
    case 'browser':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>`;
    case 'verify':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`;
    case 'react':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)"/></svg>`;
    case 'layers':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
    case 'ci':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
    case 'migrate':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>`;
    default:
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
  }
}

// Render the station flow view
function renderStationsFlow() {
  const container = document.getElementById('stationsFlowContainer');
  if (!container) return;

  const searchInput = document.getElementById('flowSearch');
  const query = (searchInput?.value || '').trim().toLowerCase();

  const clearBtn = document.getElementById('flowClearSearch');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  let renderedStationsCount = 0;
  let totalCardsCount = 0;

  const html = STATIONS_FLOW.map(station => {
    // Filter invoked skills based on search query
    const filteredInvoked = query 
      ? station.invoked.filter(skill => 
          skill.id.toLowerCase().includes(query) ||
          (skill.name && skill.name.toLowerCase().includes(query)) ||
          skill.title.toLowerCase().includes(query) ||
          skill.desc.toLowerCase().includes(query) ||
          station.title.toLowerCase().includes(query)
        )
      : station.invoked;

    if (filteredInvoked.length === 0 && query) {
      return ''; // Hide station if no skills match query
    }

    renderedStationsCount++;
    totalCardsCount += filteredInvoked.length;

    const cardsHtml = filteredInvoked.map(skill => {
      const isAgent = skill.kind === 'agent';
      return `
      <div 
        class="skill-card${isAgent ? ' agent-card-kind' : ''} group flex items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[.03] hover:bg-white/[.07] hover:border-violet-500/40 transition cursor-pointer"${isAgent ? ' style="border-color: rgba(245,158,11,.35)"' : ''}
        onclick="openSkillModal('${skill.id}', '${station.id}')"
        role="button"
        tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSkillModal('${skill.id}', '${station.id}')}"
      >
        <div class="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div class="h-11 w-11 rounded-xl bg-gradient-to-br ${skill.gradient} flex items-center justify-center shrink-0 border border-white/15 shadow-md group-hover:scale-105 group-hover:shadow-violet-500/20 transition-transform">
            ${getSkillIconSvg(skill.icon)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-white text-[15px] sm:text-[16px] leading-snug group-hover:text-violet-200 transition-colors">${skill.title}${isAgent ? ' <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">AGENT</span>' : ''}</div>
            <div class="text-xs sm:text-sm text-white/60 mt-1 line-clamp-2 leading-relaxed">${skill.desc}</div>
          </div>
        </div>
        <div class="text-white/40 group-hover:text-white group-hover:translate-x-1 transition shrink-0 font-bold text-lg">
          →
        </div>
      </div>
    `}).join('');

    return `
      <section id="${station.id}" class="station-row border-t border-white/10 pt-10 pb-12 first:border-t-0 first:pt-4">
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
          
          <!-- Left Station Info -->
          <div class="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-mono text-xs sm:text-sm font-semibold text-slate-400 tracking-wider">${station.num}</span>
              <span class="h-2 w-2 rounded-full bg-gradient-to-r ${station.accent}"></span>
            </div>
            <h2 class="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">${station.title}</h2>
            <p class="text-sm sm:text-[15px] text-white/60 mt-3 leading-relaxed">${station.desc}</p>
            <div class="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-white/80">
              <span class="text-white/50">${station.startWithLabel}</span>
              <a href="#${station.id}" class="text-violet-300 font-semibold hover:text-violet-200 underline decoration-violet-400/40">${station.startWithCommand}</a>
            </div>
          </div>

          <!-- Right Invoked Skills List -->
          <div class="lg:col-span-8 flex flex-col gap-3 sm:gap-3.5">
            ${cardsHtml}
          </div>

        </div>
      </section>
    `;
  }).join('');

  if (renderedStationsCount === 0 && query) {
    container.innerHTML = `
      <div class="rounded-2xl border border-white/10 bg-white/[.04] p-10 text-center my-8">
        <div class="text-lg font-bold text-white">No skills match “${query}”</div>
        <p class="text-sm text-white/60 mt-2">Try searching for a different keyword like <span class="text-violet-300">test</span>, <span class="text-violet-300">review</span>, or <span class="text-violet-300">frontend</span>.</p>
        <button onclick="clearFlowSearch()" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition">
          Clear Search
        </button>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }

  // Update counter
  const counterEl = document.getElementById('flowCount');
  if (counterEl) {
    if (query) {
      counterEl.textContent = `Found ${totalCardsCount} skill connections across ${renderedStationsCount} stations`;
    } else {
      counterEl.textContent = `Showing ${renderedStationsCount} stations · ${totalCardsCount} invocations across 43 specialized skills & agents`;
    }
  }
}

// Clear search
function clearFlowSearch() {
  const searchInput = document.getElementById('flowSearch');
  if (searchInput) {
    searchInput.value = '';
    renderStationsFlow();
    searchInput.focus();
  }
}

// Modal handling
let activeSkillModal = null;

function openSkillModal(skillId, stationId) {
  // Find skill across stations
  let foundSkill = null;
  const invokingStations = [];

  STATIONS_FLOW.forEach(st => {
    const s = st.invoked.find(x => x.id === skillId);
    if (s) {
      if (!foundSkill) foundSkill = s;
      invokingStations.push({ id: st.id, title: st.title, num: st.num });
    }
  });

  if (!foundSkill) {
    foundSkill = {
      id: skillId,
      name: skillId,
      title: `The /${skillId} Skill`,
      desc: 'Specialized agent skill.',
      gradient: 'from-violet-600 to-indigo-600',
      icon: 'workflow'
    };
  }

  const modalOverlay = document.getElementById('skillModalOverlay');
  const modalContent = document.getElementById('skillModalBody');
  if (!modalOverlay || !modalContent) return;

  const skillGrp = (window.GROUP && window.GROUP[foundSkill.name]) ? window.GROUP[foundSkill.name] : 'plan';
  const tagCfg = (window.TAG_CONFIG && window.TAG_CONFIG[skillGrp]) ? window.TAG_CONFIG[skillGrp] : null;
  const tagBadgeHtml = tagCfg ? `<span class="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${tagCfg.tagClass}">${tagCfg.tag}</span>` : '';

  modalContent.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-xl bg-gradient-to-br ${foundSkill.gradient} flex items-center justify-center shrink-0 border border-white/15 shadow-lg">
          ${getSkillIconSvg(foundSkill.icon)}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-xl font-bold text-white tracking-tight">${foundSkill.title}</h3>
            ${tagBadgeHtml}
          </div>
        </div>
      </div>
      <button onclick="closeSkillModal()" aria-label="Close modal" class="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-sm font-bold transition">
        ✕
      </button>
    </div>

    <div class="mt-6 text-[15px] leading-relaxed text-white/80">
      ${foundSkill.desc}
    </div>

    <!-- Invoked by stations -->
    <div class="mt-6 pt-5 border-t border-white/10">
      <div class="text-xs uppercase font-mono tracking-widest text-white/50 mb-2">Stations Invoking This Skill</div>
      <div class="flex flex-wrap gap-2">
        ${invokingStations.map(st => `
          <a href="#${st.id}" onclick="closeSkillModal()" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-violet-300 hover:text-white transition">
            <span class="font-mono text-white/40">${st.num}</span>
            <span>${st.title}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Quick action links -->
    <div class="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button 
          id="copySkillBtn" 
          onclick="copySkillCmd('/${foundSkill.name}')" 
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-white transition"
        >
          <span>/${foundSkill.name}</span>
          <span class="text-white/50 text-[11px]">Copy</span>
        </button>
      </div>
      <a 
        href="${foundSkill.kind === 'agent' ? `https://github.com/AI-Degen-69/issue-to-pr-skills/blob/main/agents/${foundSkill.name}.md` : `https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${foundSkill.name}`}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg shadow-violet-600/30"
      >
        <span>${foundSkill.kind === 'agent' ? 'View Persona on GitHub' : 'View SKILL.md on GitHub'}</span>
        <span>↗</span>
      </a>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
  modalOverlay.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeSkillModal() {
  const modalOverlay = document.getElementById('skillModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function copySkillCmd(cmd) {
  navigator.clipboard.writeText(cmd);
  const btn = document.getElementById('copySkillBtn');
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = `<span>Copied!</span>`;
    setTimeout(() => {
      btn.innerHTML = original;
    }, 1500);
  }
}

// Keyboard ESC to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSkillModal();
  }
});

// Render Station Pill Bar
function renderStationPills() {
  const container = document.getElementById('stationPills');
  if (!container) return;

  container.innerHTML = STATIONS_FLOW.map(st => `
    <a 
      href="#${st.id}" 
      class="shrink-0 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[.04] hover:bg-white/[.1] hover:border-violet-500/40 text-xs text-white/80 hover:text-white transition flex items-center gap-1.5"
    >
      <span class="font-mono text-white/40 text-[11px]">${st.num}</span>
      <span class="font-medium">${st.title.replace('Station ', '').replace(' — ', ' ')}</span>
    </a>
  `).join('');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderStationPills();
  renderStationsFlow();

  // Smooth scroll and pulse highlight if target hash is present in URL
  if (window.location.hash) {
    const targetEl = document.querySelector(window.location.hash);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        targetEl.classList.add('ring-2', 'ring-orange-500/60', 'transition-all');
        setTimeout(() => {
          targetEl.classList.remove('ring-2', 'ring-orange-500/60');
        }, 2500);
      }, 120);
    }
  }

  const searchInput = document.getElementById('flowSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderStationsFlow();
    });
  }
});
