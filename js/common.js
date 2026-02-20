/**
 * Mankiw's Economics - Web 3.0 Interaction Core
 * Includes: Theme Manager, Spotlight Effect, Navigation, 3D Tilt, Utilities
 */

// ═══════════════════════════════════════
//  THEME SYSTEM (Persistent)
// ═══════════════════════════════════════
const ThemeManager = {
  STORAGE_KEY: 'mankiw_theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });

    // Add toggle button listener if element exists
    const btn = document.getElementById('themeToggle');
    if (btn) btn.onclick = () => this.toggle();
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('.theme-toggle');
    if (icon) icon.innerHTML = theme === 'dark' ? '☀' : '☾';
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }
};


// ═══════════════════════════════════════
//  SPOTLIGHT & TILT EFFECTS
// ═══════════════════════════════════════
function initVisualEffects() {
  const cards = document.querySelectorAll('.spotlight');

  // Spotlight
  document.addEventListener('mousemove', (e) => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 3D Tilt (Vanilla implementation)
  cards.forEach(card => {
    if (!card.hasAttribute('data-tilt')) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ═══════════════════════════════════════
//  UTILITIES (Recovered)
// ═══════════════════════════════════════

// Chapter Sidebar Builder
function createChapterSidebar(containerId, onSelect, selectedId) {
  const container = document.getElementById(containerId);
  if (!container || typeof TEXTBOOK_DATA === 'undefined') return;

  let html = '';
  TEXTBOOK_DATA.parts.forEach(part => {
    html += `<div class="chapter-part-label">PART ${part.id}</div>`;
    html += part.chapters.map(ch => `
      <div class="chapter-item">
        <button onclick="handleChapterSelect(${ch.id})" class="${ch.id === selectedId ? 'active' : ''}" data-chapter="${ch.id}">
          <span class="chapter-num">${String(ch.id).padStart(2, '0')}</span>
          <span>${ch.title}</span>
        </button>
      </div>
    `).join('');
  });
  container.innerHTML = html;
}

// Data Helpers — getAllChapters(), getChapter(), searchChapters()는
// data.js에서 정의됨 (partId, partTitle 포함). 여기서 재정의하지 않음.

// Toast Notification
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const colors = { success: '#10B981', error: '#F43F5E', info: '#3B82F6' };
  const toast = document.createElement('div');
  toast.className = `toast`;
  toast.innerHTML = `
    <span style="font-weight: 700; color:${colors[type]}">●</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}

function downloadAsText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function printContent(contentId) {
  const content = document.getElementById(contentId);
  if (!content) return;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Print</title>
    <style>body{font-family:sans-serif;padding:2rem;line-height:1.6}</style>
    </head><body>${content.innerHTML}</body></html>
  `);
  win.document.close();
  win.print();
}

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// HTML escape helper
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, c => map[c]);
}

// Tabs initialization
function initTabs(tabContainerId) {
  const container = document.getElementById(tabContainerId);
  if (!container) return;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // Remove active from all buttons & contents
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const parent = container.closest('.content-panel') || container.parentElement;
      parent.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      // Activate selected
      btn.classList.add('active');
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    });
  });
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();

  // Inject FontAwesome if missing
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  // Inject Aurora BG if missing (for sub-pages)
  if (!document.querySelector('.aurora-bg')) {
    const aurora = document.createElement('div');
    aurora.className = 'aurora-bg';
    aurora.innerHTML = `
      <div class="aurora-blob blob-1"></div>
      <div class="aurora-blob blob-2"></div>
      <div class="aurora-blob blob-3"></div>
    `;
    document.body.prepend(aurora);
  }

  // Inject Navbar for sub-pages (Enforce new design)
  // Skip if we are on the landing page (which has its own navbar)
  if (window.location.pathname.endsWith('landing.html')) return;

  const existingNav = document.querySelector('nav');
  if (existingNav) existingNav.remove();

  // Determine active page from URL
  const pathname = window.location.pathname;
  let active = 'home';
  if (pathname.includes('search')) active = 'search';
  else if (pathname.includes('practice')) active = 'practice';
  else if (pathname.includes('exam')) active = 'exam';
  else if (pathname.includes('lecture')) active = 'lecture';
  else if (pathname.includes('syllabus')) active = 'syllabus';
  else if (pathname.includes('report')) active = 'report';

  // Create navbar
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div style="display:flex; align-items:center; gap:16px;">
      <a href="landing.html" title="Go to ClassAI Home" style="color:var(--text-muted); font-size:1.1rem; transition:color 0.2s; display:flex; align-items:center;">
        <i class="fa-solid fa-layer-group"></i>
      </a>
      <div style="width:1px; height:24px; background:var(--border-subtle);"></div>
      <a href="index.html" class="nav-brand" style="gap:12px;">
        <div style="display:flex; flex-direction:column; justify-content:center; line-height:1.1;">
           <span class="dynamic-text-blue" style="font-size:1.2rem; letter-spacing:-0.02em;">Class AI</span>
           <span style="font-size:0.6rem; color:var(--text-muted); font-weight:400; letter-spacing:0.02em;">powered by Ninetynine Inc.</span>
        </div>
      </a>
    </div>

    <div class="nav-links">
      <a href="index.html" class="${active === 'home' ? 'active' : ''}">Dashboard</a>
      <a href="syllabus.html" class="${active === 'syllabus' ? 'active' : ''}">Syllabus</a>
      <a href="search.html" class="${active === 'search' ? 'active' : ''}">Search</a>
      <a href="practice.html" class="${active === 'practice' ? 'active' : ''}">Practice</a>
      <a href="exam.html" class="${active === 'exam' ? 'active' : ''}">Exam</a>
      <a href="lecture.html" class="${active === 'lecture' ? 'active' : ''}">Lecture</a>
      <a href="report.html" class="${active === 'report' ? 'active' : ''}">Report</a>
    </div>
    <div style="display:flex; gap:10px; align-items:center;">
       <div id="ragStatusContainer"></div>
       <button class="theme-toggle" id="themeToggle" onclick="ThemeManager.toggle()">☀</button>
    </div>
  `;
  document.body.prepend(nav);
  if (typeof RAG_API !== 'undefined') RAG_API.createStatusBadge('ragStatusContainer');

  // Create Footer if missing
  if (!document.querySelector('footer')) {
    const footer = document.createElement('footer');
    footer.style.cssText = `
       text-align: center; padding: 40px; color: var(--text-muted); 
       font-size: 0.9rem; margin-top: 80px; border-top: 1px solid var(--border-subtle);
     `;
    footer.innerHTML = `<p>&copy; 2026 Mankiw's Economics.</p>`;
    document.body.appendChild(footer);
  }

  initVisualEffects();
});
