'use client';

import { useState } from 'react';

interface Step8WorkflowEducationProps {
  onNext: () => void;
  onBack: () => void;
}

interface WorkflowStep {
  id: number;
  name: string;
  title: string;
  role: 'human' | 'ai' | 'together';
}

// Department-specific workflow templates
const DEPARTMENT_WORKFLOWS = {
  marketing: {
    title: '📢 Marketing: SNS 캠페인 기획 및 실행',
    icon: '📢',
    steps: [
      { id: 1, title: '타겟 리서치', name: '경쟁사 SNS 분석, 타겟 오디언스 트렌드 조사, 키워드 리서치를 수행하고 인사이트 문서 작성', role: 'human' as const },
      { id: 2, title: '컨셉 개발', name: '캠페인 메시지 10개 아이디어 브레인스토밍, 브랜드 톤앤매너 적용, 최종 3개 컨셉 선정', role: 'human' as const },
      { id: 3, title: '콘텐츠 제작', name: '선정된 컨셉 기반 카피라이팅, 비주얼 콘셉 시안 제작, A/B 테스트용 변형 버전 제작', role: 'human' as const },
      { id: 4, title: '일정 최적화', name: '게시 시간대 분석, 30일 콘텐츠 캘린더 작성, 각 채널별 포맷 조정 및 예약 설정', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "경쟁사 SNS를 하나씩 방문해서 인기 게시물 스크린샷, 댓글 반응 메모, 트렌드 키워드를 수기로 정리합니다.", risk: "⏳ 수동 조사로 3-4시간 소요" },
        together: { situation: "AI에게 '경쟁사 A, B, C의 최근 인기 게시물 트렌드를 분석해줘'라고 요청합니다. AI가 제공한 키워드 리스트를 검토하고, 우리 브랜드에 맞는 3-5개를 직접 선택합니다.", risk: "💡 AI 데이터의 출처 확인 필요" },
        ai: { situation: "소셜 리스닝 도구가 자동으로 경쟁사 및 업계 트렌드를 수집하고, AI가 주요 키워드와 인사이트를 요약해 대시보드에 표시합니다.", risk: "⚠️ 브랜드 맥락 없는 기계적 분석" }
      },
      2: {
        human: { situation: "회의실에 모여 화이트보드에 아이디어를 쓰고, 팀원들과 투표로 좁혀갑니다.", risk: "💭 창의적이지만 시간 소모적" },
        together: { situation: "AI에게 타겟 정보를 입력하면 AI가 20개 메시지 초안을 생성합니다. 팀이 검토하며 3개 선택 후 직접 다듬습니다.", risk: "💡 AI 제안이 브랜드 톤과 맞지 않을 수 있음" },
        ai: { situation: "AI가 과거 성과 데이터를 학습해 높은 참여율이 예상되는 메시지를 자동 생성합니다.", risk: "⚠️ 독창성 부족, 경쟁사와 유사" }
      },
      3: {
        human: { situation: "카피라이터가 직접 텍스트를 작성하고, 디자이너가 시안을 제작합니다.", risk: "⏳ 고품질이지만 5-7일 소요" },
        together: { situation: "AI가 카피 초안 3개와 이미지 프롬프트를 제공하고, 디자이너가 이를 참고해 비주얼을 만듭니다.", risk: "💡 AI 생성 이미지의 저작권 확인 필요" },
        ai: { situation: "AI가 자동으로 카피와 이미지를 생성하고, A/B 테스트 버전까지 만듭니다.", risk: "⚠️ 브랜드 일관성 저하 가능성" }
      },
      4: {
        human: { situation: "과거 데이터를 직접 분석해 최적 시간을 찾고, 각 채널에 로그인해서 하나씩 예약합니다.", risk: "⏳ 반복 작업으로 1-2시간 소요" },
        together: { situation: "AI에게 최적 게시 시간 추천을 요청하고, 회사 이벤트를 고려해 일부 조정합니다.", risk: "💡 AI가 특정 이벤트를 모를 수 있음" },
        ai: { situation: "소셜 미디어 관리 툴이 자동으로 최적 시간을 계산하고 예약까지 완료합니다.", risk: "⚠️ 예상치 못한 이슈 발생 시 대응 불가" }
      }
    }
  },
  sales: {
    title: '💼 Sales: 신규 리드 발굴 및 첫 접촉',
    icon: '💼',
    steps: [
      { id: 1, title: '리드 수집', name: 'LinkedIn, 전시회, 웹사이트 문의 등에서 잠재 고객 정보 수집', role: 'human' as const },
      { id: 2, title: '고객 사전조사', name: '각 리드의 회사 규모, 업종, 최근 뉴스, 의사결정권자 파악', role: 'human' as const },
      { id: 3, title: '첫 접촉 이메일', name: '맞춤형 첫 인사 이메일 작성', role: 'human' as const },
      { id: 4, title: '후속 관리', name: '미팅 일정 조율, CRM 입력, 다음 액션 설정', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "LinkedIn에서 타겟 직군을 검색해 하나씩 프로필 확인하고 엑셀에 수기 입력합니다.", risk: "⏳ 100명 리스트 만드는데 반나절 소요" },
        together: { situation: "LinkedIn Sales Navigator에서 필터를 설정하고, AI가 추천하는 리드 리스트를 검토합니다.", risk: "💡 AI가 잘못 읽은 정보 확인 필요" },
        ai: { situation: "리드 생성 도구가 자동으로 ICP와 일치하는 기업을 찾아 CRM에 자동 입력합니다.", risk: "⚠️ GDPR 위반 가능성, 법적 검토 필수" }
      },
      2: {
        human: { situation: "각 리드의 회사 웹사이트를 방문해 사업 내용을 읽고 메모합니다.", risk: "💭 깊이 있는 조사 가능하지만 리드 1명당 30분 소요" },
        together: { situation: "AI에게 '이 회사의 주요 사업, 최근 뉴스를 요약해줘'라고 요청하고, 중요 부분은 직접 확인합니다.", risk: "💡 AI가 오래된 정보 제공 가능" },
        ai: { situation: "세일즈 인텔리전스 툴이 자동으로 기업 정보를 수집해 요약 리포트를 생성합니다.", risk: "⚠️ 피상적인 정보, 관계 기반 영업에 부족" }
      },
      3: {
        human: { situation: "각 리드의 특성에 맞춰 이메일을 한 통씩 직접 작성합니다.", risk: "💭 높은 응답률, 하지만 50명에게 5-6시간 소요" },
        together: { situation: "AI에게 고객 정보를 입력하면 초안을 생성하고, 기존 관계나 맥락을 추가로 반영합니다.", risk: "💡 AI 문구가 너무 형식적일 수 있음" },
        ai: { situation: "세일즈 자동화 툴이 리드 정보 기반으로 자동 이메일을 생성·발송합니다.", risk: "⚠️ 대량 발송으로 스팸 처리 가능성" }
      },
      4: {
        human: { situation: "고객 응답을 확인하고, 캘린더를 직접 확인하며 가능한 시간대를 이메일로 제안합니다.", risk: "⏳ 일정 조율만 2-3회 이메일 왕복" },
        together: { situation: "Calendly 링크를 보내고, AI가 미팅 녹음을 텍스트로 변환합니다. 요약본을 검토하고 CRM에 입력합니다.", risk: "💡 미팅 녹음 시 고객 동의 필수" },
        ai: { situation: "AI 어시스턴트가 자동으로 일정 조율, 미팅 내용 요약, CRM 입력까지 처리합니다.", risk: "⚠️ 고객이 기계와 대화하는 느낌" }
      }
    }
  },
  operations: {
    title: '⚙️ Operations: 재고 관리 및 발주',
    icon: '⚙️',
    steps: [
      { id: 1, title: '재고 현황 파악', name: '창고 순회하며 재고 확인, 바코드 스캔', role: 'human' as const },
      { id: 2, title: '수요 예측', name: '지난 3개월 판매 데이터 분석, 다음 달 필요 재고량 계산', role: 'human' as const },
      { id: 3, title: '발주 계획', name: '공급업체별 리드타임, 단가 고려하여 발주서 작성', role: 'human' as const },
      { id: 4, title: '발주 실행', name: '각 공급업체에 발주, ERP 시스템에 입력', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "창고를 직접 돌며 재고를 세고, 바코드로 읽어 엑셀에 수기 입력합니다.", risk: "⏳ 창고 규모에 따라 반나절~하루 소요" },
        together: { situation: "바코드 스캐너가 자동으로 ERP에 전송하고, AI가 이상치를 플래그하면 담당자가 확인합니다.", risk: "💡 스캐너 오작동 시 데이터 누락" },
        ai: { situation: "RFID 태그가 자동으로 재고를 실시간 추적하고 대시보드에 업데이트합니다.", risk: "⚠️ RFID 인프라 구축 비용 높음" }
      },
      2: {
        human: { situation: "엑셀에서 판매 데이터를 정렬하고 피벗 테이블로 평균 판매량을 계산합니다.", risk: "💭 경험 기반의 정확한 예측 가능" },
        together: { situation: "AI에게 수요 예측을 요청하고, 예정된 프로모션이나 외부 요인을 반영해 조정합니다.", risk: "💡 AI가 특정 이벤트를 모를 수 있음" },
        ai: { situation: "머신러닝 모델이 과거 데이터와 외부 요인을 학습하여 자동으로 수요를 예측합니다.", risk: "⚠️ 급격한 시장 변화 대응 느림" }
      },
      3: {
        human: { situation: "각 공급업체의 가격표를 확인하고, 수기로 발주 계획을 작성합니다.", risk: "💭 공급업체 관계 고려한 전략적 판단 가능" },
        together: { situation: "AI가 초기 발주안을 생성하고, 담당자가 공급업체 관계, 품질 이슈 등을 반영해 조정합니다.", risk: "💡 AI가 최신 협상 내용을 모를 수 있음" },
        ai: { situation: "ERP가 자동으로 최적 발주량과 공급업체를 계산하고 발주 계획을 생성합니다.", risk: "⚠️ 공급업체 관계 유지 전략 반영 어려움" }
      },
      4: {
        human: { situation: "각 공급업체에 전화나 이메일로 발주하고 ERP에 수기로 입력합니다.", risk: "⏳ 공급업체 10곳이면 2-3시간 소요" },
        together: { situation: "ERP에서 발주서를 자동 생성하고, 중요 품목만 전화로 확인하며 납기를 최종 확정합니다.", risk: "💡 공급업체가 자동 이메일을 놓칠 수 있음" },
        ai: { situation: "ERP가 자동으로 발주서를 생성·발송하고, 공급업체 시스템과 API 연동하여 납기를 자동 확인합니다.", risk: "⚠️ 공급업체 시스템 장애 시 중단" }
      }
    }
  },
  rnd: {
    title: '🔬 R&D: 신제품 프로토타입 실험',
    icon: '🔬',
    steps: [
      { id: 1, title: '실험 설계', name: '가설 설정, 변수 정의, 실험 프로토콜 작성', role: 'human' as const },
      { id: 2, title: '실험 수행', name: '프로토콜에 따라 실험 진행, 데이터 측정 및 기록', role: 'human' as const },
      { id: 3, title: '데이터 분석', name: '수집 데이터 정리, 통계 분석, 유의성 검증', role: 'human' as const },
      { id: 4, title: '결과 리포트', name: '실험 결과 정리하여 기술 보고서 작성', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "연구원이 문헌 조사를 통해 선행 연구를 검토하고, 연구 노트에 가설과 실험 단계를 수기로 작성합니다.", risk: "💭 깊이 있는 과학적 사고 가능, 하지만 설계에 2-3일 소요" },
        together: { situation: "AI에게 '이 가설을 검증하기 위한 실험 프로토콜 초안을 작성해줘'라고 요청하고, 장비 제약과 안전성을 반영해 수정합니다.", risk: "💡 AI가 최신 방법론이나 장비 사양을 모를 수 있음" },
        ai: { situation: "실험 설계 소프트웨어가 과거 실험 DB를 학습하여 자동으로 최적 프로토콜을 생성합니다.", risk: "⚠️ 혁신적이거나 전례 없는 실험은 설계 불가" }
      },
      2: {
        human: { situation: "연구원이 직접 실험 장비를 조작하고, 측정 시점마다 수치를 연구 노트에 기록합니다.", risk: "💭 유연한 대응 가능, 하지만 24시간 모니터링 불가" },
        together: { situation: "IoT 센서가 자동으로 측정해 클라우드에 전송하고, AI가 이상치를 탐지하면 연구원이 확인합니다.", risk: "💡 센서 오작동 시 잘못된 데이터 수집" },
        ai: { situation: "자동화 실험 장비가 로봇 암으로 시약을 분주하고, 센서가 자동 측정하며, 실험 전체를 무인으로 진행합니다.", risk: "⚠️ 장비 고장 시 실험 실패" }
      },
      3: {
        human: { situation: "엑셀에 실험 데이터를 입력하고, SPSS나 R로 통계 분석을 직접 수행합니다.", risk: "💭 통계적 엄밀성 확보 가능, 하지만 분석에 1-2일 소요" },
        together: { situation: "AI에게 데이터 파일을 업로드하고 t-test 분석을 요청합니다. AI가 생성한 결과를 검토하고 데이터 품질을 확인합니다.", risk: "💡 AI가 적절한 통계 방법을 잘못 선택할 수 있음" },
        ai: { situation: "AI가 자동으로 데이터를 정리하고 통계 방법을 선택하여 분석 리포트를 자동 생성합니다.", risk: "⚠️ 데이터 이상치나 실험 오류를 간과할 가능성" }
      },
      4: {
        human: { situation: "연구원이 실험 목적, 방법, 결과, 결론을 직접 작성하고 동료 검토를 거쳐 최종 수정합니다.", risk: "💭 높은 품질, 하지만 작성에 3-5일 소요" },
        together: { situation: "AI에게 결과 섹션 초안 작성을 요청하고, 연구원이 과학적 해석, 선행 연구 비교, 한계점을 추가합니다.", risk: "💡 AI가 잘못된 인과관계를 주장할 수 있음" },
        ai: { situation: "AI가 실험 데이터, 그래프, 통계 결과를 자동으로 통합하여 표준 형식의 보고서를 생성합니다.", risk: "⚠️ 과학적 통찰이나 혁신적 해석 부족" }
      }
    }
  },
  hr: {
    title: '👥 HR: 신규 인력 채용 프로세스',
    icon: '👥',
    steps: [
      { id: 1, title: '채용 공고 작성', name: '직무 요구사항 정리하여 채용 공고문 작성 및 게시', role: 'human' as const },
      { id: 2, title: '지원자 선별', name: '접수된 이력서 검토, 1차 서류 합격자 선정', role: 'human' as const },
      { id: 3, title: '면접 진행', name: '면접 일정 조율, 면접 진행 및 평가표 작성', role: 'human' as const },
      { id: 4, title: '최종 선발', name: '면접 평가 취합, 처우 협의, 합격 통보', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "HR 담당자가 채용 부서 팀장과 미팅하여 직무 내용을 듣고, 워드로 공고문을 직접 작성합니다.", risk: "⏳ 공고 작성 및 게시에 2-3시간 소요" },
        together: { situation: "AI에게 직무 요구사항을 입력하면 공고 초안을 생성하고, HR이 회사 문화와 복리후생을 추가합니다.", risk: "💡 AI 생성 공고가 너무 형식적일 수 있음" },
        ai: { situation: "ATS가 직무 요구사항을 입력받아 자동으로 공고를 생성하고, 연동된 모든 채용 사이트에 동시 게시합니다.", risk: "⚠️ 획일적인 공고로 우수 인재 어필 어려움" }
      },
      2: {
        human: { situation: "HR 담당자가 이력서를 하나씩 열어보며 학력, 경력, 자격증을 확인하고 엑셀에 평가 점수를 입력합니다.", risk: "💭 지원자의 잠재력 파악 가능, 하지만 100명 검토 시 반나절 소요" },
        together: { situation: "AI가 이력서를 파싱하여 매칭률을 계산하고, HR은 상위 50명만 직접 검토하며 독특한 경험이 있는 지원자를 추가 선발합니다.", risk: "💡 AI가 비전통적 경력을 저평가할 수 있음" },
        ai: { situation: "ATS가 자동으로 이력서를 스크리닝하고, 머신러닝으로 합격 가능성을 예측하여 상위 지원자를 자동 선발합니다.", risk: "⚠️ 편향 강화 가능성, 다양성 저해" }
      },
      3: {
        human: { situation: "HR이 각 지원자에게 이메일로 가능한 면접 시간을 문의하고, 면접관 일정을 확인하여 수기로 조율합니다.", risk: "⏳ 일정 조율만 지원자당 2-3회 이메일 왕복" },
        together: { situation: "Calendly로 지원자가 시간을 선택하게 하고, AI가 면접 질문 초안을 생성합니다. 면접관이 질문을 검토·수정합니다.", risk: "💡 면접 녹음 시 지원자 동의 필수" },
        ai: { situation: "AI가 자동으로 일정을 조율하고 면접 질문을 생성하며, 화상 면접 중 지원자 답변을 분석하여 역량 점수를 실시간 계산합니다.", risk: "⚠️ 지원자가 기계 평가에 거부감" }
      },
      4: {
        human: { situation: "HR이 각 면접관의 평가표를 수집하여 엑셀에 입력하고 점수를 합산합니다. 최종 후보자와 전화로 연봉 협상을 합니다.", risk: "💭 개인화된 소통 가능, 하지만 처리에 1-2일 소요" },
        together: { situation: "AI가 면접 평가 데이터를 자동 집계하고 순위를 매깁니다. HR이 상위 후보자에게 처우를 협의하고, AI 생성 이메일 템플릿에 개인화 메시지를 추가합니다.", risk: "💡 AI 평가가 정성적 요소를 놓칠 수 있음" },
        ai: { situation: "시스템이 자동으로 평가를 집계하고 최종 합격자를 선정하며, 표준 연봉 밴드 내에서 처우를 제안합니다.", risk: "⚠️ 우수 인재 영입 시 유연한 협상 불가" }
      }
    }
  },
  finance: {
    title: '💰 Finance: 월간 재무 결산 및 보고',
    icon: '💰',
    steps: [
      { id: 1, title: '거래 데이터 수집', name: '은행 거래 내역, 법인카드 사용 내역 수집 및 입력', role: 'human' as const },
      { id: 2, title: '계정 분류', name: '각 거래를 계정과목으로 분류하고 증빙 서류 첨부', role: 'human' as const },
      { id: 3, title: '재무제표 작성', name: '손익계산서, 재무상태표 작성 및 증감 분석', role: 'human' as const },
      { id: 4, title: '경영진 보고', name: '주요 재무 지표 요약, 보고서 작성 및 발표', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "회계 담당자가 은행 사이트에 로그인하여 거래 내역을 엑셀로 다운로드하고, 세금계산서는 이메일에서 하나씩 저장합니다.", risk: "⏳ 다수의 계좌와 카드가 있으면 반나절 소요" },
        together: { situation: "회계 시스템이 은행 및 카드사 API를 통해 자동으로 거래 내역을 가져오고, 회계 담당자는 분류가 애매한 항목만 직접 확인합니다.", risk: "💡 API 연동 오류 시 일부 거래 누락 가능" },
        ai: { situation: "회계 시스템이 자동으로 모든 금융 계좌에서 거래를 수집하고, OCR로 세금계산서를 스캔하여 데이터를 추출합니다.", risk: "⚠️ OCR 인식 오류로 금액 오기입 가능성" }
      },
      2: {
        human: { situation: "회계 담당자가 각 거래 내역을 보며 계정과목을 직접 판단하여 분류합니다. 애매한 경우 영수증을 찾아 확인합니다.", risk: "💭 정확한 분류 가능, 하지만 500건 거래 시 2-3일 소요" },
        together: { situation: "AI가 거래 패턴을 학습하여 자동으로 계정과목을 제안하고, 회계 담당자는 AI의 제안을 검토하고 틀린 분류를 수정합니다.", risk: "💡 신규 거래 유형은 AI가 잘못 분류할 수 있음" },
        ai: { situation: "AI가 과거 분류 패턴을 학습하여 자동으로 모든 거래를 계정과목에 배정하고, 증빙 서류를 OCR로 읽어 자동 첨부합니다.", risk: "⚠️ 특수한 거래를 잘못 분류할 위험" }
      },
      3: {
        human: { situation: "회계 담당자가 분류된 데이터를 기반으로 엑셀 템플릿에 수동으로 입력하여 재무제표를 작성합니다.", risk: "💭 정확한 분석 가능, 하지만 작성에 1-2일 소요" },
        together: { situation: "회계 시스템이 자동으로 재무제표를 생성하고, AI가 전월 대비 큰 변동 항목을 플래그합니다. 담당자는 플래그된 항목의 원인을 파악합니다.", risk: "💡 AI가 정상적인 계절성 변동을 이슈로 플래그할 수 있음" },
        ai: { situation: "회계 시스템이 자동으로 재무제표를 작성하고, 전월·전년 대비 분석, 주요 증감 원인까지 텍스트로 생성합니다.", risk: "⚠️ 숫자는 정확하지만 경영적 해석 부족" }
      },
      4: {
        human: { situation: "CFO가 재무제표를 검토하고, 주요 지표를 PPT로 시각화합니다. 이슈 사항을 설명하는 슬라이드를 직접 작성하고 경영진에게 발표합니다.", risk: "💭 깊이 있는 통찰 제공 가능, 하지만 준비에 1일 소요" },
        together: { situation: "AI가 재무 데이터를 기반으로 보고서 초안을 생성하고, CFO가 경영 전략적 관점에서 해석을 추가하고 다음 달 전망을 보완합니다.", risk: "💡 AI 차트가 경영진의 관심사와 맞지 않을 수 있음" },
        ai: { situation: "AI가 자동으로 경영진 대시보드를 업데이트하고, 주요 지표의 변동 원인을 텍스트로 요약하여 이메일로 자동 발송합니다.", risk: "⚠️ 전략적 의사결정을 위한 심층 분석 부족" }
      }
    }
  },
  it: {
    title: '💻 IT: 시스템 장애 대응 및 복구',
    icon: '💻',
    steps: [
      { id: 1, title: '장애 감지', name: '모니터링 알람 확인, 사용자 문의 접수, 장애 범위 파악', role: 'human' as const },
      { id: 2, title: '원인 분석', name: '로그 분석, 시스템 상태 점검, 장애 원인 특정', role: 'human' as const },
      { id: 3, title: '긴급 복구', name: '서비스 재시작, 백업 전환, 임시 패치 적용', role: 'human' as const },
      { id: 4, title: '사후 보고', name: '장애 원인, 복구 과정, 재발 방지 대책 보고서 작성', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "IT 담당자가 모니터링 대시보드를 주기적으로 확인하고, 사용자 문의 이메일/전화를 받아 장애 여부를 판단합니다.", risk: "⏳ 야간·주말 장애 시 인지 지연" },
        together: { situation: "모니터링 시스템이 자동으로 이상 지표를 감지하여 알람을 보내고, IT 담당자는 심각도를 평가하여 긴급 대응 여부를 결정합니다.", risk: "💡 오탐으로 불필요한 야간 호출 가능성" },
        ai: { situation: "AI 기반 모니터링이 패턴을 학습하여 장애를 자동 감지하고, 심각도를 분류하며, 담당자에게 자동 알림을 보냅니다.", risk: "⚠️ 새로운 유형의 장애는 감지 못할 수 있음" }
      },
      2: {
        human: { situation: "IT 담당자가 서버에 SSH로 접속하여 로그 파일을 직접 열어보고, 에러 메시지를 검색합니다.", risk: "💭 정확한 원인 파악 가능, 하지만 복잡한 시스템은 분석에 수시간 소요" },
        together: { situation: "AI가 로그 파일을 자동 분석하여 에러 패턴을 추출하고 요약을 제공합니다. IT 담당자는 요약 정보를 기반으로 심층 분석합니다.", risk: "💡 AI가 표면적 증상만 보고 근본 원인을 놓칠 수 있음" },
        ai: { situation: "AI가 로그를 분석하고, 과거 유사 장애 사례를 검색하여 원인과 해결책을 자동 제안합니다.", risk: "⚠️ 복잡한 복합 장애는 오진 가능성" }
      },
      3: {
        human: { situation: "IT 담당자가 원인에 따라 서버를 재시작하거나 설정 파일을 수정합니다. 복구 후 수동으로 서비스 정상 여부를 확인합니다.", risk: "💭 상황에 맞는 유연한 대응 가능, 하지만 수동 작업으로 복구 시간 김" },
        together: { situation: "AI가 복구 절차를 제안하고, IT 담당자가 검토 후 승인 버튼을 누르면 자동화 스크립트가 복구를 실행합니다.", risk: "💡 잘못된 복구 절차 실행 시 상황 악화 가능" },
        ai: { situation: "AI가 자동으로 장애를 감지하고 원인을 분석하며, 사전 정의된 복구 스크립트를 실행하여 서비스를 자동 정상화합니다.", risk: "⚠️ 예상 밖 부작용 발생 가능" }
      },
      4: {
        human: { situation: "IT 담당자가 장애 발생 시각, 원인, 영향 범위, 복구 과정을 시간 순서대로 정리하고, 워드로 보고서를 작성합니다.", risk: "💭 상세한 보고서 작성 가능, 하지만 작성에 반나절 소요" },
        together: { situation: "AI가 장애 로그, 복구 기록을 자동으로 취합하여 사후 보고서 초안을 생성하고, IT 담당자가 근본 원인 분석과 재발 방지 대책을 추가합니다.", risk: "💡 AI가 기술적 사실만 나열, 경영진이 이해하기 어려울 수 있음" },
        ai: { situation: "AI가 자동으로 장애 타임라인, 영향 범위, 복구 시간을 정리하여 표준 템플릿 보고서를 생성하고, 관련 부서에 이메일로 발송합니다.", risk: "⚠️ 재발 방지를 위한 심층 분석 부족" }
      }
    }
  },
  strategy: {
    title: '🎯 Strategy: 신사업 기회 분석',
    icon: '🎯',
    steps: [
      { id: 1, title: '시장 조사', name: '타겟 시장 규모, 성장률, 주요 플레이어 조사', role: 'human' as const },
      { id: 2, title: '경쟁 분석', name: '경쟁사 제품·가격·마케팅 전략 분석, SWOT 분석', role: 'human' as const },
      { id: 3, title: '전략 수립', name: '진입 전략 및 3개년 로드맵 작성', role: 'human' as const },
      { id: 4, title: '사업 계획서', name: '시장 분석, 전략, 재무 계획 포함한 사업 계획서 작성', role: 'human' as const }
    ],
    scenarios: {
      1: {
        human: { situation: "전략 담당자가 산업 보고서, 통계청 자료를 구매하여 수동으로 읽고 정리합니다. 고객 인터뷰를 직접 수행하고 니즈를 파악합니다.", risk: "💭 깊이 있는 인사이트 가능, 하지만 조사에 2-3주 소요" },
        together: { situation: "AI에게 시장 규모와 주요 트렌드 요약을 요청하고, AI가 제공한 데이터를 검증하며 추가로 전문가 인터뷰를 직접 조사합니다.", risk: "💡 AI가 오래된 데이터나 출처 불명 정보 제공 가능" },
        ai: { situation: "AI가 자동으로 웹에서 시장 데이터를 크롤링하고, 뉴스 기사를 분석하며, 주요 지표를 요약한 보고서를 생성합니다.", risk: "⚠️ 데이터 신뢰성 낮음, 잘못된 전략 수립 가능성" }
      },
      2: {
        human: { situation: "전략 담당자가 경쟁사 웹사이트, 재무 보고서, 고객 리뷰를 직접 분석하고, SWOT 분석을 수행하며 전략적 포지셔닝을 고민합니다.", risk: "💭 전략적 통찰 가능, 하지만 분석에 1-2주 소요" },
        together: { situation: "AI에게 경쟁사 가격 정책과 주요 기능 비교 분석을 요청하고, 직접 경쟁사 제품을 테스트하며 차별화 포인트를 찾습니다.", risk: "💡 AI가 공개되지 않은 전략은 파악 못함" },
        ai: { situation: "AI가 경쟁사 웹사이트, 리뷰, SNS를 자동 분석하고, SWOT 분석 템플릿에 자동으로 정리합니다.", risk: "⚠️ 피상적 분석, 전략적 인사이트 부족" }
      },
      3: {
        human: { situation: "전략 팀이 워크샵을 통해 여러 진입 시나리오를 브레인스토밍하고, 각 시나리오의 리스크와 기회를 토론합니다.", risk: "💭 팀의 집단 지성 활용 가능, 하지만 수립에 1-2주 소요" },
        together: { situation: "AI에게 3가지 진입 전략 옵션 제안을 요청하고, 전략 팀이 회사의 역량과 비전에 맞춰 수정·보완합니다.", risk: "💡 AI가 회사 내부 역량이나 문화를 모르므로 실현 가능성 검토 필수" },
        ai: { situation: "AI가 시장 데이터와 경쟁 분석을 기반으로 자동으로 진입 전략과 로드맵을 생성합니다.", risk: "⚠️ 획기적이거나 창의적인 전략 부족" }
      },
      4: {
        human: { situation: "전략 담당자가 PPT로 사업 계획서를 직접 작성합니다. 시장 분석 차트, 전략 다이어그램, 재무 모델을 하나씩 만들고 스토리라인을 구성합니다.", risk: "💭 설득력 있는 보고서 작성 가능, 하지만 준비에 3-5일 소요" },
        together: { situation: "AI가 시장 데이터, 경쟁 분석, 전략을 자동으로 PPT로 정리하고, 전략 담당자가 핵심 메시지를 다듬고 리스크 관리 섹션을 추가합니다.", risk: "💡 AI가 만든 차트가 경영진의 선호와 맞지 않을 수 있음" },
        ai: { situation: "AI가 자동으로 사업 계획서를 생성하고, 표준 템플릿에 맞춰 시장 분석, 전략, 재무 계획을 정리합니다.", risk: "⚠️ 스토리텔링 부족, 경영진 설득력 낮음" }
      }
    }
  }
};

