// frontend/js/api.js
// Single source of truth for backend calls (deployed backend).
// EDIT: ensure this URL matches your Render backend exact URL.
const BACKEND = 'https://mnrega-portal.onrender.com/api';

function qs(obj) {
  if (!obj) return '';
  return Object.keys(obj)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&');
}

async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : (BACKEND + path);
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
    }
    const json = await res.json().catch(()=>null);
    if (!json) throw new Error('Invalid JSON from API');
    return json;
  } catch (err) {
    throw err;
  }
}

async function apiGet(path, query) {
  const q = qs(query);
  const full = path + (q ? ('?' + q) : '');
  return apiFetch(full, { method: 'GET' });
}

window.API = { BACKEND, apiGet, apiFetch };
