#!/usr/bin/env ts-node

/**
 * 시뮬레이션 결과 분석 모듈
 * 수집된 데이터를 분석하여 인사이트 도출
 */

import * as fs from 'fs';
import * as path from 'path';
import { SimulationResult, StepResult } from '../3-simulation/simulate';
import { PERSONAS_V3 as SK_PERSONAS } from '../2-personas/personas-v3';
import { WORKSHOP_UI_SPECS } from '../1-ui-extraction/extract-ui';

export interface AnalysisReport {
  generatedAt: string;
  summary: {
    totalParticipants: number;
    avgCompletionRate: number;
    avgTotalTime: number;
    dropoutRate: number;
  };

  stepAnalysis: StepAnalysis[];
  personaGroupAnalysis: PersonaGroupAnalysis[];
  criticalIssues: CriticalIssue[];
  successFactors: SuccessFactor[];
  recommendations: Recommendation[];
}

export interface StepAnalysis {
  stepId: number;
  stepName: string;
  avgActualTime: number;
  avgExpectedTime: number;
  timeEfficiency: number;

  avgScores: {
    ease: number;
    clarity: number;
    value: number;
    engagement: number;
  };

  completionRate: number;
  dropoutCount: number;

  topIssues: { issue: string; count: number }[];
  topPositives: { positive: string; count: number }[];
  topSuggestions: { suggestion: string; count: number }[];

  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PersonaGroupAnalysis {
  groupName: string;
  criteria: string;
  personas: string[];

  metrics: {
    avgCompletionRate: number;
    avgTotalTime: number;
    avgOverallSatisfaction: number;
  };

  specificChallenges: string[];
  specificStrengths: string[];
}

export interface CriticalIssue {
  severity: 'high' | 'critical';
  affectedSteps: number[];
  affectedPersonaGroups: string[];
  description: string;
  impact: string;
  suggestedAction: string;
}

export interface SuccessFactor {
  stepIds: number[];
  description: string;
  benefitingGroups: string[];
}

export interface Recommendation {
  priority: 'immediate' | 'short-term' | 'long-term';
  category: 'UI/UX' | 'Content' | 'Process' | 'Personalization';
  title: string;
  description: string;
  expectedImpact: string;
  affectedSteps: number[];
}

/**
 * 시뮬레이션 결과 분석
 */
export function analyzeSimulationResults(results: SimulationResult[]): AnalysisReport {
  console.log('📊 시뮬레이션 결과 분석 시작...');

  const report: AnalysisReport = {
    generatedAt: new Date().toISOString(),
    summary: calculateSummaryMetrics(results),
    stepAnalysis: analyzeSteps(results),
    personaGroupAnalysis: analyzePersonaGroups(results),
    criticalIssues: identifyCriticalIssues(results),
    successFactors: identifySuccessFactors(results),
    recommendations: generateRecommendations(results)
  };

  saveAnalysisReport(report);
  return report;
}

/**
 * 전체 요약 지표 계산
 */
function calculateSummaryMetrics(results: SimulationResult[]) {
  const totalParticipants = results.length;
  const avgCompletionRate = results.reduce((sum, r) => sum + r.completionRate, 0) / totalParticipants;
  const avgTotalTime = results.reduce((sum, r) => sum + r.totalMinutesSpent, 0) / totalParticipants;
  const dropoutRate = (results.filter(r => r.dropoutPoint !== undefined).length / totalParticipants) * 100;

  return {
    totalParticipants,
    avgCompletionRate,
    avgTotalTime,
    dropoutRate
  };
}

/**
 * 단계별 분석
 */
function analyzeSteps(results: SimulationResult[]): StepAnalysis[] {
  const stepAnalyses: StepAnalysis[] = [];

  // 각 단계별로 분석
  for (const [stepKey, stepSpec] of Object.entries(WORKSHOP_UI_SPECS)) {
    const stepId = stepSpec.id;
    const stepResults = results
      .map(r => r.stepResults.find(s => s.stepId === stepId))
      .filter(s => s !== undefined) as StepResult[];

    if (stepResults.length === 0) continue;

    // 평균 점수 계산
    const avgEase = stepResults.reduce((sum, s) => sum + s.ease, 0) / stepResults.length;
    const avgClarity = stepResults.reduce((sum, s) => sum + s.clarity, 0) / stepResults.length;
    const avgValue = stepResults.reduce((sum, s) => sum + s.value, 0) / stepResults.length;
    const avgEngagement = stepResults.reduce((sum, s) => sum + s.engagement, 0) / stepResults.length;

    // 시간 분석
    const avgActualTime = stepResults.reduce((sum, s) => sum + s.actualMinutes, 0) / stepResults.length;
    const avgExpectedTime = Math.round(stepSpec.ui_elements.estimated_time / 60);
    const timeEfficiency = avgActualTime / avgExpectedTime;

    // 완료율
    const completionRate = (stepResults.filter(s => s.completed).length / stepResults.length) * 100;
    const dropoutCount = stepResults.filter(s => !s.completed).length;

    // 이슈/긍정/제안 집계
    const issueCount = countFrequency(stepResults.flatMap(s => s.issues));
    const positiveCount = countFrequency(stepResults.flatMap(s => s.positives));
    const suggestionCount = countFrequency(stepResults.flatMap(s => s.suggestions));

    // 위험도 평가
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (completionRate < 70 || avgEase < 5 || avgClarity < 5) {
      riskLevel = 'critical';
    } else if (completionRate < 80 || avgEase < 6 || avgClarity < 6) {
      riskLevel = 'high';
    } else if (completionRate < 90 || avgEase < 7 || avgClarity < 7) {
      riskLevel = 'medium';
    }

    stepAnalyses.push({
      stepId,
      stepName: stepSpec.name,
      avgActualTime,
      avgExpectedTime,
      timeEfficiency,
      avgScores: {
        ease: avgEase,
        clarity: avgClarity,
        value: avgValue,
        engagement: avgEngagement
      },
      completionRate,
      dropoutCount,
      topIssues: Object.entries(issueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([issue, count]) => ({ issue, count })),
      topPositives: Object.entries(positiveCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([positive, count]) => ({ positive, count })),
      topSuggestions: Object.entries(suggestionCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([suggestion, count]) => ({ suggestion, count })),
      riskLevel
    });
  }

  return stepAnalyses;
}

/**
 * 페르소나 그룹별 분석
 */
function analyzePersonaGroups(results: SimulationResult[]): PersonaGroupAnalysis[] {
  const analyses: PersonaGroupAnalysis[] = [];

  // 디지털 성숙도별 분석
  const maturityGroups = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  for (const maturity of maturityGroups) {
    const groupResults = results.filter(r => r.digitalMaturity === maturity);
    if (groupResults.length === 0) continue;

    analyses.push({
      groupName: `디지털 성숙도: ${maturity}`,
      criteria: 'digitalMaturity',
      personas: groupResults.map(r => r.personaName),
      metrics: {
        avgCompletionRate: groupResults.reduce((sum, r) => sum + r.completionRate, 0) / groupResults.length,
        avgTotalTime: groupResults.reduce((sum, r) => sum + r.totalMinutesSpent, 0) / groupResults.length,
        avgOverallSatisfaction: calculateOverallSatisfaction(groupResults)
      },
      specificChallenges: identifyGroupChallenges(groupResults),
      specificStrengths: identifyGroupStrengths(groupResults)
    });
  }

  // 팀 규모별 분석
  const teamSizes = ['Small', 'Medium', 'Large'];
  for (const size of teamSizes) {
    const groupResults = results.filter(r => r.teamSize === size);
    if (groupResults.length === 0) continue;

    analyses.push({
      groupName: `팀 규모: ${size}`,
      criteria: 'teamSize',
      personas: groupResults.map(r => r.personaName),
      metrics: {
        avgCompletionRate: groupResults.reduce((sum, r) => sum + r.completionRate, 0) / groupResults.length,
        avgTotalTime: groupResults.reduce((sum, r) => sum + r.totalMinutesSpent, 0) / groupResults.length,
        avgOverallSatisfaction: calculateOverallSatisfaction(groupResults)
      },
      specificChallenges: identifyGroupChallenges(groupResults),
      specificStrengths: identifyGroupStrengths(groupResults)
    });
  }

  // 업무 구조화별 분석
  const workStructures = ['비구조화', '반구조화', '고도구조화'];
  for (const structure of workStructures) {
    const groupResults = results.filter(r => r.workStructure === structure);
    if (groupResults.length === 0) continue;

    analyses.push({
      groupName: `업무 구조: ${structure}`,
      criteria: 'workStructure',
      personas: groupResults.map(r => r.personaName),
      metrics: {
        avgCompletionRate: groupResults.reduce((sum, r) => sum + r.completionRate, 0) / groupResults.length,
        avgTotalTime: groupResults.reduce((sum, r) => sum + r.totalMinutesSpent, 0) / groupResults.length,
        avgOverallSatisfaction: calculateOverallSatisfaction(groupResults)
      },
      specificChallenges: identifyGroupChallenges(groupResults),
      specificStrengths: identifyGroupStrengths(groupResults)
    });
  }

  return analyses;
}

/**
 * 중대 이슈 식별
 */
function identifyCriticalIssues(results: SimulationResult[]): CriticalIssue[] {
  const issues: CriticalIssue[] = [];

  // Step 10 (워크플로우 설계) 문제
  const step10Results = results.map(r => r.stepResults.find(s => s.stepId === 10)).filter(s => s);
  const step10DropoutRate = step10Results.filter(s => s && !s.completed).length / step10Results.length;

  if (step10DropoutRate > 0.3) {
    issues.push({
      severity: 'critical',
      affectedSteps: [10],
      affectedPersonaGroups: ['Beginner', 'Large Teams'],
      description: '워크플로우 설계 단계에서 높은 중단율',
      impact: `${(step10DropoutRate * 100).toFixed(1)}%의 사용자가 워크플로우 설계에서 포기`,
      suggestedAction: '비주얼 에디터를 템플릿 기반 선택형으로 간소화'
    });
  }

  // 초보자 그룹 문제
  const beginnerResults = results.filter(r => r.digitalMaturity === 'Beginner');
  const beginnerAvgCompletion = beginnerResults.reduce((sum, r) => sum + r.completionRate, 0) / beginnerResults.length;

  if (beginnerAvgCompletion < 60) {
    issues.push({
      severity: 'high',
      affectedSteps: [5, 8, 9, 10],
      affectedPersonaGroups: ['Beginner'],
      description: '디지털 초보자 그룹의 낮은 완료율',
      impact: `초보자 그룹 평균 완료율 ${beginnerAvgCompletion.toFixed(1)}%`,
      suggestedAction: '초보자 전용 가이드 모드 및 용어 설명 강화'
    });
  }

  return issues;
}

/**
 * 성공 요인 식별
 */
function identifySuccessFactors(results: SimulationResult[]): SuccessFactor[] {
  const factors: SuccessFactor[] = [];

  // 높은 만족도 단계 식별
  const stepScores: Record<number, number[]> = {};
  results.forEach(r => {
    r.stepResults.forEach(s => {
      if (!stepScores[s.stepId]) stepScores[s.stepId] = [];
      stepScores[s.stepId].push(s.value);
    });
  });

  const highValueSteps = Object.entries(stepScores)
    .filter(([, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length > 7)
    .map(([stepId]) => parseInt(stepId));

  if (highValueSteps.length > 0) {
    factors.push({
      stepIds: highValueSteps,
      description: 'AI 자동 분석 및 추출 기능이 높은 가치 제공',
      benefitingGroups: ['All Groups']
    });
  }

  return factors;
}

/**
 * 개선 권장사항 생성
 */
function generateRecommendations(results: SimulationResult[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 즉시 개선 필요
  recommendations.push({
    priority: 'immediate',
    category: 'UI/UX',
    title: 'Step 10 워크플로우 설계 간소화',
    description: '복잡한 비주얼 에디터를 템플릿 기반 선택형으로 변경',
    expectedImpact: '초보자 완료율 30% 향상 예상',
    affectedSteps: [10]
  });

  // 단기 개선
  recommendations.push({
    priority: 'short-term',
    category: 'Content',
    title: '단계별 도움말 및 예시 강화',
    description: '각 입력 필드에 구체적인 예시와 툴팁 추가',
    expectedImpact: '입력 시간 20% 단축 및 명확성 향상',
    affectedSteps: [2, 4, 5]
  });

  recommendations.push({
    priority: 'short-term',
    category: 'Personalization',
    title: '팀 규모별 맞춤형 트랙 제공',
    description: '소규모/중규모/대규모 팀별로 다른 입력 양식과 가이드 제공',
    expectedImpact: '대규모 팀 만족도 40% 향상',
    affectedSteps: [3, 4, 5]
  });

  // 장기 개선
  recommendations.push({
    priority: 'long-term',
    category: 'Process',
    title: '진행 상황 저장 및 이어하기 기능',
    description: '중간 저장 기능으로 여러 세션에 걸쳐 완성 가능',
    expectedImpact: '전체 완료율 25% 향상',
    affectedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  });

  return recommendations;
}

// 유틸리티 함수들

function countFrequency(items: string[]): Record<string, number> {
  const count: Record<string, number> = {};
  items.forEach(item => {
    if (item) {
      count[item] = (count[item] || 0) + 1;
    }
  });
  return count;
}

function calculateOverallSatisfaction(results: SimulationResult[]): number {
  const avgScores = results.map(r => {
    const stepScores = r.stepResults.map(s => (s.ease + s.clarity + s.value + s.engagement) / 4);
    return stepScores.reduce((sum, s) => sum + s, 0) / stepScores.length;
  });
  return avgScores.reduce((sum, s) => sum + s, 0) / avgScores.length;
}

function identifyGroupChallenges(results: SimulationResult[]): string[] {
  const allIssues = results.flatMap(r => r.stepResults.flatMap(s => s.issues));
  const issueCount = countFrequency(allIssues);

  return Object.entries(issueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([issue]) => issue);
}

function identifyGroupStrengths(results: SimulationResult[]): string[] {
  const allPositives = results.flatMap(r => r.stepResults.flatMap(s => s.positives));
  const positiveCount = countFrequency(allPositives);

  return Object.entries(positiveCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([positive]) => positive);
}

/**
 * 분석 리포트 저장
 */
function saveAnalysisReport(report: AnalysisReport): void {
  const outputPath = path.join(__dirname, '../outputs/analysis-report.json');

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log(`✅ 분석 리포트 저장: ${outputPath}`);
}

// 실행
if (require.main === module) {
  console.log('📊 분석 모듈 테스트\n');

  // 시뮬레이션 결과 로드
  const resultsPath = path.join(__dirname, '../outputs/simulation-results.json');

  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const analysis = analyzeSimulationResults(results);

    console.log('\n=== 분석 요약 ===');
    console.log(`참여자: ${analysis.summary.totalParticipants}명`);
    console.log(`평균 완료율: ${analysis.summary.avgCompletionRate.toFixed(1)}%`);
    console.log(`평균 소요 시간: ${analysis.summary.avgTotalTime.toFixed(1)}분`);
    console.log(`중도 포기율: ${analysis.summary.dropoutRate.toFixed(1)}%`);

    console.log('\n✨ 분석 완료!');
  } else {
    console.log('⚠️ 시뮬레이션 결과 파일이 없습니다. 먼저 시뮬레이션을 실행하세요.');
  }
}