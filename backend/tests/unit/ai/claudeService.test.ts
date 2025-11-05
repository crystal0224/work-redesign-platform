import { ClaudeService } from '../../../src/services/ai/claudeService';
import Anthropic from '@anthropic-ai/sdk';
import { AnalysisInput, Task, Agent, Scenario } from '../../../src/types/ai';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('ClaudeService', () => {
  let claudeService: ClaudeService;
  let mockAnthropic: jest.Mocked<Anthropic>;

  beforeEach(() => {
    mockAnthropic = new Anthropic() as jest.Mocked<Anthropic>;
    claudeService = new ClaudeService();
    (claudeService as any).client = mockAnthropic;

    // Clear any previous cache
    (claudeService as any).cache.clear();
  });

  describe('analyzeWorkTasks', () => {
    const mockAnalysisInput: AnalysisInput = {
      department: 'IT',
      currentProcesses: ['Manual data entry', 'Email communication', 'Excel reporting'],
      painPoints: ['Time consuming', 'Error prone', 'Lack of automation'],
      goals: ['Increase efficiency', 'Reduce errors', 'Automate processes'],
      team: [
        { name: 'John Doe', role: 'Developer', experience: '5 years' },
        { name: 'Jane Smith', role: 'Analyst', experience: '3 years' }
      ],
      timeline: '3 months',
      budget: 'Medium'
    };

    const mockClaudeResponse = {
      content: [{
        type: 'text' as const,
        text: JSON.stringify([
          {
            id: 'task-1',
            title: 'Implement automated data entry system',
            description: 'Develop a system to automate manual data entry processes',
            priority: 'HIGH',
            estimatedHours: 40,
            dependencies: [],
            skills: ['Backend Development', 'Database Design'],
            impact: 'High efficiency gain'
          },
          {
            id: 'task-2',
            title: 'Set up email automation',
            description: 'Create automated email workflows for common communications',
            priority: 'MEDIUM',
            estimatedHours: 20,
            dependencies: ['task-1'],
            skills: ['Email Systems', 'Workflow Design'],
            impact: 'Reduced communication overhead'
          }
        ])
      }]
    };

    beforeEach(() => {
      mockAnthropic.messages.create = jest.fn().mockResolvedValue(mockClaudeResponse);
    });

    it('should analyze work tasks successfully', async () => {
      const result = await claudeService.analyzeWorkTasks(mockAnalysisInput);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'task-1',
        title: 'Implement automated data entry system',
        priority: 'HIGH',
        estimatedHours: 40
      });

      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('department: IT')
          })
        ])
      });
    });

    it('should cache analysis results', async () => {
      // First call
      const result1 = await claudeService.analyzeWorkTasks(mockAnalysisInput);

      // Second call with same input
      const result2 = await claudeService.analyzeWorkTasks(mockAnalysisInput);

      expect(result1).toEqual(result2);
      expect(mockAnthropic.messages.create).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockAnthropic.messages.create = jest.fn().mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(claudeService.analyzeWorkTasks(mockAnalysisInput))
        .rejects
        .toThrow('Failed to analyze work tasks: API rate limit exceeded');
    });

    it('should handle invalid JSON response', async () => {
      const invalidResponse = {
        content: [{
          type: 'text' as const,
          text: 'Invalid JSON response'
        }]
      };

      mockAnthropic.messages.create = jest.fn().mockResolvedValue(invalidResponse);

      await expect(claudeService.analyzeWorkTasks(mockAnalysisInput))
        .rejects
        .toThrow('Failed to analyze work tasks');
    });

    it('should validate task format', async () => {
      const invalidTaskResponse = {
        content: [{
          type: 'text' as const,
          text: JSON.stringify([
            {
              // Missing required fields
              title: 'Invalid Task'
            }
          ])
        }]
      };

      mockAnthropic.messages.create = jest.fn().mockResolvedValue(invalidTaskResponse);

      await expect(claudeService.analyzeWorkTasks(mockAnalysisInput))
        .rejects
        .toThrow('Invalid task format');
    });
  });

  describe('generateAgentScenarios', () => {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Implement API',
        description: 'Build REST API',
        priority: 'HIGH',
        estimatedHours: 20,
        dependencies: [],
        skills: ['Backend', 'API Design'],
        impact: 'Core functionality'
      }
    ];

    const mockScenarioResponse = {
      content: [{
        type: 'text' as const,
        text: JSON.stringify([
          {
            id: 'scenario-1',
            title: 'Agile Development Approach',
            description: 'Implement using agile methodology',
            agents: [
              {
                id: 'agent-1',
                name: 'Backend Developer',
                type: 'TASK',
                skills: ['Node.js', 'Express', 'PostgreSQL'],
                responsibilities: ['API development', 'Database design']
              }
            ],
            timeline: '4 weeks',
            risks: ['Technical complexity'],
            benefits: ['Fast delivery', 'Iterative feedback']
          }
        ])
      }]
    };

    beforeEach(() => {
      mockAnthropic.messages.create = jest.fn().mockResolvedValue(mockScenarioResponse);
    });

    it('should generate agent scenarios successfully', async () => {
      const result = await claudeService.generateAgentScenarios(mockTasks);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'scenario-1',
        title: 'Agile Development Approach',
        agents: expect.arrayContaining([
          expect.objectContaining({
            name: 'Backend Developer',
            type: 'TASK'
          })
        ])
      });
    });

    it('should handle empty tasks array', async () => {
      const result = await claudeService.generateAgentScenarios([]);
      expect(result).toEqual([]);
      expect(mockAnthropic.messages.create).not.toHaveBeenCalled();
    });
  });

  describe('provideClarification', () => {
    const mockMessages = [
      { role: 'user' as const, content: 'How should we prioritize tasks?' },
      { role: 'assistant' as const, content: 'Consider business impact and dependencies' }
    ];

    const mockClarificationResponse = {
      content: [{
        type: 'text' as const,
        text: 'To prioritize tasks effectively, I recommend using the MoSCoW method...'
      }]
    };

    beforeEach(() => {
      mockAnthropic.messages.create = jest.fn().mockResolvedValue(mockClarificationResponse);
    });

    it('should provide clarification successfully', async () => {
      const result = await claudeService.provideClarification(
        'What is the MoSCoW method?',
        mockMessages
      );

      expect(result).toBe('To prioritize tasks effectively, I recommend using the MoSCoW method...');
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: expect.arrayContaining([
          ...mockMessages,
          expect.objectContaining({
            role: 'user',
            content: 'What is the MoSCoW method?'
          })
        ])
      });
    });

    it('should handle conversation context', async () => {
      const question = 'Can you elaborate on that?';

      await claudeService.provideClarification(question, mockMessages);

      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: expect.arrayContaining(mockMessages)
      });
    });
  });

  describe('caching', () => {
    it('should generate consistent cache keys', () => {
      const input1: AnalysisInput = {
        department: 'IT',
        currentProcesses: ['Process A'],
        painPoints: ['Pain A'],
        goals: ['Goal A'],
        team: [],
        timeline: '1 month',
        budget: 'Low'
      };

      const input2: AnalysisInput = { ...input1 };

      const key1 = (claudeService as any).generateCacheKey(input1);
      const key2 = (claudeService as any).generateCacheKey(input2);

      expect(key1).toBe(key2);
    });

    it('should generate different cache keys for different inputs', () => {
      const input1: AnalysisInput = {
        department: 'IT',
        currentProcesses: ['Process A'],
        painPoints: ['Pain A'],
        goals: ['Goal A'],
        team: [],
        timeline: '1 month',
        budget: 'Low'
      };

      const input2: AnalysisInput = {
        ...input1,
        department: 'HR'
      };

      const key1 = (claudeService as any).generateCacheKey(input1);
      const key2 = (claudeService as any).generateCacheKey(input2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAnthropic.messages.create = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const mockInput: AnalysisInput = {
        department: 'IT',
        currentProcesses: [],
        painPoints: [],
        goals: [],
        team: [],
        timeline: '1 month',
        budget: 'Low'
      };

      await expect(claudeService.analyzeWorkTasks(mockInput))
        .rejects
        .toThrow('Failed to analyze work tasks: Network error');
    });

    it('should handle rate limiting', async () => {
      mockAnthropic.messages.create = jest.fn().mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const mockInput: AnalysisInput = {
        department: 'IT',
        currentProcesses: [],
        painPoints: [],
        goals: [],
        team: [],
        timeline: '1 month',
        budget: 'Low'
      };

      await expect(claudeService.analyzeWorkTasks(mockInput))
        .rejects
        .toThrow('Failed to analyze work tasks: Rate limit exceeded');
    });
  });
});