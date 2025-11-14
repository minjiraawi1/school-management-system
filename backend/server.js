const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({ origin: corsOrigin, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const classesRoutes = require('./routes/classesRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const assignmentsRoutes = require('./routes/assignmentsRoutes');
const resultsRoutes = require('./routes/resultsRoutes');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'School Result System API is running!' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/results', resultsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}`);
  console.log(`For local connections: http://localhost:${PORT}`);
  console.log(`For remote connections: http://YOUR_IP:${PORT}`);
});

module.exports = app;
