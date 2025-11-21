'use client';

import React, { useState, useEffect } from 'react';

interface Step7SummaryProps {
  workshop: {
    mission?: string;
    teamSize?: number;
    teamComposition?: string;
    constraints?: string[];
    controllableIssues?: string;
    domains: string[];
    manualInput?: string;
    tasks?: any[];
  };
  onNext: () => void;
  onBack: () => void;
}

interface AIRecommendation {
  category: 'should' | 'could';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Step7Summary({ workshop, onNext, onBack }: Step7SummaryProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    // AI 추천 생성 (실제로는 백엔드 API 호출)
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    setLoading(true);

    // 임시 목 데이터 - 실제로는 백엔드 API 호출
    setTimeout(() => {
      const mockRecommendations: AIRecommendation[] = [
        {
          category: 'should',
          title: '고객 피드백 분석 자동화',
          description: '고객 문의 데이터를 주기적으로 분석하여 트렌드와 개선점 도출',
          reason: '미션인 "고객 만족도 향상"과 직접적으로 연결되며, 현재 고객 문의 처리 업무가 있음',
          priority: 'high'
        },
        {
          category: 'should',
          title: '데이터 기반 의사결정 프로세스 구축',
          description: '주요 의사결정 시 데이터 분석 결과를 활용하는 체계 마련',
          reason: '데이터 분석 업무가 있으나 의사결정에 활용되는지 불명확함',
          priority: 'high'
        },
        {
          category: 'could',
          title: '팀 간 협업 워크플로우 개선',
          description: '다른 팀과의 협업 시 불필요한 커뮤니케이션 비용 감소',
          reason: '조율 업무가 많다는 제약조건이 있음',
          priority: 'medium'
        },
        {
          category: 'could',
          title: '업무 자동화 교육 프로그램',
          description: '팀원들이 반복 업무를 자동화할 수 있는 역량 강화',
          reason: '단순 반복 업무가 많다는 제약이 있으며 팀 역량 향상에 도움',
          priority: 'medium'
        },
        {
          category: 'could',
          title: '지식 관리 시스템 도입',
          description: '업무 노하우와 문서를 체계적으로 관리하는 시스템 구축',
          reason: '업무 표준화 부족 문제 해결에 기여',
          priority: 'low'
        }
      ];

      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  return (
    <div className="relative min-h-screen -m-6 flex flex-col animate-fadeIn overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 fixed bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.08),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-auto px-6 py-12">
        <div className="w-full max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                📊 우리 팀 일 분석하기
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-full mb-6">
              <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Step 7</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              워크샵 요약 및 AI 추천
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              지금까지 작성한 내용을 한눈에 확인하고, AI가 추천하는 업무를 검토하세요
            </p>
          </div>

          {/* 작성 내용 요약 - 구조화된 레이아웃 */}
          <div className="mb-12">
            {/* 섹션 타이틀 */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">📋 워크샵 요약</h3>
              <p className="text-slate-600">지금까지 작성하신 내용을 확인해보세요</p>
            </div>

            {/* Mission과 팀 상황을 2열로 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Mission/가치 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                    🎯
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">미션 / 가치</h4>
                </div>
                <p className="text-slate-700 leading-relaxed pl-13">
                  {workshop.mission || <span className="text-slate-400 italic">입력되지 않음</span>}
                </p>
              </div>

              {/* 팀 상황 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                    👥
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">팀 상황</h4>
                </div>
                <div className="space-y-2 pl-13">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">규모:</span>
                    <span className="text-slate-900 font-semibold">{workshop.teamSize || 0}명</span>
                  </div>
                  {workshop.teamComposition && (
                    <div>
                      <span className="text-sm font-medium text-slate-500 block mb-1">구성:</span>
                      <p className="text-sm text-slate-700">{workshop.teamComposition}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 제약조건 - 전체 너비 */}
            {(workshop.constraints && workshop.constraints.length > 0) || workshop.controllableIssues ? (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-md border-2 border-orange-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                    ⚠️
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">제약조건 및 해결방안</h4>
                </div>
                <div className="pl-13">
                  {workshop.constraints && workshop.constraints.length > 0 && (
                    <div className="mb-4">
                      <div className="grid md:grid-cols-2 gap-2">
                        {workshop.constraints.map((constraint, index) => (
                          <div key={index} className="flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2">
                            <span className="text-orange-600 mt-0.5">•</span>
                            <span className="text-sm text-slate-700">{constraint}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {workshop.controllableIssues && (
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                      <p className="text-sm font-semibold text-blue-900 mb-1">💡 컨트롤 가능한 이슈</p>
                      <p className="text-sm text-blue-800">{workshop.controllableIssues}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* 업무 영역과 업무 내용 */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                  📁
                </div>
                <h4 className="text-lg font-bold text-slate-900">업무 영역 및 내용</h4>
              </div>

              {/* 업무 영역 태그 */}
              <div className="mb-5 pl-13">
                <p className="text-sm font-medium text-slate-600 mb-2">업무 영역</p>
                <div className="flex flex-wrap gap-2">
                  {workshop.domains.filter(d => d.trim()).length > 0 ? (
                    workshop.domains.filter(d => d.trim()).map((domain, index) => (
                      <div key={index} className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 rounded-lg">
                        <span className="text-sm font-medium text-emerald-900">{domain}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-sm">입력되지 않음</span>
                  )}
                </div>
              </div>

              {/* 업무 내용 미리보기 */}
              <div className="pl-13">
                <p className="text-sm font-medium text-slate-600 mb-3">주요 업무</p>
                {workshop.tasks && workshop.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {workshop.tasks.slice(0, 4).map((task, index) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 mb-0.5 truncate">{task.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-1">{task.description}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded flex-shrink-0">
                            {task.category || '기타'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {workshop.tasks.length > 4 && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          +{workshop.tasks.length - 4}개 업무 더 보기
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-sm">입력되지 않음</p>
                )}
              </div>
            </div>
          </div>

          {/* AI 추천 섹션 */}
          <div className="mb-8">
            {/* 섹션 타이틀 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
                🤖
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">AI 업무 추천</h3>
                <p className="text-slate-600">미션과 현재 상황을 기반으로 추천하는 업무입니다</p>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-slate-200">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">AI가 추천 업무를 생성하고 있습니다...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* 해야 할 일 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">!</div>
                    <h4 className="text-lg font-bold text-slate-900">반드시 해야 할 일</h4>
                  </div>
                  <div className="space-y-3">
                    {recommendations.filter(r => r.category === 'should').map((rec, index) => (
                      <div key={index} className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-sm hover:shadow-md transition-all hover:border-red-300">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-base font-bold text-slate-900 flex-1 pr-2">{rec.title}</h5>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(rec.priority)} flex-shrink-0`}>
                            {getPriorityLabel(rec.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed">{rec.description}</p>
                        <div className="bg-blue-50 border-l-3 border-blue-400 p-2.5 rounded-r">
                          <p className="text-xs text-blue-900">
                            <span className="font-semibold">이유:</span> {rec.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 하면 좋을 일 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">+</div>
                    <h4 className="text-lg font-bold text-slate-900">하면 더 좋을 것 같은 일</h4>
                  </div>
                  <div className="space-y-3">
                    {recommendations.filter(r => r.category === 'could').map((rec, index) => (
                      <div key={index} className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-base font-bold text-slate-900 flex-1 pr-2">{rec.title}</h5>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(rec.priority)} flex-shrink-0`}>
                            {getPriorityLabel(rec.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed">{rec.description}</p>
                        <div className="bg-purple-50 border-l-3 border-purple-400 p-2.5 rounded-r">
                          <p className="text-xs text-purple-900">
                            <span className="font-semibold">이유:</span> {rec.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </button>
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
            >
              다음 단계로
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
