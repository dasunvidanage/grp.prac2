const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const voteRoutes = require('./routes/vote');
const resultRoutes = require('./routes/results');
const adminRoutes = require('./routes/admin');
const nominationRoutes = require('./routes/nominations');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Id', 'X-Student-Id']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Session setup
app.use(session({
  secret: 'election-portal-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static assets (images, etc.)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API Routes
app.use('/api', authRoutes); // Includes /api/login
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/nominations', nominationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
