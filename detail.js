/* detail.js */

function openDetail(id, e) {
  if (e) { e.stopPropagation(); }
  const r = DATA_CLEAN.find(x => x.master_id === id);
  if (!r) return;

  const pct    = Math.round(parseFloat(r.confidence_score || 0) * 100);
  const cl     = confCls(r.confidence_level);
  const gs     = parseInt(r.skill_gap_score) || 0;
  const gc     = gapCls(gs);
  const canAct = r.confidence_level !== 'LOW';

  // Parse annotated skills
  const skillItems = (r.skills_inferred_annotated || '').split('|').filter(Boolean).map(s => {
    const m = s.match(/^(.+?)\[(.+?)\]$/);
    if (!m) return `<span class="chip">${safeName(s)}</span>`;
    const [, name, src] = m;
    const isDeclared = src === 'Declared';
    const isLMS      = src.startsWith('LMS:');
    const cls        = isDeclared ? 'chip ok' : 'chip inf';
    const tag        = !isDeclared ? `<span class="inf-tag">${isLMS ? 'LMS' : 'inferensi'}</span>` : '';
    return `<span class="${cls}" title="Sumber: ${safeName(src)}">${safeName(name)}${tag}</span>`;
  }).join('');

  const gapSkills = (r.skill_gap_skills || '').split('|').filter(Boolean)
    .map(s => `<span class="chip mis">${safeName(s)}</span>`).join('');

  const flags = (r.confidence_flags || '').split('|').filter(Boolean)
    .map(f => `<span class="badge b-flag" style="margin:2px 3px 2px 0">${FLAG_LABELS[f] || f}</span>`).join('');

  const courses = (ROLE_COURSES[r.job_title_normalized] || [])
    .map(c => `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--s50)">
      <span style="font-size:14px">📚</span>
      <span style="font-size:12.5px;color:var(--s700)">${safeName(c)}</span>
    </div>`).join('');

  const perfScore = r.performance_normalized_score ? parseInt(r.performance_normalized_score) : null;
  const idBadge   = r.identity_resolution_status === 'RESOLVED_AUTO' ? 'b-high'
                  : r.identity_resolution_status === 'RESOLVED_MANUAL' ? 'b-med' : 'b-low';

  const nameInitials = initials(r.full_name);

  document.getElementById('detail-panel').innerHTML = `
    <div class="dp-header">
      <div style="display:flex;align-items:flex-start;gap:14px">
        <div style="width:48px;height:48px;border-radius:50%;background:${avBg(r.full_name)};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${avColor(r.full_name)};flex-shrink:0">${nameInitials}</div>
        <div>
          <div class="dp-name">${safeName(r.full_name)}</div>
          <div class="dp-sub">${safeName(r.job_title_normalized)} · ${r.branch} · ${r.region}</div>
          <div class="dp-badges">
            ${badge(r.confidence_level + ' Confidence', 'badge b-' + cl)}
            ${r.needs_human_review === 'True' ? badge('⚑ Perlu Review', 'badge b-flag') : badge('✓ Siap Diproses', 'badge b-high')}
            ${badge(r.employment_status, 'badge b-neu')}
          </div>
        </div>
      </div>
      <button class="close-btn" onclick="closeOverlay()">✕</button>
    </div>
    <div class="dp-body">

      <div class="score-2up">
        <div class="score-box">
          <div class="score-box-lbl">Confidence Score</div>
          <div class="score-big">${pct}<span style="font-size:16px;color:var(--s400)">%</span></div>
          <div style="margin:8px 0">${confBar(pct, r.confidence_level)}</div>
        </div>
        <div class="score-box">
          <div class="score-box-lbl">Skill Gap Score</div>
          <div class="score-big">${gs}<span style="font-size:16px;color:var(--s400)">/100</span></div>
          <div style="margin:8px 0">${gapBar(gs)}</div>
          <div style="font-size:12px;color:var(--s500)">Readiness: <strong>${r.readiness_score || 0}/100</strong></div>
        </div>
      </div>

      <div class="det-grid">
        <div class="det-field">
          <label>ID HRIS / ATS</label>
          <p style="font-family:var(--mono);font-size:12px">${r.id_hris} · ${r.id_ats}</p>
        </div>
        <div class="det-field">
          <label>Email</label>
          <p style="font-size:12px">${safeName(r.email)}</p>
        </div>
        <div class="det-field">
          <label>Bergabung</label>
          <p>${r.hire_date_hris} ${r.hire_date_conflict === 'True' ? badge('Konflik', 'badge b-flag') : ''}</p>
        </div>
        <div class="det-field">
          <label>Masa Jabatan</label>
          <p>${r.years_in_role} tahun</p>
        </div>
        <div class="det-field">
          <label>Resolusi Identitas</label>
          <p>${badge(r.identity_resolution_status, 'badge ' + idBadge)}
            <span style="font-size:11px;color:var(--s400);margin-left:4px">(${Math.round(parseFloat(r.identity_match_score||0)*100)}% match)</span>
          </p>
        </div>
        <div class="det-field">
          <label>Skor Kinerja</label>
          <p>${perfScore !== null
            ? `${perfScore} / 100 <span style="font-size:11px;color:var(--s400)">(${r.performance_data_note || ''})</span>`
            : '<em style="color:var(--s400);font-style:italic">Tidak tersedia</em>'}</p>
        </div>
      </div>

      <div class="sec-title">Profil Kompetensi</div>
      <div style="margin-bottom:8px">
        ${skillItems || '<span style="font-size:12.5px;color:var(--s400);font-style:italic">Tidak ada data kompetensi</span>'}
      </div>
      <div style="font-size:11px;color:var(--s400);margin-bottom:16px">
        <span class="chip ok" style="font-size:10px">Declared</span> dari profil SAP SF &nbsp;
        <span class="chip inf" style="font-size:10px">LMS</span> dari riwayat kursus &nbsp;
        <span class="chip inf" style="font-size:10px">inferensi</span> dari taksonomi jabatan
      </div>

      <div class="sec-title">Gap Kompetensi (${(r.skill_gap_skills || '').split('|').filter(Boolean).length} skill belum terpenuhi)</div>
      <div style="margin-bottom:16px">
        ${gapSkills || '<span style="font-size:12.5px;color:var(--green)">✓ Tidak ada kesenjangan kompetensi teridentifikasi</span>'}
      </div>

      ${courses ? `<div class="sec-title">Rekomendasi Kursus</div><div style="margin-bottom:16px">${courses}</div>` : ''}

      ${flags ? `<div class="sec-title">Catatan Kualitas Data</div><div style="margin-bottom:16px">${flags}</div>` : ''}

      ${!canAct ? `<div class="alert warn">
        <span class="alert-icon">⊘</span>
        <div class="alert-txt">Rekomendasi tidak dapat dibuat — confidence terlalu rendah. Lengkapi data karyawan melalui antrian review terlebih dahulu.</div>
      </div>` : ''}

      <div class="act-row">
        <button class="act-btn act-primary" ${!canAct ? 'disabled' : ''}
          onclick="showToast('Rencana pengembangan untuk ${safeName(r.full_name)} berhasil dibuat ✓');closeOverlay()">
          📋 Buat Rencana Pengembangan
        </button>
        <button class="act-btn act-secondary" ${!canAct ? 'disabled' : ''}
          onclick="showToast('Kursus telah ditugaskan di Moodle ✓');closeOverlay()">
          📚 Tugaskan Kursus
        </button>
        ${r.needs_human_review === 'True'
          ? `<button class="act-btn act-danger" onclick="showToast('Ditandai untuk verifikasi manajer ✓');closeOverlay()">⚑ Tandai Review</button>`
          : ''}
      </div>
    </div>`;

  document.getElementById('overlay').classList.add('open');
}

