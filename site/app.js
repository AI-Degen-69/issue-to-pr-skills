// Site logic — pipeline + catalog
const STATIONS = [
  {id:'pipeline-triage', label:'Entry', title:'Pipeline Triage', desc:'Dirty repo? Open PR? Unclear intent? Read-only triage inspects git state and routes to the right station. One router, max one handoff.', color:'cyan'},
  {id:'create-issue', label:'Intake', title:'Create Researched Issue', desc:'Intake branch when there is nothing to pick. Raw idea → researched GitHub issue labeled ready-for-agent. Researches repo first (real paths with line numbers), captures open questions with defaults.', color:'cyan'},
  {id:'i-pick-issue', label:'I', title:'Map & Pick', desc:'Issue work only. Runs the triage gate itself, then maps the open-issue backlog grouped by domain with a recommended order and one highlighted pick. With an issue number, goes straight to Station II.', color:'cyan'},
  {id:'ii-plan-issue', label:'II', title:'Plan & Constraints', desc:'Define & plan. Right-sizes (Tiny→Large), detects stack, locks CONSTRAINTS.md (zero regressions), writes tasks/plan.md as atomic vertical slices.', color:'cyan'},
  {id:'iii-build-plan', label:'III', title:'Build with TDD', desc:'Build. TDD per task, type-aware (frontend/TDD/debug), atomic commits, code simplification. Never pushes untested code. Proof before review.', color:'emerald'},
  {id:'iiib-iterate-after-build', label:'IIIB', title:'Iterate Human Feedback', desc:'Human feedback fix loop. Classifies each free-text correction (bug, dead button, UI alignment, slowness, security), routes to specialist, fixes minimally.', color:'emerald'},
  {id:'iv-review-build-and-pr', label:'IV', title:'Review, Ship & PR', desc:'Proof-before-review gate (live browser pass via playwright-cli, or tests) → OCR delegation scan → diff-matched specialist reviewers + Spec axis → push, PR, @coderabbitai.', color:'violet'},
  {id:'v-babysit-pr-and-merge', label:'V', title:'Babysit PR & Merge', desc:'Babysit & merge. Consumes IV’s trigger status, adaptive countdown (5m→1m), focused review round, triages comments, squash-merges green.', color:'amber'},
  {id:'vi-close-pipeline', label:'VI', title:'Close Pipeline', desc:'Close. Confirms the PR merged, prunes only per-issue scratch that is closed and unreferenced, updates PROGRESS.md and the handoff. Showcases, research, and ADRs are untouchable.', color:'rose'},
  {id:'present-pr', label:'Ad-hoc', title:'Present Showcase', desc:'Ad-hoc — run on request after a merge, not part of the automatic chain. Standalone HTML showcase: one centerpiece visual picked for this story, customer-simple words, try-it guide. Never the same twice.', color:'fuchsia'},
];

const TAG_CONFIG = {
  plan: {
    tag: 'Plan',
    label: 'Plan',
    color: 'cyan',
    tagClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    stationCardClass: 'border-cyan-500/50 bg-gradient-to-b from-cyan-950/40 to-cyan-950/10 shadow-[0_0_24px_rgba(6,182,212,0.14)] hover:border-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_32px_rgba(6,182,212,0.25)]',
    stationBadgeClass: 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    openLinkClass: 'text-cyan-300 hover:text-cyan-200'
  },
  build: {
    tag: 'Build',
    label: 'Build',
    color: 'emerald',
    tagClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    stationCardClass: 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 to-emerald-950/10 shadow-[0_0_24px_rgba(16,185,129,0.14)] hover:border-emerald-400 hover:bg-emerald-950/50 hover:shadow-[0_0_32px_rgba(16,185,129,0.25)]',
    stationBadgeClass: 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    openLinkClass: 'text-emerald-300 hover:text-emerald-200'
  },
  review: {
    tag: 'Review & PR',
    label: 'Review & PR',
    color: 'violet',
    tagClass: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
    stationCardClass: 'border-violet-500/50 bg-gradient-to-b from-violet-950/40 to-violet-950/10 shadow-[0_0_24px_rgba(139,92,246,0.18)] hover:border-violet-400 hover:bg-violet-950/50 hover:shadow-[0_0_32px_rgba(139,92,246,0.28)]',
    stationBadgeClass: 'bg-violet-500/25 text-violet-200 border border-violet-400/50 shadow-[0_0_10px_rgba(139,92,246,0.35)]',
    openLinkClass: 'text-violet-300 hover:text-violet-200'
  },
  babysit: {
    tag: 'Babysit',
    label: 'Babysit',
    color: 'amber',
    tagClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    stationCardClass: 'border-amber-500/50 bg-gradient-to-b from-amber-950/40 to-amber-950/10 shadow-[0_0_24px_rgba(245,158,11,0.14)] hover:border-amber-400 hover:bg-amber-950/50 hover:shadow-[0_0_32px_rgba(245,158,11,0.25)]',
    stationBadgeClass: 'bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    openLinkClass: 'text-amber-300 hover:text-amber-200'
  },
  prune: {
    tag: 'Prune',
    label: 'Prune',
    color: 'rose',
    tagClass: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    stationCardClass: 'border-rose-500/50 bg-gradient-to-b from-rose-950/40 to-rose-950/10 shadow-[0_0_24px_rgba(244,63,94,0.14)] hover:border-rose-400 hover:bg-rose-950/50 hover:shadow-[0_0_32px_rgba(244,63,94,0.25)]',
    stationBadgeClass: 'bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    openLinkClass: 'text-rose-300 hover:text-rose-200'
  },
  present: {
    tag: 'Present',
    label: 'Present',
    color: 'fuchsia',
    tagClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30',
    stationCardClass: 'border-fuchsia-500/50 bg-gradient-to-b from-fuchsia-950/40 to-fuchsia-950/10 shadow-[0_0_24px_rgba(217,70,239,0.18)] hover:border-fuchsia-400 hover:bg-fuchsia-950/50 hover:shadow-[0_0_32px_rgba(217,70,239,0.28)]',
    stationBadgeClass: 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/50 shadow-[0_0_10px_rgba(217,70,239,0.35)]',
    openLinkClass: 'text-fuchsia-300 hover:text-fuchsia-200'
  }
};

