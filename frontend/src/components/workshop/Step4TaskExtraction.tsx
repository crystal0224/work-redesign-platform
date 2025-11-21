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
      className={`backdrop-blur-xl border rounded-2xl p-6 min-h-[400px] flex flex-col transition-all duration-300 ${
        isOver
          ? 'bg-indigo-100/60 border-indigo-400 border-2 scale-[1.02] shadow-2xl'
          : 'bg-white/40 border-white/60'
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-900">{domain}</h3>
        <span className={`px-3 py-1 backdrop-blur-md rounded-full text-sm font-medium transition-colors ${
          isOver ? 'bg-indigo-200 text-indigo-900' : 'bg-indigo-100/80 text-indigo-700'
        }`}>
          {tasks.length}개
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.length === 0 ? (
            <div className={`text-center py-12 transition-colors ${
              isOver ? 'text-indigo-600' : 'text-gray-400'
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
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    editedTask.automationPotential === level
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
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
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    newTask.automationPotential === level
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
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
export default function Step4TaskExtraction({ workshopId, domains, onNext, manualInput }: Step4TaskExtractionProps) {
  const [loading, setLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
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

  // Extract tasks on mount
  useEffect(() => {
    extractTasks();
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

    try {
      const response = await fetch(`http://localhost:4000/api/workshops/${workshopId}/extract-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status} 오류`);
      }

      const data = await response.json();

      if (data.success) {
        const tasks = data.data?.tasks || data.tasks || [];
        setExtractedTasks(tasks);
        if (tasks.length === 0) {
          setError('추출된 업무가 없습니다. 문서나 입력 내용을 확인해주세요.');
        }
      } else {
        setError(data.error || '업무 추출에 실패했습니다');
      }
    } catch (error) {
      let errorMessage = '서버와의 통신에 실패했습니다';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      console.error('Extract tasks error:', error);
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
    <div className="relative min-h-screen -m-6 p-6 animate-fadeIn">
      {/* Animated gradient background matching Step 1 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-8 shadow-2xl">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            업무 추출 결과
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            AI가 분석한 업무들을 영역별로 확인하고 편집하세요. 드래그하여 영역을 변경하거나 클릭하여 수정할 수 있습니다.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="backdrop-blur-md bg-white/60 border border-white/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{extractedTasks.length}</div>
              <div className="text-sm text-gray-600">총 업무</div>
            </div>
            <div className="backdrop-blur-md bg-white/60 border border-white/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {extractedTasks.filter(t => t.automationPotential === 'High').length}
              </div>
              <div className="text-sm text-gray-600">자동화 가능</div>
            </div>
            <div className="backdrop-blur-md bg-white/60 border border-white/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {extractedTasks.filter(t => t.source === 'uploaded').length}
              </div>
              <div className="text-sm text-gray-600">문서 추출</div>
            </div>
            <div className="backdrop-blur-md bg-white/60 border border-white/60 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {extractedTasks.filter(t => t.source === 'manual').length}
              </div>
              <div className="text-sm text-gray-600">직접 입력</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-12 text-center shadow-2xl">
            <div className="animate-spin w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">AI가 업무를 분석하고 있습니다...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="backdrop-blur-xl bg-red-50/90 border border-red-200 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-700 font-medium mb-2">⚠️ 업무 추출에 실패했습니다</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={extractTasks}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm flex items-center gap-2 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Task Grid */}
        {!loading && extractedTasks.length > 0 && (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                  <div className="backdrop-blur-lg bg-white/90 border border-white/60 rounded-xl p-5 shadow-2xl rotate-3">
                    <h4 className="font-semibold text-gray-900">{activeDragTask.title}</h4>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Task Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="backdrop-blur-xl bg-white/50 border-2 border-indigo-300 border-dashed text-indigo-700 font-semibold px-8 py-4 rounded-2xl hover:bg-white/70 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 업무 추가
              </button>
            </div>

            {/* Next Button */}
            <div className="flex justify-between">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전 단계
              </button>

              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                다음 단계로
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && extractedTasks.length === 0 && !error && (
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">추출된 업무가 없습니다</h3>
            <p className="text-gray-600 mb-6">문서를 업로드하거나 내용을 입력한 후 다시 시도해주세요</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              직접 업무 추가하기
            </button>
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
