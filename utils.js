/* utils.js — shared helpers */

const FLAG_LABELS = {
  IDENTITY_UNRESOLVED:  'Identitas belum terselesaikan',
  FEW_DATA_SOURCES:     'Data dari < 2 sumber',
  HIGH_INFERENCE_RATIO: 'Skill > 50% diinferensikan',
  NO_PERFORMANCE_DATA:  'Tanpa data kinerja',
  CORRUPTED_PERF_DATA:  'Data kinerja rusak/tidak valid',
  DATE_CONFLICT:        'Konflik tanggal HRIS vs ATS',
  NO_SKILL_DATA:        'Tidak ada data skill',
  NO_PERF_DATA:         'Tidak ada data kinerja',
  DUPLICATE_RECORD:     'Rekaman duplikat terdeteksi',
  EMAIL_CONFLICT:       'Email berbeda antar sistem',
};

const ROLE_COURSES = {
  'Sales Executive':      ['Teknik Penjualan Efektif','Pengenalan CRM Salesforce','Negosiasi untuk Sales'],
  'Sales Manager':        ['Leadership for Sales Managers','Coaching & Mentoring','Sales Forecasting'],
  'Warehouse Supervisor': ['Manajemen Gudang Modern','K3 Gudang','Sistem ERP SAP WM'],
  'Logistics Staff':      ['Logistik dan Distribusi Dasar','Pengoperasian TMS','Dokumentasi Pengiriman'],
  'HR Generalist':        ['Rekrutmen Berbasis Kompetensi','Dasar Hukum Ketenagakerjaan','Manajemen Kinerja'],
  'Finance Staff':        ['Pelaporan Keuangan','Perpajakan Perusahaan','Pengoperasian SAP Finance'],
  'IT Support':           ['Jaringan Komputer Dasar','Troubleshooting Hardware','Manajemen Tiket IT'],
  'Branch Manager':       ['Manajemen Cabang','P&L Management','Leadership dan Motivasi'],
  'Customer Service':     ['Komunikasi Pelanggan Efektif','Penanganan Komplain','Pengoperasian CRM'],
  'Driver':               ['Defensive Driving','K3 Pengemudi','Navigasi dan Rute'],
};

function initials(name) {
  return (name || '').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function confCls(lvl) {
  if (lvl === 'HIGH')   return 'high';
  if (lvl === 'MEDIUM') return 'medium';
  return 'low';
}

function gapCls(s) {
  const n = parseInt(s) || 0;
  if (n < 33) return 'g-lo';
  if (n < 60) return 'g-me';
  return 'g-hi';
}

function avBg(name) {
  const cs = ['#DBEAFE','#D1FAE5','#FEF3C7','#FCE7F3','#EDE9FE','#CCFBF1','#FEF9C3'];
  let h = 0; for (const c of (name || '')) h += c.charCodeAt(0);
  return cs[h % cs.length];
}

function avColor(name) {
  const cs = ['#1D4ED8','#065F46','#92400E','#9D174D','#5B21B6','#0F766E','#854D0E'];
  let h = 0; for (const c of (name || '')) h += c.charCodeAt(0);
  return cs[h % cs.length];
}

function safeName(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function badge(text, cls) {
  return `<span class="badge ${cls}">${text}</span>`;
}

// Confidence bar HTML
function confBar(pct, level) {
  const cl = confCls(level);
  return `<div class="cbar-wrap">
    <div class="cbar-track"><div class="cbar-fill ${cl}" style="width:${pct}%"></div></div>
    <span class="cbar-pct">${pct}%</span>
  </div>
  <div style="margin-top:5px">${badge(level, 'badge b-' + cl)}</div>`;
}

// Gap bar HTML
function gapBar(score) {
  const s = parseInt(score) || 0;
  const gc = gapCls(s);
  return `<div class="gbar-wrap">
    <div class="gbar-track"><div class="gbar-fill ${gc}" style="width:${s}%"></div></div>
    <span class="gscore">${s}</span>
  </div>`;
}

// Quality progress bar
function qBar(label, pct, color) {
  return `<div class="qbar">
    <div class="qbar-row"><span>${label}</span><span>${pct}%</span></div>
    <div class="qbar-track"><div class="qbar-fill" style="width:${pct}%;background:${color}"></div></div>
  </div>`;
}

// Messy confidence calculator
function messyConf(r) {
  let score = 1.0, flags = [];
  if (!r.declared_skills)              { score -= 0.28; flags.push('NO_SKILL_DATA'); }
  if (!r.performance_history)          { score -= 0.18; flags.push('NO_PERF_DATA'); }
  if (r.hire_date_hris !== r.hire_date_ats) { score -= 0.10; flags.push('DATE_CONFLICT'); }
  if (r.is_near_duplicate === 'True')  { score -= 0.20; flags.push('DUPLICATE_RECORD'); }
  if (r.email_hris !== r.email_ats)   { score -= 0.10; flags.push('EMAIL_CONFLICT'); }
  score = Math.max(0, Math.round(score * 100) / 100);
  const level = score >= 0.70 ? 'HIGH' : score >= 0.45 ? 'MEDIUM' : 'LOW';
  return { score, level, flags };
}

// Toast notification
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// Chart instance tracker (prevent memory leaks)
const CHARTS = {};
function destroyChart(key) {
  if (CHARTS[key]) { try { CHARTS[key].destroy(); } catch(e) {} delete CHARTS[key]; }
}
function destroyAllCharts() {
  Object.keys(CHARTS).forEach(k => destroyChart(k));
}
