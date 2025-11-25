#!/usr/bin/env ts-node

/**
 * personas-v3.ts 파일의 페르소나 데이터를 수정하는 스크립트
 * 1. 불필요한 필드 제거 (strongSteps, timePerceptionByStep, problemSteps)
 * 2. 23명의 간략 페르소나에 누락된 필드 추가
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 간략 페르소나 ID 목록 (상세 페르소나 7명 제외)
const simplePersonaIds = [
  'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010',
  'P011', 'P012', 'P013', 'P015', 'P016', 'P017', 'P018',
  'P019', 'P020', 'P021', 'P022', 'P023', 'P026', 'P027',
  'P028', 'P030'
];

// 승진 이유 템플릿 (카테고리별)
const promotionReasons: Record<string, string[]> = {
  'Sales': [
    '전년 대비 매출 35% 성장 달성하여 팀 내 최고 실적 기록. 신규 고객 개척 프로세스 체계화하여 팀 전체 성과 향상에 기여',
    '핵심 고객사 3곳과 장기 계약 체결하여 안정적 매출 기반 확보. 주니어 영업사원 멘토링으로 팀 역량 향상 주도'
  ],
  'Operations': [
    '생산 효율성 개선 프로젝트로 불량률 20% 감소 달성. 크로스펑셔널 협업 능력 인정받아 팀장 승진',
    '공급망 최적화로 재고 회전율 30% 향상. 데이터 분석 기반 의사결정 도입하여 운영 혁신 주도'
  ],
  'R&D': [
    '신제품 개발 프로젝트 3건 성공적 완료. 특허 2건 출원하고 팀 내 기술 리더십 발휘하여 승진',
    '연구 프로세스 표준화로 개발 기간 25% 단축. 외부 기관과의 협업 프로젝트 성공적으로 리드'
  ],
  'HR': [
    '전사 디지털 전환 교육 프로그램 설계 및 실행으로 직원 만족도 85% 달성. 채용 프로세스 개선으로 우수 인재 확보',
    '성과 관리 시스템 혁신으로 평가 공정성 향상. 팀원 이직률 50% 감소시켜 조직 안정성 기여'
  ],
  'Finance': [
    '예산 관리 자동화로 월 마감 기간 3일 단축. 재무 리스크 조기 경보 시스템 구축하여 손실 예방',
    '원가 분석 고도화로 수익성 개선 기회 발굴. 경영진 의사결정 지원 역량 인정받아 승진'
  ],
  'IT': [
    '클라우드 마이그레이션 프로젝트 성공적 완료. 시스템 안정성 99.9% 달성하고 IT 비용 20% 절감',
    '사내 디지털 혁신 도구 도입 주도. 업무 자동화로 전사 생산성 15% 향상에 기여'
  ],
  'Marketing': [
    '디지털 마케팅 전환으로 ROI 200% 향상. 데이터 기반 타겟팅 도입하여 전환율 35% 개선',
    '브랜드 리포지셔닝 프로젝트 성공적 완료. SNS 마케팅 혁신으로 브랜드 인지도 50% 향상'
  ]
};

// 일일 워크플로우 템플릿
const dailyWorkflows: Record<string, string> = {
  'Sales': `오전 8:30 출근 → 9시 CRM에서 영업 현황 확인 → 9:30 팀 스탠드업 미팅(15분) → 10-12시 고객 미팅 또는 제안서 작성 → 오후 1-3시 신규 리드 발굴 및 콜드콜 → 3-5시 팀원 1:1 코칭 → 5-6시 일일 실적 정리 및 보고서 작성 → 긴급 고객 대응`,
  'Operations': `오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립`,
  'R&D': `오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립`,
  'HR': `오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획`,
  'Finance': `오전 8:30 출근 → 9시 전일 재무 지표 확인 → 9:30 팀 회계 이슈 공유 → 10-12시 재무 분석 및 보고서 작성 → 오후 1-2시 예산 검토 회의 → 2-4시 각 부서 재무 지원 → 4-5시 감사 대응 → 5-6시 일일 마감 및 내일 우선순위 정리`,
  'IT': `오전 9시 출근 → 9:30 시스템 모니터링 및 티켓 확인 → 10시 IT 헬프데스크 현황 점검 → 10:30-12시 프로젝트 진행 또는 장애 대응 → 오후 1-3시 시스템 개선 작업 → 3-4시 보안 점검 → 4-5시 사용자 교육 → 5-6시 일일 보고 및 당직 인수인계`,
  'Marketing': `오전 9시 출근 → 9:30 전일 캠페인 성과 확인 → 10시 팀 크리에이티브 리뷰 → 11-12시 콘텐츠 제작 감독 → 오후 1-3시 파트너사 미팅 → 3-4시 데이터 분석 → 4-5시 내일 캠페인 준비 → 5-6시 일일 리포트 작성`
};

// 주간 루틴 템플릿
const weeklyRoutines: Record<string, string> = {
  'Sales': `월: 주간 영업 전략 회의(2시간) | 화: 파이프라인 리뷰 | 수: 고객사 방문의 날 | 목: 제안서 검토 및 팀 교육 | 금: 주간 실적 보고 및 차주 계획`,
  'Operations': `월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고`,
  'R&D': `월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리`,
  'HR': `월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리`,
  'Finance': `월: 주간 재무 현황 분석 | 화: 예산 집행 점검 | 수: 부서별 재무 미팅 | 목: 리스크 관리 회의 | 금: 주간 재무 보고서 작성`,
  'IT': `월: 주간 시스템 점검 | 화: 프로젝트 진행 회의 | 수: 보안 패치 적용 | 목: 사용자 교육 | 금: 주간 IT 서비스 리포트`,
  'Marketing': `월: 주간 캠페인 기획 회의 | 화: 크리에이티브 리뷰 | 수: 성과 분석 | 목: 파트너 미팅 | 금: 차주 캠페인 준비`
};

// 협업 방식 템플릿 생성
function generateCollaboration(toolsUsed: string[]): string {
  const toolString = toolsUsed.slice(0, 3).join(', ');
  return `팀 내부: ${toolString}로 실시간 소통, 주 2회 대면 회의로 진행 상황 공유 | ` +
         `타 부서: 프로젝트별로 관련 부서와 주 1-2회 협업 미팅, 이메일과 메신저로 일상 소통 | ` +
         `외부: 파트너사/고객사와 정기 미팅 및 이메일/화상회의로 협업`;
}

// 메인 함수
async function fixPersonas() {
  const filePath = join(__dirname, 'personas-v3.ts');
  let fileContent = readFileSync(filePath, 'utf-8');

  console.log('📝 personas-v3.ts 파일 수정 시작...\n');

  // 1. 불필요한 필드 제거
  console.log('🗑️  불필요한 필드 제거 중...');

  // strongSteps 제거
  const strongStepsPattern = /\n\s*strongSteps:\s*\[[^\]]*\],?/g;
  fileContent = fileContent.replace(strongStepsPattern, '');

  // timePerceptionByStep 제거
  const timePerceptionPattern = /\n\s*timePerceptionByStep:\s*\{[^}]*\},?/g;
  fileContent = fileContent.replace(timePerceptionPattern, '');

  // problemSteps 제거
  const problemStepsPattern = /\n\s*problemSteps:\s*\[[^\]]*\],?/g;
  fileContent = fileContent.replace(problemStepsPattern, '');

  console.log('✅ 불필요한 필드 제거 완료\n');

  // 2. 간략 페르소나에 누락된 필드 추가
  console.log('➕ 누락된 필드 추가 중...');

  for (const personaId of simplePersonaIds) {
    console.log(`  - ${personaId} 처리 중...`);

    // 각 페르소나 블록 찾기
    const personaRegex = new RegExp(`(\\{\\s*id:\\s*'${personaId}'[^}]*\\})`, 's');
    const personaMatch = fileContent.match(personaRegex);

    if (!personaMatch) {
      console.log(`    ⚠️  ${personaId}를 찾을 수 없음`);
      continue;
    }

    // age 필드 추가 (없는 경우)
    if (!fileContent.includes(`id: '${personaId}',\n    name:`) || !fileContent.includes('age:')) {
      const idNum = parseInt(personaId.substring(1));
      const age = 35 + Math.floor((idNum / 30) * 13);

      // name 필드 다음에 age 추가
      const namePattern = new RegExp(`(id: '${personaId}',\\s*name: '[^']+',)`, 'g');
      fileContent = fileContent.replace(namePattern, `$1\n    age: ${age},`);
    }

    // promotionReason 추가 (없는 경우)
    const categoryMatch = fileContent.match(new RegExp(`id: '${personaId}'[^}]*category: '([^']+)'`));
    if (categoryMatch) {
      const category = categoryMatch[1];
      const reasons = promotionReasons[category] || promotionReasons['Operations'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];

      // previousRole 다음에 promotionReason 추가
      const prevRolePattern = new RegExp(
        `(id: '${personaId}'[^}]*previousRole: '[^']+',)(?!\\s*promotionReason)`,
        's'
      );
      if (prevRolePattern.test(fileContent)) {
        fileContent = fileContent.replace(prevRolePattern, `$1\n      promotionReason: '${reason}',`);
      }
    }

    // dailyWorkflow, weeklyRoutine, collaboration 추가
    const workPattern = new RegExp(
      `(id: '${personaId}'[^}]*work: \\{[^}]*mainTasks: \\[[^\\]]*\\],)`,
      's'
    );
    if (workPattern.test(fileContent) && categoryMatch) {
      const category = categoryMatch[1];

      // dailyWorkflow 추가
      if (!fileContent.includes(`dailyWorkflow:`)) {
        const workflow = dailyWorkflows[category] || dailyWorkflows['Operations'];
        fileContent = fileContent.replace(workPattern,
          `$1\n      dailyWorkflow: '${workflow}',`);
      }

      // weeklyRoutine 추가
      if (!fileContent.includes(`weeklyRoutine:`)) {
        const routine = weeklyRoutines[category] || weeklyRoutines['Operations'];
        fileContent = fileContent.replace(workPattern,
          `$1\n      weeklyRoutine: '${routine}',`);
      }
    }
  }

  console.log('✅ 누락된 필드 추가 완료\n');

  // 3. 파일 저장
  writeFileSync(filePath, fileContent);
  console.log('💾 파일 저장 완료!');

  // 4. 검증
  console.log('\n🔍 검증 중...');
  const updatedContent = readFileSync(filePath, 'utf-8');

  const strongStepsCount = (updatedContent.match(/strongSteps:/g) || []).length;
  const timePerceptionCount = (updatedContent.match(/timePerceptionByStep:/g) || []).length;
  const problemStepsCount = (updatedContent.match(/problemSteps:/g) || []).length;

  console.log(`  - strongSteps 남은 개수: ${strongStepsCount}`);
  console.log(`  - timePerceptionByStep 남은 개수: ${timePerceptionCount}`);
  console.log(`  - problemSteps 남은 개수: ${problemStepsCount}`);

  if (strongStepsCount === 0 && timePerceptionCount === 0 && problemStepsCount === 0) {
    console.log('\n✅ 모든 불필요한 필드가 성공적으로 제거되었습니다!');
  } else {
    console.log('\n⚠️  일부 필드가 아직 남아있습니다. 수동 확인이 필요할 수 있습니다.');
  }
}

// 실행
fixPersonas().catch(console.error);