import * as fs from 'fs';
import * as path from 'path';
import { WorkshopJourney, FacilitatorObservation } from './2-workshop-execution';
import { CheckInResult, PostInterviewResult } from './3-check-ins';
import { PreInterviewResult } from './1-pre-interview';

export interface FacilitatorAnalysis {
  // 공통 막힘 지점
  commonStuckPoints: {
    step: number;
    stepName: string;
    affectedPersonas: number;
    observations: string[];
  }[];

  // 시간 이슈
  timeIssues: {
    step: number;
    stepName: string;
    expectedMinutes: number;
    avgActualMinutes: number;
    affectedPersonas: number;
  }[];

  // 에러 빈발 지점
  errorHotspots: {
    step: number;
    stepName: string;
    errorCount: number;
    affectedPersonas: number;
  }[];

  // 이탈 위험 페르소나
  dropoutRisks: {
    personaId: string;
    personaName: string;
    department: string;
    dropoutAt?: number;
    reason: string;
    severity: 'critical' | 'high' | 'medium';
  }[];

  // 부서별 패턴
  departmentPatterns: {
    department: string;
    personaCount: number;
    avgSatisfaction: number;
    commonIssues: string[];
    recommendations: string[];
  }[];

  // 성숙도별 패턴
  maturityPatterns: {
    maturity: string;
    personaCount: number;
    avgSatisfaction: number;
    commonIssues: string[];
    recommendations: string[];
  }[];

  // 추천 의향
  recommendationRate: {
    wouldRecommend: number;
    wouldNotRecommend: number;
    percentage: number;
  };

  // 전체 통계
  overallStats: {
    totalPersonas: number;
    avgCompletionRate: number;
    avgTotalDuration: number;
    avgSatisfaction: number;
  };
}

/**
 * 퍼실리테이터 관찰 데이터 분석
 */
