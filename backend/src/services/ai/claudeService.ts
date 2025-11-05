import Anthropic from '@anthropic-ai/sdk';
import config from '../../config';
import { logger, aiLogger } from '../../config/logger';
import { cache } from '../../config/database';

export interface AnalysisInput {
  domains: string[];
  documents: string;
  userContext?: {
    company: string;
    team: string;
    position: string;
  };
}

export interface Task {
  domain: string;
  title: string;
  description: string;
  currentProcess: string;
  steps: TaskStep[];
  weeklyHours: number;
  complexityScore: number;
  status?: 'defined' | 'unclear' | 'confirmed';
  clarificationNeeded?: string;
}

export interface TaskStep {
  title: string;
  timeMinutes: number;
  isUnclear: boolean;
  clarificationNeeded?: string;
  isManual: boolean;
}

export interface AgentScenario {
  agentType: 'data' | 'content' | 'monitoring' | 'process';
  automationLevel: 'full' | 'partial' | 'assisted' | 'manual';
  agentName: string;
  scenarioDescription: string;
  triggerCondition: string;
  expectedOutput: string;
  humanIntervention: string;
  estimatedTimeSavedHours: number;
}

export interface PromptTemplate {
  title: string;
  promptTemplate: string;
  variables: Record<string, string>;
  platform: 'claude' | 'chatgpt' | 'gemini';
  version: string;
  exampleOutput: string;
}

export interface WorkflowTemplate {
  platform: 'n8n' | 'zapier' | 'make';
  templateName: string;
  templateJson: any;
  setupInstructions: string;
  requiredCredentials: string[];
}

class ClaudeService {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor() {
    if (!config.ai.anthropic.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.ai.anthropic.apiKey,
    });

