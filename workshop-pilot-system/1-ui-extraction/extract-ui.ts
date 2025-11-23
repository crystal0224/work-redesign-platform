#!/usr/bin/env ts-node

/**
 * UI/UX 추출 모듈
 * 실제 워크샵 플랫폼의 UI 요소를 분석하고 문서화
 */

import * as fs from 'fs';
import * as path from 'path';

// 실제 워크샵 11단계 UI/UX 정의 (실제 플랫폼 분석 기반)
export const WORKSHOP_UI_SPECS = {
  step1: {
    id: 1,
    name: '워크샵 시작',
    type: 'intro',
    description: '단순 인트로 페이지',
    ui_elements: {
      type: 'landing_page',
      components: [
        'Hero 섹션: "팀장님께서는 진짜 일에 집중하세요!"',
        '4단계 프로세스 카드 (2x2 그리드)',
        '시작하기 버튼 (gradient)',
      ],
      user_actions: ['시작하기 버튼 클릭'],
      estimated_time: 30, // 30초
      difficulty: 'none',
    },
    expected_issues: {
      beginner: ['AI Agent 용어 이해 어려움'],
      large_team: [],
      unstructured: [],
    }
  },

  step2: {
    id: 2,
    name: '미션 작성',
    type: 'input',
    description: '팀 목표와 고객 가치 텍스트 입력',
    ui_elements: {
      type: 'text_input',
      components: [
        '질문1: "올해 무엇을 어떻게 하면 잘했다고 평가?"',
        '질문2: "고객은 누구이고 어떤 가치를 만들어야?"',
        '텍스트 영역 (rows=4)',
        '가이드 박스 4개 (잘 모르겠으면, 단순하게, 여러가지, 짧게)',
      ],
      user_actions: ['텍스트 입력', '다음 버튼 클릭'],
      estimated_time: 300, // 5분
      difficulty: 'medium',
    },
    expected_issues: {
      beginner: ['추상적 질문에 답하기 어려움'],
      large_team: ['40명+ 팀 미션을 한 문장으로 정리 어려움'],
      unstructured: ['유동적 업무를 명확한 미션으로 정의 어려움'],
    }
  },

  step3: {
    id: 3,
    name: '팀 상황 확인',
    type: 'checkbox',
    description: '체크박스로 팀 특성 선택',
    ui_elements: {
      type: 'checkbox_selection',
      components: [
        '팀원 수 입력 (number input)',
        '팀 결성 시기 입력 (text input)',
        '특성 체크박스 그룹: 역량&전문성, 경력구성, 협업&소통',
        '각 그룹 5-6개 옵션',
      ],
      user_actions: ['숫자 입력', '체크박스 선택', '다음 클릭'],
      estimated_time: 180, // 3분
      difficulty: 'easy',
    },
    expected_issues: {
      beginner: [],
      large_team: ['팀이 너무 커서 일반화 어려움'],
      unstructured: [],
    }
  },

  step4: {
    id: 4,
    name: '업무 영역 정의',
    type: 'input',
    description: '주요 업무 도메인 3-5개 입력',
    ui_elements: {
      type: 'domain_input',
      components: [
        '업무 영역 입력 필드 (동적 추가)',
        '예시: 고객 문의 처리, 데이터 분석, 보고서 작성',
        '+ 버튼으로 영역 추가',
      ],
      user_actions: ['업무 영역 입력', '추가 버튼 클릭', '다음'],
      estimated_time: 300, // 5분
      difficulty: 'medium',
    },
    expected_issues: {
      beginner: ['업무 분류 기준 모호'],
      large_team: ['부서별 업무 통합 어려움'],
      unstructured: ['영역 구분이 명확하지 않음'],
    }
  },

  step5: {
    id: 5,
    name: '업무 내용 입력',
    type: 'input',
    description: '구체적 업무 내용 입력 또는 파일 업로드',
    ui_elements: {
      type: 'text_file_input',
      components: [
        '각 영역별 텍스트 영역',
        '파일 업로드 (드래그앤드롭)',
        '업무 설명 가이드',
      ],
      user_actions: ['텍스트 입력', '파일 업로드', '다음'],
      estimated_time: 600, // 10분
      difficulty: 'high',
    },
    expected_issues: {
      beginner: ['무엇을 어떻게 입력해야 할지 모름'],
      large_team: ['모든 팀원 업무 파악 불가능'],
      unstructured: ['업무가 너무 유동적'],
    }
  },

  step6: {
    id: 6,
    name: '업무 추출 (AI)',
    type: 'ai_processing',
    description: 'AI가 자동으로 업무 분석 및 추출',
    ui_elements: {
      type: 'loading_progress',
      components: [
        '진행률 바',
        '처리 중 메시지',
        '예상 시간 표시',
      ],
      user_actions: ['대기'],
      estimated_time: 300, // 5분
      difficulty: 'none',
    },
    expected_issues: {
      beginner: ['AI가 제대로 이해했는지 불안'],
      large_team: [],
      unstructured: ['추출 결과가 실제와 다름'],
    }
  },

  step7: {
    id: 7,
    name: '결과 요약',
    type: 'review',
    description: '추출된 업무 목록 확인 및 수정',
    ui_elements: {
      type: 'task_list_review',
      components: [
        '업무 카드 리스트',
        '수정/삭제 버튼',
        '자동화 가능성 표시',
      ],
      user_actions: ['업무 확인', '수정', '다음'],
      estimated_time: 300, // 5분
      difficulty: 'medium',
    },
    expected_issues: {
      beginner: ['자동화 가능성 기준 이해 못함'],
      large_team: ['너무 많은 업무 목록'],
      unstructured: ['분류가 맞지 않음'],
    }
  },

  step8: {
    id: 8,
    name: 'AI 교육',
    type: 'educational',
    description: 'AI 자동화 관련 교육 콘텐츠',
    ui_elements: {
      type: 'educational_content',
      components: [
        '교육 슬라이드',
        '동영상 플레이어',
        '용어 설명 툴팁',
      ],
      user_actions: ['콘텐츠 읽기', '다음'],
      estimated_time: 300, // 5분
      difficulty: 'varies',
    },
    expected_issues: {
      beginner: ['기술 용어 과다, 이해 어려움'],
      large_team: [],
      unstructured: [],
    }
  },

  step9: {
    id: 9,
    name: 'AI 컨설팅',
    type: 'report',
    description: 'AI 도입 전략 및 ROI 분석',
    ui_elements: {
      type: 'consulting_report',
      components: [
        '도입 전략 섹션',
        'ROI 계산 결과',
        '실행 로드맵',
        '리스크 분석',
      ],
      user_actions: ['리포트 읽기', '다음'],
      estimated_time: 300, // 5분
      difficulty: 'medium',
    },
    expected_issues: {
      beginner: ['너무 일반적, 실무와 동떨어짐'],
      large_team: ['대규모 조직 변화관리 전략 부족'],
      unstructured: ['구체적 실행 방법 불명확'],
    }
  },

  step10: {
    id: 10,
    name: '워크플로우 설계',
    type: 'visual_editor',
    description: '드래그앤드롭으로 워크플로우 설계',
    ui_elements: {
      type: 'workflow_designer',
      components: [
        '노드 팔레트',
        '캔버스 영역',
        '연결선 도구',
        '속성 패널',
      ],
      user_actions: ['노드 드래그', '연결', '속성 설정', '저장'],
      estimated_time: 420, // 7분
      difficulty: 'very_high',
    },
    expected_issues: {
      beginner: ['너무 복잡, 개발자 도구 같음'],
      large_team: ['복잡한 프로세스 표현 어려움'],
      unstructured: ['워크플로우로 표현 불가능'],
    }
  },

  step11: {
    id: 11,
    name: '최종 리포트',
    type: 'download',
    description: 'PDF 다운로드',
    ui_elements: {
      type: 'report_download',
      components: [
        '요약 대시보드',
        'PDF 다운로드 버튼',
        '공유 옵션',
      ],
      user_actions: ['리포트 확인', 'PDF 다운로드'],
      estimated_time: 180, // 3분
      difficulty: 'easy',
    },
    expected_issues: {
      beginner: [],
      large_team: ['팀 공유 기능 부족'],
      unstructured: [],
    }
  }
};

