// Plain-language layer for non-developer visitors.
//
// Two fields per skill:
//   plain   - what it does in everyday words, no jargon. This is the line a
//             first-time visitor reads on the card and in the modal.
//   analogy - one concrete "think of it as..." that anchors the mechanism.
//             Optional; omitted when the plain line already lands.
//
// Rules (enforced by scripts/plain-language.test.js):
//   - every one of the 47 skills in skills/ has an entry
//   - no entry is missing, empty, or duplicated
//   - jargon is checked against a denylist (see the test file)
//
// This file is additive: the technical description in site/skills.json stays
// the source of truth for what the skill does. This layer only translates it.
window.PLAIN_SKILLS = {
  // ---- Pipeline stations -------------------------------------------------
  'pipeline-triage': {
    plain: 'Looks at where you left off and points the agent to the right next step, so you never have to re-explain the project.',
    analogy: 'Like a project manager checking the board before you sit down.'
  },
  'i-pick-issue': {
    plain: 'Shows your list of reported problems grouped by topic, recommends which one to tackle first, then runs the whole workflow start to finish.',
    analogy: 'Like a dispatcher picking the next call and staying on it until it closes.'
  },
  'ii-plan-issue': {
    plain: 'Reads the request, checks how big it really is, writes down the quality rules that must not be broken, and breaks the work into small, safe steps.',
    analogy: 'Like drawing the route and the speed limits before driving.'
  },
  'iii-build-plan': {
    plain: 'Does the actual building, one small piece at a time, testing each piece before moving on. Never publishes anything on its own.',
    analogy: 'Like laying bricks and checking each one is level before the next.'
  },
  'iiib-iterate-after-build': {
    plain: 'The fix loop for after you try it. You say what looks wrong or feels slow, and it routes each complaint to the right specialist and keeps fixing until you say it is good.',
    analogy: 'Like the back-and-forth with a tailor until the fit is right.'
  },
  'iv-review-build-and-pr': {
    plain: 'Proves the thing actually works in a real browser or with real tests, gets it checked by the right specialists, fixes what they find, then files the request to merge.',
    analogy: 'Like an inspection and sign-off before opening the doors.'
  },
  'v-babysit-pr-and-merge': {
    plain: 'Watches the merge request for reviewer comments, answers each one, and only merges once every automated check is green.',
    analogy: 'Like staying on the phone until every question is answered.'
  },
  'vi-close-pipeline': {
    plain: 'After the merge, confirms the request is marked done, deletes the temporary leftovers, removes dead code, and leaves the project tidy for next time.',
    analogy: 'Like locking up, taking out the trash, and wiping down the counter.'
  },
  'present-pr': {
    plain: 'Builds a single visual page that explains what changed, in words a customer would understand, so you can show the result without a technical walkthrough.',
    analogy: 'Like the before-and-after board a contractor shows the homeowner.'
  },

  // ---- Supporting: intake and routing ------------------------------------
  'create-issue': {
    plain: 'Turns a rough sentence you typed into a clear, fully described task with the exact files it touches, ready for the agent to pick up.',
    analogy: 'Like a front-desk form that turns a complaint into a work order.'
  },
  'quick-fix': {
    plain: 'For genuinely tiny changes like a typo or a broken link: checks the change is safe to skip the full process, then fixes and ships it directly.',
    analogy: 'Like a self-checkout lane for a single item.'
  },
  'using-agent-skills': {
    plain: 'The index at the front of the book. Figures out which specialist your request needs and sends it there.',
    analogy: 'Like a receptionist who knows which department handles what.'
  },
  'context-engineering': {
    plain: 'Decides exactly what background the agent is allowed to load, so it works on the right thing instead of the wrong one.',
    analogy: 'Like briefing someone with only the documents they need, not the whole filing cabinet.'
  },

  // ---- Supporting: deciding what to build --------------------------------
  'interview-me': {
    plain: 'Asks one question at a time until it is sure what you actually want, instead of guessing and building the wrong thing.',
    analogy: 'Like a good consultant who keeps asking before quoting.'
  },
  'idea-refine': {
    plain: 'Takes a vague idea, stretches it to see every angle, then narrows it down to one clear, workable plan.',
    analogy: 'Like brainstorming on a whiteboard, then picking one line to run with.'
  },
  'spec-driven-development': {
    plain: 'Writes down exactly what "done" means, with the rules the finished thing must follow, before any code exists.',
    analogy: 'Like the blueprint and the acceptance checklist for a renovation.'
  },
  'doubt-driven-development': {
    plain: 'Before trusting a risky decision, brings in a fresh reviewer whose job is to argue against it.',
    analogy: 'Like a second opinion before surgery.'
  },
  'constraint-driven-development': {
    plain: 'Pins the quality bar in writing and catches the agent quietly lowering it to get to "done" faster.',
    analogy: 'Like a building inspector who checks the plan did not get downgraded midway.'
  },
  'planning-and-task-breakdown': {
    plain: 'Splits a big job into a sensible order of small jobs, hardest risks first, so nothing blocks anything else.',
    analogy: 'Like the task list a mover hands you before they start.'
  },
  'incremental-implementation': {
    plain: 'Ships in small, safe steps rather than one giant change, so a mistake never costs the whole project.',
    analogy: 'Like changing one thing at a time to see what fixed it.'
  },
  'humanizer': {
    plain: 'Rewrites text that sounds robotic or salesy into something a normal person would actually write.',
    analogy: 'Like an editor cutting the corporate fluff out of a memo.'
  },

  // ---- Supporting: building the thing ------------------------------------
  'test-driven-development': {
    plain: 'Writes the check that should pass first, watches it fail, then builds just enough to make it pass. Nothing is called working without proof.',
    analogy: 'Like weighing the parcel before and after to prove the scale works.'
  },
  'source-driven-development': {
    plain: 'Looks up the official instructions for every tool used, instead of relying on possibly out-of-date memory.',
    analogy: 'Like reading the manual rather than guessing the assembly.'
  },
  'api-and-interface-design': {
    plain: 'Designs the seams between parts of the software so they connect cleanly and do not break each other later.',
    analogy: 'Like agreeing on plug shapes before anyone builds an appliance.'
  },
  'code-simplification': {
    plain: 'After the work is done, strips out leftovers and pointless complexity so the code stays readable.',
    analogy: 'Like taking down the scaffolding and sweeping the site.'
  },
  'frontend-ui-engineering': {
    plain: 'Builds the parts of the app people see and click: layouts, buttons, and screens that work on any device and are usable by everyone.',
    analogy: 'Like the shopfront and the aisles, not the stockroom.'
  },
  'frontend-design': {
    plain: 'Picks the look and feel: colours, type, and spacing, so the product looks intentional rather than generic.',
    analogy: 'Like choosing the interior design, not just the floor plan.'
  },
  'tailwind-design-system': {
    plain: 'Sets up a shared set of visual building blocks so every screen matches the rest.',
    analogy: 'Like a brand kit every team must use.'
  },
  'extract-design-system': {
    plain: 'Copies the visual style of a site you like into a starter kit for your own project.',
    analogy: 'Like taking paint chips from a house you admire.'
  },
  'debugging-and-error-recovery': {
    plain: 'Finds why something broke, fixes the actual cause, and adds a guard so it cannot silently come back.',
    analogy: 'Like finding the leak, not just mopping the floor.'
  },
  'diagnosing-bugs': {
    plain: 'A structured hunt for the reason something misbehaves, so the fix lands on the cause and not the symptom.',
    analogy: 'Like a doctor ordering tests before prescribing.'
  },

  // ---- Supporting: checking and reviewing --------------------------------
  'code-review-and-quality': {
    plain: 'A second read-through of the change, judging whether a senior engineer would approve it.',
    analogy: 'Like a colleague reading your draft before you send it.'
  },
  'security-and-hardening': {
    plain: 'Checks the change for ways it could be abused: leaked passwords, breakable logins, unguarded doors.',
    analogy: 'Like testing the locks on every door you installed.'
  },
  'performance-optimization': {
    plain: 'Finds what is slow and makes it faster, measured rather than guessed.',
    analogy: 'Like timing the route and removing the detour.'
  },
  'click-path-audit': {
    plain: 'Follows every button through to its result, to catch cases where two working parts cancel each other out.',
    analogy: 'Like pressing every switch in a room to see which one breaks the light.'
  },
  'browser-testing-with-devtools': {
    plain: 'Opens the real app in a real browser and inspects what actually happens on screen and behind it.',
    analogy: 'Like test-driving the car, not reading the spec sheet.'
  },
  'playwright-cli': {
    plain: 'Drives the app automatically the way a person would: clicking, typing, and checking the result.',
    analogy: 'Like a stand-in doing the clicking while you watch.'
  },
  'verification-before-completion': {
    plain: 'Refuses to call anything done until it has run the checks and can show the passing output.',
    analogy: 'Like a sign-off that requires the test printout, not a verbal "should be fine".'
  },
  'web-design-guidelines': {
    plain: 'Checks screens against accessibility rules, so people using keyboards or screen readers are not locked out.',
    analogy: 'Like checking the ramp is actually at the entrance.'
  },

  // ---- Supporting: shipping and running ----------------------------------
  'ci-cd-and-automation': {
    plain: 'Sets up the robots that automatically build, test, and release the software instead of a person doing it by hand.',
    analogy: 'Like the assembly line that runs without someone pulling each lever.'
  },
  'git-workflow-and-versioning': {
    plain: 'Keeps the record of every change clean and reversible: tidy commits, clear branches, safe pushes.',
    analogy: 'Like keeping dated backups and never scribbling over the original.'
  },
  'shipping-and-launch': {
    plain: 'Prepares the release: what to watch for after launch, and how to roll it back if it goes wrong.',
    analogy: 'Like the checklist before opening night, including the fire drill.'
  },
  'observability-and-instrumentation': {
    plain: 'Adds the gauges and logs that show what the software is doing once real people are using it.',
    analogy: 'Like fitting dashboard warning lights, not just an engine.'
  },
  'deprecation-and-migration': {
    plain: 'Retires something old safely, moving everything that still depends on it before pulling the plug.',
    analogy: 'Like rerouting traffic off a bridge before you close it.'
  },
  'documentation-and-adrs': {
    plain: 'Writes down what was decided and why, so the next person does not undo it by accident.',
    analogy: 'Like notes on the wall explaining why the wall is where it is.'
  },

  // ---- Supporting: framework specialists ---------------------------------
  'vercel-react-best-practices': {
    plain: 'Applies the official speed and correctness rules for building screens with the React toolkit.',
    analogy: 'Like following the manufacturer recommended settings.'
  },
  'vercel-composition-patterns': {
    plain: 'Structures React screens so they can be reused and rearranged without a rewrite.',
    analogy: 'Like standardised shelving units instead of built-in cabinets.'
  }
};
