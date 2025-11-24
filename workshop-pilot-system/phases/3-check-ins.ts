import Anthropic from '@anthropic-ai/sdk';
import { Persona } from '../2-personas/personas-v3';
import { StepJourney, WorkshopJourney } from './2-workshop-execution';
import {
  buildPersonaIdentity,
  getTemperature,
  addChainOfThought,
  addFewShotExamples
} from './utils/enhanced-prompts';

export interface CheckInResult {
  step: number;
  feeling: string;
  difficulties: string[];
  wouldContinue: boolean;
  wouldContinueReason: string;
  immediateImprovements: string[];
  mood: '😊' | '😐' | '😞' | '😤';
  satisfaction: number; // 1-10
  timestamp: string;
}

export interface PostInterviewResult {
  personaId: string;
  personaName: string;

  // 기대 vs 현실
  expectationVsReality: string;

  // 가장 힘들었던 순간
  hardestMoment: {
    step: number;
    reason: string;
  };

  // 실제 적용 가능성
  applicability: {
    score: number; // 1-10
    reason: string;
  };

  // 추천 의향
  wouldRecommend: {
    yes: boolean;
    reason: string;
  };

  // 시급한 개선사항 Top 3
  urgentImprovements: string[];

  // 다시 한다면
  ifAgain: string;

  // 전체 소감
  overallFeedback: string;

  timestamp: string;
}

/**
 * 각 단계 완료 후 중간 체크인
 * 실제 파일럿에서 "지금까지 어떠세요?" 묻는 단계
 */
