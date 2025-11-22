#!/usr/bin/env ts-node

/**
 * 상세 파일럿 시뮬레이션
 * - 시간제한 없이 자연스러운 진행
 * - 각 단계별 소요시간 측정
 * - 구체적인 어려움과 피드백 수집
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

// ===================================
// 워크샵 단계별 정의 (실제 워크샵 구조)
// ===================================
const WORKSHOP_STAGES = [
  {
    id: 'stage1',
    name: '워크샵 소개 및 목표 설정',
    description: 'AI 자동화의 필요성과 워크샵 목표 이해',
    estimatedMinutes: 5,
    activities: [
      'AI 자동화 트렌드 소개',
      '워크샵 목표와 기대효과 설명',
      '참가자 기대사항 확인'
    ]
  },
  {
    id: 'stage2',
    name: '우리 팀 업무 분석',
    description: '현재 업무 프로세스 매핑 및 비효율 발견',
    estimatedMinutes: 10,
    activities: [
      '일일/주간 업무 리스트업',
      '반복 업무 식별',
      '수동 작업 시간 측정',
      '병목 구간 파악'
    ]
  },
  {
    id: 'stage3',
    name: 'AI 도구 탐색',
    description: '업무별 적용 가능한 AI 도구 매칭',
    estimatedMinutes: 10,
    activities: [
      'ChatGPT/Claude 활용법',
      'Zapier/Make 자동화',
      'Microsoft Copilot 소개',
      '업종별 특화 도구'
    ]
  },
  {
    id: 'stage4',
    name: '자동화 시나리오 설계',
    description: '우선순위 업무 선정 및 자동화 계획',
    estimatedMinutes: 15,
    activities: [
      'ROI 높은 업무 선정',
      '자동화 워크플로우 설계',
      '필요 리소스 파악',
      '예상 효과 계산'
    ]
  },
  {
    id: 'stage5',
    name: '실습: 첫 자동화 구현',
    description: '간단한 자동화 직접 체험',
    estimatedMinutes: 20,
    activities: [
      'AI 프롬프트 작성 실습',
      '간단한 자동화 플로우 구축',
      '실시간 테스트',
      '문제 해결'
    ]
  },
  {
    id: 'stage6',
    name: '팀 적용 계획 수립',
    description: '실제 팀 도입을 위한 로드맵',
    estimatedMinutes: 10,
    activities: [
      '단계별 도입 계획',
      '팀원 교육 방안',
      '성과 측정 지표',
      '리스크 관리'
    ]
  },
  {
    id: 'stage7',
    name: 'Q&A 및 마무리',
    description: '질의응답 및 후속 지원 안내',
    estimatedMinutes: 5,
    activities: [
      '개별 질문 답변',
      '추가 리소스 제공',
      '후속 지원 프로그램 안내'
    ]
  }
];

// ===================================
// 향상된 페르소나 정의
// ===================================
interface DetailedPersona {
  // 기본 정보
  id: string;
  name: string;
  age: number;
  role: string;
  department: string;

  // 팀 상황
  teamSize: number;
  teamComposition: string; // "주니어 중심" / "시니어 중심" / "균형"
  reportingLevel: number; // 1=임원직속, 2=부문장, 3=팀장

  // 디지털 역량
  personalDigitalSkill: '초급' | '중급' | '고급' | '전문가';
  teamDigitalMaturity: '초보' | '발전중' | '성숙' | '선도';
  previousAutomationExperience: string;

  // 조직 문화
  organizationSize: 'startup' | 'SMB' | 'enterprise';
  organizationCulture: '보수적' | '중도적' | '혁신적';
  decisionMakingSpeed: '매우느림' | '느림' | '보통' | '빠름' | '매우빠름';
  changeReadiness: number; // 1-10

  // 업무 특성
  workStructure: '고도구조화' | '반구조화' | '비구조화';
  taskRepetitiveness: number; // 1-10 (반복성)
  customerFacing: boolean;
  regulatoryCompliance: boolean;

  // 개인 특성
  learningStyle: '이론형' | '실습형' | '사례형' | '토론형';
  timeAvailability: '매우부족' | '부족' | '보통' | '충분';
  motivationLevel: number; // 1-10
  mainConcerns: string[];

  // KPI & 목표
  primaryKPI: string;
  quarterlyGoals: string[];
  painPoints: string[];
  expectedBenefits: string[];
}

// 다양한 페르소나 생성
const detailedPersonas: DetailedPersona[] = [
  // === 1. 디지털 초보 + 대기업 ===
  {
    id: 'DP01',
    name: '김상무',
    age: 52,
    role: '영업본부장',
    department: '글로벌영업본부',
    teamSize: 45,
    teamComposition: '시니어 중심',
    reportingLevel: 1,
    personalDigitalSkill: '초급',
    teamDigitalMaturity: '초보',
    previousAutomationExperience: '엑셀 매크로 정도만 사용',
    organizationSize: 'enterprise',
    organizationCulture: '보수적',
    decisionMakingSpeed: '느림',
    changeReadiness: 3,
    workStructure: '고도구조화',
    taskRepetitiveness: 6,
    customerFacing: true,
    regulatoryCompliance: true,
    learningStyle: '사례형',
    timeAvailability: '매우부족',
    motivationLevel: 5,
    mainConcerns: [
      '팀원들이 따라올 수 있을까?',
      '보안 문제는 없을까?',
      '투자 대비 효과가 있을까?',
      '기존 시스템과 충돌하지 않을까?'
    ],
    primaryKPI: '분기 매출 목표 달성률',
    quarterlyGoals: ['해외 매출 20% 증대', '신규 거래처 10개 확보'],
    painPoints: [
      '일일 영업 보고서 작성에 2시간',
      '고객 데이터 수동 관리',
      '팀 간 정보 공유 지연'
    ],
    expectedBenefits: [
      '보고서 자동화로 영업 집중',
      '고객 인사이트 실시간 확보',
      '의사결정 속도 향상'
    ]
  },

  // === 2. 디지털 네이티브 + 스타트업 ===
  {
    id: 'DP02',
    name: '이지은',
    age: 29,
    role: '프로덕트 매니저',
    department: '프로덕트팀',
    teamSize: 6,
    teamComposition: '주니어 중심',
    reportingLevel: 2,
    personalDigitalSkill: '고급',
    teamDigitalMaturity: '성숙',
    previousAutomationExperience: 'Notion, Slack, JIRA 자동화 활용 중',
    organizationSize: 'startup',
    organizationCulture: '혁신적',
    decisionMakingSpeed: '매우빠름',
    changeReadiness: 9,
    workStructure: '비구조화',
    taskRepetitiveness: 3,
    customerFacing: true,
    regulatoryCompliance: false,
    learningStyle: '실습형',
    timeAvailability: '부족',
    motivationLevel: 9,
    mainConcerns: [
      '너무 많은 도구로 인한 피로감',
      '빠른 성장에 따른 프로세스 변화',
      '제한된 예산'
    ],
    primaryKPI: '사용자 만족도(NPS)',
    quarterlyGoals: ['MAU 50% 성장', '버그 30% 감소'],
    painPoints: [
      '사용자 피드백 수동 분류',
      'A/B 테스트 결과 분석 지연',
      '개발팀과의 커뮤니케이션 비효율'
    ],
    expectedBenefits: [
      '사용자 인사이트 자동 추출',
      '실험 속도 2배 향상',
      '크로스팀 협업 효율화'
    ]
  },

  // === 3. 중간관리자 + 제조업 ===
  {
    id: 'DP03',
    name: '박과장',
    age: 38,
    role: '품질관리팀장',
    department: '품질혁신센터',
    teamSize: 12,
    teamComposition: '균형',
    reportingLevel: 3,
    personalDigitalSkill: '중급',
    teamDigitalMaturity: '발전중',
    previousAutomationExperience: 'ERP, MES 시스템 사용',
    organizationSize: 'SMB',
    organizationCulture: '중도적',
    decisionMakingSpeed: '보통',
    changeReadiness: 6,
    workStructure: '반구조화',
    taskRepetitiveness: 8,
    customerFacing: false,
    regulatoryCompliance: true,
    learningStyle: '이론형',
    timeAvailability: '보통',
    motivationLevel: 7,
    mainConcerns: [
      'ISO 인증 요구사항 충족',
      '현장 작업자 교육',
      '품질 데이터 정확성'
    ],
    primaryKPI: '불량률 감소',
    quarterlyGoals: ['불량률 1% 이하', '검사 자동화 50%'],
    painPoints: [
      '품질 보고서 수동 작성',
      '불량 원인 분석 시간 과다',
      '검사 데이터 입력 오류'
    ],
    expectedBenefits: [
      '실시간 품질 모니터링',
      'AI 기반 불량 예측',
      '보고서 자동 생성'
    ]
  },

  // === 4. C-Level + 디지털 전환 ===
  {
    id: 'DP04',
    name: '정대표',
    age: 45,
    role: 'CDO(Chief Digital Officer)',
    department: '디지털혁신실',
    teamSize: 25,
    teamComposition: '균형',
    reportingLevel: 1,
    personalDigitalSkill: '전문가',
    teamDigitalMaturity: '선도',
    previousAutomationExperience: '전사 디지털 전환 주도 경험',
    organizationSize: 'enterprise',
    organizationCulture: '혁신적',
    decisionMakingSpeed: '빠름',
    changeReadiness: 10,
    workStructure: '반구조화',
    taskRepetitiveness: 2,
    customerFacing: false,
    regulatoryCompliance: false,
    learningStyle: '토론형',
    timeAvailability: '충분',
    motivationLevel: 10,
    mainConcerns: [
      '전사 확산 전략',
      'ROI 증명',
      '조직 저항 관리'
    ],
    primaryKPI: '디지털 전환 성숙도',
    quarterlyGoals: ['AI 도입률 70%', '자동화율 40%'],
    painPoints: [
      '부서 간 사일로',
      '레거시 시스템 통합',
      '변화 관리'
    ],
    expectedBenefits: [
      '전사 AI 활용 문화',
      '혁신 속도 가속화',
      '데이터 기반 의사결정'
    ]
  },

  // === 5. 현장 실무자 + 서비스업 ===
  {
    id: 'DP05',
    name: '최대리',
    age: 31,
    role: '고객서비스팀 대리',
    department: '고객경험본부',
    teamSize: 8,
    teamComposition: '주니어 중심',
    reportingLevel: 3,
    personalDigitalSkill: '중급',
    teamDigitalMaturity: '발전중',
    previousAutomationExperience: '챗봇 운영 경험',
    organizationSize: 'SMB',
    organizationCulture: '중도적',
    decisionMakingSpeed: '보통',
    changeReadiness: 7,
    workStructure: '반구조화',
    taskRepetitiveness: 7,
    customerFacing: true,
    regulatoryCompliance: false,
    learningStyle: '실습형',
    timeAvailability: '부족',
    motivationLevel: 8,
    mainConcerns: [
      '고객 응대 품질 유지',
      '팀원 스킬 격차',
      '시스템 안정성'
    ],
    primaryKPI: '고객 만족도(CSAT)',
    quarterlyGoals: ['응답시간 30% 단축', 'CSAT 90% 달성'],
    painPoints: [
      '반복 문의 수동 응대',
      '고객 이력 파악 시간',
      'FAQ 업데이트 지연'
    ],
    expectedBenefits: [
      'AI 상담 보조',
      '자동 티켓 분류',
      '고객 감정 분석'
    ]
  },

  // === 6. 연구개발 + 바이오/헬스케어 ===
  {
    id: 'DP06',
    name: '송박사',
    age: 41,
    role: '신약개발팀 수석연구원',
    department: 'R&D센터',
    teamSize: 15,
    teamComposition: '시니어 중심',
    reportingLevel: 2,
    personalDigitalSkill: '고급',
    teamDigitalMaturity: '성숙',
    previousAutomationExperience: 'AI 신약 스크리닝, 데이터 분석 도구',
    organizationSize: 'enterprise',
    organizationCulture: '중도적',
    decisionMakingSpeed: '느림',
    changeReadiness: 5,
    workStructure: '고도구조화',
    taskRepetitiveness: 4,
    customerFacing: false,
    regulatoryCompliance: true,
    learningStyle: '이론형',
    timeAvailability: '보통',
    motivationLevel: 6,
    mainConcerns: [
      'FDA 규제 준수',
      '데이터 보안',
      '연구 윤리'
    ],
    primaryKPI: '파이프라인 진행률',
    quarterlyGoals: ['임상 2상 진입', '특허 3건 출원'],
    painPoints: [
      '문헌 리뷰 시간',
      '실험 데이터 정리',
      '보고서 작성'
    ],
    expectedBenefits: [
      'AI 문헌 분석',
      '실험 설계 최적화',
      '자동 보고서 생성'
    ]
  },

  // === 7. 교육/트레이닝 담당 ===
  {
    id: 'DP07',
    name: '한차장',
    age: 35,
    role: 'HRD팀 차장',
    department: '인재개발원',
    teamSize: 5,
    teamComposition: '균형',
    reportingLevel: 3,
    personalDigitalSkill: '중급',
    teamDigitalMaturity: '발전중',
    previousAutomationExperience: 'LMS 운영, 온라인 교육 플랫폼',
    organizationSize: 'enterprise',
    organizationCulture: '중도적',
    decisionMakingSpeed: '보통',
    changeReadiness: 8,
    workStructure: '반구조화',
    taskRepetitiveness: 6,
    customerFacing: false,
    regulatoryCompliance: false,
    learningStyle: '토론형',
    timeAvailability: '보통',
    motivationLevel: 9,
    mainConcerns: [
      '전사 교육 효과성',
      '개인별 맞춤 교육',
      '교육 ROI 측정'
    ],
    primaryKPI: '교육 이수율',
    quarterlyGoals: ['AI 교육 전사 확대', '만족도 95%'],
    painPoints: [
      '교육 콘텐츠 제작',
      '학습 진도 관리',
      '효과 측정'
    ],
    expectedBenefits: [
      'AI 튜터링',
      '맞춤형 학습 경로',
      '자동 평가'
    ]
  },

  // === 8. 재무/회계 전문가 ===
  {
    id: 'DP08',
    name: '윤회계사',
    age: 36,
    role: '재무팀 매니저',
    department: 'CFO실',
    teamSize: 7,
    teamComposition: '시니어 중심',
    reportingLevel: 2,
    personalDigitalSkill: '중급',
    teamDigitalMaturity: '발전중',
    previousAutomationExperience: 'ERP, RPA 일부 활용',
    organizationSize: 'SMB',
    organizationCulture: '보수적',
    decisionMakingSpeed: '느림',
    changeReadiness: 4,
    workStructure: '고도구조화',
    taskRepetitiveness: 9,
    customerFacing: false,
    regulatoryCompliance: true,
    learningStyle: '이론형',
    timeAvailability: '매우부족',
    motivationLevel: 5,
    mainConcerns: [
      '회계 기준 준수',
      '감사 대응',
      '데이터 정확성'
    ],
    primaryKPI: '결산 정확도',
    quarterlyGoals: ['월 결산 D+3', '오류율 0.1% 이하'],
    painPoints: [
      '전표 처리 시간',
      '보고서 작성',
      '데이터 대조'
    ],
    expectedBenefits: [
      '자동 분개',
      'AI 이상 탐지',
      '실시간 대시보드'
    ]
  },

  // === 9. 마케팅 크리에이티브 ===
  {
    id: 'DP09',
    name: '강팀장',
    age: 33,
    role: '디지털마케팅팀장',
    department: '마케팅본부',
    teamSize: 10,
    teamComposition: '주니어 중심',
    reportingLevel: 3,
    personalDigitalSkill: '고급',
    teamDigitalMaturity: '성숙',
    previousAutomationExperience: '마케팅 자동화 툴, AI 카피라이팅',
    organizationSize: 'SMB',
    organizationCulture: '혁신적',
    decisionMakingSpeed: '빠름',
    changeReadiness: 9,
    workStructure: '비구조화',
    taskRepetitiveness: 5,
    customerFacing: true,
    regulatoryCompliance: false,
    learningStyle: '실습형',
    timeAvailability: '부족',
    motivationLevel: 10,
    mainConcerns: [
      '크리에이티브 품질',
      'ROI 증명',
      '트렌드 캐치'
    ],
    primaryKPI: 'ROAS(광고수익률)',
    quarterlyGoals: ['ROAS 400%', '브랜드 인지도 30% 상승'],
    painPoints: [
      '콘텐츠 대량 생산',
      'A/B 테스트',
      '성과 분석'
    ],
    expectedBenefits: [
      'AI 콘텐츠 생성',
      '자동 최적화',
      '예측 분석'
    ]
  },

  // === 10. IT/보안 관리자 ===
  {
    id: 'DP10',
    name: '임팀장',
    age: 40,
    role: '정보보안팀장',
    department: 'CISO실',
    teamSize: 6,
    teamComposition: '균형',
    reportingLevel: 2,
    personalDigitalSkill: '전문가',
    teamDigitalMaturity: '선도',
    previousAutomationExperience: 'SIEM, SOAR, 보안 자동화',
    organizationSize: 'enterprise',
    organizationCulture: '보수적',
    decisionMakingSpeed: '느림',
    changeReadiness: 3,
    workStructure: '고도구조화',
    taskRepetitiveness: 7,
    customerFacing: false,
    regulatoryCompliance: true,
    learningStyle: '이론형',
    timeAvailability: '부족',
    motivationLevel: 7,
    mainConcerns: [
      'AI 도입 시 보안 리스크',
      '데이터 유출 방지',
      '컴플라이언스'
    ],
    primaryKPI: '보안 사고 zero',
    quarterlyGoals: ['보안 점검 자동화', '취약점 50% 감소'],
    painPoints: [
      '로그 분석',
      '위협 탐지',
      '보안 교육'
    ],
    expectedBenefits: [
      'AI 위협 탐지',
      '자동 대응',
      '예측 보안'
    ]
  }
];

// ===================================
// 시뮬레이션 실행 함수
// ===================================
interface StageResponse {
  stageId: string;
  stageName: string;

  // 시간 관련
  startTime: Date;
  endTime: Date;
  actualMinutes: number;
  expectedMinutes: number;
  timePerception: '너무 짧음' | '적절' | '너무 김';

  // 이해도
  comprehensionLevel: number; // 1-10
  confusionPoints: string[];
  clarityPoints: string[];

  // 참여도
  engagementLevel: number; // 1-10
  interestingParts: string[];
  boringParts: string[];

  // 실무 적용성
  practicalityScore: number; // 1-10
  applicableElements: string[];
  notApplicableReasons: string[];

  // 어려움
  difficultyLevel: number; // 1-10
  specificChallenges: string[];
  supportNeeded: string[];

  // 질문/피드백
  questions: string[];
  suggestions: string[];

  // 감정 상태
  emotionalState: string; // "흥미진진", "집중", "피곤", "좌절", "만족" 등
  confidenceLevel: number; // 1-10
}

interface SimulationResult {
  persona: DetailedPersona;
  workshopDate: Date;

  // 전체 시간
  totalStartTime: Date;
  totalEndTime: Date;
  totalMinutes: number;

  // 단계별 응답
  stageResponses: StageResponse[];

  // 종합 평가
  overallSatisfaction: number; // 1-10
  netPromoterScore: number; // -100 to 100
  wouldRecommend: boolean;

  // 핵심 인사이트
  topThreeTakeaways: string[];
  immediateActionItems: string[];
  blockers: string[];

  // 후속 니즈
  followUpNeeds: string[];
  preferredSupport: string[];
  timelineForImplementation: string;

  // 팀 적용 계획
  teamRolloutStrategy: string;
  expectedChallenges: string[];
  successMetrics: string[];

  // 자유 피드백
  additionalComments: string;
}

async function simulateWorkshopStage(
  persona: DetailedPersona,
  stage: typeof WORKSHOP_STAGES[0],
  previousStages: StageResponse[]
): Promise<StageResponse> {

  const prompt = `당신은 ${persona.name}(${persona.role})입니다.

=== 당신의 프로필 ===
- 나이: ${persona.age}세
- 팀 규모: ${persona.teamSize}명 (${persona.teamComposition})
- 디지털 역량: ${persona.personalDigitalSkill}
- 팀 디지털 성숙도: ${persona.teamDigitalMaturity}
- 조직 문화: ${persona.organizationCulture}
- 학습 스타일: ${persona.learningStyle}
- 주요 고민: ${persona.mainConcerns.join(', ')}
- 기대효과: ${persona.expectedBenefits.join(', ')}

=== 현재 진행 중인 워크샵 단계 ===
단계: ${stage.name}
설명: ${stage.description}
예상 시간: ${stage.estimatedMinutes}분
활동: ${stage.activities.join(', ')}

${previousStages.length > 0 ? `
=== 이전 단계 경험 ===
${previousStages.map(s => `- ${s.stageName}: ${s.emotionalState}, 이해도 ${s.comprehensionLevel}/10`).join('\\n')}
` : ''}

=== 평가해 주세요 ===
이 단계를 실제로 경험한다고 상상하고, 다음을 JSON 형식으로 답변해주세요:

{
  "actualMinutes": 실제 소요될 것 같은 시간(분),
  "timePerception": "너무 짧음" | "적절" | "너무 김",

  "comprehensionLevel": 1-10,
  "confusionPoints": ["헷갈리는 부분들..."],
  "clarityPoints": ["명확했던 부분들..."],

  "engagementLevel": 1-10,
  "interestingParts": ["흥미로운 부분들..."],
  "boringParts": ["지루한 부분들..."],

  "practicalityScore": 1-10,
  "applicableElements": ["바로 적용 가능한 것들..."],
  "notApplicableReasons": ["적용 어려운 이유들..."],

  "difficultyLevel": 1-10,
  "specificChallenges": ["구체적 어려움들..."],
  "supportNeeded": ["필요한 지원들..."],

  "questions": ["궁금한 점들..."],
  "suggestions": ["개선 제안들..."],

  "emotionalState": "현재 감정 상태",
  "confidenceLevel": 1-10
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '{}';

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    return {
      stageId: stage.id,
      stageName: stage.name,
      startTime: new Date(),
      endTime: new Date(Date.now() + parsedResponse.actualMinutes * 60000),
      actualMinutes: parsedResponse.actualMinutes,
      expectedMinutes: stage.estimatedMinutes,
      timePerception: parsedResponse.timePerception,
      comprehensionLevel: parsedResponse.comprehensionLevel,
      confusionPoints: parsedResponse.confusionPoints,
      clarityPoints: parsedResponse.clarityPoints,
      engagementLevel: parsedResponse.engagementLevel,
      interestingParts: parsedResponse.interestingParts,
      boringParts: parsedResponse.boringParts,
      practicalityScore: parsedResponse.practicalityScore,
      applicableElements: parsedResponse.applicableElements,
      notApplicableReasons: parsedResponse.notApplicableReasons,
      difficultyLevel: parsedResponse.difficultyLevel,
      specificChallenges: parsedResponse.specificChallenges,
      supportNeeded: parsedResponse.supportNeeded,
      questions: parsedResponse.questions,
      suggestions: parsedResponse.suggestions,
      emotionalState: parsedResponse.emotionalState,
      confidenceLevel: parsedResponse.confidenceLevel,
    };

  } catch (error) {
    console.error(`Error in stage ${stage.name}:`, error);
    // 기본값 반환
    return {
      stageId: stage.id,
      stageName: stage.name,
      startTime: new Date(),
      endTime: new Date(),
      actualMinutes: stage.estimatedMinutes,
      expectedMinutes: stage.estimatedMinutes,
      timePerception: '적절',
      comprehensionLevel: 5,
      confusionPoints: [],
      clarityPoints: [],
      engagementLevel: 5,
      interestingParts: [],
      boringParts: [],
      practicalityScore: 5,
      applicableElements: [],
      notApplicableReasons: [],
      difficultyLevel: 5,
      specificChallenges: [],
      supportNeeded: [],
      questions: [],
      suggestions: [],
      emotionalState: '보통',
      confidenceLevel: 5,
    };
  }
}

async function generateOverallEvaluation(
  persona: DetailedPersona,
  stageResponses: StageResponse[]
): Promise<Partial<SimulationResult>> {

  const totalMinutes = stageResponses.reduce((sum, s) => sum + s.actualMinutes, 0);
  const avgComprehension = stageResponses.reduce((sum, s) => sum + s.comprehensionLevel, 0) / stageResponses.length;
  const avgEngagement = stageResponses.reduce((sum, s) => sum + s.engagementLevel, 0) / stageResponses.length;
  const avgPracticality = stageResponses.reduce((sum, s) => sum + s.practicalityScore, 0) / stageResponses.length;

  const prompt = `당신은 ${persona.name}(${persona.role})입니다.

방금 ${totalMinutes}분 동안의 AI 자동화 워크샵을 완료했습니다.

=== 단계별 경험 요약 ===
${stageResponses.map(s => `
${s.stageName}:
- 시간: ${s.actualMinutes}분 (${s.timePerception})
- 이해도: ${s.comprehensionLevel}/10
- 참여도: ${s.engagementLevel}/10
- 실용성: ${s.practicalityScore}/10
- 감정: ${s.emotionalState}
`).join('\\n')}

=== 종합 평가 ===
평균 이해도: ${avgComprehension.toFixed(1)}/10
평균 참여도: ${avgEngagement.toFixed(1)}/10
평균 실용성: ${avgPracticality.toFixed(1)}/10

다음을 JSON 형식으로 답변해주세요:

{
  "overallSatisfaction": 1-10,
  "netPromoterScore": -100 to 100,
  "wouldRecommend": true/false,

  "topThreeTakeaways": ["핵심 배운점 3가지"],
  "immediateActionItems": ["즉시 실행할 항목들"],
  "blockers": ["실행을 막는 장애물들"],

  "followUpNeeds": ["후속 지원 필요사항"],
  "preferredSupport": ["선호하는 지원 방식"],
  "timelineForImplementation": "구현 예상 일정",

  "teamRolloutStrategy": "팀 전개 전략",
  "expectedChallenges": ["예상되는 도전과제들"],
  "successMetrics": ["성공 측정 지표들"],

  "additionalComments": "추가 의견"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '{}';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Error in overall evaluation:', error);
    return {
      overallSatisfaction: 5,
      netPromoterScore: 0,
      wouldRecommend: false,
      topThreeTakeaways: [],
      immediateActionItems: [],
      blockers: [],
      followUpNeeds: [],
      preferredSupport: [],
      timelineForImplementation: '미정',
      teamRolloutStrategy: '미정',
      expectedChallenges: [],
      successMetrics: [],
      additionalComments: '',
    };
  }
}

// ===================================
// 메인 실행 함수
// ===================================
async function runDetailedSimulation() {
  console.log('\\n🚀 상세 파일럿 시뮬레이션 시작\\n');
  console.log('='.repeat(80));
  console.log(`총 ${detailedPersonas.length}명 페르소나 | ${WORKSHOP_STAGES.length}단계 워크샵\\n`);

  const allResults: SimulationResult[] = [];

  // 각 페르소나별 시뮬레이션
  for (const persona of detailedPersonas) {
    console.log(`\\n${'='.repeat(60)}`);
    console.log(`📊 시뮬레이션: ${persona.name} (${persona.role})`);
    console.log(`   ${persona.department} | ${persona.teamSize}명 팀 | ${persona.organizationSize}`);
    console.log(`   디지털 역량: ${persona.personalDigitalSkill} | 팀 성숙도: ${persona.teamDigitalMaturity}`);
    console.log(`${'='.repeat(60)}`);

    const workshopStart = new Date();
    const stageResponses: StageResponse[] = [];

    // 각 단계별 시뮬레이션
    for (let i = 0; i < WORKSHOP_STAGES.length; i++) {
      const stage = WORKSHOP_STAGES[i];
      console.log(`\\n   [${i + 1}/${WORKSHOP_STAGES.length}] ${stage.name}...`);

      const response = await simulateWorkshopStage(
        persona,
        stage,
        stageResponses
      );

      stageResponses.push(response);

      console.log(`      ✅ ${response.actualMinutes}분 소요 (예상: ${stage.estimatedMinutes}분)`);
      console.log(`      📈 이해도: ${response.comprehensionLevel}/10 | 참여도: ${response.engagementLevel}/10`);
      console.log(`      💭 ${response.emotionalState}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 종합 평가
    console.log(`\\n   📝 종합 평가 생성 중...`);
    const overallEval = await generateOverallEvaluation(persona, stageResponses);

    const workshopEnd = new Date();
    const totalMinutes = stageResponses.reduce((sum, s) => sum + s.actualMinutes, 0);

    const result: SimulationResult = {
      persona,
      workshopDate: workshopStart,
      totalStartTime: workshopStart,
      totalEndTime: workshopEnd,
      totalMinutes,
      stageResponses,
      ...overallEval as any,
    };

    allResults.push(result);

    console.log(`   ✨ 완료! 총 ${totalMinutes}분 | 만족도: ${overallEval.overallSatisfaction}/10`);
  }

  // 결과 저장
  await saveResults(allResults);

  // 분석 리포트 생성
  await generateAnalysisReport(allResults);

  console.log(`\\n${'='.repeat(80)}`);
  console.log('✅ 모든 시뮬레이션 완료!\\n');
}

// 결과 저장 함수
async function saveResults(results: SimulationResult[]) {
  const outputDir = '/Users/crystal/Desktop/new/1-Projects/Work Redesign';

  // JSON 저장
  const jsonPath = path.join(outputDir, `detailed_pilot_results_${Date.now()}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\\n📄 상세 결과 저장: ${jsonPath}`);
}

// 분석 리포트 생성
async function generateAnalysisReport(results: SimulationResult[]) {
  const outputDir = '/Users/crystal/Desktop/new/1-Projects/Work Redesign';

  let report = `# 🎯 AI 자동화 워크샵 상세 파일럿 분석 리포트

**실행 일시**: ${new Date().toLocaleString('ko-KR')}
**참가자 수**: ${results.length}명
**워크샵 단계**: ${WORKSHOP_STAGES.length}단계

---

## 1. 전체 요약

### 시간 분석
- **예상 시간**: ${WORKSHOP_STAGES.reduce((sum, s) => sum + s.estimatedMinutes, 0)}분
- **평균 실제 시간**: ${(results.reduce((sum, r) => sum + r.totalMinutes, 0) / results.length).toFixed(1)}분
- **최단 시간**: ${Math.min(...results.map(r => r.totalMinutes))}분
- **최장 시간**: ${Math.max(...results.map(r => r.totalMinutes))}분

### 만족도 분석
- **평균 만족도**: ${(results.reduce((sum, r) => sum + (r.overallSatisfaction || 0), 0) / results.length).toFixed(1)}/10
- **추천 의향**: ${results.filter(r => r.wouldRecommend).length}/${results.length}명
- **평균 NPS**: ${(results.reduce((sum, r) => sum + (r.netPromoterScore || 0), 0) / results.length).toFixed(0)}

---

## 2. 단계별 상세 분석

`;

  // 각 단계별 분석
  for (let i = 0; i < WORKSHOP_STAGES.length; i++) {
    const stage = WORKSHOP_STAGES[i];
    const stageData = results.map(r => r.stageResponses[i]).filter(Boolean);

    if (stageData.length === 0) continue;

    const avgActualTime = stageData.reduce((sum, s) => sum + s.actualMinutes, 0) / stageData.length;
    const avgComprehension = stageData.reduce((sum, s) => sum + s.comprehensionLevel, 0) / stageData.length;
    const avgEngagement = stageData.reduce((sum, s) => sum + s.engagementLevel, 0) / stageData.length;
    const avgPracticality = stageData.reduce((sum, s) => sum + s.practicalityScore, 0) / stageData.length;
    const avgDifficulty = stageData.reduce((sum, s) => sum + s.difficultyLevel, 0) / stageData.length;

    // 시간 인식 분석
    const timePerceptions = {
      '너무 짧음': stageData.filter(s => s.timePerception === '너무 짧음').length,
      '적절': stageData.filter(s => s.timePerception === '적절').length,
      '너무 김': stageData.filter(s => s.timePerception === '너무 김').length,
    };

    // 공통 어려움 추출
    const allChallenges = stageData.flatMap(s => s.specificChallenges);
    const challengeFreq = allChallenges.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topChallenges = Object.entries(challengeFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([challenge]) => challenge);

    report += `
### Stage ${i + 1}: ${stage.name}

#### 시간 분석
- **예상**: ${stage.estimatedMinutes}분 → **실제 평균**: ${avgActualTime.toFixed(1)}분
- **시간 인식**: 너무 짧음(${timePerceptions['너무 짧음']}명), 적절(${timePerceptions['적절']}명), 너무 김(${timePerceptions['너무 김']}명)

#### 평가 지표 (10점 만점)
- **이해도**: ${avgComprehension.toFixed(1)}
- **참여도**: ${avgEngagement.toFixed(1)}
- **실용성**: ${avgPracticality.toFixed(1)}
- **난이도**: ${avgDifficulty.toFixed(1)}

#### 주요 어려움
${topChallenges.map(c => `- ${c}`).join('\\n') || '- 없음'}

`;
  }

  // 페르소나별 요약
  report += `
---

## 3. 참가자별 상세 피드백

`;

  for (const result of results) {
    const { persona } = result;

    report += `
### ${persona.name} (${persona.role})
- **조직**: ${persona.organizationSize} | **팀 규모**: ${persona.teamSize}명
- **디지털 역량**: ${persona.personalDigitalSkill} | **팀 성숙도**: ${persona.teamDigitalMaturity}
- **총 소요시간**: ${result.totalMinutes}분
- **만족도**: ${result.overallSatisfaction || 0}/10
- **추천 의향**: ${result.wouldRecommend ? '✅' : '❌'}

#### 핵심 인사이트
${result.topThreeTakeaways?.map(t => `- ${t}`).join('\\n') || '- 없음'}

#### 즉시 실행 계획
${result.immediateActionItems?.map(i => `- ${i}`).join('\\n') || '- 없음'}

#### 장애요인
${result.blockers?.map(b => `- ${b}`).join('\\n') || '- 없음'}

---
`;
  }

  // 마지막 권장사항
  report += `
## 4. 개선 권장사항

### 즉시 개선 필요
1. 시간이 가장 부족했던 단계 확장
2. 이해도가 낮은 부분 보강
3. 실습 비중 증대

### 중기 개선 과제
1. 페르소나별 맞춤형 트랙 개발
2. 사전 준비 자료 제공
3. 후속 지원 프로그램 구축

### 장기 전략
1. 조직 규모별 차별화
2. 산업별 특화 콘텐츠
3. 성과 측정 체계 구축

---

*이 리포트는 AI 시뮬레이션 기반으로 생성되었습니다.*
`;

  const reportPath = path.join(outputDir, `워크샵_상세_파일럿_분석_${Date.now()}.md`);
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`📊 분석 리포트 저장: ${reportPath}`);
}

// 실행
if (require.main === module) {
  runDetailedSimulation().catch(console.error);
}

export { detailedPersonas, WORKSHOP_STAGES, simulateWorkshopStage };