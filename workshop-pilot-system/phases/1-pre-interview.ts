import Anthropic from '@anthropic-ai/sdk';
import { Persona } from '../2-personas/personas-v3';
import {
  buildPersonaIdentity,
  getTemperature,
  addChainOfThought,
  addFewShotExamples
} from './utils/enhanced-prompts';

export interface PreInterviewResult {
  personaId: string;
  personaName: string;
  expectations: string;
  concerns: string[];
  digitalExperience: string;
  timeWorries: string;
  keyQuestions: string[];
  initialMood: 'excited' | 'neutral' | 'worried' | 'skeptical';
  timestamp: string;
}

/**
 * 사전 인터뷰 실시
 * 실제 파일럿에서 참가자의 배경, 기대, 우려를 파악하는 단계
 */
export async function conductPreInterview(
  persona: Persona,
  anthropic: Anthropic
): Promise<PreInterviewResult> {
  console.log(
    `\n📋 [사전 인터뷰] ${persona.name} (${persona.department}, ${persona.team.digitalMaturity})`
  );

  // 1. 페르소나 정체성 구축
  const identity = buildPersonaIdentity(persona);

  // 2. Chain of Thought
  const cot = addChainOfThought(persona, '워크샵 참여 전 사전 인터뷰');

  // 3. Few-shot Examples
  const examples = addFewShotExamples(persona.category);

  // 4. 실제 질문
  const questions = `
**퍼실리테이터의 사전 인터뷰 질문:**

1. **우리 팀의 구체적인 상황을 고려하여** 이 워크샵에 참여하게 된 소감과 기대하시는 점은 무엇인가요?
   - 우리 팀의 pain points: ${persona.work.painPoints.slice(0, 2).join(', ')}
   - 이 워크샵에서 해결하고 싶은 것은?

2. ${persona.department} 팀의 업무 특성상 이 워크샵에서 우려되거나 걱정되는 점이 있나요?
   - 우리 팀의 업무 구조화 수준: ${persona.work.workStructure.level}
   - ${persona.work.workStructure.description}
   - 이 점이 워크샵 참여에 어떤 영향을 줄까요?

3. 평소 디지털 도구나 협업 플랫폼 사용 경험은 어떠신가요?
   - 우리 팀이 사용하는 도구: ${persona.work.toolsUsed.slice(0, 3).join(', ')}
   - 팀 디지털 성숙도: ${persona.team.digitalMaturity}
   - 성숙도 분포: ${persona.team.maturityDistribution}

4. 3시간 워크샵이 현실적으로 가능할까요? 시간적 부담은 없으신가요?
   - 당신의 인내심: ${persona.personality.patience}/10
   - 변화 저항: ${persona.personality.changeResistance}

5. 워크샵에서 가장 궁금하거나 확인하고 싶은 점은 무엇인가요?
   - 우리 팀의 자동화 니즈: ${persona.work.automationNeeds.slice(0, 2).join(', ')}

6. 지금 기분은? (솔직하게)
   - 기대되고 설렌다
   - 그냥 해보자는 마음
   - 약간 걱정되고 불안하다
   - 회의적이다 (과연 도움이 될까...)

**JSON 응답 형식:**
{
  "expectations": "구체적인 기대 (우리 팀의 pain point나 자동화 니즈 언급, 2-3문장)",
  "concerns": ["구체적 우려1 (팀 구성, 성숙도 분포 언급)", "구체적 우려2", "구체적 우려3"],
  "digitalExperience": "팀의 도구 사용 경험 (구체적 툴 이름 언급, 2-3문장)",
  "timeWorries": "시간 부담 관련 (인내심, 변화 저항 고려, 1-2문장)",
  "keyQuestions": ["우리 팀 상황에 맞춘 구체적 질문1", "질문2"],
  "initialMood": "excited | neutral | worried | skeptical"
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

        console.log(`  ✅ 완료 - 기대: "${parsed.expectations.substring(0, 60)}..."`);
        console.log(`  😊 기분: ${parsed.initialMood}`);

        return {
          personaId: persona.id,
          personaName: persona.name,
          ...parsed,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Fallback
    return createFallbackInterview(persona);
  } catch (error) {
    console.error(`  ❌ 에러: ${error}`);
    return createFallbackInterview(persona);
  }
}

function createFallbackInterview(persona: Persona): PreInterviewResult {
  return {
    personaId: persona.id,
    personaName: persona.name,
    expectations: `우리 팀의 ${persona.work.painPoints[0]}를 해결하고 싶습니다`,
    concerns: [
      `팀 ${persona.team.size}명의 디지털 성숙도 분포(${persona.team.maturityDistribution})가 우려됨`,
      `업무 구조화 수준(${persona.work.workStructure.level})에 맞을지 걱정`
    ],
    digitalExperience: `${persona.work.toolsUsed.slice(0, 3).join(', ')} 등을 사용 중`,
    timeWorries: '3시간이 다소 부담스러움',
    keyQuestions: persona.work.automationNeeds.slice(0, 2),
    initialMood: persona.expectedBehavior.initialAttitude === '기대함' ? 'excited' : 'neutral',
    timestamp: new Date().toISOString()
  };
}

/**
 * 전체 페르소나 사전 인터뷰 실시
 */
export async function conductAllPreInterviews(
  personas: Persona[],
  anthropic: Anthropic
): Promise<PreInterviewResult[]> {
  console.log('\n' + '='.repeat(70));
  console.log('📋 Phase 1: 사전 인터뷰 (Pre-Workshop Interview)');
  console.log('='.repeat(70));
  console.log(`\n${personas.length}명의 참가자 인터뷰 시작...\n`);

  const results: PreInterviewResult[] = [];

  for (const persona of personas) {
    const result = await conductPreInterview(persona, anthropic);
    results.push(result);

    // Rate limit 방지 - Sonnet 4.5 사용, 배치 실행 시 4초 대기
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  // 요약 통계
  const moodCounts = {
    excited: results.filter(r => r.initialMood === 'excited').length,
    neutral: results.filter(r => r.initialMood === 'neutral').length,
    worried: results.filter(r => r.initialMood === 'worried').length,
    skeptical: results.filter(r => r.initialMood === 'skeptical').length
  };

  console.log('\n📊 사전 인터뷰 요약:');
  console.log(`  😊 기대함: ${moodCounts.excited}명`);
  console.log(`  😐 중립: ${moodCounts.neutral}명`);
  console.log(`  😟 걱정: ${moodCounts.worried}명`);
  console.log(`  🤔 회의적: ${moodCounts.skeptical}명`);

  return results;
}
