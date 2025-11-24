import fs from 'fs';
import path from 'path';

interface PersonaResult {
  personaId: string;
  personaName: string;
  department: string;
  digitalMaturity: string;
  teamSize: number;
  overallSatisfaction: number;
  stageResults: StageResult[];
}

interface StageResult {
  stageNumber: number;
  stageName: string;
  satisfaction: number;
  easeOfUse: number;
  clarity: number;
  value: number;
  painPoints: string[];
  positivePoints: string[];
  suggestions: string[];
}

interface UIIssue {
  component: string;
  stages: number[];
  affectedPersonas: {
    id: string;
    name: string;
    department: string;
    digitalMaturity: string;
    teamSize: number;
  }[];
  painPoints: string[];
  rootCause: string;
  solutions: string[];
  impact: 'High' | 'Medium' | 'Low';
}

interface SegmentAnalysis {
  segment: string;
  avgSatisfaction: number;
  count: number;
  topIssues: string[];
  recommendations: string[];
}

const STAGE_TO_UI_COMPONENT: { [key: number]: string } = {
  1: '워크샵 시작 화면',
  2: '팀 정보 입력 폼',
  3: '팀원 정보 입력 폼',
  4: '역할 입력 폼',
  5: '업무 내용 입력 폼',
  6: 'AI 업무 추출 인터페이스',
  7: 'AI 업무 분석 결과 화면',
  8: 'AI 교육 콘텐츠 화면',
  9: '1:1 상담 인터페이스',
  10: '워크플로우 설계 도구',
  11: '워크샵 완료 화면'
};

function loadPersonaResults(outputDir: string): PersonaResult[] {
  const results: PersonaResult[] = [];

  for (let groupNum = 1; groupNum <= 6; groupNum++) {
    const groupDir = path.join(outputDir, `group${groupNum}`);
    if (!fs.existsSync(groupDir)) continue;

    const files = fs.readdirSync(groupDir).filter(f => f.endsWith('_result.json'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(groupDir, file), 'utf-8');
        const result = JSON.parse(content);
        results.push(result);
      } catch (error) {
        console.warn(`Warning: Could not parse ${file}:`, error);
      }
    }
  }

  return results;
}

