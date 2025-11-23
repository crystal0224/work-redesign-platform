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

// 워크샵 단계 정의 (11단계) - 팀장 교육 과정
const WORKSHOP_STAGES = [
  { number: 1, name: '워크샵 시작', description: '플랫폼 소개 및 교육 목표 확인', expectedMinutes: 5 },
  { number: 2, name: '미션 작성', description: '자신의 팀 목표와 고객 가치 직접 정의', expectedMinutes: 10 },
  { number: 3, name: '팀 상황 확인', description: '자신의 팀 특성 및 현황 직접 입력', expectedMinutes: 7 },
  { number: 4, name: '업무 영역 정의', description: '자신의 팀 주요 업무 도메인 직접 입력', expectedMinutes: 8 },
  { number: 5, name: '업무 내용 입력', description: '자신의 팀 구체적 업무 내용 직접 작성', expectedMinutes: 15 },
  { number: 6, name: '업무 추출 (AI)', description: 'AI가 입력한 업무 자동 분석 및 추출', expectedMinutes: 3 },
  { number: 7, name: '결과 요약', description: 'AI 추출 결과 확인 및 수정', expectedMinutes: 10 },
  { number: 8, name: 'AI 교육', description: '자동화 개념 및 적용 사례 학습', expectedMinutes: 15 },
  { number: 9, name: 'AI 컨설팅', description: '자신의 팀 자동화 도입 전략 수립', expectedMinutes: 10 },
  { number: 10, name: '워크플로우 설계', description: '자신의 팀 자동화 워크플로우 직접 설계', expectedMinutes: 12 },
  { number: 11, name: '최종 리포트', description: '자신의 팀 분석 결과 리포트 확인', expectedMinutes: 5 }
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
**배경:**
- 직책: ${persona.department} 팀장 (${persona.teamSize}명 관리)
- 디지털 성숙도: ${persona.digitalMaturity}
- 업무 특성: ${persona.department === 'Marketing' ? '캠페인 기획, 고객 데이터 분석, 콘텐츠 제작' :
              persona.department === 'Sales' ? '영업 목표 관리, 고객 관계, 실적 추적' :
              persona.department === 'Production' ? '제조 공정 관리, 품질 관리, 생산 계획' :
              persona.department === 'Operations' ? '운영 프로세스, 효율성 개선, 리소스 관리' :
              persona.department === 'R&D' ? '연구 프로젝트, 기술 개발, 실험 관리' :
              persona.department === 'Innovation' ? '혁신 과제, 신기술 도입, 시범 프로젝트' :
              persona.department === 'HR' ? '채용, 평가, 교육훈련, 조직문화' :
              persona.department === 'Finance' ? '예산 편성, 재무 보고, 회계 감사' :
              persona.department === 'IT' ? '시스템 운영, 개발 프로젝트, 기술 지원' :
              persona.department === 'Digital' ? '디지털 전환, 신기술 적용, DX 프로젝트' :
              persona.department === 'Data' ? '데이터 분석, ML 모델, 인사이트 도출' :
              persona.department === 'Security' ? '보안 정책, 리스크 관리, 침해 대응' :
              persona.department === 'Strategy' ? '전략 기획, 중장기 계획, 시장 분석' :
              persona.department === 'Planning' ? '사업 기획, 프로젝트 관리, 예산 계획' :
              persona.department === 'Business Dev' ? '신사업 개발, 파트너십, 시장 확대' :
              persona.department === 'Quality' ? '품질 검사, 불량 관리, QC 프로세스' :
              persona.department === 'Tech' ? '기술 연구, 아키텍처 설계, 기술 검토' : '팀 업무 관리'}

**상황:**
SK 그룹 팀장 일회성 교육 (3시간)에 참여 중. 교육장에서 혼자 노트북으로 "Work Redesign Platform"을 처음 사용하며 **실제 자신의 팀 업무**를 입력하고 있습니다.

**Step ${stage.number}: ${stage.name}**
${stage.description}
예상 시간: ${stage.expectedMinutes}분

${previousContext ? `이전 경험:\n${previousContext}\n` : ''}

**중요 - 당신만의 고유한 관점으로 평가하세요:**

당신의 ${persona.department} 팀 업무 특성상 이 단계에서:
- 어떤 부분이 우리 팀 업무에 맞지 않나요?
- ${persona.digitalMaturity === 'Beginner' ? '기술적으로 어려운 부분이 있나요?' :
   persona.digitalMaturity === 'Intermediate' ? '실무 적용 시 막히는 부분이 있나요?' :
   persona.digitalMaturity === 'Advanced' ? '더 고급 기능이나 깊이가 필요한가요?' :
   '이 수준의 기능으로 충분한가요? 더 전문적인 접근이 필요한가요?'}
- ${persona.teamSize >= 15 ? '팀 규모가 큰 만큼 입력량이 너무 많지 않나요?' :
   persona.teamSize <= 7 ? '작은 팀에게 이 시스템이 과도하지 않나요?' :
   '우리 팀 규모에 적절한가요?'}

1-10점 평가 (정직하게):
- 사용 편의성: 우리 ${persona.department} 팀장이 혼자 사용하기 쉬운가?
- 명확성: 우리 업무 맥락에서 무엇을 입력해야 할지 명확한가?
- 가치: 우리 ${persona.department} 팀에 실제로 적용 가능한가?

불편한 점: **우리 팀 업무 특성상** 구체적으로 어떤 부분이 어려운지
좋았던 점: **우리 팀에게** 실제로 도움이 된 부분
개선 제안: **${persona.department} 팀을 위한** 구체적 개선안

JSON 응답:
{
  "actualMinutes": number,
  "timePerception": "Too Short" | "Just Right" | "Too Long",
  "easeOfUse": number,
  "clarity": number,
  "value": number,
  "painPoints": ["우리 팀 맥락에서 구체적으로"],
  "positivePoints": ["우리 팀에게 실제로 도움된 점"],
  "suggestions": ["우리 부서/업무 특성 반영한 개선안"],
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

      // 컨텍스트 업데이트 (교육 참가자 관점)
      previousContext += `\nStage ${stage.number} (${stage.name}):
        - 학습 만족도: ${stageSatisfaction.toFixed(1)}/10
        - 어려웠던 점: ${result.painPoints.join(', ') || '없음'}
        - 계속 학습 의향: ${result.wouldContinue ? '예' : '아니오'}`;

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
    finalThoughts: `${persona.digitalMaturity} 수준의 팀장으로서 전반적으로 ${
      wouldRecommend ? '효과적인' : '개선이 필요한'
    } 교육 과정이라고 생각합니다. 실제 팀 업무에 적용할 수 있는 학습이었습니다.`,
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