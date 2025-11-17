import Anthropic from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { createModuleLogger } from '../utils/logger';
import { config } from '../config';

const logger = createModuleLogger('TaskExtractionService');

export interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  domain: string;
  estimatedStatus: 'Progress' | 'Planned' | 'Not Started' | 'Completed';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Ad-hoc';
  automationPotential: 'High' | 'Medium' | 'Low';
  source: 'uploaded' | 'manual';
}

export class TaskExtractionService {
  private anthropic?: Anthropic;
  private hasApiKey: boolean;
  private promptTemplate: string = '';

  constructor() {
    this.hasApiKey = !!config.ai.anthropicApiKey;
    if (this.hasApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.ai.anthropicApiKey,
      });
    } else {
      logger.warn('⚠️ Anthropic API key not configured, using mock extraction');
    }
  }

  /**
   * Load the prompt template from MD file
   */
  private async loadPromptTemplate(): Promise<string> {
    if (this.promptTemplate) {
      return this.promptTemplate;
    }

    try {
      const promptPath = path.join(process.cwd(), 'prompts', 'task-extraction-prompt.md');
      this.promptTemplate = await fs.readFile(promptPath, 'utf-8');
      logger.info('📄 Loaded task extraction prompt template');
      return this.promptTemplate;
    } catch (error) {
      logger.error('Failed to load prompt template:', error);
      throw new Error('프롬프트 템플릿을 로드할 수 없습니다');
    }
  }

  /**
   * Extract tasks from uploaded documents and manual input
   */
  async extractTasks(params: {
    domains: string[];
    uploadedDocuments: { filename: string; content: string }[];
    manualInput?: string;
  }): Promise<ExtractedTask[]> {
    const { domains, uploadedDocuments, manualInput } = params;

    logger.info(`🔍 Starting task extraction from ${uploadedDocuments.length} documents and manual input`);

    // Load prompt template
    const promptTemplate = await this.loadPromptTemplate();

    // Extract the actual prompt from the markdown (skip header and metadata)
    const promptMatch = promptTemplate.match(/## 프롬프트\n\n([\s\S]+)/);
    if (!promptMatch) {
      throw new Error('프롬프트 템플릿 형식이 올바르지 않습니다');
    }

    const basePrompt = promptMatch[1];

    // Prepare document content
    const documentsText = uploadedDocuments
      .map((doc, idx) => `### 문서 ${idx + 1}: ${doc.filename}\n\n${doc.content}\n`)
      .join('\n');

    const manualInputText = manualInput
      ? `### 팀장 직접 입력 내용\n\n${manualInput}\n`
      : '';

    // Replace placeholders in prompt
    const systemPrompt = basePrompt
      .replace('{domains}', domains.join(', '))
      .replace('{uploadedDocuments}', documentsText || '(없음)')
      .replace('{manualInput}', manualInputText || '(없음)');

    if (!this.hasApiKey) {
      logger.info('🔄 Using mock task extraction (API key not configured)');
      return this.generateMockTasks(domains, uploadedDocuments, manualInput);
    }

    try {
      logger.info('🤖 Sending task extraction request to Claude AI');

      const response = await this.anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: '위 정보를 바탕으로 업무를 추출하고 분류해주세요. JSON 형식으로만 응답해주세요.',
          },
        ],
      });

      const textContent = response.content[0];

      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
      if (!jsonMatch) {
        logger.error('No JSON found in response:', textContent.text.substring(0, 500));
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
      }

      const jsonText = jsonMatch[1] || jsonMatch[2];
      const rawTasks = JSON.parse(jsonText);

      logger.info(`✅ Extracted ${rawTasks.length} tasks from AI analysis`);

      // Validate and normalize tasks
      const tasks: ExtractedTask[] = rawTasks
        .filter((task: any) => task.title && task.description && task.domain)
        .map((task: any) => ({
          id: task.id || this.generateTaskId(),
          title: task.title,
          description: task.description,
          domain: this.normalizeDomain(task.domain, domains),
          estimatedStatus: this.normalizeStatus(task.estimatedStatus),
          frequency: this.normalizeFrequency(task.frequency),
          automationPotential: this.normalizeAutomationPotential(task.automationPotential),
          source: task.source || 'uploaded',
        }));

      logger.info(`📊 Final validated tasks: ${tasks.length}`);
      return tasks;
    } catch (error) {
      logger.error('Task extraction error:', error);

      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          throw new Error('AI API 인증 실패: API 키를 확인해주세요');
        }
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('AI API 요청 한도 초과: 잠시 후 다시 시도해주세요');
        }
      }

      throw new Error(`업무 추출 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Normalize domain to ensure it matches user-defined domains or "기타"
   */
  private normalizeDomain(domain: string, validDomains: string[]): string {
    // Check if domain is in valid domains
    if (validDomains.includes(domain)) {
      return domain;
    }

    // Fuzzy matching for similar domains
    const lowerDomain = domain.toLowerCase();
    const match = validDomains.find((d) => d.toLowerCase().includes(lowerDomain) || lowerDomain.includes(d.toLowerCase()));

    if (match) {
      return match;
    }

    // Default to "기타" if not found
    return validDomains.includes('기타') ? '기타' : validDomains[0] || '기타';
  }

  /**
   * Normalize status values
   */
  private normalizeStatus(status: string): 'Progress' | 'Planned' | 'Not Started' | 'Completed' {
    const normalized = status?.toLowerCase() || '';

    if (normalized.includes('진행') || normalized.includes('progress')) return 'Progress';
    if (normalized.includes('계획') || normalized.includes('planned')) return 'Planned';
    if (normalized.includes('완료') || normalized.includes('completed')) return 'Completed';
    return 'Not Started';
  }

  /**
   * Normalize frequency values
   */
  private normalizeFrequency(frequency: string): 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Ad-hoc' {
    const normalized = frequency?.toLowerCase() || '';

    if (normalized.includes('일') || normalized.includes('daily')) return 'Daily';
    if (normalized.includes('주') || normalized.includes('weekly')) return 'Weekly';
    if (normalized.includes('월') || normalized.includes('monthly')) return 'Monthly';
    if (normalized.includes('분기') || normalized.includes('quarterly')) return 'Quarterly';
    if (normalized.includes('년') || normalized.includes('yearly')) return 'Yearly';
    return 'Ad-hoc';
  }

  /**
   * Normalize automation potential
   */
  private normalizeAutomationPotential(potential: string): 'High' | 'Medium' | 'Low' {
    const normalized = potential?.toLowerCase() || '';

    if (normalized.includes('높') || normalized.includes('high')) return 'High';
    if (normalized.includes('낮') || normalized.includes('low')) return 'Low';
    return 'Medium';
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Generate mock tasks for testing without API key
   */
  private generateMockTasks(
    domains: string[],
    uploadedDocuments: { filename: string; content: string }[],
    manualInput?: string
  ): ExtractedTask[] {
    logger.info('🔄 Generating mock tasks from content');

    const mockTasks: ExtractedTask[] = [];
    let taskCount = 0;

    // Extract tasks from uploaded documents
    uploadedDocuments.forEach((doc) => {
      const lines = doc.content.split('\n');

      lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Look for numbered items or bullet points
        const match = trimmed.match(/^(\d+)\.?\s*(.+)|^[-•]\s*(.+)/);
        if (match && (match[2] || match[3])) {
          const title = match[2] || match[3];

          // Only create task if title is meaningful
          if (title.length > 5 && taskCount < 10) {
            const domainIndex = taskCount % domains.length;
            mockTasks.push({
              id: this.generateTaskId(),
              title: title.substring(0, 100),
              description: `${doc.filename}에서 추출된 업무: ${title}`,
              domain: domains[domainIndex] || '기타',
              estimatedStatus: taskCount % 3 === 0 ? 'Progress' : 'Planned',
              frequency: taskCount % 2 === 0 ? 'Weekly' : 'Monthly',
              automationPotential: taskCount % 3 === 0 ? 'High' : taskCount % 3 === 1 ? 'Medium' : 'Low',
              source: 'uploaded',
            });
            taskCount++;
          }
        }
      });
    });

    // Extract tasks from manual input
    if (manualInput) {
      const manualLines = manualInput.split('\n').filter((line) => line.trim().length > 10);

      manualLines.forEach((line, idx) => {
        if (idx < 3 && taskCount < 15) {
          // Limit manual tasks
          const domainIndex = taskCount % domains.length;
          mockTasks.push({
            id: this.generateTaskId(),
            title: line.trim().substring(0, 100),
            description: `팀장님이 직접 입력한 업무: ${line.trim()}`,
            domain: domains[domainIndex] || '기타',
            estimatedStatus: 'Not Started',
            frequency: 'Ad-hoc',
            automationPotential: 'Medium',
            source: 'manual',
          });
          taskCount++;
        }
      });
    }

    // If no tasks found, create sample tasks
    if (mockTasks.length === 0) {
      domains.forEach((domain, idx) => {
        mockTasks.push({
          id: this.generateTaskId(),
          title: `${domain} 관련 샘플 업무 ${idx + 1}`,
          description: `${domain} 영역의 대표적인 업무입니다. 실제 분석 시에는 업로드된 문서와 입력 내용을 바탕으로 추출됩니다.`,
          domain: domain,
          estimatedStatus: 'Progress',
          frequency: 'Weekly',
          automationPotential: 'Medium',
          source: 'uploaded',
        });
      });
    }

    logger.info(`📊 Generated ${mockTasks.length} mock tasks`);
    return mockTasks;
  }
}