// UI 스펙을 JSON 파일로 저장
export function saveUISpecs() {
  const outputPath = path.join(__dirname, '../outputs/ui-specs.json');

  // outputs 디렉토리 생성
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(WORKSHOP_UI_SPECS, null, 2),
    'utf-8'
  );

  console.log('✅ UI 스펙 저장 완료:', outputPath);
  return WORKSHOP_UI_SPECS;
}

// UI 분석 리포트 생성
export function generateUIAnalysisReport() {
  let report = `# 워크샵 플랫폼 UI/UX 분석 리포트\n\n`;
  report += `생성 시간: ${new Date().toLocaleString('ko-KR')}\n\n`;
  report += `## 11단계 상세 분석\n\n`;

  Object.values(WORKSHOP_UI_SPECS).forEach(step => {
    report += `### Step ${step.id}: ${step.name}\n\n`;
    report += `- **타입**: ${step.type}\n`;
    report += `- **설명**: ${step.description}\n`;
    report += `- **예상 시간**: ${step.ui_elements.estimated_time}초 (${Math.round(step.ui_elements.estimated_time/60)}분)\n`;
    report += `- **난이도**: ${step.ui_elements.difficulty}\n\n`;

    report += `#### UI 구성요소\n`;
    step.ui_elements.components.forEach(component => {
      report += `- ${component}\n`;
    });

    report += `\n#### 예상 문제점\n`;
    if (step.expected_issues.beginner.length > 0) {
      report += `- **초보자**: ${step.expected_issues.beginner.join(', ')}\n`;
    }
    if (step.expected_issues.large_team.length > 0) {
      report += `- **대규모 팀**: ${step.expected_issues.large_team.join(', ')}\n`;
    }
    if (step.expected_issues.unstructured.length > 0) {
      report += `- **비구조화 조직**: ${step.expected_issues.unstructured.join(', ')}\n`;
    }
    report += '\n---\n\n';
  });

  const reportPath = path.join(__dirname, '../outputs/ui-analysis-report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');

  console.log('✅ UI 분석 리포트 생성 완료:', reportPath);
  return report;
}

// 실행
if (require.main === module) {
  console.log('🔍 UI/UX 추출 시작...\n');
  saveUISpecs();
  generateUIAnalysisReport();
  console.log('\n✨ UI/UX 추출 완료!');
}