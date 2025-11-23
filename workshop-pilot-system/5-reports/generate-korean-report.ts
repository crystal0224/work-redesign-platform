#!/usr/bin/env ts-node

/**
 * 한국어 종합 보고서 자동 생성 스크립트 (단계별 상세 분석 포함)
 * JSON 결과를 읽어서 읽기 쉬운 한국어 마크다운 보고서 생성
 */

import * as fs from 'fs';
import * as path from 'path';

interface StageResult {
  stageNumber: number;
  stageName: string;
  actualMinutes: number;
  timePerception: string;
  easeOfUse: number;
  clarity: number;
  value: number;
  painPoints: string[];
  positivePoints: string[];
  suggestions: string[];
  wouldContinue: boolean;
  emotionalState: string;
}

interface PersonaResult {
  personaId: string;
  personaName: string;
  department: string;
  digitalMaturity: string;
  stageResults: StageResult[];
  overallSatisfaction: number;
}

interface GroupResult {
  groupId: string;
  groupName: string;
  personaCount: number;
  successCount: number;
  failureCount: number;
  avgSatisfaction: number;
  avgTimeSpent: number;
  keyInsights: string[];
  timestamp: string;
}

interface FinalReport {
  timestamp: string;
  totalPersonas: number;
  totalGroups: number;
  successfulSimulations: number;
  failedSimulations: number;
  successRate: string;
  averageSatisfaction: string;
  averageTimeSpent: string;
  groupResults: GroupResult[];
  recommendations: string[];
}

interface StageAnalysis {
  stageNumber: number;
  stageName: string;
  avgEaseOfUse: number;
  avgClarity: number;
  avgValue: number;
  avgSatisfaction: number;
  avgTimeSpent: number;
  totalResponses: number;
  commonPainPoints: { text: string; count: number; affectedPersonas: string[] }[];
  strugglingPersonas: { name: string; dept: string; maturity: string; issues: string[] }[];
  positiveHighlights: string[];
  improvements: string[];
}

// 모든 페르소나 결과 로드
function loadAllPersonaResults(baseDir: string): PersonaResult[] {
  const results: PersonaResult[] = [];

  for (let i = 1; i <= 6; i++) {
    const groupDir = path.join(baseDir, `group${i}`);
    if (!fs.existsSync(groupDir)) continue;

    const files = fs.readdirSync(groupDir)
      .filter(f => f.startsWith('P') && f.endsWith('_result.json'));

    files.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(groupDir, file), 'utf-8'));
        results.push(data);
      } catch (e) {
        console.error(`Failed to load ${file}:`, e);
      }
    });
  }

  return results;
}

