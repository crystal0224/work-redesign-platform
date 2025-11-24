#!/usr/bin/env ts-node

/**
 * 한국어 보고서 생성 모듈
 * 분석 결과를 기반으로 실무에 바로 활용 가능한 한국어 보고서 생성
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnalysisReport } from '../4-analysis/analyze';
import { SimulationResult } from '../3-simulation/simulate';
import { PERSONAS_V3 as SK_PERSONAS } from '../2-personas/personas-v3';
import { WORKSHOP_UI_SPECS } from '../1-ui-extraction/extract-ui';

/**
 * 한국어 마크다운 보고서 생성
 */
export function generateKoreanReport(
  analysis: AnalysisReport,
  simResults: SimulationResult[]
): string {
  console.log('📝 한국어 보고서 생성 시작...');

  let report = '';

  // 제목 및 메타데이터
  report += generateHeader();

  // 요약
  report += generateExecutiveSummary(analysis);

  // 페르소나 구성 표
  report += generatePersonaTable(simResults);

  // 단계별 상세 분석
  report += generateStepByStepAnalysis(analysis, simResults);

  // 페르소나 그룹별 분석
  report += generatePersonaGroupAnalysis(analysis);

  // 중요 발견사항
  report += generateKeyFindings(analysis);

  // 개선 권장사항
  report += generateRecommendations(analysis);

  // 부록
  report += generateAppendix(simResults);

  // 파일 저장
  saveKoreanReport(report);

  return report;
}

/**
 * 보고서 헤더
 */
function generateHeader(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `# 📊 Work Redesign Platform 워크샵 파일럿 테스트 종합 보고서

**생성일**: ${dateStr}
**버전**: v2.0
**작성**: AI 자동화 파일럿 테스팅 시스템

---

## 목차

1. [요약](#1-요약)
2. [페르소나 구성](#2-페르소나-구성)
3. [단계별 상세 분석](#3-단계별-상세-분석)
4. [페르소나 그룹별 분석](#4-페르소나-그룹별-분석)
5. [중요 발견사항](#5-중요-발견사항)
6. [개선 권장사항](#6-개선-권장사항)
7. [부록](#7-부록)

---

`;
}

/**
 * 요약
 */
function generateExecutiveSummary(analysis: AnalysisReport): string {
  let summary = `## 1. 요약

### 파일럿 테스트 개요

- **참여 페르소나**: ${analysis.summary.totalParticipants}명 (SK 계열사 팀장)
- **테스트 기간**: 2025년 1월
- **분석 방법**: AI 시뮬레이션 기반 사용자 경험 분석

### 핵심 지표

| 지표 | 결과 | 평가 |
|------|------|------|
| **전체 완료율** | ${analysis.summary.avgCompletionRate.toFixed(1)}% | ${evaluateCompletionRate(analysis.summary.avgCompletionRate)} |
| **평균 소요 시간** | ${analysis.summary.avgTotalTime.toFixed(0)}분 | ${evaluateTime(analysis.summary.avgTotalTime)} |
| **중도 포기율** | ${analysis.summary.dropoutRate.toFixed(1)}% | ${evaluateDropoutRate(analysis.summary.dropoutRate)} |
| **평균 만족도** | ${calculateAvgSatisfaction(analysis)}점/10 | ${evaluateSatisfaction(calculateAvgSatisfaction(analysis))} |

### 주요 발견사항

`;

  // Top 3 문제점
  const criticalSteps = analysis.stepAnalysis
    .filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high')
    .slice(0, 3);

  if (criticalSteps.length > 0) {
    summary += '#### ⚠️ 개선이 시급한 단계\n\n';
    criticalSteps.forEach(step => {
      summary += `- **Step ${step.stepId}: ${step.stepName}** - 완료율 ${step.completionRate.toFixed(1)}%, 사용성 ${step.avgScores.ease.toFixed(1)}/10\n`;
    });
    summary += '\n';
  }

  // Top 3 성공 요인
  const successSteps = analysis.stepAnalysis
    .sort((a, b) => b.avgScores.value - a.avgScores.value)
    .slice(0, 3);

  summary += '#### ✅ 높은 가치를 제공하는 단계\n\n';
  successSteps.forEach(step => {
    summary += `- **Step ${step.stepId}: ${step.stepName}** - 가치 점수 ${step.avgScores.value.toFixed(1)}/10\n`;
  });

  summary += '\n---\n\n';
  return summary;
}

