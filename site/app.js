// Site logic — pipeline + catalog
const STATIONS = [
  {id:'pipeline-triage', label:'Entry', title:'pipeline-triage', desc:'Dirty repo? Open PR? Unclear intent? Read-only triage inspects git state and routes to the right station. One router, max one handoff.', color:'slate'},
  {id:'x-workflow-issue', label:'X', title:'x-workflow-issue', desc:'Discovery & orchestrator. No args: backlog map grouped by domain with a highlighted pick. With issue: locks execution mode (step-by-step or full II→VII) and drives the stations.', color:'violet'},
  {id:'i-create-issue', label:'I', title:'i-create-issue', desc:'Raw idea → researched GitHub issue labeled ready-for-agent. Researches repo first (real paths with line numbers), captures open questions with a default assumption.', color:'violet'},
  {id:'ii-plan-issue', label:'II', title:'ii-plan-issue', desc:'Define & plan. Fetches issue, right-sizes (Tiny→Large), detects stack, locks CONSTRAINTS.md (zero regressions), writes tasks/plan.md as atomic vertical slices.', color:'cyan'},
  {id:'iii-build-plan', label:'III', title:'iii-build-plan', desc:'Build. TDD per task, type-aware (frontend/TDD/debug), atomic commits, code simplification. Never pushes. Ends with two paths: all good → IV, corrections → IIIB.', color:'emerald'},
  {id:'iiib-iterate-after-build', label:'IIIB', title:'iiib-iterate-after-build', desc:'Human feedback fix loop. Classifies each free-text correction (bug/dead button/UI/slow/security), routes to the right specialist skill, fixes minimally, local only.', color:'amber'},
  {id:'iv-review-build-and-pr', label:'IV', title:'iv-review-build-and-pr', desc:'Review & ship. Proof-before-review gate (tests or live browser) → OCR delegation scan → diff-matched specialist reviewers + Spec axis → push, PR, @coderabbitai with ack classification.', color:'fuchsia'},
  {id:'v-babysit-pr-and-merge', label:'V', title:'v-babysit-pr-and-merge', desc:'Babysit & merge. Consumes IV’s trigger status, 5m→1m countdown, one focused review round (reuse-first on rate-limit), triages comments, squash-merges green, syncs base.', color:'fuchsia'},
  {id:'vi-prune-artifacts', label:'VI', title:'vi-prune-artifacts', desc:'Prune. Deletes only per-issue scratch whose issue is CLOSED and unreferenced. Showcases, research, ADRs, and active plans are untouchable.', color:'slate'},
  {id:'vii-present-pr', label:'VII', title:'vii-present-pr', desc:'Present. One standalone HTML showcase (inline CSS+vanilla JS, no CDN) — one centerpiece visual picked for this story, customer-simple words, try-it guide. Never the same twice.', color:'cyan'},
];

const GROUP = {
  'pipeline-triage':'pipeline','x-workflow-issue':'pipeline','i-create-issue':'pipeline','ii-plan-issue':'pipeline','iii-build-plan':'pipeline','iiib-iterate-after-build':'pipeline','iv-review-build-and-pr':'pipeline','v-babysit-pr-and-merge':'pipeline','vi-prune-artifacts':'pipeline','vii-present-pr':'pipeline',
  'test-driven-development':'build','incremental-implementation':'build','source-driven-development':'build','doubt-driven-development':'build','context-engineering':'build','planning-and-task-breakdown':'build','using-agent-skills':'build',
  'interview-me':'define','idea-refine':'define','spec-driven-development':'define','constraint-driven-development':'define',
  'browser-testing-with-devtools':'verify','debugging-and-error-recovery':'verify','diagnosing-bugs':'verify','verification-before-completion':'verify','click-path-audit':'verify',
  'code-review-and-quality':'review','code-simplification':'review','security-and-hardening':'review','performance-optimization':'review','documentation-and-adrs':'review','extract-design-system':'review',
  'git-workflow-and-versioning':'ship','ci-cd-and-automation':'ship','deprecation-and-migration':'ship','observability-and-instrumentation':'ship','shipping-and-launch':'ship',
  'frontend-ui-engineering':'frontend','tailwind-design-system':'frontend','web-design-guidelines':'frontend','vercel-react-best-practices':'frontend','vercel-composition-patterns':'frontend',
  'api-and-interface-design':'api'
};

const GROUP_LABEL = {pipeline:'Pipeline (10)', build:'Build', define:'Define', verify:'Verify', review:'Review', ship:'Ship', frontend:'Frontend', api:'API'};

