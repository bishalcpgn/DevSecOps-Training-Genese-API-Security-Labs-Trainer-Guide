/* =========================================================
   crAPI Training — Cyberpunk Neon
   Interactive: theme · sidebar · search · copy · tabs ·
   scroll-spy · progress · sub-step checkboxes · prev/next
   ========================================================= */

(function () {
  'use strict';

  const STORAGE_KEY = 'crapi-training-state-v2';
  const THEME_KEY = 'crapi-training-theme';
  const html = document.documentElement;

  /* ---------------- State ---------------- */

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { steps: {}, challenges: {} };
    } catch { return { steps: {}, challenges: {} }; }
  }
  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }
  let state = loadState();

  /* ---------------- Theme toggle ---------------- */

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', (t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme') + ' (T)');
    }
  }

  applyTheme(getInitialTheme());

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#themeToggle')) return;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  /* ---------------- Mobile sidebar ---------------- */

  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  function openSidebar() {
    sidebar && sidebar.classList.add('open');
    backdrop && backdrop.classList.add('show');
  }
  function closeSidebar() {
    sidebar && sidebar.classList.remove('open');
    backdrop && backdrop.classList.remove('show');
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#menuToggle')) openSidebar();
    if (e.target.closest('.sidebar-backdrop')) closeSidebar();
    if (e.target.closest('.nav-link') && window.innerWidth <= 768) closeSidebar();
  });

  /* ---------------- Copy code buttons ---------------- */

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const block = btn.closest('.code-block');
    if (!block) return;
    const pre = block.querySelector('pre');
    if (!pre) return;

    const text = pre.innerText;
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied';
      showToast('Copied to clipboard');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 1800);
    } catch {
      showToast('Copy failed — select manually');
    }
  });

  /* ---------------- Toast ---------------- */

  let toastTimer;
  function showToast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    clearTimeout(toastTimer);
    requestAnimationFrame(() => t.classList.add('show'));
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  /* ---------------- Tabs ---------------- */

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-btn');
    if (!tab) return;
    const tabsRoot = tab.closest('.tabs');
    if (!tabsRoot) return;
    const target = tab.dataset.tab;
    tabsRoot.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === tab));
    tabsRoot.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
  });

  /* ---------------- Challenge enrichment ----------------
     For each challenge section:
       1. Wrap "01" → "A01" badge with category color
       2. Inject difficulty pill (from data attribute or default)
       3. Inject completion toggle button
       4. Inject sub-step checkboxes on every <li> in .steps
       5. Inject prev/next nav at end
       6. Update completion state from localStorage
  */

  const challengeIds = ['api1','api2','api3','api4','api5','api6','api7','api8','api9','api10'];
  const challengeNames = {
    api1: 'Broken Object Level Auth',
    api2: 'Broken Authentication',
    api3: 'Broken Object Property Auth',
    api4: 'Unrestricted Resource Use',
    api5: 'Broken Function Level Auth',
    api6: 'Sensitive Business Flows',
    api7: 'Server-Side Request Forgery',
    api8: 'Security Misconfiguration',
    api9: 'Improper Inventory Mgmt',
    api10: 'Unsafe API Consumption'
  };
  const challengeDifficulty = {
    api1: 'Easy',  api2: 'Hard', api3: 'Easy',  api4: 'Easy',  api5: 'Medium',
    api6: 'Medium', api7: 'Easy', api8: 'Easy',  api9: 'Easy',  api10: 'Hard'
  };

  function enrichChallenge(idx, id) {
    const section = document.getElementById(id);
    if (!section) return;

    /* 1. Promote .challenge-number → .challenge-badge with "A01"-style label */
    const num = section.querySelector('.challenge-number');
    if (num && !section.querySelector('.challenge-badge')) {
      const badge = document.createElement('div');
      badge.className = 'challenge-badge';
      const n = String(idx + 1).padStart(2, '0');
      badge.textContent = 'API' + (idx + 1);
      num.replaceWith(badge);
    }

    /* 2. Add difficulty pill if not present */
    const meta = section.querySelector('.challenge-meta');
    if (meta && !meta.querySelector('.pill-easy, .pill-medium-diff, .pill-hard')) {
      const diff = challengeDifficulty[id] || 'Medium';
      const cls = diff === 'Easy' ? 'pill-easy' : diff === 'Hard' ? 'pill-hard' : 'pill-medium-diff';
      const pill = document.createElement('span');
      pill.className = 'pill ' + cls;
      pill.innerHTML = '<span class="dot"></span>' + diff;
      meta.prepend(pill);
    }

    /* 3. Master completion button (in header, right column) */
    const header = section.querySelector('.challenge-header');
    if (header && !header.querySelector('.challenge-complete-btn')) {
      const btn = document.createElement('button');
      btn.className = 'challenge-complete-btn';
      btn.type = 'button';
      btn.innerHTML = '<span class="cb-box"></span><span class="cb-label">Mark complete</span>';
      btn.dataset.challenge = id;
      header.appendChild(btn);
    }

    /* 4. Sub-step checkboxes — every <li> in any .steps list inside this section */
    const steps = section.querySelectorAll('.steps > li');
    steps.forEach((li, i) => {
      if (li.querySelector('.step-check')) return;
      const cb = document.createElement('span');
      cb.className = 'step-check';
      cb.setAttribute('role', 'checkbox');
      cb.setAttribute('tabindex', '0');
      cb.dataset.challenge = id;
      cb.dataset.step = id + ':step:' + i;
      cb.setAttribute('aria-label', 'Mark step ' + (i + 1) + ' complete');
      li.prepend(cb);
    });

    /* 5. Prev / next nav */
    if (!section.querySelector('.challenge-nav')) {
      const nav = document.createElement('nav');
      nav.className = 'challenge-nav';
      nav.setAttribute('aria-label', 'Challenge navigation');

      const prevIdx = idx - 1;
      const nextIdx = idx + 1;
      const prevId = prevIdx >= 0 ? challengeIds[prevIdx] : null;
      const nextId = nextIdx < challengeIds.length ? challengeIds[nextIdx] : null;

      nav.innerHTML = `
        ${prevId ? `
          <a class="challenge-nav-btn prev" href="#${prevId}">
            <span class="nav-direction">← Previous</span>
            <span class="nav-target"><span class="nav-target-id">API${prevIdx + 1}</span>${challengeNames[prevId]}</span>
          </a>` : `
          <div class="challenge-nav-btn disabled" aria-hidden="true">
            <span class="nav-direction">← Previous</span>
            <span class="nav-target">Lab Setup</span>
          </div>`}
        ${nextId ? `
          <a class="challenge-nav-btn next" href="#${nextId}">
            <span class="nav-direction">Next →</span>
            <span class="nav-target"><span class="nav-target-id">API${nextIdx + 1}</span>${challengeNames[nextId]}</span>
          </a>` : `
          <a class="challenge-nav-btn next" href="#appendix-burp">
            <span class="nav-direction">Next →</span>
            <span class="nav-target">Appendix · Burp cheat sheet</span>
          </a>`}
      `;
      section.appendChild(nav);
    }
  }

  challengeIds.forEach((id, i) => enrichChallenge(i, id));

  /* ---------------- Progress state ---------------- */

  function applyState() {
    // Step checkboxes
    document.querySelectorAll('.step-check').forEach(cb => {
      const li = cb.closest('li');
      if (state.steps[cb.dataset.step]) li.classList.add('checked');
      else li.classList.remove('checked');
    });
    // Challenge completion
    challengeIds.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      const done = !!state.challenges[id];
      section.classList.toggle('completed', done);
      // Update nav link
      const link = document.querySelector('.nav-link[href="#' + id + '"]');
      if (link) link.classList.toggle('completed', done);
    });
    // Top counter
    updateTopProgress();
  }

  function updateTopProgress() {
    const total = challengeIds.length;
    const solved = challengeIds.filter(id => state.challenges[id]).length;
    const pct = Math.round((solved / total) * 100);
    const numEl = document.getElementById('solvedCount');
    const fillEl = document.getElementById('progressFill');
    const pctEl = document.getElementById('progressPct');
    if (numEl) numEl.textContent = solved;
    if (fillEl) fillEl.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }

  /* Auto-complete a challenge when all its steps are checked */
  function checkAutoComplete(challengeId) {
    const section = document.getElementById(challengeId);
    if (!section) return;
    const all = section.querySelectorAll('.step-check');
    if (!all.length) return;
    const checked = section.querySelectorAll('.steps > li.checked .step-check');
    const wasComplete = !!state.challenges[challengeId];
    const nowComplete = checked.length === all.length;
    if (nowComplete && !wasComplete) {
      state.challenges[challengeId] = true;
      saveState(state);
      showToast(`✓ ${challengeId.toUpperCase()} complete — well done`);
    }
    if (!nowComplete && wasComplete && checked.length < all.length) {
      // If user un-checks a step, don't auto-uncomplete — keep that explicit via the master button
    }
  }

  /* Click handlers for step checkboxes */
  document.addEventListener('click', (e) => {
    const cb = e.target.closest('.step-check');
    if (!cb) return;
    e.preventDefault();
    const key = cb.dataset.step;
    const cid = cb.dataset.challenge;
    state.steps[key] = !state.steps[key];
    if (!state.steps[key]) delete state.steps[key];
    saveState(state);
    cb.closest('li').classList.toggle('checked', !!state.steps[key]);
    checkAutoComplete(cid);
    updateTopProgress();
  });
  /* Keyboard support for checkboxes */
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.classList.contains('step-check')) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* Master complete button */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.challenge-complete-btn');
    if (!btn) return;
    const cid = btn.dataset.challenge;
    const isComplete = !!state.challenges[cid];
    if (isComplete) {
      state.challenges[cid] = false;
      delete state.challenges[cid];
      // Also uncheck all sub-steps
      document.querySelectorAll(`.step-check[data-challenge="${cid}"]`).forEach(cb => {
        delete state.steps[cb.dataset.step];
        cb.closest('li').classList.remove('checked');
      });
    } else {
      state.challenges[cid] = true;
      // Also check all sub-steps
      document.querySelectorAll(`.step-check[data-challenge="${cid}"]`).forEach(cb => {
        state.steps[cb.dataset.step] = true;
        cb.closest('li').classList.add('checked');
      });
    }
    saveState(state);
    applyState();
    if (state.challenges[cid]) {
      showToast(`✓ ${cid.toUpperCase()} marked complete`);
    } else {
      showToast(`✗ ${cid.toUpperCase()} reset`);
    }
  });

  /* ---------------- Scroll spy ---------------- */

  const sections = Array.from(document.querySelectorAll('section.page-section'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const linkMap = new Map();
  navLinks.forEach(l => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) linkMap.set(href.slice(1), l);
  });

  function setActive(id) {
    navLinks.forEach(l => l.classList.remove('active'));
    const link = linkMap.get(id);
    if (link) link.classList.add('active');
  }

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-96px 0px -65% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  /* ---------------- Search filter ---------------- */

  const searchInput = document.getElementById('navSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      navLinks.forEach(link => {
        if (!q) { link.classList.remove('hidden'); return; }
        const text = link.textContent.toLowerCase();
        link.classList.toggle('hidden', !text.includes(q));
      });
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    });
  }

  /* ---------------- Keyboard shortcuts ---------------- */

  document.addEventListener('keydown', (e) => {
    const inField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !inField) {
      e.preventDefault();
      searchInput && searchInput.focus();
    }
    if (e.key.toLowerCase() === 't' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const btn = document.getElementById('themeToggle');
      btn && btn.click();
    }
    // J / K for prev / next challenge navigation
    if (!inField && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'j' || e.key === 'k') {
        const currentSection = sections.find(s => {
          const rect = s.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom > 120;
        });
        if (!currentSection) return;
        const idx = sections.indexOf(currentSection);
        const target = e.key === 'j' ? sections[idx + 1] : sections[idx - 1];
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  /* ---------------- Breadcrumb update ---------------- */

  const crumbCurrent = document.querySelector('.crumb-current');
  if (crumbCurrent && 'IntersectionObserver' in window) {
    const breadObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) {
        const h = visible[0].target.querySelector('h2, h1');
        if (h) crumbCurrent.textContent = h.textContent.trim();
      }
    }, { rootMargin: '-96px 0px -75% 0px' });
    sections.forEach(s => breadObserver.observe(s));
  }

  /* ---------------- Initial paint ---------------- */

  applyState();

  /* ---------------- Reset progress (Ctrl/Cmd + Shift + R intercept... no, too aggressive) ----
     We expose a window function instead for trainers who want to clear between cohorts. */
  window.crapiResetProgress = function () {
    if (!confirm('Reset all progress markers? This cannot be undone.')) return;
    state = { steps: {}, challenges: {} };
    saveState(state);
    applyState();
    showToast('Progress reset');
  };

})();
