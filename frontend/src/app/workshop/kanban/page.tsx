'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface ProcessFlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  x: number;
  y: number;
}

const ProcessFlowChart = ({
  nodes,
  selectedNode,
  onNodeSelect
}: {
  nodes: ProcessFlowNode[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string) => void;
}) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-500';
      case 'process': return 'bg-blue-500';
      case 'decision': return 'bg-yellow-500';
      case 'end': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeShape = (type: string) => {
    switch (type) {
      case 'decision': return 'transform rotate-45';
      case 'start':
      case 'end': return 'rounded-full';
      default: return 'rounded-lg';
    }
  };

  return (
    <div className="relative bg-gray-100 rounded-lg p-6 min-h-64 overflow-auto">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((node, index) => {
          if (index < nodes.length - 1) {
            const nextNode = nodes[index + 1];
            return (
              <line
                key={`line-${node.id}`}
                x1={node.x + 50}
                y1={node.y + 25}
                x2={nextNode.x + 50}
                y2={nextNode.y + 25}
                stroke="#6B7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
          return null;
        })}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7"
           refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
          </marker>
        </defs>
      </svg>

      {nodes.map(node => (
        <div
          key={node.id}
          className={`absolute w-24 h-12 flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all duration-200 ${getNodeColor(node.type)} ${getNodeShape(node.type)} ${
            selectedNode === node.id ? 'ring-4 ring-blue-300 scale-110' : 'hover:scale-105'
          }`}
          style={{ left: node.x, top: node.y }}
          onClick={() => onNodeSelect(node.id)}
        >
          <span className={node.type === 'decision' ? 'transform -rotate-45' : ''}>{node.label}</span>
        </div>
      ))}
    </div>
  );
};

