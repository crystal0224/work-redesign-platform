import { App } from './app';
import config, { validateConfig } from './config';
import logger from './utils/logger';

async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    // Create and start the application
    const app = new App();
    await app.start();

    logger.info(`🎯 Work Redesign Platform API started successfully`);
    logger.info(`📊 Process ID: ${process.pid}`);
    logger.info(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();