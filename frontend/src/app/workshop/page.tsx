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
  const [workshop, setWorkshop] = useState<Workshop>({
    id: '',
    domains: ['', '', ''],
    fileIds: [],
    tasks: [],
    selectedTaskIds: []
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractedWorkItems, setExtractedWorkItems] = useState<ExtractedWorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [automationSolutions, setAutomationSolutions] = useState<any[]>([]);

  // Kanban board state
  const [kanbanTasks, setKanbanTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  }>({ todo: [], inProgress: [], done: [] });

  // 텍스트 입력 관련 상태
  const [manualTaskInput, setManualTaskInput] = useState<{[domain: string]: string}>({});
  const [activeTextInputTab, setActiveTextInputTab] = useState<string>('general');
  const [showDomainTips, setShowDomainTips] = useState(false);

  // 업무 상세화 관련 상태
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<string | null>(null);
  const [taskDetailsModal, setTaskDetailsModal] = useState(false);
  const [detailsCompletedTasks, setDetailsCompletedTasks] = useState<Set<string>>(new Set());

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
    if (workshop.selectedTaskIds.length > 0 && currentStep === 5) {
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
    if (workshop.domains.length < 10) {
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

  // 2단계: 도메인 입력
  const handleDomainsSubmit = async () => {
    const validDomains = workshop.domains.filter(domain => domain.trim().length >= 3);
    if (validDomains.length === 0) {
      setError('최소 1개 이상의 업무 영역을 입력해주세요 (3글자 이상)');
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
                  <div key={index} className={`backdrop-blur-md p-4 rounded-2xl transition-all shadow-lg ${
                    isActive ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/50' :
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

          {/* Step 1: 워크샵 시작하기 - 글래스모피즘 디자인 */}
          {currentStep === 1 && (
            <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
              {/* 애니메이션 배경 그라디언트 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>

              {/* 메인 컨텐츠 */}
              <div className="relative z-10 max-w-6xl mx-auto py-12">
                {/* 헤더 글래스 카드 */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-12 shadow-2xl shadow-indigo-200/50">
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
                      <span className="font-bold text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Work Re-design</span> 워크샵이 시작됩니다
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                      반복 업무를 넘어 AI가 더 잘할 수 있는 업무를 찾아<br />
                      자동화 가능성을 탐색하고 팀의 미래를 설계합니다
                    </p>
                  </div>
                </div>

                {/* 메인 글래스 카드 - 본격적인 시작에 앞서 */}
                <div className="backdrop-blur-2xl bg-white/50 border border-white/60 rounded-3xl p-12 mb-12 shadow-2xl shadow-indigo-300/30 hover:shadow-indigo-300/50 transition-all duration-500 hover:scale-[1.01]">
                  <h3 className="text-3xl font-semibold text-slate-900 mb-8 tracking-tight">
                    본격적인 시작에 앞서
                  </h3>
                  <div className="space-y-5 text-slate-700 text-lg leading-normal mb-10">
                    <p>
                      바쁜 일상 속에서 눈앞의 업무를 처리하느라 <span className="font-semibold text-slate-900 bg-gradient-to-r from-indigo-100 to-purple-100 px-2 py-0.5 rounded">미처 시도하지 못했던 일들</span>이 있으실 겁니다.
                    </p>
                    <p>
                      팀원들이 <span className="font-semibold text-slate-900 bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-0.5 rounded">배우고 싶어 하거나 경험했으면 하는 것들</span>, 혹은 팀장님께서 팀의 성장을 위해 <span className="font-semibold text-slate-900 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-0.5 rounded">시간을 투자하고 싶었던 영역들</span> 말이죠.
                    </p>
                    <p className="text-slate-600">
                      잠시 멈춰서서 그런 것들에 대해 생각해보는 시간을 가져보면 어떨까요?
                    </p>
                  </div>

                  {/* 입력 영역 - 네스티드 글래스 */}
                  <div className="backdrop-blur-md bg-white/60 border-2 border-indigo-200/50 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <p className="text-slate-900 font-semibold text-base leading-snug">
                        현재 하고 있는 일이 아닌, 미처 해보지 못한 일이 있다면 간단히 적어주세요
                      </p>
                    </div>
                    <div className="relative">
                      <textarea
                        className="w-full px-6 py-4 backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-200/50 transition-all resize-none text-slate-800 text-base placeholder-slate-400 leading-relaxed"
                        rows={5}
                        placeholder="예: 팀원 역량 개발 프로그램 기획, 업무 프로세스 개선 연구, 신기술 도입 검토 등"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                        자유롭게 작성해주세요
                      </div>
                    </div>
                  </div>
                </div>

                {/* 워크샵 진행 흐름 - 미니 글래스 카드 */}
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-slate-800 mb-5 text-center tracking-tight">워크샵 진행 흐름</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="backdrop-blur-lg bg-white/40 border border-white/60 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 backdrop-blur-md bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-300/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-base">업무 분석</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        현재 수행 중인 업무를 AI가 상세히 분석합니다
                      </p>
                    </div>

                    <div className="backdrop-blur-lg bg-white/40 border border-white/60 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-300/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-base">자동화 솔루션 설계</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        자동화 가능 영역을 찾고 최적 솔루션을 제안합니다
                      </p>
                    </div>

                    <div className="backdrop-blur-lg bg-white/40 border border-white/60 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 backdrop-blur-md bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-300/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-base">결과 확인 및 실습</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        자동화 방안을 검토하고 우선순위를 설정합니다
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI 활용 안내 */}
                <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-2xl p-4 mb-12">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      워크샵 진행 중에도 AI를 활용하여 <strong className="text-slate-800">작성보다는 사고에 집중</strong>할 수 있도록 설계했습니다
                    </p>
                  </div>
                </div>

                {/* 시작하기 버튼 */}
                <div className="text-center">
                  <button
                    onClick={handleStart}
                    disabled={loading}
                    className="group relative inline-flex items-center px-14 py-6 backdrop-blur-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-medium rounded-2xl overflow-hidden shadow-2xl shadow-indigo-300/50 hover:shadow-indigo-400/60 transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative">워크샵 시작하기</span>
                    <svg className="relative ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 업무영역 정의 */}
          {currentStep === 2 && (
            <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>

              {/* Content */}
              <div className="relative">
                {/* Header glass card */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight text-center">
                    업무 영역 정의
                  </h2>
                  <p className="text-lg text-slate-600 text-center">
                    담당하고 계신 주요 업무 영역을 입력해주세요
                  </p>
                </div>

                {/* Guide section - glass card */}
                <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-3xl p-8 mb-8 shadow-xl">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-300/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-slate-900 mb-5 tracking-tight">효과적인 업무 영역 정의 방법</h3>
                      <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-slate-700">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 text-xl font-bold mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900">구체적으로 작성</strong>
                            <p className="text-sm text-slate-600 mt-1">"기타업무" → "고객 문의 응답 및 클레임 처리"</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 text-xl font-bold mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900">기능별로 분류</strong>
                            <p className="text-sm text-slate-600 mt-1">"영업", "관리", "분석" 등으로 구분</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 text-xl font-bold mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900">시간 비중 고려</strong>
                            <p className="text-sm text-slate-600 mt-1">많은 시간을 할애하는 업무를 우선 입력</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 text-xl font-bold mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900">예시 참고</strong>
                            <p className="text-sm text-slate-600 mt-1">"매출 데이터 분석", "고객사 미팅 준비"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="backdrop-blur-xl bg-red-50/90 border border-red-200 rounded-2xl px-5 py-4 mb-6 shadow-lg">
                    <p className="text-red-700 font-medium">⚠️ {error}</p>
                  </div>
                )}

                {/* Input area - glass card */}
                <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-3xl p-8 mb-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6 tracking-tight">업무 영역 입력</h3>
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

                {/* Bottom buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={addDomain}
                    disabled={workshop.domains.length >= 10}
                    className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-white/50 border border-indigo-300 border-dashed text-indigo-700 font-semibold rounded-xl hover:bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">+</span>
                    업무 영역 추가
                  </button>
                  <button
                    onClick={handleDomainsSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? '처리 중...' : '다음 단계로'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 업무 내용 입력 */}
          {currentStep === 3 && (
            <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
              </div>

              {/* Content */}
              <div className="relative">
                {/* Header glass card */}
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-8 shadow-2xl shadow-indigo-200/50">
                  <h2 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight text-center">
                    업무 내용 입력
                  </h2>
                  <p className="text-lg text-slate-600 text-center">
                    문서 업로드 또는 직접 작성 중 선택하여 업무 내용을 입력해주세요
                  </p>
                </div>

                {/* Guide section - glass card */}
                <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-3xl p-8 mb-8 shadow-xl">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-300/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📚</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-slate-900 mb-5 tracking-tight">업무 내용 입력 가이드</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="backdrop-blur-md bg-white/70 border border-white/60 rounded-2xl p-6 shadow-lg">
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                            <span className="text-2xl">📄</span>
                            문서 업로드 시
                          </h4>
                          <div className="space-y-2.5 text-slate-700 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>업무 매뉴얼, 프로세스 문서</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>보고서 템플릿, 양식 파일</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>업무 관련 스프레드시트</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span><strong>지원 형식:</strong> DOCX, PDF, XLSX</span>
                            </div>
                          </div>
                        </div>
                        <div className="backdrop-blur-md bg-white/70 border border-white/60 rounded-2xl p-6 shadow-lg">
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                            <span className="text-2xl">✍️</span>
                            직접 입력 시
                          </h4>
                          <div className="space-y-2.5 text-slate-700 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>구체적인 업무 단계별 설명</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>반복 주기와 소요 시간 명시</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>사용하는 도구 및 시스템 언급</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span><strong>예시:</strong> "매주 월요일 매출 데이터를..."</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="backdrop-blur-xl bg-red-50/90 border border-red-200 rounded-2xl px-5 py-4 mb-6 shadow-lg">
                    <p className="text-red-700 font-medium">⚠️ {error}</p>
                  </div>
                )}

                {/* Input areas - grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  {/* File upload section - glass card */}
                  <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
                      <span className="text-2xl">📎</span>
                      파일 업로드
                    </h3>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-3 border-dashed border-indigo-300 backdrop-blur-md bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-10 rounded-2xl text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/70 transition-all"
                    >
                      <div className="text-indigo-600 mb-4">
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
                          <div key={file.id} className="flex items-center justify-between backdrop-blur-md bg-white/70 border border-white/60 p-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIcon(file.file.name)}</span>
                              <div>
                                <div className="font-semibold text-slate-900">{file.file.name}</div>
                                <div className="text-sm text-slate-600">{formatFileSize(file.file.size)}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="w-9 h-9 text-red-500 hover:bg-red-50 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
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

                  {/* Manual input section - glass card */}
                  <div className="backdrop-blur-xl bg-white/50 border border-white/60 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
                      <span className="text-2xl">✏️</span>
                      직접 작성
                    </h3>

                    <div className="space-y-4">
                      {workshop.domains.filter(d => d.trim()).map((domain, index) => (
                        <div key={index}>
                          <label className="block text-base font-semibold text-slate-800 mb-2">
                            {domain} 관련 업무
                          </label>
                          <textarea
                            value={manualTaskInput[domain] || ''}
                            onChange={(e) => setManualTaskInput(prev => ({ ...prev, [domain]: e.target.value }))}
                            placeholder={`${domain} 영역의 업무를 구체적으로 작성해주세요...`}
                            className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all resize-none"
                            rows={5}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom button */}
                <div className="flex justify-end">
                  <button
                    onClick={analyzeWorkContent}
                    disabled={loading || (uploadedFiles.length === 0 && Object.values(manualTaskInput).every(v => !v || !v.trim()))}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '분석 중...' : 'AI 분석 시작'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 업무 추출 결과 */}
          {currentStep === 4 && (
            <Step4TaskExtraction
              tasks={workshop.tasks}
              selectedTaskIds={workshop.selectedTaskIds}
              toggleTaskSelection={toggleTaskSelection}
              error={error}
              onBack={() => setCurrentStep(3)}
              onNext={() => setCurrentStep(5)}
            />
          )}

          {/* Step 5: 업무 상세화 */}
          {currentStep === 5 && (
            <Step5AIConsultant
              selectedTaskIds={workshop.selectedTaskIds}
              kanbanTasks={kanbanTasks}
              moveTask={moveTask}
              onBack={() => setCurrentStep(4)}
              onNext={() => setCurrentStep(6)}
            />
          )}

          {/* Step 6: 워크플로우 설계 */}
          {currentStep === 6 && (
            <Step6WorkflowDesign
              taskTitle={workshop.tasks.find(t => workshop.selectedTaskIds.includes(t.id))?.title || '선택된 업무'}
              conversationInsights={{}}
              onComplete={(workflow) => {
                console.log('Workflow completed:', workflow);
                setCurrentStep(7);
              }}
            />
          )}

          {/* Step 7: 자동화 솔루션 생성 */}
          {currentStep === 7 && (
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
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    solution.priority === 'high' ? 'bg-red-100 text-red-800' :
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
                      onClick={() => setCurrentStep(6)}
                      className="px-6 py-3 backdrop-blur-sm bg-slate-500/80 text-white font-semibold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      ← 이전 단계
                    </button>
                    <button
                      onClick={() => setCurrentStep(8)}
                      disabled={automationSolutions.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      최종 보고서 보기 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 최종 단계: 임원급 자동화 전략 보고서 */}
          {currentStep === 8 && (
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