'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [isStarting, setIsStarting] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const handleStartWorkshop = () => {
    console.log('워크샵 시작 버튼 클릭됨')
    setIsStarting(true)
    setTimeout(() => {
      console.log('워크샵 페이지로 이동 시도')
      router.push('/workshop')
    }, 1000)
  }

  const nextSlide = () => {
    console.log('Next slide clicked, current:', currentSlide)
    setCurrentSlide((prev) => {
      const newSlide = (prev + 1) % automationCases.length
      console.log('Moving to slide:', newSlide)
      return newSlide
    })
  }

  const prevSlide = () => {
    console.log('Previous slide clicked, current:', currentSlide)
    setCurrentSlide((prev) => {
      const newSlide = (prev - 1 + automationCases.length) % automationCases.length
      console.log('Moving to slide:', newSlide)
      return newSlide
    })
  }

  // 키보드 네비게이션 추가
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide])

  // 전체 프로세스 자동화 사례 데이터 (8개)
  const automationCases = [
    {
      title: '재무 분석가 월별 전략 분석',
      subtitle: '예산 대비 실적 리포트 자동화',
      details: '매월 반복되는 예산계획서와 실제 매출 데이터를 대조하여 편차를 분석하고, 부서별 성과를 평가해 경영진에게 보고하는 업무',
      processType: '완전 자동화',
      timeReduction: '15시간 → 30분',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '각 부서별 매출 데이터 수집', difficulty: 'high' },
          { name: '예산 계획서와 실적 대조 작업', difficulty: 'high' },
          { name: '편차 원인 분석을 위한 담당자별 인터뷰', difficulty: 'medium' },
          { name: '엑셀 피벗 테이블로 분석 차트 생성', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: 'AI 자동화 프로세스',
        steps: [
          { name: 'ERP 시스템 자동 데이터 추출', difficulty: 'automated' },
          { name: 'AI 예산 vs 실적 자동 대조 분석', difficulty: 'automated' },
          { name: 'ML 기반 편차 원인 자동 분석', difficulty: 'automated' },
          { name: 'AI 보고서 자동 생성 및 인사이트 도출', difficulty: 'automated' }
        ]
      }
    },
    {
      title: '마케팅 캠페인 성과 분석',
      subtitle: '다채널 ROI 측정 및 최적화',
      details: '페이스북, 구글 애즈, 네이버 광고 등 여러 플랫폼의 광고 데이터를 통합하여 고객 여정을 추적하고 각 채널별 ROI를 계산하여 예산 배분을 최적화하는 업무',
      processType: '부분 자동화',
      timeReduction: '12시간 → 2시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '페이스북, 구글, 네이버 광고 데이터 개별 다운로드', difficulty: 'medium' },
          { name: '각 플랫폼별 데이터 형식 통일화 작업', difficulty: 'high' },
          { name: '고객 여정별 터치포인트 수동 매핑', difficulty: 'high' },
          { name: 'ROI 계산을 위한 매출 연결 작업', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: '하이브리드 자동화 프로세스',
        steps: [
          { name: 'API 연동 자동 데이터 수집', difficulty: 'automated' },
          { name: '데이터 파이프라인 자동 정규화', difficulty: 'automated' },
          { name: 'GA4 + CRM 자동 고객 여정 추적', difficulty: 'automated' },
          { name: 'ML 기반 성과 예측 및 인사이트', difficulty: 'review' }
        ]
      }
    },
    {
      title: '인사팀 신입사원 온보딩',
      subtitle: '입사부터 적응까지 전 과정 관리',
      details: '신입사원의 입사 서류 검토부터 시작해서 시스템 계정 생성, 부서별 오리엔테이션 일정 조율, 멘토 배정, 적응도 체크까지 온보딩 전 과정을 관리하는 업무',
      processType: '완전 자동화',
      timeReduction: '20시간 → 1시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '입사 서류 개별 검토 및 스캔', difficulty: 'medium' },
          { name: '사내 시스템 계정 수동 생성', difficulty: 'medium' },
          { name: '팀별 오리엔테이션 일정 개별 조율', difficulty: 'high' },
          { name: '멘토 매칭 및 정기 면담 스케줄링', difficulty: 'medium' }
        ]
      },
      afterProcess: {
        title: 'AI 자동화 프로세스',
        steps: [
          { name: 'OCR + AI 서류 자동 검증 처리', difficulty: 'automated' },
          { name: 'LDAP 연동 계정 자동 프로비저닝', difficulty: 'automated' },
          { name: 'MS Teams 기반 자동 일정 조율', difficulty: 'automated' },
          { name: '챗봇 + 대시보드 적응도 모니터링', difficulty: 'review' }
        ]
      }
    },
    {
      title: '고객 서비스 티켓 처리',
      subtitle: '문의 접수부터 해결까지 원스톱',
      details: '이메일, 전화, 채팅으로 들어오는 고객 문의를 분류하고 적절한 담당자에게 배정하여 해결책을 제공하고 고객 만족도를 관리하는 업무',
      processType: '부분 자동화',
      timeReduction: '8시간 → 2시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '이메일, 전화, 채팅 문의 개별 확인', difficulty: 'medium' },
          { name: '문의 유형별 수동 분류 및 태깅', difficulty: 'medium' },
          { name: '담당 부서/담당자 배정 조율', difficulty: 'high' },
          { name: '유사 사례 검색 및 솔루션 검토', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: '스마트 자동화 프로세스',
        steps: [
          { name: '옴니채널 통합 자동 수집', difficulty: 'automated' },
          { name: 'NLP 기반 자동 분류 및 우선순위', difficulty: 'automated' },
          { name: 'AI 지식베이스 자동 솔루션 추천', difficulty: 'automated' },
          { name: '상황별 맞춤 응답 검토 및 발송', difficulty: 'review' }
        ]
      }
    },
    {
      title: '영업팀 리드 스코어링',
      subtitle: '잠재고객 우선순위 자동 배정',
      details: '웹사이트 방문자 행동, 이메일 반응, 데모 요청 등의 데이터를 종합하여 잠재고객의 구매 가능성을 점수화하고 영업팀에 우선순위를 제공하는 업무',
      processType: '완전 자동화',
      timeReduction: '6시간 → 15분',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '웹사이트 방문 기록 수동 확인', difficulty: 'medium' },
          { name: '이메일 오픈율/클릭율 개별 분석', difficulty: 'high' },
          { name: '영업 담당자별 리드 수동 배분', difficulty: 'medium' },
          { name: '리드 품질 주관적 평가', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: 'AI 자동화 프로세스',
        steps: [
          { name: '행동 데이터 실시간 수집 및 분석', difficulty: 'automated' },
          { name: 'ML 모델 기반 리드 스코어 자동 계산', difficulty: 'automated' },
          { name: '우선순위 기반 영업팀 자동 배정', difficulty: 'automated' },
          { name: '성과 피드백 루프 자동 학습', difficulty: 'automated' }
        ]
      }
    },
    {
      title: '법무팀 계약서 검토',
      subtitle: '계약 조건 리스크 자동 분석',
      details: '파트너사와의 계약서, 고용 계약서, NDA 등 각종 계약서의 조건을 검토하여 법적 리스크를 식별하고 수정 사항을 제안하는 업무',
      processType: '부분 자동화',
      timeReduction: '4시간 → 1시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '계약서 조항별 개별 검토', difficulty: 'high' },
          { name: '유사 계약서 사례 수동 검색', difficulty: 'medium' },
          { name: '리스크 요소 수기 식별', difficulty: 'high' },
          { name: '수정 사항 개별 문서화', difficulty: 'medium' }
        ]
      },
      afterProcess: {
        title: 'AI 지원 자동화 프로세스',
        steps: [
          { name: 'AI 계약서 조항 자동 분석', difficulty: 'automated' },
          { name: '과거 계약 데이터베이스 자동 매칭', difficulty: 'automated' },
          { name: '리스크 요소 자동 하이라이팅', difficulty: 'automated' },
          { name: '전문가 최종 검토 및 승인', difficulty: 'review' }
        ]
      }
    },
    {
      title: '회계팀 일반 업무 자동화',
      subtitle: '월간 결산 보조업무 효율화',
      details: '매월 진행되는 기본적인 회계 업무 중 데이터 입력, 계정 분류, 차감 계산 등 단순 반복 업무만 선별적으로 자동화하는 보수적 접근',
      processType: '최소 자동화',
      timeReduction: '8시간 → 6시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '전표 데이터 수동 입력', difficulty: 'medium' },
          { name: '계정 과목 수동 분류', difficulty: 'high' },
          { name: '세금 계산 및 검증', difficulty: 'high' },
          { name: '결산 보고서 작성', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: '선별적 자동화 프로세스',
        steps: [
          { name: 'OCR 기반 전표 자동 입력', difficulty: 'automated' },
          { name: '계정 과목 수동 분류 (기존 유지)', difficulty: 'review' },
          { name: '세금 계산 수동 검증 (기존 유지)', difficulty: 'review' },
          { name: '결산 보고서 수동 작성 (기존 유지)', difficulty: 'review' }
        ]
      }
    },
    {
      title: '총무팀 사무용품 관리',
      subtitle: '재고 확인 및 주문 프로세스 일부 개선',
      details: '사무용품 재고 파악과 주문 업무에서 재고 체크만 자동화하고, 주문 결정과 승인은 기존 수동 프로세스를 유지하는 단계적 접근',
      processType: '최소 자동화',
      timeReduction: '3시간 → 2.5시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '각 부서별 사무용품 현황 확인', difficulty: 'medium' },
          { name: '재고 수량 엑셀 정리', difficulty: 'low' },
          { name: '필요 물품 및 수량 결정', difficulty: 'medium' },
          { name: '업체 견적 비교 및 주문 처리', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: '부분 지원 프로세스',
        steps: [
          { name: '자동 재고 알림 시스템', difficulty: 'automated' },
          { name: '재고 현황 자동 업데이트', difficulty: 'automated' },
          { name: '필요 물품 수동 결정 (기존 유지)', difficulty: 'review' },
          { name: '업체 선정 수동 처리 (기존 유지)', difficulty: 'review' }
        ]
      }
    },
    {
      title: '구매팀 공급업체 평가',
      subtitle: '벤더 성과 및 리스크 종합 분석',
      details: '공급업체의 납기 준수율, 품질 점수, 가격 경쟁력, 재무 안정성 등을 종합 평가하여 최적의 공급업체를 선정하고 관리하는 업무',
      processType: '완전 자동화',
      timeReduction: '10시간 → 45분',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '업체별 납기/품질 데이터 수집', difficulty: 'medium' },
          { name: '재무제표 개별 분석', difficulty: 'high' },
          { name: '시장 가격 수동 비교 조사', difficulty: 'medium' },
          { name: '종합 평가 점수 계산', difficulty: 'high' }
        ]
      },
      afterProcess: {
        title: 'AI 자동화 프로세스',
        steps: [
          { name: 'ERP 연동 성과 데이터 자동 수집', difficulty: 'automated' },
          { name: 'AI 재무 건전성 자동 분석', difficulty: 'automated' },
          { name: '시장 가격 API 자동 모니터링', difficulty: 'automated' },
          { name: '종합 점수 자동 산출 및 랭킹', difficulty: 'automated' }
        ]
      }
    },
    {
      title: 'IT팀 보안 로그 분석',
      subtitle: '이상 행동 패턴 자동 탐지',
      details: '네트워크 트래픽, 사용자 접근 기록, 시스템 로그를 모니터링하여 보안 위협을 조기에 발견하고 대응 방안을 수립하는 업무',
      processType: '부분 자동화',
      timeReduction: '16시간 → 3시간',
      beforeProcess: {
        title: '기존 수동 프로세스',
        steps: [
          { name: '각 시스템별 로그 개별 확인', difficulty: 'high' },
          { name: '이상 패턴 수동 식별', difficulty: 'high' },
          { name: '보안 위협 수준 주관적 판단', difficulty: 'high' },
          { name: '대응 조치 수동 문서화', difficulty: 'medium' }
        ]
      },
      afterProcess: {
        title: 'AI 보안 자동화 프로세스',
        steps: [
          { name: 'SIEM 통합 로그 자동 수집', difficulty: 'automated' },
          { name: 'ML 기반 이상 징후 자동 탐지', difficulty: 'automated' },
          { name: 'AI 위험도 자동 분류', difficulty: 'automated' },
          { name: '보안 전문가 검증 및 대응', difficulty: 'review' }
        ]
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* Ultra-modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-r from-blue-600/20 via-purple-600/15 to-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-gradient-to-l from-violet-600/15 via-pink-600/10 to-blue-600/5 rounded-full blur-2xl animate-pulse" style={{animationDuration: '12s', animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-tr from-cyan-600/10 via-blue-600/8 to-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>

        {/* Floating Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="grid grid-cols-12 gap-8 h-full transform rotate-12">
            {Array.from({length: 144}).map((_, i) => (
              <div key={i} className="bg-white/20 rounded-sm"></div>
            ))}
          </div>
        </div>

        {/* Scanning Lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-purple-400/30 to-transparent animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-8 pt-32 pb-40 text-center">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium tracking-wide">LIVE WORKSHOP</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[0.85]">
            워크플로우를
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Re-design
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400/60 via-blue-400/60 to-purple-400/60 rounded-full"></div>
            </span>
            하는 시간
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            실제 업무 플로우를 분석하여 팀의 반복업무를 AI로 자동화하고
            <br className="hidden sm:block" />
            시간과 비용을 절약하는 구체적인 방법을 제시합니다
          </p>

          <div className="flex flex-col items-center space-y-8">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('워크샵 시작 버튼 클릭!')
                handleStartWorkshop()
              }}
              disabled={isStarting}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-6 px-16 md:py-8 md:px-20 rounded-full text-xl transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 transform hover:scale-105 hover:-translate-y-2 border border-white/20 z-50"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isStarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    워크샵 시작 중...
                  </>
                ) : (
                  <>
                    워크샵 시작하기
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>

          </div>
        </div>
      </div>

      {/* Process Automation Showcase */}
      <div className="relative py-16 md:py-24 bg-gradient-to-b from-transparent to-white/5">
        <div className="container mx-auto px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-6">
              <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm">
                <span className="text-white/90 font-medium tracking-wider text-sm">CASE STUDY</span>
              </div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Previous button clicked!')
                prevSlide()
              }}
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/15 backdrop-blur-xl rounded-full p-3 md:p-4 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 z-50 border border-white/30 hover:bg-white/25 group hover:scale-105 cursor-pointer"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Next button clicked!')
                nextSlide()
              }}
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/15 backdrop-blur-xl rounded-full p-3 md:p-4 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 z-50 border border-white/30 hover:bg-white/25 group hover:scale-105 cursor-pointer"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Main Content */}
            <div className="mx-4 md:mx-16">
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-purple-500/10 transition-all duration-500">
                {/* Header */}
                <div className="bg-gradient-to-r from-white/5 to-white/10 px-8 md:px-12 py-10 border-b border-white/20">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                        {automationCases[currentSlide].title}
                      </h3>
                      <p className="text-white/80 font-medium text-xl mb-6">{automationCases[currentSlide].subtitle}</p>
                      <p className="text-white/60 leading-relaxed text-lg">{automationCases[currentSlide].details}</p>
                    </div>
                    <div className="flex flex-row lg:flex-col lg:text-right items-center lg:items-end space-x-4 lg:space-x-0 lg:space-y-4 lg:ml-10">
                      <div className={`inline-flex items-center px-5 py-3 rounded-full text-sm font-bold backdrop-blur-sm ${
                        automationCases[currentSlide].processType === '완전 자동화'
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                          : automationCases[currentSlide].processType === '부분 자동화'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}>
                        {automationCases[currentSlide].processType}
                      </div>
                      <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {automationCases[currentSlide].timeReduction}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Comparison */}
                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                    {/* Before Process */}
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-4 shadow-lg shadow-red-500/30"></div>
                        {automationCases[currentSlide].beforeProcess.title}
                      </h4>

                      <div className="space-y-4">
                        {automationCases[currentSlide].beforeProcess.steps.map((step, index) => (
                          <div key={index} className="group relative">
                            <div className="bg-red-500/10 border-l-4 border-red-400 rounded-2xl p-5 hover:bg-red-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white">{step.name}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm ${
                                  step.difficulty === 'high' ? 'bg-red-500/30 text-red-200 border border-red-400/40' :
                                  step.difficulty === 'medium' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/40' :
                                  'bg-yellow-500/30 text-yellow-200 border border-yellow-400/40'
                                }`}>
                                  {step.difficulty === 'high' ? '고난이도' :
                                   step.difficulty === 'medium' ? '중간' : '간단'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* After Process */}
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-white flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-4 shadow-lg shadow-green-500/30"></div>
                        {automationCases[currentSlide].afterProcess.title}
                      </h4>

                      <div className="space-y-4">
                        {automationCases[currentSlide].afterProcess.steps.map((step, index) => (
                          <div key={index} className="group relative">
                            <div className={`border-l-4 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg backdrop-blur-sm ${
                              step.difficulty === 'automated'
                                ? 'bg-green-500/10 border-green-400 hover:bg-green-500/20 hover:shadow-green-500/20'
                                : 'bg-blue-500/10 border-blue-400 hover:bg-blue-500/20 hover:shadow-blue-500/20'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white">{step.name}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm border ${
                                  step.difficulty === 'automated'
                                    ? 'bg-green-500/30 text-green-200 border-green-400/40'
                                    : 'bg-blue-500/30 text-blue-200 border-blue-400/40'
                                }`}>
                                  {step.difficulty === 'automated' ? '🤖 자동화' : '👤 검토필요'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center mt-16 space-x-2">
                {automationCases.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Indicator clicked for slide:', index)
                      setCurrentSlide(index)
                    }}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 z-50 cursor-pointer ${
                      index === currentSlide
                        ? 'bg-white/20'
                        : 'bg-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-400 w-8 shadow-lg shadow-blue-400/50'
                        : 'bg-white/40 hover:bg-white/60 w-2'
                    }`} />
                  </button>
                ))}
              </div>

              {/* CTA Section */}
              <div className="text-center mt-20 mb-8">
                <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    이런 자동화, 우리 팀에도 적용해보고 싶다면?
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('CTA 워크샵 버튼 클릭!')
                      handleStartWorkshop()
                    }}
                    disabled={isStarting}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-bold py-5 px-12 md:py-6 md:px-16 rounded-full text-lg transition-all duration-500 shadow-2xl hover:shadow-cyan-500/20 disabled:opacity-50 transform hover:scale-105 hover:-translate-y-1 border border-white/30 z-50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      지금 바로 워크샵 참여하기
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-40 py-20 text-center border-t border-white/10">
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl inline-block px-8 py-4">
          <p className="text-white/60 font-medium tracking-wider text-sm">
            © 2025 SK Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}