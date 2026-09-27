import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * @route GET /api/health
 * @desc General system health overview
 */
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'PASS',
    service: 'Payroll Management SaaS API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    requestId: req.requestId,
  });
});

/**
 * @route GET /api/health/live
 * @desc Liveness probe for kubernetes/monitoring agents
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'PASS',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /api/health/ready
 * @desc Readiness probe checking database connectivity
 */
router.get('/ready', async (req, res) => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('companies').select('id').limit(1);
    const dbLatencyMs = Date.now() - start;

    if (error) {
      return res.status(503).json({
        status: 'FAIL',
        database: 'DISCONNECTED',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'PASS',
      database: 'CONNECTED',
      dbLatencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: 'FAIL',
      database: 'UNREACHABLE',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
