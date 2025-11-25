#!/usr/bin/env ts-node

/**
 * personas-v3.ts의 23명 간략 페르소나를 완전히 수정하는 스크립트
 * 모든 누락된 필드를 정확히 추가합니다.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// P001처럼 상세한 페르소나 예시로부터 패턴을 파악
const DETAILED_PERSONA_EXAMPLE = `
    age: 37,
    seniorCount: 4,
    juniorCount: 5,
    promotionReason: '11번가 리브랜딩 캠페인 성공으로 매출 23% 증가, 데이터 기반 의사결정 능력 인정받아 승진',
    dailyWorkflow: '오전 9시 출근 → 전날 캠페인 성과 확인(GA4, Braze 대시보드) → 10시 데일리 스탠드업(15분)...',
    weeklyRoutine: '월요일: 캠페인 기획 회의 (2시간) → 우선순위 정하고 리소스 배분...',
    collaboration: '팀 내부: Notion과 Slack으로 실시간 캠페인 진행 현황 공유...'
`;

// 간략 페르소나 ID 목록
const SIMPLE_PERSONAS = [
  { id: 'P004', category: 'Sales' },
  { id: 'P005', category: 'Sales' },
  { id: 'P006', category: 'Operations' },
  { id: 'P007', category: 'Operations' },
  { id: 'P008', category: 'Operations' },
  { id: 'P009', category: 'Operations' },
  { id: 'P010', category: 'Operations' },
  { id: 'P011', category: 'R&D' },
  { id: 'P012', category: 'R&D' },
  { id: 'P013', category: 'R&D' },
  { id: 'P015', category: 'R&D' },
  { id: 'P016', category: 'HR' },
  { id: 'P017', category: 'HR' },
  { id: 'P018', category: 'HR' },
  { id: 'P019', category: 'HR' },
  { id: 'P020', category: 'HR' },
  { id: 'P021', category: 'Finance' },
  { id: 'P022', category: 'Finance' },
  { id: 'P023', category: 'Finance' },
  { id: 'P026', category: 'IT' },
  { id: 'P027', category: 'IT' },
  { id: 'P028', category: 'IT' },
  { id: 'P030', category: 'IT' }
];

// 카테고리별 상세 데이터
const CATEGORY_DATA = {
  Sales: {
    promotionReason: '전년 대비 매출 35% 성장 달성하여 팀 내 최고 실적 기록. 신규 고객 개척 프로세스 체계화하여 팀 전체 성과 향상에 기여',
    dailyWorkflow: '오전 8:30 출근 → 9시 CRM에서 영업 현황 확인 → 9:30 팀 스탠드업 미팅(15분) → 10-12시 고객 미팅 또는 제안서 작성 → 오후 1-3시 신규 리드 발굴 및 콜드콜 → 3-5시 팀원 1:1 코칭 → 5-6시 일일 실적 정리 및 보고서 작성 → 긴급 고객 대응',
    weeklyRoutine: '월: 주간 영업 전략 회의(2시간) | 화: 파이프라인 리뷰 | 수: 고객사 방문의 날 | 목: 제안서 검토 및 팀 교육 | 금: 주간 실적 보고 및 차주 계획',
    collaboration: '팀 내부: CRM과 Slack으로 실시간 영업 현황 공유, 주 2회 대면 회의 | 타 부서: 기술팀과 제품 스펙 협의(주 1회), 재무팀과 계약 조건 검토 | 외부: 고객사와 정기 미팅 및 이메일/화상회의'
  },
  Operations: {
    promotionReason: '생산 효율성 개선 프로젝트로 불량률 20% 감소 달성. 크로스펑셔널 협업 능력 인정받아 팀장 승진',
    dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
    weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
    collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅'
  },
  'R&D': {
    promotionReason: '신제품 개발 프로젝트 3건 성공적 완료. 특허 2건 출원하고 팀 내 기술 리더십 발휘하여 승진',
    dailyWorkflow: '오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립',
    weeklyRoutine: '월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리',
    collaboration: '팀 내부: LIMS와 Teams으로 연구 데이터 공유, 주 2회 기술 회의 | 타 부서: 생산팀과 기술 이전 협의, QA팀과 검증 프로세스 | 외부: 연구기관 및 대학과 공동연구'
  },
  HR: {
    promotionReason: '전사 디지털 전환 교육 프로그램 설계 및 실행으로 직원 만족도 85% 달성. 채용 프로세스 개선으로 우수 인재 확보',
    dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
    weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
    collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력'
  },
  Finance: {
    promotionReason: '예산 관리 자동화로 월 마감 기간 3일 단축. 재무 리스크 조기 경보 시스템 구축하여 손실 예방',
    dailyWorkflow: '오전 8:30 출근 → 9시 전일 재무 지표 확인 → 9:30 팀 회계 이슈 공유 → 10-12시 재무 분석 및 보고서 작성 → 오후 1-2시 예산 검토 회의 → 2-4시 각 부서 재무 지원 → 4-5시 감사 대응 → 5-6시 일일 마감 및 내일 우선순위 정리',
    weeklyRoutine: '월: 주간 재무 현황 분석 | 화: 예산 집행 점검 | 수: 부서별 재무 미팅 | 목: 리스크 관리 회의 | 금: 주간 재무 보고서 작성',
    collaboration: '팀 내부: SAP과 Teams으로 재무 데이터 공유, 일일 재무 브리핑 | 타 부서: 각 부서와 예산 협의, 경영진과 재무 보고 | 외부: 감사법인 및 금융기관과 정기 미팅'
  },
  IT: {
    promotionReason: '클라우드 마이그레이션 프로젝트 성공적 완료. 시스템 안정성 99.9% 달성하고 IT 비용 20% 절감',
    dailyWorkflow: '오전 9시 출근 → 9:30 시스템 모니터링 및 티켓 확인 → 10시 IT 헬프데스크 현황 점검 → 10:30-12시 프로젝트 진행 또는 장애 대응 → 오후 1-3시 시스템 개선 작업 → 3-4시 보안 점검 → 4-5시 사용자 교육 → 5-6시 일일 보고 및 당직 인수인계',
    weeklyRoutine: '월: 주간 시스템 점검 | 화: 프로젝트 진행 회의 | 수: 보안 패치 적용 | 목: 사용자 교육 | 금: 주간 IT 서비스 리포트',
    collaboration: '팀 내부: ServiceNow와 Slack으로 IT 이슈 공유, 일일 스크럼 | 타 부서: 각 부서 IT 담당자와 협업, 보안팀과 정기 점검 | 외부: 벤더 및 클라우드 서비스 제공업체와 협력'
  },
  Marketing: {
    promotionReason: '디지털 마케팅 전환으로 ROI 200% 향상. 데이터 기반 타겟팅 도입하여 전환율 35% 개선',
    dailyWorkflow: '오전 9시 출근 → 9:30 전일 캠페인 성과 확인 → 10시 팀 크리에이티브 리뷰 → 11-12시 콘텐츠 제작 감독 → 오후 1-3시 파트너사 미팅 → 3-4시 데이터 분석 → 4-5시 내일 캠페인 준비 → 5-6시 일일 리포트 작성',
    weeklyRoutine: '월: 주간 캠페인 기획 회의 | 화: 크리에이티브 리뷰 | 수: 성과 분석 | 목: 파트너 미팅 | 금: 차주 캠페인 준비',
    collaboration: '팀 내부: Notion과 Slack으로 캠페인 현황 공유, 일일 크리에이티브 리뷰 | 타 부서: 영업팀과 리드 공유, 제품팀과 마케팅 메시지 협의 | 외부: 에이전시 및 인플루언서와 협업'
  }
};

function fixPersona(fileContent: string, personaId: string, category: string): string {
  console.log(`  📝 ${personaId} (${category}) 수정 중...`);

  // 각 페르소나의 블록을 정규식으로 찾기 (더 정확한 패턴)
  const personaStartRegex = new RegExp(`(  \\{\\s*\\n\\s*id: '${personaId}',)`, 'g');
  const personaBlockRegex = new RegExp(
    `(  \\{\\s*\\n\\s*id: '${personaId}',.*?\\n  \\}(?=,|\\s*\\n  \\{|\\s*\\n\\];))`,
    'gs'
  );

  const personaMatch = fileContent.match(personaBlockRegex);
  if (!personaMatch) {
    console.log(`    ⚠️  ${personaId} 블록을 찾을 수 없음`);
    return fileContent;
  }

  let personaBlock = personaMatch[0];
  const originalBlock = personaBlock;

  // 1. age 추가 (없는 경우)
  if (!personaBlock.includes('\n    age:')) {
    const idNum = parseInt(personaId.substring(1));
    const age = 35 + Math.floor((idNum / 30) * 13);
    personaBlock = personaBlock.replace(
      /(\n\s*name: '[^']+',)(?!\n\s*age:)/,
      `$1\n    age: ${age},`
    );
  }

  // 2. promotionReason 추가 (없는 경우) - leaderProfile 안에
  if (!personaBlock.includes('promotionReason:')) {
    const data = CATEGORY_DATA[category] || CATEGORY_DATA['Operations'];
    personaBlock = personaBlock.replace(
      /(previousRole: '[^']+',)(?!\s*promotionReason:)/,
      `$1\n      promotionReason: '${data.promotionReason}',`
    );
  }

  // 3. seniorCount, juniorCount 추가 (없는 경우) - team 안에
  if (!personaBlock.includes('seniorCount:')) {
    // team size 찾기
    const sizeMatch = personaBlock.match(/size: (\d+),/);
    if (sizeMatch) {
      const teamSize = parseInt(sizeMatch[1]);
      const seniorCount = Math.floor(teamSize * 0.4); // 40%를 시니어로
      const juniorCount = teamSize - seniorCount;

      personaBlock = personaBlock.replace(
        /(size: \d+,)(?!\s*seniorCount:)/,
        `$1\n      seniorCount: ${seniorCount},\n      juniorCount: ${juniorCount},`
      );
    }
  }

  // 4. dailyWorkflow, weeklyRoutine, collaboration 추가 (없는 경우) - work 안에
  const data = CATEGORY_DATA[category] || CATEGORY_DATA['Operations'];

  if (!personaBlock.includes('dailyWorkflow:')) {
    // mainTasks 배열 끝 찾기 (더 정확한 패턴)
    personaBlock = personaBlock.replace(
      /(mainTasks: \[[^\]]*\],)(?!\s*dailyWorkflow:)/,
      `$1\n      dailyWorkflow: '${data.dailyWorkflow}',`
    );
  }

  if (!personaBlock.includes('weeklyRoutine:')) {
    // dailyWorkflow 다음 또는 mainTasks 다음에 추가
    if (personaBlock.includes('dailyWorkflow:')) {
      personaBlock = personaBlock.replace(
        /(dailyWorkflow: '[^']*',)(?!\s*weeklyRoutine:)/,
        `$1\n      weeklyRoutine: '${data.weeklyRoutine}',`
      );
    } else {
      personaBlock = personaBlock.replace(
        /(mainTasks: \[[^\]]*\],)/,
        `$1\n      weeklyRoutine: '${data.weeklyRoutine}',`
      );
    }
  }

  if (!personaBlock.includes('collaboration:')) {
    // weeklyRoutine 다음 또는 dailyWorkflow 다음에 추가
    if (personaBlock.includes('weeklyRoutine:')) {
      personaBlock = personaBlock.replace(
        /(weeklyRoutine: '[^']*',)(?!\s*collaboration:)/,
        `$1\n      collaboration: '${data.collaboration}',`
      );
    } else if (personaBlock.includes('dailyWorkflow:')) {
      personaBlock = personaBlock.replace(
        /(dailyWorkflow: '[^']*',)(?!\s*collaboration:)/,
        `$1\n      collaboration: '${data.collaboration}',`
      );
    } else {
      personaBlock = personaBlock.replace(
        /(mainTasks: \[[^\]]*\],)/,
        `$1\n      collaboration: '${data.collaboration}',`
      );
    }
  }

  // 원본 블록을 수정된 블록으로 교체
  fileContent = fileContent.replace(originalBlock, personaBlock);

  return fileContent;
}

async function main() {
  try {
    const filePath = join(__dirname, 'personas-v3.ts');
    let fileContent = readFileSync(filePath, 'utf-8');

    console.log('🚀 personas-v3.ts 완전 수정 시작...\n');

    // 각 간략 페르소나를 순차적으로 수정
    for (const persona of SIMPLE_PERSONAS) {
      fileContent = fixPersona(fileContent, persona.id, persona.category);
    }

    // 파일 저장
    writeFileSync(filePath, fileContent);
    console.log('\n💾 파일 저장 완료!');

    // 검증
    console.log('\n🔍 최종 검증...');
    const finalContent = readFileSync(filePath, 'utf-8');

    // 각 필드가 제대로 추가되었는지 확인
    let successCount = 0;
    for (const persona of SIMPLE_PERSONAS) {
      const personaBlockRegex = new RegExp(
        `  \\{\\s*\\n\\s*id: '${persona.id}',.*?\\n  \\}`,
        'gs'
      );
      const match = finalContent.match(personaBlockRegex);
      if (match) {
        const block = match[0];
        const hasAll =
          block.includes('age:') &&
          block.includes('promotionReason:') &&
          block.includes('seniorCount:') &&
          block.includes('juniorCount:') &&
          block.includes('dailyWorkflow:') &&
          block.includes('weeklyRoutine:') &&
          block.includes('collaboration:');

        if (hasAll) {
          successCount++;
          console.log(`  ✅ ${persona.id}: 모든 필드 완성`);
        } else {
          console.log(`  ⚠️  ${persona.id}: 일부 필드 누락`);
          if (!block.includes('age:')) console.log(`     - age 누락`);
          if (!block.includes('promotionReason:')) console.log(`     - promotionReason 누락`);
          if (!block.includes('seniorCount:')) console.log(`     - seniorCount 누락`);
          if (!block.includes('dailyWorkflow:')) console.log(`     - dailyWorkflow 누락`);
        }
      }
    }

    console.log(`\n✅ 완료: ${successCount}/${SIMPLE_PERSONAS.length} 페르소나 수정 완료`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

main();