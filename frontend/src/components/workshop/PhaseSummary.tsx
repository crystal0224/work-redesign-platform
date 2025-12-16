'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface Phase1Data {
  mission: string;
  customer: string;
  teamSize: number;
  teamFormation: string;
  teamComposition: string;
  teamCharacteristics: string[];
  teamFreeOpinion: string;
  constraints: string[];
  controllableIssues: string;
  reduceWork: {
    repetitive: string;
    waiting: string;
    rework: string;
    unnecessary: string;
  };
  enhanceWork: {
    strategy: string;
    collaboration: string;
    quality: string;
    proactive: string;
  };
}

interface Phase2Data {
  domains: string[];
  uploadedFiles: string[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    domain: string;
    frequency: string;
    timeSpent: number;
    complexity: string;
  }>;
  selectedTaskIds: string[];
}

interface PhaseSummaryProps {
  phase: 1 | 2;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  phase1Data?: Phase1Data;
  phase2Data?: Phase2Data;
}

export default function PhaseSummary({
  phase,
  isOpen,
  onClose,
  onContinue,
  phase1Data,
  phase2Data,
}: PhaseSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const downloadAsImage = async () => {
    if (!summaryRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `phase${phase}-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const renderPhase1Summary = () => {
    if (!phase1Data) return null;

    return (
      <div className="space-y-6">
        {/* Mission & Customer Value */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
            미션 & 고객 가치
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">우리 팀의 미션</p>
              <p className="text-slate-800 bg-white rounded-lg p-3 border border-blue-100">
                {phase1Data.mission || '(입력 없음)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">우리 고객에게 제공하는 가치</p>
              <p className="text-slate-800 bg-white rounded-lg p-3 border border-blue-100">
                {phase1Data.customer || '(입력 없음)'}
              </p>
            </div>
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm">2</span>
            팀 현황
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-semibold text-purple-700 mb-1">팀 규모</p>
              <p className="text-2xl font-bold text-purple-900">{phase1Data.teamSize || 0}명</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-semibold text-purple-700 mb-1">팀 결성 시기</p>
              <p className="text-slate-800">{phase1Data.teamFormation || '(입력 없음)'}</p>
            </div>
          </div>
          {phase1Data.teamCharacteristics.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-purple-700 mb-2">팀 특성</p>
              <div className="flex flex-wrap gap-2">
                {phase1Data.teamCharacteristics.map((char, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}
          {phase1Data.teamFreeOpinion && (
            <div>
              <p className="text-sm font-semibold text-purple-700 mb-1">추가 의견</p>
              <p className="text-slate-800 bg-white rounded-lg p-3 border border-purple-100">
                {phase1Data.teamFreeOpinion}
              </p>
            </div>
          )}
        </div>

        {/* Constraints */}
        {phase1Data.constraints.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center text-sm">3</span>
              팀의 제약 조건
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {phase1Data.constraints.map((constraint, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm">
                  {constraint}
                </span>
              ))}
            </div>
            {phase1Data.controllableIssues && (
              <div>
                <p className="text-sm font-semibold text-orange-700 mb-1">컨트롤 가능한 문제</p>
                <p className="text-slate-800 bg-white rounded-lg p-3 border border-orange-100">
                  {phase1Data.controllableIssues}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reduce vs Enhance Work */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Reduce Work */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200">
            <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm">4a</span>
              줄일 일
            </h3>
            <div className="space-y-3">
              {[
                { key: 'repetitive', label: '반복/수작업' },
                { key: 'waiting', label: '대기/지연' },
                { key: 'rework', label: '재작업' },
                { key: 'unnecessary', label: '불필요한 일' },
              ].map((item) => {
                const value = phase1Data.reduceWork[item.key as keyof typeof phase1Data.reduceWork];
                return value ? (
                  <div key={item.key}>
                    <p className="text-xs font-semibold text-red-600 mb-1">{item.label}</p>
                    <p className="text-sm text-slate-800 bg-white rounded-lg p-2 border border-red-100">{value}</p>
                  </div>
                ) : null;
              })}
              {Object.values(phase1Data.reduceWork).every(v => !v) && (
                <p className="text-sm text-slate-500 italic">(입력 없음)</p>
              )}
            </div>
          </div>

          {/* Enhance Work */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm">4b</span>
              강화할 일
            </h3>
            <div className="space-y-3">
              {[
                { key: 'strategy', label: '전략/기획' },
                { key: 'collaboration', label: '협업/소통' },
                { key: 'quality', label: '품질 향상' },
                { key: 'proactive', label: '선제적 대응' },
              ].map((item) => {
                const value = phase1Data.enhanceWork[item.key as keyof typeof phase1Data.enhanceWork];
                return value ? (
                  <div key={item.key}>
                    <p className="text-xs font-semibold text-emerald-600 mb-1">{item.label}</p>
                    <p className="text-sm text-slate-800 bg-white rounded-lg p-2 border border-emerald-100">{value}</p>
                  </div>
                ) : null;
              })}
              {Object.values(phase1Data.enhanceWork).every(v => !v) && (
                <p className="text-sm text-slate-500 italic">(입력 없음)</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhase2Summary = () => {
    if (!phase2Data) return null;

    const selectedTasks = phase2Data.tasks.filter(t => phase2Data.selectedTaskIds.includes(t.id));

    return (
      <div className="space-y-6">
        {/* Domains */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-6 border border-cyan-200">
          <h3 className="text-lg font-bold text-cyan-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-sm">5</span>
            업무 도메인
          </h3>
          <div className="flex flex-wrap gap-2">
            {phase2Data.domains.map((domain, idx) => (
              <span key={idx} className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-medium">
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Uploaded Files */}
        {phase2Data.uploadedFiles.length > 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
            <h3 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm">6</span>
              업로드된 문서
            </h3>
            <div className="space-y-2">
              {phase2Data.uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-violet-100">
                  <span className="text-violet-600">📄</span>
                  <span className="text-slate-700">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tasks for Automation */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm">7-8</span>
            AI 자동화 후보 태스크 ({selectedTasks.length}개)
          </h3>
          <div className="space-y-3">
            {selectedTasks.map((task, idx) => (
              <div key={task.id} className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{task.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">{task.domain}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 rounded text-blue-600">{task.frequency}</span>
                      <span className="text-xs px-2 py-1 bg-purple-100 rounded text-purple-600">{task.timeSpent}시간/회</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {selectedTasks.length === 0 && (
              <p className="text-sm text-slate-500 italic text-center py-4">(선택된 태스크가 없습니다)</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className={`px-8 py-6 border-b ${phase === 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Phase {phase} 완료!
              </h2>
              <p className="text-white/80 mt-1">
                {phase === 1 ? '방향 설정이 완료되었습니다. 입력하신 내용을 확인하세요.' : '분석이 완료되었습니다. 입력하신 내용을 확인하세요.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div ref={summaryRef} className="bg-white p-6">
            {/* Title for export */}
            <div className="text-center mb-8 pb-6 border-b border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900">
                AI Work Re-design Workshop
              </h1>
              <p className="text-slate-600 mt-2">
                Phase {phase}: {phase === 1 ? '방향 설정 (Why 정의)' : '분석 (How 발견)'} 요약
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {phase === 1 ? renderPhase1Summary() : renderPhase2Summary()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAsImage}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              이미지 저장
            </button>
          </div>
          <button
            onClick={onContinue}
            className={`inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all ${
              phase === 1
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
            }`}
          >
            {phase === 1 ? 'Phase 2 시작하기' : 'Phase 3 시작하기'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
