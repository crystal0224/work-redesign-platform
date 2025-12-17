'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import { API_CONFIG } from '@/config/api';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { showToast } from '@/utils/toast';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types matching backend ExtractedTask
export interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  domain: string;
  estimatedStatus: 'Progress' | 'Planned' | 'Not Started' | 'Completed';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Ad-hoc';
  automationPotential: 'High' | 'Medium' | 'Low';
  source: 'uploaded' | 'manual';
}

interface Step4TaskExtractionProps {
  workshopId: string;
  domains: string[];
  onNext: (tasks: ExtractedTask[]) => void;
  manualInput?: string;
  initialTasks?: ExtractedTask[];
  onBack?: () => void;
}

// Sortable Task Card Component
function SortableTaskCard({
  task,
  onEdit,
  onDelete
}: {
  task: ExtractedTask;
  onEdit: (task: ExtractedTask) => void;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: ExtractedTask['estimatedStatus']) => {
    switch (status) {
      case 'Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAutomationColor = (potential: ExtractedTask['automationPotential']) => {
    switch (potential) {
      case 'High': return 'bg-green-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getFrequencyIcon = (frequency: ExtractedTask['frequency']) => {
    switch (frequency) {
      case 'Daily': return '☀️';
      case 'Weekly': return '📅';
      case 'Monthly': return '📆';
      case 'Quarterly': return '🗓️';
      case 'Yearly': return '📊';
      case 'Ad-hoc': return '⚡';
      default: return '📝';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 업무를 삭제하시겠습니까?')) {
      onDelete(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative backdrop-blur-lg bg-white/70 border border-white/60 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      {...attributes}
      {...listeners}
    >
      {/* Drag handle indicator */}
      <div className="absolute top-3 left-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:scale-110 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Task content */}
      <div className="pl-6 pr-8" onClick={() => onEdit(task)}>
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-gray-900 text-base flex-1 pr-2">{task.title}</h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAutomationColor(task.automationPotential)} shrink-0`}>
            {task.automationPotential}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className={`px-2 py-1 rounded border ${getStatusColor(task.estimatedStatus)}`}>
            {task.estimatedStatus}
          </span>
          <span className="flex items-center gap-1">
            {getFrequencyIcon(task.frequency)} {task.frequency}
          </span>
          <span className="flex items-center gap-1">
            {task.source === 'uploaded' ? '📄' : '✍️'} {task.source === 'uploaded' ? '문서' : '입력'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Domain Column Component with Droppable support
function DomainColumn({
  domain,
  tasks,
  onEdit,
  onDelete,
}: {
  domain: string;
  tasks: ExtractedTask[];
  onEdit: (task: ExtractedTask) => void;
  onDelete: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${domain}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`backdrop-blur-xl border rounded-2xl p-6 min-h-[400px] flex flex-col transition-all duration-300 ${isOver
        ? 'bg-indigo-100/60 border-indigo-400 border-2 scale-[1.02] shadow-2xl'
        : 'bg-white/40 border-white/60'
        }`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-900">{domain}</h3>
        <span className={`px-3 py-1 backdrop-blur-md rounded-full text-sm font-medium transition-colors ${isOver ? 'bg-indigo-200 text-indigo-900' : 'bg-indigo-100/80 text-indigo-700'
          }`}>
          {tasks.length}개
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.length === 0 ? (
            <div className={`text-center py-12 transition-colors ${isOver ? 'text-indigo-600' : 'text-gray-400'
              }`}>
              <div className="text-4xl mb-2">{isOver ? '⬇️' : '📋'}</div>
              <p className="text-sm font-medium">{isOver ? '여기에 놓으세요!' : '업무를 드래그하여 이동하세요'}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Task Edit Modal
function TaskEditModal({
  task,
  onSave,
  onClose,
  onDelete,
  domains,
}: {
  task: ExtractedTask;
  onSave: (updatedTask: ExtractedTask) => void;
  onClose: () => void;
  onDelete: (taskId: string) => void;
  domains: string[];
}) {
  const [editedTask, setEditedTask] = useState<ExtractedTask>(task);

  const handleSave = () => {
    // 유효성 검증
    if (!editedTask.title.trim()) {
      alert('업무명을 입력해주세요');
      return;
    }

    if (!editedTask.description.trim()) {
      alert('업무 설명을 입력해주세요');
      return;
    }

    if (editedTask.title.length > 200) {
      alert('업무명은 200자 이하로 입력해주세요');
      return;
    }

    if (editedTask.description.length > 500) {
      alert('업무 설명은 500자 이하로 입력해주세요');
      return;
    }

    onSave(editedTask);
  };

  const handleDelete = () => {
    if (confirm('이 업무를 삭제하시겠습니까?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="backdrop-blur-2xl bg-white/90 border border-white/60 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">업무 수정</h2>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            삭제
          </button>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무명</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무 설명</label>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 resize-none transition-all"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무 영역</label>
            <select
              value={editedTask.domain}
              onChange={(e) => setEditedTask({ ...editedTask, domain: e.target.value })}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          {/* Grid for Status and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
              <select
                value={editedTask.estimatedStatus}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedStatus: e.target.value as any })}
                className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
              >
                <option value="Progress">진행중</option>
                <option value="Planned">계획중</option>
                <option value="Not Started">미시도</option>
                <option value="Completed">완료</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">빈도</label>
              <select
                value={editedTask.frequency}
                onChange={(e) => setEditedTask({ ...editedTask, frequency: e.target.value as any })}
                className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
              >
                <option value="Daily">일일</option>
                <option value="Weekly">주간</option>
                <option value="Monthly">월간</option>
                <option value="Quarterly">분기별</option>
                <option value="Yearly">연간</option>
                <option value="Ad-hoc">비정기</option>
              </select>
            </div>
          </div>

          {/* Automation Potential */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">자동화 가능성</label>
            <div className="flex gap-3">
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setEditedTask({ ...editedTask, automationPotential: level })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${editedTask.automationPotential === level
                    ? level === 'High' ? 'bg-green-500 text-white shadow-lg'
                      : level === 'Medium' ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 backdrop-blur-sm bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Task Modal
function AddTaskModal({
  onAdd,
  onClose,
  domains,
}: {
  onAdd: (task: Omit<ExtractedTask, 'id'>) => void;
  onClose: () => void;
  domains: string[];
}) {
  const [newTask, setNewTask] = useState<Omit<ExtractedTask, 'id'>>({
    title: '',
    description: '',
    domain: domains[0] || '기타',
    estimatedStatus: 'Planned',
    frequency: 'Weekly',
    automationPotential: 'Medium',
    source: 'manual',
  });

  const handleSubmit = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert('업무명과 설명을 입력해주세요');
      return;
    }
    onAdd(newTask);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="backdrop-blur-2xl bg-white/90 border border-white/60 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">새 업무 추가</h2>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무명 *</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="예: 월간 교육 수요 조사 및 분석"
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무 설명 *</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="업무의 구체적인 내용과 목적을 입력해주세요"
              rows={4}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 resize-none transition-all"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">업무 영역</label>
            <select
              value={newTask.domain}
              onChange={(e) => setNewTask({ ...newTask, domain: e.target.value })}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          {/* Grid for Status and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
              <select
                value={newTask.estimatedStatus}
                onChange={(e) => setNewTask({ ...newTask, estimatedStatus: e.target.value as any })}
                className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
              >
                <option value="Progress">진행중</option>
                <option value="Planned">계획중</option>
                <option value="Not Started">미시도</option>
                <option value="Completed">완료</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">빈도</label>
              <select
                value={newTask.frequency}
                onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value as any })}
                className="w-full px-4 py-3 backdrop-blur-sm bg-white/90 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all"
              >
                <option value="Daily">일일</option>
                <option value="Weekly">주간</option>
                <option value="Monthly">월간</option>
                <option value="Quarterly">분기별</option>
                <option value="Yearly">연간</option>
                <option value="Ad-hoc">비정기</option>
              </select>
            </div>
          </div>

          {/* Automation Potential */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">자동화 가능성</label>
            <div className="flex gap-3">
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setNewTask({ ...newTask, automationPotential: level })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${newTask.automationPotential === level
                    ? level === 'High' ? 'bg-green-500 text-white shadow-lg'
                      : level === 'Medium' ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            추가
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 backdrop-blur-sm bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Step 4 Component
export default function Step4TaskExtraction({ workshopId, domains, onNext, onBack, manualInput, initialTasks = [] }: Step4TaskExtractionProps) {
  const [loading, setLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>(initialTasks);
  const [tasksByDomain, setTasksByDomain] = useState<{ [domain: string]: ExtractedTask[] }>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  // Ensure "기타" is in domains
  const allDomains = [...domains, ...(domains.includes('기타') ? [] : ['기타'])];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Extract tasks on mount if no initial tasks
  useEffect(() => {
    if (extractedTasks.length === 0) {
      extractTasks();
    }
  }, []);

  // Update tasksByDomain when extractedTasks change
  useEffect(() => {
    const grouped = allDomains.reduce((acc, domain) => {
      acc[domain] = extractedTasks.filter(task => task.domain === domain);
      return acc;
    }, {} as { [domain: string]: ExtractedTask[] });
    setTasksByDomain(grouped);
  }, [extractedTasks]);

  const extractTasks = async () => {
    setLoading(true);
    setError('');

    const toastId = showToast.aiAnalysisStarted();

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock tasks based on domains
      const mockTasks: ExtractedTask[] = [];
      const commonTasks = [
        { title: '주간 업무 보고 작성', description: '팀 주간 업무 진행 상황 취합 및 보고서 작성', complexity: 'medium', frequency: 'Weekly' },
        { title: '고객 문의 응대', description: '이메일 및 전화로 접수된 고객 문의 처리', complexity: 'low', frequency: 'Daily' },
        { title: '데이터 백업 및 관리', description: '주요 프로젝트 데이터 백업 및 아카이빙', complexity: 'low', frequency: 'Daily' },
        { title: '회의록 작성 및 공유', description: '팀 정기 회의 내용 정리 및 액션 아이템 공유', complexity: 'low', frequency: 'Weekly' },
        { title: '월간 성과 분석', description: '월별 KPI 달성 현황 분석 및 리포트 작성', complexity: 'high', frequency: 'Monthly' },
        { title: '경쟁사 동향 조사', description: '주요 경쟁사 신규 서비스 및 마케팅 활동 모니터링', complexity: 'medium', frequency: 'Weekly' },
        { title: '프로젝트 일정 관리', description: '진행 중인 프로젝트 마일스톤 점검 및 일정 조정', complexity: 'high', frequency: 'Daily' },
        { title: '비용 정산 처리', description: '법인카드 사용 내역 증빙 및 경비 처리', complexity: 'low', frequency: 'Monthly' }
      ];

      // Distribute tasks across domains
      allDomains.forEach((domain, index) => {
        // Add 2-3 tasks per domain
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const template = commonTasks[(index * 2 + i) % commonTasks.length];
          mockTasks.push({
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: `${domain} - ${template.title}`,
            description: template.description,
            domain: domain,
            estimatedStatus: 'Progress',
            frequency: template.frequency as any,
            automationPotential: template.complexity === 'high' ? 'High' : template.complexity === 'medium' ? 'Medium' : 'Low',
            source: 'uploaded'
          });
        }
      });

      // Add manual input if exists
      if (manualInput) {
        const manualLines = manualInput.split('\n').filter(line => line.trim());
        manualLines.forEach(line => {
          if (!line.startsWith('[')) { // Skip domain headers
            mockTasks.push({
              id: `task_manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              title: line.length > 20 ? line.substring(0, 20) + '...' : line,
              description: line,
              domain: allDomains[0] || '기타',
              estimatedStatus: 'Planned',
              frequency: 'Ad-hoc',
              automationPotential: 'Medium',
              source: 'manual'
            });
          }
        });
      }

      setExtractedTasks(mockTasks);
      showToast.dismiss(toastId);
      showToast.aiAnalysisComplete(mockTasks.length);

    } catch (error) {
      console.error('Mock extraction error:', error);
      showToast.dismiss(toastId);
      showToast.aiAnalysisFailed('AI 분석 중 오류가 발생했습니다.');
      setError('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a droppable domain column
    if (overId.startsWith('droppable-')) {
      const targetDomain = overId.replace('droppable-', '');
      setExtractedTasks(prev =>
        prev.map(task =>
          task.id === activeId
            ? { ...task, domain: targetDomain }
            : task
        )
      );
      return;
    }

    // Find which domains the tasks belong to
    let activeDomain = '';
    let overDomain = '';

    for (const domain of allDomains) {
      if (tasksByDomain[domain]?.some(t => t.id === activeId)) {
        activeDomain = domain;
      }
      if (tasksByDomain[domain]?.some(t => t.id === overId)) {
        overDomain = domain;
      }
    }

    if (activeDomain === overDomain) {
      // Reorder within same domain
      const domain = activeDomain;
      const tasks = tasksByDomain[domain];
      const oldIndex = tasks.findIndex(t => t.id === activeId);
      const newIndex = tasks.findIndex(t => t.id === overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(tasks, oldIndex, newIndex);
        setExtractedTasks(prev =>
          prev.map(task =>
            task.domain === domain
              ? reordered.find(t => t.id === task.id) || task
              : task
          )
        );
      }
    } else if (overDomain) {
      // Move to different domain
      setExtractedTasks(prev =>
        prev.map(task =>
          task.id === activeId
            ? { ...task, domain: overDomain }
            : task
        )
      );
    }
  };

  const handleEditTask = (updatedTask: ExtractedTask) => {
    setExtractedTasks(prev =>
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
    setEditingTask(null);
  };

  const handleAddTask = (newTaskData: Omit<ExtractedTask, 'id'>) => {
    const newTask: ExtractedTask = {
      ...newTaskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    };
    setExtractedTasks(prev => [...prev, newTask]);
    setShowAddModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setExtractedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleNext = () => {
    onNext(extractedTasks);
  };

  const activeDragTask = activeDragId ? extractedTasks.find(t => t.id === activeDragId) : null;

  return (
    <div className="relative min-h-screen w-full">
      {/* Background matching other steps */}
      <div className="absolute inset-0 fixed bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.06)_0%,transparent_50%)] bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.06)_0%,transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section - Matching Step 1 Style */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="mb-4">
            <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
              🧩 Task 구조화
            </span>
          </div>

          {/* Icon Circle */}
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <span className="text-3xl text-white">📝</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl font-semibold text-slate-900 mb-4 tracking-tight">
            업무 추출 및 분류
          </h1>

          {/* Subtitle */}
          <div className="space-y-2">
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              AI가 분석한 <span className="font-semibold text-amber-700">업무 리스트</span>를 확인하고 수정하세요
            </p>
            <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              드래그하여 영역을 변경하거나 클릭하여 수정할 수 있습니다
            </p>
          </div>
        </div>

        {/* Stats Cards - Refined Glassmorphism */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center group hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{extractedTasks?.length || 0}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Tasks</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center group hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-green-600 mb-2">{extractedTasks?.filter(t => t.automationPotential === 'High').length || 0}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Automation High</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center group hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-blue-600 mb-2">{extractedTasks?.filter(t => t.source === 'uploaded').length || 0}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">From Docs</div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center group hover:scale-[1.02] transition-all duration-300">
            <div className="text-4xl font-black text-purple-600 mb-2">{extractedTasks?.filter(t => t.source === 'manual').length || 0}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Manual Input</div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading && (
          <LoadingOverlay
            message="AI가 업무를 정밀 분석하고 있습니다"
            submessage="문서에서 반복 업무를 추출하고 자동화 가능성을 평가합니다"
            estimatedTime={30}
            tips={[
              'AI가 문서를 분석하여 반복 업무를 찾고 있습니다',
              '업무 빈도와 소요 시간을 계산하고 있습니다',
              '자동화 가능성을 평가하고 있습니다',
              '각 업무를 적절한 도메인으로 분류하고 있습니다',
              '최적의 자동화 방안을 제안하고 있습니다',
            ]}
          />
        )}
        {!loading && error ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">서버 연결 실패</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={extractTasks}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => {
                    setError('');
                    setExtractedTasks([]);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
                >
                  직접 업무 추가하기
                </button>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 text-center">
                💡 서버가 실행되지 않아도 "직접 업무 추가하기"를 눌러 수동으로 업무를 등록할 수 있습니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allDomains.map((domain) => (
                  <DomainColumn
                    key={domain}
                    domain={domain}
                    tasks={tasksByDomain[domain] || []}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeDragTask ? (
                  <div className="opacity-90 rotate-3 scale-105 cursor-grabbing">
                    <SortableTaskCard
                      task={activeDragTask}
                      onEdit={() => { }}
                      onDelete={() => { }}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mt-16">
              <button
                onClick={onBack}
                className="group relative px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전
                </span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="group relative px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-blue-300 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">+</span> 직접 업무 추가
                </span>
              </button>

              <button
                onClick={handleNext}
                className="group relative z-50 cursor-pointer inline-flex items-center justify-center gap-4 px-12 py-4 bg-slate-900 text-white text-xl font-bold rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/30 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative">다음 단계로</span>
                <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleEditTask}
          onClose={() => setEditingTask(null)}
          onDelete={handleDeleteTask}
          domains={allDomains}
        />
      )}

      {showAddModal && (
        <AddTaskModal
          onAdd={handleAddTask}
          onClose={() => setShowAddModal(false)}
          domains={allDomains}
        />
      )}
    </div>
  );
}
