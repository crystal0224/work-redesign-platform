import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'

// 타입 정의
export interface WorkshopSession {
  id: string
  userId: string
  status: 'draft' | 'analyzing' | 'completed'
  currentStep: number
  totalSteps: number
  startedAt: string
  completedAt?: string
  timeSpentSeconds: number
  metadata: Record<string, any>
}

export interface Domain {
  id: string
  sessionId: string
  name: string
  description: string
  orderIndex: number
  createdAt: string
}

export interface Task {
  id: string
  domainId: string
  domain: string
  title: string
  description: string
  currentProcess: string
  timeHoursPerWeek: number
  complexityScore: number
  orderIndex: number
  status: 'backlog' | 'progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  steps: TaskStep[]
  isUnclear?: boolean
  clarificationNeeded?: string
  assignedAgent?: string
  estimatedTimeSaved?: number
  createdAt: string
  updatedAt: string
}

export interface TaskStep {
  id: string
  taskId: string
  title: string
  description?: string
  timeMinutes: number
  orderIndex: number
  isManual: boolean
  isUnclear: boolean
  clarificationNeeded?: string
  createdAt: string
}

export interface AgentScenario {
  id: string
  taskId: string
  agentType: 'data' | 'content' | 'monitoring' | 'process'
  automationLevel: 'full' | 'partial' | 'assisted' | 'manual'
  agentName: string
  scenarioDescription: string
  triggerCondition: string
  expectedOutput: string
  humanIntervention: string
  estimatedTimeSavedHours: number
  createdAt: string
}

export interface PromptTemplate {
  id: string
  agentScenarioId: string
  title: string
  promptTemplate: string
  variables: Record<string, string>
  platform: 'claude' | 'chatgpt' | 'gemini'
  version: string
  exampleOutput: string
  createdAt: string
}

export interface WorkflowTemplate {
  id: string
  agentScenarioId: string
  platform: 'n8n' | 'zapier' | 'make'
  templateName: string
  templateJson: any
  setupInstructions: string
  requiredCredentials: string[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  taskId?: string
  role: 'user' | 'assistant'
  message: string
  suggestions?: string[]
  isResolved?: boolean
  timestamp: number
}

export interface AnalysisProgress {
  step: string
  progress: number
  message: string
  timestamp: number
}

// 워크샵 스토어 인터페이스
interface WorkshopStore {
  // 현재 세션
  currentSession: WorkshopSession | null

  // 데이터
  domains: Domain[]
  tasks: Task[]
  agentScenarios: AgentScenario[]
  promptTemplates: PromptTemplate[]
  workflowTemplates: WorkflowTemplate[]
  chatMessages: ChatMessage[]

  // UI 상태
  currentStep: number
  isAnalyzing: boolean
  analysisProgress: AnalysisProgress | null
  selectedTaskId: string | null

  // 세션 관리
  setCurrentSession: (session: WorkshopSession | null) => void
  updateSession: (updates: Partial<WorkshopSession>) => void

  // 도메인 관리
  setDomains: (domains: Domain[]) => void
  addDomain: (domain: Domain) => void
  updateDomain: (id: string, updates: Partial<Domain>) => void
  removeDomain: (id: string) => void

  // 태스크 관리
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  reorderTasks: (taskIds: string[]) => void

  // Agent 시나리오 관리
  setAgentScenarios: (scenarios: AgentScenario[]) => void
  addAgentScenario: (scenario: AgentScenario) => void
  updateAgentScenario: (id: string, updates: Partial<AgentScenario>) => void

  // 프롬프트 템플릿 관리
  setPromptTemplates: (templates: PromptTemplate[]) => void
  addPromptTemplate: (template: PromptTemplate) => void

  // 워크플로우 템플릿 관리
  setWorkflowTemplates: (templates: WorkflowTemplate[]) => void
  addWorkflowTemplate: (template: WorkflowTemplate) => void

  // 채팅 관리
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  getChatHistory: (taskId?: string) => ChatMessage[]

  // UI 상태 관리
  setCurrentStep: (step: number) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setAnalysisProgress: (progress: AnalysisProgress | null) => void
  setSelectedTaskId: (taskId: string | null) => void

  // 유틸리티
  getTasksByDomain: (domainId: string) => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]
  getAgentScenariosByTask: (taskId: string) => AgentScenario[]
  reset: () => void
}

