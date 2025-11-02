// --- REPLACE loadDashboard() with this (uses window.API and keeps your IDB fallback) ---
async function loadDashboard(){
  renderLoading();

  // Demo fallback in case everything fails
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

  try {
    // prefer using the API helper (points to deployed backend)
    if (window.API && typeof window.API.apiGet === 'function') {
      const q = { state: 'Maharashtra', district: selectedDistrict, limit: 6, year: '2024-2025' };
      const resp = await window.API.apiGet('/proxy', q);
      // backend returns { ok: true, records: [...] } or similar
      const records = resp && (resp.records || resp.data || resp);
      if (records && records.length !== 0) {
        const payload = mapRemoteToUI({ records: (resp.records || resp.data || records) }, selectedDistrict);
        try { await IDB.idbPut('district:' + selectedDistrict, payload); } catch(e){ console.warn('idb put failed', e && e.message); }
        return renderDashboardUI(payload);
      }
    } else {
      // fallback: try calling relative path (useful for local dev where backend serves same host)
      const url = `/api/proxy?district=${encodeURIComponent(selectedDistrict)}&state=Maharashtra&limit=6`;
      const r = await fetch(url);
      if (r.ok) {
        const json = await r.json().catch(()=>null);
        const records = json && (json.records || json.data || json);
        if (records && records.length !== 0) {
          const payload = mapRemoteToUI({ records: (json.records || json.data || records) }, selectedDistrict);
          try { await IDB.idbPut('district:' + selectedDistrict, payload); } catch(e){ console.warn('idb put failed', e && e.message); }
          return renderDashboardUI(payload);
        }
      }
    }
  } catch (err) {
    console.warn('API fetch failed:', err && err.message ? err.message : err);
  }

  // Try cached data in IndexedDB
  try {
    const cached = await IDB.idbGet('district:' + selectedDistrict);
    if (cached) {
      showOfflineNotice();
      return renderDashboardUI(cached);
    }
  } catch (e) {
    console.warn('IDB read failed', e && e.message ? e.message : e);
  }

  // Final fallback: demo payload
  console.warn('Using demo payload (API + cache failed)');
  renderDashboardUI(demoPayload);
}
