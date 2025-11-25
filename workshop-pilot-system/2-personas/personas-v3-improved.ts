#!/usr/bin/env ts-node

/**
 * 실전 파일럿 테스트용 30명 페르소나 (v3-improved)
 * 개선사항:
 * - strongSteps, timePerceptionByStep, problemSteps 제거 (실제 워크샵 진행 후에만 알 수 있는 정보)
 * - 모든 페르소나에 누락된 필수 필드 추가
 * - 상세도 균일화
 */

export interface Persona {
  // 기본 정보
  id: string;
  name: string;
  age: number; // 30대 중반 ~ 40대 후반
  company: string;
  department: string;
  role: string;

  // 부서 카테고리
  category: 'Marketing' | 'Sales' | 'Operations' | 'R&D' | 'HR' | 'Finance' | 'IT' | 'Strategy';

  // 팀장 개인 프로필 (신임 팀장)
  leaderProfile: {
    yearsInRole: number; // 0.5~1.5년 (신임 팀장)
    previousRole: string; // 팀장 되기 전 역할
    promotionReason: string; // 팀장으로 승진한 이유
    leadershipStyle: string; // 리더십 스타일 간략 설명
  };

  // 팀 구성
  team: {
    size: number;
    seniorCount: number; // 시니어 인원
    juniorCount: number; // 주니어 인원
    composition: string; // 팀 구성원 역할
    digitalMaturity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; // 팀 전체의 디지털 성숙도
    maturityDistribution: string; // 팀원별 성숙도 분포
  };

  // 구체적인 업무
  work: {
    mainTasks: string[]; // 팀의 주요 업무 3-5가지
    dailyWorkflow: string; // 팀의 일상적인 업무 흐름 (아침 출근 후 ~ 퇴근까지)
    weeklyRoutine: string; // 주간 루틴 (회의, 보고, 리뷰 등)
    collaboration: string; // 팀 내/외부 협업 방식
    toolsUsed: string[]; // 현재 사용 중인 도구
    painPoints: string[]; // 신임 팀장으로서 느끼는 구체적인 어려움
    automationNeeds: string[]; // 자동화 필요 영역
    workStructure: {
      level: '비구조화' | '반구조화' | '고도구조화';
      description: string; // 구조화 수준 상세 설명
    };
  };

  // 워크샵 예상 행동 (팀장 개인) - 예측 데이터 제거
  expectedBehavior: {
    initialAttitude: '기대함' | '중립' | '걱정' | '회의적';
    concerns: string[]; // 팀장 본인의 워크샵 참여 우려사항
    dropoutRisk: number; // 0-100%
  };

  // 팀장 개인 특성
  personality: {
    patience: number; // 1-10, 팀장 개인의 인내심
    techSavvy: number; // 1-10, 팀장 개인의 기술 친화도
    changeResistance: 'low' | 'medium' | 'high'; // 팀장 개인의 변화 저항
    learningSpeed: 'slow' | 'medium' | 'fast'; // 팀장 개인의 학습 속도
  };
}

// 예시: 개선된 페르소나 템플릿을 먼저 생성
// 실제 데이터는 기존 personas-v3.ts에서 가져와서 보강해야 함

