const mongoose = require('mongoose');

const CacheEntrySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  ttl: { type: Number, default: 3600 } // seconds
});

CacheEntrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 0 }); 

module.exports = mongoose.model('CacheEntry', CacheEntrySchema);
