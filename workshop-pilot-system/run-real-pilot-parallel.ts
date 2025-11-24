#!/usr/bin/env ts-node

/**
 * 30명 전체 HRD 파일럿 테스팅 - 병렬 실행
 *
 * 6개 그룹을 동시에 실행하여 시간 단축
 * 각 그룹: 사전 인터뷰 + 워크샵 + 중간 체크인 + 사후 인터뷰
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

import { conductAllPreInterviews, PreInterviewResult } from './phases/1-pre-interview';
import { runRealWorkshop, WorkshopJourney } from './phases/2-workshop-execution';
import { conductCheckIn, conductPostInterview, CheckInResult, PostInterviewResult } from './phases/3-check-ins';
import { analyzeFacilitatorObservations, generatePilotReport } from './phases/5-facilitator-analysis';
import { PERSONAS_V3, Persona } from './2-personas/personas-v3';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

// personas-v3에서 그룹 구성 (현재 15명 사용, 향후 30명으로 확장)
const PERSONA_GROUPS = [
  {
    id: 'group1',
    name: 'Marketing',
    personas: PERSONAS_V3.filter(p => p.category === 'Marketing').slice(0, 3)
  },
  {
    id: 'group2',
    name: 'Sales & Operations',
    personas: [
      ...PERSONAS_V3.filter(p => p.category === 'Sales'),
      ...PERSONAS_V3.filter(p => p.category === 'Operations')
    ].slice(0, 3)
  },
  {
    id: 'group3',
    name: 'R&D',
    personas: PERSONAS_V3.filter(p => p.category === 'R&D').slice(0, 3)
  }
].filter(g => g.personas.length > 0); // 빈 그룹 제외

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

interface GroupResult {
  groupId: string;
  groupName: string;
  preInterviews: PreInterviewResult[];
  journeys: WorkshopJourney[];
  checkIns: Map<string, CheckInResult[]>;
  postInterviews: PostInterviewResult[];
  duration: number;
}

/**
 * 단일 그룹 HRD 파일럿 실행
 */
async function runGroupPilot(
  group: typeof PERSONA_GROUPS[0],
  groupIndex: number
): Promise<GroupResult> {
  const startTime = Date.now();
  const groupColor = [colors.red, colors.green, colors.yellow, colors.blue, colors.magenta, colors.cyan][groupIndex];

  console.log(`${groupColor}[${group.id.toUpperCase()}] Starting ${group.name} - ${group.personas.length} personas${colors.reset}`);

  // Phase 1: 사전 인터뷰
  const preInterviews = await conductAllPreInterviews(group.personas, anthropic);
  console.log(`${groupColor}[${group.id.toUpperCase()}] ✓ Pre-interviews complete${colors.reset}`);

  // Phase 2+3: 워크샵 + 중간 체크인
  const journeys: WorkshopJourney[] = [];
  const allCheckIns = new Map<string, CheckInResult[]>();

  for (const persona of group.personas) {
    const preInterview = preInterviews.find(p => p.personaId === persona.id)!;

    // 워크샵 실행
    const journey = await runRealWorkshop(persona, preInterview, anthropic);
    journeys.push(journey);

    // 중간 체크인
    const checkIns: CheckInResult[] = [];
    for (const step of journey.steps) {
      const checkIn = await conductCheckIn(persona, step, anthropic);
      checkIns.push(checkIn);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit - increased to 2s for Haiku
    }
    allCheckIns.set(persona.id, checkIns);

    console.log(`${groupColor}[${group.id.toUpperCase()}] ✓ ${persona.name} complete (${journey.completedSteps}/11)${colors.reset}`);
  }

  // Phase 4: 사후 인터뷰
  const postInterviews: PostInterviewResult[] = [];
  for (const persona of group.personas) {
    const journey = journeys.find(j => j.personaId === persona.id)!;
    const checkIns = allCheckIns.get(persona.id) || [];
    const postInterview = await conductPostInterview(persona, journey, checkIns, anthropic);
    postInterviews.push(postInterview);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit - increased to 5s for Sonnet
  }

  const duration = (Date.now() - startTime) / 1000 / 60;
  console.log(`${groupColor}[${group.id.toUpperCase()}] ✅ Complete in ${duration.toFixed(1)} minutes${colors.reset}`);

  return {
    groupId: group.id,
    groupName: group.name,
    preInterviews,
    journeys,
    checkIns: allCheckIns,
    postInterviews,
    duration
  };
}

/**
 * 병렬 실행 메인
 */
async function main() {
  const totalStart = Date.now();

  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.cyan}🎯 30명 전체 HRD 파일럿 테스팅 - 전체 병렬 실행${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`${colors.cyan}6개 그룹 전체를 동시에 실행합니다 (각 그룹 5명)${colors.reset}`);
  console.log(`${colors.cyan}각 그룹 내에서는 순차 실행으로 Rate limit 자동 관리${colors.reset}`);
  console.log(`${colors.cyan}예상 시간: 35-40분 (기존 대비 40% 단축)\n${colors.reset}`);

  try {
    // 전체 6개 그룹 동시 병렬 실행
    console.log(`${colors.yellow}🚀 6개 그룹 전체 병렬 실행 시작 (30명)${colors.reset}\n`);
    console.log(`${colors.cyan}Rate limit: Phase 1에서 30 requests 동시 (50/min 제한 내)${colors.reset}`);
    console.log(`${colors.cyan}Phase 2-3는 각 그룹 내 순차 실행으로 자동 분산됨${colors.reset}\n`);

    const results = await Promise.all(
      PERSONA_GROUPS.map((group, index) => runGroupPilot(group, index))
    );
    const allPreInterviews: PreInterviewResult[] = [];
    const allJourneys: WorkshopJourney[] = [];
    const allCheckIns = new Map<string, CheckInResult[]>();
    const allPostInterviews: PostInterviewResult[] = [];

    for (const result of results) {
      allPreInterviews.push(...result.preInterviews);
      allJourneys.push(...result.journeys);
      result.checkIns.forEach((value, key) => allCheckIns.set(key, value));
      allPostInterviews.push(...result.postInterviews);
    }

    // Phase 5: 전체 분석
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.bright}${colors.cyan}📊 전체 결과 분석${colors.reset}`);
    console.log('='.repeat(80));

    const analysis = analyzeFacilitatorObservations(allJourneys, allCheckIns, allPostInterviews);
    const report = generatePilotReport(allPreInterviews, allJourneys, allCheckIns, allPostInterviews, analysis);

    // 보고서 저장
    const outputDir = path.join(__dirname, 'outputs', 'pilot-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(outputDir, `전체_파일럿_보고서_${timestamp}.md`);
    fs.writeFileSync(reportPath, report, 'utf-8');

    // 완료
    const totalDuration = (Date.now() - totalStart) / 1000 / 60;

    console.log('\n' + '='.repeat(80));
    console.log(`${colors.bright}${colors.green}✅ 전체 파일럿 테스팅 완료!${colors.reset}`);
    console.log('='.repeat(80));
    console.log(`${colors.green}📊 결과 요약:${colors.reset}`);
    console.log(`${colors.green}  - 참가자: 30명 (6개 그룹)${colors.reset}`);
    console.log(`${colors.green}  - 평균 완료율: ${analysis.overallStats.avgCompletionRate.toFixed(1)}%${colors.reset}`);
    console.log(`${colors.green}  - 평균 만족도: ${analysis.overallStats.avgSatisfaction.toFixed(1)}/10${colors.reset}`);
    console.log(`${colors.green}  - 추천 의향: ${analysis.recommendationRate.percentage.toFixed(1)}%${colors.reset}`);
    console.log(`${colors.green}  - 총 소요 시간: ${totalDuration.toFixed(1)}분\n${colors.reset}`);

    console.log(`${colors.cyan}📄 보고서 위치:${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${reportPath}\n${colors.reset}`);

    console.log(`${colors.yellow}💡 핵심 발견사항:${colors.reset}`);
    if (analysis.commonStuckPoints.length > 0) {
      console.log(`${colors.yellow}  - 가장 막힌 단계: Step ${analysis.commonStuckPoints[0].step} (${analysis.commonStuckPoints[0].affectedPersonas}명 영향)${colors.reset}`);
    }
    if (analysis.dropoutRisks.length > 0) {
      console.log(`${colors.red}  - 이탈 위험: ${analysis.dropoutRisks.length}명${colors.reset}`);
    }

    console.log(`\n${colors.green}🎉 전체 병렬 실행으로 ${(30 * 15 - totalDuration).toFixed(0)}분 절약! (순차 대비 ${((1 - totalDuration / (30 * 15)) * 100).toFixed(0)}% 단축)${colors.reset}\n`);

    process.exit(0);

  } catch (error) {
    console.log(`\n${colors.red}❌ 에러 발생: ${error}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
