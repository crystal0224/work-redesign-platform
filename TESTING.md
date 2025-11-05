# 🧪 Testing Guide - Work Redesign Platform

This document provides comprehensive guidance on testing the Work Redesign Platform.

## 📋 Testing Strategy

Our testing approach follows the testing pyramid with:
- **70% Unit Tests**: Fast, isolated component testing
- **20% Integration Tests**: API and service integration testing
- **10% E2E Tests**: Complete user workflow testing

## 🛠 Testing Tools

### Backend Testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **Testcontainers**: Integration testing with real databases
- **MSW**: API mocking for external services

### Frontend Testing
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **User Event**: User interaction simulation

### E2E Testing
- **Playwright**: Cross-browser automation
- **Docker Compose**: Full-stack testing environment

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm run setup

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Run All Tests
```bash
# Run complete test suite
./test-runner.sh all

# Or run specific test types
./test-runner.sh unit
./test-runner.sh integration
./test-runner.sh e2e
```

### Individual Test Commands
```bash
# Backend tests
cd backend
npm test                    # Run all backend tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # With coverage report

# Frontend tests
cd frontend
npm test                    # Run all frontend tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # With coverage report

# E2E tests
npm run test:e2e           # Run all E2E tests
npm run test:e2e:headed    # Run with browser UI
npm run test:e2e:ui        # Run with Playwright UI
```

## 📁 Test Structure

```
tests/
├── e2e/                   # End-to-end tests
│   ├── auth/             # Authentication flows
│   ├── workshop/         # Workshop creation and management
│   ├── kanban/           # Kanban board interactions
│   └── ai/               # AI analysis features
├── backend/
│   ├── unit/             # Backend unit tests
│   ├── integration/      # API integration tests
│   └── utils/            # Test utilities
└── frontend/
    ├── unit/             # Frontend unit tests
    ├── integration/      # Component integration tests
    └── utils/            # Test utilities
```

## 🎯 Writing Tests

### Backend Unit Tests
```typescript
// backend/tests/unit/services/workshopService.test.ts
import { WorkshopService } from '../../../src/services/workshopService';
import { PrismaClient } from '@prisma/client';

describe('WorkshopService', () => {
  let service: WorkshopService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new WorkshopService(mockPrisma);
  });

  it('should create workshop successfully', async () => {
    const workshopData = {
      title: 'Test Workshop',
      description: 'Test description'
    };

    mockPrisma.workshop.create.mockResolvedValue({
      id: 'workshop-123',
      ...workshopData
    });

    const result = await service.createWorkshop(workshopData);

    expect(result.id).toBe('workshop-123');
    expect(mockPrisma.workshop.create).toHaveBeenCalledWith({
      data: workshopData
    });
  });
});
```

### Frontend Component Tests
```typescript
// frontend/tests/unit/components/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../../../src/components/TaskCard';

describe('TaskCard Component', () => {
  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test description',
    priority: 'HIGH',
    estimatedHours: 8
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('8h')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEdit = jest.fn();

    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

### E2E Tests
```typescript
// tests/e2e/workshop/create-workshop.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Workshop Creation', () => {
  test.use({ storageState: 'tests/e2e/auth/admin-auth.json' });

  test('should create workshop successfully', async ({ page }) => {
    await page.goto('/dashboard');

    await page.click('[data-testid="create-workshop-button"]');
    await page.fill('[data-testid="workshop-title"]', 'E2E Test Workshop');
    await page.fill('[data-testid="workshop-description"]', 'Test description');
    await page.click('[data-testid="create-button"]');

    await expect(page.getByText('Workshop created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/workshop\/[a-zA-Z0-9-]+/);
  });
});
```

## 🔄 Continuous Integration

### GitHub Actions
Our CI pipeline runs:
1. **Lint & Type Check**: Code quality verification
2. **Unit Tests**: Fast feedback on component logic
3. **Integration Tests**: API and database testing
4. **Coverage Tests**: Ensure adequate test coverage
5. **E2E Tests**: Full user workflow validation
6. **Security Audit**: Dependency vulnerability scanning
7. **Docker Build**: Container image validation

### Coverage Requirements
- **Minimum Coverage**: 80% line coverage
- **Backend**: 90% coverage target
- **Frontend**: 85% coverage target
- **Critical Paths**: 100% coverage required

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No high-severity security vulnerabilities
- Linting and type checking must pass

## 🐛 Debugging Tests

### Backend Debugging
```bash
# Run tests with debug output
cd backend
DEBUG=* npm test

# Run specific test file
npm test -- workshopService.test.ts

# Run with coverage and open report
npm run test:coverage
open coverage/lcov-report/index.html
```

### Frontend Debugging
```bash
# Run tests in watch mode
cd frontend
npm run test:watch

# Run with debug output
DEBUG_PRINT_LIMIT=0 npm test

# Open coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

### E2E Debugging
```bash
# Run with browser UI visible
npm run test:e2e:headed

# Run with Playwright UI for debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test auth/authentication.spec.ts
```

## 📊 Test Reports

### Coverage Reports
- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend/coverage/lcov-report/index.html`
- **Combined**: `coverage/combined/index.html`

### E2E Test Reports
- **HTML Report**: `test-results/playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`

### CI/CD Reports
- **GitHub Actions**: Automated test results in PR checks
- **Codecov**: Coverage tracking and trends
- **Security Reports**: Automated vulnerability scanning

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## 🎯 Best Practices

### Test Organization
- ✅ Group related tests in describe blocks
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Keep tests independent and isolated
- ✅ Use test data builders for complex objects

### Mocking Guidelines
- ✅ Mock external dependencies
- ✅ Use MSW for HTTP mocking
- ✅ Keep mocks close to reality
- ✅ Reset mocks between tests
- ✅ Verify mock interactions when relevant

### E2E Best Practices
- ✅ Use data-testid attributes for reliable selectors
- ✅ Test critical user journeys
- ✅ Keep tests independent
- ✅ Use Page Object Model for complex flows
- ✅ Handle async operations properly

### Performance Testing
- ✅ Monitor test execution time
- ✅ Use parallel execution where possible
- ✅ Profile slow tests and optimize
- ✅ Set appropriate timeouts
- ✅ Use test containers for consistent environments

## 🚨 Troubleshooting

### Common Issues

**Tests failing in CI but passing locally**
- Check environment differences
- Verify test isolation
- Review async operation handling
- Check for race conditions

**Slow test execution**
- Profile test performance
- Optimize database operations
- Use appropriate test levels
- Consider parallel execution

**Flaky E2E tests**
- Increase timeouts appropriately
- Improve element selectors
- Handle async operations better
- Check for timing issues

**Coverage not meeting thresholds**
- Identify uncovered code paths
- Add missing test cases
- Review test quality vs. quantity
- Consider edge cases

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs)
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🆘 Getting Help

If you encounter issues with testing:

1. Check this documentation
2. Review existing tests for examples
3. Check CI logs for detailed error messages
4. Ask the team in our development chat
5. Create an issue with reproduction steps

---

**Happy Testing! 🧪✨**