function extractUIIssues(results: PersonaResult[]): UIIssue[] {
  const issueMap: Map<string, UIIssue> = new Map();

  results.forEach(persona => {
    persona.stageResults.forEach(stage => {
      if (stage.painPoints.length === 0) return;

      const component = STAGE_TO_UI_COMPONENT[stage.stageNumber];

      stage.painPoints.forEach(painPoint => {
        // Identify UI component type from pain point
        let uiComponent = component;
        let rootCause = '';
        let solutions: string[] = [];

        // Analyze pain point to determine root cause and solutions (order matters - check most specific first)
        if (painPoint.includes('AI') || painPoint.includes('자동') || painPoint.includes('추출') || painPoint.includes('분석')) {
          uiComponent = `${component} - AI 기능`;
          rootCause = 'AI 기능의 작동 방식 및 결과에 대한 이해 부족';
          solutions = [
            'AI 분석 과정 시각화 (로딩 중 진행 상황 표시)',
            'AI 결과에 대한 설명 추가 (왜 이렇게 분석했는지)',
            '업종별 AI 분석 예시 제공'
          ];
        } else if (painPoint.includes('가이드') || painPoint.includes('설명') || painPoint.includes('이해') || painPoint.includes('불확실') || painPoint.includes('명확')) {
          uiComponent = `${component} - 사용 가이드`;
          rootCause = '단계별 안내 및 설명 부족';
          solutions = [
            '각 단계별 상세 가이드 추가',
            '비디오 튜토리얼 또는 인터랙티브 온보딩',
            '디지털 성숙도별 차별화된 가이드 제공'
          ];
        } else if (painPoint.includes('시간') || painPoint.includes('오래') || painPoint.includes('복잡') || painPoint.includes('많은')) {
          uiComponent = `${component} - 사용성`;
          rootCause = '프로세스 복잡도 및 소요 시간 과다';
          solutions = [
            '단계 간소화 또는 선택적 진행 경로 제공',
            '이전 데이터 불러오기/자동 완성 기능',
            '대규모 팀을 위한 일괄 입력 기능'
          ];
        } else if (painPoint.includes('팀원') && (painPoint.includes('많은') || painPoint.includes('규모') || painPoint.includes('대규모'))) {
          uiComponent = `${component} - 확장성`;
          rootCause = '팀 규모별 차별화된 UX 부족';
          solutions = [
            '팀 규모 감지 및 맞춤형 인터페이스',
            '대규모 팀용 CSV 업로드 기능',
            '소규모 팀용 간소화 모드'
          ];
        } else if (painPoint.includes('템플릿') || painPoint.includes('예시') || painPoint.includes('샘플')) {
          uiComponent = `${component} - 템플릿 부족`;
          rootCause = '업종/직무별 맞춤 템플릿 부족';
          solutions = [
            '17개 주요 부서별 업무 템플릿 제공',
            '산업별 베스트 프랙티스 예시',
            '사용자 커스텀 템플릿 저장 기능'
          ];
        } else if (painPoint.includes('정량화') || painPoint.includes('정성적') || painPoint.includes('측정') || painPoint.includes('지표')) {
          uiComponent = `${component} - 입력 유연성`;
          rootCause = '정성적 업무 특성을 정량화된 시스템에 입력하기 어려움';
          solutions = [
            '정성/정량 혼합 입력 모드 제공',
            '자유 텍스트 입력 후 AI가 구조화하는 기능',
            '업무 특성별 입력 방식 선택 옵션'
          ];
        } else if (painPoint.includes('반영') || painPoint.includes('표준화') || painPoint.includes('특성') || painPoint.includes('맞춤') || painPoint.includes('유연')) {
          uiComponent = `${component} - 맞춤화 부족`;
          rootCause = '다양한 업무 특성을 표준화된 시스템에 반영하기 어려움';
          solutions = [
            '부서별 맞춤 입력 필드 및 워크플로우',
            '비정형 업무를 위한 유연한 입력 모드',
            '업무 특성 자동 감지 및 UI 조정'
          ];
        } else if (painPoint.includes('입력') || painPoint.includes('필드') || painPoint.includes('양식') || painPoint.includes('데이터')) {
          uiComponent = `${component} - 입력 인터페이스`;
          rootCause = '입력 필드 디자인 및 가이드 부족';
          solutions = [
            '업종/직무별 입력 템플릿 제공',
            '실시간 입력 예시 및 플레이스홀더 개선',
            '입력 필드별 도움말 툴팁 추가'
          ];
        } else {
          // Default category for unmatched pain points
          uiComponent = `${component} - 기타 UX 개선 필요`;
          rootCause = '사용자 경험 최적화 필요';
          solutions = [
            '사용자 피드백 기반 지속적 개선',
            'A/B 테스트를 통한 최적 UX 탐색',
            '사용성 테스트 및 반복 개선'
          ];
        }

        const key = `${uiComponent}:${rootCause}`;

        if (!issueMap.has(key)) {
          issueMap.set(key, {
            component: uiComponent,
            stages: [stage.stageNumber],
            affectedPersonas: [],
            painPoints: [],
            rootCause,
            solutions,
            impact: 'Medium'
          });
        }

        const issue = issueMap.get(key)!;

        // Add stage if not already included
        if (!issue.stages.includes(stage.stageNumber)) {
          issue.stages.push(stage.stageNumber);
        }

        // Add persona if not already included
        if (!issue.affectedPersonas.find(p => p.id === persona.personaId)) {
          issue.affectedPersonas.push({
            id: persona.personaId,
            name: persona.personaName,
            department: persona.department,
            digitalMaturity: persona.digitalMaturity,
            teamSize: persona.teamSize
          });
        }

        // Add pain point if not duplicate
        if (!issue.painPoints.includes(painPoint)) {
          issue.painPoints.push(painPoint);
        }
      });
    });
  });

  // Calculate impact based on number of affected personas
  const issues = Array.from(issueMap.values());
  issues.forEach(issue => {
    const affectedCount = issue.affectedPersonas.length;
    if (affectedCount >= 10) {
      issue.impact = 'High';
    } else if (affectedCount >= 5) {
      issue.impact = 'Medium';
    } else {
      issue.impact = 'Low';
    }
  });

  // Sort by impact and affected count
  return issues.sort((a, b) => {
    const impactOrder = { High: 3, Medium: 2, Low: 1 };
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[b.impact] - impactOrder[a.impact];
    }
    return b.affectedPersonas.length - a.affectedPersonas.length;
  });
}