const GROUP = {
  // II  - Plan
  'ii-plan-issue': 'plan',
  'planning-and-task-breakdown': 'plan',
  'spec-driven-development': 'plan',
  'constraint-driven-development': 'plan',
  'interview-me': 'plan',
  'idea-refine': 'plan',
  'pipeline-triage': 'plan',
  'create-issue': 'plan',
  'i-pick-issue': 'plan',
  'doubt-driven-development': 'plan',
  'api-and-interface-design': 'plan',

  // III - Build
  'iii-build-plan': 'build',
  'iiib-iterate-after-build': 'build',
  'test-driven-development': 'build',
  'incremental-implementation': 'build',
  'source-driven-development': 'build',
  'code-simplification': 'build',
  'context-engineering': 'build',
  'using-agent-skills': 'build',
  'frontend-ui-engineering': 'build',
  'tailwind-design-system': 'build',
  'extract-design-system': 'build',
  'debugging-and-error-recovery': 'build',
  'diagnosing-bugs': 'build',

  // IV - Review & PR
  'iv-review-build-and-pr': 'review',
  'code-review-and-quality': 'review',
  'security-and-hardening': 'review',
  'performance-optimization': 'review',
  'browser-testing-with-devtools': 'review',
  'verification-before-completion': 'review',
  'click-path-audit': 'review',
  'web-design-guidelines': 'review',
  'vercel-react-best-practices': 'review',
  'vercel-composition-patterns': 'review',

  // V - Babysit
  'v-babysit-pr-and-merge': 'babysit',
  'ci-cd-and-automation': 'babysit',
  'git-workflow-and-versioning': 'babysit',
  'shipping-and-launch': 'babysit',
  'observability-and-instrumentation': 'babysit',

  // VI - Close
  'vi-close-pipeline': 'prune',
  'deprecation-and-migration': 'prune',
  'documentation-and-adrs': 'prune',

  // Ad-hoc - Present
  'present-pr': 'present'
};

const GROUP_LABEL = {
  plan: 'Plan',
  build: 'Build',
  review: 'Review & PR',
  babysit: 'Babysit',
  prune: 'Prune',
  present: 'Present'
};

window.TAG_CONFIG = TAG_CONFIG;
window.GROUP = GROUP;
window.GROUP_LABEL = GROUP_LABEL;

let allSkills=[];

function fetchSkillsJson(){
  // works from / and /skills/ etc
  const tries=['./skills.json','../skills.json','skills.json'];
  return tries.reduce((p,url)=>p.catch(()=>fetch(url).then(r=>{if(!r.ok) throw new Error(url); return r.json()})), Promise.reject());
}

