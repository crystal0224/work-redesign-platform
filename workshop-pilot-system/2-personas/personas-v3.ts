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
  company: string;
  department: string;
  role: string;

  // 부서 카테고리
  category: 'Marketing' | 'Sales' | 'Operations' | 'R&D' | 'HR' | 'Finance' | 'IT' | 'Strategy';

  // 팀장 개인 프로필
  leaderProfile: {
    yearsInRole: number; // 현 팀장 경력
    previousRole: string; // 팀장 되기 전 역할
    leadershipStyle: string; // 리더십 스타일 간략 설명
  };

  // 팀 구성
  team: {
    size: number;
    composition: string; // 팀 구성원 역할
    digitalMaturity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; // 팀 전체의 디지털 성숙도
    maturityDistribution: string; // 팀원별 성숙도 분포
  };

  // 구체적인 업무
  work: {
    mainTasks: string[]; // 팀의 주요 업무 3-5가지
    toolsUsed: string[]; // 현재 사용 중인 도구
    painPoints: string[]; // 팀장이 느끼는 팀 운영의 어려움
    automationNeeds: string[]; // 자동화 필요 영역
    workStructure: {
      level: '비구조화' | '반구조화' | '고도구조화';
      description: string; // 구조화 수준 설명
    };
  };

  // 워크샵 예상 행동 (팀장 개인)
  expectedBehavior: {
    initialAttitude: '기대함' | '중립' | '걱정' | '회의적';
    concerns: string[]; // 팀장 본인의 워크샵 참여 우려사항
    dropoutRisk: number; // 0-100%
    problemSteps: number[]; // 어려움 예상 단계
    strongSteps: number[]; // 잘 할 것으로 예상되는 단계
    timePerceptionByStep: Record<number, 'Too Short' | 'Just Right' | 'Too Long'>; // 단계별 시간 인식
  };

  // 팀장 개인 특성
  personality: {
    patience: number; // 1-10, 팀장 개인의 인내심
    techSavvy: number; // 1-10, 팀장 개인의 기술 친화도
    changeResistance: 'low' | 'medium' | 'high'; // 팀장 개인의 변화 저항
    learningSpeed: 'slow' | 'medium' | 'fast'; // 팀장 개인의 학습 속도
  };
}

