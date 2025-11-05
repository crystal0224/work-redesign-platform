import { v4 as uuidv4 } from 'uuid';
import { TaskAgent } from './TaskAgent.js';
import { AnalysisAgent } from './AnalysisAgent.js';
import { CoordinatorAgent } from './CoordinatorAgent.js';
import { OptimizationAgent } from './OptimizationAgent.js';

export class AgentManager {
  constructor() {
    this.agents = new Map();
    this.agentTypes = {
      'task': TaskAgent,
      'analysis': AnalysisAgent,
      'coordinator': CoordinatorAgent,
      'optimization': OptimizationAgent
    };
    this.initializeDefaultAgents();
  }

  initializeDefaultAgents() {
    // Create default agent instances
    this.createAgent('coordinator', 'main-coordinator');
    this.createAgent('analysis', 'workflow-analyzer');
    this.createAgent('optimization', 'performance-optimizer');
  }

  createAgent(type, id = null) {
    if (!this.agentTypes[type]) {
      throw new Error(`Unknown agent type: ${type}`);
    }

    const agentId = id || uuidv4();
    const AgentClass = this.agentTypes[type];
    const agent = new AgentClass(agentId);

    this.agents.set(agentId, agent);
    console.log(`Created ${type} agent: ${agentId}`);

    return agent;
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  getAgents() {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      type: agent.type,
      status: agent.status,
      capabilities: agent.capabilities
    }));
  }

  getAgentsByType(type) {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  removeAgent(id) {
    const agent = this.agents.get(id);
    if (agent) {
      agent.stop();
      this.agents.delete(id);
      console.log(`Removed agent: ${id}`);
      return true;
    }
    return false;
  }

  async delegateTask(task, agentType = null) {
    let availableAgents;

    if (agentType) {
      availableAgents = this.getAgentsByType(agentType);
    } else {
      availableAgents = Array.from(this.agents.values());
    }

    const availableAgent = availableAgents.find(agent =>
      agent.status === 'idle' && agent.canHandleTask(task)
    );

    if (!availableAgent) {
      // Create a new agent if none available
      const newAgentType = agentType || this.determineAgentType(task);
      const newAgent = this.createAgent(newAgentType);
      return await newAgent.executeTask(task);
    }

    return await availableAgent.executeTask(task);
  }

  determineAgentType(task) {
    if (task.type === 'analysis') return 'analysis';
    if (task.type === 'coordination') return 'coordinator';
    if (task.type === 'optimization') return 'optimization';
    return 'task';
  }

  broadcastMessage(message, excludeId = null) {
    this.agents.forEach((agent, id) => {
      if (id !== excludeId) {
        agent.receiveMessage(message);
      }
    });
  }

  getSystemStatus() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
      idleAgents: Array.from(this.agents.values()).filter(a => a.status === 'idle').length,
      agentTypes: Object.keys(this.agentTypes)
    };
  }
}