function copyCmd(triggerBtn){
  const el = document.getElementById('installCmd');
  const t = el ? el.textContent.trim() : 'npx skills add AI-Degen-69/issue-to-pr-skills';
  try {
    navigator.clipboard.writeText(t);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  const b = triggerBtn || document.querySelector('.cmd-btn') || document.querySelector('button[onclick*="copyCmd"]');
  const live = document.getElementById('copyLive') || document.getElementById('toast');
  if(b) {
    b.classList.add('copied');
    b.setAttribute('aria-label', 'Copied to clipboard!');
    setTimeout(() => {
      b.classList.remove('copied');
      b.setAttribute('aria-label', `Copy: ${t}`);
    }, 1600);
  }
  if(live) {
    live.textContent = 'Copied to clipboard';
    setTimeout(() => { live.textContent = ''; }, 1600);
  }
}
function setupMobileNav(){
  const btn=document.getElementById('menuBtn');
  const drawer=document.getElementById('mobileDrawer');
  if(!btn||!drawer) return;
  btn.addEventListener('click',()=>{
    const open=drawer.hasAttribute('hidden');
    if(open){ drawer.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); btn.setAttribute('aria-label','Close menu');}
    else { drawer.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-label','Open menu');}
  });
  drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{drawer.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false');}));
}

// Interactive Pipeline Carousel (entry → intake → 7 stations → ad-hoc)
let currentStationIndex = 0;
let isBubbleAnimating = false;

function initPipelineCarousel() {
  const track = document.getElementById('pipelineTrack');
  const dotsContainer = document.getElementById('pipelineCarouselDots');
  if (!track) return;

  // Render station cards in track
  track.innerHTML = STATIONS.map((s, idx) => {
    const g = GROUP[s.id] || 'plan';
    const cfg = TAG_CONFIG[g] || TAG_CONFIG.plan;
    return `
      <div 
        class="pipeline-card ${idx === 0 ? 'active-station' : ''}" 
        data-station-index="${idx}"
        onclick="setStation(${idx})"
        role="button"
        tabindex="0"
        aria-selected="${idx === 0 ? 'true' : 'false'}"
        aria-label="Station ${s.label}: ${s.title}"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setStation(${idx});}"
      >
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="h-6 w-6 rounded-full bg-white/10 text-white border border-white/20 grid place-items-center text-[10px] font-bold font-mono">
            ${s.label}
          </span>
          <span class="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${cfg.tagClass}">
            ${cfg.tag}
          </span>
        </div>
        <div class="font-mono text-xs font-semibold text-white truncate">/${s.id}</div>
        <div class="text-[11px] text-white/60 mt-1 line-clamp-1">${s.title}</div>
      </div>
    `;
  }).join('');

  // Render pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = STATIONS.map((s, idx) => `
      <button 
        type="button" 
        class="carousel-dot ${idx === 0 ? 'active' : ''}" 
        onclick="setStation(${idx})" 
        aria-label="Jump to station ${idx + 1}: ${s.title}"
        title="Station ${s.label}: ${s.title}"
      ></button>
    `).join('');
  }

  currentStationIndex = 0;
  // Position cards on next animation frame once rendered
  requestAnimationFrame(() => {
    updateCarouselPosition(0);
    renderChatBubbleContent(0);
  });

  // Keep centered on window resize
  window.addEventListener('resize', () => {
    updateCarouselPosition(currentStationIndex);
  });

  // Touch swipe support (Mobile & Tablet)
  setupCarouselTouchGestures();

  // Keyboard navigation on viewport
  const viewport = document.getElementById('pipelineCarouselViewport');
  if (viewport) {
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStation();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStation();
      }
    });
  }
}

function updateCarouselPosition(activeIndex) {
  const viewport = document.getElementById('pipelineCarouselViewport');
  const track = document.getElementById('pipelineTrack');
  if (!viewport || !track) return;
  const cards = track.querySelectorAll('.pipeline-card');
  if (!cards[activeIndex]) return;

  const activeCard = cards[activeIndex];
  const viewportWidth = viewport.offsetWidth;
  const cardLeft = activeCard.offsetLeft;
  const cardWidth = activeCard.offsetWidth;

  // Calculate exact translation to center activeCard in viewport
  const targetX = (viewportWidth / 2) - (cardLeft + cardWidth / 2);
  track.style.transform = `translateX(${targetX}px)`;

  // Update visual active classes
  cards.forEach((card, idx) => {
    const isActive = idx === activeIndex;
    card.classList.toggle('active-station', isActive);
    card.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update counter badge
  const counter = document.getElementById('carouselCounterBadge');
  if (counter) counter.textContent = `Station ${activeIndex + 1} of ${STATIONS.length}`;

  // Update dots
  const dots = document.querySelectorAll('#pipelineCarouselDots .carousel-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === activeIndex);
    dot.setAttribute('aria-current', idx === activeIndex ? 'true' : 'false');
  });
}

function renderChatBubbleContent(idx) {
  const bubble = document.getElementById('pipelineChatBubble');
  if (!bubble) return;
  const s = STATIONS[idx];
  const g = GROUP[s.id] || 'plan';
  const cfg = TAG_CONFIG[g] || TAG_CONFIG.plan;
  const numStr = String(idx + 1).padStart(2, '0');

  // Specific quality gate descriptions per station
  const GATES = {
    'pipeline-triage': 'Session pre-flight check: read-only analysis of git working tree & status. No code modifications until target station is locked.',
    'create-issue': 'Research-first gate: extracts concrete file paths with line numbers; captures open questions with explicit default assumptions before marking ready-for-agent.',
    'i-pick-issue': 'Mapping gate: maps the backlog by domain with a recommended order and one highlighted pick, then halts for the operator — never auto-selects silently.',
    'ii-plan-issue': 'Constraint gate: locks CONSTRAINTS.md (zero regressions rule) and breaks feature into atomic vertical slices in tasks/plan.md before any coding.',
    'iii-build-plan': 'Proof-before-next gate: strictly runs TDD per slice; requires passing unit tests or interactive browser verification before proceeding.',
    'iiib-iterate-after-build': 'Minimal diff fix gate: classifies human feedback (bug, dead button, CSS, or speed) and verifies against CONSTRAINTS.md.',
    'iv-review-build-and-pr': 'Multi-axis verification gate: automated test suites + visual proof + OCR delegation scan before generating the PR title & description.',
    'v-babysit-pr-and-merge': 'Autonomous CI gate: monitors workflow status with 5m→1m adaptive polling; resolves reviewer feedback & squash-merges on clean green.',
    'vi-close-pipeline': 'Merge-confirmed close gate: prunes scratch ONLY if the parent issue is verified closed AND zero inbound references remain; then updates PROGRESS.md and the handoff.',
    'present-pr': 'Zero-dependency showcase gate: builds a self-contained single-file HTML presentation with live visuals, try-it guide, and zero external CDN scripts.'
  };

  const gateText = GATES[s.id] || 'Narrow contract gate: verification evidence required at every station handoff.';

  bubble.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
      <div class="flex items-center flex-wrap gap-2">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30">
          Station ${numStr} · ${s.label}
        </span>
        <span class="px-2.5 py-0.5 rounded-md text-xs font-medium border ${cfg.tagClass}">
          ${cfg.tag}
        </span>
        <span class="font-mono text-xs text-amber-300/90 bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10">
          /${s.id}
        </span>
      </div>
      <div class="text-xs font-mono text-white/50">
        Step ${idx + 1} of ${STATIONS.length}
      </div>
    </div>

    <div class="mt-3.5">
      <h3 class="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>${s.title}</span>
      </h3>
      <p class="mt-1.5 text-sm sm:text-[15px] text-white/75 leading-relaxed">
        ${s.desc}
      </p>
    </div>

    <!-- Quality Gate Callout -->
    <div class="mt-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-xs text-white/70">
      <span class="text-amber-400 font-bold shrink-0">🛡️ Gate:</span>
      <span class="leading-relaxed">${gateText}</span>
    </div>

    <!-- Direct Action Links to Skills Page & Lifecycle -->
    <div class="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <a 
          href="./skills/#${s.id}" 
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 transition shadow-md shadow-orange-950/50"
          title="Open station ${s.id} on the skills page"
        >
          <span>Explore /${s.id} in Skills Page</span>
          <span class="text-base leading-none">→</span>
        </a>
        <a 
          href="#${s.id}" 
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
        >
          <span>Jump to Lifecycle Card ↓</span>
        </a>
      </div>
      <span class="text-[11px] font-mono text-white/40 hidden sm:inline">
        Deep links directly to /skills/#${s.id}
      </span>
    </div>
  `;
}

function setStation(newIndex) {
  if (newIndex < 0) newIndex = STATIONS.length - 1;
  if (newIndex >= STATIONS.length) newIndex = 0;
  if (newIndex === currentStationIndex && isBubbleAnimating) return;

  const bubble = document.getElementById('pipelineChatBubble');
  if (!bubble) {
    currentStationIndex = newIndex;
    updateCarouselPosition(newIndex);
    return;
  }

  isBubbleAnimating = true;

  // 1. Smooth scroll-rolling-up (closing) animation
  bubble.classList.remove('scroll-unrolling');
  bubble.classList.add('scroll-rolling-up');

  setTimeout(() => {
    currentStationIndex = newIndex;
    updateCarouselPosition(newIndex);
    renderChatBubbleContent(newIndex);

    // 2. Smooth scroll-unrolling (opening) animation
    bubble.classList.remove('scroll-rolling-up');
    bubble.classList.add('scroll-unrolling');

    setTimeout(() => {
      isBubbleAnimating = false;
    }, 400);
  }, 180);
}

function prevStation() {
  setStation(currentStationIndex - 1);
}

function nextStation() {
  setStation(currentStationIndex + 1);
}

// Touch swipe gestures
function setupCarouselTouchGestures() {
  const container = document.getElementById('pipelineCarouselViewport');
  if (!container) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!isSwiping || e.changedTouches.length === 0) return;
    isSwiping = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Detect dominant horizontal swipe gesture
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextStation(); // Swiped left -> advance next
      } else {
        prevStation(); // Swiped right -> go prev
      }
    }
  }, { passive: true });
}

// Global functions for inline onclick handlers
window.setStation = setStation;
window.prevStation = prevStation;
window.nextStation = nextStation;
window.initPipelineCarousel = initPipelineCarousel;

