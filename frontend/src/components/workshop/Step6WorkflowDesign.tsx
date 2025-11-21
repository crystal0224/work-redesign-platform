'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface WorkflowNode {
  id: string;
  type: 'human' | 'ai' | 'hybrid';
  title: string;
  description: string;
  details: string[];
  position: number;
}

interface Step6WorkflowDesignProps {
  taskTitle: string;
  conversationInsights: any;
  onComplete: (workflow: WorkflowNode[]) => void;
  onPrevious?: () => void;
}

export default function Step6WorkflowDesign({
  taskTitle,
  conversationInsights,
  onComplete,
  onPrevious
}: Step6WorkflowDesignProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: '1',
      type: 'human',
      title: '업무 요청 접수',
      description: '담당자가 업무 요청을 확인하고 검토',
      details: ['요청 내용 확인', '우선순위 판단', '담당자 배정'],
      position: 0,
    },
    {
      id: '2',
      type: 'ai',
      title: '데이터 수집 및 분석',
      description: 'AI가 관련 데이터를 자동으로 수집하고 분석',
      details: ['데이터베이스 조회', '외부 API 호출', '데이터 정제 및 통합'],
      position: 1,
    },
    {
      id: '3',
      type: 'hybrid',
      title: '초안 작성 및 검토',
      description: 'AI가 초안을 작성하고 사람이 검토',
      details: ['AI: 분석 결과 기반 문서 초안 생성', '사람: 내용 검토 및 수정', '사람: 최종 승인'],
      position: 2,
    },
    {
      id: '4',
      type: 'ai',
      title: '자동 배포 및 알림',
      description: 'AI가 승인된 결과물을 자동으로 배포',
      details: ['관련 부서에 이메일 발송', '대시보드 업데이트', '보고서 자동 저장'],
      position: 3,
    },
    {
      id: '5',
      type: 'human',
      title: '피드백 수집',
      description: '사용자 피드백을 수집하고 프로세스 개선',
      details: ['만족도 조사', '개선사항 도출', '다음 사이클에 반영'],
      position: 4,
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, position: index }));
      });
    }
  };

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'human':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          border: 'border-blue-400',
          icon: '👤',
          label: '사람',
          iconBg: 'bg-blue-400',
        };
      case 'ai':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
          border: 'border-purple-400',
          icon: '🤖',
          label: 'AI',
          iconBg: 'bg-purple-400',
        };
      case 'hybrid':
        return {
          bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          border: 'border-emerald-400',
          icon: '🤝',
          label: '협업',
          iconBg: 'bg-emerald-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-slate-600',
          border: 'border-gray-400',
          icon: '📋',
          label: '기타',
          iconBg: 'bg-gray-400',
        };
    }
  };

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: 'human',
      title: '새 작업 단계',
      description: '작업 설명을 입력하세요',
      details: ['세부 활동 1', '세부 활동 2'],
      position: nodes.length,
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id).map((node, index) => ({ ...node, position: index })));
  };

  const editNode = (node: WorkflowNode) => {
    setSelectedNode(node);
    setIsEditModalOpen(true);
  };

  const saveNodeEdit = (updatedNode: WorkflowNode) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node));
    setIsEditModalOpen(false);
    setSelectedNode(null);
  };

  return (
    <div className="relative min-h-screen -m-6 flex flex-col items-center animate-fadeIn overflow-x-hidden">
      {/* Modern Gradient Mesh Background - Matching Step 1 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 fixed">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.08)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section - Matching Step 1 Style */}
        <div className="text-center mb-16">
          {/* Section Label */}
          <div className="mb-4">
            <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
              🤖 AI로 일 자동화하기
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-white/80 backdrop-blur-xl border border-blue-100 rounded-full shadow-lg shadow-blue-100/50 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-60 animate-pulse"></div>
              <div className="relative w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-700 uppercase">Step 6: Workflow Design</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
            <span className="inline-block bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              최종 워크플로우 설계
            </span>
          </h1>

          {/* Subtitle */}
          <div className="space-y-4">
            <p className="text-2xl font-light text-slate-800 tracking-tight">
              AI와 함께 <span className="font-semibold text-blue-700">새로운 업무 프로세스</span>를 완성하세요
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              드래그 앤 드롭으로 업무 흐름을 재구성하고 역할을 할당합니다
            </p>
          </div>
        </div>

        {/* 범례 */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl p-6 mb-8 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">작업 유형</h3>
          <div className="flex flex-wrap gap-4">
            {['human', 'ai', 'hybrid'].map(type => {
              const style = getNodeStyle(type);
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${style.iconBg} rounded-lg flex items-center justify-center text-white shadow-md`}>
                    {style.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{style.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 워크플로우 캔버스 */}
        <div className="backdrop-blur-2xl bg-white/50 border border-white/60 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">워크플로우 단계</h3>
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              단계 추가
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="space-y-4">
              {nodes.sort((a, b) => a.position - b.position).map((node, index) => {
                const style = getNodeStyle(node.type);
                return (
                  <div key={node.id} className="relative">
                    {/* 연결선 */}
                    {index < nodes.length - 1 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full h-6 w-0.5 bg-gradient-to-b from-slate-300 to-transparent z-0" />
                    )}

                    {/* 노드 카드 */}
                    <div
                      className="relative backdrop-blur-xl bg-white/70 border-2 border-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-move group"
                    >
                      <div className="flex gap-6 p-6">
                        {/* 순서 표시 */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <div className="w-12 h-12 backdrop-blur-md bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-slate-700">{index + 1}</span>
                          </div>
                          <div className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                            {style.icon}
                          </div>
                        </div>

                        {/* 노드 내용 */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-slate-900">{node.title}</h4>
                                <span className={`${style.bg} text-white px-3 py-1 rounded-full text-xs font-medium shadow-md`}>
                                  {style.label}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-relaxed">{node.description}</p>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                              <button
                                onClick={() => editNode(node)}
                                className="p-2 backdrop-blur-md bg-white/80 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                title="수정"
                              >
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteNode(node.id)}
                                className="p-2 backdrop-blur-md bg-white/80 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                title="삭제"
                              >
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* 세부 활동 */}
                          <div className="backdrop-blur-md bg-white/60 border border-white/80 rounded-xl p-4 mt-4">
                            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              세부 활동
                            </h5>
                            <ul className="space-y-2">
                              {node.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="text-indigo-600 mt-0.5">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DndContext>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-6 mt-16">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="group relative px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-blue-300 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                이전 단계
              </span>
            </button>
          )}

          <button
            onClick={() => onComplete(nodes)}
            className="group relative z-50 cursor-pointer inline-flex items-center justify-center gap-4 px-12 py-4 bg-slate-900 text-white text-xl font-bold rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/30 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative">워크숍 완료</span>
            <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 편집 모달 */}
      {isEditModalOpen && selectedNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 border-2 border-white/60 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">단계 수정</h3>

              <div className="space-y-6">
                {/* 타입 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">작업 유형</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['human', 'ai', 'hybrid'] as const).map(type => {
                      const style = getNodeStyle(type);
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedNode({ ...selectedNode, type })}
                          className={`p-4 border-2 rounded-xl transition-all ${selectedNode.type === type
                              ? `${style.border} bg-gradient-to-br ${style.bg.replace('from-', 'from-').replace('to-', 'to-')}/10 shadow-lg`
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="text-3xl mb-2">{style.icon}</div>
                          <div className="text-sm font-medium text-slate-900">{style.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">단계 제목</label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => setSelectedNode({ ...selectedNode, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
                  <textarea
                    value={selectedNode.description}
                    onChange={(e) => setSelectedNode({ ...selectedNode, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                  />
                </div>

                {/* 세부 활동 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">세부 활동</label>
                  <div className="space-y-2">
                    {selectedNode.details.map((detail, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) => {
                            const newDetails = [...selectedNode.details];
                            newDetails[index] = e.target.value;
                            setSelectedNode({ ...selectedNode, details: newDetails });
                          }}
                          className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                        />
                        <button
                          onClick={() => {
                            const newDetails = selectedNode.details.filter((_, i) => i !== index);
                            setSelectedNode({ ...selectedNode, details: newDetails });
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setSelectedNode({ ...selectedNode, details: [...selectedNode.details, ''] })}
                      className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                      + 활동 추가
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedNode(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => saveNodeEdit(selectedNode)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
