import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from '../../src/routes/auth';
import { workshopRoutes } from '../../src/routes/workshop';
import { aiRoutes } from '../../src/routes/ai';
import { fileRoutes } from '../../src/routes/files';
import { errorHandler } from '../../src/middleware/errorHandler';
import { setupWebSocket } from '../../src/services/websocket';

export interface TestApp {
  app: Express;
  server: any;
  io: Server;
  prisma: PrismaClient;
}

export async function createTestApp(): Promise<TestApp> {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Initialize Prisma with test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  });

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/workshops', workshopRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/files', fileRoutes);

  // WebSocket setup
  setupWebSocket(io);

  // Error handling
  app.use(errorHandler);

  return { app, server, io, prisma };
}