// diagram dots
function renderDiagram(){
  const g=document.getElementById('diagramStations');
  if(!g) return;
  const count=STATIONS.length;
  const start=60, end=1040, step=(end-start)/(count-1);
  let html='';
  STATIONS.forEach((s,i)=>{
    const x=start + i*step;
    const y=105;
    html+=`
      <g class="cursor-pointer" tabindex="0" role="button" aria-label="Station ${s.label}: ${s.id}" data-idx="${i}" onmouseenter="showStation(${i})" onclick="showStation(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showStation(${i})}" onfocus="showStation(${i})">
        <circle cx="${x}" cy="${y}" r="18" fill="#0b0f1e" stroke="rgba(124,58,237,.6)" stroke-width="2"/>
        <circle cx="${x}" cy="${y}" r="9" fill="url(#g1)" class="station-dot"/>
        <text x="${x}" y="${y+4}" text-anchor="middle" font-size="8" font-weight="700" fill="white">${s.label}</text>
        <text x="${x}" y="155" text-anchor="middle" font-size="10" font-family="JetBrains Mono" fill="rgba(255,255,255,.7)">${s.id.replace('iiib','iiib-').slice(0,18)}</text>
        <text x="${x}" y="172" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.45)">${s.title===s.id?'':''}</text>
      </g>
    `;
  });
  g.innerHTML=html;
}
function showStation(i){
  const s=STATIONS[i];
  const d=document.getElementById('stationDetail');
  if(!d) return;
  d.innerHTML=`<span class="font-mono text-violet-300">/${s.id}</span> — <span class="font-semibold text-white">${s.title}</span> — ${s.desc} <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.id}" target="_blank" class="underline decoration-violet-400">Open skill ↗</a>`;
}

// station cards
function renderStations(){
  const el=document.getElementById('stationCards');
  if(!el) return;
  el.innerHTML=STATIONS.map(s=>{
    const g = GROUP[s.id] || 'plan';
    const cfg = TAG_CONFIG[g] || TAG_CONFIG.plan;
    return `
    <div id="${s.id}" class="card rounded-2xl border ${cfg.stationCardClass} p-5 transition">
      <div class="flex items-center gap-2">
        <span class="min-w-7 h-7 px-1.5 rounded-full ${cfg.stationBadgeClass} grid place-items-center text-xs font-bold">${s.label}</span>
        <span class="font-mono text-sm font-semibold text-white">${s.id}</span>
        <span class="ml-auto text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${cfg.tagClass}">${cfg.tag}</span>
      </div>
      <p class="mt-3 text-sm leading-6 text-white/70">${s.desc}</p>
      <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.id}" target="_blank" class="mt-3 inline-flex text-xs font-semibold ${cfg.openLinkClass}">View SKILL.md ↗</a>
    </div>
  `;}).join('');
}

// catalog
async function loadSkills(){
  try{
    allSkills=await fetchSkillsJson();
  }catch{ allSkills=[]; }
  renderSkills();
  renderPreview();
}
let _debounceT=null;

let currentOrganizeMode = 'az'; // 'az' or 'pipeline'

const PIPELINE_STATIONS_ORDER = [
  { key: 'plan', label: 'Plan', stationNum: 'II', desc: 'Define & plan — issue research, stack detection, constraints, vertical task slices' },
  { key: 'build', label: 'Build', stationNum: 'III', desc: 'Build & iterate — test-driven development, UI engineering, fix loops' },
  { key: 'review', label: 'Review & PR', stationNum: 'IV', desc: 'Review & ship — verification gate, specialist review panel, PR creation' },
  { key: 'babysit', label: 'Babysit', stationNum: 'V', desc: 'Babysit & merge — automated reviews, CI status monitoring, squash merge' },
  { key: 'prune', label: 'Prune', stationNum: 'VI', desc: 'Prune & clean — deprecation, ADR documentation, closed issue scratch cleanup' },
  { key: 'present', label: 'Present', stationNum: 'VII', desc: 'Present & showcase — interactive visual showcase for completed PRs' }
];

function setOrganizeMode(mode){
  currentOrganizeMode = mode;
  updateOrganizeButtons(mode);
  renderSkills();
}
window.setOrganizeMode = setOrganizeMode;

function updateOrganizeButtons(activeMode){
  const btnAz = document.getElementById('btnOrgAz');
  const btnPipe = document.getElementById('btnOrgPipeline');
  if(btnAz && btnPipe){
    if(activeMode === 'az'){
      btnAz.className = 'px-3 py-1.5 rounded-full font-medium transition bg-violet-600 text-white shadow-sm';
      btnPipe.className = 'px-3 py-1.5 rounded-full font-medium transition text-white/70 hover:text-white';
    } else {
      btnAz.className = 'px-3 py-1.5 rounded-full font-medium transition text-white/70 hover:text-white';
      btnPipe.className = 'px-3 py-1.5 rounded-full font-medium transition bg-violet-600 text-white shadow-sm';
    }
  }
}
window.updateOrganizeButtons = updateOrganizeButtons;

function renderSkillCardHtml(s){
  const g = GROUP[s.name] || 'plan';
  const cfg = TAG_CONFIG[g] || TAG_CONFIG.plan;
  const isPipeline = STATIONS.some(x => x.id === s.name);

  const cardClasses = isPipeline
    ? `card rounded-2xl border ${cfg.stationCardClass} p-5 text-left transition block relative`
    : `card rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left hover:bg-white/[.07] hover:border-white/20 transition block`;

  const stationBadge = isPipeline
    ? `<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.stationBadgeClass}">Station</span>`
    : '';

  const linkColor = isPipeline ? cfg.openLinkClass : 'text-violet-300 hover:text-violet-200';

  return `
  <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.name}" target="_blank" class="${cardClasses}">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${cfg.tagClass}">${cfg.tag}</span>
      ${stationBadge}
    </div>
    <div class="mt-3 font-mono text-[13px] font-semibold text-white">${s.name}</div>
    <div class="mt-1 text-sm leading-6 text-white/60 line-clamp-3">${s.desc}</div>
    <div class="mt-3 text-xs font-semibold ${linkColor}">Open SKILL.md →</div>
  </a>`;
}

function setStationFilter(f){
  const filterEl=document.getElementById('filter');
  if(filterEl){
    filterEl.value = f;
  }
  updateStationFilterChips(f);
  renderSkills();
}
window.setStationFilter = setStationFilter;

