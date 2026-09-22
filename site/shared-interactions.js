/**
 * issue-to-pr-skills — Shared Interaction & Animation Engine
 * Automatically injects scroll progress, reveals components on scroll,
 * binds magnetic hover feedback, and attaches click ripple physics.
 */
(function () {
  'use strict';

  function initInteractions() {
    // 1. Inject Scroll Progress Indicator Bar
    if (!document.querySelector('.scroll-progress-bar')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress-bar';
      progressBar.setAttribute('aria-hidden', 'true');
      document.body.prepend(progressBar);

      let ticking = false;
      const updateScrollProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(updateScrollProgress);
          ticking = true;
        }
      }, { passive: true });
      updateScrollProgress();
    }

    // 2. Inject Back to Top Button
    if (!document.getElementById('backToTopBtn')) {
      const topBtn = document.createElement('button');
      topBtn.id = 'backToTopBtn';
      topBtn.className = 'back-to-top';
      topBtn.setAttribute('aria-label', 'Scroll back to top');
      topBtn.setAttribute('type', 'button');
      topBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      `;
      document.body.appendChild(topBtn);

      window.addEventListener('scroll', () => {
        if (window.scrollY > 380) {
          topBtn.classList.add('visible');
        } else {
          topBtn.classList.remove('visible');
        }
      }, { passive: true });

      topBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 3. Setup Scroll Reveal Intersection Observer
    const observeTargets = () => {
      const targets = document.querySelectorAll(
        'section > div:not(.scroll-progress-bar):not(#agentGrid):not(#agentGridPreview), ' +
        'section > figure, ' +
        '.card:not(.agent-card), ' +
        '#skillGrid > a, ' +
        '#stationCards > div, ' +
        '#diagramMobile > button, ' +
        '.rounded-2xl.border:not(.agent-card), ' +
        '.rounded-xl.border:not(.agent-card)'
      );

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      targets.forEach((el, index) => {
        // Skip nav, skip elements already inside sticky or headers
        if (el.closest('nav') || el.classList.contains('scroll-progress-bar') || el.id === 'backToTopBtn') return;
        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');
          // Optional subtle stagger for grid siblings
          const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
          if (siblingIndex > 0 && siblingIndex < 6) {
            el.style.transitionDelay = `${(siblingIndex % 4) * 60}ms`;
          }
          observer.observe(el);
        }
      });
    };

    observeTargets();

    // 4. Smooth Anchor Link Scrolling with dynamic offset
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // If in a drawer or mobile menu, optionally blur
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });

    // 5. Interactive Click Ripple on interactive buttons and cards
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('button, .card, a.rounded-full, .rounded-2xl.border, #diagramMobile button');
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('click-ripple');

      // Make sure container has position relative or ripple surface
      const computedPos = window.getComputedStyle(trigger).position;
      if (computedPos === 'static') {
        trigger.style.position = 'relative';
      }
      trigger.classList.add('ripple-surface');

      const existingRipple = trigger.querySelector('.click-ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      trigger.appendChild(circle);

      setTimeout(() => {
        circle.remove();
      }, 600);
    });

    // 6. Interactive Command Copy Snippet Handler (Inspired by skills.addy.ie)
    document.querySelectorAll('[data-copy-root]').forEach((container) => {
      const btn = container.querySelector('[data-copy-btn]');
      const code = container.querySelector('[data-copy-text]');
      if (!btn || !code) return;

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const textToCopy = code.textContent.trim();
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
          }
        } catch (err) {
          console.warn('Clipboard copy error:', err);
        }

        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Copied to clipboard!');

        const toast = document.getElementById('toast') || document.getElementById('copyLive');
        if (toast) {
          toast.textContent = `Copied "${textToCopy}" to clipboard`;
        }

        setTimeout(() => {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', `Copy: ${textToCopy}`);
          if (toast) toast.textContent = '';
        }, 1600);
      });
    });

    // 6. Ensure all agent cards have icon tooltips
    const enhanceAgentCardTooltips = () => {
      const summaries = window.AGENT_SUMMARIES || {
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

      document.querySelectorAll('.agent-card').forEach((card) => {
        if (card.querySelector('.agent-icon-trigger')) return; // already enhanced
        const iconDiv = card.querySelector('.h-8.w-8');
        if (!iconDiv) return;

        // Extract id & role
        const href = card.getAttribute('href') || '';
        const idMatch = href.match(/([a-z0-9-]+)\/?$/);
        const nameEl = card.querySelector('.font-mono');
        const agentId = (idMatch ? idMatch[1] : (nameEl ? nameEl.textContent.trim() : '')).replace(/\/$/, '');
        const roleEl = card.querySelector('.text-xs.text-white\\/50') || card.querySelector('.text-xs');
        const role = roleEl ? roleEl.textContent.trim() : 'Specialist';
        const summary = summaries[agentId] || `${role} specialist reviewer for code quality and pipeline verification.`;

        const trigger = document.createElement('div');
        trigger.className = 'agent-icon-trigger group/icon relative inline-block shrink-0';
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'region');
        trigger.setAttribute('aria-label', `${agentId} — ${role}: ${summary}`);

        const tooltip = document.createElement('div');
        tooltip.className = 'agent-icon-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
            <span class="font-mono text-xs font-bold text-white tracking-wide truncate">${agentId}</span>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-violet-300 border border-white/10 shrink-0">${role}</span>
          </div>
          <p class="text-xs text-white/80 leading-relaxed font-sans">${summary}</p>
          <div class="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
            <span>Specialist Agent</span>
            <span class="text-violet-400 group-hover:text-violet-300">Click card for guide →</span>
          </div>
          <div class="agent-tooltip-arrow"></div>
        `;

        iconDiv.parentNode.insertBefore(trigger, iconDiv);
        trigger.appendChild(iconDiv);
        trigger.appendChild(tooltip);
      });
    };
    enhanceAgentCardTooltips();

    // 7. Theme: Permanently locked in Dark Burnt Tiger Orange & Warm Ochre
    function initAppTheme() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get('theme');
      const activeTheme = urlTheme || 'tiger';
      document.documentElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('issue_pr_theme_prototype', activeTheme);
    }
    initAppTheme();

    // Re-observe if dynamic content renders (like skills or agents loading via JS)
    const mutationObserver = new MutationObserver(() => {
      observeTargets();
      enhanceAgentCardTooltips();
    });
    const catalogContainer = document.getElementById('skillGrid') || document.getElementById('agentGrid') || document.getElementById('stationCards');
    if (catalogContainer) {
      mutationObserver.observe(catalogContainer, { childList: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
  } else {
    initInteractions();
  }
})();
