import { Server as SocketIOServer, Socket } from 'socket.io';
import { JwtUtil } from '@/utils/auth';
import { getPrismaClient } from '@/config/database';
import { CacheService } from '@/config/redis';
import logger from '@/utils/logger';
import {
  WebSocketEvent,
  TaskUpdateEvent,
  TaskMoveEvent,
  AiAnalysisProgressEvent,
  ChatMessageEvent,
  UserPresenceEvent,
} from '@/types';

// Connected users cache
const connectedUsers = new Map<string, {
  userId: string;
  socketId: string;
  sessionId?: string;
  connectedAt: Date;
}>();

// Session rooms mapping
const sessionRooms = new Map<string, Set<string>>(); // sessionId -> Set of userIds

// Cache service instance
const cache = new CacheService();

/**
 * Authenticate socket connection
 */
const authenticateSocket = async (socket: Socket): Promise<any> => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('No authentication token provided');
    }

    const payload = JwtUtil.verifyToken(token);

    // Verify user exists
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Socket authentication failed:', error);
    throw new Error('Authentication failed');
  }
};

/**
 * Join session room
 */
const joinSessionRoom = (socket: Socket, sessionId: string, userId: string): void => {
  // Leave any existing session rooms
  Array.from(socket.rooms).forEach(room => {
    if (room.startsWith('session:')) {
      socket.leave(room);
    }
  });

  // Join new session room
  const roomName = `session:${sessionId}`;
  socket.join(roomName);

  // Update session rooms mapping
  if (!sessionRooms.has(sessionId)) {
    sessionRooms.set(sessionId, new Set());
  }
  sessionRooms.get(sessionId)!.add(userId);

  logger.info(`User ${userId} joined session ${sessionId}`);
};

/**
 * Leave session room
 */
const leaveSessionRoom = (socket: Socket, sessionId: string, userId: string): void => {
  const roomName = `session:${sessionId}`;
  socket.leave(roomName);

  // Update session rooms mapping
  const sessionUsers = sessionRooms.get(sessionId);
  if (sessionUsers) {
    sessionUsers.delete(userId);
    if (sessionUsers.size === 0) {
      sessionRooms.delete(sessionId);
    }
  }

  logger.info(`User ${userId} left session ${sessionId}`);
};

/**
 * Broadcast user presence update
 */
const broadcastUserPresence = (io: SocketIOServer, sessionId: string, userId: string, isOnline: boolean): void => {
  const event: UserPresenceEvent = {
    type: 'user_presence',
    payload: {
      userId,
      isOnline,
      lastSeen: isOnline ? undefined : new Date().toISOString(),
    },
    sessionId,
    timestamp: new Date().toISOString(),
  };

  io.to(`session:${sessionId}`).emit('user_presence', event);
};

/**
 * Handle task updates
 */
const handleTaskUpdate = async (
  io: SocketIOServer,
  socket: Socket,
  data: { taskId: string; changes: any; sessionId: string }
): Promise<void> => {
  try {
    const user = (socket as any).user;

    // Verify user has access to the task
    const prisma = getPrismaClient();
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        project: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!task || task.project?.session?.id !== data.sessionId) {
      socket.emit('error', { message: 'Task not found or access denied' });
      return;
    }

    // Update task in database
    const updatedTask = await prisma.task.update({
      where: { id: data.taskId },
      data: data.changes,
    });

    // Create event
    const event: TaskUpdateEvent = {
      type: 'task_updated',
      payload: {
        taskId: data.taskId,
        changes: data.changes,
        updatedBy: user.id,
      },
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to session room
    io.to(`session:${data.sessionId}`).emit('task_updated', event);

    // Cache the updated task
    await cache.set(`task:${data.taskId}`, updatedTask, 300); // 5 minutes

    logger.info(`Task ${data.taskId} updated by user ${user.id}`);
  } catch (error) {
    logger.error('Error handling task update:', error);
    socket.emit('error', { message: 'Failed to update task' });
  }
};

/**
 * Handle task moves
 */