function updateStationFilterChips(activeVal){
  document.querySelectorAll('.station-filter-btn').forEach(btn => {
    const filterKey = btn.dataset.filter || 'all';
    if(filterKey === activeVal){
      btn.classList.add('bg-violet-600', 'border-violet-500', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white/5', 'text-white/70');
    } else {
      btn.classList.remove('bg-violet-600', 'border-violet-500', 'text-white', 'shadow-sm');
      btn.classList.add('bg-white/5', 'text-white/70');
    }
  });
}
window.updateStationFilterChips = updateStationFilterChips;

function renderSkills(){
  const searchEl=document.getElementById('search');
  const filterEl=document.getElementById('filter');
  if(!searchEl || !filterEl) return;
  const q=(searchEl.value||'').toLowerCase();
  const f=filterEl.value;
  let list=allSkills;
  
  if(f === 'stations') {
    list = list.filter(s => STATIONS.some(x => x.id === s.name));
  } else if(f !== 'all') {
    list = list.filter(s => (GROUP[s.name] || 'plan') === f);
  }

  if(q) {
    list = list.filter(s => {
      const g = GROUP[s.name] || 'plan';
      const cfg = TAG_CONFIG[g] || TAG_CONFIG.plan;
      return s.name.includes(q) || s.desc.toLowerCase().includes(q) || cfg.tag.toLowerCase().includes(q);
    });
  }

  const el=document.getElementById('skillGrid');
  const clearBtn=document.getElementById('clearSearch');
  if(clearBtn){ if(q) clearBtn.classList.remove('hidden'); else clearBtn.classList.add('hidden'); }
  if(!el) return;

  if(list.length===0){
    const qRaw=document.getElementById('search').value;
    el.className = "mt-8";
    el.innerHTML=`<div class="col-span-full rounded-2xl border border-white/10 bg-white/[.04] p-8 text-center">
      <div class="h-10 w-10 mx-auto rounded-full bg-white/5 grid place-items-center text-base text-white/40">🔍</div>
      <div class="mt-3 text-base font-semibold text-white">No skills match “${qRaw}”</div>
      <div class="mt-2 text-sm text-white/60">Try <button onclick="document.getElementById('search').value='';renderSkills()" class="underline decoration-violet-400 text-white">clear search</button> or filter by station:</div>
      <div class="inline-flex gap-2 flex-wrap justify-center mt-3">
        <button onclick="setStationFilter('plan')" class="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-medium">Plan</button>
        <button onclick="setStationFilter('build')" class="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-medium">Build</button>
        <button onclick="setStationFilter('review')" class="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-xs font-medium">Review & PR</button>
        <button onclick="setStationFilter('babysit')" class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-medium">Babysit</button>
        <button onclick="setStationFilter('prune')" class="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-medium">Prune</button>
        <button onclick="setStationFilter('present')" class="px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-medium">Present</button>
      </div>
    </div>`;
  } else if(currentOrganizeMode === 'pipeline'){
    el.className = "mt-8 space-y-12";
    let sectionsHtml = '';

    PIPELINE_STATIONS_ORDER.forEach(p => {
      const groupSkills = list.filter(s => (GROUP[s.name] || 'plan') === p.key);
      if(groupSkills.length === 0) return;

      // Sort skills inside group A-Z by skill name
      groupSkills.sort((a,b) => a.name.localeCompare(b.name));

      const cfg = TAG_CONFIG[p.key] || TAG_CONFIG.plan;

      sectionsHtml += `
      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div class="flex items-center gap-3">
            <span class="min-w-7 h-7 px-2 rounded-full ${cfg.stationBadgeClass} grid place-items-center text-xs font-bold">${p.stationNum}</span>
            <div>
              <div class="flex items-center gap-2.5">
                <h3 class="text-lg font-bold text-white tracking-tight">${p.label}</h3>
                <span class="text-xs px-2.5 py-0.5 rounded-full border ${cfg.tagClass} font-medium">${groupSkills.length} skill${groupSkills.length > 1 ? 's' : ''} (A-Z)</span>
              </div>
              <p class="text-xs text-white/50 mt-0.5 hidden sm:block">${p.desc}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <span class="font-mono text-white/40">Station ${p.stationNum}</span>
            <button type="button" onclick="setStationFilter('${p.key}')" class="text-white/60 hover:text-white underline decoration-white/20 transition">Focus station</button>
          </div>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${groupSkills.map(renderSkillCardHtml).join('')}
        </div>
      </section>`;
    });

    el.innerHTML = sectionsHtml;
  } else {
    // A-Z flat list by skill name
    const sortedList = [...list].sort((a,b) => a.name.localeCompare(b.name));
    el.className = "mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4";
    el.innerHTML = sortedList.map(renderSkillCardHtml).join('');
  }

  const sc2=document.getElementById('skillCount');
  if(sc2) {
    const modeDesc = currentOrganizeMode === 'pipeline' ? 'Grouped in pipeline order (A-Z per station)' : 'A-Z by skill name';
    sc2.textContent=`Showing ${list.length} of ${allSkills.length} skills · ${modeDesc}`;
  }
}
function debouncedRender(){ clearTimeout(_debounceT); _debounceT=setTimeout(renderSkills,180); }
function renderPreview(){
  const el=document.getElementById('skillGridPreview');
  if(!el || !allSkills.length) return;
  const preview=allSkills.slice(0,6);
  el.innerHTML=preview.map(s=>{
    const g=GROUP[s.name]||'plan';
    const cfg=TAG_CONFIG[g]||TAG_CONFIG.plan;
    const isPipeline=STATIONS.some(x=>x.id===s.name);
    const cardClasses = isPipeline
      ? `card rounded-2xl border ${cfg.stationCardClass} p-5 block transition`
      : `card rounded-2xl border border-white/10 bg-white/[.04] p-5 block hover:bg-white/[.07] hover:border-white/20 transition`;

    return `<a href="./skills/" class="${cardClasses}">
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${cfg.tagClass}">${cfg.tag}</span>
        ${isPipeline ? `<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.stationBadgeClass}">Station</span>` : ''}
      </div>
      <div class="mt-2 font-mono text-sm font-semibold text-white">${s.name}</div>
      <div class="mt-1 text-sm text-white/60 line-clamp-2">${s.desc}</div>
    </a>`;
  }).join('');
}

// agents
const AGENTS=[
  ['code-reviewer','Senior Staff Eng','Five-axis review: would a staff engineer approve?',true],
  ['security-reviewer','Security Eng','OWASP, auth, secrets, threat modeling',true],
  ['typescript-reviewer','TS/JS','Types, async, Node security',true],
  ['react-reviewer','React','Hooks, a11y, RSC, render perf',true],
  ['python-reviewer','Python','asyncio, typing, PEP 8',true],
  ['go-reviewer','Go','Goroutines, errors, interfaces',false],
  ['rust-reviewer','Rust','Lifetimes, unsafe, borrowing',false],
  ['database-reviewer','Data','N+1, indexes, migrations',true],
  ['silent-failure-hunter','Reliability','Swallowed errors, empty catches',true],
  ['tdd-guide','TDD','Write-tests-first enforcement',false],
  ['build-error-resolver','Build','Generic build failures',false],
  ['react-build-resolver','React Build','React build failures',false],
  ['go-build-resolver','Go Build','Go build failures',false],
  ['rust-build-resolver','Rust Build','Rust build failures',false],
  ['refactor-cleaner','Cleanup','Dead code with proof',false],
  ['type-design-analyzer','Design','Interfaces & domain model',true],
  ['code-explorer','Explorer','Execution-path tracing',false],
  ['doc-updater','Docs','Docs drift after changes',false],
];

const AGENT_SUMMARIES = {
  'code-reviewer': 'Evaluates overall code health, architectural soundness, idiomatic patterns, readability, and senior-engineer approval standards.',
  'security-reviewer': 'Flags secrets, auth bypasses, injection attacks, insecure deserialization, SSRF, and OWASP Top 10 vulnerabilities.',
  'typescript-reviewer': 'Enforces strict type safety, async/await correctness, error propagation, null-safety, and idiomatic Node/TS patterns.',
  'react-reviewer': 'Audits React hook dependencies, render lifecycle performance, component boundaries, state collocation, and accessibility (a11y).',
  'python-reviewer': 'Enforces PEP 8 style, strict typing with mypy/pyright, async loop safety, exception hierarchies, and clean Pythonic architecture.',
  'go-reviewer': 'Audits goroutine lifecycles, race conditions, sync primitives, channel deadlocks, and idiomatic Go error handling.',
  'rust-reviewer': 'Ensures memory safety, strict lifetime correctness, borrow checker compliance, minimal allocations, and idiomatic Rust.',
  'database-reviewer': 'Audits slow queries, missing indexes, transaction boundaries, migration safety, and Postgres Row-Level Security (RLS).',
  'silent-failure-hunter': 'Finds swallowed errors, empty catch blocks, bad default fallbacks, and unlogged exceptions that hide production bugs.',
  'tdd-guide': 'Enforces write-tests-first methodology, verifies red-green-refactor cadence, and ensures thorough boundary condition coverage.',
  'build-error-resolver': 'Diagnoses and fixes compilation errors, broken type checks, conflicting package versions, and misconfigured toolchains.',
  'react-build-resolver': 'Resolves JSX/TSX compilation errors, bundler misconfigurations (Vite, Next.js), invalid imports, and hydration mismatches.',
  'go-build-resolver': 'Diagnoses Go compiler failures, package import loops, missing build tags, and cgo linking inconsistencies.',
  'rust-build-resolver': 'Resolves cargo build failures, unresolved crate dependencies, feature flag conflicts, and complex lifetime compiler errors.',
  'refactor-cleaner': 'Identifies dead code, redundant abstractions, and unused exports, providing proofs that deletions preserve behavior.',
  'type-design-analyzer': 'Evaluates domain type systems to make illegal states unrepresentable, ensuring strong encapsulation and clear invariants.',
  'code-explorer': 'Traces complex execution paths, call graphs, and dependency trees across modules to map out the blast radius of changes.',
  'doc-updater': 'Prevents documentation drift by detecting out-of-sync READMEs, missing JSDoc/docstrings, and outdated API specifications.',
};
window.AGENT_SUMMARIES = AGENT_SUMMARIES;

function getAgentIconHtml(id, role){
  let iconDiv = '';
  switch(id){
    case 'typescript-reviewer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-[#3178C6]/20 border border-[#3178C6]/40 text-[#60A5FA] grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(49,120,198,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.5 0h21A1.5 1.5 0 0 1 24 1.5v21a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 22.5v-21A1.5 1.5 0 0 1 1.5 0zm10.72 13.92h-2.9v7.07H6.77V13.92H3.87v-2.47h8.35v2.47zm3.17 4.96c.64.36 1.48.58 2.37.58 1.42 0 2.24-.69 2.24-1.69 0-.96-.65-1.46-2.02-1.99-1.78-.68-2.89-1.66-2.89-3.23 0-1.91 1.54-3.3 3.93-3.3 1.25 0 2.24.31 2.83.67l-.73 2.19c-.48-.28-1.22-.5-2.08-.5-1.2 0-1.84.6-1.84 1.43 0 .86.67 1.3 2.14 1.88 1.93.75 2.79 1.76 2.79 3.37 0 2.13-1.64 3.42-4.33 3.42-1.39 0-2.61-.41-3.26-.82l.81-2.21z"/></svg>
      </div>`;
      break;
    case 'react-reviewer':
    case 'react-build-resolver':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]" title="${role} Specialist">
        <svg class="w-5 h-5" viewBox="-11.5 -10.23 23 20.46" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><circle cx="0" cy="0" r="2.05" fill="currentColor"/><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></svg>
      </div>`;
      break;
    case 'python-reviewer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.006 2.753h5.814v.826H3.9S0 5.78 0 11.966c0 6.183 3.407 5.96 3.407 5.96h2.036v-2.863s-.11-3.414 3.355-3.414h5.786s3.243.054 3.243-3.14V3.14S18.358 0 11.914 0zm-3.21 1.84a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14zm3.382 22.16c6.095 0 5.714-2.656 5.714-2.656l-.006-2.753H11.98v-.826h8.12s3.9.455 3.9-5.731c0-6.183-3.407-5.96-3.407-5.96h-2.036v2.863s.11 3.414-3.355 3.414H9.416s-3.243-.054-3.243 3.14v5.367s-.532 3.14 5.913 3.14zm3.21-1.84a1.07 1.07 0 1 1 0-2.14 1.07 1.07 0 0 1 0 2.14z"/></svg>
      </div>`;
      break;
    case 'go-reviewer':
    case 'go-build-resolver':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(14,165,233,0.25)]" title="${role} Specialist">
        <svg class="w-5 h-4" viewBox="0 0 64 26" fill="currentColor" aria-hidden="true"><path d="M15.5 13.1c0-4.7 3.3-8.3 8.3-8.3 4.2 0 7.2 2.7 7.8 6.4h-3.9c-.5-1.9-2-3.1-3.9-3.1-2.7 0-4.5 2.1-4.5 5 0 2.9 1.8 5 4.5 5 2.1 0 3.6-1.3 3.9-3.2h-4.3v-3.1h8.1v9.2c-1.8 2.2-4.5 3.5-7.7 3.5-5 0-8.3-3.7-8.3-8.4zm23.6 0c0-4.7 3.6-8.3 8.5-8.3 4.9 0 8.5 3.6 8.5 8.3s-3.6 8.4-8.5 8.4c-4.9 0-8.5-3.7-8.5-8.4zm13.1 0c0-2.8-2-5-4.6-5s-4.6 2.2-4.6 5 2 5.1 4.6 5.1 4.6-2.3 4.6-5.1zM1.2 8.7h8.8v2.7H1.2V8.7zm2.4 4.4h6.4v2.7H3.6v-2.7zm2.2 4.4h4.2v2.7H5.8v-2.7z"/></svg>
      </div>`;
      break;
    case 'rust-reviewer':
    case 'rust-build-resolver':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-orange-500/15 border border-orange-400/40 text-orange-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M31.7 14.5l-2.4-.6c-.2-.7-.4-1.4-.7-2l1.7-1.8c.2-.2.2-.6 0-.8l-2.3-2.3c-.2-.2-.6-.2-.8 0l-1.8 1.7c-.6-.3-1.3-.5-2-.7l-.6-2.4c-.1-.3-.3-.5-.6-.5h-3.2c-.3 0-.5.2-.6.5l-.6 2.4c-.7.2-1.4.4-2 .7l-1.8-1.7c-.2-.2-.6-.2-.8 0l-2.3 2.3c-.2.2-.2.6 0 .8l1.7 1.8c-.3.6-.5 1.3-.7 2l-2.4.6c-.3.1-.5.3-.5.6v3.2c0 .3.2.5.5.6l2.4.6c.2.7.4 1.4.7 2l-1.7 1.8c-.2.2-.2.6 0 .8l2.3 2.3c.2.2.6.2.8 0l1.8-1.7c.6.3 1.3.5 2 .7l.6 2.4c.1.3.3.5.6.5h3.2c.3 0 .5-.2.6-.5l.6-2.4c.7-.2 1.4-.4 2-.7l1.8 1.7c.2.2.6.2.8 0l2.3-2.3c.2-.2.2-.6 0-.8l-1.7-1.8c.3-.6.5-1.3.7-2l2.4-.6c.3-.1.5-.3.5-.6v-3.2c0-.3-.2-.5-.5-.6zM16 22.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5zm-2.8-10.2h3.5c1.4 0 2.3.8 2.3 2 0 .9-.6 1.7-1.6 1.9l1.8 3.1h-1.9l-1.6-2.8h-1.1v2.8h-1.4v-7zm1.4 3h1.8c.6 0 1-.3 1-.8 0-.6-.4-.8-1-.8h-1.8v1.6z"/></svg>
      </div>`;
      break;
    case 'database-reviewer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      </div>`;
      break;
    case 'code-reviewer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-violet-500/15 border border-violet-400/40 text-violet-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
      </div>`;
      break;
    case 'security-reviewer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>`;
      break;
    case 'silent-failure-hunter':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-red-500/15 border border-red-400/40 text-red-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>
      </div>`;
      break;
    case 'tdd-guide':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="m5.52 16 12.96 0"/></svg>
      </div>`;
      break;
    case 'build-error-resolver':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>`;
      break;
    case 'refactor-cleaner':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-teal-500/15 border border-teal-400/40 text-teal-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(20,184,166,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
      </div>`;
      break;
    case 'type-design-analyzer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/40 text-fuchsia-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(217,70,239,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.12 6.4-6.05-4.06a4.95 4.95 0 0 0-5.14 0L3.88 6.4a4.95 4.95 0 0 0-2.38 4.25v7.7a4.95 4.95 0 0 0 2.38 4.25l6.05 4.06a4.95 4.95 0 0 0 5.14 0l6.05-4.06a4.95 4.95 0 0 0 2.38-4.25v-7.7a4.95 4.95 0 0 0-2.38-4.25Z"/><path d="M12 22V12"/><path d="m3.29 7 8.71 5 8.71-5"/></svg>
      </div>`;
      break;
    case 'code-explorer':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(14,165,233,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
      </div>`;
      break;
    case 'doc-updater':
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 grid place-items-center transition-transform group-hover/icon:scale-105 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.25)]" title="${role} Specialist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/><path d="M6 14h6"/></svg>
      </div>`;
      break;
    default:
      iconDiv = `<div class="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 grid place-items-center text-xs font-bold transition-transform group-hover/icon:scale-105 shrink-0">${(role||'').slice(0,2).toUpperCase()}</div>`;
      break;
  }

  const summary = AGENT_SUMMARIES[id] || `${role} specialist reviewer for code quality and pipeline verification.`;
  return `<div class="agent-icon-trigger group/icon relative inline-block shrink-0" tabindex="0" role="region" aria-label="${id} — ${role}: ${summary}">
    ${iconDiv}
    <div class="agent-icon-tooltip" role="tooltip">
      <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
        <span class="font-mono text-xs font-bold text-white tracking-wide truncate">${id}</span>
        <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-violet-300 border border-white/10 shrink-0">${role}</span>
      </div>
      <p class="text-xs text-white/80 leading-relaxed font-sans">${summary}</p>
      <div class="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
        <span>Specialist Agent</span>
        <span class="text-violet-400 group-hover:text-violet-300">Click card for guide →</span>
      </div>
      <div class="agent-tooltip-arrow"></div>
    </div>
  </div>`;
}
window.getAgentIconHtml = getAgentIconHtml;

let _agentDebounceT;

function filterAgents(forcedQuery){
  const input = document.getElementById('agentSearch');
  if(forcedQuery !== undefined && input) input.value = forcedQuery;
  const rawQ = input ? input.value : '';
  const q = rawQ.trim().toLowerCase();

  const clearBtn = document.getElementById('clearAgentSearch');
  if(clearBtn) {
    if(q) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  // Update active style on chips
  document.querySelectorAll('.agent-chip').forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    const isActive = (!q && text === 'all') || (q && (
      q === text || 
      (text === 'typescript' && (q === 'ts' || q === 'ts/js' || q === 'typescript' || q === 'type')) ||
      (text === 'data' && (q === 'db' || q === 'sql' || q === 'database'))
    ));
    if(isActive) {
      btn.classList.add('bg-violet-600', 'border-violet-500', 'text-white');
      btn.classList.remove('bg-white/5', 'border-white/10', 'text-white/70');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('bg-violet-600', 'border-violet-500', 'text-white');
      btn.classList.add('bg-white/5', 'border-white/10', 'text-white/70');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  const mk = (id, role, desc, hasPage, basePrefix = './agents/', index = 0) => {
    const href = hasPage ? `${basePrefix}${id}/` : `https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/agents/${id}.md`;
    const target = hasPage ? '' : ' target="_blank"';
    const iconHtml = getAgentIconHtml(id, role);
    const delay = Math.min(index * 30, 240);
    return `<a href="${href}"${target} style="animation-delay: ${delay}ms;" class="group agent-card rounded-2xl border border-white/10 bg-white/[.04] p-5 block hover:bg-white/[.07] hover:border-white/20 transition">
      ${iconHtml}
      <div class="mt-3 font-mono text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">${id}</div>
      <div class="text-xs text-white/50">${role}</div>
      <div class="mt-1 text-sm text-white/60 leading-5">${desc}</div>
    </a>`;
  };

  const matches = AGENTS.filter(([id, role, desc]) => {
    if(!q) return true;
    const idL = id.toLowerCase();
    const roleL = role.toLowerCase();
    const descL = desc.toLowerCase();
    if (q === 'ts' || q === 'ts/js' || q === 'typescript') {
      return idL.includes('typescript') || roleL.includes('typescript') || descL.includes('type');
    }
    if (q === 'js' || q === 'javascript') {
      return idL.includes('typescript') || idL.includes('react') || roleL.includes('react') || roleL.includes('typescript');
    }
    if (q === 'db' || q === 'sql' || q === 'database') {
      return idL.includes('database') || roleL.includes('data') || descL.includes('queries');
    }
    if (q === 'test' || q === 'testing' || q === 'tdd') {
      return idL.includes('tdd') || roleL.includes('testing') || descL.includes('tests');
    }
    return idL.includes(q) || roleL.includes(q) || descL.includes(q);
  });

  const countEl = document.getElementById('agentSearchCount');
  const gp = document.getElementById('agentGridPreview');
  if(gp) {
    if(!q) {
      gp.innerHTML = AGENTS.slice(0, 4).map(([id, role, desc, hasPage], idx) => mk(id, role, desc, hasPage, './agents/', idx)).join('');
      if(countEl) countEl.textContent = 'Showing 4 of 18 agents';
    } else if(matches.length === 0) {
      gp.innerHTML = `
        <div class="col-span-full rounded-2xl border border-white/10 bg-white/[.03] p-8 text-center" style="animation: agentFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;">
          <div class="h-10 w-10 mx-auto rounded-full bg-white/5 grid place-items-center text-base text-white/40">🔍</div>
          <div class="mt-3 text-sm font-semibold text-white">No agents match “${rawQ}”</div>
          <p class="mt-1 text-xs text-white/50 max-w-sm mx-auto">Try searching for roles like <button type="button" onclick="setAgentFilter('Security')" class="text-violet-300 underline">Security</button>, <button type="button" onclick="setAgentFilter('React')" class="text-violet-300 underline">React</button>, or <button type="button" onclick="setAgentFilter('Data')" class="text-violet-300 underline">Data</button>.</p>
          <button type="button" onclick="clearAgentSearch()" class="mt-4 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition">Clear filter</button>
        </div>
      `;
      if(countEl) countEl.textContent = '0 agents match';
    } else {
      gp.innerHTML = matches.map(([id, role, desc, hasPage], idx) => mk(id, role, desc, hasPage, './agents/', idx)).join('');
      if(countEl) countEl.textContent = `Showing ${matches.length} of ${AGENTS.length} agents`;
    }
  }

  const g = document.getElementById('agentGrid');
  if(g) {
    if(matches.length === 0) {
      g.innerHTML = `
        <div class="col-span-full rounded-2xl border border-white/10 bg-white/[.03] p-8 text-center" style="animation: agentFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;">
          <div class="h-10 w-10 mx-auto rounded-full bg-white/5 grid place-items-center text-base text-white/40">🔍</div>
          <div class="mt-3 text-sm font-semibold text-white">No agents match “${rawQ}”</div>
          <button type="button" onclick="clearAgentSearch()" class="mt-4 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition">Clear filter</button>
        </div>
      `;
    } else {
      g.innerHTML = matches.map(([id, role, desc, hasPage], idx) => mk(id, role, desc, hasPage, './', idx)).join('');
    }
    const ac = document.getElementById('agentCount');
    if(ac) ac.textContent = `${matches.length} of ${AGENTS.length} agents`;
  }
}

function setAgentFilter(term){
  const input = document.getElementById('agentSearch');
  if(input) {
    if(input.value.trim().toLowerCase() === term.trim().toLowerCase()) {
      input.value = '';
    } else {
      input.value = term;
    }
    input.focus();
  }
  filterAgents();
}

function clearAgentSearch(){
  const input = document.getElementById('agentSearch');
  if(input) {
    input.value = '';
    input.focus();
  }
  filterAgents('');
}

function debouncedAgentFilter(){
  clearTimeout(_agentDebounceT);
  _agentDebounceT = setTimeout(() => filterAgents(), 120);
}

function renderAgents(){
  filterAgents('');
}

function renderMobileDiagram(){
  const el=document.getElementById('diagramMobile');
  if(!el) return;
  el.innerHTML=STATIONS.map((s,i)=>`
    <button onclick="showStation(${i});document.getElementById('stationDetail').scrollIntoView({behavior:'smooth',block:'nearest'})" class="w-full text-left flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 hover:bg-white/[.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
      <span class="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 grid place-items-center text-xs font-bold shrink-0">${s.label}</span>
      <span class="font-mono text-sm">${s.id}</span>
      <span class="ml-auto text-violet-300 text-xs">→</span>
    </button>
  `).join('');
}
function setupReveal(){
  const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in'); obs.unobserve(e.target);}})}, {threshold:0.15});
  document.querySelectorAll('#stationCards > div, #skillGrid a, #skillGridPreview > a, #agentGrid > a, #agentGridPreview > a, .reveal').forEach(el=>{el.classList.add('reveal'); obs.observe(el);});
}
document.addEventListener('DOMContentLoaded',()=>{
  initPipelineCarousel(); renderDiagram(); renderMobileDiagram(); renderStations(); renderAgents(); loadSkills();
  showStation(1);
  setupMobileNav();
  document.getElementById('search')?.addEventListener('input', debouncedRender);
  document.getElementById('clearSearch')?.addEventListener('click',()=>{document.getElementById('search').value=''; renderSkills(); document.getElementById('search').focus();});
  document.getElementById('filter')?.addEventListener('change', renderSkills);
  document.getElementById('agentSearch')?.addEventListener('input', debouncedAgentFilter);
  document.getElementById('agentSearch')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearAgentSearch();
  });
  document.getElementById('clearAgentSearch')?.addEventListener('click', clearAgentSearch);
  setTimeout(setupReveal,300);
});
