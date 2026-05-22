/* =========================================================
   crAPI Training - Trainer Platform
   Interactive behaviors
   ========================================================= */

(function () {
  'use strict';

  /* ── Theme toggle ── */

  const THEME_KEY = 'crapi-training-theme';
  const html = document.documentElement;

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    btn.innerHTML = t === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  applyTheme(getInitialTheme());

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#themeToggle');
    if (!btn) return;
    const next = (html.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  /* ── Progress tracking ── */

  const PROGRESS_KEY = 'crapi-progress';
  const TRACKABLE = new Set(['api1','api2','api3','api4','api5','api6','api7','api8','api9','api10']);

  function loadCompleted() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function saveCompleted(set) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
  }

  let completed = loadCompleted();

  function updateProgressUI() {
    const count = [...completed].filter(id => TRACKABLE.has(id)).length;
    const total = TRACKABLE.size;
    const pct   = Math.round((count / total) * 100);

    const labelEl = document.getElementById('progressLabel');
    const fillEl  = document.getElementById('progressFill');
    const pctEl   = document.getElementById('progressPct');
    if (labelEl) labelEl.textContent = `${count} / ${total}`;
    if (fillEl)  fillEl.style.width  = pct + '%';
    if (pctEl)   pctEl.textContent   = pct + '%';

    TRACKABLE.forEach(id => {
      const badge = document.getElementById('badge-' + id);
      if (!badge) return;
      if (completed.has(id)) {
        badge.textContent = '✓ Done';
        badge.setAttribute('aria-label', 'Completed');
        badge.classList.add('done');
      } else {
        badge.textContent = '';
        badge.setAttribute('aria-label', 'Not completed');
        badge.classList.remove('done');
      }
    });
  }

  /* ── Section navigation ── */

  const SECTION_ORDER = [
    'welcome', 'how-to-use',
    'setup-crapi', 'setup-burp', 'setup-verify',
    'api1', 'api2', 'api3', 'api4', 'api5',
    'api6', 'api7', 'api8', 'api9', 'api10',
    'appendix-burp', 'appendix-troubleshoot', 'appendix-refs'
  ];

  const allSections = Array.from(document.querySelectorAll('section.page-section'));
  const navLinks    = Array.from(document.querySelectorAll('.nav-link'));
  const crumbEl     = document.querySelector('.crumb-current');

  const linkMap = new Map();
  navLinks.forEach(l => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) linkMap.set(href.slice(1), l);
  });

  let currentId = null;

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function getSectionTitle(id) {
    const link = linkMap.get(id);
    if (link) {
      const clone = link.cloneNode(true);
      clone.querySelectorAll('.nav-badge').forEach(el => el.remove());
      return clone.textContent.trim().replace(/\s+/g, ' ');
    }

    const el = document.getElementById(id);
    const h  = el && el.querySelector('h2, h1');
    return h ? h.textContent.trim() : id;
  }

  function showSection(id) {
    if (!SECTION_ORDER.includes(id)) return;

    allSections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');
    currentId = id;

    window.scrollTo({ top: 0, behavior: 'instant' });

    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = linkMap.get(id);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    if (crumbEl) crumbEl.textContent = truncate(getSectionTitle(id), 40);

    const idx    = SECTION_ORDER.indexOf(id);
    const prevId = idx > 0                          ? SECTION_ORDER[idx - 1] : null;
    const nextId = idx < SECTION_ORDER.length - 1  ? SECTION_ORDER[idx + 1] : null;

    const prevBtn       = document.getElementById('pnavPrev');
    const prevLabelEl   = document.getElementById('pnavPrevLabel');
    const nextBtn       = document.getElementById('pnavNext');
    const nextLabelEl   = document.getElementById('pnavNextLabel');
    const markDoneBtn   = document.getElementById('markDoneBtn');

    if (prevBtn) {
      prevBtn.dataset.target = prevId || '';
      prevBtn.classList.toggle('hidden', !prevId);
      if (prevId && prevLabelEl) prevLabelEl.textContent = truncate(getSectionTitle(prevId), 28);
    }

    if (nextBtn) {
      nextBtn.dataset.target = nextId || '';
      nextBtn.classList.toggle('hidden', !nextId);
      if (nextId && nextLabelEl) nextLabelEl.textContent = truncate(getSectionTitle(nextId), 28);
    }

    if (markDoneBtn) {
      const trackable = TRACKABLE.has(id);
      markDoneBtn.classList.toggle('hidden', !trackable);
      if (trackable) refreshMarkDoneBtn(id);
    }

    history.replaceState(null, '', '#' + id);
  }

  function refreshMarkDoneBtn(id) {
    const btn    = document.getElementById('markDoneBtn');
    const textEl = document.getElementById('markDoneText');
    if (!btn) return;
    const done = completed.has(id);
    btn.classList.toggle('completed', done);
    if (textEl) textEl.textContent = done ? 'Completed ✓' : 'Mark section complete';
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#markDoneBtn')) {
      if (!currentId || !TRACKABLE.has(currentId)) return;
      completed.has(currentId) ? completed.delete(currentId) : completed.add(currentId);
      saveCompleted(completed);
      refreshMarkDoneBtn(currentId);
      updateProgressUI();
      return;
    }

    const navBtn = e.target.closest('#pnavPrev, #pnavNext');
    if (navBtn && navBtn.dataset.target) {
      showSection(navBtn.dataset.target);
      return;
    }

    const link = e.target.closest('.nav-link');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.slice(1);
        if (SECTION_ORDER.includes(id)) {
          e.preventDefault();
          showSection(id);
          if (window.innerWidth <= 768) closeSidebar();
        }
      }
    }
  });

  const initId = SECTION_ORDER.includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : 'welcome';
  showSection(initId);
  updateProgressUI();

  /* ── Welcome ops ticker ── */

  const opsTicker = document.getElementById('opsTicker');
  const opsLines = [
    'select a module to load the attack path...',
    'map endpoint → confirm auth context → test object ownership',
    'send to Repeater, change one variable, observe the delta',
    'turn every exploit into a fix the engineering team can ship',
    'trainer note: keep Burp history clean before the live demo'
  ];

  if (opsTicker && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let opsIndex = 0;
    setInterval(() => {
      opsIndex = (opsIndex + 1) % opsLines.length;
      opsTicker.textContent = opsLines[opsIndex];
    }, 2600);
  }

  /* ── Mobile sidebar ── */

  const sidebar  = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  function openSidebar()  { sidebar?.classList.add('open');    backdrop?.classList.add('show'); }
  function closeSidebar() { sidebar?.classList.remove('open'); backdrop?.classList.remove('show'); }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#menuToggle'))        openSidebar();
    if (e.target.closest('.sidebar-backdrop')) closeSidebar();
  });

  /* ── Copy code buttons ── */

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const pre = btn.closest('.code-block')?.querySelector('pre');
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText);
      btn.classList.add('copied');
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied';
      showToast('Copied to clipboard');
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 1800);
    } catch { showToast('Copy failed - select manually'); }
  });

  /* ── Toast ── */

  let toastTimer;
  function showToast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toastTimer);
    requestAnimationFrame(() => t.classList.add('show'));
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  /* ── Tabs ── */

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-btn');
    if (!tab) return;
    const root   = tab.closest('.tabs');
    const target = tab.dataset.tab;
    root?.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === tab));
    root?.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
  });

  /* ── Sidebar search ── */

  const searchInput = document.getElementById('navSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      navLinks.forEach(l => {
        l.classList.toggle('hidden', !!q && !l.textContent.toLowerCase().includes(q));
      });
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); }
    });
  }

  /* ── Keyboard shortcuts ── */

  document.addEventListener('keydown', (e) => {
    const inField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !inField) { e.preventDefault(); searchInput?.focus(); }
    if (e.key === 't' && !inField && !e.ctrlKey && !e.metaKey) document.getElementById('themeToggle')?.click();
    if (!inField) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const btn = document.getElementById('pnavNext');
        if (btn && !btn.classList.contains('hidden')) btn.click();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const btn = document.getElementById('pnavPrev');
        if (btn && !btn.classList.contains('hidden')) btn.click();
      }
    }
  });

})();
