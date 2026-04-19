/* compare.js */

function renderCompare() {
  const totalA = DATA_MESSY.length, totalB = DATA_CLEAN.length;
  const missSk    = DATA_MESSY.filter(r => !r.declared_skills).length;
  const dateConf  = DATA_MESSY.filter(r => r.hire_date_hris !== r.hire_date_ats).length;
  const dup       = DATA_MESSY.filter(r => r.is_near_duplicate === 'True').length;
  const emailConf = DATA_MESSY.filter(r => r.email_hris !== r.email_ats).length;
  const confH     = DATA_CLEAN.filter(r => r.confidence_level === 'HIGH').length;
  const revB      = DATA_CLEAN.filter(r => r.needs_human_review === 'True').length;
  const avgGapB   = Math.round(DATA_CLEAN.map(r => parseInt(r.skill_gap_score)||0).reduce((a,b)=>a+b,0)/totalB);
  const idResB    = DATA_CLEAN.filter(r => r.identity_resolution_status !== 'UNRESOLVED').length;
  const titleNorm = DATA_CLEAN.filter(r => r.job_title_raw !== r.job_title_normalized).length;

  const samples = ['EMP-2009','EMP-2001','EMP-2004','EMP-2023','EMP-2002','EMP-2010'];
  const sampleRows = samples.map(sid => {
    const a = DATA_MESSY.find(r => r.emp_id_hris === sid);
    const b = DATA_CLEAN.find(r => r.master_id === sid);
    if (!a || !b) return '';
    const mcA   = messyConf(a);
    const pctA  = Math.round(mcA.score * 100);
    const pctB  = Math.round(parseFloat(b.confidence_score || 0) * 100);
    const changed = a.job_title_hris !== b.job_title_normalized;
    const topGaps = [b.top_skill_gap_1, b.top_skill_gap_2].filter(Boolean);
    return `<tr>
      <td>
        <div style="font-size:13px;font-weight:600">${safeName(b.full_name)}</div>
        <div class="mono">${sid}</div>
      </td>
      <td>
        <div style="font-size:11.5px;color:var(--amber);margin-bottom:2px">${safeName(a.job_title_hris)}</div>
        <div style="font-size:11.5px;color:var(--green)">${safeName(b.job_title_normalized)}${changed?'<span style="font-size:10px;color:var(--s400);margin-left:4px">(distandarisasi)</span>':''}</div>
      </td>
      <td>
        <div style="display:flex;flex-direction:column;gap:3px">
          ${badge('A: '+mcA.level+' ('+pctA+'%)', 'badge b-'+confCls(mcA.level))}
          ${badge('B: '+b.confidence_level+' ('+pctB+'%)', 'badge b-'+confCls(b.confidence_level))}
        </div>
      </td>
      <td>
        <div style="font-size:11px;color:var(--s400);margin-bottom:3px;font-style:italic">${a.declared_skills || '—'}</div>
        <div style="font-size:11px;color:var(--blue)">${(b.skills_inferred_annotated||'').split('|').slice(0,2).map(s=>s.replace(/\[.*?\]/g,'')).join(', ')||'—'}</div>
      </td>
      <td>
        <div style="font-size:11px;color:var(--s400);margin-bottom:3px;font-style:italic">Tidak dapat dihitung</div>
        ${gapBar(b.skill_gap_score)}
      </td>
      <td>
        ${topGaps.length
          ? topGaps.map(s=>`<span class="chip mis" style="font-size:10px">${safeName(s)}</span>`).join('')
          : '<span style="font-size:11px;color:var(--green)">✓ Tidak ada gap</span>'}
      </td>
      <td>${b.needs_human_review==='True' ? badge('⚑ Review','badge b-flag') : badge('✓ OK','badge b-high')}</td>
    </tr>`;
  }).join('');

  // Gap distribution buckets
  const buckets = [0,0,0,0,0];
  DATA_CLEAN.forEach(r => {
    const g = parseInt(r.skill_gap_score) || 0;
    buckets[Math.min(4, Math.floor(g / 20))]++;
  });

  const statList = (rows) => rows.map(([l,v]) => `<div class="stat-row"><span class="stat-lbl">${l}</span><span class="stat-val">${v}</span></div>`).join('');

  document.getElementById('pg-compare').innerHTML = `
    <div class="page-hd">
      <div>
        <h1>Perbandingan: Messy vs. Clean</h1>
        <p>Dampak nyata data processing layer terhadap kualitas insight AI</p>
      </div>
    </div>

    <div class="g3" style="margin-bottom:24px">
      <div class="card" style="border-top:3px solid var(--amber)">
        <div class="card-header"><div class="card-title" style="color:var(--amber)">Dataset A — Messy</div></div>
        <div class="card-body">
          ${statList([
            ['Total Karyawan', totalA],
            ['Tanpa Data Skill', missSk+' ('+Math.round(missSk/totalA*100)+'%)'],
            ['Konflik Tanggal', dateConf],
            ['Konflik Email', emailConf],
            ['Record Duplikat', dup],
            ['Gap Score Tersedia', '0 (tidak dapat dihitung)'],
            ['Insight Actionable', 'Sangat terbatas'],
          ])}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--s300)" stroke-width="2" style="width:28px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <div style="text-align:center;font-size:11px;color:var(--s400);font-weight:600;line-height:1.6;padding:0 8px">
          4-Layer<br>Data Pipeline<br>
          <span style="font-weight:400">L1 Ingestion<br>L2 Identity<br>L3 Normalisasi<br>L4 Feature Store</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--s300)" stroke-width="2" style="width:28px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>

      <div class="card" style="border-top:3px solid var(--green)">
        <div class="card-header"><div class="card-title" style="color:var(--green)">Dataset B — Clean</div></div>
        <div class="card-body">
          ${statList([
            ['Total Karyawan', totalB],
            ['Identitas Terselesaikan', idResB+' ('+Math.round(idResB/totalB*100)+'%)'],
            ['Jabatan Distandarisasi', titleNorm+' dari '+totalB],
            ['Confidence HIGH', confH+' ('+Math.round(confH/totalB*100)+'%)'],
            ['Perlu Review Manual', revB],
            ['Avg. Skill Gap Score', avgGapB+' / 100'],
            ['Insight Actionable', 'Penuh — siap rekomendasikan'],
          ])}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><div class="card-title">Transformasi per Karyawan — 6 Contoh Nyata dari Dataset</div></div>
      <div class="card-body np" style="overflow-x:auto">
        <table class="tbl" style="min-width:800px">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Jabatan (A → B)</th>
              <th>Confidence (A → B)</th>
              <th>Skill (A → B)</th>
              <th>Gap Score</th>
              <th>Gap Kritis</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${sampleRows}</tbody>
        </table>
      </div>
    </div>

    <div class="g2">
      <div class="card">
        <div class="card-header"><div class="card-title">Dampak terhadap Model AI</div></div>
        <div class="card-body">
          <div style="margin-bottom:16px">
            <div style="font-size:11px;font-weight:700;color:var(--amber);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Dataset A — Messy</div>
            ${[
              'Skill Gap Score tidak dapat dihitung untuk '+missSk+' karyawan — model menganggap mereka tidak memiliki kompetensi sama sekali, menghasilkan false positive yang tinggi',
              'Job title yang berbeda (contoh: "Sales 2" vs "Sales Executive") membuat analisis per-role tidak valid secara statistik',
              dup+' duplikat menyebabkan orang yang sama dianalisis dua kali dengan hasil berpotensi berbeda',
              'Tidak ada mekanisme membedakan "tidak punya skill" vs "data tidak tersedia" — keduanya terlihat identik oleh model',
            ].map(p => `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:flex-start">
              <span style="color:var(--red);font-size:16px;flex-shrink:0;line-height:1.2">✗</span>
              <p style="font-size:12.5px;color:var(--s600);line-height:1.6">${p}</p>
            </div>`).join('')}
          </div>
          <div class="hdivider"></div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em">Dataset B — Clean</div>
            ${[
              'Skill Gap Score tersedia untuk 100% karyawan — inferensi 3-tier mengisi missing data dengan sumber yang dapat ditelusuri',
              '10 kategori jabatan standar memungkinkan perbandingan akurat lintas 90 cabang',
              'Satu rekaman per karyawan — tidak ada duplikat, tidak ada kontradiksi',
              'Confidence level per karyawan memberikan sinyal kapan output model dapat dipercaya vs kapan perlu verifikasi manual',
            ].map(p => `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:flex-start">
              <span style="color:var(--green);font-size:16px;flex-shrink:0;line-height:1.2">✓</span>
              <p style="font-size:12.5px;color:var(--s600);line-height:1.6">${p}</p>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Distribusi Gap Score (Clean)</div></div>
        <div class="card-body">
          <div class="chart-wrap" style="height:180px"><canvas id="ch-gapdist"></canvas></div>
          <div style="margin-top:12px">
            ${[
              ['Gap Score 0–33 (Rendah)', DATA_CLEAN.filter(r=>parseInt(r.skill_gap_score)<33).length, 'var(--green)'],
              ['Gap Score 33–66 (Sedang)', DATA_CLEAN.filter(r=>{const g=parseInt(r.skill_gap_score);return g>=33&&g<66;}).length, 'var(--amber)'],
              ['Gap Score ≥ 66 (Tinggi)', DATA_CLEAN.filter(r=>parseInt(r.skill_gap_score)>=66).length, 'var(--red)'],
            ].map(([l,v,c]) => `<div class="stat-row"><span class="stat-lbl">${l}</span><span class="stat-val" style="color:${c}">${v} karyawan</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  // Chart
  setTimeout(() => {
    const el = document.getElementById('ch-gapdist');
    if (!el) return;
    destroyChart('gapdist');
    CHARTS['gapdist'] = new Chart(el, {
      type: 'bar',
      data: {
        labels: ['0–20','20–40','40–60','60–80','80–100'],
        datasets: [{ label: 'Jumlah Karyawan', data: buckets,
          backgroundColor: ['#A7F3D0','#BBF7D0','#FDE68A','#FECACA','#F87171'],
          borderRadius: 6, borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, stepSize: 10 } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }, 80);
}