/**
 * 페르소나 구성 표
 */
function generatePersonaTable(simResults: SimulationResult[]): string {
  let table = `## 2. 페르소나 구성

### 전체 페르소나 현황

총 **${simResults.length}명**의 SK 계열사 팀장 페르소나로 테스트를 진행했습니다.

### 페르소나 상세 정보

<details>
<summary>📋 전체 페르소나 목록 (클릭하여 펼치기)</summary>

| ID | 이름 | 회사 | 부서 | 직무 | 팀 규모 | 디지털 성숙도 | AI 경험 | 업무 구조 | 완료율 |
|----|------|------|------|------|---------|--------------|---------|-----------|--------|
`;

  simResults.forEach(result => {
    const jobFunctionKr = {
      'Marketing': '마케팅',
      'Production': '생산',
      'R&D': '연구개발',
      'Staff': '지원'
    }[result.department] || result.department;

    const teamSizeKr = {
      'Small': '소규모(~10명)',
      'Medium': '중규모(11~30명)',
      'Large': '대규모(31명~)'
    }[result.teamSize] || result.teamSize;

    table += `| ${result.personaId} | ${result.personaName} | ${result.company} | ${result.department} | ${jobFunctionKr} | ${teamSizeKr} | ${result.digitalMaturity} | ${result.aiExperience} | ${result.workStructure} | ${result.completionRate.toFixed(0)}% |\n`;
  });

  table += `
</details>

### 페르소나 분포

#### 직무별 분포
`;

  // 직무별 집계
  const jobCounts: Record<string, number> = {};
  simResults.forEach(r => {
    const persona = SK_PERSONAS.find(p => p.id === r.personaId);
    if (persona) {
      jobCounts[persona.jobFunction] = (jobCounts[persona.jobFunction] || 0) + 1;
    }
  });

  table += '\n| 직무 | 인원 | 비율 |\n';
  table += '|------|------|------|\n';
  Object.entries(jobCounts).forEach(([job, count]) => {
    const jobKr = {
      'Marketing': '마케팅',
      'Production': '생산',
      'R&D': '연구개발',
      'Staff': '지원'
    }[job] || job;
    table += `| ${jobKr} | ${count}명 | ${((count / simResults.length) * 100).toFixed(1)}% |\n`;
  });

  // 팀 규모별 분포
  table += '\n#### 팀 규모별 분포\n\n';
  table += '| 팀 규모 | 인원 | 비율 |\n';
  table += '|---------|------|------|\n';

  const teamSizeCounts: Record<string, number> = {};
  simResults.forEach(r => {
    teamSizeCounts[r.teamSize] = (teamSizeCounts[r.teamSize] || 0) + 1;
  });

  Object.entries(teamSizeCounts).forEach(([size, count]) => {
    const sizeKr = {
      'Small': '소규모(~10명)',
      'Medium': '중규모(11~30명)',
      'Large': '대규모(31명~)'
    }[size] || size;
    table += `| ${sizeKr} | ${count}명 | ${((count / simResults.length) * 100).toFixed(1)}% |\n`;
  });

  // 디지털 성숙도별 분포
  table += '\n#### 디지털 성숙도별 분포\n\n';
  table += '| 성숙도 | 인원 | 비율 |\n';
  table += '|--------|------|------|\n';

  const maturityCounts: Record<string, number> = {};
  simResults.forEach(r => {
    maturityCounts[r.digitalMaturity] = (maturityCounts[r.digitalMaturity] || 0) + 1;
  });

  Object.entries(maturityCounts).forEach(([maturity, count]) => {
    table += `| ${maturity} | ${count}명 | ${((count / simResults.length) * 100).toFixed(1)}% |\n`;
  });

  table += '\n---\n\n';
  return table;
}

/**
 * 단계별 상세 분석
 */