    this.model = config.ai.anthropic.model;
    this.maxTokens = config.ai.anthropic.maxTokens;
  }

  // 핵심 업무 분석 메서드
  async analyzeWorkTasks(input: AnalysisInput): Promise<Task[]> {
    const startTime = Date.now();
    const cacheKey = `analysis:${this.generateCacheKey(input)}`;

    try {
      // 캐시 확인
      const cached = await cache.get<Task[]>(cacheKey);
      if (cached) {
        logger.info('Returning cached analysis result');
        return cached;
      }

      const systemPrompt = this.getAnalysisSystemPrompt(input.userContext);
      const userPrompt = this.getAnalysisUserPrompt(input);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      // 응답 파싱
      const tasks = this.parseAnalysisResponse(responseText);

      // 로깅
      aiLogger.info('Claude analysis completed', {
        type: 'work_analysis',
        promptLength: userPrompt.length,
        responseLength: responseText.length,
        duration,
        tokens: response.usage?.total_tokens,
        taskCount: tasks.length,
      });

      // 캐싱 (1시간)
      await cache.set(cacheKey, tasks, 3600);

      return tasks;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Claude analysis failed:', error);

      aiLogger.error('Claude analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        inputSize: input.documents.length,
      });

      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Agent 시나리오 생성
  async generateAgentScenarios(task: Task): Promise<{
    scenario: AgentScenario;
    prompts: PromptTemplate[];
    workflows: WorkflowTemplate[];
  }> {
    const startTime = Date.now();
    const cacheKey = `scenarios:${task.domain}:${task.title}`;

    try {
      const cached = await cache.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const systemPrompt = this.getScenarioSystemPrompt();
      const userPrompt = this.getScenarioUserPrompt(task);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      const result = this.parseScenarioResponse(responseText, task);

      aiLogger.info('Agent scenario generation completed', {
        type: 'agent_scenario',
        duration,
        tokens: response.usage?.total_tokens,
        taskTitle: task.title,
      });

      await cache.set(cacheKey, result, 1800); // 30분 캐싱

      return result;
    } catch (error) {
      logger.error('Agent scenario generation failed:', error);
      throw new Error(`Agent scenario generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // AI 채팅 (불명확한 부분 해결)
  async chatClarification(
    taskId: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{
    response: string;
    suggestions: string[];
    isResolved: boolean;
  }> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.getClarificationSystemPrompt();

      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages,
      });

      const duration = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      const result = this.parseClarificationResponse(responseText);

      aiLogger.info('AI clarification completed', {
        type: 'clarification',
        duration,
        tokens: response.usage?.total_tokens,
        taskId,
      });

      return result;
    } catch (error) {
      logger.error('AI clarification failed:', error);
      throw new Error(`AI clarification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 우선순위 추천
  async recommendPriorities(tasks: Task[]): Promise<Array<{
    taskId: string;
    priority: number;
    reason: string;
    expectedImpact: string;
    quickWinScore: number;
  }>> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.getPrioritySystemPrompt();
      const userPrompt = this.getPriorityUserPrompt(tasks);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      const priorities = this.parsePriorityResponse(responseText);

      aiLogger.info('Priority recommendation completed', {
        type: 'priority_recommendation',
        duration,
        tokens: response.usage?.total_tokens,
        taskCount: tasks.length,
      });

      return priorities;
    } catch (error) {
      logger.error('Priority recommendation failed:', error);
      throw new Error(`Priority recommendation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 시스템 프롬프트들
  private getAnalysisSystemPrompt(userContext?: any): string {
    return `당신은 SK 그룹의 업무 분석 전문가입니다.
제공된 업무 자료를 분석하여 다음을 수행하세요:

1. 도메인별 주요 업무 식별
2. 각 업무를 5-15개 세부 단계로 분해
3. 각 단계의 소요 시간 추정 (분 단위)
4. 자동화 가능성 평가
5. 불명확한 부분 표시

SK 그룹의 업무 특성 고려사항:
- 디지털 전환 중점
- 글로벌 스탠다드 준수
- 컴플라이언스 중시
- 효율성과 혁신 추구
- 협업 중심 문화

${userContext ? `
사용자 컨텍스트:
- 회사: ${userContext.company}
- 팀: ${userContext.team}
- 직급: ${userContext.position}
` : ''}

응답은 반드시 유효한 JSON 형식으로만 제공하세요.`;
  }

  private getAnalysisUserPrompt(input: AnalysisInput): string {
    return `도메인: ${input.domains.join(', ')}

업무 자료:
${input.documents}

다음 JSON 형식으로 응답하세요:
{
  "tasks": [{
    "domain": "string",
    "title": "string",
    "description": "string",
    "currentProcess": "string",
    "steps": [{
      "title": "string",
      "timeMinutes": number,
      "isUnclear": boolean,
      "clarificationNeeded": "string (optional)",
      "isManual": boolean
    }],
    "weeklyHours": number,
    "complexityScore": number (1-10),
    "status": "defined" | "unclear",
    "clarificationNeeded": "string (optional)"
  }]
}`;
  }

  private getScenarioSystemPrompt(): string {
    return `당신은 AI Agent 설계 전문가입니다.
각 업무에 대해 최적의 자동화 시나리오를 생성하세요.

Agent 유형:
1. Data Analysis Agent - 데이터 수집/분석/리포팅
2. Content Writing Agent - 콘텐츠 생성/편집/번역
3. Monitoring Agent - 실시간 감시/알림/상태확인
4. Process Agent - 프로세스 자동화/워크플로우

자동화 레벨:
- Full (100% 자동) - 인간 개입 없이 완전 자동 실행
- Partial (AI 60% + Human 40%) - AI가 초안 작성, 인간이 검토/승인
- Assisted (AI 30% + Human 70%) - AI가 보조 역할, 인간이 주도
- Manual (자동화 불가) - 현재로서는 자동화 어려움

SK 그룹 환경 고려사항:
- 보안 및 컴플라이언스 요구사항
- 기존 시스템과의 연동
- 단계적 도입 전략
- ROI 명확성`;
  }

  private getScenarioUserPrompt(task: Task): string {
    return `업무: ${task.title}
설명: ${task.description}
현재 프로세스: ${task.currentProcess}
단계: ${task.steps.map(s => `${s.title} (${s.timeMinutes}분)`).join(', ')}
주당 소요시간: ${task.weeklyHours}시간
복잡도: ${task.complexityScore}/10

다음을 JSON 형식으로 생성하세요:
{
  "scenario": {
    "agentType": "data|content|monitoring|process",
    "automationLevel": "full|partial|assisted|manual",
    "agentName": "구체적인 Agent 이름",
    "scenarioDescription": "상세한 작동 시나리오",
    "triggerCondition": "실행 트리거 조건",
    "expectedOutput": "예상 산출물",
    "humanIntervention": "인간 개입이 필요한 지점",
    "estimatedTimeSavedHours": number
  },
  "prompts": [{
    "title": "프롬프트 제목",
    "promptTemplate": "실제 사용할 프롬프트 템플릿",
    "variables": {"변수명": "변수 설명"},
    "platform": "claude|chatgpt|gemini",
    "version": "1.0",
    "exampleOutput": "예시 출력"
  }],
  "workflows": [{
    "platform": "n8n|zapier|make",
    "templateName": "워크플로우 이름",
    "templateJson": {},
    "setupInstructions": "설정 방법",
    "requiredCredentials": ["필요한 API 키/인증 정보"]
  }]
}`;
  }

  private getClarificationSystemPrompt(): string {
    return `당신은 업무 분석 전문가로서 사용자의 업무 관련 질문에 명확하고 구체적으로 답변합니다.

목표:
- 불명확한 업무 내용을 구체화
- 실행 가능한 단계로 세분화
- SK 그룹 환경에 맞는 현실적 제안

답변 스타일:
- 간결하고 명확한 설명
- 구체적인 예시 제공
- 단계별 가이드 제시
- 추가 질문 제안`;
  }

  private getPrioritySystemPrompt(): string {
    return `당신은 업무 우선순위 분석 전문가입니다.

Quick Win 기준:
1. 구현 용이성 (기술적 복잡도 낮음)
2. 즉시 효과 (단기간 내 결과 확인)
3. 높은 ROI (투자 대비 효과)
4. 위험도 낮음 (실패 시 손실 최소)

우선순위 고려사항:
- 비즈니스 임팩트
- 구현 복잡도
- 필요 리소스
- 기술적 성숙도
- 조직 준비도`;
  }

  private getPriorityUserPrompt(tasks: Task[]): string {
    const taskSummary = tasks.map((task, index) =>
      `${index + 1}. ${task.title} (${task.domain}) - ${task.weeklyHours}h/week, 복잡도: ${task.complexityScore}/10`
    ).join('\n');

    return `다음 업무들에 대해 우선순위를 분석하세요:

${taskSummary}

JSON 형식으로 응답:
{
  "priorities": [{
    "taskId": "순서번호",
    "priority": number (1-5, 1이 최고 우선순위),
    "reason": "우선순위 이유",
    "expectedImpact": "예상 효과",
    "quickWinScore": number (1-100, Quick Win 가능성)
  }]
}`;
  }

  // 응답 파싱 메서드들
  private parseAnalysisResponse(response: string): Task[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      return parsed.tasks || [];
    } catch (error) {
      logger.error('Failed to parse analysis response:', error);
      return [];
    }
  }

  private parseScenarioResponse(response: string, task: Task): any {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      return {
        scenario: parsed.scenario,
        prompts: parsed.prompts || [],
        workflows: parsed.workflows || [],
      };
    } catch (error) {
      logger.error('Failed to parse scenario response:', error);
      return {
        scenario: this.getDefaultScenario(task),
        prompts: [],
        workflows: [],
      };
    }
  }

  private parseClarificationResponse(response: string): any {
    try {
      // 구조화된 응답에서 정보 추출
      const suggestions = this.extractSuggestions(response);
      const isResolved = response.includes('해결됨') || response.includes('명확해짐');

      return {
        response: response.trim(),
        suggestions,
        isResolved,
      };
    } catch (error) {
      logger.error('Failed to parse clarification response:', error);
      return {
        response: response.trim(),
        suggestions: [],
        isResolved: false,
      };
    }
  }

  private parsePriorityResponse(response: string): any[] {
    try {
      const cleaned = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleaned);
      return parsed.priorities || [];
    } catch (error) {
      logger.error('Failed to parse priority response:', error);
      return [];
    }
  }

  // 유틸리티 메서드들
  private cleanJsonResponse(response: string): string {
    // JSON 블록 추출
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                     response.match(/```\s*([\s\S]*?)\s*```/) ||
                     response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return jsonMatch[1] || jsonMatch[0];
    }

    return response.trim();
  }

  private extractSuggestions(response: string): string[] {
    const suggestions = [];
    const suggestionPatterns = [
      /다음과? 같은? 질문을? 해보세요:?[\s\S]*?$/i,
      /추가로? 궁금한? 점:?[\s\S]*?$/i,
      /더 자세히 알고 싶다면:?[\s\S]*?$/i,
    ];

    for (const pattern of suggestionPatterns) {
      const match = response.match(pattern);
      if (match) {
        const lines = match[0].split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
            suggestions.push(line.trim().replace(/^[-\d.]\s*/, ''));
          }
        }
      }
    }

    return suggestions.slice(0, 3); // 최대 3개
  }

  private getDefaultScenario(task: Task): AgentScenario {
    return {
      agentType: 'process',
      automationLevel: 'partial',
      agentName: `${task.title} 자동화 Agent`,
      scenarioDescription: `${task.title} 업무의 일부를 자동화하여 효율성을 향상시킵니다.`,
      triggerCondition: '수동 실행 또는 스케줄 기반',
      expectedOutput: '처리된 결과물 및 진행 상황 리포트',
      humanIntervention: '최종 검토 및 승인',
      estimatedTimeSavedHours: Math.round(task.weeklyHours * 0.3),
    };
  }

  private generateCacheKey(input: AnalysisInput): string {
    const content = `${input.domains.join(',')}:${input.documents.substring(0, 100)}`;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }
}

export const claudeService = new ClaudeService();