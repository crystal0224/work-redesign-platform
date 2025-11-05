import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../../config/logger';
import config from '../../config';
import { claudeService } from '../ai/claudeService';
import { session } from '../../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

interface AnalysisProgress {
  step: string;
  progress: number;
  message: string;
}

interface ChatMessage {
  sessionId: string;
  taskId?: string;
  message: string;
  timestamp: number;
}

interface ChatResponse {
  response: string;
  suggestions: string[];
  isResolved: boolean;
  timestamp: number;
}

export function initializeWebSocket(io: SocketIOServer): void {
  // Authentication middleware for WebSocket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
      socket.userId = decoded.userId;

      logger.info(`WebSocket client authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`WebSocket client connected: ${socket.id} (User: ${socket.userId})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle session joining
    socket.on('join_session', async (sessionId: string) => {
      try {
        // Verify session belongs to user
        const sessionData = await session.get(sessionId);
        if (!sessionData || sessionData.userId !== socket.userId) {
          socket.emit('error', { message: 'Session not found or access denied' });
          return;
        }

        socket.sessionId = sessionId;
        socket.join(`session:${sessionId}`);

        logger.info(`User ${socket.userId} joined session ${sessionId}`);
        socket.emit('session_joined', { sessionId });
      } catch (error) {
        logger.error('Failed to join session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle leaving session
    socket.on('leave_session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      socket.sessionId = undefined;
      logger.info(`User ${socket.userId} left session ${sessionId}`);
      socket.emit('session_left', { sessionId });
    });

    // Handle AI analysis start
    socket.on('start_analysis', async (data: {
      sessionId: string;
      domains: string[];
      documents: string;
    }) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        logger.info(`Starting AI analysis for session ${data.sessionId}`);

        // Emit progress updates
        const emitProgress = (step: string, progress: number, message: string) => {
          const progressData: AnalysisProgress = { step, progress, message };
          socket.emit('analysis_progress', progressData);
          socket.to(`session:${data.sessionId}`).emit('analysis_progress', progressData);
        };

        emitProgress('validation', 10, '입력 데이터 검증 중...');

        // Validate input
        if (!data.domains.length || !data.documents.trim()) {
          socket.emit('analysis_error', { message: '도메인과 문서 내용이 필요합니다.' });
          return;
        }

        emitProgress('preprocessing', 30, '문서 전처리 중...');

        // Simulate preprocessing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        emitProgress('analysis', 50, 'AI 분석 진행 중...');

        // Call Claude API
        const analysisInput = {
          domains: data.domains,
          documents: data.documents,
        };

        const tasks = await claudeService.analyzeWorkTasks(analysisInput);

        emitProgress('processing', 80, '결과 처리 중...');

        // Store results in session
        await session.set(`analysis:${data.sessionId}`, {
          tasks,
          analyzedAt: new Date().toISOString(),
        });

        emitProgress('complete', 100, '분석 완료!');

        // Emit final results
        socket.emit('analysis_complete', {
          sessionId: data.sessionId,
          tasks,
          analyzedAt: new Date().toISOString(),
        });

        socket.to(`session:${data.sessionId}`).emit('analysis_complete', {
          sessionId: data.sessionId,
          tasks,
          analyzedAt: new Date().toISOString(),
        });

        logger.info(`AI analysis completed for session ${data.sessionId} - ${tasks.length} tasks identified`);

      } catch (error) {
        logger.error('AI analysis failed:', error);
        socket.emit('analysis_error', {
          message: error instanceof Error ? error.message : 'Analysis failed',
        });
      }
    });

    // Handle AI chat for clarification
    socket.on('chat_message', async (data: ChatMessage) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        logger.info(`Chat message received for session ${data.sessionId}`);

        // Get conversation history
        const conversationKey = `chat:${data.sessionId}:${data.taskId || 'general'}`;
        const history = await session.get(conversationKey) || [];

        // Add user message to history
        history.push({
          role: 'user',
          content: data.message,
          timestamp: data.timestamp,
        });

        // Emit typing indicator
        socket.emit('chat_typing', true);
        socket.to(`session:${data.sessionId}`).emit('chat_typing', true);

        // Get AI response
        const response = await claudeService.chatClarification(
          data.taskId || 'general',
          data.message,
          history.slice(-10) // Keep last 10 messages for context
        );

        // Add AI response to history
        history.push({
          role: 'assistant',
          content: response.response,
          timestamp: Date.now(),
        });

        // Save updated history
        await session.set(conversationKey, history);

        // Stop typing indicator
        socket.emit('chat_typing', false);
        socket.to(`session:${data.sessionId}`).emit('chat_typing', false);

        // Send response
        const chatResponse: ChatResponse = {
          ...response,
          timestamp: Date.now(),
        };

        socket.emit('chat_response', chatResponse);
        socket.to(`session:${data.sessionId}`).emit('chat_response', chatResponse);

        logger.info(`Chat response sent for session ${data.sessionId}`);

      } catch (error) {
        logger.error('Chat message handling failed:', error);
        socket.emit('chat_typing', false);
        socket.emit('chat_error', {
          message: error instanceof Error ? error.message : 'Chat failed',
        });
      }
    });

    // Handle task updates
    socket.on('task_update', async (data: {
      sessionId: string;
      taskId: string;
      updates: any;
    }) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        // Broadcast task update to all clients in the session
        socket.to(`session:${data.sessionId}`).emit('task_updated', {
          taskId: data.taskId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: Date.now(),
        });

        logger.info(`Task ${data.taskId} updated in session ${data.sessionId}`);

      } catch (error) {
        logger.error('Task update handling failed:', error);
        socket.emit('error', { message: 'Task update failed' });
      }
    });

    // Handle task reordering
    socket.on('task_reorder', async (data: {
      sessionId: string;
      taskIds: string[];
    }) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        // Broadcast reorder to all clients in the session
        socket.to(`session:${data.sessionId}`).emit('tasks_reordered', {
          taskIds: data.taskIds,
          reorderedBy: socket.userId,
          timestamp: Date.now(),
        });

        logger.info(`Tasks reordered in session ${data.sessionId}`);

      } catch (error) {
        logger.error('Task reorder handling failed:', error);
        socket.emit('error', { message: 'Task reorder failed' });
      }
    });

    // Handle agent scenario generation
    socket.on('generate_scenarios', async (data: {
      sessionId: string;
      taskId: string;
      task: any;
    }) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        logger.info(`Generating scenarios for task ${data.taskId} in session ${data.sessionId}`);

        socket.emit('scenario_generation_progress', {
          taskId: data.taskId,
          progress: 0,
          message: 'Agent 시나리오 생성 시작...',
        });

        // Generate agent scenarios
        const scenarioResult = await claudeService.generateAgentScenarios(data.task);

        socket.emit('scenario_generation_progress', {
          taskId: data.taskId,
          progress: 100,
          message: '시나리오 생성 완료!',
        });

        // Send results
        socket.emit('scenarios_generated', {
          taskId: data.taskId,
          ...scenarioResult,
          generatedAt: new Date().toISOString(),
        });

        socket.to(`session:${data.sessionId}`).emit('scenarios_generated', {
          taskId: data.taskId,
          ...scenarioResult,
          generatedAt: new Date().toISOString(),
        });

        logger.info(`Scenarios generated for task ${data.taskId}`);

      } catch (error) {
        logger.error('Scenario generation failed:', error);
        socket.emit('scenario_generation_error', {
          taskId: data.taskId,
          message: error instanceof Error ? error.message : 'Scenario generation failed',
        });
      }
    });

    // Handle priority recommendations
    socket.on('get_priority_recommendations', async (data: {
      sessionId: string;
      tasks: any[];
    }) => {
      try {
        if (!socket.sessionId || socket.sessionId !== data.sessionId) {
          socket.emit('error', { message: 'Invalid session' });
          return;
        }

        logger.info(`Getting priority recommendations for session ${data.sessionId}`);

        const priorities = await claudeService.recommendPriorities(data.tasks);

        socket.emit('priority_recommendations', {
          sessionId: data.sessionId,
          priorities,
          generatedAt: new Date().toISOString(),
        });

        logger.info(`Priority recommendations sent for session ${data.sessionId}`);

      } catch (error) {
        logger.error('Priority recommendation failed:', error);
        socket.emit('priority_error', {
          message: error instanceof Error ? error.message : 'Priority recommendation failed',
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);

      // Leave all rooms
      if (socket.sessionId) {
        socket.leave(`session:${socket.sessionId}`);
      }
      if (socket.userId) {
        socket.leave(`user:${socket.userId}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  logger.info('WebSocket handlers initialized');
}

// Utility functions for broadcasting
export function broadcastToSession(io: SocketIOServer, sessionId: string, event: string, data: any): void {
  io.to(`session:${sessionId}`).emit(event, data);
}

export function broadcastToUser(io: SocketIOServer, userId: string, event: string, data: any): void {
  io.to(`user:${userId}`).emit(event, data);
}