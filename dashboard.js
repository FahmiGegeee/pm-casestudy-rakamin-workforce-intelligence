/* dashboard.js */

function renderDashboard() {
  const isClean = window.MODE === 'clean';
  const data = isClean ? DATA_CLEAN : DATA_MESSY;
  const total = data.length;

  // ── Compute KPI values ─────────────────────────
  let confH, confM, confL, revCnt, missSk, avgGap;
  if (isClean) {
    confH    = data.filter(r => r.confidence_level === 'HIGH').length;
    confM    = data.filter(r => r.confidence_level === 'MEDIUM').length;
    confL    = data.filter(r => r.confidence_level === 'LOW').length;
    revCnt   = data.filter(r => r.needs_human_review === 'True').length;
    missSk   = data.filter(r => !r.skills_declared).length;
    const gs = data.map(r => parseInt(r.skill_gap_score) || 0);
    avgGap   = Math.round(gs.reduce((a,b) => a + b, 0) / gs.length);
  } else {
    const scores = data.map(r => messyConf(r));
    confH    = scores.filter(s => s.level === 'HIGH').length;
    confM    = scores.filter(s => s.level === 'MEDIUM').length;
    confL    = scores.filter(s => s.level === 'LOW').length;
    missSk   = data.filter(r => !r.declared_skills).length;
    revCnt   = data.filter(r => r.hire_date_hris !== r.hire_date_ats || r.is_near_duplicate === 'True' || r.email_hris !== r.email_ats).length;
    avgGap   = null;
  }

  // ── Branch stats ──────────────────────────────
  const brMap = {};
  data.forEach(r => {
    const b = r.branch || '?';
    if (!brMap[b]) brMap[b] = { total: 0, review: 0, gaps: [] };
    brMap[b].total++;
    if (isClean) {
      if (r.needs_human_review === 'True') brMap[b].review++;
      brMap[b].gaps.push(parseInt(r.skill_gap_score) || 0);
    } else {
      const mc = messyConf(r);
      if (mc.level === 'LOW') brMap[b].review++;
    }
  });

  // ── Role gap (clean only) ─────────────────────
  const roleMap = {};
  if (isClean) {
    data.forEach(r => {
      const role = r.job_title_normalized || 'Other';
      if (!roleMap[role]) roleMap[role] = { cnt: 0, tot: 0 };
      roleMap[role].cnt++;
      roleMap[role].tot += parseInt(r.skill_gap_score) || 0;
    });
  }
  const roleEntries = Object.entries(roleMap)
    .map(([r, v]) => ({ r, avg: Math.round(v.tot / v.cnt) }))
    .sort((a, b) => b.avg - a.avg);

  // ── Alert ─────────────────────────────────────
  const alertHtml = isClean
    ? `<div class="alert ok">
        <span class="alert-icon">✓</span>
        <div class="alert-txt"><strong>Mode Clean — Post-Processing:</strong> Data telah melalui 4-layer pipeline.
        <strong>${confH} karyawan (${Math.round(confH/total*100)}%)</strong> memiliki confidence HIGH — siap untuk rekomendasi pengembangan langsung.</div>
       </div>`
    : `<div class="alert warn">
        <span class="alert-icon">⚠</span>
        <div class="alert-txt"><strong>Mode Messy — Enterprise Reality:</strong> Kondisi data asli sebelum normalisasi.
        <strong>${missSk} karyawan (${Math.round(missSk/total*100)}%)</strong> tidak memiliki data kompetensi. Skill Gap Score tidak dapat dihitung.
        Ganti ke mode <em>Clean</em> untuk melihat output setelah data processing.</div>
       </div>`;

  // ── KPI row ───────────────────────────────────
  const kpiRow = `
    <div class="kpi-row">
      ${kpiCard('Total Karyawan', total, '10 Cabang Aktif', 'up', '', 'blue',
        `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>`)}
      ${kpiCard('Confidence HIGH', confH, Math.round(confH/total*100)+'% dari total', 'up', '', 'green',
        `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`)}
      ${kpiCard(isClean ? 'Perlu Review' : 'Data Konflik', revCnt, isClean ? 'Confidence rendah/konflik' : 'Tanggal, email, duplikat', 'down', '', 'amber',
        `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`)}
      ${isClean
        ? kpiCard('Avg. Skill Gap', avgGap, 'Skala 0–100', avgGap > 40 ? 'down' : 'up', '', 'red',
            `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>`)
        : kpiCard('Skill Tidak Diketahui', missSk, Math.round(missSk/total*100)+'% data kosong', 'down', '', 'red',
            `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>`)}
    </div>`;

  // ── Branch table ──────────────────────────────
  const branchRows = Object.entries(brMap)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([br, info]) => {
      const avg = info.gaps.length ? Math.round(info.gaps.reduce((a,b) => a+b,0) / info.gaps.length) : null;
      const revPct = Math.round(info.review / info.total * 100);
      return `<tr onclick="filterAndNav('${br}')">
        <td><strong>${br}</strong></td>
        <td><div style="font-size:13px">${info.total}</div></td>
        <td>${isClean && avg !== null ? gapBar(avg) : '<span style="font-size:11px;color:var(--s400);font-style:italic">—</span>'}</td>
        <td>${revPct > 0 ? `<span class="status-pill ${revPct > 25 ? 'sp-red' : 'sp-amber'}">${revPct}%</span>` : '<span class="status-pill sp-green">0%</span>'}</td>
      </tr>`;
    }).join('');

  // ── Quality bars ──────────────────────────────
  let qBars;
  if (isClean) {
    const idOk   = data.filter(r => r.identity_resolution_status !== 'UNRESOLVED').length;
    const skOk   = data.filter(r => (parseInt(r.skill_completeness_pct) || 0) >= 60).length;
    const pfOk   = data.filter(r => r.performance_normalized_score).length;
    const ncOk   = data.filter(r => r.hire_date_conflict !== 'True').length;
    qBars = [
      qBar('Identitas Terselesaikan',    Math.round(idOk/total*100), 'var(--green)'),
      qBar('Data Skill ≥ 60% Lengkap',  Math.round(skOk/total*100), 'var(--blue)'),
      qBar('Data Kinerja Valid',          Math.round(pfOk/total*100), 'var(--blue)'),
      qBar('Tanpa Konflik Tanggal',       Math.round(ncOk/total*100), 'var(--green)'),
      qBar('Confidence HIGH',             Math.round(confH/total*100), 'var(--green)'),
    ].join('');
  } else {
    const sk = Math.round(data.filter(r => r.declared_skills).length / total * 100);
    const pf = Math.round(data.filter(r => r.performance_history).length / total * 100);
    const em = Math.round(data.filter(r => r.email_hris === r.email_ats).length / total * 100);
    const dt = Math.round(data.filter(r => r.hire_date_hris === r.hire_date_ats).length / total * 100);
    const nd = Math.round(data.filter(r => r.is_near_duplicate !== 'True').length / total * 100);
    qBars = [
      qBar('Data Skill Tersedia',            sk, 'var(--amber)'),
      qBar('Data Kinerja Tersedia',          pf, 'var(--amber)'),
      qBar('Email Konsisten Antar Sistem',   em, 'var(--amber)'),
      qBar('Tanggal Bergabung Konsisten',    dt, 'var(--amber)'),
      qBar('Tanpa Rekaman Duplikat',         nd, 'var(--s400)'),
    ].join('');
  }

  // ── Render recent employees table ─────────────
  const recentEmps = isClean
    ? DATA_CLEAN.filter(r => r.needs_human_review === 'True').slice(0, 6)
    : DATA_MESSY.filter(r => messyConf(r).level === 'LOW').slice(0, 6);

  const recentRows = recentEmps.map(r => {
    const name  = isClean ? r.full_name : r.full_name_hris;
    const id    = isClean ? r.master_id : r.emp_id_hris;
    const title = isClean ? r.job_title_normalized : r.job_title_hris;
    const conf  = isClean ? r.confidence_level : messyConf(r).level;
    const pct   = isClean ? Math.round(parseFloat(r.confidence_score||0)*100) : Math.round(messyConf(r).score*100);
    const gs    = isClean ? parseInt(r.skill_gap_score)||0 : null;
    const sp = isClean
      ? (r.needs_human_review === 'True' ? `<span class="status-pill sp-red">Review</span>` : `<span class="status-pill sp-green">OK</span>`)
      : `<span class="status-pill sp-amber">Konflik Data</span>`;

    return `<tr onclick="${isClean ? `openDetail('${id}',event)` : `openDetailMessy('${id}',event)`}">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:${avBg(name)};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${avColor(name)};flex-shrink:0">${initials(name)}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--s800)">${safeName(name)}</div>
            <div class="mono">${id}</div>
          </div>
        </div>
      </td>
      <td>${safeName(title)}<div style="font-size:11px;color:var(--s400)">${r.branch}</div></td>
      <td>${confBar(pct, conf)}</td>
      <td>${gs !== null ? gapBar(gs) : '<span style="font-size:11px;color:var(--s400);font-style:italic">—</span>'}</td>
      <td>${sp}</td>
    </tr>`;
  }).join('');

  // ── Assemble HTML ─────────────────────────────
  const container = document.getElementById('pg-dashboard');
  container.innerHTML = `
    <div class="page-hd">
      <div>
        <h1>Dashboard</h1>
        <p>Medika Nusantara · 10 Cabang · 200 Karyawan · Data per 2025</p>
      </div>
    </div>
    ${alertHtml}
    ${kpiRow}

    <div class="gw">
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Skill Gap per Jabatan</div><div class="card-subtitle">${isClean ? 'Rata-rata skill gap score' : 'Tidak tersedia pada mode Messy'}</div></div>
        </div>
        <div class="card-body">
          ${isClean
            ? `<div class="chart-wrap" style="height:230px"><canvas id="ch-role"></canvas></div>`
            : `<div class="empty"><div class="eico">📊</div><p>Jabatan belum terstandarisasi.<br>Perbandingan lintas role tidak valid pada data mentah.</p></div>`}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Distribusi Confidence</div></div>
          <div class="card-body">
            <div class="chart-wrap" style="height:150px"><canvas id="ch-conf"></canvas></div>
            <div style="display:flex;justify-content:center;gap:16px;margin-top:12px;flex-wrap:wrap">
              <div class="legend-row"><span class="ldot" style="background:#00B894"></span>HIGH ${confH}</div>
              <div class="legend-row"><span class="ldot" style="background:#E17055"></span>MED ${confM}</div>
              <div class="legend-row"><span class="ldot" style="background:#D63031"></span>LOW ${confL}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="g2">
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Kinerja per Cabang</div><div class="card-subtitle">Klik baris untuk filter karyawan</div></div>
        </div>
        <div class="card-body np">
          <table class="tbl">
            <thead><tr><th>Cabang</th><th>Karyawan</th><th>${isClean ? 'Avg Gap' : '—'}</th><th>% Review</th></tr></thead>
            <tbody>${branchRows}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Kualitas Data</div></div>
        <div class="card-body">${qBars}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">${isClean ? 'Karyawan Prioritas Review' : 'Karyawan dengan Konflik Data'}</div><div class="card-subtitle">6 item terbaru</div></div>
        <span class="card-action" onclick="nav('${isClean ? 'review' : 'team'}', document.querySelector('[data-page=\\'${isClean ? 'review' : 'team'}\\']'))">Lihat Semua →</span>
      </div>
      <div class="card-body np">
        <table class="tbl">
          <thead><tr><th>Karyawan</th><th>Jabatan · Cabang</th><th>Confidence</th><th>Gap Score</th><th>Status</th></tr></thead>
          <tbody>${recentRows || '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--s400)">Tidak ada data</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;

  // ── Charts ────────────────────────────────────
  setTimeout(() => {
    // Conf donut
    const cc = document.getElementById('ch-conf');
    if (cc) {
      destroyChart('conf');
      CHARTS['conf'] = new Chart(cc, {
        type: 'doughnut',
        data: { labels: ['HIGH','MEDIUM','LOW'], datasets: [{ data: [confH, confM, confL], backgroundColor: ['#00B894','#E17055','#D63031'], borderWidth: 3, borderColor: '#fff', hoverOffset: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }
      });
    }
    // Role bar
    if (isClean) {
      const rc = document.getElementById('ch-role');
      if (rc && roleEntries.length) {
        destroyChart('role');
        CHARTS['role'] = new Chart(rc, {
          type: 'bar',
          data: {
            labels: roleEntries.map(e => e.r.length > 18 ? e.r.slice(0, 16) + '…' : e.r),
            datasets: [{ label: 'Avg Gap', data: roleEntries.map(e => e.avg),
              backgroundColor: roleEntries.map(e => e.avg > 50 ? '#FECACA' : e.avg > 30 ? '#FDE68A' : '#A7F3D0'),
              borderRadius: 6, borderWidth: 0 }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } },
              x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 30 } }
            }
          }
        });
      }
    }
  }, 80);
}

function kpiCard(label, value, sub, trend, change, iconCls, iconSvg) {
  const trendIcon = trend === 'up'
    ? `<svg viewBox="0 0 20 20" fill="currentColor" style="width:12px;height:12px"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/></svg>`
    : trend === 'down'
    ? `<svg viewBox="0 0 20 20" fill="currentColor" style="width:12px;height:12px"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/></svg>`
    : '';
  return `
    <div class="kpi-card">
      <div class="kpi-card-body">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        <div class="kpi-trend ${trend}">${trendIcon} ${sub}</div>
      </div>
      <div class="kpi-icon-wrap ${iconCls}">${iconSvg}</div>
    </div>`;
}

function filterAndNav(branch) {
  window.TEAM_FILTER.branch = branch;
  nav('team', document.querySelector('[data-page="team"]'));
}
