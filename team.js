/* team.js */

window.TEAM_FILTER = { search: '', branch: '', conf: '', role: '' };
window.TEAM_PAGE   = 1;
const PAGE_SIZE    = 20;

function renderTeam() {
  const isClean = window.MODE === 'clean';
  const data    = isClean ? DATA_CLEAN : DATA_MESSY;

  const branches = [...new Set(data.map(r => r.branch))].sort();
  const roles    = [...new Set(DATA_CLEAN.map(r => r.job_title_normalized))].sort();

  // ── Filter ────────────────────────────────────
  let filtered = data.filter(r => {
    const name  = isClean ? r.full_name : r.full_name_hris;
    const title = isClean ? r.job_title_normalized : r.job_title_hris;
    const s = window.TEAM_FILTER.search.toLowerCase();
    if (s && !name.toLowerCase().includes(s) && !(title||'').toLowerCase().includes(s) && !(r.branch||'').toLowerCase().includes(s)) return false;
    if (window.TEAM_FILTER.branch && r.branch !== window.TEAM_FILTER.branch) return false;
    if (isClean && window.TEAM_FILTER.conf && r.confidence_level !== window.TEAM_FILTER.conf) return false;
    if (isClean && window.TEAM_FILTER.role && r.job_title_normalized !== window.TEAM_FILTER.role) return false;
    return true;
  });

  // Sort: review first, then by gap desc
  if (isClean) {
    filtered.sort((a, b) => {
      if (a.needs_human_review === 'True' && b.needs_human_review !== 'True') return -1;
      if (b.needs_human_review === 'True' && a.needs_human_review !== 'True') return  1;
      return (parseInt(b.skill_gap_score)||0) - (parseInt(a.skill_gap_score)||0);
    });
  }

  const totalFiltered = filtered.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  if (window.TEAM_PAGE > totalPages) window.TEAM_PAGE = 1;
  const pageData = filtered.slice((window.TEAM_PAGE - 1) * PAGE_SIZE, window.TEAM_PAGE * PAGE_SIZE);

  // ── Rows ──────────────────────────────────────
  const rows = pageData.map(r => {
    const name  = isClean ? r.full_name : r.full_name_hris;
    const id    = isClean ? r.master_id : r.emp_id_hris;
    const title = isClean ? r.job_title_normalized : r.job_title_hris;

    let confHtml, gapHtml, skillHtml, actionHtml, titleExtra = '';

    if (isClean) {
      const pct = Math.round(parseFloat(r.confidence_score || 0) * 100);
      confHtml  = confBar(pct, r.confidence_level);
      gapHtml   = gapBar(r.skill_gap_score);
      const gaps = [r.top_skill_gap_1, r.top_skill_gap_2, r.top_skill_gap_3].filter(Boolean);
      skillHtml = gaps.length
        ? gaps.map(s => `<span class="chip mis">${safeName(s)}</span>`).join('')
        : `<span style="font-size:11px;color:var(--green)">✓ Tidak ada gap kritis</span>`;
      actionHtml = r.needs_human_review === 'True'
        ? `<button class="act-btn act-danger" style="padding:6px 12px;font-size:12px" onclick="openDetail('${id}',event)">Review</button>`
        : `<button class="act-btn act-secondary" style="padding:6px 12px;font-size:12px" onclick="openDetail('${id}',event)">Detail</button>`;
      if (r.job_title_raw && r.job_title_raw !== r.job_title_normalized)
        titleExtra = ` <span class="inf-tag">distandarisasi</span>`;
    } else {
      const mc  = messyConf(r);
      const pct = Math.round(mc.score * 100);
      confHtml  = confBar(pct, mc.level);
      gapHtml   = `<span style="font-size:11px;color:var(--s400);font-style:italic">—</span>`;
      skillHtml = r.declared_skills
        ? r.declared_skills.split('|').slice(0,2).map(s => `<span class="chip">${safeName(s)}</span>`).join('')
        : `<span style="font-size:11px;color:var(--red);font-style:italic">Tidak ada data skill</span>`;
      actionHtml = `<button class="act-btn act-secondary" style="padding:6px 12px;font-size:12px" onclick="openDetailMessy('${id}',event)">Lihat</button>`;
      const cb = DATA_CLEAN.find(c => c.master_id === r.emp_id_hris);
      if (cb && cb.job_title_normalized !== r.job_title_hris)
        titleExtra = ` <span class="inf-tag">non-standar</span>`;
    }

    const revDot = (isClean && r.needs_human_review === 'True')
      ? `<span style="width:7px;height:7px;border-radius:50%;background:var(--red);display:inline-block;margin-right:6px;flex-shrink:0;vertical-align:middle"></span>`
      : '';

    return `<tr onclick="${isClean ? `openDetail('${id}',event)` : `openDetailMessy('${id}',event)`}">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${revDot}
          <div style="width:34px;height:34px;border-radius:50%;background:${avBg(name)};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${avColor(name)};flex-shrink:0">${initials(name)}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--s800)">${safeName(name)}</div>
            <div class="mono">${id}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:13px">${safeName(title)}${titleExtra}</div>
        <div style="font-size:11px;color:var(--s400);margin-top:1px">${r.branch}</div>
      </td>
      <td>${confHtml}</td>
      <td>${gapHtml}</td>
      <td style="max-width:200px">${skillHtml}</td>
      <td onclick="event.stopPropagation()">${actionHtml}</td>
    </tr>`;
  }).join('');

  // ── Pagination ────────────────────────────────
  let pgHtml = '';
  if (totalPages > 1) {
    const start = Math.max(1, Math.min(totalPages - 6, window.TEAM_PAGE - 3));
    const end   = Math.min(totalPages, start + 6);
    let btns = `<button class="pg-btn" onclick="teamGoPage(${window.TEAM_PAGE-1})" ${window.TEAM_PAGE===1?'disabled':''}>←</button>`;
    for (let p = start; p <= end; p++) {
      btns += `<button class="pg-btn ${p===window.TEAM_PAGE?'active':''}" onclick="teamGoPage(${p})">${p}</button>`;
    }
    btns += `<button class="pg-btn" onclick="teamGoPage(${window.TEAM_PAGE+1})" ${window.TEAM_PAGE===totalPages?'disabled':''}>→</button>`;
    pgHtml = `<div class="pagination">${btns}<span class="pg-info">Hal. ${window.TEAM_PAGE}/${totalPages} · ${totalFiltered} hasil</span></div>`;
  }

  // ── Filter options ────────────────────────────
  const brOpts   = branches.map(b => `<option value="${b}"${window.TEAM_FILTER.branch===b?' selected':''}>${b}</option>`).join('');
  const roleOpts = roles.map(r => `<option value="${r}"${window.TEAM_FILTER.role===r?' selected':''}>${r}</option>`).join('');
  const confOpts = ['HIGH','MEDIUM','LOW'].map(c => `<option value="${c}"${window.TEAM_FILTER.conf===c?' selected':''}>${c}</option>`).join('');

  document.getElementById('pg-team').innerHTML = `
    <div class="page-hd">
      <div>
        <h1>Daftar Karyawan</h1>
        <p>${totalFiltered} dari ${data.length} karyawan</p>
      </div>
    </div>
    ${!isClean ? `<div class="alert warn"><span class="alert-icon">⚠</span><div class="alert-txt"><strong>Data Mentah:</strong> Jabatan tidak terstandarisasi. Skill Gap Score tidak dapat dihitung untuk <strong>${data.filter(r=>!r.declared_skills).length} karyawan</strong>. Ganti ke mode <em>Clean</em> untuk data yang telah diproses.</div></div>` : ''}
    <div class="toolbar">
      <div class="search-field">
        <svg class="s-ico" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <input type="text" placeholder="Cari nama, jabatan, cabang..." value="${window.TEAM_FILTER.search}" oninput="TEAM_FILTER.search=this.value;TEAM_PAGE=1;renderTeam()">
      </div>
      <select class="fsel" onchange="TEAM_FILTER.branch=this.value;TEAM_PAGE=1;renderTeam()">
        <option value="">Semua Cabang</option>${brOpts}
      </select>
      ${isClean ? `
      <select class="fsel" onchange="TEAM_FILTER.conf=this.value;TEAM_PAGE=1;renderTeam()">
        <option value="">Semua Confidence</option>${confOpts}
      </select>
      <select class="fsel" onchange="TEAM_FILTER.role=this.value;TEAM_PAGE=1;renderTeam()">
        <option value="">Semua Jabatan</option>${roleOpts}
      </select>` : ''}
      <span class="rcount">${totalFiltered} hasil</span>
    </div>
    <div class="card">
      <div class="card-body np">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width:220px">Karyawan</th>
              <th>Jabatan · Cabang</th>
              <th style="width:180px">Confidence</th>
              <th style="width:140px">Skill Gap</th>
              <th>Gap Utama</th>
              <th style="width:90px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--s400)">Tidak ada karyawan ditemukan</td></tr>'}
          </tbody>
        </table>
        ${pgHtml}
      </div>
    </div>`;
}

function teamGoPage(p) {
  const isClean = window.MODE === 'clean';
  const data = isClean ? DATA_CLEAN : DATA_MESSY;
  const total = data.filter(r => {
    const name  = isClean ? r.full_name : r.full_name_hris;
    const title = isClean ? r.job_title_normalized : r.job_title_hris;
    const s = window.TEAM_FILTER.search.toLowerCase();
    if (s && !name.toLowerCase().includes(s) && !(title||'').toLowerCase().includes(s) && !(r.branch||'').toLowerCase().includes(s)) return false;
    if (window.TEAM_FILTER.branch && r.branch !== window.TEAM_FILTER.branch) return false;
    if (isClean && window.TEAM_FILTER.conf && r.confidence_level !== window.TEAM_FILTER.conf) return false;
    if (isClean && window.TEAM_FILTER.role && r.job_title_normalized !== window.TEAM_FILTER.role) return false;
    return true;
  }).length;
  const maxP = Math.max(1, Math.ceil(total / PAGE_SIZE));
  window.TEAM_PAGE = Math.max(1, Math.min(maxP, p));
  renderTeam();
}
