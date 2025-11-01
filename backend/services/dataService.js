// fetch from remote API (data.gov.in) with in-memory caching fallback.
// Supports optional MongoDB cache via CacheEntry model.
const axios = require('axios');
const NodeCache = require('node-cache');
const CacheEntry = require('../models/CacheEntry');

const cacheTtl = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10);
const memCache = new NodeCache({ stdTTL: cacheTtl, checkperiod: Math.ceil(cacheTtl/2) });

const DATA_API_BASE = process.env.DATA_API_BASE || 'https://data.gov.in/api/datastore/resource.json';

async function fetchRemote(params = {}) {
  const apiKey = process.env.DATA_API_KEY;
  const q = { ...params };
  if (apiKey) q['api-key'] = apiKey;

  try {
    const res = await axios.get(DATA_API_BASE, { params: q, timeout: 15_000 });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function getCached(key, remoteParams = null) {
  const mem = memCache.get(key);
  if (mem) return mem;

  try {
    const doc = await CacheEntry.findOne({ key }).exec();
    if (doc) {
      const age = (Date.now() - doc.createdAt.getTime()) / 1000;
      if (age < doc.ttl) {
        memCache.set(key, doc.data);
        return doc.data;
      } else {
        await CacheEntry.deleteOne({ key }).exec();
      }
    }
  } catch (e) {
    console.warn('Cache db error', e.message);
  }

  if (remoteParams) {
    const remote = await fetchRemote(remoteParams);
    memCache.set(key, remote);
    try {
      await CacheEntry.updateOne(
        { key },
        { $set: { data: remote, createdAt: new Date(), ttl: cacheTtl } },
        { upsert: true }
      ).exec();
    } catch (e) { console.warn('Failed to write cache to db', e.message); }
    return remote;
  }

  return null;
}

module.exports = {
  getCached,
  fetchRemote
};
