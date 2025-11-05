import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowOrchestrator extends EventEmitter {
  constructor(agentManager, automationEngine) {
    super();
    this.agentManager = agentManager;
    this.automationEngine = automationEngine;
    this.workflows = new Map();
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.templates = new Map();

    this.initializeTemplates();
    this.setupEventHandlers();
  }

  initializeTemplates() {
    // Predefined workflow templates
    this.templates.set('data_processing', {
      name: 'Data Processing Workflow',
      description: 'Process and analyze data with multiple agents',
      steps: [
        { id: 'collect', type: 'data_collection', agent: 'task' },
        { id: 'validate', type: 'data_validation', agent: 'analysis' },
        { id: 'process', type: 'data_processing', agent: 'task' },
        { id: 'analyze', type: 'analysis', agent: 'analysis' },
        { id: 'optimize', type: 'optimization', agent: 'optimization' }
      ]
    });

    this.templates.set('automated_workflow', {
      name: 'Automated Workflow',
      description: 'Fully automated workflow with triggers and conditions',
      steps: [
        { id: 'trigger', type: 'automation_trigger', agent: 'coordinator' },
        { id: 'execute', type: 'workflow_execution', agent: 'task' },
        { id: 'monitor', type: 'performance_monitoring', agent: 'analysis' },
        { id: 'optimize', type: 'auto_optimization', agent: 'optimization' }
      ]
    });

    this.templates.set('multi_agent_coordination', {
      name: 'Multi-Agent Coordination',
      description: 'Coordinate multiple agents for complex tasks',
      steps: [
        { id: 'plan', type: 'task_planning', agent: 'coordinator' },
        { id: 'delegate', type: 'task_delegation', agent: 'coordinator' },
        { id: 'execute', type: 'parallel_execution', agent: 'task' },
        { id: 'aggregate', type: 'result_aggregation', agent: 'analysis' },
        { id: 'validate', type: 'quality_assurance', agent: 'coordinator' }
      ]
    });
  }

  setupEventHandlers() {
    this.agentManager.on('taskCompleted', (event) => {
      this.handleAgentTaskCompleted(event);
    });

    this.agentManager.on('taskFailed', (event) => {
      this.handleAgentTaskFailed(event);
    });

    this.automationEngine.on('automationExecuted', (event) => {
      this.handleAutomationExecuted(event);
    });
  }

  async createWorkflow(config) {
    const workflow = {
      id: config.id || uuidv4(),
      name: config.name,
      description: config.description,
      type: config.type || 'custom',
      steps: config.steps || [],
      triggers: config.triggers || [],
      conditions: config.conditions || [],
      settings: {
        parallel: config.parallel || false,
        timeout: config.timeout || 300000, // 5 minutes default
        retries: config.retries || 3,
        priority: config.priority || 'normal',
        ...config.settings
      },
      created: new Date().toISOString(),
      createdBy: config.createdBy || 'system',
      version: 1,
      status: 'active'
    };

    // If using a template, merge template steps
    if (config.template && this.templates.has(config.template)) {
      const template = this.templates.get(config.template);
      workflow.steps = [...template.steps, ...workflow.steps];
      workflow.templateUsed = config.template;
    }

    // Validate workflow
    const validation = this.validateWorkflow(workflow);
    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    this.workflows.set(workflow.id, workflow);

    // Set up automation triggers if specified
    if (workflow.triggers.length > 0) {
      await this.setupWorkflowTriggers(workflow);
    }

    this.emit('workflowCreated', workflow);
    console.log(`Created workflow: ${workflow.name} (${workflow.id})`);

    return workflow;
  }

  async executeWorkflow(workflowId, context = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active: ${workflowId}`);
    }

    const execution = {
      id: uuidv4(),
      workflowId,
      workflow: { ...workflow },
      context,
      status: 'running',
      startTime: new Date().toISOString(),
      steps: workflow.steps.map(step => ({
        ...step,
        status: 'pending',
        attempts: 0,
        results: []
      })),
      results: {},
      metrics: {
        totalSteps: workflow.steps.length,
        completedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0
      }
    };

    this.activeExecutions.set(execution.id, execution);

    try {
      this.emit('workflowExecutionStarted', execution);

      let result;
      if (workflow.settings.parallel) {
        result = await this.executeParallelWorkflow(execution);
      } else {
        result = await this.executeSequentialWorkflow(execution);
      }

      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.duration = Date.now() - new Date(execution.startTime).getTime();

      this.emit('workflowExecutionCompleted', execution);

      return result;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();

      this.emit('workflowExecutionFailed', { execution, error });
      throw error;
    } finally {
      this.activeExecutions.delete(execution.id);
      this.executionHistory.push(execution);

      // Keep only last 100 executions in memory
      if (this.executionHistory.length > 100) {
        this.executionHistory = this.executionHistory.slice(-100);
      }
    }
  }

  async executeSequentialWorkflow(execution) {
    const { steps, context, workflow } = execution;

    for (const step of steps) {
      if (step.status !== 'pending') continue;

      step.status = 'running';
      step.startTime = new Date().toISOString();

      try {
        // Check step conditions
        if (step.conditions && !await this.evaluateStepConditions(step.conditions, context)) {
          step.status = 'skipped';
          step.reason = 'Conditions not met';
          execution.metrics.skippedSteps++;
          continue;
        }

        // Execute step with retries
        const stepResult = await this.executeStepWithRetries(step, context, workflow.settings.retries);

        step.status = 'completed';
        step.endTime = new Date().toISOString();
        step.results.push(stepResult);

        execution.results[step.id] = stepResult;
        execution.metrics.completedSteps++;

        // Update context with step results
        context[`${step.id}_result`] = stepResult;

        this.emit('workflowStepCompleted', { execution, step, result: stepResult });

      } catch (error) {
        step.status = 'failed';
        step.error = error.message;
        step.endTime = new Date().toISOString();
        execution.metrics.failedSteps++;

        this.emit('workflowStepFailed', { execution, step, error });

        // Check if workflow should continue on step failure
        if (!workflow.settings.continueOnError) {
          throw new Error(`Workflow failed at step ${step.id}: ${error.message}`);
        }
      }
    }

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      results: execution.results,
      metrics: execution.metrics
    };
  }

  async executeParallelWorkflow(execution) {
    const { steps, context, workflow } = execution;

    // Group steps by dependencies
    const stepGroups = this.groupStepsByDependencies(steps);

    for (const group of stepGroups) {
      const groupPromises = group.map(step => this.executeStep(step, context, workflow.settings.retries));

      try {
        const groupResults = await Promise.allSettled(groupPromises);

        groupResults.forEach((result, index) => {
          const step = group[index];
          if (result.status === 'fulfilled') {
            step.status = 'completed';
            step.results.push(result.value);
            execution.results[step.id] = result.value;
            execution.metrics.completedSteps++;
            context[`${step.id}_result`] = result.value;
          } else {
            step.status = 'failed';
            step.error = result.reason.message;
            execution.metrics.failedSteps++;

            if (!workflow.settings.continueOnError) {
              throw result.reason;
            }
          }
        });
      } catch (error) {
        throw new Error(`Parallel execution failed: ${error.message}`);
      }
    }

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      results: execution.results,
      metrics: execution.metrics
    };
  }

  async executeStep(step, context, maxRetries) {
    step.status = 'running';
    step.startTime = new Date().toISOString();

    try {
      const result = await this.executeStepWithRetries(step, context, maxRetries);
      step.status = 'completed';
      step.endTime = new Date().toISOString();
      return result;
    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      step.endTime = new Date().toISOString();
      throw error;
    }
  }

  async executeStepWithRetries(step, context, maxRetries) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      step.attempts = attempt;

      try {
        const task = this.createTaskFromStep(step, context);
        const result = await this.agentManager.delegateTask(task, step.agent);

        return {
          success: true,
          data: result,
          attempt,
          executedBy: result.executedBy || 'unknown',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        lastError = error;
        console.log(`Step ${step.id} attempt ${attempt} failed: ${error.message}`);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new Error(`Step ${step.id} failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  createTaskFromStep(step, context) {
    return {
      id: uuidv4(),
      name: step.name || `Step ${step.id}`,
      type: step.type,
      payload: {
        stepId: step.id,
        stepConfig: step.config || {},
        context,
        ...step.data
      },
      priority: step.priority || 'normal',
      timeout: step.timeout || 60000
    };
  }

  async setupWorkflowTriggers(workflow) {
    for (const trigger of workflow.triggers) {
      const automationConfig = {
        name: `Workflow Trigger: ${workflow.name}`,
        type: 'workflow_trigger',
        triggers: [trigger],
        actions: [{
          type: 'execute_workflow',
          config: {
            workflowId: workflow.id,
            context: trigger.context || {}
          }
        }]
      };

      await this.automationEngine.createAutomation(automationConfig);
    }
  }

  groupStepsByDependencies(steps) {
    const groups = [];
    const processedSteps = new Set();
    const stepMap = new Map(steps.map(step => [step.id, step]));

    while (processedSteps.size < steps.length) {
      const currentGroup = [];

      for (const step of steps) {
        if (processedSteps.has(step.id)) continue;

        const dependencies = step.dependencies || [];
        const dependenciesMet = dependencies.every(dep => processedSteps.has(dep));

        if (dependenciesMet) {
          currentGroup.push(step);
          processedSteps.add(step.id);
        }
      }

      if (currentGroup.length === 0) {
        throw new Error('Circular dependency detected in workflow steps');
      }

      groups.push(currentGroup);
    }

    return groups;
  }

  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Check for duplicate step IDs
    const stepIds = workflow.steps.map(step => step.id);
    const uniqueStepIds = new Set(stepIds);
    if (stepIds.length !== uniqueStepIds.size) {
      errors.push('Duplicate step IDs found');
    }

    // Validate step dependencies
    for (const step of workflow.steps) {
      if (step.dependencies) {
        const invalidDeps = step.dependencies.filter(dep => !stepIds.includes(dep));
        if (invalidDeps.length > 0) {
          errors.push(`Step ${step.id} has invalid dependencies: ${invalidDeps.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async evaluateStepConditions(conditions, context) {
    // Use automation engine's condition evaluation
    const result = await this.automationEngine.evaluateConditions(conditions, context);
    return result.passed;
  }

  // Event handlers
  handleAgentTaskCompleted(event) {
    console.log(`Agent task completed: ${event.task.name} by ${event.agentId}`);
  }

  handleAgentTaskFailed(event) {
    console.log(`Agent task failed: ${event.task.name} by ${event.agentId} - ${event.error.message}`);
  }

  handleAutomationExecuted(event) {
    const { automation, execution } = event;

    // Check if this is a workflow trigger automation
    const workflowAction = execution.results.find(r => r.type === 'execute_workflow');
    if (workflowAction) {
      const { workflowId, context } = workflowAction.config;
      this.executeWorkflow(workflowId, context).catch(error => {
        console.error(`Failed to execute triggered workflow ${workflowId}:`, error);
      });
    }
  }

  async handleMessage(message) {
    const { type, data } = message;

    switch (type) {
      case 'execute_workflow':
        return await this.executeWorkflow(data.workflowId, data.context);

      case 'create_workflow':
        return await this.createWorkflow(data);

      case 'get_workflow_status':
        return this.getWorkflowStatus(data.workflowId);

      case 'list_workflows':
        return this.listWorkflows();

      case 'get_execution_history':
        return this.getExecutionHistory(data.workflowId);

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  // Management methods
  getWorkflow(id) {
    return this.workflows.get(id);
  }

  listWorkflows() {
    return Array.from(this.workflows.values());
  }

  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const activeExecution = Array.from(this.activeExecutions.values())
      .find(exec => exec.workflowId === workflowId);

    const recentExecutions = this.executionHistory
      .filter(exec => exec.workflowId === workflowId)
      .slice(-10);

    return {
      workflow,
      activeExecution,
      recentExecutions,
      stats: this.getWorkflowStats(workflowId)
    };
  }

  getExecutionHistory(workflowId) {
    if (workflowId) {
      return this.executionHistory.filter(exec => exec.workflowId === workflowId);
    }
    return this.executionHistory;
  }

  getWorkflowStats(workflowId) {
    const executions = this.executionHistory.filter(exec => exec.workflowId === workflowId);

    if (executions.length === 0) {
      return { totalExecutions: 0 };
    }

    const completed = executions.filter(exec => exec.status === 'completed');
    const failed = executions.filter(exec => exec.status === 'failed');

    const avgDuration = completed.reduce((sum, exec) => sum + (exec.duration || 0), 0) / completed.length;

    return {
      totalExecutions: executions.length,
      successRate: (completed.length / executions.length) * 100,
      averageDuration: avgDuration,
      lastExecution: executions[executions.length - 1]?.startTime
    };
  }

  getSystemStats() {
    return {
      totalWorkflows: this.workflows.size,
      activeExecutions: this.activeExecutions.size,
      totalExecutions: this.executionHistory.length,
      templates: Array.from(this.templates.keys()),
      agentStats: this.agentManager.getSystemStatus(),
      automationStats: this.automationEngine.getStats()
    };
  }

  async deleteWorkflow(id) {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    // Cancel any active executions
    const activeExecutions = Array.from(this.activeExecutions.values())
      .filter(exec => exec.workflowId === id);

    for (const execution of activeExecutions) {
      execution.status = 'cancelled';
      execution.endTime = new Date().toISOString();
      this.activeExecutions.delete(execution.id);
    }

    this.workflows.delete(id);
    this.emit('workflowDeleted', { id, workflow });

    return true;
  }
}