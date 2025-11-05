import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { setupWebSocket } from '../../src/services/websocket';
import { createTestApp } from '../utils/testApp';

describe('WebSocket Integration', () => {
  let server: any;
  let io: Server;
  let clientSocket: any;
  let port: number;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    setupWebSocket(io);

    httpServer.listen(() => {
      port = (httpServer.address() as any).port;
      done();
    });

    server = httpServer;
  });

  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      transports: ['websocket']
    });

    clientSocket.on('connect', () => {
      done();
    });
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  afterAll((done) => {
    io.close(() => {
      server.close(done);
    });
  });

  describe('Connection', () => {
    it('should connect successfully', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it('should handle disconnection', (done) => {
      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        done();
      });

      clientSocket.disconnect();
    });
  });

  describe('Workshop Events', () => {
    const mockWorkshopId = 'workshop-123';
    const mockUserId = 'user-123';

    beforeEach((done) => {
      // Join workshop room
      clientSocket.emit('join-workshop', {
        workshopId: mockWorkshopId,
        userId: mockUserId
      });

      clientSocket.on('workshop-joined', () => {
        done();
      });
    });

    it('should join workshop room', (done) => {
      // This is tested in beforeEach
      expect(clientSocket.connected).toBe(true);
      done();
    });

    it('should receive task updates', (done) => {
      const mockTaskUpdate = {
        id: 'task-123',
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        workshopId: mockWorkshopId
      };

      clientSocket.on('task-updated', (data: any) => {
        expect(data).toMatchObject(mockTaskUpdate);
        done();
      });

      // Simulate task update from another client
      clientSocket.emit('task-update', mockTaskUpdate);
    });

    it('should handle task drag and drop', (done) => {
      const mockDragData = {
        taskId: 'task-123',
        sourceColumn: 'BACKLOG',
        targetColumn: 'IN_PROGRESS',
        position: 1,
        workshopId: mockWorkshopId
      };

      clientSocket.on('task-moved', (data: any) => {
        expect(data).toMatchObject({
          taskId: 'task-123',
          sourceColumn: 'BACKLOG',
          targetColumn: 'IN_PROGRESS',
          position: 1
        });
        done();
      });

      clientSocket.emit('task-drag', mockDragData);
    });

    it('should broadcast analysis progress', (done) => {
      const mockProgress = {
        workshopId: mockWorkshopId,
        stage: 'analyzing',
        progress: 50,
        message: 'Analyzing current processes...'
      };

      clientSocket.on('analysis-progress', (data: any) => {
        expect(data).toMatchObject(mockProgress);
        done();
      });

      clientSocket.emit('analysis-start', { workshopId: mockWorkshopId });

      // Simulate progress update
      setTimeout(() => {
        io.to(`workshop:${mockWorkshopId}`).emit('analysis-progress', mockProgress);
      }, 100);
    });

    it('should handle chat messages', (done) => {
      const mockMessage = {
        id: 'msg-123',
        workshopId: mockWorkshopId,
        userId: mockUserId,
        userName: 'Test User',
        message: 'Hello everyone!',
        timestamp: new Date().toISOString()
      };

      clientSocket.on('chat-message', (data: any) => {
        expect(data).toMatchObject({
          message: 'Hello everyone!',
          userName: 'Test User'
        });
        done();
      });

      clientSocket.emit('send-message', mockMessage);
    });
  });

  describe('Real-time Collaboration', () => {
    let clientSocket2: any;
    const mockWorkshopId = 'workshop-456';

    beforeEach((done) => {
      let connectionsCount = 0;

      // Create second client
      clientSocket2 = Client(`http://localhost:${port}`, {
        transports: ['websocket']
      });

      const onConnect = () => {
        connectionsCount++;
        if (connectionsCount === 2) {
          // Both clients join the same workshop
          clientSocket.emit('join-workshop', {
            workshopId: mockWorkshopId,
            userId: 'user-1'
          });

          clientSocket2.emit('join-workshop', {
            workshopId: mockWorkshopId,
            userId: 'user-2'
          });

          done();
        }
      };

      clientSocket2.on('connect', onConnect);
      if (clientSocket.connected) {
        onConnect();
      }
    });

    afterEach(() => {
      if (clientSocket2?.connected) {
        clientSocket2.disconnect();
      }
    });

    it('should sync task updates between clients', (done) => {
      const mockTask = {
        id: 'task-sync-123',
        title: 'Synchronized Task',
        status: 'IN_PROGRESS',
        workshopId: mockWorkshopId
      };

      clientSocket2.on('task-updated', (data: any) => {
        expect(data).toMatchObject(mockTask);
        done();
      });

      // Client 1 updates a task
      clientSocket.emit('task-update', mockTask);
    });

    it('should sync user presence', (done) => {
      const mockPresence = {
        workshopId: mockWorkshopId,
        userId: 'user-1',
        userName: 'User One',
        status: 'active',
        cursor: { x: 100, y: 200 }
      };

      clientSocket2.on('user-presence', (data: any) => {
        expect(data).toMatchObject({
          userId: 'user-1',
          status: 'active'
        });
        done();
      });

      clientSocket.emit('presence-update', mockPresence);
    });

    it('should handle multiple users in chat', (done) => {
      let messagesReceived = 0;
      const expectedMessages = 2;

      const messageHandler = (data: any) => {
        messagesReceived++;
        if (messagesReceived === expectedMessages) {
          done();
        }
      };

      clientSocket.on('chat-message', messageHandler);
      clientSocket2.on('chat-message', messageHandler);

      // Both users send messages
      clientSocket.emit('send-message', {
        workshopId: mockWorkshopId,
        userId: 'user-1',
        userName: 'User One',
        message: 'Message from user 1'
      });

      setTimeout(() => {
        clientSocket2.emit('send-message', {
          workshopId: mockWorkshopId,
          userId: 'user-2',
          userName: 'User Two',
          message: 'Message from user 2'
        });
      }, 50);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid workshop join', (done) => {
      clientSocket.on('error', (error: any) => {
        expect(error.message).toContain('Invalid workshop');
        done();
      });

      clientSocket.emit('join-workshop', {
        workshopId: '', // Invalid workshop ID
        userId: 'user-123'
      });
    });

    it('should handle malformed messages', (done) => {
      clientSocket.on('error', (error: any) => {
        expect(error.message).toContain('Invalid message format');
        done();
      });

      clientSocket.emit('send-message', {
        // Missing required fields
        message: 'Invalid message'
      });
    });

    it('should rate limit message sending', (done) => {
      let errorReceived = false;

      clientSocket.on('error', (error: any) => {
        if (error.message.includes('rate limit')) {
          errorReceived = true;
        }
      });

      // Send many messages quickly
      for (let i = 0; i < 20; i++) {
        clientSocket.emit('send-message', {
          workshopId: 'workshop-123',
          userId: 'user-123',
          userName: 'Test User',
          message: `Message ${i}`
        });
      }

      setTimeout(() => {
        expect(errorReceived).toBe(true);
        done();
      }, 1000);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent connections', async () => {
      const numClients = 10;
      const clients: any[] = [];

      // Create multiple clients
      for (let i = 0; i < numClients; i++) {
        const client = Client(`http://localhost:${port}`, {
          transports: ['websocket']
        });
        clients.push(client);
      }

      // Wait for all to connect
      await Promise.all(
        clients.map(client =>
          new Promise<void>((resolve) => {
            client.on('connect', () => resolve());
          })
        )
      );

      expect(clients.every(client => client.connected)).toBe(true);

      // Cleanup
      clients.forEach(client => client.disconnect());
    });

    it('should handle message broadcasting efficiently', (done) => {
      const workshopId = 'performance-test';
      let messagesReceived = 0;

      clientSocket.on('task-updated', () => {
        messagesReceived++;
      });

      clientSocket.emit('join-workshop', {
        workshopId,
        userId: 'user-123'
      });

      clientSocket.on('workshop-joined', () => {
        // Send multiple updates
        for (let i = 0; i < 5; i++) {
          clientSocket.emit('task-update', {
            id: `task-${i}`,
            title: `Task ${i}`,
            status: 'IN_PROGRESS',
            workshopId
          });
        }

        setTimeout(() => {
          expect(messagesReceived).toBe(5);
          done();
        }, 500);
      });
    });
  });
});