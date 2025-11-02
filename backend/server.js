// server.js (DB-optional safe version)
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

let mongoose;
if (process.env.MONGODB_URI && process.env.MONGODB_URI.length > 5) {
  try {
    mongoose = require('mongoose');
  } catch (e) {
    console.warn('mongoose not installed or failed to load:', e && e.message);
  }
}

const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '100kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // per IP
  message: { error: 'Too many requests, slow down' }
});
app.use('/api/', limiter);

if (process.env.MONGODB_URI && mongoose) {
  mongoose.connect(process.env.MONGODB_URI, {
   
  }).then(() => {
    console.log('✅ MongoDB connected');
  }).catch(err => {
    console.warn('Mongo connection failed', err && err.message);
    console.warn('Continuing without MongoDB. To enable DB, fix your MONGODB_URI.');
  });
} else {
  console.log('MongoDB not configured or mongoose not available — running without DB.');
}

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api', apiRoutes);

const path = require('path');
const staticPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(staticPath));
app.get('/', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));

app.use((err, req, res, next) => {
  console.error(err && err.stack || err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
