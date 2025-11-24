#!/usr/bin/env ts-node

/**
 * 실제 HRD 파일럿 테스팅 프로세스 완전 재현
 *
 * Phase 1: 사전 인터뷰
 * Phase 2: 실제 워크샵 진행 + 관찰
 * Phase 3: 중간 체크인
 * Phase 4: 사후 인터뷰
 * Phase 5: 퍼실리테이터 분석 + 보고서
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

import { conductAllPreInterviews, PreInterviewResult } from './phases/1-pre-interview';
import { runRealWorkshop, WorkshopJourney } from './phases/2-workshop-execution';
import { conductCheckIn, conductPostInterview, CheckInResult, PostInterviewResult } from './phases/3-check-ins';
import { analyzeFacilitatorObservations, generatePilotReport, savePilotReport } from './phases/5-facilitator-analysis';
import { PERSONAS_V3 } from './2-personas/personas-v3';

// 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY not found');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

// personas-v3에서 로드 (현재 15명, 향후 30명으로 확장 예정)
const TEST_PERSONAS = PERSONAS_V3.slice(0, 5); // 기본 5명 샘플

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(80));
}

async function main() {
  const startTime = Date.now();

  logSection('🎯 Work Redesign Platform - 실제 파일럿 테스팅');
  log('\n실제 HRD 프로그램 파일럿 테스팅 방식 재현:', colors.cyan);
  log('  1. 사전 인터뷰 (참가자 배경, 기대, 우려 파악)', colors.cyan);
  log('  2. 실제 워크샵 진행 (Playwright 실행 + 관찰)', colors.cyan);
  log('  3. 중간 체크인 (각 단계 후 "지금까지 어떠세요?")', colors.cyan);
  log('  4. 사후 인터뷰 (전체 경험 회고)', colors.cyan);
  log('  5. 퍼실리테이터 분석 및 보고서\n', colors.cyan);

  log(`📋 참가자: ${TEST_PERSONAS.length}명`, colors.yellow);
  log(`⏱️  예상 시간: ${TEST_PERSONAS.length * 3} - ${TEST_PERSONAS.length * 5}분\n`, colors.yellow);

  try {
    // ===== Phase 1: 사전 인터뷰 =====
    const preInterviews = await conductAllPreInterviews(TEST_PERSONAS, anthropic);

    // ===== Phase 2 + 3: 워크샵 진행 + 중간 체크인 =====
    logSection('🎬 Phase 2-3: 워크샵 진행 및 중간 체크인');
    log('각 페르소나가 실제로 워크샵을 진행하며 관찰합니다.\n', colors.cyan);

    const journeys: WorkshopJourney[] = [];
    const allCheckIns = new Map<string, CheckInResult[]>();

    for (const persona of TEST_PERSONAS) {
      log(`\n${'─'.repeat(70)}`);
      log(`👤 ${persona.name} (${persona.department}, ${persona.digitalMaturity}, ${persona.teamSize}명 팀)`, colors.bright);

      const preInterview = preInterviews.find(p => p.personaId === persona.id)!;

      // 실제 워크샵 실행
      const journey = await runRealWorkshop(persona, preInterview, anthropic);
      journeys.push(journey);

      // 각 단계별 중간 체크인
      const checkIns: CheckInResult[] = [];
      for (const step of journey.steps) {
        log(`    💬 중간 체크인 - Step ${step.step}`, colors.blue);
        const checkIn = await conductCheckIn(persona, step, anthropic);
        checkIns.push(checkIn);

        log(`       만족도: ${checkIn.satisfaction}/10, 기분: ${checkIn.mood}, 계속: ${checkIn.wouldContinue ? 'Yes' : 'No'}`, colors.blue);

        // 이탈 위험 감지
        if (!checkIn.wouldContinue) {
          log(`       🚨 이탈 위험: ${checkIn.wouldContinueReason}`, colors.red);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      allCheckIns.set(persona.id, checkIns);

      log(`  ✅ 완료 - ${journey.completedSteps}/11 단계 (${journey.totalDuration.toFixed(1)}분)`, colors.green);
    }

    // ===== Phase 4: 사후 인터뷰 =====
    logSection('💬 Phase 4: 사후 인터뷰');

    const postInterviews: PostInterviewResult[] = [];

    for (const persona of TEST_PERSONAS) {
      const journey = journeys.find(j => j.personaId === persona.id)!;
      const checkIns = allCheckIns.get(persona.id) || [];

      const postInterview = await conductPostInterview(persona, journey, checkIns, anthropic);
      postInterviews.push(postInterview);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // ===== Phase 5: 분석 및 보고서 =====
    const analysis = analyzeFacilitatorObservations(journeys, allCheckIns, postInterviews);

    logSection('📄 최종 보고서 생성');
    const report = generatePilotReport(preInterviews, journeys, allCheckIns, postInterviews, analysis);

    const reportPath = savePilotReport(
      report,
      path.join(__dirname, 'outputs', 'pilot-reports')
    );

    // ===== 완료 =====
    const totalDuration = (Date.now() - startTime) / 1000 / 60;

    logSection('✅ 파일럿 테스팅 완료!');
    log(`\n📊 결과 요약:`, colors.green);
    log(`  - 참가자: ${TEST_PERSONAS.length}명`, colors.green);
    log(`  - 평균 완료율: ${analysis.overallStats.avgCompletionRate.toFixed(1)}%`, colors.green);
    log(`  - 평균 만족도: ${analysis.overallStats.avgSatisfaction.toFixed(1)}/10`, colors.green);
    log(`  - 추천 의향: ${analysis.recommendationRate.percentage.toFixed(1)}%`, colors.green);
    log(`  - 소요 시간: ${totalDuration.toFixed(1)}분\n`, colors.green);

    log(`📄 보고서 위치:`, colors.cyan);
    log(`  ${reportPath}\n`, colors.bright + colors.cyan);

    log('💡 핵심 발견사항:', colors.yellow);
    if (analysis.commonStuckPoints.length > 0) {
      log(`  - 가장 막힌 단계: Step ${analysis.commonStuckPoints[0].step} (${analysis.commonStuckPoints[0].affectedPersonas}명 영향)`, colors.yellow);
    }
    if (analysis.dropoutRisks.length > 0) {
      log(`  - 이탈 위험: ${analysis.dropoutRisks.length}명`, colors.red);
    }

    process.exit(0);

  } catch (error) {
    log(`\n❌ 에러 발생: ${error}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
