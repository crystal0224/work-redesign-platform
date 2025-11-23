#!/usr/bin/env ts-node

/**
 * 실제 워크샵 플랫폼 UI/UX에 기반한 현실적인 시뮬레이션
 * - 11단계 실제 구조 반영
 * - 실제 인터페이스 (체크박스, 텍스트 입력 등) 고려
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { expandedPersonas } from './sk-expanded-personas';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

// 실제 워크샵 11단계 정의
const ACTUAL_WORKSHOP_STEPS = [
  {
    id: 1,
    name: '워크샵 시작',
    description: '워크샵 소개 페이지, 4단계 과정 설명',
    estimatedMinutes: 2,
    uiType: 'landing_page'
  },
  {
    id: 2,
    name: '미션 작성',
    description: '팀 목표와 고객 가치 텍스트 입력',
    estimatedMinutes: 5,
    uiType: 'text_input'
  },
  {
    id: 3,
    name: '팀 상황 확인',
    description: '팀원 수 입력, 체크박스로 팀 특성 선택',
    estimatedMinutes: 3,
    uiType: 'checkbox_selection'
  },
  {
    id: 4,
    name: '업무 영역 정의',
    description: '주요 업무 도메인 입력',
    estimatedMinutes: 5,
    uiType: 'text_input'
  },
  {
    id: 5,
    name: '업무 내용 입력',
    description: '구체적인 업무 내용 텍스트/파일 업로드',
    estimatedMinutes: 10,
    uiType: 'text_file_input'
  },
  {
    id: 6,
    name: '업무 추출 (AI)',
    description: 'AI가 업무 자동 분석 및 추출',
    estimatedMinutes: 5,
    uiType: 'ai_processing'
  },
  {
    id: 7,
    name: '결과 요약',
    description: '추출된 업무 확인 및 수정',
    estimatedMinutes: 5,
    uiType: 'review_edit'
  },
  {
    id: 8,
    name: 'AI 교육',
    description: 'AI 자동화 관련 교육 콘텐츠',
    estimatedMinutes: 5,
    uiType: 'educational_content'
  },
  {
    id: 9,
    name: 'AI 컨설팅',
    description: 'AI 도입 전략 및 ROI 분석',
    estimatedMinutes: 5,
    uiType: 'consulting_report'
  },
  {
    id: 10,
    name: '워크플로우 설계',
    description: '자동화 워크플로우 시각적 설계',
    estimatedMinutes: 7,
    uiType: 'visual_designer'
  },
  {
    id: 11,
    name: '최종 리포트',
    description: '전체 결과 정리 및 다운로드',
    estimatedMinutes: 3,
    uiType: 'report_download'
  }
];

interface SimulationResult {
  personaId: string;
  personaName: string;
  teamSize: string;
  digitalMaturity: string;
  stepResults: StepResult[];
  overallFeedback: string;
  completionRate: number;
  totalMinutes: number;
}

interface StepResult {
  stepId: number;
  stepName: string;
  actualMinutes: number;
  ease: number; // 1-10
  clarity: number; // 1-10
  value: number; // 1-10
  specificActions?: string[];
  feedback?: string;
  issues?: string[];
}

async function simulatePersonaExperience(persona: any): Promise<SimulationResult> {
  const stepResults: StepResult[] = [];
  let totalMinutes = 0;
  let shouldContinue = true;

  for (const step of ACTUAL_WORKSHOP_STEPS) {
    if (!shouldContinue) break;

    const prompt = `당신은 ${persona.name}(${persona.role}, ${persona.company})입니다.

팀 정보:
- 팀 규모: ${persona.teamSize}
- 디지털 성숙도: ${persona.digitalMaturity}
- 업무 구조화: ${persona.workStructure}
- AI 경험: ${persona.aiExperience}

현재 Work Redesign Platform의 워크샵 Step ${step.id}: ${step.name}을 진행 중입니다.

UI/UX 설명:
- ${step.description}
- UI 타입: ${step.uiType}
- 예상 시간: ${step.estimatedMinutes}분

${getStepSpecificPrompt(step, persona)}

다음 형식으로 응답해주세요:
{
  "actualMinutes": 실제_소요_시간(분),
  "ease": 사용_편의성(1-10),
  "clarity": 명확성(1-10),
  "value": 실용성(1-10),
  "specificActions": ["실제로_어떤_행동을_했는지"],
  "feedback": "솔직한 피드백 (1-2문장)",
  "issues": ["겪은 문제점들"],
  "shouldContinue": true/false (계속할지 여부)
}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      const result = JSON.parse(responseText);

      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        actualMinutes: result.actualMinutes,
        ease: result.ease,
        clarity: result.clarity,
        value: result.value,
        specificActions: result.specificActions,
        feedback: result.feedback,
        issues: result.issues
      });

      totalMinutes += result.actualMinutes;
      shouldContinue = result.shouldContinue;

    } catch (error) {
      console.error(`Error simulating ${persona.name} at step ${step.id}:`, error);
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        actualMinutes: step.estimatedMinutes,
        ease: 5,
        clarity: 5,
        value: 5,
        feedback: 'Simulation error'
      });
      totalMinutes += step.estimatedMinutes;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate overall feedback
  const overallPrompt = `당신은 ${persona.name}입니다.
방금 11단계 워크샵을 완료(또는 중도 포기)했습니다.
전체적인 경험을 2-3문장으로 요약해주세요.
특히 가장 좋았던 점과 가장 개선이 필요한 점을 언급해주세요.`;

  const overallMessage = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    temperature: 0.7,
    messages: [{ role: 'user', content: overallPrompt }],
  });

  const overallFeedback = overallMessage.content[0].type === 'text'
    ? overallMessage.content[0].text
    : '';

  return {
    personaId: persona.id,
    personaName: persona.name,
    teamSize: persona.teamSize,
    digitalMaturity: persona.digitalMaturity,
    stepResults,
    overallFeedback,
    completionRate: (stepResults.length / ACTUAL_WORKSHOP_STEPS.length) * 100,
    totalMinutes
  };
}

// Step별 구체적인 시나리오 프롬프트
function getStepSpecificPrompt(step: any, persona: any): string {
  switch(step.id) {
    case 1:
      return `시작 페이지를 보고 있습니다. "팀장님께서는 '진짜 일'에 집중하세요!" 메시지와 4단계 프로세스 소개를 봅니다.
      ${persona.digitalMaturity === 'Beginner' ? 'AI Agent라는 용어가 생소합니다.' : ''}`;

    case 2:
      return `두 가지 질문에 답해야 합니다:
      1. "우리 팀이 올해 무엇을 어떻게 하면 잘했다라고 평가할 수 있을까요?"
      2. "우리 업무의 고객은 누구이고 어떤 가치를 만들어내야 할까요?"
      ${persona.teamSize === 'Large' ? '40명 이상 팀의 미션을 한 문장으로 정리하기 어렵습니다.' : ''}`;

    case 3:
      return `팀 상황을 체크박스로 선택합니다:
      - 팀원 수 입력: ${persona.teamSize === 'Small' ? '8명' : persona.teamSize === 'Medium' ? '20명' : '45명'}
      - 체크박스 옵션: 전문성, 경력 구성, 협업 수준 등
      ${persona.teamSize === 'Large' ? '팀이 너무 커서 일반화하기 어렵습니다.' : ''}`;

    case 4:
      return `주요 업무 영역을 3-5개 입력합니다.
      예시: 고객 문의 처리, 데이터 분석, 보고서 작성
      ${persona.workStructure === '비구조화' ? '업무가 유동적이라 영역 구분이 애매합니다.' : ''}`;

    case 5:
      return `각 업무 영역별로 구체적인 내용을 입력하거나 파일을 업로드합니다.
      ${persona.teamSize === 'Large' ? '팀원들 업무를 다 파악하기 어렵습니다. 대략적으로 작성합니다.' : ''}
      ${persona.digitalMaturity === 'Beginner' ? '파일 업로드 기능을 찾기 어렵습니다.' : ''}`;

    case 6:
      return `AI가 자동으로 업무를 분석하고 추출하는 것을 지켜봅니다.
      로딩 화면과 진행률 표시가 있습니다.
      ${persona.aiExperience === '없음' ? 'AI가 제대로 이해했는지 불안합니다.' : ''}`;

    case 7:
      return `AI가 추출한 업무 목록을 확인하고 수정할 수 있습니다.
      ${persona.workStructure === '비구조화' ? '추출된 결과가 실제 업무와 다릅니다. 수정이 많이 필요합니다.' : ''}`;

    case 8:
      return `AI 자동화 교육 콘텐츠를 봅니다. 기술 용어와 개념 설명이 있습니다.
      ${persona.digitalMaturity === 'Beginner' ? 'Prompt Engineering, API 등 용어가 너무 어렵습니다.' : ''}
      ${persona.digitalMaturity === 'Expert' ? '이미 아는 내용이라 지루합니다.' : ''}`;

    case 9:
      return `AI 컨설팅 리포트를 받습니다. ROI 분석과 도입 전략이 포함됩니다.
      ${persona.teamSize === 'Large' ? '대규모 조직 변화관리 전략이 부족합니다.' : ''}
      ${persona.workStructure === '비구조화' ? '우리 팀 특성과 맞지 않는 일반론입니다.' : ''}`;

    case 10:
      return `드래그앤드롭으로 워크플로우를 설계합니다. 노드 기반 비주얼 에디터입니다.
      ${persona.digitalMaturity === 'Beginner' ? '너무 복잡합니다. 어디서부터 시작해야 할지 모르겠습니다.' : ''}
      ${persona.digitalMaturity === 'Expert' ? '기능이 제한적입니다. 더 고급 기능이 필요합니다.' : ''}`;

    case 11:
      return `최종 리포트를 확인하고 PDF로 다운로드합니다.
      자동 요약과 실행 계획이 포함되어 있습니다.
      모두가 만족하는 깔끔한 리포트입니다.`;

    default:
      return '';
  }
}

// Main execution
async function runRealisticSimulation() {
  console.log('\n🚀 실제 워크샵 플랫폼 기반 현실적 시뮬레이션\n');
  console.log('=' . repeat(60));

  // Select 5 diverse personas for testing
  const testPersonas = [
    expandedPersonas[0],  // Beginner, Small
    expandedPersonas[8],  // Beginner, Large
    expandedPersonas[12], // Advanced, Large
    expandedPersonas[17], // Expert, Medium
    expandedPersonas[25], // Advanced, Small
  ];

  const results: SimulationResult[] = [];

  for (const persona of testPersonas) {
    console.log(`\n📊 시뮬레이션: ${persona.name} (${persona.role})`);
    console.log(`   ${persona.company} | ${persona.teamSize} | ${persona.digitalMaturity}`);

    const result = await simulatePersonaExperience(persona);
    results.push(result);

    console.log(`   ✅ 완료율: ${result.completionRate.toFixed(1)}%`);
    console.log(`   ⏱️  총 시간: ${result.totalMinutes}분`);

    // Show problematic steps
    const problematicSteps = result.stepResults.filter(s => s.ease < 6 || s.clarity < 6);
    if (problematicSteps.length > 0) {
      console.log(`   ⚠️  문제 단계:`);
      problematicSteps.forEach(step => {
        console.log(`      - Step ${step.stepId}: 사용성 ${step.ease}/10, 명확성 ${step.clarity}/10`);
      });
    }
  }

  // Save results
  const outputPath = path.join(
    '/Users/crystal/Desktop/new/1-Projects/Work Redesign',
    `realistic_simulation_${Date.now()}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 결과 저장: ${outputPath}`);

  // Summary analysis
  console.log('\n=== 요약 분석 ===\n');

  // Average by digital maturity
  const beginnerAvg = results
    .filter(r => r.digitalMaturity === 'Beginner')
    .reduce((sum, r) => sum + r.totalMinutes, 0) /
    results.filter(r => r.digitalMaturity === 'Beginner').length;

  console.log(`Beginner 평균 시간: ${beginnerAvg.toFixed(1)}분`);

  // Most problematic steps
  const stepProblems: Record<number, number> = {};
  results.forEach(r => {
    r.stepResults.forEach(s => {
      if (s.ease < 6 || s.clarity < 6) {
        stepProblems[s.stepId] = (stepProblems[s.stepId] || 0) + 1;
      }
    });
  });

  console.log('\n문제가 많은 단계:');
  Object.entries(stepProblems)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .forEach(([stepId, count]) => {
      const step = ACTUAL_WORKSHOP_STEPS.find(s => s.id === parseInt(stepId));
      console.log(`  Step ${stepId} (${step?.name}): ${count}명이 어려움 겪음`);
    });
}

// Run if executed directly
if (require.main === module) {
  runRealisticSimulation().catch(console.error);
}

export { simulatePersonaExperience, ACTUAL_WORKSHOP_STEPS };