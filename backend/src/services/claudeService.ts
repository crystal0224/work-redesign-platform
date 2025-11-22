import Anthropic from '@anthropic-ai/sdk';
import { Task } from '../types/workshop';
import { logger } from '../utils/logger';
import { getAICache } from './ai-cache.service';

export class ClaudeService {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyzeTasks(documentText: string, domains: string[]): Promise<Task[]> {
    logger.info('🤖 Starting Claude AI task analysis');

    const systemPrompt = `당신은 업무 재설계 전문가입니다.
제공된 문서를 분석하여 반복적인 업무를 추출하고 자동화 방안을 제시하세요.

업무 영역: ${domains.join(', ')}

각 업무는 다음 정보를 포함해야 합니다:
- title: 업무명 (간결하게)
- description: 업무 설명
- timeSpent: 소요 시간 (시간 단위, 숫자)
- frequency: 빈도 (daily/weekly/monthly)
- automation: 자동화 가능성 (high/medium/low)
- automationMethod: 자동화 방법 제안 (구체적으로)
- category: 업무 영역 (위 도메인 중 하나)

JSON 배열 형식으로만 응답하세요.`;

    const userMessage = `다음 문서에서 반복적인 업무를 추출해주세요:

${documentText.substring(0, 8000)}`;

    try {
      // 💰 Check cache first
      const aiCache = getAICache();
      const cacheKey = `${systemPrompt}\n${userMessage}`;
      const cachedResult = await aiCache.getCachedResponse(cacheKey, { domains });

      if (cachedResult) {
        const tasks = JSON.parse(cachedResult);
        logger.info(`💰 Cache HIT! ${tasks.length} tasks retrieved from cache - API call saved!`);
        return tasks;
      }

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
        throw new Error('Unexpected response type from Claude');
      }

      // JSON 추출
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.error('No JSON format found in Claude response:', textContent.text);
        return [];
      }

      const tasks = JSON.parse(jsonMatch[0]);
      logger.info(`✅ ${tasks.length} tasks extracted by Claude`);

      // 💰 Store in cache for future requests
      await aiCache.setCachedResponse(cacheKey, { domains }, JSON.stringify(tasks));
      logger.info('💰 Response cached for future use');

      return tasks;

    } catch (error) {
      logger.error('Claude API error:', error);
      throw error;
    }
  }

  async generateAIPrompt(task: Task): Promise<string> {
    const systemPrompt = `당신은 AI 프롬프트 작성 전문가입니다.
주어진 업무를 자동화하기 위한 Claude/ChatGPT용 프롬프트를 작성해주세요.
프롬프트는 구체적이고 실용적이어야 합니다.`;

    const userMessage = `다음 업무를 위한 AI 프롬프트를 작성해주세요:

업무명: ${task.title}
설명: ${task.description}
자동화 방법: ${task.automationMethod}
소요 시간: ${task.timeSpent}시간/${task.frequency}
카테고리: ${task.category}

프롬프트는 다음 형식으로 작성해주세요:
1. 역할 정의
2. 구체적인 작업 지시
3. 입력 형식 설명
4. 출력 형식 설명
5. 예시 (필요시)`;

    try {
      // 💰 Check cache first
      const aiCache = getAICache();
      const cacheKey = `${systemPrompt}\n${userMessage}`;
      const cachedResult = await aiCache.getCachedResponse(cacheKey, { taskId: task.id });

      if (cachedResult) {
        logger.info(`💰 Cache HIT! AI prompt retrieved from cache - API call saved!`);
        return cachedResult;
      }

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // 💰 Store in cache for future requests
      await aiCache.setCachedResponse(cacheKey, { taskId: task.id }, textContent.text);
      logger.info('💰 AI prompt cached for future use');

      return textContent.text;

    } catch (error) {
      logger.error('Claude prompt generation error:', error);
      throw error;
    }
  }

  async generatePythonScript(task: Task): Promise<string> {
    const systemPrompt = `당신은 Python 개발 전문가입니다.
주어진 업무를 자동화하는 Python 스크립트를 작성해주세요.
스크립트는 실행 가능하고 주석이 잘 달려있어야 합니다.`;

    const userMessage = `다음 업무를 자동화하는 Python 스크립트를 작성해주세요:

업무명: ${task.title}
설명: ${task.description}
자동화 방법: ${task.automationMethod}
빈도: ${task.frequency}

요구사항:
- 실행 가능한 Python 코드
- 적절한 에러 핸들링
- 상세한 주석
- 필요한 라이브러리 import
- 설정 변수는 상단에 정의
- main 함수 구조 사용`;

    try {
      // 💰 Check cache first
      const aiCache = getAICache();
      const cacheKey = `${systemPrompt}\n${userMessage}`;
      const cachedResult = await aiCache.getCachedResponse(cacheKey, { taskId: task.id });

      if (cachedResult) {
        logger.info(`💰 Cache HIT! Python script retrieved from cache - API call saved!`);
        return cachedResult;
      }

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // 💰 Store in cache for future requests
      await aiCache.setCachedResponse(cacheKey, { taskId: task.id }, textContent.text);
      logger.info('💰 Python script cached for future use');

      return textContent.text;

    } catch (error) {
      logger.error('Claude Python script generation error:', error);
      throw error;
    }
  }

  async generateN8nWorkflow(task: Task): Promise<string> {
    const systemPrompt = `당신은 n8n 워크플로우 전문가입니다.
주어진 업무를 자동화하는 n8n 워크플로우 JSON을 작성해주세요.
워크플로우는 실제로 import 가능한 형식이어야 합니다.`;

    const userMessage = `다음 업무를 자동화하는 n8n 워크플로우를 작성해주세요:

업무명: ${task.title}
설명: ${task.description}
자동화 방법: ${task.automationMethod}
빈도: ${task.frequency}

워크플로우 요구사항:
- n8n에서 바로 import 가능한 JSON 형식
- 적절한 노드 연결
- 트리거 설정 (스케줄러, 웹훅 등)
- 에러 핸들링 노드 포함
- 주석 노드로 설명 추가`;

    try {
      // 💰 Check cache first
      const aiCache = getAICache();
      const cacheKey = `${systemPrompt}\n${userMessage}`;
      const cachedResult = await aiCache.getCachedResponse(cacheKey, { taskId: task.id });

      if (cachedResult) {
        logger.info(`💰 Cache HIT! n8n workflow retrieved from cache - API call saved!`);
        return cachedResult;
      }

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      const textContent = response.content[0];
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // JSON 추출
      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/) ||
                       textContent.text.match(/\{[\s\S]*\}/);

      const result = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : textContent.text;

      // 💰 Store in cache for future requests
      await aiCache.setCachedResponse(cacheKey, { taskId: task.id }, result);
      logger.info('💰 n8n workflow cached for future use');

      return result;

    } catch (error) {
      logger.error('Claude n8n workflow generation error:', error);
      throw error;
    }
  }
}