// 단계별 분석
function analyzeByStage(personaResults: PersonaResult[]): StageAnalysis[] {
  const stageAnalyses: StageAnalysis[] = [];

  for (let stageNum = 1; stageNum <= 11; stageNum++) {
    const stageData = personaResults
      .map(p => p.stageResults.find(s => s.stageNumber === stageNum))
      .filter(s => s !== undefined) as StageResult[];

    if (stageData.length === 0) continue;

    const stageName = stageData[0].stageName;

    // 평균 계산
    const avgEaseOfUse = stageData.reduce((sum, s) => sum + s.easeOfUse, 0) / stageData.length;
    const avgClarity = stageData.reduce((sum, s) => sum + s.clarity, 0) / stageData.length;
    const avgValue = stageData.reduce((sum, s) => sum + s.value, 0) / stageData.length;
    const avgSatisfaction = (avgEaseOfUse + avgClarity + avgValue) / 3;
    const avgTimeSpent = stageData.reduce((sum, s) => sum + s.actualMinutes, 0) / stageData.length;

    // Pain Points 집계
    const painPointMap = new Map<string, { count: number; personas: string[] }>();
    stageData.forEach((stage, idx) => {
      const persona = personaResults[idx];
      stage.painPoints.forEach(pain => {
        const key = pain.toLowerCase();
        if (!painPointMap.has(key)) {
          painPointMap.set(key, { count: 0, personas: [] });
        }
        const entry = painPointMap.get(key)!;
        entry.count++;
        entry.personas.push(`${persona.personaName}(${persona.department}, ${persona.digitalMaturity})`);
      });
    });

    const commonPainPoints = Array.from(painPointMap.entries())
      .map(([text, data]) => ({
        text,
        count: data.count,
        affectedPersonas: data.personas
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 어려움을 겪은 페르소나 (만족도 7.5 미만)
    const strugglingPersonas = personaResults
      .map((persona, idx) => {
        const stage = stageData[idx];
        if (!stage) return null;

        const satisfaction = (stage.easeOfUse + stage.clarity + stage.value) / 3;
        if (satisfaction < 7.5) {
          return {
            name: persona.personaName,
            dept: persona.department,
            maturity: persona.digitalMaturity,
            issues: stage.painPoints
          };
        }
        return null;
      })
      .filter(p => p !== null) as any[];

    // 긍정적 하이라이트
    const positiveHighlights = stageData
      .flatMap(s => s.positivePoints)
      .slice(0, 3);

    // 개선사항
    const suggestionMap = new Map<string, number>();
    stageData.forEach(stage => {
      stage.suggestions.forEach(sug => {
        const key = sug.toLowerCase();
        suggestionMap.set(key, (suggestionMap.get(key) || 0) + 1);
      });
    });

    const improvements = Array.from(suggestionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text]) => text);

    stageAnalyses.push({
      stageNumber: stageNum,
      stageName,
      avgEaseOfUse,
      avgClarity,
      avgValue,
      avgSatisfaction,
      avgTimeSpent,
      totalResponses: stageData.length,
      commonPainPoints,
      strugglingPersonas,
      positiveHighlights,
      improvements
    });
  }

  return stageAnalyses;
}

function generateKoreanReport(reportData: FinalReport, stageAnalyses: StageAnalysis[]): string {
  const date = new Date(reportData.timestamp);
  const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  let report = `# 📊 SK 워크샵 플랫폼 파일럿 테스트 종합 보고서

**생성 일시**: ${dateStr}
**참여 페르소나**: ${reportData.totalPersonas}명 (${reportData.totalGroups}개 부서)
**목적**: 워크샵 11단계별 개선 포인트 도출 및 특정 직무/디지털 성숙도별 어려움 파악

---

## 📈 Executive Summary

Work Redesign Platform의 11단계 워크샵을 ${reportData.totalPersonas}명의 SK 팀장 페르소나로 시뮬레이션한 결과, **전체 만족도 ${reportData.averageSatisfaction}**으로 높은 평가를 받았습니다.

### 주요 성과
- ✅ **성공률**: ${reportData.successRate}
- ⭐ **평균 만족도**: ${reportData.averageSatisfaction}
- ⏱️ **평균 소요 시간**: ${reportData.averageTimeSpent}
- 📋 **단계별 상세 분석**: 11개 스텝 완료

---

## 🎯 워크샵 11단계별 상세 분석

아래는 각 단계별로 **모든 페르소나의 피드백을 종합 분석**한 결과입니다.

`;

  // 각 단계별 상세 분석
  stageAnalyses.forEach(stage => {
    const satisfactionEmoji = stage.avgSatisfaction >= 8.5 ? '🟢' : stage.avgSatisfaction >= 7.5 ? '🟡' : '🔴';
    const timeEmoji = stage.avgTimeSpent <= 10 ? '⚡' : stage.avgTimeSpent <= 20 ? '⏱️' : '🕐';

    report += `### ${satisfactionEmoji} Step ${stage.stageNumber}: ${stage.stageName}

**평균 만족도**: ${stage.avgSatisfaction.toFixed(1)}/10 | **평균 소요시간**: ${timeEmoji} ${stage.avgTimeSpent.toFixed(0)}분

#### 📊 세부 평가
- **사용 편의성**: ${stage.avgEaseOfUse.toFixed(1)}/10
- **명확성**: ${stage.avgClarity.toFixed(1)}/10
- **가치**: ${stage.avgValue.toFixed(1)}/10
- **응답 수**: ${stage.totalResponses}명

`;

    // 공통 Pain Points
    if (stage.commonPainPoints.length > 0) {
      report += `#### ⚠️ 주요 어려움 (빈도순)\n\n`;
      stage.commonPainPoints.forEach((pain, idx) => {
        report += `${idx + 1}. **"${pain.text}"** (${pain.count}명)\n`;
        if (pain.count >= 5) {
          report += `   - 영향받은 페르소나: ${pain.affectedPersonas.slice(0, 3).join(', ')}\n`;
        }
        report += `\n`;
      });
    }

    // 어려움을 겪은 특정 페르소나
    if (stage.strugglingPersonas.length > 0) {
      report += `#### 🔍 어려움을 겪은 페르소나 (만족도 7.5 미만)\n\n`;
      stage.strugglingPersonas.forEach(persona => {
        report += `- **${persona.name}** (${persona.dept}, ${persona.maturity})\n`;
        persona.issues.slice(0, 2).forEach(issue => {
          report += `  - ${issue}\n`;
        });
      });
      report += `\n`;
    }

    // 긍정적 하이라이트
    if (stage.positiveHighlights.length > 0) {
      report += `#### ✅ 긍정적 피드백\n\n`;
      stage.positiveHighlights.slice(0, 3).forEach(positive => {
        report += `- ${positive}\n`;
      });
      report += `\n`;
    }

    // 개선 권장사항
    if (stage.improvements.length > 0) {
      report += `#### 💡 개선 권장사항 (우선순위순)\n\n`;
      stage.improvements.forEach((imp, idx) => {
        report += `${idx + 1}. ${imp}\n`;
      });
      report += `\n`;
    }

    report += `---\n\n`;
  });

  // 문제가 많은 단계 TOP 3
  const problematicStages = [...stageAnalyses]
    .sort((a, b) => a.avgSatisfaction - b.avgSatisfaction)
    .slice(0, 3);

  report += `## 🚨 우선 개선 필요 단계 TOP 3\n\n`;
  problematicStages.forEach((stage, idx) => {
    report += `### ${idx + 1}. Step ${stage.stageNumber}: ${stage.stageName} (만족도 ${stage.avgSatisfaction.toFixed(1)}/10)\n\n`;
    report += `**주요 문제점**:\n`;
    stage.commonPainPoints.slice(0, 3).forEach(pain => {
      report += `- ${pain.text} (${pain.count}명 언급)\n`;
    });
    report += `\n**즉시 조치 사항**:\n`;
    stage.improvements.slice(0, 3).forEach(imp => {
      report += `- ${imp}\n`;
    });
    report += `\n`;
  });

  report += `---\n\n`;

  // 디지털 성숙도별 분석
  report += `## 📊 디지털 성숙도별 어려움 분석\n\n`;

  const maturityIssues = new Map<string, { stages: number[]; commonIssues: string[] }>();
  stageAnalyses.forEach(stage => {
    stage.strugglingPersonas.forEach(persona => {
      if (!maturityIssues.has(persona.maturity)) {
        maturityIssues.set(persona.maturity, { stages: [], commonIssues: [] });
      }
      const entry = maturityIssues.get(persona.maturity)!;
      if (!entry.stages.includes(stage.stageNumber)) {
        entry.stages.push(stage.stageNumber);
      }
      entry.commonIssues.push(...persona.issues);
    });
  });

  Array.from(maturityIssues.entries()).forEach(([maturity, data]) => {
    report += `### ${maturity} 사용자\n`;
    report += `- **어려움을 겪은 단계**: Step ${data.stages.sort((a, b) => a - b).join(', ')}\n`;
    const topIssues = [...new Set(data.commonIssues)].slice(0, 3);
    if (topIssues.length > 0) {
      report += `- **주요 이슈**:\n`;
      topIssues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
    }
    report += `\n`;
  });

  report += `---\n\n`;

  // 부서별 요약
  report += `## 🏢 부서별 결과 요약\n\n`;
  reportData.groupResults.forEach((group, index) => {
    report += `### ${index + 1}. ${group.groupName}\n`;
    report += `**만족도**: ${group.avgSatisfaction.toFixed(1)}/10 | **완료율**: ${(group.successCount / group.personaCount * 100).toFixed(0)}%\n\n`;
    report += `**핵심 피드백**:\n`;
    group.keyInsights.slice(0, 3).forEach(insight => {
      report += `- ${insight}\n`;
    });
    report += `\n`;
  });

  report += `---\n\n`;

  // 즉시 실행 가능한 개선 방안
  report += `## 💡 즉시 실행 가능한 개선 방안\n\n`;
  report += `### Phase 1: 긴급 개선 (1주 내)\n\n`;

  problematicStages.forEach((stage, idx) => {
    report += `#### ${idx + 1}. Step ${stage.stageNumber}: ${stage.stageName} 개선\n`;
    report += `\`\`\`\n`;
    report += `현재 문제: ${stage.commonPainPoints[0]?.text || '없음'}\n`;
    report += `개선 방안: ${stage.improvements[0] || '없음'}\n`;
    report += `예상 효과: 만족도 +0.5~1.0점\n`;
    report += `\`\`\`\n\n`;
  });

  report += `### Phase 2: 중기 개선 (2-4주 내)\n\n`;
  report += `- 부서별 맞춤 템플릿 개발\n`;
  report += `- 디지털 성숙도별 가이드 추가\n`;
  report += `- 실제 적용 사례 라이브러리 구축\n\n`;

  report += `---\n\n`;

  // 결론
  report += `## 🎯 결론 및 권장사항\n\n`;
  report += `### 핵심 발견사항\n\n`;
  report += `1. **전반적으로 높은 완성도**: 평균 ${reportData.averageSatisfaction}의 만족도\n`;
  report += `2. **개선 필요 단계 명확**: Step ${problematicStages.map(s => s.stageNumber).join(', ')}에 집중 필요\n`;
  report += `3. **디지털 성숙도별 차이**: Beginner 사용자에 추가 지원 필요\n\n`;

  report += `### 즉시 실행 우선순위\n\n`;
  report += `#### 🚀 High Priority (1주 내)\n`;
  problematicStages.slice(0, 2).forEach((stage, idx) => {
    report += `${idx + 1}. **Step ${stage.stageNumber} 개선**: ${stage.improvements[0]}\n`;
  });
  report += `\n`;

  report += `#### 📅 Medium Priority (2-4주 내)\n`;
  report += `1. 부서별 커스터마이징\n`;
  report += `2. 온보딩 가이드 강화\n`;
  report += `3. 실시간 도움말 시스템\n\n`;

  report += `---\n\n`;

  // 부록
  report += `## 📎 부록\n\n`;
  report += `### A. 시뮬레이션 방법론\n`;
  report += `- **모델**: Claude 3.5 Haiku\n`;
  report += `- **페르소나**: ${reportData.totalPersonas}명\n`;
  report += `- **분석 단계**: 11개 워크샵 스텝\n`;
  report += `- **분석 항목**: 사용편의성, 명확성, 가치, Pain Points, 개선사항\n\n`;

  report += `### B. 데이터 위치\n`;
  report += `- JSON 보고서: \`final-report-${date.toISOString().split('T')[0]}.json\`\n`;
  report += `- 개별 페르소나 결과: \`group*/P*_result.json\`\n`;
  report += `- 그룹별 요약: \`group*/group_summary.json\`\n\n`;

  report += `---\n\n`;
  report += `**보고서 생성**: ${dateStr}\n`;
  report += `**다음 액션**: 우선순위 1-3 항목 즉시 착수\n`;

  return report;
}

// 메인 실행
async function main() {
  console.log('📖 Loading simulation results...');

  const outputDir = path.join(__dirname, '../outputs/parallel-reports');
  const simulationDir = path.join(__dirname, '../outputs/parallel-simulations');

  // JSON 보고서 로드
  const jsonFiles = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('final-report-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (jsonFiles.length === 0) {
    console.error('❌ No report files found');
    process.exit(1);
  }

  const latestReportFile = jsonFiles[0];
  const reportPath = path.join(outputDir, latestReportFile);
  const reportData: FinalReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  // 모든 페르소나 결과 로드
  console.log('📊 Loading all persona results for stage analysis...');
  const personaResults = loadAllPersonaResults(simulationDir);
  console.log(`   Found ${personaResults.length} persona results`);

  // 단계별 분석
  console.log('🔍 Analyzing by stage...');
  const stageAnalyses = analyzeByStage(personaResults);
  console.log(`   Analyzed ${stageAnalyses.length} stages`);

  // 한국어 보고서 생성
  console.log('✍️  Generating comprehensive Korean report...');
  const koreanReport = generateKoreanReport(reportData, stageAnalyses);

  const date = latestReportFile.replace('final-report-', '').replace('.json', '');
  const outputPath = path.join(outputDir, `종합_보고서_${date}.md`);

  fs.writeFileSync(outputPath, koreanReport, 'utf-8');

  console.log(`\n✅ Korean report generated successfully!`);
  console.log(`📄 Location: ${outputPath}`);
  console.log(`\n📊 Report Summary:`);
  console.log(`   - Total Personas: ${reportData.totalPersonas}`);
  console.log(`   - Success Rate: ${reportData.successRate}`);
  console.log(`   - Avg Satisfaction: ${reportData.averageSatisfaction}`);
  console.log(`   - Stages Analyzed: ${stageAnalyses.length}`);
  console.log(`   - Top Issue Stages: ${stageAnalyses.sort((a, b) => a.avgSatisfaction - b.avgSatisfaction).slice(0, 3).map(s => `Step ${s.stageNumber}`).join(', ')}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateKoreanReport };