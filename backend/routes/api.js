// Fetches District-wise MGNREGA Data at a Glance from data.gov.in
// Normalizes records for frontend charts and falls back to seeded demo data.

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

const {
  DATA_GOV_BASE_URL,
  DATA_GOV_API_KEY,
  DATA_GOV_FORMAT = 'json',
  DATA_GOV_DEFAULT_STATE = 'Maharashtra',
  DATA_GOV_DEFAULT_YEAR = '2024-2025',
  DATA_GOV_LIMIT = '10',
  DATA_GOV_OFFSET = '0'
} = process.env;

const seed = {
  "Nashik": { basePD: 280000, baseExp: 14 },
  "Pune": { basePD: 260000, baseExp: 13 },
  "Kolhapur": { basePD: 240000, baseExp: 12 },
  "Amravati": { basePD: 220000, baseExp: 11 },
  "Latur": { basePD: 210000, baseExp: 10 },
  "Dhule": { basePD: 190000, baseExp: 9 },
  "Jalna": { basePD: 230000, baseExp: 11 },
  "Raigad": { basePD: 250000, baseExp: 12 },
  "Sangli": { basePD: 245000, baseExp: 11 },
  "Washim": { basePD: 200000, baseExp: 10 }
};

function makeSeedRecords(district, months = 6) {
  const s = seed[district] || { basePD: 200000, baseExp: 10 };
  const recs = [];
  for (let i = 0; i < months; i++) {
    const pd = Math.round(s.basePD + (i * (s.basePD * 0.04)));
    const exp = Math.round(s.baseExp + (i * 1));
    recs.push({
      month_index: i + 1,
      month_label: `M${i+1}`,
      person_days: pd,
      expenditure: exp,
      total_workers: Math.round(pd / 20),
      job_cards: Math.round(pd / 14),
      SC_persondays: Math.round(pd * 0.12),
      ST_persondays: Math.round(pd * 0.06),
      Women_Persondays: Math.round(pd * 0.5)
    });
  }
  return recs;
}

// Map data.gov.in record -> normalized object frontend expects
function normalizeRecord(r, idx = 0) {
  const person_days = Number(r.Persondays_of_Central_Liability_so_far ?? r.Persondays ?? r.SC_persondays ?? r.Total_Individuals_Worked ?? 0);
  const expenditure = Number(r.Total_Exp ?? r.Total_Adm_Expenditure ?? r.Wages ?? 0);
  const total_workers = Number(r.Total_No_of_Active_Workers ?? r.Total_No_of_Workers ?? r.Total_Individuals_Worked ?? 0);
  const job_cards = Number(r.Total_No_of_JobCards_issued ?? r.Total_No_of_JobCards ?? r.Total_No_of_Job_Cards ?? 0);

  return {
    month_index: r.month ?? (r.month_index ?? (idx + 1)),
    month_label: (r.month || r.month_label || `M${idx+1}`),
    person_days: isNaN(person_days) ? 0 : person_days,
    expenditure: isNaN(expenditure) ? 0 : expenditure,
    total_workers: isNaN(total_workers) ? 0 : total_workers,
    job_cards: isNaN(job_cards) ? 0 : job_cards,
    sc_persondays: Number(r.SC_persondays ?? 0),
    st_persondays: Number(r.ST_persondays ?? 0),
    women_persondays: Number(r.Women_Persondays ?? 0)
  };
}

async function fetchFromDataGov({ state, district, year, limit, offset }) {
  if (!DATA_GOV_BASE_URL || !DATA_GOV_API_KEY) return null;

  const params = {
    'api-key': DATA_GOV_API_KEY,
    format: DATA_GOV_FORMAT || 'json',
    'filters[state_name]': state || DATA_GOV_DEFAULT_STATE,
    'filters[fin_year]': year || DATA_GOV_DEFAULT_YEAR,
    limit: limit || DATA_GOV_LIMIT,
    offset: offset || DATA_GOV_OFFSET
  };

  if (district) params['filters[district_name]'] = district;

  const url = `${DATA_GOV_BASE_URL}?${new URLSearchParams(params).toString()}`;

  try {
    const res = await axios.get(url, { timeout: 20000 });
    const body = res.data || {};
    const rawRecords = body.records || body.data || [];
    if (!Array.isArray(rawRecords) || rawRecords.length === 0) return null;

    const normalized = rawRecords.map((r, i) => normalizeRecord(r, i));
    return normalized.slice(0, Math.min(normalized.length, Number(params.limit || 6)));
  } catch (err) {
    console.warn('fetchFromDataGov error:', err && (err.message || err));
    return null;
  }
}

router.get('/proxy', async (req, res) => {
  try {
    const state = (req.query.state || DATA_GOV_DEFAULT_STATE || 'Maharashtra').toString();
    const district = req.query.district ? req.query.district.toString() : undefined;
    const year = req.query.year || DATA_GOV_DEFAULT_YEAR || '2024-2025';
    const limit = Math.min(12, Number(req.query.limit || 6));
    const offset = Number(req.query.offset || 0);

    const govRecords = await fetchFromDataGov({ state, district, year, limit, offset });
    if (govRecords && govRecords.length > 0) {
      return res.json({
        ok: true,
        source: 'data.gov.in',
        state,
        district: district || null,
        year,
        records: govRecords,
        fetched_at: new Date().toISOString()
      });
    }

    const seeded = makeSeedRecords(district || 'Nashik', limit);
    return res.json({
      ok: true,
      source: 'seed',
      state,
      district: district || 'Nashik',
      year,
      records: seeded,
      fetched_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('API proxy error:', err);
    return res.status(500).json({ ok: false, error: 'internal_error', message: String(err) });
  }
});

module.exports = router;
