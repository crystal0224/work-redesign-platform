'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  User,
  AlertTriangle,
  Bot,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  MessageCircle,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

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

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onChat?: () => void
  isDragging?: boolean
}

const priorityConfig = {
  low: { color: 'bg-green-100 text-green-800', label: '낮음' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: '보통' },
  high: { color: 'bg-red-100 text-red-800', label: '높음' },
}

const complexityColor = (score: number) => {
  if (score <= 3) return 'text-green-600'
  if (score <= 6) return 'text-yellow-600'
  return 'text-red-600'
}

export function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onChat,
  isDragging = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    // 드롭다운 메뉴나 버튼 클릭 시에는 카드 클릭 이벤트 무시
    if ((e.target as HTMLElement).closest('.dropdown-trigger, .action-button')) {
      return
    }
    onClick?.()
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const completedSteps = task.steps.filter(step => !step.isUnclear).length
  const totalSteps = task.steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "transition-all duration-200",
        isDragging && "shadow-lg rotate-1"
      )}
    >
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow duration-200",
          task.isUnclear && "border-yellow-300 bg-yellow-50/50",
          isDragging && "shadow-2xl"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                {task.title}
              </h4>
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {task.domain}
              </Badge>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {task.isUnclear && (
                <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="dropdown-trigger h-6 w-6 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    편집
                  </DropdownMenuItem>
                  {task.isUnclear && (
                    <DropdownMenuItem onClick={onChat}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      AI 채팅
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 설명 */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>

          {/* 불명확 상태 알림 */}
          {task.isUnclear && task.clarificationNeeded && (
            <div className="mb-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-yellow-800 line-clamp-2">
                  {task.clarificationNeeded}
                </span>
              </div>
            </div>
          )}

          {/* 메트릭스 */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {task.weeklyHours}h/주
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={cn("w-2 h-2 rounded-full", complexityColor(task.complexity))} />
              <span className="text-muted-foreground">
                복잡도 {task.complexity}/10
              </span>
            </div>
          </div>

          {/* 우선순위 */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="secondary"
              className={cn("text-xs", priorityConfig[task.priority].color)}
            >
              {priorityConfig[task.priority].label}
            </Badge>

            {task.assignedAgent && (
              <div className="flex items-center space-x-1">
                <Bot className="h-3 w-3 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">
                  Agent
                </span>
              </div>
            )}
          </div>

          {/* 진행률 */}
          {totalSteps > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  진행률
                </span>
                <span className="text-xs font-medium">
                  {completedSteps}/{totalSteps}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          )}

          {/* 확장 버튼 */}
          {task.steps.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandClick}
              className="action-button w-full h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "mr-1 h-3 w-3 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
              {task.steps.length}개 단계
              {isExpanded ? ' 숨기기' : ' 보기'}
            </Button>
          )}

          {/* 확장된 단계 목록 */}
          {isExpanded && task.steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-border"
            >
              <div className="space-y-2">
                {task.steps.map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start space-x-2 text-xs p-2 rounded",
                      step.isUnclear
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                        step.isUnclear ? "bg-yellow-500" : "bg-green-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium line-clamp-1">
                        {step.title}
                      </div>
                      <div className="text-muted-foreground">
                        {step.timeMinutes}분
                        {step.isUnclear && (
                          <span className="ml-1 text-yellow-600">
                            (명확화 필요)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI 예상 절약 시간 */}
              {task.estimatedTimeSaved && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center space-x-1 text-xs text-green-800">
                    <Bot className="h-3 w-3" />
                    <span className="font-medium">
                      주 {task.estimatedTimeSaved}시간 절약 예상
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}