#!/usr/bin/env ts-node

/**
 * AI 페르소나 시뮬레이션 스크립트 v2
 *
 * 12개 팀장 페르소나가 Work Redesign 워크샵을 경험하는 과정을 시뮬레이션합니다.
 * 각 페르소나는 팀을 이끄는 팀장이며, 팀의 AI/자동화 성숙도 수준에 따라 구분됩니다.
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

// API 키 유효성 검사
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey === 'sk-ant-api-your-key-here') {
  console.error('\n❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!\n');
  console.error('다음 중 하나의 방법으로 API 키를 설정해주세요:\n');
  console.error('1. backend/.env 파일에 ANTHROPIC_API_KEY 설정');
  console.error('   ANTHROPIC_API_KEY=sk-ant-api-...\n');
  console.error('2. 환경 변수로 직접 전달');
  console.error('   ANTHROPIC_API_KEY=sk-ant-api-... npx ts-node scripts/persona-simulation.ts\n');
  console.error('API 키 발급: https://console.anthropic.com/account/keys\n');
  process.exit(1);
}

// Anthropic API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey,
});

// 사용 가능한 최신 Claude 4.5 모델 (2025년 1월 기준):
// - claude-haiku-4-5-20251001: 최대 64K 토큰, $1/MTok input, $5/MTok output (추천: 비용 효율적)
// - claude-sonnet-4-5-20250929: 최대 64K 토큰, $3/MTok input, $15/MTok output (복잡한 작업용)
// - claude-opus-4-1-20250805: 최대 32K 토큰, $15/MTok input, $75/MTok output (최고 정밀도)

// 페르소나 정의 (팀장 관점)
interface Persona {
  id: string;
  name: string;
  role: string; // 팀장 역할
  jobFunction: string;
  teamDigitalMaturity: string; // 팀의 AI/자동화 성숙도
  age: number;
  experience: number; // 경력
  teamContext: {
    teamSize: number; // 팀 규모
    teamComposition: string; // 팀 구성원 특성
    currentWorkStyle: string; // 현재 업무 방식
    toolsUsed: string[]; // 현재 사용 중인 도구
    automationExperience: string; // 자동화 경험 수준
  };
  painPoints: string[]; // 팀장 관점의 고민
  expectations: string[]; // 워크샵 기대사항
  concerns: string[]; // 우려사항
}

const personas: Persona[] = [
  // ========================================
  // 마케팅 직군 (3개 팀)
  // ========================================
  {
    id: 'P1',
    name: '김영희',
    role: '마케팅팀 팀장',
    jobFunction: '마케팅',
    teamDigitalMaturity: '초보',
    age: 37,
    experience: 15,
    teamContext: {
      teamSize: 5,
      teamComposition: '40대 중반 2명, 30대 초반 2명 - 대부분 전통 마케팅 경험자',
      currentWorkStyle: 'Excel/PPT 중심 수작업, 이메일로 파일 주고받기, 오프라인 회의',
      toolsUsed: ['Excel', 'PowerPoint', 'Email', '카카오톡'],
      automationExperience: '없음. "AI는 IT팀이나 쓰는 것"이라고 생각함',
    },
    painPoints: [
      '팀원들이 매달 같은 형식의 캠페인 보고서를 각자 수작업으로 작성',
      '성과 데이터를 각자 Excel에 따로 관리해서 팀장이 직접 취합해야 함',
      '팀원 중 나이 많은 분들은 새 도구 배우는 것을 부담스러워함',
      '반복 작업이 많아 팀원들 야근이 잦고 실수도 많음'
    ],
    expectations: [
      '팀원들도 쉽게 따라할 수 있는 자동화 방법이 있다면',
      '복잡한 코딩 없이 클릭 몇 번으로 가능하면 좋겠음',
      '35분 안에 우리 팀에 맞는 구체적인 플랜을 얻을 수 있을까?'
    ],
    concerns: [
      '팀원들이 "또 새로운 거 배워야 해?"라고 저항하지 않을까?',
      '도입했다가 실패하면 팀 분위기가 더 나빠질까 봐 걱정',
      'AI/자동화가 정말 우리 같은 전통 마케팅 팀에도 도움이 될까?'
    ]
  },

  {
    id: 'P2',
    name: '이민수',
    role: '디지털마케팅팀 팀장',
    jobFunction: '마케팅',
    teamDigitalMaturity: '중급',
    age: 32,
    experience: 7,
    teamContext: {
      teamSize: 6,
      teamComposition: '20대 후반~30대 초반, 디지털 네이티브 세대',
      currentWorkStyle: 'GA4/Meta Ads/Notion 활용, 일부 Zapier 자동화 시도',
      toolsUsed: ['Google Analytics', 'Meta Ads', 'Notion', 'Slack', 'Zapier', 'Google Sheets'],
      automationExperience: '일부 마케터가 Zapier로 간단한 자동화 구축, 하지만 체계적이지 않음',
    },
    painPoints: [
      '팀원마다 사용하는 도구와 자동화 방식이 달라 통합이 어려움',
      '데이터는 많이 모으는데 인사이트 도출은 여전히 수작업',
      'ChatGPT 활용은 개인적으로 하지만 팀 차원의 AI 활용 전략이 없음',
      '자동화 시도는 하지만 누가 떠나면 유지보수가 안 됨'
    ],
    expectations: [
      '팀 전체가 일관되게 사용할 수 있는 자동화 워크플로우',
      'AI가 우리 비즈니스 데이터를 분석해서 인사이트를 자동으로 제공',
      '팀원들의 산발적인 자동화를 체계화하고 싶음'
    ],
    concerns: [
      '팀원들의 디지털 수준이 제각각인데 모두 따라올 수 있을까?',
      '기존에 각자 만든 자동화 도구들과 충돌하지 않을까?',
      'AI 추천이 우리 산업/비즈니스 맥락을 제대로 이해할까?'
    ]
  },

  {
    id: 'P3',
    name: '박지원',
    role: '마케팅 애널리틱스팀 팀장',
    jobFunction: '마케팅',
    teamDigitalMaturity: '고급',
    age: 29,
    experience: 4,
    teamContext: {
      teamSize: 4,
      teamComposition: '20대 후반, 데이터 분석 전공자 또는 코딩 가능한 마케터',
      currentWorkStyle: 'Python/SQL로 데이터 분석, Tableau 대시보드 구축, API 연동',
      toolsUsed: ['Python', 'SQL', 'Tableau', 'Git', 'Jupyter', 'Airflow'],
      automationExperience: '팀원들이 각자 Python 스크립트로 자동화 파이프라인 구축, 하지만 문서화 부족',
    },
    painPoints: [
      '각 팀원이 코드로 만든 자동화 시스템이 있지만 서로 공유가 안 됨',
      '새 팀원이 들어오면 기존 파이프라인을 이해하는 데 시간이 오래 걸림',
      '코드 유지보수에 시간을 너무 많이 쓰고 정작 인사이트 도출에 집중 못함',
      'No-code 솔루션을 찾고 있지만 우리 수준에 맞는 게 없음'
    ],
    expectations: [
      '코드 없이도 복잡한 자동화 워크플로우를 구축할 수 있을까?',
      'AI가 최적의 데이터 파이프라인 아키텍처를 제안해주면',
      '팀원들이 만든 개별 자동화를 통합하는 방법을 배우고 싶음'
    ],
    concerns: [
      '워크샵 내용이 너무 기초적이면 시간 낭비 아닐까?',
      '우리는 이미 많이 자동화했는데 더 배울 게 있을까?',
      '커스터마이징 여지가 충분할까? 아니면 정해진 틀만 있을까?'
    ]
  },

  // ========================================
  // 제조 직군 (3개 팀)
  // ========================================
  {
    id: 'P4',
    name: '최현진',
    role: '생산관리팀 팀장',
    jobFunction: '제조',
    teamDigitalMaturity: '초보',
    age: 45,
    experience: 20,
    teamContext: {
      teamSize: 7,
      teamComposition: '40-50대 현장 베테랑 5명, 30대 신입 2명',
      currentWorkStyle: '종이 일보 작성 후 Excel로 재입력, 현장 중심 구두 커뮤니케이션',
      toolsUsed: ['Excel', '종이 일보', '전화/무전기'],
      automationExperience: '없음. "제조 현장은 사람이 직접 봐야 한다"는 문화',
    },
    painPoints: [
      '생산 일보를 종이에 쓴 후 Excel로 다시 입력하는 이중 작업',
      '불량률, 설비 가동률 집계를 수작업으로 해서 시간이 오래 걸림',
      '현장 팀원들은 PC 사용이 서툴러 보고서 작성을 꺼려함',
      '데이터는 있는데 분석을 못 해서 개선점을 찾기 어려움'
    ],
    expectations: [
      '현장에서 스마트폰으로 간단히 입력하면 자동으로 보고서가 나오면',
      '복잡한 시스템 없이 우리 현장에 맞는 간단한 자동화',
      '팀원들이 거부감 없이 사용할 수 있는 방법이면 좋겠음'
    ],
    concerns: [
      '현장 베테랑들이 "이런 거 안 해도 지금까지 잘했다"며 거부하지 않을까?',
      '제조 현장의 특수성(보안, 인터넷 제한 등)을 AI가 이해할까?',
      '투자 대비 효과가 확실하지 않으면 경영진 설득이 어려움'
    ]
  },

  {
    id: 'P5',
    name: '박철수',
    role: '스마트팩토리추진팀 팀장',
    jobFunction: '제조',
    teamDigitalMaturity: '중급',
    age: 42,
    experience: 12,
    teamContext: {
      teamSize: 5,
      teamComposition: '30-40대, MES/PLC 운영 경험자',
      currentWorkStyle: 'MES/SCADA 시스템 운영, 센서 데이터 수집 중',
      toolsUsed: ['MES', 'SCADA', 'PLC', 'Excel', 'Power BI'],
      automationExperience: '설비 데이터 자동 수집은 되지만, 분석과 리포팅은 수작업',
    },
    painPoints: [
      '여러 시스템(MES, SCADA, ERP)에서 데이터를 수집하지만 통합이 어려움',
      '이상 징후는 감지되지만 원인 분석과 대응은 여전히 사람이 해야 함',
      '설비별로 데이터 포맷이 달라 통합 대시보드 만들기가 어려움',
      '팀원들이 각자 Excel로 분석해서 일관성이 없음'
    ],
    expectations: [
      'AI가 설비 데이터 패턴을 분석해서 예지보전 시점을 알려주면',
      '시스템 간 데이터 통합을 자동화하는 방법',
      '팀 전체가 같은 대시보드를 보고 의사결정할 수 있도록'
    ],
    concerns: [
      'AI 분석 결과를 현장 팀장들이 신뢰할 수 있을까?',
      '실시간 데이터 처리가 가능할까? 아니면 배치만 가능할까?',
      '기존 MES/SCADA 시스템과 통합이 가능할까?'
    ]
  },

  {
    id: 'P6',
    name: '김태영',
    role: '생산기술팀 팀장',
    jobFunction: '제조',
    teamDigitalMaturity: '고급',
    age: 38,
    experience: 10,
    teamContext: {
      teamSize: 4,
      teamComposition: '30대, 공정 엔지니어 + 데이터 분석 가능',
      currentWorkStyle: 'Python으로 공정 최적화 알고리즘 개발, Edge 디바이스 운영',
      toolsUsed: ['Python', 'TensorFlow', 'Docker', 'PLC', 'Raspberry Pi', 'InfluxDB'],
      automationExperience: '딥러닝 기반 불량 검출, 공정 파라미터 최적화 자동화 운영 중',
    },
    painPoints: [
      '공정 최적화 알고리즘을 팀원들이 각자 개발해서 재사용이 어려움',
      '새로운 설비마다 처음부터 코딩해야 해서 시간이 오래 걸림',
      'ML 모델 학습과 배포 파이프라인이 표준화되지 않음',
      '현장 엔지니어들은 우리가 만든 모델을 블랙박스로 여겨 신뢰하지 않음'
    ],
    expectations: [
      '도메인 지식 없이도 AI가 최적의 공정 파라미터를 찾아주면',
      'MLOps 파이프라인을 빠르게 구축하는 방법',
      '비개발자 현장 팀원들도 사용할 수 있는 인터페이스 설계 가이드'
    ],
    concerns: [
      '제조 도메인 전문성이 충분한 AI일까?',
      'Edge computing 환경(인터넷 제한, 실시간 처리)도 고려할까?',
      '워크샵이 제조업 특성을 제대로 반영할까?'
    ]
  },

  // ========================================
  // R&D 직군 (3개 팀)
  // ========================================
  {
    id: 'P7',
    name: '김수연',
    role: '실험연구팀 팀장',
    jobFunction: 'R&D',
    teamDigitalMaturity: '초보',
    age: 35,
    experience: 8,
    teamContext: {
      teamSize: 6,
      teamComposition: '30-40대, 화학/생물 전공 실험 연구원',
      currentWorkStyle: '실험 노트 수기 작성, 결과는 Excel로 정리',
      toolsUsed: ['실험 노트', 'Excel', 'Word', 'Email'],
      automationExperience: '없음. "실험은 사람이 직접 해야 한다"고 생각',
    },
    painPoints: [
      '실험 결과를 일일이 노트에 쓴 후 Excel로 재입력',
      '과거 실험 데이터를 찾으려면 노트를 뒤져야 함',
      '비슷한 실험을 반복하는데 이전 결과를 활용하기 어려움',
      '팀원들이 각자 다른 형식으로 기록해서 통합이 불가능'
    ],
    expectations: [
      '실험 데이터를 자동으로 기록하는 시스템이 있으면',
      'AI가 과거 실험 데이터에서 패턴을 찾아주면',
      '팀원들도 쉽게 사용할 수 있는 디지털 실험 노트'
    ],
    concerns: [
      '실험은 예측 불가능한데 자동화가 가능할까?',
      '우리 연구 분야를 AI가 이해할까?',
      '팀원들이 디지털 도구 사용에 익숙하지 않은데 따라올까?'
    ]
  },

  {
    id: 'P8',
    name: '이준호',
    role: '시뮬레이션팀 팀장',
    jobFunction: 'R&D',
    teamDigitalMaturity: '중급',
    age: 33,
    experience: 6,
    teamContext: {
      teamSize: 5,
      teamComposition: '20-30대, 기계/전자 공학 박사급',
      currentWorkStyle: 'MATLAB/ANSYS/COMSOL 사용, 시뮬레이션 결과는 수작업 분석',
      toolsUsed: ['MATLAB', 'ANSYS', 'COMSOL', 'Excel', 'Python(일부)'],
      automationExperience: 'MATLAB 스크립트로 파라미터 스윕 자동화, 하지만 결과 분석은 수작업',
    },
    painPoints: [
      '시뮬레이션 조건 설정을 매번 수작업으로 입력',
      '수백 개 결과 파일을 일일이 열어서 비교 분석',
      '팀원마다 다른 후처리 스크립트를 사용해서 재현이 어려움',
      '최적 파라미터 찾는 과정이 시행착오로 시간이 오래 걸림'
    ],
    expectations: [
      '시뮬레이션 결과 분석을 자동화하는 방법',
      'AI가 최적 파라미터를 찾아주는 시스템',
      'CAE 도구와 연동 가능한 자동화 워크플로우'
    ],
    concerns: [
      'CAE 소프트웨어와 API 연동이 가능할까?',
      '우리 분야 특성상 복잡도가 높은데 35분에 이해 가능할까?',
      'AI가 공학적 제약조건을 이해하고 제안할까?'
    ]
  },

  {
    id: 'P9',
    name: '정다은',
    role: 'AI연구팀 팀장',
    jobFunction: 'R&D',
    teamDigitalMaturity: '고급',
    age: 31,
    experience: 5,
    teamContext: {
      teamSize: 4,
      teamComposition: '20-30대, AI/ML 전공 석박사',
      currentWorkStyle: 'Python/PyTorch로 모델 개발, Docker/K8s로 배포',
      toolsUsed: ['Python', 'PyTorch', 'TensorFlow', 'MLflow', 'Kubernetes', 'Git'],
      automationExperience: 'ML 학습 파이프라인 구축, 하지만 실험 관리와 버전 관리가 복잡',
    },
    painPoints: [
      '매번 처음부터 ML 파이프라인을 구축하느라 시간 소모',
      '실험 결과가 너무 많아서 관리가 어렵고 재현이 힘듦',
      '모델 배포 후 모니터링과 재학습 자동화가 안 됨',
      '팀원들이 각자 다른 실험 관리 도구를 써서 공유가 어려움'
    ],
    expectations: [
      'MLOps 자동화를 빠르게 구축하는 best practice',
      'AI가 최적의 하이퍼파라미터와 모델 아키텍처를 제안해주면',
      '실험 관리와 버전 관리를 자동화하는 워크플로우'
    ],
    concerns: [
      '우리는 이미 많이 자동화했는데 새로 배울 게 있을까?',
      '워크샵이 너무 기초적이거나 일반적이지 않을까?',
      '우리 도메인(딥러닝 연구)에 특화된 내용이 있을까?'
    ]
  },

  // ========================================
  // Staff 직군 (3개 팀)
  // ========================================
  {
    id: 'P10',
    name: '윤서영',
    role: 'HR팀 팀장',
    jobFunction: 'Staff',
    teamDigitalMaturity: '초보',
    age: 40,
    experience: 12,
    teamContext: {
      teamSize: 4,
      teamComposition: '30-40대, 인사/노무 전문가',
      currentWorkStyle: '인사시스템에서 데이터 다운로드 후 Excel 수작업 분석',
      toolsUsed: ['인사시스템', 'Excel', 'Word', 'Email'],
      automationExperience: '없음. "사람 일은 자동화하기 어렵다"고 생각',
    },
    painPoints: [
      '월별 인력 현황 보고서를 매번 같은 양식으로 수작업 작성',
      '퇴직률, 채용률 등 지표를 Excel 수식으로 일일이 계산',
      '여러 시스템(인사, 급여, 평가)에서 데이터를 각각 추출해서 통합',
      '팀원들이 같은 작업을 반복하는데 자동화 방법을 모름'
    ],
    expectations: [
      '보고서가 자동으로 생성되면 팀원들 업무 부담이 줄어들 것',
      'AI가 이직 위험 직원을 조기에 파악해주면',
      '개인정보 보호하면서 데이터 분석하는 방법'
    ],
    concerns: [
      '개인정보 처리가 안전할까? 법적 문제는 없을까?',
      'HR 업무는 사람의 판단이 중요한데 AI가 도움이 될까?',
      '팀원들이 "우리 일자리가 없어지는 거 아니냐"고 오해하지 않을까?'
    ]
  },

  {
    id: 'P11',
    name: '강민철',
    role: '재무팀 팀장',
    jobFunction: 'Staff',
    teamDigitalMaturity: '중급',
    age: 36,
    experience: 9,
    teamContext: {
      teamSize: 5,
      teamComposition: '30-40대, 회계사/세무사 자격증 보유',
      currentWorkStyle: 'ERP 데이터 추출 후 Excel 매크로로 일부 자동화',
      toolsUsed: ['ERP', 'Excel (VBA 매크로)', 'Power BI', 'Email'],
      automationExperience: '팀원 중 한 명이 VBA 매크로를 만들었지만 다른 팀원은 사용 못함',
    },
    painPoints: [
      '월마감 시 여러 시스템에서 데이터 수집하는 데 하루 종일 걸림',
      '예산 대비 실적 분석 리포트를 매번 수작업으로 작성',
      'VBA 매크로를 만든 팀원이 퇴사하면 유지보수를 못함',
      '경영진이 요구하는 리포트 형식이 자주 바뀌어 매번 수정'
    ],
    expectations: [
      'ERP와 다른 시스템 데이터를 자동으로 통합하는 방법',
      'AI가 예산 편차 원인을 분석해주면',
      '팀 전체가 사용할 수 있는 표준 자동화 워크플로우'
    ],
    concerns: [
      '재무 데이터 정확성이 최우선인데 AI가 실수하진 않을까?',
      'ERP 시스템과 연동이 가능할까? 보안은?',
      '감사 대응할 때 자동화 로직을 설명할 수 있을까?'
    ]
  },

  {
    id: 'P12',
    name: '서하은',
    role: '경영분석팀 팀장',
    jobFunction: 'Staff',
    teamDigitalMaturity: '고급',
    age: 32,
    experience: 5,
    teamContext: {
      teamSize: 3,
      teamComposition: '20-30대, 데이터 분석 전문가',
      currentWorkStyle: 'Python/SQL로 데이터 분석, Tableau로 대시보드 구축',
      toolsUsed: ['Python', 'SQL', 'Tableau', 'Redash', 'Git', 'Airflow'],
      automationExperience: '데이터 파이프라인 구축, 하지만 각 부서 요청에 일일이 대응하느라 바쁨',
    },
    painPoints: [
      '각 부서가 요청하는 리포트를 일일이 맞춤 제작해야 함',
      '데이터 파이프라인 유지보수에 시간을 너무 많이 씀',
      '셀프서비스 BI를 구축하고 싶지만 방법을 모름',
      '임원들은 간단한 질문도 우리 팀에 요청해서 병목 발생'
    ],
    expectations: [
      '각 부서가 스스로 데이터를 조회할 수 있는 셀프서비스 시스템',
      'AI가 자연어 질문을 받아 자동으로 분석 결과를 제공하면',
      '데이터 파이프라인 구축을 더 빠르게 하는 방법'
    ],
    concerns: [
      '드디어 Staff 업무용 자동화 도구를 찾았다!',
      '기술적으로 충분히 깊이 있을까? 아니면 너무 간단할까?',
      '우리가 이미 구축한 시스템과 통합 가능할까?'
    ]
  },
];

// 워크샵 단계별 시뮬레이션 프롬프트 생성
function generateWorkshopPrompt(persona: Persona): string {
  return `당신은 "${persona.name}" (${persona.age}세, ${persona.role}, ${persona.experience}년차)입니다.

# 당신의 역할과 팀 정보
- 역할: ${persona.role}
- 직무 분야: ${persona.jobFunction}
- 팀 규모: ${persona.teamContext.teamSize}명
- 팀 구성: ${persona.teamContext.teamComposition}

# 팀의 현재 상태 (디지털 성숙도: ${persona.teamDigitalMaturity})
- 현재 업무 방식: ${persona.teamContext.currentWorkStyle}
- 사용 중인 도구: ${persona.teamContext.toolsUsed.join(', ')}
- 자동화 경험: ${persona.teamContext.automationExperience}

# 팀장으로서 당신의 고민 (Pain Points)
${persona.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

# 워크샵에 대한 기대사항
${persona.expectations.map((e, i) => `${i + 1}. ${e}`).join('\n')}

# 우려사항
${persona.concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

이제 당신은 **팀장 자격**으로 "Work Redesign Platform" 워크샵에 참여합니다. 이 워크샵은 35분 동안 진행되며, AI를 활용해 팀의 반복 업무를 자동화하는 방법을 배우고 실제 자동화 계획을 수립하는 과정입니다.

워크샵은 다음 단계로 진행됩니다:

**Step 1-2: 시작 및 도메인 선택 (5분)**
- 워크샵 소개 및 목표 설명
- 자신의 팀 업무 도메인 선택 (마케팅/제조/R&D/Staff)

**Step 3: 팀의 수작업 입력 (5분)**
- 팀에서 현재 반복적으로 수작업하는 업무 3-5개 입력
- 각 업무의 소요 시간, 빈도, 담당 팀원, 어려움 등 상세 기록

**Step 4: AI 작업 추출 (7분)**
- AI가 입력한 수작업을 분석하여 자동화 가능한 세부 작업으로 분해
- 각 작업의 자동화 난이도, 예상 효과, 필요한 도구 등을 평가

**Step 5: AI 컨설팅 (8분)**
- 추출된 작업 중 하나를 선택하여 AI와 1:1 대화
- 팀에 맞는 자동화 방법, 필요한 도구, 구현 방법, 팀원 교육 방법 등을 질문하고 답변 받음

**Step 6: 워크플로우 디자인 (7분)**
- AI가 제안한 내용을 바탕으로 팀의 자동화 워크플로우 시각화
- 단계별 실행 계획 수립 (누가, 언제, 무엇을)

**Step 7: 결과 확인 및 다음 단계 (3분)**
- 워크샵 결과물 확인 (팀 자동화 계획서, 워크플로우 다이어그램)
- 팀에 적용하기 위한 다음 단계 안내

---

**팀장 관점을 유지하면서** 이 워크샵을 경험한다고 상상하고, 다음 질문에 답변해주세요:

## 1. 도메인 선택 (Step 1-2)
워크샵 소개를 들었을 때 팀장으로서 첫인상은 어땠나요? 팀의 업무 도메인(${persona.jobFunction})을 선택할 때 어떤 생각이 들었나요?

## 2. 팀의 수작업 입력 (Step 3)
팀에서 반복적으로 수작업하는 업무를 입력하라고 할 때:
- 어떤 업무들이 떠올랐나요? (구체적으로 3-5개 나열)
- 각 업무는 주로 누가(어떤 팀원이) 담당하나요?
- 이 과정이 쉬웠나요, 어려웠나요? 왜 그런가요?
- 5분이라는 시간이 충분했나요?

## 3. AI 작업 추출 (Step 4)
AI가 당신 팀의 수작업을 분석해서 자동화 가능한 세부 작업으로 쪼개주었습니다:
- AI의 분석 결과가 팀의 실제 업무를 잘 이해했다고 느꼈나요?
- 제안된 자동화 방법이 팀에 실현 가능해 보였나요?
- 팀원들이 따라할 수 있을 것 같나요?
- 놀라웠거나 유용했던 인사이트가 있었나요?
- 어떤 점이 부족하거나 아쉬웠나요?

## 4. AI 컨설팅 (Step 5)
AI와 1:1 대화를 통해 팀의 자동화 방법을 상담받았습니다:
- 팀장으로서 AI에게 어떤 질문을 했나요? (구체적으로 3-4개)
- AI의 답변이 팀 상황에 도움이 되었나요? 구체적으로 어떤 부분이 좋았나요?
- AI가 팀의 특성(디지털 수준, 팀 구성)을 이해하지 못한 부분이 있었나요?
- 팀원들에게 이 내용을 어떻게 전달하고 설득할 수 있을까요?
- 이 과정에서 불편했거나 개선이 필요한 점은?

## 5. 워크플로우 디자인 (Step 6)
팀의 자동화 워크플로우를 시각적으로 설계하는 단계입니다:
- 제안된 워크플로우가 팀의 실제 업무 프로세스에 맞았나요?
- 팀원들이 이 워크플로우를 실제로 수행할 수 있을 것 같나요?
- 난이도가 팀 수준에 적절했나요? (너무 쉽거나 너무 어렵지 않았나요?)
- 팀에 도입하려면 어떤 준비가 필요할까요?

## 6. 전체 경험 평가 (팀장 관점)
워크샵을 끝까지 완료한 후:
- 전체적인 만족도는? (1-10점, 이유 포함)
- 가장 유용했던 단계는? 왜 그런가요?
- 가장 어려웠던 단계는? 왜 그런가요?
- 35분이라는 시간이 적절했나요?
- 실제로 이 워크샵 결과를 팀에 적용해볼 의향이 있나요?
- 다른 팀 팀장들에게 이 워크샵을 추천하겠습니까? (NPS 0-10점)

## 7. 팀 도입 관점의 개선 제안
팀장으로서 이 워크샵을 개선하려면:
- UI/UX 측면에서 개선이 필요한 점은?
- 콘텐츠 측면에서 추가되었으면 하는 내용은?
- 팀의 디지털 수준(${persona.teamDigitalMaturity})을 고려한 특별한 기능이 필요한가요?
- 팀의 직무(${persona.jobFunction})에 특화된 기능이 필요한가요?
- 팀원들을 설득하고 교육하는 데 필요한 자료나 기능은?
- 경영진에게 ROI를 보고하기 위한 측정 지표가 있으면 좋겠나요?

---

**중요**: 당신의 페르소나(팀장 역할, 팀 배경, 팀의 디지털 수준, 고민, 기대, 우려)를 일관되게 유지하면서 답변해주세요. 실제로 이 팀장이라면 어떻게 느끼고 반응할지, 팀원들을 어떻게 고려할지 구체적이고 현실적으로 작성해주세요.`;
}

// AI 시뮬레이션 실행
async function runPersonaSimulation(persona: Persona): Promise<any> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎭 페르소나 시뮬레이션 시작: ${persona.name} (${persona.id})`);
  console.log(`   ${persona.role} | 팀 디지털 수준: ${persona.teamDigitalMaturity}`);
  console.log(`   팀 규모: ${persona.teamContext.teamSize}명`);
  console.log(`${'='.repeat(60)}\n`);

  const prompt = generateWorkshopPrompt(persona);

  try {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', // 최신 Haiku 4.5
      max_tokens: 15000, // Claude 4.5 Haiku는 최대 64K 지원
      temperature: 0.7, // 페르소나 다양성을 위해 약간 높은 temperature
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`✅ ${persona.name} 시뮬레이션 완료\n`);

    return {
      persona,
      timestamp: new Date().toISOString(),
      response,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    };
  } catch (error: any) {
    console.error(`❌ ${persona.name} 시뮬레이션 실패:`, error.message);
    return {
      persona,
      timestamp: new Date().toISOString(),
      error: error.message,
      response: null,
    };
  }
}

// 결과를 마크다운으로 포맷팅
function formatResultsAsMarkdown(results: any[]): string {
  let markdown = `# AI 페르소나 시뮬레이션 결과 (팀장 관점)\n\n`;
  markdown += `**실행 일시**: ${new Date().toLocaleString('ko-KR')}\n`;
  markdown += `**총 페르소나 수**: ${results.length}개 팀\n`;
  markdown += `**관점**: 각 직무별 팀장이 팀의 자동화를 위해 워크샵 참여\n\n`;
  markdown += `---\n\n`;

  // 각 페르소나별 결과
  results.forEach((result, index) => {
    const { persona, response, error, usage } = result;

    markdown += `## ${index + 1}. ${persona.name} (${persona.id}) - ${persona.role}\n\n`;
    markdown += `- **직무**: ${persona.jobFunction}\n`;
    markdown += `- **팀의 디지털 성숙도**: ${persona.teamDigitalMaturity}\n`;
    markdown += `- **팀 규모**: ${persona.teamContext.teamSize}명\n`;
    markdown += `- **팀 구성**: ${persona.teamContext.teamComposition}\n`;
    markdown += `- **현재 업무 방식**: ${persona.teamContext.currentWorkStyle}\n`;
    markdown += `- **사용 도구**: ${persona.teamContext.toolsUsed.join(', ')}\n`;
    markdown += `- **자동화 경험**: ${persona.teamContext.automationExperience}\n\n`;

    if (error) {
      markdown += `### ❌ 시뮬레이션 실패\n\n`;
      markdown += `\`\`\`\n${error}\n\`\`\`\n\n`;
    } else {
      markdown += `### 워크샵 경험 피드백 (팀장 관점)\n\n`;
      markdown += `${response}\n\n`;

      if (usage) {
        markdown += `**토큰 사용량**: Input ${usage.input_tokens} | Output ${usage.output_tokens}\n\n`;
      }
    }

    markdown += `---\n\n`;
  });

  // 요약 섹션
  markdown += `## 📊 시뮬레이션 요약\n\n`;

  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  const totalInputTokens = results
    .filter(r => r.usage)
    .reduce((sum, r) => sum + r.usage.input_tokens, 0);
  const totalOutputTokens = results
    .filter(r => r.usage)
    .reduce((sum, r) => sum + r.usage.output_tokens, 0);

  markdown += `- **성공**: ${successful}개 팀\n`;
  markdown += `- **실패**: ${failed}개 팀\n`;
  markdown += `- **총 토큰 사용량**: ${totalInputTokens + totalOutputTokens} (Input: ${totalInputTokens}, Output: ${totalOutputTokens})\n\n`;

  // 직무별 분포
  markdown += `### 직무별 분포\n\n`;
  const byJobFunction = results.reduce((acc: any, r) => {
    const job = r.persona.jobFunction;
    acc[job] = (acc[job] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byJobFunction).forEach(([job, count]) => {
    markdown += `- **${job}**: ${count}개 팀\n`;
  });

  markdown += `\n### 팀 디지털 성숙도별 분포\n\n`;
  const byMaturity = results.reduce((acc: any, r) => {
    const level = r.persona.teamDigitalMaturity;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byMaturity).forEach(([level, count]) => {
    markdown += `- **${level}**: ${count}개 팀\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `## 다음 단계\n\n`;
  markdown += `1. 각 팀장의 피드백을 분석하여 주요 이슈 파악\n`;
  markdown += `2. 팀의 디지털 수준별, 직무별 공통 패턴 도출\n`;
  markdown += `3. 팀 도입 시 장애 요인 파악 (팀원 저항, 경영진 설득 등)\n`;
  markdown += `4. 우선순위가 높은 개선사항 선정\n`;
  markdown += `5. Phase 2 (사내 직원 섀도우 런) 준비\n\n`;

  return markdown;
}

// 메인 실행 함수
async function main() {
  console.log('\n🚀 AI 페르소나 시뮬레이션 시작 (팀장 관점)\n');
  console.log(`총 ${personas.length}개 팀의 팀장을 순차적으로 시뮬레이션합니다.\n`);

  const results: any[] = [];

  // 12개 페르소나 순차 실행
  for (const persona of personas) {
    const result = await runPersonaSimulation(persona);
    results.push(result);

    // API Rate Limit 방지를 위해 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ 모든 페르소나 시뮬레이션 완료\n');

  // 결과를 마크다운으로 저장
  const markdown = formatResultsAsMarkdown(results);
  const outputDir = '/Users/crystal/Desktop/new/1-Projects/Work Redesign';
  const outputPath = path.join(outputDir, '페르소나_시뮬레이션_결과_팀장관점.md');

  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`📄 결과 저장 완료: ${outputPath}\n`);

  // JSON 형식으로도 저장 (추가 분석용)
  const jsonPath = path.join(outputDir, '페르소나_시뮬레이션_결과_팀장관점.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`📄 JSON 저장 완료: ${jsonPath}\n`);

  console.log('🎉 시뮬레이션 완료!\n');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { runPersonaSimulation, personas, formatResultsAsMarkdown };
