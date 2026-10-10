// Skills Flow Data & Renderer
// Station-first view matching Matt Pocock-style design layout

const STATIONS_FLOW = [
  {
    id: 'pipeline-triage',
    num: 'Gate',
    title: 'State Gate: Pipeline Triage',
    desc: 'Pre-flight read-only state gate before Station I: classifies the request, inspects git state (dirty tree, unpushed commits, open PR, stashes) and routes to the single station that resumes or closes the work. Unknown-origin dirt stops here and asks.',
    startWithLabel: 'Start with',
    startWithCommand: '/pipeline-triage',
    accent: 'from-cyan-500 to-blue-500',
    invoked: [
      { id: 'using-agent-skills', name: 'using-agent-skills', title: 'The /using-agent-skills Skill', desc: 'Ad-hoc handoff: routes non-issue requests and quick questions to the right ad-hoc skill and stops.', gradient: 'from-violet-600 to-indigo-600', icon: 'workflow', kind: 'skill' }
    ]
  },

  {
    id: 'create-issue',
    num: 'Intake',
    title: 'Intake Branch: Create Issue',
    desc: 'Intake branch when Station I finds nothing worth picking: turns a raw operator idea into a researched, structured GitHub issue labeled ready-for-agent, with concrete file paths and a quick-fix screen at intake.',
    startWithLabel: 'Start with',
    startWithCommand: '/create-issue <idea>',
    accent: 'from-fuchsia-500 to-pink-500',
    invoked: [
      { id: 'using-agent-skills', name: 'using-agent-skills', title: 'The /using-agent-skills Skill', desc: 'Ad-hoc handoff: hands a quick question or exploration back to the router instead of opening an issue.', gradient: 'from-violet-600 to-indigo-600', icon: 'workflow', kind: 'skill' }
    ]
  },

  {
    id: 'i-pick-issue',
    num: '#1',
    title: 'Station #1: Claim & Pick',
    desc: 'The single entry point for Issue work. Always starts with Discovery: lists open issues, groups them by domain, and recommends the next one by dependency order — the recommendation is the default pick unless the operator overrides. Then the quick-fix lane check (§1a, label-gated), the execution-mode gate (§1b: step-by-step vs. full orchestration), and orchestration of Stations II–VI to merge and closeout.',
    startWithLabel: 'Start with',
    startWithCommand: '/i-pick-issue',
    accent: 'from-purple-600 to-fuchsia-600',
    invoked: [
      { id: 'quick-fix', name: 'quick-fix', title: 'The /quick-fix Skill', desc: '§1a Lane Check (label-gated): runs the 7-box gate on a quick-fix-labeled issue, then hands the operator the choice — lane or full pipeline.', gradient: 'from-amber-600 to-orange-600', icon: 'speed', kind: 'skill' },
      { id: 'context-engineering', name: 'context-engineering', title: 'The /context-engineering Skill', desc: 'Orchestration Step 1: locks session scope after the issue and mode are confirmed, before any repository file is opened.', gradient: 'from-cyan-600 to-blue-600', icon: 'lock', kind: 'skill' },
      { id: 'using-agent-skills', name: 'using-agent-skills', title: 'The /using-agent-skills Skill', desc: 'Ad-hoc handoff: routes non-issue requests and exploratory tasks to the ad-hoc router.', gradient: 'from-violet-600 to-indigo-600', icon: 'workflow', kind: 'skill' }
    ]
  },

  {
    id: 'ii-plan-issue',
    num: '#2',
    title: 'Station #2: Plan & Constraints',
    desc: 'Fetches the issue via gh, right-sizes it (Trivial→Large), auto-detects the stack, locks CONSTRAINTS.md, maps interfaces, and writes tasks/plan.md as atomic vertical slices. A Tiny + quick-fix-labeled issue hits the Step 0C lane divert before Step 0A.',
    startWithLabel: 'Start with',
    startWithCommand: '/ii-plan-issue',
    accent: 'from-cyan-500 to-blue-600',
    invoked: [
      { id: 'quick-fix', name: 'quick-fix', title: 'The /quick-fix Skill', desc: 'Step 0C Lane Divert: a Tiny tier plus the quick-fix label runs the 7-box gate — a pass with the operator’s pick ends this station and hands off to the lane.', gradient: 'from-amber-600 to-orange-600', icon: 'speed', kind: 'skill' },
      { id: 'code-explorer', name: 'code-explorer', title: 'The code-explorer Persona', desc: 'Step 0: traces execution paths in large, unfamiliar, or legacy code before planning.', gradient: 'from-slate-600 to-gray-700', icon: 'shield', kind: 'agent' },
      { id: 'frontend-ui-engineering', name: 'frontend-ui-engineering', title: 'The /frontend-ui-engineering Skill', desc: 'Step 1 (Design/UI): accessible, responsive, production-quality UI and WCAG compliance.', gradient: 'from-cyan-600 to-teal-600', icon: 'layout', kind: 'skill' },
      { id: 'frontend-design', name: 'frontend-design', title: 'The /frontend-design Skill', desc: 'Step 1 (Design/UI): distinctive, intentional visual design direction before implementation.', gradient: 'from-fuchsia-600 to-pink-600', icon: 'palette', kind: 'skill' },
      { id: 'tailwind-design-system', name: 'tailwind-design-system', title: 'The /tailwind-design-system Skill', desc: 'Step 1 (Design/UI): design tokens, component libraries, and Tailwind patterns.', gradient: 'from-cyan-600 to-blue-600', icon: 'palette', kind: 'skill' },
      { id: 'extract-design-system', name: 'extract-design-system', title: 'The /extract-design-system Skill', desc: 'Step 1 (Design/UI): extracts design primitives and starter tokens from public websites.', gradient: 'from-teal-600 to-emerald-600', icon: 'palette', kind: 'skill' },
      { id: 'api-and-interface-design', name: 'api-and-interface-design', title: 'The /api-and-interface-design Skill', desc: 'Step 1 (API/Backend): designs stable module boundaries and typed interface contracts.', gradient: 'from-indigo-600 to-violet-600', icon: 'layout', kind: 'skill' },
      { id: 'debugging-and-error-recovery', name: 'debugging-and-error-recovery', title: 'The /debugging-and-error-recovery Skill', desc: 'Step 1 (Debug): systematic root-cause reproduction, localization, fix, and guard.', gradient: 'from-red-600 to-orange-600', icon: 'bug', kind: 'skill' },
      { id: 'doubt-driven-development', name: 'doubt-driven-development', title: 'The /doubt-driven-development Skill', desc: 'Step 1 (Debug): questions risky assumptions with fresh adversarial review.', gradient: 'from-rose-600 to-pink-600', icon: 'doubt', kind: 'skill' },
      { id: 'performance-optimization', name: 'performance-optimization', title: 'The /performance-optimization Skill', desc: 'Step 1 (Performance): latency, memory, queries, and Core Web Vitals planning.', gradient: 'from-amber-600 to-orange-600', icon: 'pulse', kind: 'skill' },
      { id: 'security-and-hardening', name: 'security-and-hardening', title: 'The /security-and-hardening Skill', desc: 'Step 1 (Security): threat modeling, secrets, session boundaries, and input audits.', gradient: 'from-red-600 to-rose-600', icon: 'shield', kind: 'skill' },
      { id: 'documentation-and-adrs', name: 'documentation-and-adrs', title: 'The /documentation-and-adrs Skill', desc: 'Step 1 (Docs): records architectural decisions and updates durable docs.', gradient: 'from-blue-600 to-indigo-600', icon: 'document', kind: 'skill' },
      { id: 'humanizer', name: 'humanizer', title: 'The /humanizer Skill', desc: 'Step 1 (UX / Copy): rewrites AI-sounding text so it reads naturally and clearly.', gradient: 'from-fuchsia-600 to-pink-600', icon: 'document', kind: 'skill' },
      { id: 'idea-refine', name: 'idea-refine', title: 'The /idea-refine Skill', desc: 'Step 1 (Research): sharpens vague concepts through structured divergence/convergence.', gradient: 'from-amber-600 to-yellow-600', icon: 'clean', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Step 1 (Core default): specifies test cases and assertions before coding.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'incremental-implementation', name: 'incremental-implementation', title: 'The /incremental-implementation Skill', desc: 'Step 1 (Core default): delivers changes in small, safe, ordered vertical increments.', gradient: 'from-lime-600 to-green-600', icon: 'iterate', kind: 'skill' },
      { id: 'spec-driven-development', name: 'spec-driven-development', title: 'The /spec-driven-development Skill', desc: 'Step 2: turns requirements into SPEC.md with goals, acceptance criteria, and edge cases.', gradient: 'from-blue-600 to-indigo-600', icon: 'document', kind: 'skill' },
      { id: 'constraint-driven-development', name: 'constraint-driven-development', title: 'The /constraint-driven-development Skill', desc: 'Step 3: locks CONSTRAINTS.md: zero regressions, anti-cheat, performance ceilings.', gradient: 'from-slate-600 to-slate-700', icon: 'shield', kind: 'skill' },
      { id: 'type-design-analyzer', name: 'type-design-analyzer', title: 'The type-design-analyzer Persona', desc: 'Step 4: evaluates type domain models, encapsulation, and public interface contracts.', gradient: 'from-indigo-600 to-blue-800', icon: 'shield', kind: 'agent' },
      { id: 'planning-and-task-breakdown', name: 'planning-and-task-breakdown', title: 'The /planning-and-task-breakdown Skill', desc: 'Step 6: maps dependency graph first, then decomposes work into risk-first tasks.', gradient: 'from-violet-600 to-purple-600', icon: 'plan', kind: 'skill' }
    ]
  },

  {
    id: 'iii-build-plan',
    num: '#3',
    title: 'Station #3: Build with TDD',
    desc: 'Executes tasks/plan.md one task at a time (Mode A: full autonomous, Mode B: single task) with type-aware specialist routing, official docs grounding, code simplification, and atomic local commits. Never pushes — shipping is Station IV. A fresh quick-fix-labeled plan diverts at §1c before the first task.',
    startWithLabel: 'Start with',
    startWithCommand: '/iii-build-plan',
    accent: 'from-emerald-600 to-teal-600',
    invoked: [
      { id: 'quick-fix', name: 'quick-fix', title: 'The /quick-fix Skill', desc: '§1c Lane Divert: on a quick-fix-labeled issue with a fresh plan, the 7-box gate offers the lane before the first task runs.', gradient: 'from-amber-600 to-orange-600', icon: 'speed', kind: 'skill' },
      { id: 'frontend-ui-engineering', name: 'frontend-ui-engineering', title: 'The /frontend-ui-engineering Skill', desc: 'UI/Frontend routing: accessible, responsive components and production layouts.', gradient: 'from-cyan-600 to-teal-600', icon: 'layout', kind: 'skill' },
      { id: 'tailwind-design-system', name: 'tailwind-design-system', title: 'The /tailwind-design-system Skill', desc: 'UI/Frontend routing: applies project design tokens and utility styling.', gradient: 'from-cyan-600 to-blue-600', icon: 'palette', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Code/Backend routing: writes the failing test first, then minimal code to pass.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'source-driven-development', name: 'source-driven-development', title: 'The /source-driven-development Skill', desc: 'Code/Backend routing: grounds API usage and patterns in official documentation.', gradient: 'from-sky-600 to-cyan-600', icon: 'book', kind: 'skill' },
      { id: 'api-and-interface-design', name: 'api-and-interface-design', title: 'The /api-and-interface-design Skill', desc: 'Code/Backend routing: implements clean module boundaries and typed signatures.', gradient: 'from-indigo-600 to-violet-600', icon: 'layout', kind: 'skill' },
      { id: 'debugging-and-error-recovery', name: 'debugging-and-error-recovery', title: 'The /debugging-and-error-recovery Skill', desc: 'Debug/Defect routing: investigates root cause before writing fixes.', gradient: 'from-red-600 to-orange-600', icon: 'bug', kind: 'skill' },
      { id: 'performance-optimization', name: 'performance-optimization', title: 'The /performance-optimization Skill', desc: 'Performance routing: optimizes bottlenecks, queries, and rendering.', gradient: 'from-amber-600 to-orange-600', icon: 'pulse', kind: 'skill' },
      { id: 'security-and-hardening', name: 'security-and-hardening', title: 'The /security-and-hardening Skill', desc: 'Security routing: validates inputs, manages session boundaries, protects secrets.', gradient: 'from-red-600 to-rose-600', icon: 'shield', kind: 'skill' },
      { id: 'documentation-and-adrs', name: 'documentation-and-adrs', title: 'The /documentation-and-adrs Skill', desc: 'Docs routing: keeps documentation and docstrings in sync with changed behavior.', gradient: 'from-blue-600 to-indigo-600', icon: 'document', kind: 'skill' },
      { id: 'code-simplification', name: 'code-simplification', title: 'The /code-simplification Skill', desc: 'Recurring: prunes dead code and unnecessary abstractions at the end of each task.', gradient: 'from-teal-600 to-emerald-600', icon: 'clean', kind: 'skill' },
      { id: 'git-workflow-and-versioning', name: 'git-workflow-and-versioning', title: 'The /git-workflow-and-versioning Skill', desc: 'Recurring: commit discipline, atomic local commits, rollback safety.', gradient: 'from-orange-600 to-red-600', icon: 'git', kind: 'skill' },
      { id: 'observability-and-instrumentation', name: 'observability-and-instrumentation', title: 'The /observability-and-instrumentation Skill', desc: 'Recurring: structured logging and metric instrumentation for production changes.', gradient: 'from-indigo-600 to-blue-600', icon: 'terminal', kind: 'skill' },
      { id: 'tdd-guide', name: 'tdd-guide', title: 'The tdd-guide Persona', desc: 'Enforces write-tests-first discipline and ~80%+ test coverage.', gradient: 'from-green-500 to-emerald-700', icon: 'shield', kind: 'agent' },
      { id: 'build-error-resolver', name: 'build-error-resolver', title: 'The build-error-resolver Persona', desc: 'Resolves generic syntax, compiler, and import errors with minimal diffs.', gradient: 'from-amber-500 to-amber-800', icon: 'shield', kind: 'agent' },
      { id: 'react-build-resolver', name: 'react-build-resolver', title: 'The react-build-resolver Persona', desc: 'Resolves React-specific compilation and JSX/build failures.', gradient: 'from-cyan-400 to-cyan-700', icon: 'shield', kind: 'agent' },
      { id: 'go-build-resolver', name: 'go-build-resolver', title: 'The go-build-resolver Persona', desc: 'Resolves Go build and compiler errors.', gradient: 'from-sky-600 to-zinc-800', icon: 'shield', kind: 'agent' },
      { id: 'rust-build-resolver', name: 'rust-build-resolver', title: 'The rust-build-resolver Persona', desc: 'Resolves Rust borrow checker, lifetime, and compilation errors.', gradient: 'from-orange-600 to-stone-800', icon: 'shield', kind: 'agent' }
    ]
  },

  {
    id: 'iiib-iterate-after-build',
    num: '#3b',
    title: 'Station #3b: Iterate Human Feedback',
    desc: 'Fast fix loop for operator corrections on a fresh build. Classifies each comment into a lane (bug, dead button, UI/Styling, slow, security), fixes with the matching specialist, verifies UI via playwright-cli only, and loops until the operator calls the build clean — nothing is pushed here.',
    startWithLabel: 'Start with',
    startWithCommand: '/iiib-iterate-after-build',
    accent: 'from-amber-600 to-orange-600',
    invoked: [
      { id: 'diagnosing-bugs', name: 'diagnosing-bugs', title: 'The /diagnosing-bugs Skill', desc: 'Lane routing (Bug): structured diagnosis loop for crashes and regressions.', gradient: 'from-orange-600 to-amber-600', icon: 'stethoscope', kind: 'skill' },
      { id: 'debugging-and-error-recovery', name: 'debugging-and-error-recovery', title: 'The /debugging-and-error-recovery Skill', desc: 'Lane routing (Bug): reproduce, localize, minimal fix, and guard.', gradient: 'from-red-600 to-orange-600', icon: 'bug', kind: 'skill' },
      { id: 'click-path-audit', name: 'click-path-audit', title: 'The /click-path-audit Skill', desc: 'Lane routing (Dead button): traces handler sequence to find canceling state writes.', gradient: 'from-amber-600 to-orange-600', icon: 'click', kind: 'skill' },
      { id: 'frontend-ui-engineering', name: 'frontend-ui-engineering', title: 'The /frontend-ui-engineering Skill', desc: 'Lane routing (UI/Styling): fixes component structure, responsive layout, and styles.', gradient: 'from-cyan-600 to-teal-600', icon: 'layout', kind: 'skill' },
      { id: 'tailwind-design-system', name: 'tailwind-design-system', title: 'The /tailwind-design-system Skill', desc: 'Lane routing (UI/Styling): aligns styling corrections with project design tokens.', gradient: 'from-cyan-600 to-blue-600', icon: 'palette', kind: 'skill' },
      { id: 'performance-optimization', name: 'performance-optimization', title: 'The /performance-optimization Skill', desc: 'Lane routing (Slow): profiles before optimizing slow operations or rendering.', gradient: 'from-amber-600 to-orange-600', icon: 'pulse', kind: 'skill' },
      { id: 'security-and-hardening', name: 'security-and-hardening', title: 'The /security-and-hardening Skill', desc: 'Lane routing (Security): fixes auth, secrets exposure, and untrusted inputs.', gradient: 'from-red-600 to-rose-600', icon: 'shield', kind: 'skill' },
      { id: 'browser-testing-with-devtools', name: 'browser-testing-with-devtools', title: 'The /browser-testing-with-devtools Skill', desc: 'Verification: live DOM, console, and network check with zero uncaught errors.', gradient: 'from-sky-600 to-blue-600', icon: 'browser', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Verification: targeted regression tests proving logic fixes at the reproduction seam.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'verification-before-completion', name: 'verification-before-completion', title: 'The /verification-before-completion Skill', desc: 'Verification: confirms every reported operator correction is fixed with evidence.', gradient: 'from-green-600 to-emerald-600', icon: 'verify', kind: 'skill' },
      { id: 'code-simplification', name: 'code-simplification', title: 'The /code-simplification Skill', desc: 'Recurring: keeps each fix minimal, zero dead code or speculative abstractions.', gradient: 'from-teal-600 to-emerald-600', icon: 'clean', kind: 'skill' }
    ]
  },

  {
    id: 'iv-review-build-and-pr',
    num: '#4',
    title: 'Station #4: Review, Ship & PR',
    desc: 'Proof-before-review gate (Step 0: live browser pass via playwright-cli or targeted tests — failure returns to Station IIIb), the Step 0.2 quick-fix divert, OCR delegation scan, diff-matched specialist reviewers plus the Spec axis, fixes, the post-review verification gate, then push, PR, and the CodeRabbit trigger with ack classification.',
    startWithLabel: 'Start with',
    startWithCommand: '/iv-review-build-and-pr',
    accent: 'from-violet-600 to-purple-600',
    invoked: [
      { id: 'quick-fix', name: 'quick-fix', title: 'The /quick-fix Skill', desc: 'Step 0.2 Lane Divert: last chance past the proof gate — the whole diff passing the 7-box gate ships straight to the base branch.', gradient: 'from-amber-600 to-orange-600', icon: 'speed', kind: 'skill' },
      { id: 'playwright-cli', name: 'playwright-cli', title: 'The /playwright-cli Skill', desc: 'Step 0 Proof Gate: the only permitted headless browser automation for fast UI/DOM proof — one batched DOM call, one console call, one network call, one screenshot, then close.', gradient: 'from-blue-600 to-indigo-600', icon: 'browser', kind: 'skill' },
      { id: 'browser-testing-with-devtools', name: 'browser-testing-with-devtools', title: 'The /browser-testing-with-devtools Skill', desc: 'Step 0 Proof Gate: live browser inspection for performance profiling and traces only.', gradient: 'from-sky-600 to-blue-600', icon: 'browser', kind: 'skill' },
      { id: 'code-review-and-quality', name: 'code-review-and-quality', title: 'The /code-review-and-quality Skill', desc: 'Step 1B: general code quality, naming, lack of dead code, and pattern adherence.', gradient: 'from-violet-600 to-purple-600', icon: 'review', kind: 'skill' },
      { id: 'security-and-hardening', name: 'security-and-hardening', title: 'The /security-and-hardening Skill', desc: 'Step 1B: audits inputs, secrets exposure, session boundaries, and supply chain.', gradient: 'from-red-600 to-rose-600', icon: 'shield', kind: 'skill' },
      { id: 'test-driven-development', name: 'test-driven-development', title: 'The /test-driven-development Skill', desc: 'Step 1B: test engineering audit. It verifies real domain tests, not hollow mocks.', gradient: 'from-emerald-600 to-green-600', icon: 'test', kind: 'skill' },
      { id: 'web-design-guidelines', name: 'web-design-guidelines', title: 'The /web-design-guidelines Skill', desc: 'Step 1B: reviews UI for accessibility, WCAG contrast, and ARIA attributes.', gradient: 'from-teal-600 to-cyan-600', icon: 'palette', kind: 'skill' },
      { id: 'api-and-interface-design', name: 'api-and-interface-design', title: 'The /api-and-interface-design Skill', desc: 'Step 1B Advisory: REST contracts and endpoint boundary review when APIs change.', gradient: 'from-indigo-600 to-violet-600', icon: 'layout', kind: 'skill' },
      { id: 'frontend-ui-engineering', name: 'frontend-ui-engineering', title: 'The /frontend-ui-engineering Skill', desc: 'Step 1B Advisory: reviews UI components, state lifecycles, and layout integrity.', gradient: 'from-cyan-600 to-teal-600', icon: 'layout', kind: 'skill' },
      { id: 'vercel-react-best-practices', name: 'vercel-react-best-practices', title: 'The /vercel-react-best-practices Skill', desc: 'Step 1B Advisory: data-fetching, caching, and hydration checklists for React/Next.js.', gradient: 'from-cyan-600 to-blue-700', icon: 'react', kind: 'skill' },
      { id: 'vercel-composition-patterns', name: 'vercel-composition-patterns', title: 'The /vercel-composition-patterns Skill', desc: 'Step 1B Advisory: compound components and decoupled state interfaces for React.', gradient: 'from-indigo-600 to-violet-700', icon: 'layers', kind: 'skill' },
      { id: 'typescript-reviewer', name: 'typescript-reviewer', title: 'The typescript-reviewer Persona', desc: 'Diff-matched reviewer: TS/JS types, async correctness, Node/web security.', gradient: 'from-[#3178C6] to-blue-800', icon: 'shield', kind: 'agent' },
      { id: 'react-reviewer', name: 'react-reviewer', title: 'The react-reviewer Persona', desc: 'Diff-matched reviewer: React hooks, a11y, RSC boundaries, render performance.', gradient: 'from-cyan-400 to-cyan-700', icon: 'shield', kind: 'agent' },
      { id: 'python-reviewer', name: 'python-reviewer', title: 'The python-reviewer Persona', desc: 'Diff-matched reviewer: Python asyncio, typing, PEP 8, memory leaks.', gradient: 'from-amber-400 to-yellow-600', icon: 'shield', kind: 'agent' },
      { id: 'go-reviewer', name: 'go-reviewer', title: 'The go-reviewer Persona', desc: 'Diff-matched reviewer: Go goroutines, error propagation, interface boundaries.', gradient: 'from-sky-400 to-sky-700', icon: 'shield', kind: 'agent' },
      { id: 'rust-reviewer', name: 'rust-reviewer', title: 'The rust-reviewer Persona', desc: 'Diff-matched reviewer: Rust lifetimes, unsafe blocks, concurrency, borrowing.', gradient: 'from-orange-500 to-amber-800', icon: 'shield', kind: 'agent' },
      { id: 'database-reviewer', name: 'database-reviewer', title: 'The database-reviewer Persona', desc: 'Diff-matched reviewer: SQL/ORM changes, N+1 queries, indexes, migrations.', gradient: 'from-emerald-500 to-teal-700', icon: 'shield', kind: 'agent' },
      { id: 'security-reviewer', name: 'security-reviewer', title: 'The security-reviewer Persona', desc: 'Diff-matched reviewer: security vulnerabilities, authentication, and secrets.', gradient: 'from-rose-500 to-red-700', icon: 'shield', kind: 'agent' },
      { id: 'silent-failure-hunter', name: 'silent-failure-hunter', title: 'The silent-failure-hunter Persona', desc: 'Diff-matched reviewer: hunts swallowed errors, empty catches, dangerous fallbacks.', gradient: 'from-red-500 to-red-800', icon: 'shield', kind: 'agent' },
      { id: 'doc-updater', name: 'doc-updater', title: 'The doc-updater Persona', desc: 'Diff-matched reviewer: checks documentation still matches changed code behavior.', gradient: 'from-indigo-500 to-violet-700', icon: 'shield', kind: 'agent' },
      { id: 'verification-before-completion', name: 'verification-before-completion', title: 'The /verification-before-completion Skill', desc: 'Step 3 Post-Review Gate: verifies entire change post-fixes before push.', gradient: 'from-green-600 to-emerald-600', icon: 'verify', kind: 'skill' },
      { id: 'git-workflow-and-versioning', name: 'git-workflow-and-versioning', title: 'The /git-workflow-and-versioning Skill', desc: 'Step 4: git synchronization, clean feature branch push, and PR hygiene.', gradient: 'from-orange-600 to-red-600', icon: 'git', kind: 'skill' }
    ]
  },

  {
    id: 'v-babysit-pr-and-merge',
    num: '#5',
    title: 'Station #5: Babysit PR & Merge',
    desc: 'Consumes the trigger status from Station IV, then sits on the PR through exactly one focused review round on the 5m→4m→3m→2m→1m countdown (a summary-only review on a private repo is not a pass). Agent fallback when CodeRabbit is rate-limited, every comment triaged, squash-merge on green CI.',
    startWithLabel: 'Start with',
    startWithCommand: '/v-babysit-pr-and-merge',
    accent: 'from-pink-600 to-rose-600',
    invoked: [
      { id: 'code-reviewer', name: 'code-reviewer', title: 'The code-reviewer Persona', desc: 'Full fallback code quality review only when CodeRabbit evidence is unavailable.', gradient: 'from-violet-600 to-purple-700', icon: 'shield', kind: 'agent' },
      { id: 'build-error-resolver', name: 'build-error-resolver', title: 'The build-error-resolver Persona', desc: 'Fixes generic build and compile failures found in CI merge checks.', gradient: 'from-amber-500 to-amber-800', icon: 'shield', kind: 'agent' },
      { id: 'react-build-resolver', name: 'react-build-resolver', title: 'The react-build-resolver Persona', desc: 'Fixes React compilation failures found in CI merge checks.', gradient: 'from-cyan-400 to-cyan-700', icon: 'shield', kind: 'agent' },
      { id: 'go-build-resolver', name: 'go-build-resolver', title: 'The go-build-resolver Persona', desc: 'Fixes Go compilation and package failures found in CI merge checks.', gradient: 'from-sky-600 to-zinc-800', icon: 'shield', kind: 'agent' },
      { id: 'rust-build-resolver', name: 'rust-build-resolver', title: 'The rust-build-resolver Persona', desc: 'Fixes Rust borrow checker and build failures found in CI merge checks.', gradient: 'from-orange-600 to-stone-800', icon: 'shield', kind: 'agent' }
    ]
  },

  {
    id: 'vi-close-pipeline',
    num: '#6',
    title: 'Station #6: Close Pipeline',
    desc: 'Post-merge closeout: verifies the issue is closed, sweeps per-issue artifacts via signal-based discovery (two-gate obsolescence test, any project layout), handles dead code as the pipeline’s single approved code-change exception (zero-ref proof + tests), resolves the NOTICED-BUT-NOT-TOUCHING ledger, and ends on the Clean Exit Gate — or reports blocked.',
    startWithLabel: 'Start with',
    startWithCommand: '/vi-close-pipeline',
    accent: 'from-slate-500 to-zinc-600',
    invoked: [
      { id: 'deprecation-and-migration', name: 'deprecation-and-migration', title: 'The /deprecation-and-migration Skill', desc: 'Exception-only: routes dead code to proper migration tracks when renaming live APIs or migrating consumers.', gradient: 'from-amber-600 to-orange-600', icon: 'migrate', kind: 'skill' }
    ]
  },

  {
    id: 'present-pr',
    num: 'Ad-hoc',
    title: 'Ad-hoc Showcase: Present PR',
    desc: 'Ad-hoc showcase run on request after a clean Station VI or at any time. One standalone zero-dependency HTML page that explains the change in customer-simple words, the visual picked after the story is understood (flow, timeline, before/after, map, numbers, demo). “Try it” always points at the real application. Also handles explain-mode.',
    startWithLabel: 'Start with',
    startWithCommand: '/present-pr <id>',
    accent: 'from-fuchsia-600 to-pink-600',
    invoked: []
  }
];


