// --- REPLACE loadDashboard with this (uses deployed backend via API helper) ---
async function loadDashboard(){
  renderLoading();

  // demo fallback payload (used if API + cache both fail)
  const demoPayload = {
    district: selectedDistrict || "Pune",
    workers: 260000,
    jobCards: 193000,
    personDays: 1600000,
    expenditure: 1942.21,
    scPersonDays: 22565,
    stPersonDays: 55030,
    womenPersonDays: 169312,
    worksCompleted: 7846,
    activeJobSeekers: 148298,
    avgDaysPerHH: 30,
    monthlyEmployment: [260000,270400,280800,291200,301600,312000],
    monthlyExpenditure: [13,14,15,16,17,18]
  };

  // 1) Try API via backend proxy (uses window.API.apiGet which points to deployed backend)
  try {
    // query object - backend expects state, district, limit, year
    const q = { state: 'Maharashtra', district: selectedDistrict, limit: 6, year: '2024-2025' };

    // use the API helper if available, else fallback to direct fetch of BACKEND constant
    let resp;
    if (window.API && typeof window.API.apiGet === 'function') {
      resp = await window.API.apiGet('/proxy', q);
    } else {
      // fallback: try the BACKEND constant (ensure BACKEND in api.js is set to your Render URL)
      const qs = Object.keys(q).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`).join('&');
      const url = (typeof BACKEND !== 'undefined' ? BACKEND : 'https://mnrega-portal.onrender.com/api') + '/proxy?' + qs;
      const r = await fetch(url, { method: 'GET' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      resp = await r.json();
    }

    const records = resp && (resp.records || resp.data || resp);
    if (records && records.length !== 0) {
      const payload = mapRemoteToUI({ records: (resp.records || resp.data || records) }, selectedDistrict);
      try { await IDB.idbPut('district:' + selectedDistrict, payload); } catch(e){ console.warn('idb put failed', e); }
      return renderDashboardUI(payload);
    }
    // If resp present but empty, fall through to cache/demo
  } catch (err) {
    console.warn('API fetch failed:', err && err.message ? err.message : err);
  }

  // 2) Try IndexedDB cache
  try {
    const cached = await IDB.idbGet('district:' + selectedDistrict);
    if (cached) {
      showOfflineNotice();
      return renderDashboardUI(cached);
    }
  } catch (e) {
    console.warn('IDB read failed', e && e.message ? e.message : e);
  }

  // 3) Final fallback: demo payload
  console.warn('Using demo payload: API+cache unavailable');
  renderDashboardUI(demoPayload);
}
// --- end replacement ---
