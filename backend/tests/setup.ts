import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock external services
jest.mock('@anthropic-ai/sdk');
jest.mock('nodemailer');

// Setup MSW for API mocking
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Mock Claude API
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Mocked Claude response'
          }
        ],
        model: 'claude-3-sonnet-20240229',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 10,
          output_tokens: 5
        }
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