// Department Practice Section Component
type DeptStep = { id: number; title: string; name: string; role: 'human' | 'together' | 'ai' };

function DepartmentPracticeSection() {
  const [selectedDept, setSelectedDept] = useState<keyof typeof DEPARTMENT_WORKFLOWS>('marketing');
  const [deptSteps, setDeptSteps] = useState<DeptStep[]>(DEPARTMENT_WORKFLOWS.marketing.steps);

  const handleDeptChange = (dept: keyof typeof DEPARTMENT_WORKFLOWS) => {
    setSelectedDept(dept);
    setDeptSteps(DEPARTMENT_WORKFLOWS[dept].steps);
  };

  const updateDeptRole = (stepId: number, newRole: 'human' | 'together' | 'ai') => {
    setDeptSteps(deptSteps.map(s => s.id === stepId ? { ...s, role: newRole } : s));
  };

  const resetDeptWorkflow = () => {
    setDeptSteps(DEPARTMENT_WORKFLOWS[selectedDept].steps);
  };

  const getRoleIcon = (role: string) => {
    const icons = { human: '👤', together: '🤝', ai: '🤖' };
    return icons[role as keyof typeof icons];
  };

  const deptCounts = {
    ai: deptSteps.filter(s => s.role === 'ai').length,
    together: deptSteps.filter(s => s.role === 'together').length,
    human: deptSteps.filter(s => s.role === 'human').length
  };

  return (
    <div className="mb-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-300/50 rounded-full mb-4 shadow-md">
          <span className="text-xs font-bold text-white uppercase tracking-wider">🚀 부서별 심화 실습</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
          내 업무로 실전 연습하기
        </h2>
        <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
          위의 공통 예시로 프레임워크를 익혔다면, 이제 <span className="font-bold text-slate-900 bg-yellow-100/70 px-1 rounded">내 부서의 실제 업무</span>로 연습해보세요.<br />
          <span className="text-sm text-slate-500">8개 부서별 실전 시나리오를 제공합니다</span>
        </p>
      </div>

      {/* Guide Box */}
      <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-teal-50/80 to-emerald-50/80 rounded-2xl p-6 border-2 border-teal-200/50 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-1">💡</span>
          <div className="flex-1">
            <p className="font-bold text-teal-900 text-lg mb-2">왜 부서별 실습이 필요한가요?</p>
            <ul className="text-teal-900 space-y-1.5 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span><span className="font-bold">같은 프레임워크라도 업무 특성에 따라 적용 방식이 다릅니다.</span> Marketing은 창의성이 중요하고, Finance는 정확성이 중요하죠.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span><span className="font-bold">내 업무와 유사한 예시로 연습</span>하면 실제 팀에 적용하기 쉽습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span>아래에서 <span className="bg-teal-100 px-1 rounded font-semibold">내 부서를 선택</span>하고, 각 단계의 역할을 바꿔가며 최적의 조합을 찾아보세요.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Department Selection & Workflow */}
      <div className="bg-gradient-to-br from-white/90 to-emerald-50/40 backdrop-blur-xl border-2 border-emerald-200/40 rounded-3xl p-10 shadow-xl">
        {/* Department Selector */}
        <div className="mb-8">
          <label className="block text-lg font-bold text-slate-900 mb-4">부서를 선택하세요</label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(DEPARTMENT_WORKFLOWS) as Array<keyof typeof DEPARTMENT_WORKFLOWS>).map((dept) => (
              <button
                key={dept}
                onClick={() => handleDeptChange(dept)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                  selectedDept === dept
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-emerald-50 hover:shadow-lg'
                }`}
              >
                <span className="mr-2">{DEPARTMENT_WORKFLOWS[dept].icon}</span>
                {dept === 'marketing' && 'Marketing'}
                {dept === 'sales' && 'Sales'}
                {dept === 'operations' && 'Operations'}
                {dept === 'rnd' && 'R&D'}
                {dept === 'hr' && 'HR'}
                {dept === 'finance' && 'Finance'}
                {dept === 'it' && 'IT'}
                {dept === 'strategy' && 'Strategy'}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {DEPARTMENT_WORKFLOWS[selectedDept].title}
            </h3>
            <p className="text-base text-slate-600">
              각 단계의 역할을 선택하여 시나리오를 확인하세요
            </p>
          </div>
          <button
            onClick={resetDeptWorkflow}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            🔄 Reset
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="relative pl-16 mb-8">
          <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-teal-300 to-emerald-200 rounded-full shadow-sm"></div>

          {deptSteps.map((step) => (
            <div key={step.id} className="flex gap-4 mb-5 relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-3 bg-white flex-shrink-0 relative z-10 shadow-md ${
                step.role === 'human' ? 'border-slate-400' :
                step.role === 'together' ? 'border-blue-400' :
                'border-purple-400'
              }`}>
                {getRoleIcon(step.role)}
              </div>
              <div className="flex-1 bg-white/80 rounded-xl p-4 hover:shadow-lg transition-all border border-slate-200/50">
                <div className="flex items-stretch gap-4">
                  <div className="flex flex-col gap-2 flex-shrink-0 min-w-[160px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-medium text-slate-400 text-xs">Step {step.id}</span>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="font-semibold text-slate-800 text-sm">{step.title}</span>
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={step.role}
                        onChange={(e) => updateDeptRole(step.id, e.target.value as 'human' | 'together' | 'ai')}
                        className={`h-full w-full px-3 py-2 pr-7 rounded-lg text-sm font-semibold cursor-pointer border-2 text-white appearance-none transition-all ${
                          step.role === 'human' ? 'bg-slate-500 border-slate-400 hover:bg-slate-600' :
                          step.role === 'together' ? 'bg-blue-500 border-blue-400 hover:bg-blue-600' :
                          'bg-purple-500 border-purple-400 hover:bg-purple-600'
                        }`}
                      >
                        <option value="human" className="bg-white text-slate-900">👤 Human</option>
                        <option value="together" className="bg-white text-slate-900">🤝 Together</option>
                        <option value="ai" className="bg-white text-slate-900">🤖 AI</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white text-xs">▼</div>
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {DEPARTMENT_WORKFLOWS[selectedDept].scenarios[step.id as 1 | 2 | 3 | 4]?.[step.role]?.situation || step.name}
                    </p>
                    <div className="mt-2 text-xs text-slate-600 font-medium">
                      {DEPARTMENT_WORKFLOWS[selectedDept].scenarios[step.id as 1 | 2 | 3 | 4]?.[step.role]?.risk}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-slate-200 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 uppercase">Human</div>
              <div className="text-4xl font-black text-slate-700">{deptCounts.human}</div>
            </div>
          </div>
          <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-4xl">🤖</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-600 uppercase">AI</div>
              <div className="text-4xl font-black text-purple-700">{deptCounts.ai}</div>
            </div>
          </div>
          <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-4xl">🤝</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-600 uppercase">Together</div>
              <div className="text-4xl font-black text-blue-700">{deptCounts.together}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const stepScenarios: Record<number, Record<string, { situation: string; risk: string }>> = {
  1: {
    human: {
      situation: "이메일로 실적 요청을 보내고, 답변이 오면 이메일 본문을 드래그해서 복사합니다. 엑셀 시트를 열고 해당 셀에 붙여넣은 뒤, 숫자만 남기고 불필요한 인사말은 지웁니다. 5명분을 반복합니다.",
      risk: "⏳ 이메일 확인 → 복사 → 붙여넣기 → 정리 작업의 반복으로 인한 피로도 증가"
    },
    together: {
      situation: "이메일로 받은 데이터를 복사해서 AI에게 '이 내용을 표로 정리해줘'라고 시킵니다. AI가 만든 표를 엑셀에 붙여넣기만 하면 됩니다.",
      risk: "💡 원본 데이터 복사 과정에서의 누락 주의 필요"
    },
    ai: {
      situation: "공유 폴더에 팀원들이 업로드한 파일을 자동으로 읽어와 엑셀 시트에 채워 넣습니다. 클릭 한 번도 필요 없습니다.",
      risk: "⚠️ 파일 형식 불일치 시 전체 프로세스 중단 가능성"
    }
  },
  2: {
    human: {
      situation: "엑셀에서 날짜 컬럼을 선택하고 정렬 버튼을 누릅니다. 피벗 테이블 메뉴를 열어 부서별로 그룹화하고, 합계 함수를 설정합니다. 차트 삽입 메뉴에서 막대 그래프를 선택하고 데이터 범위를 지정합니다.",
      risk: "⏳ 엑셀 기능 숙지 필요, 실수 시 처음부터 다시"
    },
    together: {
      situation: "엑셀 데이터를 AI에게 보여주고 '이 데이터를 날짜별로 정렬하고, 부서별 합계를 피벗 테이블로 만들어줘. 그리고 막대 그래프도 그려줘'라고 요청합니다. AI가 제안한 수식과 차트를 검토 후 적용합니다.",
      risk: "💡 AI가 제안한 수식이 의도와 다를 수 있으니 검토 필요"
    },
    ai: {
      situation: "스크립트가 자동으로 데이터를 정렬하고, 피벗 테이블을 생성하며, 차트를 그립니다. 결과물이 이메일로 전송됩니다.",
      risk: "⚠️ 예외 상황(결측치, 이상치) 처리 로직 사전 구현 필요"
    }
  },
  3: {
    human: {
      situation: "그래프를 보며 이번 주 특이사항을 고민합니다. 작년 동기 대비 증감률, 부서별 편차, 특정 이벤트 영향 등을 분석하고, 3줄 요약 멘트를 직접 작성합니다.",
      risk: "💭 깊은 사고와 맥락 이해 필요, 시간 소요"
    },
    together: {
      situation: "AI에게 '이 그래프를 보고 3가지 인사이트를 뽑아줘'라고 요청합니다. AI가 제안한 인사이트를 검토하고, 회사 상황에 맞게 수정하거나 추가 멘트를 작성합니다.",
      risk: "💡 AI 인사이트가 피상적일 수 있으니 깊이 있는 검토 필요"
    },
    ai: {
      situation: "AI가 자동으로 그래프를 분석하고 3줄 요약을 생성합니다. 하지만 회사 내부 맥락이나 정치적 뉘앙스는 반영되지 않습니다.",
      risk: "⚠️ 맥락 없는 인사이트로 인한 오해 가능성, 최종 검토 필수"
    }
  },
  4: {
    human: {
      situation: "회사 PPT 템플릿을 열고, 텍스트와 차트를 복사해서 붙여넣습니다. 폰트 크기, 줄간격, 색상을 회사 가이드에 맞춰 조정합니다. 인쇄 설정을 확인하고 출력합니다.",
      risk: "⏳ 포맷팅 작업 시간 소요, 실수로 인한 재작업 가능성"
    },
    together: {
      situation: "AI에게 '이 내용을 회사 PPT 템플릿에 맞춰 정리해줘'라고 요청합니다. AI가 생성한 슬라이드를 검토하고, 필요한 부분만 수정합니다.",
      risk: "💡 템플릿 준수 여부 확인 필요"
    },
    ai: {
      situation: "스크립트가 자동으로 PPT를 생성하고, 회사 템플릿에 맞춰 포맷팅합니다. 완성된 파일이 자동으로 공유 폴더에 저장됩니다.",
      risk: "⚠️ 템플릿 변경 시 스크립트 수정 필요, 유지보수 부담"
    }
  }
};

export default function Step8WorkflowEducation({ onNext, onBack }: Step8WorkflowEducationProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, title: '실적 수합', name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
    { id: 2, title: '데이터 가공', name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
    { id: 3, title: '인사이트 도출', name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
    { id: 4, title: '보고서 작성', name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
  ]);

  const getRoleIcon = (role: string) => {
    const icons = { human: '👤', together: '🤝', ai: '🤖' };
    return icons[role as keyof typeof icons];
  };

  const updateRole = (stepId: number, newRole: 'human' | 'together' | 'ai') => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, role: newRole } : s));
  };

  const resetWorkflow = () => {
    setSteps([
      { id: 1, title: '실적 수합', name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
      { id: 2, title: '데이터 가공', name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
      { id: 3, title: '인사이트 도출', name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
      { id: 4, title: '보고서 작성', name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
    ]);
  };

  const counts = {
    ai: steps.filter(s => s.role === 'ai').length,
    together: steps.filter(s => s.role === 'together').length,
    human: steps.filter(s => s.role === 'human').length
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background matching Step7 */}
      <div className="absolute inset-0 fixed bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.06)_0%,transparent_50%)] bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.06)_0%,transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
              🤖 AI로 일 자동화하기
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-full mb-6">
            <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Step 8</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
            자동화 전략 수립
          </h2>

          {/* Introduction Box */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl p-8 border-2 border-indigo-200/50 shadow-lg">
            <div className="space-y-5">
              <p className="text-xl text-slate-800 leading-relaxed font-bold text-indigo-900">
                <span className="bg-yellow-100/70 px-2 py-0.5 rounded">어디에 AI를 쓰고, 어디에 사람을 배치할지</span> 결정하는 시간입니다.
              </p>

              <div className="text-lg text-slate-800 leading-relaxed space-y-3">
                <p>
                  <span className="font-bold text-indigo-900">업무를 Human / AI / Together 3가지로 나누는 원칙</span>을 배우고,<br />
                  실전 시나리오에 적용하여 팀의 자동화 전략을 수립합니다.
                </p>
                <div className="flex items-start gap-2 text-base text-slate-700 bg-white/60 rounded-lg p-4">
                  <span className="text-lg mt-0.5">💡</span>
                  <span>모든 업무를 자동화할 필요도, 자동화할 수 있는 것도 아닙니다.<br />반복 작업은 AI에게, 판단이 필요한 부분은 사람에게, 협업이 필요한 곳은 Together로 배치하는 것이 핵심입니다.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2030 Vision Section - Enhanced */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-white/80 via-purple-50/50 to-blue-50/50 backdrop-blur-xl border border-purple-200/30 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Title */}
            <div className="text-center mb-10">
              {/* WEF Badge - Prominent Source */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full mb-4 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-sm">World Economic Forum</span>
                <span className="opacity-90 text-xs">Future of Jobs Report 2025</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                2030년, 당신의 업무는 어떻게 변할까요?
              </h3>
              <p className="text-slate-600 text-base font-medium mb-1">
                1,000개 글로벌 기업 조사 기반 예측
              </p>
              <p className="text-slate-500 text-sm">
                업무의 3분할: Human / AI / Together
              </p>
            </div>

            {/* Reimagined Cards - Clear & Bold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Human Card */}
              <div className="group bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-slate-300 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-slate-400 transition-all">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-4xl">👤</span>
                  </div>
                  <div className="text-5xl font-black text-slate-800 mb-2">33%</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Human</h4>
                  <p className="text-sm text-slate-600 font-medium">오직 인간만이 할 수 있는 영역</p>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-slate-200">전략적 의사결정</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-slate-200">창의적 문제 해결</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-slate-200">윤리적 판단</div>
                </div>
              </div>

              {/* AI Card */}
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-300 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-purple-400 transition-all">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🤖</span>
                  </div>
                  <div className="text-5xl font-black text-purple-800 mb-2">34%</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">AI</h4>
                  <p className="text-sm text-slate-600 font-medium">AI가 완전히 대체하는 영역</p>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-purple-200">데이터 수집·정리</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-purple-200">정형 문서 작성</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-purple-200">반복 분석 작업</div>
                </div>
              </div>

              {/* Together Card */}
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-300 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:border-blue-400 transition-all">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🤝</span>
                  </div>
                  <div className="text-5xl font-black text-blue-800 mb-2">33%</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Together</h4>
                  <p className="text-sm text-slate-600 font-medium">AI와 사람이 협업하는 영역</p>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-blue-200">AI 초안 → 사람 검토</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-blue-200">AI 분석 → 사람 해석</div>
                  <div className="text-sm font-semibold text-slate-800 bg-white/80 rounded-lg px-4 py-3 shadow-sm border border-blue-200">AI 제안 → 사람 결정</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Concept */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-indigo-50/50 via-white/80 to-purple-50/50 backdrop-blur-xl border border-indigo-200/30 rounded-3xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-4xl">🔄</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">
                Human-in-the-Loop이란?
              </h3>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                자동화의 핵심은 <span className="font-bold text-indigo-700">"사람을 배제"</span>하는 것이 아니라,<br />
                <span className="font-bold text-indigo-700">"사람을 전략적 위치에 배치"</span>하는 것입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Before: Full Manual */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Before</h4>
                  <p className="text-sm text-slate-500">전부 수작업</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
                    <span className="text-slate-400">👤</span>
                    <span>데이터 수집</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
                    <span className="text-slate-400">👤</span>
                    <span>데이터 정리</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
                    <span className="text-slate-400">👤</span>
                    <span>분석 및 해석</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
                    <span className="text-slate-400">👤</span>
                    <span>보고서 작성</span>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-red-600 font-semibold">
                  ⚠️ 시간 소모 많음
                </div>
              </div>

              {/* Wrong: Full Automation */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  위험
                </div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Wrong</h4>
                  <p className="text-sm text-slate-500">완전 자동화</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-purple-50 rounded-lg p-2">
                    <span className="text-purple-500">🤖</span>
                    <span>데이터 수집</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-purple-50 rounded-lg p-2">
                    <span className="text-purple-500">🤖</span>
                    <span>데이터 정리</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-purple-50 rounded-lg p-2">
                    <span className="text-purple-500">🤖</span>
                    <span>분석 및 해석</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-purple-50 rounded-lg p-2">
                    <span className="text-purple-500">🤖</span>
                    <span>보고서 작성</span>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-red-600 font-semibold">
                  ⚠️ 맥락 부족, 신뢰 문제
                </div>
              </div>

              {/* Right: Human-in-the-Loop */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  추천
                </div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-3 shadow-md">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Right</h4>
                  <p className="text-sm text-indigo-700 font-semibold">Human-in-the-Loop</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-lg p-2 shadow-sm">
                    <span className="text-purple-500">🤖</span>
                    <span>데이터 수집</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-lg p-2 shadow-sm">
                    <span className="text-purple-500">🤖</span>
                    <span>데이터 정리</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-indigo-100 rounded-lg p-2 shadow-sm border border-indigo-300">
                    <span className="text-indigo-600">👤</span>
                    <span className="font-semibold">분석 및 해석</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-white rounded-lg p-2 shadow-sm">
                    <span className="text-blue-500">✨</span>
                    <span>보고서 작성</span>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-indigo-700 font-semibold">
                  ✓ 효율성 + 신뢰성
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white">
              <h5 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>핵심 원칙</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-bold mb-2">1. 반복은 AI에게</div>
                  <div className="text-sm opacity-90">정형화되고 반복적인 작업은 AI가 처리</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-bold mb-2">2. 판단은 사람에게</div>
                  <div className="text-sm opacity-90">맥락 이해와 의사결정은 사람의 영역</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="font-bold mb-2">3. 검증 포인트 설계</div>
                  <div className="text-sm opacity-90">어디서 사람이 확인할지 전략적 배치</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LLM Understanding Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center">LLM(거대언어모델)의 능력과 한계</h2>
          <p className="text-center text-base text-slate-600 mb-8 max-w-3xl mx-auto">
            전략적 판단을 위해서는 LLM이 <span className="font-semibold text-slate-900">무엇을 잘하고 무엇을 못하는지</span> 정확히 알아야 합니다.<br />
            <span className="text-sm text-slate-500">ChatGPT, Claude 등 대화형 AI의 핵심 기술</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Good At */}
            <div className="bg-white/70 backdrop-blur-xl border-t-4 border-t-sky-500 border border-white/60 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">🟢 Good At</h3>
              <div className="space-y-4">
                {[
                  { num: '01', title: 'Summarization', desc: '방대한 문서를 핵심만 요약' },
                  { num: '02', title: 'Transformation', desc: '번역, 톤앤매너 변경, 포맷 변환' },
                  { num: '03', title: 'Ideation', desc: '브레인스토밍, 초기 아이디어 확장' },
                  { num: '04', title: 'Multimodal', desc: '이미지, 오디오, 비디오 복합 이해' }
                ].map((item) => (
                  <div key={item.num} className="flex gap-4 p-3 rounded-xl hover:bg-white/50 transition-all">
                    <span className="text-2xl font-bold text-blue-600 min-w-[40px]">{item.num}</span>
                    <div>
                      <strong className="block text-base text-slate-900 mb-1">{item.title}</strong>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bad At */}
            <div className="bg-white/70 backdrop-blur-xl border-t-4 border-t-red-500 border border-white/60 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">🔴 Bad At</h3>
              <div className="space-y-6">
                {[
                  {
                    num: '01',
                    title: 'Fact Checking',
                    desc: '최신 정보나 사실 관계 확인 취약',
                    risk: '잘못된 정보로 인한 의사결정 오류',
                    solution: '검색 도구 연동 또는 사람이 최종 사실 검증'
                  },
                  {
                    num: '02',
                    title: 'Deep Context',
                    desc: '회사 내부의 암묵적인 맥락 이해 불가',
                    risk: '조직 문화나 히스토리를 고려하지 못한 제안',
                    solution: '팀 리더가 맥락을 추가 설명하거나 최종 검토'
                  },
                  {
                    num: '03',
                    title: 'Ethical Judgment',
                    desc: '가치 판단이나 책임지는 결정 불가',
                    risk: '윤리적으로 민감한 결정을 AI에 위임',
                    solution: '중요한 의사결정은 반드시 사람이 승인'
                  }
                ].map((item) => (
                  <div key={item.num} className="p-4 rounded-xl bg-gradient-to-br from-red-50/50 to-orange-50/50 border border-red-100/50">
                    <div className="flex gap-4 mb-3">
                      <span className="text-2xl font-bold text-red-600 min-w-[40px]">{item.num}</span>
                      <div className="flex-1">
                        <strong className="block text-base text-slate-900 mb-1">{item.title}</strong>
                        <p className="text-slate-600 text-sm mb-2">{item.desc}</p>
                      </div>
                    </div>
                    <div className="ml-14 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-red-500 font-bold mt-0.5">⚠️</span>
                        <span className="text-red-700 font-semibold">리스크: {item.risk}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-green-700 font-semibold">방지법: {item.solution}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Strategy Guide */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center">자동화 판단 프레임워크</h2>
          <p className="text-center text-slate-600 mb-8 max-w-3xl mx-auto">
            각 업무 단계마다 <span className="font-semibold text-slate-900">"이 작업은 누가 하는 것이 최적인가?"</span>를 질문하세요.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Human Card */}
            <div className="bg-white/70 backdrop-blur-xl border-t-4 border-t-slate-500 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">👤</span>
                <h3 className="text-xl font-bold text-slate-900">Human</h3>
              </div>
              <p className="text-blue-600 font-semibold mb-4">공감, 윤리, 맥락이 필요한가?</p>
              <ul className="space-y-2 mb-4 text-sm text-slate-700">
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  최종 의사결정 및 책임
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  정치적/윤리적 판단
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  관계 형성 및 소통
                </li>
              </ul>
              <div className="mt-6 p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl text-center">
                <span className="font-semibold text-blue-700">깊이 더하기 (Human Touch)</span>
              </div>
            </div>

            {/* AI Card */}
            <div className="bg-white/70 backdrop-blur-xl border-t-4 border-t-purple-500 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🤖</span>
                <h3 className="text-xl font-bold text-slate-900">AI</h3>
              </div>
              <p className="text-blue-600 font-semibold mb-4">규칙이 있고 반복적인가?</p>
              <ul className="space-y-2 mb-4 text-sm text-slate-700">
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  정답이 정해진 단순 변환
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  방대한 데이터 요약
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  초안 작성 (0 to 1)
                </li>
              </ul>
              <div className="mt-6 p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl text-center">
                <span className="font-semibold text-blue-700">과감하게 위임 (Delegation)</span>
              </div>
            </div>

            {/* Together Card */}
            <div className="bg-white/70 backdrop-blur-xl border-t-4 border-t-blue-500 border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🤝</span>
                <h3 className="text-xl font-bold text-slate-900">Together</h3>
              </div>
              <p className="text-blue-600 font-semibold mb-4">초안은 AI가, 판단은 사람이?</p>
              <ul className="space-y-2 mb-4 text-sm text-slate-700">
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  아이디어 확장/브레인스토밍
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  비판적 피드백 요청
                </li>
                <li className="pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold">
                  복잡한 데이터 분석
                </li>
              </ul>
              <div className="mt-6 p-3 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl text-center">
                <span className="font-semibold text-blue-700">생산성 2배 증폭 (Augmentation)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Unbundling Practice */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center">실전 판단 연습</h2>
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-center text-slate-700 mb-4 font-semibold text-lg">
              업무를 단계별로 쪼개고, 각 단계의 담당자를 전략적으로 배치하세요
            </p>
            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl p-8 border-2 border-indigo-300/60 shadow-lg">
              <div className="space-y-4">
                <p className="font-bold text-indigo-900 text-xl mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  <span>왜 이 연습이 중요한가요?</span>
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-black text-xl mt-1 min-w-[28px]">1.</span>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold text-slate-900 bg-yellow-100/80 px-2 py-0.5 rounded">전체를 통째로 자동화하려고 하면 실패합니다.</span>
                      <br />
                      <span className="text-slate-700 mt-1 inline-block">업무를 단계별로 쪼개야(Unbundle) 어디에 AI를 쓸지, 어디에 사람이 필요한지 보입니다.</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-black text-xl mt-1 min-w-[28px]">2.</span>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold text-slate-900 bg-yellow-100/80 px-2 py-0.5 rounded">명확한 판단 기준을 가지는 것이 중요합니다.</span>
                      <br />
                      <span className="text-slate-700 mt-1 inline-block">
                        <span className="font-semibold text-slate-900">"무엇을 AI가, 무엇을 사람이 하는지"</span> 결정하려면 각 단계의 특성을 파악해야 합니다.
                        <br />
                        <span className="bg-indigo-100/60 px-2 py-0.5 rounded font-semibold text-indigo-900 mt-1 inline-block">
                          반복적인가? 판단이 필요한가? 맥락 이해가 중요한가?
                        </span>
                        <br />
                        이 질문들이 Human/AI/Together 선택의 기준이 됩니다.
                      </span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-black text-xl mt-1 min-w-[28px]">3.</span>
                    <p className="text-base leading-relaxed">
                      <span className="font-bold text-slate-900 bg-yellow-100/80 px-2 py-0.5 rounded">직접 조합을 바꿔보며 trade-off를 체감합니다.</span>
                      <br />
                      <span className="text-slate-700 mt-1 inline-block">"Step 1을 AI로 바꾸면?" 버튼 클릭 한 번으로 효율과 리스크의 변화를 확인하세요.</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t-2 border-indigo-300/60">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-5 text-center shadow-md">
                    <p className="font-bold text-lg leading-relaxed">
                      ⚡ 이 연습을 통해<br />
                      <span className="text-yellow-200">"자동화 설계 = 업무 쪼개기(Unbundle) + 역할 배분(Assign)"</span><br />
                      핵심 프로세스를 체득하게 됩니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/90 to-blue-50/40 backdrop-blur-xl border-2 border-blue-200/40 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Scenario Header */}
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-300/50 rounded-full mb-4 shadow-md">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">⚡ EXAMPLE SCENARIO</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  주간 팀 성과 보고 (Weekly Report)
                </h3>
                <p className="text-base text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-blue-600 font-bold text-lg">▼</span>
                    <span>각 단계의 역할을 선택하여 시나리오를 확인하세요</span>
                  </span>
                </p>
              </div>
              <button
                onClick={resetWorkflow}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-300 rounded-xl font-bold text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all shadow-md hover:shadow-lg"
              >
                🔄 Reset
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="relative pl-16 mb-8">
              <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-purple-300 to-blue-200 rounded-full shadow-sm"></div>

              {steps.map((step) => (
                <div key={step.id} className="flex gap-4 mb-5 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-3 bg-white flex-shrink-0 relative z-10 shadow-md transition-all duration-200 ${
                    step.role === 'human' ? 'border-slate-400' :
                    step.role === 'together' ? 'border-blue-400' :
                    'border-purple-400'
                  }`}>
                    {getRoleIcon(step.role)}
                  </div>
                  <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-200 border border-slate-200/50">
                    <div className="flex items-stretch gap-4">
                      <div className="flex flex-col gap-2 flex-shrink-0 min-w-[160px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-medium text-slate-400 text-xs">Step {step.id}</span>
                          <span className="text-slate-300 text-xs">•</span>
                          <span className="font-semibold text-slate-800 text-sm">{step.title}</span>
                        </div>
                        <div className="relative flex-1">
                          <select
                            value={step.role}
                            onChange={(e) => updateRole(step.id, e.target.value as 'human' | 'together' | 'ai')}
                            className={`h-full w-full px-3 py-2 pr-7 rounded-lg text-sm font-semibold cursor-pointer border-2 text-white appearance-none transition-all ${
                              step.role === 'human' ? 'bg-slate-500 border-slate-400 hover:bg-slate-600' :
                              step.role === 'together' ? 'bg-blue-500 border-blue-400 hover:bg-blue-600' :
                              'bg-purple-500 border-purple-400 hover:bg-purple-600'
                            }`}
                            style={{
                              color: 'white'
                            }}
                          >
                            <option value="human" className="bg-white text-slate-900">👤 Human</option>
                            <option value="together" className="bg-white text-slate-900">🤝 Together</option>
                            <option value="ai" className="bg-white text-slate-900">🤖 AI</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white text-xs">
                            ▼
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 px-4 py-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {stepScenarios[step.id]?.[step.role]?.situation || step.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md">
                  <span className="text-4xl">👤</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Human Steps</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">{counts.human}</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-4xl">🤖</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">AI Steps</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{counts.ai}</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-4xl">🤝</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Together Steps</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{counts.together}</div>
                </div>
              </div>
            </div>

            {/* Strategy Explanation for Workshop Discussion */}
            <div className="p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-3xl font-black text-slate-900 mb-3 flex items-center gap-3">
                  <span className="text-4xl">💭</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">자동화 전략 설명</span>
                </h3>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
                <p className="text-base text-slate-700 leading-relaxed">
                  위에서 선택한 조합을 <span className="font-bold text-slate-900 bg-yellow-100/70 px-1 rounded">왜 그렇게 구성했는지</span> 설명해주세요.<br />
                  워크샵에서 팀원들과 토론하고 발표할 내용을 작성하세요.
                </p>
              </div>

              <div className="space-y-5">
                {/* Question 1 */}
                <div className="bg-white/70 rounded-xl p-6">
                  <label className="block font-bold text-slate-900 mb-3 text-base">
                    1. 스텝을 어떻게 나눴고, 그렇게 한 이유는 무엇인가요?
                  </label>
                  <p className="text-sm text-slate-600 mb-3">
                    각 단계에 Human/AI/Together 중 무엇을 배치했는지, 그렇게 선택한 이유(효율성, 리스크, 팀 역량 등)를 설명하세요.
                  </p>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    placeholder="예시: Step 1(실적 수합)과 Step 2(데이터 가공)는 Together로 설정했습니다. 반복 작업이지만 팀원마다 데이터 형식이 달라서 AI가 1차 정리를 하고, 제가 검토하는 방식이 효율적입니다. Step 3(인사이트 도출)은 Human으로 설정했습니다. 회사 내부 맥락과 정치적 판단이 필요하기 때문입니다."
                  />
                </div>

                {/* Question 2 */}
                <div className="bg-white/70 rounded-xl p-6">
                  <label className="block font-bold text-slate-900 mb-3 text-base">
                    2. 이 전략을 실행할 때 예상되는 한계점은 무엇인가요?
                  </label>
                  <p className="text-sm text-slate-600 mb-3">
                    선택한 전략의 리스크, 어려움, 주의할 점 등을 솔직하게 작성하세요.
                  </p>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    placeholder="예시: Step 2를 AI로 완전 자동화하면 팀원이 예상치 못한 형식으로 데이터를 제출했을 때 전체 프로세스가 중단될 수 있습니다. 또한 Step 3을 AI에게 맡기면 피상적인 분석만 나올 가능성이 높습니다. 팀원들이 AI 프롬프트 작성법을 학습하는 데 시간이 필요할 수 있습니다."
                  />
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-2xl border-2 border-blue-300/60 shadow-md">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💡</span>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 text-lg mb-3">작성 팁</p>
                    <ul className="text-blue-900 space-y-2.5 text-base leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-1">•</span>
                        <span><span className="font-bold">정답은 없습니다.</span> 우리 팀 상황에 맞는 최적의 조합을 찾는 것이 목표입니다.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-1">•</span>
                        <span><span className="font-bold">한계점도 솔직하게 공유하세요.</span> 완벽한 전략은 없으며, 리스크를 인지하고 있다는 것이 중요합니다.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold mt-1">•</span>
                        <span><span className="font-bold">다른 팀과 비교하며 배우세요.</span> 같은 업무라도 다른 접근 방식이 있을 수 있습니다.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition Guide Section */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto">
            {/* Divider with Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              <div className="mx-6 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg">
                <span className="text-3xl">🚀</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            </div>

            {/* Main Guide Box */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-10 border-2 border-emerald-300/50 shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                  이제 <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">내 업무</span>로 실습해볼까요?
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto">
                  위의 <span className="font-bold text-emerald-700">"주간 보고서"</span> 예시로 프레임워크를 익히셨다면,<br />
                  이제 <span className="font-bold text-teal-700 bg-yellow-100/70 px-2 py-0.5 rounded">팀의 실제 업무와 유사한 시나리오</span>로 한번 더 연습해보세요!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Box 1 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-md">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-3 shadow-md">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">실전 적용 준비</h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    내 업무와 유사한 예시로 연습하면 <span className="font-semibold text-emerald-700">실제 팀에 적용하기 훨씬 쉽습니다</span>
                  </p>
                </div>

                {/* Box 2 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/50 shadow-md">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-3 shadow-md">
                      <span className="text-3xl">💼</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">8개 실습 시나리오</h4>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal-600">•</span>
                      <span>SNS 캠페인 기획, 리드 발굴, 재고 관리</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal-600">•</span>
                      <span>신제품 실험, 채용, 재무 결산</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-teal-600">•</span>
                      <span>시스템 장애 대응, 신사업 분석</span>
                    </div>
                  </div>
                </div>

                {/* Box 3 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/50 shadow-md">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-3 shadow-md">
                      <span className="text-3xl">🔄</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">자유롭게 실험</h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    각 단계의 역할을 바꿔가며 <span className="font-semibold text-cyan-700">우리 팀에 최적인 조합</span>을 찾아보세요
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-center shadow-lg">
                <p className="text-white text-lg font-bold mb-2">
                  ⬇️ 아래에서 부서를 선택하고 실전 연습을 시작하세요 ⬇️
                </p>
                <p className="text-emerald-100 text-sm">
                  같은 프레임워크, 다른 적용 방식을 체험할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Department-specific Advanced Practice Section */}
        <DepartmentPracticeSection />

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center max-w-4xl mx-auto pt-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200"
          >
            다음
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
