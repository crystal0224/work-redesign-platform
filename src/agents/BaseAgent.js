import { EventEmitter } from 'events';

export class BaseAgent extends EventEmitter {
  constructor(id, type) {
    super();
    this.id = id;
    this.type = type;
    this.status = 'idle';
    this.capabilities = [];
    this.currentTask = null;
    this.messageQueue = [];
    this.memory = new Map();
  }

  async executeTask(task) {
    if (this.status !== 'idle') {
      throw new Error(`Agent ${this.id} is busy`);
    }

    this.status = 'active';
    this.currentTask = task;

    try {
      this.emit('taskStarted', { agentId: this.id, task });
      const result = await this.processTask(task);
      this.emit('taskCompleted', { agentId: this.id, task, result });
      return result;
    } catch (error) {
      this.emit('taskFailed', { agentId: this.id, task, error });
      throw error;
    } finally {
      this.status = 'idle';
      this.currentTask = null;
    }
  }

  async processTask(task) {
    // Override in subclasses
    throw new Error('processTask must be implemented by subclass');
  }

  canHandleTask(task) {
    // Override in subclasses
    return true;
  }

  receiveMessage(message) {
    this.messageQueue.push({
      ...message,
      timestamp: Date.now()
    });
    this.emit('messageReceived', message);
  }

  sendMessage(targetAgentId, message) {
    this.emit('sendMessage', {
      from: this.id,
      to: targetAgentId,
      message,
      timestamp: Date.now()
    });
  }

  storeMemory(key, value) {
    this.memory.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  getMemory(key) {
    const entry = this.memory.get(key);
    return entry ? entry.value : null;
  }

  clearMemory() {
    this.memory.clear();
  }

  getStatus() {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      currentTask: this.currentTask,
      messageQueueLength: this.messageQueue.length,
      memorySize: this.memory.size,
      capabilities: this.capabilities
    };
  }

  stop() {
    this.status = 'stopped';
    this.removeAllListeners();
    this.clearMemory();
  }
}