export const PERSONAS_V3: Persona[] = [
  // ==================== MARKETING (3명) ====================
  {
    id: 'P001',
    name: '김지훈',
    company: 'SK플래닛',
    department: '디지털마케팅팀',
    role: '팀장',
    category: 'Marketing',
    leaderProfile: {
      yearsInRole: 3,
      previousRole: '캠페인 기획자',
      leadershipStyle: '데이터 기반 의사결정, 팀원 자율성 존중'
    },
    team: {
      size: 8,
      composition: '팀장 1명 + 캠페인 기획자 2명 + 콘텐츠 크리에이터 2명 + 데이터 분석가 2명 + 디자이너 1명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Expert 2명(분석가) + Advanced 3명(기획자, 디자이너) + Intermediate 3명(크리에이터)'
    },
    work: {
      mainTasks: [
        'SNS 캠페인 기획 및 실행 (월 5-8개 캠페인)',
        '고객 데이터 분석 및 타겟팅 전략 수립',
        '크리에이티브 콘텐츠 제작 및 A/B 테스트',
        '캠페인 성과 측정 및 주간 보고',
        '마케팅 자동화 툴 운영 및 최적화'
      ],
      toolsUsed: ['Google Analytics', 'Facebook Ads Manager', 'HubSpot', 'Figma', 'Notion', 'Slack'],
      painPoints: [
        '캠페인별 성과 데이터 통합이 어려워 팀원들에게 수작업 요청 (주당 8시간)',
        'A/B 테스트 결과를 팀 전체에 공유하고 의사결정하는 과정이 비효율적',
        '크리에이티브 에셋이 팀원별로 분산 저장되어 협업 시 찾기 어려움'
      ],
      automationNeeds: [
        '다중 채널 성과 데이터 자동 통합 대시보드',
        'AI 기반 카피라이팅 초안 생성으로 팀 작업 부담 감소',
        '과거 캠페인 성공 패턴 기반 타겟팅 추천'
      ],
      workStructure: {
        level: '반구조화',
        description: '캠페인별 담당자는 정해져 있으나, 세부 프로세스는 팀원 재량. A/B 테스트 기준은 있지만 문서화 미흡. 주간 회의로 진행 상황 공유.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '워크샵에서 배운 내용을 팀에 어떻게 적용할지 막막함',
        '마케팅 특화된 예시가 부족하면 우리 팀 상황에 맞지 않을 수 있음',
        '3시간으로 팀의 복잡한 캠페인 프로세스를 다 담을 수 있을지 의문'
      ],
      dropoutRisk: 10,
      problemSteps: [8, 9, 10],
      strongSteps: [3, 4, 6, 7],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Too Long', 7: 'Just Right', 8: 'Just Right',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
    },
    personality: {
      patience: 7,
      techSavvy: 8,
      changeResistance: 'low',
      learningSpeed: 'fast'
    }
  },

  {
    id: 'P002',
    name: '박서연',
    company: '11번가',
    department: '퍼포먼스마케팅팀',
    role: '팀장',
    category: 'Marketing',
    leaderProfile: {
      yearsInRole: 2,
      previousRole: '검색광고 전문가',
      leadershipStyle: '성과 중심, 빠른 실행, 주간 1:1 피드백'
    },
    team: {
      size: 12,
      composition: '팀장 1명 + 채널별 담당자 6명(검색, SNS, 디스플레이 각 2명) + 데이터 애널리스트 3명 + 디자이너 2명',
      digitalMaturity: 'Intermediate',
      maturityDistribution: 'Advanced 4명(애널리스트, 검색광고) + Intermediate 5명 + Beginner 3명(신입)'
    },
    work: {
      mainTasks: [
        '검색광고, SNS광고, 디스플레이 광고 통합 운영',
        'ROAS 최적화 및 예산 배분',
        '실시간 입찰 전략 수립 및 조정',
        '광고 소재 A/B 테스트 및 성과 분석',
        '월간 마케팅 ROI 보고'
      ],
      toolsUsed: ['Google Ads', 'Meta Business Suite', 'Kakao Moment', 'Adobe Analytics', 'Excel', 'Tableau'],
      painPoints: [
        '채널별 담당자가 각자 데이터를 관리해서 전체 현황 파악이 어려움',
        '신입 팀원 3명에게 광고 운영 노하우를 전수하는데 시간 부족',
        '실시간 입찰 조정이 수동이라 팀원들에게 야근 요청이 잦음'
      ],
      automationNeeds: [
        '다채널 광고 성과 실시간 통합 대시보드',
        'AI 기반 입찰가 자동 최적화로 팀 업무 부담 감소',
        '광고 소재별 성과 자동 태깅 및 리포팅'
      ],
      workStructure: {
        level: '반구조화',
        description: '채널별 담당자 역할은 명확하나, 채널 간 협업 프로세스 미흡. 주간 성과 회의는 있지만 실시간 공유 체계 부족. 예산 배분 기준은 있으나 수동 조정.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        '팀원 12명 수준이 다양한데, 내가 배운걸 어떻게 각 수준에 맞게 전달할지',
        '워크샵이 일반적인 내용이면 우리 팀 실시간 최적화 니즈에 안 맞을 수 있음',
        '혼자 참여해서 배우는데 팀 전체에 확산하기가 쉽지 않을 것 같음'
      ],
      dropoutRisk: 20,
      problemSteps: [2, 5, 8, 9],
      strongSteps: [6, 7, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Long', 3: 'Just Right', 4: 'Just Right',
        5: 'Too Long', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
    },
    personality: {
      patience: 6,
      techSavvy: 7,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  {
    id: 'P003',
    name: '이현수',
    company: 'SK텔레콤',
    department: '브랜드마케팅팀',
    role: '팀장',
    category: 'Marketing',
    leaderProfile: {
      yearsInRole: 5,
      previousRole: '브랜드 전략가',
      leadershipStyle: '비전 제시형, 크리에이티브 존중, 월간 워크샵'
    },
    team: {
      size: 6,
      composition: '팀장 1명 + 브랜드 전략가 2명 + 콘텐츠 디렉터 1명 + 크리에이티브 2명',
      digitalMaturity: 'Beginner',
      maturityDistribution: 'Intermediate 2명(전략가) + Beginner 4명'
    },
    work: {
      mainTasks: [
        '브랜드 캠페인 컨셉 개발',
        '브랜드 인지도 조사 및 분석',
        '크리에이티브 에셋 제작 감독',
        'IMC(통합 마케팅 커뮤니케이션) 전략 수립',
        '브랜드 가이드라인 관리'
      ],
      toolsUsed: ['PowerPoint', 'Adobe Creative Suite', 'Survey Monkey', 'Excel', '이메일'],
      painPoints: [
        '팀원들이 디지털 도구에 익숙하지 않아 새로운 시스템 도입이 어려움',
        '크리에이티브 피드백이 이메일로 오가며 버전 관리가 안됨',
        '브랜드 인지도 데이터를 외부 용역에 의존해서 팀 내 인사이트 축적이 안됨'
      ],
      automationNeeds: [
        '브랜드 모니터링 자동화 (SNS 언급, 뉴스)',
        '크리에이티브 협업 툴 도입',
        '캠페인 히스토리 데이터베이스 구축'
      ],
      workStructure: {
        level: '비구조화',
        description: '창의성을 중시해 프로세스를 최소화. 캠페인마다 접근 방식이 다름. 역할 분담은 있으나 유연하게 조정. 주간 회의 외 문서화된 프로세스 없음.'
      }
    },
    expectedBehavior: {
      initialAttitude: '걱정',
      concerns: [
        '브랜드 업무는 창의성이 핵심인데 시스템화가 오히려 제약이 될까 봐',
        '팀원들 디지털 수준이 낮은데 내가 배워서 가르치기 부담스러움',
        '3시간 워크샵으로 우리 팀에 맞는 실질적 개선안을 찾을 수 있을지 의문'
      ],
      dropoutRisk: 35,
      problemSteps: [4, 5, 8, 9, 10],
      strongSteps: [1, 2, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Too Long', 4: 'Too Long',
        5: 'Too Long', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Too Long', 11: 'Just Right'
      }
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
    company: 'SK이노베이션',
    department: 'B2B영업팀',
    role: '팀장',
    category: 'Sales',
    leaderProfile: {
      yearsInRole: 4,
      previousRole: '시니어 영업 담당자',
      leadershipStyle: '코칭형, 주간 파이프라인 리뷰, 데이터 기반 목표 설정'
    },
    team: {
      size: 15,
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
      problemSteps: [4, 8, 10],
      strongSteps: [3, 6, 7, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Too Long',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Just Right', 10: 'Too Long', 11: 'Just Right'
      }
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
    company: 'SK네트웍스',
    department: '리테일영업팀',
    role: '팀장',
    category: 'Sales',
    leaderProfile: {
      yearsInRole: 6,
      previousRole: '지역 영업 담당자',
      leadershipStyle: '현장 중심, 월 1회 전국 담당자 회의, 실적 기반 보상'
    },
    team: {
      size: 20,
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
      problemSteps: [2, 4, 5, 8, 9, 10],
      strongSteps: [1, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Long', 3: 'Too Long', 4: 'Too Long',
        5: 'Too Long', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Too Long', 11: 'Just Right'
      }
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
    company: 'SK하이닉스',
    department: '반도체생산팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 7,
      previousRole: '공정 엔지니어',
      leadershipStyle: '안정 중심, 데이터 기반 의사결정, 일일 생산 회의'
    },
    team: {
      size: 25,
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
      problemSteps: [2, 8, 9, 10],
      strongSteps: [3, 4, 6, 7],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Long', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK에너지',
    department: '물류관리팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 3,
      previousRole: '물류 기획자',
      leadershipStyle: '효율 중심, 주간 성과 리뷰, 시스템 개선 적극 추진'
    },
    team: {
      size: 18,
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
      problemSteps: [8, 10],
      strongSteps: [3, 4, 6, 7, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Just Right', 10: 'Too Long', 11: 'Just Right'
      }
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
    company: 'SK실트론',
    department: '품질관리팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 5,
      previousRole: '품질 엔지니어',
      leadershipStyle: '품질 제일주의, 데이터 기반 분석, 월간 품질 리뷰'
    },
    team: {
      size: 12,
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
      problemSteps: [8, 9, 10],
      strongSteps: [4, 6, 7],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK온',
    department: '배터리생산팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 8,
      previousRole: '공정 관리자',
      leadershipStyle: '안전 최우선, 현장 소통 중시, 일일 조회'
    },
    team: {
      size: 30,
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
      problemSteps: [2, 4, 5, 8, 9, 10],
      strongSteps: [1, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Long', 3: 'Too Long', 4: 'Too Long',
        5: 'Too Long', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Too Long', 11: 'Just Right'
      }
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
    company: 'SK케미칼',
    department: '생산계획팀',
    role: '팀장',
    category: 'Operations',
    leaderProfile: {
      yearsInRole: 2,
      previousRole: '수요 예측 분석가',
      leadershipStyle: '데이터 기반 의사결정, 애자일 방식, 주 2회 스탠드업 미팅'
    },
    team: {
      size: 9,
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
      problemSteps: [2],
      strongSteps: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Short', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Just Right',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK바이오팜',
    department: '신약개발팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 4,
      previousRole: '연구원',
      leadershipStyle: '자율성 존중, 주간 연구 세미나, 논문 중심 성과 평가'
    },
    team: {
      size: 7,
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
      problemSteps: [2],
      strongSteps: [4, 5, 6, 7, 8, 9, 10, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Short', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Just Right',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK하이닉스',
    department: '반도체설계팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 6,
      previousRole: '설계 엔지니어',
      leadershipStyle: '기술 중심, 코드 리뷰 문화, 주간 기술 공유'
    },
    team: {
      size: 12,
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
      problemSteps: [2, 8],
      strongSteps: [4, 5, 6, 7, 9, 10, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Short', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Just Right',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK C&C',
    department: 'AI연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 2,
      previousRole: 'AI 연구원',
      leadershipStyle: '빠른 실험, 실패 허용, 주 2회 페이퍼 리뷰'
    },
    team: {
      size: 5,
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
      problemSteps: [],
      strongSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Just Right',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK이노베이션',
    department: '배터리기술연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 5,
      previousRole: '재료 연구원',
      leadershipStyle: '안정적 연구 관리, 월간 연구 리뷰, 특허 중시'
    },
    team: {
      size: 8,
      composition: '팀장 1명 + 재료 연구원 3명 + 공정 연구원 2명 + 분석 연구원 2명',
      digitalMaturity: 'Advanced',
      maturityDistribution: 'Advanced 6명 + Intermediate 2명'
    },
    work: {
      mainTasks: [
        '차세대 배터리 재료 연구',
        '전기화학 실험 및 분석',
        '배터리 성능 테스트',
        '특허 출원 및 기술 문서 작성',
        '생산팀과 기술 이관 협업'
      ],
      toolsUsed: ['실험 장비 SW', 'Origin', 'Excel', 'PowerPoint', 'SharePoint', '이메일'],
      painPoints: [
        '실험 데이터가 팀원들 로컬 PC에 분산되어 협업 시 찾기 어려움',
        '분석 결과 공유가 이메일/PPT라 버전 관리 안됨',
        '과거 실험 데이터 검색이 어려워 중복 실험 하는 경우 있음'
      ],
      automationNeeds: [
        '실험 데이터 중앙 저장소',
        '데이터 분석 자동화 툴',
        '연구 히스토리 검색 시스템'
      ],
      workStructure: {
        level: '반구조화',
        description: '재료/공정/분석별 담당은 명확하나 협업 프로세스 비정형적. 월간 연구 리뷰로 진행 공유. 실험 데이터 관리 규칙 있으나 준수 미흡.'
      }
    },
    expectedBehavior: {
      initialAttitude: '중립',
      concerns: [
        'Advanced 수준에서 구체적 개선점 도출보다 개념 설명이면 실망',
        '8명 팀원들 실제 업무 중인데 배운 내용 적용할 시간이 있을지',
        '자체 미션/비전 명확한데 일반적인 미션 작성 과정은 불필요할 듯'
      ],
      dropoutRisk: 10,
      problemSteps: [2, 8, 9],
      strongSteps: [4, 5, 6, 7, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Too Short', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Just Right', 10: 'Just Right', 11: 'Just Right'
      }
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
    company: 'SK바이오사이언스',
    department: '백신연구팀',
    role: '팀장',
    category: 'R&D',
    leaderProfile: {
      yearsInRole: 7,
      previousRole: '바이러스 연구원',
      leadershipStyle: '규제 준수 중시, 주간 진행 회의, 문서화 강조'
    },
    team: {
      size: 10,
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
      problemSteps: [8, 9, 10],
      strongSteps: [4, 6, 7, 11],
      timePerceptionByStep: {
        1: 'Just Right', 2: 'Just Right', 3: 'Just Right', 4: 'Just Right',
        5: 'Just Right', 6: 'Just Right', 7: 'Just Right', 8: 'Too Long',
        9: 'Too Long', 10: 'Just Right', 11: 'Just Right'
      }
    },
    personality: {
      patience: 6,
      techSavvy: 6,
      changeResistance: 'medium',
      learningSpeed: 'medium'
    }
  },

  // Continue with HR, Finance, IT, Strategy in next part...
  // (30명 중 15명 완료, 나머지 15명은 다음 응답에서 계속)
];

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