function analyzeByDepartment(results: PersonaResult[]): SegmentAnalysis[] {
  const deptMap: Map<string, PersonaResult[]> = new Map();

  results.forEach(result => {
    if (!deptMap.has(result.department)) {
      deptMap.set(result.department, []);
    }
    deptMap.get(result.department)!.push(result);
  });

  const analyses: SegmentAnalysis[] = [];

  deptMap.forEach((personas, dept) => {
    const avgSat = personas.reduce((sum, p) => sum + (p.overallSatisfaction || 0), 0) / personas.length;

    // Collect all pain points for this department
    const allPainPoints: string[] = [];
    personas.forEach(p => {
      p.stageResults.forEach(stage => {
        allPainPoints.push(...stage.painPoints);
      });
    });

    // Count pain point frequency
    const painPointCounts: Map<string, number> = new Map();
    allPainPoints.forEach(pp => {
      painPointCounts.set(pp, (painPointCounts.get(pp) || 0) + 1);
    });

    // Get top 3 issues
    const topIssues = Array.from(painPointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pp]) => pp);

    // Generate department-specific recommendations
    const recommendations = generateDepartmentRecommendations(dept, topIssues);

    analyses.push({
      segment: dept,
      avgSatisfaction: avgSat,
      count: personas.length,
      topIssues,
      recommendations
    });
  });

  return analyses.sort((a, b) => a.avgSatisfaction - b.avgSatisfaction);
}

function analyzeByDigitalMaturity(results: PersonaResult[]): SegmentAnalysis[] {
  const maturityMap: Map<string, PersonaResult[]> = new Map();

  results.forEach(result => {
    if (!maturityMap.has(result.digitalMaturity)) {
      maturityMap.set(result.digitalMaturity, []);
    }
    maturityMap.get(result.digitalMaturity)!.push(result);
  });

  const analyses: SegmentAnalysis[] = [];

  maturityMap.forEach((personas, maturity) => {
    const avgSat = personas.reduce((sum, p) => sum + (p.overallSatisfaction || 0), 0) / personas.length;

    const allPainPoints: string[] = [];
    personas.forEach(p => {
      p.stageResults.forEach(stage => {
        allPainPoints.push(...stage.painPoints);
      });
    });

    const painPointCounts: Map<string, number> = new Map();
    allPainPoints.forEach(pp => {
      painPointCounts.set(pp, (painPointCounts.get(pp) || 0) + 1);
    });

    const topIssues = Array.from(painPointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pp]) => pp);

    const recommendations = generateMaturityRecommendations(maturity, topIssues);

    analyses.push({
      segment: maturity,
      avgSatisfaction: avgSat,
      count: personas.length,
      topIssues,
      recommendations
    });
  });

  return analyses.sort((a, b) => a.avgSatisfaction - b.avgSatisfaction);
}