function generateStepByStepAnalysis(
  analysis: AnalysisReport,
  simResults: SimulationResult[]
): string {
  let stepAnalysis = `## 3. 단계별 상세 분석

각 단계에 대한 상세한 사용자 경험 분석 결과입니다.

`;

  analysis.stepAnalysis.forEach(step => {
    const riskEmoji = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🟠',
      'critical': '🔴'
    }[step.riskLevel];

    stepAnalysis += `### Step ${step.stepId}: ${step.stepName} ${riskEmoji}

#### 기본 정보
- **UI 타입**: ${WORKSHOP_UI_SPECS[`step${step.stepId}`]?.type || 'N/A'}
- **설명**: ${WORKSHOP_UI_SPECS[`step${step.stepId}`]?.description || 'N/A'}
- **예상 시간**: ${step.avgExpectedTime}분
- **실제 평균 시간**: ${step.avgActualTime.toFixed(1)}분 (${step.timeEfficiency > 1 ? '⚠️ 예상보다 오래 걸림' : '✅ 예상 시간 내 완료'})

#### 평가 점수 (10점 만점)
| 항목 | 점수 | 평가 |
|------|------|------|
| 사용 편의성 | ${step.avgScores.ease.toFixed(1)} | ${evaluateScore(step.avgScores.ease)} |
| 명확성 | ${step.avgScores.clarity.toFixed(1)} | ${evaluateScore(step.avgScores.clarity)} |
| 실용적 가치 | ${step.avgScores.value.toFixed(1)} | ${evaluateScore(step.avgScores.value)} |
| 참여도 | ${step.avgScores.engagement.toFixed(1)} | ${evaluateScore(step.avgScores.engagement)} |

#### 진행 현황
- **완료율**: ${step.completionRate.toFixed(1)}% (${simResults.length}명 중 ${Math.round(simResults.length * step.completionRate / 100)}명 완료)
- **중도 포기**: ${step.dropoutCount}명

`;

    // 주요 이슈
    if (step.topIssues.length > 0) {
      stepAnalysis += '#### 🚨 주요 문제점\n';
      step.topIssues.forEach((issue, idx) => {
        stepAnalysis += `${idx + 1}. ${issue.issue} (${issue.count}명 보고)\n`;
      });
      stepAnalysis += '\n';
    }

    // 긍정적 피드백
    if (step.topPositives.length > 0) {
      stepAnalysis += '#### 👍 긍정적 피드백\n';
      step.topPositives.forEach((positive, idx) => {
        stepAnalysis += `${idx + 1}. ${positive.positive} (${positive.count}명 언급)\n`;
      });
      stepAnalysis += '\n';
    }

    // 개선 제안
    if (step.topSuggestions.length > 0) {
      stepAnalysis += '#### 💡 개선 제안\n';
      step.topSuggestions.forEach((suggestion, idx) => {
        stepAnalysis += `${idx + 1}. ${suggestion.suggestion} (${suggestion.count}명 제안)\n`;
      });
      stepAnalysis += '\n';
    }

    // 실제 사용자 피드백 샘플
    const stepFeedbacks = simResults
      .map(r => r.stepResults.find(s => s.stepId === step.stepId))
      .filter(s => s && s.feedback)
      .slice(0, 3);

    if (stepFeedbacks.length > 0) {
      stepAnalysis += '#### 💬 실제 피드백 예시\n';
      stepFeedbacks.forEach(feedback => {
        const persona = simResults.find(r =>
          r.stepResults.some(s => s === feedback)
        );
        if (persona && feedback.feedback) {
          stepAnalysis += `> "${feedback.feedback}"\n> — ${persona.personaName}, ${persona.company}\n\n`;
        }
      });
    }

    stepAnalysis += '---\n\n';
  });

  return stepAnalysis;
}

/**
 * 페르소나 그룹별 분석
 */
