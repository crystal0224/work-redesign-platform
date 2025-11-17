import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import config from './config';
import { logger, httpLogger } from './config/logger';
import { connectDatabase, checkDatabaseHealth } from './config/database';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware';

// Import routes
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import domainRoutes from './routes/domains';
import fileRoutes from './routes/files';
import aiRoutes from './routes/ai';
import taskRoutes from './routes/tasks';
import healthRoutes from './routes/health';

// Import WebSocket handlers
import { initializeWebSocket } from './services/websocket';

export class App {
  public app: express.Application;
  public server: HttpServer;
  public io!: SocketIOServer; // Use definite assignment assertion since it's initialized in initializeWebSocket

  constructor() {
    this.app = express();
    this.server = new HttpServer(this.app);

    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDatabase();
      logger.info('Database connections initialized');
    } catch (error) {
      logger.error('Failed to initialize database connections:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.security.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: config.security.rateLimitRpm,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Trust proxy for correct IP addresses
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check endpoint (no auth required)
    this.app.use('/health', healthRoutes);

    // API version prefix
    const apiPrefix = '/api';

    // Public routes (no authentication required)
    this.app.use(`${apiPrefix}/auth`, authRoutes);

    // Protected routes (authentication required)
    this.app.use(`${apiPrefix}/sessions`, authMiddleware, sessionRoutes);
    this.app.use(`${apiPrefix}/domains`, authMiddleware, domainRoutes);
    this.app.use(`${apiPrefix}/files`, authMiddleware, fileRoutes);
    this.app.use(`${apiPrefix}/ai`, authMiddleware, aiRoutes);
    this.app.use(`${apiPrefix}/tasks`, authMiddleware, taskRoutes);

    // API documentation (development only)
    if (config.development.enableSwagger && config.app.env === 'development') {
      this.app.get('/docs', (req, res) => {
        res.send(`
          <h1>Work Redesign Platform API Documentation</h1>
          <p>API documentation is available at: <a href="/api-docs">/api-docs</a></p>
          <h2>Available Endpoints:</h2>
          <ul>
            <li><strong>GET</strong> /health - Health check</li>
            <li><strong>POST</strong> /api/auth/login - User login</li>
            <li><strong>GET</strong> /api/auth/me - Get current user</li>
            <li><strong>POST</strong> /api/sessions - Create workshop session</li>
            <li><strong>GET</strong> /api/sessions/:id - Get session details</li>
            <li><strong>POST</strong> /api/domains - Create domain</li>
            <li><strong>POST</strong> /api/files/upload - Upload files</li>
            <li><strong>POST</strong> /api/ai/analyze - Start AI analysis</li>
            <li><strong>GET</strong> /api/tasks - Get tasks</li>
          </ul>
        `);
      });
    }

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      });
    });
  }

  private initializeWebSocket(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.security.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize WebSocket event handlers
    initializeWebSocket(this.io);

    logger.info('WebSocket server initialized');
  }

  private initializeErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('SIGTERM');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown('SIGTERM');
    });

    // Handle process termination
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  public async start(): Promise<void> {
    const port = config.app.port;

    this.server.listen(port, () => {
      logger.info(`🚀 Work Redesign Platform API Server running on port ${port}`);
      logger.info(`📱 Environment: ${config.app.env}`);
      logger.info(`🌐 CORS Origin: ${config.security.corsOrigin}`);

      if (config.development.enableSwagger && config.app.env === 'development') {
        logger.info(`📚 API Documentation: http://localhost:${port}/docs`);
      }
    });

    // Perform initial health check
    setTimeout(async () => {
      try {
        const health = await checkDatabaseHealth();
        logger.info('Initial health check:', health);
      } catch (error) {
        logger.error('Initial health check failed:', error);
      }
    }, 1000);
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Close HTTP server
    this.server.close(async (error) => {
      if (error) {
        logger.error('Error during HTTP server shutdown:', error);
      } else {
        logger.info('HTTP server closed');
      }

      try {
        // Close WebSocket connections
        this.io.close();
        logger.info('WebSocket server closed');

        // Close database connections
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): HttpServer {
    return this.server;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}