export async function conductCheckIn(
  persona: Persona,
  stepJourney: StepJourney,
  anthropic: Anthropic
): Promise<CheckInResult> {
  // 1. 페르소나 정체성
  const identity = buildPersonaIdentity(persona);

  // 2. Chain of Thought
  const cot = addChainOfThought(persona, `Step ${stepJourney.step}: ${stepJourney.stepName}`);

  // 3. Few-shot Examples
  const examples = addFewShotExamples(persona.category);

  // 4. 실제 질문
  const questions = `
[중간 체크인 - Step ${stepJourney.step}: ${stepJourney.stepName} 완료 직후]

**방금 한 작업:**
- 소요 시간: ${stepJourney.actualDuration.toFixed(1)}분
${stepJourney.errors > 0 ? `- ⚠️ 에러 발생: ${stepJourney.errors}개` : ''}
${stepJourney.aiResponse ? `- AI 응답: "${stepJourney.aiResponse.substring(0, 100)}..."` : ''}

**관찰된 이슈:**
${
  stepJourney.observations.length > 0
    ? stepJourney.observations.map(o => `- ${o.observation}`).join('\n')
    : '- 특별한 이슈 없음'
}

**퍼실리테이터 질문:**

1. **우리 팀의 구체적인 상황을 고려하여** 지금까지 어떠세요?
   - 이 단계가 우리 팀의 pain points (${persona.work.painPoints[0]})와 관련이 있나요?
   - 우리 팀의 업무 특성 (${persona.team.size}명, ${persona.team.maturityDistribution})을 이 단계에 반영하기 적합했나요?
   - 우리의 업무 구조화 수준 (${persona.work.workStructure.level})에 맞나요?

2. 방금 이 단계에서 **구체적으로** 어려웠던 점은?
   - 예: "Step ${stepJourney.step}에서 '업무 내용'을 입력할 때, 우리 팀의 [구체적 업무]는 [구체적 이유]로 입력하기 어려웠습니다."
   - 우리가 사용하는 도구 (${persona.work.toolsUsed.slice(0, 3).join(', ')})와의 연동은 어땠나요?

3. 다음 단계로 계속 진행하고 싶으신가요?
   - 우리 팀의 자동화 니즈 (${persona.work.automationNeeds[0]})를 해결할 가능성이 보이나요?

4. **우리 팀에 맞춰서** 지금 당장 개선되면 좋겠다고 생각하는 것은?
   - ${persona.category} 부서 특화 기능이 필요한가요?

5. 현재 기분: 😊 좋음 / 😐 보통 / 😞 힘듦 / 😤 짜증

6. 이 단계 만족도: 1-10점

**JSON 응답:**
{
  "feeling": "구체적인 느낌 (팀의 pain point, 업무 특성, 사용 도구 등 언급, 2-3문장)",
  "difficulties": [
    "구체적 어려움1 (예: '우리 팀의 [pain point]를 입력 필드에 어떻게 표현할지...')",
    "구체적 어려움2 (예: '내가 만든 워크플로우를 팀 ${persona.team.size}명(${persona.team.maturityDistribution})에게 적용할 때 우려되는 점...')"
  ],
  "wouldContinue": true | false,
  "wouldContinueReason": "계속/중단 이유 (자동화 니즈 해결 가능성 언급)",
  "immediateImprovements": [
    "${persona.category} 부서를 위한 구체적 개선사항1",
    "팀에 도입할 때를 고려한 개선사항2"
  ],
  "mood": "😊 | 😐 | 😞 | 😤",
  "satisfaction": 1~10
}

**중요:** 추상적이거나 일반적인 답변이 아닌, 우리 팀의 구체적인 상황을 반영하세요.
`;

  const fullPrompt = `${identity}\n\n${cot}\n\n${questions}\n\n${examples}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      temperature: getTemperature(persona),
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          step: stepJourney.step,
          ...parsed,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error(`    ⚠️ 체크인 실패: ${error}`);
  }

  // Fallback
  return {
    step: stepJourney.step,
    feeling: "진행 중",
    difficulties: [],
    wouldContinue: true,
    wouldContinueReason: "계속 진행",
    immediateImprovements: [],
    mood: '😐',
    satisfaction: 5,
    timestamp: new Date().toISOString()
  };
}

/**
 * 전체 워크샵 완료 후 사후 인터뷰
 * 실제 파일럿에서 전체 경험을 회고하는 단계
 */
export async function conductPostInterview(
  persona: Persona,
  journey: WorkshopJourney,
  checkIns: CheckInResult[],
  anthropic: Anthropic
): Promise<PostInterviewResult> {
  console.log(`\n💬 [사후 인터뷰] ${persona.name}`);

  // 가장 힘들었던 단계 찾기
  const hardestStep =
    checkIns.length > 0
      ? checkIns.reduce((prev, curr) => (curr.satisfaction < prev.satisfaction ? curr : prev))
      : null;

  const avgSatisfaction =
    checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.satisfaction, 0) / checkIns.length : 5;

  // 1. 페르소나 정체성
  const identity = buildPersonaIdentity(persona);

  // 2. Chain of Thought
  const cot = addChainOfThought(persona, '전체 워크샵 완료 후 사후 인터뷰');

  // 3. Few-shot Examples
  const examples = addFewShotExamples(persona.category);

  // 4. 실제 질문
  const questions = `[사후 인터뷰 - 전체 워크샵 완료 후]

${persona.name}님, 수고하셨습니다!

**전체 여정 요약:**
- 총 소요 시간: ${journey.totalDuration.toFixed(1)}분
- 완료한 단계: ${journey.completedSteps}/11
- 평균 만족도: ${avgSatisfaction.toFixed(1)}/10
${journey.dropoutAt ? `- ⚠️ Step ${journey.dropoutAt}에서 중단: ${journey.dropoutReason}` : ''}

**사전 인터뷰에서 하신 말씀:**
- 기대: "${journey.preInterview.expectations}"
- 우려: "${journey.preInterview.concerns.join(', ')}"
- 초기 기분: ${journey.preInterview.initialMood}

**가장 힘들었던 순간:**
${hardestStep ? `Step ${hardestStep.step} (만족도 ${hardestStep.satisfaction}/10)` : '없음'}

**퍼실리테이터의 사후 인터뷰 질문:**

1. **사전 기대 vs 실제 경험**
   ${persona.department} 팀장으로서 기대했던 것과 실제로 달랐던 점은 무엇인가요?
   우리 팀의 업무 특성에 맞았나요?

2. **가장 힘들었던 순간**
   ${hardestStep ? `Step ${hardestStep.step}에서 만족도가 ${hardestStep.satisfaction}/10이었는데,` : ''}
   **구체적으로** 무엇이 가장 힘들었나요?
   - 우리 팀의 pain points (${persona.work.painPoints[0]})를 해결하는 데 어떤 장애가 있었나요?
   - 우리 팀의 업무 특성 (${persona.team.size}명, 성숙도 분포: ${persona.team.maturityDistribution})을 반영하기 어려웠나요?

3. **우리 팀에 실제 적용 가능성** (10점 만점)
   - 우리 팀의 업무 구조화 수준 (${persona.work.workStructure.level})을 고려했을 때
   - 우리가 사용하는 도구 (${persona.work.toolsUsed.slice(0, 3).join(', ')})와의 통합 가능성
   - 우리의 자동화 니즈 (${persona.work.automationNeeds[0]})를 충족할 수 있는가?

4. **같은 ${persona.category} 부서의 동료 팀장들에게 추천하시겠어요?**
   - 우리 부서의 업무 특성 (${persona.work.workStructure.description})을 고려했을 때
   - 같은 pain points를 가진 팀장들에게 도움이 될까요?

5. **우리 팀을 위한 가장 시급한 개선 사항 Top 3**
   - ${persona.category} 부서 특화 기능이 필요한가요?
   - 팀 ${persona.team.size}명 규모에 맞는 워크플로우 설계 가이드가 필요한가요?
   - 워크플로우 결과물을 팀에 도입할 때, 우리의 디지털 성숙도 분포를 고려한 교육 자료가 필요한가요?

6. **만약 다시 이 워크샵에 참여한다면?**
   무엇이 달라지면 더 나을까요?

7. **전체 소감 (1-2문장)**

**JSON 응답:**
{
  "expectationVsReality": "구체적인 기대와 현실 차이 (팀의 pain points, 자동화 니즈 해결 여부 언급, 3-4문장)",
  "hardestMoment": {
    "step": ${hardestStep?.step || 1},
    "reason": "구체적으로 왜 힘들었는지 (우리 팀의 업무 특성이나 pain point를 반영하기 어려웠던 이유)"
  },
  "applicability": {
    "score": 1~10,
    "reason": "업무 구조화 수준 (${persona.work.workStructure.level}), 도구 통합, 자동화 니즈 충족 가능성 종합"
  },
  "wouldRecommend": {
    "yes": true | false,
    "reason": "같은 ${persona.category} 부서 팀장들에게 추천/비추천하는 구체적 이유 (업무 특성 언급)"
  },
  "urgentImprovements": [
    "${persona.category} 부서 특화 개선사항 (구체적)",
    "팀 ${persona.team.size}명 규모에 맞는 워크플로우 설계 가이드",
    "워크플로우를 팀에 도입할 때 필요한 교육 자료 (디지털 성숙도 분포 고려)"
  ],
  "ifAgain": "다시 참여한다면 필요한 것 (구체적)",
  "overallFeedback": "전체 소감 (1-2문장, 솔직하게)"
}

**중요:** 추상적이거나 일반적인 답변이 아닌, 우리 팀의 구체적인 상황을 반영하세요.
`;

  const fullPrompt = `${identity}\n\n${cot}\n\n${questions}\n\n${examples}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: getTemperature(persona),
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        console.log(`  ✅ 완료 - 추천: ${parsed.wouldRecommend.yes ? 'Yes' : 'No'}`);

        return {
          personaId: persona.id,
          personaName: persona.name,
          ...parsed,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    console.error(`  ❌ 사후 인터뷰 실패: ${error}`);
  }

  // Fallback
  return {
    personaId: persona.id,
    personaName: persona.name,
    expectationVsReality: "예상과 다른 부분이 있었음",
    hardestMoment: {
      step: hardestStep?.step || 5,
      reason: "복잡한 입력"
    },
    applicability: {
      score: 6,
      reason: "부분적으로 적용 가능"
    },
    wouldRecommend: {
      yes: true,
      reason: "개선 여지는 있지만 유용함"
    },
    urgentImprovements: [
      "사용성 개선",
      "가이드 강화",
      "시간 단축"
    ],
    ifAgain: "더 명확한 안내가 있었으면",
    overallFeedback: "전반적으로 괜찮았음",
    timestamp: new Date().toISOString()
  };
}