function analyzeByTeamSize(results: PersonaResult[]): SegmentAnalysis[] {
  const sizeCategories: Map<string, PersonaResult[]> = new Map([
    ['소규모 (≤7명)', []],
    ['중규모 (8-14명)', []],
    ['대규모 (15명+)', []]
  ]);

  results.forEach(result => {
    if (result.teamSize <= 7) {
      sizeCategories.get('소규모 (≤7명)')!.push(result);
    } else if (result.teamSize <= 14) {
      sizeCategories.get('중규모 (8-14명)')!.push(result);
    } else {
      sizeCategories.get('대규모 (15명+)')!.push(result);
    }
  });

  const analyses: SegmentAnalysis[] = [];

  sizeCategories.forEach((personas, size) => {
    if (personas.length === 0) return;

    const avgSat = personas.reduce((sum, p) => sum + (p.overallSatisfaction || 0), 0) / personas.length;

    const allPainPoints: string[] = [];
    personas.forEach(p => {
      p.stageResults.forEach(stage => {
        allPainPoints.push(...stage.painPoints);
      });
    });

    const painPointCounts: Map<string, number> = new Map();
    allPainPoints.forEach(pp => {
      painPointCounts.set(pp, (painPointCounts.get(pp) || 0) + 1);
    });

    const topIssues = Array.from(painPointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pp]) => pp);

    const recommendations = generateTeamSizeRecommendations(size, topIssues);

    analyses.push({
      segment: size,
      avgSatisfaction: avgSat,
      count: personas.length,
      topIssues,
      recommendations
    });
  });

  return analyses.sort((a, b) => a.avgSatisfaction - b.avgSatisfaction);
}

function generateDepartmentRecommendations(dept: string, topIssues: string[]): string[] {
  const deptSpecific: { [key: string]: string[] } = {
    'Marketing': [
      '캠페인/프로젝트 기반 업무 템플릿 추가',
      '고객 데이터 분석 관련 AI 기능 강화',
      '마케팅 KPI에 맞춘 성과 측정 도구'
    ],
    'Sales': [
      '영업 실적 및 파이프라인 관리 통합',
      '고객 관계 관리 워크플로우 템플릿',
      '영업 목표 대비 진행률 시각화'
    ],
    'Production': [
      '제조 공정 특화 업무 분류 체계',
      '물리적 작업 프로세스 디지털화 가이드',
      '품질 관리 및 생산 계획 워크플로우'
    ],
    'R&D': [
      '연구 프로젝트 및 실험 관리 템플릿',
      '기술 개발 프로세스 특화 워크플로우',
      '협업 연구를 위한 팀 간 공유 기능'
    ],
    'IT': [
      '기술 스택 및 시스템 관리 워크플로우',
      '개발/운영 업무 자동화 연계',
      '인프라 관리 및 모니터링 통합'
    ],
    'HR': [
      '인사 평가 및 채용 프로세스 템플릿',
      '직원 개발 계획 워크플로우',
      '조직 문화 및 만족도 관리 도구'
    ],
    'Finance': [
      '예산 편성 및 재무 분석 워크플로우',
      '회계 처리 자동화 연계',
      '재무 리포팅 템플릿'
    ],
    'CS': [
      '고객 문의 처리 워크플로우',
      '이슈 추적 및 에스컬레이션 프로세스',
      'VOC 분석 및 개선 관리'
    ]
  };

  return deptSpecific[dept] || [
    '해당 부서 업무 특성을 반영한 맞춤 템플릿 개발',
    '부서별 KPI 및 성과 지표 설정 기능',
    '업무 프로세스 최적화 가이드 제공'
  ];
}

function generateMaturityRecommendations(maturity: string, topIssues: string[]): string[] {
  const maturitySpecific: { [key: string]: string[] } = {
    'Beginner': [
      '단계별 상세 튜토리얼 및 비디오 가이드',
      '기본 용어 설명 및 개념 교육 콘텐츠',
      '간소화된 인터페이스 및 필수 기능 중심 모드'
    ],
    'Intermediate': [
      '실무 적용 사례 및 베스트 프랙티스 제공',
      '자주 사용하는 기능 바로가기 및 커스터마이징',
      '중급 사용자를 위한 팁 및 트릭'
    ],
    'Advanced': [
      '고급 분석 기능 및 데이터 시각화',
      'API 연동 및 자동화 기능',
      '커스텀 워크플로우 설계 도구'
    ],
    'Expert': [
      '전문가용 대시보드 및 고급 설정',
      '시스템 통합 및 대량 데이터 처리',
      '조직 전체 워크플로우 설계 및 관리'
    ]
  };

  return maturitySpecific[maturity] || [];
}

