import { BaseAgent } from './BaseAgent.js';

export class CoordinatorAgent extends BaseAgent {
  constructor(id) {
    super(id, 'coordinator');
    this.capabilities = [
      'task_coordination',
      'workflow_orchestration',
      'agent_communication',
      'resource_allocation',
      'conflict_resolution'
    ];
    this.activeWorkflows = new Map();
    this.agentConnections = new Map();
  }

  async processTask(task) {
    console.log(`CoordinatorAgent ${this.id} coordinating:`, task.name);

    switch (task.type) {
      case 'coordinate_workflow':
        return await this.coordinateWorkflow(task);
      case 'manage_agents':
        return await this.manageAgents(task);
      case 'resolve_conflict':
        return await this.resolveConflict(task);
      case 'allocate_resources':
        return await this.allocateResources(task);
      default:
        return await this.performGenericCoordination(task);
    }
  }

  async coordinateWorkflow(task) {
    const { workflow, agents, priority } = task.payload;
    const workflowId = workflow.id;

    // Initialize workflow coordination
    const coordination = {
      workflowId,
      status: 'coordinating',
      assignedAgents: [],
      executionPlan: this.createExecutionPlan(workflow),
      startTime: new Date().toISOString(),
      priority: priority || 'normal'
    };

    this.activeWorkflows.set(workflowId, coordination);

    try {
      // Assign agents to workflow steps
      const assignments = await this.assignAgentsToSteps(workflow, agents);
      coordination.assignedAgents = assignments;

      // Execute coordinated workflow
      const result = await this.executeCoordinatedWorkflow(coordination);

      coordination.status = 'completed';
      coordination.endTime = new Date().toISOString();

      return {
        success: true,
        workflowId,
        result,
        coordination
      };
    } catch (error) {
      coordination.status = 'failed';
      coordination.error = error.message;
      throw error;
    }
  }

  async manageAgents(task) {
    const { action, agentIds, configuration } = task.payload;

    switch (action) {
      case 'connect':
        return await this.connectAgents(agentIds);
      case 'disconnect':
        return await this.disconnectAgents(agentIds);
      case 'configure':
        return await this.configureAgents(agentIds, configuration);
      case 'monitor':
        return await this.monitorAgents(agentIds);
      default:
        throw new Error(`Unknown agent management action: ${action}`);
    }
  }

  async resolveConflict(task) {
    const { conflictType, involvedAgents, conflictData } = task.payload;

    const resolution = {
      conflictId: `conflict_${Date.now()}`,
      type: conflictType,
      involvedAgents,
      resolutionStrategy: this.determineResolutionStrategy(conflictType, conflictData),
      resolvedAt: new Date().toISOString()
    };

    switch (conflictType) {
      case 'resource_contention':
        resolution.action = await this.resolveResourceContention(involvedAgents, conflictData);
        break;
      case 'priority_conflict':
        resolution.action = await this.resolvePriorityConflict(involvedAgents, conflictData);
        break;
      case 'communication_deadlock':
        resolution.action = await this.resolveCommunicationDeadlock(involvedAgents);
        break;
      default:
        resolution.action = 'escalated_to_human';
    }

    return {
      success: true,
      resolution
    };
  }

  async allocateResources(task) {
    const { resources, requestingAgents, criteria } = task.payload;

    const allocation = {
      allocationId: `alloc_${Date.now()}`,
      totalResources: resources,
      allocations: [],
      criteria: criteria || 'fair_share'
    };

    // Determine allocation strategy
    switch (criteria) {
      case 'priority_based':
        allocation.allocations = this.allocateByPriority(resources, requestingAgents);
        break;
      case 'workload_based':
        allocation.allocations = this.allocateByWorkload(resources, requestingAgents);
        break;
      case 'fair_share':
      default:
        allocation.allocations = this.allocateFairShare(resources, requestingAgents);
    }

    return {
      success: true,
      allocation
    };
  }

  createExecutionPlan(workflow) {
    const plan = {
      totalSteps: workflow.steps.length,
      parallelizable: this.identifyParallelSteps(workflow.steps),
      dependencies: this.mapDependencies(workflow.steps),
      estimatedDuration: this.estimateWorkflowDuration(workflow.steps),
      criticalPath: this.findCriticalPath(workflow.steps)
    };

    return plan;
  }

  async assignAgentsToSteps(workflow, availableAgents) {
    const assignments = [];

    for (const step of workflow.steps) {
      const suitableAgent = this.findSuitableAgent(step, availableAgents);
      if (suitableAgent) {
        assignments.push({
          stepId: step.id,
          agentId: suitableAgent.id,
          estimatedDuration: step.estimatedDuration || 1000
        });
      }
    }

    return assignments;
  }