const handleTaskMove = async (
  io: SocketIOServer,
  socket: Socket,
  data: { taskId: string; fromColumn: string; toColumn: string; position: number; sessionId: string }
): Promise<void> => {
  try {
    const user = (socket as any).user;

    // Update task status based on column
    const statusMapping: Record<string, string> = {
      'backlog': 'BACKLOG',
      'in_progress': 'IN_PROGRESS',
      'review': 'REVIEW',
      'completed': 'COMPLETED',
    };

    const newStatus = statusMapping[data.toColumn];
    if (!newStatus) {
      socket.emit('error', { message: 'Invalid column' });
      return;
    }

    // Update task in database
    const prisma = getPrismaClient();
    const updatedTask = await prisma.task.update({
      where: { id: data.taskId },
      data: {
        status: newStatus as any,
        position: data.position,
      },
    });

    // Create event
    const event: TaskMoveEvent = {
      type: 'task_moved',
      payload: {
        taskId: data.taskId,
        fromColumn: data.fromColumn,
        toColumn: data.toColumn,
        position: data.position,
        movedBy: user.id,
      },
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to session room
    io.to(`session:${data.sessionId}`).emit('task_moved', event);

    // Update cache
    await cache.set(`task:${data.taskId}`, updatedTask, 300);

    logger.info(`Task ${data.taskId} moved from ${data.fromColumn} to ${data.toColumn} by user ${user.id}`);
  } catch (error) {
    logger.error('Error handling task move:', error);
    socket.emit('error', { message: 'Failed to move task' });
  }
};

/**
 * Handle chat messages
 */
const handleChatMessage = async (
  io: SocketIOServer,
  socket: Socket,
  data: { message: string; sessionId: string; context?: any }
): Promise<void> => {
  try {
    const user = (socket as any).user;

    // Create chat message
    const chatMessage = {
      id: `msg_${Date.now()}_${user.id}`,
      role: 'user' as const,
      content: data.message,
      timestamp: new Date().toISOString(),
      metadata: {
        userId: user.id,
        userName: user.name,
        context: data.context,
      },
    };

    // Create event
    const event: ChatMessageEvent = {
      type: 'chat_message',
      payload: chatMessage,
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to session room
    io.to(`session:${data.sessionId}`).emit('chat_message', event);

    // Cache the message
    const messageKey = `chat:${data.sessionId}:messages`;
    const messages = await cache.get<any[]>(messageKey) || [];
    messages.push(chatMessage);

    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100);
    }

    await cache.set(messageKey, messages, 3600); // 1 hour

    logger.info(`Chat message sent by user ${user.id} in session ${data.sessionId}`);
  } catch (error) {
    logger.error('Error handling chat message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

/**
 * Setup Socket.IO server
 */
export const setupSocketIO = (io: SocketIOServer): void => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`User ${user.id} connected via WebSocket`);

    // Store connected user
    connectedUsers.set(socket.id, {
      userId: user.id,
      socketId: socket.id,
      connectedAt: new Date(),
    });

    // Handle joining sessions
    socket.on('join_session', (data: { sessionId: string }) => {
      try {
        joinSessionRoom(socket, data.sessionId, user.id);

        // Update connected user info
        const userInfo = connectedUsers.get(socket.id);
        if (userInfo) {
          userInfo.sessionId = data.sessionId;
        }

        // Broadcast user presence
        broadcastUserPresence(io, data.sessionId, user.id, true);

        socket.emit('session_joined', { sessionId: data.sessionId });
      } catch (error) {
        logger.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle leaving sessions
    socket.on('leave_session', (data: { sessionId: string }) => {
      try {
        leaveSessionRoom(socket, data.sessionId, user.id);

        // Update connected user info
        const userInfo = connectedUsers.get(socket.id);
        if (userInfo) {
          userInfo.sessionId = undefined;
        }

        // Broadcast user presence
        broadcastUserPresence(io, data.sessionId, user.id, false);

        socket.emit('session_left', { sessionId: data.sessionId });
      } catch (error) {
        logger.error('Error leaving session:', error);
        socket.emit('error', { message: 'Failed to leave session' });
      }
    });

    // Handle task updates
    socket.on('task_update', (data) => {
      handleTaskUpdate(io, socket, data);
    });

    // Handle task moves
    socket.on('task_move', (data) => {
      handleTaskMove(io, socket, data);
    });

    // Handle chat messages
    socket.on('chat_message', (data) => {
      handleChatMessage(io, socket, data);
    });

    // Handle AI analysis progress (server-side only)
    socket.on('ai_analysis_progress', (data: AiAnalysisProgressEvent) => {
      io.to(`session:${data.sessionId}`).emit('ai_analysis_progress', data);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { sessionId: string; taskId?: string }) => {
      socket.to(`session:${data.sessionId}`).emit('user_typing', {
        userId: user.id,
        taskId: data.taskId,
        isTyping: true,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('typing_stop', (data: { sessionId: string; taskId?: string }) => {
      socket.to(`session:${data.sessionId}`).emit('user_typing', {
        userId: user.id,
        taskId: data.taskId,
        isTyping: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User ${user.id} disconnected: ${reason}`);

      const userInfo = connectedUsers.get(socket.id);
      if (userInfo?.sessionId) {
        // Broadcast user offline
        broadcastUserPresence(io, userInfo.sessionId, user.id, false);

        // Leave session room
        leaveSessionRoom(socket, userInfo.sessionId, user.id);
      }

      // Remove from connected users
      connectedUsers.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.id}:`, error);
    });
  });

  logger.info('Socket.IO server configured successfully');
};

/**
 * Get connected users for a session
 */
export const getSessionUsers = (sessionId: string): string[] => {
  const users = sessionRooms.get(sessionId);
  return users ? Array.from(users) : [];
};

/**
 * Broadcast event to session
 */
export const broadcastToSession = (io: SocketIOServer, sessionId: string, event: string, data: any): void => {
  io.to(`session:${sessionId}`).emit(event, data);
};

// Export setupSocketIO as initializeWebSocket for backwards compatibility
export const initializeWebSocket = setupSocketIO;
export default setupSocketIO;