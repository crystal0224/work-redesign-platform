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
        name: '김서연',
        age: 36,
        company: 'SK텔레콤',
        department: '인재영입팀',
        role: '팀장',
        category: 'HR',
        leaderProfile: {
            yearsInRole: 1.5,
            previousRole: '채용 담당자',
            promotionReason: 'AI 기반 채용 시스템 도입으로 채용 리드타임 40% 단축. 우수 인재 영입 성과 인정받아 팀장 승진',
            leadershipStyle: '데이터 기반 채용, 후보자 경험 중시, 주간 채용 리뷰'
        },
        team: {
            size: 8,
            seniorCount: 3,
            juniorCount: 5,
            composition: '팀장 1명 + 채용 담당자 5명 + 브랜딩 담당 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 4명 + Intermediate 4명'
        },
        work: {
            mainTasks: [
                '신입/경력 인재 영입 전략 수립',
                '채용 브랜딩 및 마케팅',
                '면접 진행 및 평가',
                '입사 온보딩 프로그램 운영',
                '채용 데이터 분석 및 보고'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 채용 현황 대시보드 확인 → 10시 팀 스탠드업 미팅 → 11-12시 면접 진행 → 오후 1-3시 후보자 서류 검토 → 3-4시 채용 브랜딩 회의 → 4-6시 면접 결과 정리 및 합격자 연락',
            weeklyRoutine: '월: 주간 채용 목표 회의 | 화: 면접관 교육 | 수: 채용 브랜딩 콘텐츠 기획 | 목: 온보딩 피드백 리뷰 | 금: 주간 채용 성과 보고',
            collaboration: '팀 내부: ATS(지원자관리시스템)와 Slack으로 후보자 정보 공유 | 타 부서: 현업 부서장과 채용 요건 협의, 인사팀과 처우 협의 | 외부: 헤드헌터 및 채용 플랫폼과 협업',
            toolsUsed: ['Greenhouse(ATS)', 'LinkedIn Recruiter', 'Notion', 'Slack', 'Zoom'],
            painPoints: [
                '면접 일정을 수동으로 조율하느라 시간 낭비 심함',
                '면접 평가표가 종이/엑셀로 되어 있어 데이터화 안됨',
                '채용 문의 응대가 많아 업무 집중 어려움'
            ],
            automationNeeds: [
                'AI 기반 면접 일정 자동 조율',
                '면접 평가 데이터 자동 분석',
                '채용 문의 챗봇 도입'
            ],
            workStructure: {
                level: '반구조화',
                description: '채용 프로세스는 명확하나 면접 일정 조율 등은 비정형적. ATS 사용하나 평가 데이터 통합 미흡. 주간 리뷰로 진행 공유.'
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
            promotionReason: '사내 소통 문화 개선 프로젝트 성공으로 직원 만족도 15% 상승. 리더십 교육 프로그램 개발 성과 인정',
            leadershipStyle: '소통 중심, 수평적 문화 지향, 월간 타운홀 미팅'
        },
        team: {
            size: 6,
            seniorCount: 2,
            juniorCount: 4,
            composition: '팀장 1명 + 문화 기획자 3명 + 사내 커뮤니케이터 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 2명 + Intermediate 2명 + Beginner 2명'
        },
        work: {
            mainTasks: [
                '조직문화 진단 및 개선 활동',
                '사내 소통 채널 운영',
                '임직원 몰입도 조사 및 분석',
                '리더십 워크샵 기획 및 운영',
                '핵심가치 내재화 캠페인'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 사내 게시판 모니터링 → 10시 팀 아이디어 회의 → 11-12시 행사 기획안 작성 → 오후 1-3시 타 부서 인터뷰 → 3-4시 디자인팀 협업 → 4-6시 설문 데이터 분석 및 보고서 작성',
            weeklyRoutine: '월: 주간 문화 캠페인 기획 | 화: 리더십 코칭 세션 | 수: 사내 방송 제작 | 목: 타운홀 미팅 준비 | 금: 주간 활동 피드백',
            collaboration: '팀 내부: Notion과 Slack으로 아이디어 공유 | 타 부서: 전사 팀장들과 소통, 홍보팀과 사내 방송 협업 | 외부: 교육 컨설팅 업체와 협업',
            toolsUsed: ['SurveyMonkey', 'Notion', 'Slack', 'PowerPoint', 'Excel'],
            painPoints: [
                '설문조사 결과를 수동으로 분석하느라 인사이트 도출 늦음',
                '사내 행사 참여율 집계가 어려움',
                '조직문화 변화를 정량적으로 측정하기 어려움'
            ],
            automationNeeds: [
                'AI 기반 설문 응답 감성 분석',
                '사내 행사 참여 데이터 자동 집계',
                '조직문화 대시보드 구축'
            ],
            workStructure: {
                level: '비구조화',
                description: '업무 특성상 창의적이고 비정형적. 캠페인 단위로 업무 진행. 정량적 성과 측정 어려움. 협업 툴 사용하나 체계적이지 않음.'
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
            promotionReason: '급여 시스템 자동화로 오류율 0% 달성. 선택적 복리후생 제도 도입으로 직원 만족도 향상',
            leadershipStyle: '정확성 중시, 규정 준수, 연간 보상 리뷰'
        },
        team: {
            size: 7,
            seniorCount: 3,
            juniorCount: 4,
            composition: '팀장 1명 + 급여 담당 2명 + 복리후생 담당 2명 + 4대보험 담당 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명(시스템) + Advanced 3명 + Intermediate 3명'
        },
        work: {
            mainTasks: [
                '급여 및 상여금 계산/지급',
                '4대보험 신고 및 관리',
                '복리후생 제도 운영',
                '연말정산 관리',
                '인건비 예산 관리'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 급여 변동사항 확인 → 10시 팀 미팅 → 11-12시 4대보험 신고 업무 → 오후 1-3시 복리후생 신청 처리 → 3-4시 직원 문의 응대 → 4-6시 급여 대장 검증',
            weeklyRoutine: '월: 주간 급여 작업 계획 | 화: 4대보험 신고 | 수: 복리후생 정산 | 목: 규정 개정 검토 | 금: 주간 업무 마감',
            collaboration: '팀 내부: SAP HR과 Excel로 데이터 공유 | 타 부서: 재무팀과 인건비 정산, 법무팀과 규정 검토 | 외부: 노무법인 및 보험공단과 소통',
            toolsUsed: ['SAP HR', 'Excel', '홈택스', '4대보험 포털'],
            painPoints: [
                '급여 작업 시 엑셀 수식이 복잡해서 오류 검증에 시간 많이 걸림',
                '직원들의 단순 반복적인 문의(증명서 발급 등)가 너무 많음',
                '연말정산 기간에 팀원들 야근이 너무 심함'
            ],
            automationNeeds: [
                'RPA 기반 급여 검증 자동화',
                'HR 챗봇으로 단순 문의 자동 응대',
                '연말정산 서류 자동 검토 시스템'
            ],
            workStructure: {
                level: '고도구조화',
                description: '급여/4대보험 프로세스 매우 명확하고 법적 규제 따름. SAP HR로 시스템화. 월간/연간 일정 고정됨. 정확성이 생명.'
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
            promotionReason: '온라인 학습 플랫폼 구축으로 교육 참여율 50% 증가. 직무별 역량 모델링 프로젝트 성공',
            leadershipStyle: '성장 지향, 학습 조직 구축, 분기별 역량 평가'
        },
        team: {
            size: 9,
            seniorCount: 4,
            juniorCount: 5,
            composition: '팀장 1명 + 교육 기획자 4명 + 운영 담당 2명 + 콘텐츠 제작 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 5명 + Intermediate 4명'
        },
        work: {
            mainTasks: [
                '연간 교육 계획 수립 및 운영',
                '온라인 학습 플랫폼(LMS) 관리',
                '직무 역량 진단 및 피드백',
                '핵심 인재 육성 프로그램 운영',
                '교육 효과성 측정 및 보고'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 LMS 접속 현황 확인 → 10시 팀 미팅 → 11-12시 교육 과정 기획 → 오후 1-3시 강사 섭외 및 미팅 → 3-4시 교육 콘텐츠 검수 → 4-6시 교육 만족도 분석',
            weeklyRoutine: '월: 주간 교육 일정 점검 | 화: 콘텐츠 제작 회의 | 수: 강사 미팅 | 목: 역량 진단 분석 | 금: 주간 교육 리포트',
            collaboration: '팀 내부: LMS와 Notion으로 과정 관리 | 타 부서: 현업 팀장들과 교육 니즈 파악 | 외부: 교육 업체 및 강사와 협업',
            toolsUsed: ['LMS', 'Zoom', 'Articulate', 'Excel', 'Notion'],
            painPoints: [
                '교육 만족도 설문을 수동으로 분석하느라 개선점 도출 늦음',
                '개인별 맞춤형 교육 추천이 어려움 (일괄적인 과정 운영)',
                '교육 이수 현황 관리가 번거로움'
            ],
            automationNeeds: [
                'AI 기반 교육 만족도 분석',
                '개인별 맞춤형 콘텐츠 추천 알고리즘',
                '교육 이수 자동 알림 및 독려 시스템'
            ],
            workStructure: {
                level: '반구조화',
                description: '교육 기획은 창의적이나 운영은 정형적. LMS로 이력 관리. 연간 계획에 따라 움직이나 수시 과정 개설도 많음.'
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
            promotionReason: '노사 협의체 운영 효율화로 분쟁 건수 30% 감소. 주 52시간제 안착에 기여',
            leadershipStyle: '원칙 준수, 공정한 중재자, 월간 노사 협의회'
        },
        team: {
            size: 5,
            seniorCount: 2,
            juniorCount: 3,
            composition: '팀장 1명 + 노무 담당자 2명 + 고충 처리 담당 2명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Advanced 1명 + Intermediate 2명 + Beginner 2명'
        },
        work: {
            mainTasks: [
                '노사 협의회 운영 및 안건 관리',
                '취업규칙 및 인사 규정 관리',
                '직원 고충 상담 및 처리',
                '노동법률 자문 및 리스크 관리',
                '근로시간 관리 및 모니터링'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 근로시간 현황 점검 → 10시 팀 미팅 → 11-12시 법률 자문 검토 → 오후 1-3시 직원 상담 → 3-4시 규정 개정안 작성 → 4-6시 노사 안건 정리',
            weeklyRoutine: '월: 주간 근로시간 점검 | 화: 고충 처리 현황 리뷰 | 수: 노무사 미팅 | 목: 규정 검토 | 금: 주간 이슈 보고',
            collaboration: '팀 내부: 보안 폴더와 이메일로 정보 공유 | 타 부서: 현업 부서장과 근로시간 협의 | 외부: 노무법인과 자문',
            toolsUsed: ['근태관리시스템', 'Excel', 'Word', '이메일'],
            painPoints: [
                '근로시간 위반 예상자를 수동으로 찾아서 알려줘야 함',
                '직원 상담 내용이 기록되지 않고 구두로 처리되는 경우 많음',
                '법률 개정 사항을 일일이 찾아서 규정에 반영하기 번거로움'
            ],
            automationNeeds: [
                '근로시간 위반 예측 및 자동 알림',
                '상담 이력 관리 및 유형 분석 시스템',
                '법률 개정 알림 및 규정 비교 툴'
            ],
            workStructure: {
                level: '고도구조화',
                description: '법적 규제와 사규에 따라 엄격하게 업무 수행. 절차와 기준 명확. 보안 중요. 시스템보다 문서 위주 업무.'
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
            promotionReason: '전사 예산 최적화로 비용 10% 절감. 투자 수익률(ROI) 분석 모델 고도화로 경영진 신뢰 획득',
            leadershipStyle: '분석적, 숫자 중심, 주간 재무 리뷰'
        },
        team: {
            size: 6,
            seniorCount: 2,
            juniorCount: 4,
            composition: '팀장 1명 + 재무 분석가 3명 + 예산 담당 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 2명 + Advanced 2명 + Intermediate 2명'
        },
        work: {
            mainTasks: [
                '전사 예산 수립 및 통제',
                '월간/분기 경영 실적 분석',
                '투자 타당성 검토 (ROI 분석)',
                '비용 절감 방안 도출',
                '이사회 보고 자료 작성'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 자금 현황 확인 → 10시 팀 미팅 → 11-12시 실적 데이터 분석 → 오후 1-3시 사업부 예산 협의 → 3-4시 보고서 작성 → 4-6시 재무 이슈 점검',
            weeklyRoutine: '월: 주간 자금 계획 | 화: 사업부 실적 리뷰 | 수: 투자 심의 준비 | 목: 비용 분석 | 금: 주간 경영 보고',
            collaboration: '팀 내부: SAP ERP와 Excel로 데이터 공유 | 타 부서: 전사 사업부와 예산 협의 | 외부: 회계법인과 감사 대응',
            toolsUsed: ['SAP ERP', 'Excel(Advanced)', 'Power BI', 'PowerPoint'],
            painPoints: [
                '사업부에서 예산 데이터를 늦게 줘서 취합이 항상 급박함',
                '엑셀 수작업이 많아 휴먼 에러 발생 위험',
                '단순 데이터 취합에 팀원들 시간 60% 소요'
            ],
            automationNeeds: [
                '예산 데이터 자동 취합 및 검증',
                '실적 분석 대시보드 자동화',
                '비용 이상 징후 자동 알림'
            ],
            workStructure: {
                level: '고도구조화',
                description: '회계 기준과 사규에 따라 엄격한 프로세스. 월간 결산 일정 고정. 데이터 정확성이 최우선. SAP 시스템 의존도 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '재무 데이터는 보안이 생명인데 외부 툴 연동 가능할지',
                '엑셀만큼 유연한 툴이 있을지 의문',
                '자동화가 되면 팀원들 일자리가 줄어드는 건 아닌지 걱정'
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
            promotionReason: 'IFRS 회계 기준 변경에 따른 시스템 대응 성공. 결산 일정 2일 단축 성과',
            leadershipStyle: '원칙 준수, 꼼꼼함, 월간 결산 집중'
        },
        team: {
            size: 10,
            seniorCount: 4,
            juniorCount: 6,
            composition: '팀장 1명 + 회계 결산 담당 5명 + 세무 담당 2명 + 자금 담당 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 3명 + Advanced 4명 + Intermediate 3명'
        },
        work: {
            mainTasks: [
                '월간/분기/연간 결산',
                '재무제표 작성 및 공시',
                '세무 신고 및 조사 대응',
                '자금 집행 및 관리',
                '내부회계관리제도 운영'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 전표 처리 현황 확인 → 10시 팀 미팅 → 11-12시 결산 이슈 검토 → 오후 1-3시 회계법인 대응 → 3-4시 세무 이슈 검토 → 4-6시 자금 집행 승인',
            weeklyRoutine: '월: 주간 자금 계획 | 화: 결산 일정 점검 | 수: 세무 이슈 리뷰 | 목: 내부통제 점검 | 금: 주간 업무 마감',
            collaboration: '팀 내부: SAP FI/CO 모듈 사용 | 타 부서: 구매/영업팀과 매입/매출 마감 협의 | 외부: 국세청 및 은행과 업무',
            toolsUsed: ['SAP ERP', 'Excel', 'DART(공시시스템)', '홈택스'],
            painPoints: [
                '결산 기간에 야근이 너무 많음 (월 5일은 밤샘)',
                '증빙 서류가 종이로 오는 경우가 있어 관리가 어려움',
                '법규 변경 시 시스템 반영에 시간 걸림'
            ],
            automationNeeds: [
                '전표 자동 처리 및 검증 (RPA)',
                '증빙 서류 OCR 자동 인식',
                '결산 스케줄 자동 관리'
            ],
            workStructure: {
                level: '고도구조화',
                description: '회계 기준에 따라 절차 매우 엄격. 결산 프로세스 표준화됨. 시스템 의존도 매우 높음. 마감 기한 준수 필수.'
            }
        },
        expectedBehavior: {
            initialAttitude: '중립',
            concerns: [
                '회계는 실수가 용납 안 되는데 자동화를 믿을 수 있을지',
                '기존 SAP 시스템과 연동이 어려우면 무용지물',
                '워크샵이 너무 일반적인 내용이면 회계 업무에 적용하기 어려움'
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
            promotionReason: '해외 투자자 유치 성공으로 주가 안정화 기여. 투명한 공시로 ESG 평가 등급 상향',
            leadershipStyle: '전략적 소통, 네트워크 중시, 분기 실적 발표'
        },
        team: {
            size: 4,
            seniorCount: 2,
            juniorCount: 2,
            composition: '팀장 1명 + IR 담당자 3명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명 + Advanced 2명 + Intermediate 1명'
        },
        work: {
            mainTasks: [
                '투자자 미팅 및 컨퍼런스 참가',
                '분기 실적 발표 자료 작성',
                '주주총회 준비 및 운영',
                '시장 동향 모니터링 및 분석',
                '경영진 대상 주가/시장 보고'
            ],
            dailyWorkflow: '오전 8시 출근 → 8:30 증시 동향 확인 → 9시 팀 미팅 → 10-12시 투자자 미팅 → 오후 1-3시 애널리스트 리포트 분석 → 3-4시 실적 자료 작성 → 4-6시 경영진 보고',
            weeklyRoutine: '월: 주간 증시 전망 | 화: 투자자 미팅 | 수: 경쟁사 동향 분석 | 목: 실적 자료 리뷰 | 금: 주간 IR 활동 보고',
            collaboration: '팀 내부: 블룸버그 단말기와 이메일 공유 | 타 부서: 재무/기획팀과 실적 데이터 공유 | 외부: 투자자 및 애널리스트와 소통',
            toolsUsed: ['Bloomberg', 'Excel', 'PowerPoint', 'Zoom'],
            painPoints: [
                '투자자 질문에 즉각 대응하기 위해 데이터 찾느라 시간 걸림',
                '시장 동향 리포트가 너무 많아서 다 읽기 어려움',
                '실적 발표 자료 만들 때 디자인/데이터 시각화에 시간 많이 씀'
            ],
            automationNeeds: [
                '투자자 예상 질문 답변 자동 생성 (AI)',
                '시장 뉴스/리포트 자동 요약',
                '실적 데이터 시각화 자동화'
            ],
            workStructure: {
                level: '반구조화',
                description: '투자자 응대는 비정형적이나 실적 발표는 정형적. 시장 상황에 따라 유동적 대응 필요. 정보 수집과 분석이 핵심.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'AI가 투자자 심리를 파악할 수 있을지',
                '보안 때문에 내부 정보를 AI에 넣기 꺼려짐',
                '워크샵에서 배운 툴이 블룸버그보다 좋을지 의문'
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
            promotionReason: '대규모 클라우드 마이그레이션 프로젝트 성공. MSA 아키텍처 도입으로 시스템 안정성 향상',
            leadershipStyle: '기술 리더십, 코드 품질 중시, 애자일 스크럼'
        },
        team: {
            size: 15,
            seniorCount: 5,
            juniorCount: 10,
            composition: '팀장 1명 + 백엔드 6명 + 프론트엔드 4명 + DevOps 4명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 8명 + Advanced 7명'
        },
        work: {
            mainTasks: [
                '클라우드 기반 애플리케이션 개발',
                'MSA 아키텍처 설계 및 구축',
                'CI/CD 파이프라인 운영',
                '시스템 모니터링 및 장애 대응',
                '코드 리뷰 및 기술 부채 관리'
            ],
            dailyWorkflow: '오전 9:30 출근 → 10시 데일리 스크럼 → 10:30-12시 코드 리뷰 → 오후 1-3시 아키텍처 회의 → 3-5시 개발 집중 시간 → 5-6시 장애 대응 회고',
            weeklyRoutine: '월: 스프린트 플래닝 | 화: 아키텍처 리뷰 | 수: 기술 세미나 | 목: 코드 품질 점검 | 금: 스프린트 리뷰/회고',
            collaboration: '팀 내부: Jira, Slack, GitHub으로 협업 | 타 부서: 기획/디자인팀과 요구사항 협의 | 외부: 클라우드 벤더(AWS/Azure)와 기술 지원',
            toolsUsed: ['AWS', 'Kubernetes', 'Jenkins', 'GitHub', 'Jira', 'Slack', 'IntelliJ'],
            painPoints: [
                '회의가 너무 많아서 개발할 시간이 부족함 (팀장)',
                '주니어 코드 품질이 들쭉날쭉해서 리뷰에 시간 많이 씀',
                '장애 발생 시 원인 파악에 시간이 걸림'
            ],
            automationNeeds: [
                'AI 기반 코드 자동 리뷰 및 리팩토링 제안',
                '회의록 자동 요약 및 액션 아이템 추출',
                '장애 로그 자동 분석 및 원인 추적'
            ],
            workStructure: {
                level: '고도구조화',
                description: '애자일 방법론(스크럼) 적용. Jira로 태스크 관리, GitHub로 코드 관리. CI/CD로 배포 자동화. 프로세스 매우 명확.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                '이미 자동화 많이 되어 있는데 더 할게 있을까',
                'AI 코딩 툴(Copilot 등) 도입하고 싶은데 보안 규정 때문에 막혀있음',
                '워크샵이 개발자 눈높이에 맞을지 걱정'
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
            promotionReason: '전사 보안 관제 시스템 고도화로 해킹 시도 방어율 99.9% 달성. 보안 인증(ISMS) 획득 주도',
            leadershipStyle: '보안 제일, 원칙 준수, 24시간 모니터링'
        },
        team: {
            size: 12,
            seniorCount: 5,
            juniorCount: 7,
            composition: '팀장 1명 + 보안 관제 6명 + 보안 정책 3명 + 모의해킹 2명',
            digitalMaturity: 'Expert',
            maturityDistribution: 'Expert 6명 + Advanced 6명'
        },
        work: {
            mainTasks: [
                '24시간 보안 관제 및 침해 대응',
                '보안 정책 수립 및 감사',
                '취약점 점검 및 모의해킹',
                '임직원 보안 교육',
                '보안 솔루션 운영 (방화벽, IPS 등)'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 밤사이 보안 이벤트 확인 → 10시 팀 미팅 → 11-12시 보안 정책 검토 → 오후 1-3시 침해 사고 분석 → 3-4시 보안 솔루션 점검 → 4-6시 일일 보안 리포트',
            weeklyRoutine: '월: 주간 보안 이슈 리뷰 | 화: 취약점 점검 결과 분석 | 수: 보안 교육 자료 제작 | 목: 보안 감사 준비 | 금: 주간 보안 동향 보고',
            collaboration: '팀 내부: SIEM(통합보안관제)과 보안 메신저 사용 | 타 부서: 전사 IT팀과 보안 패치 협의 | 외부: KISA 및 보안 업체와 정보 공유',
            toolsUsed: ['Splunk', 'Wireshark', 'Kali Linux', 'Jira', 'Confluence'],
            painPoints: [
                '보안 로그가 너무 많아서 진짜 위협을 찾기 어려움 (오탐 많음)',
                '임직원들이 보안 정책 불편해해서 민원 많음',
                '최신 해킹 기법 따라가기 벅참'
            ],
            automationNeeds: [
                'AI 기반 보안 위협 자동 탐지 및 대응 (SOAR)',
                '보안 로그 자동 분석 및 리포팅',
                '임직원 보안 문의 자동 응대'
            ],
            workStructure: {
                level: '고도구조화',
                description: '보안 규정과 절차 매우 엄격. 침해 대응 매뉴얼 존재. 24시간 교대 근무(관제). 시스템 의존도 높음.'
            }
        },
        expectedBehavior: {
            initialAttitude: '회의적',
            concerns: [
                '외부 AI 툴 사용은 보안 위규라 절대 불가',
                '폐쇄망 환경이라 클라우드 기반 툴 사용 어려움',
                '워크샵에서 보안 고려 안한 툴 추천하면 반발할 듯'
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
            promotionReason: '그룹 ESG 경영 체계 수립 및 글로벌 평가 등급 상향. 지속가능경영 보고서 발간 주도',
            leadershipStyle: '비전 제시, 글로벌 감각, 이해관계자 소통'
        },
        team: {
            size: 6,
            seniorCount: 3,
            juniorCount: 3,
            composition: '팀장 1명 + 환경(E) 담당 2명 + 사회(S) 담당 2명 + 지배구조(G) 담당 1명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Expert 1명 + Advanced 3명 + Intermediate 2명'
        },
        work: {
            mainTasks: [
                '그룹 ESG 경영 전략 수립',
                '지속가능경영 보고서 발간',
                '글로벌 ESG 평가 대응 (DJSI, MSCI)',
                '탄소중립 로드맵 실행 관리',
                '사회공헌 프로그램 기획'
            ],
            dailyWorkflow: '오전 9시 출근 → 9:30 글로벌 ESG 뉴스 모니터링 → 10시 팀 미팅 → 11-12시 보고서 작성 → 오후 1-3시 계열사 ESG 담당자 회의 → 3-4시 평가 기관 대응 → 4-6시 경영진 보고',
            weeklyRoutine: '월: 주간 ESG 이슈 점검 | 화: 보고서 진도 체크 | 수: 계열사 협의체 | 목: 평가 대응 전략 | 금: 주간 활동 보고',
            collaboration: '팀 내부: Teams와 이메일로 자료 공유 | 타 부서: 전 계열사 ESG 팀과 협업 | 외부: 평가 기관 및 컨설팅사와 소통',
            toolsUsed: ['Excel', 'PowerPoint', 'Teams', 'ESG 데이터 플랫폼'],
            painPoints: [
                '계열사별 ESG 데이터를 취합하는데 기준이 달라서 애먹음',
                '글로벌 평가 기준이 매년 바뀌어서 대응하기 힘듦',
                '보고서 작성에 너무 많은 시간 소요 (디자인, 번역 등)'
            ],
            automationNeeds: [
                'ESG 데이터 자동 수집 및 표준화',
                '글로벌 평가 기준 변경 자동 알림 및 분석',
                '보고서 초안 자동 작성'
            ],
            workStructure: {
                level: '반구조화',
                description: '전략 수립은 비정형적이나 데이터 취합은 정형적. 글로벌 기준에 따라 업무 변화 많음. 협업 대상이 매우 광범위.'
            }
        },
        expectedBehavior: {
            initialAttitude: '기대함',
            concerns: [
                'ESG 데이터 관리에 AI 도입하면 효율적일 듯',
                '글로벌 트렌드 파악에 도움 될지',
                '워크샵에서 배운 내용을 계열사에 전파할 수 있을지'
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
            yearsInRole: 1,
            previousRole: '서비스 기획자',
            promotionReason: '신규 서비스 런칭 성공',
            leadershipStyle: '창의적, 자유로운 분위기'
        },
        team: {
            size: 8,
            seniorCount: 2,
            juniorCount: 6,
            composition: '팀장 1명 + 기획자 5명 + 디자이너 2명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 4명 + Intermediate 4명'
        },
        work: {
            mainTasks: ['신규 서비스 기획', 'UI/UX 설계', '시장 조사', '데이터 분석'],
            dailyWorkflow: '기획 회의 -> 디자인 리뷰 -> 개발팀 협의',
            weeklyRoutine: '주간 기획 회의',
            collaboration: 'Figma, Jira, Slack',
            toolsUsed: ['Figma', 'Jira', 'Slack'],
            painPoints: ['일정 압박', '잦은 기획 변경'],
            automationNeeds: ['시장 조사 자동화', '회의록 요약'],
            workStructure: { level: '반구조화', description: '창의적 업무 위주' }
        },
        expectedBehavior: { initialAttitude: '기대함', concerns: [], dropoutRisk: 10 },
        personality: { patience: 7, techSavvy: 9, changeResistance: 'low', learningSpeed: 'fast' }
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
            promotionReason: '디자인 시스템 구축',
            leadershipStyle: '디테일 중시'
        },
        team: {
            size: 6,
            seniorCount: 1,
            juniorCount: 5,
            composition: '팀장 1명 + 디자이너 5명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 6명'
        },
        work: {
            mainTasks: ['UX 리서치', 'UI 디자인', '프로토타이핑'],
            dailyWorkflow: '디자인 시안 작업 -> 리뷰',
            weeklyRoutine: '디자인 크리틱',
            collaboration: 'Figma, Zeplin',
            toolsUsed: ['Figma', 'Adobe XD'],
            painPoints: ['반복적인 수정 작업'],
            automationNeeds: ['디자인 에셋 관리 자동화'],
            workStructure: { level: '반구조화', description: '디자인 중심' }
        },
        expectedBehavior: { initialAttitude: '기대함', concerns: [], dropoutRisk: 5 },
        personality: { patience: 8, techSavvy: 9, changeResistance: 'low', learningSpeed: 'fast' }
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
            promotionReason: '원가 절감 기여',
            leadershipStyle: '협상 중시'
        },
        team: {
            size: 10,
            seniorCount: 4,
            juniorCount: 6,
            composition: '팀장 1명 + 구매 담당 9명',
            digitalMaturity: 'Intermediate',
            maturityDistribution: 'Intermediate 10명'
        },
        work: {
            mainTasks: ['원자재 구매', '공급사 관리', '단가 협상'],
            dailyWorkflow: '발주 처리 -> 공급사 미팅',
            weeklyRoutine: '주간 구매 현황 점검',
            collaboration: 'SAP, 이메일',
            toolsUsed: ['SAP', 'Excel'],
            painPoints: ['공급망 이슈 대응'],
            automationNeeds: ['발주 자동화', '시황 분석'],
            workStructure: { level: '고도구조화', description: '절차 중심' }
        },
        expectedBehavior: { initialAttitude: '중립', concerns: [], dropoutRisk: 15 },
        personality: { patience: 8, techSavvy: 5, changeResistance: 'medium', learningSpeed: 'medium' }
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
            promotionReason: '브랜드 캠페인 성공',
            leadershipStyle: '트렌디함'
        },
        team: {
            size: 7,
            seniorCount: 2,
            juniorCount: 5,
            composition: '팀장 1명 + 마케터 6명',
            digitalMaturity: 'Advanced',
            maturityDistribution: 'Advanced 7명'
        },
        work: {
            mainTasks: ['브랜드 전략', '광고 집행', 'SNS 운영'],
            dailyWorkflow: '콘텐츠 기획 -> 광고 성과 확인',
            weeklyRoutine: '주간 브랜드 지표 점검',
            collaboration: 'Slack, Notion',
            toolsUsed: ['Instagram', 'YouTube', 'Excel'],
            painPoints: ['트렌드 변화 속도'],
            automationNeeds: ['소셜 리스닝', '콘텐츠 생성'],
            workStructure: { level: '반구조화', description: '크리에이티브 중심' }
        },
        expectedBehavior: { initialAttitude: '기대함', concerns: [], dropoutRisk: 5 },
        personality: { patience: 7, techSavvy: 9, changeResistance: 'low', learningSpeed: 'fast' }
    }
];