const PERSONA_TEMPLATE_EXAMPLE: Persona = {
  id: 'P004',
  name: '정민호',
  age: 38, // 추가
  company: 'SK이노베이션',
  department: 'B2B영업팀',
  role: '팀장',
  category: 'Sales',
  leaderProfile: {
    yearsInRole: 1.2, // 신임 팀장으로 조정
    previousRole: '시니어 영업 담당자 (7년 경력)',
    promotionReason: 'SK에너지 대상 연간 계약 3건 성사시켜 200억 매출 달성, 데이터 기반 영업 프로세스 도입 주도로 팀 전환율 15% 향상시켜 승진', // 추가
    leadershipStyle: '코칭형 리더십 추구하나 아직 팀원들 개별 역량 파악과 동기부여에 어려움. 주간 파이프라인 리뷰로 관리하려 하지만 15명 팀원 일일이 코칭하기 벅참'
  },
  team: {
    size: 15,
    seniorCount: 5, // 추가
    juniorCount: 10, // 추가
    composition: '팀장 1명 + 시니어 영업 담당자 3명(5-8년차) + 영업지원 2명(4년차) + 주니어 영업 8명(1-3년차) + 데이터 분석가 2명(3-5년차)',
    digitalMaturity: 'Advanced',
    maturityDistribution: 'Expert 2명(분석가) + Advanced 3명(시니어 영업) + Intermediate 7명 + Beginner 3명'
  },
  work: {
    mainTasks: [
      '대기업 및 공공기관 대상 배터리 소재 B2B 영업',
      'Salesforce CRM 기반 고객 관계 관리 및 파이프라인 추적',
      '분기별 영업 목표 800억원 달성을 위한 전략 수립',
      'RFP 대응 및 기술 제안서 작성 (월 평균 5건)',
      '계약 체결 후 고객사 기술팀과 협업하여 납품 프로세스 관리'
    ],
    dailyWorkflow: '오전 8:30 출근 → 9시 Salesforce에서 전날 영업 활동 확인 및 오늘 할일 정리 → 9:30 팀원들과 15분 스탠드업 미팅 → 10시-12시 고객 미팅 또는 제안서 작성 → 오후 1-3시 신규 리드 발굴 (LinkedIn, 뉴스 검색) → 3-5시 팀원 1:1 코칭 또는 내부 회의 → 5-6시 일일 실적 정리 및 내일 계획 → 6시 이후 긴급 고객 대응', // 추가
    weeklyRoutine: '월요일: 주간 영업 전략 회의 (2시간) | 화요일: 파이프라인 리뷰 (각 팀원 15분씩) | 수요일: 고객사 방문의 날 | 목요일: 제안서 검토 및 팀 교육 | 금요일: 주간 실적 보고서 작성 및 경영진 보고', // 추가
    collaboration: '팀 내부: Salesforce와 Slack으로 실시간 영업 현황 공유, 주 2회 대면 미팅 | 타 부서: 기술팀과 제품 스펙 협의 (주 1회), 재무팀과 계약 조건 검토 (건별) | 외부: 고객사 구매팀/기술팀과 이메일/전화/대면 미팅으로 소통', // 추가
    toolsUsed: ['Salesforce CRM', 'LinkedIn Sales Navigator', 'Zoom', 'PowerPoint', 'Excel', 'DocuSign'],
    painPoints: [
      '신규 리드 발굴을 LinkedIn과 뉴스 검색으로 수작업하느라 팀원 1인당 주 8시간 소요. 실제 고객 미팅 시간이 전체 업무의 40%밖에 안 됨',
      '제안서 작성 시 기존 템플릿을 매번 수동으로 고객사에 맞게 수정하느라 건당 4시간 소요. 팀원들이 제안서 작성에 주당 12시간씩 쓰고 있음',
      '시니어 영업 담당자들의 노하우가 문서화되지 않아 주니어들이 매번 같은 실수 반복. 신입 온보딩에 3개월 이상 걸림',
      '15명 팀원의 일일 활동을 파악하려면 Salesforce 리포트를 30분간 일일이 확인해야 해서 적시에 코칭 못함',
      '경쟁사 동향과 시장 정보를 팀원들이 각자 수집해서 중복 작업 발생하고 중요 정보 놓치는 경우 많음'
    ],
    automationNeeds: [
      'AI 기반 리드 스코어링으로 유망 고객 자동 선별 및 우선순위 추천',
      '고객사별 맞춤 제안서 자동 생성 (기존 성공 사례 기반)',
      '영업 활동 자동 기록 및 이상 징후 실시간 알림',
      '경쟁사 및 시장 동향 자동 수집 및 주간 브리핑 생성'
    ],
    workStructure: {
      level: '반구조화',
      description: '영업 단계(리드-기회-제안-협상-계약)는 CRM으로 관리하나, 각 단계별 세부 액션은 팀원 재량. 주간 파이프라인 리뷰는 체계적이나 일일 협업은 비정형적. 베스트 프랙티스 공유 체계 미흡. 고객사별 대응 전략이 담당자 머릿속에만 있음.'
    }
  },
  expectedBehavior: {
    initialAttitude: '중립',
    concerns: [
      '신임 팀장으로서 15명 팀원을 이끌어야 하는데, 워크샵에서 배운 새로운 방식을 도입했다가 시니어들이 반발하면 리더십이 흔들릴까 걱정',
      'B2B 영업은 관계와 신뢰가 핵심인데 AI 자동화가 고객에게 성의 없다는 인상을 줄까봐 우려됨',
      '팀원 수준이 Expert부터 Beginner까지 다양한데, 워크샵 내용을 어느 수준에 맞춰 전달해야 할지 막막함'
    ],
    dropoutRisk: 15
  },
  personality: {
    patience: 7,
    techSavvy: 7,
    changeResistance: 'medium',
    learningSpeed: 'fast'
  }
};

// 나머지 29명의 페르소나도 같은 수준으로 보강 필요
// TODO: 기존 personas-v3.ts에서 데이터를 가져와 위 템플릿 수준으로 보강

export const PERSONAS_V3_IMPROVED: Persona[] = [
  // 여기에 30명의 개선된 페르소나 데이터 추가
];