const HUMAN_TITLES = {
  'using-agent-skills': 'Using Agent Skills',
  'context-engineering': 'Engineering Context',
  'spec-driven-development': 'Spec-Driven Development',
  'constraint-driven-development': 'Constraint-Driven Development',
  'planning-and-task-breakdown': 'Planning & Task Breakdown',
  'interview-me': 'Operator Interview',
  'idea-refine': 'Idea Refining',
  'doubt-driven-development': 'Doubt-Driven Development',
  'test-driven-development': 'Test-Driven Development',
  'source-driven-development': 'Source-Driven Development',
  'api-and-interface-design': 'API & Interface Design',
  'code-simplification': 'Code Simplification',
  'debugging-and-error-recovery': 'Debugging & Error Recovery',
  'diagnosing-bugs': 'Root-Cause Analysis',
  'incremental-implementation': 'Incremental Implementation',
  'click-path-audit': 'Click-Path Audit',
  'browser-testing-with-devtools': 'Browser Testing',
  'frontend-ui-engineering': 'Frontend UI Engineering',
  'extract-design-system': 'Extract Design System',
  'verification-before-completion': 'Final Verification',
  'code-review-and-quality': 'Code Review & Quality',
  'security-and-hardening': 'Security Hardening',
  'performance-optimization': 'Performance Optimization',
  'web-design-guidelines': 'Web Design Guidelines',
  'git-workflow-and-versioning': 'Git Workflow & Versioning',
  'observability-and-instrumentation': 'Observability & Instrumentation',
  'vercel-react-best-practices': 'Vercel React Best Practices',
  'vercel-composition-patterns': 'Vercel Composition Patterns',
  'documentation-and-adrs': 'Documentation & ADRs',
  'deprecation-and-migration': 'Deprecation & Migration',
  'pipeline-triage': 'Pipeline Triage',
  'create-issue': 'Create Issue',
  'quick-fix': 'Quick Fix',
  'iii-build-plan': 'Build Plan',
  'tailwind-design-system': 'Tailwind Design System',
  'frontend-design': 'Frontend Design',
  'humanizer': 'Humanizer',
  'playwright-cli': 'Playwright CLI',
  'present-pr': 'Present PR',
  'code-reviewer': 'Code Reviewer',
  'typescript-reviewer': 'TypeScript Reviewer',
  'react-reviewer': 'React Reviewer',
  'python-reviewer': 'Python Reviewer',
  'go-reviewer': 'Go Reviewer',
  'rust-reviewer': 'Rust Reviewer',
  'database-reviewer': 'Database Reviewer',
  'security-reviewer': 'Security Reviewer',
  'silent-failure-hunter': 'Silent Failure Hunter',
  'tdd-guide': 'TDD Guide',
  'build-error-resolver': 'Build Error Resolver',
  'react-build-resolver': 'React Build Resolver',
  'go-build-resolver': 'Go Build Resolver',
  'rust-build-resolver': 'Rust Build Resolver',
  'doc-updater': 'Documentation Updater',
  'code-explorer': 'Code Explorer',
  'type-design-analyzer': 'Type Design Analyzer'
};

