const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const errandRoutes = require('./errand.routes');

// API versioning
const apiVersion = 'v1';

// Mount routes
router.use(`/api/${apiVersion}/auth`, authRoutes);
router.use(`/api/${apiVersion}/errands`, errandRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: apiVersion
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = router; 