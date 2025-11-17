import Anthropic from '@anthropic-ai/sdk';
import { Task, TaskFrequency, AutomationLevel } from '../types/workshop';
import { createModuleLogger } from '../utils/logger';
import { config } from '../config';

const logger = createModuleLogger('AIAnalysisService');

interface AITaskAnalysis {
  title: string;
  description: string;
  timeSpent: number;
  frequency: TaskFrequency;
  automation: AutomationLevel;
  automationMethod: string;
  category: string;
}

export class AIAnalysisService {
  private anthropic?: Anthropic;
  private hasApiKey: boolean;

  constructor() {
    this.hasApiKey = !!config.ai.anthropicApiKey;
    if (this.hasApiKey) {
      this.anthropic = new Anthropic({
        apiKey: config.ai.anthropicApiKey,
      });
    } else {
      logger.warn('⚠️ Anthropic API key not configured, using mock analysis');
    }
  }

  async analyzeTasks(
    documentText: string,
    domains: string[]
  ): Promise<AITaskAnalysis[]> {
    if (!this.hasApiKey) {
      logger.info('🔄 Using mock AI analysis (API key not configured)');
      return this.generateMockAnalysis(documentText);
    }

    logger.info('🤖 Starting Claude AI analysis');

    const systemPrompt = `당신은 업무 재설계 전문가입니다.
제공된 문서를 분석하여 반복적인 업무를 추출하고 자동화 방안을 제시하세요.

업무 영역: ${domains.join(', ')}

문서에서 다음과 같은 패턴을 찾아 업무를 추출하세요:
- 업무 제목이나 번호가 있는 섹션
- "소요 시간", "시간", "분" 등의 시간 정보
- "빈도", "매일", "매주", "매월", "일일", "주간", "월간" 등의 빈도 정보
- 업무 설명이나 절차

각 업무는 다음 정보를 포함해야 합니다:
- title: 업무명 (간결하게)
- description: 업무 설명 (구체적인 절차 포함)
- timeSpent: 소요 시간 (시간 단위로 변환, 분 단위는 시간으로 계산 예: 30분 = 0.5)
- frequency: 빈도 (daily/weekly/monthly로 변환)
- automation: 자동화 가능성 (high=완전자동화가능, medium=부분자동화가능, low=자동화어려움)
- automationMethod: 자동화 방법 제안 (구체적인 도구나 방법 명시)
- category: 업무 영역 (제공된 도메인 중 가장 적합한 것, 없으면 "기타")

30분 이상의 반복 업무만 추출하고, JSON 배열 형식으로만 응답하세요.`;

    const userMessage = `다음 문서에서 반복적인 업무를 추출해주세요:

${documentText.substring(0, 8000)}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      const textContent = response.content[0];

      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      // JSON 추출
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.error('JSON 형식 없음:', textContent.text);
        return [];
      }

      const tasks = JSON.parse(jsonMatch[0]) as AITaskAnalysis[];
      logger.info(`✅ ${tasks.length}개 업무 추출됨`);

      // 데이터 검증 및 정리
      return tasks.filter((task) => {
        const isValid = (
          task.title &&
          task.description &&
          typeof task.timeSpent === 'number' &&
          task.timeSpent > 0 &&
          ['daily', 'weekly', 'monthly'].includes(task.frequency) &&
          ['high', 'medium', 'low'].includes(task.automation) &&
          task.automationMethod &&
          task.category
        );

        if (isValid && !domains.includes(task.category)) {
          // 카테고리가 도메인에 없으면 "기타"로 설정
          task.category = domains.includes('기타') ? '기타' : domains[0];
        }

        return isValid;
      });

    } catch (error) {
      logger.error('Claude API 에러:', error);

      // Handle specific authentication errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          throw new Error('AI API 인증 실패: API 키를 확인해주세요. .env 파일의 ANTHROPIC_API_KEY 설정을 확인해주세요.');
        }
        if (error.message.includes('403') || error.message.includes('forbidden')) {
          throw new Error('AI API 접근 권한 없음: API 키가 올바르지 않거나 권한이 없습니다.');
        }
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('AI API 요청 한도 초과: 잠시 후 다시 시도해주세요.');
        }
      }

      throw new Error(`AI 분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async generateAutomationTemplates(
    tasks: Task[],
    templateType: 'ai_prompt' | 'n8n_workflow' | 'python_script' | 'javascript_code'
  ): Promise<{ taskId: string; name: string; content: string }[]> {
    logger.info(`🛠️ Generating ${templateType} templates for ${tasks.length} tasks`);

    const templates: { taskId: string; name: string; content: string }[] = [];

    for (const task of tasks) {
      try {
        const content = await this.generateSingleTemplate(task, templateType);
        if (content) {
          templates.push({
            taskId: task.id,
            name: this.generateTemplateName(task, templateType),
            content
          });
        }
      } catch (error) {
        logger.error(`Failed to generate template for task ${task.id}:`, error);
      }
    }

    return templates;
  }

  private async generateSingleTemplate(
    task: Task,
    templateType: 'ai_prompt' | 'n8n_workflow' | 'python_script' | 'javascript_code'
  ): Promise<string | null> {
    const systemPrompt = this.getSystemPromptForTemplateType(templateType);

    const userMessage = `업무 정보:
- 제목: ${task.title}
- 설명: ${task.description}
- 소요 시간: ${task.timeSpent}시간
- 빈도: ${this.translateFrequency(task.frequency)}
- 자동화 방법: ${task.automationMethod}
- 카테고리: ${task.category}

위 업무를 자동화하기 위한 ${templateType}을 생성해주세요.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      const textContent = response.content[0];

      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      return textContent.text;

    } catch (error) {
      logger.error(`Template generation error for ${templateType}:`, error);

      // Handle specific authentication errors for template generation
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          logger.error('AI API 인증 실패 - 템플릿 생성 건너뜀');
          return null;
        }
        if (error.message.includes('403') || error.message.includes('forbidden')) {
          logger.error('AI API 접근 권한 없음 - 템플릿 생성 건너뜀');
          return null;
        }
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          logger.error('AI API 요청 한도 초과 - 템플릿 생성 건너뜀');
          return null;
        }
      }

      return null;
    }
  }

  private getSystemPromptForTemplateType(templateType: string): string {
    switch (templateType) {
      case 'ai_prompt':
        return `업무 자동화를 위한 AI 프롬프트를 작성하는 전문가입니다.
주어진 업무를 ChatGPT, Claude 등 AI 도구로 자동화할 수 있는 효과적인 프롬프트를 작성하세요.
프롬프트는 구체적이고 실행 가능해야 합니다.`;

      case 'n8n_workflow':
        return `n8n 워크플로우 자동화 전문가입니다.
주어진 업무를 자동화할 수 있는 n8n 워크플로우 JSON을 생성하세요.
실제 n8n에서 import 가능한 형태로 작성해주세요.`;

      case 'python_script':
        return `Python 자동화 스크립트 개발 전문가입니다.
주어진 업무를 자동화할 수 있는 Python 스크립트를 작성하세요.
필요한 라이브러리와 함께 실행 가능한 코드를 제공하세요.`;

      case 'javascript_code':
        return `JavaScript 자동화 코드 개발 전문가입니다.
주어진 업무를 자동화할 수 있는 JavaScript 코드를 작성하세요.
Node.js 환경에서 실행 가능한 코드를 제공하세요.`;

      default:
        return '업무 자동화 도구를 생성하는 전문가입니다.';
    }
  }

  private generateTemplateName(
    task: Task,
    templateType: string
  ): string {
    const sanitizedTitle = task.title
      .replace(/[^a-zA-Z0-9가-힣\s\-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const extension = this.getFileExtension(templateType);
    return `${sanitizedTitle}_automation${extension}`;
  }

  private getFileExtension(type: string): string {
    const map = {
      'ai_prompt': '.txt',
      'n8n_workflow': '.json',
      'python_script': '.py',
      'javascript_code': '.js'
    };
    return map[type as keyof typeof map] || '.txt';
  }

  private translateFrequency(freq: TaskFrequency): string {
    const map = {
      daily: '일일',
      weekly: '주간',
      monthly: '월간'
    };
    return map[freq] || freq;
  }

  // Mock analysis for when API key is not available
  private generateMockAnalysis(documentText: string): AITaskAnalysis[] {
    logger.info('🔄 Generating mock analysis from document structure');

    const mockTasks: AITaskAnalysis[] = [];
    const lines = documentText.split('\n');

    // 간단한 패턴 매칭으로 업무 추출
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 번호가 있는 제목 라인 찾기 (1., 2., 3., 4.)
      const titleMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (titleMatch && titleMatch[2]) {
        const taskNumber = parseInt(titleMatch[1]);
        const title = titleMatch[2];

        // 다음 몇 라인에서 시간과 빈도 정보 찾기
        let description = title;
        let timeSpent = 1; // 기본값
        let frequency: TaskFrequency = 'weekly';

        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();

          // 시간 정보 추출
          const timeMatch = nextLine.match(/(\d+(?:\.\d+)?)\s*(분|시간|hours?|mins?)/i);
          if (timeMatch) {
            const time = parseFloat(timeMatch[1]);
            const unit = timeMatch[2];
            timeSpent = unit.includes('분') || unit.includes('min') ? time / 60 : time;
          }

          // 빈도 정보 추출
          if (nextLine.includes('매일') || nextLine.includes('daily')) {
            frequency = 'daily';
          } else if (nextLine.includes('매주') || nextLine.includes('weekly') || nextLine.includes('주')) {
            frequency = 'weekly';
          } else if (nextLine.includes('매월') || nextLine.includes('monthly') || nextLine.includes('월')) {
            frequency = 'monthly';
          }

          // 설명 수집
          if (nextLine.startsWith('-') && nextLine.length > 5) {
            description += ' ' + nextLine.substring(1).trim();
          }
        }

        // 자동화 가능성 결정 (간단한 휴리스틱)
        let automation: AutomationLevel = 'medium';
        let automationMethod = 'RPA 도구를 활용한 자동화';

        if (title.includes('보고서') || title.includes('데이터') || title.includes('정리')) {
          automation = 'high';
          automationMethod = 'Python 스크립트를 활용한 데이터 수집 및 보고서 자동 생성';
        } else if (title.includes('문의') || title.includes('응답') || title.includes('상담')) {
          automation = 'medium';
          automationMethod = '챗봇과 템플릿을 활용한 반자동화';
        } else if (title.includes('회의') || title.includes('미팅') || title.includes('상담')) {
          automation = 'low';
          automationMethod = '음성인식 도구를 활용한 회의록 초안 작성';
        }

        mockTasks.push({
          title: title,
          description: description.substring(0, 200), // 길이 제한
          timeSpent: Math.max(0.5, timeSpent),
          frequency: frequency,
          automation: automation,
          automationMethod: automationMethod,
          category: taskNumber <= 2 ? '업무관리' : taskNumber <= 4 ? '고객서비스' : '기타'
        });
      }
    }

    // 기본 업무가 없으면 샘플 생성
    if (mockTasks.length === 0) {
      mockTasks.push(
        {
          title: '일일 보고서 작성',
          description: '매일 아침 업무 현황을 정리하여 보고서 작성',
          timeSpent: 0.5,
          frequency: 'daily',
          automation: 'high',
          automationMethod: 'Python 스크립트를 활용한 데이터 수집 및 자동 보고서 생성',
          category: '업무관리'
        },
        {
          title: '고객 문의 응답',
          description: '고객센터 시스템에서 문의사항 확인 및 답변 작성',
          timeSpent: 1.5,
          frequency: 'daily',
          automation: 'medium',
          automationMethod: 'AI 챗봇과 템플릿을 활용한 1차 응답 자동화',
          category: '고객서비스'
        }
      );
    }

    logger.info(`📊 Mock analysis generated ${mockTasks.length} tasks`);
    return mockTasks;
  }
}