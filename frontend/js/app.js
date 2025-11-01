(function(){
  const DISTRICTS = [
  "Amravati","Dhule","Jalna","Kolhapur","Latur","Nashik","Parbhani","Pune","Raigad","Sangli","Washim"
];

  let selectedDistrict = localStorage.getItem('district') || null;
  let offlineNoticeShown = false;

  const app = document.getElementById('app');

  function numberIndian(n){
    if (n === null || n === undefined) return '-';
    const abs = Math.abs(n);
    if (abs >= 10000000) return (n/10000000).toFixed(2) + ' Cr';
    if (abs >= 100000) return (n/100000).toFixed(2) + ' Lakh';
    return n.toLocaleString('en-IN');
  }

  function renderLanding(){
    app.innerHTML = `
      <div class="container">
        <div class="header">
          <div class="brand">
            <div aria-hidden="true">🌾</div>
            <div>
              <h1>${t('appTitle')}</h1>
              <p>${t('appSubtitle')}</p>
            </div>
          </div>
          <div class="controls">
            <select class="lang-select" id="langSel">
              <option value="en" ${currentLang==='en'?'selected':''}>English</option>
              <option value="hi" ${currentLang==='hi'?'selected':''}>हिन्दी</option>
            </select>
            <button class="btn btn-ghost" id="aboutBtn">i</button>
          </div>
        </div>

        <div class="landing center">
          <div class="card">
            <div class="huge">${t('welcome')}</div>
            <div class="lead">${t('appSubtitle')}</div>

            <div style="display:flex;gap:12px;margin-top:18px;flex-wrap:wrap">
              <button id="autoDetectBtn" class="btn btn-primary big-btn">${t('autoDetect')}</button>
            </div>

            <div class="form-group">
              <label class="kicker">${t('selectDistrict')}</label>
              <select id="districtSelect" class="select">
                <option value="">-- ${t('selectDistrict')} --</option>
                ${DISTRICTS.map(d => `<option value="${d}" ${selectedDistrict===d?'selected':''}>${d}</option>`).join('')}
              </select>
            </div>

            <div style="margin-top:12px">
              <button id="viewBtn" class="btn btn-primary big-btn">${t('viewDashboard')}</button>
            </div>

            <p class="footer" style="margin-top:12px">${t('footer')}</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('viewBtn').addEventListener('click', onView);
    document.getElementById('autoDetectBtn').addEventListener('click', autoDetectLocation);
    document.getElementById('langSel').addEventListener('change', e => {
      setLang(e.target.value);
      renderLanding();
    });
  }

  async function onView(){
    const sel = document.getElementById('districtSelect').value;
    if (!sel) { alert(t('pleaseSelect')); return; }
    selectedDistrict = sel;
    localStorage.setItem('district', selectedDistrict);
    await loadDashboard();
  }

  async function autoDetectLocation(){
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    try {
      const p = new Promise((res,rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
      const pos = await p;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const rg = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
      const r = await fetch(rg, { headers: { 'User-Agent':'MGNREGA-Tracker/1.0' } });
      const json = await r.json();

      const districtName = (json.address && (json.address.county || json.address.state_district || json.address.city || json.address.town)) || json.display_name;
      const matched = DISTRICTS.find(d => districtName && districtName.toLowerCase().includes(d.split(' ')[0].toLowerCase()));
      if (matched) {
        selectedDistrict = matched;
        localStorage.setItem('district', selectedDistrict);
        await loadDashboard();
      } else {
        alert('Detected location: ' + (districtName || 'Unknown') + '. Please pick your district in the list.');
      }
    } catch (err) {
      console.warn('geoloc failed', err.message);
      alert('Auto-detect failed. Please select district manually.');
    }
  }

  async function loadDashboard(){
    renderLoading();
    try {
      const q = { district: selectedDistrict, state: 'Maharashtra', limit: 6 };
      const resp = await fetch(`http://127.0.0.1:5000/api/proxy?district=${selectedDistrict}&state=Maharashtra&limit=6`);
      const json = await resp.json();
      const payload = mapRemoteToUI(json, selectedDistrict);

      try { await IDB.idbPut('district:' + selectedDistrict, payload); } catch(e){ console.warn('idb put failed', e.message); }
      renderDashboardUI(payload);
    } catch (err) {
      const cached = await IDB.idbGet('district:' + selectedDistrict);
      if (cached) {
        showOfflineNotice();
        return renderDashboardUI(cached);
      }
      console.error(err);
      alert('Failed to load data and no cache available.');
      renderLanding();
    }
  }

  function renderLoading(){
    app.innerHTML = `<div class="container"><div class="card center"><div class="kicker">Loading…</div><h2 class="huge">⏳</h2></div></div>`;
  }

  function showOfflineNotice(){
    if (offlineNoticeShown) return;
    offlineNoticeShown = true;
    const el = document.createElement('div');
    el.style.position='fixed';el.style.bottom='12px';el.style.left='12px';
    el.style.background='#fff3bf';el.style.padding='10px 12px';el.style.borderRadius='10px';
    el.style.boxShadow='0 6px 18px rgba(2,6,23,0.06)';
    el.textContent = t('offlineNotice');
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 8000);
  }

  function mapRemoteToUI(raw, district) {
    const demo = {
      district,
      workers: raw && raw.records && raw.records[0] && raw.records[0].total_workers ? parseInt(raw.records[0].total_workers) : 85000,
      jobCards: raw && raw.records && raw.records[0] && raw.records[0].job_cards ? parseInt(raw.records[0].job_cards) : 140000,
      personDays: raw && raw.records && raw.records[0] && raw.records[0].person_days ? parseInt(raw.records[0].person_days) : 1400000,
      expenditure: raw && raw.records && raw.records[0] && raw.records[0].expenditure ? parseFloat(raw.records[0].expenditure) : 70,
      scPersonDays: 280000,
      stPersonDays: 140000,
      womenPersonDays: 700000,
      worksCompleted: 450,
      activeJobSeekers: 65000,
      avgDaysPerHH: 85,
      monthlyEmployment: raw && raw.records && raw.records.map(r => Number(r.person_days || 200000)).slice(0,6),
      monthlyExpenditure: raw && raw.records && raw.records.map(r => Number(r.expenditure || 10)).slice(0,6)
    };

    while (demo.monthlyEmployment.length < 6) demo.monthlyEmployment.push(200000);
    while (demo.monthlyExpenditure.length < 6) demo.monthlyExpenditure.push(10);
    return demo;
  }

  function renderDashboardUI(data){
    app.innerHTML = `
      <div class="container">
        <div class="header">
          <div class="brand">
            <div aria-hidden="true">🌾</div>
            <div>
              <h1>${data.district}</h1>
              <p>${t('appSubtitle')}</p>
            </div>
          </div>
          <div class="controls">
            <select class="lang-select" id="langSel2">
              <option value="en" ${currentLang==='en'?'selected':''}>English</option>
              <option value="hi" ${currentLang==='hi'?'selected':''}>हिन्दी</option>
            </select>
            <button class="btn btn-ghost" id="changeBtn">${t('changeDistrict')}</button>
          </div>
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="title">${t('totalWorkers')}</div>
            <div class="value">${numberIndian(data.workers)}</div>
          </div>
          <div class="metric">
            <div class="title">${t('jobCards')}</div>
            <div class="value">${numberIndian(data.jobCards)}</div>
          </div>
          <div class="metric">
            <div class="title">${t('personDays')}</div>
            <div class="value">${numberIndian(data.personDays)}</div>
          </div>
          <div class="metric">
            <div class="title">${t('totalExpenditure')}</div>
            <div class="value">₹ ${data.expenditure} Cr</div>
          </div>
        </div>

        <div class="charts">
          <div class="card-chart">
            <div class="chart-title">${t('employmentTrend')}</div>
            <canvas id="employmentChart"></canvas>
          </div>
          <div class="card-chart">
            <div class="chart-title">${t('expenditureTrend')}</div>
            <canvas id="expenditureChart"></canvas>
          </div>
        </div>

        <div style="margin-top:12px" class="card">
          <div class="kicker">${t('detailedStats')}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:8px">
            <div class="metric"><div class="title">${t('scPersonDays')}</div><div class="value">${numberIndian(data.scPersonDays)}</div></div>
            <div class="metric"><div class="title">${t('stPersonDays')}</div><div class="value">${numberIndian(data.stPersonDays)}</div></div>
            <div class="metric"><div class="title">${t('womenPersonDays')}</div><div class="value">${numberIndian(data.womenPersonDays)}</div></div>
            <div class="metric"><div class="title">${t('worksCompleted')}</div><div class="value">${numberIndian(data.worksCompleted)}</div></div>
            <div class="metric"><div class="title">${t('activeJobSeekers')}</div><div class="value">${numberIndian(data.activeJobSeekers)}</div></div>
            <div class="metric"><div class="title">${t('avgDaysPerHH')}</div><div class="value">${data.avgDaysPerHH}</div></div>
          </div>
        </div>

        <p class="footer">${t('footer')}</p>
      </div>
    `;

    // events
    document.getElementById('changeBtn').addEventListener('click', ()=>{
      selectedDistrict = null;
      localStorage.removeItem('district');
      renderLanding();
    });
    document.getElementById('langSel2').addEventListener('change', e => { setLang(e.target.value); loadDashboard(); });

    renderCharts(data);
  }

  function renderCharts(data){
    const months = t('months');
    const empCtx = document.getElementById('employmentChart');
    const expCtx = document.getElementById('expenditureChart');

    if (window.empChart) window.empChart.destroy();
    if (window.expChart) window.expChart.destroy();

    window.empChart = new Chart(empCtx, {
      type: 'line',
      data: { labels: months, datasets: [{ label: t('personDays'), data: data.monthlyEmployment, fill:true, tension:0.4 }] },
      options:{ plugins:{legend:{display:false}}, responsive:true }
    });

    window.expChart = new Chart(expCtx, {
      type: 'bar',
      data: { labels: months, datasets: [{ label: t('totalExpenditure'), data: data.monthlyExpenditure }] },
      options:{ plugins:{legend:{display:false}}, responsive:true }
    });
  }

  if (selectedDistrict) loadDashboard(); else renderLanding();
})();
