#!/usr/bin/env ts-node

/**
 * 시뮬레이션 실행 모듈
 * UI 스펙과 페르소나를 기반으로 실제 워크샵 경험 시뮬레이션
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as path from 'path';
import * as fs from 'fs';
import { PERSONAS_V3 as SK_PERSONAS, Persona } from '../2-personas/personas-v3';
import { WORKSHOP_UI_SPECS } from '../1-ui-extraction/extract-ui';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

export interface SimulationResult {
  personaId: string;
  personaName: string;
  company: string;
  department: string;
  teamSize: string;
  digitalMaturity: string;
  aiExperience: string;
  workStructure: string;
  startTime: string;
  endTime: string;
  completedSteps: number;
  totalSteps: number;
  completionRate: number;
  totalMinutesSpent: number;
  stepResults: StepResult[];
  overallFeedback: string;
  recommendedImprovements: string[];
  dropoutPoint?: number;
}

export interface StepResult {
  stepId: number;
  stepName: string;
  stepType: string;
  expectedMinutes: number;
  actualMinutes: number;
  timeRatio: number; // actual/expected

  // 평가 점수 (1-10)
  ease: number;        // 사용 편의성
  clarity: number;     // 명확성
  value: number;       // 실용적 가치
  engagement: number;  // 참여도

  // 상세 피드백
  specificActions: string[];
  issues: string[];
  positives: string[];
  suggestions: string[];

  // 진행 상태
  completed: boolean;
  abandonReason?: string;
}

/**
 * 단일 페르소나의 워크샵 경험 시뮬레이션
 */
