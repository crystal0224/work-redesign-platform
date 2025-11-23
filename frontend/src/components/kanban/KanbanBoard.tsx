'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, Search, MoreVertical } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { TaskCard } from './TaskCard'
// import { AddTaskDialog } from './AddTaskDialog'
// import { useWorkshopStore } from '@/store/workshopStore'
// import { useWebSocket } from '@/hooks/useWebSocket'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string
  domain: string
  status: 'backlog' | 'progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  complexity: number
  weeklyHours: number
  steps: Array<{
    title: string
    timeMinutes: number
    isUnclear: boolean
  }>
  isUnclear?: boolean
  clarificationNeeded?: string
  assignedAgent?: string
  estimatedTimeSaved?: number
}

interface Column {
  id: 'backlog' | 'progress' | 'review' | 'done'
  title: string
  description: string
  color: string
  bgColor: string
  tasks: Task[]
}

export function KanbanBoard() {
  // const { currentSession, tasks, updateTask, reorderTasks } = useWorkshopStore()
  // const { socket, isConnected } = useWebSocket()
  const currentSession = null
  const tasks: Task[] = []
  const updateTask = (id: string, updates: any) => {}
  const reorderTasks = (ids: string[]) => {}
  const socket = null
  const isConnected = false

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<Column['id']>('backlog')

  // 칸반 보드 컬럼 정의
  const columns: Column[] = [
    {
      id: 'backlog',
      title: '백로그',
      description: '정의된 업무들',
      color: 'text-kanban-backlog',
      bgColor: 'bg-kanban-backlog/10',
      tasks: tasks.filter(task => task.status === 'backlog'),
    },
    {
      id: 'progress',
      title: '진행중',
      description: '분석/수정 중인 업무',
      color: 'text-kanban-progress',
      bgColor: 'bg-kanban-progress/10',
      tasks: tasks.filter(task => task.status === 'progress'),
    },
    {
      id: 'review',
      title: '검토',
      description: 'AI가 분석한 업무들',
      color: 'text-kanban-review',
      bgColor: 'bg-kanban-review/10',
      tasks: tasks.filter(task => task.status === 'review'),
    },
    {
      id: 'done',
      title: '완료',
      description: '확정된 업무들',
      color: 'text-kanban-done',
      bgColor: 'bg-kanban-done/10',
      tasks: tasks.filter(task => task.status === 'done'),
    },
  ]

  // 도메인 목록 추출
  const domains = ['all', ...Array.from(new Set(tasks.map(task => task.domain)))]

  // 필터링된 컬럼들
  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDomain = filterDomain === 'all' || task.domain === filterDomain
      return matchesSearch && matchesDomain
    }),
  }))

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    // 같은 위치로 드롭한 경우
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    // 상태 변경
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId as Task['status']
      updateTask(task.id, { status: newStatus })

      // WebSocket으로 실시간 업데이트 전송
      if (socket && currentSession) {
        socket.emit('task_update', {
          sessionId: currentSession.id,
          taskId: task.id,
          updates: { status: newStatus },
        })
      }
    }

    // 순서 변경
    const newTaskOrder = Array.from(tasks)
    const [movedTask] = newTaskOrder.splice(source.index, 1)
    newTaskOrder.splice(destination.index, 0, movedTask)

    reorderTasks(newTaskOrder.map(t => t.id))

    if (socket && currentSession) {
      socket.emit('task_reorder', {
        sessionId: currentSession.id,
        taskIds: newTaskOrder.map(t => t.id),
      })
    }
  }

  // 태스크 클릭 핸들러
  const handleTaskClick = (task: Task) => {
    // 태스크 상세 페이지로 이동하거나 모달 표시
    console.log('Task clicked:', task)
  }

  // 태스크 편집 핸들러
  const handleTaskEdit = (task: Task) => {
    // 편집 모달 표시
    console.log('Edit task:', task)
  }

  // 새 태스크 추가 핸들러
  const handleAddTask = (columnId: Column['id']) => {
    setSelectedColumn(columnId)
    setShowAddDialog(true)
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">업무 칸반 보드</h2>
          <p className="text-muted-foreground">
            드래그 앤 드롭으로 업무 상태를 관리하세요
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="업무 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                도메인
                {filterDomain !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {filterDomain}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {domains.map((domain) => (
                <DropdownMenuItem
                  key={domain}
                  onClick={() => setFilterDomain(domain)}
                  className={cn(
                    filterDomain === domain && 'bg-accent'
                  )}
                >
                  {domain === 'all' ? '전체' : domain}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 연결 상태 표시 */}
      {!isConnected && (
        <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">서버 연결 중...</span>
          </div>
        </div>
      )}

      {/* 칸반 보드 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-1 gap-6 min-w-max lg:grid-cols-4">
            {filteredColumns.map((column) => (
              <div key={column.id} className="min-w-[300px]">
                <Card className="h-full">
                  <CardHeader className={cn("pb-3", column.bgColor)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={cn("text-sm font-medium", column.color)}>
                          {column.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {column.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {column.tasks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddTask(column.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "space-y-3 min-h-[200px] transition-colors",
                            snapshot.isDraggingOver && "bg-muted/50 rounded-lg"
                          )}
                        >
                          <AnimatePresence>
                            {column.tasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <motion.div
                                    ref={provided.innerRef}
                                    {...(provided.draggableProps as any)}
                                    {...(provided.dragHandleProps as any)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                      "transition-transform",
                                      snapshot.isDragging && "rotate-3 scale-105"
                                    )}
                                  >
                                    <TaskCard
                                      task={task}
                                      onClick={() => handleTaskClick(task)}
                                      onEdit={() => handleTaskEdit(task)}
                                      isDragging={snapshot.isDragging}
                                    />
                                  </motion.div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}

                          {column.tasks.length === 0 && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <div className="text-center">
                                <div className="text-sm">업무가 없습니다</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddTask(column.id)}
                                  className="mt-2"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  추가하기
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* 새 태스크 추가 다이얼로그 */}
      {/*<AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultStatus={selectedColumn}
      />*/}
    </div>
  )
}