function generatePersonaGroupAnalysis(analysis: AnalysisReport): string {
  let groupAnalysis = `## 4. 페르소나 그룹별 분석

특정 특성을 가진 그룹별 분석 결과입니다.

`;

  analysis.personaGroupAnalysis.forEach(group => {
    groupAnalysis += `### ${group.groupName}

#### 그룹 구성
- **페르소나 수**: ${group.personas.length}명
- **구성원**: ${group.personas.slice(0, 5).join(', ')}${group.personas.length > 5 ? ' 외' : ''}

#### 주요 지표
| 지표 | 값 | 전체 평균 대비 |
|------|-----|---------------|
| 완료율 | ${group.metrics.avgCompletionRate.toFixed(1)}% | ${compareToAverage(group.metrics.avgCompletionRate, analysis.summary.avgCompletionRate)} |
| 소요 시간 | ${group.metrics.avgTotalTime.toFixed(0)}분 | ${compareToAverage(group.metrics.avgTotalTime, analysis.summary.avgTotalTime)} |
| 만족도 | ${group.metrics.avgOverallSatisfaction.toFixed(1)}/10 | ${compareToAverage(group.metrics.avgOverallSatisfaction, calculateAvgSatisfaction(analysis))} |

`;

    if (group.specificChallenges.length > 0) {
      groupAnalysis += '#### 주요 어려움\n';
      group.specificChallenges.forEach((challenge, idx) => {
        groupAnalysis += `${idx + 1}. ${challenge}\n`;
      });
      groupAnalysis += '\n';
    }

    if (group.specificStrengths.length > 0) {
      groupAnalysis += '#### 강점\n';
      group.specificStrengths.forEach((strength, idx) => {
        groupAnalysis += `${idx + 1}. ${strength}\n`;
      });
      groupAnalysis += '\n';
    }

    groupAnalysis += '---\n\n';
  });

  return groupAnalysis;
}

/**
 * 중요 발견사항
 */
function generateKeyFindings(analysis: AnalysisReport): string {
  let findings = `## 5. 중요 발견사항

### 🔴 중대 이슈

`;

  if (analysis.criticalIssues.length > 0) {
    analysis.criticalIssues.forEach((issue, idx) => {
      findings += `#### ${idx + 1}. ${issue.description}

- **심각도**: ${issue.severity === 'critical' ? '매우 높음' : '높음'}
- **영향 범위**: Step ${issue.affectedSteps.join(', ')}
- **영향받는 그룹**: ${issue.affectedPersonaGroups.join(', ')}
- **구체적 영향**: ${issue.impact}
- **권장 조치**: ${issue.suggestedAction}

`;
    });
  } else {
    findings += '중대한 이슈는 발견되지 않았습니다.\n\n';
  }

  findings += `### ✨ 성공 요인

`;

  if (analysis.successFactors.length > 0) {
    analysis.successFactors.forEach((factor, idx) => {
      findings += `#### ${idx + 1}. ${factor.description}

- **해당 단계**: Step ${factor.stepIds.join(', ')}
- **혜택 그룹**: ${factor.benefitingGroups.join(', ')}

`;
    });
  }

  findings += '---\n\n';
  return findings;
}

/**
 * 개선 권장사항
 */
function generateRecommendations(analysis: AnalysisReport): string {
  let recommendations = `## 6. 개선 권장사항

### 우선순위별 개선안

`;

  const priorities = ['immediate', 'short-term', 'long-term'];
  const priorityLabels = {
    'immediate': '🚨 즉시 개선',
    'short-term': '📅 단기 개선 (1-2개월)',
    'long-term': '🎯 장기 개선 (3-6개월)'
  };

  priorities.forEach(priority => {
    const recs = analysis.recommendations.filter(r => r.priority === priority);
    if (recs.length > 0) {
      recommendations += `### ${priorityLabels[priority]}\n\n`;
      recs.forEach((rec, idx) => {
        recommendations += `#### ${idx + 1}. ${rec.title}

- **카테고리**: ${rec.category}
- **설명**: ${rec.description}
- **예상 효과**: ${rec.expectedImpact}
- **영향 단계**: Step ${rec.affectedSteps.join(', ')}

`;
      });
    }
  });

  recommendations += '---\n\n';
  return recommendations;
}

/**
 * 부록
 */
