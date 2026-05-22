/* =========================================================
   crAPI Training — Trainer Platform
   Interactive behaviors
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- Theme toggle ---------------- */

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
    if (btn) {
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.innerHTML = t === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  }

  applyTheme(getInitialTheme());

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#themeToggle');
    if (!btn) return;
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
    } catch (err) {
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

  /* ---------------- Tabs (for OS-specific instructions) ---------------- */

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-btn');
    if (!tab) return;
    const tabsRoot = tab.closest('.tabs');
    if (!tabsRoot) return;

    const target = tab.dataset.tab;
    tabsRoot.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === tab));
    tabsRoot.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.dataset.panel === target);
    });
  });

  /* ---------------- Scroll spy (highlight active sidebar link) ---------------- */

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
      // Find the entry closest to the top that is visible
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) {
        setActive(visible[0].target.id);
      }
    }, {
      rootMargin: '-88px 0px -65% 0px',
      threshold: 0
    });
    sections.forEach(s => observer.observe(s));
  }

  /* ---------------- Search filter (sidebar) ---------------- */

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
    // Esc clears
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  }

  /* ---------------- Keyboard shortcuts ---------------- */

  document.addEventListener('keydown', (e) => {
    // "/" focuses search (when not in input)
    const inField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === '/' && !inField) {
      e.preventDefault();
      searchInput && searchInput.focus();
    }
    // "t" toggles theme
    if (e.key === 't' && !inField && !e.ctrlKey && !e.metaKey) {
      const btn = document.getElementById('themeToggle');
      btn && btn.click();
    }
  });

  /* ---------------- Update breadcrumb on scroll ---------------- */

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
    }, { rootMargin: '-88px 0px -75% 0px' });
    sections.forEach(s => breadObserver.observe(s));
  }

})();
