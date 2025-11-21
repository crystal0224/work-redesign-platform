'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDropzone } from 'react-dropzone';
import Step4TaskExtraction from '@/components/workshop/Step4TaskExtraction';
import Step5AIConsultant from '@/components/workshop/Step5AIConsultant';
import Step6WorkflowDesign from '@/components/workshop/Step6WorkflowDesign';

// 이미지 생성을 위한 동적 import
const captureElement = async (element: HTMLElement) => {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    logging: false,
    useCORS: true
  });
};

// 워크샵 데이터 타입들
interface Workshop {
  id: string;
  domains: string[];
  fileIds: string[];
  tasks: Task[];
  selectedTaskIds: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  timeSpent: number;
  frequency: string;
  automation: 'high' | 'medium' | 'low';
  automationMethod: string;
  category: string;
  sourceFileId: string;
  sourceFilename: string;
  // 새로운 상세 정보 필드들
  details?: TaskDetails;
}

interface TaskDetails {
  tools: string[];           // 사용 도구/시스템
  inputData: string[];       // 입력 데이터 소스
  outputResult: string;      // 출력 결과물
  constraints: string[];     // 제약사항
  exceptions: string;        // 예외 상황
  automationPreference: number; // 자동화 선호도 (1-5)
  priority: number;          // 우선순위 (1-5)
  securityLevel: 'low' | 'medium' | 'high'; // 보안 수준
  additionalContext: string; // 추가 컨텍스트
}

interface ExtractedWorkItem {
  id: string;
  title: string;
  description: string;
  domain: string;
  frequency: string;
  timeSpent: number;
  complexity: 'low' | 'medium' | 'high';
  sourceFile: string;
}

interface UploadedFile {
  file: File;
  id: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  characteristics: string;
}

// 워크샵 단계 그룹 정의 (10단계를 5그룹으로 시각화)
const WORKSHOP_GROUPS = [
  {
    id: 1,
    title: '시작 & 준비',
    description: '워크샵 소개 및 업무영역 정의',
    icon: '🚀',
    steps: [1, 2],
    stepNames: ['시작하기', '업무영역 정의']
  },
  {
    id: 2,
    title: '업무 입력',
    description: '문서 업로드 및 AI 분석',
    icon: '📋',
    steps: [3, 4, 5],
    stepNames: ['문서 & 내용 입력', 'AI 분석', '업무 현황 검토']
  },
  {
    id: 3,
    title: '업무 정리',
    description: '상세화 및 시각적 정리',
    icon: '⚙️',
    steps: [6, 7],
    stepNames: ['업무 상세화', '시각적 정리']
  },
  {
    id: 4,
    title: '자동화 제안',
    description: '최종 자동화 계획 및 우선순위',
    icon: '✨',
    steps: [8, 9, 10],
    stepNames: ['우선순위 설정', '자동화 제안', '워크샵 완료']
  }
];

// 실제 워크샵 단계 정의 (내부 로직용)
const WORKSHOP_STEPS = [
  { id: 1, title: '워크샵 시작', description: '워크샵 개요 확인', icon: '🚀' },
  { id: 2, title: '업무영역 정의', description: '담당 업무 영역 설정', icon: '📋' },
  { id: 3, title: '업무 정보 입력', description: '문서 업로드 또는 직접 입력', icon: '📁' },
  { id: 4, title: '업무 현황 검토', description: '추출된 업무 확인', icon: '📝' },
  { id: 5, title: 'AI 자동화 컨설팅', description: 'AI와 대화하며 솔루션 설계', icon: '💬' },
  { id: 6, title: '워크플로우 설계', description: '자동화 워크플로우 상세 설계', icon: '🔧' },
  { id: 7, title: '결과 확인', description: '최종 결과 검토 및 다운로드', icon: '🎉' }
];

// 현재 단계가 속한 그룹 찾기
const getCurrentGroup = (step: number) => {
  return WORKSHOP_GROUPS.find(group => group.steps.includes(step)) || WORKSHOP_GROUPS[0];
};

// 그룹 완료 여부 확인
const isGroupCompleted = (group: any, currentStep: number) => {
  return group.steps.every((step: number) => step < currentStep);
};

// 그룹이 현재 활성 상태인지 확인
const isGroupActive = (group: any, currentStep: number) => {
  return group.steps.includes(currentStep);
};

