import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class AutomationEngine extends EventEmitter {
  constructor() {
    super();
    this.automations = new Map();
    this.triggers = new Map();
    this.scheduledTasks = new Map();
    this.isRunning = false;
    this.executionQueue = [];
    this.processors = new Map();

    this.initializeProcessors();
  }

  initializeProcessors() {
    this.processors.set('schedule', new ScheduleProcessor());
    this.processors.set('event', new EventProcessor());
    this.processors.set('condition', new ConditionProcessor());
    this.processors.set('webhook', new WebhookProcessor());
    this.processors.set('data', new DataProcessor());
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Automation Engine started');

    // Start processing queue
    this.processQueue();

    // Start scheduled task checker
    this.startScheduleChecker();

    this.emit('engineStarted');
  }

  async stop() {
    this.isRunning = false;
    console.log('Automation Engine stopped');
    this.emit('engineStopped');
  }

  async createAutomation(config) {
    const automation = {
      id: config.id || uuidv4(),
      name: config.name,
      description: config.description,
      type: config.type,
      triggers: config.triggers || [],
      conditions: config.conditions || [],
      actions: config.actions || [],
      enabled: config.enabled !== false,
      created: new Date().toISOString(),
      lastExecuted: null,
      executionCount: 0,
      settings: config.settings || {}
    };

    this.automations.set(automation.id, automation);

    // Register triggers
    for (const trigger of automation.triggers) {
      await this.registerTrigger(automation.id, trigger);
    }

    console.log(`Created automation: ${automation.name} (${automation.id})`);
    this.emit('automationCreated', automation);

    return automation;
  }

  async executeAutomation(automationId, context = {}) {
    const automation = this.automations.get(automationId);
    if (!automation) {
      throw new Error(`Automation not found: ${automationId}`);
    }

    if (!automation.enabled) {
      throw new Error(`Automation is disabled: ${automationId}`);
    }

    const execution = {
      id: uuidv4(),
      automationId,
      startTime: new Date().toISOString(),
      context,
      status: 'running',
      results: []
    };

    try {
      // Check conditions
      const conditionResults = await this.evaluateConditions(automation.conditions, context);
      if (!conditionResults.passed) {
        execution.status = 'skipped';
        execution.reason = 'Conditions not met';
        execution.conditionResults = conditionResults;
        return execution;
      }

      // Execute actions
      for (const action of automation.actions) {
        const actionResult = await this.executeAction(action, context);
        execution.results.push(actionResult);
      }

      execution.status = 'completed';
      execution.endTime = new Date().toISOString();

      // Update automation stats
      automation.lastExecuted = execution.endTime;
      automation.executionCount++;

      this.emit('automationExecuted', { automation, execution });

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date().toISOString();

      this.emit('automationFailed', { automation, execution, error });
      throw error;
    }
  }

  async registerTrigger(automationId, trigger) {
    const triggerId = `${automationId}_${trigger.type}_${uuidv4()}`;

    const triggerConfig = {
      id: triggerId,
      automationId,
      type: trigger.type,
      config: trigger.config,
      processor: this.processors.get(trigger.type)
    };

    if (!triggerConfig.processor) {
      throw new Error(`Unknown trigger type: ${trigger.type}`);
    }

    this.triggers.set(triggerId, triggerConfig);

    // Initialize trigger based on type
    switch (trigger.type) {
      case 'schedule':
        await this.scheduleTrigger(triggerConfig);
        break;
      case 'event':
        await this.registerEventTrigger(triggerConfig);
        break;
      case 'webhook':
        await this.registerWebhookTrigger(triggerConfig);
        break;
      case 'condition':
        await this.registerConditionTrigger(triggerConfig);
        break;
    }

    return triggerId;
  }

  async scheduleTrigger(triggerConfig) {
    const { automationId, config } = triggerConfig;
    const { schedule, timezone = 'UTC' } = config;

    const scheduledTask = {
      automationId,
      schedule,
      timezone,
      nextRun: this.calculateNextRun(schedule, timezone),
      triggerId: triggerConfig.id
    };

    this.scheduledTasks.set(triggerConfig.id, scheduledTask);
    console.log(`Scheduled trigger: ${schedule} for automation ${automationId}`);
  }

  async registerEventTrigger(triggerConfig) {
    const { config } = triggerConfig;
    const { eventType, filters } = config;

    this.on(eventType, (eventData) => {
      if (this.matchesFilters(eventData, filters)) {
        this.queueAutomation(triggerConfig.automationId, { trigger: 'event', eventData });
      }
    });
  }

  async registerWebhookTrigger(triggerConfig) {
    // Webhook triggers would be handled by the main server
    console.log(`Registered webhook trigger for automation ${triggerConfig.automationId}`);
  }

  async registerConditionTrigger(triggerConfig) {
    const { config } = triggerConfig;
    const { checkInterval = 60000 } = config; // Default 1 minute

    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const conditionMet = await this.evaluateConditions([config.condition], {});
        if (conditionMet.passed) {
          this.queueAutomation(triggerConfig.automationId, { trigger: 'condition' });
        }
      } catch (error) {
        console.error('Error evaluating condition trigger:', error);
      }
    }, checkInterval);
  }

  queueAutomation(automationId, context) {
    this.executionQueue.push({ automationId, context, queuedAt: Date.now() });
  }

  async processQueue() {
    while (this.isRunning) {
      if (this.executionQueue.length > 0) {
        const { automationId, context } = this.executionQueue.shift();
        try {
          await this.executeAutomation(automationId, context);
        } catch (error) {
          console.error(`Failed to execute automation ${automationId}:`, error);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    }
  }

  startScheduleChecker() {
    setInterval(() => {
      if (!this.isRunning) return;

      const now = Date.now();
      for (const [triggerId, task] of this.scheduledTasks) {
        if (task.nextRun <= now) {
          this.queueAutomation(task.automationId, { trigger: 'schedule' });
          task.nextRun = this.calculateNextRun(task.schedule, task.timezone);
        }
      }
    }, 1000); // Check every second
  }

  async evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) {
      return { passed: true, results: [] };
    }

    const results = [];
    let allPassed = true;

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context);
      results.push(result);
      if (!result.passed) {
        allPassed = false;
      }
    }

    return { passed: allPassed, results };
  }

  async evaluateCondition(condition, context) {
    const processor = this.processors.get('condition');
    return await processor.evaluate(condition, context);
  }

  async executeAction(action, context) {
    const processor = this.processors.get(action.type) || this.processors.get('data');
    return await processor.execute(action, context);
  }

  calculateNextRun(schedule, timezone) {
    // Simplified schedule calculation
    // In a real implementation, you'd use a proper cron parser
    const now = Date.now();
    const intervals = {
      'every_minute': 60 * 1000,
      'every_hour': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000
    };

    const interval = intervals[schedule] || intervals['every_hour'];
    return now + interval;
  }

  matchesFilters(eventData, filters) {
    if (!filters) return true;

    for (const [key, value] of Object.entries(filters)) {
      if (eventData[key] !== value) return false;
    }

    return true;
  }

  // Management methods
  getAutomation(id) {
    return this.automations.get(id);
  }

  listAutomations() {
    return Array.from(this.automations.values());
  }

  async updateAutomation(id, updates) {
    const automation = this.automations.get(id);
    if (!automation) {
      throw new Error(`Automation not found: ${id}`);
    }

    Object.assign(automation, updates, { updated: new Date().toISOString() });
    this.emit('automationUpdated', automation);

    return automation;
  }

  async deleteAutomation(id) {
    const automation = this.automations.get(id);
    if (!automation) {
      throw new Error(`Automation not found: ${id}`);
    }

    // Remove triggers
    const triggersToRemove = Array.from(this.triggers.values())
      .filter(trigger => trigger.automationId === id);

    for (const trigger of triggersToRemove) {
      this.triggers.delete(trigger.id);
      this.scheduledTasks.delete(trigger.id);
    }

    this.automations.delete(id);
    this.emit('automationDeleted', { id, automation });

    return true;
  }

  getStats() {
    const automations = Array.from(this.automations.values());

    return {
      totalAutomations: automations.length,
      enabledAutomations: automations.filter(a => a.enabled).length,
      totalExecutions: automations.reduce((sum, a) => sum + a.executionCount, 0),
      activeTriggers: this.triggers.size,
      scheduledTasks: this.scheduledTasks.size,
      queueLength: this.executionQueue.length,
      isRunning: this.isRunning
    };
  }

  // Event handling for external triggers
  triggerEvent(eventType, eventData) {
    this.emit(eventType, eventData);
  }

  async handleWebhook(webhookId, data) {
    const triggers = Array.from(this.triggers.values())
      .filter(t => t.type === 'webhook' && t.config.webhookId === webhookId);

    for (const trigger of triggers) {
      this.queueAutomation(trigger.automationId, { trigger: 'webhook', data });
    }
  }
}

