const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

const app = express();

// Global Middleware
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', schoolRoutes);

// Simple 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;
