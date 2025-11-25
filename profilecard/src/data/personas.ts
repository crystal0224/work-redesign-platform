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
            leadershipStyle: '데이터를 보여주며 설득하는 스타일. 아직 팀원 관리와 우선순위 조율에 어려움을 느낌.',
            hiddenStruggles: [
                '나보다 나이 많은 시니어 팀원(특히 10년차 분석가)에게 업무 지시하기가 매번 껄끄러움',
                '팀장 되고 나서 실무를 놓으니 감이 떨어지는 것 같아 불안함',
                '경영진은 "혁신"을 원하는데 팀원들은 "현상 유지"를 원해서 중간에서 끼인 느낌'
            ]
        },
        team: {
            size: 9,
            seniorCount: 4, // 시니어 4명 (본인보다 연차 높은 분석가 포함)
            juniorCount: 5, // 주니어 5명
            composition: '팀장 1명 + 시니어 캠페인 기획자 2명(8년차, 5년차) + 시니어 데이터 분석가 1명(10년차) + 시니어 디자이너 1명(7년차) + 주니어 콘텐츠 크리에이터 3명(2-3년차) + 주니어 퍼포먼스 마케터 2명(1-2년차)',
            digitalMaturity: 'Advanced',
            maturityDistribution: '시니어 분석가(Expert) + 시니어 기획자 2명(Advanced) + 시니어 디자이너(Advanced) + 주니어 5명(Intermediate)',
            resistanceFactors: [
                '시니어 분석가: "내가 해봤는데 그거 안 돼"라며 새로운 시도에 부정적',
                '디자이너: "데이터가 디자인의 창의성을 해친다"며 정량적 분석 거부',
                '주니어들: "팀장님이 시키는 대로만 할게요"라며 수동적인 태도'
            ]
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
            promotionReason: '금융권(KB, 신한) AICC(AI Contact Center) 구축 사업 200억 수주 성공. 경쟁사(KT) 대비 차별화된 제안 전략으로 승리',
            leadershipStyle: '영업통, 관계 지향, "형님 리더십". 술자리 회식 선호하지만 요즘 주니어들 눈치 봄.',
            hiddenStruggles: [
                '매일 술 마시는 게 체력적으로 너무 힘든데 영업하려면 어쩔 수 없다고 합리화 중',
                '실적 압박 때문에 잠을 잘 못 자고 탈모가 오는 것 같음',
                '가족과 보낼 시간이 부족해서 아내와 아이들에게 항상 미안함'
            ]
        },
        team: {
            size: 11,
            seniorCount: 5,
            juniorCount: 6,
            composition: '팀장 1명 + AM(Account Manager) 5명(금융/공공) + 제안 PM 4명 + 영업지원 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Intermediate 5명(시니어 AM) + Advanced 6명(주니어 PM)',
            resistanceFactors: [
                '시니어 AM: "영업은 발로 뛰는 거지 컴퓨터 앞에 앉아있는 게 아니다"라며 CRM 입력 거부',
                '주니어 PM: "선배들이 자료를 안 줘서 일을 못하겠다"며 불만 토로',
                '팀 전체: "매출만 잘 나오면 장땡 아니냐"는 성과 지상주의'
            ]
        },
        work: {
            mainTasks: [
                '금융/공공기관 대상 AICC, Cloud, 5G MEC 솔루션 영업',
                '대형 입찰(RFP) 제안서 작성 및 프레젠테이션 (수백 장 분량)',
                '고객사 임원급(C-Level) 네트워크 관리 및 골프/식사 접대',
                '계약 협상 및 수주 심의(Profitability Review) 대응',
                '주간 파이프라인(Pipeline) 관리 및 매출 예측(Forecasting)'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전일 고객 미팅 결과 구두 보고 (CRM 입력 안 함) → 10-12시 제안 PM들과 전략 회의 ("이번 제안서에 AI 꼭 넣어") → 오후 1-3시 고객사(여의도) 방문 미팅 → 3-5시 본사 복귀해서 수주 심의 자료 검토 → 5-6시 팀원들과 담배 타임하며 정보 공유 → 저녁 7시 고객사 저녁 식사',
            weeklyRoutine: '월: 주간 영업 회의 (매출 압박) | 화: 고객사 임원 조찬 | 수: 제안서 스토리라인 점검 | 목: 수주 심의 위원회 | 금: 주간 활동 보고 및 폭탄주 회식',
            collaboration: '팀 내부: 카카오톡 단톡방이 메인. CRM(Salesforce)은 "숙제"처럼 입력. 타 부서: AI사업팀과 솔루션 스펙 싸움("이 기능 왜 안돼요?"), 법무팀과 계약 조항 검토. 외부: 고객사 IT 담당자와 형/동생 사이.',
            toolsUsed: ['Salesforce(CRM)', 'PowerPoint', 'Excel', '카카오톡', 'T맵', '명함관리 앱(Remember)'],
            painPoints: [
                '시니어 AM들이 영업 활동(미팅, 접대) 내역을 CRM에 입력을 안 해서, 팀장이 본부장 보고할 때마다 "너네 뭐 했냐"고 깨짐',
                '제안서 마감(Due date) 전날이면 주니어 PM들이 밤새서 PPT 만드는데, 시니어들은 "오타 확인해" 하고 퇴근함 (세대 갈등)',
                '고객사가 "경쟁사는 이거 공짜로 주던데"라며 무리한 요구를 할 때, 내부 설득(가격 할인 승인)이 더 힘듦'
            ],
            automationNeeds: [
                '영업 통화/미팅 녹음 자동 요약 및 CRM 자동 입력 (제발 수기 입력 좀 없애줘)',
                'RFP(제안요청서) 파일 넣으면 제안서 초안(목차, 장표) 자동 생성',
                '고객사 뉴스/인사이동 자동 알림 ("김 상무님 승진하셨대" 알려주기)'
            ],
            workStructure: {
                level: '비구조화',
                description: '영업은 "생물"이라 프로세스대로 안 됨. 고객 마음 바뀌면 다 뒤집어짐. 제안서는 정형적이나 영업 활동 자체는 매우 비정형적. "감"과 "네트워크" 의존도 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '영업은 술 마시고 형님 동생 해야 되는데 AI가 그걸 대신해주나?',
                'CRM 입력 자동화되면 진짜 편하긴 하겠는데, 내 영업 비밀(인맥)이 다 털리는 거 아닌가',
                '주니어들이 AI로 제안서 쓰면 퀄리티가 나올까? (내가 다시 다 고쳐야 하는 거 아냐?)'
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
            promotionReason: 'M15 팹(Fab) Photo 공정 수율 95% 조기 달성. 노광 장비 가동률 최적화로 생산성 15% 향상',
            leadershipStyle: '현장 밀착형, 데이터 기반 문제 해결, "현장에 답이 있다". 3교대 근무자들과 라면 먹으며 소통.',
            hiddenStruggles: [
                '현장 반장님들이 나를 "책상물림"이라고 무시하는 것 같아 위축됨',
                '설비 고장 나면 내 탓인 것 같아 노이로제 걸릴 지경 (새벽 벨소리 공포증)',
                '3교대라 밤낮이 바뀌어서 수면 장애와 만성 피로에 시달림'
            ]
        },
        team: {
            size: 24,
            seniorCount: 8,
            juniorCount: 16,
            composition: '팀장 1명 + 파트장 4명(주간) + 교대조 조장 4명 + 오퍼레이터 15명(4조3교대)',
            digitalMaturity: 'Beginner',
            maturityDistribution: 'Intermediate 4명(파트장) + Beginner 20명(현장직)',
            resistanceFactors: [
                '현장 오퍼레이터: "바빠 죽겠는데 태블릿 들고 다니라고?"라며 디지털 도구 사용 거부',
                '조장급: "우리는 우리만의 방식(노하우)이 있다"며 표준화/매뉴얼화 거부',
                '고령 작업자: "눈 침침해서 작은 글씨 안 보인다"며 시스템 사용 회피'
            ]
        },
        work: {
            mainTasks: [
                '반도체 전공정(Photo/Etch) 생산 라인 운영 및 스케줄링',
                '설비 트러블(Down) 발생 시 긴급 조치 및 엔지니어 호출',
                '일일/주간 생산 목표(WIP) 달성 관리',
                '현장 안전 수칙 준수 및 5S(정리/정돈/청소/청결/습관화) 활동',
                '교대 근무자 근태 및 인력 관리'
            ],
            dailyWorkflow: '오전 6:30 출근(일찍 옴) → 7시 야간조-주간조 인수인계 미팅 (특이사항 공유) → 8-10시 라인 순회 (방진복 착용, 설비 알람 체크) → 10:30 공정 회의 (수율 저하 원인 분석) → 12시 구내식당 → 오후 2시 설비 PM(예방정비) 일정 조율 → 3시 주간조-오후조 인수인계 → 4-5시 일일 생산 리포트 작성 → 6시 퇴근 (설비 고장나면 못 감)',
            weeklyRoutine: '월: 주간 생산 목표달성 회의 | 화: 안전 환경 점검의 날 | 수: 설비 개선 제안 활동 | 목: 신입 사원 OJT 현황 점검 | 금: 주간 결산 및 주말 근무 편성',
            collaboration: '팀 내부: 무전기와 사내 메신저, 수기 로그북 병행. 타 부서: 장비팀과 "설비 좀 빨리 고쳐달라" 싸움, 공정팀과 "레시피가 문제다" 논쟁. 외부: 협력사 직원(청소/유지보수) 관리.',
            toolsUsed: ['MES(제조실행시스템)', 'Excel', 'PowerPoint', '무전기', '수기 인수인계 장부'],
            painPoints: [
                '야간에 설비 알람(Error Code 304) 뜨면 조장이 매뉴얼 책자 찾아보느라 30분 허비함 (그동안 라인 멈춤)',
                '인수인계할 때 "아까 그 설비 이상 소리 나더라" 같은 중요한 정보가 구두로만 전달되고 기록이 안 남음',
                '신입 사원들이 방진복 입고 클린룸 들어가면 누가 누군지 몰라서 교육하기 힘듦 (OJT 효율 저하)'
            ],
            automationNeeds: [
                '설비 에러 코드 찍으면 조치 방법 바로 알려주는 AI 챗봇 (태블릿 연동)',
                '음성 인식 기반 인수인계 자동 기록 및 요약 (무전기 내용 텍스트화)',
                '신입 사원용 AR 매뉴얼 (설비 비추면 조작법 뜸)'
            ],
            workStructure: {
                level: '반구조화',
                description: '생산 절차는 표준화되어 있으나, 설비 고장 등 돌발 상황 대응은 경험(감)에 의존. 인수인계가 아날로그 방식. 데이터는 시스템에 쌓이나 현장 활용도 낮음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '현장 오퍼레이터들은 장갑 끼고 일하는데 터치스크린이나 키보드 칠 시간 없음',
                'AI가 "설비 멈추세요" 했는데 오작동이면 하루 생산량 날아감. 책임 소재 불분명',
                '3교대라 교육시킬 시간이 없음 (비번 날 불러내면 싫어함)'
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
            promotionReason: '글로벌 완성차 업체(Ford, VW) 대상 2조원 규모 배터리 공급 계약 체결 주도. 기술 영업과 가격 협상력의 완벽한 조화로 평가받음',
            leadershipStyle: '전략적, 코칭형. 하지만 장기 프로젝트 관리의 피로감과 팀원들의 번아웃을 걱정함.',
            hiddenStruggles: [
                '고객사는 갑, 우리는 을이라는 관계에서 오는 자괴감과 스트레스',
                '해외 출장이 너무 잦아서 시차 적응이 안 되고 건강이 망가짐',
                '기술적인 내용을 깊이 몰라서 R&D팀에게 무시당할 때가 있어 공부해야 한다는 압박감'
            ]
        },
        team: {
            size: 15,
            seniorCount: 6,
            juniorCount: 9,
            composition: '팀장 1명 + Key Account Manager(KAM) 6명(북미/유럽 담당) + 기술 영업(Sales Engineer) 4명 + 영업 기획/지원 4명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 10명(KAM, 기술영업) + Intermediate 5명(지원)',
            resistanceFactors: [
                '기술 영업: "영업팀이 기술도 모르면서 무리한 약속을 한다"며 비협조적 태도',
                '지원팀: "맨날 급하다고만 한다"며 프로세스 준수 요구 (유연성 부족)',
                'KAM: "고객 대응하느라 바쁜데 내부 보고용 자료 만들 시간 없다"며 반발'
            ]
        },
        work: {
            mainTasks: [
                '글로벌 완성차 OEM 대상 배터리 장기 공급 계약(RFQ) 수주',
                '고객사 기술 요구사항(Spec) 파악 및 내부 R&D/생산팀 조율',
                '판가(Pricing) 시뮬레이션 및 수익성 분석',
                '계약 협상 및 공급망 이슈 대응 (IRA 법안 대응 등)',
                '분기별 QBR(Quarterly Business Review) 진행'
            ],
            dailyWorkflow: '오전 8시 출근 (미주/유럽 시차 때문에 일찍 시작) → 8:30 밤사이 들어온 고객사 이메일 확인 (평균 50통) → 9:30 내부 전략 회의 (R&D팀과 스펙 협의) → 11-12시 판가 시뮬레이션 엑셀 작업 → 오후 2-4시 고객사 화상 회의 (영어/독일어) → 4-6시 회의록 정리 및 본사 보고서 작성 → 저녁 8시 퇴근 (해외 출장 잦음)',
            weeklyRoutine: '월: 주간 수주 현황 보고 (Global Sales Meeting) | 화: 기술 영업 미팅 | 수: 고객사 방문 또는 컨퍼런스 콜 | 목: 원가 분석 및 판가 전략 수립 | 금: 주간 이슈 정리 및 차주 출장 계획',
            collaboration: '팀 내부: Salesforce로 기회(Opportunity) 관리, Teams로 소통. 타 부서: R&D팀과 배터리 성능 데이터 싸움, 생산팀과 납기 일정 조율(맨날 싸움). 외부: 고객사 구매/기술 담당자와 매일 연락.',
            toolsUsed: ['Salesforce', 'SAP', 'Excel (매크로 필수)', 'Zoom/Teams', 'Jira (R&D 협업용)'],
            painPoints: [
                '고객사가 보내는 RFQ(견적요청서)가 수백 페이지짜리 PDF인데, 이걸 엑셀로 옮겨 적는 데만 3일 걸림',
                'R&D팀은 "그 스펙 못 맞춘다"고 하고, 고객사는 "무조건 해달라"고 해서 중간에서 조율하느라 스트레스 폭발',
                '환율, 원자재 가격 변동에 따라 수익성 시뮬레이션을 다시 돌려야 하는데 엑셀 수식이 너무 복잡해서 자주 깨짐'
            ],
            automationNeeds: [
                'RFQ 문서 자동 분석 및 스펙 요건 추출 (PDF to Excel)',
                '원자재 가격 연동 판가 자동 시뮬레이션',
                '고객사 미팅 녹취 및 자동 요약 (다국어 지원 필수)'
            ],
            workStructure: {
                level: '반구조화',
                description: '수주 프로세스(RFQ → 제안 → 협상 → 계약)는 명확하나, 각 단계별 변수가 너무 많음. 고객사 요구사항이 수시로 바뀜. 내부 설득 과정이 더 힘듦.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                'B2B 영업은 "Human Touch"가 핵심인데 AI가 고객 관계를 대체할 수 있을까',
                '보안이 생명인 계약 내용을 클라우드 AI에 올려도 되는지 (법무팀 승인 필요)',
                '팀원들이 너무 바빠서 새로운 툴 배울 시간이 1도 없음'
            ],
            dropoutRisk: 15,
        },
        personality: {
            patience: 8,
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
            promotionReason: 'SK매직 렌탈 서비스 전국 판매 1위 달성. 지역 대리점과의 상생 모델 구축으로 이탈률 0% 기록',
            leadershipStyle: '현장 중심, 형님 리더십, 발로 뛰는 영업. 디지털보다는 대면 소통 선호.',
            hiddenStruggles: [
                '본사 정책이 현장과 너무 동떨어져 있어서 중간에서 욕받이 역할 하느라 지침',
                '나도 이제 나이가 들어서 하루 종일 운전하고 현장 뛰는 게 체력적으로 힘듦',
                '디지털 전환 하라는데 솔직히 나부터가 키오스크도 잘 못 써서 두려움'
            ]
        },
        team: {
            size: 20,
            seniorCount: 8,
            juniorCount: 12,
            composition: '팀장 1명 + 지역 영업 관리자(SV) 15명(서울/경기/지방) + 영업지원 4명',
            digitalMaturity: 'Beginner',
            maturityDistribution: 'Intermediate 3명(지원팀) + Beginner 17명(현장 SV, 40-50대 많음)',
            resistanceFactors: [
                '지역 SV: "현장 상황 모르는 소리 하지 마라"며 본사 지침 무시',
                '대리점주: "복잡한 거 싫다"며 기존 방식(전화/종이) 고수',
                '팀 전체: "영업은 사람이 하는 거지 기계가 하는 게 아니다"라는 강한 신념'
            ]
        },
        work: {
            mainTasks: [
                '전국 SK매직 대리점 및 판매점 관리 (매장 순회)',
                '렌탈 상품(정수기, 공기청정기) 프로모션 기획 및 전파',
                '현장 판매 사원(MC) 교육 및 동기 부여',
                '지역별 매출 목표 관리 및 실적 독려',
                '고객 불만(VOC) 현장 해결'
            ],
            dailyWorkflow: '오전 8시 출근 → 8:30 전일 실적 집계표 확인 (엑셀) → 9시 지역 SV들과 단체 카톡방 조회 → 10시-오후 4시 대리점 현장 순회 (하루 평균 5곳 방문, 운전 4시간) → 4-5시 현장 이슈 본사 보고 → 5-6시 내일 방문 일정 조율 → 저녁 7시 대리점 사장님들과 저녁 식사(술자리)',
            weeklyRoutine: '월: 주간 실적 회의 (본사) | 화-목: 지방 출장 및 현장 순회 | 금: 주간 프로모션 정산 및 비용 처리',
            collaboration: '팀 내부: 카카오톡 단톡방이 메인. 공지사항도 카톡, 실적 보고도 카톡. 이메일은 잘 안 봄. 타 부서: 물류팀과 배송 지연 싸움, 마케팅팀과 판촉물 지원 요청. 외부: 대리점주들과 형/동생 하며 지냄.',
            toolsUsed: ['카카오톡', 'Excel', '전화', 'T맵', '사내 모바일 영업 앱(느려서 잘 안 씀)'],
            painPoints: [
                '현장 SV들이 하루 종일 운전하느라 PC를 못 봄. 모든 보고를 카톡이나 전화로 해서 팀장이 다시 엑셀에 옮겨 적어야 함',
                '프로모션 정책이 매주 바뀌는데, 대리점주들이 헷갈려서 옛날 가격으로 팔고 옴. 차액 정산하느라 머리 아픔',
                '영업 앱이 너무 느리고 복잡해서 현장에서 아무도 안 씀. 결국 종이 계약서 쓰고 사진 찍어 보냄'
            ],
            automationNeeds: [
                '카톡으로 실적 보내면 자동으로 엑셀에 정리해주는 봇',
                '복잡한 렌탈 요금표를 챗봇으로 물어보면 바로 답해주는 기능',
                '현장 방문 음성 기록 자동 텍스트 변환 (운전 중에 쓸 수 있게)'
            ],
            workStructure: {
                level: '비구조화',
                description: '현장 상황에 따라 유동적. 정해진 프로세스보다 "융통성"이 중요. 데이터보다 "감"과 "관계"로 영업. 본사 시스템과 현장의 괴리가 큼.'
            }
        },
        expectedBehavior: {
            initialAttitude: '회의적',
            concerns: [
                '현장 아재들이 AI를 쓸까? 카톡도 겨우 쓰는데',
                '본사 책상물림들이 만든 툴이 현장에서 먹힐 리가 없음',
                '자동화되면 우리 SV들 일자리 없어지는 거 아니냐는 불안감'
            ],
            dropoutRisk: 40,
        },
        personality: {
            patience: 4,
            techSavvy: 2,
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
            promotionReason: 'M16 팹(Fab) 초기 램프업(Ramp-up) 시기 수율 조기 안정화 달성. 공정 자동화 시스템 도입으로 인당 생산성 20% 향상',
            leadershipStyle: '원칙 준수, 데이터 기반, 안전 제일. 24시간 긴장 상태 유지.',
            hiddenStruggles: [
                '24시간 돌아가는 공장이라 주말에도 전화 올까 봐 항상 긴장 상태 (휴대폰을 손에서 못 놓음)',
                '엔지니어 출신이라 사람 관리보다 기계 관리가 더 편해서 팀원 상담이 어려움',
                '수율 떨어지면 본사 임원들한테 깨지는 게 일상이라 자존감이 자주 하락함'
            ]
        },
        team: {
            size: 25,
            seniorCount: 10,
            juniorCount: 15,
            composition: '팀장 1명 + 단위 공정(포토/에칭/증착) 엔지니어 5명 + 생산 교대조 관리자 12명(4조3교대) + 데이터 분석가 2명 + 설비 유지보수 5명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 7명(엔지니어, 분석가) + Intermediate 8명 + Beginner 10명(현장 교대조)',
            resistanceFactors: [
                '교대조: "인수인계 시간 늘어나는 거 싫다"며 새로운 툴 도입 반대',
                '엔지니어: "데이터는 내가 직접 엑셀로 보는 게 제일 빠르다"며 시스템 불신',
                '현장직: "방진복 입고 디바이스 조작하기 불편하다"며 수기 기록 선호'
            ]
        },
        work: {
            mainTasks: [
                '반도체 팹(Fab) 24시간 무중단 운영 관리',
                '공정 수율(Yield) 모니터링 및 저수율 원인 분석(Excursion 대응)',
                '설비 가동률(OEE) 극대화 및 예방 정비 스케줄링',
                '클린룸 내 안전 수칙 준수 관리',
                '일일 생산 목표 달성 및 WIP(재공 재고) 관리'
            ],
            dailyWorkflow: '오전 8시 출근 → 8:30 아침 생산 회의 (전날 밤 이슈 확인) → 9-11시 라인 투어 (클린룸 방진복 착용) → 11-12시 수율 분석 미팅 → 오후 1-3시 설비 업체 미팅 → 3-4시 교대조 인수인계 참관 → 4-6시 일일 리포트 작성 및 본사 보고 → 퇴근 후에도 알람 대기',
            weeklyRoutine: '월: 주간 수율 리뷰 | 화: 설비 PM(예방정비) 계획 | 수: 안전 환경 점검 | 목: 신규 공정 레시피 적용 검토 | 금: 주간 생산 결산',
            collaboration: '팀 내부: MES, Spotfire로 데이터 확인. 교대조와는 전자 로그북(e-Log)으로 소통. 타 부서: 소자팀과 수율 개선 협업, 장비팀과 긴급 수리 대응. 외부: 장비 벤더(ASML, AMAT) 엔지니어 상주 관리.',
            toolsUsed: ['MES(제조실행시스템)', 'Spotfire(데이터시각화)', 'YMS(수율관리시스템)', 'Excel', 'Splunk'],
            painPoints: [
                '수율이 0.1%만 떨어져도 비상인데, 원인 찾으려면 수만 개 공정 데이터를 엑셀/Spotfire로 일일이 뒤져야 함',
                '교대 근무자 간 인수인계가 구두로 이뤄져서 정보 누락 발생 ("아까 말했는데 못 들었어?" 싸움)',
                '설비가 갑자기 멈추면(Down) 1분당 수천만 원 손해인데, 엔지니어 올 때까지 손가락만 빨고 있음'
            ],
            automationNeeds: [
                'AI 기반 공정 이상 징후(Excursion) 실시간 탐지 및 원인 추천',
                '교대 근무 인수인계 자동 요약 및 중요 이슈 하이라이팅',
                '설비 고장 예측(PdM) 및 부품 교체 시기 알림'
            ],
            workStructure: {
                level: '고도구조화',
                description: '반도체 공정은 나노 단위 정밀도 요구. 표준 작업 절차(SOP) 절대 준수. 모든 데이터는 시스템에 기록되나 분석은 사람 몫. 24시간 4조 3교대 시스템.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '생산 라인은 1초도 멈추면 안 되는데, 새로운 AI 시스템 도입하다가 시스템 뻗으면 누가 책임지나',
                '현장 오퍼레이터들은 복잡한 툴 싫어함. 버튼 하나로 끝나는 거 아니면 안 쓸 듯',
                '보안 때문에 폐쇄망 쓰는데 클라우드 기반 AI 툴을 쓸 수나 있을지'
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
            promotionReason: '전국 물류 거점(Hub) 통폐합 프로젝트 성공으로 연간 물류비 50억 절감. AI 배차 시스템 도입 초석 마련',
            leadershipStyle: '효율 중심, 데이터 기반, 시스템 개선 적극 추진. 하지만 현장 기사님들과의 소통은 어려워함.',
            hiddenStruggles: [
                '기사님들과의 거친 소통(욕설, 고성)에 감정 소모가 심해 퇴근하면 녹초가 됨',
                '위험물 안전 사고 나면 형사 처벌 받을 수도 있다는 공포감을 항상 안고 삼',
                '본사의 물류비 절감 압박과 현장의 현실적인 어려움 사이에서 괴리감 느낌'
            ]
        },
        team: {
            size: 18,
            seniorCount: 7,
            juniorCount: 11,
            composition: '팀장 1명 + 물류 기획 3명 + 재고 관리 5명 + 운송 관리(배차) 7명 + 시스템 운영 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 2명(시스템) + Advanced 6명 + Intermediate 7명 + Beginner 3명(현장 관리)',
            resistanceFactors: [
                '운송 기사: "운전 중에 앱 조작하라고? 사고 나면 책임질 거냐"며 반발',
                '현장 관리자: "기사님들 비위 맞추기도 힘든데 새로운 거 시키지 마라"며 방어적',
                '기존 직원: "TMS 시스템도 복잡한데 AI까지 배우라고?"라며 피로감 호소'
            ]
        },
        work: {
            mainTasks: [
                '전국 15개 저유소 및 물류센터 재고 통합 관리',
                '탱크로리 운송 스케줄링 및 최적 경로 배차',
                '위험물 안전 관리법 준수 및 사고 예방',
                '성수기(동절기 난방유 등) 긴급 수송 대응',
                '3PL(제3자 물류) 업체 성과 관리'
            ],
            dailyWorkflow: '오전 8:30 출근 → 9시 전국 저유소 재고 모니터링 → 10시 운송사 배차 회의 (전화 불남) → 11-12시 긴급 주문(주유소 재고 바닥) 대응 → 오후 1-3시 물류비 정산 및 시스템 오류 수정 → 3-5시 안전 사고 예방 교육 → 5-6시 익일 배차 계획 확정',
            weeklyRoutine: '월: 주간 물류 운영 계획 | 화: 운송사 성과 리뷰 | 수: 재고 실사 현황 점검 | 목: 물류 시스템 개선 회의 | 금: 주간 물류비 결산',
            collaboration: '팀 내부: TMS(운송관리시스템)가 메인. 카카오톡으로 기사님들과 소통. 타 부서: 영업팀과 출고 일정 조율(맨날 싸움), 생산팀과 입고 일정 공유. 외부: 운송사 및 지입 차주들과 매일 통화.',
            toolsUsed: ['WMS(창고관리)', 'TMS(운송관리)', 'SAP', 'Excel', 'Tableau', 'T맵'],
            painPoints: [
                '기사님들이 배차 앱을 안 쓰고 자꾸 전화로 "어디로 가요?" 물어봄. 하루 통화량 100통',
                '명절이나 연휴 전에는 주문 폭주해서 배차 꼬임. 수동으로 엑셀 돌려서 배차하느라 밤샘',
                '위험물 운송이라 사고 나면 대형 참사인데, 실시간 위치 추적(GPS)이 가끔 끊겨서 불안함'
            ],
            automationNeeds: [
                '실시간 교통정보 반영한 AI 자동 배차 및 경로 최적화',
                '기사님 전용 음성 봇 (전화하면 AI가 배차 정보 알려줌)',
                '위험물 운송 차량 실시간 관제 및 이상 징후 알림'
            ],
            workStructure: {
                level: '고도구조화',
                description: '물류 프로세스는 명확하나 현장 변수(날씨, 교통, 차 고장)가 너무 많음. 시스템은 잘 되어 있으나 현장 적용률이 떨어짐. 안전 규제 매우 엄격.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '시스템은 이미 좋은 거 많은데, 현장 기사님들이 안 쓰면 무용지물',
                'AI가 짠 배차 경로를 베테랑 기사님들이 "이 길 아닌데?" 하고 무시하면 어떡하나',
                '물류비 절감도 중요하지만 안전이 최우선인데 AI가 그걸 고려할까'
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
            promotionReason: '글로벌 고객사(Intel) 품질 감사(Audit) 만점 통과. 웨이퍼 결함 자동 검출 알고리즘 도입으로 불량 유출 0건 달성',
            leadershipStyle: '품질 제일주의, 데이터 기반 분석, 원칙 타협 없음. 깐깐하다는 평을 들음.',
            hiddenStruggles: [
                '품질 이슈 터지면 범인 취급 받는 게 억울하고 서러움 (잘하면 본전, 못하면 역적)',
                '고객사 갑질에 스트레스 받지만 회사를 위해 참아야 한다는 압박감',
                '완벽주의 성향 때문에 스스로를 갉아먹고 팀원들도 힘들게 하는 것 같아 고민'
            ]
        },
        team: {
            size: 12,
            seniorCount: 4,
            juniorCount: 8,
            composition: '팀장 1명 + 품질 엔지니어 4명(고객 대응) + 공정 품질 관리 4명 + 데이터 분석가 1명 + 검사원 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 5명(엔지니어, 분석가) + Intermediate 4명 + Beginner 3명',
            resistanceFactors: [
                '생산팀: "품질팀 때문에 생산 못 해먹겠다"며 협조 거부 및 갈등',
                '검사원: "내 눈이 기계보다 정확하다"며 AI 판독 결과 무시 및 불신',
                '엔지니어: "데이터 분석은 내가 알아서 할 테니 툴 강요하지 마라"는 전문가적 고집'
            ]
        },
        work: {
            mainTasks: [
                '웨이퍼 표면/엣지 결함 검사 및 출하 판정',
                '고객사(삼성, 하이닉스, 인텔) 품질 이슈(VOC) 대응 및 재발 방지',
                '공정 변경점(4M) 관리 및 품질 영향성 평가',
                '품질 경영 시스템(ISO) 유지 및 고객 감사 수검',
                '수율(Yield) 저하 원인 분석 및 개선'
            ],
            dailyWorkflow: '오전 8:30 출근 → 9시 전일 야간 생산분 품질 데이터(SPC) 확인 → 10시 불량 자재 격리 및 판정 회의 (살릴지 버릴지 결정) → 11-12시 공정 트러블 슈팅 → 오후 1-3시 고객사 품질 감사 대응 (영어 회의) → 3-5시 품질 개선 프로젝트 실험 → 5-6시 일일 품질 리포트 발행',
            weeklyRoutine: '월: 주간 불량률 분석 | 화: 공정 변경점 리뷰 | 수: 계측기 교정 및 점검 | 목: 협력사 품질 지도 | 금: 고객 클레임 대책 회의',
            collaboration: '팀 내부: QMS(품질관리시스템)로 데이터 공유. 타 부서: 생산팀과 불량 원인 공동 조사(범인 찾기), 개발팀과 신제품 품질 기준 수립. 외부: 고객사 품질 담당자와 매일 이메일 싸움.',
            toolsUsed: ['KLA(검사장비 SW)', 'Minitab', 'JMP', 'SAP QM', 'PowerPoint'],
            painPoints: [
                '웨이퍼 결함 이미지를 엔지니어들이 눈으로 보고 분류하느라 하루 3시간 씀 (눈 아픔)',
                '고객사가 "이거 왜 불량이야?" 물어보면 6개월 전 데이터까지 뒤져서 보고서 써야 함',
                '생산팀은 "생산량 맞춰야 하니 좀 봐달라"고 하고, 우리는 "절대 안 된다"고 싸우는 게 일상'
            ],
            automationNeeds: [
                'AI 기반 웨이퍼 결함 이미지 자동 분류 (Defect Classification)',
                '품질 이슈 발생 시 과거 유사 사례 자동 검색 및 원인 추천',
                '고객사 제출용 품질 성적서(COA) 자동 생성'
            ],
            workStructure: {
                level: '고도구조화',
                description: '품질 기준(Spec)은 법과 같음. 타협 불가. 검사 절차와 기준 명확히 문서화. 불량 발생 시 대응 프로토콜(OCAP) 존재. 데이터 분석 역량 중요.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '품질 데이터(결함 이미지)는 극비 보안 사항인데 외부 AI에 올려도 되나',
                'AI가 불량 판정했다가 만약에 불량 유출되면 책임은 누가 지나',
                '엔지니어들의 "장인 정신"(내 눈이 정확하다)을 설득할 수 있을까'
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
            promotionReason: '서산 공장 배터리 셀 2라인 셋업(Set-up) 및 조기 양산 안정화 주도. 화재 사고 0건 달성으로 안전 마스터 포상',
            leadershipStyle: '안전 제일(Safety First), 현장 밀착, "기본을 지키자". 목소리 큼.',
            hiddenStruggles: [
                '현장 작업자들이 말을 너무 안 들어서 속 터질 때가 많음 (안전모 좀 쓰라고!)',
                '과거 화재 사고 트라우마가 있어서 안전 문제에 과민 반응하게 됨',
                '본사에서는 현장을 너무 모른다고 생각하며, 보고서 꾸미는 일에 회의감 느낌'
            ]
        },
        team: {
            size: 30,
            seniorCount: 12,
            juniorCount: 18,
            composition: '팀장 1명 + 공정 파트장 4명 + 설비 엔지니어 6명 + 오퍼레이터 19명(3교대)',
            digitalMaturity: 'Beginner',
            maturityDistribution: 'Intermediate 6명(엔지니어) + Beginner 24명(현장직)',
            resistanceFactors: [
                '노조: "자동화 도입은 인력 감축을 위한 포석 아니냐"며 강력 반발',
                '현장직: "장갑 끼고 터치 안 된다", "기름 묻어서 기계 고장 난다"며 태블릿 사용 거부',
                '고참 반장: "라떼는 이런 거 없이도 잘만 만들었다"며 변화 거부'
            ]
        },
        work: {
            mainTasks: [
                '배터리 전극/조립/화성 공정 생산 라인 운영',
                '설비 가동률(OEE) 및 시간당 생산량(UPH) 관리',
                '현장 안전(SHE) 점검 및 작업자 보호구 착용 관리',
                '일일 생산 실적 집계 및 본사 보고',
                '현장 3정 5S 활동 및 개선 제안'
            ],
            dailyWorkflow: '오전 8시 TBM(Tool Box Meeting) 주재 (안전 구호 제창) → 9-11시 전극 라인 믹싱 장비 점검 (분진 날림 확인) → 11시 오전 생산량 엑셀 입력 → 오후 1-3시 화성 공정(Aging) 온도 데이터 체크 → 3-4시 설비 알람 발생 시 현장 뛰어감 → 4-5시 작업자 고충 상담 (담배 타임) → 5-6시 야간조 인수인계 및 퇴근',
            weeklyRoutine: '월: 주간 생산 계획 공유 | 화: 안전 교육 (동영상 시청) | 수: 설비 예방 정비(PM) | 목: 불량률 저감 분임조 활동 | 금: 주간 결산 및 대청소',
            collaboration: '팀 내부: 무전기, 현장 화이트보드, 카톡방. 타 부서: 설비기술팀과 "부품 언제 오냐" 독촉, 자재팀과 "양극재 재고 부족하다" 연락. 외부: 장비 업체 엔지니어와 유지보수 일정 조율.',
            toolsUsed: ['MES', 'Excel', '안전점검 체크리스트(종이)', '무전기', '사내 포털'],
            painPoints: [
                '설비 가동 데이터를 작업자들이 수기 일지에 적고, 나중에 엑셀에 또 입력함 (이중 작업, 오타 많음)',
                '안전 점검 체크리스트가 종이 뭉치로 쌓여 있어서, 3년 전 점검 기록 찾으려면 창고 뒤져야 함',
                '생산 실적 보고서 만드는데 데이터 취합만 2시간 걸림 (MES랑 엑셀이랑 숫자가 안 맞음)'
            ],
            automationNeeds: [
                '설비 데이터 자동 수집 및 디지털 일지 변환 (태블릿 입력)',
                '안전 점검 모바일 앱 (사진 찍어서 올리면 끝)',
                '생산 실적 자동 집계 및 리포팅 봇'
            ],
            workStructure: {
                level: '반구조화',
                description: '생산 절차는 매뉴얼대로 하나, 데이터 관리는 아날로그. 안전 점검은 필수지만 형식적인 경우가 많음. 디지털 전환이 가장 시급한 현장.'
            }
        },
        expectedBehavior: {
            initialAttitude: '걱정',
            concerns: [
                '현장 작업자들은 나이도 많고 장갑 끼고 일해서 태블릿 같은 거 줘도 안 쓸 것 같음',
                '자동화되면 작업자들 일자리 줄어든다고 노조에서 반발할까봐 걱정',
                '3시간 워크샵으로 현장의 땀 냄새 나는 문제들을 해결할 수 있을까'
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
            promotionReason: '친환경 소재(Copolyester) 수요 예측 모델 정확도 95% 달성으로 재고 비용 20억 절감. S&OP 프로세스 정착 기여',
            leadershipStyle: '데이터 기반 의사결정, 논리적, 시스템 지향. "감으로 일하지 말자".',
            hiddenStruggles: [
                '영업과 생산 사이에서 샌드위치 신세라 항상 외롭고 편 들어주는 사람이 없음',
                '예측이 틀리면 모든 비난을 혼자 감수해야 해서 결정 내리기가 두려움',
                '데이터 분석가 출신이라 정치적인 싸움이나 목소리 큰 사람 상대하기가 힘듦'
            ]
        },
        team: {
            size: 9,
            seniorCount: 3,
            juniorCount: 6,
            composition: '팀장 1명 + 생산 계획(PP) 4명 + 자재 수급(MM) 2명 + 수요 예측(Demand Planner) 2명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 2명(데이터 분석가) + Advanced 5명 + Intermediate 2명',
            resistanceFactors: [
                '영업팀: "내 감이 데이터보다 정확하다", "현장은 다르다"며 예측치 무시',
                '생산팀: "계획대로 생산 안 되는 게 현장이다"며 계획 준수 거부',
                '팀원들: "어차피 틀릴 예측 뭐하러 복잡하게 하냐"며 패배주의 만연'
            ]
        },
        work: {
            mainTasks: [
                '월간/주간 생산 계획(MPS) 수립 및 라인 배정',
                '글로벌 수요 예측 및 적정 재고(Safety Stock) 관리',
                '원자재(TPA, EG) 소요량 산출(MRP) 및 발주',
                '영업-생산-구매 간 S&OP(Sales & Operations Planning) 회의 주관',
                '공급망 리스크(물류 대란, 원자재 파동) 시뮬레이션'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전사 ERP 접속하여 전일 생산/판매 실적 확인 → 10시 영업팀과 긴급 주문 대응 회의 (납기 당겨달라고 사정함) → 11-12시 생산 라인별 부하(Load) 분석 → 오후 1-3시 자재 결품 예상 품목 체크 → 3-5시 주간 생산 계획 시뮬레이션 (엑셀 돌리기) → 5-6시 공장장 보고 및 계획 확정',
            weeklyRoutine: '월: 주간 생산 계획 배포 | 화: 자재 입고 일정 점검 | 수: 수요 예측 정확도 분석 | 목: 중장기 Capa 분석 | 금: 주간 성과(KPI) 분석',
            collaboration: '팀 내부: Jira로 이슈 트래킹, Slack으로 소통. 타 부서: 영업팀(판매 계획), 생산팀(라인 상황), 구매팀(자재 납기) 사이에서 조율자 역할. 외부: 주요 원자재 공급사와 납기 협의.',
            toolsUsed: ['SAP APO', 'Python(수요예측)', 'Tableau', 'Excel(매크로)', 'Slack'],
            painPoints: [
                '영업팀은 "더 팔겠다"고 하고 생산팀은 "라인 꽉 찼다"고 싸우는데, 중간에서 엑셀로 시뮬레이션 돌려서 중재하느라 진 빠짐',
                '원자재 공급사가 갑자기 "배가 늦게 뜬다"고 통보하면, 생산 계획 전체를 다시 짜야 함 (야근 확정)',
                '수요 예측 모델(Python)을 만들었는데, 영업팀장님들이 "내 감이 더 정확해"라며 무시할 때 힘 빠짐'
            ],
            automationNeeds: [
                'AI 기반 수요 예측 및 변동성 자동 반영 (영업팀 "감" 보정)',
                '공급망 이슈(항만 파업 등) 발생 시 생산 계획 자동 재수립',
                'S&OP 회의 자료(PPT) 자동 생성 및 실시간 대시보드'
            ],
            workStructure: {
                level: '고도구조화',
                description: '계획 수립 프로세스는 명확하나 변수(수요 급증, 설비 고장, 자재 지연)가 너무 많음. SAP 시스템이 메인이지만 유연성이 떨어져 엑셀 병행. 데이터 의존도 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '우리 팀은 이미 Python 쓰고 있는데 워크샵 내용이 너무 기초적이지 않을까',
                '복잡한 공급망 변수(나비 효과)를 AI가 다 고려할 수 있을지 의문',
                '영업팀이나 생산팀도 같이 들어야 효과가 있는데 우리만 들으면 소용없음'
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
            leadershipStyle: '자율성 존중, 주간 연구 세미나, 논문 중심 성과 평가',
            hiddenStruggles: [
                '연구 성과가 언제 나올지 모르는 불확실성 때문에 항상 불안함 (10년 걸릴 수도 있음)',
                '박사급 연구원들의 자존심 싸움 중재하느라 진 빠짐 (서로 내 분야가 최고라고 우김)',
                '회사에서는 빨리 결과 내라고 쪼는데 연구는 시간이 필요해서 답답함'
            ]
        },
        team: {
            size: 7,
            seniorCount: 2,
            juniorCount: 5,
            composition: '팀장 1명 + 연구원 5명 + 임상 코디네이터 1명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 3명 + Advanced 4명',
            resistanceFactors: [
                '연구원: "내 연구 데이터는 나만의 자산(Know-how)"이라며 공유 거부',
                '시니어: "AI가 신약 개발을 어떻게 하냐, 생물학은 복잡하다"며 기술적 불신',
                '팀 전체: "연구는 창의적인 영역이라 표준화할 수 없다"는 인식 강함'
            ]
        },
        work: {
            mainTasks: [
                '신약 후보물질 발굴 및 검증',
                '실험 설계 및 수행',
                '실험 데이터 분석 및 논문 작성',
                '임상시험 준비 및 진행',
                '연구 프로젝트 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 최신 논문 및 특허 검색 → 10-12시 실험실 미팅 및 데이터 리뷰 → 오후 1-3시 신약 후보물질 스크리닝 실험 → 3-5시 연구 결과 분석 및 토론 → 5-6시 연구 노트 작성',
            weeklyRoutine: '월: 주간 실험 계획 | 화: 저널 클럽 (최신 논문 리뷰) | 수: 랩 미팅 (진행 상황 공유) | 목: 외부 전문가 초청 세미나 | 금: 주간 데이터 정리',
            collaboration: '팀 내부: 전자연구노트(ELN)로 실험 결과 공유 | 타 부서: 임상팀과 후보물질 독성 테스트 협의, 특허팀과 출원 전략 논의 | 외부: 대학 연구실과 위탁 연구 관리',
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
            promotionReason: '차세대 메모리 칩 설계 성공으로 기술 경쟁력 확보. 설계 자동화 툴 도입으로 설계 오류 50% 감소',
            leadershipStyle: '기술 중심, 코드 리뷰 문화, 주간 기술 공유',
            hiddenStruggles: [
                '설계 실수 하나가 수천억 손실(Respin)로 이어질 수 있다는 압박감에 시달림',
                '최신 기술 트렌드가 너무 빨라서 따라가기가 점점 버거움',
                '젊은 천재 엔지니어들에게 기술적으로 뒤처지는 것 같은 열등감'
            ]
        },
        team: {
            size: 12,
            seniorCount: 4,
            juniorCount: 8,
            composition: '팀장 1명 + 설계 엔지니어 8명 + 검증 엔지니어 3명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 9명 + Advanced 3명',
            resistanceFactors: [
                '설계 엔지니어: "기존 툴(EDA)도 복잡한데 새로운 거 배울 시간 없다"며 거부',
                '검증팀: "AI가 검증했다가 놓치면 책임질 거냐"며 신뢰성 의문 제기',
                '시니어: "라떼는 손으로 다 그렸다"며 자동화 툴의 완성도 무시'
            ]
        },
        work: {
            mainTasks: [
                '반도체 회로 설계',
                '설계 검증 및 시뮬레이션',
                'IP(지적재산권) 관리',
                '설계 문서화 및 리뷰',
                '공정 엔지니어와 협업'
            ],
            dailyWorkflow: '오전 9:30 출근 → 10시 밤사이 시뮬레이션 결과 확인 → 10:30-12시 회로 설계 집중 → 오후 1-3시 설계 리뷰 미팅 (Code Review) → 3-5시 검증 엔지니어와 디버깅 → 5-6시 설계 문서 업데이트',
            weeklyRoutine: '월: 주간 설계 마일스톤 점검 | 화: IP 기술 세미나 | 수: 설계-공정 협업 회의 | 목: 시뮬레이션 리소스 최적화 | 금: 주간 버그 리포트',
            collaboration: '팀 내부: Git과 JIRA로 설계 데이터 및 이슈 관리 | 타 부서: 공정팀과 설계 마진(Margin) 협의, 마케팅팀과 제품 스펙 논의 | 외부: EDA 툴 벤더와 기술 지원',
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
            promotionReason: '자연어 처리(NLP) 모델 성능 SOTA(State-of-the-art) 달성. 사내 AI 챗봇 서비스 상용화 주도',
            leadershipStyle: '빠른 실험, 실패 허용, 주 2회 페이퍼 리뷰',
            hiddenStruggles: [
                'AI 팀장인데 AI 발전 속도가 너무 빨라서 현기증 남 (매일 새로운 논문 쏟아짐)',
                '팀원들이 나보다 더 똑똑해서 기술적으로 리딩하기가 어려움 (권위가 안 섬)',
                '비즈니스 성과를 증명해야 한다는 압박감 ("그래서 돈은 언제 버냐"는 소리 들음)'
            ]
        },
        team: {
            size: 5,
            seniorCount: 2,
            juniorCount: 3,
            composition: '팀장 1명 + AI 연구원 4명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 5명',
            resistanceFactors: [
                '연구원: "우리가 만드는 게 AI인데 남이 만든 툴을 왜 쓰냐" (Not Invented Here 증후군)',
                '팀원들: "연구의 자유를 침해하지 마라"며 프로세스화/관리 거부',
                '주니어: "재미있는 연구만 하고 싶다"며 데이터 전처리 같은 잡무 기피'
            ]
        },
        work: {
            mainTasks: [
                '딥러닝 모델 연구 및 개발',
                '대규모 데이터셋 구축 및 전처리',
                '모델 성능 실험 및 평가',
                '연구 논문 작성 및 발표',
                '프로덕션 모델 배포 지원'
            ],
            dailyWorkflow: '오전 10시 출근 → 10:30 ArXiv 신규 논문 체크 → 11-12시 모델 학습 현황 모니터링 → 오후 1-3시 코딩 및 실험 설계 → 3-4시 페이퍼 리뷰 및 아이디어 회의 → 4-6시 실험 결과 분석 및 디버깅 → 6-7시 다음 실험 걸어두고 퇴근',
            weeklyRoutine: '월: 주간 연구 목표 설정 | 화: 최신 AI 트렌드 공유 | 수: 코드 리뷰 | 목: 모델 성능 벤치마크 | 금: 주간 회고 및 데모',
            collaboration: '팀 내부: GitHub, Slack, Notion으로 비동기 소통 활발 | 타 부서: 서비스 기획팀과 AI 기능 정의, 인프라팀과 GPU 자원 할당 협의 | 외부: 학회 참석 및 오픈소스 커뮤니티 활동',
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
            leadershipStyle: '안정적 연구 관리, 월간 연구 리뷰, 특허 중시. 하지만 팀원들의 연구 속도와 방향 조율에 어려움 느낌.',
            hiddenStruggles: [
                '실험 실패가 계속될 때 팀원들 사기 진작시키기가 너무 힘듦 (나도 힘든데)',
                '특허 분쟁 리스크 때문에 항상 법무팀 눈치 보며 연구 노트 검열함',
                '생산팀으로 기술 이관할 때마다 "이걸 어떻게 양산하냐"고 욕먹어서 서러움'
            ]
        },
        team: {
            size: 8,
            seniorCount: 3,
            juniorCount: 5,
            composition: '팀장 1명 + 시니어 재료 연구원 3명(박사급, 10-15년차) + 주니어 공정 연구원 2명(석사급, 3-4년차) + 주니어 분석 연구원 3명(석사급, 2-5년차)',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 6명(시니어 3명 + 주니어 3명) + Intermediate 2명(주니어 공정 연구원)',
            resistanceFactors: [
                '시니어 연구원: "내 실험 노트는 며느리도 안 보여준다"며 데이터 공유 거부',
                '분석 연구원: "장비마다 데이터 포맷이 달라서 통합 불가능하다"며 포기',
                '공정 연구원: "실험실이랑 양산 라인은 천지 차이다"며 스케일업(Scale-up) 예측 불신'
            ]
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
            promotionReason: '신규 백신 플랫폼 기술 확보로 파이프라인 3개 확장. 글로벌 임상 3상 성공적 진입',
            leadershipStyle: '규제 준수 중시, 주간 진행 회의, 문서화 강조',
            hiddenStruggles: [
                '임상 3상 실패하면 프로젝트가 통째로 날아간다는 공포감에 시달림',
                '식약처 규제가 너무 까다로워서 숨이 막힘 (문서 하나 틀리면 반려)',
                '인류를 구한다는 윤리적 책임감과 회사의 상업적 성공 사이에서 갈등'
            ]
        },
        team: {
            size: 10,
            seniorCount: 4,
            juniorCount: 6,
            composition: '팀장 1명 + 바이러스 연구원 4명 + 임상 연구원 3명 + 데이터 분석가 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 5명(연구원, 분석가) + Intermediate 3명 + Beginner 2명',
            resistanceFactors: [
                '임상 연구원: "규제(GCP) 때문에 클라우드 못 쓴다"며 보안 이슈 제기',
                '데이터 분석가: "기존 SAS 코드가 수만 줄인데 이걸 언제 다 바꾸냐"며 저항',
                '팀 전체: "문서 작업 하느라 연구할 시간이 없다"며 불만 토로'
            ]
        },
        work: {
            mainTasks: [
                '백신 후보물질 개발',
                '전임상/임상 시험 설계 및 진행',
                '임상 데이터 분석',
                '규제 기관 제출 문서 작성',
                '연구 프로젝트 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 임상 사이트별 환자 등록 현황 확인 → 10-12시 임상 데이터 모니터링 및 이상 반응 체크 → 오후 1-3시 식약처 제출용 문서 작성 → 3-5시 CRO(임상수탁기관) 미팅 → 5-6시 글로벌 파트너사와 컨퍼런스 콜',
            weeklyRoutine: '월: 주간 임상 현황 리뷰 | 화: 데이터 안전성 모니터링 위원회(DSMB) 대응 | 수: 임상 프로토콜 개정 논의 | 목: 규제 동향 스터디 | 금: 주간 리포트',
            collaboration: '팀 내부: SharePoint로 문서 공동 작업 | 타 부서: RA(규제과학)팀과 인허가 전략 논의, 사업개발팀과 라이선스 아웃 협의 | 외부: 병원 임상시험센터 및 식약처와 긴밀 소통',
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
        name: '김서연',
        age: 36,
        company: 'SK텔레콤',
        department: '인재영입팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 1.5,
            previousRole: '채용 담당자',
            promotionReason: 'AI 분야 핵심 인재(박사급) 20명 영입 성공으로 "Global AI Company" 비전 달성 기여. 채용 리드타임 60일 → 35일 단축',
            leadershipStyle: '데이터 기반 채용, 후보자 경험(CX) 집착, 신속한 피드백. "채용은 영업이다" 마인드.',
            hiddenStruggles: [
                '현업 팀장들이 "사람 없다"고 징징대면서 막상 면접관으로는 안 들어오려고 해서 중간에서 난처함',
                '지원자가 합격 후 입사 포기(No-show)하면 내 실적 깎이는 거라 밤잠 설침',
                '채용 브랜딩 하라는데 나는 마케터가 아니라서 뭘 해야 할지 막막함'
            ]
        },
        team: {
            size: 8,
            seniorCount: 3,
            juniorCount: 5,
            composition: '팀장 1명 + 테크 리크루터 3명(AI/Cloud) + 캠퍼스 리크루팅 2명 + 채용 브랜딩/운영 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 4명(리크루터) + Intermediate 4명',
            resistanceFactors: [
                '현업 면접관: "바빠 죽겠는데 면접 평가표 언제 다 쓰냐"며 대충 작성',
                '인사팀(보상): "연봉 테이블 예외 승인 절대 안 된다"며 유연성 부족',
                '채용 담당자: "후보자 감성은 AI가 모른다"며 자동화 툴 불신'
            ]
        },
        work: {
            mainTasks: [
                'AI/DT 분야 S급 인재 타겟팅 및 다이렉트 소싱 (LinkedIn, GitHub)',
                '채용 전형(서류-코테-면접-처우협의) 운영 및 일정 조율',
                '채용 브랜딩 콘텐츠(유튜브, 블로그) 기획 및 기술 컨퍼런스 참가',
                '면접관 교육 및 채용 데이터(Funnel) 분석',
                '신규 입사자 온보딩(Onboarding) 프로그램 운영'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 ATS(지원자관리시스템) 대시보드 확인 (밤사이 지원자 체크) → 10-12시 링크드인 서칭 및 콜드 메일 발송 (하루 50통) → 오후 1-3시 현업 면접관과 일정 조율 (전화 돌리느라 바쁨) → 3-5시 면접 진행 및 가이드 → 5-6시 합격자 처우 협의 (연봉 줄다리기) → 6-7시 채용 데이터 정리',
            weeklyRoutine: '월: 주간 채용 파이프라인 리뷰 | 화: 기술 면접관 워크샵 | 수: 채용 브랜딩 회의 | 목: 신규 입사자 웰컴 세션 | 금: 주간 리포트 및 마감',
            collaboration: '팀 내부: Greenhouse(ATS)와 Slack으로 후보자 상태 공유. 타 부서: 현업 개발 팀장들과 채용 요건(JD) 정의(눈높이 맞추기 힘듦), 인사팀과 연봉 테이블 협의. 외부: 헤드헌터 및 대학 취업센터와 협업.',
            toolsUsed: ['Greenhouse(ATS)', 'LinkedIn Recruiter', 'Programmers(코테)', 'Notion', 'Slack', 'Zoom'],
            painPoints: [
                '현업 팀장들이 "사람 좀 빨리 뽑아달라"고 닥달하면서, 정작 면접 일정 잡으려고 하면 "바빠서 안 된다"고 함',
                '면접 평가표가 엑셀이나 종이로 되어 있어서, "이 지원자 왜 떨어졌나요?"라고 물으면 기록 찾느라 진땀 뺌',
                '지원자들의 단순 문의(합격 언제 나오나요, 주차 되나요)에 일일이 답변하느라 소싱할 시간이 부족함'
            ],
            automationNeeds: [
                'AI 기반 면접 일정 자동 조율 (구글 캘린더 연동)',
                '면접 평가 데이터 자동 분석 및 코멘트 요약',
                '채용 문의 자동 응대 챗봇 (FAQ 처리)'
            ],
            workStructure: {
                level: '반구조화',
                description: '채용 프로세스는 명확하나(SOP 존재), 사람을 다루는 일이라 변수(No-show, 처우 결렬)가 많음. ATS 시스템 사용하지만 일정 조율은 수동. 데이터 기반 의사결정 지향.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '채용은 사람이 하는 일이라 자동화가 후보자 경험을 해칠까 우려',
                '면접관들이 새로운 평가 시스템에 적응할 수 있을지',
                '워크샵에서 배운 내용을 ATS와 어떻게 연동할지 기술적 고민'
            ],
            dropoutRisk: 10,
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
        name: '이준호',
        age: 43,
        company: 'SK하이닉스',
        department: '조직문화팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 3,
            previousRole: '교육 담당자',
            promotionReason: '사내 소통 앱 "Hy-Talk" 활성화로 임직원 참여율 80% 달성. "님" 호칭 문화 정착 및 세대 간 갈등 해소 프로그램 호평',
            leadershipStyle: '소통 중심, 수평적 문화 지향, 감성 리더십. "행복 경영" 전도사.',
            hiddenStruggles: [
                '직원들이 "조직문화팀은 노는 부서"라고 생각하는 것 같아 억울함',
                '경영진은 "행복"을 숫자로 가져오라고 하는데 그게 말이 되나 싶음',
                '블라인드 악플 볼 때마다 상처받지만 쿨한 척해야 해서 속병 듦'
            ]
        },
        team: {
            size: 6,
            seniorCount: 2,
            juniorCount: 4,
            composition: '팀장 1명 + 문화 기획 3명(행사/캠페인) + 사내 커뮤니케이션 2명(방송/뉴스레터)',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 2명(영상/디자인) + Intermediate 2명 + Beginner 2명',
            resistanceFactors: [
                '직원들: "보여주기식 행사 지겹다", "이거 할 시간에 일찍 퇴근이나 시켜줘라"며 냉소적',
                '팀장급: "일할 시간도 부족한데 무슨 워크샵이냐"며 팀원들 안 보냄',
                '경영진: "돈 쓴 만큼 효과가 있냐"며 ROI 증명 압박'
            ]
        },
        work: {
            mainTasks: [
                '조직문화 진단(Culture Survey) 및 개선 활동 (Happy Friday 등)',
                'CEO 타운홀 미팅 및 전사 행사 기획/운영',
                '사내 소통 채널(블라인드, 사내게시판) 모니터링 및 이슈 대응',
                '핵심가치(SKMS) 내재화 워크샵 운영',
                '임직원 몰입도(Engagement) 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 블라인드/사내게시판 여론 확인 (악플 있으면 긴장) → 10시 팀 아이디어 회의 (자유로운 분위기) → 11-12시 타운홀 미팅 리허설 → 오후 1-3시 현장 부서 인터뷰 (고충 청취) → 3-5시 사내 방송 콘텐츠 편집 확인 → 5-6시 설문 결과 보고서 작성',
            weeklyRoutine: '월: 주간 이슈 점검 | 화: 문화 캠페인 기획 | 수: 사내 방송 녹화 | 목: 조직장 코칭 세션 | 금: Happy Friday 운영 지원',
            collaboration: '팀 내부: Notion으로 아이디어 공유, Slack으로 짤방 대화. 타 부서: 홍보팀과 위기 관리 협업, 총무팀과 행사 지원 협의. 외부: 이벤트 대행사 및 강사 섭외.',
            toolsUsed: ['SurveyMonkey', 'Notion', 'Slack', 'Premiere Pro', 'Excel'],
            painPoints: [
                '매년 하는 조직문화 진단 설문조사(객관식 50문항) 결과를 엑셀로 분석하는데, 주관식 답변 3,000개를 읽다가 눈 빠짐',
                '타운홀 미팅 때 질문 안 나와서 정적 흐르면 식은땀 남. 사전 질문 취합하고 선별하는 게 일임',
                '경영진은 "문화가 좋아졌다는 걸 숫자로 가져와라"고 하는데, 사람 마음을 어떻게 숫자로 증명하나 답답함'
            ],
            automationNeeds: [
                'AI 기반 설문 주관식 응답 감성 분석 및 키워드 추출',
                '타운홀 미팅 실시간 Q&A 필터링 및 요약',
                '조직문화 변화 지표(참여율, 댓글 수 등) 자동 대시보드'
            ],
            workStructure: {
                level: '비구조화',
                description: '업무 특성상 매우 창의적이고 비정형적. 정답이 없음. 그때그때 여론에 따라 유연하게 대처해야 함. 정량적 성과 측정이 가장 어려움.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '조직문화는 정성적인 영역인데 데이터/자동화로 접근하는게 맞을지',
                '팀원들이 창의적인 업무보다 시스템 관리에 시간 뺏길까 걱정',
                '워크샵 내용이 너무 딱딱하면 우리 팀 문화와 안 맞을 듯'
            ],
            dropoutRisk: 20,
        },
        personality: {
            patience: 9,
            techSavvy: 5,
            changeResistance: 'medium',
            learningSpeed: 'medium'
        }
    },

    {
        id: 'P018',
        name: '박지민',
        age: 39,
        company: 'SK이노베이션',
        department: '보상복리후생팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 4,
            previousRole: '급여 담당자',
            promotionReason: '통상임금 소송 대응 완벽 수행 및 급여 시스템 고도화로 연말정산 오류 0건 달성. 꼼꼼함의 대명사.',
            leadershipStyle: '정확성 중시, 규정 준수(Compliance), 무결점 지향. "돈 문제는 1원도 틀리면 안 된다".',
            hiddenStruggles: [
                '월급날만 되면 혹시 이체 사고 날까 봐 심장이 쫄깃함 (꿈에서도 식은땀)',
                '직원들이 고맙다는 말은 안 하고 "왜 이거밖에 안 들어왔냐"고 따질 때마다 회의감',
                '법이 자꾸 바뀌어서 공부할 게 너무 많음 (매년 세무사 시험 다시 보는 기분)'
            ]
        },
        team: {
            size: 7,
            seniorCount: 3,
            juniorCount: 4,
            composition: '팀장 1명 + 급여(Payroll) 담당 2명 + 4대보험/퇴직금 2명 + 복리후생(학자금/의료비) 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명(SAP HR) + Advanced 3명(Excel 장인) + Intermediate 3명',
            resistanceFactors: [
                'IT팀: "급여 시스템은 건드리면 큰일 난다"며 수정/연동 거부',
                '직원들: "내가 낸 영수증 왜 반려하냐"며 규정 무시하고 떼씀',
                '팀원들: "엑셀이 제일 편하다"며 새로운 시스템 도입 귀찮아함'
            ]
        },
        work: {
            mainTasks: [
                '매월 급여 및 성과급(PS/PI) 계산 및 지급',
                '4대보험 취득/상실 신고 및 연말정산 관리',
                '복리후생(학자금, 의료비, 콘도) 운영 및 예산 관리',
                '인건비 예산 수립 및 시뮬레이션',
                '세법/노동법 변경에 따른 급여 테이블 조정'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전일 근태 마감 확인 (지각/연차 체크) → 10-12시 급여 변동분(승진, 부서이동) SAP 입력 → 오후 1-3시 직원 문의 전화 응대 (하루 30통) → 3-5시 4대보험 공단 신고 → 5-6시 일일 자금 집행 내역 검증',
            weeklyRoutine: '월: 주간 급여 작업 스케줄링 | 화: 복리후생 신청 마감 | 수: 4대보험 정산 | 목: 급여 대장 가마감 및 검증 | 금: 자금 팀에 급여 이체 요청',
            collaboration: '팀 내부: SAP HR 모듈과 엑셀(VLOOKUP 필수)로 교차 검증. 타 부서: 재무팀과 인건비 지급 일정 협의, 인사팀과 발령 정보 공유. 외부: 세무서, 노동부, 보험공단과 공문 수발신.',
            toolsUsed: ['SAP HR', 'Excel (Power Query)', '홈택스', '4대보험 포털', '더존'],
            painPoints: [
                '연말정산 시즌(1-2월) 되면 전표 3,000장 풀칠하고 영수증 대조하느라 매일 야근 (집에 못 감)',
                '직원들이 "내 월급 왜 이거밖에 안 들어왔냐", "세금 왜 이렇게 많이 떼냐" 전화해서 화냄 (감정 노동)',
                '세법이 매년 바뀌는데 시스템에 반영하려면 IT팀에 수정 요청하고 테스트하느라 2달 걸림'
            ],
            automationNeeds: [
                'RPA 기반 급여/4대보험 신고 자동화 및 오류 검증',
                'AI 챗봇으로 "내 연차 며칠 남았어?", "의료비 신청 어떻게 해?" 같은 단순 문의 자동 응대',
                '영수증 OCR 인식 및 연말정산 서류 자동 검토'
            ],
            workStructure: {
                level: '고도구조화',
                description: '급여/4대보험 프로세스는 법적 규제와 사규에 의해 100% 정해져 있음. 창의성보다는 정확성과 준법성이 핵심. 월간/연간 사이클이 명확함.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '급여 데이터 보안이 중요한데 외부 툴 사용이 가능할지',
                'RPA 도입하고 싶은데 개발 리소스가 없어서 못하고 있음',
                '워크샵에서 실질적인 자동화 툴을 배울 수 있을지 기대'
            ],
            dropoutRisk: 5,
        },
        personality: {
            patience: 8,
            techSavvy: 7,
            changeResistance: 'low',
            learningSpeed: 'medium'
        }
    },

    {
        id: 'P019',
        name: '최현석',
        age: 45,
        company: 'SK스퀘어',
        department: 'HRD팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 5,
            previousRole: '교육 기획자',
            promotionReason: 'SK그룹 공통 교육 플랫폼 "mySUNI" 사내 도입 및 활성화 주도. 학습 시간 이수제 정착으로 자기주도 학습 문화 조성',
            leadershipStyle: '성장 지향, 학습 조직(Learning Organization) 구축, 코칭 리더십. "배워서 남 주자".',
            hiddenStruggles: [
                '교육 효과가 없다는 소리 들을까 봐 항상 전전긍긍함 (교육 무용론)',
                '강사 섭외 펑크 나면 내가 때워야 해서 항상 강의안 준비해 다님',
                '직원들이 교육을 "쉬러 가는 시간"으로만 생각해서 속상함'
            ]
        },
        team: {
            size: 9,
            seniorCount: 4,
            juniorCount: 5,
            composition: '팀장 1명 + 교육 기획 4명(리더십/직무/온보딩) + 운영 담당 2명 + 콘텐츠 제작 2명(영상/카드뉴스)',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 5명(콘텐츠, 기획) + Intermediate 4명',
            resistanceFactors: [
                '현업 팀장: "교육 보내놨더니 일은 언제 하냐"며 불만',
                '교육생: "이거 들어도 현업에 도움 안 된다", "너무 이론적이다"며 딴짓',
                'IT팀: "LMS 서버 용량 부족하다"며 고화질 영상 업로드 제한'
            ]
        },
        work: {
            mainTasks: [
                '연간 임직원 역량 개발 계획(IDP) 수립 및 운영',
                '온라인 학습 플랫폼(LMS) 운영 및 큐레이션',
                '핵심 인재(HIPO) 육성 프로그램 및 팀장 리더십 과정 기획',
                '신입/경력 입사자 교육(Soft Landing) 운영',
                '교육 효과성 측정(ROI) 및 결과 보고'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 LMS 접속률 및 이수율 확인 → 10시 교육 과정 기획 회의 → 11-12시 외부 강사 섭외 통화 → 오후 1-3시 교육장 현장 점검 또는 온라인 웨비나 모니터링 → 3-5시 교육생 만족도 설문 분석 → 5-6시 결과 보고서 작성',
            weeklyRoutine: '월: 주간 교육 일정 체크 | 화: 콘텐츠 제작 리뷰 | 수: 강사 미팅 | 목: 역량 진단 데이터 분석 | 금: 주간 교육 리포트 및 회고',
            collaboration: '팀 내부: Notion으로 과정 기획안 공유. 타 부서: 현업 팀장들과 교육 니즈 인터뷰, IT팀과 LMS 시스템 오류 수정. 외부: 교육 컨설팅 업체 및 전문 강사들과 협업.',
            toolsUsed: ['mySUNI(LMS)', 'Zoom/Webex', 'Articulate(저작도구)', 'Excel', 'Notion'],
            painPoints: [
                '교육 만족도 설문(5점 척도)만으로는 진짜 현업에 도움이 됐는지 알 수가 없음. "간식 맛있었어요" 같은 피드백만 옴',
                '직원들이 바쁘다고 교육을 "숙제"처럼 생각하고 영상만 틀어놓고 딴짓함 (이수율 채우기 급급)',
                '개인별로 필요한 역량이 다 다른데, 일괄적인 집합 교육만 하니까 효과가 떨어짐'
            ],
            automationNeeds: [
                'AI 기반 개인별 직무/역량 맞춤형 콘텐츠 큐레이션 (넷플릭스처럼 추천)',
                '교육 후 현업 적용도(Transfer) 추적 및 성과 연계 분석',
                '교육 이수 자동 알림 및 독려 봇 (Gamification 적용)'
            ],
            workStructure: {
                level: '반구조화',
                description: '교육 기획은 창의적이나 운영은 정형적. LMS로 이력 관리. 연간 계획에 따라 움직이나 수시 과정 개설도 많음. 교육 효과 측정의 모호함이 과제.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '에듀테크 트렌드를 따라가고 싶은데 예산이 부족함',
                'AI 추천 시스템 도입하려면 데이터가 더 필요할 것 같음',
                '워크샵에서 배운 툴을 우리 LMS에 붙일 수 있을지'
            ],
            dropoutRisk: 10,
        },
        personality: {
            patience: 9,
            techSavvy: 8,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    },

    {
        id: 'P020',
        name: '정수진',
        age: 37,
        company: 'SK네트웍스',
        department: '노무관리팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 2,
            previousRole: '노무 담당자',
            promotionReason: '주 52시간제 도입 시 유연근무제 설계로 법적 리스크 해소 및 직원 만족도 제고. 노사 분규 0건 유지',
            leadershipStyle: '원칙 준수, 공정한 중재자, 리스크 관리. 감정적으로 휘둘리지 않음.',
            hiddenStruggles: [
                '직원들 징계할 때마다 마음이 너무 무거움 (나도 사람인데)',
                '노사 협상 기간에는 집에 못 들어가고 사우나에서 잠 (체력 고갈)',
                '법적 리스크 때문에 말 한마디도 조심해야 해서 성격이 예민해짐'
            ]
        },
        team: {
            size: 5,
            seniorCount: 2,
            juniorCount: 3,
            composition: '팀장 1명 + 노무 담당(ER) 2명(노무사 자격증 소지) + 고충 처리/상담 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 1명 + Intermediate 2명 + Beginner 2명',
            resistanceFactors: [
                '현업 부서장: "우리 애가 좀 실수한 거 가지고 왜 그러냐"며 징계 반대',
                '노조: "회사가 감시하려고 시스템 도입한다"며 강력 저항',
                '팀원들: "보안 때문에 클라우드 못 쓴다"며 수기 작업 고수'
            ]
        },
        work: {
            mainTasks: [
                '노사 협의회 운영 및 임금/단체 협약(임단협) 교섭',
                '취업규칙 제/개정 및 인사 규정 관리 (노동법 준수)',
                '직원 고충(직장 내 괴롭힘, 성희롱) 상담 및 조사',
                '근로시간(주 52시간) 모니터링 및 위반 리스크 관리',
                '노무 이슈 법률 자문 및 소송 대응'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전일 근태 위반자(연장근로 초과) 확인 및 경고 메일 발송 → 10-12시 노무 법인 자문 회의 → 오후 1-3시 직원 고충 상담 (비밀 보장 회의실) → 3-5시 취업규칙 개정안 검토 → 5-6시 노사 협의회 안건 정리',
            weeklyRoutine: '월: 주간 근태 현황 점검 | 화: 고충 처리 위원회 | 수: 노무사 미팅 | 목: 규정 개정 검토 | 금: 주간 노무 리스크 보고',
            collaboration: '팀 내부: 보안 폴더(접근 권한 제한)로 민감 정보 관리. 타 부서: 현업 부서장과 근태 관리 협의(왜 팀원들 야근 시키냐고 따짐), 법무팀과 소송 대응. 외부: 노무법인, 노동부 근로감독관과 소통.',
            toolsUsed: ['근태관리시스템(Secom)', 'Excel', 'Word', '이메일', '녹음기'],
            painPoints: [
                '주 52시간 위반 임박한 직원들 찾아서 "퇴근하세요"라고 일일이 연락하는 게 일임 (경찰관 된 기분)',
                '직장 내 괴롭힘 신고 들어오면 사실 관계 조사하느라 CCTV 돌려보고 인터뷰하고 녹취록 푸느라 한 달 다 감',
                '노동법이 수시로 바뀌는데(판례 변경 등) 일일이 찾아서 규정에 반영하기가 너무 번거롭고 리스크 큼'
            ],
            automationNeeds: [
                '근로시간 위반 예측 및 부서장/본인에게 자동 경고 알림',
                '상담 내용 음성 인식 및 텍스트 변환(STT), 주요 키워드 추출',
                '최신 노동법 판례 자동 검색 및 우리 회사 규정과의 차이점 분석'
            ],
            workStructure: {
                level: '고도구조화',
                description: '법적 규제(근로기준법)와 사규에 따라 매우 엄격하게 업무 수행. 절차와 기준 명확(Due Process). 보안 중요. 시스템보다 문서/대면 위주 업무.'
            }
        },
        expectedBehavior: {
            initialAttitude: '회의적',
            concerns: [
                '노무 정보는 민감해서 클라우드 툴 사용이 꺼려짐',
                '사람 대 사람으로 해결해야 할 문제를 시스템으로 하려는 건 아닌지',
                '워크샵 내용이 법적 리스크를 고려하고 있는지 의문'
            ],
            dropoutRisk: 30,
        },
        personality: {
            patience: 8,
            techSavvy: 4,
            changeResistance: 'high',
            learningSpeed: 'slow'
        }
    },
    // ==================== FINANCE (3명) ====================
    {
        id: 'P021',
        name: '강수진',
        age: 40,
        company: 'SK텔레콤',
        department: '재무기획팀',
        role: '팀장',
        category: 'Finance',
        leaderProfile: {
            yearsInRole: 3,
            previousRole: '재무 분석가',
            promotionReason: '5G 네트워크 투자 비용(CAPEX) 3,000억 절감 방안 도출. 구독 마케팅 예산 ROI 분석 모델 개발로 마케팅 효율 20% 개선',
            leadershipStyle: '냉철한 분석가, 숫자 검증 중시, 논리적 설득. "숫자는 거짓말을 하지 않는다".',
            hiddenStruggles: [
                '사업부장들이 예산 깎는다고 나를 "공공의 적" 취급해서 회사 다니기가 외로움',
                'CEO가 갑자기 숫자 물어보면 바로 대답 못할까 봐 항상 긴장 상태 (숫자 강박증)',
                '매년 반복되는 예산 전쟁에 지쳐서 "내가 이러려고 팀장 했나" 회의감 느낌'
            ]
        },
        team: {
            size: 6,
            seniorCount: 2,
            juniorCount: 4,
            composition: '팀장 1명 + 예산 기획 2명(마케팅/네트워크) + 재무 분석 3명 + 투자 심의 1명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 2명(Excel/SAP) + Advanced 2명 + Intermediate 2명',
            resistanceFactors: [
                '사업부: "현장 상황 모르는 탁상공론이다", "돈 안 주면 사업 못 한다"며 예산 통제 반발',
                '재무 분석가: "엑셀이 내 몸과 같다", "시스템은 느려서 못 쓴다"며 새로운 BI 툴 도입 거부',
                '경영진: "그래서 결론이 뭐냐", "한 장으로 요약해라"며 깊이 있는 분석 무시'
            ]
        },
        work: {
            mainTasks: [
                '전사 연간 예산(Budget) 수립 및 통제 (조 단위 규모)',
                '사업부별 월간 손익(P&L) 분석 및 성과 평가',
                '신규 사업(AI, 메타버스) 투자 타당성 검토 및 ROI 분석',
                '비용 절감(Cost Saving) 프로젝트 주도',
                '이사회 및 CEO 보고용 경영 실적 리포트 작성'
            ],
            dailyWorkflow: '오전 8:30 출근 → 9시 전일 매출/가입자 속보 확인 → 10-12시 사업부 예산 담당자와 실적 리뷰 (왜 목표 미달했는지 추궁) → 오후 1-3시 신규 투자 건 심의 보고서 검토 → 3-5시 CEO 보고 자료 작성 (PPT 장표 수정 무한 반복) → 5-6시 예산 전용(Transfer) 승인 처리',
            weeklyRoutine: '월: 주간 자금/손익 전망 | 화: 마케팅 비용 효율화 회의 | 수: 투자 심의 위원회 | 목: 사업부별 이슈 점검 | 금: 주간 경영 실적 보고',
            collaboration: '팀 내부: SAP ERP 데이터 엑셀로 받아서 가공. 타 부서: 사업부장들과 예산 따내기 전쟁(매번 싸움), 회계팀과 결산 데이터 대조. 외부: 컨설팅사와 비용 구조 진단 프로젝트.',
            toolsUsed: ['SAP ERP', 'Excel (VBA, Power Pivot)', 'Tableau', 'PowerPoint'],
            painPoints: [
                '사업부에서 예산 더 달라고 떼쓰는데, 근거 데이터 가져오라고 하면 "영업 비밀"이라며 안 줌',
                'CEO 보고 1시간 전인데 엑셀 수식 깨져서 #REF! 뜨면 심장 멎을 것 같음',
                '매월 말일만 되면 "예산 남았는데 다 써야 한다"며 보도블록 갈아엎듯 불필요한 지출 결재 올라옴'
            ],
            automationNeeds: [
                '예산 대비 실적 차이(Variance) 자동 분석 및 원인 코멘트 생성',
                '투자 ROI 시뮬레이션 자동화 (변수만 넣으면 결과 나오게)',
                'CEO 보고용 PPT 장표 자동 업데이트 (엑셀 연동)'
            ],
            workStructure: {
                level: '고도구조화',
                description: '재무 회계 기준(K-IFRS)과 사규에 따라 엄격한 프로세스. 월간/분기 결산 일정 고정. 데이터 정확성이 최우선. SAP 시스템 의존도 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '재무 데이터는 보안이 생명인데 클라우드 AI에 올려도 되는지 (CISO 승인 필요)',
                'AI가 분석한 숫자를 경영진이 믿어줄까? "근거가 뭐야?" 하면 설명할 수 있어야 함',
                '엑셀만큼 유연하게 내 맘대로 뜯어고칠 수 있는 툴이 있을지 의문'
            ],
            dropoutRisk: 10,
        },
        personality: {
            patience: 8,
            techSavvy: 7,
            changeResistance: 'medium',
            learningSpeed: 'medium'
        }
    },

    {
        id: 'P022',
        name: '이승우',
        age: 38,
        company: 'SK하이닉스',
        department: '회계팀',
        role: '팀장',
        category: 'Finance',
        leaderProfile: {
            yearsInRole: 2,
            previousRole: '회계사',
            promotionReason: 'IFRS 17 회계 기준 도입 프로젝트 성공적 완수. 결산 리드타임 5일 → 3일 단축으로 경영진 의사결정 속도 기여',
            leadershipStyle: '원칙 준수, 꼼꼼함(Detail-oriented), 야근도 불사하는 책임감. "회계는 1원도 틀리면 안 된다".',
            hiddenStruggles: [
                '결산 시즌에는 가족 얼굴도 못 보고 회사에서 살아야 해서 가정 소홀에 대한 죄책감',
                '세무 조사 나오면 내가 다 책임져야 한다는 부담감에 항상 위축됨',
                '회계 기준이 너무 자주 바뀌어서 따라가기 벅참 (공부하다 늙는 기분)'
            ]
        },
        team: {
            size: 10,
            seniorCount: 4,
            juniorCount: 6,
            composition: '팀장 1명 + 결산(Closing) 담당 4명 + 세무(Tax) 2명 + 자금(Treasury) 2명 + 내부회계 1명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 3명(SAP FI) + Advanced 4명 + Intermediate 3명',
            resistanceFactors: [
                '현업 부서: "영수증 처리 귀찮다", "알아서 좀 해주면 안 되냐"며 증빙 제출 지연',
                '감사인: "시스템 데이터 못 믿겠다"며 원본 종이 서류 요구',
                '팀원들: "단순 반복 업무 때문에 커리어 발전이 없다"며 퇴사 고민'
            ]
        },
        work: {
            mainTasks: [
                '월간/분기/연간 재무제표 결산 및 공시',
                '법인세/부가세 신고 및 세무 조사 대응',
                '자금 집행 계획 수립 및 유동성 관리',
                '내부회계관리제도(SOX) 운영 및 감사 대응',
                '반도체 장비 감가상각비 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전표 승인 대기 목록 확인 (하루 500건) → 10-12시 자금 집행 승인 (OTP 누르느라 바쁨) → 오후 1-3시 회계법인 감사인 대응 (자료 달라고 독촉) → 3-5시 세무 이슈 검토 → 5-6시 일일 자금 일보 보고',
            weeklyRoutine: '월: 주간 자금 수지 계획 | 화: 미결 전표 독촉 | 수: 세무 리스크 점검 | 목: 내부통제 테스트 | 금: 주간 결산 이슈 정리',
            collaboration: '팀 내부: SAP FI/CO 모듈 사용. 타 부서: 구매팀과 매입 채무 대조, 영업팀과 매출 채권 회수 독촉. 외부: 삼일회계법인, 국세청, 은행 담당자와 매일 통화.',
            toolsUsed: ['SAP ERP', 'Excel', 'DART(공시시스템)', '홈택스', 'Unipass(관세)'],
            painPoints: [
                '월말 결산 시즌(D-5) 되면 새벽 2시 퇴근이 기본. 컵라면 먹으며 전표 맞춤',
                '증빙 영수증이 종이로 오거나 사진 파일로 와서 일일이 엑셀에 타이핑해야 함 (OCR 도입 시급)',
                '회계 기준이 바뀌면 SAP 시스템 뜯어고쳐야 하는데 IT팀 일정 잡기가 하늘의 별따기'
            ],
            automationNeeds: [
                '전표 자동 처리 및 이상 징후(Anomaly) 탐지 (RPA + AI)',
                '증빙 영수증 OCR 인식 및 계정 과목 자동 추천',
                '결산 스케줄 자동 관리 및 지연 부서 알림 봇'
            ],
            workStructure: {
                level: '고도구조화',
                description: '회계 기준(K-IFRS)에 따라 절차 매우 엄격. 결산 프로세스 표준화됨. 시스템 의존도 매우 높음. 마감 기한(Deadline) 준수 필수.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '회계는 실수가 용납 안 되는데 AI가 99% 정확하다고 해도 1% 틀리면 대형 사고',
                '기존 SAP 시스템이 너무 무거워서 가벼운 AI 툴이랑 연동이 될지 의문',
                '워크샵이 너무 일반적인 내용이면 전문적인 회계 업무에 적용하기 어려움'
            ],
            dropoutRisk: 15,
        },
        personality: {
            patience: 9,
            techSavvy: 6,
            changeResistance: 'medium',
            learningSpeed: 'medium'
        }
    },

    {
        id: 'P023',
        name: '박재훈',
        age: 42,
        company: 'SK이노베이션',
        department: 'IR팀',
        role: '팀장',
        category: 'Finance',
        leaderProfile: {
            yearsInRole: 4,
            previousRole: '애널리스트',
            promotionReason: 'SK온(배터리) 물적분할 및 프리IPO(Pre-IPO) 성공적 지원. 외국인 지분율 5%p 상승 견인',
            leadershipStyle: '전략적 소통, 네트워크 중시, 위기 관리 능력. "주가는 회사의 얼굴이다".',
            hiddenStruggles: [
                '주가 떨어지면 주주들에게 욕먹고 경영진에게 깨지는 동네북 신세',
                '투자자들 앞에서 회사의 치부도 포장해서 말해야 하는 감정 노동에 시달림',
                '미공개 정보 유출될까 봐 친구들도 마음 편히 못 만남 (인간관계 단절)'
            ]
        },
        team: {
            size: 4,
            seniorCount: 2,
            juniorCount: 2,
            composition: '팀장 1명 + 공시 담당 1명 + 해외 IR 1명 + 국내 IR 1명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명(Bloomberg) + Advanced 2명 + Intermediate 1명',
            resistanceFactors: [
                '경영진: "주가 부양할 수 있는 호재 없냐"며 무리한 보도자료 배포 요구',
                '법무팀: "공시 위반 리스크 있다", "단어 하나라도 틀리면 안 된다"며 IR 자료 검열',
                '사업부: "우리 실적 왜 이렇게 낮게 잡았냐"며 컨센서스 조정 항의'
            ]
        },
        work: {
            mainTasks: [
                '국내외 기관 투자자 대상 NDR(Non-Deal Roadshow) 및 컨퍼런스',
                '분기 실적 발표(Earnings Call) 시나리오 작성 및 Q&A 준비',
                '주주총회 및 이사회 안건 준비',
                '증권사 애널리스트 리포트 분석 및 대응 (Consensus 관리)',
                '경영진 대상 주가 동향 및 시장 반응 보고'
            ],
            dailyWorkflow: '오전 7:30 출근 (장 시작 전 뉴스 체크) → 8:30 모닝 미팅 (전일 미 증시 영향 분석) → 9-15시 장중 주가 모니터링 및 투자자 전화 응대 (하루 50통) → 15:30 장 마감 후 기관 수급 분석 → 16-18시 애널리스트 미팅 또는 보고서 작성',
            weeklyRoutine: '월: 주간 증시 전망 및 일정 | 화: 외국인 투자자 컨퍼런스 콜 | 수: 사업부 실적 체크 | 목: 예상 실적(Preview) 분석 | 금: 주간 IR 리포트 발송',
            collaboration: '팀 내부: Bloomberg 단말기, Dart 편집기 사용. 타 부서: 재무팀과 실적 숫자 맞추기, 홍보팀과 보도자료 톤앤매너 조율. 외부: 모건스탠리, 골드만삭스 등 외국계 증권사와 영어로 소통.',
            toolsUsed: ['Bloomberg Terminal', 'FnGuide', 'Excel', 'DART 편집기', 'Zoom'],
            painPoints: [
                '실적 발표 시즌 되면 "이번에 흑자 전환 하냐"고 묻는 투자자들 전화에 시달림 (답변 잘못하면 공시 위반)',
                '수십 개 증권사 리포트를 다 읽고 요약해서 경영진한테 보고해야 하는데 시간이 너무 부족함',
                '주가 떨어지면 주주들이 회사로 전화해서 욕함 (감정 노동 심함)'
            ],
            automationNeeds: [
                '투자자 예상 질문(Q&A) 답변 자동 생성 및 스크립트 작성',
                '전 세계 증권사 리포트 및 뉴스 자동 요약 (Sentiment 분석)',
                '실적 발표 자료(PPT) 및 스크립트 자동 번역 (영문 공시용)'
            ],
            workStructure: {
                level: '반구조화',
                description: '실적 발표 등 정기 이벤트는 정형적이나, 시장 상황(주가 급등락)에 따른 대응은 매우 유동적. 정보의 정확성과 타이밍이 생명.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'AI가 투자자들의 미묘한 뉘앙스나 심리를 파악할 수 있을지',
                '미공개 중요 정보(Material Info)를 AI에 입력했다가 유출되면 법적 책임 문제',
                '블룸버그 터미널보다 더 빠르고 정확한 정보를 줄 수 있을까'
            ],
            dropoutRisk: 5,
        },
        personality: {
            patience: 7,
            techSavvy: 8,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    },

    // ==================== IT (2명) ====================
    {
        id: 'P024',
        name: '김동현',
        age: 39,
        company: 'SK C&C',
        department: '클라우드개발팀',
        role: '팀장',
        category: 'IT',
        leaderProfile: {
            yearsInRole: 3,
            previousRole: '백엔드 개발자',
            promotionReason: '그룹사 클라우드 전환(Migration) 프로젝트 성공으로 인프라 비용 30% 절감. MSA 도입으로 배포 속도 5배 향상',
            leadershipStyle: '기술 리더십(Tech Lead), 코드 리뷰 중시, 자율과 책임. "개발자는 코드로 말한다".',
            hiddenStruggles: [
                '장애 나면 새벽에도 불려 나가야 해서 불면증과 만성 피로에 시달림',
                '개발자들 연봉이 너무 올라서 팀원들 붙잡아두기가 힘듦 (나보다 많이 받는 팀원도 있음)',
                '신기술 도입하고 싶은데 레거시 시스템 때문에 발목 잡혀서 답답함'
            ]
        },
        team: {
            size: 15,
            seniorCount: 5,
            juniorCount: 10,
            composition: '팀장 1명 + 백엔드(Java/Spring) 6명 + 프론트엔드(React) 4명 + DevOps(AWS/K8s) 4명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 8명(시니어) + Advanced 7명(주니어)',
            resistanceFactors: [
                '운영팀: "안정성이 최우선이다", "배포 자주 하지 마라"며 CI/CD 도입 반대',
                '보안팀: "클라우드는 위험하다", "망분리 해야 한다"며 인프라 구조 제약',
                '시니어 개발자: "내가 짠 코드가 완벽하다"며 AI 코드 리뷰 무시'
            ]
        },
        work: {
            mainTasks: [
                'SK 그룹사 레거시 시스템의 클라우드(AWS/Azure) 마이그레이션',
                'MSA(Microservices Architecture) 설계 및 구축',
                'CI/CD 파이프라인 운영 및 자동화',
                'Kubernetes 클러스터 운영 및 모니터링',
                '주니어 개발자 코드 리뷰 및 멘토링'
            ],
            dailyWorkflow: '오전 9:30 출근 → 10시 데일리 스크럼 (어제 한 일, 오늘 할 일, Blocker 공유) → 10:30-12시 코드 리뷰 (PR 코멘트 달기) → 오후 1-3시 아키텍처 설계 회의 → 3-5시 집중 코딩 시간 (헤드폰 끼고 방해 금지) → 5-6시 트러블 슈팅 및 회고',
            weeklyRoutine: '월: 스프린트 플래닝 | 화: 테크 세미나 | 수: 아키텍처 리뷰 | 목: 타운홀 미팅 | 금: 스프린트 리뷰 및 회고(Retrospective)',
            collaboration: '팀 내부: Jira, Slack, GitHub, Confluence로 비동기 협업. 타 부서: 기획/디자인팀과 피그마 보면서 스펙 논쟁. 외부: AWS/MS 엔지니어와 기술 지원 티켓 씨름.',
            toolsUsed: ['AWS', 'Kubernetes', 'Jenkins/ArgoCD', 'GitHub', 'Jira', 'Slack', 'IntelliJ', 'Datadog'],
            painPoints: [
                '기획팀에서 "간단한 수정이니까 금방 되죠?"라고 하는데, 구조 뜯어고쳐야 해서 3일 걸리는 일일 때 설명하기 힘듦',
                '주니어들이 짠 코드 리뷰하다가 하루 다 감. "이거 왜 이렇게 짰어?" 물어보면 "GPT가 짰는데요"라고 함',
                '새벽 3시에 서버 다운됐다고 알람(PagerDuty) 울리면 자다가 깨서 노트북 켜야 함'
            ],
            automationNeeds: [
                'AI 기반 코드 자동 리뷰 및 버그 탐지 (SonarQube보다 똑똑한 거)',
                '회의록 자동 요약 및 Jira 티켓 자동 생성',
                '장애 로그(Log) 자동 분석 및 원인(Root Cause) 추적'
            ],
            workStructure: {
                level: '고도구조화',
                description: '애자일(Scrum) 방법론 철저 준수. 2주 단위 스프린트. 모든 코드는 깃허브로 관리되고 CI/CD로 자동 배포됨. 프로세스는 명확하나 기술적 난이도가 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '이미 Copilot 쓰고 있는데 워크샵에서 더 새로운 걸 알려줄까',
                '보안 규정 때문에 사내망에서 외부 AI 서비스 접속이 막혀있는데 해결책이 있나',
                '비개발자(기획/디자인)들이랑 협업하는 툴이 더 필요함'
            ],
            dropoutRisk: 5,
        },
        personality: {
            patience: 7,
            techSavvy: 10,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    },

    {
        id: 'P025',
        name: '이민호',
        age: 41,
        company: 'SK텔레콤',
        department: '보안운영팀',
        role: '팀장',
        category: 'IT',
        leaderProfile: {
            yearsInRole: 4,
            previousRole: '보안 엔지니어',
            promotionReason: '지능형 보안 관제 시스템(ESM) 구축으로 해킹 시도 방어율 99.99% 달성. ISMS-P 인증 심사 무결점 통과',
            leadershipStyle: '보안 제일(Security First), 원칙 준수, 24시간 긴장. "보안은 뚫리면 끝이다".',
            hiddenStruggles: [
                '보안 사고 안 나면 본전이고 나면 역적이라 성과 인정받기 어려움 (잘해도 티가 안 남)',
                '직원들이 나를 "감시자"나 "통제광"으로 보는 시선이 불편함',
                '해커들은 날고 기는데 우리는 예산 부족으로 기어가는 느낌이라 무력감 느낌'
            ]
        },
        team: {
            size: 12,
            seniorCount: 5,
            juniorCount: 7,
            composition: '팀장 1명 + 보안 관제(CERT) 6명(3교대) + 보안 정책/컴플라이언스 3명 + 모의해킹(Red Team) 2명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 6명(해커 출신) + Advanced 6명',
            resistanceFactors: [
                '임직원: "보안 프로그램 때문에 PC 느려졌다", "일 좀 하게 해달라"며 삭제 요구',
                '개발팀: "방화벽 때문에 외부 라이브러리 못 받는다"며 예외 처리 지속 요청',
                '경영진: "보안에 돈 쓰면 매출이 오르냐"며 투자 인색'
            ]
        },
        work: {
            mainTasks: [
                '24시간 365일 보안 관제 및 침해 사고 대응 (DDoS, 랜섬웨어)',
                '임직원 PC/서버 취약점 점검 및 조치',
                '정보보호 관리체계(ISMS-P) 인증 유지 및 심사 대응',
                '악성 메일 모의 훈련 및 임직원 보안 교육',
                '보안 솔루션(방화벽, IPS, WAF) 정책 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전일 보안 이벤트(공격 시도) 리포트 확인 → 10시 침해 사고 분석 회의 → 11-12시 신규 취약점(Zero-day) 대응 방안 수립 → 오후 1-3시 보안 위규자(USB 무단 사용 등) 소명 처리 → 3-5시 보안 솔루션 정책 업데이트 → 5-6시 퇴근 전 보안 점검',
            weeklyRoutine: '월: 주간 보안 동향 분석 | 화: 모의해킹 결과 리뷰 | 수: 보안 교육 자료 제작 | 목: ISMS 증적 관리 | 금: 주간 관제 리포트',
            collaboration: '팀 내부: Splunk(로그분석)와 보안 메신저 사용. 타 부서: IT팀과 서버 패치 일정 싸움(서버 재부팅 해야 하니까), 현업 부서와 "사이트 접속 풀어달라" 민원 씨름. 외부: KISA(인터넷진흥원) 및 보안 업체와 위협 정보 공유.',
            toolsUsed: ['Splunk', 'Wireshark', 'Kali Linux', 'Jira', 'Confluence', 'AhnLab'],
            painPoints: [
                '하루에 보안 로그가 100만 건씩 쌓이는데, 그중 99%가 오탐(False Positive)이라 진짜 공격 찾기가 모래사장 바늘 찾기임',
                '임직원들이 "보안 때문에 일 못하겠다"고 불만 제기할 때마다 스트레스 받음 (우리는 회사를 지키는 건데)',
                '해커들은 AI로 공격하는데 우리는 사람이 수동으로 방어하고 있음 (비대칭 전력)'
            ],
            automationNeeds: [
                'AI 기반 보안 위협 자동 탐지 및 대응 (SOAR) - 오탐 줄이기',
                '피싱 메일/악성 파일 자동 분석 및 격리',
                '임직원 보안 문의(사이트 차단 해제 등) 자동 처리 챗봇'
            ],
            workStructure: {
                level: '고도구조화',
                description: '보안 규정과 절차는 법(Law)임. 예외 없음. 침해 대응 매뉴얼(Playbook) 존재. 24시간 교대 근무. 시스템 의존도 절대적.'
            }
        },
        expectedBehavior: {
            initialAttitude: '회의적',
            concerns: [
                '외부 AI 툴에 우리 회사 보안 로그를 올린다고? 절대 불가 (Data Leakage 우려)',
                'AI가 판단 잘못해서 중요 서버 차단해버리면 장애 나는데 책임질 수 있나',
                '폐쇄망(인터넷 안됨) 환경이라 클라우드 기반 AI 툴은 그림의 떡'
            ],
            dropoutRisk: 30,
        },
        personality: {
            patience: 8,
            techSavvy: 9,
            changeResistance: 'high',
            learningSpeed: 'medium'
        }
    },

    // ==================== STRATEGY (1명) ====================
    {
        id: 'P026',
        name: '김도현',
        age: 44,
        company: 'SK주식회사',
        department: 'ESG전략팀',
        role: '팀장',
        category: 'Strategy',
        leaderProfile: {
            yearsInRole: 2,
            previousRole: '경영 전략가',
            promotionReason: 'SK그룹 Net Zero(탄소중립) 로드맵 수립 및 RE100 가입 주도. DJSI World 지수 3년 연속 편입 달성',
            leadershipStyle: '비전 제시, 글로벌 감각, 이해관계자 소통. "착한 기업이 돈도 잘 번다".',
            hiddenStruggles: [
                'ESG가 "돈 먹는 하마"라고 생각하는 보수적인 임원들 설득하기가 너무 힘듦',
                '글로벌 기준은 계속 높아지는데 우리 현실은 따라가기 벅차서 가랑이 찢어질 것 같음',
                '좋은 일 한다고 자부하지만 정작 회사 내에서는 "비용 부서"라며 찬밥 신세'
            ]
        },
        team: {
            size: 6,
            seniorCount: 3,
            juniorCount: 3,
            composition: '팀장 1명 + 환경(E) 담당 2명(탄소배출권) + 사회(S) 담당 2명(사회공헌) + 지배구조(G) 담당 1명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명(데이터) + Advanced 3명 + Intermediate 2명',
            resistanceFactors: [
                '공장장: "탄소 배출 줄이려면 공장 멈추라는 거냐"며 현실적 어려움 토로',
                '구매팀: "친환경 소재 쓰면 원가 올라간다"며 비협조적 태도',
                '계열사 담당자: "본사에서 시키니까 하긴 하는데 우리 사정 모른다"며 수동적 대응'
            ]
        },
        work: {
            mainTasks: [
                '그룹 ESG 경영 전략 수립 및 KPI 관리',
                '지속가능경영 보고서 발간 (GRI, SASB 기준)',
                '글로벌 ESG 평가 대응 (MSCI, DJSI, CDP)',
                '탄소배출권 거래 및 감축 프로젝트 관리',
                '이사회 산하 ESG 위원회 운영 지원'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 글로벌 ESG 뉴스/규제 동향 모니터링 (EU 공급망 실사법 등) → 10-12시 계열사 ESG 담당자 회의 (데이터 취합 독촉) → 오후 1-3시 지속가능경영 보고서 원고 검토 → 3-5시 평가 기관(MSCI) 질의서 답변 작성 → 5-6시 경영진 보고',
            weeklyRoutine: '월: 주간 ESG 이슈 브리핑 | 화: 탄소배출량 데이터 검증 | 수: 사회공헌 프로그램 기획 | 목: 평가 대응 전략 회의 | 금: 주간 활동 보고',
            collaboration: '팀 내부: Teams와 이메일로 자료 공유. 타 부서: 전 계열사 공장장들과 탄소 배출량 줄이기 협의(힘듦), 구매팀과 공급망 리스크 관리. 외부: 평가 기관, 컨설팅사, NGO와 소통.',
            toolsUsed: ['Excel', 'PowerPoint', 'Teams', 'ESG 데이터 플랫폼(Salesforce Net Zero Cloud)', 'Zoom'],
            painPoints: [
                '계열사 공장마다 탄소 배출량 측정 기준이 달라서 엑셀 취합하다가 머리 터짐 (데이터 정합성 문제)',
                '글로벌 평가 기관(MSCI, DJSI)마다 요구하는 데이터가 다르고 매년 기준이 바뀜',
                '보고서 시즌(5-7월) 되면 디자인 업체랑 밤새면서 오타 수정하고 번역 검수함'
            ],
            automationNeeds: [
                'ESG 데이터 자동 수집 및 표준화 (IoT 센서 연동)',
                '글로벌 규제/평가 기준 변경 사항 자동 알림 및 갭 분석',
                '지속가능경영 보고서 초안 자동 작성 및 다국어 번역'
            ],
            workStructure: {
                level: '반구조화',
                description: '전략 수립은 비정형적이나 데이터 취합은 정형적이어야 함(근데 잘 안됨). 글로벌 기준에 따라 업무 변화 많음. 협업 대상이 매우 광범위.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'ESG 데이터 관리에 AI 도입하면 그린워싱(Greenwashing) 리스크는 없을지',
                '글로벌 트렌드 파악에 도움 될지',
                '워크샵에서 배운 내용을 계열사 전체에 전파할 수 있을지 (표준화 가능성)'
            ],
            dropoutRisk: 5,
        },
        personality: {
            patience: 8,
            techSavvy: 7,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    },

    // Placeholders for P027-P030
    {
        id: 'P027',
        name: '박준영',
        age: 35,
        company: 'SK텔레콤',
        department: '서비스기획팀',
        role: '팀장',
        category: 'Strategy',
        leaderProfile: {
            yearsInRole: 1.5,
            previousRole: '서비스 기획자',
            promotionReason: 'SK텔레콤 구독 서비스 "T우주" 런칭 초기 기획 주도하여 가입자 100만 명 조기 달성. 데이터 기반의 요금제 설계로 ARPU 15% 증대 성과',
            leadershipStyle: '데이터 중심, 애자일, 빠른 실행력. 하지만 개발/디자인 팀과의 협업에서 오는 마찰로 스트레스 받음.',
            hiddenStruggles: [
                '개발자, 디자이너, 사업부 사이에서 조율하느라 정작 기획할 시간이 없음 (회의 지옥)',
                '경쟁사는 치고 나가는데 우리는 내부 프로세스에 발목 잡혀 있는 것 같아 답답함',
                '실패하면 기획 탓, 성공하면 개발 덕분이라는 인식에 회의감 느낌'
            ]
        },
        team: {
            size: 8,
            seniorCount: 2,
            juniorCount: 6,
            composition: '팀장 1명 + 서비스 기획자 5명(T우주 패스 담당 3명, 제휴 담당 2명) + UX 리서처 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 4명(기획자, 리서처) + Intermediate 4명',
            resistanceFactors: [
                '개발팀: "기획서가 부실해서 개발 못하겠다", "스펙이 계속 바뀐다"며 반려',
                '디자인팀: "개발 구현 안 된다고 디자인 퀄리티 낮추지 마라"며 고집',
                '사업부: "돈 되는 기능을 먼저 넣어라"며 UX 무시하고 압박'
            ]
        },
        work: {
            mainTasks: [
                'T우주 신규 제휴처 발굴 및 서비스 로드맵 수립 (분기별 3개 신규 제휴 목표)',
                '가입자 이탈률(Churn Rate) 분석 및 방어 시나리오 설계',
                '개발팀(백엔드/프론트) 및 디자인팀과 스프린트 일정 조율',
                '경쟁사(네이버 플러스, 쿠팡 와우) 서비스 벤치마킹 및 대응 전략',
                '주간 서비스 지표(가입자, 매출, 리텐션) 대시보드 관리'
            ],
            dailyWorkflow: '오전 9:30 데일리 스크럼 (Jira 보드 띄워놓고 15분) → 10-12시 Amplitude로 전날 가입/해지 데이터 분석 → 오후 1-3시 개발팀과 "선물하기" 기능 구현 스펙 논의 (개발팀장이 레거시 코드 때문에 안 된다고 반대 중) → 3-5시 신규 제휴사(요기요, 투썸) 미팅 → 5-6시 기획서(Figma/PPT) 디테일 보완',
            weeklyRoutine: '월: 주간 스프린트 플래닝 (2시간) | 화: 데이터 딥다이브 (이탈 원인 분석) | 수: 경쟁사 동향 리뷰 | 목: 기획 리뷰 (디자이너/개발자 참여) | 금: 주간 성과 회고 (KPT 회고)',
            collaboration: '팀 내부: Jira로 티켓 관리, Confluence에 기획서 작성. Slack으로 실시간 소통. 타 부서: 개발팀과는 Jira 연동, 마케팅팀과는 주 1회 정기 미팅. 외부: 제휴사와는 이메일/미팅.',
            toolsUsed: ['Figma', 'Jira', 'Confluence', 'Amplitude', 'Slack', 'Notion'],
            painPoints: [
                '개발팀장이 "기획서가 부실해서 개발 못하겠다"며 티켓을 자꾸 반려함 (주당 3-4건)',
                '수많은 사용자 리뷰(앱스토어, 커뮤니티)를 엑셀로 긁어서 수동으로 분류하느라 인사이트 도출이 3일씩 걸림',
                '회의록 정리하고 Jira 티켓 쪼개는 데만 하루 2시간 씀. 정작 기획 고민할 시간이 부족함'
            ],
            automationNeeds: [
                '회의 녹음 파일 자동 요약 및 Jira 티켓 자동 생성/할당',
                '사용자 리뷰/피드백 자동 수집 및 감성 분석 (긍정/부정/버그/제안)',
                '경쟁사 서비스 가격/정책 변동 사항 실시간 알림'
            ],
            workStructure: {
                level: '반구조화',
                description: '기획 업무는 창의적이나 프로세스는 애자일(Scrum) 방법론 따름. 2주 단위 스프린트로 돌아감. 데이터 분석은 정형적이나, 타 부서와의 협업 조율은 매우 정치적이고 비정형적.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '기획의 창의적인 영역(아이디에이션)까지 AI가 대체할 수 있을지 의문',
                '고객 데이터(개인정보) 보안 문제로 실제 데이터를 AI에 넣기 어려움',
                'Jira/Confluence랑 연동 안 되면 결국 또 다른 툴 하나 더 쓰는 셈이라 귀찮음'
            ],
            dropoutRisk: 10,
        },
        personality: {
            patience: 7,
            techSavvy: 9,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    },

    {
        id: 'P028',
        name: '최민지',
        age: 32,
        company: 'SK플래닛',
        department: 'UX디자인팀',
        role: '팀장',
        category: 'IT',
        leaderProfile: {
            yearsInRole: 1,
            previousRole: 'UX 디자이너',
            promotionReason: '전사 디자인 시스템 "T-Design 2.0" 구축으로 디자인 일관성 확보 및 개발 효율 30% 증대. 에이닷(A.) 앱 UX 개편 주도',
            leadershipStyle: '디테일 중시, 사용자 공감, 자유로운 피드백. 하지만 개발팀과의 구현 가능성 논쟁에 지쳐있음.',
            hiddenStruggles: [
                '디자인은 주관적이라 모두가 한마디씩 거드는 통에 스트레스 받음 (시어머니가 100명)',
                '개발 구현 단계에서 디자인이 망가지는 걸 볼 때마다 가슴이 찢어짐 (픽셀이 안 맞음)',
                '트렌드는 힙한 걸 원하는데 회사는 보수적인 걸 원해서 괴리감 느낌'
            ]
        },
        team: {
            size: 6,
            seniorCount: 1,
            juniorCount: 5,
            composition: '팀장 1명 + UI 디자이너 3명(앱/웹) + UX 디자이너 2명(리서치/설계)',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 6명 (모두 툴 사용 능숙)',
            resistanceFactors: [
                '개발팀: "그 애니메이션 넣으면 앱 느려진다", "라이브러리 없다"며 구현 거부',
                '기획팀: "화면 예쁜 것보다 기능이 중요하다", "버튼 더 크게 해달라"며 디자인 무시',
                '마케팅팀: "로고 더 크게, 빨간색 더 진하게"라며 브랜드 가이드 위반 요구'
            ]
        },
        work: {
            mainTasks: [
                '에이닷(A.) 서비스 UX/UI 리뉴얼 및 신규 기능 디자인',
                'T-Design 시스템 컴포넌트 라이브러리 유지보수 및 고도화',
                '사용자 사용성 테스트(UT) 설계 및 결과 분석',
                '개발 산출물 디자인 검수(QA) 및 픽셀 퍼펙트 체크',
                '마케팅 배너 및 프로모션 페이지 디자인 지원'
            ],
            dailyWorkflow: '오전 10시 디자인 크리틱 (Figma 화면 띄워놓고 서로 코멘트) → 11-1시 시안 작업 집중 (이어폰 끼고 말 안검) → 오후 2-3시 개발팀 핸드오프 미팅 (제플린 가이드 설명) → 3-5시 UT 참관 (미러룸에서 사용자 반응 관찰) → 5-6시 디자인 에셋 정리 및 네이밍',
            weeklyRoutine: '월: 주간 디자인 스프린트 킥오프 | 화: 레퍼런스 스터디 (Behance, Dribbble) | 수: 디자인 시스템 위원회 (컴포넌트 추가 논의) | 목: 개발 QA (구현된 화면 캡쳐해서 피드백) | 금: 주간 회고 및 디자인 잼',
            collaboration: '팀 내부: Figma 실시간 협업 (커서가 날아다님). Slack으로 시안 공유. 타 부서: 기획팀과 와이어프레임 논의, 개발팀과 구현 가능성 협의 (자주 싸움).',
            toolsUsed: ['Figma', 'ProtoPie', 'Zeplin', 'Jira', 'Slack', 'Adobe CC'],
            painPoints: [
                '단순 반복적인 배너 리사이징(인스타용, 유튜브용, 앱배너용) 작업에 주니어들이 지쳐서 퇴사 고민함',
                '개발팀이 디자인 가이드(Zeplin)를 줬는데도 제멋대로 구현해서 QA할 때마다 "이거 색상 코드 다르잖아요"라고 싸움',
                '디자인 파일 버전 관리가 안 돼서 "최종_v2_real_fix.fig" 같은 파일이 쌓이고 히스토리 파악이 안 됨'
            ],
            automationNeeds: [
                '배너/아이콘 등 단순 그래픽 에셋 AI 자동 생성 및 리사이징',
                'Figma 디자인을 React/CSS 코드로 완벽하게 변환 (개발자 핑계 못 대게)',
                '디자인 시스템 변경 사항이 자동으로 가이드 문서에 업데이트'
            ],
            workStructure: {
                level: '반구조화',
                description: '창의성이 요구되나 디자인 시스템 규칙(Color, Typography, Spacing) 준수 필수. 반복 작업(배너 양산) 존재. 협업 툴(Figma) 의존도 100%.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'AI가 만든 디자인이 우리 브랜드 톤앤매너(SKT Red, 폰트 등)를 정확히 지킬 수 있을지',
                '디자이너들이 "AI가 다 하면 우리는 뭐 하냐"며 직무 불안감을 느낄까 봐',
                '저작권 문제가 없는 이미지를 생성할 수 있는지 (상업적 이용 가능 여부)'
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
        id: 'P029',
        name: '정우성',
        age: 45,
        company: 'SK하이닉스',
        department: '구매팀',
        role: '팀장',
        category: 'Finance',
        leaderProfile: {
            yearsInRole: 5,
            previousRole: '구매 담당',
            promotionReason: '반도체 핵심 소재(네온 가스) 수급 위기 시 우크라이나 대체 공급망(중국, 국내) 3일 만에 확보하여 라인 중단 방지. 원가 12% 절감 달성',
            leadershipStyle: '협상가형, 리스크 관리, 원칙 준수. 스트레스 내성 강함.',
            hiddenStruggles: [
                '원가 절감 압박과 공급사 단가 인상 요구 사이에서 샌드위치 신세',
                '공급망 이슈 터지면 내 탓인 것 같아 자다가도 벌떡 일어남 (전쟁, 지진 공포)',
                '협력사 접대받는다는 오해받을까 봐 밥도 편하게 못 먹음 (윤리 규정 압박)'
            ]
        },
        team: {
            size: 10,
            seniorCount: 4,
            juniorCount: 6,
            composition: '팀장 1명 + 원자재 구매 4명(가스/케미칼) + 설비 구매 3명(노광/식각 장비) + 협력사 관리 3명(SCM)',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Intermediate 10명 (SAP는 잘 쓰지만 신기술엔 보수적)',
            resistanceFactors: [
                '생산팀: "싼 게 비지떡이다, 좋은 자재 써라"며 원가 절감 반대',
                '협력사: "더 이상 깎으면 우리 망한다", "납품 못 한다"며 배수진',
                '법무팀: "계약서 문구 하나라도 불리하면 안 된다"며 승인 지연'
            ]
        },
        work: {
            mainTasks: [
                '반도체 전공정 핵심 원자재(Wafer, Gas, Chemical) 구매 전략 수립',
                '글로벌 공급망 리스크(전쟁, 지진, 무역제재) 실시간 모니터링',
                '주요 장비(ASML 등) 리드타임 단축을 위한 협상',
                '협력사 ESG 평가 및 단가 인하(CR) 활동',
                '구매 계약서 법적 리스크 검토 및 체결'
            ],
            dailyWorkflow: '오전 8:30 블룸버그/로이터로 원자재 시황 및 환율 체크 → 9:30 팀 미팅 (수급 이슈 공유) → 10-12시 공급사(미국/일본)와 화상 협상 (시차 때문에 오전/밤에 많음) → 오후 1-3시 계약서 독소조항 검토 (법무팀과 통화) → 3-5시 발주(PO) 생성 및 결재 → 5-6시 자재 입고 현황 보고',
            weeklyRoutine: '월: 주간 구매 계획 수립 | 화: 공급사 QBR(분기 리뷰) 준비 | 수: 원가 절감 아이디어 회의 | 목: 계약 심의 위원회 | 금: 주간 리스크 점검 및 재고 확인',
            collaboration: '팀 내부: SAP MM 모듈로 데이터 공유. 타 부서: 생산팀과 자재 투입 일정 조율(매일 싸움), 품질팀과 불량 자재 반품 논의. 외부: 전 세계 공급사와 이메일/전화 협상.',
            toolsUsed: ['SAP ERP', 'Excel', 'Teams', 'Outlook', 'Bloomberg Terminal'],
            painPoints: [
                '러시아-우크라이나 전쟁 같은 지정학적 이슈가 터지면 새벽에도 전화 받고 대체 공급사 찾느라 피가 마름',
                '수백 장짜리 영문 계약서를 일일이 읽고 독소 조항(Liability, Warranty) 찾는 게 너무 힘듦. 법무팀은 "검토하세요"라고만 함',
                '단순 발주(PO) 처리가 월 1,000건인데, 품목 코드 하나만 틀려도 시스템 에러 나서 수정하는 데 시간 다 씀'
            ],
            automationNeeds: [
                '글로벌 뉴스/SNS 기반 공급망 리스크(파업, 재해) 실시간 감지 및 알림',
                'AI 기반 영문 계약서 자동 분석 및 리스크 조항 하이라이팅',
                '단순 반복 발주 자동화 (RPA) 및 품목 코드 자동 추천'
            ],
            workStructure: {
                level: '고도구조화',
                description: '구매 규정과 절차(SoX) 매우 엄격. 계약은 법적 구속력 있음. 시스템(SAP) 의존도 높으나 엑셀 작업도 많음. 윤리 경영 중요.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '구매는 돈이 오가는 업무라 AI가 실수해서 잘못 발주 나가면 책임은 누가 지나',
                '협상은 사람 간의 미묘한 줄다리기인데 AI가 도움이 될지 의문',
                '기존 SAP 시스템이 너무 무겁고 폐쇄적인데 최신 AI 툴과 연동이 될지'
            ],
            dropoutRisk: 15,
        },
        personality: {
            patience: 8,
            techSavvy: 5,
            changeResistance: 'medium',
            learningSpeed: 'medium'
        }
    },

    {
        id: 'P030',
        name: '강하나',
        age: 34,
        company: 'SK텔레콤',
        department: '브랜드마케팅팀',
        role: '팀장',
        category: 'Marketing',
        leaderProfile: {
            yearsInRole: 1,
            previousRole: '마케터',
            promotionReason: 'MZ세대 타겟의 "0(Young)한 숏폼 챌린지" 캠페인 대성공으로 조회수 1,000만 회 달성. 브랜드 인지도 20% 상승 기여',
            leadershipStyle: '트렌디함, 수평적 소통, 크리에이티브 존중. 꼰대 문화 극혐함.',
            hiddenStruggles: [
                '젊은 척, 힙한 척하려고 노력하지만 사실 트렌드 따라가기 버거움 (틱톡 봐도 이해 안 됨)',
                '조회수 안 나오면 내 감이 죽었나 싶어서 자존감 떨어짐',
                '회사에서는 "노는 부서", "돈 쓰는 부서"라고 생각해서 성과 증명하기가 어려움'
            ]
        },
        team: {
            size: 7,
            seniorCount: 2,
            juniorCount: 5,
            composition: '팀장 1명 + 브랜드 마케터 4명(SNS 담당) + 콘텐츠 크리에이터 2명(영상/디자인)',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 7명 (모두 디지털 네이티브)',
            resistanceFactors: [
                '법무팀: "저작권 문제 소지 있다", "표현이 과격하다"며 콘텐츠 검열',
                '임원진: "우리 회사 품격에 안 맞는다", "이게 왜 재밌냐"며 꼰대 같은 피드백',
                '홍보팀: "리스크 관리 안 된다"며 부정적 이슈 우려'
            ]
        },
        work: {
            mainTasks: [
                'SKT 브랜드 영(Young) 타겟 커뮤니케이션 전략 수립',
                '유튜브/인스타그램/틱톡 채널 운영 및 숏폼 콘텐츠 기획',
                '인플루언서(침착맨, 곽튜브 등) 협업 및 브랜디드 콘텐츠 제작',
                'T1(e스포츠) 연계 마케팅 캠페인 실행',
                '브랜드 지표(SOV, Engagement) 분석 및 리포팅'
            ],
            dailyWorkflow: '오전 9:30 트렌드 뉴스 클리핑 (캐릿, 틱톡 트렌드 확인) → 10시 아이디어 회의 (자유롭게 드립 치는 분위기) → 11-1시 콘텐츠 촬영/제작 (사내 스튜디오) → 오후 2-4시 대행사 미팅 및 시사 → 4-6시 댓글 반응 모니터링 및 대댓글 달기',
            weeklyRoutine: '월: 주간 콘텐츠 캘린더 확정 | 화: 광고 소재 리뷰 | 수: 촬영/편집 데이 | 목: 대행사 주간 보고 | 금: 트렌드 리포트 공유 및 맛집 탐방',
            collaboration: '팀 내부: Notion으로 스케줄 관리, Slack으로 짤 공유. 타 부서: 상품기획팀과 신제품 런칭 협업, 홍보팀과 리스크 체크. 외부: 광고 대행사, 인플루언서 소속사와 매일 카톡.',
            toolsUsed: ['Instagram', 'YouTube', 'TikTok', 'GA4', 'Notion', 'Slack', 'Premiere Pro'],
            painPoints: [
                '트렌드가 하루가 다르게 바뀌어서(밈 수명 3일) 따라가기 벅참. 주말에도 인스타 봐야 함',
                '채널별(인스타 릴스, 유튜브 쇼츠, 틱톡)로 포맷과 감성을 다르게 만들어야 해서 리소스가 3배로 듦',
                '광고 성과 데이터를 채널마다 로그인해서 엑셀로 취합하기 번거로움 (API 연동 안 됨)'
            ],
            automationNeeds: [
                '소셜 미디어 급상승 트렌드 및 키워드 실시간 알림',
                'AI 기반 숏폼 영상 자동 편집 (컷편집, 자막) 및 리사이징',
                '통합 마케팅 성과(조회수, 댓글, 공유) 대시보드 자동화'
            ],
            workStructure: {
                level: '반구조화',
                description: '매우 창의적이고 유동적. 정해진 답이 없음. 트렌드에 민감하게 반응해야 함. 외부 협업 많음. 출퇴근 시간 유연함.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'AI가 만든 카피나 콘텐츠가 "아재"스럽거나 우리 브랜드 감성(Hip함)을 못 살릴까 봐',
                '너무 자동화에 의존하면 크리에이티브가 죽고 공장형 콘텐츠만 나올까 봐',
                '생성형 AI 이미지 저작권 이슈나 딥페이크 논란 등 윤리적 문제'
            ],
            dropoutRisk: 5,
        },
        personality: {
            patience: 7,
            techSavvy: 9,
            changeResistance: 'low',
            learningSpeed: 'fast'
        }
    }
];
