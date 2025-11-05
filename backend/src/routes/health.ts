import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import config from '../config';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await checkDatabaseHealth();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      version: config.app.version,
      environment: config.app.env,
      database: {
        postgres: health.postgres ? 'connected' : 'disconnected',
        redis: health.redis ? 'connected' : 'disconnected',
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      },
      features: {
        aiEnabled: !!config.ai.anthropic.apiKey,
        fileUploadEnabled: config.features.enableFileUpload,
        emailEnabled: config.features.enableEmailNotifications,
      },
    };

    // Set status based on database health
    if (!health.postgres || !health.redis) {
      healthStatus.status = 'degraded';
      res.status(503);
    }

    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const health = await checkDatabaseHealth();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        uptime: uptime,
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      database: health,
      config: {
        nodeEnv: config.app.env,
        port: config.app.port,
        corsOrigin: config.security.corsOrigin,
        features: config.features,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;