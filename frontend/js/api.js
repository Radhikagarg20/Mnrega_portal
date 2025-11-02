// frontend/js/api.js
const BACKEND = 'https://mnrega-portal.onrender.com/api';

function qs(obj) {
  if (!obj) return '';
  return Object.keys(obj)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&');
}

async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : (BACKEND + path);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
  }
  const json = await res.json().catch(()=>null);
  if (!json) throw new Error('Invalid JSON from API');
  return json;
}

async function apiGet(path, query) {
  const q = qs(query);
  const full = path + (q ? ('?' + q) : '');
  return apiFetch(full, { method: 'GET' });
}

window.API = { BACKEND, apiGet, apiFetch };
