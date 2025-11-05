import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../../../src/hooks/useWebSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

const mockIo = io as jest.MockedFunction<typeof io>;

describe('useWebSocket Hook', () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: false,
      connect: jest.fn(),
    };

    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes socket connection', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    expect(mockIo).toHaveBeenCalledWith('http://localhost:4000', {
      transports: ['websocket'],
      forceNew: true
    });

    expect(result.current.socket).toBe(mockSocket);
  });

  it('sets up event listeners on mount', () => {
    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('joins workshop on connection', () => {
    mockSocket.connected = true;

    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    // Simulate connection
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];

    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('join-workshop', {
      workshopId: 'workshop-123',
      userId: 'user-123'
    });
  });

  it('tracks connection status', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    expect(result.current.isConnected).toBe(false);

    // Simulate connection
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);

    // Simulate disconnection
    const disconnectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )[1];

    act(() => {
      disconnectHandler();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('provides emit function', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    const testData = { message: 'test' };

    act(() => {
      result.current.emit('test-event', testData);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', testData);
  });

  it('handles task updates', () => {
    const onTaskUpdate = jest.fn();

    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123',
        onTaskUpdate
      })
    );

    expect(mockSocket.on).toHaveBeenCalledWith('task-updated', expect.any(Function));

    // Simulate task update
    const taskUpdateHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'task-updated'
    )[1];

    const mockTaskUpdate = {
      id: 'task-123',
      title: 'Updated Task',
      status: 'IN_PROGRESS'
    };

    act(() => {
      taskUpdateHandler(mockTaskUpdate);
    });

    expect(onTaskUpdate).toHaveBeenCalledWith(mockTaskUpdate);
  });

  it('handles chat messages', () => {
    const onChatMessage = jest.fn();

    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123',
        onChatMessage
      })
    );

    expect(mockSocket.on).toHaveBeenCalledWith('chat-message', expect.any(Function));

    // Simulate chat message
    const chatHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'chat-message'
    )[1];

    const mockMessage = {
      id: 'msg-123',
      userId: 'user-456',
      userName: 'John Doe',
      message: 'Hello everyone!',
      timestamp: new Date().toISOString()
    };

    act(() => {
      chatHandler(mockMessage);
    });

    expect(onChatMessage).toHaveBeenCalledWith(mockMessage);
  });

  it('handles analysis progress updates', () => {
    const onAnalysisProgress = jest.fn();

    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123',
        onAnalysisProgress
      })
    );

    expect(mockSocket.on).toHaveBeenCalledWith('analysis-progress', expect.any(Function));

    // Simulate analysis progress
    const analysisHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'analysis-progress'
    )[1];

    const mockProgress = {
      stage: 'analyzing',
      progress: 50,
      message: 'Analyzing current processes...'
    };

    act(() => {
      analysisHandler(mockProgress);
    });

    expect(onAnalysisProgress).toHaveBeenCalledWith(mockProgress);
  });

  it('sends task updates', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    const taskUpdate = {
      id: 'task-123',
      title: 'Updated Task',
      status: 'DONE'
    };

    act(() => {
      result.current.sendTaskUpdate(taskUpdate);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('task-update', taskUpdate);
  });

  it('sends chat messages', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    const message = 'Hello everyone!';

    act(() => {
      result.current.sendMessage(message);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', {
      workshopId: 'workshop-123',
      userId: 'user-123',
      message,
      timestamp: expect.any(String)
    });
  });

  it('sends drag events', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    const dragData = {
      taskId: 'task-123',
      sourceColumn: 'BACKLOG',
      targetColumn: 'IN_PROGRESS',
      position: 1
    };

    act(() => {
      result.current.sendTaskDrag(dragData);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('task-drag', {
      ...dragData,
      workshopId: 'workshop-123'
    });
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('handles reconnection', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    // Simulate disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )[1];

    act(() => {
      disconnectHandler();
    });

    expect(result.current.isConnected).toBe(false);

    // Simulate reconnect
    const connectHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];

    act(() => {
      connectHandler();
    });

    expect(result.current.isConnected).toBe(true);
    // Should rejoin workshop on reconnection
    expect(mockSocket.emit).toHaveBeenCalledWith('join-workshop', {
      workshopId: 'workshop-123',
      userId: 'user-123'
    });
  });

  it('handles errors gracefully', () => {
    const onError = jest.fn();

    renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123',
        onError
      })
    );

    // Simulate error
    const errorHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'error'
    )[1];

    const mockError = new Error('Connection failed');

    act(() => {
      errorHandler(mockError);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('prevents sending messages when disconnected', () => {
    const { result } = renderHook(() =>
      useWebSocket('http://localhost:4000', {
        workshopId: 'workshop-123',
        userId: 'user-123'
      })
    );

    // Ensure socket is disconnected
    mockSocket.connected = false;

    act(() => {
      result.current.sendMessage('This should not be sent');
    });

    expect(mockSocket.emit).not.toHaveBeenCalledWith('send-message', expect.any(Object));
  });

  it('handles workshop change', () => {
    const { rerender } = renderHook(
      ({ workshopId }) => useWebSocket('http://localhost:4000', {
        workshopId,
        userId: 'user-123'
      }),
      { initialProps: { workshopId: 'workshop-123' } }
    );

    // Change workshop
    rerender({ workshopId: 'workshop-456' });

    // Should leave old workshop and join new one
    expect(mockSocket.emit).toHaveBeenCalledWith('leave-workshop', {
      workshopId: 'workshop-123'
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('join-workshop', {
      workshopId: 'workshop-456',
      userId: 'user-123'
    });
  });
});