  async executeCoordinatedWorkflow(coordination) {
    const { executionPlan, assignedAgents } = coordination;
    const results = [];

    // Execute steps according to plan
    for (const group of executionPlan.parallelizable) {
      const groupPromises = group.map(stepId => {
        const assignment = assignedAgents.find(a => a.stepId === stepId);
        return this.executeStepWithAgent(stepId, assignment);
      });

      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);
    }

    return {
      totalSteps: assignedAgents.length,
      completedSteps: results.length,
      results
    };
  }

  async executeStepWithAgent(stepId, assignment) {
    // Simulate step execution coordination
    console.log(`Coordinating step ${stepId} with agent ${assignment.agentId}`);

    return {
      stepId,
      agentId: assignment.agentId,
      status: 'completed',
      duration: assignment.estimatedDuration,
      result: `Step ${stepId} coordinated successfully`
    };
  }

  async connectAgents(agentIds) {
    const connections = [];

    for (const agentId of agentIds) {
      const connection = {
        agentId,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      };

      this.agentConnections.set(agentId, connection);
      connections.push(connection);
    }

    return { connections };
  }

  async disconnectAgents(agentIds) {
    const disconnections = [];

    for (const agentId of agentIds) {
      if (this.agentConnections.has(agentId)) {
        this.agentConnections.delete(agentId);
        disconnections.push({
          agentId,
          disconnectedAt: new Date().toISOString()
        });
      }
    }

    return { disconnections };
  }

  async configureAgents(agentIds, configuration) {
    return {
      configured: agentIds,
      configuration,
      appliedAt: new Date().toISOString()
    };
  }

  async monitorAgents(agentIds) {
    const status = agentIds.map(agentId => ({
      agentId,
      connected: this.agentConnections.has(agentId),
      lastSeen: this.agentConnections.get(agentId)?.connectedAt || null
    }));

    return { agentStatus: status };
  }

  // Helper methods
  identifyParallelSteps(steps) {
    // Group steps that can be executed in parallel
    return [steps.map(step => step.id)]; // Simplified: all steps in one group
  }

  mapDependencies(steps) {
    return steps.map(step => ({
      stepId: step.id,
      dependencies: step.dependencies || []
    }));
  }

  estimateWorkflowDuration(steps) {
    return steps.reduce((total, step) => total + (step.estimatedDuration || 1000), 0);
  }

  findCriticalPath(steps) {
    // Simplified critical path calculation
    return steps.map(step => step.id);
  }

  findSuitableAgent(step, availableAgents) {
    // Find agent with matching capabilities
    return availableAgents.find(agent =>
      agent.capabilities?.includes(step.requiredCapability) ||
      agent.type === 'task'
    );
  }

  determineResolutionStrategy(conflictType, conflictData) {
    const strategies = {
      'resource_contention': 'queue_based_allocation',
      'priority_conflict': 'priority_weighted_resolution',
      'communication_deadlock': 'timeout_and_retry'
    };

    return strategies[conflictType] || 'escalation';
  }

  async resolveResourceContention(agents, conflictData) {
    return `Implemented queue-based allocation for agents: ${agents.join(', ')}`;
  }

  async resolvePriorityConflict(agents, conflictData) {
    return `Resolved priority conflict using weighted priority system`;
  }

  async resolveCommunicationDeadlock(agents) {
    return `Reset communication channels for agents: ${agents.join(', ')}`;
  }

  allocateByPriority(resources, agents) {
    return agents.map(agent => ({
      agentId: agent.id,
      allocation: Math.floor(resources * (agent.priority || 0.5))
    }));
  }

  allocateByWorkload(resources, agents) {
    const totalWorkload = agents.reduce((sum, agent) => sum + (agent.workload || 1), 0);
    return agents.map(agent => ({
      agentId: agent.id,
      allocation: Math.floor(resources * ((agent.workload || 1) / totalWorkload))
    }));
  }

  allocateFairShare(resources, agents) {
    const sharePerAgent = Math.floor(resources / agents.length);
    return agents.map(agent => ({
      agentId: agent.id,
      allocation: sharePerAgent
    }));
  }

  async performGenericCoordination(task) {
    return {
      success: true,
      message: `Coordination task ${task.name} completed`,
      coordinatedBy: this.id,
      timestamp: new Date().toISOString()
    };
  }

  canHandleTask(task) {
    const coordinationTypes = [
      'coordinate_workflow',
      'manage_agents',
      'resolve_conflict',
      'allocate_resources',
      'coordination'
    ];
    return coordinationTypes.includes(task.type);
  }

  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  getConnectedAgents() {
    return Array.from(this.agentConnections.keys());
  }
}