function generateTeamSizeRecommendations(size: string, topIssues: string[]): string[] {
  if (size.includes('소규모')) {
    return [
      '간소화된 입력 프로세스 (필수 정보만)',
      '빠른 설정 모드 제공',
      '소규모 팀 전용 템플릿'
    ];
  } else if (size.includes('중규모')) {
    return [
      '표준 워크플로우 템플릿',
      '팀원별 역할 및 책임 관리',
      '중간 규모 조직에 적합한 협업 도구'
    ];
  } else {
    return [
      'CSV/Excel 일괄 업로드 기능',
      '부서별/팀별 구분 관리',
      '대규모 조직용 계층 구조 지원'
    ];
  }
}

function generateReport(
  results: PersonaResult[],
  uiIssues: UIIssue[],
  deptAnalysis: SegmentAnalysis[],
  maturityAnalysis: SegmentAnalysis[],
  teamSizeAnalysis: SegmentAnalysis[]
): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let report = `# 🔍 Work Redesign Platform - UI/UX 개선 분석 보고서\n\n`;
  report += `**생성일시**: ${dateStr}\n`;
  report += `**분석 대상**: SK 그룹 팀장 30명 파일럿 시뮬레이션 결과\n\n`;
  report += `---\n\n`;

  // Executive Summary
  const avgSatisfaction = results.reduce((sum, r) => sum + (r.overallSatisfaction || 0), 0) / results.length;
  const highImpactIssues = uiIssues.filter(i => i.impact === 'High');

  report += `## 📊 요약\n\n`;
  report += `- **전체 평균 만족도**: ${avgSatisfaction.toFixed(1)}/10\n`;
  report += `- **확인된 UI/UX 이슈**: 총 ${uiIssues.length}개\n`;
  report += `  - 🔴 High Impact: ${highImpactIssues.length}개 (10명 이상 영향)\n`;
  report += `  - 🟡 Medium Impact: ${uiIssues.filter(i => i.impact === 'Medium').length}개 (5-9명 영향)\n`;
  report += `  - 🟢 Low Impact: ${uiIssues.filter(i => i.impact === 'Low').length}개 (5명 미만 영향)\n\n`;

  report += `### 💡 핵심 개선 포인트\n\n`;
  highImpactIssues.slice(0, 5).forEach((issue, idx) => {
    report += `${idx + 1}. **${issue.component}**: ${issue.rootCause} (${issue.affectedPersonas.length}명 영향)\n`;
  });
  report += `\n---\n\n`;

  // Detailed UI/UX Issues
  report += `## 🎯 UI/UX 컴포넌트별 상세 분석\n\n`;

  uiIssues.forEach((issue, idx) => {
    const impactEmoji = issue.impact === 'High' ? '🔴' : issue.impact === 'Medium' ? '🟡' : '🟢';

    report += `### ${impactEmoji} ${idx + 1}. ${issue.component}\n\n`;
    report += `**영향도**: ${issue.impact} (${issue.affectedPersonas.length}명)\n`;
    report += `**관련 워크샵 단계**: Step ${issue.stages.join(', ')}\n\n`;

    report += `#### 🔍 근본 원인\n`;
    report += `${issue.rootCause}\n\n`;

    report += `#### ⚠️ 주요 불편 사항 (사용자 피드백)\n`;
    issue.painPoints.slice(0, 5).forEach(pp => {
      report += `- "${pp}"\n`;
    });
    if (issue.painPoints.length > 5) {
      report += `- *(외 ${issue.painPoints.length - 5}개)*\n`;
    }
    report += `\n`;

    report += `#### 👥 영향받은 페르소나 유형\n`;
    const deptCounts: { [key: string]: number } = {};
    const maturityCounts: { [key: string]: number } = {};

    issue.affectedPersonas.forEach(p => {
      deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
      maturityCounts[p.digitalMaturity] = (maturityCounts[p.digitalMaturity] || 0) + 1;
    });

    const topDepts = Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dept, count]) => `${dept}(${count}명)`)
      .join(', ');

    const topMaturities = Object.entries(maturityCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([mat, count]) => `${mat}(${count}명)`)
      .join(', ');

    report += `- **주요 부서**: ${topDepts}\n`;
    report += `- **디지털 성숙도**: ${topMaturities}\n\n`;

    report += `#### ✅ 개선 방안\n`;
    issue.solutions.forEach((sol, solIdx) => {
      report += `${solIdx + 1}. ${sol}\n`;
    });
    report += `\n`;

    // Add specific example if available
    if (issue.affectedPersonas.length > 0) {
      const example = issue.affectedPersonas[0];
      report += `**사례**: ${example.name} (${example.department}, ${example.digitalMaturity}, ${example.teamSize}명 팀)\n`;
      report += `> "${issue.painPoints[0]}"\n\n`;
    }

    report += `---\n\n`;
  });

  // Segment Analysis
  report += `## 📈 세그먼트별 분석\n\n`;

  // By Department
  report += `### 🏢 부서별 분석\n\n`;
  deptAnalysis.forEach(analysis => {
    const satisfactionEmoji = analysis.avgSatisfaction >= 6 ? '😊' : analysis.avgSatisfaction >= 4 ? '😐' : '😞';

    report += `#### ${satisfactionEmoji} ${analysis.segment} (${analysis.count}명)\n`;
    report += `**평균 만족도**: ${analysis.avgSatisfaction.toFixed(1)}/10\n\n`;

    if (analysis.topIssues.length > 0) {
      report += `**주요 이슈**:\n`;
      analysis.topIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `**맞춤형 개선 방안**:\n`;
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  });

  report += `---\n\n`;

  // By Digital Maturity
  report += `### 💻 디지털 성숙도별 분석\n\n`;
  maturityAnalysis.forEach(analysis => {
    const satisfactionEmoji = analysis.avgSatisfaction >= 6 ? '😊' : analysis.avgSatisfaction >= 4 ? '😐' : '😞';

    report += `#### ${satisfactionEmoji} ${analysis.segment} (${analysis.count}명)\n`;
    report += `**평균 만족도**: ${analysis.avgSatisfaction.toFixed(1)}/10\n\n`;

    if (analysis.topIssues.length > 0) {
      report += `**주요 이슈**:\n`;
      analysis.topIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `**맞춤형 개선 방안**:\n`;
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  });

  report += `---\n\n`;

  // By Team Size
  report += `### 👥 팀 규모별 분석\n\n`;
  teamSizeAnalysis.forEach(analysis => {
    const satisfactionEmoji = analysis.avgSatisfaction >= 6 ? '😊' : analysis.avgSatisfaction >= 4 ? '😐' : '😞';

    report += `#### ${satisfactionEmoji} ${analysis.segment} (${analysis.count}명)\n`;
    report += `**평균 만족도**: ${analysis.avgSatisfaction.toFixed(1)}/10\n\n`;

    if (analysis.topIssues.length > 0) {
      report += `**주요 이슈**:\n`;
      analysis.topIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }

    report += `**맞춤형 개선 방안**:\n`;
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  });

  report += `---\n\n`;

  // Prioritized Action Plan
  report += `## 🚀 우선순위별 실행 계획\n\n`;

  report += `### 🔴 최우선 (High Impact)\n`;
  report += `**즉시 개선 필요** - 10명 이상의 사용자에게 영향\n\n`;
  highImpactIssues.slice(0, 5).forEach((issue, idx) => {
    report += `${idx + 1}. **${issue.component}**\n`;
    report += `   - 문제: ${issue.rootCause}\n`;
    report += `   - 해결: ${issue.solutions[0]}\n`;
    report += `   - 영향: ${issue.affectedPersonas.length}명\n\n`;
  });

  const mediumImpactIssues = uiIssues.filter(i => i.impact === 'Medium');
  if (mediumImpactIssues.length > 0) {
    report += `### 🟡 중요 (Medium Impact)\n`;
    report += `**단기 개선 권장** - 5-9명의 사용자에게 영향\n\n`;
    mediumImpactIssues.slice(0, 3).forEach((issue, idx) => {
      report += `${idx + 1}. **${issue.component}**: ${issue.solutions[0]}\n`;
    });
    report += `\n`;
  }

  const lowImpactIssues = uiIssues.filter(i => i.impact === 'Low');
  if (lowImpactIssues.length > 0) {
    report += `### 🟢 개선 고려 (Low Impact)\n`;
    report += `**중장기 개선** - 소수 사용자 대상 최적화\n\n`;
    report += `총 ${lowImpactIssues.length}개의 세부 개선 사항이 확인되었습니다.\n\n`;
  }

  report += `---\n\n`;

  // Conclusion
  report += `## 📝 결론 및 제언\n\n`;
  report += `본 분석 결과, Work Redesign Platform의 UI/UX는 다음과 같은 개선이 필요합니다:\n\n`;
  report += `1. **업종/직무별 맞춤화**: 각 부서의 업무 특성을 반영한 입력 템플릿 및 워크플로우 제공\n`;
  report += `2. **디지털 성숙도 고려**: Beginner부터 Expert까지 차별화된 사용자 경험 설계\n`;
  report += `3. **팀 규모 최적화**: 소규모 팀의 간소화 니즈와 대규모 팀의 효율성 니즈 동시 충족\n`;
  report += `4. **AI 기능 투명성**: AI 분석 과정 및 결과에 대한 명확한 설명 제공\n`;
  report += `5. **사용 가이드 강화**: 단계별 상세 안내 및 실시간 도움말 시스템 구축\n\n`;

  report += `이러한 개선사항을 우선순위에 따라 단계적으로 적용할 경우, `;
  report += `사용자 만족도를 현재 ${avgSatisfaction.toFixed(1)}/10에서 7.5/10 이상으로 향상시킬 수 있을 것으로 예상됩니다.\n\n`;

  return report;
}

async function main() {
  console.log('🔍 UI/UX 분석 보고서 생성 시작...\n');

  const outputDir = path.join(__dirname, '..', 'outputs', 'parallel-simulations');
  const reportDir = path.join(__dirname, '..', 'outputs', 'parallel-reports');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  console.log('📂 페르소나 결과 로딩 중...');
  const results = loadPersonaResults(outputDir);
  console.log(`✅ ${results.length}명의 페르소나 결과 로드 완료\n`);

  console.log('🔍 UI/UX 이슈 추출 중...');
  const uiIssues = extractUIIssues(results);
  console.log(`✅ ${uiIssues.length}개의 UI/UX 이슈 확인\n`);

  console.log('📊 세그먼트별 분석 중...');
  const deptAnalysis = analyzeByDepartment(results);
  const maturityAnalysis = analyzeByDigitalMaturity(results);
  const teamSizeAnalysis = analyzeByTeamSize(results);
  console.log(`✅ 부서별(${deptAnalysis.length}개), 성숙도별(${maturityAnalysis.length}개), 팀규모별(${teamSizeAnalysis.length}개) 분석 완료\n`);

  console.log('📝 최종 보고서 생성 중...');
  const report = generateReport(results, uiIssues, deptAnalysis, maturityAnalysis, teamSizeAnalysis);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const reportPath = path.join(reportDir, `UI_UX_분석_보고서_${dateStr}.md`);

  fs.writeFileSync(reportPath, report, 'utf-8');

  console.log('✅ UI/UX 분석 보고서 생성 완료!\n');
  console.log(`📄 보고서 위치: ${reportPath}\n`);

  // Summary statistics
  console.log('📊 분석 요약:');
  console.log(`   - 전체 이슈: ${uiIssues.length}개`);
  console.log(`   - High Impact: ${uiIssues.filter(i => i.impact === 'High').length}개`);
  console.log(`   - Medium Impact: ${uiIssues.filter(i => i.impact === 'Medium').length}개`);
  console.log(`   - Low Impact: ${uiIssues.filter(i => i.impact === 'Low').length}개`);
}

main().catch(console.error);
