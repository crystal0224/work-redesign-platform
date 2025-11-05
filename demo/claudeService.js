const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key'
    });
  }

  async analyzeWorkTasks(input) {
    try {
      const systemPrompt = this.getAnalysisSystemPrompt(input.userContext);
      const userPrompt = this.getAnalysisUserPrompt(input);

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      return this.parseAnalysisResponse(response.content[0].text);
    } catch (error) {
      console.error('Claude API Error:', error);
      return this.getFallbackAnalysis(input);
    }
  }

  getAnalysisSystemPrompt(userContext) {
    return `당신은 SK그룹의 업무 재설계 전문가입니다. 팀장들의 현재 업무를 분석하여 자동화 가능한 작업들을 식별하고, 구체적인 개선 방안을 제시해야 합니다.

분석 기준:
1. 반복적이고 규칙적인 업무 → 자동화 우선순위 높음
2. 데이터 처리 및 분석 업무 → AI 도구 활용 가능
3. 의사소통 및 협업 업무 → 플랫폼/도구 개선 가능
4. 보고서 작성 및 문서화 → 템플릿/자동화 적용 가능

사용자 컨텍스트: ${JSON.stringify(userContext)}

응답 형식은 반드시 다음 JSON 구조로 제공하세요:
{
  "tasks": [
    {
      "id": "task-uuid",
      "title": "작업 제목",
      "description": "구체적인 작업 설명",
      "priority": "HIGH|MEDIUM|LOW",
      "estimatedHours": 숫자,
      "impact": "예상 효과",
      "skills": ["필요 기술1", "필요 기술2"],
      "automationType": "FULL|PARTIAL|TOOL_ASSISTED",
      "agentType": "ANALYSIS|TASK|COORDINATION|OPTIMIZATION"
    }
  ],
  "scenarios": [
    {
      "id": "scenario-uuid",
      "title": "시나리오 제목",
      "description": "구현 방식 설명",
      "timeline": "예상 기간",
      "risk": "Low|Medium|High",
      "agents": [
        {
          "name": "에이전트 이름",
          "type": "ANALYSIS|TASK|COORDINATION|OPTIMIZATION",
          "skills": ["역량1", "역량2"]
        }
      ]
    }
  ]
}`;
  }

  getAnalysisUserPrompt(input) {
    return `업무 재설계 분석 요청:

업무 도메인: ${input.domain || '명시되지 않음'}
업무 영역: ${input.areas ? input.areas.join(', ') : '명시되지 않음'}
현재 업무 설명: ${input.description || '명시되지 않음'}
주요 업무 도구: ${input.tools ? input.tools.join(', ') : '명시되지 않음'}
업무 문서/데이터: ${input.materials ? input.materials.join(', ') : '없음'}

위 정보를 바탕으로:
1. 자동화 가능한 구체적인 작업들을 식별해주세요 (최소 3개, 최대 8개)
2. 각 작업의 우선순위와 예상 효과를 분석해주세요
3. 실행 가능한 구현 시나리오를 제시해주세요 (1-3개)
4. 필요한 AI 에이전트 역할을 정의해주세요

한국어로 실무진이 이해하기 쉽게 작성해주세요.`;
  }

  parseAnalysisResponse(responseText) {
    try {
      // JSON 부분만 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // ID가 없는 경우 생성
        if (parsed.tasks) {
          parsed.tasks = parsed.tasks.map((task, index) => ({
            ...task,
            id: task.id || `ai-task-${Date.now()}-${index}`
          }));
        }

        if (parsed.scenarios) {
          parsed.scenarios = parsed.scenarios.map((scenario, index) => ({
            ...scenario,
            id: scenario.id || `scenario-${Date.now()}-${index}`
          }));
        }

        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
    }

    return this.getFallbackAnalysis();
  }

  getFallbackAnalysis(input = {}) {
    return {
      tasks: [
        {
          id: `fallback-task-${Date.now()}-1`,
          title: '업무 프로세스 자동화 프레임워크 구축',
          description: '현재 수동으로 처리하는 반복 업무들을 자동화할 수 있는 체계적인 프레임워크를 구축합니다.',
          priority: 'HIGH',
          estimatedHours: 32,
          impact: '업무 효율성 40% 향상 예상',
          skills: ['프로세스 설계', '자동화 도구'],
          automationType: 'PARTIAL',
          agentType: 'TASK'
        },
        {
          id: `fallback-task-${Date.now()}-2`,
          title: '실시간 모니터링 대시보드 구축',
          description: '자동화된 프로세스들의 상태를 실시간으로 모니터링할 수 있는 대시보드를 구축합니다.',
          priority: 'MEDIUM',
          estimatedHours: 20,
          impact: '업무 가시성 및 대응 속도 향상',
          skills: ['대시보드 설계', '데이터 시각화'],
          automationType: 'TOOL_ASSISTED',
          agentType: 'ANALYSIS'
        },
        {
          id: `fallback-task-${Date.now()}-3`,
          title: '오류 처리 및 복구 시스템 개발',
          description: '자동화 프로세스에서 발생할 수 있는 오류를 감지하고 자동 복구하는 시스템을 개발합니다.',
          priority: 'HIGH',
          estimatedHours: 16,
          impact: '시스템 안정성 및 가동 시간 향상',
          skills: ['오류 처리', '시스템 설계'],
          automationType: 'FULL',
          agentType: 'OPTIMIZATION'
        }
      ],
      scenarios: [
        {
          id: `fallback-scenario-${Date.now()}`,
          title: '단계적 애자일 구현 접근법',
          description: '2주 스프린트 단위로 지속적인 피드백을 받아가며 변화를 구현합니다.',
          timeline: '12주',
          risk: 'Low',
          agents: [
            {
              name: '프로세스 분석가',
              type: 'ANALYSIS',
              skills: ['프로세스 매핑', '요구사항 분석']
            },
            {
              name: '자동화 엔지니어',
              type: 'TASK',
              skills: ['Python', 'API 연동']
            },
            {
              name: '품질 코디네이터',
              type: 'COORDINATION',
              skills: ['테스팅', '품질 보증']
            }
          ]
        }
      ]
    };
  }

  async generatePromptTemplate(task, agentType) {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.2,
        system: `당신은 AI 프롬프트 템플릿 생성 전문가입니다. 주어진 작업에 대해 실용적이고 효과적인 프롬프트 템플릿을 생성해주세요.`,
        messages: [{
          role: 'user',
          content: `다음 작업을 위한 ${agentType} 에이전트용 프롬프트 템플릿을 생성해주세요:

작업: ${task.title}
설명: ${task.description}
에이전트 타입: ${agentType}

템플릿은 다음 형식으로 작성해주세요:
1. 역할 정의
2. 작업 컨텍스트
3. 구체적인 지시사항
4. 출력 형식
5. 예시 (가능한 경우)

실무에서 바로 사용할 수 있도록 구체적이고 명확하게 작성해주세요.`
        }]
      });

      return {
        title: `${task.title} - ${agentType} 에이전트 프롬프트`,
        content: response.content[0].text,
        agentType,
        taskId: task.id
      };
    } catch (error) {
      console.error('Template generation error:', error);
      return {
        title: `${task.title} - ${agentType} 에이전트 프롬프트`,
        content: `# ${agentType} 에이전트 프롬프트 템플릿

## 역할
당신은 ${task.title} 작업을 수행하는 ${agentType} 전문 에이전트입니다.

## 작업 설명
${task.description}

## 지시사항
1. 작업의 목표를 명확히 이해하세요
2. 단계별로 체계적으로 접근하세요
3. 결과물의 품질을 확인하세요
4. 문제 발생시 대안을 제시하세요

## 출력 형식
- 구체적이고 실행 가능한 결과물
- 진행 상황 및 완료 여부 보고
- 필요시 추가 조치 사항 제안`,
        agentType,
        taskId: task.id
      };
    }
  }
}

module.exports = ClaudeService;