// Role-color gradients for agent icon boxes (overrides data gradient: red for build-error-resolver, darker for build resolvers, etc.)
const AGENT_GRADIENTS = {
  'code-reviewer': 'from-violet-600 to-purple-700',
  'typescript-reviewer': 'from-[#3178C6] to-blue-800',
  'react-reviewer': 'from-cyan-400 to-cyan-700',
  'python-reviewer': 'from-amber-400 to-yellow-600',
  'go-reviewer': 'from-sky-400 to-sky-700',
  'rust-reviewer': 'from-orange-500 to-amber-800',
  'database-reviewer': 'from-emerald-500 to-teal-700',
  'security-reviewer': 'from-rose-500 to-red-700',
  'silent-failure-hunter': 'from-red-500 to-red-800',
  'tdd-guide': 'from-green-500 to-emerald-700',
  'build-error-resolver': 'from-amber-500 to-amber-800',
  'react-build-resolver': 'from-cyan-400 to-cyan-700',
  'go-build-resolver': 'from-sky-600 to-zinc-800',
  'rust-build-resolver': 'from-orange-600 to-stone-800',
  'doc-updater': 'from-indigo-500 to-violet-700',
  'code-explorer': 'from-slate-500 to-slate-700',
  'type-design-analyzer': 'from-indigo-600 to-blue-800'
};