export function analyzeFacilitatorObservations(
  journeys: WorkshopJourney[],
  checkIns: Map<string, CheckInResult[]>,
  postInterviews: PostInterviewResult[]
): FacilitatorAnalysis {
  console.log('\n' + '='.repeat(70));
  console.log('📊 Phase 5: 퍼실리테이터 분석');
  console.log('='.repeat(70));

  // 1. 공통 막힘 지점 분석
  const stuckByStep = new Map<number, { stepName: string; personas: string[]; observations: string[] }>();
  journeys.forEach(journey => {
    journey.facilitatorObservations
      .filter(o => o.type === 'STUCK' || o.type === 'DROPOUT_RISK')
      .forEach(obs => {
        if (!stuckByStep.has(obs.step)) {
          const stepInfo = journey.steps.find(s => s.step === obs.step);
          stuckByStep.set(obs.step, {
            stepName: stepInfo?.stepName || `Step ${obs.step}`,
            personas: [],
            observations: []
          });
        }
        const data = stuckByStep.get(obs.step)!;
        if (!data.personas.includes(journey.personaName)) {
          data.personas.push(journey.personaName);
        }
        data.observations.push(obs.observation);
      });
  });

  const commonStuckPoints = Array.from(stuckByStep.entries())
    .map(([step, data]) => ({
      step,
      stepName: data.stepName,
      affectedPersonas: data.personas.length,
      observations: data.observations
    }))
    .sort((a, b) => b.affectedPersonas - a.affectedPersonas);

  // 2. 시간 이슈 분석
  const timeByStep = new Map<number, { stepName: string; times: number[]; expected: number }>();
  journeys.forEach(journey => {
    journey.steps.forEach(step => {
      if (!timeByStep.has(step.step)) {
        timeByStep.set(step.step, {
          stepName: step.stepName,
          times: [],
          expected: 5 // 기본값
        });
      }
      timeByStep.get(step.step)!.times.push(step.actualDuration);
    });
  });

  const timeIssues = Array.from(timeByStep.entries())
    .map(([step, data]) => ({
      step,
      stepName: data.stepName,
      expectedMinutes: data.expected,
      avgActualMinutes: data.times.reduce((a, b) => a + b, 0) / data.times.length,
      affectedPersonas: data.times.filter(t => t > data.expected * 1.5).length
    }))
    .filter(t => t.affectedPersonas > 0)
    .sort((a, b) => b.affectedPersonas - a.affectedPersonas);

  // 3. 에러 빈발 지점
  const errorByStep = new Map<number, { stepName: string; errorCount: number; personas: Set<string> }>();
  journeys.forEach(journey => {
    journey.steps.forEach(step => {
      if (step.errors > 0) {
        if (!errorByStep.has(step.step)) {
          errorByStep.set(step.step, {
            stepName: step.stepName,
            errorCount: 0,
            personas: new Set()
          });
        }
        const data = errorByStep.get(step.step)!;
        data.errorCount += step.errors;
        data.personas.add(journey.personaName);
      }
    });
  });

  const errorHotspots = Array.from(errorByStep.entries())
    .map(([step, data]) => ({
      step,
      stepName: data.stepName,
      errorCount: data.errorCount,
      affectedPersonas: data.personas.size
    }))
    .sort((a, b) => b.errorCount - a.errorCount);

  // 4. 이탈 위험 페르소나
  const dropoutRisks = journeys
    .filter(j => j.dropoutAt !== undefined || j.facilitatorObservations.some(o => o.type === 'DROPOUT_RISK'))
    .map(j => ({
      personaId: j.personaId,
      personaName: j.personaName,
      department: j.preInterview.personaName,
      dropoutAt: j.dropoutAt,
      reason: j.dropoutReason || '중간에 이탈 위험 감지됨',
      severity: (j.dropoutAt && j.dropoutAt <= 5 ? 'critical' : 'high') as 'critical' | 'high' | 'medium'
    }));

  // 5. 부서별 패턴 분석
  const departmentData = new Map<string, {
    personas: string[];
    satisfactions: number[];
    issues: string[];
    improvements: string[];
  }>();

  journeys.forEach(journey => {
    const dept = journey.preInterview.personaName.split(' ')[0]; // 간단히 첫 단어를 부서로
    if (!departmentData.has(dept)) {
      departmentData.set(dept, { personas: [], satisfactions: [], issues: [], improvements: [] });
    }
    const data = departmentData.get(dept)!;
    data.personas.push(journey.personaName);

    // 만족도 수집
    const personaCheckIns = checkIns.get(journey.personaId) || [];
    personaCheckIns.forEach(c => data.satisfactions.push(c.satisfaction));

    // 어려웠던 점 수집
    personaCheckIns.forEach(c => data.issues.push(...c.difficulties));

    // 개선사항 수집
    personaCheckIns.forEach(c => data.improvements.push(...c.immediateImprovements));
  });

  const departmentPatterns = Array.from(departmentData.entries()).map(([dept, data]) => {
    const avgSat = data.satisfactions.length > 0
      ? data.satisfactions.reduce((a, b) => a + b, 0) / data.satisfactions.length
      : 0;

    // 공통 이슈 집계
    const issueCounts = new Map<string, number>();
    data.issues.forEach(issue => {
      const key = issue.substring(0, 50);
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    });
    const topIssues = Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      department: dept,
      personaCount: data.personas.length,
      avgSatisfaction: avgSat,
      commonIssues: topIssues.length > 0 ? topIssues : ['특이사항 없음'],
      recommendations: avgSat < 6 ? ['집중 개선 필요'] : avgSat < 8 ? ['일부 개선 필요'] : ['양호']
    };
  }).sort((a, b) => a.avgSatisfaction - b.avgSatisfaction);

  // 6. 성숙도별 패턴 분석
  const maturityData = new Map<string, {
    personas: string[];
    satisfactions: number[];
    completionRates: number[];
    durations: number[];
  }>();

  journeys.forEach(journey => {
    // 성숙도는 페르소나 정의에서 가져와야 하는데, 일단 간단히 처리
    const maturity = 'Mixed'; // 실제로는 persona.digitalMaturity를 사용해야 함
    if (!maturityData.has(maturity)) {
      maturityData.set(maturity, { personas: [], satisfactions: [], completionRates: [], durations: [] });
    }
    const data = maturityData.get(maturity)!;
    data.personas.push(journey.personaName);
    data.completionRates.push(journey.completedSteps / 11 * 100);
    data.durations.push(journey.totalDuration);

    const personaCheckIns = checkIns.get(journey.personaId) || [];
    personaCheckIns.forEach(c => data.satisfactions.push(c.satisfaction));
  });

  const maturityPatterns = Array.from(maturityData.entries()).map(([maturity, data]) => {
    const avgSat = data.satisfactions.length > 0
      ? data.satisfactions.reduce((a, b) => a + b, 0) / data.satisfactions.length
      : 0;
    const avgCompletion = data.completionRates.reduce((a, b) => a + b, 0) / data.completionRates.length;

    return {
      maturity,
      personaCount: data.personas.length,
      avgSatisfaction: avgSat,
      commonIssues: avgCompletion < 90 ? ['완료율 낮음'] : ['정상'],
      recommendations: avgSat < 7 ? ['기초 가이드 강화'] : ['현행 유지']
    };
  });

  // 7. 추천 의향
  const wouldRecommend = postInterviews.filter(p => p.wouldRecommend.yes).length;
  const wouldNotRecommend = postInterviews.length - wouldRecommend;

  // 8. 전체 통계
  const avgCompletionRate = journeys.reduce((sum, j) => sum + (j.completedSteps / 11), 0) / journeys.length * 100;
  const avgTotalDuration = journeys.reduce((sum, j) => sum + j.totalDuration, 0) / journeys.length;

  const allCheckIns: CheckInResult[] = [];
  checkIns.forEach(checks => allCheckIns.push(...checks));
  const avgSatisfaction = allCheckIns.length > 0
    ? allCheckIns.reduce((sum, c) => sum + c.satisfaction, 0) / allCheckIns.length
    : 0;

  console.log(`\n📊 분석 완료:`);
  console.log(`  - 공통 막힘 지점: ${commonStuckPoints.length}개`);
  console.log(`  - 시간 이슈: ${timeIssues.length}개 단계`);
  console.log(`  - 에러 빈발: ${errorHotspots.length}개 지점`);
  console.log(`  - 이탈 위험: ${dropoutRisks.length}명`);
  console.log(`  - 추천 의향: ${(wouldRecommend / postInterviews.length * 100).toFixed(1)}%`);

  return {
    commonStuckPoints,
    timeIssues,
    errorHotspots,
    dropoutRisks,
    departmentPatterns,
    maturityPatterns,
    recommendationRate: {
      wouldRecommend,
      wouldNotRecommend,
      percentage: wouldRecommend / postInterviews.length * 100
    },
    overallStats: {
      totalPersonas: journeys.length,
      avgCompletionRate,
      avgTotalDuration,
      avgSatisfaction
    }
  };
}