const DetailedFlowChart = ({
  selectedProcess,
  onClose
}: {
  selectedProcess: ProcessFlowNode | null;
  onClose: () => void;
}) => {
  if (!selectedProcess) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            상세 자동화 계획: {selectedProcess.label}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">자동화 내용</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• 데이터 자동 수집 및 검증</li>
              <li>• 규칙 기반 처리 로직</li>
              <li>• 예외 상황 알림 시스템</li>
              <li>• 결과 자동 저장 및 보고</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">예상 효과</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• 처리 시간 80% 단축</li>
              <li>• 오류율 90% 감소</li>
              <li>• 인력 비용 절약</li>
              <li>• 업무 표준화</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KanbanWorkshop() {
  const [processFlowNodes, setProcessFlowNodes] = useState<ProcessFlowNode[]>([
    { id: '1', label: '업무 접수', type: 'start', x: 50, y: 50 },
    { id: '2', label: '분류 및 할당', type: 'process', x: 200, y: 50 },
    { id: '3', label: '검토 필요?', type: 'decision', x: 350, y: 50 },
    { id: '4', label: '처리 실행', type: 'process', x: 500, y: 50 },
    { id: '5', label: '완료', type: 'end', x: 650, y: 50 },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedFlowNode, setSelectedFlowNode] = useState<string | null>(null);
  const [showDetailedFlow, setShowDetailedFlow] = useState<ProcessFlowNode | null>(null);
  const workAreaRef = useRef<HTMLDivElement>(null);

  const exportWorkAreaAsImage = async () => {
    if (!workAreaRef.current) return;

    try {
      const canvas = await html2canvas(workAreaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = '팀장_업무영역_정리.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('이미지 내보내기 실패:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedFlowNode(nodeId);
    const selectedNode = processFlowNodes.find(node => node.id === nodeId);
    if (selectedNode) {
      setShowDetailedFlow(selectedNode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">업무 정리 대시보드</h1>
          <p className="text-gray-600">AI와 대화로 구체화한 업무 프로세스를 시각적으로 정리하고 관리하세요</p>
        </div>

        {/* 팀장의 업무 영역 정리 */}
        <div ref={workAreaRef} id="work-area-section" className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">팀장의 업무 영역 정리</h2>
            <button
              onClick={exportWorkAreaAsImage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>💾</span>
              이미지로 저장
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 주요 업무 영역 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">업무 관리</h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 문서 검토 및 승인</li>
                <li>• 팀 업무 계획 수립</li>
                <li>• 진행 상황 모니터링</li>
                <li>• 품질 관리</li>
              </ul>
            </div>

            {/* 인사 관리 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">인사 관리</h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 팀원 성과 평가</li>
                <li>• 업무 배정 및 조정</li>
                <li>• 교육 계획 수립</li>
                <li>• 1:1 면담</li>
              </ul>
            </div>

            {/* 보고 및 의사소통 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">보고 및 소통</h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 주간/월간 보고서 작성</li>
                <li>• 상급자 보고</li>
                <li>• 팀 회의 진행</li>
                <li>• 외부 협력사 소통</li>
              </ul>
            </div>
          </div>

          {/* 세부 업무 내용 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">세부 업무 내용</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-800">데이터 입력 및 검증</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    시스템에 업무 데이터를 입력하고 정확성을 검증하는 업무
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">소요시간: 30분/일</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">자동화 가능성: 높음</span>
                  </div>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-gray-800">보고서 작성</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    월간 업무 현황 보고서 작성 및 제출
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">소요시간: 2시간/월</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">자동화 가능성: 중간</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-gray-800">문서 검토 및 승인</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    제출된 문서의 형식과 내용을 검토하고 승인 처리
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">소요시간: 45분/일</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">자동화 가능성: 중간</span>
                  </div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-gray-800">팀 회의 진행</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    주간 팀 회의 준비 및 진행, 회의록 작성
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">소요시간: 1.5시간/주</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">자동화 가능성: 낮음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 자동화 대상 영역 강조 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">우선 자동화 대상 영역</h2>
              <p className="text-green-700 text-sm">높은 자동화 가능성과 효과를 가진 업무들</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">데이터 입력 및 검증</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">우선순위 1</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>💡 <strong>자동화 방안:</strong> RPA + 데이터 검증 룰 엔진</p>
                <p>⏰ <strong>예상 효과:</strong> 일일 30분 → 5분 (83% 단축)</p>
                <p>🔧 <strong>필요 도구:</strong> UiPath, Excel API</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">보고서 작성</h3>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">우선순위 2</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>💡 <strong>자동화 방안:</strong> 템플릿 기반 자동 생성</p>
                <p>⏰ <strong>예상 효과:</strong> 월 2시간 → 30분 (75% 단축)</p>
                <p>🔧 <strong>필요 도구:</strong> Power BI, PowerPoint API</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-100 rounded-lg">
            <h4 className="font-semibold text-emerald-800 mb-2">자동화 로드맵</h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">1단계: 데이터 입력 자동화 (4주)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-700">2단계: 보고서 생성 자동화 (6주)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700">3단계: 검증 프로세스 최적화 (8주)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI 자동화 업무 흐름도 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI 자동화 업무 흐름도</h2>

          {/* 도형 의미 설명 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">흐름도 기호 설명</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                <span>시작</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-lg mr-2"></div>
                <span>처리 과정</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-yellow-500 rounded mr-2 transform rotate-45"></div>
                <span>의사 결정</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-500 rounded-full mr-2"></div>
                <span>완료</span>
              </div>
            </div>
          </div>

          <ProcessFlowChart
            nodes={processFlowNodes}
            selectedNode={selectedFlowNode}
            onNodeSelect={handleNodeSelect}
          />
          <div className="mt-4 text-sm text-gray-600">
            💡 프로세스 노드를 클릭하면 자동화 상세 계획을 확인할 수 있습니다
          </div>
        </div>

        {/* 상세 플로우차트 모달 */}
        <DetailedFlowChart
          selectedProcess={showDetailedFlow}
          onClose={() => setShowDetailedFlow(null)}
        />
      </div>
    </div>
  );
}