// Processor classes
class ScheduleProcessor {
  async execute(action, context) {
    return { type: 'schedule', executed: true, timestamp: new Date().toISOString() };
  }
}

class EventProcessor {
  async execute(action, context) {
    return { type: 'event', executed: true, eventData: action.config };
  }
}

class ConditionProcessor {
  async evaluate(condition, context) {
    // Simplified condition evaluation
    const { field, operator, value } = condition;
    const contextValue = this.getNestedValue(context, field);

    let passed = false;
    switch (operator) {
      case 'equals':
        passed = contextValue === value;
        break;
      case 'not_equals':
        passed = contextValue !== value;
        break;
      case 'greater_than':
        passed = contextValue > value;
        break;
      case 'less_than':
        passed = contextValue < value;
        break;
      case 'contains':
        passed = String(contextValue).includes(value);
        break;
      default:
        passed = true;
    }

    return { passed, condition, contextValue, operator, expectedValue: value };
  }

  async execute(action, context) {
    return { type: 'condition', executed: true, result: await this.evaluate(action.config, context) };
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

class WebhookProcessor {
  async execute(action, context) {
    const { url, method = 'POST', headers = {}, data } = action.config;

    // Simulate webhook call
    console.log(`Webhook ${method} to ${url}`);

    return {
      type: 'webhook',
      executed: true,
      url,
      method,
      status: 200,
      response: 'Webhook call simulated'
    };
  }
}

class DataProcessor {
  async execute(action, context) {
    const { operation, data } = action.config;

    switch (operation) {
      case 'transform':
        return { type: 'data_transform', result: this.transformData(data, context) };
      case 'aggregate':
        return { type: 'data_aggregate', result: this.aggregateData(data, context) };
      case 'filter':
        return { type: 'data_filter', result: this.filterData(data, context) };
      default:
        return { type: 'data_generic', executed: true, operation };
    }
  }

  transformData(data, context) {
    return { ...data, transformed: true, context };
  }

  aggregateData(data, context) {
    return { count: Array.isArray(data) ? data.length : 1, aggregated: true };
  }

  filterData(data, context) {
    return Array.isArray(data) ? data.slice(0, 10) : data;
  }
}