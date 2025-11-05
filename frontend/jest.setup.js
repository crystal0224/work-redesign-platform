import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
      has: jest.fn(),
      getAll: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      toString: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock React Beautiful DnD
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }),
  Draggable: ({ children }) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock File and FileReader
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.name = filename;
    this.size = parts.reduce((acc, part) => acc + part.length, 0);
    this.type = properties?.type || '';
  }
};

global.FileReader = class MockFileReader {
  constructor() {
    this.readAsText = jest.fn();
    this.readAsDataURL = jest.fn();
    this.result = '';
    this.onload = null;
    this.onerror = null;
  }
};

// Setup MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Mock API endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-token',
        user: {
          id: 'user-123',
          email: 'test@sk.com',
          name: 'Test User',
          department: 'IT',
          position: 'Manager'
        }
      })
    );
  }),

  rest.get('/api/workshops', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'workshop-123',
          title: 'Test Workshop',
          description: 'Test workshop description',
          status: 'DRAFT',
          createdAt: new Date().toISOString()
        }
      ])
    );
  }),

  rest.post('/api/ai/analyze', (req, res, ctx) => {
    return res(
      ctx.json({
        tasks: [
          {
            id: 'task-123',
            title: 'Mock Task',
            description: 'Mock task description',
            priority: 'HIGH',
            estimatedHours: 4
          }
        ]
      })
    );
  })
);

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());