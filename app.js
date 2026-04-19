/* app.js — navigation & init */

window.MODE = 'messy';

// ── Navigation ────────────────────────────────────────────────
function nav(page, el) {
  // Hide all pages
  ['dashboard','team','review','compare'].forEach(p => {
    const el = document.getElementById('pg-' + p);
    if (el) el.style.display = p === page ? 'block' : 'none';
  });

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    const target = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (target) target.classList.add('active');
  }

  // Destroy charts before re-render
  destroyAllCharts();

  // Render
  if      (page === 'dashboard') renderDashboard();
  else if (page === 'team')      renderTeam();
  else if (page === 'review')    renderReview();
  else if (page === 'compare')   renderCompare();

  // Close sidebar on mobile after nav
  if (window.innerWidth < 900) closeSidebar();
}

// ── Dataset switch ─────────────────────────────────────────────
function switchMode(mode) {
  window.MODE = mode;
  document.getElementById('btn-messy').classList.toggle('active', mode === 'messy');
  document.getElementById('btn-clean').classList.toggle('active', mode === 'clean');

  // Re-render current page
  const active = document.querySelector('.nav-item.active');
  const page = active ? active.dataset.page : 'dashboard';
  destroyAllCharts();
  if      (page === 'dashboard') renderDashboard();
  else if (page === 'team')      renderTeam();
  else if (page === 'review')    renderReview();
  else if (page === 'compare')   renderCompare();
}

// ── Sidebar mobile toggle ──────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('open');
}

// ── Overlay close ──────────────────────────────────────────────
function closeOverlay(e) {
  if (!e || e.target === document.getElementById('overlay')) {
    document.getElementById('overlay').classList.remove('open');
  }
}

// ── Global search (topbar) ─────────────────────────────────────
function globalSearch(val) {
  // Switch to team page and apply search
  window.TEAM_FILTER.search = val;
  window.TEAM_PAGE = 1;
  nav('team', document.querySelector('[data-page="team"]'));
}

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
});

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
});
