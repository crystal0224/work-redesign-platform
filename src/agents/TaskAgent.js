import { BaseAgent } from './BaseAgent.js';

export class TaskAgent extends BaseAgent {
  constructor(id) {
    super(id, 'task');
    this.capabilities = [
      'execute_workflows',
      'process_data',
      'file_operations',
      'api_calls',
      'task_automation'
    ];
  }

  async processTask(task) {
    console.log(`TaskAgent ${this.id} processing task:`, task.name);

    switch (task.type) {
      case 'workflow':
        return await this.executeWorkflow(task);
      case 'data_processing':
        return await this.processData(task);
      case 'file_operation':
        return await this.handleFileOperation(task);
      case 'api_call':
        return await this.makeApiCall(task);
      default:
        return await this.executeGenericTask(task);
    }
  }

  async executeWorkflow(task) {
    const { steps, data } = task.payload;
    const results = [];

    for (const step of steps) {
      try {
        const stepResult = await this.executeStep(step, data);
        results.push(stepResult);

        // Store intermediate results
        this.storeMemory(`step_${step.id}_result`, stepResult);
      } catch (error) {
        throw new Error(`Workflow step ${step.id} failed: ${error.message}`);
      }
    }

    return {
      success: true,
      results,
      executedAt: new Date().toISOString()
    };
  }

  async executeStep(step, data) {
    console.log(`Executing step: ${step.name}`);

    // Simulate step execution based on step type
    switch (step.type) {
      case 'transform':
        return this.transformData(data, step.config);
      case 'validate':
        return this.validateData(data, step.config);
      case 'aggregate':
        return this.aggregateData(data, step.config);
      default:
        return { message: `Step ${step.name} executed`, data };
    }
  }

  async processData(task) {
    const { data, operations } = task.payload;
    let processedData = data;

    for (const operation of operations) {
      processedData = await this.applyOperation(processedData, operation);
    }

    return {
      success: true,
      processedData,
      operationsApplied: operations.length
    };
  }

  async handleFileOperation(task) {
    const { operation, path, content } = task.payload;

    // Simulate file operations
    switch (operation) {
      case 'read':
        return { content: `Simulated content from ${path}` };
      case 'write':
        return { success: true, message: `Written to ${path}` };
      case 'delete':
        return { success: true, message: `Deleted ${path}` };
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  async makeApiCall(task) {
    const { url, method, data } = task.payload;

    // Simulate API call
    console.log(`Making ${method} request to ${url}`);

    return {
      success: true,
      status: 200,
      data: { message: 'API call simulated', requestedUrl: url }
    };
  }

  async executeGenericTask(task) {
    // Handle any generic task
    console.log(`Executing generic task: ${task.name}`);

    return {
      success: true,
      message: `Task ${task.name} completed`,
      executedBy: this.id,
      timestamp: new Date().toISOString()
    };
  }

  transformData(data, config) {
    // Simulate data transformation
    return { ...data, transformed: true, config };
  }

  validateData(data, config) {
    // Simulate data validation
    return { valid: true, data, validationRules: config };
  }

  aggregateData(data, config) {
    // Simulate data aggregation
    return { aggregated: true, count: Array.isArray(data) ? data.length : 1, config };
  }

  applyOperation(data, operation) {
    // Simulate operation application
    console.log(`Applying operation: ${operation.type}`);
    return { ...data, operation: operation.type };
  }

  canHandleTask(task) {
    const handledTypes = ['workflow', 'data_processing', 'file_operation', 'api_call', 'generic'];
    return handledTypes.includes(task.type);
  }
}