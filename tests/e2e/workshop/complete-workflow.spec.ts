import { test, expect } from '@playwright/test';

test.describe('Complete Workshop Workflow', () => {
  test.use({ storageState: 'tests/e2e/auth/admin-auth.json' });

  test('should complete full 35-minute work redesign process', async ({ page }) => {
    // Start timer to verify 35-minute target
    const startTime = Date.now();

    // Step 1: Create new workshop
    await page.goto('/dashboard');
    await expect(page.getByText('Work Redesign Platform')).toBeVisible();

    await page.click('[data-testid="create-workshop-button"]');
    await expect(page.getByText('Create New Workshop')).toBeVisible();

    await page.fill('[data-testid="workshop-title"]', 'IT Department Automation Workshop');
    await page.fill('[data-testid="workshop-description"]', 'Redesigning manual processes in IT department');
    await page.selectOption('[data-testid="department-select"]', 'IT');
    await page.click('[data-testid="create-button"]');

    // Verify workshop creation
    await expect(page.getByText('Workshop created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/workshop\/[a-zA-Z0-9-]+/);

    // Step 2: Complete workshop setup wizard
    await expect(page.getByText('Workshop Setup')).toBeVisible();

    // Current processes
    await page.fill('[data-testid="current-processes"]',
      'Manual server monitoring\nEmail-based ticket system\nSpreadsheet inventory tracking\nManual backup processes');

    // Pain points
    await page.fill('[data-testid="pain-points"]',
      'High response time\nHuman errors\nLack of automation\nInconsistent processes');

    // Goals
    await page.fill('[data-testid="goals"]',
      'Reduce response time by 80%\nAutomate routine tasks\nImprove accuracy\nStandardize processes');

    // Team information
    await page.click('[data-testid="add-team-member"]');
    await page.fill('[data-testid="member-name-0"]', 'John Kim');
    await page.fill('[data-testid="member-role-0"]', 'Senior Engineer');
    await page.fill('[data-testid="member-experience-0"]', '7 years');

    await page.click('[data-testid="add-team-member"]');
    await page.fill('[data-testid="member-name-1"]', 'Sarah Lee');
    await page.fill('[data-testid="member-role-1"]', 'System Administrator');
    await page.fill('[data-testid="member-experience-1"]', '5 years');

    // Timeline and budget
    await page.selectOption('[data-testid="timeline-select"]', '3 months');
    await page.selectOption('[data-testid="budget-select"]', 'Medium');

    // Upload supporting documents
    await page.setInputFiles('[data-testid="file-upload"]', [
      'tests/e2e/fixtures/current-processes.docx',
      'tests/e2e/fixtures/team-structure.xlsx'
    ]);

    await page.click('[data-testid="start-analysis"]');

    // Step 3: AI Analysis Phase
    await expect(page.getByText('AI Analysis in Progress')).toBeVisible();

    // Wait for analysis to complete (should take 2-3 minutes)
    await page.waitForSelector('[data-testid="analysis-complete"]', {
      timeout: 180000 // 3 minutes
    });

    // Verify analysis results
    await expect(page.getByText('Analysis Complete')).toBeVisible();
    await expect(page.locator('[data-testid="generated-tasks"]')).toHaveCount.greaterThan(5);

    // Check that tasks have appropriate details
    const firstTask = page.locator('[data-testid="task-card"]').first();
    await expect(firstTask.locator('[data-testid="task-title"]')).not.toBeEmpty();
    await expect(firstTask.locator('[data-testid="task-priority"]')).toBeVisible();
    await expect(firstTask.locator('[data-testid="estimated-hours"]')).toBeVisible();

    await page.click('[data-testid="proceed-to-kanban"]');

    // Step 4: Kanban Board Interaction
    await expect(page.getByText('Workshop Kanban Board')).toBeVisible();

    // Verify kanban columns
    await expect(page.locator('[data-testid="column-BACKLOG"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-IN_PROGRESS"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-REVIEW"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-DONE"]')).toBeVisible();

    // Drag and drop tasks between columns
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const inProgressColumn = page.locator('[data-testid="column-IN_PROGRESS"]');

    await taskCard.dragTo(inProgressColumn);

    // Verify task moved
    await expect(inProgressColumn.locator('[data-testid="task-card"]')).toHaveCount.greaterThan(0);

    // Edit a task
    await taskCard.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.fill('[data-testid="task-edit-description"]',
      'Updated description with specific implementation details');
    await page.selectOption('[data-testid="task-edit-priority"]', 'HIGH');
    await page.fill('[data-testid="task-edit-hours"]', '12');

    await page.click('[data-testid="save-task"]');
    await expect(page.getByText('Task updated successfully')).toBeVisible();

    // Add a custom task
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="new-task-title"]', 'Custom Security Audit');
    await page.fill('[data-testid="new-task-description"]', 'Conduct comprehensive security audit');
    await page.selectOption('[data-testid="new-task-priority"]', 'HIGH');
    await page.fill('[data-testid="new-task-hours"]', '16');
    await page.click('[data-testid="create-task"]');

    await expect(page.getByText('Custom Security Audit')).toBeVisible();

    // Step 5: AI Agent Scenarios
    await page.click('[data-testid="generate-scenarios"]');
    await expect(page.getByText('Generating Agent Scenarios')).toBeVisible();

    // Wait for scenario generation
    await page.waitForSelector('[data-testid="scenarios-ready"]', { timeout: 120000 });

    // Review generated scenarios
    await expect(page.locator('[data-testid="scenario-card"]')).toHaveCount.greaterThan(2);

    const firstScenario = page.locator('[data-testid="scenario-card"]').first();
    await expect(firstScenario.locator('[data-testid="scenario-title"]')).not.toBeEmpty();
    await expect(firstScenario.locator('[data-testid="scenario-agents"]')).toHaveCount.greaterThan(0);

    // Select preferred scenario
    await firstScenario.click();
    await page.click('[data-testid="select-scenario"]');

    // Step 6: Real-time Collaboration Test
    // Open second browser context to simulate collaboration
    const context2 = await page.context().browser()?.newContext({
      storageState: 'tests/e2e/auth/user-auth.json'
    });
    const page2 = await context2!.newPage();

    // Join same workshop from second user
    await page2.goto(page.url());
    await expect(page2.getByText('Workshop Kanban Board')).toBeVisible();

    // First user moves a task
    const taskToMove = page.locator('[data-testid="task-card"]').nth(1);
    const reviewColumn = page.locator('[data-testid="column-REVIEW"]');
    await taskToMove.dragTo(reviewColumn);

    // Second user should see the change in real-time
    await expect(page2.locator('[data-testid="column-REVIEW"] [data-testid="task-card"]'))
      .toHaveCount.greaterThan(0);

    // Test chat functionality
    await page.fill('[data-testid="chat-input"]', 'This looks good for review!');
    await page.click('[data-testid="send-message"]');

    // Second user should see the message
    await expect(page2.getByText('This looks good for review!')).toBeVisible();

    await context2!.close();

    // Step 7: Export and Summary
    await page.click('[data-testid="finalize-workshop"]');
    await expect(page.getByText('Workshop Summary')).toBeVisible();

    // Verify summary includes all key information
    await expect(page.getByText('Total Tasks')).toBeVisible();
    await expect(page.getByText('Estimated Timeline')).toBeVisible();
    await expect(page.getByText('Expected ROI')).toBeVisible();

    // Export results
    await page.click('[data-testid="export-pdf"]');
    await expect(page.getByText('Export generated successfully')).toBeVisible();

    await page.click('[data-testid="export-excel"]');
    await expect(page.getByText('Excel export ready')).toBeVisible();

    // Step 8: Verify workshop completion time
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000 / 60; // Convert to minutes

    console.log(`Workshop completed in ${totalTime.toFixed(2)} minutes`);

    // Should complete within 35 minutes (allowing some buffer for E2E overhead)
    expect(totalTime).toBeLessThan(40);

    // Final verification
    await expect(page.getByText('Workshop Completed Successfully')).toBeVisible();

    // Verify workshop status
    await page.goto('/dashboard');
    await expect(page.getByText('IT Department Automation Workshop')).toBeVisible();
    await expect(page.locator('[data-testid="workshop-status"]').first()).toHaveText('COMPLETED');
  });

  test('should handle analysis errors gracefully', async ({ page }) => {
    // Test error handling when AI analysis fails
    await page.goto('/dashboard');
    await page.click('[data-testid="create-workshop-button"]');

    await page.fill('[data-testid="workshop-title"]', 'Error Test Workshop');
    await page.fill('[data-testid="workshop-description"]', 'Testing error scenarios');

    // Fill minimal required fields
    await page.fill('[data-testid="current-processes"]', 'Test process');
    await page.fill('[data-testid="pain-points"]', 'Test pain point');
    await page.fill('[data-testid="goals"]', 'Test goal');

    await page.click('[data-testid="create-button"]');

    // Mock API failure
    await page.route('/api/ai/analyze', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'AI service temporarily unavailable' })
      });
    });

    await page.click('[data-testid="start-analysis"]');

    // Should show error message and retry option
    await expect(page.getByText('Analysis failed')).toBeVisible();
    await expect(page.getByText('AI service temporarily unavailable')).toBeVisible();
    await expect(page.getByText('Retry Analysis')).toBeVisible();

    // Test retry functionality
    await page.unroute('/api/ai/analyze');
    await page.click('[data-testid="retry-analysis"]');

    // Should proceed normally after retry
    await expect(page.getByText('AI Analysis in Progress')).toBeVisible();
  });

  test('should maintain data persistence across browser refresh', async ({ page }) => {
    // Create workshop
    await page.goto('/dashboard');
    await page.click('[data-testid="create-workshop-button"]');

    await page.fill('[data-testid="workshop-title"]', 'Persistence Test Workshop');
    await page.fill('[data-testid="current-processes"]', 'Test process data');
    await page.click('[data-testid="create-button"]');

    const workshopUrl = page.url();

    // Refresh browser
    await page.reload();

    // Verify data is still there
    await expect(page.getByText('Persistence Test Workshop')).toBeVisible();
    await expect(page.getByText('Test process data')).toBeVisible();

    // Navigate away and back
    await page.goto('/dashboard');
    await page.goto(workshopUrl);

    // Data should still be preserved
    await expect(page.getByText('Persistence Test Workshop')).toBeVisible();
  });
});