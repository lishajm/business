require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');

const app = express();
app.set('trust proxy', true); 
const PORT = process.env.PORT || 5000;

// CORS — allows Render frontend, local dev, and Capacitor APK
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000',
      'capacitor://localhost',
      'http://localhost',
    ].filter(Boolean);
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(null, true); // open CORS for now — tighten after deploy
  },
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/proposals',   require('./routes/proposals'));
app.use('/api/quotations',  require('./routes/quotations'));
app.use('/api/meetings',    require('./routes/meetings'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/reports',     require('./routes/reports'));

// Serve React frontend in production
const frontendBuild = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