// 업무 상세화 모달 컴포넌트
function TaskDetailsModal({
  task,
  onSave,
  onClose
}: {
  task: Task;
  onSave: (taskId: string, details: TaskDetails) => void;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<TaskDetails>(task.details || {
    tools: [],
    inputData: [],
    outputResult: '',
    constraints: [],
    exceptions: '',
    automationPreference: 3,
    priority: 3,
    securityLevel: 'medium',
    additionalContext: ''
  });

  const [newTool, setNewTool] = useState('');
  const [newInputData, setNewInputData] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  const addItem = (type: 'tools' | 'inputData' | 'constraints', value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setDetails(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (type: 'tools' | 'inputData' | 'constraints', index: number) => {
    setDetails(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(task.id, details);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{task.title} - 상세 정보</h3>
              <p className="text-gray-600 mt-1">더 정확한 자동화 분석을 위해 상세 정보를 입력해주세요</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 사용 도구/시스템 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용 도구/시스템 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('tools', newTool, setNewTool)}
                  placeholder="예: Excel, Slack, 사내시스템, API 등"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addItem('tools', newTool, setNewTool)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{tool}</span>
                    <button
                      onClick={() => removeItem('tools', index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 입력 데이터 소스 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입력 데이터 소스 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInputData}
                  onChange={(e) => setNewInputData(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('inputData', newInputData, setNewInputData)}
                  placeholder="예: CSV 파일, 이메일, 웹 폼, 데이터베이스 등"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addItem('inputData', newInputData, setNewInputData)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.inputData.map((data, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{data}</span>
                    <button
                      onClick={() => removeItem('inputData', index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 출력 결과물 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최종 출력 결과물 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details.outputResult}
              onChange={(e) => setDetails(prev => ({ ...prev, outputResult: e.target.value }))}
              placeholder="예: 정리된 리포트, 업데이트된 데이터베이스, 발송된 이메일 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 자동화 선호도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자동화 선호도 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={details.automationPreference}
                  onChange={(e) => setDetails(prev => ({ ...prev, automationPreference: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>낮음</span>
                  <span>보통</span>
                  <span>높음</span>
                </div>
                <div className="text-center text-sm font-medium">
                  {details.automationPreference}/5점
                </div>
              </div>
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자동화 우선순위 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={details.priority}
                  onChange={(e) => setDetails(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>낮음</span>
                  <span>보통</span>
                  <span>높음</span>
                </div>
                <div className="text-center text-sm font-medium">
                  {details.priority}/5점
                </div>
              </div>
            </div>
          </div>

          {/* 보안 수준 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보안 수준 <span className="text-red-500">*</span>
            </label>
            <select
              value={details.securityLevel}
              onChange={(e) => setDetails(prev => ({ ...prev, securityLevel: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">낮음 - 공개 정보, 일반 업무</option>
              <option value="medium">보통 - 내부 정보, 일반 개인정보</option>
              <option value="high">높음 - 기밀 정보, 민감한 개인정보</option>
            </select>
          </div>

          {/* 제약사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제약사항 및 주의점
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('constraints', newConstraint, setNewConstraint)}
                  placeholder="예: 승인 필요, 특정 시간대만 실행, 수동 검토 필수 등"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => addItem('constraints', newConstraint, setNewConstraint)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.constraints.map((constraint, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{constraint}</span>
                    <button
                      onClick={() => removeItem('constraints', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 예외 상황 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예외 상황 및 대응 방법
            </label>
            <textarea
              value={details.exceptions}
              onChange={(e) => setDetails(prev => ({ ...prev, exceptions: e.target.value }))}
              placeholder="예: 데이터가 누락된 경우, 시스템 오류 시 대응, 휴일 처리 방법 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* 추가 컨텍스트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 컨텍스트 및 특이사항
            </label>
            <textarea
              value={details.additionalContext}
              onChange={(e) => setDetails(prev => ({ ...prev, additionalContext: e.target.value }))}
              placeholder="자동화 시 고려해야 할 기타 사항들을 자유롭게 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!details.tools.length || !details.inputData.length || !details.outputResult.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkshopPage() {
  // ALL useState HOOKS FIRST
  const [currentStep, setCurrentStep] = useState(1);
  const [devMode, setDevMode] = useState(false); // 개발 모드 플래그
  const [workshop, setWorkshop] = useState<Workshop>({
    id: '',
    domains: ['', '', ''],
    fileIds: [],
    tasks: [],
    selectedTaskIds: []
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [manualTaskInput, setManualTaskInput] = useState<Record<string, string>>({});
  const [extractedWorkItems, setExtractedWorkItems] = useState<ExtractedWorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [automationSolutions, setAutomationSolutions] = useState<any[]>([]);

  // 개발 모드: 모든 단계 자동 채우기
  const fillDevData = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setWorkshop(prev => ({
        ...prev,
        domains: ['고객 문의 처리', '데이터 분석', '보고서 작성']
      }));
      setTimeout(() => setCurrentStep(3), 500);
    } else if (currentStep === 3) {
      // Step3 팀 현황 자동 채우기 - 다음 단계로
      setTimeout(() => setCurrentStep(4), 500);
    } else if (currentStep === 4) {
      // 업무 영역 자동 입력
      setWorkshop(prev => ({
        ...prev,
        domains: ['고객 문의 처리', '데이터 분석 및 리포트', '회의 및 보고']
      }));
      setTimeout(() => setCurrentStep(5), 500);
    } else if (currentStep === 5) {
      // 업무 내용 자동 입력
      setManualTaskInput({
        '고객 문의 처리': '매일 오전 9시 이메일 확인 (30분)\n고객 문의 분류 및 답변 (2시간)\n긴급 문의 처리 (1시간)',
        '데이터 분석 및 리포트': '주간 데이터 수집 (1시간)\nExcel 데이터 정제 (2시간)\n리포트 작성 및 차트 생성 (3시간)',
        '회의 및 보고': '일일 스탠드업 미팅 (30분)\n주간 팀 회의 (1시간)\n월간 보고서 작성 (4시간)'
      });

      // 워크샵을 백엔드에 실제로 생성
      if (!workshop.id) {
        try {
          const response = await fetch('/api/workshops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: '개발 테스트 워크샵',
              description: '빠른 테스트를 위한 워크샵',
              mission: '테스트',
              domains: ['고객 문의 처리', '데이터 분석 및 리포트', '회의 및 보고']
            }),
          });
          const data = await response.json();
          if (data.success) {
            setWorkshop(prev => ({
              ...prev,
              id: data.id,
              tasks: [
                {
                  id: 'task1',
                  title: '고객 이메일 확인 및 분류',
                  description: '매일 오전 9시 고객 이메일을 확인하고 긴급/일반/기술 문의로 분류',
                  timeSpent: 30,
                  frequency: '매일',
                  automation: 'high' as const,
                  automationMethod: 'AI 이메일 분류 시스템',
                  category: '고객 문의 처리',
                  sourceFileId: 'manual',
                  sourceFilename: '직접 입력'
                },
                {
                  id: 'task2',
                  title: '주간 데이터 수집 및 정제',
                  description: '매주 금요일 데이터베이스에서 주간 데이터를 추출하고 Excel로 정제',
                  timeSpent: 180,
                  frequency: '주간',
                  automation: 'medium' as const,
                  automationMethod: 'Python 스크립트 자동화',
                  category: '데이터 분석 및 리포트',
                  sourceFileId: 'manual',
                  sourceFilename: '직접 입력'
                },
                {
                  id: 'task3',
                  title: '월간 보고서 작성',
                  description: '매월 말 월간 성과 보고서를 작성하고 경영진에게 보고',
                  timeSpent: 240,
                  frequency: '월간',
                  automation: 'low' as const,
                  automationMethod: '템플릿 활용',
                  category: '회의 및 보고',
                  sourceFileId: 'manual',
                  sourceFilename: '직접 입력'
                }
              ]
            }));
            setTimeout(() => setCurrentStep(6), 500);
          }
        } catch (error) {
          console.error('Dev mode: Failed to create workshop', error);
        }
      } else {
        // 이미 워크샵이 있으면 바로 다음 단계로
        setTimeout(() => setCurrentStep(6), 500);
      }
    } else if (currentStep === 6) {
      // 다음 단계로
      setTimeout(() => setCurrentStep(7), 500);
    }
  };

  // Kanban board state
  const [kanbanTasks, setKanbanTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  }>({ todo: [], inProgress: [], done: [] });

  // 텍스트 입력 관련 상태
  const [activeTextInputTab, setActiveTextInputTab] = useState<string>('general');
  const [showDomainTips, setShowDomainTips] = useState(false);

  // 업무 상세화 관련 상태
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<string | null>(null);
  const [taskDetailsModal, setTaskDetailsModal] = useState(false);
  const [detailsCompletedTasks, setDetailsCompletedTasks] = useState<Set<string>>(new Set());

  // 팀 구성 관련 상태
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', role: '', characteristics: '' },
  ]);

  // ALL useRef HOOKS
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workflowAnalysisRef = useRef<HTMLDivElement>(null);

  // ALL useEffect HOOKS
  // Add custom styles for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Initialize kanban when selected tasks change
  useEffect(() => {
    if (workshop.selectedTaskIds.length > 0 && currentStep === 7) {
      initializeKanban();
    }
  }, [workshop.selectedTaskIds, currentStep]);

  // Socket.IO 연결 설정
  useEffect(() => {
    const socketConnection = io('http://localhost:3001');
    setSocket(socketConnection);

    // Socket 이벤트 핸들러들
    socketConnection.on('analysis-progress', (data) => {
      setAnalysisProgress(data.percent);
      setAnalysisStatus(data.message);
    });

    socketConnection.on('task-analyzed', (task) => {
      setExtractedWorkItems(prev => [...prev, {
        id: task.id,
        title: task.title,
        description: task.description,
        domain: task.category,
        frequency: mapAIFrequency(task.frequency),
        timeSpent: task.timeSpent || 1,
        complexity: mapAIComplexity(task.automation),
        sourceFile: task.sourceFilename
      }]);
    });

    socketConnection.on('analysis-complete', () => {
      setAnalysisProgress(100);
      setAnalysisStatus('분석 완료!');
      setTimeout(() => setCurrentStep(5), 1000);
    });

    socketConnection.on('analysis-error', (data) => {
      setError(data.message);
      setCurrentStep(3);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // CUSTOM HOOKS (useDropzone)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      handleFileSelection(acceptedFiles);
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // REGULAR FUNCTIONS (after all hooks)
  // Kanban board functions
  const initializeKanban = () => {
    const selectedTasks = workshop.tasks.filter(task => workshop.selectedTaskIds.includes(task.id));
    setKanbanTasks({
      todo: selectedTasks,
      inProgress: [],
      done: []
    });
  };

  const moveTask = (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    setKanbanTasks(prev => {
      const allTasks = [...prev.todo, ...prev.inProgress, ...prev.done];
      const taskToMove = allTasks.find(t => t.id === taskId);
      if (!taskToMove) return prev;

      return {
        todo: newStatus === 'todo' ? [...prev.todo.filter(t => t.id !== taskId), taskToMove] : prev.todo.filter(t => t.id !== taskId),
        inProgress: newStatus === 'inProgress' ? [...prev.inProgress.filter(t => t.id !== taskId), taskToMove] : prev.inProgress.filter(t => t.id !== taskId),
        done: newStatus === 'done' ? [...prev.done.filter(t => t.id !== taskId), taskToMove] : prev.done.filter(t => t.id !== taskId)
      };
    });
  };

  // Team member handling functions
  const addTeamMember = () => {
    const newId = (teamMembers.length + 1).toString();
    setTeamMembers([...teamMembers, { id: newId, name: '', role: '', characteristics: '' }]);
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const getGradientColor = (index: number) => {
    const colors = [
      'from-blue-100 to-blue-200 text-blue-700',
      'from-indigo-100 to-indigo-200 text-indigo-700',
      'from-purple-100 to-purple-200 text-purple-700',
      'from-pink-100 to-pink-200 text-pink-700',
      'from-rose-100 to-rose-200 text-rose-700',
      'from-cyan-100 to-cyan-200 text-cyan-700',
      'from-teal-100 to-teal-200 text-teal-700',
      'from-green-100 to-green-200 text-green-700',
    ];
    return colors[index % colors.length];
  };

  // File handling functions
  const handleFileSelection = (files: File[]) => {
    const newFiles: UploadedFile[] = [];
    setError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['docx', 'pdf', 'xlsx', 'xls'].includes(ext || '')) {
        setError(`${file.name}은(는) 지원하지 않는 형식입니다`);
        continue;
      }

      newFiles.push({
        file,
        id: `file_${Date.now()}_${i}`
      });
    }

    if (uploadedFiles.length + newFiles.length > 10) {
      setError('최대 10개 파일까지 업로드 가능합니다');
      return;
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setError('');
  };

  // Handle file input change event
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileSelection(Array.from(files));
    }
  };

  // Remove file from uploaded files
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle files upload
  const handleFilesUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('최소 1개 이상의 파일을 업로드해주세요');
      return;
    }
    await handleTasksSubmit();
  };

  // 5단계: 태스크 선택
  const toggleTaskSelection = (taskId: string) => {
    setWorkshop(prev => ({
      ...prev,
      selectedTaskIds: prev.selectedTaskIds.includes(taskId)
        ? prev.selectedTaskIds.filter(id => id !== taskId)
        : [...prev.selectedTaskIds, taskId]
    }));
  };

  const handleTasksSubmit = async () => {
    if (workshop.selectedTaskIds.length === 0) {
      setError('최소 1개 이상의 업무를 선택해주세요');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    uploadedFiles.forEach(({ file }) => {
      formData.append('files', file);
    });
    formData.append('workshopId', workshop.id);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setWorkshop(prev => ({ ...prev, fileIds: data.fileIds }));

        // 문서에서 업무 추출 (현재 단계는 analyzeWorkContent 내부에서 설정)
        await analyzeWorkContent();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('파일 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문서에서 업무 추출 - 실제 서버 연동
  const analyzeWorkContent = async () => {
    setLoading(true);
    setCurrentStep(4);
    setAnalysisProgress(0);
    setAnalysisStatus('분석 준비 중...');

    try {
      const tasks: ExtractedWorkItem[] = [];

      // 1. 파일 기반 분석 (Socket.IO로 실시간 진행)
      if (workshop.fileIds && workshop.fileIds.length > 0) {
        setAnalysisStatus('파일 분석 중...');

        if (socket) {
          socket.emit('start-analysis', {
            workshopId: workshop.id,
            fileIds: workshop.fileIds,
            domains: workshop.domains
          });
        }
      }

      // 2. 수동 입력 텍스트 AI 분석
      const textContent = Object.values(manualTaskInput)
        .filter(text => text && text.trim().length > 0)
        .join('\n\n');

      if (textContent.trim().length > 0) {
        setAnalysisStatus('텍스트 분석 중...');
        setAnalysisProgress(50);

        const response = await fetch('http://localhost:3001/api/analyze-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workshopId: workshop.id,
            textContent: textContent,
            domains: workshop.domains
          }),
        });

        const data = await response.json();

        if (data.success && data.tasks) {
          data.tasks.forEach((task: any) => {
            tasks.push({
              id: task.id || `manual-${Date.now()}-${Math.random()}`,
              title: task.title,
              description: task.description || task.automationMethod || '',
              domain: task.category || '전체 업무',
              frequency: mapAIFrequency(task.frequency || 'weekly'),
              timeSpent: task.timeSpent || 1,
              complexity: mapAIComplexity(task.automation || 'medium'),
              sourceFile: '직접 입력'
            });
          });
        }
      }

      // 파일 분석이 없고 텍스트만 있는 경우 직접 완료
      if (!workshop.fileIds || workshop.fileIds.length === 0) {
        setExtractedWorkItems(tasks);
        setAnalysisProgress(100);
        setAnalysisStatus('분석 완료!');
        setTimeout(() => setCurrentStep(5), 1000);
      }

    } catch (error) {
      console.error('❌ 업무 추출 오류:', error);

      // 더 구체적인 오류 메시지 제공
      let errorMessage = '업무 추출에 실패했습니다. ';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
      } else if (error instanceof Error) {
        errorMessage += `오류 내용: ${error.message}`;
      } else {
        errorMessage += '네트워크 연결을 확인하고 다시 시도해주세요.';
      }

      setError(errorMessage);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // AI 응답 데이터 변환 헬퍼 함수들
  const mapAIFrequency = (frequency: string): 'daily' | 'weekly' | 'monthly' => {
    if (frequency.includes('daily') || frequency.includes('일')) return 'daily';
    if (frequency.includes('monthly') || frequency.includes('월')) return 'monthly';
    return 'weekly';
  };

  const mapAIComplexity = (automation: string): 'low' | 'medium' | 'high' => {
    if (automation === 'high') return 'low'; // 자동화 가능성이 높으면 복잡도는 낮음
    if (automation === 'low') return 'high'; // 자동화 가능성이 낮으면 복잡도는 높음
    return 'medium';
  };

  // AI 분석 시뮬레이션
  const simulateAIAnalysis = async () => {
    setAnalysisProgress(0);
    setAnalysisStatus('분석 준비 중...');
    setAnalysisLogs([]);

    // 분석 단계 시뮬레이션
    const steps = [
      { percent: 10, message: '문서 읽기 중...', log: '📄 문서 파싱 시작' },
      { percent: 30, message: '업무 패턴 분석 중...', log: '🔍 반복 업무 패턴 탐지' },
      { percent: 50, message: '자동화 가능성 평가 중...', log: '⚡ 자동화 방안 평가' },
      { percent: 70, message: '업무 목록 생성 중...', log: '📋 업무 목록 구성' },
      { percent: 90, message: '최종 검토 중...', log: '✨ 결과 정리' },
      { percent: 100, message: '분석 완료!', log: '🎉 AI 분석 완료' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(step.percent);
      setAnalysisStatus(step.message);
      setAnalysisLogs(prev => [...prev, step.log]);
    }

    // 모의 업무 생성
    const mockTasks = [
      {
        id: 'task-1',
        title: '주간 성과 보고서 작성',
        description: '매주 팀 성과 데이터를 수집하고 보고서 양식에 맞춰 정리하는 업무',
        timeSpent: 2,
        frequency: 'weekly',
        automation: 'high' as const,
        automationMethod: 'Python 스크립트를 활용한 데이터 처리 자동화',
        category: '보고서 작성',
        sourceFileId: 'file-1',
        sourceFilename: '업무문서.xlsx'
      },
      {
        id: 'task-2',
        title: '고객 문의 응답 처리',
        description: '고객센터로 들어오는 문의사항을 검토하고 적절한 답변을 작성하는 업무',
        timeSpent: 1.5,
        frequency: 'daily',
        automation: 'medium' as const,
        automationMethod: 'AI 어시스턴트를 활용한 답변 템플릿 자동 생성',
        category: '고객 응대',
        sourceFileId: 'file-1',
        sourceFilename: '업무문서.xlsx'
      },
      {
        id: 'task-3',
        title: '데이터 수집 및 정리',
        description: '여러 시스템에서 데이터를 수집하고 Excel로 정리하는 업무',
        timeSpent: 3,
        frequency: 'daily',
        automation: 'high' as const,
        automationMethod: 'API 연동을 통한 자동 데이터 수집 및 정리',
        category: '데이터 분석',
        sourceFileId: 'file-1',
        sourceFilename: '업무문서.xlsx'
      }
    ];

    setWorkshop(prev => ({ ...prev, tasks: mockTasks }));

    setTimeout(() => {
      setCurrentStep(5);
    }, 1000);
  };

  // 1단계: 시작하기
  const handleStart = async () => {
    setCurrentStep(2);
  };

  // 도메인 추가
  const addDomain = () => {
    if (workshop.domains.length < 5) {
      setWorkshop(prev => ({ ...prev, domains: [...prev.domains, ''] }));
    }
  };

  // 도메인 삭제
  const removeDomain = (index: number) => {
    if (workshop.domains.length > 1) {
      const newDomains = workshop.domains.filter((_, i) => i !== index);
      setWorkshop(prev => ({ ...prev, domains: newDomains }));
    }
  };

  // 워크샵 생성 함수 (Step 3에서도 사용)
  const handleWorkshopCreate = async () => {
    if (!workshop.id) {
      // 워크샵이 아직 생성되지 않았다면 생성
      setLoading(true);
      try {
        const response = await fetch('/api/workshops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `워크샵_${new Date().toISOString()}`,
            domains: workshop.domains.filter(d => d.trim()),
            participantCount: 1
          }),
        });
        const data = await response.json();
        if (data.success) {
          setWorkshop(prev => ({ ...prev, id: data.id }));

          // 파일 업로드 처리
          if (uploadedFiles.length > 0) {
            await handleFilesUploadToServer(data.id);
          }

          setCurrentStep(6);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError('워크샵 생성 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(6);
    }
  };

  // 파일 업로드 처리
  const handleFilesUploadToServer = async (workshopId: string) => {
    const formData = new FormData();
    uploadedFiles.forEach(({ file }) => {
      formData.append('files', file);
    });
    formData.append('workshopId', workshopId);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setWorkshop(prev => ({ ...prev, fileIds: data.fileIds }));
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  // 2단계: 도메인 입력
  const handleDomainsSubmit = async () => {
    const validDomains = workshop.domains.filter(domain => domain.trim().length >= 3);
    if (validDomains.length < 2) {
      setError('최소 2개 이상의 업무 영역을 입력해주세요 (3글자 이상)');
      return;
    }
    if (validDomains.length > 5) {
      setError('최대 5개까지만 업무 영역을 입력할 수 있습니다');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `워크샵_${new Date().toISOString()}`,
          domains: validDomains,
          participantCount: 1
        }),
      });

      const data = await response.json();

      if (data.success) {
        setWorkshop(prev => ({ ...prev, id: data.id }));
        setCurrentStep(3);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.log('서버 연결 실패, 오프라인 모드로 진행합니다.');
      // 오프라인 모드: 로컬 ID 생성
      setWorkshop(prev => ({ ...prev, id: `offline_${Date.now()}` }));
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // 업무 상세화 관련 함수들
  const openTaskDetailsModal = (taskId: string) => {
    setSelectedTaskForDetails(taskId);
    setTaskDetailsModal(true);
  };

  const closeTaskDetailsModal = () => {
    setSelectedTaskForDetails(null);
    setTaskDetailsModal(false);
  };

  const saveTaskDetails = (taskId: string, details: TaskDetails) => {
    setWorkshop(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, details } : task
      )
    }));
    setDetailsCompletedTasks(prev => new Set([...Array.from(prev), taskId]));
    closeTaskDetailsModal();
  };

  const getTaskDetailsCompletionRate = () => {
    if (workshop.tasks.length === 0) return 0;
    return Math.round((detailsCompletedTasks.size / workshop.tasks.length) * 100);
  };

  // 워크플로우 분석 이미지 저장
  const saveWorkflowAnalysisImage = async () => {
    if (!workflowAnalysisRef.current) return;

    try {
      const canvas = await captureElement(workflowAnalysisRef.current);
      const link = document.createElement('a');
      link.download = `팀_업무_현황_분석_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      setError('이미지 저장에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      'docx': '📄',
      'pdf': '📕',
      'xlsx': '📊',
      'xls': '📊'
    };
    return icons[ext || ''] || '📄';
  };

  const translateAutomation = (level: string) => {
    const map: { [key: string]: string } = {
      high: '🟢 자동화 가능',
      medium: '🟡 부분 자동화',
      low: '🔴 자동화 어려움'
    };
    return map[level] || level;
  };

  const translateFrequency = (freq: string) => {
    const map: { [key: string]: string } = {
      daily: '일일',
      weekly: '주간',
      monthly: '월간'
    };
    return map[freq] || freq;
  };

  const translateComplexity = (complexity: string) => {
    const map: { [key: string]: string } = {
      low: '낮음',
      medium: '보통',
      high: '높음'
    };
    return map[complexity] || complexity;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* Dev Mode Button - Fixed position */}
      <button
        onClick={fillDevData}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        ⚡ 빠른 테스트 (Step {currentStep})
      </button>

      {/* Background animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Progress header with glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/95 via-indigo-900/95 to-slate-900/95 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: '워크샵 시작', range: [1, 2], icon: '🚀' },
                { title: '업무 분석', range: [3, 4], icon: '📊' },
                { title: '솔루션 설계', range: [5, 6], icon: '✨' },
                { title: '결과 확인', range: [7, 7], icon: '🎯' }
              ].map((section, index) => {
                const isActive = currentStep >= section.range[0] && currentStep <= section.range[1];
                const isCompleted = currentStep > section.range[1];

                return (
                  <div key={index} className={`backdrop-blur-md p-4 rounded-2xl transition-all shadow-lg ${isActive ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/50' :
                    isCompleted ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-green-500/30' :
                      'bg-white/10 text-gray-300 hover:bg-white/15'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{section.icon}</span>
                      <span className="text-xs font-medium opacity-70">
                        Step {section.range[0]}{section.range[0] !== section.range[1] && `-${section.range[1]}`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base">{section.title}</h3>
                    {isActive && (
                      <div className="mt-3 w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                          style={{
                            width: `${((currentStep - section.range[0] + 1) / (section.range[1] - section.range[0] + 1)) * 100}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">

          {/* Step 1: 워크샵 시작하기 - Dynamic & Immersive Design */}
          {currentStep === 1 && (
            <div className="relative min-h-screen -m-6 flex flex-col animate-fadeIn overflow-hidden">
              {/* Dynamic Gradient Background */}
              <div className="absolute inset-0 fixed bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(147,51,234,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 backdrop-blur-3xl bg-white/40"></div>
              </div>

              {/* Main Content Container */}
              <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-5xl mx-auto">

                  {/* Hero Section */}
                  <div className="text-center mb-16">
                    {/* Badge with Animation */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full mb-8 shadow-lg shadow-blue-500/10">
                      <div className="relative">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">팀장 워크샵</span>
                    </div>

                    {/* Simple Title */}
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Work Re-design
                      </span>
                    </h1>
                  </div>

                  {/* Impactful Message Section - Moved to top */}
                  <div className="text-center mb-16">
                    <div className="space-y-6">
                      {/* Philosophy */}
                      <div className="space-y-2">
                        <p className="text-base text-slate-600">
                          단순한 업무 자동화가 아닌
                        </p>
                        <p className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                          일하는 방식의{' '}
                          <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              근본적인 혁신
                            </span>
                            <span className="absolute bottom-1 left-0 right-0 h-4 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -z-0 blur-sm"></span>
                          </span>
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center justify-center gap-3 py-3">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                      </div>

                      {/* Main CTA Message */}
                      <div>
                        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                          팀장님께서는{' '}
                          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            &apos;진짜 일&apos;
                          </span>
                          에<br />
                          집중하세요!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2x2 Grid Layout */}
                  <div className="max-w-4xl mx-auto mb-20">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Step 1 - Blue Theme */}
                      <div className="group relative transform hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                        <div className="relative flex items-center gap-6 bg-white rounded-2xl p-7 shadow-lg shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-blue-200/50 transition-all duration-300">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-blue-500/30">
                              01
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors">일의 본질에 집중</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                              진짜 목적과 가치를 발견합니다
                            </p>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 - Indigo Theme */}
                      <div className="group relative transform hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                        <div className="relative flex items-center gap-6 bg-white rounded-2xl p-7 shadow-lg shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-indigo-200/50 transition-all duration-300">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-indigo-500/30">
                              02
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1.5 group-hover:text-indigo-700 transition-colors">관점을 확장</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                              새로운 접근법을 탐색합니다
                            </p>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 - Purple Theme */}
                      <div className="group relative transform hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                        <div className="relative flex items-center gap-6 bg-white rounded-2xl p-7 shadow-lg shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-purple-200/50 transition-all duration-300">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-purple-500/30">
                              03
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1.5 group-hover:text-purple-700 transition-colors">워크플로우를 재설계</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                              프로세스를 최적화합니다
                            </p>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 - Emerald Theme */}
                      <div className="group relative transform hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                        <div className="relative flex items-center gap-6 bg-white rounded-2xl p-7 shadow-lg shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-emerald-200/50 transition-all duration-300">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-emerald-500/30">
                              04
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">ERRC로 실행</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                              제거·축소·강화·창조합니다
                            </p>
                          </div>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prominent CTA Button */}
                  <div className="text-center">
                    <button
                      onClick={handleStart}
                      disabled={loading}
                      className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:shadow-indigo-500/50 hover:scale-[1.05] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <span className="relative">{loading ? '준비 중...' : '워크샵 시작하기'}</span>
                      <svg className="relative w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Step 2: 미션 작성하기 */}
          {currentStep === 2 && (
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-full mb-6">
                      <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Step 2</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      미션 작성하기
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      우리 팀의 존재 이유와 목표를 명확히 정의해봅시다
                    </p>
                  </div>

                  {/* Main Questions */}
                  <div className="space-y-6 mb-12">
                    {/* Question 1 */}
                    <div className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/60 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          01
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                            우리 팀이 올해 무엇을 어떻게 하면<br />
                            <span className="text-blue-600">잘했다</span>라고 평가할 수 있을까요?
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            팀의 성공 기준과 목표를 구체적으로 작성해주세요
                          </p>
                        </div>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="예시: 고객 만족도 90% 달성, 신규 고객 100개사 확보, 프로세스 자동화로 업무 시간 30% 단축"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 text-base transition-all resize-none"
                      />

                      {/* 미션 작성 가이드 */}
                      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-2xl">💡</span>
                          <h5 className="font-bold text-slate-900 text-base">미션 작성 가이드</h5>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* 잘 모르겠으면 */}
                          <div className="bg-white rounded-xl p-4 border border-blue-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">🤔</span>
                              <h6 className="font-bold text-slate-900 text-sm">잘 모르겠으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">팀이 없다면 어떤 문제가 생길까요?</strong><br />
                              그 문제를 해결하는 것이 바로 우리 팀의 미션입니다.
                            </p>
                          </div>

                          {/* 단순하게밖에 표현 못하겠으면 */}
                          <div className="bg-white rounded-xl p-4 border border-blue-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">✏️</span>
                              <h6 className="font-bold text-slate-900 text-sm">단순하게밖에 표현 못하겠으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">괜찮습니다!</strong><br />
                              "고객 만족도 높이기"부터 시작하세요. 구체적인 방법은 나중에 추가할 수 있습니다.
                            </p>
                          </div>

                          {/* 너무 여러가지 하고 있으면 */}
                          <div className="bg-white rounded-xl p-4 border border-blue-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">🎯</span>
                              <h6 className="font-bold text-slate-900 text-sm">너무 여러가지 하고 있으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">우선순위를 정하세요.</strong><br />
                              가장 중요한 3가지만 선택하세요. 나머지는 부차적인 활동입니다.
                            </p>
                          </div>

                          {/* 너무 짧게 쓰는게 어려우면 */}
                          <div className="bg-white rounded-xl p-4 border border-blue-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">📝</span>
                              <h6 className="font-bold text-slate-900 text-sm">너무 짧게 쓰는게 어려우면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">일단 길게 써보세요.</strong><br />
                              핵심 키워드를 뽑아서 한 문장으로 요약하면 됩니다. 예: "빠르고 정확한 고객 지원"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question 2 */}
                    <div className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/60 hover:shadow-xl hover:border-indigo-300 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          02
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                            우리 업무의 고객은 누구이고<br />
                            어떤 <span className="text-indigo-600">가치</span>를 만들어내야 할까요?
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            내부/외부 고객과 제공하는 핵심 가치를 명확히 해주세요
                          </p>
                        </div>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="예시: 고객사 담당자들에게 빠르고 정확한 문제 해결을 제공하여 신뢰를 구축하고, 내부 영업팀에게 데이터 기반 인사이트를 제공"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-base transition-all resize-none"
                      />

                      {/* 가치 작성이 어려울 때 참고하세요 */}
                      <div className="mt-6 bg-indigo-50 rounded-xl border border-indigo-200 p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-2xl">🎯</span>
                          <h5 className="font-bold text-slate-900 text-base">가치 작성이 어려울 때 참고하세요</h5>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* 고객이 누군지 모르겠으면 */}
                          <div className="bg-white rounded-xl p-4 border border-indigo-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">👥</span>
                              <h6 className="font-bold text-slate-900 text-sm">고객이 누군지 모르겠으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">우리 팀 결과물을 누가 받아서 사용하나요?</strong><br />
                              보고서를 받는 사람, 서비스를 이용하는 사람이 바로 고객입니다.
                            </p>
                          </div>

                          {/* 가치가 뭔지 모르겠으면 */}
                          <div className="bg-white rounded-xl p-4 border border-indigo-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">💎</span>
                              <h6 className="font-bold text-slate-900 text-sm">가치가 뭔지 모르겠으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">고객의 어떤 문제를 해결해주나요?</strong><br />
                              시간 절약? 정확한 정보? 빠른 의사결정? 그것이 바로 가치입니다.
                            </p>
                          </div>

                          {/* 내부 고객과 외부 고객이 헷갈리면 */}
                          <div className="bg-white rounded-xl p-4 border border-indigo-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">🔄</span>
                              <h6 className="font-bold text-slate-900 text-sm">내부/외부 고객이 헷갈리면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">둘 다 적어도 괜찮습니다!</strong><br />
                              영업팀(내부)과 고객사(외부) 모두에게 가치를 제공할 수 있습니다.
                            </p>
                          </div>

                          {/* 추상적으로밖에 표현 못하겠으면 */}
                          <div className="bg-white rounded-xl p-4 border border-indigo-200/60">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xl">✨</span>
                              <h6 className="font-bold text-slate-900 text-sm">추상적으로밖에 표현 못하겠으면?</h6>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <strong className="text-slate-900">구체적인 예시를 하나만 추가하세요.</strong><br />
                              "신뢰 구축" → "2시간 내 응답으로 신뢰 구축"처럼 방법을 덧붙이면 됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
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
          )}

          {/* Step 3: 팀 상황 확인하기 */}
          {currentStep === 3 && (
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-full mb-6">
                      <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Step 3</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      팀 상황 확인하기
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      우리 팀 구성원들을 떠올려보며 팀의 현재 모습을 파악해봅시다
                    </p>
                  </div>

                  {/* Main Question Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60 mb-8">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        👥
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                          현재 우리 팀은 어떤 사람들로 구성되어 있나요?
                        </h3>
                        <p className="text-slate-600 text-sm">
                          팀원들의 이름, 역할, 특징을 자유롭게 작성해주세요
                        </p>
                      </div>
                    </div>

                    {/* Team Member Input Area */}
                    <div className="space-y-4">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                          <div className="text-xs text-blue-700 font-semibold mb-1 uppercase">팀원 수</div>
                          <input
                            type="text"
                            placeholder="5명"
                            className="w-full bg-transparent text-2xl font-bold text-blue-900 border-none outline-none placeholder:text-blue-400/50"
                          />
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200">
                          <div className="text-xs text-indigo-700 font-semibold mb-1 uppercase">팀 결성 시기</div>
                          <input
                            type="text"
                            placeholder="2년 전"
                            className="w-full bg-transparent text-2xl font-bold text-indigo-900 border-none outline-none placeholder:text-indigo-400/50"
                          />
                        </div>
                      </div>

                      {/* Team Characteristics Selection */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4">우리 팀의 특징을 선택해주세요 (중복 선택 가능)</h4>

                        <div className="space-y-4">
                          {/* 역량 & 전문성 */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">💪 역량 & 전문성</h5>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">전문성이 높음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">멀티 플레이어 많음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">학습 의지 높음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">전문성 부족</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">역량 편차 큼</span>
                              </label>
                            </div>
                          </div>

                          {/* 경력 구성 */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">👥 경력 구성</h5>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">시니어 중심</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">주니어 중심</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">경력 골고루 분포</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">다양성이 있음</span>
                              </label>
                            </div>
                          </div>

                          {/* 협업 & 소통 */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">🤝 협업 & 소통</h5>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">협업 경험 많음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">소통이 활발함</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">수평적 문화</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">소통이 원활하지 않음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">협업 경험 부족</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">사일로 현상 (각자 일함)</span>
                              </label>
                            </div>
                          </div>

                          {/* 업무 스타일 */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">⚡ 업무 스타일</h5>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">빠른 실행력</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">꼼꼼하고 신중함</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">도전적이고 혁신적</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">안정적이고 체계적</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">자율성 높음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">실행력 부족</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">변화 저항 큼</span>
                              </label>
                            </div>
                          </div>

                          {/* 팀 상태 & 분위기 */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">🌟 팀 상태 & 분위기</h5>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">신규 팀 (결성 1년 이내)</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">안정기 팀</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">변화기 (구조조정/재편)</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">동기부여 높음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-green-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">팀워크 좋음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">동기부여 낮음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">번아웃/피로도 높음</span>
                              </label>
                              <label className="inline-flex items-center px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-red-300 transition-all">
                                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 focus:ring-2" />
                                <span className="ml-2 text-sm text-slate-700">이직률 높음</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Team Composition Overview */}
                      <div className="space-y-4">
                        <div className="mb-2">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                            <span className="text-lg">✍️</span>
                            추가로 설명하고 싶은 팀 특징이 있나요?
                          </h4>
                          <p className="text-xs text-slate-500">
                            💡 선택사항입니다. 위에서 선택한 것 외에 더 설명하고 싶은 내용만 간단히 적어주세요.
                          </p>
                        </div>

                        <textarea
                          placeholder="예시: 데이터 전문가 5명, 기획자 3명으로 분석 역량이 강함. 최근 신규 입사자 3명 합류로 팀 분위기 변화 중."
                          className="w-full h-24 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 resize-none"
                          style={{ lineHeight: '1.6' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Constraints Section */}
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/60 mb-8">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                          우리 팀이 업무를 하고 성과를 내는데 제약조건이 되는 사항은 무엇인가요?
                        </h3>
                        <p className="text-slate-600 text-sm">
                          해당되는 항목을 모두 선택해주세요 (중복 선택 가능)
                        </p>
                      </div>
                    </div>

                    {/* Constraint Checkboxes - 2 Columns */}
                    <div className="grid md:grid-cols-2 gap-3 mb-8">
                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">복잡하고 어려운 일이 많음</span>
                          <p className="text-xs text-slate-500 mt-1">고도의 전문성 필요, 복잡한 문제 해결</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">단순 반복 업무가 많음</span>
                          <p className="text-xs text-slate-500 mt-1">동일 패턴 리포트, 데이터 입력 등</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">조율 업무가 많음</span>
                          <p className="text-xs text-slate-500 mt-1">여러 부서 협의, 복잡한 승인 과정</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">외부 환경에 따라 계획 변경</span>
                          <p className="text-xs text-slate-500 mt-1">시장 변화, 고객 요청에 우선순위 수시 변경</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">업무 과부하 (인력 부족)</span>
                          <p className="text-xs text-slate-500 mt-1">해야 할 일 대비 팀원 수 부족</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">업무 표준화 부족</span>
                          <p className="text-xs text-slate-500 mt-1">매번 다르게 처리, 일관성 없음</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">정보/도구 부족</span>
                          <p className="text-xs text-slate-500 mt-1">필요한 시스템, 데이터 접근 어려움</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">긴급 요청이 많음</span>
                          <p className="text-xs text-slate-500 mt-1">갑작스런 요청으로 계획된 업무 중단</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">의사결정 지연</span>
                          <p className="text-xs text-slate-500 mt-1">승인/결정이 늦어져 업무 진행 막힘</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">레거시 시스템/프로세스</span>
                          <p className="text-xs text-slate-500 mt-1">오래되고 비효율적인 방식 사용</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">지식/노하우 공유 부족</span>
                          <p className="text-xs text-slate-500 mt-1">특정 사람만 알고 있어 병목 발생</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-orange-50 border-2 border-slate-200 hover:border-orange-300 rounded-xl cursor-pointer transition-all group">
                        <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500 focus:ring-2" />
                        <div className="flex-1">
                          <span className="text-base font-medium text-slate-900 group-hover:text-orange-700">품질 검증 시간 부족</span>
                          <p className="text-xs text-slate-500 mt-1">빠듯한 일정으로 검토 시간 없음</p>
                        </div>
                      </label>
                    </div>

                    {/* Controllable Issues Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
                          🎯
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900 mb-2">
                            이 중에서 팀장님께서 컨트롤할 수 있는 것은 어떤 문제인가요?
                          </h4>
                          <p className="text-sm text-slate-600 mb-3">
                            위에서 선택한 제약조건 중, 팀 내부에서 해결 가능한 것이 있다면 간단히 적어주세요.
                          </p>
                        </div>
                      </div>
                      <textarea
                        placeholder="예시: 단순 반복 업무는 자동화로 해결 가능할 것 같음. 업무 과부하는 우선순위 조정과 업무 분배 개선으로 일부 해결 가능."
                        className="w-full h-24 px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 resize-none"
                        style={{ lineHeight: '1.6' }}
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
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
          )}

          {/* Step 4: 업무 영역 작성하기 */}
          {currentStep === 4 && (
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-full mb-6">
                      <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Step 4</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      업무 영역 작성하기
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      앞서 떠올린 팀원들을 생각하며 우리 팀의 주요 업무 영역을 정의해봅시다
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
                      <p className="text-red-700 font-medium">⚠️ {error}</p>
                    </div>
                  )}

                  {/* Input area */}
                  <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">업무 영역 입력</h3>
                  <div className="space-y-4">
                    {workshop.domains.map((domain, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={domain}
                            onChange={(e) => {
                              const newDomains = [...workshop.domains];
                              newDomains[index] = e.target.value;
                              setWorkshop(prev => ({ ...prev, domains: newDomains }));
                            }}
                            placeholder="예: 고객 문의 처리, 매출 데이터 분석, 월간 보고서 작성"
                            className="w-full px-5 py-4 backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 text-base transition-all"
                          />
                        </div>
                        {workshop.domains.length > 1 && (
                          <button
                            onClick={() => removeDomain(index)}
                            className="w-10 h-10 text-red-500 hover:bg-red-50 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-xl transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                  {/* Guide Section */}
                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 rounded-3xl p-8 mb-8 border border-slate-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        💡
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">업무 영역 작성 가이드</h4>
                        <p className="text-slate-600 text-sm">우리 팀에 맞는 방식으로 자유롭게 작성하세요</p>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        <strong className="text-blue-900">💡 다양한 방식으로 작성할 수 있습니다!</strong><br />
                        팀 특성에 맞게 편한 방식을 선택하세요. 여러 방식을 섞어서 써도 좋습니다.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">👥</span>
                          <h5 className="font-bold text-slate-900 text-base">구성원별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          각 팀원이 담당하는 업무 중심으로 작성
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 김팀장-전략수립, 이대리-데이터분석, 박사원-리포트작성
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">⚙️</span>
                          <h5 className="font-bold text-slate-900 text-base">기능별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          업무의 기능/역할로 분류
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 영업, 마케팅, 고객관리, 분석, 기획, 운영
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">📊</span>
                          <h5 className="font-bold text-slate-900 text-base">보고라인별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          조직 구조에 따라 작성
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 본부장 보고업무, 팀 내부업무, 타팀 협업업무
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">⏰</span>
                          <h5 className="font-bold text-slate-900 text-base">시계열별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          주기와 타이밍으로 구분
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 일일업무, 주간업무, 월간업무, 분기업무, 수시업무
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">🎯</span>
                          <h5 className="font-bold text-slate-900 text-base">프로세스별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          업무 흐름 단계로 작성
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 기획→실행→분석→보고, 접수→처리→완료
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">🔍</span>
                          <h5 className="font-bold text-slate-900 text-base">중요도/시간별</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          비중이 큰 업무부터 작성
                        </p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          예: 핵심업무(70%), 지원업무(20%), 기타(10%)
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-slate-700">
                        <strong className="text-amber-900">✓ 구체적으로 작성하세요</strong><br />
                        "기타업무" ❌  →  "고객 문의 응답 및 클레임 처리" ✅
                      </p>
                    </div>
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전
                    </button>

                    <button
                      onClick={addDomain}
                      disabled={workshop.domains.length >= 5}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-emerald-300 border-dashed text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl">+</span>
                      업무 영역 추가 ({workshop.domains.length}/5)
                    </button>

                    <button
                      onClick={() => setCurrentStep(5)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02] transition-all"
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
          )}

          {/* Step 5: 업무 내용 작성하기 */}
          {currentStep === 5 && (
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-pink-200/50 rounded-full mb-6">
                      <span className="text-xs font-medium text-pink-700 uppercase tracking-wide">Step 5</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                      업무 내용 작성하기
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      문서를 업로드하거나 직접 작성하여 업무 내용을 입력해주세요
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
                      <p className="text-red-700 font-medium">⚠️ {error}</p>
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                        📄
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">문서 업로드</h3>
                        <p className="text-slate-600">업무 매뉴얼, 프로세스 문서 등을 업로드하여 자동으로 분석합니다</p>
                      </div>
                    </div>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-3 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-10 rounded-2xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/70 transition-all"
                    >
                      <div className="text-blue-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-slate-800 font-semibold text-lg mb-2">파일 선택 또는 드래그</p>
                      <p className="text-sm text-slate-600">DOCX, PDF, XLSX, XLS (최대 50MB)</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".docx,.pdf,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {uploadedFiles.length > 0 && (
                      <div className="mt-5 space-y-3">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIcon(file.file.name)}</span>
                              <div>
                                <div className="font-semibold text-slate-900">{file.file.name}</div>
                                <div className="text-sm text-slate-600">{formatFileSize(file.file.size)}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="w-9 h-9 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Direct Input Section */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                        ✍️
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">업무 영역별 직접 작성</h3>
                        <p className="text-slate-600">각 업무 영역별로 업무 내용을 직접 입력합니다</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {workshop.domains.filter(d => d.trim()).map((domain, index) => (
                        <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          <label className="block text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            {domain}
                          </label>
                          <textarea
                            value={manualTaskInput[domain] || ''}
                            onChange={(e) => setManualTaskInput(prev => ({
                              ...prev,
                              [domain]: e.target.value
                            }))}
                            placeholder={`${domain} 영역의 업무를 작성해주세요...
예시:
- 매일 오전 9시 고객 문의 메일 확인 및 답변 (30분 소요)
- 주간 매출 데이터 수집 및 보고서 작성 (매주 월요일, 2시간 소요)
- 월간 재고 현황 파악 및 발주 처리 (매월 말, 3시간 소요)`}
                            className="w-full h-40 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all resize-none text-sm"
                          />
                        </div>
                      ))}
                      <p className="text-sm text-slate-600 px-2">
                        * 업무별로 한 줄씩 작성하면 AI가 더 정확하게 분석합니다
                      </p>
                    </div>
                  </div>

                  {/* Guide Section */}
                  <div className="bg-gradient-to-br from-slate-50 to-pink-50/50 rounded-3xl p-8 mb-8 border border-slate-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                        💡
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">업무 내용 작성 가이드</h4>
                        <p className="text-slate-600 text-sm">어떤 내용을 작성하면 좋을까요?</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">📝</span>
                          <h5 className="font-bold text-slate-900 text-base">구체적인 업무 프로세스</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          "어떻게" 일하는지 단계별로<br />
                          작성하면 AI가 더 정확하게 분석합니다
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">🔄</span>
                          <h5 className="font-bold text-slate-900 text-base">반복 작업 위주로</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          정기적으로 하는 업무,<br />
                          패턴이 있는 업무를 우선 작성
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">⏱️</span>
                          <h5 className="font-bold text-slate-900 text-base">시간이 많이 드는 업무</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          하루에 1시간 이상 소요되는<br />
                          업무부터 작성하세요
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">🎯</span>
                          <h5 className="font-bold text-slate-900 text-base">개선하고 싶은 업무</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          비효율적이거나 자동화하고 싶은<br />
                          업무를 포함하세요
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전
                    </button>
                    <button
                      onClick={() => {
                        // 업무 영역별 입력을 하나의 문자열로 통합
                        const combinedInput = Object.entries(manualTaskInput)
                          .filter(([domain, tasks]) => tasks.trim())
                          .map(([domain, tasks]) => `[${domain}]\n${tasks}`)
                          .join('\n\n');

                        setManualInput(combinedInput);

                        // 워크샵이 생성되지 않았다면 먼저 생성
                        if (!workshop.id) {
                          handleWorkshopCreate();
                        } else {
                          setCurrentStep(6);
                        }
                      }}
                      disabled={loading || (uploadedFiles.length === 0 && Object.values(manualTaskInput).every(v => !v.trim()))}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-lg font-bold rounded-xl shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-rose-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '처리 중...' : '다음 단계로'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Step 6: 업무 추출 결과 */}
          {currentStep === 6 && (
            <Step4TaskExtraction
              workshopId={workshop.id || 'temp-workshop-id'}
              domains={workshop.domains}
              onNext={(tasks) => {
                setWorkshop(prev => ({ ...prev, tasks }));
                setCurrentStep(7);
              }}
              manualInput={manualInput}
            />
          )}

          {/* Step 7: 업무 상세화 */}
          {currentStep === 7 && (
            <Step5AIConsultant
              tasks={workshop.tasks}
              workshopId={workshop.id}
              onComplete={(selectedTask, insights) => {
                console.log('AI Consultant completed:', selectedTask, insights);
                setCurrentStep(8);
              }}
              onPrevious={() => setCurrentStep(6)}
            />
          )}

          {/* Step 8: 워크플로우 설계 */}
          {currentStep === 8 && (
            <Step6WorkflowDesign
              taskTitle={workshop.tasks.find(t => workshop.selectedTaskIds.includes(t.id))?.title || '선택된 업무'}
              conversationInsights={{}}
              onComplete={(workflow) => {
                console.log('Workflow completed:', workflow);
                setCurrentStep(9);
              }}
              onPrevious={() => setCurrentStep(7)}
            />
          )}

          {/* Step 9: 자동화 솔루션 생성 */}
          {currentStep === 9 && (
            <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>

              <div className="relative">
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">{WORKSHOP_STEPS[currentStep - 1]?.icon}</span>
                    </div>
                    <h2 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
                      {WORKSHOP_STEPS[currentStep - 1]?.title}
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      {WORKSHOP_STEPS[currentStep - 1]?.description}
                    </p>
                  </div>

                  {automationSolutions.length > 0 ? (
                    <>
                      {/* 자동화 솔루션 목록 */}
                      <div className="space-y-6 mb-8">
                        {automationSolutions.map((solution, index) => (
                          <div key={index} className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{solution.taskTitle}</h3>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${solution.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    solution.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                    {solution.priority === 'high' ? '최우선' :
                                      solution.priority === 'medium' ? '중요' : '일반'}
                                  </span>
                                  <span className="text-indigo-600">⏱️ {solution.timeSavingHours}h/주 절약</span>
                                  <span className="text-purple-600">📊 {solution.difficulty || 'medium'} 난이도</span>
                                </div>
                              </div>
                            </div>

                            {/* 자동화 솔루션 탭 */}
                            <div className="grid md:grid-cols-3 gap-4">
                              {/* AI 프롬프트 */}
                              <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                                <div className="flex items-center mb-3">
                                  <span className="text-lg mr-2">🤖</span>
                                  <h4 className="font-semibold text-slate-900">AI 프롬프트</h4>
                                </div>
                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded font-mono text-xs max-h-32 overflow-y-auto">
                                  {solution.aiPrompt || '프롬프트 생성 중...'}
                                </div>
                                <button className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm">
                                  프롬프트 복사
                                </button>
                              </div>

                              {/* n8n 워크플로우 */}
                              <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                                <div className="flex items-center mb-3">
                                  <span className="text-lg mr-2">🔗</span>
                                  <h4 className="font-semibold text-slate-900">n8n 워크플로우</h4>
                                </div>
                                <div className="text-sm text-slate-600">
                                  <div className="bg-slate-50 p-3 rounded mb-2">
                                    <span className="font-medium">노드 수:</span> {solution.n8nWorkflow?.nodes?.length || 0}개
                                  </div>
                                  <div className="bg-slate-50 p-3 rounded">
                                    <span className="font-medium">연결:</span> {Object.keys(solution.n8nWorkflow?.connections || {}).length}개
                                  </div>
                                </div>
                                <button className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm">
                                  워크플로우 다운로드
                                </button>
                              </div>

                              {/* Python 스크립트 */}
                              <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                                <div className="flex items-center mb-3">
                                  <span className="text-lg mr-2">🐍</span>
                                  <h4 className="font-semibold text-slate-900">Python 스크립트</h4>
                                </div>
                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded font-mono text-xs max-h-32 overflow-y-auto">
                                  {solution.pythonScript ? solution.pythonScript.substring(0, 200) + '...' : '스크립트 생성 중...'}
                                </div>
                                <button className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm">
                                  스크립트 다운로드
                                </button>
                              </div>
                            </div>

                            {/* 구현 가이드 */}
                            <div className="mt-4 backdrop-blur-sm bg-indigo-50/80 border border-indigo-200 rounded-xl p-4">
                              <h5 className="font-semibold text-indigo-900 mb-2">🛠️ 구현 가이드</h5>
                              <div className="text-sm text-indigo-800 space-y-1">
                                <p>• 1단계: 데이터 수집 자동화 설정</p>
                                <p>• 2단계: AI 에이전트 통합 및 테스트</p>
                                <p>• 3단계: 예외 처리 및 로그 설정</p>
                                <p>• 4단계: 대시보드 및 알림 설정</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 다운로드 옵션 */}
                      <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">📁 통합 다운로드</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            📄 전체 보고서 (PDF)
                          </button>
                          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            📈 구현 계획서 (Excel)
                          </button>
                          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            📦 솔루션 패키지 (ZIP)
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-8 shadow-xl text-center">
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-4xl">🎆</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">자동화 솔루션 준비 중</h3>
                      <p className="text-slate-600 mb-4">
                        선택된 업무들에 대한 AI 기반 자동화 솔루션을 생성하고 있습니다.
                      </p>
                      <button
                        onClick={() => {
                          // 이 나중에 실제 API 호출로 대체
                          setGeneratingSolutions(true);
                          setTimeout(() => {
                            setAutomationSolutions([
                              {
                                taskTitle: '데이터 분석 및 보고서 작성',
                                priority: 'high',
                                timeSavingHours: 8,
                                difficulty: 'medium',
                                aiPrompt: '주간 데이터를 분석하여 경영진 보고서를 자동 생성하는 AI 프롬프트',
                                n8nWorkflow: { nodes: [], connections: {} },
                                pythonScript: '# 데이터 분석 자동화 스크립트\nimport pandas as pd\n# 코드 예시...'
                              }
                            ]);
                            setGeneratingSolutions(false);
                          }, 2000);
                        }}
                        disabled={generatingSolutions}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingSolutions ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                            솔루션 생성 중...
                          </>
                        ) : (
                          '자동화 솔루션 생성 시작'
                        )}
                      </button>
                    </div>
                  )}

                  {/* 내비게이션 버튼 */}
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => setCurrentStep(8)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전 단계
                    </button>
                    <button
                      onClick={() => setCurrentStep(10)}
                      disabled={automationSolutions.length === 0}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      최종 보고서 보기
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 최종 단계: 임원급 자동화 전략 보고서 */}
          {currentStep === 10 && (
            <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>

              <div className="relative space-y-8">
                {/* 보고서 헤더 */}
                <div className="backdrop-blur-xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-white/60 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">팀 자동화 전략 실행 계획서</h1>
                      <p className="text-indigo-200 text-lg">AI 기반 업무 효율성 향상 로드맵</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                        <div className="text-2xl font-bold">{new Date().toLocaleDateString('ko-KR')}</div>
                        <div className="text-sm text-indigo-200">보고서 생성일</div>
                      </div>
                    </div>
                  </div>

                  {/* 핵심 성과 지표 */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-yellow-300">
                        {automationSolutions.filter(s => s.priority === 'high').length}개
                      </div>
                      <div className="text-sm text-indigo-200">우선 자동화 과제</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-green-300">
                        {Math.round(automationSolutions.reduce((acc, s) => acc + (s.timeSavingHours || 0), 0))}시간
                      </div>
                      <div className="text-sm text-indigo-200">월간 절약 시간</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-blue-300">
                        {automationSolutions.filter(s => s.difficulty === 'low').length}개
                      </div>
                      <div className="text-sm text-indigo-200">즉시 실행 가능</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <div className="text-2xl font-bold text-purple-300">90%</div>
                      <div className="text-sm text-indigo-200">예상 효율성 향상</div>
                    </div>
                  </div>
                </div>

                {/* 실행 우선순위 매트릭스 */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center tracking-tight">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">📊</span>
                    실행 우선순위 매트릭스
                  </h2>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* 높은 영향 & 낮은 난이도 (Quick Wins) */}
                    <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Quick Wins (즉시 실행)
                      </h3>
                      <div className="space-y-3">
                        {automationSolutions
                          .filter(s => s.priority === 'high' && s.difficulty === 'low')
                          .slice(0, 3)
                          .map((solution, index) => (
                            <div key={index} className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                              <div className="font-semibold text-slate-900">{solution.title}</div>
                              <div className="text-sm text-slate-600 mt-1">{solution.description}</div>
                              <div className="flex justify-between text-xs text-green-700 mt-2">
                                <span>예상 절약: {solution.timeSavingHours || 8}시간/월</span>
                                <span>실행 기간: 1-2주</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 높은 영향 & 높은 난이도 (Strategic Projects) */}
                    <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                        전략 프로젝트 (중장기 계획)
                      </h3>
                      <div className="space-y-3">
                        {automationSolutions
                          .filter(s => s.priority === 'high' && s.difficulty === 'high')
                          .slice(0, 3)
                          .map((solution, index) => (
                            <div key={index} className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                              <div className="font-semibold text-slate-900">{solution.title}</div>
                              <div className="text-sm text-slate-600 mt-1">{solution.description}</div>
                              <div className="flex justify-between text-xs text-indigo-700 mt-2">
                                <span>예상 절약: {solution.timeSavingHours || 16}시간/월</span>
                                <span>실행 기간: 2-3개월</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 낮은 영향 & 낮은 난이도 (Fill Ins) */}
                    <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        부가 개선 사항
                      </h3>
                      <div className="space-y-3">
                        {automationSolutions
                          .filter(s => s.priority === 'medium' && s.difficulty === 'low')
                          .slice(0, 2)
                          .map((solution, index) => (
                            <div key={index} className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                              <div className="font-semibold text-slate-900">{solution.title}</div>
                              <div className="text-sm text-slate-600 mt-1">{solution.description}</div>
                              <div className="text-xs text-yellow-700 mt-2">
                                예상 절약: {solution.timeSavingHours || 4}시간/월
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* 낮은 영향 & 높은 난이도 (Don't Do) */}
                    <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-slate-400 rounded-full mr-2"></span>
                        낮은 우선순위
                      </h3>
                      <div className="text-sm text-slate-600">
                        현재 분석 결과 이 영역에 해당하는 과제는 없습니다.
                        모든 제안사항이 높은 가치를 제공할 것으로 예상됩니다.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3개월 실행 로드맵 */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center tracking-tight">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">🗓️</span>
                    3개월 실행 로드맵
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* 1개월차 */}
                    <div className="backdrop-blur-xl bg-white/50 border-l-4 border-green-500 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">1개월차 - Quick Wins</h3>
                      <div className="space-y-4">
                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-semibold text-slate-900 mb-2">🔄 반복 업무 자동화</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• 이메일 자동 분류 설정</li>
                            <li>• 보고서 템플릿 자동화</li>
                            <li>• 일정 관리 시스템 구축</li>
                          </ul>
                          <div className="mt-3 text-xs font-medium text-green-700">
                            예상 효과: 주간 8시간 절약
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2개월차 */}
                    <div className="backdrop-blur-xl bg-white/50 border-l-4 border-indigo-500 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">2개월차 - 시스템 통합</h3>
                      <div className="space-y-4">
                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-semibold text-slate-900 mb-2">🔗 업무 프로세스 연동</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• 팀 협업 도구 통합</li>
                            <li>• 데이터 분석 대시보드</li>
                            <li>• 고객 응대 자동화</li>
                          </ul>
                          <div className="mt-3 text-xs font-medium text-indigo-700">
                            예상 효과: 주간 12시간 절약
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3개월차 */}
                    <div className="backdrop-blur-xl bg-white/50 border-l-4 border-purple-500 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">3개월차 - 고도화</h3>
                      <div className="space-y-4">
                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-semibold text-slate-900 mb-2">🚀 AI 업무 지원</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• 예측 분석 시스템</li>
                            <li>• 지능형 의사결정 지원</li>
                            <li>• 성과 최적화 도구</li>
                          </ul>
                          <div className="mt-3 text-xs font-medium text-purple-700">
                            예상 효과: 주간 20시간 절약
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI 분석 및 예상 성과 */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center tracking-tight">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">📈</span>
                    투자 대비 효과 (ROI) 분석
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* 정량적 효과 */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">📊 정량적 효과</h3>

                      <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                        <h4 className="font-bold text-indigo-900 mb-4">시간 절약 효과</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">주간 절약 시간</span>
                            <span className="font-bold text-indigo-700">40시간</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">월간 절약 시간</span>
                            <span className="font-bold text-indigo-700">160시간</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">연간 절약 시간</span>
                            <span className="font-bold text-indigo-700">2,080시간</span>
                          </div>
                        </div>
                      </div>

                      <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                        <h4 className="font-bold text-purple-900 mb-4">비용 절약 효과</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">월간 인건비 절약</span>
                            <span className="font-bold text-purple-700">₩8,000,000</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">연간 운영비 절약</span>
                            <span className="font-bold text-purple-700">₩96,000,000</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">투자 회수 기간</span>
                            <span className="font-bold text-purple-700">3개월</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 정성적 효과 */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">💎 정성적 효과</h3>

                      <div className="space-y-4">
                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-bold text-slate-900 mb-2">팀 생산성 향상</h4>
                          <p className="text-sm text-slate-600">반복 업무 감소로 인한 창의적 업무 집중도 증가</p>
                        </div>

                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-bold text-slate-900 mb-2">직원 만족도 개선</h4>
                          <p className="text-sm text-slate-600">업무 효율성 증대로 인한 워라밸 및 성취감 향상</p>
                        </div>

                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-bold text-slate-900 mb-2">데이터 기반 의사결정</h4>
                          <p className="text-sm text-slate-600">자동화된 분석 도구를 통한 신속하고 정확한 판단</p>
                        </div>

                        <div className="backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                          <h4 className="font-bold text-slate-900 mb-2">확장성 및 지속성</h4>
                          <p className="text-sm text-slate-600">구축된 자동화 인프라의 다른 팀 확산 가능성</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 플랜 및 다음 단계 */}
                <div className="backdrop-blur-xl bg-white/40 border-l-4 border-indigo-500 rounded-3xl p-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center tracking-tight">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">🎯</span>
                    실행 계획 및 다음 단계
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">📋 즉시 실행 사항</h3>
                      <div className="space-y-3">
                        {[
                          '팀원 대상 자동화 도구 교육 일정 수립',
                          'IT 지원팀과 기술 검토 미팅 스케줄링',
                          '1개월차 Quick Wins 프로젝트 착수',
                          '성과 측정을 위한 KPI 설정',
                          '예산 승인 및 리소스 확보'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400">
                            <input type="checkbox" className="mr-3 w-4 h-4 text-indigo-600" />
                            <span className="text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">📞 연락처 및 지원</h3>
                      <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl p-6 shadow-xl">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">프로젝트 매니저</h4>
                            <p className="text-slate-600">AI 자동화 전문팀</p>
                            <p className="text-indigo-600">automation@company.com</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">기술 지원</h4>
                            <p className="text-slate-600">IT 솔루션팀</p>
                            <p className="text-indigo-600">tech-support@company.com</p>
                          </div>
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center space-x-4">
                              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                                📧 보고서 이메일 전송
                              </button>
                              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                                💾 PDF 다운로드
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 네비게이션 버튼 */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(7)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      이전 단계
                    </button>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      워크샵 완료
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 업무 상세화 모달 */}
      {taskDetailsModal && selectedTaskForDetails && (
        <TaskDetailsModal
          task={workshop.tasks.find(t => t.id === selectedTaskForDetails)!}
          onSave={saveTaskDetails}
          onClose={closeTaskDetailsModal}
        />
      )}
    </div>
  );
}