export async function simulatePersonaJourney(
  persona: Persona,
  verbose: boolean = false
): Promise<SimulationResult> {
  const startTime = new Date().toISOString();
  const stepResults: StepResult[] = [];
  let totalMinutes = 0;
  let shouldContinue = true;
  let completedSteps = 0;

  if (verbose) {
    console.log(`\n🎭 시뮬레이션 시작: ${persona.name} (${persona.company})`);
  }

  // 각 단계별 시뮬레이션
  for (const [stepKey, stepSpec] of Object.entries(WORKSHOP_UI_SPECS)) {
    if (!shouldContinue) break;

    const stepResult = await simulateStep(persona, stepSpec, stepResults);
    stepResults.push(stepResult);

    totalMinutes += stepResult.actualMinutes;

    if (stepResult.completed) {
      completedSteps++;
    } else {
      shouldContinue = false;
      if (verbose) {
        console.log(`   ⚠️ Step ${stepSpec.id}에서 중단: ${stepResult.abandonReason}`);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 전체 경험 피드백 생성
  const overallFeedback = await generateOverallFeedback(persona, stepResults);
  const recommendations = generateRecommendations(stepResults, persona);

  const endTime = new Date().toISOString();

  return {
    personaId: persona.id,
    personaName: persona.name,
    company: persona.company,
    department: persona.department,
    teamSize: persona.teamSize,
    digitalMaturity: persona.digitalMaturity,
    aiExperience: persona.aiExperience,
    workStructure: persona.workStructure,
    startTime,
    endTime,
    completedSteps,
    totalSteps: Object.keys(WORKSHOP_UI_SPECS).length,
    completionRate: (completedSteps / Object.keys(WORKSHOP_UI_SPECS).length) * 100,
    totalMinutesSpent: totalMinutes,
    stepResults,
    overallFeedback,
    recommendedImprovements: recommendations,
    dropoutPoint: shouldContinue ? undefined : stepResults[stepResults.length - 1].stepId
  };
}

/**
 * 개별 단계 시뮬레이션
 */
async function simulateStep(
  persona: Persona,
  stepSpec: any,
  previousSteps: StepResult[]
): Promise<StepResult> {
  const prompt = buildStepPrompt(persona, stepSpec, previousSteps);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '{}';

    const response = JSON.parse(responseText);

    return {
      stepId: stepSpec.id,
      stepName: stepSpec.name,
      stepType: stepSpec.type,
      expectedMinutes: Math.round(stepSpec.ui_elements.estimated_time / 60),
      actualMinutes: response.actualMinutes || Math.round(stepSpec.ui_elements.estimated_time / 60 * 1.2),
      timeRatio: response.actualMinutes / (stepSpec.ui_elements.estimated_time / 60),
      ease: response.ease || 5,
      clarity: response.clarity || 5,
      value: response.value || 5,
      engagement: response.engagement || 5,
      specificActions: response.specificActions || [],
      issues: response.issues || [],
      positives: response.positives || [],
      suggestions: response.suggestions || [],
      completed: response.completed !== false,
      abandonReason: response.abandonReason
    };
  } catch (error) {
    console.error(`Error simulating step ${stepSpec.id}:`, error);

    // 오류 시 기본값 반환
    return {
      stepId: stepSpec.id,
      stepName: stepSpec.name,
      stepType: stepSpec.type,
      expectedMinutes: Math.round(stepSpec.ui_elements.estimated_time / 60),
      actualMinutes: Math.round(stepSpec.ui_elements.estimated_time / 60),
      timeRatio: 1.0,
      ease: 5,
      clarity: 5,
      value: 5,
      engagement: 5,
      specificActions: ['시뮬레이션 오류'],
      issues: ['API 응답 오류'],
      positives: [],
      suggestions: [],
      completed: true
    };
  }
}

/**
 * 단계별 프롬프트 생성
 */
function buildStepPrompt(persona: Persona, stepSpec: any, previousSteps: StepResult[]): string {
  const contextInfo = previousSteps.length > 0 ?
    `\n이전 단계 요약:\n${previousSteps.map(s =>
      `- Step ${s.stepId}: ${s.completed ? '완료' : '중단'} (${s.actualMinutes}분)`
    ).join('\n')}` : '';

  // 예상 문제점 확인
  const expectedIssues = [];
  if (persona.digitalMaturity === 'Beginner' && stepSpec.expected_issues.beginner.length > 0) {
    expectedIssues.push(...stepSpec.expected_issues.beginner);
  }
  if (persona.teamSize === 'Large' && stepSpec.expected_issues.large_team.length > 0) {
    expectedIssues.push(...stepSpec.expected_issues.large_team);
  }
  if (persona.workStructure === '비구조화' && stepSpec.expected_issues.unstructured.length > 0) {
    expectedIssues.push(...stepSpec.expected_issues.unstructured);
  }

  return `당신은 ${persona.name}입니다.
직책: ${persona.role} (${persona.company} ${persona.department})

팀 특성:
- 팀 규모: ${persona.teamSize} (${persona.teamSizeNumber}명)
- 디지털 성숙도: ${persona.digitalMaturity}
- AI 경험: ${persona.aiExperience}
- 업무 구조화: ${persona.workStructure}
- 변화 저항도: ${persona.changeResistance}
- 학습 속도: ${persona.learningSpeed}

개인 특성:
- 인내심: ${persona.patience}/10
- 기술 친화도: ${persona.techSavvy}/10
${contextInfo}

현재 Step ${stepSpec.id}: ${stepSpec.name}
- 설명: ${stepSpec.description}
- UI 타입: ${stepSpec.type}
- UI 구성: ${stepSpec.ui_elements.components.join(', ')}
- 필요한 행동: ${stepSpec.ui_elements.user_actions.join(', ')}
- 예상 시간: ${Math.round(stepSpec.ui_elements.estimated_time / 60)}분
- 난이도: ${stepSpec.ui_elements.difficulty}

${expectedIssues.length > 0 ?
  `\n당신이 겪을 가능성이 있는 문제:\n${expectedIssues.map(i => `- ${i}`).join('\n')}` : ''}

이 단계를 실제로 수행한다고 상상하고, 다음 형식의 JSON으로 응답해주세요:

{
  "actualMinutes": 실제_소요_시간(분),
  "ease": 사용_편의성_점수(1-10),
  "clarity": 명확성_점수(1-10),
  "value": 실용성_점수(1-10),
  "engagement": 참여도_점수(1-10),
  "specificActions": ["구체적으로_수행한_행동들"],
  "issues": ["겪은_문제점들"],
  "positives": ["좋았던_점들"],
  "suggestions": ["개선_제안사항들"],
  "completed": true/false,
  "abandonReason": "중단한_경우_이유"
}

중요:
- 당신의 실제 특성(디지털 성숙도, AI 경험 등)을 반영하여 현실적으로 응답
- Step ${stepSpec.id}가 당신의 expectedBehavior.problemSteps에 포함되어 있다면 더 많은 어려움 표현
- 인내심이 낮고 문제가 많으면 completed: false로 중단 가능`;
}

/**
 * 전체 경험 피드백 생성
 */
async function generateOverallFeedback(
  persona: Persona,
  stepResults: StepResult[]
): Promise<string> {
  const completedSteps = stepResults.filter(s => s.completed).length;
  const totalTime = stepResults.reduce((sum, s) => sum + s.actualMinutes, 0);
  const avgEase = stepResults.reduce((sum, s) => sum + s.ease, 0) / stepResults.length;
  const avgValue = stepResults.reduce((sum, s) => sum + s.value, 0) / stepResults.length;

  const prompt = `당신은 ${persona.name} (${persona.role}, ${persona.company})입니다.
Work Redesign Platform 워크샵을 경험했습니다.

결과:
- 완료한 단계: ${completedSteps}/${stepResults.length}
- 총 소요 시간: ${totalTime}분
- 평균 사용 편의성: ${avgEase.toFixed(1)}/10
- 평균 실용성: ${avgValue.toFixed(1)}/10

가장 어려웠던 단계: ${stepResults.sort((a, b) => a.ease - b.ease)[0].stepName}
가장 유용했던 단계: ${stepResults.sort((a, b) => b.value - a.value)[0].stepName}

전체적인 경험을 3-4문장으로 솔직하게 평가해주세요.
특히 ${persona.teamSize} 규모 팀의 ${persona.role}로서 느낀 점을 포함해주세요.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0].type === 'text'
      ? message.content[0].text
      : '전체적으로 유용한 워크샵이었습니다.';
  } catch (error) {
    return '워크샵 경험에 대한 피드백을 생성할 수 없었습니다.';
  }
}

/**
 * 개선 권장사항 생성
 */
function generateRecommendations(stepResults: StepResult[], persona: Persona): string[] {
  const recommendations: string[] = [];

  // 문제가 많은 단계 식별
  const problematicSteps = stepResults.filter(s =>
    s.ease < 6 || s.clarity < 6 || s.engagement < 5
  );

  if (problematicSteps.length > 0) {
    recommendations.push(
      `Step ${problematicSteps.map(s => s.stepId).join(', ')}의 사용성 개선 필요`
    );
  }

  // 시간이 오래 걸린 단계
  const slowSteps = stepResults.filter(s => s.timeRatio > 1.5);
  if (slowSteps.length > 0) {
    recommendations.push(
      `Step ${slowSteps.map(s => s.stepId).join(', ')}의 프로세스 간소화 필요`
    );
  }

  // 페르소나별 특별 권장사항
  if (persona.digitalMaturity === 'Beginner') {
    recommendations.push('초보자를 위한 용어 설명 및 가이드 강화');
  }
  if (persona.teamSize === 'Large') {
    recommendations.push('대규모 팀을 위한 별도 트랙 고려');
  }
  if (persona.workStructure === '비구조화') {
    recommendations.push('유동적 업무 환경을 위한 유연한 입력 옵션 제공');
  }

  return recommendations;
}

/**
 * 전체 시뮬레이션 실행
 */
export async function runFullSimulation(
  personaIds?: string[],
  verbose: boolean = true
): Promise<SimulationResult[]> {
  const personasToSimulate = personaIds
    ? SK_PERSONAS.filter(p => personaIds.includes(p.id))
    : SK_PERSONAS;

  console.log(`\n🚀 워크샵 시뮬레이션 시작`);
  console.log(`   대상: ${personasToSimulate.length}명의 페르소나\n`);

  const results: SimulationResult[] = [];

  for (const persona of personasToSimulate) {
    const result = await simulatePersonaJourney(persona, verbose);
    results.push(result);

    if (verbose) {
      console.log(`   ✅ 완료: ${persona.name} (완료율: ${result.completionRate.toFixed(1)}%)`);
    }
  }

  // 결과 저장
  saveSimulationResults(results);

  return results;
}

/**
 * 시뮬레이션 결과 저장
 */
function saveSimulationResults(results: SimulationResult[]): void {
  const outputPath = path.join(__dirname, '../outputs/simulation-results.json');

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf-8'
  );

  console.log(`\n✅ 시뮬레이션 결과 저장: ${outputPath}`);
}

// 실행
if (require.main === module) {
  console.log('🎮 시뮬레이션 모듈 테스트\n');

  // 테스트용 3명만 실행
  const testPersonaIds = ['SK-M01', 'SK-P02', 'SK-R03'];
  runFullSimulation(testPersonaIds, true)
    .then(() => console.log('\n✨ 시뮬레이션 완료!'))
    .catch(console.error);
}