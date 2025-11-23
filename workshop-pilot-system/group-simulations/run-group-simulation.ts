#!/usr/bin/env ts-node

/**
 * 개별 그룹 시뮬레이션 실행 스크립트
 * Claude API를 사용하여 실제 페르소나 시뮬레이션 수행
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

// 워크샵 단계 정의 (11단계)
const WORKSHOP_STAGES = [
  { number: 1, name: '워크샵 시작', description: '플랫폼 소개 및 목표 설정', expectedMinutes: 5 },
  { number: 2, name: '미션 작성', description: '팀 목표와 고객 가치 정의', expectedMinutes: 10 },
  { number: 3, name: '팀 상황 확인', description: '팀 특성 및 현황 체크', expectedMinutes: 7 },
  { number: 4, name: '업무 영역 정의', description: '주요 업무 도메인 입력', expectedMinutes: 8 },
  { number: 5, name: '업무 내용 입력', description: '구체적 업무 내용 작성', expectedMinutes: 15 },
  { number: 6, name: '업무 추출 (AI)', description: 'AI 자동 분석 및 추출', expectedMinutes: 3 },
  { number: 7, name: '결과 요약', description: '추출 결과 확인 및 수정', expectedMinutes: 10 },
  { number: 8, name: 'AI 교육', description: '자동화 교육 콘텐츠', expectedMinutes: 15 },
  { number: 9, name: 'AI 컨설팅', description: '도입 전략 및 ROI 분석', expectedMinutes: 10 },
  { number: 10, name: '워크플로우 설계', description: '자동화 워크플로우 설계', expectedMinutes: 12 },
  { number: 11, name: '최종 리포트', description: '결과 리포트 다운로드', expectedMinutes: 5 }
];

// 페르소나 인터페이스
interface Persona {
  id: string;
  name: string;
  department: string;
  teamSize: number;
  digitalMaturity: string;
  age?: number;
  experience?: number;
}

// 시뮬레이션 결과 인터페이스
interface StageResult {
  stageNumber: number;
  stageName: string;
  actualMinutes: number;
  timePerception: 'Too Short' | 'Just Right' | 'Too Long';
  easeOfUse: number; // 1-10
  clarity: number; // 1-10
  value: number; // 1-10
  painPoints: string[];
  positivePoints: string[];
  suggestions: string[];
  wouldContinue: boolean;
  emotionalState: string;
}

interface PersonaSimulationResult {
  personaId: string;
  personaName: string;
  department: string;
  digitalMaturity: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  stageResults: StageResult[];
  overallSatisfaction: number;
  wouldRecommend: boolean;
  finalThoughts: string;
  topImprovements: string[];
}

// 단계별 시뮬레이션 실행
async function simulateStage(
  persona: Persona,
  stage: typeof WORKSHOP_STAGES[0],
  previousContext: string = ''
): Promise<StageResult> {
  const prompt = `당신은 ${persona.name}님입니다.
직책: ${persona.department} 팀장
팀 규모: ${persona.teamSize}명
디지털 성숙도: ${persona.digitalMaturity}

현재 SK 그룹의 "Work Redesign Platform" 워크샵의 Step ${stage.number}을 진행 중입니다.

단계: ${stage.name}
설명: ${stage.description}
예상 소요시간: ${stage.expectedMinutes}분

${previousContext ? `이전 단계까지의 경험:\n${previousContext}\n` : ''}

이 단계를 실제로 체험한다고 상상하고, 다음 항목들을 평가해주세요:

1. 실제 소요시간 (분)
2. 시간 체감 (Too Short/Just Right/Too Long)
3. 사용 편의성 (1-10)
4. 명확성 (1-10)
5. 가치 (1-10)
6. 불편한 점들
7. 좋았던 점들
8. 개선 제안
9. 계속 진행 의향 (true/false)
10. 현재 감정 상태

JSON 형식으로만 답변해주세요:
{
  "actualMinutes": number,
  "timePerception": "Too Short" | "Just Right" | "Too Long",
  "easeOfUse": number,
  "clarity": number,
  "value": number,
  "painPoints": ["string"],
  "positivePoints": ["string"],
  "suggestions": ["string"],
  "wouldContinue": boolean,
  "emotionalState": "string"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          stageNumber: stage.number,
          stageName: stage.name,
          ...result
        };
      }
    }

    // 폴백 응답
    return {
      stageNumber: stage.number,
      stageName: stage.name,
      actualMinutes: stage.expectedMinutes,
      timePerception: 'Just Right',
      easeOfUse: 7,
      clarity: 7,
      value: 7,
      painPoints: [],
      positivePoints: [],
      suggestions: [],
      wouldContinue: true,
      emotionalState: 'neutral'
    };

  } catch (error) {
    console.error(`Error simulating stage ${stage.number}:`, error);
    throw error;
  }
}

// 전체 워크샵 시뮬레이션
async function simulateFullWorkshop(persona: Persona): Promise<PersonaSimulationResult> {
  console.log(`\n🎭 Starting simulation for ${persona.name} (${persona.department})`);

  const startTime = new Date();
  const stageResults: StageResult[] = [];
  let previousContext = '';
  let totalSatisfactionSum = 0;

  // 각 단계 시뮬레이션
  for (const stage of WORKSHOP_STAGES) {
    console.log(`  📍 Stage ${stage.number}: ${stage.name}...`);

    try {
      const result = await simulateStage(persona, stage, previousContext);
      stageResults.push(result);

      // 만족도 누적
      const stageSatisfaction = (result.easeOfUse + result.clarity + result.value) / 3;
      totalSatisfactionSum += stageSatisfaction;

      // 컨텍스트 업데이트
      previousContext += `\nStage ${stage.number} (${stage.name}):
        - 만족도: ${stageSatisfaction.toFixed(1)}/10
        - 주요 피드백: ${result.painPoints.join(', ') || '없음'}
        - 계속 진행: ${result.wouldContinue ? '예' : '아니오'}`;

      // 중도 포기 체크
      if (!result.wouldContinue) {
        console.log(`    ⚠️  ${persona.name}님이 Stage ${stage.number}에서 중단했습니다.`);
        break;
      }

      // API 호출 제한 방지
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`    ❌ Error at stage ${stage.number}:`, error);
      break;
    }
  }

  const endTime = new Date();
  const totalDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

  // 최종 평가
  const overallSatisfaction = totalSatisfactionSum / stageResults.length;
  const wouldRecommend = overallSatisfaction >= 7;

  // 상위 개선사항 추출
  const allSuggestions = stageResults.flatMap(r => r.suggestions);
  const topImprovements = [...new Set(allSuggestions)].slice(0, 5);

  const result: PersonaSimulationResult = {
    personaId: persona.id,
    personaName: persona.name,
    department: persona.department,
    digitalMaturity: persona.digitalMaturity,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    totalDuration,
    stageResults,
    overallSatisfaction: Number(overallSatisfaction.toFixed(1)),
    wouldRecommend,
    finalThoughts: `${persona.digitalMaturity} 수준의 사용자로서 전반적으로 ${
      wouldRecommend ? '유용한' : '개선이 필요한'
    } 플랫폼이라고 생각합니다.`,
    topImprovements
  };

  console.log(`  ✅ Completed: Satisfaction ${result.overallSatisfaction}/10`);

  return result;
}

// 그룹 시뮬레이션 실행
async function runGroupSimulation(
  groupId: string,
  groupName: string,
  personas: Persona[]
): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting ${groupName} Simulation`);
  console.log(`📋 Group ID: ${groupId}`);
  console.log(`👥 Personas: ${personas.length}`);
  console.log('='.repeat(60));

  const results: PersonaSimulationResult[] = [];
  const outputDir = path.join(__dirname, `../outputs/parallel-simulations/${groupId}`);

  // 출력 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 각 페르소나 시뮬레이션
  for (const persona of personas) {
    try {
      const result = await simulateFullWorkshop(persona);
      results.push(result);

      // 개별 결과 저장
      const personaFile = path.join(outputDir, `${persona.id}_result.json`);
      fs.writeFileSync(personaFile, JSON.stringify(result, null, 2));

    } catch (error) {
      console.error(`❌ Failed to simulate ${persona.name}:`, error);
    }
  }

  // 그룹 종합 결과
  const groupSummary = {
    groupId,
    groupName,
    timestamp: new Date().toISOString(),
    totalPersonas: personas.length,
    completedSimulations: results.length,
    averageSatisfaction: results.reduce((sum, r) => sum + r.overallSatisfaction, 0) / results.length,
    recommendationRate: (results.filter(r => r.wouldRecommend).length / results.length * 100).toFixed(1) + '%',
    commonImprovements: [...new Set(results.flatMap(r => r.topImprovements))].slice(0, 10),
    results
  };

  // 그룹 요약 저장
  const summaryFile = path.join(outputDir, 'group_summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(groupSummary, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ${groupName} Simulation Complete`);
  console.log(`📊 Average Satisfaction: ${groupSummary.averageSatisfaction.toFixed(1)}/10`);
  console.log(`👍 Recommendation Rate: ${groupSummary.recommendationRate}`);
  console.log(`📁 Results saved in: ${outputDir}`);
  console.log('='.repeat(60));
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: ts-node run-group-simulation.ts <groupId> <groupName> <personasJSON>');
    process.exit(1);
  }

  const groupId = args[0];
  const groupName = args[1];
  const personas = JSON.parse(args[2]);

  runGroupSimulation(groupId, groupName, personas)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Simulation failed:', error);
      process.exit(1);
    });
}

export { runGroupSimulation, simulateFullWorkshop, PersonaSimulationResult };