function generateAppendix(simResults: SimulationResult[]): string {
  let appendix = `## 7. 부록

### 테스트 방법론

1. **페르소나 설계**
   - SK 계열사 팀장 30명의 다양한 페르소나 구성
   - 직무, 팀 규모, 디지털 성숙도, AI 경험 등 다차원 속성 반영

2. **시뮬레이션 실행**
   - Claude AI를 활용한 현실적 사용자 행동 시뮬레이션
   - 각 단계별 구체적인 UI/UX 상호작용 모의 실행

3. **데이터 분석**
   - 정량적 지표: 완료율, 소요 시간, 평가 점수
   - 정성적 피드백: 문제점, 개선 제안, 사용자 의견

### 용어 정의

- **디지털 성숙도**: 조직의 디지털 기술 활용 수준
  - Beginner: 기초적인 디지털 도구 사용
  - Intermediate: 일부 디지털 프로세스 도입
  - Advanced: 체계적인 디지털 전환 진행
  - Expert: 디지털 기술 전문 활용

- **업무 구조화**: 업무 프로세스의 체계화 정도
  - 비구조화: 유동적이고 상황 의존적 업무
  - 반구조화: 일부 표준화된 프로세스 존재
  - 고도구조화: 명확한 프로세스와 KPI 체계

### 데이터 제한사항

- 시뮬레이션 기반 테스트로 실제 사용자와 차이 가능
- 30명 페르소나로 전체 SK 계열사 대표성 제한
- UI/UX 추출 시점의 플랫폼 상태 기준

---

*본 보고서는 AI 자동화 파일럿 테스팅 시스템에 의해 생성되었습니다.*
`;

  return appendix;
}

// 유틸리티 함수들

function evaluateCompletionRate(rate: number): string {
  if (rate >= 80) return '✅ 우수';
  if (rate >= 60) return '🟡 보통';
  return '🔴 개선 필요';
}

function evaluateTime(minutes: number): string {
  if (minutes <= 45) return '✅ 적정';
  if (minutes <= 60) return '🟡 다소 김';
  return '🔴 너무 김';
}

function evaluateDropoutRate(rate: number): string {
  if (rate <= 10) return '✅ 낮음';
  if (rate <= 20) return '🟡 보통';
  return '🔴 높음';
}

function evaluateSatisfaction(score: number): string {
  if (score >= 7) return '✅ 높음';
  if (score >= 5) return '🟡 보통';
  return '🔴 낮음';
}

function evaluateScore(score: number): string {
  if (score >= 8) return '매우 좋음';
  if (score >= 7) return '좋음';
  if (score >= 5) return '보통';
  if (score >= 3) return '미흡';
  return '매우 미흡';
}

function calculateAvgSatisfaction(analysis: AnalysisReport): number {
  const avgScores = analysis.stepAnalysis.map(s =>
    (s.avgScores.ease + s.avgScores.clarity + s.avgScores.value + s.avgScores.engagement) / 4
  );
  return avgScores.reduce((sum, s) => sum + s, 0) / avgScores.length;
}

function compareToAverage(value: number, avg: number): string {
  const diff = ((value - avg) / avg) * 100;
  if (Math.abs(diff) < 5) return '평균 수준';
  if (diff > 0) return `+${diff.toFixed(1)}% ↑`;
  return `${diff.toFixed(1)}% ↓`;
}

/**
 * 보고서 저장
 */
function saveKoreanReport(report: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(
    __dirname,
    '../outputs',
    `워크샵_파일럿테스트_보고서_${timestamp}.md`
  );

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`✅ 한국어 보고서 저장: ${outputPath}`);

  // 추가로 Work Redesign 폴더에도 복사
  const additionalPath = '/Users/crystal/Desktop/new/1-Projects/Work Redesign/워크샵_파일럿테스트_종합보고서_최종.md';
  fs.writeFileSync(additionalPath, report, 'utf-8');
  console.log(`✅ 추가 저장: ${additionalPath}`);
}

// 실행
if (require.main === module) {
  console.log('📝 보고서 생성 모듈 테스트\n');

  // 분석 결과 로드
  const analysisPath = path.join(__dirname, '../outputs/analysis-report.json');
  const resultsPath = path.join(__dirname, '../outputs/simulation-results.json');

  if (fs.existsSync(analysisPath) && fs.existsSync(resultsPath)) {
    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    generateKoreanReport(analysis, results);
    console.log('\n✨ 한국어 보고서 생성 완료!');
  } else {
    console.log('⚠️ 분석 결과 파일이 없습니다. 먼저 분석을 실행하세요.');
  }
}