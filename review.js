/* review.js */

function renderReview() {
  const isClean = window.MODE === 'clean';

  let items;
  if (isClean) {
    items = DATA_CLEAN.filter(r => r.needs_human_review === 'True');
  } else {
    items = DATA_MESSY.filter(r =>
      r.hire_date_hris !== r.hire_date_ats ||
      r.is_near_duplicate === 'True' ||
      r.email_hris !== r.email_ats
    );
  }

  // Count flags
  const flagCount = {};
  items.forEach(r => {
    const flags = isClean
      ? (r.confidence_flags || '').split('|').filter(Boolean)
      : [
          r.hire_date_hris !== r.hire_date_ats   ? 'DATE_CONFLICT'    : null,
          r.is_near_duplicate === 'True'          ? 'DUPLICATE_RECORD' : null,
          r.email_hris !== r.email_ats            ? 'EMAIL_CONFLICT'   : null,
        ].filter(Boolean);
    flags.forEach(f => { flagCount[f] = (flagCount[f] || 0) + 1; });
  });

  const listHtml = items.map(r => {
    const name  = isClean ? r.full_name : r.full_name_hris;
    const id    = isClean ? r.master_id : r.emp_id_hris;
    const title = isClean ? r.job_title_normalized : r.job_title_hris;
    const conf  = isClean ? r.confidence_level : messyConf(r).level;
    const cl    = confCls(conf);
    const flags = isClean
      ? (r.confidence_flags || '').split('|').filter(Boolean)
      : [
          r.hire_date_hris !== r.hire_date_ats  ? 'DATE_CONFLICT'    : null,
          r.is_near_duplicate === 'True'         ? 'DUPLICATE_RECORD' : null,
          r.email_hris !== r.email_ats           ? 'EMAIL_CONFLICT'   : null,
        ].filter(Boolean);

    const topFlags = flags.slice(0, 2)
      .map(f => `<span class="badge b-flag" style="font-size:10px">${FLAG_LABELS[f] || f}</span>`)
      .join('');

    return `<div class="rev-item" onclick="${isClean ? `openDetail('${id}',event)` : `openDetailMessy('${id}',event)`}">
      <div class="rev-av" style="background:${avBg(name)};color:${avColor(name)}">${initials(name)}</div>
      <div class="rev-meta">
        <div class="rev-name">${safeName(name)}</div>
        <div class="rev-detail">${safeName(title)} · ${r.branch} · ${badge(conf, 'badge b-' + cl)}</div>
      </div>
      <div class="rev-flags">${topFlags}</div>
      <button class="act-btn act-secondary" style="font-size:12px;padding:6px 12px;white-space:nowrap;flex-shrink:0"
        onclick="${isClean ? `openDetail('${id}',event)` : `openDetailMessy('${id}',event)`}">
        Tinjau →
      </button>
    </div>`;
  }).join('');

  const flagSummary = Object.entries(flagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([f, n]) => `
      <div class="stat-row">
        <span class="stat-lbl">${FLAG_LABELS[f] || f}</span>
        <span class="badge b-flag">${n}</span>
      </div>`).join('');

  const guideItems = [
    ['IDENTITY_UNRESOLVED', 'Konfirmasi identitas karyawan dengan manajer cabang atau dokumen fisik.'],
    ['DATE_CONFLICT',       'Verifikasi tanggal bergabung di kontrak kerja asli.'],
    ['FEW_DATA_SOURCES',    'Minta karyawan melengkapi profil skill di SAP SuccessFactors.'],
    ['HIGH_INFERENCE_RATIO','Validasi inferensi skill dengan observasi langsung atasan.'],
    ['DUPLICATE_RECORD',    'Hapus rekaman duplikat, pastikan data terkonsolidasi.'],
  ].map(([f, desc]) => `
    <div style="margin-bottom:12px">
      <span class="badge b-flag" style="margin-bottom:5px;display:inline-block">${FLAG_LABELS[f] || f}</span>
      <div style="font-size:12.5px;color:var(--s600);line-height:1.6">${desc}</div>
    </div>`).join('');

  document.getElementById('pg-review').innerHTML = `
    <div class="page-hd">
      <div>
        <h1>Antrian Review</h1>
        <p>${items.length} karyawan memerlukan verifikasi sebelum rekomendasi dapat dibuat</p>
      </div>
    </div>
    ${!isClean ? `
    <div class="alert warn">
      <span class="alert-icon">⚠</span>
      <div class="alert-txt"><strong>Mode Messy:</strong> Antrian ini hanya menampilkan konflik data teknis (tanggal, duplikat, email).
      Tanpa confidence scoring, semua item terlihat setara — tidak ada cara untuk memprioritaskan mana yang paling mendesak.
      Ganti ke mode <em>Clean</em> untuk antrian yang terstruktur dan terprioritaskan.</div>
    </div>` : ''}
    <div class="gw">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Karyawan yang Perlu Ditinjau (${items.length})</div>
        </div>
        <div class="card-body np">
          ${listHtml || '<div class="empty"><div class="eico">✓</div><p>Tidak ada item untuk ditinjau</p></div>'}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">Alasan Review</div></div>
          <div class="card-body">${flagSummary}</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Panduan Tindakan</div></div>
          <div class="card-body">${guideItems}</div>
        </div>
      </div>
    </div>`;
}
