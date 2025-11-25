#!/usr/bin/env ts-node

/**
 * 실전 파일럿 테스트용 30명 페르소나 (v3)
 * - 팀장 개인 교육 (팀원 불참, 팀 상황 고려)
 * - 팀 단위 디지털 성숙도
 * - 업무 구조화 정도
 * - 팀장 개인 특성
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
    biggestChallenge?: string; // 팀장으로서 가장 큰 도전
    hiddenStruggles?: string[]; // 겉으로 드러나지 않는 고충들
  };

  // 팀 구성
  team: {
    size: number;
    seniorCount: number; // 시니어 인원
    juniorCount: number; // 주니어 인원
    composition: string; // 팀 구성원 역할
    digitalMaturity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; // 팀 전체의 디지털 성숙도
    maturityDistribution: string; // 팀원별 성숙도 분포
    teamDynamics?: string; // 팀 내부 역학 관계
    resistanceFactors?: string[]; // 변화 저항 요소들
  };

  // 구체적인 업무
  work: {
    mainTasks: string[]; // 팀의 주요 업무 3-5가지
    dailyWorkflow: string; // 팀의 일상적인 업무 흐름 (아침 출근 후 ~ 퇴근까지 어떻게 일하는지)
    weeklyRoutine: string; // 주간 루틴 (회의, 보고, 리뷰 등)
    collaboration: string; // 팀 내/외부 협업 방식
    toolsUsed: string[]; // 현재 사용 중인 도구
    painPoints: string[]; // 신임 팀장으로서 느끼는 구체적인 어려움
    automationNeeds: string[]; // 자동화 필요 영역
    workStructure: {
      level: '비구조화' | '반구조화' | '고도구조화';
      description: string; // 구조화 수준 상세 설명
    };
    realTimeExample?: string; // 실제 업무 상황 예시
    typicalFireDrills?: string[]; // 빈번한 긴급 상황들
  };

  // 워크샵 심리 (팀장의 내면)
  workshopPsychology?: {
    initialAttitude: '기대함' | '중립' | '걱정' | '회의적';
    hiddenMotivations: string[]; // 겉으로 드러나지 않는 참여 동기
    deepConcerns: string[]; // 깊은 우려사항
    successMetrics: string[]; // 성공 기준
    dropoutRisk: number; // 0-100%
    dropoutTriggers: string[]; // 이탈 트리거
  };

  // 워크샵 예상 행동 (팀장 개인)
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
    stressLevel?: number; // 1-10, 스트레스 수준
    confidenceLevel?: number; // 1-10, 자신감 수준
  };
}

export const PERSONAS_V3: Persona[] = [
  // ==================== MARKETING (3명) ====================
  {
    id: 'P001',
    name: '김지훈',
    age: 37,
    company: 'SK플래닛',
    department: '디지털마케팅팀',
    role: '팀장',
    category: 'Marketing',
    leaderProfile: {
      yearsInRole: 1.0, // 신임 팀장 (1년차)
      previousRole: '시니어 캠페인 기획자 (6년 경력)',
      promotionReason: '11번가 리브랜딩 캠페인 성공으로 매출 23% 증가, 데이터 기반 의사결정 능력 인정받아 승진',
      leadershipStyle: '데이터를 보여주며 설득하는 스타일. 아직 팀원 관리와 우선순위 조율에 어려움을 느낌.'
    },
    team: {
      size: 9,
      seniorCount: 4, // 시니어 4명 (본인보다 연차 높은 분석가 포함)
      juniorCount: 5, // 주니어 5명
      composition: '팀장 1명 + 시니어 캠페인 기획자 2명(8년차, 5년차) + 시니어 데이터 분석가 1명(10년차) + 시니어 디자이너 1명(7년차) + 주니어 콘텐츠 크리에이터 3명(2-3년차) + 주니어 퍼포먼스 마케터 2명(1-2년차)',
      digitalMaturity: 'Advanced',
      maturityDistribution: '시니어 분석가(Expert) + 시니어 기획자 2명(Advanced) + 시니어 디자이너(Advanced) + 주니어 5명(Intermediate)'
    },
    work: {
      mainTasks: [
        '11번가 앱 푸시/배너 캠페인 기획 및 실행 (월 평균 8개 캠페인 동시 진행)',
        '카테고리별(패션/뷰티/식품/가전) 타겟 고객 세그먼트 분석 및 맞춤 메시지 설계',
        'CRM 데이터 기반 재구매 유도 프로모션 설계',
        '주간 캠페인 성과 리포트 작성 및 경영진 보고',
        '외부 광고 대행사(네이버, 카카오, 메타) 커뮤니케이션 및 예산 관리'
      ],
      dailyWorkflow: '오전 9시 출근 → 전날 캠페인 성과 확인(GA4, Braze 대시보드) → 10시 데일리 스탠드업(15분, 각자 오늘 할 일 공유) → 오전에는 시니어들이 캠페인 전략 회의, 주니어들은 배너 제작/카피 작성 → 점심 후 1시부터 팀장이 기획서 검토 및 피드백(하루 평균 3-4건) → 오후 3시쯤 외부 대행사와 화상 미팅 → 오후 4-6시 급한 캠페인 수정 요청 처리(마케팅 본부장이나 MD팀에서 요청 들어옴) → 퇴근 전 내일 일정 정리',
      weeklyRoutine: '월요일 오전: 주간 캠페인 계획 회의(1시간) / 화요일: 캠페인별 크리에이티브 리뷰 / 수요일 오후: 마케팅 본부 전체 회의 참석 및 주간 성과 보고 / 목요일: 시니어들과 1:1 면담(각 30분) / 금요일: 주니어들 그룹 피드백 세션(1시간), 다음주 캠페인 최종 승인',
      collaboration: '팀 내에서는 Slack으로 실시간 소통. 캠페인별로 Notion 페이지 만들어서 진행상황 공유. 외부 대행사와는 이메일+주 1회 화상미팅. MD팀/상품기획팀과는 수시로 카톡 단톡방에서 협의. 디자인팀에 배너 요청할 때는 Jira 티켓 발행.',
      toolsUsed: ['Google Analytics 4', 'Braze(CRM)', 'Facebook Ads Manager', 'Google Ads', 'Figma', 'Notion', 'Slack', 'Jira', 'Excel', 'PowerPoint'],
      painPoints: [
        '시니어 분석가(10년차)가 본인보다 연차가 높아서 데이터 해석에 이견이 있을 때 설득하기 어렵고 위축됨',
        '8개 캠페인이 동시에 돌아가는데 우선순위를 정하지 못해 팀원들이 혼란스러워함. 본부장이 갑자기 급한 캠페인 요청하면 기존 계획이 다 틀어짐',
        '주니어 크리에이터 3명이 같은 유형 작업을 반복하는데 서로 작업 방식이 달라서 품질이 들쭉날쭉. 표준 프로세스를 만들어야 하는데 시간이 없음',
        '캠페인 성과 데이터를 GA4, Braze, 광고 대행사 리포트 등에서 수작업으로 취합해서 엑셀로 정리하는데 매주 금요일 오후 4시간 소요',
        '본부장한테 보고할 때 "이 캠페인이 왜 잘 됐는지" 근거 자료 만드는 게 힘듦. 시니어 분석가한테 부탁하면 "제 업무가 아닌데요" 같은 반응'
      ],
      automationNeeds: [
        '여러 채널 성과 데이터를 자동으로 통합해서 한눈에 보여주는 대시보드',
        '주니어들이 배너 만들 때 쓸 수 있는 템플릿과 체크리스트',
        '캠페인 우선순위 정하는 기준 (ROI, 공수, 긴급도 등을 수치화)'
      ],
      workStructure: {
        level: '반구조화',
        description: '캠페인 기획 → 디자인 → 검수 → 집행 프로세스는 있지만 문서화되지 않음. 팀원마다 일하는 방식이 다름. Notion에 캠페인 현황은 기록하지만 누가 언제까지 뭘 해야 하는지 명확하지 않음. 급한 요청이 들어오면 프로세스 무시하고 즉시 처리. 회의록은 작성하지만 액션 아이템 후속 관리는 안 됨.'
      }
    },
    expectedBehavior: {
      initialAttitude: '기대함',
      concerns: [
        '신임 팀장이라 팀 관리 경험이 부족한데, 워크샵에서 배운 걸 바로 적용했다가 시니어 팀원들이 "또 새로운 거 하냐"며 반발하면 어떡하지',
        '워크샵이 3시간인데 우리 팀 복잡한 상황을 다 담을 수 있을까? 8개 캠페인 돌아가는 걸 어떻게 정리하지',
        '디지털 도구는 잘 쓰는 편인데, AI 활용은 아직 초보 수준. 다른 팀장들이 잘하면 나만 못 따라가는 것 같아 보일까봐 걱정'
      ],
      dropoutRisk: 15,
    },
    personality: {
      patience: 6, // 신임 팀장이라 조급함
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P002',
    name: '박서연',
    age: 35,
    company: 'SK텔레콤',
    department: '기업영업팀',
    role: '팀장',
    category: 'Sales',
    leaderProfile: {
      yearsInRole: 0.8,
      previousRole: 'B2B 영업 시니어 (5년 경력)',
      promotionReason: '대기업 고객 3곳 신규 계약 성공 (연 매출 120억 기여), 고객 만족도 평가 1위로 승진',
      leadershipStyle: '고객 최우선, 팀원 간 정보 공유 중시. 하지만 영업 노하우를 체계화하는 데는 어려움을 느낌.'
    },
    team: {
      size: 11,
      seniorCount: 5, // 시니어 5명 (영업 경력 7-12년)
      juniorCount: 6, // 주니어 6명 (1-3년차)
      composition: '팀장 1명 + 시니어 영업담당 5명(대기업 담당, 7-12년차) + 주니어 영업담당 4명(중견기업 담당, 1-3년차) + 영업지원 2명(제안서/계약서 작성, 2년차)',
      digitalMaturity: 'Intermediate',
      maturityDistribution: '시니어 5명(Intermediate, 영업 경험은 많으나 디지털 도구 활용 낮음) + 주니어 6명(Intermediate~Advanced, 신세대라 도구는 잘 씀)'
    },
    work: {
      mainTasks: [
        '대기업/중견기업 B2B 5G 인프라, 클라우드, IoT 솔루션 영업',
        '월 평균 15-20개 제안서 작성 및 PT (팀 전체 합산)',
        '고객사 니즈 분석 및 맞춤 솔루션 설계',
        '계약 협상 및 사후 관리 (유지보수 계약 갱신)',
        '주간 영업 파이프라인 관리 및 본부 보고'
      ],
      dailyWorkflow: '오전 9시 출근 → 시니어들은 고객사 방문 준비 또는 외근, 주니어들은 사무실에서 제안서 작성 → 10시 팀장이 전날 영업 현황 확인 (CRM 시스템 + 팀원 구두 보고) → 오전 11시쯤 긴급 제안 요청 들어오면 팀장이 직접 초안 작성하거나 주니어에게 급하게 배정 → 점심 후 1-3시 고객사 미팅 (주 3-4회, 팀장 동행 또는 시니어 단독) → 오후 3-5시 영업지원팀이 계약서 검토, 주니어들은 고객 follow-up 전화 → 오후 5-6시 팀장이 제안서 최종 검토 및 수정 지시 → 저녁 7-8시 퇴근 (급한 제안 있으면 9-10시까지)',
      weeklyRoutine: '월요일 오전: 주간 영업 목표 설정 회의(1시간) + 개인별 파이프라인 점검 / 화요일: 시니어 5명과 개별 고객사 전략 논의 (각 20분) / 수요일 오후: 영업본부 주간 회의 참석, 팀 실적 보고 / 목요일: 주니어 6명 그룹 코칭 (제안서 작성법, 고객 응대 스킬) / 금요일: 주간 실적 정리 및 다음주 우선순위 고객사 선정',
      collaboration: '팀 내에서는 카카오톡 단톡방 + CRM 시스템(Salesforce)으로 고객 정보 공유. 하지만 시니어들은 카톡만 보고 CRM 입력 안 함. 제안서는 각자 개인 PC에 저장, Google Drive에 공유하지만 파일명이 중구난방. 기술팀(네트워크/클라우드)과 협업할 때는 이메일로 요청 → 회신 느림. 본부장한테 보고할 때는 팀장이 PPT 직접 작성.',
      toolsUsed: ['Salesforce(CRM)', 'PowerPoint', 'Excel', 'Google Drive', 'Zoom', '카카오톡', 'Outlook'],
      painPoints: [
        '시니어 5명이 CRM 시스템에 고객 정보를 제대로 입력하지 않아서, 팀장이 실제 영업 현황을 파악하려면 일일이 물어봐야 함. "제가 다 머릿속에 있어요" 라고 하는데 인수인계가 안됨',
        '제안서 템플릿이 없어서 팀원마다 제각각. 주니어가 만든 제안서를 팀장이 처음부터 다시 만드는 경우 많음 (주당 10시간 소요)',
        '고객사 미팅 후 follow-up을 누가 언제 해야 하는지 애매함. 시니어는 "제가 알아서 해요"라고 하고, 주니어는 눈치만 봄. 결국 팀장이 리마인드하는데 놓치는 고객 발생',
        '월말 실적 집계할 때 각자 엑셀로 보고해서 팀장이 수작업으로 합산 (3-4시간)',
        '시니어들끼리는 경쟁 의식 때문에 고객 정보를 공유 안 함. 같은 고객사에 중복 접촉하는 경우도 있음'
      ],
      automationNeeds: [
        'CRM 입력을 강제하거나 자동화하는 방법 (영업 미팅 후 자동 리마인드)',
        '제안서 자동 생성 템플릿 (고객사 정보 입력하면 80% 완성)',
        '고객 follow-up 알림 시스템 (담당자별로 자동 알림)'
      ],
      workStructure: {
        level: '비구조화',
        description: '영업 프로세스는 "고객 발굴 → 제안 → 계약 → 사후관리" 단계가 있지만, 실제로는 시니어들이 각자 스타일대로 진행. 주니어는 시니어 따라하는데 배우는 방식이 제각각. 제안서 양식도 통일 안 됨. 팀장이 "이렇게 하자"고 해도 시니어들이 "저는 제 방식이 있어요"라고 하면 더 이상 못 밀어붙임. CRM 시스템은 있지만 실제로는 카톡과 구두 보고가 주.'
      }
    },
    expectedBehavior: {
      initialAttitude: '기대함',
      concerns: [
        '시니어 5명이 "저는 이미 제 방식이 있다"며 새로운 프로세스 도입에 저항할까봐 걱정. 워크샵에서 배운 걸 적용하려고 하면 "팀장님, 영업은 그렇게 안 됩니다" 같은 말 들을까봐',
        '영업은 사람마다 스타일이 다른데, 표준화/자동화가 가능할까? 오히려 창의성을 죽이는 건 아닐까',
        '워크샵이 제조/IT 중심이면 영업에는 안 맞을 것 같은데...'
      ],
      dropoutRisk: 20,
    },
    personality: {
      patience: 7,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  {
    id: 'P003',
    name: '이현수',
    age: 42,
    company: 'SK하이닉스',
    department: '생산관리팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 1.2,
      previousRole: '생산 공정 엔지니어 (9년 경력)',
      promotionReason: '반도체 수율 개선 프로젝트 성공 (불량률 3.2% → 1.8% 감소), 데이터 분석 역량 인정받아 팀장 승진',
      leadershipStyle: '데이터와 현장을 모두 중시. 하지만 3교대 팀원들 관리와 돌발 상황 대응에 어려움.'
    },
    team: {
      size: 24,
      seniorCount: 8, // 시니어 8명 (10-20년차 베테랑 포함)
      juniorCount: 16, // 주니어 16명
      composition: '팀장 1명 + 시니어 현장 관리자 8명(각 라인별 책임자, 10-20년차) + 주니어 생산 기사 14명(3교대 각 4-5명, 1-5년차) + 품질 검사원 2명(3년차)',
      digitalMaturity: 'Beginner',
      maturityDistribution: '시니어 8명(Beginner, 현장 경험 많지만 PC/시스템 취약) + 주니어 16명(Beginner~Intermediate, 젊지만 제조 현장이라 디지털 도구 접근 제한적)'
    },
    work: {
      mainTasks: [
        '반도체 웨이퍼 생산 라인 4개 라인 운영 관리 (일 생산량 1만 장)',
        '3교대 근무자 스케줄링 및 인력 배치 (주간 7-3, 저녁 3-11, 야간 11-7)',
        '생산 공정 모니터링 및 이상 징후 대응 (설비 다운타임 최소화)',
        '주간/월간 생산 실적 집계 및 공장장 보고',
        '안전사고 예방 활동 및 5S 활동 (정리정돈, 청소, 청결, 습관화)'
      ],
      dailyWorkflow: '오전 7시 출근 → 야간조 인수인계 (10분, 전날 생산량/이슈 확인) → 주간조 조회 (7:10, 오늘 목표 공유) → 8-11시 라인별 생산 현황 모니터링 (MES 시스템 + 현장 순회) → 11시 공장장 일일 보고 (생산량, 불량률, 설비 가동률) → 점심 후 1-3시 급한 설비 트러블 대응 또는 품질 이슈 회의 → 3시 저녁조 인수인계 → 3:30-5시 팀장실에서 주간 생산 계획 조정, 인력 스케줄 검토 → 5-6시 본부 회의 또는 협력사 미팅 → 저녁 7시 퇴근 (단, 급한 설비 문제 발생 시 야간까지 대기)',
      weeklyRoutine: '월요일 오전: 주간 생산 목표 회의(공장장 주재) + 라인별 목표 하달 / 화요일: 시니어 관리자 8명과 라인별 현황 점검 (각 15분) / 수요일: 안전 점검의 날 (오전 2시간, 현장 안전 라운딩) / 목요일: 설비팀/품질팀과 협업 회의 (생산 이슈 해결) / 금요일: 주간 생산 실적 정리 및 차주 계획 수립, 3교대 전 조장 회의 (각 교대 대표)',
      collaboration: '현장에서는 무전기 + 카톡으로 실시간 소통. MES(제조실행시스템)로 생산 데이터 기록하지만 시니어들은 수기 장부도 병행. 설비 고장 시 설비팀에 전화 요청 → 출동까지 평균 30분 소요. 품질 이슈 발생하면 품질팀과 현장 미팅 (즉석 대응). 본부 보고는 팀장이 직접 PPT 작성 (생산량, 불량률, 가동률 등).',
      toolsUsed: ['MES(제조실행시스템)', 'Excel', 'PowerPoint', '무전기', '카카오톡', 'Outlook'],
      painPoints: [
        '3교대 조장 8명 중 2명이 본인보다 연차가 높음 (15년차, 20년차). 생산 방식 바꾸자고 하면 "우리는 원래 이렇게 했다"며 저항. 신임 팀장이라 강하게 못 나감',
        '야간조에서 문제 생기면 새벽에 전화 옴. 팀장 혼자 판단해야 하는데 현장 상황을 정확히 모를 때가 많음. 조장한테 물어보면 "팀장님이 결정하세요" 라고만 함',
        '생산 데이터가 MES, 엑셀, 수기 장부에 다 흩어져 있음. 주간 보고서 만들 때 데이터 취합에 금요일 오후 5시간 걸림',
        '설비 고장 예측이 안 됨. 갑자기 라인 멈추면 그제서야 설비팀 부름. 사후 대응만 반복',
        '주니어 14명 교육을 시니어 조장들한테 맡기는데, 조장마다 가르치는 방식이 달라서 주니어들 혼란. 표준 교육 자료가 없음'
      ],
      automationNeeds: [
        '설비 이상 징후 자동 감지 시스템 (AI 예측 정비)',
        '3교대 생산 데이터 자동 통합 대시보드 (실시간 현황 파악)',
        '표준 작업 지침서 디지털화 및 교육 자동화'
      ],
      workStructure: {
        level: '반구조화',
        description: '생산 공정 자체는 표준화되어 있지만, 돌발 상황 대응은 비표준. 조장들이 각자 경험으로 문제 해결. MES 시스템 있지만 실제로는 조장들의 "감"에 의존. 인수인계도 구두로만 하고 기록 안 함. 주간 회의는 있지만 액션 아이템 follow-up 안 됨.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '제조 현장은 3교대 24시간 돌아가는데, 워크샵에서 배운 걸 어떻게 현장에 적용하지? 야간조까지 교육할 수 없는데',
        '시니어 조장들이 "우리는 이렇게 해왔다"며 새로운 방식 거부하면? 신임 팀장이라 밀어붙이기 어려움',
        '워크샵이 사무직 중심이면 제조 현장 특성 반영 안 될 것 같음'
      ],
      dropoutRisk: 35,
    },
    personality: {
      patience: 5,
      techSavvy: 4,
      changeResistance: 'high',
      learningSpeed: 'slow'
    }
  },

  // ==================== SALES (2명) ====================
  {
    id: 'P004',
    name: '정민호',
    age: 36,
    company: 'SK이노베이션',
    department: 'B2B영업팀',
    role: '팀장',
    category: 'Sales',
    leaderProfile: {
      yearsInRole: 4,
      previousRole: '시니어 영업 담당자',
      promotionReason: '핵심 고객사 3곳과 장기 계약 체결하여 안정적 매출 기반 확보. 주니어 영업사원 멘토링으로 팀 역량 향상 주도',
      leadershipStyle: '코칭형, 주간 파이프라인 리뷰, 데이터 기반 목표 설정'
    },
    team: {
      size: 15,
      seniorCount: 6,
      juniorCount: 9,
      composition: '팀장 1명 + 영업 담당자 10명 + 영업지원 2명 + 데이터 분석가 2명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Expert 2명(분석가) + Advanced 3명(시니어 영업) + Intermediate 7명 + Beginner 3명'
    },
    work: {
      mainTasks: [
        '대기업 및 공공기관 대상 신규 영업',
        'CRM 기반 고객 관계 관리',
        '영업 파이프라인 관리 및 예측',
        '제안서 작성 및 프레젠테이션',
        '계약 체결 및 사후관리'
      ],
      dailyWorkflow: '오전 8:30 출근 → 9시 CRM에서 영업 현황 확인 → 9:30 팀 스탠드업 미팅(15분) → 10-12시 고객 미팅 또는 제안서 작성 → 오후 1-3시 신규 리드 발굴 및 콜드콜 → 3-5시 팀원 1:1 코칭 → 5-6시 일일 실적 정리 및 보고서 작성 → 긴급 고객 대응',
      weeklyRoutine: '월: 주간 영업 전략 회의(2시간) | 화: 파이프라인 리뷰 | 수: 고객사 방문의 날 | 목: 제안서 검토 및 팀 교육 | 금: 주간 실적 보고 및 차주 계획',
      collaboration: '팀 내부: CRM과 Slack으로 실시간 영업 현황 공유, 주 2회 대면 회의 | 타 부서: 기술팀과 제품 스펙 협의(주 1회), 재무팀과 계약 조건 검토 | 외부: 고객사와 정기 미팅 및 이메일/화상회의',
      toolsUsed: ['Salesforce CRM', 'LinkedIn Sales Navigator', 'Zoom', 'PowerPoint', 'Excel', 'DocuSign'],
      painPoints: [
        '신규 리드 발굴을 팀원들이 수작업으로 하느라 영업 시간 부족',
        '제안서 작성에 팀원들 시간의 30%가 소모되어 실제 영업 활동 부족',
        '팀원별 영업 노하우가 개인에게만 축적되고 팀 전체에 공유 안됨'
      ],
      automationNeeds: [
        'AI 기반 리드 스코어링 및 우선순위 추천',
        '고객사 정보 자동 수집 및 요약',
        '제안서 템플릿 자동 생성 (고객 맞춤)'
      ],
      workStructure: {
        level: '반구조화',
        description: '영업 단계는 CRM으로 관리하나, 각 단계별 세부 액션은 팀원 재량. 주간 파이프라인 리뷰는 체계적이나 일일 협업은 비정형적. 베스트 프랙티스 공유 체계 미흡.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'B2B 영업은 관계 기반인데 자동화 도입이 고객에게 부정적 인상을 줄까',
        '팀원 15명 수준이 다양한데 일괄 적용이 가능할지',
        '워크샵 후 팀에 돌아가서 실행 계획을 세우기가 막막할 것 같음'
      ],
      dropoutRisk: 15,
    },
    personality: {
      patience: 7,
      techSavvy: 7,
      changeResistance: 'medium',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P005',
    name: '최유진',
    age: 37,
    company: 'SK네트웍스',
    department: '리테일영업팀',
    role: '팀장',
    category: 'Sales',
    leaderProfile: {
      yearsInRole: 6,
      previousRole: '지역 영업 담당자',
      promotionReason: '전년 대비 매출 35% 성장 달성하여 팀 내 최고 실적 기록. 신규 고객 개척 프로세스 체계화하여 팀 전체 성과 향상에 기여',
      leadershipStyle: '현장 중심, 월 1회 전국 담당자 회의, 실적 기반 보상'
    },
    team: {
      size: 20,
      seniorCount: 8,
      juniorCount: 12,
      composition: '팀장 1명 + 지역별 영업 담당자 15명 + 영업지원 2명 + 재고관리 2명',
      digitalMaturity: 'Beginner',
      maturityDistribution: 'Intermediate 3명(팀장, 지원) + Beginner 17명(현장 영업)'
    },
    work: {
      mainTasks: [
        '전국 200개 매장 방문 영업',
        '재고 현황 확인 및 발주 지원',
        '프로모션 실행 및 성과 확인',
        '매장별 매출 데이터 수집 및 보고',
        '신제품 교육 및 런칭 지원'
      ],
      dailyWorkflow: '오전 8:30 출근 → 9시 CRM에서 영업 현황 확인 → 9:30 팀 스탠드업 미팅(15분) → 10-12시 고객 미팅 또는 제안서 작성 → 오후 1-3시 신규 리드 발굴 및 콜드콜 → 3-5시 팀원 1:1 코칭 → 5-6시 일일 실적 정리 및 보고서 작성 → 긴급 고객 대응',
      weeklyRoutine: '월: 주간 영업 전략 회의(2시간) | 화: 파이프라인 리뷰 | 수: 고객사 방문의 날 | 목: 제안서 검토 및 팀 교육 | 금: 주간 실적 보고 및 차주 계획',
      collaboration: '팀 내부: CRM과 Slack으로 실시간 영업 현황 공유, 주 2회 대면 회의 | 타 부서: 기술팀과 제품 스펙 협의(주 1회), 재무팀과 계약 조건 검토 | 외부: 고객사와 정기 미팅 및 이메일/화상회의',
      toolsUsed: ['Excel', '사내 재고관리 시스템', '전화', '이메일', 'KakaoTalk'],
      painPoints: [
        '전국 흩어진 팀원들과 실시간 소통이 어려워 문제 대응이 늦음',
        '매장별 데이터를 팀원들이 전화로 보고해서 집계에 하루 종일 걸림',
        '팀원들이 디지털 도구에 익숙하지 않아 새로운 시스템 도입 시 저항이 큼'
      ],
      automationNeeds: [
        '매장별 실시간 재고/매출 대시보드',
        '자동 발주 알림 시스템',
        '프로모션 성과 자동 집계 및 리포팅'
      ],
      workStructure: {
        level: '비구조화',
        description: '현장 중심이라 프로세스 최소화. 지역별 담당자가 재량껏 운영. 월 1회 회의로 실적 공유하나 일상 업무는 비정형적. 노하우가 개인에게만 축적.'
      }
    },
    expectedBehavior: {
      initialAttitude: '회의적',
      concerns: [
        '현장 영업 중심인데 디지털 도구가 오히려 팀원들에게 부담만 될 것 같음',
        '팀원 대부분이 디지털 미숙인데 내가 배워서 전파하기 어려울 듯',
        '전국에 흩어진 팀원들을 어떻게 변화시킬지 막막함'
      ],
      dropoutRisk: 40,
    },
    personality: {
      patience: 4,
      techSavvy: 3,
      changeResistance: 'high',
      learningSpeed: 'slow'
    }
  },

  // ==================== OPERATIONS (5명) ====================
  {
    id: 'P006',
    name: '윤재현',
    age: 37,
    company: 'SK하이닉스',
    department: '반도체생산팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 7,
      previousRole: '공정 엔지니어',
      promotionReason: '공급망 최적화로 재고 회전율 30% 향상. 데이터 분석 기반 의사결정 도입하여 운영 혁신 주도',
      leadershipStyle: '안정 중심, 데이터 기반 의사결정, 일일 생산 회의'
    },
    team: {
      size: 25,
      seniorCount: 10,
      juniorCount: 15,
      composition: '팀장 1명 + 공정 엔지니어 5명 + 생산 관리자 10명 + 품질 검사원 7명 + 데이터 분석가 2명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 7명(엔지니어, 분석가) + Intermediate 8명 + Beginner 10명(현장)'
    },
    work: {
      mainTasks: [
        '24시간 생산 라인 운영 및 모니터링',
        '공정 불량률 분석 및 개선',
        '설비 가동률 최적화',
        '일일 생산량 목표 관리',
        '품질 검사 데이터 수집 및 보고'
      ],
      dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
      weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
      collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅',
      toolsUsed: ['MES(제조실행시스템)', 'SAP', 'Excel', '공정모니터링 시스템', 'Minitab'],
      painPoints: [
        '공정별 데이터가 분산되어 통합 현황 파악에 매일 2시간 소요',
        '불량 원인 분석을 엔지니어들에게 맡기는데 수작업이라 시간 오래 걸림',
        '현장 팀원 10명이 디지털 도구 미숙해서 신규 시스템 교육이 어려움'
      ],
      automationNeeds: [
        'AI 기반 설비 이상 징후 예측',
        '불량 원인 자동 분석 및 개선안 제시',
        '생산 데이터 실시간 통합 대시보드'
      ],
      workStructure: {
        level: '고도구조화',
        description: '24시간 교대 근무로 역할 명확. 일일 생산 목표와 절차 문서화. 공정별 체크리스트 존재. 정기 회의와 보고 체계 확립. 단, 데이터 통합은 수작업.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '생산 현장 특성상 워크샵 내용이 우리 업무에 맞을지 불확실',
        '팀원 25명 중 절반이 디지털 미숙한데 내가 배운걸 어떻게 전달할지',
        '24시간 운영이라 변화 도입 시 리스크가 커서 신중해야 함'
      ],
      dropoutRisk: 25,
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  {
    id: 'P007',
    name: '강민지',
    age: 38,
    company: 'SK에너지',
    department: '물류관리팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 3,
      previousRole: '물류 기획자',
      promotionReason: '공급망 최적화로 재고 회전율 30% 향상. 데이터 분석 기반 의사결정 도입하여 운영 혁신 주도',
      leadershipStyle: '효율 중심, 주간 성과 리뷰, 시스템 개선 적극 추진'
    },
    team: {
      size: 18,
      seniorCount: 7,
      juniorCount: 11,
      composition: '팀장 1명 + 물류 기획자 3명 + 재고 담당자 5명 + 운송 관리자 7명 + 시스템 관리자 2명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Expert 2명(시스템) + Advanced 6명 + Intermediate 7명 + Beginner 3명'
    },
    work: {
      mainTasks: [
        '전국 15개 물류센터 재고 통합 관리',
        '운송 스케줄 최적화',
        '재고 회전율 분석 및 개선',
        '긴급 발주 대응',
        '물류 비용 절감 프로젝트'
      ],
      dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
      weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
      collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅',
      toolsUsed: ['WMS(창고관리시스템)', 'TMS(운송관리시스템)', 'SAP', 'Excel', 'Tableau'],
      painPoints: [
        '물류센터별 재고 데이터 동기화가 하루 1회라 긴급 상황 대응 늦음',
        '운송 경로 최적화를 수동으로 계산하느라 팀원들 야근 잦음',
        '여러 시스템 사용 중인데 통합이 안되어 팀원들이 혼란스러워 함'
      ],
      automationNeeds: [
        '실시간 재고 통합 모니터링',
        'AI 기반 운송 경로 자동 최적화',
        '수요 예측 기반 자동 발주 시스템'
      ],
      workStructure: {
        level: '고도구조화',
        description: '물류센터별, 업무별 역할 명확. WMS/TMS로 프로세스 대부분 시스템화. 주간 성과 리뷰와 월간 개선 회의 정례화. 긴급 대응 프로토콜 문서화.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '이미 여러 시스템 쓰는데 또 새로운 도구 추가하면 팀원들 혼란스러울 듯',
        '워크샵이 우리 팀 실시간 최적화 니즈를 다룰지 의문',
        '배운 내용을 실제 물류 시스템에 어떻게 연동할지 기술적으로 어려울 듯'
      ],
      dropoutRisk: 15,
    },
    personality: {
      patience: 7,
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P008',
    name: '이동훈',
    age: 38,
    company: 'SK실트론',
    department: '품질관리팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 5,
      previousRole: '품질 엔지니어',
      promotionReason: '생산 효율성 개선 프로젝트로 불량률 20% 감소 달성. 크로스펑셔널 협업 능력 인정받아 팀장 승진',
      leadershipStyle: '품질 제일주의, 데이터 기반 분석, 월간 품질 리뷰'
    },
    team: {
      size: 12,
      seniorCount: 4,
      juniorCount: 8,
      composition: '팀장 1명 + 품질 엔지니어 4명 + 검사원 6명 + 데이터 분석가 1명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 5명(엔지니어, 분석가) + Intermediate 4명 + Beginner 3명'
    },
    work: {
      mainTasks: [
        '웨이퍼 품질 검사 (일 5,000개)',
        '불량 원인 분석 및 리포트',
        '품질 KPI 모니터링 (수율, 불량률)',
        '고객 클레임 대응',
        '품질 개선 프로젝트 진행'
      ],
      dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
      weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
      collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅',
      toolsUsed: ['품질검사 장비 SW', 'Minitab', 'Excel', 'SAP QM', 'PowerPoint'],
      painPoints: [
        '검사 데이터 분석을 엔지니어들이 수작업으로 하느라 일 2-3시간 소요',
        '불량 패턴 발견이 사후적이라 예방 못함',
        '고객 클레임 시 과거 데이터 찾느라 팀원들 스트레스 받음'
      ],
      automationNeeds: [
        'AI 기반 불량 패턴 자동 감지',
        '검사 데이터 자동 분석 및 리포팅',
        '품질 이력 통합 데이터베이스'
      ],
      workStructure: {
        level: '고도구조화',
        description: '검사 절차와 기준 명확히 문서화. 일일 품질 회의와 주간 분석 리포트 정례화. 불량 발생 시 대응 프로토콜 존재. 단, 데이터 분석은 수작업.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '품질 데이터가 민감한데 외부 시스템 연동 시 보안 우려',
        'AI 분석 결과를 팀에서 신뢰할 수 있을지',
        '워크샵에서 배운 내용을 기존 SAP QM 시스템에 어떻게 통합할지'
      ],
      dropoutRisk: 20,
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  {
    id: 'P009',
    name: '박수현',
    age: 38,
    company: 'SK온',
    department: '배터리생산팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 8,
      previousRole: '공정 관리자',
      promotionReason: '공급망 최적화로 재고 회전율 30% 향상. 데이터 분석 기반 의사결정 도입하여 운영 혁신 주도',
      leadershipStyle: '안전 최우선, 현장 소통 중시, 일일 조회'
    },
    team: {
      size: 30,
      seniorCount: 12,
      juniorCount: 18,
      composition: '팀장 1명 + 공정 관리자 8명 + 설비 엔지니어 6명 + 생산 작업자 12명 + 품질 담당 3명',
      digitalMaturity: 'Beginner',
      maturityDistribution: 'Intermediate 9명(관리자, 엔지니어) + Beginner 21명'
    },
    work: {
      mainTasks: [
        '배터리 셀 생산 라인 운영',
        '설비 가동률 관리',
        '안전 점검 및 사고 예방',
        '일일 생산 계획 수립 및 실행',
        '생산 실적 보고'
      ],
      dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
      weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
      collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅',
      toolsUsed: ['MES', 'Excel', '안전점검 체크리스트(종이)', '사내 보고 시스템'],
      painPoints: [
        '설비 가동 데이터를 작업자들이 수기 기록하느라 오류 많음',
        '안전 점검이 종이 체크리스트라 관리가 어렵고 분실 위험',
        '생산 실적 보고서 작성에 주당 5시간 소요, 팀원들에게 미안함'
      ],
      automationNeeds: [
        '설비 가동 데이터 자동 수집',
        '디지털 안전 점검 시스템',
        '생산 실적 자동 집계 및 리포팅'
      ],
      workStructure: {
        level: '반구조화',
        description: '생산 라인 운영 절차는 명확하나, 데이터 기록은 수기. 안전 점검은 체크리스트 있으나 종이 문서. 일일 조회로 소통하나 디지털 협업 체계 부재.'
      }
    },
    expectedBehavior: {
      initialAttitude: '걱정',
      concerns: [
        '생산 현장에서 디지털 도구 도입하면 팀원들 부담만 늘 것 같음',
        '팀원 대부분 디지털 미숙한데 내가 설득하기 어려울 듯',
        '3시간 워크샵으로 현장에 맞는 현실적 해법 찾기 어려울 것 같음'
      ],
      dropoutRisk: 45,
    },
    personality: {
      patience: 4,
      techSavvy: 3,
      changeResistance: 'high',
      learningSpeed: 'slow'
    }
  },

  {
    id: 'P010',
    name: '한승민',
    age: 39,
    company: 'SK케미칼',
    department: '생산계획팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 2,
      previousRole: '수요 예측 분석가',
      promotionReason: '생산 효율성 개선 프로젝트로 불량률 20% 감소 달성. 크로스펑셔널 협업 능력 인정받아 팀장 승진',
      leadershipStyle: '데이터 기반 의사결정, 애자일 방식, 주 2회 스탠드업 미팅'
    },
    team: {
      size: 9,
      seniorCount: 3,
      juniorCount: 6,
      composition: '팀장 1명 + 생산 계획자 4명 + 자재 담당 2명 + 수요 예측 분석가 2명',
      digitalMaturity: 'Expert',
      maturityDistribution: 'Expert 2명(분석가) + Advanced 5명 + Intermediate 2명'
    },
    work: {
      mainTasks: [
        '월간/주간 생산 계획 수립',
        '수요 예측 및 재고 최적화',
        '자재 소요량 계산 및 발주',
        '공급망 협업 (원자재 공급사, 고객사)',
        '생산 시뮬레이션 및 시나리오 분석'
      ],
      dailyWorkflow: '오전 8시 출근 → 8:30 생산/운영 현황 대시보드 확인 → 9시 현장 순회 및 이슈 체크 → 10시 일일 운영 회의 → 11-12시 KPI 분석 및 개선점 도출 → 오후 1-3시 프로젝트 진행 상황 점검 → 3-4시 타부서 협업 미팅 → 4-6시 보고서 작성 및 내일 계획 수립',
      weeklyRoutine: '월: 주간 KPI 리뷰 | 화: 생산 계획 회의 | 수: 품질 점검 | 목: 프로세스 개선 회의 | 금: 주간 보고서 작성 및 경영진 보고',
      collaboration: '팀 내부: ERP와 Slack으로 실시간 운영 현황 공유, 일일 스탠드업 미팅 | 타 부서: 품질팀과 주 2회 협업, 구매팀과 자재 수급 조율 | 외부: 공급업체와 정기 미팅',
      toolsUsed: ['SAP APO', 'Python', 'Tableau', 'Excel', 'Slack'],
      painPoints: [
        '수요 예측 모델이 복잡해서 팀원들과 협업할 때 설명이 어려움',
        '공급망 협업이 이메일/전화라 실시간 대응 못하고 지연 발생',
        '시나리오 분석을 수동으로 하느라 팀원들 야근 많음'
      ],
      automationNeeds: [
        'AI 기반 수요 예측 자동화',
        '공급망 협업 플랫폼',
        '생산 시나리오 자동 시뮬레이션'
      ],
      workStructure: {
        level: '고도구조화',
        description: '월간/주간 계획 수립 프로세스 명확. SAP APO로 대부분 시스템화. 주 2회 스탠드업 미팅으로 진행 공유. 역할 분담 명확하고 협업 체계 확립.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Expert 수준이라 워크샵 내용이 너무 기초적이지 않을까',
        '우리 팀 복잡한 협업 시나리오를 단순한 프로세스로 표현하기 어려울 듯',
        '실제 문제 해결보다 개념 설명에 그치면 시간 낭비일 수 있음'
      ],
      dropoutRisk: 5,
    },
    personality: {
      patience: 9,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  // ==================== R&D (5명) ====================
  {
    id: 'P011',
    name: '신하늘',
    age: 39,
    company: 'SK바이오팜',
    department: '신약개발팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 4,
      previousRole: '연구원',
      promotionReason: '연구 프로세스 표준화로 개발 기간 25% 단축. 외부 기관과의 협업 프로젝트 성공적으로 리드',
      leadershipStyle: '자율성 존중, 주간 연구 세미나, 논문 중심 성과 평가'
    },
    team: {
      size: 7,
      seniorCount: 2,
      juniorCount: 5,
      composition: '팀장 1명 + 연구원 5명 + 임상 코디네이터 1명',
      digitalMaturity: 'Expert',
      maturityDistribution: 'Expert 3명 + Advanced 4명'
    },
    work: {
      mainTasks: [
        '신약 후보물질 발굴 및 검증',
        '실험 설계 및 수행',
        '실험 데이터 분석 및 논문 작성',
        '임상시험 준비 및 진행',
        '연구 프로젝트 관리'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립',
      weeklyRoutine: '월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리',
      collaboration: '팀 내부: LIMS와 Teams으로 연구 데이터 공유, 주 2회 기술 회의 | 타 부서: 생산팀과 기술 이전 협의, QA팀과 검증 프로세스 | 외부: 연구기관 및 대학과 공동연구',
      toolsUsed: ['Lab Management System', 'GraphPad Prism', 'Python', 'R', 'EndNote', 'Slack'],
      painPoints: [
        '실험 데이터가 팀원들 로컬에 분산되어 협업 시 찾기 어려움',
        '문헌 조사에 팀원들이 많은 시간 소비',
        '연구 프로젝트 진행 상황을 팀 전체가 파악하기 어려움'
      ],
      automationNeeds: [
        '실험 데이터 통합 관리 시스템',
        'AI 기반 문헌 요약 및 인사이트 추출',
        '연구 프로젝트 자동 진행 리포팅'
      ],
      workStructure: {
        level: '반구조화',
        description: '연구 주제별 담당자는 있으나 실험 방법은 연구원 재량. 주간 세미나로 진행 공유하나 일상 협업은 비정형적. 데이터 관리 규칙 미흡.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Expert 수준에서 프로세스가 너무 선형적이고 예측 가능하지 않을까',
        '연구 업무의 창의성과 빠른 의사결정을 프레임워크가 제약할까 걱정',
        '실제 도구 연동보다 개념 설명에 그치면 우리 팀에 도움 안될 듯'
      ],
      dropoutRisk: 5,
    },
    personality: {
      patience: 8,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P012',
    name: '오현우',
    age: 40,
    company: 'SK하이닉스',
    department: '반도체설계팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 6,
      previousRole: '설계 엔지니어',
      promotionReason: '연구 프로세스 표준화로 개발 기간 25% 단축. 외부 기관과의 협업 프로젝트 성공적으로 리드',
      leadershipStyle: '기술 중심, 코드 리뷰 문화, 주간 기술 공유'
    },
    team: {
      size: 12,
      seniorCount: 4,
      juniorCount: 8,
      composition: '팀장 1명 + 설계 엔지니어 8명 + 검증 엔지니어 3명',
      digitalMaturity: 'Expert',
      maturityDistribution: 'Expert 9명 + Advanced 3명'
    },
    work: {
      mainTasks: [
        '반도체 회로 설계',
        '설계 검증 및 시뮬레이션',
        'IP(지적재산권) 관리',
        '설계 문서화 및 리뷰',
        '공정 엔지니어와 협업'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립',
      weeklyRoutine: '월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리',
      collaboration: '팀 내부: LIMS와 Teams으로 연구 데이터 공유, 주 2회 기술 회의 | 타 부서: 생산팀과 기술 이전 협의, QA팀과 검증 프로세스 | 외부: 연구기관 및 대학과 공동연구',
      toolsUsed: ['CAD 툴(Cadence, Synopsys)', 'Git', 'JIRA', 'Confluence', 'Python', 'Slack'],
      painPoints: [
        '설계 검증 시뮬레이션이 오래 걸려 팀원들 대기 시간 많음 (주당 20시간)',
        '설계 변경 이력 추적이 수동이라 팀원들 혼란',
        '타 팀과 협업 문서가 분산되어 찾기 어려움'
      ],
      automationNeeds: [
        'AI 기반 설계 최적화 자동화',
        '설계 변경 이력 자동 추적 시스템',
        '협업 문서 통합 플랫폼'
      ],
      workStructure: {
        level: '고도구조화',
        description: '설계 프로세스와 검증 절차 명확히 문서화. Git으로 버전 관리, JIRA로 태스크 관리. 주간 기술 공유와 코드 리뷰 정례화. 협업 체계 확립.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Expert 관점에서 구체적인 디지털 도구 연동이 안보이면 기대 낮음',
        '비정형적 R&D 업무를 어떻게 표준화할 것인지 의문',
        '미션 작성이 너무 선형적이고 템플릿화되어 있으면 우리 팀에 안 맞음'
      ],
      dropoutRisk: 5,
    },
    personality: {
      patience: 8,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P013',
    name: '임하린',
    age: 40,
    company: 'SK C&C',
    department: 'AI연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 2,
      previousRole: 'AI 연구원',
      promotionReason: '연구 프로세스 표준화로 개발 기간 25% 단축. 외부 기관과의 협업 프로젝트 성공적으로 리드',
      leadershipStyle: '빠른 실험, 실패 허용, 주 2회 페이퍼 리뷰'
    },
    team: {
      size: 5,
      seniorCount: 2,
      juniorCount: 3,
      composition: '팀장 1명 + AI 연구원 4명',
      digitalMaturity: 'Expert',
      maturityDistribution: 'Expert 5명'
    },
    work: {
      mainTasks: [
        '딥러닝 모델 연구 및 개발',
        '대규모 데이터셋 구축 및 전처리',
        '모델 성능 실험 및 평가',
        '연구 논문 작성 및 발표',
        '프로덕션 모델 배포 지원'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립',
      weeklyRoutine: '월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리',
      collaboration: '팀 내부: LIMS와 Teams으로 연구 데이터 공유, 주 2회 기술 회의 | 타 부서: 생산팀과 기술 이전 협의, QA팀과 검증 프로세스 | 외부: 연구기관 및 대학과 공동연구',
      toolsUsed: ['PyTorch', 'TensorFlow', 'Kubernetes', 'MLflow', 'Weights & Biases', 'GitHub', 'Notion'],
      painPoints: [
        '실험 트래킹을 팀원들이 수동으로 하느라 실험 비교 어려움',
        '데이터셋 버전 관리가 안되어 재현성 문제',
        '연구-프로덕션 간 모델 전환이 복잡해서 팀원들 스트레스'
      ],
      automationNeeds: [
        '실험 자동 트래킹 및 비교 시스템',
        '데이터셋 버전 관리 자동화',
        'MLOps 파이프라인 구축'
      ],
      workStructure: {
        level: '반구조화',
        description: '연구 주제는 자율적으로 선정. GitHub로 코드 관리하나 실험 프로세스는 비정형적. 주 2회 페이퍼 리뷰로 지식 공유. MLflow 도입했으나 정착 미흡.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '전략 업무(장기 기획, 비정형 분석)와의 연결고리가 보이지 않으면 무용',
        '우리 팀이 이걸 언제 어떻게 써야 하는가가 명확하지 않으면 의미 없음',
        '워크샵이 일반적인 업무 관리에 치중하면 AI 연구팀 특성에 안 맞음'
      ],
      dropoutRisk: 5,
    },
    personality: {
      patience: 9,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P014',
    name: '류소영',
    age: 41,
    company: 'SK이노베이션',
    department: '배터리기술연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 1.2,
      previousRole: '재료 연구원 (8년 경력)',
      promotionReason: '리튬메탈 음극재 신소재 개발로 특허 5건 출원, 에너지밀도 15% 향상 성과로 승진',
      leadershipStyle: '안정적 연구 관리, 월간 연구 리뷰, 특허 중시. 하지만 팀원들의 연구 속도와 방향 조율에 어려움 느낌.'
    },
    team: {
      size: 8,
      seniorCount: 3,
      juniorCount: 5,
      composition: '팀장 1명 + 시니어 재료 연구원 3명(박사급, 10-15년차) + 주니어 공정 연구원 2명(석사급, 3-4년차) + 주니어 분석 연구원 3명(석사급, 2-5년차)',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Advanced 6명(시니어 3명 + 주니어 3명) + Intermediate 2명(주니어 공정 연구원)'
    },
    work: {
      mainTasks: [
        '차세대 배터리 재료 연구 (리튬메탈, 전고체 전해질)',
        '전기화학 실험 및 분석 (사이클 수명, 출력 특성 평가)',
        '배터리 성능 테스트 (셀 제작 후 충방전 실험, 주 평균 20건)',
        '특허 출원 및 기술 문서 작성 (월 평균 1-2건 특허 출원)',
        '생산팀과 기술 이관 협업 (파일럿 양산 프로세스 검증)'
      ],
      dailyWorkflow: '오전 8시 출근 → 전날 실험 데이터 확인 (셀 사이클 테스트 결과, 전기화학 분석 데이터) → 9시 팀 미팅 (20분, 각자 실험 진행 상황 공유) → 9:30-12시 실험실에서 재료 합성, 셀 조립, 측정 장비 세팅 (시니어들은 자율적으로, 주니어들은 수시로 질문) → 점심 후 1-3시 실험 데이터 분석 (Origin으로 그래프 그리고 Excel로 정리) → 3-5시 팀장이 주니어들 실험 결과 리뷰 및 다음 실험 방향 논의 → 5-6시 특허 초안 작성 또는 생산팀과 화상 미팅 → 저녁 7시 퇴근 (단, 긴급 실험 이슈 시 8-9시까지)',
      weeklyRoutine: '월요일 오전: 주간 실험 계획 회의(1시간, 재료별 목표 설정) / 화요일: 시니어 연구원들과 특허 전략 논의 / 수요일 오후: 연구소 전체 세미나 참석 (최신 배터리 기술 동향) / 목요일: 주니어들 실험 노트 검토 및 피드백 / 금요일: 월간 연구 리뷰 준비 (PPT 작성, 진행률 점검)',
      collaboration: '팀 내에서는 SharePoint에 실험 계획과 결과를 기록하지만 실제로는 각자 로컬 PC에 원본 데이터 보관. 주간 미팅에서 구두로 진행 공유. 생산팀과는 이메일로 기술 이관 논의. 외부 대학 연구실과 공동 연구 시 PPT와 이메일로 데이터 주고받음. 특허팀과는 월 1회 대면 미팅.',
      toolsUsed: ['실험 장비 SW(Gamry, Biologic)', 'Origin', 'Excel', 'PowerPoint', 'SharePoint', '이메일', 'Zoom'],
      painPoints: [
        '시니어 연구원 3명이 각자 독자적으로 실험하는데, 누가 어떤 데이터를 갖고 있는지 물어봐야 알 수 있음. 로컬 PC에 흩어져 있어서 협업 시 찾기 어려움',
        '주니어들이 같은 유형 실험을 반복하는데 매번 시니어한테 물어봐야 함. 과거 실험 데이터 검색이 안 돼서 중복 실험 하는 경우 많음',
        '실험 결과를 PPT로 만들어서 이메일로 공유하는데, 버전 관리가 안 돼서 "최종_최종_진짜최종.pptx" 같은 파일이 쌓임',
        '특허 출원 시 과거 실험 데이터를 찾느라 일주일씩 걸림. 누가 언제 어떤 조건으로 실험했는지 기록이 체계적이지 않음',
        '월간 연구 리뷰 자료 만들 때 팀원들한테 일일이 데이터 달라고 요청해서 취합하는데 주말 반나절 소요'
      ],
      automationNeeds: [
        '실험 데이터 중앙 저장소 (조건별, 날짜별 검색 가능)',
        '데이터 분석 자동화 툴 (그래프 자동 생성, 트렌드 분석)',
        '연구 히스토리 검색 시스템 (과거 실험 조건과 결과를 빠르게 찾기)'
      ],
      workStructure: {
        level: '반구조화',
        description: '재료/공정/분석별 담당은 명확하나 협업 프로세스 비정형적. 월간 연구 리뷰로 진행 공유. 실험 데이터 관리 규칙 있으나 준수 미흡. 시니어들은 독립적으로 연구하고 주니어들은 팀장에게 수시 보고.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Advanced 수준에서 구체적 개선점 도출보다 개념 설명이면 실망',
        '8명 팀원들 실제 업무 중인데 배운 내용 적용할 시간이 있을지',
        '자체 미션/비전 명확한데 일반적인 미션 작성 과정은 불필요할 듯',
        '시니어 연구원들이 "데이터 관리 시스템 만들자"고 해도 "지금도 잘 하고 있는데 왜 바꾸냐"며 반발할까봐 걱정',
        '특허 출원이 급한데 워크샵에서 배운 내용을 언제 적용하지'
      ],
      dropoutRisk: 10,
    },
    personality: {
      patience: 7,
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P015',
    name: '조민석',
    age: 41,
    company: 'SK바이오사이언스',
    department: '백신연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 7,
      previousRole: '바이러스 연구원',
      promotionReason: '연구 프로세스 표준화로 개발 기간 25% 단축. 외부 기관과의 협업 프로젝트 성공적으로 리드',
      leadershipStyle: '규제 준수 중시, 주간 진행 회의, 문서화 강조'
    },
    team: {
      size: 10,
      seniorCount: 4,
      juniorCount: 6,
      composition: '팀장 1명 + 바이러스 연구원 4명 + 임상 연구원 3명 + 데이터 분석가 2명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 5명(연구원, 분석가) + Intermediate 3명 + Beginner 2명'
    },
    work: {
      mainTasks: [
        '백신 후보물질 개발',
        '전임상/임상 시험 설계 및 진행',
        '임상 데이터 분석',
        '규제 기관 제출 문서 작성',
        '연구 프로젝트 관리'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 연구 진행 상황 확인 → 10시 팀 기술 미팅 → 11-12시 실험/연구 활동 모니터링 → 오후 1-3시 데이터 분석 및 문서 작성 → 3-4시 외부 기관 협업 → 4-5시 팀원 기술 지도 → 5-6시 연구 일지 정리 및 계획 수립',
      weeklyRoutine: '월: 연구 진행 상황 공유 | 화: 기술 세미나 | 수: 실험 계획 검토 | 목: 외부 협력 회의 | 금: 주간 연구 성과 정리',
      collaboration: '팀 내부: LIMS와 Teams으로 연구 데이터 공유, 주 2회 기술 회의 | 타 부서: 생산팀과 기술 이전 협의, QA팀과 검증 프로세스 | 외부: 연구기관 및 대학과 공동연구',
      toolsUsed: ['LIMS(실험실정보관리)', 'SAS', 'Excel', 'PowerPoint', 'SharePoint'],
      painPoints: [
        '임상 데이터가 여러 병원, 여러 형식이라 통합 관리 어려움',
        '규제 문서 작성을 수작업으로 하느라 팀원들 야근 많음',
        '연구 진행 상황을 실시간 파악 못해서 일정 지연 많음'
      ],
      automationNeeds: [
        '임상 데이터 통합 플랫폼',
        '규제 문서 자동 생성 시스템',
        '프로젝트 진행 대시보드'
      ],
      workStructure: {
        level: '고도구조화',
        description: '임상시험 프로토콜과 규제 문서 작성 절차 명확. 주간 진행 회의와 월간 마일스톤 리뷰 정례화. LIMS로 데이터 관리하나 통합 부족.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '임상 연구는 규제가 엄격한데 워크샵에서 제안하는 도구가 컴플라이언스 이슈 있을까',
        '팀원 수준 차이 있는데 내가 배운 내용을 어떻게 각 수준에 맞게 전달할지',
        '3시간으로 복잡한 임상 연구 프로세스를 다룰 수 있을지 의문'
      ],
      dropoutRisk: 20,
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  // ==================== HR (5명) ====================
  {
    id: 'P016',
    name: '정수민',
    age: 41,
    company: 'SK하이닉스',
    department: '인재개발팀',
    role: '팀장',
    category: 'HR',
    leaderProfile: {
      yearsInRole: 4,
      previousRole: '교육 프로그램 기획자',
      promotionReason: '성과 관리 시스템 혁신으로 평가 공정성 향상. 팀원 이직률 50% 감소시켜 조직 안정성 기여',
      leadershipStyle: '학습 문화 조성, 데이터 기반 교육 효과 측정, 월간 교육 리뷰'
    },
    team: {
      size: 6,
      seniorCount: 2,
      juniorCount: 4,
      composition: '팀장 1명 + 교육 기획자 3명 + 강사 1명 + 교육 운영 담당 1명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Advanced 4명 + Intermediate 2명'
    },
    work: {
      mainTasks: [
        '직무별 교육 프로그램 기획 및 운영',
        '신입/경력 온보딩 프로그램 설계',
        '리더십 교육 및 코칭',
        '교육 효과 측정 및 분석',
        '외부 강사 및 교육 기관 협업'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
      weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
      collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력',
      toolsUsed: ['LMS(학습관리시스템)', 'Zoom', 'Google Forms', 'Excel', 'PowerPoint', 'Slack'],
      painPoints: [
        '교육 신청/이수 현황을 수작업으로 집계해서 주당 6시간 소요',
        '교육 효과 측정이 설문조사에만 의존해서 실제 업무 개선 연결 안됨',
        '부서별 교육 요구사항 파악이 이메일로만 되어 체계적 관리 어려움'
      ],
      automationNeeds: [
        '교육 신청 및 이수 자동 트래킹',
        '교육 효과 분석 대시보드',
        '부서별 교육 니즈 수집 및 분석 시스템'
      ],
      workStructure: {
        level: '반구조화',
        description: '교육 프로그램 기획 프로세스는 있으나 부서별 커스터마이징이 많음. 월간 교육 리뷰로 진행 공유. LMS 있으나 수동 운영 많음.'
      }
    },
    expectedBehavior: {
      initialAttitude: '기대함',
      concerns: [
        'Advanced 수준인데 워크샵에서 실제 적용 가능한 구체적 솔루션 나올까',
        '6명 소규모 팀이라 워크샵 사례가 대규모 조직 중심이면 안 맞을 듯',
        '교육 효과 측정 같은 비정형 업무를 어떻게 자동화할 수 있을지'
      ],
      dropoutRisk: 5,
    },
    personality: {
      patience: 8,
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P017',
    name: '최영호',
    age: 42,
    company: 'SK텔레콤',
    department: '인사기획팀',
    role: '팀장',
    category: 'HR',
    leaderProfile: {
      yearsInRole: 6,
      previousRole: '인사 담당자',
      promotionReason: '전사 디지털 전환 교육 프로그램 설계 및 실행으로 직원 만족도 85% 달성. 채용 프로세스 개선으로 우수 인재 확보',
      leadershipStyle: '공정성 중시, 프로세스 준수, 주간 케이스 리뷰'
    },
    team: {
      size: 10,
      seniorCount: 4,
      juniorCount: 6,
      composition: '팀장 1명 + 채용 담당 3명 + 평가 담당 2명 + 보상 담당 2명 + 인사 시스템 담당 2명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 3명(시스템 담당) + Intermediate 5명 + Beginner 2명'
    },
    work: {
      mainTasks: [
        '연간 채용 계획 수립 및 실행',
        '인사 평가 제도 운영',
        '보상 체계 설계 및 관리',
        '인사 데이터 분석 및 보고',
        '인사 시스템 운영 및 개선'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
      weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
      collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력',
      toolsUsed: ['SAP HR', 'Excel', 'PowerPoint', '채용 플랫폼(사람인, 잡코리아)', '이메일'],
      painPoints: [
        '채용 진행 현황을 부서별로 일일이 확인해야 해서 주당 10시간',
        '평가 데이터 집계가 엑셀 수작업이라 오류 많고 시간 오래 걸림',
        '인사 관련 문의가 이메일/전화로 쏟아져서 팀원들 업무 집중 어려움'
      ],
      automationNeeds: [
        '채용 프로세스 자동 트래킹 대시보드',
        '평가 데이터 자동 집계 및 분석',
        '인사 챗봇(FAQ 자동 응답)'
      ],
      workStructure: {
        level: '고도구조화',
        description: '인사 프로세스(채용/평가/보상) 명확히 정의. SAP HR로 대부분 시스템화. 주간 케이스 리뷰로 이슈 공유. 규정 준수 철저.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Intermediate 수준에서 디지털 전환이 현실적으로 가능할까',
        '인사는 민감 정보 많은데 자동화 도구 도입 시 보안 이슈 걱정',
        '10명 팀에서 수준 차이 있는데 내가 배운 내용 전파 어려울 듯'
      ],
      dropoutRisk: 15,
    },
    personality: {
      patience: 7,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  {
    id: 'P018',
    name: '박지원',
    age: 42,
    company: 'SK이노베이션',
    department: '노사협력팀',
    role: '팀장',
    category: 'HR',
    leaderProfile: {
      yearsInRole: 8,
      previousRole: '노무 담당자',
      promotionReason: '성과 관리 시스템 혁신으로 평가 공정성 향상. 팀원 이직률 50% 감소시켜 조직 안정성 기여',
      leadershipStyle: '소통 중심, 현장 경청, 이슈 대응 중시'
    },
    team: {
      size: 5,
      seniorCount: 2,
      juniorCount: 3,
      composition: '팀장 1명 + 노무 담당 2명 + 안전보건 담당 1명 + 복리후생 담당 1명',
      digitalMaturity: 'Beginner',
      maturityDistribution: 'Intermediate 2명 + Beginner 3명'
    },
    work: {
      mainTasks: [
        '노사 협의회 운영',
        '근로조건 협상 및 관리',
        '직원 고충 처리',
        '안전보건 관리',
        '복리후생 제도 운영'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
      weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
      collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력',
      toolsUsed: ['Excel', 'Word', '이메일', '전화', '종이 문서'],
      painPoints: [
        '직원 고충 접수가 이메일/전화/방문으로 분산되어 체계적 관리 안됨',
        '안전보건 점검 기록이 종이 문서라 분실 위험 있고 통계 내기 어려움',
        '복리후생 신청 현황을 엑셀로 관리해서 실시간 파악 불가'
      ],
      automationNeeds: [
        '고충 처리 시스템(접수/진행/완료)',
        '안전보건 디지털 점검 시스템',
        '복리후생 신청 및 관리 플랫폼'
      ],
      workStructure: {
        level: '비구조화',
        description: '이슈별 대응이라 정형화된 프로세스 없음. 직원 소통이 비정형적. 문서 관리 체계 미흡.'
      }
    },
    expectedBehavior: {
      initialAttitude: '걱정',
      concerns: [
        'Beginner 수준에서 디지털 도구 사용 자체가 부담스러움',
        '현장 중심 업무인데 시스템화하면 오히려 직원들과 거리감 생길까',
        '5명 소규모 팀이 디지털 전환에 투자할 시간과 예산 있을지'
      ],
      dropoutRisk: 50,
    },
    personality: {
      patience: 5,
      techSavvy: 4,
      changeResistance: 'high',
      learningSpeed: 'slow'
    }
  },

  {
    id: 'P019',
    name: '강민서',
    age: 43,
    company: 'SK네트웍스',
    department: '조직문화팀',
    role: '팀장',
    category: 'HR',
    leaderProfile: {
      yearsInRole: 3,
      previousRole: '조직문화 기획자',
      promotionReason: '전사 디지털 전환 교육 프로그램 설계 및 실행으로 직원 만족도 85% 달성. 채용 프로세스 개선으로 우수 인재 확보',
      leadershipStyle: '창의적 기획, 직원 참여 중시, 월간 문화 이벤트'
    },
    team: {
      size: 4,
      seniorCount: 1,
      juniorCount: 3,
      composition: '팀장 1명 + 문화 기획자 2명 + 커뮤니케이션 담당 1명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Advanced 3명 + Intermediate 1명'
    },
    work: {
      mainTasks: [
        '조직문화 프로그램 기획 및 실행',
        '사내 소통 채널 운영',
        '직원 만족도 조사 및 분석',
        '워라밸 제도 설계 및 운영',
        '사내 이벤트 및 행사 기획'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
      weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
      collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력',
      toolsUsed: ['Slack', 'Google Workspace', 'SurveyMonkey', 'Canva', 'Notion', 'Instagram'],
      painPoints: [
        '직원 만족도 조사 결과를 수작업으로 분석해서 인사이트 도출 늦음',
        '사내 소통 채널이 여러 곳에 분산되어 통합 관리 어려움',
        '문화 프로그램 참여율 데이터가 부서별로 흩어져 있어 집계 어려움'
      ],
      automationNeeds: [
        '만족도 조사 자동 분석 및 시각화',
        '통합 커뮤니케이션 대시보드',
        '프로그램 참여 자동 트래킹'
      ],
      workStructure: {
        level: '반구조화',
        description: '기획 프로세스는 있으나 창의성 중시로 유연. 월간 문화 이벤트로 리듬 있음. Slack/Notion 활용하나 체계적 관리 부족.'
      }
    },
    expectedBehavior: {
      initialAttitude: '기대함',
      concerns: [
        'Advanced 수준에서 실제 적용 가능한 구체적 툴 추천 나올까',
        '조직문화는 정량화하기 어려운데 데이터 분석이 실효성 있을지',
        '4명 소규모 팀이라 자동화 도입 후 유지보수 누가 할지'
      ],
      dropoutRisk: 10,
    },
    personality: {
      patience: 9,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P020',
    name: '윤상혁',
    age: 43,
    company: 'SK E&S',
    department: '보상복지팀',
    role: '팀장',
    category: 'HR',
    leaderProfile: {
      yearsInRole: 5,
      previousRole: '보상 담당자',
      promotionReason: '성과 관리 시스템 혁신으로 평가 공정성 향상. 팀원 이직률 50% 감소시켜 조직 안정성 기여',
      leadershipStyle: '공정성과 투명성, 데이터 기반 의사결정, 분기별 시장 조사'
    },
    team: {
      size: 7,
      seniorCount: 2,
      juniorCount: 5,
      composition: '팀장 1명 + 보상 설계 담당 2명 + 급여 담당 2명 + 복리후생 담당 2명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 2명 + Intermediate 3명 + Beginner 2명'
    },
    work: {
      mainTasks: [
        '연봉 체계 설계 및 시장 조사',
        '월급여 계산 및 지급',
        '복리후생 제도 운영',
        '인건비 예산 관리',
        '보상 데이터 분석 및 보고'
      ],
      dailyWorkflow: '오전 9시 출근 → 9:30 채용/교육 일정 확인 → 10-11시 면접 또는 교육 진행 → 11-12시 직원 상담 → 오후 1-3시 정책 수립 및 문서 작업 → 3-4시 부서장 미팅 → 4-5시 팀원 업무 지도 → 5-6시 일일 이슈 정리 및 대응 계획',
      weeklyRoutine: '월: 채용 현황 점검 | 화: 교육 프로그램 운영 | 수: 직원 만족도 분석 | 목: 정책 수립 회의 | 금: 주간 HR 이슈 정리',
      collaboration: '팀 내부: HRIS와 Slack으로 HR 현황 공유, 주간 HR 회의 | 타 부서: 각 부서장과 인력 계획 협의, 재무팀과 인건비 검토 | 외부: 헤드헌터 및 교육기관과 협력',
      toolsUsed: ['SAP HR', 'Excel', 'PowerPoint', '급여 계산 시스템', '시장 조사 리포트'],
      painPoints: [
        '시장 조사 데이터를 수작업으로 비교 분석해서 분기당 20시간 소요',
        '급여 계산 시 예외 사항 처리를 수동으로 해서 실수 위험',
        '복리후생 만족도를 체계적으로 측정 못해서 개선 방향 불명확'
      ],
      automationNeeds: [
        '시장 조사 데이터 자동 비교 분석',
        '급여 예외 처리 자동화',
        '복리후생 만족도 정기 조사 시스템'
      ],
      workStructure: {
        level: '고도구조화',
        description: '보상 프로세스와 급여 계산 절차 명확. SAP HR로 시스템화. 분기별 시장 조사 정례화. 예산 관리 엄격.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Intermediate 수준에서 복잡한 보상 데이터 분석 자동화가 가능할까',
        '급여는 민감 정보라 자동화 도입 시 보안과 정확성 검증 필요',
        '7명 팀에서 수준 차이 있는데 디지털 전환 어떻게 추진할지'
      ],
      dropoutRisk: 20,
    },
    personality: {
      patience: 7,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  // ==================== Finance (5명) ====================
  // ==================== Finance (5명) ====================
  {
    id: 'P021',
    name: '김태준',
    age: 38,
    company: 'SK하이닉스',
    department: '재무기획팀',
    role: '팀장',
    category: 'Finance',
    leaderProfile: {
      yearsInRole: 1.3,
      previousRole: '재무 분석 시니어 매니저 (7년 경력)',
      promotionReason: '반도체 투자 수익성 분석 모델 개발로 300억 투자 의사결정 지원, 월 결산 자동화로 마감 기간 3일 단축 달성하여 승진',
      leadershipStyle: '숫자와 논리로 설득하는 스타일. 정확성을 최우선으로 하지만, 경영진의 급한 요청과 팀의 일정 사이에서 균형 잡기 어려워함.',
      biggestChallenge: '전임 팀장이 20년 경력의 베테랑이었는데, CFO가 자꾸 "예전 김 팀장은 이렇게 했는데"라고 비교하는 것',
      hiddenStruggles: [
        'CFO 보고 때마다 "이 숫자 맞아?"라고 재확인하면 자신감이 흔들리고 팀원들 앞에서 권위가 떨어지는 느낌',
        '시니어 회계사(15년차)가 "IFRS 기준이 바뀐 거 아시죠?"라고 물어볼 때 모르면서도 아는 척해야 하는 압박',
        '타 부서에서 "재무팀은 일만 늦춘다"는 소리를 들어도 팀원들 야근시키기 미안해서 혼자 주말 출근',
        'ERP 시스템 오류로 데이터가 틀렸는데 이미 경영진 보고가 끝난 후 발견했을 때의 공포감'
      ]
    },
    team: {
      size: 8,
      seniorCount: 3,
      juniorCount: 5,
      composition: '팀장 1명 + 시니어 재무 분석가 2명(15년차, 10년차) + 시니어 회계 담당 1명(12년차) + 주니어 예산 담당 2명(3-4년차) + 주니어 자금 담당 2명(2-3년차) + 주니어 데이터 분석 1명(1년차)',
      digitalMaturity: 'Advanced',
      maturityDistribution: '시니어 2명(Expert - Python/SQL 능통) + 시니어 1명(Advanced) + 주니어 3명(Intermediate) + 주니어 2명(Beginner)',
      teamDynamics: '15년차 시니어는 "차기 팀장감"이라 은근히 팀장 결정에 도전. 10년차는 이직 준비 중이라 소극적. 주니어들은 시니어들 눈치 보느라 팀장에게 직접 질문 못함. 1년차는 실수 연발로 팀 분위기 긴장.',
      resistanceFactors: [
        '시니어들의 "재무는 정확성이 생명인데 새로운 시도는 위험해"라는 보수적 태도',
        '감사 지적 두려움으로 "전례대로 하자"는 관성',
        'Python 같은 새 도구에 대한 "Excel이면 충분한데 왜?"라는 거부감',
        '타 부서와 협업 시스템 도입에 "우리가 왜 맞춰줘야 해?"라는 반발'
      ]
    },
    work: {
      mainTasks: [
        '월/분기/연간 재무제표 작성 및 결산 (월말 마감 D+5일 내 완료 필수)',
        '반도체 사업부별 투자 수익성 분석 및 신규 투자 타당성 검토 (분기당 10-15건)',
        '예산 편성 및 집행 모니터링 (전사 1.2조 예산 관리)',
        '외부 감사 대응 및 공시 자료 작성',
        'CFO 직속 특명 프로젝트 (M&A 검토, 원가 절감 TF 등)'
      ],
      dailyWorkflow: '오전 7시 반 출근 → 전일 환율/금리 체크 및 자금 포지션 확인 → 8시 Bloomberg에서 시장 동향 파악 → 9시 팀 모닝 브리핑 (각자 당일 마감 업무 공유) → 오전 중 시니어들과 결산 이슈 논의, 주니어들은 전표 입력 및 검증 → 점심 후 1-3시 타 부서 예산 문의 응대 (하루 평균 5-7건 전화/메일) → 3시 CFO 보고 자료 작성 시작 → 5시 팀원들 작업 검토 및 피드백 → 저녁 7-9시 보고서 최종 마무리 (월말은 11시까지)',
      weeklyRoutine: '월요일: 주간 자금 계획 수립 및 CFO 보고 / 화요일: 투자심의위원회 자료 준비 / 수요일: 사업부별 예산 집행 현황 점검 / 목요일: 외부 감사인 대응 또는 공시 자료 작성 / 금요일: 주간 재무 이슈 정리 및 차주 계획',
      collaboration: 'SAP ERP로 전표 처리하지만 실제 분석은 Excel 의존. 팀 내 소통은 이메일 + 카톡. 타 부서와는 예산 포털 시스템 있지만 활용도 낮아 전화/이메일이 주. CFO 보고는 PPT로 작성 후 대면 보고. 감사법인과는 이메일 + 수시 대면 미팅.',
      toolsUsed: ['SAP FI/CO', 'Excel', 'PowerPoint', 'Bloomberg Terminal', 'Python(일부)', 'SQL', 'Teams', '예산 포털 시스템'],
      painPoints: [
        '월말 결산 때 각 부서에서 늦게 제출하는 데이터 때문에 마감 지연, 팀 전체가 밤 11시까지 대기',
        'CFO가 갑자기 "작년 대비 분석 자료 30분 내로"라고 요청하면 모든 업무 중단하고 대응',
        '시니어 분석가들이 Python 쓰는데 나머지는 Excel만 써서 데이터 통합 시 형식 맞추느라 시간 낭비',
        '투자 타당성 검토 시 사업부가 낙관적 전망만 제시해서 리스크 시나리오 분석을 재무팀이 추가로 해야 함',
        '감사 지적 사항이 나올까봐 전년도 방식 그대로 하다 보니 업무 개선이 안 됨'
      ],
      automationNeeds: [
        '부서별 결산 데이터 자동 수집 및 검증 시스템',
        'CFO 정기 보고서 자동 생성 (데이터 입력하면 PPT 자동 완성)',
        '투자 타당성 분석 시뮬레이션 자동화',
        '예산 대비 실적 실시간 모니터링 대시보드'
      ],
      workStructure: {
        level: '고도구조화',
        description: '회계 기준과 결산 프로세스는 명확히 정의됨. SAP로 대부분 전산화. 하지만 분석과 보고서 작성은 수작업 의존. 감사 대응으로 문서화는 철저하나 혁신은 제한적.'
      },
      realTimeExample: '지난달 말 결산 D+3일, 오후 6시에 생산팀에서 "재고 자산 평가 방법 변경 필요"라고 통보. 이미 재무제표 초안을 CFO께 보고한 상태. 시니어는 "규정상 안 된다"고 하고, 생산팀은 "CFO 지시"라고 압박. 결국 팀장이 밤새 영향도 분석하고 새벽 3시에 수정안 작성. 다음날 CFO 보고 때 "왜 이제야?"라는 질책.',
      typicalFireDrills: [
        'CFO "10분 내로 올라와" - 갑작스런 호출에 준비 없이 보고',
        '감사인 "이 계정과목 증빙 추가 필요" - 마감 직전 추가 요구',
        '사업부 "예산 추가 필요, 오늘 중 결재 요청" - 긴급 예산 변경',
        'CEO "작년 대비 수익성이 왜 떨어졌나?" - 즉석 분석 요구'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        'CFO에게 "혁신적인 재무 팀장"으로 인정받고 싶음',
        '시니어들보다 뭔가 앞서가는 모습을 보여주고 싶음',
        '월말 결산 지옥에서 벗어날 수 있는 방법을 찾고 싶음',
        '다른 회사 재무팀은 어떻게 일하는지 벤치마킹하고 싶음'
      ],
      deepConcerns: [
        '재무는 보수적인 부서인데 너무 혁신적으로 보이면 "위험한 팀장"으로 낙인찍힐까봐',
        '워크샵 내용이 대기업 재무팀 현실과 동떨어진 스타트업 방식일까봐',
        '새로운 도구 도입했다가 감사 지적 받으면 책임질 자신 없음',
        '시니어들이 "팀장님 교육 받고 오더니 일만 늘리네"라고 뒷담화할까봐'
      ],
      successMetrics: [
        '월말 결산 기간을 단 하루라도 단축할 수 있는 방법',
        'CFO 보고 자료 만드는 시간을 절반으로 줄이는 방법',
        '시니어와 주니어 간 스킬 갭을 해결하는 방법',
        '감사 지적 없이 프로세스를 개선하는 방법'
      ],
      dropoutRisk: 10,
      dropoutTriggers: [
        '월말/분기말/연말 결산 기간과 겹치는 경우',
        'CFO 긴급 호출이 오는 경우',
        '감사인 미팅이 갑자기 잡히는 경우',
        '내용이 너무 IT 기술적이어서 재무와 연결이 안 되는 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Advanced 수준에서 이미 많이 자동화했는데 워크샵이 도움될까',
        '재무는 정확성이 생명인데 새 도구 도입 시 검증 과정 복잡할 듯',
        '팀원들 수준 차이 있는데 하나의 솔루션으로 해결 가능할지'
      ],
      dropoutRisk: 10
    },
    personality: {
      patience: 8,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 9,
      confidenceLevel: 6
    }
  },
  {
    id: 'P022',
    name: '이현주',
    age: 39,
    company: 'SK텔레콤',
    department: '회계팀',
    role: '팀장',
    category: 'Finance',
    leaderProfile: {
      yearsInRole: 0.8,
      previousRole: '회계 파트장 (9년 경력)',
      promotionReason: 'K-IFRS 도입 프로젝트 리드하여 성공적 전환, 회계 감사 클린 오피니언 3년 연속 달성으로 승진',
      leadershipStyle: '원칙과 정확성을 중시하되 팀원들의 워라밸도 배려하려 노력. 하지만 마감 압박과 팀원 복지 사이에서 늘 고민.',
      biggestChallenge: '12명 대규모 팀 운영 경험 부족, 특히 본인보다 나이 많은 시니어 과장 2명과의 어색한 관계',
      hiddenStruggles: [
        '나이 많은 과장들이 "현주씨가 팀장이 됐네"라며 반말하다가 고치는 걸 볼 때마다 불편함',
        '전표 하나 틀리면 큰일나는 회계 업무 특성상 실수한 팀원을 야단쳐야 하는데 상처받을까봐 제대로 못함',
        '여성 팀장이라 더 완벽해야 한다는 압박감에 남들보다 2시간 일찍 출근',
        '임신 계획이 있는데 신임 팀장이 바로 육아휴직 가면 어떻게 보일까 고민'
      ]
    },
    team: {
      size: 12,
      seniorCount: 4,
      juniorCount: 8,
      composition: '팀장 1명 + 시니어 결산 담당 과장 2명(13년차, 11년차) + 시니어 세무 담당 2명(9년차, 7년차) + 주니어 일반회계 담당 4명(2-4년차) + 주니어 채권채무 담당 3명(1-3년차) + 신입 1명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: '시니어 1명(Advanced) + 시니어 3명(Intermediate) + 주니어 6명(Intermediate) + 주니어 2명(Beginner)',
      teamDynamics: '13년차 남성 과장은 여성 팀장을 은근히 무시하는 태도. 11년차 과장은 곧 승진 심사라 눈치 보며 일함. 주니어들은 여성 팀장이라 편하게 다가오지만 가끔 너무 사적인 상담 요청. 신입은 실수 연발로 시니어들이 "요즘 애들은..."이라며 한숨.',
      resistanceFactors: [
        '시니어들의 "회계는 실수하면 감옥 간다"는 극도의 보수성',
        '전임 남성 팀장과 계속 비교하는 분위기',
        '새로운 시스템 도입에 "배우기 귀찮다"는 중견 직원들',
        '세무 당국 세무조사 두려움으로 "전례 따르기"만 고집'
      ]
    },
    work: {
      mainTasks: [
        '월/분기/반기/연간 결산 및 재무제표 작성 (상장사 공시 기준 준수)',
        '외부 회계 감사 대응 (연간 감사, 분기 검토)',
        '세무 신고 및 세무 조사 대응 (법인세, 부가세, 원천세 등)',
        '내부 회계 관리 제도 운영 및 평가',
        '각 사업부 회계 이슈 컨설팅 및 지원'
      ],
      dailyWorkflow: '오전 7시 출근 → 전일 전표 검토 및 승인 → 8시 반 각종 회계 뉴스 및 세법 개정사항 체크 → 9시 팀 아침 회의(10분, 당일 우선순위 공유) → 오전 중 시니어들과 결산 이슈 논의, 주니어들 전표 작성 지도 → 점심 후 1-3시 타 부서 회계 문의 응대(하루 평균 10건) → 3-5시 감사법인 또는 세무 당국 대응 → 5-7시 보고서 작성 및 검토 → 퇴근 전 내일 업무 준비 (결산 기간은 밤 10-11시)',
      weeklyRoutine: '월요일: 주간 회계 이슈 점검 및 공시 일정 확인 / 화요일: 세무 신고 준비 및 검토 / 수요일: CFO 정례 보고(월 2회) / 목요일: 외부 감사인 대응 또는 내부 감사 / 금요일: 주간 결산 마감 및 차주 준비, 팀원 개별 면담(월 1회)',
      collaboration: '팀 내는 SAP 메신저와 이메일 중심. 결산 시즌에는 거의 붙어서 작업. 타 부서와는 회계 처리 가이드라인 이메일로 전달하지만 지켜지지 않아 매번 전화 설명. 감사법인과는 이메일 + 대면 미팅 + 감사 시즌 상주. 세무 당국과는 전자 신고 시스템 + 필요시 방문.',
      toolsUsed: ['SAP FI', 'Excel', 'PowerPoint', '국세청 홈택스', '금감원 DART', '더존 세무 프로그램', 'Teams'],
      painPoints: [
        '매월 결산 마감일(D+5)에 각 부서가 자료 늦게 제출해서 팀 전체가 밤샘 작업',
        '회계 기준과 세법이 자주 바뀌는데 팀원 교육할 시간이 없어 각자 알아서 공부',
        '감사인이 계속 추가 자료 요청하는데 "작년에도 준 자료"를 또 달라고 해서 비효율',
        '주니어들이 만든 전표를 시니어가 일일이 검토하는데 단순 실수가 많아 시간 낭비',
        'Excel로 만든 결산 체크리스트가 200개 항목이나 되는데 수작업으로 체크'
      ],
      automationNeeds: [
        '전표 자동 검증 시스템 (계정과목, 금액, 거래처 등 자동 체크)',
        '결산 체크리스트 자동화 및 진행 현황 대시보드',
        '감사 자료 요청 대응 자동화 (작년 자료 자동 업데이트)',
        '세법 개정사항 자동 알림 및 영향도 분석'
      ],
      workStructure: {
        level: '고도구조화',
        description: '회계 기준(K-IFRS)과 세법에 따른 엄격한 프로세스. 내부 통제 시스템으로 이중 삼중 검증. 모든 것이 문서화되고 감사 받음. 하지만 그만큼 경직되어 있고 개선 여지 없이 반복 작업 많음.'
      },
      realTimeExample: '지난 분기 결산 마감 D+4, 오후 8시. 감사인이 "매출 인식 기준 변경 필요"라고 통보. 이미 전표 5,000건 입력 완료 상태. 시니어들은 "다시 다 뒤집어야 해?"라며 패닉. 팀장은 CFO에게 마감 연장 요청했지만 "상장사 공시 기한은 못 바꾼다" 거절. 결국 12명 전원이 새벽 4시까지 작업. 다음날 9시 공시는 성공했지만 팀원 2명이 번아웃으로 병가.',
      typicalFireDrills: [
        '국세청 "세무조사 사전 통지" - 3년치 자료를 일주일 내 준비',
        '감사인 "중요한 회계 오류 발견" - 재무제표 전체 수정',
        'CFO "이익 목표 미달, 회계적으로 해결책 찾아라" - 윤리적 딜레마',
        '금융감독원 "회계 감리 대상 선정" - 전사 비상'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        '여성 팀장으로서 "능력 있다"는 인정을 받고 싶음',
        '팀원들 야근 줄여서 "좋은 팀장"이라는 평가 받고 싶음',
        '시니어 과장들도 인정할 만한 혁신 성과를 만들고 싶음',
        '다른 회사는 결산을 어떻게 효율화했는지 배우고 싶음'
      ],
      deepConcerns: [
        '회계팀 특성상 실수는 절대 용납 안 되는데 새로운 시도가 리스크가 될까봐',
        '워크샵 참석도 "일 제대로 안 하고 교육이나 받는다"고 보일까봐',
        '혁신 시도했다가 감사 지적 받으면 팀장 자격 없다고 보일까봐',
        '나이 많은 시니어들이 "젊은 여자 팀장이라 현실을 모른다"고 수군댈까봐'
      ],
      successMetrics: [
        '결산 기간을 단 하루라도 단축하는 구체적 방법',
        '팀원들 실수를 사전에 방지하는 시스템',
        '감사인 대응 시간을 줄이는 방법',
        '팀원들이 자발적으로 따를 만한 혁신 아이디어'
      ],
      dropoutRisk: 25,
      dropoutTriggers: [
        '결산 마감 주간과 겹치는 경우',
        '감사인 방문 일정과 겹치는 경우',
        '세무 신고 기한이 임박한 경우',
        '강사가 회계 실무를 모르고 일반론만 얘기하는 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Intermediate 수준이라 너무 고급 내용은 따라가기 어려울 듯',
        '회계는 법규 준수가 핵심인데 자동화가 오히려 리스크 아닐까',
        '12명 대규모 팀 변화 관리가 쉽지 않을 것 같음'
      ],
      dropoutRisk: 25
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium',
      stressLevel: 8,
      confidenceLevel: 5
    }
  },
  {
    id: 'P023',
    name: '박성우',
    age: 36,
    company: 'SK이노베이션',
    department: '자금팀',
    role: '팀장',
    category: 'Finance',
    leaderProfile: {
      yearsInRole: 0.6,
      previousRole: '자금 파트 리더 (6년 경력)',
      promotionReason: '환율 헤지 전략으로 연간 200억 환차익 실현, 금융 비용 15% 절감하여 최연소 팀장 승진',
      leadershipStyle: '리스크 관리와 수익 극대화 사이에서 균형 추구. 시장 변동성에 민감하게 반응하나 팀원들에게 불안감 전달 않으려 노력.',
      biggestChallenge: '매일 오전 CEO에게 자금 현황 보고하는 압박감과 실시간 환율 변동에 따른 즉각 대응 스트레스',
      hiddenStruggles: [
        '환율이 급변할 때마다 "어제 왜 안 했냐"는 경영진 질책이 두려워 매일 새벽 2시에도 글로벌 시장 체크',
        '5명 소규모 팀이라 한 명만 휴가 가도 업무 마비되는데 팀원들 휴가 독려해야 하는 딜레마',
        '본인이 내린 헤지 결정이 손실로 이어질 때마다 "팀장 자격이 있나" 자책',
        '타 부서에서 "자금팀은 돈만 굴리는 부서"라고 무시하는 시선이 속상함'
      ]
    },
    team: {
      size: 5,
      seniorCount: 2,
      juniorCount: 3,
      composition: '팀장 1명 + 시니어 외환 담당 1명(8년차) + 시니어 자금 조달 담당 1명(7년차) + 주니어 자금 운용 담당 2명(2-3년차) + 주니어 리포팅 담당 1명(1년차)',
      digitalMaturity: 'Advanced',
      maturityDistribution: '시니어 2명(Expert - Bloomberg/Reuters 능통) + 주니어 2명(Advanced) + 주니어 1명(Intermediate)',
      teamDynamics: '소수 정예로 긴밀하지만 업무 강도가 높아 항상 팽팽한 긴장감. 시니어 외환 담당자는 딜링룸 10년 경력으로 팀장보다 시장 경험 많음. 주니어들은 금융 전문성 부족으로 단순 리포팅 업무만 담당. 실시간 대응 필요해 점심도 따로 먹는 살벌한 분위기.',
      resistanceFactors: [
        '실시간 시장 대응 때문에 "새로운 걸 배울 시간이 없다"는 핑계',
        '금융 시장은 변수가 많아서 "자동화는 위험하다"는 선입견',
        '소규모 팀이라 "우리끼리 잘 통하는데 왜 바꾸냐"는 안주',
        '타 부서와 다른 특수성을 강조하며 "우리는 달라"라는 고립'
      ]
    },
    work: {
      mainTasks: [
        '일일 자금 포지션 관리 및 유동성 확보 (일평균 5,000억원 규모)',
        '환율/금리 리스크 헤지 전략 수립 및 실행 (월 평균 20건 헤지 거래)',
        '단기/장기 자금 조달 (회사채 발행, 은행 차입 등 연간 2조원)',
        'Cash Pooling 시스템 운영 (국내외 30개 계열사)',
        'CEO 직보 - 일일 자금 현황 및 시장 동향 (매일 오전 8시)'
      ],
      dailyWorkflow: '오전 6시 반 출근 → Bloomberg/Reuters에서 밤새 시장 동향 체크 → 7시 전일 포지션 정리 및 당일 자금 계획 수립 → 8시 CEO 보고(화상) → 9시 은행 딜러들과 통화하며 시장 정보 수집 → 10-12시 헤지 거래 실행 및 모니터링 → 점심은 책상에서 김밥으로 때우며 시장 주시 → 오후 1-3시 자금 조달/운용 실행 → 3-5시 계열사 자금 요청 대응 → 5-6시 일일 결과 정리 및 내일 계획 → 퇴근 후에도 뉴욕 시장 오픈 체크',
      weeklyRoutine: '월요일: 주간 자금 계획 수립 및 CFO 보고 / 화요일: 은행 RM들과 정례 미팅 / 수요일: 환리스크 위원회 참석 / 목요일: 계열사 자금 담당자 회의 / 금요일: 주간 성과 분석 및 차주 전략 수립',
      collaboration: '팀 내는 Bloomberg 메신저로 실시간 소통. 시장 급변 시 음성으로 즉각 대응. 은행들과는 전화 + Reuters Dealing + 이메일. 계열사와는 Cash Pooling 시스템이 있지만 실제로는 전화 요청이 대부분. CEO/CFO 보고는 화상회의 시스템.',
      toolsUsed: ['Bloomberg Terminal', 'Reuters Eikon', 'SAP Treasury', 'Excel', 'Python(일부)', 'Cash Pooling System', 'Teams'],
      painPoints: [
        '매일 오전 8시 CEO 보고 준비로 새벽 출근이 일상화, 워라밸 최악',
        '실시간 환율 변동을 24시간 모니터링해야 하는데 5명이서 교대 불가능',
        '각 은행별 금리 조건을 Excel로 수작업 비교하느라 최적 조달 시점 놓침',
        '계열사들이 Cash Pooling 시스템 안 쓰고 급하게 전화로 자금 요청',
        '헤지 성과를 설명하기 어려워 경영진은 늘 "왜 손실이냐"고만 질책'
      ],
      automationNeeds: [
        '환율/금리 자동 알림 시스템 (설정 범위 이탈 시 즉시 알림)',
        '은행별 금리 조건 실시간 비교 대시보드',
        'CEO 보고 자료 자동 생성 (데이터 입력하면 보고서 완성)',
        '헤지 시뮬레이션 및 성과 분석 자동화'
      ],
      workStructure: {
        level: '고도구조화',
        description: '자금 관리 프로세스와 리스크 한도는 명확히 정의. Bloomberg/Reuters로 실시간 모니터링. 하지만 의사결정은 순간적 판단에 의존. 시장 변동성 때문에 계획보다는 대응 위주.'
      },
      realTimeExample: '지난주 목요일 오후 3시, 美 FOMC 깜짝 금리 인상으로 원/달러 환율 20원 급등. CEO가 즉시 호출 "왜 헤지 안 했나?" 질책. 시니어 외환 담당자는 "예상 밖이었다"고 변명. 팀장은 즉시 50억 달러 헤지 실행 결정했으나 이미 환율 손실 100억 발생. 다음날 아침 회의에서 CFO가 "자금팀장 역량이 의심된다"고 공개 비판. 팀 전체 사기 저하.',
      typicalFireDrills: [
        'CEO "달러가 왜 이렇게 올랐나? 즉시 설명하라" - 새벽 3시 호출',
        '계열사 "내일까지 500억 긴급 필요" - 자금 계획 전면 수정',
        '주거래 은행 "신용등급 조정으로 금리 인상" - 긴급 차입선 변경',
        '환율 급변동으로 헤지 포지션 마진콜 - 추가 담보 긴급 조달'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        'CEO 보고 부담을 덜 수 있는 자동화 방법을 찾고 싶음',
        '24시간 시장 모니터링 스트레스에서 벗어나고 싶음',
        '자금팀의 전문성을 인정받을 수 있는 가시적 성과를 만들고 싶음',
        '5명 소규모 팀도 효율적으로 운영하는 노하우를 배우고 싶음'
      ],
      deepConcerns: [
        '실시간 시장 대응 업무라 3시간 자리 비우는 것도 불안함',
        '자금 운용은 특수 영역인데 일반적인 업무 개선 방법이 맞을까',
        'CEO가 "쓸데없는 교육 받지 말고 시장이나 봐라"고 할까봐',
        '워크샵에서 배운 걸 적용하다가 손실 나면 책임질 자신 없음'
      ],
      successMetrics: [
        'CEO 보고 준비 시간을 30분이라도 단축하는 방법',
        '환율/금리 모니터링을 자동화해서 새벽 출근 안 하는 방법',
        '5명 팀원이 번아웃 없이 지속 가능하게 일하는 방법',
        '헤지 성과를 경영진이 이해하기 쉽게 설명하는 방법'
      ],
      dropoutRisk: 15,
      dropoutTriggers: [
        '환율/금리 급변동으로 시장 대응이 필요한 경우',
        'CEO 긴급 호출이 오는 경우',
        '은행 RM과의 중요 미팅이 잡힌 경우',
        '워크샵 내용이 제조업 중심이어서 금융과 동떨어진 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Advanced 수준이지만 금융 특화 자동화는 어려울 것',
        '실시간 의사결정이 중요한데 프로세스 정형화가 맞을까',
        '5명 소규모 팀이라 대규모 변화는 현실적이지 않을 듯'
      ],
      dropoutRisk: 15
    },
    personality: {
      patience: 8,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 10,
      confidenceLevel: 6
    }
  },

  {
    id: 'P024',
    name: '정은비',
    age: 41,
    company: 'SK네트웍스',
    department: '원가관리팀',
    role: '팀장',
    category: 'Finance',
    leaderProfile: {
      yearsInRole: 1.2,
      previousRole: '원가 분석 시니어 (8년 경력)',
      promotionReason: '반도체 사업부 원가 절감 프로젝트에서 연간 47억원 절감 달성, BOM(자재명세서) 표준화로 원가 산정 오류율 68% 감소시켜 승진',
      leadershipStyle: '정확한 데이터 기반 의사결정. 원가 절감을 최우선 가치로 두지만, 생산/구매 부서와의 협업 조율이 어려워 답답함을 느낌.',
      biggestChallenge: '생산/구매 부서가 원가팀을 "감시자"로 인식해 데이터 공유를 꺼리고, 원가 절감 제안을 "현장을 모른다"며 무시하는 것',
      hiddenStruggles: [
        '경영진은 "원가 더 줄여라"만 하고, 현장은 "품질 떨어진다"고 저항하는 샌드위치 신세',
        '원가 절감 성과를 냈는데도 "원가팀이 한 게 뭐냐, 현장이 노력한 거지"라는 평가에 속상함',
        '복잡한 원가 구조를 경영진에게 설명해도 "결론만 말해"라고 해서 전문성 인정 못 받는 느낌',
        '타 부서 회의에서 "원가팀 때문에 일만 늘어난다"는 뒷담화를 듣고도 모른 척해야 하는 서러움'
      ]
    },
    team: {
      size: 6,
      seniorCount: 3,
      juniorCount: 3,
      composition: '팀장 1명 + 시니어 원가 분석가 2명(9년차, 6년차) + 시니어 원가 기획 담당 1명(7년차) + 주니어 원가 집계 담당 2명(2-3년차) + 주니어 데이터 관리 담당 1명(1년차)',
      digitalMaturity: 'Intermediate',
      maturityDistribution: '시니어 2명(Advanced) + 시니어 1명(Intermediate) + 주니어 3명(Intermediate~Beginner)',
      teamDynamics: '시니어 분석가 2명은 각자 전문 영역(자재비, 가공비)이 달라 서로 간섭 안 함. 원가 기획 담당은 곧 이직 예정이라 소극적. 주니어들은 단순 데이터 입력 업무만 해서 성장 기회 부족으로 불만. 팀 전체가 타 부서에 "원가 깎는 나쁜 팀"으로 인식되어 고립감 느낌.',
      resistanceFactors: [
        '생산팀의 "원가만 생각하면 품질은 어떻게 하냐"는 반발',
        '구매팀의 "납기가 우선이지 원가는 나중 문제"라는 무시',
        '원가 시스템(SAP CO) 변경에 "배우기 어렵다"는 거부감',
        '타 부서와 데이터 공유에 "우리 부서 약점 잡으려는 거냐"는 경계심'
      ]
    },
    work: {
      mainTasks: [
        '반도체/디스플레이/배터리 3개 사업부 제품별 원가 계산 및 월간 분석 (월평균 120개 제품)',
        '사업부별 원가 절감 과제 발굴 및 실행 관리 (분기당 15-20개 과제)',
        '표준 원가 설정 및 실제 원가와의 차이 분석 (월 1회 경영진 보고)',
        '생산/구매/품질 부서에 원가 개선 컨설팅 제공',
        'BOM(자재명세서) 정확성 검증 및 원가 시뮬레이션'
      ],
      dailyWorkflow: '오전 8시 반 출근 → 전날 생산 실적 데이터 확인(SAP CO) → 9시 원가 차이 발생 항목 체크(자재비, 노무비, 경비) → 10시 시니어들과 원가 이슈 논의(30분) → 오전 중 생산/구매 부서에서 원가 문의 전화 5-7건 응대 → 점심 후 1시부터 주니어들이 입력한 원가 데이터 검증 및 피드백 → 오후 3시쯤 원가 절감 과제 진행 상황 체크(이메일로 각 부서에 독촉) → 오후 4-6시 Excel로 월간 원가 분석 보고서 작성 → 퇴근 전 내일 경영진 보고 자료 최종 점검',
      weeklyRoutine: '월요일 오전: 주간 원가 이슈 회의(1시간, 시니어들과 함께) / 화요일: 생산팀 회의 참석해서 원가 관점 의견 제시 / 수요일 오후: 구매팀과 자재비 절감 방안 협의 / 목요일: 사업부별 원가 절감 과제 점검 회의(각 1시간씩 3건) / 금요일: 월간 원가 분석 보고서 작성 및 경영진 보고 준비',
      collaboration: '팀 내에서는 이메일과 SAP CO 메모 기능으로 소통. 생산/구매 부서와는 전화와 이메일이 주요 수단. 원가 절감 과제는 Excel 파일을 이메일로 주고받으며 관리. 사업부 회의 참석 시 PowerPoint 자료 준비. 데이터 공유는 공용 폴더에 Excel 파일 저장.',
      toolsUsed: ['SAP CO', 'Excel', 'PowerPoint', 'Access', '이메일', '전화'],
      painPoints: [
        '제품별 원가 데이터를 SAP CO, 생산 실적 시스템, 구매 시스템에서 수작업으로 취합해서 주당 15시간 소요',
        '원가 차이 발생하면 원인 분석을 수동으로 해야 해서 근본 원인 파악이 늦음',
        '생산 부서에 원가 개선 제안을 이메일로만 전달하는데 실행 여부 추적이 안 됨',
        '주니어들이 원가 데이터 입력할 때 실수가 많은데 일일이 검증하느라 시간 부족',
        '월간 보고서 작성할 때 경영진이 원하는 인사이트를 뽑아내기 어려움'
      ],
      automationNeeds: [
        '여러 시스템 원가 데이터를 자동 통합하는 대시보드',
        '원가 차이 원인 자동 분석 (자재/노무/경비별 기여도 계산)',
        '원가 개선 과제 관리 시스템 (부서별 실행 현황 추적)',
        '원가 시뮬레이션 자동화 (What-if 분석)'
      ],
      workStructure: {
        level: '고도구조화',
        description: '원가 계산 프로세스는 명확히 정의되어 있고 SAP CO로 시스템화됨. 월간 원가 분석 회의가 정례화되어 있고 표준 원가 체계가 확립됨. 하지만 원가 데이터 통합과 분석은 수작업 의존도가 높음.'
      },
      realTimeExample: '지난달 경영진 회의에서 CEO가 "경쟁사 대비 원가가 왜 15% 높냐?"고 질문. 팀장이 복잡한 원가 구조를 설명하려 했지만 "핵심만 말해"라고 제지. 결국 "3개월 내 10% 절감하겠다"고 약속. 생산팀에 절감 방안 요청했더니 "원가팀이 현장도 모르면서 무리한 요구한다"고 거부. 구매팀은 "단가 인하하면 품질 문제 생긴다"고 반대. 혼자서 절감 방안 만들어 제출했지만 실행은 요원한 상태.',
      typicalFireDrills: [
        'CEO "원가가 왜 올랐나? 30분 내 설명하라" - 긴급 분석',
        '생산팀 "원가 계산 틀렸다, 재계산하라" - 데이터 전면 검증',
        '구매팀 "원자재 가격 급등, 판가 인상 필요" - 영향도 분석',
        '품질 클레임 발생 "원가 절감 때문이다" - 원인 분석 및 해명'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        '타 부서와 협업할 수 있는 실질적인 방법을 찾고 싶음',
        '원가 데이터 통합 자동화로 분석에 집중하고 싶음',
        '경영진에게 원가의 중요성을 각인시킬 수 있는 스토리텔링 배우고 싶음',
        '원가팀의 부정적 이미지를 개선할 수 있는 방법을 찾고 싶음'
      ],
      deepConcerns: [
        '원가는 민감한 정보인데 자동화하면 보안 문제 생길까봐',
        '워크샵이 일반적인 내용이어서 원가 관리 특수성을 반영 못할까봐',
        '6명 소규모 팀이 큰 변화를 주도하기엔 영향력이 부족한데',
        '새로운 시도했다가 원가 계산 오류 나면 큰일날까봐'
      ],
      successMetrics: [
        '타 부서가 자발적으로 원가 절감에 참여하게 만드는 방법',
        '원가 데이터 통합을 자동화해서 분석 시간 확보',
        '경영진 보고 시간을 절반으로 줄이는 방법',
        '팀원들이 단순 작업 대신 부가가치 업무 하는 방법'
      ],
      dropoutRisk: 30,
      dropoutTriggers: [
        '월말 원가 마감 기간과 겹치는 경우',
        '경영진 긴급 원가 분석 요청이 오는 경우',
        '생산/구매팀과의 갈등이 심화되는 경우',
        '워크샵이 원가와 무관한 내용인 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Intermediate 수준이라 너무 고급 자동화는 어려울 듯',
        '원가는 정확성이 생명인데 새 도구 도입이 리스크일 수 있음',
        '타 부서와의 갈등을 기술로 해결할 수 있을까'
      ],
      dropoutRisk: 30
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium',
      stressLevel: 7,
      confidenceLevel: 5
    }
  },

  {
    id: 'P025',
    name: '한지훈',
    age: 38,
    company: 'SK E&S',
    department: '경영관리팀',
    role: '팀장',
    category: 'Finance',
    leaderProfile: {
      yearsInRole: 1.0,
      previousRole: '경영 분석 시니어 (7년 경력)',
      promotionReason: '신재생에너지 사업 수익성 분석 모델 개발로 투자 의사결정 속도 40% 단축, CFO 특별 보고에서 데이터 기반 전략 제안 능력 인정받아 승진',
      leadershipStyle: '전략적 사고와 데이터 기반 의사결정 중시. 월간 경영 리뷰에서 경영진에게 인사이트 전달하는 것을 중요하게 여기지만, IR 담당과 사업기획팀 간 업무 조율에 어려움.',
      biggestChallenge: '매월 이사회 보고 자료 70-80페이지를 3일 만에 만들어야 하는데, 각 사업부에서 데이터 늦게 주고 경영진은 계속 수정 요구하는 압박',
      hiddenStruggles: [
        'CFO가 "네가 만든 자료로 이사회 설득 못하면 책임져"라고 압박할 때마다 부담감에 불면증',
        '시니어 분석가 2명이 Python으로 복잡한 분석하는데 본인은 이해 못해도 아는 척해야 하는 상황',
        'IR 담당이 "경영관리팀은 숫자만 안다"며 무시하는 태도에 자존심 상함',
        '주말마다 경영진 특명으로 전략 분석하느라 가족과 시간 못 보내는 죄책감'
      ]
    },
    team: {
      size: 7,
      seniorCount: 4,
      juniorCount: 3,
      composition: '팀장 1명 + 시니어 경영 분석가 2명(10년차, 8년차) + 시니어 사업 기획 담당 1명(9년차) + 시니어 IR 담당 1명(6년차) + 주니어 사업 기획 담당 1명(3년차) + 주니어 데이터 분석 담당 2명(1-2년차)',
      digitalMaturity: 'Advanced',
      maturityDistribution: '시니어 2명(Expert, Python/Tableau 능통) + 시니어 2명(Advanced) + 주니어 3명(Intermediate)',
      teamDynamics: '10년차 시니어 분석가는 데이터 분석 실력은 뛰어나지만 보고서 작성을 "하급 업무"라며 기피. 8년차는 차기 팀장 노리며 팀장 실수 기다림. IR 담당은 별도 라인으로 CEO 직보하며 독립적. 주니어들은 Python 못해서 시니어들 분석 결과만 PowerPoint로 옮기는 단순 작업.',
      resistanceFactors: [
        'Python 잘하는 시니어들의 "Excel은 구시대 유물"이라는 우월감',
        'IR 담당의 "투자자 대응이 우선"이라며 팀 업무 비협조',
        '사업부의 "경영관리는 숫자 놀이만 한다"는 편견으로 데이터 늦게 제공',
        '경영진의 "분석은 그만하고 결론만"이라는 태도로 전문성 무시'
      ]
    },
    work: {
      mainTasks: [
        '월간/분기별 경영 실적 분석 및 이사회 보고 자료 작성 (매월 70-80페이지 분량)',
        '신재생에너지/LNG/수소 사업부별 수익성 분석 및 KPI 모니터링',
        '투자자 관계(IR) 자료 준비 및 애널리스트 미팅 지원 (분기당 3-4회)',
        '중장기 사업 계획 수립 지원 (연간 사업계획, 3개년 전략)',
        '경영진 긴급 요청 분석 (경쟁사 분석, M&A 타당성 검토 등)'
      ],
      dailyWorkflow: '오전 8시 반 출근 → Bloomberg에서 전일 에너지 시장 동향 체크 → 9시 Tableau 대시보드로 전일 사업부별 실적 확인 → 10시 시니어 분석가들과 데일리 이슈 공유(30분) → 오전 중 주니어들이 작성한 분석 리포트 검토 및 피드백 → 점심 후 1시부터 경영진 요청 분석 작업(예: CFO가 요청한 경쟁사 수익성 비교) → 오후 3시쯤 IR 담당과 분기 실적 자료 협의 → 오후 4-6시 월간 경영 보고서 작성(SAP BW에서 데이터 추출 후 Excel/PowerPoint 정리) → 퇴근 전 내일 이사회 보고 최종 리허설',
      weeklyRoutine: '월요일 오전: 주간 경영 이슈 회의(1시간, 전 팀원 참석) / 화요일: 사업부별 실적 리뷰 회의(각 사업부 1시간씩) / 수요일 오후: CFO 주간 보고(30분) 및 경영진 요청 사항 논의 / 목요일: 시니어들과 1:1 면담(각 30분, 분석 품질 피드백) / 금요일: 주니어들 그룹 멘토링(1시간, 분석 방법론 교육) 및 다음주 분석 계획 수립',
      collaboration: '팀 내에서는 Slack으로 실시간 소통하고 Notion에 분석 프로젝트별 진행 상황 기록. 사업부와는 이메일+월 1회 정기 미팅. IR 담당은 별도 팀이라 협업 시 이메일로만 데이터 주고받음. 경영진 보고는 PowerPoint로 작성 후 이메일 제출. Python 코드는 GitHub에서 공유하지만 시니어 2명만 활용.',
      toolsUsed: ['SAP BW', 'Excel', 'PowerPoint', 'Tableau', 'Python', 'Bloomberg', 'Slack', 'Notion', 'GitHub'],
      painPoints: [
        '월간 경영 보고서 작성이 반복 작업인데 SAP BW에서 데이터 추출 → Excel 가공 → PowerPoint 작성을 매번 수동으로 해서 주당 12시간 소요',
        'KPI 데이터가 사업부별로 분산되어 있어서 통합 모니터링 어려움',
        'IR 자료 준비 시 최신 재무 데이터를 여러 곳에서 수집해야 해서 시간 많이 걸림',
        '경영진 긴급 요청이 들어오면 기존 계획 다 미루고 우선 처리해야 함',
        '시니어 분석가 2명은 Python 잘 쓰는데 나머지 팀원은 Excel만 써서 협업 어려움'
      ],
      automationNeeds: [
        '월간 경영 보고서 자동 생성 (SAP BW 데이터 → PowerPoint 템플릿 자동 채우기)',
        'KPI 통합 대시보드 (실시간 업데이트, 사업부별 드릴다운 가능)',
        'IR 데이터 자동 업데이트 (재무/사업 데이터 자동 취합 및 표준 형식 변환)',
        'Python-Excel 브릿지 도구 (팀원 간 분석 결과 공유 원활화)'
      ],
      workStructure: {
        level: '고도구조화',
        description: '경영 분석 프로세스는 명확히 체계화되어 있고 SAP BW/Tableau로 고급 분석 수행. 월간 경영 리뷰와 사업부별 실적 점검 회의가 정례화됨. 시니어 2명은 Python으로 고급 분석하지만 나머지는 Excel 중심.'
      },
      realTimeExample: '지난주 수요일 오후 4시, CFO가 "내일 이사회인데 경쟁사 대비 수익성 분석 추가해"라고 지시. 이미 70페이지 보고서 완성한 상태. 시니어 분석가는 "Python으로 3시간이면 된다"고 했지만 결과를 PowerPoint로 옮기는데 추가 3시간. IR 담당은 "그런 분석은 투자자가 관심 없다"며 비협조. 팀장이 밤 12시까지 작업해서 겨우 완성. 다음날 이사회에서 해당 페이지는 1분도 안 봄.',
      typicalFireDrills: [
        'CEO "우리가 업계 몇 위야? 내일까지 벤치마킹 자료" - 밤샘 분석',
        'CFO "이 숫자 틀렸다, 전체 다시 계산해" - 보고서 전면 수정',
        'IR "내일 애널리스트 미팅, 실적 자료 급히 필요" - 긴급 자료 작성',
        '사업부 "전략 수정했으니 KPI도 바꿔달라" - 지표 재설계'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        '반복되는 보고서 작성 지옥에서 벗어나고 싶음',
        'Python 못해도 팀장으로서 리더십 발휘할 수 있는 방법 찾고 싶음',
        '사업부와 IR 사이에서 조율하는 스킬을 배우고 싶음',
        '경영진에게 전문성 인정받을 수 있는 보고 방법 알고 싶음'
      ],
      deepConcerns: [
        'Advanced 팀인데 워크샵 내용이 너무 기초적이면 시간 낭비',
        '시니어들이 "우리가 더 잘 아는데"라며 무시할까봐',
        '경영진이 "쓸데없는 교육 받지 말고 분석이나 제대로 해"라고 할까봐',
        '새로운 시도했다가 이사회 보고 실수하면 큰일날까봐'
      ],
      successMetrics: [
        '월간 보고서 작성 시간을 절반으로 줄이는 방법',
        'Python과 Excel 사용자 간 협업 개선 방법',
        '경영진이 원하는 인사이트를 빠르게 도출하는 방법',
        '사업부 데이터를 제때 받을 수 있는 협상 방법'
      ],
      dropoutRisk: 10,
      dropoutTriggers: [
        '이사회 준비 기간과 겹치는 경우',
        'CFO 긴급 호출이 오는 경우',
        'IR 관련 긴급 이슈가 발생하는 경우',
        '내용이 너무 기초적이어서 도움 안 되는 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Advanced 수준에서 더 배울 게 있을까',
        '이미 Python/Tableau 쓰는데 추가 자동화가 필요할까',
        '7명 팀의 스킬 갭을 어떻게 해결할 수 있을까'
      ],
      dropoutRisk: 10
    },
    personality: {
      patience: 9,
      techSavvy: 9,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 8,
      confidenceLevel: 6
    }
  },  // ==================== IT (P026-P030) ====================
  {
    id: 'P026',
    name: '김도현',
    age: 36,
    company: 'SK텔레콤',
    department: 'IT기획팀',
    role: '팀장',
    category: 'IT',
    leaderProfile: {
      yearsInRole: 0.6,
      previousRole: 'IT 프로젝트 매니저 (6년 경력)',
      promotionReason: '5G 네트워크 관리 시스템 구축 프로젝트를 예산 내 2개월 조기 완료, 애자일 방법론 도입으로 개발 생산성 30% 향상시켜 최연소 팀장 승진',
      leadershipStyle: '기술 트렌드를 빠르게 캐치하고 도입하려 하지만, 레거시 시스템과 보수적인 조직 문화 사이에서 균형 잡기 어려워함.',
      biggestChallenge: '경영진은 "디지털 혁신"을 외치지만 예산은 작년 대비 동결, 현업은 "시스템 바꾸지 마라"고 저항하는 이중고',
      hiddenStruggles: [
        'CTO가 "왜 AWS 비용이 이렇게 많이 나오냐"고 질책할 때마다 클라우드 전환 결정을 후회',
        '10년 경력 시니어 개발자가 "애자일은 개발자 착취"라며 은근히 반발하는 걸 통제 못함',
        '현업 부서장들이 "IT가 뭘 아냐"며 무시하는 태도에 자존심 상하지만 참아야 함',
        '매일 새로운 기술 나오는데 공부할 시간 없어서 뒤처지는 것 같은 불안감'
      ]
    },
    team: {
      size: 8,
      seniorCount: 3,
      juniorCount: 5,
      composition: '팀장 1명 + 시니어 IT 기획자 2명(10년차, 8년차) + 시니어 비즈니스 분석가 1명(7년차) + 주니어 프로젝트 매니저 2명(3-4년차) + 주니어 IT 기획자 2명(1-2년차) + 계약직 컨설턴트 1명',
      digitalMaturity: 'Expert',
      maturityDistribution: '시니어 3명(Expert) + 주니어 3명(Advanced) + 주니어 2명(Intermediate)',
      teamDynamics: '10년차 시니어는 "옛날이 좋았다"며 새로운 시도에 회의적. 8년차는 이직 준비 중이라 프로젝트에 소극적. 비즈니스 분석가는 현업 출신이라 IT팀을 "기술만 아는 집단"으로 폄하. 주니어들은 최신 기술 배우고 싶어하지만 레거시 유지보수만 시켜서 불만.',
      resistanceFactors: [
        '시니어들의 "검증된 기술만 써야 한다"는 보수적 태도',
        '현업의 "IT는 지원 부서"라는 인식으로 주도권 안 줌',
        '경영진의 "ROI 증명해"라는 압박에 혁신 프로젝트 추진 어려움',
        '보안팀의 "새로운 건 다 위험하다"는 과도한 통제'
      ]
    },
    work: {
      mainTasks: [
        'IT 중장기 로드맵 수립 및 연간 IT 예산 계획 (연 500억 규모)',
        '디지털 전환 프로젝트 기획 및 PMO (동시 진행 프로젝트 5-7개)',
        '레거시 시스템 현대화 추진 (10년 이상 된 시스템 20개)',
        '현업 부서 IT 요구사항 분석 및 우선순위 조정',
        '외부 벤더 관리 및 계약 협상 (연간 계약 규모 200억)'
      ],
      dailyWorkflow: '오전 8시 반 출근 → Jira에서 프로젝트 진행 현황 체크 → 9시 데일리 스크럼(15분, 각 PM별 이슈 공유) → 10시 현업 부서와 요구사항 회의 → 11시 벤더 미팅 또는 기술 검토 → 점심 후 1-3시 프로젝트 이슈 대응 및 의사결정 → 3-4시 CTO 보고 자료 작성 → 4-6시 팀원 1:1 면담 또는 기술 스터디 → 퇴근 후 집에서 Udemy로 새로운 기술 공부',
      weeklyRoutine: '월요일: 주간 프로젝트 현황 리뷰(2시간) / 화요일: 아키텍처 위원회 참석 / 수요일: CTO 주간 보고 및 현업 부서장 회의 / 목요일: 벤더 정례 미팅 및 계약 검토 / 금요일: 스프린트 회고 및 차주 계획',
      collaboration: 'Jira로 프로젝트 관리, Confluence로 문서화, Slack으로 실시간 소통. 현업과는 ServiceNow로 요청 접수하지만 실제로는 전화/이메일이 대부분. 벤더와는 주 1회 정례 미팅 + 수시 이메일. CTO 보고는 PowerPoint로 작성 후 대면 보고.',
      toolsUsed: ['Jira', 'Confluence', 'Slack', 'ServiceNow', 'Miro', 'Figma', 'AWS Console', 'GitHub', 'PowerPoint'],
      painPoints: [
        '현업 요구사항이 계속 바뀌는데 "IT가 융통성 없다"고 불평만 함',
        '5개 프로젝트가 동시에 진행되는데 리소스 부족으로 품질 이슈 빈발',
        '레거시 시스템 유지보수에 예산 70% 소진, 혁신 프로젝트 예산 부족',
        '벤더 의존도가 높은데 벤더는 "추가 비용" 요구만 반복',
        'CTO는 "왜 이렇게 오래 걸리냐"만 묻고 기술적 복잡도는 이해 안 함'
      ],
      automationNeeds: [
        '프로젝트 상태 자동 리포팅 (Jira 데이터 → 경영진 보고서)',
        '현업 요구사항 자동 분류 및 우선순위 제안',
        'IT 예산 집행 현황 실시간 모니터링',
        '벤더 성과 자동 평가 시스템'
      ],
      workStructure: {
        level: '고도구조화',
        description: '애자일/스크럼 방법론 확립. Jira/Confluence로 체계적 관리. 주간 스프린트와 월간 릴리즈 계획. 아키텍처 가버넌스와 보안 검토 프로세스 명확. 하지만 현업 요구사항 변경에는 애자일이라는 명목으로 수동적 대응.'
      },
      realTimeExample: '지난달 ERP 업그레이드 프로젝트 D-7일. 테스트 중 치명적 버그 발견. 벤더는 "원래 계약에 없던 요구사항"이라며 추가 비용 요구. 현업은 "일정 못 미루면 결산 못한다"고 압박. CTO는 "왜 사전에 못 잡았냐"고 질책. 결국 팀장이 주말 내내 직접 코드 분석해서 임시 해결책 제시. 팀원들과 48시간 연속 작업으로 겨우 오픈. 하지만 현업은 "IT가 준비 부족"이라고 평가.',
      typicalFireDrills: [
        'CEO "경쟁사는 이런 기능 있던데 우리는?" - 긴급 벤치마킹',
        '보안 사고 발생 "즉시 원인 파악하고 대책 마련" - 비상 대응',
        '시스템 장애 "30분 내 복구 안 되면 큰일" - 전팀 투입',
        'CTO "이 프로젝트 다음주까지 완료해" - 일정 대폭 단축'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        'IT팀의 전략적 가치를 경영진에게 인정받고 싶음',
        '현업과 IT 간의 갈등을 해결할 수 있는 방법 찾고 싶음',
        '레거시 시스템 현대화 예산을 확보할 수 있는 논리 개발하고 싶음',
        '다른 회사 IT팀장들과 네트워킹해서 고민 공유하고 싶음'
      ],
      deepConcerns: [
        'Expert 수준 팀인데 워크샵 내용이 너무 비IT적이면 도움 안 될 듯',
        'IT는 이미 애자일인데 또 프로세스 개선하라고 하면 피곤',
        '3시간 자리 비우면 프로젝트 이슈 터질까봐 불안',
        '시니어들이 "또 쓸데없는 교육"이라고 시니컬하게 볼까봐'
      ],
      successMetrics: [
        '현업과 IT 간 협업을 개선하는 구체적 방법론',
        '레거시 현대화 ROI를 경영진에게 설득하는 방법',
        '적은 예산으로 혁신 프로젝트 추진하는 노하우',
        '벤더 의존도를 줄이면서 품질 유지하는 방법'
      ],
      dropoutRisk: 5,
      dropoutTriggers: [
        '시스템 장애나 보안 사고가 발생하는 경우',
        'CTO 긴급 호출이 오는 경우',
        '프로젝트 Go-Live 일정과 겹치는 경우',
        '내용이 IT와 무관한 일반 관리론인 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Expert 수준에서 더 배울 게 있을까',
        'IT는 이미 최신 도구 다 쓰는데 추가로 뭘 할까',
        '현업과의 갈등을 기술로 해결할 수 있을까'
      ],
      dropoutRisk: 5
    },
    personality: {
      patience: 9,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 7,
      confidenceLevel: 7
    }
  },

  {
    id: 'P027',
    name: '이서연',
    age: 38,
    company: 'SK하이닉스',
    department: 'IT운영팀',
    role: '팀장',
    category: 'IT',
    leaderProfile: {
      yearsInRole: 0.8,
      previousRole: '시니어 시스템 엔지니어 (8년 경력)',
      promotionReason: '24/7 무중단 시스템 운영 체계 구축으로 가용성 99.99% 달성, 클라우드 마이그레이션으로 인프라 비용 30% 절감하여 승진',
      leadershipStyle: '안정성과 효율성을 최우선으로 하되, 새로운 기술 도입에도 적극적. 하지만 15명 대규모 팀 관리와 3교대 근무 조율에 어려움.',
      biggestChallenge: '반도체 공장은 1분 다운타임이 수십억 손실인데, 노후 장비 교체 예산은 계속 삭감되는 모순적 상황',
      hiddenStruggles: [
        '새벽 3시 장애 콜 받고 출근했는데 "대응이 늦다"고 질책받을 때의 억울함',
        '팀원 15명 중 3명이 번아웃으로 휴직 중인데 충원은 안 되고 업무는 늘어나는 압박',
        '여성 IT 팀장이라 "기술을 제대로 아냐"는 편견 어린 시선과 싸워야 함',
        '최신 기술 도입하고 싶지만 "검증 안 된 기술은 위험"이라는 반대에 좌절'
      ]
    },
    team: {
      size: 15,
      seniorCount: 6,
      juniorCount: 9,
      composition: '팀장 1명 + 시니어 인프라 엔지니어 3명(10-15년차) + 시니어 DB 관리자 2명(8-10년차) + 시니어 네트워크 엔지니어 1명(12년차) + 주니어 시스템 운영자 6명(2-5년차) + 주니어 모니터링 담당 3명(1-3년차)',
      digitalMaturity: 'Expert',
      maturityDistribution: '시니어 6명(Expert) + 주니어 6명(Advanced) + 주니어 3명(Intermediate)',
      teamDynamics: '15년차 시니어는 "여자가 IT 운영을 뭘 아냐"며 은근히 무시. 3교대 근무자들 간 정보 공유 안 되어 같은 장애 반복. DB 관리자들은 "우리가 제일 중요"하다며 타 파트 무시. 주니어들은 야간 근무와 장애 대응으로 지쳐서 이직 준비.',
      resistanceFactors: [
        '시니어들의 "15년 경험으로 하던 대로가 최고"라는 고집',
        '3교대 근무자들의 "교육 받을 시간이 없다"는 현실적 제약',
        '경영진의 "무중단이 최우선, 새로운 시도는 리스크"라는 압박',
        '현업의 "1분만 멈춰도 큰일, 절대 건드리지 마"라는 공포'
      ]
    },
    work: {
      mainTasks: [
        '반도체 생산 시스템 24/7 운영 (서버 500대, DB 50개)',
        '시스템 모니터링 및 장애 대응 (월평균 장애 15건)',
        '인프라 용량 관리 및 증설 계획',
        '보안 패치 및 시스템 업그레이드 (분기 1회 정기 작업)',
        '재해 복구(DR) 시스템 운영 및 모의 훈련'
      ],
      dailyWorkflow: '오전 7시 반 출근 → 야간조 인수인계(장애 현황, 작업 내역) → 8시 모니터링 대시보드 전체 점검 → 9시 팀 모닝 브리핑(긴급도별 이슈 분류) → 10-12시 정기 점검 및 성능 튜닝 → 점심 후 1-3시 변경 작업 또는 패치 적용 → 3시 교대조 인수인계 준비 → 4-5시 벤더 미팅 또는 용량 계획 → 5-7시 일일 보고서 작성 및 야간 작업 계획 → 집에서도 모니터링 앱으로 수시 확인',
      weeklyRoutine: '월요일: 주간 장애 리뷰 및 개선 대책 수립 / 화요일: 용량 관리 회의 / 수요일: 보안 패치 검토 및 테스트 / 목요일: DR 훈련 또는 백업 점검 / 금요일: 주말 작업 계획 및 당직 일정 조정',
      collaboration: 'PagerDuty로 장애 알림, Slack으로 실시간 소통. 3교대 간 인수인계는 구두+엑셀. 현업과는 ServiceNow로 요청 접수하지만 급한 건 다 전화. 벤더와는 장애 시 핫라인. 경영진 보고는 일일 메일 + 주간 대면.',
      toolsUsed: ['Zabbix', 'Grafana', 'PagerDuty', 'Ansible', 'Kubernetes', 'ServiceNow', 'Slack', 'Oracle EM', 'VMware vCenter'],
      painPoints: [
        '3교대 근무자 간 정보 단절로 같은 장애 반복 대응',
        '장애 원인 분석을 수동으로 해서 RCA 리포트 작성에 하루 걸림',
        '노후 장비 30%가 EOS(End of Service)인데 교체 예산 없음',
        '야간 장애 시 전문가 부재로 임시조치만 하고 근본 해결 못함',
        '15명 팀원 스케줄 관리가 엑셀인데 휴가/교육/당직 겹쳐서 혼란'
      ],
      automationNeeds: [
        '장애 패턴 분석 및 예측 시스템 (AIOps)',
        '3교대 인수인계 자동화 및 지식 공유 플랫폼',
        'RCA(Root Cause Analysis) 자동 생성',
        '팀원 스케줄 자동 최적화 (공정한 당직 배정)'
      ],
      workStructure: {
        level: '고도구조화',
        description: '운영 프로세스와 장애 대응 절차 명확히 문서화. 모니터링 임계치와 에스컬레이션 체계 확립. 변경 관리와 릴리즈 프로세스 엄격. 하지만 3교대 특성상 정보 공유와 지식 전달은 취약.'
      },
      realTimeExample: '지난주 일요일 새벽 2시, 핵심 DB 서버 디스크 풀 발생. 당직자(2년차)가 임시로 로그 삭제했지만 월요일 오전 같은 문제 재발. 15년차 시니어가 "왜 제대로 못했냐"고 질책. 알고 보니 3개월 전에도 같은 장애였는데 인수인계 안 됨. 팀장이 RCA 작성하느라 하루 종일 걸렸고, 경영진은 "운영팀 뭐하냐"고 질타. 팀원들은 "맨날 우리만 혼난다"며 사기 저하.',
      typicalFireDrills: [
        '생산 라인 멈춤 "즉시 복구하라, 1분에 10억 손실" - 초비상',
        '보안 취약점 발견 "24시간 내 전체 패치 완료" - 밤샘 작업',
        'CEO "왜 시스템이 느리냐" - 전방위 성능 점검',
        'DR 훈련 실패 "실제 재해 시 어쩔 거냐" - 시스템 재설계'
      ]
    },
    workshopPsychology: {
      initialAttitude: '회의적',
      hiddenMotivations: [
        '3교대 근무와 장애 대응 스트레스를 줄일 방법을 찾고 싶음',
        '여성 IT 팀장으로서 기술 리더십을 인정받고 싶음',
        '팀원들의 번아웃을 막고 work-life balance를 지켜주고 싶음',
        '노후 인프라 교체 예산을 확보할 설득 논리를 개발하고 싶음'
      ],
      deepConcerns: [
        'Expert 팀이 이미 최신 도구 다 쓰는데 워크샵이 뭘 더 줄까',
        '3시간 자리 비우면 장애 터질까봐 불안',
        '15명 대규모 팀에 적용하기엔 너무 일반적인 내용일 듯',
        '운영은 혁신보다 안정이 우선인데 쓸데없는 변화 강요할까봐'
      ],
      successMetrics: [
        '장애 대응 시간을 30% 단축하는 구체적 방법',
        '3교대 팀의 지식 공유를 활성화하는 방법',
        '팀원 번아웃을 예방하는 운영 체계',
        '경영진에게 인프라 투자 필요성을 설득하는 방법'
      ],
      dropoutRisk: 5,
      dropoutTriggers: [
        '크리티컬 시스템 장애가 발생하는 경우',
        '보안 사고나 침해 시도가 감지되는 경우',
        '정기 작업 일정과 겹치는 경우',
        '내용이 개발 중심이어서 운영과 맞지 않는 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '회의적',
      concerns: [
        'Expert 수준이지만 운영 특성상 혁신보다 안정이 우선',
        '3교대 근무로 교육 참여 자체가 어려움',
        '15명 대규모 팀 변화 관리가 현실적으로 어려울 듯'
      ],
      dropoutRisk: 5
    },
    personality: {
      patience: 7,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 9,
      confidenceLevel: 6
    }
  },

  {
    id: 'P028',
    name: '박준영',
    age: 39,
    company: 'SK이노베이션',
    department: '정보보안팀',
    role: '팀장',
    category: 'IT',
    leaderProfile: {
      yearsInRole: 0.7,
      previousRole: '보안 관제 파트장 (7년 경력)',
      promotionReason: '랜섬웨어 공격 성공적 방어로 500억 피해 예방, 제로 트러스트 보안 체계 도입 주도하여 CISO 특별 승진',
      leadershipStyle: '위험 제로를 추구하는 완벽주의자. 보안 사고 예방에는 탁월하지만 지나친 통제로 타 부서와 마찰.',
      biggestChallenge: '개발팀/현업은 "보안팀이 일 못하게 막는다"고 불평하고, 경영진은 "편의성도 중요하다"며 보안 완화 압박하는 딜레마',
      hiddenStruggles: [
        '보안 사고 하나만 터져도 팀장 경력 끝인다는 압박감에 매일 악몽',
        '팀원 6명으로 전사 5,000명 보안 관리하는 것이 물리적으로 불가능한데 인원 충원 안 됨',
        '개발팀이 "보안팀은 No만 한다"고 뒷담화하는 걸 알지만 원칙은 지켜야 하는 외로움',
        'CISO가 "100% 방어"를 요구하지만 예산은 작년 대비 20% 삭감된 현실'
      ]
    },
    team: {
      size: 6,
      seniorCount: 2,
      juniorCount: 4,
      composition: '팀장 1명 + 시니어 보안 엔지니어 2명(9년차, 7년차) + 주니어 보안 관제 요원 2명(3년차, 2년차) + 주니어 보안 정책 담당 1명(2년차) + 주니어 모의 해킹 담당 1명(1년차)',
      digitalMaturity: 'Expert',
      maturityDistribution: '시니어 2명(Expert) + 주니어 3명(Advanced) + 주니어 1명(Intermediate)',
      teamDynamics: '소수정예 특공대 같은 분위기지만 과로에 지쳐 있음. 시니어 2명은 기술력은 뛰어나지만 "우리만 고생한다"며 냉소적. 주니어들은 24/7 보안 관제로 번아웃 직전. 타 부서에서 "보안팀은 사내 경찰"이라며 기피하는 분위기로 팀 전체가 고립감 느낌.',
      resistanceFactors: [
        '현업의 "보안은 번거롭기만 하다"는 부정적 인식',
        'CISO의 "실수는 용납 안 된다"는 무한 책임론',
        '개발팀의 "보안이 개발 속도를 늦춘다"는 불만',
        '경영진의 "보안에 돈 쓰면 뭐가 좋아지냐"는 ROI 압박'
      ]
    },
    work: {
      mainTasks: [
        '24/7 보안 관제 센터 운영 (일 평균 위협 탐지 3,000건)',
        '보안 정책 수립 및 전사 교육 (분기별 전 직원 대상)',
        '침투 테스트 및 모의 해킹 (월 1회)',
        '보안 솔루션 운영 (방화벽, IPS, DLP, SIEM 등 15종)',
        '보안 사고 대응 및 포렌식 (월평균 5건)'
      ],
      dailyWorkflow: '오전 7시 출근 → 밤새 보안 이벤트 로그 분석 → 8시 글로벌 위협 인텔리전스 브리핑 → 9시 관제팀 교대 및 인수인계 → 10-12시 보안 정책 위반 사항 점검 및 대응 → 점심 후 1-3시 현업 부서 보안 요청 사항 검토 (대부분 거절) → 3-4시 보안 솔루션 성능 모니터링 → 4-5시 CISO 보고 자료 작성 → 5-7시 취약점 분석 및 패치 계획 → 퇴근 후에도 보안 알람 앱 확인',
      weeklyRoutine: '월요일: 주간 위협 분석 및 대응 전략 수립 / 화요일: 보안 정책 위원회 참석 (각 부서 반발 대응) / 수요일: 침투 테스트 결과 리뷰 / 목요일: CISO 주간 보고 / 금요일: 보안 교육 콘텐츠 개발 및 인시던트 리뷰',
      collaboration: 'SIEM으로 로그 통합 분석, Slack으로 긴급 대응. 현업과는 보안 요청 포털이 있지만 대부분 전화로 "한 번만 예외"를 요구. 개발팀과는 늘 대립 (보안 vs 편의성). CISO 보고는 대면 + 서면. 외부 보안 업체와는 위협 정보 공유.',
      toolsUsed: ['SIEM(Splunk)', 'SOAR', 'FireEye', 'CrowdStrike', 'Fortinet', 'DLP', 'Tenable', 'Metasploit', 'Wireshark'],
      painPoints: [
        '하루 3,000건 보안 이벤트를 6명이 분석하는 것이 물리적으로 불가능',
        '개발팀이 보안 검토 없이 시스템 오픈하고 나중에 문제 되면 보안팀 책임',
        'CEO가 "보안 때문에 불편하다"고 하면 CISO가 "융통성 있게 하라"고 압박',
        '랜섬웨어, 공급망 공격 등 새로운 위협은 늘어나는데 예산은 삭감',
        '보안 교육해도 직원들은 "또 그 얘기"라며 무시, 피싱 메일 클릭률 30%'
      ],
      automationNeeds: [
        'AI 기반 위협 자동 탐지 및 대응 (SOAR 고도화)',
        '보안 정책 예외 요청 자동 위험도 평가',
        '보안 교육 효과성 자동 측정 및 맞춤 교육',
        '취약점 자동 스캔 및 패치 영향도 분석'
      ],
      workStructure: {
        level: '고도구조화',
        description: '보안 프레임워크(ISO 27001, NIST)에 따른 체계적 운영. 24/7 관제 체계와 인시던트 대응 프로세스 확립. 모든 보안 이벤트 로깅 및 분석. 하지만 인력 부족으로 많은 부분 수동 대응.'
      },
      realTimeExample: '지난주 금요일 오후 4시, 마케팅팀에서 "월요일 신제품 발표 사이트 오픈하는데 보안 점검 좀"이라고 요청. 점검해보니 SQL 인젝션 취약점 10개 발견. "수정하면 일정 못 맞춘다"며 "일단 오픈하고 나중에 수정"하자고 함. 거부하자 CMO가 CISO에게 "보안팀이 사업을 방해한다"고 컴플레인. CISO는 "융통성 있게 대응하라"고 지시. 결국 임시 보안 조치만 하고 오픈. 주말 내내 모니터링하느라 못 쉼.',
      typicalFireDrills: [
        '랜섬웨어 감염 의심 "전사 네트워크 즉시 차단" - 비상 대응',
        '개인정보 유출 제보 "24시간 내 원인 파악" - 포렌식 총동원',
        'CEO 피싱 메일 클릭 "흔적 없이 처리하라" - 극비 작업',
        '금융감독원 보안 실사 "일주일 내 모든 문서 준비" - 전팀 야근'
      ]
    },
    workshopPsychology: {
      initialAttitude: '회의적',
      hiddenMotivations: [
        '보안팀의 필요성을 경영진에게 각인시킬 방법을 찾고 싶음',
        '개발팀/현업과 대립하지 않고 협업할 수 있는 방법을 배우고 싶음',
        '6명으로 전사 보안을 효율적으로 관리하는 노하우를 얻고 싶음',
        '보안 사고 없이 편의성도 제공하는 균형점을 찾고 싶음'
      ],
      deepConcerns: [
        'Expert 팀이 이미 최고 수준 보안 도구 쓰는데 일반 워크샵이 도움될까',
        '보안은 특수 영역인데 일반 업무 개선과는 맞지 않을 듯',
        '3시간 자리 비우는 동안 보안 사고 터지면 어떡하나',
        '워크샵 내용이 "보안 규제 완화"로 이어질까봐 걱정'
      ],
      successMetrics: [
        '보안 이벤트 분석 시간을 50% 단축하는 방법',
        '현업과 Win-Win할 수 있는 보안 정책 수립 방법',
        '경영진에게 보안 ROI를 설명하는 방법',
        '팀원 번아웃 없이 24/7 관제 유지하는 방법'
      ],
      dropoutRisk: 10,
      dropoutTriggers: [
        '보안 사고나 침해 시도가 감지되는 경우',
        'CISO 긴급 호출이 오는 경우',
        '외부 감사나 실사 일정과 겹치는 경우',
        '워크샵이 보안과 무관한 일반론인 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '회의적',
      concerns: [
        'Expert 수준이지만 보안은 예외가 많아 일반화 어려움',
        '보안은 100% 방어가 목표인데 효율화가 맞을까',
        '6명 소규모 팀이라 대규모 변화는 비현실적'
      ],
      dropoutRisk: 10
    },
    personality: {
      patience: 8,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 10,
      confidenceLevel: 7
    }
  },  {
    id: 'P029',
    name: '최승현',
    age: 35,
    company: 'SK네트웍스',
    department: '애플리케이션개발팀',
    role: '팀장',
    category: 'IT',
    leaderProfile: {
      yearsInRole: 1.0,
      previousRole: '시니어 개발자 (8년 경력)',
      promotionReason: '사내 ERP 현대화 프로젝트를 3개월 앞당겨 완료하고 레거시 코드 리팩토링으로 시스템 응답속도 40% 개선, 기술 리더십과 프로젝트 관리 능력 인정받아 승진',
      leadershipStyle: '코드 리뷰와 기술 토론을 중시하는 스타일. 개발자 출신이라 기술 판단은 빠르지만 팀원 간 업무 분배와 비즈니스 부서와의 협상에는 아직 미숙함.',
      biggestChallenge: '12년차 시니어 개발자가 레거시 시스템 구축한 장본인인데 "왜 바꾸냐"며 저항하고, 비즈니스 부서는 계속 요구사항 바꾸는 난관',
      hiddenStruggles: [
        '코드 리뷰에서 시니어한테 "이런 것도 몰라?"라는 무시당하는 듯한 느낌',
        'CTO가 "개발자 출신이라 관리는 서툴지?"라고 의심의 눈초리로 보는 압박',
        '주니어들이 퇴근 후 "팀장님은 코딩만 하고 우리는 언제 성장하냐"는 불만을 SNS에 올린 걸 봤지만 모른 척',
        '아내가 "맨날 코딩만 하고 가족은 뒷전"이라고 불평하는데 팀장 역할과 개발 둘 다 놓을 수 없는 딜레마'
      ]
    },
    team: {
      size: 10,
      seniorCount: 6,
      juniorCount: 4,
      composition: '팀장 1명 + 시니어 백엔드 개발자 2명(10년차, 12년차) + 시니어 프론트엔드 개발자 2명(7년차, 9년차) + 시니어 QA 엔지니어 2명(8년차, 6년차) + 주니어 풀스택 개발자 2명(2-3년차) + 주니어 QA 엔지니어 2명(1-2년차)',
      digitalMaturity: 'Expert',
      maturityDistribution: '시니어 6명(Expert) + 주니어 2명(Advanced) + 주니어 2명(Intermediate)',
      teamDynamics: '12년차 시니어는 레거시 코드의 "수호자"를 자처하며 변화 거부. 10년차는 "나도 곧 팀장감"이라며 은근히 도전. 프론트엔드와 백엔드가 "누가 더 중요한가"로 신경전. 주니어들은 단순 버그 수정만 시켜서 "성장이 없다"며 이직 사이트 검색.',
      resistanceFactors: [
        '시니어들의 "10년 넘게 잘 돌아가는데 왜 바꾸냐"는 저항',
        '비즈니스 부서의 "개발팀은 우리 요구사항만 들으면 돼"라는 갑질',
        'QA팀의 "테스트 시간 더 필요"와 개발팀의 "빨리 배포해야 해" 충돌',
        'CTO의 "왜 이렇게 개발이 오래 걸리냐"는 압박'
      ]
    },
    work: {
      mainTasks: [
        '사내 애플리케이션 개발 (주문관리, 재고관리, 물류추적 시스템 등 5개 주요 시스템 운영)',
        '10년 이상 된 레거시 Java 코드를 Node.js + React로 단계별 현대화 (월 평균 2개 모듈 전환)',
        'REST API 및 GraphQL 엔드포인트 설계 및 개발',
        'GitHub Actions + Jenkins로 CI/CD 파이프라인 운영 및 개선',
        '코드 리뷰 및 품질 관리 (주 3회 코드 리뷰 세션, SonarQube로 코드 품질 측정)'
      ],
      dailyWorkflow: '오전 9시 출근 후 Slack 메시지 확인 및 긴급 이슈 대응 → 9시 30분 데일리 스탠드업 미팅(15분) → 10시-12시 코드 리뷰 및 PR 승인, 기술 설계 검토 → 점심 후 1-3시 비즈니스 부서 미팅 또는 요구사항 조율 → 3-5시 개발 업무(주로 복잡한 설계나 레거시 코드 분석) → 5-6시 팀원 질문 답변 및 장애 대응 → 야근 시 6-8시 리팩토링 우선순위 검토 및 다음날 스프린트 계획',
      weeklyRoutine: '월요일 오전: 스프린트 계획 회의(1시간 30분), 비즈니스 부서 요구사항 백로그 리뷰 / 화요일: 오후 2시간 시니어 개발자들과 기술 아키텍처 토론 / 수요일 오전: 주간 진행상황 보고를 위한 자료 준비 및 CTO 보고 / 목요일: 스프린트 리뷰 및 회고(2시간), QA팀과 배포 계획 조율 / 금요일: 주니어 개발자 코드 리뷰 집중 시간(3시간), 다음주 우선순위 최종 확정',
      collaboration: '팀 내에서는 Slack으로 실시간 소통하고 코드 관련 논의는 GitHub PR 코멘트로 진행. 스프린트는 Jira로 관리하며 매일 스탠드업에서 진행상황 공유. 비즈니스 부서(영업/물류/구매팀)와는 주 2회 정기 미팅하고 요구사항은 Confluence에 문서화. QA팀과는 Slack 채널에서 테스트 케이스 협의하고 배포 전 체크리스트를 Google Sheets로 공유.',
      toolsUsed: ['GitHub', 'Jenkins', 'Docker', 'Kubernetes', 'JIRA', 'Slack', 'Figma', 'SonarQube', 'Confluence', 'Google Sheets', 'Postman', 'IntelliJ IDEA', 'VS Code'],
      painPoints: [
        '시니어 백엔드 개발자(12년차)가 본인보다 연차가 높고 레거시 시스템을 구축한 장본인이라 리팩토링 방향에 이견이 있을 때 설득하기 어려움',
        '비즈니스 부서 요구사항 변경이 주 평균 3-4건 발생하는데 우선순위를 정하지 못해 개발 일정이 계속 밀림',
        '레거시 코드 리팩토링 우선순위를 기술 부채 정도, 비즈니스 영향도, 개발 난이도를 고려해서 정해야 하는데 데이터 없이 주먹구구로 결정',
        'QA 시간이 부족해서 배포 후 버그 발견이 많고 핫픽스로 야근하는 경우 빈번',
        '주니어 개발자 4명이 같은 유형 작업(API 개발)을 반복하는데 코딩 컨벤션과 에러 처리 방식이 제각각'
      ],
      automationNeeds: [
        '요구사항 변경 시 영향받는 코드 범위와 예상 공수를 자동으로 분석해주는 도구',
        '레거시 코드 복잡도를 자동 분석하고 리팩토링 우선순위를 ROI 기준으로 제안',
        '테스트 자동화 확대 (Unit Test, Integration Test 커버리지 80% 목표)',
        'API 개발 표준 템플릿과 자동 검증 도구'
      ],
      workStructure: {
        level: '고도구조화',
        description: '애자일 스크럼 확립(2주 스프린트). GitHub + Jenkins로 CI/CD 자동화. 주 2회 스프린트 리뷰 및 회고. PR 기반 코드 리뷰 의무화(2명 이상 승인 필수). Jira로 백로그 관리하고 Confluence에 기술 문서 작성. SonarQube로 코드 품질 자동 측정.'
      },
      realTimeExample: '지난주 목요일 오후 3시, 영업팀에서 "내일 고객 데모가 있는데 신규 기능 추가 필요"라고 긴급 요청. 이미 스프린트 막바지라 여유 인력 없음. 12년차 시니어는 "무리한 요구는 거절해야 한다"고 하고, CTO는 "고객이 중요하니 맞춰줘야지"라고 압박. 결국 팀장이 직접 밤새 개발해서 기능 구현. 다음날 데모는 성공했지만 주말에 버그 10개 발견되어 주말 내내 핫픽스. 팀원들은 "팀장님이 혼자 다 하신다"며 사기 저하.',
      typicalFireDrills: [
        '프로덕션 장애 "즉시 롤백하고 원인 파악" - 전팀원 비상 대응',
        '고객 데모 직전 "이 기능 꼭 필요하다" - 밤샘 개발',
        'CTO "경쟁사는 이런 기능 있는데 우리는?" - 긴급 기능 개발',
        '보안팀 "취약점 발견, 24시간 내 패치" - 주말 특근'
      ]
    },
    workshopPsychology: {
      initialAttitude: '중립',
      hiddenMotivations: [
        '시니어 개발자들도 인정할 만한 팀 관리 역량을 갖추고 싶음',
        '비즈니스 부서와 대등하게 협상할 수 있는 스킬을 배우고 싶음',
        '개발과 관리 사이에서 균형 잡는 방법을 알고 싶음',
        '주니어들에게 성장 기회를 주면서도 품질 유지하는 방법을 찾고 싶음'
      ],
      deepConcerns: [
        'Expert 개발팀이라 이미 자동화 잘하는데 워크샵이 뭘 더 줄까',
        '개발 업무는 창의성이 중요한데 프로세스 정형화가 오히려 제약일 수 있음',
        '3시간 자리 비우면 긴급 이슈 대응 못할까봐',
        '워크샵 내용이 개발과 무관한 일반 관리론이면 시간 낭비'
      ],
      successMetrics: [
        '요구사항 변경을 체계적으로 관리하는 방법',
        '시니어와 주니어 간 스킬 갭을 줄이는 방법',
        '레거시 현대화와 신규 개발 우선순위 정하는 방법',
        '개발 속도와 품질 사이에서 균형 잡는 방법'
      ],
      dropoutRisk: 5,
      dropoutTriggers: [
        '프로덕션 장애가 발생하는 경우',
        'CTO 긴급 호출이 오는 경우',
        '중요 배포 일정과 겹치는 경우',
        '내용이 비개발 직군 중심인 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Expert 수준에서 더 배울 게 있을까',
        '이미 GitHub/Jenkins 등 최신 도구 다 쓰는데',
        '10명 팀의 시니어-주니어 갈등을 어떻게 해결할까'
      ],
      dropoutRisk: 5
    },
    personality: {
      patience: 9,
      techSavvy: 10,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 8,
      confidenceLevel: 7
    }
  },

  {
    id: 'P030',
    name: '강유진',
    age: 40,
    company: 'SK E&S',
    department: 'IT지원팀',
    role: '팀장',
    category: 'IT',
    leaderProfile: {
      yearsInRole: 0.6,
      previousRole: 'IT 헬프데스크 시니어 (6년 경력)',
      promotionReason: 'ServiceNow 도입으로 IT 서비스 요청 처리 시간 50% 단축, 사용자 만족도 90% 달성하여 팀장 승진',
      leadershipStyle: '고객 서비스 마인드로 친절하게 대응하지만, 무리한 요구도 거절 못해 팀원들 업무 과중되는 문제.',
      biggestChallenge: '전사 5,000명이 IT 지원 요청하는데 팀원은 8명뿐. "컴퓨터 켜는 법"부터 "AI 도입"까지 모든 걸 IT지원팀에 요구',
      hiddenStruggles: [
        '임원들이 "내 노트북 느린데 바로 와서 봐달라"고 호출하면 모든 업무 중단하고 달려가야 하는 서러움',
        'IT 예산의 90%가 인프라/개발에 가고 IT지원팀은 "비용 센터"로 취급받는 현실',
        '팀원들이 "전화기 수리하는 사람" 취급받는 걸 보면서도 위로할 말이 없는 무력감',
        '다른 IT팀은 재택근무 하는데 우리는 "현장 지원" 때문에 매일 출근해야 하는 박탈감'
      ]
    },
    team: {
      size: 8,
      seniorCount: 3,
      juniorCount: 5,
      composition: '팀장 1명 + 시니어 IT 지원 엔지니어 2명(8년차, 6년차) + 시니어 자산 관리 담당 1명(7년차) + 주니어 헬프데스크 요원 3명(1-3년차) + 주니어 PC 관리 담당 1명(2년차) + 계약직 1명',
      digitalMaturity: 'Advanced',
      maturityDistribution: '시니어 3명(Advanced) + 주니어 3명(Intermediate) + 주니어 2명(Beginner)',
      teamDynamics: '시니어들은 "IT지원은 승진도 안 되고 미래도 없다"며 냉소적. 주니어들은 단순 반복 업무(비밀번호 리셋, PC 세팅)에 지쳐 "이직이 답"이라고 생각. 계약직은 정규직 전환 안 될 거 알고 최소한만 일함. 전체적으로 "우리는 IT계의 막노동"이라는 자조적 분위기.',
      resistanceFactors: [
        '경영진의 "IT지원은 당연한 서비스"라는 인식으로 감사 표현 없음',
        '다른 IT팀의 "우리는 개발/인프라고 너희는 서비스직"이라는 차별',
        '사용자들의 "IT지원팀은 만능"이라며 업무 외 요구 (개인 폰 수리 등)',
        '예산 삭감 시 "IT지원은 아웃소싱하면 되지"라는 위협'
      ]
    },
    work: {
      mainTasks: [
        '전사 IT 헬프데스크 운영 (일 평균 요청 200건)',
        'PC/노트북/모바일 기기 지급 및 관리 (5,000대)',
        '소프트웨어 라이선스 관리 및 배포',
        'MS365, Zoom 등 협업 도구 관리 및 교육',
        'IT 자산 관리 및 폐기 (연간 교체 주기 관리)'
      ],
      dailyWorkflow: '오전 7시 반 출근 (임원 출근 전 준비) → ServiceNow에서 밤새 들어온 요청 확인 → 8시 우선순위 분류 (임원 > 긴급 > 일반) → 9시 팀 브리핑 후 현장 출동 시작 → 10-12시 각 층 순회하며 PC 문제 해결 → 점심은 당번제 (헬프데스크는 무중단) → 오후 1-3시 신규 직원 PC 세팅 및 교육 → 3-5시 소프트웨어 설치 요청 처리 → 5-6시 일일 리포트 작성 → 퇴근 후에도 임원 긴급 콜 대기',
      weeklyRoutine: '월요일: 주말 동안 쌓인 요청 처리 (보통 300건) / 화요일: IT 자산 실사 및 교체 계획 / 수요일: 사용자 교육 (Office 365, 보안 등) / 목요일: 벤더 미팅 (PC, SW 구매) / 금요일: 주간 서비스 리포트 및 차주 계획',
      collaboration: 'ServiceNow로 티켓 관리하지만 임원들은 직접 전화. Slack은 있지만 "전화가 빠르다"며 전화 선호. 다른 IT팀과는 티켓 에스컬레이션으로만 소통. 사용자 교육은 대면 선호 (온라인 교육 참석률 10%). 벤더와는 이메일+전화.',
      toolsUsed: ['ServiceNow', 'MS365 Admin', 'Active Directory', 'SCCM', 'TeamViewer', 'Slack', 'Excel(자산관리)'],
      painPoints: [
        '하루 200건 요청 중 50%가 "비밀번호 리셋" 같은 단순 반복 작업',
        'CEO가 "내 이메일 안 열린다"고 하면 모든 업무 중단하고 대응',
        'IT 자산 관리가 Excel이라 "이 노트북 누구 거?"를 찾는데 30분',
        '사용자들이 ServiceNow 안 쓰고 직접 찾아와서 "급한데 좀 봐달라"',
        '"프린터 안 된다" "와이파이 느리다" 같은 IT 팀 업무 아닌 것도 다 떠넘김'
      ],
      automationNeeds: [
        '비밀번호 리셋 셀프서비스 포털',
        'FAQ 챗봇 (단순 문의 자동 응답)',
        'IT 자산 자동 추적 시스템 (위치, 사용자, 상태)',
        'SW 자동 배포 및 라이선스 관리'
      ],
      workStructure: {
        level: '고도구조화',
        description: 'ITIL 프레임워크에 따른 서비스 관리. ServiceNow로 티켓 관리 체계화. SLA 정의 (긴급 2시간, 일반 8시간). 하지만 임원 요청은 모든 프로세스 무시하고 즉시 대응.'
      },
      realTimeExample: '지난주 수요일 오후 2시, CEO 비서실에서 "대표님 노트북 화면이 안 켜진다"고 긴급 콜. 모든 팀원이 현장 출동 중이라 팀장이 직접 달려감. 가보니 화면 밝기가 최소로 되어 있던 것. 5초 만에 해결했지만 CEO는 "IT가 뭐하는지 모르겠다"고 핀잔. 돌아오니 일반 사용자 요청 50건이 밀려 있고 "IT지원팀은 임원만 챙긴다"는 불만 메일. 그날 팀 전체 밤 9시까지 야근.',
      typicalFireDrills: [
        'CEO "내 메일이 안 보인다" - 모든 업무 중단하고 대응',
        '전사 화상회의 5분 전 "Zoom이 안 된다" - 초스피드 해결',
        '랜섬웨어 감염 의심 "모든 PC 즉시 점검" - 24시간 비상',
        '신입 사원 100명 일괄 입사 "내일까지 PC 세팅" - 밤샘 작업'
      ]
    },
    workshopPsychology: {
      initialAttitude: '기대함',
      hiddenMotivations: [
        'IT지원팀도 전략적 가치가 있다는 걸 증명하고 싶음',
        '단순 반복 업무를 자동화해서 팀원들 번아웃 막고 싶음',
        '임원들에게 휘둘리지 않고 체계적으로 일하는 방법 배우고 싶음',
        'IT지원팀 이미지를 개선해서 팀원들 자존감 회복시키고 싶음'
      ],
      deepConcerns: [
        '워크샵 내용이 개발/인프라 중심이면 IT지원과 맞지 않을 듯',
        '3시간 자리 비우면 임원 요청 대응 못해서 문제될까봐',
        'Advanced 팀이지만 실제로는 단순 업무라 고급 내용 이해 못할까봐',
        '다른 팀장들이 "IT지원팀이 여기 왜 왔어?"라고 무시할까봐'
      ],
      successMetrics: [
        '단순 반복 요청을 50% 자동화하는 방법',
        '임원 요청과 일반 요청의 균형 잡는 방법',
        'IT지원팀의 가치를 정량화해서 보여주는 방법',
        '팀원들의 커리어 성장 경로 만드는 방법'
      ],
      dropoutRisk: 10,
      dropoutTriggers: [
        'CEO나 임원 긴급 IT 지원 요청이 오는 경우',
        '대규모 PC 교체나 SW 배포 일정과 겹치는 경우',
        '전사 시스템 장애로 헬프데스크 폭주하는 경우',
        '워크샵이 너무 기술적이어서 따라가기 어려운 경우'
      ]
    },
    expectedBehavior: {
      initialAttitude: '기대함',
      concerns: [
        'Advanced 수준이지만 업무 특성상 단순 반복이 많음',
        'IT지원팀 특수성을 반영한 내용이 있을까',
        '8명 팀원의 사기 진작 방법이 필요함'
      ],
      dropoutRisk: 10
    },
    personality: {
      patience: 9,
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast',
      stressLevel: 8,
      confidenceLevel: 6
    }
  }];

// Export functions
export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS_V3.find(p => p.id === id);
}

export function getPersonasByCategory(category: Persona['category']): Persona[] {
  return PERSONAS_V3.filter(p => p.category === category);
}

export function analyzePersonasV3() {
  const analysis = {
    total: PERSONAS_V3.length,
    byCategory: {} as Record<string, number>,
    byDigitalMaturity: {} as Record<string, number>,
    byWorkStructure: {} as Record<string, number>,
    byTeamSize: {
      small: 0, // 1-10명
      medium: 0, // 11-20명
      large: 0 // 21명+
    },
    avgDropoutRisk: 0,
    highRiskPersonas: [] as string[],
  };

  PERSONAS_V3.forEach(persona => {
    // 카테고리별
    analysis.byCategory[persona.category] = (analysis.byCategory[persona.category] || 0) + 1;

    // 디지털 성숙도별
    analysis.byDigitalMaturity[persona.team.digitalMaturity] =
      (analysis.byDigitalMaturity[persona.team.digitalMaturity] || 0) + 1;

    // 업무 구조화별
    analysis.byWorkStructure[persona.work.workStructure.level] =
      (analysis.byWorkStructure[persona.work.workStructure.level] || 0) + 1;

    // 팀 규모별
    if (persona.team.size <= 10) analysis.byTeamSize.small++;
    else if (persona.team.size <= 20) analysis.byTeamSize.medium++;
    else analysis.byTeamSize.large++;

    // 드롭아웃 리스크
    analysis.avgDropoutRisk += persona.expectedBehavior.dropoutRisk;
    if (persona.expectedBehavior.dropoutRisk > 30) {
      analysis.highRiskPersonas.push(`${persona.name} (${persona.department})`);
    }
  });

  analysis.avgDropoutRisk = Math.round(analysis.avgDropoutRisk / PERSONAS_V3.length);

  return analysis;
}

// CLI 실행
if (require.main === module) {
  console.log('👥 페르소나 V3 로드 완료');
  console.log(`총 ${PERSONAS_V3.length}명 정의됨\n`);

  const analysis = analyzePersonasV3();
  console.log('📊 분석 결과:');
  console.log('- 카테고리별:', analysis.byCategory);
  console.log('- 디지털 성숙도별:', analysis.byDigitalMaturity);
  console.log('- 업무 구조화별:', analysis.byWorkStructure);
  console.log('- 팀 규모별:', analysis.byTeamSize);
  console.log(`- 평균 드롭아웃 리스크: ${analysis.avgDropoutRisk}%`);
  console.log(`- 고위험 페르소나: ${analysis.highRiskPersonas.length}명`);
}
