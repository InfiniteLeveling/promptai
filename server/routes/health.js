import { Router } from 'express';

const router = Router();
const startTime = Date.now();

/**
 * GET /api/health
 * Returns service status, process uptime, timestamp, and version.
 */
router.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.status(200).json({
    status: 'ok',
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    service: 'PromptArchitect AI Engine',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