// ── MESSY DETAIL ──────────────────────────────────────────────
function openDetailMessy(id, e) {
  if (e) { e.stopPropagation(); }
  const r = DATA_MESSY.find(x => x.emp_id_hris === id);
  if (!r) return;

  const mc  = messyConf(r);
  const pct = Math.round(mc.score * 100);
  const cl  = confCls(mc.level);

  const skillsHtml = r.declared_skills
    ? r.declared_skills.split('|').map(s => `<span class="chip">${safeName(s)}</span>`).join('')
    : `<div class="alert warn" style="margin-top:0">
        <span class="alert-icon">⊘</span>
        <div class="alert-txt">Tidak ada data kompetensi untuk karyawan ini. Pada mode Clean, skill akan diinferensikan dari LMS dan jabatan.</div>
      </div>`;

  const perfHtml = r.performance_history
    ? `<div style="font-family:var(--mono);font-size:12px;background:var(--bg);padding:12px;border-radius:var(--r-sm);color:var(--s600);line-height:2">${r.performance_history.replace(/\|\|/g, '<br>')}</div>`
    : '<em style="font-size:12.5px;color:var(--s400)">Tidak ada riwayat kinerja</em>';

  const nameMatch  = r.full_name_hris === r.full_name_ats;
  const dateMatch  = r.hire_date_hris === r.hire_date_ats;
  const emailMatch = r.email_hris === r.email_ats;
  const cleanVer   = DATA_CLEAN.find(c => c.master_id === id);

  document.getElementById('detail-panel').innerHTML = `
    <div class="dp-header">
      <div style="display:flex;align-items:flex-start;gap:14px">
        <div style="width:48px;height:48px;border-radius:50%;background:${avBg(r.full_name_hris)};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${avColor(r.full_name_hris)};flex-shrink:0">${initials(r.full_name_hris)}</div>
        <div>
          <div class="dp-name">${safeName(r.full_name_hris)}</div>
          <div class="dp-sub">${safeName(r.job_title_hris)} · ${r.branch}</div>
          <div class="dp-badges">
            ${badge(mc.level + ' Confidence', 'badge b-' + cl)}
            ${badge('Data Mentah', 'badge b-neu')}
          </div>
        </div>
      </div>
      <button class="close-btn" onclick="closeOverlay()">✕</button>
    </div>
    <div class="dp-body">
      <div class="alert warn">
        <span class="alert-icon">⚠</span>
        <div class="alert-txt">Data mentah sebelum diproses. Beberapa field mungkin tidak konsisten.
        ${cleanVer ? `<strong>Versi bersih tersedia</strong> — ganti ke mode Clean dan cari <strong>${id}</strong>.` : ''}</div>
      </div>

      <div class="sec-title">Identitas Lintas Sistem</div>
      <div class="det-grid">
        <div class="det-field"><label>ID HRIS (SAP SF)</label><p style="font-family:var(--mono);font-size:12px">${r.emp_id_hris}</p></div>
        <div class="det-field"><label>ID ATS (Workable)</label><p style="font-family:var(--mono);font-size:12px">${r.emp_id_ats}</p></div>
        <div class="det-field"><label>Nama di HRIS</label><p>${safeName(r.full_name_hris)}</p></div>
        <div class="det-field"><label>Nama di ATS</label>
          <p>${safeName(r.full_name_ats)} ${!nameMatch ? badge('Berbeda','badge b-flag') : badge('Sama','badge b-high')}</p>
        </div>
        <div class="det-field"><label>Email HRIS</label><p style="font-size:12px">${r.email_hris}</p></div>
        <div class="det-field"><label>Email ATS</label>
          <p style="font-size:12px">${r.email_ats} ${!emailMatch ? badge('Berbeda','badge b-flag') : badge('Sama','badge b-high')}</p>
        </div>
        <div class="det-field"><label>Tgl. Bergabung HRIS</label><p>${r.hire_date_hris}</p></div>
        <div class="det-field"><label>Tgl. Bergabung ATS</label>
          <p>${r.hire_date_ats} ${!dateMatch ? badge('Konflik','badge b-flag') : badge('Sama','badge b-high')}</p>
        </div>
      </div>

      <div class="sec-title">Data Kompetensi (Declared Only)</div>
      <div style="margin-bottom:16px">${skillsHtml}</div>

      <div class="sec-title">Riwayat Kinerja (Raw)</div>
      <div style="margin-bottom:16px">${perfHtml}</div>

      ${mc.flags.length ? `<div class="sec-title">Flag Kualitas Data</div>
      <div style="margin-bottom:16px">${mc.flags.map(f => `<span class="badge b-flag" style="margin:2px">${FLAG_LABELS[f]||f}</span>`).join('')}</div>` : ''}

      <div class="act-row">
        <button class="act-btn act-primary" disabled>📋 Buat Rencana Pengembangan</button>
        <span style="font-size:12.5px;color:var(--red);align-self:center">⊘ Data belum diproses</span>
      </div>
    </div>`;

  document.getElementById('overlay').classList.add('open');
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('open');
}
