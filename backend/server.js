// backend/server.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple seeded data generator (consistent demo)
const seed = {
  "Pune": { basePD: 260000, baseExp: 13 },
  "Amravati": { basePD: 300000, baseExp: 14 },
  "Nashik": { basePD: 280000, baseExp: 13 },
  "Raigad": { basePD: 240000, baseExp: 12 },
  "Jalna": { basePD: 301600, baseExp: 17 },
  "Parbhani": { basePD: 270000, baseExp: 14 },
  "Washim": { basePD: 220000, baseExp: 11 },
  "Kolhapur": { basePD: 230000, baseExp: 12 },
  "Dhule": { basePD: 210000, baseExp: 11 },
  "Latur": { basePD: 250000, baseExp: 12 },
  "Sangli": { basePD: 225000, baseExp: 11 }
};

function makeRecords(district, months = 6) {
  const s = seed[district] || { basePD: 200000, baseExp: 10 };
  const recs = [];
  for (let i = 0; i < months; i++) {
    const pd = Math.round(s.basePD + i * (s.basePD * 0.04));
    const exp = Math.round(s.baseExp + i);
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

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint: tries data.gov API first, falls back to seeded data
app.get('/api/proxy', async (req, res) => {
  try {
    const district = (req.query.district || req.query.filters?.district_name || 'Pune').toString();
    const state = (req.query.state || req.query.filters?.state_name || process.env.DATA_GOV_DEFAULT_STATE || 'Maharashtra');
    const limit = Math.min(12, Number(req.query.limit) || Number(process.env.DATA_GOV_LIMIT) || 6);
    const year = req.query.year || process.env.DATA_GOV_DEFAULT_YEAR || '2024-2025';

    // Try external data.gov.in
    if (process.env.DATA_GOV_BASE_URL && process.env.DATA_GOV_API_KEY) {
      const params = new URLSearchParams({
        'api-key': process.env.DATA_GOV_API_KEY,
        format: process.env.DATA_GOV_FORMAT || 'json',
        limit: String(limit),
        offset: String(process.env.DATA_GOV_OFFSET || 0),
      });
      // filters support (state_name, fin_year)
      params.append('filters[state_name]', state);
      if (year) params.append('filters[fin_year]', year);

      const url = `${process.env.DATA_GOV_BASE_URL}?${params.toString()}`;
      try {
        const r = await axios.get(url, { timeout: 10000 });
        const body = r.data;
        if (body && Array.isArray(body.records) && body.records.length > 0) {
          // filter records for the requested district (case-insensitive contains)
          const recs = body.records.filter(rec => {
            const dn = (rec.district_name || '').toString().toLowerCase();
            return dn.includes(district.toLowerCase().split(' ')[0]) || district.toLowerCase().includes(dn.split(' ')[0]);
          }).slice(0, limit);

          if (recs.length > 0) {
            return res.json({ ok: true, source: 'data_gov', state, district, records: recs, fetched_at: new Date().toISOString() });
          }
        }
      } catch (err) {
        console.warn('DataGov fetch failed:', err && err.message ? err.message : err);
        // proceed to fallback
      }
    }

    // Fallback to seeded data
    const records = makeRecords(district, limit);
    return res.json({ ok: true, source: 'seed', state, district, records, fetched_at: new Date().toISOString() });
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