// 초기 상태
const initialState = {
  currentSession: null,
  domains: [],
  tasks: [],
  agentScenarios: [],
  promptTemplates: [],
  workflowTemplates: [],
  chatMessages: [],
  currentStep: 1,
  isAnalyzing: false,
  analysisProgress: null,
  selectedTaskId: null,
}

// 스토어 생성
export const useWorkshopStore = create<WorkshopStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 세션 관리
      setCurrentSession: (session) =>
        set({ currentSession: session }),

      updateSession: (updates) =>
        set(
          produce((state) => {
            if (state.currentSession) {
              Object.assign(state.currentSession, updates)
            }
          })
        ),

      // 도메인 관리
      setDomains: (domains) => set({ domains }),

      addDomain: (domain) =>
        set(
          produce((state) => {
            state.domains.push(domain)
          })
        ),

      updateDomain: (id, updates) =>
        set(
          produce((state) => {
            const index = state.domains.findIndex((d) => d.id === id)
            if (index !== -1) {
              Object.assign(state.domains[index], updates)
            }
          })
        ),

      removeDomain: (id) =>
        set(
          produce((state) => {
            state.domains = state.domains.filter((d) => d.id !== id)
            // 관련 태스크도 제거
            state.tasks = state.tasks.filter((t) => t.domainId !== id)
          })
        ),

      // 태스크 관리
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set(
          produce((state) => {
            state.tasks.push(task)
          })
        ),

      updateTask: (id, updates) =>
        set(
          produce((state) => {
            const index = state.tasks.findIndex((t) => t.id === id)
            if (index !== -1) {
              Object.assign(state.tasks[index], updates)
              state.tasks[index].updatedAt = new Date().toISOString()
            }
          })
        ),

      removeTask: (id) =>
        set(
          produce((state) => {
            state.tasks = state.tasks.filter((t) => t.id !== id)
            // 관련 시나리오도 제거
            state.agentScenarios = state.agentScenarios.filter((s) => s.taskId !== id)
          })
        ),

      reorderTasks: (taskIds) =>
        set(
          produce((state) => {
            const taskMap = new Map(state.tasks.map((task) => [task.id, task]))
            state.tasks = taskIds
              .map((id) => taskMap.get(id))
              .filter(Boolean) as Task[]
          })
        ),

      // Agent 시나리오 관리
      setAgentScenarios: (scenarios) => set({ agentScenarios: scenarios }),

      addAgentScenario: (scenario) =>
        set(
          produce((state) => {
            state.agentScenarios.push(scenario)
          })
        ),

      updateAgentScenario: (id, updates) =>
        set(
          produce((state) => {
            const index = state.agentScenarios.findIndex((s) => s.id === id)
            if (index !== -1) {
              Object.assign(state.agentScenarios[index], updates)
            }
          })
        ),

      // 프롬프트 템플릿 관리
      setPromptTemplates: (templates) => set({ promptTemplates: templates }),

      addPromptTemplate: (template) =>
        set(
          produce((state) => {
            state.promptTemplates.push(template)
          })
        ),

      // 워크플로우 템플릿 관리
      setWorkflowTemplates: (templates) => set({ workflowTemplates: templates }),

      addWorkflowTemplate: (template) =>
        set(
          produce((state) => {
            state.workflowTemplates.push(template)
          })
        ),

      // 채팅 관리
      addChatMessage: (message) =>
        set(
          produce((state) => {
            state.chatMessages.push(message)
          })
        ),

      clearChatMessages: () => set({ chatMessages: [] }),

      getChatHistory: (taskId) => {
        const messages = get().chatMessages
        return taskId
          ? messages.filter((m) => m.taskId === taskId)
          : messages.filter((m) => !m.taskId)
      },

      // UI 상태 관리
      setCurrentStep: (step) => set({ currentStep: step }),

      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      setAnalysisProgress: (progress) => set({ analysisProgress: progress }),

      setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

      // 유틸리티
      getTasksByDomain: (domainId) => {
        return get().tasks.filter((task) => task.domainId === domainId)
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status)
      },

      getAgentScenariosByTask: (taskId) => {
        return get().agentScenarios.filter((scenario) => scenario.taskId === taskId)
      },

      reset: () => set(initialState),
    }),
    {
      name: 'workshop-store',
      // 민감한 정보는 저장하지 않음
      partialize: (state) => ({
        currentSession: state.currentSession,
        domains: state.domains,
        tasks: state.tasks,
        currentStep: state.currentStep,
      }),
    }
  )
)