// Persona bust icons for agents: currentColor figure + white emblem on chest
function getPersonaIconSvg(agentId) {
  const base = '<circle cx="24" cy="11" r="6.5" fill="rgba(0,0,0,.45)"/><path d="M2 48 C2 30 12 24 24 24 C36 24 46 30 46 48 Z" fill="rgba(0,0,0,.45)"/>';
  let e = '';
  switch (agentId) {
    case 'code-reviewer':
      e = '<path d="M20 34l-3 2 3 2M28 34l3 2-3 2" stroke="white" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      break;
    case 'typescript-reviewer':
      e = '<g transform="translate(13.2,25) scale(0.9)" fill="white"><path d="M1.5 0h21A1.5 1.5 0 0 1 24 1.5v21a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 22.5v-21A1.5 1.5 0 0 1 1.5 0zm10.72 13.92h-2.9v7.07H6.77V13.92H3.87v-2.47h8.35v2.47zm3.17 4.96c.64.36 1.48.58 2.37.58 1.42 0 2.24-.69 2.24-1.69 0-.96-.65-1.46-2.02-1.99-1.78-.68-2.89-1.66-2.89-3.23 0-1.91 1.54-3.3 3.93-3.3 1.25 0 2.24.31 2.83.67l-.73 2.19c-.48-.28-1.22-.5-2.08-.5-1.2 0-1.84.6-1.84 1.43 0 .86.67 1.3 2.14 1.88 1.93.75 2.79 1.76 2.79 3.37 0 2.13-1.64 3.42-4.33 3.42-1.39 0-2.61-.41-3.26-.82l.81-2.21z"/></g>';
      break;
    case 'react-reviewer':
      e = '<ellipse cx="24" cy="36" rx="5" ry="2" stroke="white" stroke-width="0.75" fill="none"/><ellipse cx="24" cy="36" rx="5" ry="2" transform="rotate(60 24 36)" stroke="white" stroke-width="0.8" fill="none"/><ellipse cx="24" cy="36" rx="5" ry="2" transform="rotate(120 24 36)" stroke="white" stroke-width="0.8" fill="none"/><circle cx="24" cy="36" r="1" fill="white"/>';
      break;
    case 'python-reviewer':
      e = '<g transform="translate(13.2,25) scale(0.9)" fill="white"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.006 2.753h5.814v.826H3.9S0 5.78 0 11.966c0 6.183 3.407 5.96 3.407 5.96h2.036v-2.863s-.11-3.414 3.355-3.414h5.786s3.243.054 3.243-3.14V3.14S18.358 0 11.914 0zm-3.21 1.84a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14zm3.382 22.16c6.095 0 5.714-2.656 5.714-2.656l-.006-2.753H11.98v-.826h8.12s3.9.455 3.9-5.731c0-6.183-3.407-5.96-3.407-5.96h-2.036v2.863s.11 3.414-3.355 3.414H9.416s-3.243-.054-3.243 3.14v5.367s-.532 3.14 5.913 3.14zm3.21-1.84a1.07 1.07 0 1 1 0-2.14 1.07 1.07 0 0 1 0 2.14z"/></g>';
      break;
    case 'go-reviewer':
      e = '<text x="24" y="39" text-anchor="middle" font-size="7" font-weight="bold" font-family="monospace" fill="white">Go</text>';
      break;
    case 'rust-reviewer':
      e = '<circle cx="24" cy="36" r="2.6" stroke="white" stroke-width="0.75" fill="none"/><path d="M24 31v2M24 39v-2M19 36h2M29 36h-2M20.5 32.5l1.4 1.4M27.5 39.5l-1.4-1.4M27.5 32.5l-1.4 1.4M20.5 39.5l1.4-1.4" stroke="white" stroke-width="1"/>';
      break;
    case 'database-reviewer':
      e = '<ellipse cx="24" cy="33.5" rx="3.5" ry="1.4" stroke="white" stroke-width="1.1" fill="none"/><path d="M20.5 33.5v4c0 0.8 1.6 1.4 3.5 1.4s3.5-0.6 3.5-1.4v-4" stroke="white" stroke-width="1.1" fill="none"/>';
      break;
    case 'security-reviewer':
      e = '<path d="M24 32l3 1.2v2c0 2-1.3 3.2-3 3.8-1.7-0.6-3-1.8-3-3.8v-2z" stroke="white" stroke-width="1.1" fill="none"/><circle cx="24" cy="36" r="0.9" fill="white"/>';
      break;
    case 'silent-failure-hunter':
      e = '<g transform="translate(13.2,25) scale(0.9)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="M4 13h4"/><path d="M20 13h-4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></g>';
      break;
    case 'tdd-guide':
      e = '<g transform="translate(13.2,25) scale(0.9)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="m5.52 16 12.96 0"/></g>';
      break;
    case 'build-error-resolver':
      e = '<g transform="translate(13.2,25) scale(0.9)" fill="white"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></g>';
      break;
    case 'react-build-resolver':
      e = '<ellipse cx="24" cy="36" rx="4" ry="1.6" stroke="white" stroke-width="0.75" fill="none"/><ellipse cx="24" cy="36" rx="4" ry="1.6" transform="rotate(60 24 36)" stroke="white" stroke-width="0.8" fill="none"/><circle cx="24" cy="36" r="0.9" fill="white"/>';
      break;
    case 'go-build-resolver':
      e = '<text x="24" y="39" text-anchor="middle" font-size="7" font-weight="bold" font-family="monospace" fill="white">Go</text>';
      break;
    case 'rust-build-resolver':
      e = '<circle cx="24" cy="36" r="2.4" stroke="white" stroke-width="1.1" fill="none"/><path d="M24 32v1.6M24 38.4V40M20 36h1.6M28 36h-1.6" stroke="white" stroke-width="0.9"/>';
      break;
    case 'doc-updater':
      e = '<rect x="21" y="32.5" width="6" height="7" rx="0.8" stroke="white" stroke-width="1.1" fill="none"/><path d="M22.5 35h3M22.5 36.8h3" stroke="white" stroke-width="0.9" stroke-linecap="round"/>';
      break;
    case 'type-design-analyzer':
      e = '<path d="M21 33h6M24 33v7" stroke="white" stroke-width="1.3" stroke-linecap="round"/><circle cx="24" cy="36.5" r="4.2" stroke="white" stroke-width="1.1" fill="none"/>';
      break;
    case 'code-explorer':
    default:
      e = '<circle cx="24" cy="36" r="3.6" stroke="white" stroke-width="1.1" fill="none"/><polygon points="24,33.2 25.2,36 24,38.8 22.8,36" fill="white"/>';
      break;
  }
  if (e && e.indexOf('translate(')===-1) { e = '<g transform="translate(24,37) scale(1.7) translate(-24,-37)">'+e+'</g>'; }
  return `<svg viewBox="0 0 48 48" class="w-9 h-9 text-white" fill="none">${base}${e}</svg>`;
}
// Skill icons: Lucide (ISC licence) — paths inlined, no runtime dependency.
// Helper to render SVG icons
function getSkillIconSvg(iconType) {
  switch (iconType) {
    case 'workflow':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2" /> <path d="M7 11v4a2 2 0 0 0 2 2h4" /> <rect width="8" height="8" x="13" y="13" rx="2" /></svg>`;
    case 'terminal':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19h8" /> <path d="m4 17 6-6-6-6" /></svg>`;
    case 'issue':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    case 'plan':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5h8" /> <path d="M13 12h8" /> <path d="M13 19h8" /> <path d="m3 17 2 2 4-4" /> <path d="m3 7 2 2 4-4" /></svg>`;
    case 'build':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`;
    case 'iterate':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
    case 'review':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" /></svg>`;
    case 'merge':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100 4 2 2 0 000-4zm8-4a2 2 0 100-4 2 2 0 000 4z"/></svg>`;
    case 'close':
    case 'prune':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
    case 'present':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>`;
    case 'document':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /> <path d="M14 2v5a1 1 0 0 0 1 1h5" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" /></svg>`;
    case 'shield':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>`;
    case 'lock':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>`;
    case 'layout':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /> <rect width="7" height="5" x="14" y="3" rx="1" /> <rect width="7" height="9" x="14" y="12" rx="1" /> <rect width="7" height="5" x="3" y="16" rx="1" /></svg>`;
    case 'palette':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /></svg>`;
    case 'scanner':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <circle cx="12" cy="12" r="3" /> <path d="m16 16-1.9-1.9" /></svg>`;
    case 'stethoscope':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v2" /> <path d="M5 2v2" /> <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" /> <path d="M8 15a6 6 0 0 0 12 0v-3" /> <circle cx="20" cy="10" r="2" /></svg>`;
    case 'api':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    case 'debug':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`;
    case 'bug':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-9" /> <path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" /> <path d="M14.12 3.88 16 2" /> <path d="M21 21a4 4 0 0 0-3.81-4" /> <path d="M21 5a4 4 0 0 1-3.55 3.97" /> <path d="M22 13h-4" /> <path d="M3 21a4 4 0 0 1 3.81-4" /> <path d="M3 5a4 4 0 0 0 3.55 3.97" /> <path d="M6 13H2" /> <path d="m8 2 1.88 1.88" /> <path d="M9 7.13V6a3 3 0 1 1 6 0v1.13" /></svg>`;
    case 'doubt':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" /> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /> <path d="M12 17h.01" /></svg>`;
    case 'speed':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" /></svg>`;
    case 'test':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /> <path d="M6.453 15h11.094" /> <path d="M8.5 2h7" /></svg>`;
    case 'book':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" /></svg>`;
    case 'clean':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" /></svg>`;
    case 'git':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6a9 9 0 0 0-9 9V3" /> <circle cx="18" cy="6" r="3" /> <circle cx="6" cy="18" r="3" /></svg>`;
    case 'pulse':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4" /> <path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>`;
    case 'click':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.1 12 6" /> <path d="m5.1 8-2.9-.8" /> <path d="m6 12-1.9 2" /> <path d="M7.2 2.2 8 5.1" /> <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" /></svg>`;
    case 'browser':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /> <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /> <path d="M2 12h20" /></svg>`;
    case 'verify':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /> <path d="m16 9-5.5 5.5L8 12" /></svg>`;
    case 'react':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" /></svg>`;
    case 'layers':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /> <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /> <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></svg>`;
    case 'ci':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`;
    case 'migrate':
      return `<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4" /> <path d="M20 7H4" /> <path d="m8 21-4-4 4-4" /> <path d="M4 17h16" /></svg>`;
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

    let cardsHtml = filteredInvoked.map(skill => {
      const isAgent = skill.kind === 'agent';
      return `
      <div 
        class="skill-card${isAgent ? ' agent-card-kind' : ''} group flex items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.07] hover:border-violet-500/40 transition cursor-pointer"${isAgent ? ' style="border-color: rgba(245,158,11,.35)"' : ''}
        onclick="openSkillModal('${skill.id}', '${station.id}')"
        role="button"
        tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSkillModal('${skill.id}', '${station.id}')}"
      >
        <div class="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div class="h-11 w-11 rounded-xl bg-gradient-to-br ${isAgent ? (AGENT_GRADIENTS[skill.id] || skill.gradient) : skill.gradient} flex items-center justify-center shrink-0 border border-white/15 shadow-md group-hover:scale-105 group-hover:shadow-violet-500/20 transition-transform text-white">
            ${isAgent ? getPersonaIconSvg(skill.id) : getSkillIconSvg(skill.icon)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-white text-[15px] sm:text-[16px] leading-snug group-hover:text-amber-100 transition-colors">${HUMAN_TITLES[skill.id] || HUMAN_TITLES[skill.name] || skill.title}</div>
            <div class="text-xs sm:text-sm text-white/60 mt-1 line-clamp-2 leading-relaxed">${skill.desc}</div>
          </div>
        </div>
        <div class="shrink-0">${isAgent ? '<span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shrink-0" style="color:#fcd34d;background:rgba(245,158,11,.15);border:1px solid rgba(251,191,36,.45)">AGENT →</span>' : '<span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0" style="color:#67e8f9;background:rgba(6,182,212,.12);border:1px solid rgba(34,211,238,.4)">SKILL →</span>'}
        </div>
      </div>
    `}).join('');

    if (!cardsHtml) {
      cardsHtml = `
        <div class="p-5 rounded-xl border border-white/10 bg-white/[.02] text-sm text-white/50 font-mono flex items-center gap-2">
          <span>⚡</span>
          <span>None: internal zero-dependency component kit only (skills: none)</span>
        </div>
      `;
    } else if (station.id === 'v-babysit-pr-and-merge' && !query) {
      cardsHtml = `
        <div class="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[.02] text-xs text-white/50 font-mono flex items-center gap-2 mb-1">
          <span class="text-amber-400 font-bold">Skills: none</span>
          <span class="text-white/30">·</span>
          <span>GitHub API & CodeRabbit only. Fallback & CI build resolvers:</span>
        </div>
      ` + cardsHtml;
    }

    return `
      <section id="${station.id}" class="station-row border-t border-white/10 pt-10 pb-12 first:border-t-0 first:pt-4 scroll-mt-24">
        <div class="grid lg:grid-cols-12 gap-8 lg:gap-10">
          
          <!-- Left Station Info -->
          <div class="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-mono text-xs sm:text-sm font-semibold text-zinc-400 tracking-wider">${station.num}</span>
              <span class="h-2 w-2 rounded-full bg-gradient-to-r ${station.accent}"></span>
            </div>
            <h2 class="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">${station.title}</h2>
            <p class="text-sm sm:text-[15px] text-white/60 mt-3 leading-relaxed">${station.desc}</p>
            <div class="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm font-mono text-white/80">
              <span class="text-white/50">${station.startWithLabel}</span>
              <a href="#${station.id}" class="text-zinc-200 font-semibold hover:text-white underline decoration-zinc-500">${station.startWithCommand}</a>
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
      <div class="rounded-xl border border-white/10 bg-white/[.04] p-10 text-center my-8">
        <div class="text-lg font-bold text-white">No skills match “${query}”</div>
        <p class="text-sm text-white/60 mt-2">Try searching for a different keyword like <span class="text-amber-200/70">test</span>, <span class="text-amber-200/70">review</span>, or <span class="text-amber-200/70">frontend</span>.</p>
        <button onclick="clearFlowSearch()" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-white transition">
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
      counterEl.textContent = `Showing ${renderedStationsCount} stations · ${totalCardsCount} invocations across 46 specialized skills & 17 reviewer personas`;
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
  const tagBadgeHtml = tagCfg ? `<span class="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-md border ${tagCfg.tagClass}">${tagCfg.tag}</span>` : '';

  modalContent.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-xl bg-gradient-to-br ${foundSkill.kind === 'agent' ? (AGENT_GRADIENTS[foundSkill.id] || foundSkill.gradient) : foundSkill.gradient} flex items-center justify-center shrink-0 border border-white/15 shadow-lg text-white">
          ${foundSkill.kind === 'agent' ? getPersonaIconSvg(foundSkill.id) : getSkillIconSvg(foundSkill.icon)}
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-xl font-bold text-white tracking-tight">${HUMAN_TITLES[foundSkill.id] || HUMAN_TITLES[foundSkill.name] || foundSkill.title}</h3>
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
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-50 hover:bg-white text-zinc-950 text-xs font-bold transition shadow-sm"
      >
        <span>${foundSkill.kind === 'agent' ? 'View Persona on GitHub' : 'View SKILL.md on GitHub'}</span>
        <span>↗</span>
      </a>
    </div>

    <!-- Support strip -->
    <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-white/50">
      <span>Free forever. MIT.</span>
      <!-- Funding — Buy Me a Coffee -->
      <a href="https://buymeacoffee.com/ai.degen" target="_blank" rel="noopener noreferrer" title="Buy me a coffee on Buy Me a Coffee" class="text-amber-200/80 hover:text-amber-200 transition">☕ Coffee</a>
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

// Render Sticky Table of Contents (Stages & bottom catalog anchor)
function renderTableOfContents() {
  const container = document.getElementById('tableOfContents');
  const mobileContainer = document.getElementById('mobileTableOfContents');
  if (!container && !mobileContainer) return;

  const html = STATIONS_FLOW.map(st => {
    const cleanTitle = st.title
      .replace(/^Station /, '')
      .replace(/^(State Gate|Intake Branch|Ad-hoc Showcase): /, '')
      .replace(': ', ' ');
    return `
      <a 
        href="#${st.id}" 
        id="toc-link-${st.id}"
        class="toc-item flex items-center justify-between px-3 py-2 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition font-medium group text-[12px]"
        data-target="${st.id}"
      >
        <span class="flex items-center gap-2 truncate">
          <span class="h-1.5 w-1.5 rounded-full bg-gradient-to-r ${st.accent} shrink-0"></span>
          <span class="truncate">${cleanTitle}</span>
        </span>
        <span class="font-mono text-[11px] text-white/40 group-hover:text-white/60 ml-2 shrink-0">${st.num}</span>
      </a>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (mobileContainer) mobileContainer.innerHTML = html;

  // Add click handling for smooth scrolling
  document.querySelectorAll('.toc-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('data-target') || (item.getAttribute('href') || '').replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        const yOffset = -76;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.pushState(null, '', '#' + targetId);

        const mobileDetails = document.getElementById('mobileTocDetails');
        if (mobileDetails) mobileDetails.removeAttribute('open');
      }
    });
  });

  setupTocScrollspy();
}

