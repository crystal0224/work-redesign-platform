'use client';

import { useState } from 'react';

interface Step8WorkflowEducationProps {
  onNext: () => void;
  onBack: () => void;
}

interface WorkflowStep {
  id: number;
  name: string;
  role: 'human' | 'ai' | 'together';
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
    { id: 1, name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
    { id: 2, name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
    { id: 3, name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
    { id: 4, name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
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
      { id: 1, name: '팀원 5명에게 이메일로 실적 요청하고, 답변 오면 이메일 본문을 복사해서 엑셀에 하나씩 붙여넣기', role: 'human' },
      { id: 2, name: '취합된 엑셀 데이터를 날짜별로 정렬하고, 피벗 테이블 돌려 부서별 합계 낸 뒤 그래프 그리기', role: 'human' },
      { id: 3, name: '그래프를 보며 이번 주 특이사항 고민하고, 보고서에 들어갈 3줄 요약 멘트 직접 타이핑하기', role: 'human' },
      { id: 4, name: '작성된 내용을 회사 PPT 템플릿에 옮겨 담고, 폰트/줄간격 맞춘 뒤 인쇄해서 팀장님 책상에 제출', role: 'human' }
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
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            자동화 전략 수립
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-3 font-semibold">
            무엇을 자동화할지, 무엇을 사람이 해야할지 판단하는 시간
          </p>
          <p className="text-base text-slate-600 max-w-3xl mx-auto">
            모든 업무를 자동화할 수 있는 것도, 해야 하는 것도 아닙니다.<br />
            팀 리더로서 <span className="font-semibold text-slate-900">어디에 AI를 쓰고, 어디에 사람의 판단을 남겨둘지</span> 전략적으로 결정해야 합니다.
          </p>
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
          <p className="text-center text-slate-700 mb-2 font-semibold text-lg">업무를 단계별로 쪼개고, 각 단계의 담당자를 전략적으로 배치하세요</p>
          <p className="text-center text-slate-600 mb-8">"자동화 설계는 업무를 쪼개고(Unbundle), 역할을 배분하는(Assign) 것에서 시작합니다"</p>

          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm">
            {/* Scenario Header */}
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100/50 to-purple-100/50 border border-blue-200/50 rounded-full mb-3">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">EXAMPLE SCENARIO</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">주간 팀 성과 보고 (Weekly Report)</h3>
              </div>
              <button
                onClick={resetWorkflow}
                className="px-4 py-2 bg-blue-100/50 border border-blue-200/50 rounded-xl font-semibold text-blue-700 hover:bg-blue-200/50 transition-all"
              >
                🔄 Reset
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="relative pl-16 mb-8">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>

              {steps.map((step) => (
                <div key={step.id} className="flex gap-6 mb-8 relative">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 bg-white flex-shrink-0 relative z-10 ${
                    step.role === 'human' ? 'border-slate-500' :
                    step.role === 'together' ? 'border-blue-500' :
                    'border-purple-500'
                  }`}>
                    {getRoleIcon(step.role)}
                  </div>
                  <div className="flex-1 bg-white/50 rounded-2xl p-6 hover:translate-y-[-2px] transition-transform">
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <span className="font-bold text-blue-600">Step {step.id}</span>
                      <select
                        value={step.role}
                        onChange={(e) => updateRole(step.id, e.target.value as 'human' | 'together' | 'ai')}
                        className={`px-4 py-2 rounded-lg font-semibold cursor-pointer border-none text-white ${
                          step.role === 'human' ? 'bg-slate-500' :
                          step.role === 'together' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                      >
                        <option value="human">👤 Human</option>
                        <option value="together">🤝 Together</option>
                        <option value="ai">🤖 AI</option>
                      </select>
                    </div>
                    <textarea
                      value={stepScenarios[step.id]?.[step.role]?.situation || step.name}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-2 border border-blue-100 bg-white/30 rounded-lg text-sm resize-vertical"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/50">
                <span className="text-4xl">👤</span>
                <div>
                  <div className="text-sm text-slate-600">Human Steps</div>
                  <div className="text-3xl font-bold text-blue-600">{counts.human}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/50">
                <span className="text-4xl">🤖</span>
                <div>
                  <div className="text-sm text-slate-600">AI Steps</div>
                  <div className="text-3xl font-bold text-blue-600">{counts.ai}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/50">
                <span className="text-4xl">🤝</span>
                <div>
                  <div className="text-sm text-slate-600">Together Steps</div>
                  <div className="text-3xl font-bold text-blue-600">{counts.together}</div>
                </div>
              </div>
            </div>

            {/* Simulation Analysis */}
            <div className="p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">📊 전략적 판단 시뮬레이션</h3>
              <p className="text-slate-600 mb-6">
                <span className="font-semibold text-slate-900">정답은 없습니다.</span> 각 단계의 역할을 바꿔보며 <span className="font-semibold">리스크, 효율성, 신뢰성</span>을 비교하고,
                우리 팀에 최적화된 자동화 전략을 찾아보세요.
              </p>

              <div className="space-y-4">
                {steps.map((step) => {
                  const scenario = stepScenarios[step.id][step.role];
                  return (
                    <div
                      key={step.id}
                      className={`p-6 rounded-2xl bg-white/50 border-l-4 ${
                        step.role === 'human' ? 'border-l-slate-500' :
                        step.role === 'copilot' ? 'border-l-blue-500' :
                        'border-l-purple-500'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <span className="font-bold text-blue-600">Step {step.id}</span>
                        <span className="text-sm font-semibold px-3 py-1 bg-blue-100/50 rounded-md">
                          {getRoleIcon(step.role)} {step.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mb-3">
                        {step.name.substring(0, 60)}...
                      </div>
                      <div className="space-y-3">
                        <div>
                          <strong className="block text-slate-800 mb-1">상황:</strong>
                          <p className="text-slate-600 text-sm leading-relaxed">{scenario.situation}</p>
                        </div>
                        <div>
                          <strong className="block text-slate-800 mb-1">리스크:</strong>
                          <p className="text-slate-600 text-sm leading-relaxed">{scenario.risk}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

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
