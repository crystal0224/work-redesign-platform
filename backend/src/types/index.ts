// Re-export Prisma types
export * from '@prisma/client';

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication types
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  teamId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department?: string;
    position?: string;
  };
  token: string;
  expiresIn: string;
}

// Workshop Session types
export interface CreateSessionRequest {
  title: string;
  description?: string;
  domains: string[];
}

export interface SessionProgress {
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
  estimatedTimeRemaining: number;
}

// Task types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId?: string;
  domainId?: string;
  assigneeId?: string;
  priority?: Priority;
  estimatedHours?: number;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  labels?: string[];
}

export interface MoveTaskRequest {
  taskId: string;
  toColumnId: string;
  position: number;
}

// AI Analysis types
export interface AiAnalysisRequest {
  type: AnalysisType;
  projectId?: string;
  sessionId?: string;
  inputData: Record<string, any>;
}

export interface AiAnalysisResult {
  id: string;
  type: AnalysisType;
  result: Record<string, any>;
  confidenceScore?: number;
  recommendations: AiRecommendation[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

// File Upload types
export interface FileUploadRequest {
  sessionId?: string;
  taskId?: string;
}

export interface FileUploadResponse {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  mimeType: string;
  s3Url?: string;
  uploadedAt: string;
}

// WebSocket Event types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface TaskUpdateEvent {
  type: 'task_updated';
  payload: {
    taskId: string;
    changes: Partial<UpdateTaskRequest>;
    updatedBy: string;
  };
  sessionId: string;
  timestamp: string;
}

export interface TaskMoveEvent {
  type: 'task_moved';
  payload: {
    taskId: string;
    fromColumn: string;
    toColumn: string;
    position: number;
    movedBy: string;
  };
  sessionId: string;
  timestamp: string;
}

export interface AiAnalysisProgressEvent {
  type: 'ai_analysis_progress';
  payload: {
    analysisId: string;
    progress: number;
    currentStep: string;
    estimatedTimeRemaining: number;
  };
  sessionId: string;
  timestamp: string;
}

export interface ChatMessageEvent {
  type: 'chat_message';
  payload: ChatMessage;
  sessionId: string;
  timestamp: string;
}

export interface UserPresenceEvent {
  type: 'user_presence';
  payload: {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  sessionId: string;
  timestamp: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Health Check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    ai: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
  };
}

// Utility types
export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Import Prisma enums
import {
  UserRole,
  TeamMemberRole,
  SessionStatus,
  ProjectStatus,
  TaskStatus,
  Priority,
  AnalysisType,
  AnalysisStatus,
  RecommendationType,
  ImplementationEffort,
  RecommendationStatus,
  ActivityType,
} from '@prisma/client';

// Export Prisma enums
export {
  UserRole,
  TeamMemberRole,
  SessionStatus,
  ProjectStatus,
  TaskStatus,
  Priority,
  AnalysisType,
  AnalysisStatus,
  RecommendationType,
  ImplementationEffort,
  RecommendationStatus,
  ActivityType,
};