/**
 * 최종 파일럿 테스팅 보고서 생성
 */
export function generatePilotReport(
  preInterviews: PreInterviewResult[],
  journeys: WorkshopJourney[],
  checkIns: Map<string, CheckInResult[]>,
  postInterviews: PostInterviewResult[],
  analysis: FacilitatorAnalysis
): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let report = `# 🎯 Work Redesign Platform - 실제 파일럿 테스팅 보고서\n\n`;
  report += `**생성일**: ${dateStr}\n`;
  report += `**참가자**: ${preInterviews.length}명\n`;
  report += `**방식**: 실제 HRD 파일럿 테스팅 프로세스 재현\n\n`;
  report += `---\n\n`;

  // 1. 사전 인터뷰 요약
  report += `## 📋 1. 사전 인터뷰 (Pre-Workshop Interview)\n\n`;

  const moodCounts = {
    excited: preInterviews.filter(p => p.initialMood === 'excited').length,
    neutral: preInterviews.filter(p => p.initialMood === 'neutral').length,
    worried: preInterviews.filter(p => p.initialMood === 'worried').length,
    skeptical: preInterviews.filter(p => p.initialMood === 'skeptical').length
  };

  report += `### 참가자 초기 반응\n\n`;
  report += `- 😊 기대함: ${moodCounts.excited}명 (${(moodCounts.excited / preInterviews.length * 100).toFixed(0)}%)\n`;
  report += `- 😐 중립: ${moodCounts.neutral}명 (${(moodCounts.neutral / preInterviews.length * 100).toFixed(0)}%)\n`;
  report += `- 😟 걱정: ${moodCounts.worried}명 (${(moodCounts.worried / preInterviews.length * 100).toFixed(0)}%)\n`;
  report += `- 🤔 회의적: ${moodCounts.skeptical}명 (${(moodCounts.skeptical / preInterviews.length * 100).toFixed(0)}%)\n\n`;

  // 공통 우려사항
  const allConcerns: string[] = [];
  preInterviews.forEach(p => allConcerns.push(...p.concerns));
  const concernCounts = new Map<string, number>();
  allConcerns.forEach(c => {
    const key = c.substring(0, 30); // 간단히
    concernCounts.set(key, (concernCounts.get(key) || 0) + 1);
  });
  const topConcerns = Array.from(concernCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  report += `### 공통 우려사항\n\n`;
  topConcerns.forEach(([concern, count], idx) => {
    report += `${idx + 1}. "${concern}..." (${count}명)\n`;
  });
  report += `\n---\n\n`;

  // 2. 실행 관찰
  report += `## 👀 2. 실행 관찰 (Facilitator Observations)\n\n`;

  report += `### ⚠️ 공통 막힘 지점 Top 5\n\n`;
  analysis.commonStuckPoints.slice(0, 5).forEach((point, idx) => {
    report += `${idx + 1}. **Step ${point.step}: ${point.stepName}** (${point.affectedPersonas}명 영향)\n`;
    point.observations.slice(0, 2).forEach(obs => {
      report += `   - ${obs}\n`;
    });
    report += `\n`;
  });

  report += `### ⏰ 시간 초과 단계\n\n`;
  analysis.timeIssues.slice(0, 5).forEach((issue, idx) => {
    report += `${idx + 1}. **Step ${issue.step}: ${issue.stepName}**\n`;
    report += `   - 예상: ${issue.expectedMinutes}분 → 실제: ${issue.avgActualMinutes.toFixed(1)}분\n`;
    report += `   - 영향: ${issue.affectedPersonas}명\n\n`;
  });

  if (analysis.errorHotspots.length > 0) {
    report += `### ❌ 에러 빈발 지점\n\n`;
    analysis.errorHotspots.slice(0, 5).forEach((hotspot, idx) => {
      report += `${idx + 1}. **Step ${hotspot.step}: ${hotspot.stepName}**\n`;
      report += `   - 총 에러: ${hotspot.errorCount}건\n`;
      report += `   - 영향: ${hotspot.affectedPersonas}명\n\n`;
    });
  }

  if (analysis.dropoutRisks.length > 0) {
    report += `### 🚨 이탈 위험 페르소나\n\n`;
    analysis.dropoutRisks.forEach((risk, idx) => {
      report += `${idx + 1}. **${risk.personaName}** (${risk.department})\n`;
      report += `   - ${risk.dropoutAt ? `Step ${risk.dropoutAt}에서 중단` : '중간 이탈 위험'}\n`;
      report += `   - 사유: ${risk.reason}\n`;
      report += `   - 심각도: ${risk.severity}\n\n`;
    });
  }

  report += `---\n\n`;

  // 3. 사후 인터뷰 종합
  report += `## 💬 3. 사후 인터뷰 종합\n\n`;

  report += `### 전체 경험 평가\n\n`;
  report += `- 평균 완료율: ${analysis.overallStats.avgCompletionRate.toFixed(1)}%\n`;
  report += `- 평균 소요 시간: ${analysis.overallStats.avgTotalDuration.toFixed(1)}분\n`;
  report += `- 평균 만족도: ${analysis.overallStats.avgSatisfaction.toFixed(1)}/10\n`;
  report += `- 추천 의향: ${analysis.recommendationRate.percentage.toFixed(1)}% (${analysis.recommendationRate.wouldRecommend}/${postInterviews.length}명)\n\n`;

  // 시급한 개선사항 집계
  const allImprovements: string[] = [];
  postInterviews.forEach(p => allImprovements.push(...p.urgentImprovements));
  const improvementCounts = new Map<string, number>();
  allImprovements.forEach(i => {
    const key = i.substring(0, 40);
    improvementCounts.set(key, (improvementCounts.get(key) || 0) + 1);
  });
  const topImprovements = Array.from(improvementCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  report += `### 🔧 시급한 개선사항 Top 10\n\n`;
  topImprovements.forEach(([improvement, count], idx) => {
    report += `${idx + 1}. "${improvement}..." (${count}명 요청)\n`;
  });

  report += `\n---\n\n`;

  // 4. 단계별 상세 분석 (NEW - Step-by-step breakdown)
  report += `## 📊 4. 단계별 상세 분석 (Step-by-Step Analysis)\n\n`;
  report += `11개 워크샵 단계별로 참가자 경험과 개선사항을 분석합니다.\n\n`;

  // 단계별 데이터 수집
  const stepAnalysis = new Map<number, {
    stepName: string;
    completionCount: number;
    avgSatisfaction: number;
    satisfactionScores: number[];
    avgDuration: number;
    difficulties: string[];
    improvements: string[];
    errors: number;
    affectedPersonas: string[];
  }>();

  // 모든 journey의 steps를 순회하며 데이터 수집
  journeys.forEach(journey => {
    journey.steps.forEach(step => {
      if (!stepAnalysis.has(step.step)) {
        stepAnalysis.set(step.step, {
          stepName: step.stepName,
          completionCount: 0,
          avgSatisfaction: 0,
          satisfactionScores: [],
          avgDuration: 0,
          difficulties: [],
          improvements: [],
          errors: 0,
          affectedPersonas: []
        });
      }
      const data = stepAnalysis.get(step.step)!;
      data.completionCount++;
      data.avgDuration = ((data.avgDuration * (data.completionCount - 1)) + step.actualDuration) / data.completionCount;
      if (step.errors > 0) {
        data.errors += step.errors;
        if (!data.affectedPersonas.includes(journey.personaName)) {
          data.affectedPersonas.push(journey.personaName);
        }
      }

      // 체크인 데이터 수집
      const personaCheckIns = checkIns.get(journey.personaId) || [];
      const stepCheckIn = personaCheckIns.find(c => c.step === step.step);
      if (stepCheckIn) {
        data.satisfactionScores.push(stepCheckIn.satisfaction);
        data.difficulties.push(...stepCheckIn.difficulties);
        data.improvements.push(...stepCheckIn.immediateImprovements);
      }
    });
  });

  // 단계별 분석 출력
  const sortedSteps = Array.from(stepAnalysis.entries()).sort((a, b) => a[0] - b[0]);

  sortedSteps.forEach(([stepNum, data]) => {
    // 만족도 계산
    const avgSat = data.satisfactionScores.length > 0
      ? data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length
      : 0;

    // 상태 표시
    let statusEmoji = '✅';
    if (avgSat < 6) statusEmoji = '🔴';
    else if (avgSat < 7.5) statusEmoji = '🟡';
    else if (avgSat < 8.5) statusEmoji = '🟢';

    report += `### ${statusEmoji} Step ${stepNum}: ${data.stepName}\n\n`;
    report += `**참여 현황**\n`;
    report += `- 완료 인원: ${data.completionCount}/${journeys.length}명 (${(data.completionCount / journeys.length * 100).toFixed(0)}%)\n`;
    report += `- 평균 만족도: ${avgSat.toFixed(1)}/10\n`;
    report += `- 평균 소요 시간: ${data.avgDuration.toFixed(1)}분\n`;
    if (data.errors > 0) {
      report += `- ⚠️ 에러 발생: ${data.errors}건\n`;
      report += `- 영향받은 참가자: ${data.affectedPersonas.slice(0, 5).join(', ')}${data.affectedPersonas.length > 5 ? ` 외 ${data.affectedPersonas.length - 5}명` : ''}\n`;
    }
    report += `\n`;

    // 주요 어려움
    if (data.difficulties.length > 0) {
      const difficultyCounts = new Map<string, number>();
      data.difficulties.forEach(d => {
        const key = d.substring(0, 50);
        difficultyCounts.set(key, (difficultyCounts.get(key) || 0) + 1);
      });
      const topDifficulties = Array.from(difficultyCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topDifficulties.length > 0) {
        report += `**주요 어려움**\n`;
        topDifficulties.forEach(([difficulty, count]) => {
          report += `- "${difficulty}..." (${count}명)\n`;
        });
        report += `\n`;
      }
    }

    // 개선사항 요청
    if (data.improvements.length > 0) {
      const improvementCounts = new Map<string, number>();
      data.improvements.forEach(i => {
        const key = i.substring(0, 50);
        improvementCounts.set(key, (improvementCounts.get(key) || 0) + 1);
      });
      const topImprovements = Array.from(improvementCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topImprovements.length > 0) {
        report += `**즉시 개선 필요**\n`;
        topImprovements.forEach(([improvement, count]) => {
          report += `- ${improvement}... (${count}명 요청)\n`;
        });
        report += `\n`;
      }
    }

    // 구체적 권장사항
    report += `**권장 조치**\n`;
    if (avgSat < 6) {
      report += `- 🔴 **긴급**: 이 단계의 UI/UX를 전면 재설계해야 합니다.\n`;
      report += `- 단계를 더 작은 서브 단계로 분할하거나 가이드를 대폭 강화하세요.\n`;
    } else if (avgSat < 7.5) {
      report += `- 🟡 **중요**: 사용자 가이드와 도움말을 보강하세요.\n`;
      report += `- 에러 메시지를 더 명확하게 개선하세요.\n`;
    } else if (avgSat < 8.5) {
      report += `- 🟢 **양호하나 개선 여지 있음**: 소요 시간 단축 방안을 검토하세요.\n`;
    } else {
      report += `- ✅ **우수**: 현재 상태 유지. 성공 사례로 활용하세요.\n`;
    }
    report += `\n`;
  });

  report += `---\n\n`;

  // 5. 부서별 분석 (NEW)
  report += `## 🏢 5. 부서별 분석 (Department Analysis)\n\n`;

  if (analysis.departmentPatterns.length > 0) {
    analysis.departmentPatterns.forEach((dept, idx) => {
      let deptEmoji = '✅';
      if (dept.avgSatisfaction < 6) deptEmoji = '🔴';
      else if (dept.avgSatisfaction < 7.5) deptEmoji = '🟡';
      else if (dept.avgSatisfaction < 8.5) deptEmoji = '🟢';

      report += `### ${deptEmoji} ${dept.department} 부서\n\n`;
      report += `- 참여 인원: ${dept.personaCount}명\n`;
      report += `- 평균 만족도: ${dept.avgSatisfaction.toFixed(1)}/10\n\n`;

      if (dept.commonIssues.length > 0 && dept.commonIssues[0] !== '특이사항 없음') {
        report += `**공통 이슈**\n`;
        dept.commonIssues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        report += `\n`;
      }

      report += `**권장사항**\n`;
      dept.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += `\n`;
    });
  } else {
    report += `부서별 데이터가 충분하지 않습니다.\n\n`;
  }

  report += `---\n\n`;

  // 6. 퍼실리테이터 제언 (Enhanced)
  report += `## 📝 6. 퍼실리테이터 최종 제언\n\n`;

  report += `### 🔴 즉시 수정 필요 (Critical - 배포 전 필수)\n\n`;

  // 만족도 6점 미만 단계들
  const criticalSteps = Array.from(stepAnalysis.entries())
    .filter(([_, data]) => {
      const avgSat = data.satisfactionScores.length > 0
        ? data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length
        : 0;
      return avgSat < 6;
    })
    .sort((a, b) => {
      const satA = a[1].satisfactionScores.reduce((sum, s) => sum + s, 0) / a[1].satisfactionScores.length;
      const satB = b[1].satisfactionScores.reduce((sum, s) => sum + s, 0) / b[1].satisfactionScores.length;
      return satA - satB;
    });

  if (criticalSteps.length > 0) {
    criticalSteps.forEach(([stepNum, data], idx) => {
      const avgSat = data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length;
      report += `${idx + 1}. **Step ${stepNum}: ${data.stepName}** (만족도 ${avgSat.toFixed(1)}/10)\n`;
      report += `   - 문제: ${data.completionCount}명 중 평균 만족도가 매우 낮음\n`;

      // 가장 많이 언급된 어려움
      if (data.difficulties.length > 0) {
        const topDiff = data.difficulties[0];
        report += `   - 주요 불만: "${topDiff.substring(0, 60)}..."\n`;
      }

      // 가장 많이 요청된 개선사항
      if (data.improvements.length > 0) {
        const topImp = data.improvements[0];
        report += `   - 요청사항: "${topImp.substring(0, 60)}..."\n`;
      }

      report += `   - **조치**: 이 단계를 우선적으로 재설계하거나 간소화하세요.\n\n`;
    });
  } else {
    report += `없음. 모든 단계가 최소 기준(만족도 6.0) 이상입니다.\n\n`;
  }

  report += `### 🟡 단기 개선 (Important - 1개월 내)\n\n`;

  // 만족도 6-7.5점 단계들
  const importantSteps = Array.from(stepAnalysis.entries())
    .filter(([_, data]) => {
      const avgSat = data.satisfactionScores.length > 0
        ? data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length
        : 0;
      return avgSat >= 6 && avgSat < 7.5;
    })
    .sort((a, b) => {
      const satA = a[1].satisfactionScores.reduce((sum, s) => sum + s, 0) / a[1].satisfactionScores.length;
      const satB = b[1].satisfactionScores.reduce((sum, s) => sum + s, 0) / b[1].satisfactionScores.length;
      return satA - satB;
    });

  if (importantSteps.length > 0) {
    importantSteps.slice(0, 5).forEach(([stepNum, data], idx) => {
      const avgSat = data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length;
      report += `${idx + 1}. **Step ${stepNum}: ${data.stepName}** (만족도 ${avgSat.toFixed(1)}/10)\n`;
      report += `   - 가이드 보강 및 UX 개선 필요\n`;
      if (data.avgDuration > 10) {
        report += `   - 소요 시간 단축 필요 (현재 평균 ${data.avgDuration.toFixed(1)}분)\n`;
      }
      report += `\n`;
    });
  } else {
    report += `없음. 대부분의 단계가 우수한 평가를 받았습니다.\n\n`;
  }

  // 시간 초과 이슈
  if (analysis.timeIssues.length > 0) {
    report += `**시간 최적화가 필요한 단계**\n\n`;
    analysis.timeIssues.slice(0, 3).forEach((issue, idx) => {
      report += `${idx + 1}. Step ${issue.step}: ${issue.stepName}\n`;
      report += `   - 예상 ${issue.expectedMinutes}분 → 실제 ${issue.avgActualMinutes.toFixed(1)}분 (${((issue.avgActualMinutes / issue.expectedMinutes - 1) * 100).toFixed(0)}% 초과)\n`;
      report += `   - 조치: 단계 간소화 또는 자동화 기능 추가 검토\n\n`;
    });
  }

  report += `### 🟢 장기 개선 (Nice-to-have - 3개월 이후)\n\n`;

  // 부서별 맞춤화
  const lowSatisfactionDepts = analysis.departmentPatterns.filter(d => d.avgSatisfaction < 7.5);
  if (lowSatisfactionDepts.length > 0) {
    report += `**부서별 맞춤 워크플로우**\n`;
    lowSatisfactionDepts.forEach(dept => {
      report += `- ${dept.department} 부서 전용 가이드 및 예시 제공 (현재 만족도 ${dept.avgSatisfaction.toFixed(1)}/10)\n`;
    });
    report += `\n`;
  }

  report += `**기타 개선사항**\n`;
  report += `- 성숙도별 차별화된 가이드 (초급/중급/고급)\n`;
  report += `- 팀 규모별 최적화 (소규모 팀 vs 대규모 팀)\n`;
  report += `- AI 추천 기능 고도화\n`;
  report += `- 협업 기능 강화 (실시간 공유, 댓글 등)\n\n`;

  report += `---\n\n`;

  // 7. 결론 및 종합 의견
  report += `## 🎯 7. 결론 및 종합 의견\n\n`;

  if (analysis.recommendationRate.percentage >= 70) {
    report += `전반적으로 **긍정적인** 평가를 받았습니다. `;
  } else if (analysis.recommendationRate.percentage >= 50) {
    report += `**개선이 필요**하지만 잠재력이 있는 것으로 평가되었습니다. `;
  } else {
    report += `**대폭 개선이 시급**한 것으로 나타났습니다. `;
  }

  report += `\n\n**핵심 발견사항:**\n\n`;

  // 가장 문제가 된 단계
  const worstStep = Array.from(stepAnalysis.entries())
    .map(([stepNum, data]) => ({
      stepNum,
      stepName: data.stepName,
      avgSat: data.satisfactionScores.length > 0
        ? data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length
        : 0
    }))
    .filter(s => s.avgSat > 0)
    .sort((a, b) => a.avgSat - b.avgSat)[0];

  if (worstStep) {
    report += `1. **가장 시급한 개선 필요**: Step ${worstStep.stepNum} "${worstStep.stepName}" (만족도 ${worstStep.avgSat.toFixed(1)}/10)\n`;
  }

  report += `2. **주요 개선 요청**: "${topImprovements[0]?.[0] || '사용성 개선'}..." (${topImprovements[0]?.[1] || 0}명)\n`;

  // 가장 성과가 좋은 단계
  const bestStep = Array.from(stepAnalysis.entries())
    .map(([stepNum, data]) => ({
      stepNum,
      stepName: data.stepName,
      avgSat: data.satisfactionScores.length > 0
        ? data.satisfactionScores.reduce((a, b) => a + b, 0) / data.satisfactionScores.length
        : 0
    }))
    .filter(s => s.avgSat > 0)
    .sort((a, b) => b.avgSat - a.avgSat)[0];

  if (bestStep) {
    report += `3. **가장 우수한 단계**: Step ${bestStep.stepNum} "${bestStep.stepName}" (만족도 ${bestStep.avgSat.toFixed(1)}/10) - 이 단계의 UX를 다른 단계에도 적용하세요.\n`;
  }

  report += `\n**최종 권고사항:**\n\n`;
  report += `이번 ${preInterviews.length}명 규모의 파일럿 테스팅을 통해 실제 사용자가 겪을 수 있는 문제점들을 단계별로 구체적으로 파악할 수 있었습니다. `;
  report += `상기 제시된 개선사항을 우선순위(🔴 → 🟡 → 🟢)에 따라 적용한다면, 실제 워크샵의 성공 가능성을 크게 높일 수 있을 것으로 판단됩니다.\n\n`;

  report += `**다음 단계:**\n`;
  report += `1. 🔴 Critical 항목 즉시 수정 (배포 전 필수)\n`;
  report += `2. 내부 재테스트 실시 (5-10명)\n`;
  report += `3. 🟡 Important 항목 단기 개선 적용\n`;
  report += `4. 실제 HRD 파일럿 진행\n`;
  report += `5. 🟢 Nice-to-have 항목 장기 로드맵 반영\n`;

  return report;
}

/**
 * 보고서 저장
 */
export function savePilotReport(report: string, outputDir: string): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const reportPath = path.join(outputDir, `파일럿_테스팅_보고서_${dateStr}.md`);

  fs.writeFileSync(reportPath, report, 'utf-8');

  return reportPath;
}