let allSkills=[];

function fetchSkillsJson(){
  // works from / and /skills/ etc
  const tries=['./skills.json','../skills.json','skills.json'];
  return tries.reduce((p,url)=>p.catch(()=>fetch(url).then(r=>{if(!r.ok) throw new Error(url); return r.json()})), Promise.reject());
}

function copyCmd(){
  const t=document.getElementById('installCmd').textContent;
  navigator.clipboard.writeText(t);
  const b=document.querySelector('button[onclick="copyCmd()"]');
  const live=document.getElementById('copyLive');
  const old=b.textContent; b.textContent='Copied!'; if(live) live.textContent='Copied to clipboard'; setTimeout(()=>{b.textContent=old; if(live) live.textContent='';},1400);
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

// mini pipeline top
function renderMini(){
  const el=document.getElementById('miniPipeline');
  el.innerHTML=STATIONS.map(s=>`
    <a href="#${s.id}" class="snap-start shrink-0 rounded-2xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs hover:bg-white/10 flex items-center gap-2">
      <span class="h-6 w-6 rounded-full bg-violet-600 grid place-items-center text-[10px] font-bold">${s.label}</span>
      <span class="font-mono">${s.id}</span>
    </a>
  `).join('');
}

// diagram dots
function renderDiagram(){
  const g=document.getElementById('diagramStations');
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
  document.getElementById('stationDetail').innerHTML=`<span class="font-mono text-violet-300">/${s.id}</span> — <span class="font-semibold text-white">${s.title}</span> — ${s.desc} <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.id}" target="_blank" class="underline decoration-violet-400">Open skill ↗</a>`;
}

// station cards
function renderStations(){
  const el=document.getElementById('stationCards');
  el.innerHTML=STATIONS.map(s=>`
    <div id="${s.id}" class="card rounded-2xl border border-white/10 bg-white/[.04] p-5 transition">
      <div class="flex items-center gap-2">
        <span class="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 grid place-items-center text-xs font-bold">${s.label}</span>
        <span class="font-mono text-sm">${s.id}</span>
        <span class="ml-auto text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">/${s.id}</span>
      </div>
      <p class="mt-3 text-sm leading-6 text-white/70">${s.desc}</p>
      <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.id}" target="_blank" class="mt-3 inline-flex text-xs font-semibold text-violet-300 hover:text-violet-200">View SKILL.md ↗</a>
    </div>
  `).join('');
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
function renderSkills(){
  const q=(document.getElementById('search').value||'').toLowerCase();
  const f=document.getElementById('filter').value;
  let list=allSkills;
  if(f!=='all') list=list.filter(s=> (GROUP[s.name]||'other')===f);
  if(q) list=list.filter(s=> s.name.includes(q) || s.desc.toLowerCase().includes(q));
  const el=document.getElementById('skillGrid');
  const clearBtn=document.getElementById('clearSearch');
  if(clearBtn){ if(q) clearBtn.classList.remove('hidden'); else clearBtn.classList.add('hidden'); }
  if(list.length===0){
    const qRaw=document.getElementById('search').value;
    el.innerHTML=`<div class="col-span-full rounded-2xl border border-white/10 bg-white/[.04] p-6 text-center">
      <div class="text-sm font-semibold">No skills match “${qRaw}”</div>
      <div class="mt-1 text-sm text-white/60">Try <button onclick="document.getElementById('search').value='';renderSkills()" class="underline decoration-violet-400">clear</button> or pills: <span class="inline-flex gap-1 flex-wrap justify-center"><button onclick="document.getElementById('filter').value='pipeline';renderSkills()" class="px-2 py-1 rounded-full bg-violet-500/20 text-xs">Pipeline</button><button onclick="document.getElementById('filter').value='build';renderSkills()" class="px-2 py-1 rounded-full bg-white/10 text-xs">Build</button></span></div>
    </div>`;
  } else {
    el.innerHTML=list.map(s=>{
      const g=GROUP[s.name]||'other';
      const label=GROUP_LABEL[g]||g;
      const isPipeline=STATIONS.some(x=>x.id===s.name);
      return `
      <a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/skills/${s.name}" target="_blank" class="card rounded-2xl border border-white/10 bg-white/[.04] p-5 text-left hover:bg-white/[.06] transition block">
        <div class="flex items-center gap-2">
          <span class="text-[11px] uppercase tracking-widest px-2 py-1 rounded-full ${isPipeline?'bg-violet-500/20 text-violet-200 border border-violet-400/20':'bg-white/10 text-white/60 border border-white/10'}">${label}</span>
          ${isPipeline?'<span class="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">Station</span>':''}
        </div>
        <div class="mt-3 font-mono text-[13px] font-semibold">${s.name}</div>
        <div class="mt-1 text-sm leading-6 text-white/60 line-clamp-3">${s.desc}</div>
        <div class="mt-3 text-xs font-semibold text-violet-300">Open →</div>
      </a>`;
    }).join('');
  }
  const sc2=document.getElementById('skillCount');
  if(sc2) sc2.textContent=`Showing ${list.length} of ${allSkills.length} skills`;
}
function debouncedRender(){ clearTimeout(_debounceT); _debounceT=setTimeout(renderSkills,180); }
function renderPreview(){
  const el=document.getElementById('skillGridPreview');
  if(!el || !allSkills.length) return;
  const preview=allSkills.slice(0,6);
  el.innerHTML=preview.map(s=>{
    const g=GROUP[s.name]||'other'; const label=GROUP_LABEL[g]||g;
    return `<a href="./skills/" class="card rounded-2xl border border-white/10 bg-white/[.04] p-5 block hover:bg-white/[.06]"><div class="text-[11px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 inline-block">${label}</div><div class="mt-2 font-mono text-sm font-semibold">${s.name}</div><div class="mt-1 text-sm text-white/60 line-clamp-2">${s.desc}</div></a>`;
  }).join('');
}

// agents
const AGENTS=[
  ['code-reviewer','Senior Staff Eng','Five-axis review: would a staff engineer approve?'],
  ['security-reviewer','Security Eng','OWASP, auth, secrets, threat modeling'],
  ['typescript-reviewer','TS/JS','Types, async, Node security'],
  ['react-reviewer','React','Hooks, a11y, RSC, render perf'],
  ['python-reviewer','Python','asyncio, typing, PEP 8'],
  ['go-reviewer','Go','Goroutines, errors, interfaces'],
  ['rust-reviewer','Rust','Lifetimes, unsafe, borrowing'],
  ['database-reviewer','Data','N+1, indexes, migrations'],
  ['silent-failure-hunter','Reliability','Swallowed errors, empty catches'],
  ['tdd-guide','TDD','Write-tests-first enforcement'],
  ['build-error-resolver','Build','Generic build failures'],
  ['react-build-resolver','React Build','React build failures'],
  ['go-build-resolver','Go Build','Go build failures'],
  ['rust-build-resolver','Rust Build','Rust build failures'],
  ['refactor-cleaner','Cleanup','Dead code with proof'],
  ['type-design-analyzer','Design','Interfaces & domain model'],
  ['code-explorer','Explorer','Execution-path tracing'],
  ['doc-updater','Docs','Docs drift after changes'],
];
function renderAgents(){
  const mk=(id,role,desc)=>`<a href="https://github.com/AI-Degen-69/issue-to-pr-skills/tree/main/agents/${id}.md" target="_blank" class="rounded-2xl border border-white/10 bg-white/[.04] p-5 hover:bg-white/[.06] transition block"><div class="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 grid place-items-center text-xs font-bold">${role.slice(0,2).toUpperCase()}</div><div class="mt-3 font-mono text-sm font-semibold">${id}</div><div class="text-xs text-white/50">${role}</div><div class="mt-1 text-sm text-white/60 leading-5">${desc}</div></a>`;
  const g=document.getElementById('agentGrid');
  if(g) g.innerHTML=AGENTS.map(a=>mk(...a)).join('');
  const gp=document.getElementById('agentGridPreview');
  if(gp) gp.innerHTML=AGENTS.slice(0,4).map(a=>mk(...a)).join('');
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
  document.querySelectorAll('#stationCards > div, #skillGrid > a, #skillGridPreview > a, #agentGrid > a, #agentGridPreview > a, .reveal').forEach(el=>{el.classList.add('reveal'); obs.observe(el);});
}
document.addEventListener('DOMContentLoaded',()=>{
  renderMini(); renderDiagram(); renderMobileDiagram(); renderStations(); renderAgents(); loadSkills();
  showStation(1);
  setupMobileNav();
  document.getElementById('search')?.addEventListener('input', debouncedRender);
  document.getElementById('clearSearch')?.addEventListener('click',()=>{document.getElementById('search').value=''; renderSkills(); document.getElementById('search').focus();});
  document.getElementById('filter')?.addEventListener('change', renderSkills);
  setTimeout(setupReveal,300);
});