function setupTocScrollspy() {
  let isTicking = false;

  function update() {
    const scrollPos = window.scrollY + 140;
    let currentId = null;

    const catalogEl = document.getElementById('catalog');
    if (catalogEl && catalogEl.offsetTop <= scrollPos) {
      currentId = 'catalog';
    } else {
      for (let i = STATIONS_FLOW.length - 1; i >= 0; i--) {
        const st = STATIONS_FLOW[i];
        const el = document.getElementById(st.id);
        if (el && el.offsetTop <= scrollPos) {
          currentId = st.id;
          break;
        }
      }
    }

    if (!currentId && STATIONS_FLOW.length > 0) {
      currentId = STATIONS_FLOW[0].id;
    }

    document.querySelectorAll('.toc-item').forEach(item => {
      const target = item.getAttribute('data-target') || (item.getAttribute('href') || '').replace('#', '');
      if (target === currentId) {
        item.classList.add('bg-white/10', 'text-white', 'font-semibold', 'border-l-2', 'border-amber-200/60');
        item.classList.remove('text-white/65');
      } else {
        item.classList.remove('bg-white/10', 'text-white', 'font-semibold', 'border-l-2', 'border-amber-200/60');
        item.classList.add('text-white/65');
      }
    });

    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      requestAnimationFrame(update);
      isTicking = true;
    }
  }, { passive: true });

  update();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderTableOfContents();
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
